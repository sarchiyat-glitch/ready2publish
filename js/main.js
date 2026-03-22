// Shared initialization for all pages

export function initNav() {
  const toggle = document.querySelector('.nav__toggle');
  const mobile = document.querySelector('.nav__mobile');
  if (!toggle || !mobile) return;

  toggle.addEventListener('click', () => {
    const isOpen = toggle.classList.toggle('is-open');
    mobile.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav') && mobile.classList.contains('is-open')) {
      toggle.classList.remove('is-open');
      mobile.classList.remove('is-open');
    }
  });
}

export function setActiveNavLink() {
  const path = window.location.pathname;
  const filename = path.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link, .nav__mobile .nav__link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === filename || (filename === '' && href === 'index.html')) {
      link.classList.add('nav__link--active');
    }
  });
}

// Init on every page
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  setActiveNavLink();
});
