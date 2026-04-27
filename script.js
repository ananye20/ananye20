const reveals = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

reveals.forEach((element) => revealObserver.observe(element));

const carousels = document.querySelectorAll("[data-carousel]");

carousels.forEach((carousel) => {
  const track = carousel.querySelector("[data-carousel-track]");
  const slides = Array.from(track.children);
  const prevButton = carousel.querySelector("[data-carousel-prev]");
  const nextButton = carousel.querySelector("[data-carousel-next]");
  const dotsContainer = carousel.querySelector("[data-carousel-dots]");
  const viewport = carousel.querySelector(".experience-viewport");
  const tabs = Array.from(carousel.querySelectorAll("[data-carousel-tab]"));
  const label = carousel.dataset.carouselLabel || "slide";
  let currentIndex = 0;
  let startX = 0;
  let currentTranslate = 0;
  let isDragging = false;

  const dots = slides.map((_, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "experience-dot";
    button.setAttribute("aria-label", `Go to ${label} ${index + 1}`);
    button.addEventListener("click", () => {
      currentIndex = index;
      updateCarousel();
    });
    dotsContainer.appendChild(button);
    return button;
  });

  const updateCarousel = () => {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === currentIndex);
    });
    tabs.forEach((tab, index) => {
      const isActive = index === currentIndex;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });
  };

  const getClientX = (event) => {
    if (event.touches && event.touches.length > 0) {
      return event.touches[0].clientX;
    }

    if (event.changedTouches && event.changedTouches.length > 0) {
      return event.changedTouches[0].clientX;
    }

    return event.clientX;
  };

  const startDrag = (event) => {
    isDragging = true;
    startX = getClientX(event);
    currentTranslate = -currentIndex * viewport.offsetWidth;
    viewport.classList.add("is-dragging");
  };

  const onDrag = (event) => {
    if (!isDragging) {
      return;
    }

    const deltaX = getClientX(event) - startX;
    track.style.transform = `translateX(${currentTranslate + deltaX}px)`;
  };

  const endDrag = (event) => {
    if (!isDragging) {
      return;
    }

    const deltaX = getClientX(event) - startX;
    const threshold = viewport.offsetWidth * 0.18;

    if (deltaX < -threshold) {
      currentIndex = (currentIndex + 1) % slides.length;
    } else if (deltaX > threshold) {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    }

    isDragging = false;
    viewport.classList.remove("is-dragging");
    updateCarousel();
  };

  prevButton.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateCarousel();
  });

  nextButton.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % slides.length;
    updateCarousel();
  });

  tabs.forEach((tab, index) => {
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-selected", "false");
    tab.addEventListener("click", () => {
      currentIndex = index;
      updateCarousel();
    });
  });

  viewport.addEventListener("touchstart", startDrag, { passive: true });
  viewport.addEventListener("touchmove", onDrag, { passive: true });
  viewport.addEventListener("touchend", endDrag);
  viewport.addEventListener("mousedown", startDrag);
  window.addEventListener("mousemove", onDrag);
  window.addEventListener("mouseup", endDrag);
  window.addEventListener("mouseleave", endDrag);
  window.addEventListener("resize", updateCarousel);

  updateCarousel();
});
