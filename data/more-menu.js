// Mobile "More" menu — the bottom nav keeps 4 primary items and tucks
// Collection + Settings behind a ⋯ button that opens a slide-up sheet.
(function () {
  const moreButton = document.querySelector('.bottom .bottom-more');
  if (!moreButton) return;

  const page = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '') || 'index';
  // Collection and Settings live inside the More menu → highlight the button there.
  if (page === 'collection' || page === 'settings') moreButton.classList.add('active');

  const ITEMS = [
    { href: 'collection.html', icon: '🎒', title: 'คอลเลกชัน', desc: 'ครูและเพื่อนร่วมทางใน Academy' },
    { href: 'settings.html', icon: '⚙️', title: 'ตั้งค่า', desc: 'โปรไฟล์ ธีม เสียง และรีเซ็ต' }
  ];

  const backdrop = document.createElement('div');
  backdrop.className = 'more-backdrop';
  const sheet = document.createElement('div');
  sheet.className = 'more-sheet';
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-modal', 'true');
  sheet.setAttribute('aria-label', 'เมนูเพิ่มเติม');
  sheet.innerHTML = `
    <div class="more-grabber"></div>
    <div class="more-head">
      <span class="pill">เมนูเพิ่มเติม</span>
      <button type="button" class="more-close" aria-label="ปิดเมนู">✕ ปิด</button>
    </div>
    ${ITEMS.map((item) => `
      <a class="more-item" href="${item.href}">
        <span>${item.icon}</span>
        <span class="more-item-text"><b>${item.title}</b><small>${item.desc}</small></span>
      </a>`).join('')}`;
  document.body.append(backdrop, sheet);

  const open = () => {
    sheet.classList.add('open');
    backdrop.classList.add('show');
    moreButton.classList.add('active');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    sheet.classList.remove('open');
    backdrop.classList.remove('show');
    moreButton.classList.remove('active');
    document.body.style.overflow = '';
  };

  moreButton.addEventListener('click', () => {
    if (sheet.classList.contains('open')) close();
    else open();
  });
  backdrop.addEventListener('click', close);
  sheet.querySelector('.more-close').addEventListener('click', close);
  sheet.querySelectorAll('.more-item').forEach((item) => item.addEventListener('click', close));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });
})();
