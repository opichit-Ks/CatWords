(function () {
  if (!window.CatWordsProgress) return;
  const state = window.CatWordsProgress.read();
  const summary = document.querySelector('.summary');
  if (!summary) return;

  summary.innerHTML = `<div><small>Daily Streak</small><b>${state.currentStreak} วัน 🔥</b></div><div><small>XP ทั้งหมด</small><b>${state.xp}</b></div><div><small>คำศัพท์ที่เรียน</small><b>${state.wordsLearned}</b></div><div><small>เรื่องที่อ่าน</small><b>${state.readingsCompleted} 📚</b></div>`;

  // Weekly bars
  const today = new Date();
  const mondayOffset = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - mondayOffset);
  document.querySelectorAll('.bars span').forEach((bar, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    const date = window.CatWordsProgress.localDate(day);
    const completed = state.completedDates.includes(date);
    bar.style.height = completed ? '100%' : '12%';
    bar.setAttribute('aria-label', completed ? 'เรียนสำเร็จ' : 'ยังไม่ได้เรียน');
  });

  // Achievements derived from real learner state
  const level = window.CatWordsProgress.levelFor(state.xp);
  const achievements = [
    { icon: '🌟', name: 'First Step', earned: state.lessonsCompleted >= 1, requirement: 'เรียนจบ 1 บทเรียน' },
    { icon: '🔥', name: 'On a Roll', earned: state.currentStreak >= 3, requirement: 'สตรีค 3 วัน' },
    { icon: '📚', name: 'Bookworm', earned: state.wordsLearned >= 25, requirement: 'เรียนครบ 25 คำ' },
    { icon: '🐟', name: 'Fish Tycoon', earned: state.coins >= 100, requirement: 'สะสม 100 เหรียญ' },
    { icon: '🧠', name: 'Quiz Star', earned: state.lessonsCompleted >= 5, requirement: 'เรียนจบ 5 บทเรียน' },
    { icon: '🎓', name: 'Scholar', earned: level >= 3, requirement: 'ถึง Level 3' },
    { icon: '⚡', name: 'Speed Learner', earned: state.quizScore >= 5, requirement: 'Quiz เต็ม 5/5' },
    { icon: '📖', name: 'Story Explorer', earned: state.readingsCompleted >= 3, requirement: 'อ่านจบ 3 เรื่อง' },
    { icon: '🏆', name: 'Champion', earned: state.currentStreak >= 7, requirement: 'สตรีค 7 วัน' }
  ];
  const box = document.querySelector('#achievements');
  if (box) {
    box.innerHTML = achievements.map((achievement) => `
      <div class="achievement ${achievement.earned ? 'earned' : 'locked'}">
        <span>${achievement.icon}</span>
        <b>${achievement.name}</b>
        <small>${achievement.earned ? '✅ สำเร็จแล้ว' : achievement.requirement}</small>
      </div>`).join('');
  }
})();
