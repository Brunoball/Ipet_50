document.addEventListener('DOMContentLoaded', function() {
    // Inicializar todos los sliders
    initAllSliders();
    
});

function initAllSliders() {
    // Inicializar el slider de perfil
    initSlider({
        sliderSelector: '.perfil-gallery-slider',
        slideSelector: '.gallery-slide',
        prevBtnSelector: '.gallery-prev',
        nextBtnSelector: '.gallery-next',
        dotsContainerSelector: '.gallery-dots'
    });
    
    // Inicializar el slider de evento
    initSlider({
        sliderSelector: '.evento-slider',
        slideSelector: '.evento-slide',
        prevBtnSelector: '.evento-prev',
        nextBtnSelector: '.evento-next',
        dotsContainerSelector: '.evento-dots'
    });
}

function initSlider(config) {
    const slider = document.querySelector(config.sliderSelector);
    if (!slider) return;
    
    const slides = document.querySelectorAll(`${config.sliderSelector} ${config.slideSelector}`);
    const prevBtn = document.querySelector(config.prevBtnSelector);
    const nextBtn = document.querySelector(config.nextBtnSelector);
    const dotsContainer = document.querySelector(config.dotsContainerSelector);
    let currentSlide = 0;
    let slideInterval;
    let isTransitioning = false;
    let lastInteractionTime = 0;
    const CLICK_DELAY = 800; // 600ms de delay entre interacciones

    // Create dots
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        slides.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.addEventListener('click', () => {
                if (canInteract()) {
                    goToSlide(index);
                }
            });
            dotsContainer.appendChild(dot);
        });
    }
    
    const dots = dotsContainer ? document.querySelectorAll(`${config.dotsContainerSelector} span`) : [];
    
    // Verificar si se puede interactuar
    function canInteract() {
        const now = Date.now();
        return !isTransitioning && (now - lastInteractionTime > CLICK_DELAY);
    }

    // Initialize slider
    function setupSlider() {
        slides.forEach((slide, index) => {
            slide.style.opacity = index === 0 ? '1' : '0';
            slide.style.zIndex = index === 0 ? '1' : '0';
        });
        updateDots();
    }
    
    // Go to specific slide
    function goToSlide(index) {
        if (!canInteract()) return;
        
        lastInteractionTime = Date.now();
        isTransitioning = true;
        
        slides[currentSlide].style.opacity = '0';
        slides[currentSlide].style.zIndex = '0';
        
        currentSlide = (index + slides.length) % slides.length;
        
        slides[currentSlide].style.opacity = '1';
        slides[currentSlide].style.zIndex = '1';
        updateDots();
        
        // Resetear después de la transición
        setTimeout(() => {
            isTransitioning = false;
        }, CLICK_DELAY);
    }
    
    // Update dots
    function updateDots() {
        if (dots.length > 0) {
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
        }
    }
    
    // Event listeners con delay
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (canInteract()) {
                goToSlide(currentSlide - 1);
                resetInterval();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (canInteract()) {
                goToSlide(currentSlide + 1);
                resetInterval();
            }
        });
    }
    
    // Auto-rotate slides
    function autoRotate() {
        if (!isTransitioning) {
            goToSlide(currentSlide + 1);
        }
    }
    
    function startAutoRotation() {
        slideInterval = setInterval(autoRotate, 3000);
    }
    
    function resetInterval() {
        clearInterval(slideInterval);
        startAutoRotation();
    }
    
    // Initialize
    setupSlider();
    startAutoRotation();
    
    // Pause on hover
    slider.addEventListener('mouseenter', () => clearInterval(slideInterval));
    slider.addEventListener('mouseleave', startAutoRotation);
}





























// Control del botón Leer más/menos
document.addEventListener('DOMContentLoaded', function() {
    const leerMasBtn = document.querySelector('.leer-mas-btn');
    const leerMasParagraphs = document.querySelectorAll('.LeerMas');
    
    if (leerMasBtn && leerMasParagraphs.length > 0) {
        leerMasBtn.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            // Alternar estado ARIA para accesibilidad
            this.setAttribute('aria-expanded', !isExpanded);
            
            // Alternar texto del botón
            this.textContent = isExpanded ? 'Leer más' : 'Leer menos';
            
            // Alternar clases con transición
            leerMasParagraphs.forEach(p => {
                if (isExpanded) {
                    p.classList.remove('active');
                } else {
                    p.classList.add('active');
                }
            });
            
            // Desplazamiento suave al contenido
            if (!isExpanded) {
                setTimeout(() => {
                    this.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 300);
            }
        });
    }
});





document.addEventListener("DOMContentLoaded", function () {
    const readMoreBtn = document.querySelector(".read-more-btn");
    const extraContent = document.querySelector(".extra-content");
    const btnText = document.querySelector(".btn-text");

    readMoreBtn.addEventListener("click", function () {
        const isExpanded = extraContent.classList.contains("expanded");

        if (isExpanded) {
            // Cierre: establecer altura actual, luego a 0 para que sea suave
            extraContent.style.maxHeight = extraContent.scrollHeight + "px"; 
            requestAnimationFrame(() => {
                extraContent.style.maxHeight = "0px";
                extraContent.style.opacity = "0";
                extraContent.style.margin = "0";
            });
        } else {
            // Apertura: establecer altura exacta
            extraContent.style.maxHeight = extraContent.scrollHeight + "px";
            extraContent.style.opacity = "1";
            extraContent.style.margin = "1rem 0";
        }

        extraContent.classList.toggle("expanded");
        readMoreBtn.classList.toggle("expanded");
        btnText.textContent = isExpanded ? "Leer más" : "Leer menos";
    });
});


// Slider de testimonios
document.addEventListener('DOMContentLoaded', function() {
    const track = document.querySelector('.testimonios-track');
    const cards = document.querySelectorAll('.testimonio-card');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');
    
    let currentIndex = 0;
    const cardCount = cards.length;
    const cardWidth = cards[0].offsetWidth;
    
    function updateSlider() {
        if (window.innerWidth <= 768) {
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
        } else {
            track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
        }
        
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
        
        cards.forEach((card, index) => {
            if (index === currentIndex) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    }
    
    function goToPrev() {
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : cardCount - 1;
        updateSlider();
    }
    
    function goToNext() {
        currentIndex = (currentIndex < cardCount - 1) ? currentIndex + 1 : 0;
        updateSlider();
    }
    
    // Event listeners para los dots
    dots.forEach(dot => {
        dot.addEventListener('click', function() {
            currentIndex = parseInt(this.getAttribute('data-index'));
            updateSlider();
        });
    });
    
    // Botones de navegación
    prevBtn.addEventListener('click', goToPrev);
    nextBtn.addEventListener('click', goToNext);
    
    // Touch events para móvil
    let startX, moveX;
    track.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
    });
    
    track.addEventListener('touchmove', function(e) {
        moveX = e.touches[0].clientX;
    });
    
    track.addEventListener('touchend', function() {
        if (startX - moveX > 50) {
            goToNext();
        } else if (moveX - startX > 50) {
            goToPrev();
        }
    });
    
    // Control con teclado
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            goToPrev();
        } else if (e.key === 'ArrowRight') {
            goToNext();
        }
    });
    
    // Inicializar slider
    updateSlider();
    
    // Ajustar en redimensionamiento
    window.addEventListener('resize', function() {
        updateSlider();
    });
});


// Control del botón "Atrás": solo permite volver si estás arriba del todo
document.addEventListener('DOMContentLoaded', function () {
    // Insertar un estado falso al historial
    history.pushState({ stayOnPage: true }, '');
    history.replaceState(null, null, ' ');


    window.addEventListener('popstate', function () {
        const isAtTop = window.scrollY < 50;

        if (!isAtTop) {
            // Si no está arriba, hace scroll al inicio y vuelve a insertar el estado
            window.scrollTo({ top: 0, behavior: 'smooth' });
            history.pushState({ stayOnPage: true }, '');
        }
        // Si está arriba, no se evita el retroceso
    });
});
