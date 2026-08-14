(function () {
  if (!window.CatWordsProgress) return;
  const state = window.CatWordsProgress.read();
  const level = window.CatWordsProgress.levelFor(state.xp);

  const streak = document.querySelector('.streak b');
  const stats = document.querySelectorAll('.stats .stat strong');
  const heroTitle = document.querySelector('.hero h2');
  const heroText = document.querySelector('.hero p');
  const heroAction = document.querySelector('.hero .cta');
  const firstTaskTag = document.querySelector('#lesson-task-tag');
  const readingTaskTag = document.querySelector('#reading-task-tag');

  if (streak) streak.textContent = `${state.currentStreak} วัน`;
  if (stats.length >= 3) {
    stats[0].textContent = state.xp;
    stats[1].textContent = state.coins;
    stats[2].textContent = state.lessonsCompleted;
  }

  if (state.readingCompleted && readingTaskTag) readingTaskTag.textContent = 'อ่านแล้ว 🎉';
  else if (state.quizCompleted && readingTaskTag) readingTaskTag.textContent = 'อ่านเลย';
  else if (state.lessonCompleted && readingTaskTag) readingTaskTag.textContent = 'อ่านได้แล้ว';

  if (state.quizCompleted) {
    if (heroTitle) heroTitle.innerHTML = 'วันนี้เรียนครบแล้ว<br><em>เก่งมากเลย!</em>';
    if (heroText) heroText.textContent = `Quiz วันนี้ ${state.quizScore}/5 · กลับมาพบกันใหม่พรุ่งนี้นะ`;
    if (heroAction) { heroAction.href = 'progress.html'; heroAction.textContent = 'ดูความก้าวหน้า →'; }
    if (firstTaskTag) firstTaskTag.textContent = 'สำเร็จแล้ว';
  } else if (state.lessonCompleted) {
    if (heroTitle) heroTitle.innerHTML = 'พร้อมทบทวน<br><em>Daily Quiz</em> แล้ว';
    if (heroText) heroText.textContent = 'อีกเพียง 5 ข้อก็รับรางวัลของวันนี้ได้';
    if (heroAction) heroAction.textContent = 'ทำ Quiz →';
    if (firstTaskTag) firstTaskTag.textContent = 'ทำ Quiz';
  } else if (state.word > 0) {
    if (heroTitle) heroTitle.innerHTML = `เรียนต่ออีก<br><em>${5 - state.word} คำ</em> นะ`;
    if (heroText) heroText.textContent = 'Mochi เก็บที่ของคุณไว้แล้ว';
    if (heroAction) heroAction.textContent = 'เรียนต่อ →';
    if (firstTaskTag) firstTaskTag.textContent = 'เรียนต่อ';
  }

  // Meowville districts
  const districts = document.querySelector('#districts');
  if (districts && window.CatWordsCharacters) {
    districts.innerHTML = window.CatWordsCharacters.DISTRICTS.map((district) => {
      const unlocked = level >= district.unlockLevel;
      const active = district.slug === 'academy-hall';
      return `<div class="district ${active ? 'active' : ''} ${unlocked ? '' : 'locked'}">
        <span class="d-icon">${district.icon}</span>
        <b>${district.name}</b>
        <small>${unlocked ? district.note : `ปลดล็อก Level ${district.unlockLevel}`}</small>
        <span class="d-teacher">${district.teacher}</span>
      </div>`;
    }).join('');
  }
})();
