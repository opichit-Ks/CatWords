// In-app notification center (no backend): the 🔔 button opens a panel with
// today's lesson status, streak and upcoming tasks — all from local state.
(function () {
  const bell = document.querySelector('.notify');
  const top = document.querySelector('.top');
  if (!bell || !top) return;

  const escape = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

  const CATEGORY_LABEL = {
    'daily-life': 'ชีวิตประจำวัน',
    'restaurant': 'อาหาร',
    'travel': 'ท่องเที่ยว',
    'medical': 'สุขภาพ',
    'law-citizenship': 'กฎหมาย',
    'science': 'วิทยาศาสตร์'
  };

  const backdrop = document.createElement('div');
  backdrop.className = 'notify-backdrop';
  document.body.append(backdrop);

  const panel = document.createElement('aside');
  panel.className = 'notify-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-label', 'ศูนย์การแจ้งเตือน');
  top.append(panel);

  const badge = document.createElement('span');
  badge.className = 'notify-badge';
  badge.setAttribute('aria-hidden', 'true');
  bell.append(badge);

  const open = () => { panel.classList.add('open'); backdrop.classList.add('show'); };
  const close = () => { panel.classList.remove('open'); backdrop.classList.remove('show'); };
  bell.addEventListener('click', () => (panel.classList.contains('open') ? close() : open()));
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });

  const STATE_LABEL = {
    todo: { text: 'ยังไม่เริ่ม', tone: 'muted' },
    inprogress: { text: 'เรียนต่อ', tone: 'peach' },
    quiz: { text: 'ทำ Quiz', tone: 'peach' },
    ready: { text: 'อ่านเลย', tone: 'mint' },
    done: { text: 'สำเร็จแล้ว', tone: 'mint' },
    locked: { text: 'ทำบทเรียนก่อน', tone: 'muted' }
  };

  const render = async () => {
    const progress = window.CatWordsProgress ? window.CatWordsProgress.read() : null;
    let lesson = null;
    let words = [];
    let teacher = 'Mochi';
    let categoryLabel = '';

    try {
      const content = await window.CatWordsContent.load();
      lesson = window.CatWordsContent.pickLesson(content);
      words = lesson.wordIds.map((id) => content.words.find((word) => word.id === id)).filter(Boolean);
      teacher = (window.CatWordsCharacters.get(lesson.teacher) || {}).name || 'Mochi';
      categoryLabel = CATEGORY_LABEL[lesson.category] || lesson.category;
    } catch (error) {
      // Content offline — panel still shows progress-only info.
    }

    const lessonState = !progress ? 'todo'
      : progress.lessonCompleted ? (progress.quizCompleted ? 'done' : 'quiz')
      : progress.word > 0 ? 'inprogress' : 'todo';
    const readingState = !progress ? 'locked'
      : progress.readingCompleted ? 'done'
      : progress.quizCompleted ? 'ready' : 'locked';

    const item = (icon, title, desc, state) => `
      <div class="notify-item">
        <span class="notify-item-icon">${icon}</span>
        <div class="notify-item-body"><b>${title}</b><small>${escape(desc)}</small></div>
        <span class="notify-item-state ${state.tone}">${state.text}</span>
      </div>`;

    const date = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

    panel.innerHTML = `
      <div class="notify-head">
        <span class="pill">ศูนย์การแจ้งเตือน</span>
        <button type="button" class="notify-close" aria-label="ปิดศูนย์การแจ้งเตือน">✕</button>
      </div>
      <div class="notify-date">${escape(date.toUpperCase())}</div>
      <div class="notify-stats">
        <div><b>${progress ? progress.currentStreak : 0}</b><small>🔥 Streak</small></div>
        <div><b>${progress ? progress.xp : 0}</b><small>⚡ XP</small></div>
        <div><b>${progress ? progress.wordsLearned : 0}</b><small>📖 คำ</small></div>
      </div>
      <h4 class="notify-section">วันนี้</h4>
      ${item('📖', 'Daily Lesson', lesson ? `${categoryLabel} · ${words.map((w) => w.word).join(', ')}` : 'คำศัพท์ 5 คำใหม่', STATE_LABEL[lessonState])}
      ${item('📚', 'Reading Practice', lesson ? 'เรื่องสั้นจากคำศัพท์วันนี้' : 'เรื่องสั้นประจำวัน', STATE_LABEL[readingState])}
      <h4 class="notify-section">กำลังมา</h4>
      ${item('🏆', 'Achievement', 'สะสมรางวัลจากการเรียนต่อเนื่อง', progress && progress.lessonsCompleted >= 1 ? STATE_LABEL.done : STATE_LABEL.todo)}
      <div class="notify-foot">${teacher} จะรอเรียนกับคุณทุกวันนะ 🐱</div>`;

    panel.querySelector('.notify-close').addEventListener('click', close);

    // Badge shows when there is an action waiting (quiz or reading ready).
    const hasAction = readingState === 'ready' || lessonState === 'quiz' || (progress && !progress.lessonCompleted);
    badge.classList.toggle('show', Boolean(hasAction));
  };

  render();
})();
