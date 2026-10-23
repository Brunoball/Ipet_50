(function () {
            const popup = document.getElementById('ipetPopupMesas');
            if (!popup) return;

            const base = window.IPETApi.base();

            // El popup queda oculto por defecto y sólo se activa cuando la API confirma apertura.
            fetch(new URL('routes.php?route=mesas/estado', base), {
                cache: 'no-store', credentials: 'include'
            })
                .then(r => { if (!r.ok) throw new Error('No se pudo consultar mesas'); return r.json(); })
                .then(d => window.dispatchEvent(new CustomEvent('ipet:mesas-estado', {
                    detail: { visible: d.visible === true }
                })))
                .catch(() => window.dispatchEvent(new CustomEvent('ipet:mesas-estado', {
                    detail: { visible: false }
                })));
        })();
