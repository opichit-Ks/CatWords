(function (global) {
  const KEY = 'catwords-mvp-progress';
  const WORDS_PER_LESSON = 5;
  const XP_PER_WORD = 6;

  const localDate = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const previousDate = (date) => {
    const value = new Date(`${date}T12:00:00`);
    value.setDate(value.getDate() - 1);
    return localDate(value);
  };

  const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : fallback;
  const integer = (value, fallback = 0) => Math.floor(number(value, fallback));

  // Canonical level formula used across every page (50 XP per level).
  const levelFor = (xp) => Math.max(1, Math.floor(number(xp) / 50) + 1);

  const emptyState = (day) => ({
    version: 2,
    day,
    word: 0,
    lessonCompleted: false,
    quizCompleted: false,
    quizScore: 0,
    readingCompleted: false,
    readingScore: 0,
    readingsCompleted: 0,
    readingDates: [],
    xp: 0,
    coins: 0,
    wordsLearned: 0,
    lessonsCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastCompletionDate: null,
    completedDates: []
  });

  const normalize = (raw, today = localDate()) => {
    const source = raw && typeof raw === 'object' ? raw : {};
    const word = Math.min(WORDS_PER_LESSON, integer(source.word));
    const state = {
      ...emptyState(today),
      xp: integer(source.xp),
      coins: integer(source.coins),
      wordsLearned: integer(source.wordsLearned),
      lessonsCompleted: integer(source.lessonsCompleted),
      readingsCompleted: integer(source.readingsCompleted),
      readingDates: Array.isArray(source.readingDates)
        ? [...new Set(source.readingDates.filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date)))].slice(-90)
        : [],
      currentStreak: integer(source.currentStreak),
      longestStreak: integer(source.longestStreak),
      lastCompletionDate: typeof source.lastCompletionDate === 'string' ? source.lastCompletionDate : null,
      completedDates: Array.isArray(source.completedDates)
        ? [...new Set(source.completedDates.filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date)))].slice(-90)
        : []
    };

    if (source.day === today || (!source.day && source.version !== 2)) {
      state.word = word;
      state.lessonCompleted = Boolean(source.lessonCompleted || source.completed || word >= WORDS_PER_LESSON);
      state.quizCompleted = Boolean(source.quizCompleted);
      state.quizScore = Math.min(WORDS_PER_LESSON, integer(source.quizScore));
      state.readingCompleted = Boolean(source.readingCompleted);
      state.readingScore = Math.min(3, integer(source.readingScore));
    }

    state.completed = state.lessonCompleted;
    return state;
  };

  const write = (state) => {
    localStorage.setItem(KEY, JSON.stringify(state));
    return state;
  };

  const read = () => {
    let raw;
    try {
      raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    } catch {
      raw = null;
    }
    const state = normalize(raw);
    if (!raw || JSON.stringify(raw) !== JSON.stringify(state)) write(state);
    return state;
  };

  const recordWord = (index) => {
    const state = read();
    if (!Number.isInteger(index) || index < 0 || index >= WORDS_PER_LESSON || state.lessonCompleted || index !== state.word) {
      return { state, changed: false, earnedXP: 0 };
    }

    state.word += 1;
    state.xp += XP_PER_WORD;
    state.lessonCompleted = state.word === WORDS_PER_LESSON;
    state.completed = state.lessonCompleted;
    write(state);
    return { state, changed: true, earnedXP: XP_PER_WORD };
  };

  const submitQuiz = (score) => {
    const state = read();
    if (!state.lessonCompleted || state.quizCompleted) return { state, changed: false, earnedXP: 0, earnedCoins: 0 };

    const quizScore = Math.min(WORDS_PER_LESSON, integer(score));
    const earnedXP = quizScore * 10;
    const earnedCoins = quizScore * 2;
    state.quizCompleted = true;
    state.quizScore = quizScore;
    state.xp += earnedXP;
    state.coins += earnedCoins;
    state.wordsLearned += WORDS_PER_LESSON;
    state.lessonsCompleted += 1;
    state.completedDates = [...new Set([...state.completedDates, state.day])].slice(-90);

    if (state.lastCompletionDate !== state.day) {
      state.currentStreak = state.lastCompletionDate === previousDate(state.day) ? state.currentStreak + 1 : 1;
      state.longestStreak = Math.max(state.longestStreak, state.currentStreak);
      state.lastCompletionDate = state.day;
    }

    write(state);
    return { state, changed: true, earnedXP, earnedCoins };
  };

  // Complete today's Reading Practice (story + comprehension check).
  // Awarded once per day: base reward for finishing, plus bonus per correct answer.
  const completeReading = (score) => {
    const state = read();
    if (state.readingCompleted) return { state, changed: false, earnedXP: 0, earnedCoins: 0 };

    const readingScore = Math.min(3, Math.max(0, integer(score)));
    const earnedXP = 9 + readingScore * 6;
    const earnedCoins = 3 + readingScore * 2;
    state.readingCompleted = true;
    state.readingScore = readingScore;
    state.readingsCompleted += 1;
    state.readingDates = [...new Set([...state.readingDates, state.day])].slice(-90);
    state.xp += earnedXP;
    state.coins += earnedCoins;

    write(state);
    return { state, changed: true, earnedXP, earnedCoins };
  };

  global.CatWordsProgress = { read, recordWord, submitQuiz, completeReading, localDate, levelFor };
})(window);
