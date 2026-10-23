/* Participación y carrusel del inicio: datos reales de la API de recuerdos aprobados. */
(() => {
    'use strict';

    const section = document.getElementById('recuerdos');
    const track = document.getElementById('recuerdosTrack');
    const viewport = document.getElementById('recuerdosViewport');
    const carousel = section?.querySelector('.recuerdos-carousel');
    const navigation = document.getElementById('recuerdosNavigation');
    const dotsContainer = document.getElementById('recuerdosDots');
    const prev = document.getElementById('recuerdosPrev');
    const next = document.getElementById('recuerdosNext');
    const liveStatus = document.getElementById('recuerdosStatus');
    const message = document.getElementById('recuerdosMensaje');
    if (!section || !track || !viewport || !carousel || !navigation || !dotsContainer || !message) return;

    // El botón de participación sigue disponible sin importar si ya hay recuerdos.
    if (!section.querySelector('[data-agregar-recuerdo]')) {
        const actions = section.querySelector('.recuerdos-actions');
        if (actions) {
            const link = document.createElement('a');
            link.href = new URL('src/components/Galeria/AgregarRecuerdo.html', document.baseURI).href;
            link.className = 'recuerdos-more';
            link.dataset.agregarRecuerdo = 'true';
            link.textContent = '+ Agregá tu recuerdo';
            actions.append(link);
        }
    }

    const endpoint = window.IPETApi.url('recuerdos');
    const cards = [];
    const dots = [];
    let current = 0;

    function element(tag, className = '', value = '') {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (value !== null && value !== undefined) node.textContent = String(value);
        return node;
    }

    function cardFor(item) {
        const card = element('article', 'recuerdo-card');
        card.setAttribute('role', 'group');
        card.setAttribute('aria-roledescription', 'recuerdo');

        const identity = element('div', 'recuerdo-identity');
        const photo = element('div', 'recuerdo-photo');
        const img = element('img');
        const imageUrl = new URL(endpoint.href);
        imageUrl.searchParams.set('imagen', String(item.id));
        img.src = imageUrl.href;
        img.alt = 'Fotografía de ' + item.titulo;
        img.loading = 'lazy';
        img.decoding = 'async';
        photo.append(img);

        const author = element('div', 'recuerdo-author');
        const detail = [item.vinculo, item.anio].filter(v => v !== null && v !== undefined && v !== '').join(' · ');
        author.append(element('span', 'recuerdo-name', item.nombre), element('span', 'recuerdo-detail', detail));
        identity.append(photo, author);

        const body = element('div', 'recuerdo-body');
        body.append(
            element('span', 'recuerdo-tag', item.vinculo),
            element('h3', '', item.titulo)
        );
        const relato = element('p', '', item.relato);
        relato.style.whiteSpace = 'pre-wrap';
        body.append(relato);
        const quote = element('i', 'fa-solid fa-quote-right recuerdo-quote');
        quote.setAttribute('aria-hidden', 'true');
        body.append(quote);
        card.append(identity, body);
        return card;
    }

    function show(index, announce = true) {
        if (!cards.length) return;
        current = (index + cards.length) % cards.length;
        track.style.transform = `translateX(-${current * 100}%)`;
        cards.forEach((card, i) => {
            const hidden = i !== current;
            // Evitar que el foco permanezca en un elemento que se oculta.
            if (hidden && card.contains(document.activeElement)) viewport.focus({ preventScroll: true });
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
        if (liveStatus && announce) liveStatus.textContent = `Recuerdo ${current + 1} de ${cards.length}`;
    }

    function render(items) {
        track.replaceChildren();
        dotsContainer.replaceChildren();
        cards.length = 0;
        dots.length = 0;

        if (items.length === 0) {
            carousel.style.display = 'none';
            message.style.display = '';
            message.textContent = 'Todavía no hay recuerdos publicados. ¡Compartí el primero!';
            return;
        }

        items.forEach((item, i) => {
            const card = cardFor(item);
            card.setAttribute('aria-label', `${i + 1} de ${items.length}: ${item.titulo}`);
            track.append(card);
            cards.push(card);
            if (items.length > 1) {
                const dot = element('button', 'recuerdos-dot');
                dot.type = 'button';
                dot.dataset.recuerdoIndex = String(i);
                dot.setAttribute('aria-label', `Ver recuerdo ${i + 1} de ${items.length}`);
                dot.addEventListener('click', () => show(i));
                dotsContainer.append(dot);
                dots.push(dot);
            }
        });
        navigation.style.display = items.length > 1 ? '' : 'none';
        carousel.style.display = '';
        message.textContent = '';
        message.style.display = 'none';
        viewport.tabIndex = items.length > 1 ? 0 : -1;
        if (items.length > 1) viewport.setAttribute('aria-label', 'Recuerdos: usá las flechas izquierda y derecha para navegar');
        show(0, false);
    }

    prev?.addEventListener('click', () => show(current - 1));
    next?.addEventListener('click', () => show(current + 1));
    viewport.addEventListener('keydown', event => {
        if (cards.length < 2 || !['ArrowRight', 'ArrowLeft'].includes(event.key)) return;
        event.preventDefault();
        show(current + (event.key === 'ArrowRight' ? 1 : -1));
    });
    let startX = null;
    viewport.addEventListener('touchstart', event => {
        startX = event.changedTouches[0]?.clientX ?? null;
    }, { passive: true });
    viewport.addEventListener('touchend', event => {
        if (startX === null || cards.length < 2) return;
        const delta = (event.changedTouches[0]?.clientX ?? startX) - startX;
        startX = null;
        if (Math.abs(delta) > 45) show(current + (delta < 0 ? 1 : -1));
    }, { passive: true });

    async function load() {
        try {
            const items = [];
            let page = 1;
            while (true) {
                const url = new URL(endpoint.href);
                url.searchParams.set('pagina', String(page));
                const response = await fetch(url, { cache: 'no-store' });
                if (!response.ok) throw new Error('Error HTTP ' + response.status);
                const data = await response.json();
                if (data.ok !== true || !Array.isArray(data.recuerdos)) throw new Error('Respuesta inválida de recuerdos');
                for (const item of data.recuerdos) {
                    if (!item || !Number.isSafeInteger(item.id) || item.id < 1) throw new Error('Registro inválido');
                    items.push(item);
                }
                if (!data.mas || data.recuerdos.length === 0) break;
                page += 1;
            }
            render(items);
        } catch (error) {
            console.error('No se pudieron cargar los recuerdos publicados:', error);
            carousel.style.display = 'none';
            message.style.display = '';
            message.textContent = 'No se pudieron cargar los recuerdos. Actualizá la página para reintentar.';
        }
    }
    load();
})();
