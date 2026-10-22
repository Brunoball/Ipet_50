document.addEventListener('DOMContentLoaded', function() {
    // Configuración común para todos los sliders
    const SLIDE_INTERVAL = 5000;
    const TRANSITION_SPEED = 600;
    const CLICK_DELAY = 300;
    
    function initSlider(sliderContainer) {
        const slider = sliderContainer.querySelector('.slider');
        const slides = sliderContainer.querySelector('.slides');
        const slideItems = sliderContainer.querySelectorAll('.slide');
        const prevBtn = sliderContainer.querySelector('.prev');
        const nextBtn = sliderContainer.querySelector('.next');
        const dots = sliderContainer.querySelectorAll('.dot');
        
        let currentIndex = 0;
        const totalSlides = slideItems.length;
        let slideWidth = slider.offsetWidth;
        let slideInterval;
        let isTransitioning = false;
        let lastClickTime = 0;
        
        function setSlideWidth() {
            slideWidth = slider.offsetWidth;
            slideItems.forEach(slide => {
                slide.style.width = `${slideWidth}px`;
            });
            updateSlider();
        }
        
        function updateSlider() {
            slides.style.transition = `transform ${TRANSITION_SPEED}ms ease-in-out`;
            slides.style.transform = `translateX(-${currentIndex * slideWidth}px`;
            
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
            
            isTransitioning = true;
            setTimeout(() => {
                isTransitioning = false;
            }, TRANSITION_SPEED);
        }
        
        function canInteract() {
            const now = Date.now();
            return !isTransitioning && (now - lastClickTime > CLICK_DELAY);
        }
        
        function goToSlide(index) {
            if (index === currentIndex || !canInteract()) return;
            
            lastClickTime = Date.now();
            currentIndex = index;
            updateSlider();
            resetAutoSlide();
        }
        
        function prevSlide() {
            if (!canInteract()) return;
            
            lastClickTime = Date.now();
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            updateSlider();
            resetAutoSlide();
        }
        
        function nextSlide() {
            if (!canInteract()) return;
            
            lastClickTime = Date.now();
            currentIndex = (currentIndex + 1) % totalSlides;
            updateSlider();
            resetAutoSlide();
        }
        
        function autoNextSlide() {
            if (isTransitioning) return;
            currentIndex = (currentIndex + 1) % totalSlides;
            updateSlider();
        }
        
        function startAutoSlide() {
            clearInterval(slideInterval);
            slideInterval = setInterval(autoNextSlide, SLIDE_INTERVAL);
        }
        
        function resetAutoSlide() {
            clearInterval(slideInterval);
            startAutoSlide();
        }
        
        function handleInteraction(callback) {
            return function(e) {
                if (e.type === 'touchstart') {
                    e.preventDefault();
                }
                
                e.stopPropagation();
                callback();
            };
        }
        
        ['click', 'touchstart'].forEach(event => {
            prevBtn.addEventListener(event, handleInteraction(prevSlide));
            nextBtn.addEventListener(event, handleInteraction(nextSlide));
            
            dots.forEach((dot, index) => {
                dot.addEventListener(event, handleInteraction(() => goToSlide(index)));
            });
        });
        
        slider.addEventListener('mouseenter', () => clearInterval(slideInterval));
        slider.addEventListener('mouseleave', startAutoSlide);
        
        let touchStartX = 0;
        let touchEndX = 0;
        
        slider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            clearInterval(slideInterval);
        }, { passive: true });
        
        slider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
            startAutoSlide();
        }, { passive: true });
        
        function handleSwipe() {
            if (isTransitioning) return;
            
            const difference = touchStartX - touchEndX;
            if (difference > 50) {
                nextSlide();
            } else if (difference < -50) {
                prevSlide();
            }
        }
        
        setSlideWidth();
        startAutoSlide();
        
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                setSlideWidth();
            }, 100);
        });
    }
    
    const sliderContainers = document.querySelectorAll('.slider-container');
    sliderContainers.forEach(initSlider);

    // Animación para las tarjetas de información
    const infoCards = document.querySelectorAll('.info-card');
    const activityItems = document.querySelectorAll('.activity-list li');
    
    function animateOnScroll() {
        infoCards.forEach((card, index) => {
            const cardPosition = card.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (cardPosition < screenPosition) {
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 200);
            }
        });
        
        activityItems.forEach((item, index) => {
            const itemPosition = item.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (itemPosition < screenPosition) {
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateX(0)';
                }, index * 100);
            }
        });
    }
    
    // Establecer estados iniciales
    infoCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    
    activityItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    });
    
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Ejecutar una vez al cargar
});