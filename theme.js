/* Appearance is device-local and independent of daily progress. Load before CSS. */
(() => {
  'use strict';
  const key = 'citizen-connect-theme';
  let dark = false;
  try { dark = localStorage.getItem(key) === 'dark'; } catch { /* Use light by default. */ }
  function apply() {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.querySelectorAll('[data-action="toggle-theme"]').forEach(button => {
      button.setAttribute('aria-checked', String(dark));
      button.querySelector('[data-theme-label]').textContent = dark ? 'On' : 'Off';
    });
  }
  apply();
  document.addEventListener('click', event => {
    if (!event.target.closest('[data-action="toggle-theme"]')) return;
    dark = !dark;
    apply();
    try { localStorage.setItem(key, dark ? 'dark' : 'light'); } catch { /* Session still works. */ }
  });
})();
