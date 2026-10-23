document.addEventListener('DOMContentLoaded', function() {
    const slidesContainer = document.getElementById('gallerySlides');
    const slides = document.querySelectorAll('.gallery-slide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dots = document.querySelectorAll('.dot');
    let currentIndex = 0;
    let touchStartX = 0;
    let intervalId;
    let isClickable = true; // Controlador de delay entre clicks
    const transitionSpeed = 600; // 0.6 segundos de duración de transición
    const slideDuration = 4000; // 4 segundos fijos por imagen
    const clickDelay = 700; // 0.5 segundos de delay entre clicks

    // Función para mostrar slide específico
    function showSlide(index, immediate = false) {
        // Ajustar índice si está fuera de rango
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        
        // Calcular desplazamiento
        const slideWidth = slidesContainer.offsetWidth;
        const offset = -index * slideWidth;
        
        // Aplicar transición
        if (immediate) {
            slidesContainer.style.transition = 'none';
        } else {
            slidesContainer.style.transition = `transform ${transitionSpeed}ms ease-in-out`;
        }
        slidesContainer.style.transform = `translateX(${offset}px)`;
        
        // Actualizar indicadores
        dots.forEach(dot => dot.classList.remove('active'));
        dots[index].classList.add('active');
        
        currentIndex = index;
        
        // Reiniciar el temporizador siempre que cambiamos de slide
        resetInterval();
    }

    // Función para manejar navegación con delay
    function navigate(direction) {
        if (!isClickable) return;
        
        isClickable = false;
        showSlide(currentIndex + direction);
        
        setTimeout(() => {
            isClickable = true;
        }, clickDelay);
    }

    // Navegación con botones
    nextBtn.addEventListener('click', () => navigate(1));
    prevBtn.addEventListener('click', () => navigate(-1));

    // Navegación con puntos (también con delay)
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            if (!isClickable || index === currentIndex) return;
            
            isClickable = false;
            showSlide(index);
            
            setTimeout(() => {
                isClickable = true;
            }, clickDelay);
        });
    });

    // Touch events para móviles (sin delay)
    slidesContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        slidesContainer.style.transition = 'none';
        clearInterval(intervalId);
    }, {passive: true});

    slidesContainer.addEventListener('touchmove', (e) => {
        if (!touchStartX) return;
        const touchX = e.touches[0].clientX;
        const diff = touchStartX - touchX;
        const currentOffset = -currentIndex * slidesContainer.offsetWidth;
        slidesContainer.style.transform = `translateX(${currentOffset - diff}px)`;
    }, {passive: true});

    slidesContainer.addEventListener('touchend', (e) => {
        if (!touchStartX) return;
        
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;
        const threshold = slidesContainer.offsetWidth / 4; // 25% del ancho
        
        if (diff > threshold) {
            showSlide(currentIndex + 1); // Deslizar izquierda
        } else if (diff < -threshold) {
            showSlide(currentIndex - 1); // Deslizar derecha
        } else {
            // Si no superó el umbral, volver a la posición actual sin animación
            showSlide(currentIndex, true);
        }
        
        touchStartX = 0;
    }, {passive: true});

    // Autoplay con tiempo fijo
    function startInterval() {
        clearInterval(intervalId); // Limpiar por si acaso
        intervalId = setInterval(() => {
            showSlide(currentIndex + 1);
        }, slideDuration);
    }

    function resetInterval() {
        clearInterval(intervalId);
        startInterval();
    }

    // Inicialización
    function initSlider() {
        // Asegurar que todos los slides tengan el ancho correcto
        const slideWidth = slidesContainer.offsetWidth;
        slides.forEach(slide => {
            slide.style.width = `${slideWidth}px`;
        });
        
        // Mostrar primer slide sin animación
        showSlide(0, true);
        
        // Iniciar el intervalo después de que termine la transición inicial
        setTimeout(startInterval, transitionSpeed);
    }

    // Iniciar y manejar redimensionamiento
    initSlider();
    
    // Redimensionamiento con debounce para mejor performance
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            initSlider();
        }, 200);
    });

    // Pausar al interactuar
    const slider = document.querySelector('.gallery-slider');
    slider.addEventListener('mouseenter', () => clearInterval(intervalId));
    slider.addEventListener('mouseleave', startInterval);
})
















// Script para el efecto de conteo
document.addEventListener('DOMContentLoaded', function() {
    const statNumbers = document.querySelectorAll('.stat-number');
    const speed = 1500; // Duración total de la animación en ms

    function animateValue(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);

            // Si el elemento tiene clase "plus", actualizar solo el <span class="number">
            if (element.classList.contains('plus')) {
                const numberElement = element.querySelector('.number');
                if (numberElement) {
                    numberElement.textContent = value.toLocaleString();
                }
            } else {
                element.textContent = value.toLocaleString();
            }

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    function startCounting() {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-count'));
            animateValue(stat, 0, target, speed);
        });
    }

    // Activar el conteo cuando la sección sea visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startCounting();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        observer.observe(statsSection);
    }
});
