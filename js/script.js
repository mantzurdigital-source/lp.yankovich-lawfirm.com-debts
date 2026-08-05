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

  // Hero stat counters — animate from 0 to target once scrolled into view
  const statEls = document.querySelectorAll('.hstat__num');
  if (statEls.length) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animateCount = (el) => {
      const target = parseInt(el.dataset.count, 10) || 0;
      const suffix = el.dataset.suffix || '';
      if (prefersReducedMotion) {
        el.textContent = target + suffix;
        return;
      }
      const duration = 1400;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if ('IntersectionObserver' in window) {
      const statIo = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            statIo.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 });
      statEls.forEach((el) => statIo.observe(el));
    } else {
      statEls.forEach((el) => { el.textContent = (el.dataset.count || '0') + (el.dataset.suffix || ''); });
    }
  }

  // Path/service cards — flip to reveal description on click
  const pathCards = document.querySelectorAll('.path-card[data-flip]');
  pathCards.forEach((btn) => {
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
    });
  });

  // Teach the flip interaction — one-time demo peek on the first card, touch devices only
  // (no :hover affordance on touch, so the cards otherwise look static/non-interactive)
  {
    const firstCard = pathCards[0];
    const noHover = window.matchMedia('(hover: none)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (firstCard && noHover && !reducedMotion && 'IntersectionObserver' in window) {
      let userInteracted = false;
      pathCards.forEach((c) => c.addEventListener('click', () => { userInteracted = true; }, { once: true }));

      const demoIo = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          demoIo.unobserve(entry.target);
          setTimeout(() => {
            if (userInteracted) return;
            firstCard.setAttribute('aria-expanded', 'true');
            setTimeout(() => {
              if (!userInteracted) firstCard.setAttribute('aria-expanded', 'false');
            }, 900);
          }, 500);
        });
      }, { threshold: 0.5 });
      demoIo.observe(firstCard);
    }
  }

  // FAQ accordion — animate open/close instead of the native instant snap
  {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reducedMotion) {
      document.querySelectorAll('.faq-item').forEach((item) => {
        const summary = item.querySelector('summary');
        const panel = item.querySelector('p');
        if (!summary || !panel) return;
        let animating = false;

        summary.addEventListener('click', (e) => {
          e.preventDefault();
          if (animating) return;
          animating = true;

          if (item.open) {
            const startHeight = panel.scrollHeight;
            panel.style.maxHeight = startHeight + 'px';
            requestAnimationFrame(() => { panel.style.maxHeight = '0px'; });
            panel.addEventListener('transitionend', function onEnd() {
              panel.removeEventListener('transitionend', onEnd);
              item.open = false;
              panel.style.maxHeight = '';
              animating = false;
            }, { once: true });
          } else {
            item.open = true;
            const endHeight = panel.scrollHeight;
            panel.style.maxHeight = '0px';
            requestAnimationFrame(() => { panel.style.maxHeight = endHeight + 'px'; });
            panel.addEventListener('transitionend', function onEnd() {
              panel.removeEventListener('transitionend', onEnd);
              panel.style.maxHeight = '';
              animating = false;
            }, { once: true });
          }
        });
      });
    }
  }

  // Video lightbox — testimonial thumbnails open a fullscreen player
  const videoModal = document.getElementById('videoModal');
  const videoModalPlayer = document.getElementById('videoModalPlayer');
  if (videoModal && videoModalPlayer) {
    let lastTrigger = null;

    const openVideoModal = (trigger) => {
      lastTrigger = trigger;
      videoModalPlayer.setAttribute('poster', trigger.dataset.videoPoster || '');
      videoModalPlayer.src = trigger.dataset.videoSrc;
      videoModal.classList.add('is-open');
      videoModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      videoModalPlayer.play().catch(() => {});
      videoModal.querySelector('.video-modal__close').focus();
    };

    const closeVideoModal = () => {
      videoModalPlayer.pause();
      videoModalPlayer.removeAttribute('src');
      videoModalPlayer.load();
      videoModal.classList.remove('is-open');
      videoModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      if (lastTrigger) lastTrigger.focus();
    };

    document.querySelectorAll('[data-video-open]').forEach((btn) => {
      btn.addEventListener('click', () => openVideoModal(btn));
    });
    videoModal.querySelectorAll('[data-video-close]').forEach((el) => {
      el.addEventListener('click', closeVideoModal);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && videoModal.classList.contains('is-open')) closeVideoModal();
    });
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
