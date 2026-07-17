(() => {
  'use strict';

  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Centralized Data Configuration */
  const siteConfig = {
    agencyName: "Nexo Agencia Creativa",
    whatsappDisplay: "+58 414-703-5317",
    whatsappE164: "584147035317",
    whatsappUrl: "https://wa.me/584147035317",
    phoneHref: "tel:+584147035317",
    location: "Mérida, Venezuela",
    instagram: "https://www.instagram.com/nexo_ac/"
  };

  const projects = [
    {
      id: "burger-house",
      slug: "proyectos/burger-house.html",
      name: "Burger House",
      category: "Gastronomía",
      summary: "Una personalidad rebelde para una dark kitchen que necesitaba diferenciarse en una categoría llena de mensajes similares.",
      services: "Estrategia · Gestión de redes sociales · Producción audiovisual · Publicidad digital",
      cover: "assets/img/project-burger-house.svg",
      alt: "Fotografía de producto desarrollada para Burger House.",
      tags: ["gastronomia", "estrategia", "social", "contenido", "publicidad"],
      featured: true,
      active: true,
      order: 1,
      heroNumber: "01",
      heroCode: "BH",
      heroMeta: "Estrategia de redes · Dirección creativa · Producción de contenido · Copywriting"
    },
    {
      id: "moffyns",
      slug: "proyectos/moffyns.html",
      name: "Moffyns",
      category: "Café & gastronomía",
      summary: "Una oferta gastronómica amplia organizada alrededor de productos, momentos y experiencias capaces de llevar personas a sus sedes.",
      services: "Estrategia · Producción de contenido · Diseño e identidad · Redes sociales",
      cover: "assets/img/project-moffyns.svg",
      alt: "Contenido audiovisual producido para Moffyns.",
      tags: ["gastronomia", "estrategia", "social", "contenido", "diseño"],
      featured: true,
      active: true,
      order: 2,
      heroNumber: "02",
      heroCode: "MF",
      heroMeta: "Social Media · Producción audiovisual · Dirección visual · Contenido comercial"
    },
    {
      id: "milkarf",
      slug: "proyectos/milkarf.html",
      name: "Milkarf",
      category: "Producto",
      summary: "La construcción de una presencia digital desde cero para presentar una categoría, educar al público y generar confianza en el producto.",
      services: "Estrategia de lanzamiento · Producción de contenido · Redes sociales",
      cover: "assets/img/project-paolafisiofit.svg",
      alt: "Diseño educativo creado para la estrategia digital de Milkarf.",
      tags: ["salud", "productos", "estrategia", "contenido", "diseño"],
      featured: true,
      active: true,
      order: 3,
      heroNumber: "03",
      heroCode: "MK",
      heroMeta: "Lanzamiento digital · Estrategia · Contenido educativo · Posicionamiento"
    },
    {
      id: "impreco",
      slug: "proyectos/impreco.html",
      name: "Impreco",
      category: "Empaques",
      summary: "Productos, materiales y soluciones de empaque convertidos en un catálogo digital claro, visual y comercial.",
      services: "Diseño y dirección creativa · Comunicación digital · Gestión de redes",
      cover: "assets/img/project-impreco.svg",
      alt: "Catálogo digital y comunicación comercial creada para Impreco.",
      tags: ["servicios", "productos", "estrategia", "social", "diseño", "contenido"],
      featured: true,
      active: true,
      order: 4,
      heroNumber: "04",
      heroCode: "IM",
      heroMeta: "Comunicación de producto · Diseño gráfico · Social Media · Contenido comercial"
    },
    {
      id: "paolafisiofit",
      slug: "proyectos/paolafisiofit.html",
      name: "Paolafisiofit",
      category: "Salud",
      summary: "Conocimiento profesional traducido en una comunicación educativa, preventiva y cercana para fortalecer una marca personal de fisioterapia.",
      services: "Estrategia de posicionamiento · Diseño visual · Gestión de contenido",
      cover: "assets/img/project-paolafisiofit.svg",
      alt: "Contenido educativo y preventivo creado para Paolafisiofit.",
      tags: ["salud", "estrategia", "social", "diseño", "contenido"],
      featured: true,
      active: true,
      order: 5,
      heroNumber: "05",
      heroCode: "PF",
      heroMeta: "Estrategia · Marca personal · Diseño · Contenido educativo"
    },
    {
      id: "will-auto-service",
      slug: "proyectos/will-auto-service.html",
      name: "Will Auto Service",
      category: "Automotriz",
      summary: "Una comunicación automotriz basada en diagnóstico, evidencia y transparencia para construir confianza antes de que el cliente llegue al taller.",
      services: "Estrategia digital · Producción de contenido · Publicidad en Meta Ads",
      cover: "assets/img/project-will-auto-service.svg",
      alt: "Estrategia y contenido automotriz desarrollado para Will Auto Service.",
      tags: ["automotriz", "estrategia", "social", "contenido", "publicidad"],
      featured: true,
      active: true,
      order: 6,
      heroNumber: "06",
      heroCode: "WA",
      heroMeta: "Estrategia · Producción de contenido · Posicionamiento · Publicidad digital"
    }
  ];

  const teamMembers = []; // Preparado para perfiles dinámicos

  window.NexoSystem = { siteConfig, projects, teamMembers };

  const getPrefix = () => {
    const page = document.body.dataset.page || '';
    return page.startsWith('proyectos/') ? '../' : '';
  };

  const formatNum = (num) => String(num).padStart(2, '0');

  /* Preloader */
  const preloader = qs('.preloader');
  if (preloader) {
    if (reducedMotion) {
      preloader.remove();
    } else {
      const startTime = performance.now();
      const minDuration = 5500; // 5.5 segundos garantizados para rotación completa y carga
      const dismissPreloader = () => {
        const elapsed = performance.now() - startTime;
        const remaining = Math.max(0, minDuration - elapsed);
        window.setTimeout(() => {
          preloader.classList.add('is-hidden');
          try { sessionStorage.setItem('nexo-preloader-seen', 'true'); } catch (_) {}
          window.setTimeout(() => preloader.remove(), 650);
        }, remaining);
      };
      if (document.readyState === 'complete') {
        dismissPreloader();
      } else {
        window.addEventListener('load', dismissPreloader);
      }
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

  /* Multi-step project form with enhanced security & validation */
  const form = qs('#project-form');
  if (form) {
    const formInitTime = performance.now();
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
      /* Honeypot check for spam bots */
      if (data.get('_honey')) return;
      /* Minimum timestamp check (prevents automated instant submission) */
      if (performance.now() - formInitTime < 2800) {
        alert('Por favor tómate un momento para verificar tu información antes de enviar.');
        return;
      }

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
      const whatsappNumber = siteConfig.whatsappE164 || form.dataset.whatsappNumber || '584147035317';
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
      const fallback = qs('#whatsapp-fallback');
      if (fallback) fallback.href = whatsappUrl;

      const submitBtn = qs('button[type="submit"]', form);
      if (submitBtn) {
        submitBtn.disabled = true;
        window.setTimeout(() => { submitBtn.disabled = false; }, 6000);
      }

      steps[current].classList.remove('is-active');
      success?.classList.add('is-visible');
      progressBars.forEach(bar => bar.classList.add('is-active'));

      const opened = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      if (!opened && fallback) fallback.focus();
      form.reset();
    });
  }

  /* Dynamic Rendering: Hero Showcase Tabs & Switcher */
  const heroShowcase = qs('.hero-showcase');
  if (heroShowcase && projects.length) {
    const activeProjects = projects.filter(p => p.active);
    const counterNode = qs('.hero-showcase__counter span', heroShowcase);
    const tabsContainer = qs('.hero-showcase__tabs', heroShowcase);
    
    if (tabsContainer && activeProjects.length) {
      tabsContainer.innerHTML = activeProjects.map((p, idx) => `
        <button type="button" class="hero-tab${idx === 0 ? ' is-active' : ''}" data-hero-project="${p.id}" data-image="${getPrefix()}${p.cover}" data-title="${p.name}" data-meta="${p.heroMeta || p.services}" data-number="${formatNum(idx + 1)} / ${formatNum(activeProjects.length)}" aria-label="Ver vista previa de ${p.name}" aria-pressed="${idx === 0 ? 'true' : 'false'}">${p.heroCode || p.name.substring(0, 2).toUpperCase()}</button>
      `).join('');
    }

    const heroProjectButtons = qsa('[data-hero-project]');
    const heroProjectImage = qs('#hero-project-image');
    const heroProjectTitle = qs('#hero-project-title');
    const heroProjectMeta = qs('#hero-project-meta');
    const heroProjectNumber = qs('#hero-project-number');
    let heroIndex = 0;
    let heroTimer = null;
    let isPaused = false;

    const setHeroProject = (button, userInitiated = false) => {
      if (!button || !heroProjectImage) return;
      heroIndex = heroProjectButtons.indexOf(button);
      if (heroIndex === -1) heroIndex = 0;
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
        startHeroTimer();
      }
    };

    const startHeroTimer = () => {
      if (heroTimer) window.clearInterval(heroTimer);
      if (heroProjectButtons.length <= 1 || reducedMotion || isPaused || document.hidden) return;
      heroTimer = window.setInterval(() => {
        if (isPaused || document.hidden) return;
        const next = (heroIndex + 1) % heroProjectButtons.length;
        setHeroProject(heroProjectButtons[next]);
      }, 5200);
    };

    heroProjectButtons.forEach(button => button.addEventListener('click', () => setHeroProject(button, true)));
    
    heroShowcase.addEventListener('mouseenter', () => { isPaused = true; });
    heroShowcase.addEventListener('mouseleave', () => { isPaused = false; });
    heroShowcase.addEventListener('focusin', () => { isPaused = true; });
    heroShowcase.addEventListener('focusout', () => { isPaused = false; });

    /* Keyboard arrow navigation inside hero showcase */
    heroShowcase.addEventListener('keydown', event => {
      if (heroProjectButtons.length <= 1) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        const next = (heroIndex + 1) % heroProjectButtons.length;
        setHeroProject(heroProjectButtons[next], true);
        heroProjectButtons[next].focus();
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        const prev = (heroIndex - 1 + heroProjectButtons.length) % heroProjectButtons.length;
        setHeroProject(heroProjectButtons[prev], true);
        heroProjectButtons[prev].focus();
      }
    });

    startHeroTimer();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && heroTimer) {
        window.clearInterval(heroTimer);
        heroTimer = null;
      } else if (!document.hidden) {
        startHeroTimer();
      }
    });

    /* Preload project covers */
    const preloadAssets = () => {
      heroProjectButtons.forEach(btn => {
        if (btn.dataset.image) {
          const img = new Image();
          img.src = btn.dataset.image;
        }
      });
      const poster = new Image();
      poster.src = `${getPrefix()}assets/img/showreel-poster.svg`;
    };
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(preloadAssets);
    } else {
      window.setTimeout(preloadAssets, 400);
    }
  }

  /* Dynamic Rendering: Home Featured Projects (`renderHomeProjects`) */
  const renderHomeProjects = () => {
    const homeGrid = qs('[data-render-home-projects]') || qs('#proyectos .project-feature-grid');
    if (!homeGrid || !projects.length) return;
    const activeProjects = projects.filter(p => p.active);
    if (!activeProjects.length) return;

    homeGrid.innerHTML = activeProjects.map((p, idx) => {
      const isWide = p.order === 1 || idx === 0;
      const isTall = idx % 2 !== 0 && !isWide;
      const cardClass = isWide ? 'project-feature project-feature--wide' : (isTall ? 'project-feature project-feature--tall' : 'project-feature');
      const prefix = getPrefix();
      
      return `
        <article class="${cardClass}" data-reveal="">
          <a class="project-feature__link" href="${prefix}${p.slug}" data-cursor="Ver caso">
            <figure class="project-feature__visual">
              <img src="${prefix}${p.cover}" alt="${p.alt || p.name}" loading="lazy" decoding="async" width="1600" height="1100">
              <span class="project-feature__badge">Nexo / ${formatNum(idx + 1)}</span>
            </figure>
            <div class="project-feature__content">
              <span class="project-feature__category">${p.category}</span>
              <h3 class="project-feature__title">${p.name}</h3>
              <p class="project-feature__summary">${p.summary}</p>
              <div class="project-feature__meta">
                <span><strong>Servicios:</strong> ${p.services}</span>
              </div>
              <span class="project-feature__cta">Explorar caso de estudio ↗</span>
            </div>
          </a>
        </article>
      `;
    }).join('');

    /* Observe new reveal elements if needed */
    if ('IntersectionObserver' in window && !reducedMotion) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.13, rootMargin: '0px 0px -8% 0px' });
      qsa('[data-reveal]', homeGrid).forEach(node => observer.observe(node));
    } else {
      qsa('[data-reveal]', homeGrid).forEach(node => node.classList.add('is-visible'));
    }
  };
  renderHomeProjects();

  /* Dynamic Rendering: Portfolio Grid (`renderPortfolioProjects`) */
  const renderPortfolioProjects = () => {
    const portfolioGrid = qs('[data-render-portfolio-grid]') || (document.body.dataset.page === 'proyectos/index.html' ? qs('.portfolio-grid') : null);
    if (!portfolioGrid || !projects.length) return;
    const activeProjects = projects.filter(p => p.active);
    if (!activeProjects.length) return;

    const accents = ['#E64A00', '#F5C535', '#00BFA5', '#5E35B1', '#979797', '#E64A00'];
    const prefix = getPrefix();

    portfolioGrid.innerHTML = activeProjects.map((p, idx) => {
      const accent = accents[idx % accents.length];
      const tagsStr = (p.tags || []).join(' ');
      return `
        <a class="project-card" href="${prefix}${p.slug}" data-cursor="Ver caso" data-project-tags="${tagsStr}" style="--accent:${accent}">
          <img class="project-card__image" src="${prefix}${p.cover}" alt="${p.alt || p.name}" loading="lazy" decoding="async" width="1600" height="1100">
          <div class="project-card__content">
            <span class="project-card__number">Nexo / ${formatNum(idx + 1)}</span>
            <h3 class="project-card__title">${p.name}</h3>
            <p class="project-card__meta">${p.services}</p>
          </div>
          <span class="project-card__cta" aria-hidden="true">Ver<br>caso</span>
        </a>
      `;
    }).join('');
  };
  renderPortfolioProjects();

  /* Dynamic Rendering: Team (`renderTeam`) */
  const renderTeam = () => {
    const teamContainer = qs('[data-render-team]');
    if (!teamContainer) return;
    const activeMembers = teamMembers.filter(m => m.active && m.name && m.role && m.image);
    
    if (activeMembers.length > 0) {
      teamContainer.innerHTML = `
        <div class="team-grid">
          ${activeMembers.map(m => `
            <article class="team-card">
              <figure class="team-card__image">
                <img src="${getPrefix()}${m.image}" alt="${m.alt || m.name}" loading="lazy" decoding="async">
              </figure>
              <div class="team-card__content">
                <h3 class="team-card__name">${m.name}</h3>
                <span class="team-card__role">${m.role}</span>
                ${m.bio ? `<p class="team-card__bio">${m.bio}</p>` : ''}
              </div>
            </article>
          `).join('')}
        </div>
      `;
    } else {
      /* Introducción general y áreas principales cuando aún no hay perfiles individuales cargados */
      teamContainer.innerHTML = `
        <div class="team-intro-layout">
          <div class="team-intro__text">
            <h3 class="display-md">Una dirección multidisciplinaria orientada a resultados.</h3>
            <p class="lead">En Nexo conectamos la estrategia de negocio con la excelencia en diseño, producción audiovisual y pauta publicitaria. No trabajamos como proveedores aislados, sino como un equipo creativo integrado a la realidad comercial de tu marca.</p>
          </div>
          <div class="team-areas-grid">
            <div class="team-area-card">
              <span class="team-area__number">01</span>
              <h4>Estrategia & Dirección</h4>
              <p>Investigación de mercado, arquitectura de marca, posicionamiento y consultoría de comunicación.</p>
            </div>
            <div class="team-area-card">
              <span class="team-area__number">02</span>
              <h4>Creatividad & Copywriting</h4>
              <p>Conceptos de campaña, guiones audiovisuales, tono de voz y redacción publicitaria de alto impacto.</p>
            </div>
            <div class="team-area-card">
              <span class="team-area__number">03</span>
              <h4>Producción Audiovisual</h4>
              <p>Dirección fotográfica, rodaje, edición, motion graphics y formatos nativos para plataformas digitales.</p>
            </div>
            <div class="team-area-card">
              <span class="team-area__number">04</span>
              <h4>Diseño e Identidad</h4>
              <p>Sistemas visuales, empaques, dirección de arte digital e interfaces web enfocadas en conversión.</p>
            </div>
            <div class="team-area-card">
              <span class="team-area__number">05</span>
              <h4>Publicidad Digital</h4>
              <p>Gestión estratégica de campañas en Meta Ads y Google Ads enfocada en rendimiento y optimización de presupuesto.</p>
            </div>
          </div>
        </div>
      `;
    }
  };
  renderTeam();

  /* Floating WhatsApp Button (`initFloatingWhatsApp`) */
  const initFloatingWhatsApp = () => {
    const floatingBtn = qs('.floating-whatsapp');
    if (!floatingBtn) return;
    const footer = qs('.site-footer');
    const finalCtaNode = qs('.final-cta');

    const updateFloating = () => {
      const scrollY = window.scrollY;
      const triggerTop = window.innerHeight * 0.22;
      let hideNearBottom = false;
      
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        if (footerRect.top < window.innerHeight + 80) hideNearBottom = true;
      }
      if (finalCtaNode) {
        const ctaRect = finalCtaNode.getBoundingClientRect();
        if (ctaRect.top < window.innerHeight - 20 && ctaRect.bottom > 0) hideNearBottom = true;
      }

      const shouldShow = scrollY > triggerTop && !hideNearBottom;
      floatingBtn.classList.toggle('is-visible', shouldShow);
    };

    updateFloating();
    window.addEventListener('scroll', updateFloating, { passive: true });
  };
  initFloatingWhatsApp();

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
