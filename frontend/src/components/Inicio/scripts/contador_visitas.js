(function () {
          const el = document.getElementById('viewCounter');
          if (!el) return;

          // Misma API en producción y desarrollo; no registrar visitas locales en Hostinger.
          const base = window.IPETApi.base();
          const url = new URL('routes.php?route=visitas&path=/', base);

          fetch(url, { cache: 'no-store', credentials: 'include' })
            .then(r => r.json())
            .then(d => {
              const n = Math.max(0, parseInt(d.total || 0, 10));
              el.textContent = n.toString().padStart(4, '0');
            })
            .catch(() => { el.textContent = '0000'; });
        })();
