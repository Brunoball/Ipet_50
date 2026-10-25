/* Aviso de la nueva sección de Memorias. Exclusivo de index.html. */
(() => {
  'use strict';

  const showPopup = () => {
    const popup = document.getElementById('ipetMemoriasPopup');
    const close = document.getElementById('ipetMemoriasPopupClose');
    if (!popup || !close) return;

    const key = 'ipet50_popup_memorias_index_closed_until';
    const hoursToHide = 24;
    let closedUntil = 0;
    try {
      closedUntil = Number(window.localStorage.getItem(key) || 0);
    } catch (_) { /* Navegación sin almacenamiento local: funciona igualmente. */ }

    if (Date.now() < closedUntil) {
      popup.remove();
      return;
    }

    let closed = false;
    const hide = () => {
      if (closed) return;
      closed = true;
      popup.classList.remove('ipet-popup--visible');
      popup.classList.add('ipet-popup--hide');
      try {
        window.localStorage.setItem(key, String(Date.now() + hoursToHide * 60 * 60 * 1000));
      } catch (_) { /* No bloquear el cierre si storage está deshabilitado. */ }
      if (popup.contains(document.activeElement)) close.blur();
      window.setTimeout(() => popup.remove(), 250);
    };

    close.addEventListener('click', hide);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && popup.classList.contains('ipet-popup--visible')) hide();
    });

    window.setTimeout(() => {
      if (!closed && popup.isConnected) popup.classList.add('ipet-popup--visible');
    }, 500);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showPopup, { once: true });
  } else {
    showPopup();
  }
})();
