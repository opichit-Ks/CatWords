// CatWords settings — display name, learning level, theme, default voice.
// Stored separately from progress so the learner key stays stable.
(function (global) {
  const KEY = 'catwords-settings';

  const DEFAULTS = {
    displayName: 'คุณนักเรียน',
    learningLevel: 'easy', // easy | intermediate | advanced
    theme: 'light',        // light | dark
    voice: 'auto'          // auto | en-US | en-UK
  };

  const normalize = (raw) => {
    const source = raw && typeof raw === 'object' ? raw : {};
    const validLevel = ['easy', 'intermediate', 'advanced'].includes(source.learningLevel);
    const validTheme = ['light', 'dark'].includes(source.theme);
    const validVoice = ['auto', 'en-US', 'en-UK'].includes(source.voice);
    return {
      displayName: typeof source.displayName === 'string' && source.displayName.trim()
        ? source.displayName.trim().slice(0, 24)
        : DEFAULTS.displayName,
      learningLevel: validLevel ? source.learningLevel : DEFAULTS.learningLevel,
      theme: validTheme ? source.theme : DEFAULTS.theme,
      voice: validVoice ? source.voice : DEFAULTS.voice
    };
  };

  const read = () => {
    let raw;
    try {
      raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    } catch {
      raw = null;
    }
    return normalize(raw);
  };

  const write = (state) => {
    localStorage.setItem(KEY, JSON.stringify(state));
    return state;
  };

  const update = (patch) => {
    const state = write({ ...read(), ...patch });
    applyTheme(state.theme);
    global.dispatchEvent(new CustomEvent('catwords-settings-change', { detail: state }));
    return state;
  };

  const applyTheme = (theme) => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  };

  const reset = () => {
    localStorage.removeItem(KEY);
    applyTheme('light');
    return DEFAULTS;
  };

  // Apply persisted theme as early as possible.
  applyTheme(read().theme);

  global.CatWordsSettings = { KEY, DEFAULTS, read, write, update, applyTheme, reset };
})(window);
