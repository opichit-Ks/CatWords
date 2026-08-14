// Theme toggle — injects a light/dark switch into the top bar on every page,
// so learners can flip themes on mobile without opening Settings.
(function () {
  if (!window.CatWordsSettings) return;

  const inject = () => {
    const top = document.querySelector('.top');
    if (!top || top.querySelector('.theme-toggle')) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'theme-toggle';
    button.setAttribute('aria-label', 'สลับธีมสว่าง/มืด');

    const paint = () => {
      const dark = window.CatWordsSettings.read().theme === 'dark';
      button.textContent = dark ? '☀️' : '🌙';
      button.title = dark ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด';
    };

    button.addEventListener('click', () => {
      const next = window.CatWordsSettings.read().theme === 'dark' ? 'light' : 'dark';
      window.CatWordsSettings.update({ theme: next });
      paint();
    });

    paint();
    top.insertBefore(button, top.querySelector('.profile'));
  };

  inject();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  }
  // Keep the toggle icon in sync when the theme changes elsewhere (e.g. Settings).
  window.addEventListener('catwords-settings-change', () => {
    document.querySelectorAll('.theme-toggle').forEach((element) => {
      const dark = window.CatWordsSettings.read().theme === 'dark';
      element.textContent = dark ? '☀️' : '🌙';
      element.title = dark ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด';
    });
  });
})();
