/* Memorias: visible en cada nueva visita a la portada.
   Si está abierta la invitación principal, se presenta después de cerrarla. */
(() => {
  'use strict';

  function init() {
    const popup = document.getElementById('ipetMemoriasPopup');
    const close = document.getElementById('ipetMemoriasPopupClose');
    if (!popup || !close) return;

    let dismissed = false;
    let opened = false;
    let showTimer;

    const invitationIsOpen = () => document.getElementById('baileOverlay')?.classList.contains('baile-overlay--visible') === true;

    function show() {
      if (dismissed || opened || invitationIsOpen()) return;
      opened = true;
      popup.classList.remove('ipet-popup--hide');
      popup.classList.add('ipet-popup--visible');
    }

    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      clearTimeout(showTimer);
      popup.classList.remove('ipet-popup--visible');
      popup.classList.add('ipet-popup--hide');
      if (popup.contains(document.activeElement)) document.activeElement.blur();
      window.setTimeout(() => popup.remove(), 260);
    }

    close.addEventListener('click', dismiss);
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && popup.classList.contains('ipet-popup--visible')) dismiss();
    });

    // No guardamos una pausa de 24 horas: la novedad se puede ver siempre al volver.
    // El evento lo envía el cierre del modal de invitación, que está por encima de los avisos.
    document.addEventListener('ipet:baile-cerrado', () => window.setTimeout(show, 180));
    showTimer = window.setTimeout(show, 750);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
