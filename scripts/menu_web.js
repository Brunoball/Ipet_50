// scripts/menu_web.js
'use strict';

/* ============================
   MENÚ RESPONSIVE / SUBMENÚ
============================ */
document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.getElementById('navToggle');
  const navMenu   = document.getElementById('navMenu');
  const moreBtn   = document.getElementById('moreBtn');
  const subMenu   = document.getElementById('subMenu');
  const navLinks  = document.querySelectorAll('.nav-link');

  // Toggle del menú hamburguesa
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('open');
      if (navMenu) navMenu.classList.toggle('open');

      // Cerrar submenú si está abierto
      if (subMenu && subMenu.classList.contains('open')) {
        if (moreBtn) moreBtn.classList.remove('open');
        subMenu.classList.remove('open');
      }
    });
  }

  // Toggle del submenu (solo <= 930px)
  if (moreBtn) {
    moreBtn.addEventListener('click', (e) => {
      if (window.innerWidth <= 930) {
        e.preventDefault();
        e.stopPropagation();
        moreBtn.classList.toggle('open');
        if (subMenu) subMenu.classList.toggle('open');
      }
    });
  }

  // Cerrar menú al hacer clic en cualquier enlace (modo móvil)
  if (navLinks && navLinks.length) {
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 930) {
          if (navToggle) navToggle.classList.remove('open');
          if (navMenu)   navMenu.classList.remove('open');
          if (moreBtn)   moreBtn.classList.remove('open');
          if (subMenu)   subMenu.classList.remove('open');
        }
      });
    });
  }

  // Cerrar el menú al hacer clic fuera (solo móvil)
  document.addEventListener('click', (e) => {
    if (window.innerWidth > 930) return;

    const clickEnMenu   = navMenu   && navMenu.contains(e.target);
    const clickEnToggle = navToggle && navToggle.contains(e.target);
    const isClickInside = !!(clickEnMenu || clickEnToggle);

    if (!isClickInside && navMenu && navMenu.classList.contains('open')) {
      if (navToggle) navToggle.classList.remove('open');
      navMenu.classList.remove('open');
      if (moreBtn) moreBtn.classList.remove('open');
      if (subMenu) subMenu.classList.remove('open');
    }
  });

  // Resetear menú al agrandar ventana
  window.addEventListener('resize', () => {
    if (window.innerWidth > 930) {
      if (navToggle) navToggle.classList.remove('open');
      if (navMenu)   navMenu.classList.remove('open');
      if (moreBtn)   moreBtn.classList.remove('open');
      if (subMenu)   subMenu.classList.remove('open');
    }
  });
});


/* ============================
   POPUP (bloqueo 24h)
   - Dejar UNA sola lógica
============================ */
document.addEventListener('DOMContentLoaded', () => {
  const popup    = document.getElementById('ipetPopup');
  const btnClose = document.getElementById('ipetPopupClose');
  if (!popup) return; // si no existe el popup en esta página, salgo

  const KEY = 'ipet50_popup_testimonios_closed_until'; // timestamp límite
  const HOURS_TO_HIDE = 24;

  const now = Date.now();
  const stored = Number(localStorage.getItem(KEY) || 0);
  const isBlocked = stored && now < stored;

  // Mostrar sólo si NO está bloqueado
  if (!isBlocked) {
    setTimeout(() => popup.classList.add('ipet-popup--visible'), 500);
  }

  // Cerrar y bloquear por X horas
  if (btnClose) {
    btnClose.addEventListener('click', () => {
      popup.classList.remove('ipet-popup--visible');
      popup.classList.add('ipet-popup--hide');

      const until = now + HOURS_TO_HIDE * 60 * 60 * 1000;
      localStorage.setItem(KEY, String(until));

      setTimeout(() => {
        if (popup && popup.parentNode) popup.parentNode.removeChild(popup);
      }, 220);
    });
  }

  // Accesibilidad: cerrar con ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popup.classList.contains('ipet-popup--visible')) {
      if (btnClose) btnClose.click();
    }
  });
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
