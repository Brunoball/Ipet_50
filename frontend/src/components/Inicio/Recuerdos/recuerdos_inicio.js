/* Botón de participación; rutas resueltas desde este archivo incluso en subcarpetas. */
(function () {
    const scriptURL = document.currentScript.src;
    function agregarBoton() {
        const section = document.querySelector('#recuerdos') || document.querySelector('.recuerdos-section');
        if (!section || section.querySelector('[data-agregar-recuerdo]')) return;
        let actions = section.querySelector('.recuerdos-actions');
        if (!actions) { actions = document.createElement('div'); actions.className = 'recuerdos-actions'; (section.querySelector('.container') || section).append(actions); }
        const link = document.createElement('a');
        link.href = new URL('../../Galeria/AgregarRecuerdo.html', scriptURL).href;
        link.className = 'recuerdos-more'; link.dataset.agregarRecuerdo = 'true'; link.textContent = '+ Agregá tu recuerdo';
        actions.append(link);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', agregarBoton, {once:true});
    else agregarBoton();
})();

/* Carrusel accesible de los tres recuerdos del inicio. No modifica la galería. */
(function () {
    'use strict';
    const track = document.getElementById('recuerdosTrack');
    const viewport = document.getElementById('recuerdosViewport');
    if (!track || !viewport) return;

    const cards = Array.from(track.querySelectorAll('.recuerdo-card'));
    const dots = Array.from(document.querySelectorAll('.recuerdos-dot'));
    const prev = document.getElementById('recuerdosPrev');
    const next = document.getElementById('recuerdosNext');
    const status = document.getElementById('recuerdosStatus');
    if (!cards.length) return;
    let current = 0;

    function show(index, announce = true) {
        current = (index + cards.length) % cards.length;
        track.style.transform = `translateX(-${current * 100}%)`;
        cards.forEach((card, i) => {
            const hidden = i !== current;
            card.inert = hidden;
            if (hidden) card.setAttribute('aria-hidden', 'true');
            else card.removeAttribute('aria-hidden');
        });
        dots.forEach((dot, i) => {
            const active = i === current;
            dot.classList.toggle('is-active', active);
            if (active) dot.setAttribute('aria-current', 'true');
            else dot.removeAttribute('aria-current');
        });
        if (status && announce) status.textContent = `Recuerdo ${current + 1} de ${cards.length}`;
    }

    prev?.addEventListener('click', () => show(current - 1));
    next?.addEventListener('click', () => show(current + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));

    viewport.setAttribute('tabindex', '0');
    viewport.setAttribute('aria-label', 'Recuerdos: usá las flechas izquierda y derecha para navegar');
    viewport.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault();
            show(current + (event.key === 'ArrowRight' ? 1 : -1));
        }
    });

    let startX = null;
    viewport.addEventListener('touchstart', (event) => {
        startX = event.changedTouches[0]?.clientX ?? null;
    }, { passive: true });
    viewport.addEventListener('touchend', (event) => {
        if (startX === null) return;
        const delta = (event.changedTouches[0]?.clientX ?? startX) - startX;
        startX = null;
        if (Math.abs(delta) > 45) show(current + (delta < 0 ? 1 : -1));
    }, { passive: true });
    show(0, false);
})();
