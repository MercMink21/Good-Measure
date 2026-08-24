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

// Signage ticker — oscillates back and forth just far enough to reveal
// every image, timed so speed feels consistent regardless of how much
// it needs to travel. Skipped entirely for prefers-reduced-motion.
const signageTicker = document.getElementById('signageTicker');
if (signageTicker) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wrap = signageTicker.parentElement;

  const setupTicker = () => {
    const overflow = signageTicker.scrollWidth - wrap.clientWidth;
    if (reduceMotion || overflow <= 0) {
      signageTicker.classList.remove('is-animating');
      return;
    }
    const pxPerSecond = 45;
    signageTicker.style.setProperty('--ticker-distance', `-${overflow}px`);
    signageTicker.style.setProperty('--ticker-duration', `${overflow / pxPerSecond}s`);
    signageTicker.classList.add('is-animating');
  };

  setupTicker();
  window.addEventListener('resize', setupTicker);
  signageTicker.querySelectorAll('img').forEach((img) => {
    if (!img.complete) img.addEventListener('load', setupTicker, { once: true });
  });
}

// Inquiry form — submits to Formspree once index.html's form action has a
// real form ID; falls back to a demo message if it still says YOUR_FORM_ID.
const form = document.getElementById('inquiryForm');
const status = document.getElementById('formStatus');
if (form) {
  const isConfigured = !form.action.includes('YOUR_FORM_ID');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Honeypot: real visitors never fill this hidden field, bots often do
    const honeypot = form.querySelector('#website');
    if (honeypot && honeypot.value) {
      return;
    }

    if (!isConfigured) {
      status.textContent = 'Thanks — this is a demo form. Connect it to Formspree/Resend/your inbox to go live.';
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    status.textContent = 'Sending…';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (response.ok) {
        status.textContent = "Thanks — we'll follow up within a day.";
        form.reset();
      } else {
        status.textContent = 'Something went wrong — please email us directly at goodmeasurebarco@gmail.com.';
      }
    } catch (err) {
      status.textContent = 'Something went wrong — please email us directly at goodmeasurebarco@gmail.com.';
    } finally {
      submitBtn.disabled = false;
    }
  });
}
