(() => {
  'use strict';

  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Preloader */
  const preloader = qs('.preloader');
  if (preloader) {
    let seen = false;
    try { seen = sessionStorage.getItem('nexo-preloader-seen') === 'true'; } catch (_) {}
    if (seen || reducedMotion) {
      preloader.remove();
    } else {
      window.addEventListener('load', () => {
        window.setTimeout(() => {
          preloader.classList.add('is-hidden');
          try { sessionStorage.setItem('nexo-preloader-seen', 'true'); } catch (_) {}
          window.setTimeout(() => preloader.remove(), 650);
        }, 850);
      });
    }
  }

  /* Sticky navigation */
  const header = qs('.site-header');
  const syncHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  /* Mobile menu */
  const navToggle = qs('.nav-toggle');
  const mobileMenu = qs('.mobile-menu');
  const closeMenu = () => {
    if (!navToggle || !mobileMenu) return;
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.textContent = 'Menú ↗';
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
  };
  const openMenu = () => {
    if (!navToggle || !mobileMenu) return;
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.textContent = 'Cerrar ×';
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    qs('a', mobileMenu)?.focus();
  };
  navToggle?.addEventListener('click', () => {
    navToggle.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
  });
  qsa('a', mobileMenu || document).forEach(link => link.addEventListener('click', closeMenu));

  /* Reveal animations */
  const revealNodes = qsa('[data-reveal]');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealNodes.forEach(node => node.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.13, rootMargin: '0px 0px -8% 0px' });
    revealNodes.forEach(node => revealObserver.observe(node));
  }

  /* Brand preview index */
  const brandButtons = qsa('[data-brand-preview]');
  const brandImage = qs('#brand-preview-image');
  const brandTitle = qs('#brand-preview-title');
  const brandMeta = qs('#brand-preview-meta');
  const updateBrand = button => {
    if (!brandImage || !brandTitle || !brandMeta) return;
    brandButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    brandImage.style.opacity = '0';
    window.setTimeout(() => {
      brandImage.src = button.dataset.image;
      brandImage.alt = `Visual provisional de ${button.dataset.title}`;
      brandTitle.textContent = button.dataset.title;
      brandMeta.textContent = button.dataset.meta;
      brandImage.style.opacity = '1';
    }, 170);
  };
  brandButtons.forEach(button => {
    button.addEventListener('mouseenter', () => updateBrand(button));
    button.addEventListener('focus', () => updateBrand(button));
    button.addEventListener('click', () => updateBrand(button));
  });

  /* Services accordion */
  qsa('.service-trigger').forEach(trigger => {
    const panel = document.getElementById(trigger.getAttribute('aria-controls'));
    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!expanded));
      if (panel) panel.style.maxHeight = expanded ? '0px' : `${panel.scrollHeight}px`;
    });
  });

  /* Featured case scroll state */
  const caseScenes = qsa('.case-scene');
  const caseSteps = qsa('.case-step');
  if (caseScenes.length && 'IntersectionObserver' in window) {
    const caseObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const index = Number(entry.target.dataset.caseScene || 0);
        caseSteps.forEach((step, i) => step.classList.toggle('is-active', i === index));
      });
    }, { threshold: 0.45 });
    caseScenes.forEach(scene => caseObserver.observe(scene));
  }

  /* Method progress */
  const method = qs('.method');
  const methodTrack = qs('.method__track');
  const methodSteps = qsa('.method-step');
  const updateMethod = () => {
    if (!method || !methodTrack) return;
    const rect = method.getBoundingClientRect();
    const viewport = window.innerHeight;
    const progress = Math.max(0, Math.min(1, (viewport - rect.top) / (rect.height + viewport * .15)));
    const percent = Math.round(progress * 100);
    methodTrack.style.setProperty('--method-progress', `${percent}%`);
    const activeIndex = Math.min(methodSteps.length - 1, Math.floor(progress * methodSteps.length));
    methodSteps.forEach((step, index) => step.classList.toggle('is-active', index <= activeIndex));
  };
  updateMethod();
  window.addEventListener('scroll', updateMethod, { passive: true });

  /* Showreel modal */
  const modal = qs('#showreel-modal');
  const modalOpen = qs('[data-open-showreel]');
  const modalClose = qs('[data-close-showreel]');
  let lastFocused = null;
  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    lastFocused?.focus();
  };
  const openModal = () => {
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    modalClose?.focus();
  };
  modalOpen?.addEventListener('click', openModal);
  modalClose?.addEventListener('click', closeModal);
  modal?.addEventListener('click', event => { if (event.target === modal) closeModal(); });
  modal?.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const focusable = qsa('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', modal).filter(el => !el.hasAttribute('disabled'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  /* Archive drag */
  const archiveRail = qs('.archive-rail');
  if (archiveRail && window.matchMedia('(pointer: fine)').matches) {
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    const wrapper = archiveRail.parentElement;
    wrapper.style.overflowX = 'auto';
    wrapper.style.scrollbarWidth = 'none';
    archiveRail.addEventListener('pointerdown', event => {
      isDown = true;
      startX = event.clientX;
      scrollLeft = wrapper.scrollLeft;
      archiveRail.classList.add('is-dragging');
      archiveRail.setPointerCapture(event.pointerId);
    });
    archiveRail.addEventListener('pointermove', event => {
      if (!isDown) return;
      wrapper.scrollLeft = scrollLeft - (event.clientX - startX) * 1.2;
    });
    const release = event => {
      isDown = false;
      archiveRail.classList.remove('is-dragging');
      try { archiveRail.releasePointerCapture(event.pointerId); } catch (_) {}
    };
    archiveRail.addEventListener('pointerup', release);
    archiveRail.addEventListener('pointercancel', release);
  }

  /* Project filters */
  const filterButtons = qsa('[data-filter]');
  const filterCards = qsa('[data-project-tags]');
  const filterEmpty = qs('.filter-empty');
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      const applyFilter = () => {
        filterButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
        let visible = 0;
        filterCards.forEach(card => {
          const tags = (card.dataset.projectTags || '').split(' ');
          const show = filter === 'all' || tags.includes(filter);
          card.classList.toggle('is-hidden', !show);
          if (show) visible += 1;
        });
        filterEmpty?.classList.toggle('is-visible', visible === 0);
      };
      if (document.startViewTransition && !reducedMotion) {
        document.startViewTransition(applyFilter);
      } else {
        applyFilter();
      }
    });
  });

  /* Custom cursor */
  const cursor = qs('.custom-cursor');
  if (cursor && window.matchMedia('(pointer: fine)').matches && !reducedMotion) {
    window.addEventListener('pointermove', event => {
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
    });
    qsa('[data-cursor]').forEach(target => {
      target.addEventListener('pointerenter', () => {
        cursor.textContent = target.dataset.cursor || 'Ver';
        cursor.classList.add('is-visible');
      });
      target.addEventListener('pointerleave', () => cursor.classList.remove('is-visible'));
    });
  }

  /* Magnetic buttons */
  if (window.matchMedia('(pointer: fine)').matches && !reducedMotion) {
    qsa('[data-magnetic]').forEach(button => {
      button.addEventListener('pointermove', event => {
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        button.style.transform = `translate(${x * .09}px, ${y * .09}px)`;
      });
      button.addEventListener('pointerleave', () => { button.style.transform = ''; });
    });
  }

  /* Pointer glow on final CTA */
  const finalCta = qs('.final-cta');
  finalCta?.addEventListener('pointermove', event => {
    const rect = finalCta.getBoundingClientRect();
    finalCta.style.setProperty('--glow-x', `${event.clientX - rect.left - rect.width / 2}px`);
    finalCta.style.setProperty('--glow-y', `${event.clientY - rect.top - rect.height / 2}px`);
  });

  /* Multi-step project form */
  const form = qs('#project-form');
  if (form) {
    const steps = qsa('.form-step', form);
    const progressBars = qsa('.form-progress__bar');
    const success = qs('.form-success', form);
    let current = 0;

    const setStep = index => {
      current = Math.max(0, Math.min(steps.length - 1, index));
      steps.forEach((step, i) => step.classList.toggle('is-active', i === current));
      progressBars.forEach((bar, i) => bar.classList.toggle('is-active', i <= current));
      const heading = qs('h2', steps[current]);
      const liveRegion = qs('#form-progress-live');
      if (liveRegion && heading) {
        liveRegion.textContent = `Paso ${current + 1} de ${steps.length}: ${heading.textContent}`;
      }
      heading?.focus?.();
      window.scrollTo({ top: Math.max(0, form.offsetTop - 110), behavior: reducedMotion ? 'auto' : 'smooth' });
    };

    const validateStep = () => {
      const step = steps[current];
      let valid = true;
      const groups = qsa('[data-required-group]', step);
      groups.forEach(group => {
        const checked = qs('input:checked', group);
        const error = qs('.field-error', group);
        if (!checked) {
          valid = false;
          if (error) error.textContent = 'Selecciona al menos una opción.';
        } else if (error) error.textContent = '';
      });
      qsa('[required]', step).forEach(field => {
        const error = field.closest('.field')?.querySelector('.field-error');
        if (!field.checkValidity()) {
          valid = false;
          field.setAttribute('aria-invalid', 'true');
          if (error) error.textContent = field.validationMessage || 'Completa este campo.';
        } else {
          field.removeAttribute('aria-invalid');
          if (error) error.textContent = '';
        }
      });
      return valid;
    };

    const populateSummary = () => {
      const data = new FormData(form);
      const getAll = name => data.getAll(name).filter(Boolean).join(', ') || 'No indicado';
      const set = (id, value) => { const node = qs(id); if (node) node.textContent = value || 'No indicado'; };
      set('#summary-build', getAll('build'));
      set('#summary-challenge', getAll('challenge'));
      set('#summary-business', data.get('business'));
      set('#summary-services', getAll('services'));
      set('#summary-date', data.get('date'));
      set('#summary-contact', `${data.get('name') || ''} · ${data.get('email') || ''}`);
    };

    qsa('[data-next]', form).forEach(button => button.addEventListener('click', () => {
      if (!validateStep()) return;
      if (current === steps.length - 2) populateSummary();
      setStep(current + 1);
    }));
    qsa('[data-prev]', form).forEach(button => button.addEventListener('click', () => setStep(current - 1)));

    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!validateStep()) return;

      const data = new FormData(form);
      const getAll = name => data.getAll(name).filter(Boolean).join(', ') || 'No indicado';
      const lines = [
        'Hola Nexo, quiero iniciar un proyecto.',
        '',
        `Quiero construir: ${getAll('build')}`,
        `Reto principal: ${getAll('challenge')}`,
        `Negocio o sector: ${data.get('business') || 'No indicado'}`,
        `Servicios de interés: ${getAll('services')}`,
        `Fecha estimada: ${data.get('date') || 'No indicada'}`,
        '',
        `Nombre: ${data.get('name') || 'No indicado'}`,
        `Correo: ${data.get('email') || 'No indicado'}`,
        `Teléfono: ${data.get('phone') || 'No indicado'}`,
        `Información adicional: ${data.get('message') || 'Sin comentarios adicionales'}`
      ];
      const whatsappNumber = form.dataset.whatsappNumber || '';
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
      const fallback = qs('#whatsapp-fallback');
      if (fallback) fallback.href = whatsappUrl;

      steps[current].classList.remove('is-active');
      success?.classList.add('is-visible');
      progressBars.forEach(bar => bar.classList.add('is-active'));

      const opened = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      if (!opened && fallback) fallback.focus();
      form.reset();
    });
  }


  /* Hero project switcher */
  const heroProjectButtons = qsa('[data-hero-project]');
  const heroProjectImage = qs('#hero-project-image');
  const heroProjectTitle = qs('#hero-project-title');
  const heroProjectMeta = qs('#hero-project-meta');
  const heroProjectNumber = qs('#hero-project-number');
  let heroIndex = 0;
  let heroTimer = null;

  const setHeroProject = (button, userInitiated = false) => {
    if (!button || !heroProjectImage) return;
    heroIndex = heroProjectButtons.indexOf(button);
    heroProjectButtons.forEach(item => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    heroProjectImage.style.opacity = '0';
    heroProjectImage.style.transform = 'scale(1.018)';
    window.setTimeout(() => {
      heroProjectImage.src = button.dataset.image;
      heroProjectImage.alt = `Proyecto ${button.dataset.title}`;
      if (heroProjectTitle) heroProjectTitle.textContent = button.dataset.title;
      if (heroProjectMeta) heroProjectMeta.textContent = button.dataset.meta;
      if (heroProjectNumber) heroProjectNumber.textContent = button.dataset.number;
      heroProjectImage.style.opacity = '1';
      heroProjectImage.style.transform = '';
    }, 180);
    if (userInitiated && heroTimer) {
      window.clearInterval(heroTimer);
      heroTimer = window.setInterval(() => {
        const next = (heroIndex + 1) % heroProjectButtons.length;
        setHeroProject(heroProjectButtons[next]);
      }, 5200);
    }
  };

  heroProjectButtons.forEach(button => button.addEventListener('click', () => setHeroProject(button, true)));
  if (heroProjectButtons.length > 1 && !reducedMotion) {
    heroTimer = window.setInterval(() => {
      const next = (heroIndex + 1) % heroProjectButtons.length;
      setHeroProject(heroProjectButtons[next]);
    }, 5200);
  }

  /* Preload assets & manage timer on visibility change */
  if (heroProjectButtons.length) {
    const preloadAssets = () => {
      heroProjectButtons.forEach(btn => {
        if (btn.dataset.image) {
          const img = new Image();
          img.src = btn.dataset.image;
        }
      });
      const poster = new Image();
      poster.src = 'assets/img/showreel-poster.svg';
    };
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(preloadAssets);
    } else {
      window.setTimeout(preloadAssets, 400);
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && heroTimer) {
      window.clearInterval(heroTimer);
      heroTimer = null;
    } else if (!document.hidden && !heroTimer && heroProjectButtons.length > 1 && !reducedMotion) {
      heroTimer = window.setInterval(() => {
        const next = (heroIndex + 1) % heroProjectButtons.length;
        setHeroProject(heroProjectButtons[next]);
      }, 5200);
    }
  });

  /* V2 services accordion */
  qsa('.service-row__trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const row = trigger.closest('.service-row');
      const shouldOpen = !row.classList.contains('is-open');
      qsa('.service-row').forEach(item => {
        item.classList.remove('is-open');
        const itemTrigger = qs('.service-row__trigger', item);
        const icon = qs('i', itemTrigger);
        itemTrigger?.setAttribute('aria-expanded', 'false');
        if (icon) icon.textContent = '+';
      });
      if (shouldOpen) {
        row.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        const icon = qs('i', trigger);
        if (icon) icon.textContent = '−';
      }
    });
  });

  /* V2 archive drag and wheel */
  const archiveV2Viewport = qs('.archive-v2__viewport');
  const archiveV2Rail = qs('.archive-v2__rail');
  if (archiveV2Viewport && archiveV2Rail) {
    let dragging = false;
    let startX = 0;
    let initialScroll = 0;
    archiveV2Rail.addEventListener('pointerdown', event => {
      dragging = true;
      startX = event.clientX;
      initialScroll = archiveV2Viewport.scrollLeft;
      archiveV2Rail.setPointerCapture?.(event.pointerId);
      archiveV2Rail.style.cursor = 'grabbing';
    });
    archiveV2Rail.addEventListener('pointermove', event => {
      if (!dragging) return;
      archiveV2Viewport.scrollLeft = initialScroll - (event.clientX - startX) * 1.15;
    });
    const stopArchiveDrag = event => {
      dragging = false;
      archiveV2Rail.style.cursor = '';
      try { archiveV2Rail.releasePointerCapture?.(event.pointerId); } catch (_) {}
    };
    archiveV2Rail.addEventListener('pointerup', stopArchiveDrag);
    archiveV2Rail.addEventListener('pointercancel', stopArchiveDrag);
    archiveV2Viewport.addEventListener('wheel', event => {
      if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
        archiveV2Viewport.scrollLeft += event.deltaY;
      }
    }, { passive: true });
  }

  /* Global keyboard behavior */
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeModal();
      closeMenu();
    }
  });

  /* Current year */
  qsa('[data-year]').forEach(node => { node.textContent = new Date().getFullYear(); });
})();
