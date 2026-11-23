import { transition } from "../../core/circuit-engine.js";
import { validateContent } from "../../core/content-schema.js";
import {
  loadProgress,
  saveProgress,
  savePreferences,
} from "../../core/storage.js";
import { renderScreen } from "./renderer.js";
import { createSound } from "./sounds.js";

const game = document.getElementById("game");
const live = document.getElementById("live");
const audio = document.getElementById("audio");
const announce = (message) => {
  live.textContent = "";
  requestAnimationFrame(() => {
    live.textContent = message;
  });
};

async function mount() {
  const response = await fetch(
    new URL("../../content/john-15-12.json", import.meta.url),
  );
  if (!response.ok) throw new Error("Passage could not be loaded.");
  const content = await response.json();
  const validation = validateContent(content);
  if (!validation.valid) throw new Error("Passage did not pass validation.");
  let storage;
  try {
    storage = window.localStorage;
  } catch {
    /* Privacy mode: continue in memory. */
  }
  const restored = loadProgress(storage, content);
  let state = restored.state;
  let preferences = restored.preferences;
  const sound = createSound(() => preferences.sound);
  let modalElement;
  let priorFocus;
  let noticeMessage = restored.notice;

  // Write failures remain visible even when gameplay feedback updates the live region.
  function renderNotice() {
    let notice = document.getElementById("verseplay-storage-notice");
    if (!noticeMessage) { notice?.remove(); return; }
    if (!notice) {
      notice = document.createElement("p");
      notice.id = "verseplay-storage-notice";
      notice.className = "instruction";
      notice.setAttribute("role", "status");
      game.prepend(notice);
    }
    if (notice.textContent !== noticeMessage) notice.textContent = noticeMessage;
  }

  function renderAudio() {
    audio.setAttribute("aria-pressed", String(preferences.sound));
    audio.setAttribute(
      "aria-label",
      preferences.sound ? "Disable sound" : "Enable sound",
    );
    audio.style.color = preferences.sound ? "var(--lime)" : "";
  }

  function render(keyboardTarget) {
    game.innerHTML = renderScreen(state, content);
    renderAudio();
    renderNotice();
    if (keyboardTarget) {
      const candidates = [
        ...game.querySelectorAll("button[data-action]:not(:disabled)"),
      ];
      const replacement = candidates.find(
        (button) =>
          button.dataset.action === keyboardTarget.action &&
          button.dataset.value === keyboardTarget.value,
      );
      (
        replacement ||
        candidates.find(
          (button) => button.dataset.action === keyboardTarget.action,
        ) ||
        game.querySelector("h1")
      )?.focus({ preventScroll: true });
    }
  }

  function openModal(which) {
    const data = {
      rush: [
        "WORD RUSH",
        "A high-speed Scripture word game is on our design roadmap. This prototype focuses on making Verse Circuit exceptional first.",
      ],
      cross: [
        "CROSSROADS",
        "A compact, original Bible crossword with tactile clues, accessible keyboard input, and carefully reviewed content is planned for a later build.",
      ],
      threads: [
        "THREADS",
        "A discovery puzzle for exploring carefully reviewed connections between biblical passages. The Afterglow scene offers a first glimpse.",
      ],
    }[which];
    if (!data || state.screen !== "home" || modalElement) return;
    priorFocus = document.activeElement;
    modalElement = document.createElement("div");
    modalElement.className = "modal-scrim";
    modalElement.innerHTML = `<section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-heading"><div class="overline">GAME CONCEPT / COMING LATER</div><h2 id="modal-heading">${data[0]}</h2><p>${data[1]}</p><div class="modal-actions"><button class="primary-btn" type="button" data-action="close-modal">BACK TO THE ARCADE</button></div></section>`;
    document.body.appendChild(modalElement);
    game.inert = true;
    audio.inert = true;
    modalElement.querySelector("button").focus();
  }

  function closeModal() {
    modalElement?.remove();
    modalElement = null;
    game.inert = false;
    audio.inert = false;
    priorFocus?.focus();
  }

  function dispatch(type, value, keyboardTarget) {
    if (type === "concept") return openModal(value);
    const result = transition(state, { type, value }, content);
    if (!result.accepted) return;
    state = result.state;
    const saved = saveProgress(storage, state, content);
    noticeMessage = saved.saved ? "" : saved.notice;
    for (const effect of result.effects) {
      if (effect.type === "render") {
        render(keyboardTarget);
        if (effect.screenChanged) {
          window.scrollTo({ top: 0, behavior: "auto" });
          game.querySelector("h1")?.focus({ preventScroll: true });
        }
      } else if (effect.type === "sound") sound(effect.frequency);
      else if (effect.type === "announce") announce(effect.message);
      else if (effect.type === "feedback") {
        const element = document.getElementById(effect.target);
        if (element) {
          element.textContent = effect.message;
          element.style.color = effect.error ? "#ff9caf" : "#d0f75b";
        }
        announce(effect.message);
      } else if (effect.type === "incorrect") {
        const element = [...game.querySelectorAll("button[data-action]")].find(
          (button) =>
            button.dataset.action === effect.action &&
            button.dataset.value === effect.value,
        );
        const className = effect.action === "link" ? "incorrect" : "wrong";
        element?.classList.add(className);
        setTimeout(() => element?.classList.remove(className), 300);
      }
    }
    renderNotice();
  }

  game.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button || button.disabled) return;
    const { action, value } = button.dataset;
    dispatch(action, value, event.detail === 0 ? { action, value } : undefined);
  });
  document.addEventListener("click", (event) => {
    if (
      modalElement &&
      (event.target === modalElement ||
        event.target.closest('[data-action="close-modal"]'))
    )
      closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (!modalElement) return;
    if (event.key === "Escape") closeModal();
    if (event.key === "Tab") {
      event.preventDefault();
      modalElement.querySelector("button").focus();
    }
  });
  audio.addEventListener("click", () => {
    preferences = { sound: !preferences.sound };
    const saved = savePreferences(storage, preferences);
    if (!saved.saved) noticeMessage = saved.notice;
    renderNotice();
    renderAudio();
    announce(preferences.sound ? "Sound enabled" : "Sound disabled");
  });
  render();
  if (restored.notice) announce(restored.notice);
}

mount().catch(() => {
  // Keep the HTML fallback and give a usable retry on network/content failure.
  game.innerHTML =
    '<section class="screen"><h1 class="game-title" tabindex="-1">Verse Circuit</h1><p class="status" role="alert">The passage could not be loaded safely. Reload to try again. Your saved progress has not been changed.</p><button type="button" class="primary-btn">RETRY</button></section>';
  game
    .querySelector("button")
    .addEventListener("click", () => window.location.reload());
});
