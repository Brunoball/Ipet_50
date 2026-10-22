document.addEventListener('DOMContentLoaded', function () {
        const slides = document.querySelectorAll('.kb-slide');
        const dotsContainer = document.querySelector('.kb-dots');
        let currentIndex = 0;

        // Crear indicadores de puntos
        slides.forEach((slide, index) => {
            const dot = document.createElement('div');
            dot.classList.add('kb-dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });

        const dots = document.querySelectorAll('.kb-dot');

        // Función para cambiar de slide
        function goToSlide(index) {
            slides[currentIndex].classList.remove('active');
            dots[currentIndex].classList.remove('active');

            currentIndex = index;

            slides[currentIndex].classList.add('active');
            dots[currentIndex].classList.add('active');
        }

        // Cambio automático cada 4 segundos
        function nextSlide() {
            const newIndex = (currentIndex + 1) % slides.length;
            goToSlide(newIndex);
        }

        let slideInterval = setInterval(nextSlide, 4000);

        // Pausar al hacer hover (opcional, aún no implementado)
    });