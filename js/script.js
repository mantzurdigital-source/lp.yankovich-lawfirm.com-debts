(() => {
  'use strict';

  // Staggered scroll-reveal — siblings sharing a parent cascade in one after another
  const revealGroups = new Map();
  document.querySelectorAll('.reveal').forEach((el) => {
    const parent = el.parentElement;
    if (!revealGroups.has(parent)) revealGroups.set(parent, []);
    revealGroups.get(parent).push(el);
  });
  revealGroups.forEach((els) => {
    if (els.length > 1) {
      els.forEach((el, i) => { el.style.transitionDelay = `${i * 90}ms`; });
    }
  });

  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // Floating action stack — appears after scrolling past the hero
  const fabs = document.querySelectorAll('.fab');
  const hero = document.querySelector('.hero');
  if (fabs.length && hero) {
    const fabIo = new IntersectionObserver(([entry]) => {
      fabs.forEach((f) => f.classList.toggle('is-visible', !entry.isIntersecting));
    }, { threshold: 0 });
    fabIo.observe(hero);
  } else {
    fabs.forEach((f) => f.classList.add('is-visible'));
  }

  // Accessibility panel
  const a11yToggle = document.getElementById('a11yToggle');
  const a11yPanel = document.getElementById('a11yPanel');
  if (a11yToggle && a11yPanel) {
    const closeA11y = () => {
      a11yToggle.setAttribute('aria-expanded', 'false');
      a11yPanel.setAttribute('aria-hidden', 'true');
    };
    a11yToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = a11yToggle.getAttribute('aria-expanded') === 'true';
      a11yToggle.setAttribute('aria-expanded', String(!open));
      a11yPanel.setAttribute('aria-hidden', String(open));
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#a11yWidget')) closeA11y();
    });

    let fontStep = 0;
    const root = document.documentElement;
    document.querySelectorAll('[data-a11y]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.a11y;
        if (action === 'font-up' && fontStep < 3) {
          fontStep++;
          root.style.fontSize = `${100 + fontStep * 10}%`;
        }
        if (action === 'font-down' && fontStep > -2) {
          fontStep--;
          root.style.fontSize = `${100 + fontStep * 10}%`;
        }
        if (action === 'contrast') {
          const on = document.body.classList.toggle('a11y-contrast');
          btn.setAttribute('aria-checked', String(on));
        }
        if (action === 'underline') {
          const on = document.body.classList.toggle('a11y-underline');
          btn.setAttribute('aria-checked', String(on));
        }
        if (action === 'reset') {
          fontStep = 0;
          root.style.fontSize = '';
          document.body.classList.remove('a11y-contrast', 'a11y-underline');
          document.querySelectorAll('.a11y__item[aria-checked]').forEach((b) => b.setAttribute('aria-checked', 'false'));
        }
      });
    });
  }

  // Lead form
  const form = document.getElementById('leadForm');
  if (form) {
    const phoneInput = document.getElementById('lfPhone');
    const phoneErr = document.getElementById('lfPhoneErr');
    const okPanel = document.getElementById('leadFormOk');

    phoneInput.addEventListener('input', () => {
      phoneInput.value = phoneInput.value.replace(/\D/g, '').slice(0, 10);
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const phoneValid = /^0\d{9}$/.test(phoneInput.value);
      phoneErr.hidden = phoneValid;
      phoneInput.style.borderColor = phoneValid ? '' : '#D97757';

      if (!form.checkValidity() || !phoneValid) {
        if (!phoneValid) phoneInput.focus();
        return;
      }

      // No backend wired up yet — replace with the real submit endpoint when available.
      form.querySelectorAll('.fi, button[type="submit"]').forEach((el) => (el.style.display = 'none'));
      okPanel.hidden = false;
      okPanel.classList.add('is-visible');
    });
  }
})();
