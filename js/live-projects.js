// Live project gallery: deferred preview loops + modal (video, embed, or photo gallery)
(function initDeferredLiveProjectVideos() {
  function setupDeferredVideos() {
    const videos = document.querySelectorAll("video[data-deferred-live-project]");
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

(function initLiveProjectModal() {
  const modal = document.getElementById("liveProjectModal");
  const modalVideo = document.getElementById("liveProjectModalVideo");
  const modalEmbed = document.getElementById("liveProjectModalEmbed");
  const modalGallery = document.getElementById("liveProjectModalGallery");
  const modalTitle = document.getElementById("liveProjectModalTitle");
  const modalCategory = document.getElementById("liveProjectModalCategory");
  const modalDescription = document.getElementById("liveProjectModalDescription");
  const closeButton = modal?.querySelector(".work-modal-close");
  const cards = document.querySelectorAll(".live-project-item");
  let lastTrigger = null;

  if (!modal || !modalVideo || !modalEmbed || !modalGallery || cards.length === 0) return;

  function clearModalMedia() {
    modalVideo.hidden = true;
    modalEmbed.hidden = true;
    modalGallery.hidden = true;
    modalEmbed.removeAttribute("src");
    modalVideo.removeAttribute("src");
    modalGallery.innerHTML = "";
  }

  function renderGallery(images, title) {
    modalGallery.innerHTML = "";
    images.forEach((src, index) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = `${title} photo ${index + 1}`;
      img.loading = index === 0 ? "eager" : "lazy";
      modalGallery.appendChild(img);
    });
    modalGallery.hidden = images.length === 0;
  }

  function syncProjectHash(card) {
    const projectKey = card?.dataset.project;
    if (!projectKey || window.location.hash === `#${projectKey}`) return;
    history.replaceState(null, "", `#${projectKey}`);
  }

  function clearProjectHash() {
    if (!window.location.hash) return;
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }

  function parseImages(card) {
    const raw = card.getAttribute("data-images");
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return [];
    }
  }

  function openModal(card) {
    lastTrigger = card;
    const videoSrc = card.getAttribute("data-video");
    const embedSrc = card.getAttribute("data-embed");
    const images = parseImages(card);
    const title = card.getAttribute("data-title") || "Project";

    modalTitle.textContent = title;
    modalCategory.textContent = card.getAttribute("data-category") || "";
    modalDescription.textContent = card.getAttribute("data-description") || "";
    clearModalMedia();

    if (embedSrc) {
      modalEmbed.src = embedSrc;
      modalEmbed.hidden = false;
    } else if (videoSrc) {
      modalVideo.src = videoSrc;
      modalVideo.load();
      modalVideo.hidden = false;
    } else if (images.length > 0) {
      renderGallery(images, title);
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
    clearModalMedia();
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
    const matchingCard = document.querySelector(`.live-project-item[data-project="${projectKey}"]`);
    if (!matchingCard) return;
    matchingCard.scrollIntoView({ block: "center", behavior: "auto" });
    openModal(matchingCard);
  }

  openFromHash();
  window.addEventListener("hashchange", openFromHash);
})();
