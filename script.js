const featureTitle = document.getElementById("feature-title");
const featureCopy = document.getElementById("feature-copy");
const featureTag = document.getElementById("feature-tag");
const featureTime = document.getElementById("feature-time");
const hotspots = Array.from(document.querySelectorAll(".hotspot"));
const typewriterText = document.getElementById("typewriter-text");
const heroStage = document.getElementById("experience");
const menuToggle = document.getElementById("menu-toggle");
const siteNav = document.getElementById("site-nav");
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

  featureTitle.textContent = target.dataset.title;
  featureCopy.textContent = target.dataset.copy;
  featureTag.textContent = target.dataset.tag;
  featureTime.textContent = target.dataset.time;
}

hotspots.forEach((hotspot) => {
  hotspot.addEventListener("click", () => setActiveHotspot(hotspot));
});

if (hotspots[0]) {
  setActiveHotspot(hotspots[0]);
}

const testimonialsTrack = document.getElementById("testimonials-track");
if (testimonialsTrack) {
  testimonialsTrack.innerHTML += testimonialsTrack.innerHTML;
}

if (heroStage) {
  let ticking = false;

  const updateHeroStage = () => {
    const viewportHeight = window.innerHeight;
    const heroTop = heroStage.getBoundingClientRect().top + window.scrollY;
    const introEnd = Math.max(1, heroTop - viewportHeight * 0.18);
    const introProgress = Math.max(0, Math.min(1, window.scrollY / introEnd));
    const rect = heroStage.getBoundingClientRect();
    const start = viewportHeight * 0.5;
    const end = -heroStage.offsetHeight * 0.12;
    const rawProgress = (start - rect.top) / (start - end);
    const progress = Math.max(0, Math.min(1, rawProgress));

    heroStage.style.setProperty("--car-intro-progress", introProgress.toFixed(3));
    heroStage.classList.toggle("is-revealed", progress > 0.24);
    heroStage.classList.toggle("is-settled", progress > 0.4);
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
  window.addEventListener("load", requestUpdate);
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
