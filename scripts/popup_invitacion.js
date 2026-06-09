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
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
  const ID_MESAS        = 'ipetPopupMesas';
  const ID_MESAS_CLOSE  = 'ipetPopupMesasClose';
  const ID_MESAS_CTA    = 'ipetMesasCTA';
  const ID_TEST         = 'ipetPopup';
  const ID_TEST_CLOSE   = 'ipetPopupClose';

  const $mesas = document.getElementById(ID_MESAS);
  const $test  = document.getElementById(ID_TEST);

  if (!$mesas) return;

  const showMesas = () => {
    $mesas.style.display = 'block';
    $mesas.classList.remove('ipet-popup-mesas--hide');
    $mesas.classList.add('ipet-popup-mesas--visible');
  };

  const hideMesas = () => {
    $mesas.classList.add('ipet-popup-mesas--hide');

    setTimeout(() => {
      $mesas.classList.remove('ipet-popup-mesas--visible', 'ipet-popup-mesas--hide');
      $mesas.style.display = 'none';
    }, 250);
  };

  const updateStack = () => {
    if (
      $test &&
      $test.classList.contains('ipet-popup--visible') &&
      !$test.classList.contains('ipet-popup--hide')
    ) {
      const h = $test.offsetHeight || 0;
      $mesas.style.setProperty('--stack-offset', `calc(${h}px + var(--ipet-stack-gap, 12px))`);
    } else {
      $mesas.style.setProperty('--stack-offset', `0px`);
    }
  };

  setTimeout(() => {
    showMesas();
    updateStack();
  }, 800);

  const $close = document.getElementById(ID_MESAS_CLOSE);
  if ($close) $close.addEventListener('click', hideMesas);

  const $cta = document.getElementById(ID_MESAS_CTA);
  if ($cta) {
    $cta.addEventListener('click', () => {});
  }

  const $testClose = document.getElementById(ID_TEST_CLOSE);
  if ($testClose) {
    $testClose.addEventListener('click', () => setTimeout(updateStack, 260));
  }

  if ($test && 'MutationObserver' in window) {
    const mo = new MutationObserver(updateStack);
    mo.observe($test, { attributes: true, attributeFilter: ['class'] });
  }

  window.addEventListener('resize', updateStack);
});





//FUNCION POPUP DE INCRIPCION MESAS EXAMEN
// POPUP: Inscripción Mesas de Examen
(function () {
  const ID_MESAS        = 'ipetPopupMesas';
  const ID_MESAS_CLOSE  = 'ipetPopupMesasClose';
  const ID_MESAS_CTA    = 'ipetMesasCTA';
  const ID_TEST         = 'ipetPopup';
  const ID_TEST_CLOSE   = 'ipetPopupClose';

  const $mesas = document.getElementById(ID_MESAS);
  const $test  = document.getElementById(ID_TEST);
  if (!$mesas) return;

  // ---- helpers show/hide ----
  const showMesas = () => {
    $mesas.classList.remove('ipet-popup-mesas--hide');
    $mesas.classList.add('ipet-popup-mesas--visible');
  };
  const hideMesas = () => {
    $mesas.classList.add('ipet-popup-mesas--hide');
    setTimeout(() => $mesas.classList.remove('ipet-popup-mesas--visible','ipet-popup-mesas--hide'), 250);
  };

  // ---- stacking dinámico con el popup de testimonios ----
  const updateStack = () => {
    if ($test && $test.classList.contains('ipet-popup--visible') && !$test.classList.contains('ipet-popup--hide')) {
      const h = $test.offsetHeight || 0;
      $mesas.style.setProperty('--stack-offset', `calc(${h}px + var(--ipet-stack-gap, 12px))`);
    } else {
      $mesas.style.setProperty('--stack-offset', `0px`);
    }
  };

  // Mostrar al cargar (pequeño delay)
  setTimeout(() => { showMesas(); updateStack(); }, 800);

  // Cerrar SOLO con la X (no con el CTA)
  const $close = document.getElementById(ID_MESAS_CLOSE);
  $close && $close.addEventListener('click', hideMesas);

  // No cerrar al hacer clic en el CTA
  const $cta = document.getElementById(ID_MESAS_CTA);
  if ($cta) {
    $cta.addEventListener('click', () => {
      // si en algún momento cambian target y navega en la misma pestaña,
      // al volver desde el historial lo vamos a re-mostrar (ver handlers abajo)
    });
  }

  // Si se cierra el popup de testimonios, recalcular stack (para que baje)
  const $testClose = document.getElementById(ID_TEST_CLOSE);
  $testClose && $testClose.addEventListener('click', () => setTimeout(updateStack, 260));

  // Observar cambios de clase en testimonios (por si se oculta de otra forma)
  if ($test && 'MutationObserver' in window) {
    const mo = new MutationObserver(updateStack);
    mo.observe($test, { attributes: true, attributeFilter: ['class'] });
  }

  // Recalcular en resize
  window.addEventListener('resize', updateStack);

  // Al volver con bfcache o cambiar visibilidad, forzar visible y actualizar stack
  const ensureVisible = () => { showMesas(); updateStack(); };
  window.addEventListener('pageshow', ensureVisible);          // vuelve del historial/bfcache
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') ensureVisible();
  });
})();

