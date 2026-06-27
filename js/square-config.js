/**
 * Shared Square API configuration.
 * Allowed origins: rainscope.ca, *.pages.dev, *.workers.dev, and localhost (dev).
 * Update CORS_ORIGIN on the Worker and Square SDK Web Payments origins when adding domains.
 *
 * Local dev: run `npm run worker:dev` and open the site via localhost — PROXY_BASE
 * switches to http://127.0.0.1:8787 automatically.
 */
(function () {
  var host = window.location.hostname;
  var isLocal = host === "localhost" || host === "127.0.0.1";
  var proxyBase = isLocal
    ? "http://127.0.0.1:8787"
    : "https://rainscope-square-proxy.sweet-queen-15c3.workers.dev";

  window.SquareConfig = {
    PROXY_BASE: proxyBase,
    LOCATION_ID: "L5CDX7TRVDN0C",
    APPLICATION_ID: "sq0idp-Q4C4Lb_w5aFXTJuE_2ebgg",

    RENTALS_EXCLUDE_CATEGORIES: [
      "labour", "services", "service", "A tile on the streets", "hidden",
      "StuckOnSet", "Locations (EX)", "Location (EX)", "Tape", "Crafty/Catering"
    ],

    SHOP_INCLUDE_CATEGORIES: [
      "Locations (EX)", "Location (EX)", "Tape", "StuckOnSet", "Crafty/Catering"
    ],

    SHOP_EXCLUDE_CATEGORIES: [
      "labour", "services", "service", "A tile on the streets", "hidden"
    ],

    CART_KEYS: {
      rentals: "rs_cart",
      shop: "shop_cart"
    }
  };
})();
