(function () {
  const container = document.querySelector('#cats');
  const detail = document.querySelector('#family-detail');
  if (!container || !window.CatWordsCharacters || !window.CatWordsProgress) return;

  const progress = window.CatWordsProgress.read();
  const level = window.CatWordsProgress.levelFor(progress.xp);
  const characters = window.CatWordsCharacters.list();

  const render = () => {
    container.innerHTML = characters.map((character) => {
      const unlocked = level >= character.unlockLevel;
      return `<div class="cat ${unlocked ? '' : 'locked'}" data-slug="${character.slug}" role="button" tabindex="${unlocked ? '0' : '-1'}" aria-label="${character.name}${unlocked ? '' : ' ยังไม่ปลดล็อก'}">
        <span class="cat-avatar">${unlocked ? `<img src="${character.portrait}" alt="${character.name}">` : `<span>${character.emoji}</span>`}</span>
        <b>${character.name}</b>
        <small>${character.role}</small>
        <em>${unlocked ? 'พร้อมสอน' : `🔒 Level ${character.unlockLevel}`}</em>
      </div>`;
    }).join('');

    container.querySelectorAll('.cat').forEach((cat) => {
      const character = window.CatWordsCharacters.get(cat.dataset.slug);
      const unlocked = level >= character.unlockLevel;
      const showDetail = () => {
        if (!unlocked) return;
        detail.innerHTML = `<section class="panel family-detail">
          <div class="fd-image"><img src="${character.portrait}" alt="${character.name}"></div>
          <div>
            <span class="role">${character.role.toUpperCase()}</span>
            <h2>${character.name}</h2>
            <p>${character.bio}</p>
            <div class="fd-actions">
              <a class="cta" href="daily-lesson.html">เริ่มบทเรียน →</a>
              <span class="fav">${character.favorite}</span>
            </div>
          </div>
        </section>`;
        detail.scrollIntoView({ behavior: 'smooth', block: 'center' });
      };
      cat.addEventListener('click', showDetail);
      cat.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          showDetail();
        }
      });
    });
  };

  render();
})();
