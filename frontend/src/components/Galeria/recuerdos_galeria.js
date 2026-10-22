(() => {
 'use strict';
 const grid = document.querySelector('.recuerdos-gallery .recuerdos-grid');
 if (!grid) return;

 const endpoint = new URL('../../../backend/recuerdos.php', document.baseURI);
 const status = document.createElement('p');
 status.className = 'recuerdos-note';
 status.setAttribute('role', 'status');
 grid.after(status);

 function el(tag, cls, text) {
  const node = document.createElement(tag);
  node.className = cls;
  if (text) node.textContent = text;
  return node;
 }

 async function load() {
  let page = 1;
  status.textContent = 'Cargando recuerdos…';
  try {
   // Se obtienen todas las páginas automáticamente, sin botón "Cargar más recuerdos".
   while (true) {
    const response = await fetch(endpoint + '?pagina=' + page);
    if (!response.ok) throw new Error('Error al obtener recuerdos');
    const data = await response.json();
    if (!Array.isArray(data.recuerdos)) throw new Error('Respuesta inválida');

    for (const item of data.recuerdos) {
     const card = el('article', 'recuerdo-card');
     const photo = el('div', 'recuerdo-photo');
     const img = el('img', '');
     img.src = endpoint + '?imagen=' + item.id;
     img.alt = item.titulo;
     img.loading = 'lazy';
     photo.append(img);

     const body = el('div', 'recuerdo-body');
     const author = el('div', 'recuerdo-author');
     const info = el('div', '');
     info.append(
      el('span', 'recuerdo-name', item.nombre),
      el('span', 'recuerdo-detail', [item.vinculo, item.anio].filter(Boolean).join(' · '))
     );
     author.append(info);
     const relato = el('p', '', item.relato);
     relato.style.whiteSpace = 'pre-wrap';
     body.append(author, el('h3', '', item.titulo), relato);
     card.append(photo, body);
     grid.append(card);
    }

    // Evita solicitudes sin fin si el servidor marca más páginas pero devuelve una vacía.
    if (!data.mas || data.recuerdos.length === 0) break;
    page++;
   }
   status.textContent = grid.children.length ? '' : 'Todavía no hay recuerdos publicados. ¡Compartí el primero!';
  } catch {
   status.textContent = grid.children.length
    ? 'No se pudieron cargar todos los recuerdos.'
    : 'No se pudieron cargar los recuerdos.';
  }
 }

 load();
})();
