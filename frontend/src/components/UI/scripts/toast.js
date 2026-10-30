/* Notificaciones de la web IPET 50: adaptación sin React del Toast de LALCEC.
   Un solo aviso visible a la vez, con la misma posición, iconos y transiciones. */
(() => {
  'use strict';

  const ICONOS = {
    exito: 'fa-circle-check',
    error: 'fa-circle-xmark',
    advertencia: 'fa-triangle-exclamation',
    alerta: 'fa-triangle-exclamation',
    cargando: 'fa-spinner',
    info: 'fa-circle-info'
  };
  let actual = null;

  function quitar(instantaneo = false) {
    const toast = actual;
    if (!toast) return;
    actual = null;
    window.clearTimeout(toast.temporizador);
    window.clearTimeout(toast.temporizadorSalida);
    window.removeEventListener('keydown', toast.teclado);
    document.removeEventListener('click', toast.interaccion, true);
    if (instantaneo) {
      toast.elemento.remove();
    } else {
      toast.elemento.classList.add('desaparecer');
      window.setTimeout(() => toast.elemento.remove(), 280);
    }
  }

  function mostrar(tipo, mensaje, opciones = {}) {
    quitar(true);
    // Un aviso anterior puede seguir en su animación de salida.
    // Evitar dos notificaciones superpuestas al volver a enviar enseguida.
    document.querySelectorAll('body > .ipet-toast').forEach(elemento => elemento.remove());
    const normalizado = tipo === 'success' || tipo === 'ok' ? 'exito' :
      tipo === 'warning' ? 'advertencia' : tipo;
    const clase = Object.hasOwn(ICONOS, normalizado) ? normalizado : 'info';
    const persistente = opciones.persistente ?? ['error', 'advertencia', 'alerta', 'cargando'].includes(clase);
    const mostrarCerrar = opciones.mostrarCerrar ?? (persistente && clase !== 'cargando');
    const duracion = opciones.duracion ?? (clase === 'exito' ? 2800 : 4200);

    const elemento = document.createElement('div');
    elemento.className = `ipet-toast toast-container toast-${clase}`;
    elemento.setAttribute('role', ['error', 'advertencia', 'alerta'].includes(clase) ? 'alert' : 'status');

    const icono = document.createElement('i');
    icono.className = `fa-solid ${ICONOS[clase]} toast-icon${clase === 'cargando' ? ' spin' : ''}`;
    icono.setAttribute('aria-hidden', 'true');
    elemento.appendChild(icono);

    const texto = document.createElement('div');
    texto.className = 'toast-message';
    texto.textContent = String(mensaje ?? '');
    elemento.appendChild(texto);

    if (mostrarCerrar) {
      const cerrar = document.createElement('button');
      cerrar.type = 'button';
      cerrar.className = 'toast-close';
      cerrar.setAttribute('aria-label', 'Cerrar notificación');
      cerrar.title = 'Cerrar notificación';
      cerrar.textContent = '×';
      cerrar.addEventListener('click', () => quitar());
      elemento.appendChild(cerrar);
    }

    const teclado = event => {
      if (event.key === 'Escape' && opciones.cerrarConEscape !== false && clase !== 'cargando') quitar();
    };
    const interaccion = event => {
      if (opciones.cerrarConInteraccion === false || clase === 'cargando') return;
      if (event.target instanceof Element && event.target.closest('button, input[type="button"], input[type="submit"], input[type="reset"], [role="button"]')) {
        quitar();
      }
    };
    const aviso = { elemento, teclado, interaccion, temporizador: null, temporizadorSalida: null };
    actual = aviso;
    document.body.appendChild(elemento);
    window.addEventListener('keydown', teclado);
    document.addEventListener('click', interaccion, true);

    if (!persistente) {
      aviso.temporizadorSalida = window.setTimeout(() => {
        if (actual === aviso) elemento.classList.add('desaparecer');
      }, Math.max(Number(duracion) - 500, 0));
      aviso.temporizador = window.setTimeout(() => {
        if (actual === aviso) quitar(true);
      }, Number(duracion));
    }
    return elemento;
  }

  window.IPETToast = Object.freeze({ mostrar, cerrar: quitar });
})();
