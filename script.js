// The speed slider changes the dancer's travel and limb animation together.
const tempoSlider = document.querySelector("#tempo");
const tempoValue = document.querySelector("#tempo-value");
const dancer = document.querySelector(".dancer");

if (tempoSlider && dancer) {
  function updateTempo() {
    const speed = Number(tempoSlider.value);
    const minimum = Number(tempoSlider.min) || 1;
    const maximum = Number(tempoSlider.max) || 10;
    const progress = (speed - minimum) / Math.max(1, maximum - minimum);
    // Moving right shortens the travel and limb loops, so the whole figure speeds up.
    const duration = 14 - progress * 11;
    // Inline important values also keep the slider usable when reduced-motion
    // settings shorten all CSS animations across the rest of the page.
    dancer.style.setProperty("animation-duration", `${duration}s`, "important");
    dancer.style.setProperty("animation-iteration-count", "infinite", "important");
    dancer.querySelectorAll(".dancer-arm, .dancer-leg").forEach((limb) => {
      const multiplier = limb.classList.contains("dancer-arm") ? 0.23 : 0.19;
      limb.style.setProperty("animation-duration", `${Math.max(0.35, duration * multiplier)}s`, "important");
      limb.style.setProperty("animation-iteration-count", "infinite", "important");
    });

    let description = "STEADY";
    if (progress < 0.3) description = "SLOW";
    else if (progress > 0.7) description = "FAST";
    if (tempoValue) tempoValue.textContent = description;
    tempoSlider.setAttribute("aria-valuetext", description.toLowerCase());
  }

  tempoSlider.addEventListener("input", updateTempo);
  updateTempo();
}

// The body page uses the scroll position to zoom into the figure and reveal
// one reflection card at a time in the same full-screen scene.
const bodyJourney = document.querySelector(".body-journey");
if (bodyJourney) {
  const bodyVisual = bodyJourney.querySelector(".body-visual");
  const bodyFigure = bodyVisual.querySelector(".body-silhouette");
  const bodyLabels = [...bodyVisual.querySelectorAll(".body-label")];
  const bodyStops = [...bodyJourney.querySelectorAll(".body-note")];
  const bodyImages = [...bodyJourney.querySelectorAll(".body-image-frame")];
  let ticking = false;

  function updateBodyJourney() {
    const bounds = bodyJourney.getBoundingClientRect();
    const travel = Math.max(1, bodyJourney.offsetHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, -bounds.top / travel));
    const zoom = 0.88 + progress * 4.2;
    bodyFigure.style.transform = `translate(-50%, -49%) scale(${zoom.toFixed(2)})`;
    bodyFigure.style.opacity = Math.max(0.08, 1 - progress * 1.05).toFixed(2);
    const labelOpacity = Math.max(0, 0.8 - progress * 2.2).toFixed(2);
    bodyLabels.forEach((label) => { label.style.opacity = labelOpacity; });

    const activeIndex = Math.min(bodyStops.length - 1, Math.floor(progress * bodyStops.length));
    bodyStops.forEach((stop, index) => {
      stop.classList.toggle("active", index === activeIndex);
      if (index === activeIndex) stop.setAttribute("aria-current", "step");
      else stop.removeAttribute("aria-current");
    });
    bodyImages.forEach((frame, index) => {
      frame.classList.toggle("active", index === activeIndex);
      frame.classList.toggle("passed", index < activeIndex);
      frame.classList.toggle("upcoming", index > activeIndex);
    });
    ticking = false;
  }

  function requestBodyUpdate() {
    if (!ticking) {
      window.requestAnimationFrame(updateBodyJourney);
      ticking = true;
    }
  }
  window.addEventListener("scroll", requestBodyUpdate, { passive: true });
  window.addEventListener("resize", requestBodyUpdate);
  requestBodyUpdate();
}

// Carousel buttons move one large element card at a time.
const carousel = document.querySelector("#element-carousel");
const currentSlide = document.querySelector("#carousel-current");
if (carousel) {
  const cards = [...carousel.querySelectorAll(".element-card")];
  const previous = document.querySelector("#carousel-prev");
  const next = document.querySelector("#carousel-next");

  function goToCard(index) {
    const safeIndex = Math.max(0, Math.min(cards.length - 1, index));
    cards[safeIndex].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    if (currentSlide) currentSlide.textContent = String(safeIndex + 1).padStart(2, "0");
  }
  previous?.addEventListener("click", () => goToCard(Math.round(carousel.scrollLeft / cards[0].offsetWidth) - 1));
  next?.addEventListener("click", () => goToCard(Math.round(carousel.scrollLeft / cards[0].offsetWidth) + 1));
  carousel.addEventListener("scroll", () => {
    const index = Math.max(0, Math.min(cards.length - 1, Math.round(carousel.scrollLeft / cards[0].offsetWidth)));
    if (currentSlide) currentSlide.textContent = String(index + 1).padStart(2, "0");
  }, { passive: true });
}
