import { STATE_SCHEMA_VERSION, createInitialState, validateState } from './state-schema.js';

export const PROGRESS_KEY_PREFIX = 'verseplay:verse-circuit:';
export const PREFERENCES_KEY = 'verseplay:preferences:v1';
export const LEGACY_KEY = 'verse-circuit-design-v1';
export const progressKey = content => PROGRESS_KEY_PREFIX + content.id;
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const memoryNotice = 'Progress cannot be saved on this device right now. You can keep playing in this tab.';

function read(storage, key) {
  try {
    if (!storage || typeof storage.getItem !== 'function') return { unavailable: true };
    const raw = storage.getItem(key);
    if (raw === null || raw === undefined) return { missing: true };
    return { value: JSON.parse(raw) };
  } catch (error) { return error instanceof SyntaxError ? { corrupted: true } : { unavailable: true }; }
}

function write(storage, key, value) {
  try {
    if (!storage || typeof storage.setItem !== 'function') return false;
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch { return false; }
}

export function savePreferences(storage, preferences) {
  if (!record(preferences) || typeof preferences.sound !== 'boolean') return { saved: false, notice: 'Sound preference was invalid and was not saved.' };
  const saved = write(storage, PREFERENCES_KEY, { schemaVersion: 1, sound: preferences.sound });
  return { saved, notice: saved ? '' : memoryNotice };
}

export function saveProgress(storage, state, content) {
  if (!validateState(state, content).valid) return { saved: false, notice: 'Invalid Verse Circuit progress was not saved.' };
  const saved = write(storage, progressKey(content), state);
  return { saved, notice: saved ? '' : memoryNotice };
}

/** Old prototype arrays were text, segment indexes, and blank indexes, respectively. */
export function migrateLegacyProgress(legacy, content) {
  if (!record(legacy) || content.id !== 'john-15-12' || content.version !== 1) return null;
  const initial = createInitialState(content);
  const state = {
    ...initial,
    screen: legacy.screen,
    trace: Array.isArray(legacy.trace) ? legacy.trace.map(value => content.phrases.find(phrase => phrase.text === value)?.id) : null,
    link: Array.isArray(legacy.link) ? legacy.link.map(value => Number.isInteger(value) ? content.sequence[value] : undefined) : null,
    echo: Array.isArray(legacy.echo) ? legacy.echo.map(value => Number.isInteger(value) ? content.answerSequence[value] : undefined) : null,
    mistakes: legacy.mistakes ?? 0,
    hints: legacy.hints ?? 0,
    completed: legacy.completed ?? false,
  };
  return validateState(state, content).valid ? state : null;
}

/**
 * Restore only validated game state. Inject Storage (or null); this module never reads globals.
 * Bad saves reset this content's game only. Other app keys and preferences are never cleared.
 */
export function loadProgress(storage, content) {
  const fresh = () => createInitialState(content);
  const preferenceResult = read(storage, PREFERENCES_KEY);
  const preferenceRecord = preferenceResult.value;
  const validPreferences = record(preferenceRecord) && preferenceRecord.schemaVersion === 1 && typeof preferenceRecord.sound === 'boolean';
  let preferences = { sound: validPreferences ? preferenceRecord.sound : false };
  const current = read(storage, progressKey(content));
  if (current.unavailable) return { state: fresh(), preferences, status: 'unavailable', notice: memoryNotice };
  const reset = reason => {
    const state = fresh();
    const result = saveProgress(storage, state, content);
    return { state, preferences, status: 'reset', notice: `Verse Circuit progress for ${content.reference} was reset because ${reason}. Your other games and sound preference were kept.${result.saved ? '' : ' ' + memoryNotice}` };
  };
  if (!current.missing) {
    if (current.corrupted) return reset('its saved data could not be read');
    const saved = current.value;
    if (!record(saved) || !validateState(saved, content).valid) {
      if (record(saved) && saved.schemaVersion !== STATE_SCHEMA_VERSION) return reset('the saved format is not supported');
      if (record(saved) && (saved.contentId !== content.id || saved.contentVersion !== content.version)) return reset('the passage has changed');
      return reset('its saved progress was incomplete or invalid');
    }
    return { state: saved, preferences, status: 'restored', notice: '' };
  }
  const legacy = read(storage, LEGACY_KEY);
  if (legacy.unavailable) return { state: fresh(), preferences, status: 'unavailable', notice: memoryNotice };
  if (legacy.missing) return { state: fresh(), preferences, status: 'new', notice: '' };
  if (!validPreferences && record(legacy.value) && typeof legacy.value.sound === 'boolean') {
    preferences = { sound: legacy.value.sound };
    savePreferences(storage, preferences);
  }
  const migrated = !legacy.corrupted && migrateLegacyProgress(legacy.value, content);
  if (!migrated) return reset('the earlier prototype save was incompatible or invalid');
  const result = saveProgress(storage, migrated, content);
  return { state: migrated, preferences, status: 'migrated', notice: result.notice };
}
