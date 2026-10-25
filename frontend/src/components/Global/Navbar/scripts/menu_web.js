// Menú principal: apertura discreta, accesible y sin recorte circular.
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // Portada: menú lateral autónomo; las páginas internas conservan su navegación.
  if (document.body.classList.contains('ipet-inicio')) {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');
    const backdrop = document.getElementById('navBackdrop');
    const more = document.getElementById('moreBtn');
    const submenu = document.getElementById('subMenu');
    const header = toggle?.closest('header');
    if (!toggle || !menu) return;

    const small = window.matchMedia('(max-width: 930px)');
    let open = false;

    const syncHeaderHeight = () => {
      if (header) document.documentElement.style.setProperty('--ipet-header-height', `${Math.round(header.getBoundingClientRect().height)}px`);
    };

    const changeSubmenu = (expand) => {
      if (!submenu || !more) return;
      const value = Boolean(expand && small.matches && open);
      if (value) submenu.style.setProperty('--ipet-submenu-height', `${submenu.scrollHeight}px`);
      submenu.classList.toggle('open', value);
      more.classList.toggle('open', value);
      more.setAttribute('aria-expanded', String(value));
    };

    const changeMenu = (expand, returnFocus = false) => {
      open = Boolean(expand && small.matches);
      if (!open) changeSubmenu(false);
      menu.classList.toggle('open', open);
      toggle.classList.toggle('open', open);
      backdrop?.classList.toggle('open', open);
      document.body.classList.toggle('nav-mobile-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      menu.inert = small.matches && !open;
      menu.setAttribute('aria-hidden', String(small.matches && !open));
      if (returnFocus && !open) toggle.focus();
    };

    const updateResponsive = () => {
      syncHeaderHeight();
      if (!small.matches) changeMenu(false);
      else {
        menu.inert = !open;
        menu.setAttribute('aria-hidden', String(!open));
        if (submenu?.classList.contains('open')) submenu.style.setProperty('--ipet-submenu-height', `${submenu.scrollHeight}px`);
      }
    };

    toggle.setAttribute('aria-controls', 'navMenu');
    toggle.addEventListener('click', () => changeMenu(!open));
    more?.addEventListener('click', event => {
      if (!small.matches) return;
      event.preventDefault();
      changeSubmenu(!submenu?.classList.contains('open'));
    });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      if (small.matches) changeMenu(false);
    }));
    backdrop?.addEventListener('click', () => changeMenu(false));
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || !open) return;
      event.preventDefault();
      changeMenu(false, true);
    });

    window.addEventListener('resize', updateResponsive, { passive: true });
    small.addEventListener('change', updateResponsive);
    if (header && 'ResizeObserver' in window) new ResizeObserver(syncHeaderHeight).observe(header);
    updateResponsive();
    return;
  }

  // El mismo panel lateral de la portada, adaptado a todos los headers internos.
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  if (!toggle || !menu) return;

  const backdrop = document.getElementById('navBackdrop');
  const more = document.getElementById('moreBtn');
  const submenu = document.getElementById('subMenu');
  // En Especialidades el header contiene el hero; medimos solo la barra fija.
  const menuBar = toggle.closest('.menu-container-header') || toggle.closest('header');
  const mobile = window.matchMedia('(max-width: 996px)');
  let isOpen = false;

  const measureMenuTop = () => {
    if (!menuBar) return;
    const bottom = Math.max(0, Math.round(menuBar.getBoundingClientRect().bottom));
    document.documentElement.style.setProperty('--ipet-shared-menu-top', `${bottom}px`);
  };

  const setSubmenu = (expand) => {
    if (!submenu || !more) return;
    const show = Boolean(expand && isOpen && mobile.matches);
    if (show) submenu.style.setProperty('--ipet-submenu-height', `${submenu.scrollHeight}px`);
    submenu.classList.toggle('open', show);
    more.classList.toggle('open', show);
    more.setAttribute('aria-expanded', String(show));
  };

  const setMenu = (expand, restoreFocus = false) => {
    isOpen = Boolean(expand && mobile.matches);
    if (!isOpen) setSubmenu(false);
    if (isOpen) measureMenuTop();
    menu.classList.toggle('open', isOpen);
    toggle.classList.toggle('open', isOpen);
    backdrop?.classList.toggle('open', isOpen);
    document.body.classList.toggle('nav-mobile-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
    menu.inert = mobile.matches && !isOpen;
    menu.setAttribute('aria-hidden', String(mobile.matches && !isOpen));
    if (!isOpen) menu.scrollTop = 0;
    if (restoreFocus && !isOpen) toggle.focus();
  };

  const syncResponsive = () => {
    measureMenuTop();
    if (!mobile.matches) setMenu(false);
    else {
      menu.inert = !isOpen;
      menu.setAttribute('aria-hidden', String(!isOpen));
      if (submenu?.classList.contains('open')) {
        submenu.style.setProperty('--ipet-submenu-height', `${submenu.scrollHeight}px`);
      }
    }
  };

  toggle.setAttribute('aria-controls', 'navMenu');
  toggle.setAttribute('aria-expanded', 'false');
  more?.setAttribute('aria-controls', 'subMenu');
  more?.setAttribute('aria-expanded', 'false');
  toggle.addEventListener('click', () => setMenu(!isOpen));
  more?.addEventListener('click', event => {
    if (!mobile.matches) return;
    event.preventDefault();
    setSubmenu(!submenu?.classList.contains('open'));
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    if (mobile.matches) setMenu(false);
  }));
  backdrop?.addEventListener('click', () => setMenu(false));
  document.addEventListener('pointerdown', event => {
    if (!isOpen || !mobile.matches) return;
    if (!menu.contains(event.target) && !toggle.contains(event.target)) setMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !isOpen) return;
    event.preventDefault();
    setMenu(false, true);
  });
  window.addEventListener('resize', syncResponsive, { passive: true });
  mobile.addEventListener('change', syncResponsive);
  if (menuBar && 'ResizeObserver' in window) new ResizeObserver(syncResponsive).observe(menuBar);
  syncResponsive();
});

/* ============================
   CARRUSEL DE TESTIMONIOS
   - Blindado: no corre si no existe
============================ */
document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('testimonialTrack');
  if (!track) return; // sección testimonios comentada: no hay nada que hacer

  // Duplicar tarjetas una sola vez
  if (!track.dataset.cloned) {
    const originalCards = Array.from(track.children);
    if (!originalCards.length) return;

    originalCards.forEach(card => track.appendChild(card.cloneNode(true)));
    track.dataset.cloned = '1';
  }

  // Esperar layout
  setTimeout(() => {
    const cards = track.querySelectorAll('.testimonial-card');
    const first = cards[0];
    if (!first) return;

    const styleFirst = getComputedStyle(first);
    const cardWidth  = first.offsetWidth || 0;
    const gap        = parseInt(styleFirst.marginRight || '30', 10);
    const totalCards = cards.length;
    const totalWidth = totalCards * (cardWidth + gap);
    const scrollDuration = Math.max(10, totalWidth / 100); // mínimo 10s

    // Inyectar keyframes dinámicos
    const style = document.createElement('style');
    style.textContent = `
      @keyframes scrollDynamic {
        0%   { transform: translateX(0); }
        100% { transform: translateX(-${Math.floor(totalWidth / 2)}px); }
      }
      .testimonial-track.animate { animation: scrollDynamic ${scrollDuration}s linear infinite; }
      .testimonial-track.paused  { animation-play-state: paused; }
    `;
    document.head.appendChild(style);

    // Activar animación
    track.classList.add('animate');

    // Pausar al hacer hover
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => track.classList.add('paused'));
      card.addEventListener('mouseleave', () => track.classList.remove('paused'));
    });
  }, 100);
});
