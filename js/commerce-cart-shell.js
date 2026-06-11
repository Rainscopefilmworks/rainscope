window.CommerceCartShell = (function () {
  "use strict";

  var DESKTOP_MQ = window.matchMedia("(min-width: 901px)");

  function init(options) {
    var dialog = document.getElementById(options.dialogId);
    var toggle = document.getElementById(options.toggleId);
    if (!dialog) return { closeIfMobile: function () {} };

    var closeBtn = dialog.querySelector(".commerce-cart-close");

    function openMobileCart() {
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      }
    }

    function syncDesktopPanel() {
      if (!DESKTOP_MQ.matches) return;
      if (!dialog.open && typeof dialog.show === "function") {
        dialog.show();
      }
    }

    function handleViewportChange() {
      if (DESKTOP_MQ.matches) {
        syncDesktopPanel();
        return;
      }
      if (dialog.open && typeof dialog.close === "function") {
        dialog.close();
      }
    }

    if (toggle) {
      toggle.addEventListener("click", openMobileCart);
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        if (dialog.open) dialog.close();
      });
    }

    DESKTOP_MQ.addEventListener("change", handleViewportChange);
    syncDesktopPanel();

    return {
      closeIfMobile: function () {
        if (!DESKTOP_MQ.matches && dialog.open) {
          dialog.close();
        }
      }
    };
  }

  return { init: init };
})();
