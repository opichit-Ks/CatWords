// Shared app shell: nav active state, profile bar, today's date, theme apply.
// Every page loads this after progress-store and settings-store.
(function () {
  const page = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '') || 'index';

  // Active navigation (desktop sidebar + mobile bottom bar)
  document.querySelectorAll('.nav a[data-page]').forEach((link) => {
    link.classList.toggle('active', link.dataset.page === page);
  });
  document.querySelectorAll('.bottom a[data-page]').forEach((link) => {
    link.classList.toggle('active', link.dataset.page === page);
  });

  // Profile bar (name + level)
  const settings = window.CatWordsSettings ? window.CatWordsSettings.read() : null;
  const progress = window.CatWordsProgress ? window.CatWordsProgress.read() : null;
  const level = progress ? window.CatWordsProgress.levelFor(progress.xp) : 1;

  const profileNames = document.querySelectorAll('.profile b');
  const profileLevels = document.querySelectorAll('.profile small');
  if (settings) profileNames.forEach((element) => { element.textContent = settings.displayName; });
  profileLevels.forEach((element) => { element.textContent = `Level ${level} · Explorer`; });

  // Today's date in the eyebrow (elements opt in with data-today)
  document.querySelectorAll('[data-today]').forEach((element) => {
    const date = new Intl.DateTimeFormat('en-GB', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
      .format(new Date())
      .toUpperCase();
    element.textContent = date;
  });
})();
