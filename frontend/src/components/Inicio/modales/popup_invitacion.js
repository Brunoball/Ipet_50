// scripts/popup_invitacion.js
// scripts/popup_invitacion.js

// =====================================================
// MODAL CENTRAL: INVITACIÓN BAILE BOMBEROS
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('baileOverlay');
  const closeBt = document.getElementById('baileClose');

  if (!overlay || !closeBt) {
    console.warn('No se encontró el modal baileOverlay o baileClose');
    return;
  }

  let cerradoEnEstaCarga = false;

  const abrirModalBaile = () => {
    if (cerradoEnEstaCarga) return;

    overlay.classList.add('baile-overlay--visible');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('baile-modal-abierto');
  };

  const cerrarModalBaile = () => {
    cerradoEnEstaCarga = true;

    // Evitar aria-hidden sobre el botón que conserva el foco al cerrar el modal.
    if (overlay.contains(document.activeElement)) document.activeElement.blur();
    overlay.classList.remove('baile-overlay--visible');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('baile-modal-abierto');
  };

  // Mostrar al entrar a la página principal
  setTimeout(abrirModalBaile, 300);

  // Cerrar solamente con la X
  closeBt.addEventListener('click', cerrarModalBaile);

  // Cerrar con ESC también
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('baile-overlay--visible')) {
      cerrarModalBaile();
    }
  });
});


// =====================================================
// POPUP TESTIMONIOS
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
  const popup   = document.getElementById('ipetPopup');
  const closeBt = document.getElementById('ipetPopupClose');
  if (!popup) return;

  popup.hidden = false;
  popup.classList.remove('ipet-popup--hide');

  setTimeout(() => popup.classList.add('ipet-popup--visible'), 30);

  const closePopup = () => {
    popup.classList.remove('ipet-popup--visible');
    popup.classList.add('ipet-popup--hide');
    setTimeout(() => popup.remove(), 220);
  };

  if (closeBt) closeBt.addEventListener('click', closePopup);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popup.isConnected) closePopup();
  });
});


// =====================================================
// POPUP INSCRIPCIÓN MESAS DE EXAMEN
// La API decide si está abierto. Nunca mostrarlo por un temporizador.
// =====================================================
(function () {
  const mesas = document.getElementById('ipetPopupMesas');
  const close = document.getElementById('ipetPopupMesasClose');
  const testimonios = document.getElementById('ipetPopup');
  const testimoniosClose = document.getElementById('ipetPopupClose');
  if (!mesas) return;

  let closingTimer = null;
  const updateStack = () => {
    const visible = testimonios &&
      testimonios.classList.contains('ipet-popup--visible') &&
      !testimonios.classList.contains('ipet-popup--hide');
    const alto = visible ? (testimonios.offsetHeight || 0) : 0;
    mesas.style.setProperty('--stack-offset', visible
      ? `calc(${alto}px + var(--ipet-stack-gap, 12px))` : '0px');
  };

  function hide(immediate = false) {
    if (closingTimer) clearTimeout(closingTimer);
    if (mesas.contains(document.activeElement)) document.activeElement.blur();
    if (immediate || mesas.style.display === 'none') {
      mesas.classList.remove('ipet-popup-mesas--visible', 'ipet-popup-mesas--hide');
      mesas.style.display = 'none';
      return;
    }
    mesas.classList.add('ipet-popup-mesas--hide');
    closingTimer = setTimeout(() => {
      mesas.classList.remove('ipet-popup-mesas--visible', 'ipet-popup-mesas--hide');
      mesas.style.display = 'none';
      closingTimer = null;
    }, 250);
  }

  function show() {
    if (sessionStorage.getItem('mesasCerrado')) return;
    if (closingTimer) clearTimeout(closingTimer);
    mesas.style.display = 'block';
    mesas.classList.remove('ipet-popup-mesas--hide');
    mesas.classList.add('ipet-popup-mesas--visible');
    updateStack();
  }

  // Se escucha antes de recibir la respuesta fetch de index.html.
  window.addEventListener('ipet:mesas-estado', event => {
    if (event.detail?.visible === true) show();
    else hide(true);
  });
  close?.addEventListener('click', () => {
    sessionStorage.setItem('mesasCerrado', '1');
    hide();
  });
  testimoniosClose?.addEventListener('click', () => setTimeout(updateStack, 260));
  if (testimonios && 'MutationObserver' in window) {
    new MutationObserver(updateStack).observe(testimonios, {
      attributes: true, attributeFilter: ['class']
    });
  }
  window.addEventListener('resize', updateStack);
  hide(true); // El popup permanece oculto hasta que la API informe 'visible': true.
})();
