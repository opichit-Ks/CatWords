(function (global) {
  let contentPromise;

  const validate = (content) => {
    if (!content || !Array.isArray(content.words) || !Array.isArray(content.lessons) || !Array.isArray(content.quizzes)) {
      throw new Error('CatWords content is incomplete.');
    }
    return content;
  };

  const load = () => {
    if (!contentPromise) {
      contentPromise = fetch('data/content-library.json')
        .then((response) => {
          if (!response.ok) throw new Error('Unable to load today\'s lesson.');
          return response.json();
        })
        .then(validate)
        .catch((error) => {
          contentPromise = null;
          throw error;
        });
    }
    return contentPromise;
  };

  // Pick today's lesson deterministically: prefer lessons matching the
  // learner's chosen level, otherwise rotate through all approved lessons
  // by day-of-year so every day offers a fresh, predictable set.
  const pickLesson = (content) => {
    const approved = (content.lessons || []).filter((lesson) => lesson.status === 'approved');
    if (!approved.length) throw new Error('No approved lessons available.');
    const settings = global.CatWordsSettings ? global.CatWordsSettings.read() : null;
    const preferred = settings && settings.learningLevel
      ? approved.filter((lesson) => lesson.level === settings.learningLevel)
      : [];
    const pool = preferred.length ? preferred : approved;
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now - start) / 86400000);
    return pool[((dayOfYear % pool.length) + pool.length) % pool.length];
  };

  global.CatWordsContent = { load, pickLesson };
})(window);
