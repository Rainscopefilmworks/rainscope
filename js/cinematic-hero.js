(function initCinematicHero() {
  const body = document.body;
  if (!body.classList.contains('hero-cinematic')) return;

  const hero = document.querySelector('.hero-reel--cinematic');
  const header = document.querySelector('header.site-header');
  const video = hero?.querySelector('.hero-reel-video');
  const unmuteBtn = hero?.querySelector('.hero-unmute-btn');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (header && hero) {
    const onScroll = () => {
      const progress = Math.min(window.scrollY / hero.offsetHeight, 1);
      header.classList.toggle('is-scrolled', window.scrollY > hero.offsetHeight * 0.15);
      if (!prefersReducedMotion) {
        hero.style.setProperty('--hero-scroll', progress.toFixed(4));
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  if (!video || !unmuteBtn || prefersReducedMotion) {
    unmuteBtn?.remove();
    return;
  }

  unmuteBtn.addEventListener('click', async () => {
    const shouldUnmute = video.muted;
    video.muted = !shouldUnmute;
    unmuteBtn.classList.toggle('is-unmuted', shouldUnmute);
    unmuteBtn.setAttribute('aria-pressed', shouldUnmute ? 'true' : 'false');
    unmuteBtn.querySelector('.hero-unmute-label').textContent = shouldUnmute ? 'Sound on' : 'Unmute';

    if (shouldUnmute) {
      try {
        await video.play();
      } catch {
        video.muted = true;
        unmuteBtn.classList.remove('is-unmuted');
        unmuteBtn.setAttribute('aria-pressed', 'false');
        unmuteBtn.querySelector('.hero-unmute-label').textContent = 'Unmute';
      }
    }
  });
})();
