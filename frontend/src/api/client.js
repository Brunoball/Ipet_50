/* API compartida de la web IPET 50. No requiere build ni framework. */
(() => {
  'use strict';
  function base() {
    const host = window.location.hostname;
    if (host === 'ipet50.edu.ar' || host === 'www.ipet50.edu.ar') {
      return window.location.origin + '/WEB/backend/';
    }
    if ((host === 'localhost' || host === '127.0.0.1') && window.location.port !== '8000') {
      return window.location.protocol + '//' + host + ':3001/';
    }
    // Alternativa para servir la web y la API juntas, manteniendo la jerarquía original.
    const frontend = new URL(window.location.pathname.includes('/src/components/')
      ? '../../../' : './', document.baseURI);
    return new URL('../backend/', frontend).href;
  }
  function url(route) {
    const endpoint = new URL('routes.php', base());
    endpoint.searchParams.set('route', route);
    return endpoint;
  }
  window.IPETApi = Object.freeze({base, url});
})();
