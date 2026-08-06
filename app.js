const navItems = document.querySelectorAll('[data-view]');
const views = document.querySelectorAll('.view');
function showView(name){
  views.forEach(view => view.classList.toggle('active-view', view.id === name));
  document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.view === name));
  window.scrollTo({top:0,behavior:'smooth'});
}
navItems.forEach(item => item.addEventListener('click', () => showView(item.dataset.view)));
const nextButton = document.querySelector('.next-word');
nextButton.addEventListener('click', () => {
  const toast = document.querySelector('.toast');
  toast.classList.add('show');
  nextButton.textContent = 'คำถัดไป →';
  setTimeout(() => toast.classList.remove('show'), 2400);
});
