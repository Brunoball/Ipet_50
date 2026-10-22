"use strict";

/* =========================
   SLIDERS GENÉRICOS (perfil / evento)
   ========================= */
document.addEventListener("DOMContentLoaded", function () {
  initAllSliders();
});

function initAllSliders() {
  // Slider de perfil
  initSlider({
    sliderSelector: ".perfil-gallery-slider",
    slideSelector: ".gallery-slide",
    prevBtnSelector: ".gallery-prev",
    nextBtnSelector: ".gallery-next",
    dotsContainerSelector: ".gallery-dots",
  });

  // Slider de evento
  initSlider({
    sliderSelector: ".evento-slider",
    slideSelector: ".evento-slide",
    prevBtnSelector: ".evento-prev",
    nextBtnSelector: ".evento-next",
    dotsContainerSelector: ".evento-dots",
  });
}

function initSlider(config) {
  const slider = document.querySelector(config.sliderSelector);
  if (!slider) return;

  // Utilidades de scope con fallback global (por si botones/dots están fuera del slider)
  const qIn = (sel) => slider.querySelector(sel);
  const qInOrDoc = (sel) => qIn(sel) || document.querySelector(sel);

  // Slides deben estar dentro del slider
  const slides = slider.querySelectorAll(config.slideSelector);
  if (slides.length === 0) return;

  const prevBtn = qInOrDoc(config.prevBtnSelector);
  const nextBtn = qInOrDoc(config.nextBtnSelector);
  const dotsContainer = qInOrDoc(config.dotsContainerSelector);

  let currentSlide = 0;
  let slideInterval;
  let isTransitioning = false;
  let lastInteractionTime = 0;
  const CLICK_DELAY = 800; // ms

  // ---------- Dots ----------
  let dots;
  if (dotsContainer) {
    // Si ya existen dots en el HTML, usalos; si no, crealos
    dots = dotsContainer.querySelectorAll("span");
    if (dots.length !== slides.length) {
      // Rehacer para que coincidan 1:1 con slides
      dotsContainer.innerHTML = "";
      slides.forEach((_, index) => {
        const dot = document.createElement("span");
        dot.setAttribute("data-index", String(index));
        dotsContainer.appendChild(dot);
      });
      dots = dotsContainer.querySelectorAll("span");
    }

    // Click en dots
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        if (canInteract()) {
          goToSlide(index);
          resetInterval(); // IMPORTANTE: no perder el control del auto-rotate
        }
      });
    });
  } else {
    dots = [];
  }

  function canInteract() {
    const now = Date.now();
    return !isTransitioning && now - lastInteractionTime > CLICK_DELAY;
  }

  function setupSlider() {
    slides.forEach((slide, index) => {
      slide.style.opacity = index === 0 ? "1" : "0";
      slide.style.zIndex = index === 0 ? "1" : "0";
    });
    updateDots();
  }

  function goToSlide(index) {
    if (!canInteract()) return;

    lastInteractionTime = Date.now();
    isTransitioning = true;

    slides[currentSlide].style.opacity = "0";
    slides[currentSlide].style.zIndex = "0";

    currentSlide = (index + slides.length) % slides.length;

    slides[currentSlide].style.opacity = "1";
    slides[currentSlide].style.zIndex = "1";
    updateDots();

    setTimeout(() => {
      isTransitioning = false;
    }, CLICK_DELAY);
  }

  function updateDots() {
    if (dots && dots.length > 0) {
      dots.forEach((dot, index) => {
        dot.classList.toggle("active", index === currentSlide);
        // Opcional: aria
        dot.setAttribute("aria-current", index === currentSlide ? "true" : "false");
      });
    }
  }

  // Controles prev/next
  prevBtn?.addEventListener("click", () => {
    if (canInteract()) {
      goToSlide(currentSlide - 1);
      resetInterval();
    }
  });

  nextBtn?.addEventListener("click", () => {
    if (canInteract()) {
      goToSlide(currentSlide + 1);
      resetInterval();
    }
  });

  // Auto-rotación
  function autoRotate() {
    if (!isTransitioning) goToSlide(currentSlide + 1);
  }

  function startAutoRotation() {
    slideInterval = setInterval(autoRotate, 3000);
  }

  function resetInterval() {
    clearInterval(slideInterval);
    startAutoRotation();
  }

  // Inicializar
  setupSlider();
  startAutoRotation();

  // Pausa en hover sobre el slider (si el contenedor está por encima visualmente)
  slider.addEventListener("mouseenter", () => clearInterval(slideInterval));
  slider.addEventListener("mouseleave", startAutoRotation);
}

/* =========================
   LEER MÁS / MENOS (bloque 1)
   ========================= */
document.addEventListener("DOMContentLoaded", function () {
  const leerMasBtn = document.querySelector(".leer-mas-btn");
  const leerMasParagraphs = document.querySelectorAll(".LeerMas");

  if (leerMasBtn && leerMasParagraphs.length > 0) {
    leerMasBtn.addEventListener("click", function () {
      const isExpanded = this.getAttribute("aria-expanded") === "true";

      this.setAttribute("aria-expanded", String(!isExpanded));
      this.textContent = isExpanded ? "Leer más" : "Leer menos";

      leerMasParagraphs.forEach((p) => {
        if (isExpanded) p.classList.remove("active");
        else p.classList.add("active");
      });

      if (!isExpanded) {
        setTimeout(() => {
          this.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 300);
      }
    });
  }
});

/* =========================
   LEER MÁS / MENOS (bloque 2)
   ========================= */
document.addEventListener("DOMContentLoaded", function () {
  const readMoreBtn = document.querySelector(".read-more-btn");
  const extraContent = document.querySelector(".extra-content");
  const btnText = document.querySelector(".btn-text");

  if (!readMoreBtn || !extraContent || !btnText) return;

  readMoreBtn.addEventListener("click", function () {
    const isExpanded = extraContent.classList.contains("expanded");

    if (isExpanded) {
      extraContent.style.maxHeight = extraContent.scrollHeight + "px";
      requestAnimationFrame(() => {
        extraContent.style.maxHeight = "0px";
        extraContent.style.opacity = "0";
        extraContent.style.margin = "0";
      });
    } else {
      extraContent.style.maxHeight = extraContent.scrollHeight + "px";
      extraContent.style.opacity = "1";
      extraContent.style.margin = "1rem 0";
    }

    extraContent.classList.toggle("expanded");
    readMoreBtn.classList.toggle("expanded");
    btnText.textContent = isExpanded ? "Leer más" : "Leer menos";
  });
});

/* =========================
   CONTROL DEL BOTÓN ATRÁS
   ========================= */
document.addEventListener("DOMContentLoaded", function () {
  history.pushState({ stayOnPage: true }, "");
  history.replaceState(null, null, " ");

  window.addEventListener("popstate", function () {
    const isAtTop = window.scrollY < 50;
    if (!isAtTop) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      history.pushState({ stayOnPage: true }, "");
    }
  });
});
