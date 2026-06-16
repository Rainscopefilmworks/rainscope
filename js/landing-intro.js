(function initLandingIntro() {
  const body = document.body;
  if (!body.classList.contains('landing-page')) return;

  const intro = document.getElementById('landing-intro');
  if (!intro) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const seenKey = 'rs-landing-intro-seen';
  const panelVideos = document.querySelectorAll('.panel-bg-video');

  function revealPanels() {
    body.classList.remove('is-intro-active');
    body.classList.add('is-intro-ready');
    intro.classList.add('is-hidden');
    panelVideos.forEach((video) => {
      video.play().catch(() => {});
    });
  }

  if (prefersReducedMotion || sessionStorage.getItem(seenKey) === '1') {
    intro.remove();
    body.classList.add('is-intro-ready');
    panelVideos.forEach((video) => {
      video.play().catch(() => {});
    });
    return;
  }

  body.classList.add('is-intro-active');

  const duration = 1600;
  window.setTimeout(() => {
    sessionStorage.setItem(seenKey, '1');
    revealPanels();
    window.setTimeout(() => intro.remove(), 1000);
  }, duration);
})();
