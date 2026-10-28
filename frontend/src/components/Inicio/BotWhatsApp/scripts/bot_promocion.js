/* Presentación del bot, independiente de otros modales y avisos de la portada. */
(() => {
  'use strict';

  // CONFIGURACIÓN: colocar solo el número REAL del bot, con código de país, sin '+' ni espacios.
  // Ejemplo de formato (NO es un contacto real): 549XXXXXXXXXX
  // Nunca usar aquí el teléfono de secretaría salvo que también sea el número del bot.
  const BOT_WHATSAPP_NUMBER = '';

  function init() {
    const overlay = document.getElementById('ipetBotOverlay');
    const dialog = overlay?.querySelector('.ipet-bot-dialog');
    const close = document.getElementById('ipetBotClose');
    const triggers = document.querySelectorAll('[data-ipet-bot-open]');
    const video = document.getElementById('ipetBotVideo');
    const videoPlaceholder = document.getElementById('ipetBotVideoPlaceholder');
    const videoToggle = document.getElementById('ipetBotVideoToggle');
    const videoPlaceholderMessage = videoPlaceholder?.querySelector('p');
    const videoPlaceholderStatus = videoPlaceholder?.querySelector('.ipet-bot-video__status');
    const launch = document.getElementById('ipetBotWhatsAppLink');
    const missing = document.getElementById('ipetBotLinkMissing');
    if (!overlay || !dialog || !close || !triggers.length || !video || !videoToggle || !videoPlaceholder || !launch || !missing) return;

    let returnFocus = null;
    let hideTimer = 0;
    const transitionMs = 230;
    const isOpen = () => !overlay.hidden;
    let videoInitialized = false;

    // Volvemos a habilitar los controles nativos (progreso, volumen y pantalla
    // completa), sin reemplazar el botón personalizado de reproducir/pausar.
    video.controls = true;
    function syncVideoButton() {
      const playing = !video.hidden && !video.paused && !video.ended;
      videoToggle.hidden = video.hidden;
      videoToggle.classList.toggle('is-playing', playing);
      const icon = videoToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-play', !playing);
        icon.classList.toggle('fa-pause', playing);
      }
      videoToggle.setAttribute('aria-label', video.ended ? 'Repetir el video' : playing ? 'Pausar el video' : 'Reproducir el video');
    }
    function togglePlayback() {
      if (video.hidden) return;
      if (!video.paused && !video.ended) {
        video.pause();
        return;
      }
      if (video.ended) video.currentTime = 0;
      video.play().catch(syncVideoButton);
    }
    videoToggle.addEventListener('click', togglePlayback);
    // Evitamos capturar clics/teclas sobre el video: los controles HTML5 deben
    // manejar el avance, el volumen y el play/pausa sin ejecuciones duplicadas.
    ['play', 'pause', 'ended'].forEach(name => video.addEventListener(name, syncVideoButton));

    // El reproductor se habilita sólo si existe el MP4. El diseño no muestra un video roto.
    video.addEventListener('loadedmetadata', () => {
      video.hidden = false;
      videoPlaceholder.hidden = true;
      syncVideoButton();
    });
    video.addEventListener('error', () => {
      video.hidden = true;
      videoToggle.hidden = true;
      videoPlaceholder.hidden = false;
      if (videoPlaceholderMessage) videoPlaceholderMessage.textContent = 'No se pudo cargar el tutorial. Revisá que el archivo esté publicado en public/video/tutorial_bot.mp4.';
      if (videoPlaceholderStatus) videoPlaceholderStatus.textContent = 'Video no disponible';
    });

    const phone = BOT_WHATSAPP_NUMBER.trim();
    if (/^\d{10,15}$/.test(phone)) {
      launch.href = 'https://wa.me/' + phone + '?text=' + encodeURIComponent('Hola, quiero conocer las opciones de la Cooperadora del IPET 50.');
      launch.hidden = false;
      missing.hidden = true;
    } else {
      launch.removeAttribute('href');
      launch.hidden = true;
      missing.hidden = false;
    }

    function open(event) {
      if (isOpen()) return;
      if (event?.currentTarget instanceof HTMLElement) returnFocus = event.currentTarget;
      clearTimeout(hideTimer);
      overlay.hidden = false;
      document.body.classList.add('ipet-bot-modal-open');
      requestAnimationFrame(() => overlay.classList.add('is-visible'));
      close.focus({ preventScroll: true });
      // Cargar el video solamente la primera vez que se abre el modal.
      if (!videoInitialized && video.dataset.src) {
        videoInitialized = true;
        video.src = video.dataset.src;
        video.load();
      }
    }

    function dismiss() {
      if (!isOpen()) return;
      overlay.classList.remove('is-visible');
      document.body.classList.remove('ipet-bot-modal-open');
      video.pause();
      // Sacamos el foco antes de aplicar hidden para no dejarlo en un elemento oculto.
      if (returnFocus?.isConnected && !returnFocus.closest('[hidden]')) returnFocus.focus({ preventScroll: true });
      else document.activeElement?.blur();
      hideTimer = window.setTimeout(() => { overlay.hidden = true; }, transitionMs);
    }

    triggers.forEach(button => button.addEventListener('click', open));
    close.addEventListener('click', dismiss);
    // Como los demás modales del proyecto: solo cerrar con X o Escape.
    document.addEventListener('keydown', event => {
      if (!isOpen() || overlay.hidden) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        dismiss();
      } else if (event.key === 'Tab') {
        const visibleFocusables = Array.from(dialog.querySelectorAll('button:not([disabled]):not([hidden]), a[href]:not([hidden])'))
          .filter(el => el.getClientRects().length);
        if (!visibleFocusables.length) return;
        const first = visibleFocusables[0];
        const last = visibleFocusables[visibleFocusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
