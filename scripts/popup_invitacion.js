// scripts/popup_invitacion.js
document.addEventListener('DOMContentLoaded', () => {
  const popup   = document.getElementById('ipetPopup');
  const closeBt = document.getElementById('ipetPopupClose');
  if (!popup) return;

  // mostrar SIEMPRE
  popup.hidden = false;                    // por si vino con hidden
  popup.classList.remove('ipet-popup--hide');
  // usar la misma BEM que en el CSS/HTML:
  setTimeout(() => popup.classList.add('ipet-popup--visible'), 30);

  const closePopup = () => {
    popup.classList.remove('ipet-popup--visible');
    popup.classList.add('ipet-popup--hide');
    // si querés que desaparezca del DOM tras la animación:
    setTimeout(() => popup.remove(), 220);
  };

  if (closeBt) closeBt.addEventListener('click', closePopup);

  // Cerrar al clicar fuera de la tarjeta
  popup.addEventListener('click', (e) => {
    const card = popup.querySelector('.ipet-popup__card') || popup;
    if (card && !card.contains(e.target)) closePopup();
  });

  // ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popup.isConnected) closePopup();
  });
});
