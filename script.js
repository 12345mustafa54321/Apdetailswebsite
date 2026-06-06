const featureTitle = document.getElementById("feature-title");
const featureCopy = document.getElementById("feature-copy");
const featureTag = document.getElementById("feature-tag");
const featureTime = document.getElementById("feature-time");
const hotspots = Array.from(document.querySelectorAll(".hotspot"));
const typewriterText = document.getElementById("typewriter-text");
const heroStage = document.getElementById("experience");
const menuToggle = document.getElementById("menu-toggle");
const siteNav = document.getElementById("site-nav");
const testimonialsTrack = document.getElementById("testimonials-track");
const typewriterWords = [
  "cleaner finish.",
  "refined experience.",
  "sharper gloss.",
  "elevated standard."
];

function setActiveHotspot(target) {
  hotspots.forEach((hotspot) => {
    hotspot.classList.toggle("active", hotspot === target);
  });

  if (featureTitle) featureTitle.textContent = target.dataset.title || "";
  if (featureCopy) featureCopy.textContent = target.dataset.copy || "";
  if (featureTag) featureTag.textContent = target.dataset.tag || "";
  if (featureTime) featureTime.textContent = target.dataset.time || "";
}

hotspots.forEach((hotspot) => {
  hotspot.addEventListener("click", () => setActiveHotspot(hotspot));
});

if (hotspots[0]) {
  setActiveHotspot(hotspots[0]);
}

if (testimonialsTrack && !testimonialsTrack.dataset.duplicated) {
  testimonialsTrack.innerHTML += testimonialsTrack.innerHTML;
  testimonialsTrack.dataset.duplicated = "true";
}

if (heroStage) {
  let ticking = false;

  const updateHeroStage = () => {
    const stageStyles = window.getComputedStyle(heroStage);

    if (stageStyles.display === "none") {
      heroStage.style.setProperty("--car-intro-progress", "1");
      heroStage.classList.remove("is-revealed", "is-settled");
      ticking = false;
      return;
    }

    const viewportHeight = Math.max(window.innerHeight, 1);
    const rect = heroStage.getBoundingClientRect();
    const heroTop = window.scrollY + rect.top;
    const isCompactViewport = window.innerWidth <= 640;
    const introStart = Math.max(0, heroTop - viewportHeight * (isCompactViewport ? 0.92 : 1.42));
    const introDistance = Math.max(1, viewportHeight * (isCompactViewport ? 0.7 : 1.16));
    const introProgress = Math.max(
      0,
      Math.min(1, (window.scrollY - introStart) / introDistance)
    );
    const start = viewportHeight * (isCompactViewport ? 0.72 : 0.5);
    const end = -Math.max(heroStage.offsetHeight, 1) * 0.12;
    const rawProgress = (start - rect.top) / Math.max(start - end, 1);
    const progress = Math.max(0, Math.min(1, rawProgress));
    const revealThreshold = isCompactViewport ? 0.12 : 0.24;
    const settleThreshold = isCompactViewport ? 0.22 : 0.4;

    heroStage.style.setProperty("--car-intro-progress", introProgress.toFixed(3));
    heroStage.classList.toggle("is-revealed", progress > revealThreshold);
    heroStage.classList.toggle("is-settled", progress > settleThreshold);
    ticking = false;
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateHeroStage);
  };

  requestUpdate();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  window.addEventListener("orientationchange", requestUpdate);
  window.addEventListener("load", requestUpdate);

  if (typeof ResizeObserver !== "undefined") {
    const resizeObserver = new ResizeObserver(requestUpdate);
    resizeObserver.observe(heroStage);
  }

  if (document.fonts && typeof document.fonts.ready?.then === "function") {
    document.fonts.ready.then(requestUpdate).catch(() => {});
  }
}

if (typewriterText) {
  let wordIndex = 0;
  let charIndex = typewriterWords[0].length;
  let deleting = false;

  const tick = () => {
    const currentWord = typewriterWords[wordIndex];
    typewriterText.textContent = currentWord.slice(0, charIndex);

    if (!deleting && charIndex === currentWord.length) {
      deleting = true;
      window.setTimeout(tick, 1400);
      return;
    }

    if (deleting && charIndex === 0) {
      deleting = false;
      wordIndex = (wordIndex + 1) % typewriterWords.length;
      window.setTimeout(tick, 220);
      return;
    }

    charIndex += deleting ? -1 : 1;
    window.setTimeout(tick, deleting ? 42 : 78);
  };

  window.setTimeout(tick, 900);
}

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}
