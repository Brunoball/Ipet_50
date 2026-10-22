let customSlideIndex = 1;
let customSlideInterval;

const customSlider = document.querySelector('.custom-slider');
const customSlides = document.querySelectorAll('.custom-slide');
const customAnteriorBtn = document.querySelector('.custom-anterior');
const customSiguienteBtn = document.querySelector('.custom-siguiente');
const customDots = document.querySelectorAll('.custom-punto');

const customTotalSlides = customSlides.length;

// Función para mostrar la diapositiva activa
function customShowSlides(n) {
    customSlideIndex = n;

    if (customSlideIndex > customTotalSlides) {
        customSlideIndex = 1;
    } else if (customSlideIndex < 1) {
        customSlideIndex = customTotalSlides;
    }

    const offset = -(customSlideIndex - 1) * 10; // Calcula el desplazamiento vertical (20% por slide)

    customSlider.style.transform = `translateY(${offset}%)`; // Aplica el desplazamiento

    // Actualizar los puntos de navegación
    if (customDots.length > 0) {
        customDots.forEach(dot => dot.classList.remove("active"));
        customDots[customSlideIndex - 1].classList.add("active");
    }
}

// Función para pasar a la siguiente diapositiva
function customNextSlide() {
    customShowSlides(customSlideIndex + 1);
}

// Función para volver a la diapositiva anterior
function customPrevSlide() {
    customShowSlides(customSlideIndex - 1);
}

// Inicia el intervalo automático
function customStartSlideInterval() {
    customSlideInterval = setInterval(customNextSlide, 7000);
}

// Detiene el intervalo automático
function customStopSlideInterval() {
    clearInterval(customSlideInterval);
}

// Permite la navegación a una diapositiva específica
function customCurrentSlide(n) {
    customStopSlideInterval();
    customShowSlides(n);
    customStartSlideInterval();
}

// Mostrar la diapositiva inicial
customShowSlides(customSlideIndex);
customStartSlideInterval();

// Eventos para los botones de navegación
customSiguienteBtn.addEventListener('click', function() {
    customStopSlideInterval();
    customNextSlide();
    customStartSlideInterval();
});

customAnteriorBtn.addEventListener('click', function() {
    customStopSlideInterval();
    customPrevSlide();
    customStartSlideInterval();
});










let slideIndex2 = 0;
let slideInterval2;
const slides2 = document.querySelectorAll('.slide2');
const totalSlides2 = slides2.length - 1;

function showSlides2(index) {
    // Asegura que el índice esté dentro del rango
    slideIndex2 = (index < 0) ? totalSlides2 - 1 : (index >= totalSlides2) ? 0 : index;

    const offset = -(slideIndex2 * (80 / totalSlides2)); // Ajusta el desplazamiento en porcentaje

    const slider = document.querySelector('.slides2');
    slider.style.transition = "transform 0.5s ease";
    slider.style.transform = `translateX(${offset}%)`;

    const dots = document.querySelectorAll('.punto2');
    dots.forEach(dot => dot.classList.remove('active2'));
    dots[slideIndex2].classList.add('active2');
}

function nextSlide2() {
    showSlides2(slideIndex2 + 1);
}

function prevSlide2() {
    showSlides2(slideIndex2 - 1);
}

function startSlideInterval2() {
    slideInterval2 = setInterval(nextSlide2, 7000);
}

function stopSlideInterval2() {
    clearInterval(slideInterval2);
}

function currentSlide2(n) {
    clearInterval(slideInterval2);
    showSlides2(n - 1);
    startSlideInterval2();
}

// Inicializa slider2
showSlides2(slideIndex2);
startSlideInterval2();

// Event listeners para botones de navegación
document.querySelector('.prev2').addEventListener('click', () => {
    stopSlideInterval2();
    prevSlide2();
    startSlideInterval2();
});

document.querySelector('.next2').addEventListener('click', () => {
    stopSlideInterval2();
    nextSlide2();
    startSlideInterval2();
});

// Event listeners para los puntos de navegación
document.querySelectorAll('.punto2').forEach((dot, index) => {
    dot.addEventListener('click', () => {
        stopSlideInterval2();
        currentSlide2(index + 1);
        startSlideInterval2();
    });
});




