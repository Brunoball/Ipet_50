// boton_arriba.js
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // Botón actual (según tu HTML)
  const backToTop = document.getElementById('backToTop');
  // Soporte opcional para un id legado ("top") si existiera en otras páginas
  const legacyTop = document.getElementById('top');

  // Si no existe ninguno, no hacemos nada en esta página
  if (!backToTop && !legacyTop) {
    console.warn('[BackToTop] No se encontró #backToTop ni #top en esta página.');
    return;
  }

  // Umbral de aparición (tu código usaba 100px; mantenemos ese valor)
  const THRESHOLD = 100;

  // Mostrar/ocultar con una sola función
  const toggleVisibility = () => {
    const show = window.scrollY > THRESHOLD;

    // Botón nuevo con clase .active (controlás visibilidad desde CSS)
    if (backToTop) {
      backToTop.classList.toggle('active', show);
      // Si además querés forzar interacción/visibilidad sin depender solo de CSS:
      backToTop.style.pointerEvents = show ? 'auto' : 'none';
      backToTop.style.opacity = backToTop.classList.contains('active') ? backToTop.style.opacity : backToTop.style.opacity;
      // (Las dos líneas de arriba son opcionales; dejalas si tu CSS no maneja pointer-events)
    }

    // Botón legado que usa display block/none
    if (legacyTop) {
      legacyTop.style.display = show ? 'block' : 'none';
    }
  };

  // Estado inicial
  toggleVisibility();

  // Scroll (una sola escucha, passive para mejor rendimiento)
  window.addEventListener('scroll', toggleVisibility, { passive: true });

  // Click (scroll suave hacia arriba)
  const onClickScrollTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (backToTop) {
    backToTop.addEventListener('click', onClickScrollTop);
  }
  if (legacyTop) {
    legacyTop.addEventListener('click', onClickScrollTop);
  }
});









//seccion de funcionamiento tarjetas especialidades
document.addEventListener('DOMContentLoaded', function () {
    const mediaQuery = window.matchMedia("(max-width: 980px)");
    let cards; // Referencia a las tarjetas
    let isMobileMode = false; // Indica si estamos en modo móvil

    function manejarClick(card) {
        return function () {
            // Desvoltea otras tarjetas si están volteadas
            cards.forEach(otherCard => {
                if (otherCard !== card && otherCard.classList.contains('is-flipped')) {
                    otherCard.classList.remove('is-flipped');
                    otherCard.querySelector('.front').style.transform = 'rotateY(0deg)';
                    otherCard.querySelector('.back').style.transform = 'rotateY(180deg)';
                }
            });

            // Toggle de la clase is-flipped en la tarjeta actual
            card.classList.toggle('is-flipped');

            // Aplicar transformaciones basadas en el estado volteado
            const frontFace = card.querySelector('.front');
            const backFace = card.querySelector('.back');
            const isFlipped = card.classList.contains('is-flipped');

            if (isFlipped) {
                frontFace.style.transform = 'rotateY(180deg)';
                backFace.style.transform = 'rotateY(360deg)';
            } else {
                frontFace.style.transform = 'rotateY(0deg)';
                backFace.style.transform = 'rotateY(180deg)';
            }
        };
    }

    function habilitarModoMovil() {
        if (!isMobileMode) {
            isMobileMode = true;
            cards = document.querySelectorAll('.card');

            cards.forEach(card => {
                // Agregar eventos de clic a cada tarjeta
                card.addEventListener('click', manejarClick(card));
            });

            console.log("Modo móvil activado.");
        }
    }

    function deshabilitarModoMovil() {
        if (isMobileMode) {
            isMobileMode = false;

            cards.forEach(card => {
                // Eliminar todos los eventos de clic de las tarjetas
                const newCard = card.cloneNode(true);
                card.parentNode.replaceChild(newCard, card);
            });

            console.log("Modo móvil desactivado.");
        }
    }

    function manejarCambio(evento) {
        if (evento.matches) {
            habilitarModoMovil();
        } else {
            deshabilitarModoMovil();
        }
    }

    // Ejecutar al cargar la página
    manejarCambio(mediaQuery);

    // Escuchar cambios en el tamaño de la pantalla
    mediaQuery.addEventListener('change', manejarCambio);
});








