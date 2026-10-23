document.addEventListener('DOMContentLoaded', function () {
  const hamburger   = document.querySelector('.hamburger');
  const navLinks    = document.querySelector('.nav-links');
  const menuOverlay = document.querySelector('.menu-overlay');
  const navItems    = document.querySelectorAll('.nav-link, .contact-btn'); // enlaces del menú

  // Si faltan elementos clave, salimos sin romper
  if (!hamburger || !navLinks) return;

  // --- Helpers de estado ---
  let enabled = false; // si los listeners están activos en <1000px
  const mql = window.matchMedia('(max-width: 1000px)');

  // --- Handlers nombrados (para poder removerlos al desactivar) ---
  function closeMenu() {
    hamburger.classList.remove('active');
    navLinks.classList.remove('active');
    if (menuOverlay) menuOverlay.classList.remove('active');
    document.body.classList.remove('menu-open');
  }

  function onHamburgerClick(e) {
    e.stopPropagation();
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
    if (menuOverlay) menuOverlay.classList.toggle('active');
    document.body.classList.toggle('menu-open');
  }

  function onOverlayClick() {
    closeMenu();
  }

  function onNavItemClick() {
    if (navLinks.classList.contains('active')) {
      closeMenu();
    }
  }

  function onDocumentClick(e) {
    // Opcional: cerrar al hacer click fuera del menú
    if (!navLinks.contains(e.target) && !hamburger.contains(e.target) && navLinks.classList.contains('active')) {
      closeMenu();
    }
  }

  // --- Activar/Desactivar según media query ---
  function enableMobileMenu() {
    if (enabled) return;
    enabled = true;

    hamburger.addEventListener('click', onHamburgerClick);
    if (menuOverlay) menuOverlay.addEventListener('click', onOverlayClick);
    navItems.forEach(item => item.addEventListener('click', onNavItemClick));
    document.addEventListener('click', onDocumentClick);
  }

  function disableMobileMenu() {
    if (!enabled) return;
    enabled = false;

    // Cerrar por las dudas
    closeMenu();

    // Remover listeners
    hamburger.removeEventListener('click', onHamburgerClick);
    if (menuOverlay) menuOverlay.removeEventListener('click', onOverlayClick);
    navItems.forEach(item => item.removeEventListener('click', onNavItemClick));
    document.removeEventListener('click', onDocumentClick);
  }

  function applyByViewport() {
    if (mql.matches) {
      enableMobileMenu();
    } else {
      disableMobileMenu();
    }
  }

  // Inicial y cambios de tamaño
  applyByViewport();
  // Para navegadores modernos:
  mql.addEventListener('change', applyByViewport);
  // (si necesitás compatibilidad antigua: mql.addListener(applyByViewport))
});
