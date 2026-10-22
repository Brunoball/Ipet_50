let slideIndex4 = 1; // Comienza con la primera diapositiva
let slideInterval4;

function showSlides4(n) {
    const slides = document.querySelectorAll('.slide4');
    const dots = document.querySelectorAll('.punto4');
    const totalSlides = slides.length;

    // Asegura que el índice esté en el rango correcto
    if (n > totalSlides) { slideIndex4 = 1; }
    if (n < 1) { slideIndex4 = totalSlides; }

    // Mueve el contenedor a la diapositiva correspondiente
    const offset = -((slideIndex4 - 1) * (100 / totalSlides)); // Ajusta el desplazamiento en porcentaje
    document.querySelector('.slides4').style.transform = `translateX(${offset}%)`;

    // Actualiza la clase activa de los puntos
    dots.forEach(dot => dot.classList.remove("active4"));
    dots[slideIndex4 - 1].classList.add("active4");
}

function nextSlide4() {
    showSlides4(slideIndex4 += 1); // Incrementa el índice
}

function prevSlide4() {
    showSlides4(slideIndex4 -= 1); // Decrementa el índice
}

function startSlideInterval4() {
    slideInterval4 = setInterval(nextSlide4, 7000); // Cambia cada 7 segundos
}

function stopSlideInterval4() {
    clearInterval(slideInterval4);
}

function currentSlide4(n) {
    clearInterval(slideInterval4); // Detiene el intervalo
    showSlides4(slideIndex4 = n); // Muestra la diapositiva especificada
    startSlideInterval4(); // Reinicia el intervalo
}

// Inicializa slider4
document.addEventListener("DOMContentLoaded", function() {
    showSlides4(slideIndex4);
    startSlideInterval4();

    // Event listeners para los botones de navegación
    document.querySelector('.prev4').addEventListener('click', prevSlide4);
    document.querySelector('.next4').addEventListener('click', nextSlide4);

    // Event listeners para los puntos de navegación
    document.querySelectorAll('.punto4').forEach((dot, index) => {
        dot.addEventListener('click', () => {
            stopSlideInterval4();
            currentSlide4(index + 1);
        });
    });
});
















let slideIndex5 = 1; // Comienza con la primera diapositiva
let slideInterval5;

function showSlides5(n) {
    const slides = document.querySelectorAll('.slide5');
    const dots = document.querySelectorAll('.punto5');
    const totalSlides = slides.length;

    // Asegura que el índice esté en el rango correcto
    if (n > totalSlides) { slideIndex5 = 1; }
    if (n < 1) { slideIndex5 = totalSlides; }

    // Mueve el contenedor a la diapositiva correspondiente
    const offset = -((slideIndex5 - 1) * (100 / totalSlides)); // Ajusta el desplazamiento en porcentaje
    document.querySelector('.slides5').style.transform = `translateX(${offset}%)`;

    // Actualiza la clase activa de los puntos
    dots.forEach(dot => dot.classList.remove("active5"));
    dots[slideIndex5 - 1].classList.add("active5");
}

function nextSlide5() {
    showSlides5(slideIndex5 += 1); // Incrementa el índice
}

function prevSlide5() {
    showSlides5(slideIndex5 -= 1); // Decrementa el índice
}

function startSlideInterval5() {
    slideInterval5 = setInterval(nextSlide5, 7000); // Cambia cada 7 segundos
}

function stopSlideInterval5() {
    clearInterval(slideInterval5);
}

function currentSlide5(n) {
    clearInterval(slideInterval5); // Detiene el intervalo
    showSlides5(slideIndex5 = n); // Muestra la diapositiva especificada
    startSlideInterval5(); // Reinicia el intervalo
}

// Inicializa slider5
document.addEventListener("DOMContentLoaded", function() {
    showSlides5(slideIndex5);
    startSlideInterval5();

    // Event listeners para los botones de navegación
    document.querySelector('.prev5').addEventListener('click', prevSlide5);
    document.querySelector('.next5').addEventListener('click', nextSlide5);

    // Event listeners para los puntos de navegación
    document.querySelectorAll('.punto5').forEach((dot, index) => {
        dot.addEventListener('click', () => {
            stopSlideInterval5();
            currentSlide5(index + 1);
        });
    });
});