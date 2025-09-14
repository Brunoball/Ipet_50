// scripts/popup_invitacion.js
document.addEventListener('DOMContentLoaded', () => {
  const popup   = document.getElementById('ipetInvite');
  const closeBt = document.getElementById('ipetInviteClose');
  if (!popup) return;

  const KEY_SHOWN      = 'ipet50_invite_shown_session';      // ya se mostró en esta sesión
  const KEY_DISMISSED  = 'ipet50_invite_dismissed_session';  // el usuario lo cerró en esta sesión

  const alreadyShown   = sessionStorage.getItem(KEY_SHOWN) === '1';
  const alreadyClosed  = sessionStorage.getItem(KEY_DISMISSED) === '1';

  // Mostrar SOLO si aún no se mostró y no está descartado en esta sesión
  if (!alreadyShown && !alreadyClosed) {
    popup.hidden = false;
    // marcamos como "mostrado" para no repetir en otras páginas durante esta sesión
    sessionStorage.setItem(KEY_SHOWN, '1');
    // animación de entrada
    setTimeout(() => popup.classList.add('invite-popup--visible'), 30);
  }

  const closePopup = () => {
    popup.classList.remove('invite-popup--visible');
    popup.classList.add('invite-popup--hide');

    // marcar como descartado para toda la sesión
    sessionStorage.setItem(KEY_DISMISSED, '1');

    setTimeout(() => {
      if (popup && popup.parentNode) popup.parentNode.removeChild(popup);
    }, 220);
  };

  // Botón cerrar
  if (closeBt) closeBt.addEventListener('click', closePopup);

  // Cerrar al clickear fuera de la tarjeta (backdrop)
  popup.addEventListener('click', (e) => {
    const card = popup.querySelector('.invite-popup__card');
    if (card && !card.contains(e.target)) closePopup();
  });

  // Cerrar con ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popup.isConnected) closePopup();
  });
});
