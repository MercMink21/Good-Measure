// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
    navLinks.style.display = open ? 'flex' : '';
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      navLinks.style.display = '';
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('is-visible'));
}

// Match the hero rule's width to the rendered tagline text below it
const heroRule = document.querySelector('.hero-rule');
const heroTagline = document.querySelector('.hero-tagline');
if (heroRule && heroTagline) {
  const syncRuleWidth = () => {
    heroRule.style.width = heroTagline.offsetWidth + 'px';
  };
  syncRuleWidth();
  window.addEventListener('resize', syncRuleWidth);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncRuleWidth);
  }
}

// Inquiry form (demo — replace action with real endpoint, e.g. Formspree)
const form = document.getElementById('inquiryForm');
const status = document.getElementById('formStatus');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Honeypot: real visitors never fill this hidden field, bots often do
    const honeypot = form.querySelector('#website');
    if (honeypot && honeypot.value) {
      return;
    }
    status.textContent = 'Thanks — this is a demo form. Connect it to Formspree/Resend/your inbox to go live.';
  });
}
