// Register the service worker (HTTPS or localhost only — needed for PWA/offline).
(function () {
  if (!('serviceWorker' in navigator)) return;
  const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if (location.protocol !== 'https:' && !isLocalhost) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline is optional */ });
  });
})();
