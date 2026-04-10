import { escapeHtml } from "../utils/formatters.js";

export function renderCarousel(images, title) {
  return `
    <div class="carousel" data-carousel>
      <div class="carousel-stage">
        ${images
          .map(
            (image, index) => `
              <figure class="carousel-slide ${index === 0 ? "is-active" : ""}" data-slide="${index}">
                <img src="${image}" alt="${escapeHtml(title)} vista ${index + 1}" />
              </figure>
            `,
          )
          .join("")}

        <button class="carousel-nav prev" type="button" data-carousel-nav="-1" aria-label="Imagen anterior">
          ←
        </button>
        <button class="carousel-nav next" type="button" data-carousel-nav="1" aria-label="Imagen siguiente">
          →
        </button>
        <span class="carousel-counter" data-carousel-counter>1 / ${images.length}</span>
      </div>

      <div class="gallery-strip glass-panel">
        <div class="thumb-list">
          ${images
            .map(
              (image, index) => `
                <button
                  class="thumb-button ${index === 0 ? "is-active" : ""}"
                  type="button"
                  data-carousel-thumb="${index}"
                  aria-label="Ir a imagen ${index + 1}"
                >
                  <img src="${image}" alt="${escapeHtml(title)} miniatura ${index + 1}" />
                </button>
              `,
            )
            .join("")}
        </div>
      </div>
    </div>
  `;
}

export function bindCarousel(root) {
  if (!root) {
    return () => {};
  }

  const slides = Array.from(root.querySelectorAll("[data-slide]"));
  const thumbs = Array.from(root.querySelectorAll("[data-carousel-thumb]"));
  const counter = root.querySelector("[data-carousel-counter]");
  let currentIndex = 0;
  let touchStart = 0;

  const update = (nextIndex) => {
    currentIndex = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, index) => slide.classList.toggle("is-active", index === currentIndex));
    thumbs.forEach((thumb, index) => thumb.classList.toggle("is-active", index === currentIndex));
    if (counter) {
      counter.textContent = `${currentIndex + 1} / ${slides.length}`;
    }
  };

  const clickHandler = (event) => {
    const navButton = event.target.closest("[data-carousel-nav]");
    if (navButton) {
      update(currentIndex + Number(navButton.dataset.carouselNav));
      return;
    }

    const thumbButton = event.target.closest("[data-carousel-thumb]");
    if (thumbButton) {
      update(Number(thumbButton.dataset.carouselThumb));
    }
  };

  const touchStartHandler = (event) => {
    touchStart = event.changedTouches[0].clientX;
  };

  const touchEndHandler = (event) => {
    const delta = event.changedTouches[0].clientX - touchStart;
    if (Math.abs(delta) < 24) {
      return;
    }

    update(currentIndex + (delta > 0 ? -1 : 1));
  };

  root.addEventListener("click", clickHandler);
  root.addEventListener("touchstart", touchStartHandler, { passive: true });
  root.addEventListener("touchend", touchEndHandler, { passive: true });

  return () => {
    root.removeEventListener("click", clickHandler);
    root.removeEventListener("touchstart", touchStartHandler);
    root.removeEventListener("touchend", touchEndHandler);
  };
}
