document.addEventListener("DOMContentLoaded", function () {
    const fechaFundacion = new Date(1935, 2, 15); // 15 de marzo de 1935 (mes 2 porque enero = 0)
    const hoy = new Date();

    let anios = hoy.getFullYear() - fechaFundacion.getFullYear();

    // Si aún no pasó el 15 de marzo este año, restamos 1
    const cumpleEsteAnio = new Date(hoy.getFullYear(), 2, 15);
    if (hoy < cumpleEsteAnio) {
        anios -= 1;
    }

    // Reemplaza todos los elementos que tienen la clase 'anios-trayectoria'
    document.querySelectorAll(".anios-trayectoria").forEach(el => {
        el.textContent = anios;

        // Si también usás animaciones basadas en data-count
        if (el.hasAttribute("data-count")) {
            el.setAttribute("data-count", anios);
        }
    });
});



// Redirecciones de subpag a pag principl
window.addEventListener("load", function () {
    // 1. Verificamos si hay un hash en la URL
    let hash = window.location.hash;

    // 2. Si no hay hash en la URL, verificamos si hay en localStorage
    if (!hash) {
        hash = localStorage.getItem("seccionScroll");
        if (hash) {
            localStorage.removeItem("seccionScroll");
        }
    }

    // 3. Si hay un hash válido, scrolleamos a esa sección
    if (hash) {
        setTimeout(() => {
            const target = document.querySelector(hash);
            if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    }
});