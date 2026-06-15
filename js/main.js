document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. Scroll Reveal Animations (IntersectionObserver)
     ========================================================================== */
  const revealElements = document.querySelectorAll('.reveal');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    revealElements.forEach(el => el.classList.add('active'));
    document.querySelectorAll('.hero-reel-video').forEach((video) => {
      video.pause();
      video.removeAttribute('autoplay');
    });
  } else if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target); // Animates once
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback if IntersectionObserver is unsupported
    revealElements.forEach(el => el.classList.add('active'));
  }

  /* ==========================================================================
     2. Native <dialog> Modals & Light-Dismiss Fallbacks
     ========================================================================== */
  const dialogs = document.querySelectorAll('dialog');

  dialogs.forEach(dialog => {
    // Fallback for light-dismiss (clicking outside the dialog content box)
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;

        const rect = dialog.getBoundingClientRect();
        const isDialogContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );

        if (!isDialogContent) {
          dialog.close();
        }
      });
    }
  });

  /* ==========================================================================
     3. Filmworks Page: Dynamic Film Modal Populator
     ========================================================================== */
  const filmCards = document.querySelectorAll('.film-card');
  const filmModal = document.getElementById('film-modal');
  
  if (filmCards.length && filmModal) {
    const modalMediaBox = document.getElementById('modal-media-box');
    const modalPosterImg = document.getElementById('modal-poster-img');
    const modalYear = document.getElementById('modal-film-year');
    const modalTitle = document.getElementById('modal-film-title');
    const modalLogline = document.getElementById('modal-film-logline');
    
    const creditsMap = {
      cast: document.getElementById('modal-cast'),
      director: document.getElementById('modal-director'),
      writer: document.getElementById('modal-writer'),
      dop: document.getElementById('modal-dop'),
      designer: document.getElementById('modal-designer'),
      producer: document.getElementById('modal-producer')
    };

    filmCards.forEach(card => {
      card.addEventListener('click', () => {
        const title = card.getAttribute('data-title');
        const year = card.getAttribute('data-year');
        const logline = card.getAttribute('data-logline');
        const youtubeId = card.getAttribute('data-youtube');
        const poster = card.getAttribute('data-poster');

        // Populate text details
        modalTitle.textContent = title;
        modalYear.textContent = year;
        modalLogline.textContent = logline;

        // Populate credits
        for (const [key, element] of Object.entries(creditsMap)) {
          if (element) {
            element.textContent = card.getAttribute(`data-${key}`) || 'N/A';
          }
        }

        // Set up media (Video embed or static poster image)
        modalMediaBox.innerHTML = ''; // Clear previous media
        
        if (youtubeId) {
          modalMediaBox.classList.add('has-video');
          const iframe = document.createElement('iframe');
          iframe.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`;
          iframe.title = `${title} video player`;
          iframe.allow = 'autoplay; encrypted-media';
          iframe.allowFullscreen = true;
          modalMediaBox.appendChild(iframe);
        } else {
          modalMediaBox.classList.remove('has-video');
          const img = document.createElement('img');
          img.src = poster;
          img.alt = `${title} Poster`;
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.objectFit = 'cover';
          modalMediaBox.appendChild(img);
        }

        filmModal.showModal();
      });
    });

    // Clean up when modal closes (e.g. stop playing video audio)
    filmModal.addEventListener('close', () => {
      modalMediaBox.innerHTML = '';
    });
  }

  /* ==========================================================================
     4. Accessibility & Native Form Validation
     ========================================================================== */
  
  // Sync visually user-invalid states with standard accessibility aria-invalid
  const syncAria = (el) => {
    if (el.hasAttribute && (el.classList.contains('form-input') || el.classList.contains('form-textarea') || el.classList.contains('form-select'))) {
      const isInvalid = el.matches(':user-invalid') || el.classList.contains('user-invalid-fallback');
      el.setAttribute('aria-invalid', isInvalid ? 'true' : 'false');
    }
  };

  document.addEventListener('blur', (e) => syncAria(e.target), true);
  document.addEventListener('input', (e) => {
    if (e.target.hasAttribute('aria-invalid')) {
      syncAria(e.target);
    }
  });

  // Polyfill fallback for browsers lacking :user-invalid (WeakMap tracking interaction dirty flags)
  const UserInvalidFallback = (() => {
    const dirtyState = new WeakMap();

    const updateState = (input) => {
      const isValid = input.checkValidity();
      input.classList.toggle('user-invalid-fallback', !isValid);
      input.classList.toggle('user-valid-fallback', isValid);
      
      if (!isValid) {
        input.setAttribute('aria-invalid', 'true');
      } else {
        input.removeAttribute('aria-invalid');
      }
    };

    const handleEvent = (event) => {
      const input = event.target;

      if (event.type === 'reset') {
        const controls = input.elements || [];
        for (const control of controls) {
          dirtyState.delete(control);
          control.classList.remove('user-invalid-fallback');
          control.classList.remove('user-valid-fallback');
          control.removeAttribute('aria-invalid');
        }
        return;
      }

      if (!input.checkValidity) return;

      if (event.type === 'input' || event.type === 'change') {
        const state = dirtyState.get(input) || { hasInteracted: false, hasBlurred: false };
        state.hasInteracted = true;
        dirtyState.set(input, state);
        if (state.hasBlurred) {
          updateState(input);
        }
      } else if (event.type === 'blur') {
        const state = dirtyState.get(input) || { hasInteracted: false, hasBlurred: false };
        state.hasBlurred = true;
        dirtyState.set(input, state);
        if (state.hasInteracted) {
          updateState(input);
        }
      }
    };

    const init = (root = document) => {
      if (CSS.supports('selector(:user-invalid)')) return;

      root.addEventListener('blur', handleEvent, true); // Capture phase
      root.addEventListener('input', handleEvent);
      root.addEventListener('change', handleEvent);
      root.addEventListener('reset', handleEvent, true); // Capture resets
    };

    return { init };
  })();

  // Initialize form validation fallbacks
  const allForms = document.querySelectorAll('form');
  const googleFormIds = new Set(['project-planner-form', 'live-consultation-form']);

  allForms.forEach(form => {
    if (form.id === 'quote-submission-form') return;

    UserInvalidFallback.init(form);

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const formFields = form.querySelectorAll('input, textarea, select');
      let isFormValid = true;
      let firstInvalidField = null;
      const submitButton = form.querySelector('[type="submit"]');

      // Scan validity and flag fallbacks
      formFields.forEach(field => {
        if (field.checkValidity) {
          const isValid = field.checkValidity();
          if (!isValid) {
            isFormValid = false;
            field.classList.add('user-invalid-fallback');
            field.setAttribute('aria-invalid', 'true');
            if (!firstInvalidField) firstInvalidField = field;
          } else {
            field.classList.remove('user-invalid-fallback');
            field.classList.add('user-valid-fallback');
            field.removeAttribute('aria-invalid');
          }
        }
      });

      if (!isFormValid) {
        if (firstInvalidField) {
          firstInvalidField.focus();
        }
        return;
      }

      const container = form.parentElement;
      const originalTitle = container.querySelector('.section-title');
      const usesGoogleForms = googleFormIds.has(form.id) && window.GoogleForms;

      if (usesGoogleForms) {
        if (submitButton) submitButton.disabled = true;

        try {
          await window.GoogleForms.submitToGoogleForm(form);
        } catch (error) {
          if (submitButton) submitButton.disabled = false;
          alert('Something went wrong while sending your request. Please try again.');
          return;
        }

        if (submitButton) submitButton.disabled = false;
      }

      // Success visuals
      container.style.opacity = '0';
      container.style.transform = 'translateY(10px)';
      container.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

      setTimeout(() => {
        if (originalTitle) originalTitle.style.display = 'none';
        
        let successMessage = '';
        if (form.id === 'project-planner-form') {
          successMessage = `
            <div style="text-align: center; padding: 2rem 0; animation: fadeIn 0.6s ease forwards;">
              <div style="font-size: 3rem; margin-bottom: 1rem; color: var(--color-accent);">✓</div>
              <h3 class="font-display" style="font-size: 1.75rem; text-transform: uppercase; margin-bottom: 1rem;">Proposal Received</h3>
              <p style="color: var(--color-text-secondary); line-height: 1.6; max-width: 500px; margin: 0 auto;">
                Thank you, ${form.name.value}. Our creative production team will review your proposal and contact you at <strong>${form.email.value}</strong> within 24 hours.
              </p>
            </div>
          `;
        } else {
          successMessage = `
            <div style="text-align: center; padding: 2rem 0; animation: fadeIn 0.6s ease forwards;">
              <div style="font-size: 3rem; margin-bottom: 1rem; color: var(--color-accent);">✓</div>
              <h3 class="font-display" style="font-size: 1.5rem; text-transform: uppercase; margin-bottom: 1rem;">Booking Request Submitted</h3>
              <p style="color: var(--color-text-secondary); line-height: 1.6; max-width: 500px; margin: 0 auto;">
                Thank you! We have logged your request. Our broadcast coordinator will contact you at <strong>${form.email.value}</strong>.
              </p>
            </div>
          `;
        }

        container.innerHTML = successMessage;
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
      }, usesGoogleForms ? 0 : 400);

    });
  });

});

// Extra animation keyframes added dynamically
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(styleSheet);
