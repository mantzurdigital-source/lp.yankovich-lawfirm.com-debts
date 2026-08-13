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

  // "Why us" cards drop in with a wider gap between each, so the eye follows them landing one by one
  document.querySelectorAll('.why-item.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${i * 140}ms`;
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

  // Mobile hamburger menu
  const navToggle = document.querySelector('.nav-toggle');
  const mobileNav = document.getElementById('mobileNav');
  if (navToggle && mobileNav) {
    const closeMobileNav = () => {
      navToggle.setAttribute('aria-expanded', 'false');
      mobileNav.classList.remove('is-open');
    };
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!open));
      mobileNav.classList.toggle('is-open', !open);
    });
    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMobileNav);
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.site-header')) closeMobileNav();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) closeMobileNav();
    });
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

      const submitBtn = form.querySelector('button[type="submit"]');
      const submitErr = document.getElementById('lfSubmitErr');
      submitBtn.disabled = true;
      submitErr.hidden = true;

      fetch('api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: document.getElementById('lfName').value,
          phone: phoneInput.value,
          message: document.getElementById('lfMsg').value,
          lead_source: 'טופס בעמוד',
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error('submit failed');
          if (typeof fbq === 'function') fbq('track', 'Lead');
          window.location.href = 'thank-you.html';
        })
        .catch(() => {
          submitBtn.disabled = false;
          submitErr.hidden = false;
        });
    });
  }

  // Exit-intent popup — one gentle nudge before leaving, shown once per session
  const exitModal = document.getElementById('exitModal');
  if (exitModal) {
    const exitForm = document.getElementById('exitForm');
    const exitNameInput = document.getElementById('exitName');
    const exitNameErr = document.getElementById('exitNameErr');
    const exitPhoneInput = document.getElementById('exitPhone');
    const exitPhoneErr = document.getElementById('exitPhoneErr');
    const exitOkPanel = document.getElementById('exitFormOk');
    const mainOkPanel = document.getElementById('leadFormOk');

    let exitShown = sessionStorage.getItem('exitPopupShown') === '1';
    const pageLoadTime = Date.now();
    const MIN_DWELL_MS = 15000; // לפחות 15 שניות שהייה לפני שהפופאפ רשאי להיפתח

    const openExitModal = () => {
      if (exitShown) return;
      if (Date.now() - pageLoadTime < MIN_DWELL_MS) return;
      if (mainOkPanel && mainOkPanel.classList.contains('is-visible')) return;
      exitShown = true;
      sessionStorage.setItem('exitPopupShown', '1');
      exitModal.classList.add('is-open');
      exitModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      exitModal.querySelector('.exit-modal__close').focus();
    };

    const closeExitModal = () => {
      exitModal.classList.remove('is-open');
      exitModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
    };

    exitModal.querySelectorAll('[data-exit-close]').forEach((el) => {
      el.addEventListener('click', closeExitModal);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && exitModal.classList.contains('is-open')) closeExitModal();
    });

    // Desktop — cursor leaving toward the browser chrome at the top of the page
    document.addEventListener('mouseout', (e) => {
      if (!e.relatedTarget && e.clientY <= 0) openExitModal();
    });

    // Touch devices — reaching the footer without converting is the closest signal to "about to leave"
    const footerEl = document.querySelector('.site-footer');
    if (footerEl && 'IntersectionObserver' in window) {
      const footerIo = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) openExitModal();
      }, { threshold: 0.3 });
      footerIo.observe(footerEl);
    }

    if (exitPhoneInput) {
      exitPhoneInput.addEventListener('input', () => {
        exitPhoneInput.value = exitPhoneInput.value.replace(/\D/g, '').slice(0, 10);
      });
    }

    if (exitForm) {
      exitForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameValid = exitNameInput.value.trim().length > 0;
        exitNameErr.hidden = nameValid;
        exitNameInput.style.borderColor = nameValid ? '' : '#D97757';

        const phoneValid = /^0\d{9}$/.test(exitPhoneInput.value);
        exitPhoneErr.hidden = phoneValid;
        exitPhoneInput.style.borderColor = phoneValid ? '' : '#D97757';

        if (!nameValid) { exitNameInput.focus(); return; }
        if (!phoneValid) { exitPhoneInput.focus(); return; }

        const exitSubmitBtn = exitForm.querySelector('button[type="submit"]');
        const exitSubmitErr = document.getElementById('exitSubmitErr');
        exitSubmitBtn.disabled = true;
        exitSubmitErr.hidden = true;

        fetch('api/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: exitNameInput.value.trim(),
            phone: exitPhoneInput.value,
            lead_source: 'פופאפ יציאה',
          }),
        })
          .then((res) => {
            if (!res.ok) throw new Error('submit failed');
            if (typeof fbq === 'function') fbq('track', 'Lead');
            exitForm.querySelectorAll('.fi, button[type="submit"]').forEach((el) => (el.style.display = 'none'));
            exitOkPanel.hidden = false;
            exitOkPanel.classList.add('is-visible');
          })
          .catch(() => {
            exitSubmitBtn.disabled = false;
            exitSubmitErr.hidden = false;
          });
      });
    }
  }
})();
