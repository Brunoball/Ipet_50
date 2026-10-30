(() => {
  'use strict';

  const form = document.getElementById('recuerdoForm');
  if (!form) return;

  const button = document.getElementById('enviarRecuerdo');
  const status = document.getElementById('formStatus');
  const foto = form.elements.foto;
  const preview = document.getElementById('fotoPreview');
  const fechaRecuerdo = form.elements.anio;
  const endpoint = window.IPETApi.url('recuerdos');
  const toast = (tipo, mensaje, opciones) => window.IPETToast.mostrar(tipo, mensaje, opciones);
  const textoBoton = button.textContent;
  let csrf = '';
  let previewURL;
  let conectandoSesion = false;
  let enviando = false;

  // Mantener las etiquetas flotantes al seleccionar, restaurar y limpiar campos.
  const selects = form.querySelectorAll('.mem-floating select');
  const syncLabels = () => selects.forEach(select => {
    select.parentElement.classList.toggle('has-value', select.value !== '');
  });
  selects.forEach(select => select.addEventListener('change', syncLabels));
  form.addEventListener('reset', () => {
    form.querySelectorAll('[aria-invalid="true"]').forEach(campo => campo.removeAttribute('aria-invalid'));
    foto.setCustomValidity('');
    window.setTimeout(syncLabels, 0);
  });
  window.addEventListener('pageshow', syncLabels);
  syncLabels();

  // El backend recibe solo el año aunque se elija una fecha en el calendario.
  const hoy = new Date();
  fechaRecuerdo.max = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
  fechaRecuerdo.closest('.mem-floating--date').addEventListener('click', () => {
    fechaRecuerdo.focus();
    if (typeof fechaRecuerdo.showPicker === 'function') {
      try { fechaRecuerdo.showPicker(); } catch { /* Se mantiene el calendario nativo. */ }
    }
  });

  function marcarError(campo, mensaje, { enfocar = true } = {}) {
    campo.setAttribute('aria-invalid', 'true');
    toast('advertencia', mensaje);
    if (enfocar) campo.focus();
    return false;
  }

  // Quitar la marca de error en cuanto la persona corrige el campo.
  form.querySelectorAll('input, select, textarea').forEach(campo => {
    const limpiar = () => {
      campo.removeAttribute('aria-invalid');
      if (campo === foto) foto.setCustomValidity('');
    };
    campo.addEventListener('input', limpiar);
    campo.addEventListener('change', limpiar);
  });

  const formatosPermitidos = new Set(['image/jpeg', 'image/png', 'image/webp']);
  function errorArchivo(archivo) {
    if (!archivo) return 'Seleccioná una fotografía para acompañar tu recuerdo.';
    if (!formatosPermitidos.has(archivo.type)) return 'La fotografía debe ser JPG, PNG o WebP.';
    if (archivo.size > 3 * 1024 * 1024) return 'La fotografía no puede superar los 3 MB.';
    return '';
  }

  function limpiarPreview() {
    preview.hidden = true;
    preview.removeAttribute('src');
    if (previewURL) URL.revokeObjectURL(previewURL);
    previewURL = undefined;
  }

  foto.addEventListener('change', () => {
    limpiarPreview();
    const archivo = foto.files[0];
    if (!archivo) return;
    const error = errorArchivo(archivo);
    if (error) {
      marcarError(foto, error, { enfocar: false });
      return;
    }
    previewURL = URL.createObjectURL(archivo);
    preview.src = previewURL;
    preview.hidden = false;
  });

  function validarCampos() {
    const nombre = form.elements.nombre;
    if (!nombre.value.trim()) return marcarError(nombre, 'Ingresá tu nombre y apellido.');
    if (nombre.value.trim().length < 2) return marcarError(nombre, 'El nombre debe tener al menos 2 caracteres.');

    const email = form.elements.email;
    if (!email.value.trim()) return marcarError(email, 'Ingresá tu correo electrónico.');
    if (!email.validity.valid) return marcarError(email, 'Ingresá un correo electrónico válido.');

    const vinculo = form.elements.vinculo;
    if (!vinculo.value) return marcarError(vinculo, 'Seleccioná tu vínculo con la escuela.');

    if (fechaRecuerdo.value && !fechaRecuerdo.validity.valid) {
      return marcarError(fechaRecuerdo, 'Seleccioná una fecha válida que no sea futura.');
    }

    const titulo = form.elements.titulo;
    if (!titulo.value.trim()) return marcarError(titulo, 'Escribí un título para tu recuerdo.');
    if (titulo.value.trim().length < 3) return marcarError(titulo, 'El título debe tener al menos 3 caracteres.');

    const relato = form.elements.relato;
    if (!relato.value.trim()) return marcarError(relato, 'Contanos tu historia para completar el recuerdo.');
    if (relato.value.trim().length < 20) return marcarError(relato, 'Tu historia debe tener al menos 20 caracteres.');

    const errorFoto = errorArchivo(foto.files[0]);
    if (errorFoto) return marcarError(foto, errorFoto);

    const consentimiento = form.elements.consentimiento;
    if (!consentimiento.checked) {
      return marcarError(consentimiento, 'Tenés que aceptar la autorización para publicar tu recuerdo.');
    }
    return true;
  }

  // No se muestran botones de reintento: la sesión se recupera sola.
  async function sesion() {
    if (conectandoSesion || csrf || enviando) return;
    conectandoSesion = true;
    button.disabled = true;
    status.textContent = 'Preparando formulario…';
    try {
      const respuesta = await fetch(endpoint + '&sesion=1', { credentials: 'include' });
      const datos = await respuesta.json();
      if (!respuesta.ok || !datos.csrf) throw new Error('No se pudo preparar el formulario.');
      csrf = datos.csrf;
      status.textContent = '';
      button.disabled = false;
    } catch {
      status.textContent = 'No se pudo conectar con el servidor.';
      toast('error', 'No se pudo conectar con el servidor. El formulario se habilitará cuando vuelva la conexión.');
    } finally {
      conectandoSesion = false;
    }
  }

  window.addEventListener('online', sesion);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) sesion();
  });
  sesion();

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (enviando) return;
    if (!validarCampos()) return;
    if (!csrf) {
      toast('error', 'Todavía no hay conexión con el servidor. Intentá nuevamente cuando se restablezca.');
      sesion();
      return;
    }

    enviando = true;
    button.disabled = true;
    button.textContent = 'Enviando…';
    status.textContent = 'Enviando tu recuerdo…';
    toast('cargando', 'Enviando tu recuerdo…', { persistente: true, mostrarCerrar: false, cerrarConInteraccion: false });

    const datos = new FormData(form);
    datos.set('anio', fechaRecuerdo.value ? fechaRecuerdo.value.slice(0, 4) : '');
    datos.set('csrf', csrf);

    try {
      const respuesta = await fetch(endpoint, { method: 'POST', body: datos, credentials: 'include' });
      const resultado = await respuesta.json().catch(() => ({}));
      if (!respuesta.ok || resultado.error) {
        throw new Error(resultado.error || 'No se pudo enviar tu recuerdo. Intentá nuevamente.');
      }
      form.reset();
      limpiarPreview();
      status.textContent = 'Recuerdo enviado para revisión.';
      toast('exito', resultado.mensaje || 'Tu recuerdo se envió correctamente y quedó pendiente de revisión.');
    } catch (error) {
      status.textContent = 'No se pudo confirmar el envío.';
      const sinConexion = /Failed to fetch|NetworkError|Network error|Load failed/i.test(String(error.message));
      toast('error', sinConexion
        ? 'No se pudo confirmar el envío. Revisá tu conexión e intentá nuevamente.'
        : error.message || 'No se pudo enviar el recuerdo. Intentá nuevamente.');
    } finally {
      enviando = false;
      button.textContent = textoBoton;
      button.disabled = !csrf;
    }
  });
})();
