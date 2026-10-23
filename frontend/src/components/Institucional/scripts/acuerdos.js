document.addEventListener("DOMContentLoaded", function() {
    // Manejar las secciones principales
    const sectionTitles = document.querySelectorAll(".section-title");
    
    sectionTitles.forEach(title => {
        title.addEventListener("click", function() {
            const section = this.closest(".content-section");
            const content = section.querySelector(".section-content");
            const icon = section.querySelector(".section-icon");
            
            content.classList.toggle("expanded");
            icon.classList.toggle("expanded");
        });
    });
    
    // Manejar los botones "Leer más" internos
    const readMoreBtns = document.querySelectorAll(".read-more-btn");
    
    readMoreBtns.forEach(btn => {
        btn.addEventListener("click", function() {
            const container = this.closest(".read-more-container");
            const extraContent = container.querySelector(".extra-content");
            const btnText = container.querySelector(".btn-text");
            const chevron = container.querySelector(".chevron-icon");
            
            const isExpanded = extraContent.classList.contains("expanded");
            
            if (isExpanded) {
                // Animación de cierre
                extraContent.style.maxHeight = extraContent.scrollHeight + "px";
                // Forzar repintado
                void extraContent.offsetHeight;
                extraContent.style.maxHeight = "0";
                extraContent.style.opacity = "0";
                extraContent.style.margin = "0";
            } else {
                // Animación de apertura
                extraContent.style.maxHeight = "0";
                // Forzar repintado
                void extraContent.offsetHeight;
                extraContent.style.maxHeight = extraContent.scrollHeight + "px";
                extraContent.style.opacity = "1";
                extraContent.style.margin = "1rem 0";
            }
            
            extraContent.classList.toggle("expanded");
            this.classList.toggle("expanded");
            
            // Actualizar el texto del botón
            if (btnText) {
                btnText.textContent = isExpanded ? "Leer más" : "Leer menos";
            }
            
            // Rotar el ícono
            if (chevron) {
                chevron.style.transform = isExpanded ? "rotate(0deg)" : "rotate(180deg)";
            }
            
            // Asegurarse de que el contenido se expanda completamente después de la animación
            if (!isExpanded) {
                setTimeout(() => {
                    extraContent.style.maxHeight = "none";
                }, 500);
            }
        });
    });
    
    // Abrir la primera sección por defecto
    const firstSection = document.querySelector(".content-section");
    if (firstSection) {
        firstSection.querySelector(".section-title").click();
    }
});
