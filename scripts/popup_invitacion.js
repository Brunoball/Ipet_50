// scripts/popup_invitacion.js (mostrar SIEMPRE en cada reload)
document.addEventListener('DOMContentLoaded', () => {
  const popup   = document.getElementById('ipetInvite');
  const closeBt = document.getElementById('ipetInviteClose');
  if (!popup) return;

  const KEY = 'ipet50_popup_invitacion_until';
  // Por si quedó algo de la versión anterior, lo borramos:
  localStorage.removeItem(KEY);

  // Mostrar siempre
  popup.hidden = false;
  setTimeout(() => popup.classList.add('invite-popup--visible'), 30);

  const closePopup = () => {
    popup.classList.remove('invite-popup--visible');
    popup.classList.add('invite-popup--hide');
    // NO guardamos nada en localStorage (para que reaparezca en cada reload)
    setTimeout(() => {
      if (popup && popup.parentNode) popup.parentNode.removeChild(popup);
    }, 220);
  };

  if (closeBt) closeBt.addEventListener('click', closePopup);

  // Click en el backdrop
  popup.addEventListener('click', (e) => {
    const card = e.currentTarget.querySelector('.invite-popup__card');
    if (!card.contains(e.target)) closePopup();
  });

  // ESC para cerrar
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popup && popup.isConnected) closePopup();
  });
});
