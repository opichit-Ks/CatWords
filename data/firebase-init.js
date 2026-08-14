// Lazy Firebase bootstrap — only loads the compat SDK when a real config is
// present. Dispatches 'catwords-firebase-init' with { ready, reason } so UI
// can bind once initialization settles (immediately when config is missing).
(function () {
  const config = globalThis.CatWordsFirebaseConfig;
  const hasConfig = Boolean(config && config.apiKey && !config.apiKey.startsWith('YOUR_'));
  const state = {
    ready: false,
    reason: hasConfig ? 'loading' : 'no-config',
    config: hasConfig ? config : null
  };
  window.CatWordsFirebase = state;

  const emit = () => {
    window.dispatchEvent(new CustomEvent('catwords-firebase-init', { detail: state }));
  };

  if (!hasConfig) {
    emit();
    return;
  }

  const SDK = 'https://www.gstatic.com/firebasejs/10.12.0/';
  const FILES = [
    'firebase-app-compat.js',
    'firebase-auth-compat.js',
    'firebase-firestore-compat.js',
    'firebase-messaging-compat.js'
  ];

  const load = (src) => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error('โหลด Firebase SDK ไม่สำเร็จ: ' + src));
    document.head.append(script);
  });

  (async () => {
    try {
      for (const file of FILES) await load(SDK + file);
      const app = firebase.initializeApp(config);
      state.app = app;
      state.auth = firebase.auth(app);
      state.db = firebase.firestore(app);
      state.messaging = firebase.messaging(app);
      state.ready = true;
      state.reason = null;
    } catch (error) {
      state.reason = String((error && error.message) || error);
    }
    emit();
  })();
})();
