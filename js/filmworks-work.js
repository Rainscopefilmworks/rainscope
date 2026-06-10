// Work reel gallery: deferred preview loops + modal player (filmworks page)
(function initDeferredWorkVideos() {
  function setupDeferredVideos() {
    const videos = document.querySelectorAll("video[data-deferred-work-video]");
    if (!videos.length) return;

    function loadVideo(video) {
      if (video.dataset.videoLoaded === "true") return;
      const source = video.querySelector("source[data-src]");
      if (!source) return;
      source.src = source.dataset.src;
      source.removeAttribute("data-src");
      video.load();
      video.dataset.videoLoaded = "true";
    }

    async function playVideo(video) {
      loadVideo(video);
      if (video.dataset.videoPlaying === "true") return;
      try {
        await video.play();
        video.dataset.videoPlaying = "true";
      } catch {
        video.dataset.videoPlaying = "false";
      }
    }

    function pauseVideo(video) {
      video.pause();
      video.dataset.videoPlaying = "false";
    }

    if (!("IntersectionObserver" in window)) {
      videos.forEach((video) => playVideo(video));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            playVideo(video);
          } else if (video.dataset.videoLoaded === "true") {
            pauseVideo(video);
          }
        });
      },
      { rootMargin: "220px 0px", threshold: 0.2 }
    );

    videos.forEach((video) => observer.observe(video));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupDeferredVideos);
  } else {
    setupDeferredVideos();
  }
})();

(function initWorkModal() {
  const modal = document.getElementById("workModal");
  const modalVideo = document.getElementById("workModalVideo");
  const modalEmbed = document.getElementById("workModalEmbed");
  const modalTitle = document.getElementById("workModalTitle");
  const modalCategory = document.getElementById("workModalCategory");
  const modalDescription = document.getElementById("workModalDescription");
  const closeButton = modal?.querySelector(".work-modal-close");
  const cards = document.querySelectorAll(".video-gallery-item");
  let lastTrigger = null;

  if (!modal || !modalVideo || !modalEmbed || cards.length === 0) return;

  function syncProjectHash(card) {
    const projectKey = card?.dataset.project;
    if (!projectKey || window.location.hash === `#${projectKey}`) return;
    history.replaceState(null, "", `#${projectKey}`);
  }

  function clearProjectHash() {
    if (!window.location.hash) return;
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }

  function openModal(card) {
    lastTrigger = card;
    const videoSrc = card.getAttribute("data-video");
    const embedSrc = card.getAttribute("data-embed");
    modalTitle.textContent = card.getAttribute("data-title") || "Project";
    modalCategory.textContent = card.getAttribute("data-category") || "";
    modalDescription.textContent = card.getAttribute("data-description") || "";
    modalVideo.hidden = true;
    modalEmbed.hidden = true;
    modalEmbed.removeAttribute("src");
    modalVideo.removeAttribute("src");

    if (embedSrc) {
      modalEmbed.src = embedSrc;
      modalEmbed.hidden = false;
    } else if (videoSrc) {
      modalVideo.src = videoSrc;
      modalVideo.load();
      modalVideo.hidden = false;
    }

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    syncProjectHash(card);
    closeButton?.focus();
  }

  function closeModal() {
    if (document.activeElement instanceof HTMLElement && modal.contains(document.activeElement)) {
      (lastTrigger || closeButton)?.focus();
    }
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    modalVideo.pause();
    modalVideo.removeAttribute("src");
    modalVideo.load();
    modalVideo.hidden = true;
    modalEmbed.removeAttribute("src");
    modalEmbed.hidden = true;
    clearProjectHash();
  }

  cards.forEach((card) => {
    card.addEventListener("click", () => openModal(card));
  });

  modal.addEventListener("click", (event) => {
    if (event.target.hasAttribute("data-close") || event.target === modal) {
      closeModal();
    }
  });

  closeButton?.addEventListener("click", closeModal);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("open")) {
      closeModal();
    }
  });

  function openFromHash() {
    const projectKey = window.location.hash.replace(/^#/, "");
    if (!projectKey) return;
    const matchingCard = document.querySelector(`.video-gallery-item[data-project="${projectKey}"]`);
    if (!matchingCard) return;
    matchingCard.scrollIntoView({ block: "center", behavior: "auto" });
    openModal(matchingCard);
  }

  openFromHash();
  window.addEventListener("hashchange", openFromHash);
})();
