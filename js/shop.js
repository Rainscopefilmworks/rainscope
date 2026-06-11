(function () {
  "use strict";

  var CONFIG = window.SquareConfig;
  var UTILS = window.SquareUtils;
  var CART_KEY = "shop_cart";
  var SHOW_OUT_OF_STOCK_ITEMS = true;

  var state = {
    objects: [],
    items: [],
    categories: [],
    imagesById: {},
    inventoryByVariationId: {},
    activeCategory: "all",
    cart: [],
    card: null,
    checkoutReady: false
  };

  var els = {};

  function init() {
    if (!document.getElementById("shop-catalog")) return;
    if (!CONFIG || !UTILS) {
      console.error("shop.js requires window.SquareConfig and window.SquareUtils");
      return;
    }

    bindDom();
    if (!els.catalog || !els.categories || !els.cartItems || !els.total) {
      console.error("shop.js missing required DOM elements");
      return;
    }

    state.cart = UTILS.safeParseJSON(localStorage.getItem(CART_KEY) || "[]");
    bindEvents();
    renderCart();
    loadCatalog();
    loadSquarePayments();
  }

  function bindDom() {
    els.search = document.getElementById("rs-search");
    els.categories = document.getElementById("rs-cats-list");
    els.catalog = document.getElementById("shop-catalog");

    els.cartItems = document.getElementById("cart-items-list");
    els.cartBadge = document.getElementById("cart-badge");
    els.cartSummary = document.getElementById("cart-summary");
    els.total = document.getElementById("shop-total");

    els.checkoutModal = document.getElementById("checkout-modal");
    els.cardContainer = document.getElementById("card-container");
    els.first = document.getElementById("shop-first");
    els.last = document.getElementById("shop-last");
    els.email = document.getElementById("shop-email");
    els.phone = document.getElementById("shop-phone");
    els.submit = document.getElementById("shop-submit");
    els.status = document.getElementById("shop-status");

    els.result = document.getElementById("checkout-result");
    els.resultTitle = document.getElementById("checkout-result-title");
    els.resultMessage = document.getElementById("checkout-result-message");
  }

  function bindEvents() {
    if (els.search) {
      els.search.addEventListener("input", renderGrid);
    }

    if (els.categories) {
      els.categories.addEventListener("click", function (event) {
        var btn = event.target.closest(".filter-btn[data-cat]");
        if (!btn) return;
        state.activeCategory = btn.getAttribute("data-cat") || "all";
        renderCategories();
        renderGrid();
      });
    }

    if (els.cartItems) {
      els.cartItems.addEventListener("change", function (event) {
        var qtyInput = event.target.closest("input[data-qty-index]");
        if (!qtyInput) return;
        updateLineQty(qtyInput);
      });

      els.cartItems.addEventListener("click", function (event) {
        var rmBtn = event.target.closest("button[data-remove-index]");
        if (!rmBtn) return;
        var index = parseInt(rmBtn.getAttribute("data-remove-index"), 10);
        if (Number.isNaN(index)) return;
        state.cart.splice(index, 1);
        saveCart();
        renderCart();
      });
    }

    if (els.submit) {
      els.submit.addEventListener("click", handleCheckoutSubmit);
    }
  }

  function setStatus(message, tone) {
    if (!els.status) return;
    els.status.textContent = message || "";
    els.status.classList.remove("is-error", "is-success");
    if (tone === "error") els.status.classList.add("is-error");
    if (tone === "success") els.status.classList.add("is-success");
  }

  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(state.cart));
  }

  function computeTotal() {
    return state.cart.reduce(function (sum, line) {
      return sum + (UTILS.priceNum(line.priceMoney) * maxQty(line.qty));
    }, 0);
  }

  function maxQty(qty) {
    return Math.max(1, parseInt(qty || "1", 10));
  }

  function updateCartBadge() {
    if (!els.cartBadge) return;
    var count = state.cart.reduce(function (sum, line) {
      return sum + maxQty(line.qty);
    }, 0);

    if (count > 0) {
      els.cartBadge.textContent = String(count);
      els.cartBadge.hidden = false;
    } else {
      els.cartBadge.textContent = "0";
      els.cartBadge.hidden = true;
    }
  }

  function renderCart() {
    updateCartBadge();
    if (!els.cartItems) return;

    if (!state.cart.length) {
      els.cartItems.innerHTML = "<div class=\"cart-empty-text\">Your cart is empty.</div>";
      if (els.cartSummary) els.cartSummary.style.display = "none";
      if (els.total) els.total.textContent = "—";
      return;
    }

    var html = state.cart.map(function (line, index) {
      var unit = UTILS.priceNum(line.priceMoney);
      var qty = maxQty(line.qty);
      var lineTotal = unit * qty;
      var max = parseInt(line.maxQty || "999", 10);

      return [
        "<div class=\"cart-item\">",
        "  <div>",
        "    <div class=\"cart-item-title\">" + UTILS.escapeHTML(line.name || "Item") + "</div>",
        "    <div class=\"cart-item-meta\">" + (unit ? UTILS.money(unit) : "—") + (line.onRequest ? " • On request" : "") + "</div>",
        "  </div>",
        "  <div class=\"cart-item-controls\">",
        "    <input type=\"number\" min=\"1\" max=\"" + max + "\" value=\"" + qty + "\" data-qty-index=\"" + index + "\" aria-label=\"Quantity\">",
        "    <button type=\"button\" class=\"cart-item-remove\" data-remove-index=\"" + index + "\" aria-label=\"Remove item\">&times;</button>",
        "  </div>",
        "  <div class=\"cart-item-total\">" + (lineTotal ? UTILS.money(lineTotal) : "—") + "</div>",
        "</div>"
      ].join("");
    }).join("");

    els.cartItems.innerHTML = html;

    if (els.cartSummary) els.cartSummary.style.display = "block";
    if (els.total) {
      var total = computeTotal();
      els.total.textContent = total > 0 ? UTILS.money(total) : "—";
    }
  }

  function updateLineQty(input) {
    var index = parseInt(input.getAttribute("data-qty-index"), 10);
    if (Number.isNaN(index) || !state.cart[index]) return;

    var maxAllowed = parseInt(state.cart[index].maxQty || "999", 10);
    var nextQty = Math.max(1, Math.min(maxAllowed, parseInt(input.value || "1", 10)));
    state.cart[index].qty = String(nextQty);
    input.value = String(nextQty);
    saveCart();
    renderCart();
  }

  function normalizeCategorySet(names) {
    return new Set((names || []).map(UTILS.normalize));
  }

  function shouldIncludeItem(item, nameById, includeSet, excludeSet) {
    var productType = (item.item_data && item.item_data.product_type || "REGULAR").toUpperCase();
    if (productType !== "REGULAR") return false;

    var catIds = UTILS.itemCatIds(item);
    if (!catIds.length) return false;

    var catNames = catIds.map(function (id) { return nameById[id]; }).filter(Boolean);
    var normalized = catNames.map(UTILS.normalize);

    if (normalized.some(function (name) { return excludeSet.has(name); })) return false;
    if (includeSet.size > 0 && !normalized.some(function (name) { return includeSet.has(name); })) return false;

    return true;
  }

  function getDisplayCategoryId(item, nameById, includeSet, excludeSet) {
    var ids = UTILS.itemCatIds(item);
    if (!ids.length) return null;
    var includeId = ids.find(function (id) {
      return includeSet.has(UTILS.normalize(nameById[id] || ""));
    });
    if (includeId) return includeId;
    return UTILS.displayCategoryId(item, nameById, excludeSet);
  }

  function loadCatalog() {
    els.catalog.innerHTML = "<em>Loading shop catalog...</em>";
    fetch(CONFIG.PROXY_BASE + "/api/catalog?bust=" + Date.now())
      .then(function (res) {
        if (!res.ok) throw new Error("Catalog request failed (" + res.status + ")");
        return res.json();
      })
      .then(function (data) {
        state.objects = Array.isArray(data.objects) ? data.objects : [];
        state.categories = state.objects.filter(function (o) {
          return o.type === "CATEGORY" && !o.is_deleted && o.category_data;
        });
        state.imagesById = Object.fromEntries(
          state.objects.filter(function (o) { return o.type === "IMAGE" && o.image_data; }).map(function (o) {
            return [o.id, o];
          })
        );

        var nameById = Object.fromEntries(state.categories.map(function (c) {
          return [c.id, c.category_data.name];
        }));
        var includeSet = normalizeCategorySet(CONFIG.SHOP_INCLUDE_CATEGORIES);
        var excludeSet = normalizeCategorySet(CONFIG.SHOP_EXCLUDE_CATEGORIES);

        var rawItems = state.objects.filter(function (o) {
          return o.type === "ITEM" && !o.is_deleted && o.item_data;
        });
        state.items = rawItems.filter(function (item) {
          return shouldIncludeItem(item, nameById, includeSet, excludeSet);
        });

        var allVarIds = [];
        state.items.forEach(function (item) {
          (item.item_data.variations || []).forEach(function (variation) {
            allVarIds.push(variation.id);
          });
        });

        return loadInventory(allVarIds).then(function () {
          if (!SHOW_OUT_OF_STOCK_ITEMS) {
            state.items = state.items.filter(function (item) {
              return (item.item_data.variations || []).some(function (variation) {
                return getInventoryQty(variation.id) > 0;
              });
            });
          }

          buildCategories(nameById, includeSet, excludeSet);
          renderCategories();
          renderGrid();
        });
      })
      .catch(function (err) {
        console.error("Shop catalog load failed:", err);
        els.catalog.innerHTML = "<div class=\"cart-empty-text\">Unable to load products right now.</div>";
      });
  }

  function loadInventory(variationIds) {
    if (!variationIds.length) {
      state.inventoryByVariationId = {};
      return Promise.resolve();
    }

    var qs = encodeURIComponent(variationIds.join(","));
    return fetch(CONFIG.PROXY_BASE + "/api/inventory?catalog_object_ids=" + qs)
      .then(function (res) {
        if (!res.ok) throw new Error("Inventory request failed (" + res.status + ")");
        return res.json();
      })
      .then(function (data) {
        state.inventoryByVariationId = data && data.counts ? data.counts : {};
      })
      .catch(function (err) {
        console.error("Shop inventory load failed:", err);
        state.inventoryByVariationId = {};
      });
  }

  function getInventoryQty(variationId) {
    var inv = state.inventoryByVariationId[variationId];
    if (!inv || typeof inv.quantity !== "number") return 0;
    return inv.quantity;
  }

  function buildCategories(nameById, includeSet, excludeSet) {
    var counts = new Map();
    state.items.forEach(function (item) {
      var catId = getDisplayCategoryId(item, nameById, includeSet, excludeSet);
      if (!catId) return;
      counts.set(catId, (counts.get(catId) || 0) + 1);
    });

    var chips = [{ id: "all", name: "All", count: state.items.length }];
    Array.from(counts.entries())
      .map(function (entry) {
        return { id: entry[0], name: nameById[entry[0]] || "Category", count: entry[1] };
      })
      .sort(function (a, b) { return a.name.localeCompare(b.name); })
      .forEach(function (chip) { chips.push(chip); });

    state.categoryChips = chips;
  }

  function renderCategories() {
    if (!els.categories) return;
    var chips = state.categoryChips || [{ id: "all", name: "All", count: 0 }];
    els.categories.innerHTML = chips.map(function (chip) {
      var active = chip.id === state.activeCategory;
      return "<button type=\"button\" class=\"filter-btn" + (active ? " active" : "") + "\" data-cat=\"" +
        UTILS.escapeHTML(String(chip.id)) + "\">" +
        UTILS.escapeHTML(chip.name) + " (" + chip.count + ")</button>";
    }).join("");
  }

  function isItemVisible(item) {
    if (state.activeCategory !== "all") {
      var ids = UTILS.itemCatIds(item);
      if (ids.indexOf(state.activeCategory) === -1) return false;
    }
    var q = (els.search && els.search.value || "").toLowerCase().trim();
    if (!q) return true;
    return (item.item_data.name || "").toLowerCase().indexOf(q) !== -1;
  }

  function renderGrid() {
    if (!els.catalog) return;
    var list = state.items.filter(isItemVisible).sort(function (a, b) {
      return (a.item_data.name || "").localeCompare(b.item_data.name || "");
    });

    if (!list.length) {
      els.catalog.innerHTML = "<div class=\"cart-empty-text\">No items match your current filters.</div>";
      return;
    }

    els.catalog.innerHTML = list.map(renderProductCard).join("");

    els.catalog.querySelectorAll("select[data-item-id]").forEach(function (select) {
      select.addEventListener("change", function () {
        syncCardSelection(select.closest(".gear-card"));
      });
    });

    els.catalog.querySelectorAll("button[data-add-item-id]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var itemId = btn.getAttribute("data-add-item-id");
        var item = state.items.find(function (it) { return it.id === itemId; });
        if (!item) return;

        var cardEl = btn.closest(".gear-card");
        var selectedVarId = getSelectedVariationId(cardEl, item);
        var variation = (item.item_data.variations || []).find(function (v) { return v.id === selectedVarId; }) || item.item_data.variations[0];
        if (!variation) return;

        addToCart(item, variation);
      });
    });
  }

  function renderProductCard(item) {
    var title = UTILS.escapeHTML(item.item_data.name || "Item");
    var vars = item.item_data.variations || [];
    var firstVar = vars[0];
    var firstPrice = firstVar && firstVar.item_variation_data && firstVar.item_variation_data.price_money || null;
    var firstQty = firstVar ? getInventoryQty(firstVar.id) : 0;
    var requestOnly = firstQty <= 0;
    var imageId = item.item_data.image_ids && item.item_data.image_ids[0];
    var imageUrl = imageId && state.imagesById[imageId] && state.imagesById[imageId].image_data.url;
    var safeImage = imageUrl && /^https?:\/\//.test(imageUrl) ? UTILS.escapeHTML(imageUrl) : "";

    var variantUi = "";
    if (vars.length > 1) {
      variantUi = "<select class=\"variant-select\" data-item-id=\"" + UTILS.escapeHTML(item.id) + "\">" +
        vars.map(function (variation) {
          var vd = variation.item_variation_data || {};
          var price = vd.price_money;
          var qty = getInventoryQty(variation.id);
          var isReq = qty <= 0;
          var label = UTILS.escapeHTML(vd.name || "Default");
          var priceText = price ? UTILS.money(UTILS.priceNum(price)) : "";
          var invText = isReq ? "Available on request" : ("In stock (" + qty + ")");
          return "<option value=\"" + UTILS.escapeHTML(variation.id) + "\" data-qty=\"" + qty + "\" data-request=\"" + (isReq ? "true" : "false") + "\" data-price=\"" +
            encodeURIComponent(JSON.stringify(price || null)) + "\">" + label +
            (priceText ? " — " + priceText : "") + " — " + invText + "</option>";
        }).join("") +
        "</select>";
    } else if (firstVar && firstVar.item_variation_data && firstVar.item_variation_data.name) {
      variantUi = "<div class=\"variant-label\">" + UTILS.escapeHTML(firstVar.item_variation_data.name) + "</div>";
    }

    var stockText = requestOnly ? "Available on request" : (firstQty <= 3 ? ("Low stock (" + firstQty + ")") : ("In stock (" + firstQty + ")"));
    var stockClass = requestOnly ? "out-of-stock" : (firstQty <= 3 ? "low-stock" : "in-stock");
    var priceText = firstPrice ? UTILS.money(UTILS.priceNum(firstPrice)) : "";

    return [
      "<article class=\"gear-card glass-panel\" data-item-id=\"" + UTILS.escapeHTML(item.id) + "\">",
      safeImage
        ? "<img class=\"gear-image\" src=\"" + safeImage + "\" alt=\"" + title + "\" loading=\"lazy\">"
        : "<div class=\"gear-image-placeholder\" aria-hidden=\"true\"></div>",
      "<div class=\"gear-body\">",
      "<h3 class=\"gear-title\">" + title + "</h3>",
      variantUi,
      "<div class=\"gear-stock " + stockClass + "\" data-stock>" + UTILS.escapeHTML(stockText) + "</div>",
      "<div class=\"gear-footer\">",
      "  <div class=\"gear-price\" data-price>" + UTILS.escapeHTML(priceText) + "</div>",
      "  <button type=\"button\" class=\"btn btn-primary\" data-add-item-id=\"" + UTILS.escapeHTML(item.id) + "\" data-variation-id=\"" + UTILS.escapeHTML(firstVar ? firstVar.id : "") + "\">" + (requestOnly ? "Request" : "Add") + "</button>",
      "</div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function getSelectedVariationId(cardEl, item) {
    var select = cardEl && cardEl.querySelector("select[data-item-id]");
    if (select && select.value) return select.value;
    return item.item_data.variations && item.item_data.variations[0] && item.item_data.variations[0].id;
  }

  function syncCardSelection(cardEl) {
    if (!cardEl) return;
    var select = cardEl.querySelector("select[data-item-id]");
    if (!select) return;

    var option = select.options[select.selectedIndex];
    var priceData = option.getAttribute("data-price");
    var qty = parseInt(option.getAttribute("data-qty") || "0", 10);
    var onRequest = option.getAttribute("data-request") === "true";

    var priceEl = cardEl.querySelector("[data-price]");
    var stockEl = cardEl.querySelector("[data-stock]");
    var btn = cardEl.querySelector("[data-add-item-id]");

    var priceObj = null;
    try {
      priceObj = JSON.parse(decodeURIComponent(priceData || "null"));
    } catch (_e) {
      priceObj = null;
    }

    if (priceEl) priceEl.textContent = priceObj ? UTILS.money(UTILS.priceNum(priceObj)) : "";
    if (stockEl) {
      stockEl.classList.remove("in-stock", "low-stock", "out-of-stock");
      var cls = onRequest ? "out-of-stock" : (qty <= 3 ? "low-stock" : "in-stock");
      stockEl.classList.add(cls);
      stockEl.textContent = onRequest ? "Available on request" : (qty <= 3 ? ("Low stock (" + qty + ")") : ("In stock (" + qty + ")"));
    }
    if (btn) {
      btn.setAttribute("data-variation-id", option.value || "");
      btn.textContent = onRequest ? "Request" : "Add";
    }
  }

  function addToCart(item, variation) {
    var vData = variation.item_variation_data || {};
    var variationId = variation.id;
    var inventoryQty = getInventoryQty(variationId);
    var onRequest = inventoryQty <= 0;
    var maxAllowed = onRequest ? 999 : Math.max(1, inventoryQty);
    var label = (item.item_data.name || "Item") + " — " + (vData.name || "Default");
    var price = vData.price_money || null;

    var existing = state.cart.find(function (line) {
      return line.variationId === variationId;
    });

    if (existing) {
      var next = Math.min(maxAllowed, maxQty(existing.qty) + 1);
      if (next === maxQty(existing.qty)) return;
      existing.qty = String(next);
      existing.maxQty = maxAllowed;
      existing.onRequest = onRequest;
    } else {
      state.cart.push({
        variationId: variationId,
        name: label,
        priceMoney: price,
        qty: "1",
        maxQty: maxAllowed,
        onRequest: onRequest
      });
    }

    saveCart();
    renderCart();
  }

  function validateCheckoutForm() {
    var given = els.first && els.first.value.trim() || "";
    var family = els.last && els.last.value.trim() || "";
    var email = els.email && els.email.value.trim() || "";
    var phone = els.phone && els.phone.value.trim() || "";

    if (!given || !email) {
      setStatus("First name and email are required.", "error");
      return null;
    }

    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus("Please enter a valid email address.", "error");
      return null;
    }

    return {
      given_name: given,
      family_name: family,
      email_address: email,
      phone_number: phone || undefined
    };
  }

  function handleCheckoutSubmit() {
    if (!state.cart.length) {
      setStatus("Add at least one item to cart.", "error");
      return;
    }
    if (!state.card || !state.checkoutReady) {
      setStatus("Payment form is not ready yet.", "error");
      return;
    }

    var formData = validateCheckoutForm();
    if (!formData) return;

    if (els.submit) els.submit.disabled = true;
    setStatus("Requesting payment token...");

    state.card.tokenize()
      .then(function (result) {
        if (!result || result.status !== "OK") {
          var err = result && result.errors && result.errors[0] && result.errors[0].message;
          throw new Error(err || "Payment tokenization failed");
        }
        return processPurchase(result.token, formData);
      })
      .catch(function (err) {
        setStatus("Payment error: " + (err && err.message ? err.message : "Unknown error"), "error");
      })
      .finally(function () {
        if (els.submit) els.submit.disabled = false;
      });
  }

  function processPurchase(sourceId, formData) {
    setStatus("Processing purchase...");
    var lineItems = state.cart.map(function (line) {
      return {
        catalog_object_id: line.variationId,
        quantity: String(maxQty(line.qty))
      };
    });

    return fetch(CONFIG.PROXY_BASE + "/api/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location_id: CONFIG.LOCATION_ID,
        line_items: lineItems,
        source_id: sourceId,
        customer_email: formData.email_address,
        customer_name: (formData.given_name + " " + (formData.family_name || "")).trim(),
        delivery_method: "EMAIL"
      })
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok || !data || !data.ok) {
            throw new Error(data && data.error ? data.error : ("HTTP " + res.status));
          }
          return data;
        });
      })
      .then(function (data) {
        showResult(
          "Payment Received",
          (data.order_id ? ("Order " + data.order_id + " ") : "Your order ") +
          "is paid and now in fulfillment queue."
        );
        clearCheckoutState();
        setStatus("Purchase complete.", "success");
      })
      .catch(function (err) {
        setStatus("Purchase failed: " + (err && err.message ? err.message : "Unknown error"), "error");
      });
  }

  function showResult(title, message) {
    if (!els.result) return;
    if (els.resultTitle) els.resultTitle.textContent = title || "Order Update";
    if (els.resultMessage) els.resultMessage.textContent = message || "";
    els.result.hidden = false;
  }

  function clearCheckoutState() {
    state.cart = [];
    saveCart();
    renderCart();
    if (els.first) els.first.value = "";
    if (els.last) els.last.value = "";
    if (els.email) els.email.value = "";
    if (els.phone) els.phone.value = "";
    if (els.checkoutModal && typeof els.checkoutModal.close === "function" && els.checkoutModal.open) {
      els.checkoutModal.close();
    }
  }

  function loadSquareSdk() {
    if (window.Square && typeof window.Square.payments === "function") {
      return Promise.resolve();
    }

    return new Promise(function (resolve, reject) {
      var existing = document.querySelector("script[data-square-web-sdk]");
      if (existing) {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }

      var script = document.createElement("script");
      script.src = "https://web.squarecdn.com/v1/square.js";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      script.setAttribute("data-square-web-sdk", "true");
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function loadSquarePayments() {
    if (!els.cardContainer) return;

    loadSquareSdk()
      .then(function () {
        if (!window.Square || typeof window.Square.payments !== "function") {
          throw new Error("Square Web Payments SDK unavailable");
        }
        var payments = window.Square.payments(CONFIG.APPLICATION_ID, CONFIG.LOCATION_ID);
        return payments.card().then(function (card) {
          state.card = card;
          return card.attach("#card-container");
        });
      })
      .then(function () {
        state.checkoutReady = true;
      })
      .catch(function (err) {
        console.error("Square checkout initialization failed:", err);
        setStatus("Unable to load payment form.", "error");
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
