(function () {
  "use strict";

  const config = window.SquareConfig;
  const utils = window.SquareUtils;

  if (!config || !utils) {
    console.error("rentals.js requires window.SquareConfig and window.SquareUtils.");
    return;
  }

  const PROXY_BASE = config.PROXY_BASE;
  const LOCATION_ID = config.LOCATION_ID || "L5CDX7TRVDN0C";
  const CART_KEY = (config.CART_KEYS && config.CART_KEYS.rentals) || "rs_cart";
  const EXCLUDE_SET = utils.buildExcludeSet(config.RENTALS_EXCLUDE_CATEGORIES || []);
  const MS = 86400000;
  const GST_RATE = 0.05;
  const SERVICE_FEE_RATE = 0.03;

  let objects = [];
  let items = [];
  let categories = [];
  let imagesById = {};
  let activeCat = "all";

  function toISO(d) {
    return d.toISOString().slice(0, 10);
  }

  function parseDate(v) {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // Days between pickup and dropoff, excluding both endpoints.
  function dayDiff(a, b) {
    const da = new Date(a.getFullYear(), a.getMonth(), a.getDate());
    const db = new Date(b.getFullYear(), b.getMonth(), b.getDate());
    const daysBetween = Math.round((db - da) / MS);
    return Math.max(0, daysBetween - 1);
  }

  // 4-day weekly billing cap:
  // 1-4 => 1-4, 5-7 => 4, and +4 per full additional week.
  function billableDays(actualDays) {
    if (!actualDays) return 0;
    const weeks = Math.floor(actualDays / 7);
    const rem = actualDays % 7;
    return weeks * 4 + Math.min(4, rem);
  }

  function itemCatId(it) {
    const ids = utils.itemCatIds(it);
    return ids[0] || null;
  }

  function ensureToast() {
    let toast = document.getElementById("rs-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "rs-toast";
      toast.hidden = true;
      document.body.appendChild(toast);
    }
    return toast;
  }

  function showToast(msg) {
    const toast = ensureToast();
    toast.textContent = msg || "Added to quote";
    toast.hidden = false;
    requestAnimationFrame(function () {
      toast.classList.add("show");
    });
    setTimeout(function () {
      toast.classList.remove("show");
      setTimeout(function () {
        toast.hidden = true;
      }, 200);
    }, 1200);
  }

  function init() {
    const $grid = document.getElementById("gear-catalog");
    if (!$grid) return;

    const $cats = document.getElementById("rs-cats-list");
    const $search = document.getElementById("rs-search");

    const $cartItems = document.getElementById("cart-items-list");
    const $cartBadge = document.getElementById("cart-badge");
    const $cartSummary = document.getElementById("cart-summary");
    const $cartTotalRate = document.getElementById("cart-total-rate");

    const $days = document.getElementById("rs-days");
    const $subDay = document.getElementById("rs-subday");
    const $subtotal = document.getElementById("rs-subtotal");
    const $gst = document.getElementById("rs-gst");
    const $serviceFee = document.getElementById("rs-service-fee");
    const $total = document.getElementById("rs-total");

    const $form = document.getElementById("quote-submission-form");
    const $status = document.getElementById("rs-status");

    const cart = utils.safeParseJSON(localStorage.getItem(CART_KEY) || "[]");

    function saveCart() {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }

    function getDays() {
      const startInput = document.getElementById("rental-start");
      const endInput = document.getElementById("rental-end");
      const s = parseDate(startInput ? startInput.value : "");
      const e = parseDate(endInput ? endInput.value : "");
      if (!s || !e) return 0;
      return dayDiff(s, e);
    }

    function updateBadges() {
      const units = cart.reduce(function (n, l) {
        return n + Math.max(1, parseInt(l.qty || "1", 10));
      }, 0);

      if ($cartBadge) {
        if (units > 0) {
          $cartBadge.textContent = String(units);
          $cartBadge.hidden = false;
        } else {
          $cartBadge.hidden = true;
        }
      }
    }

    function computeTotals() {
      const daysActual = getDays();
      const daysBill = billableDays(daysActual);

      const perDay = cart.reduce(function (sum, l) {
        return (
          sum +
          utils.priceNum(l.priceMoney) * Math.max(1, parseInt(l.qty || "1", 10))
        );
      }, 0);

      const subtotal = perDay * daysBill;
      const gstAmount = Math.round(subtotal * GST_RATE);
      const serviceFeeAmount = Math.round(subtotal * SERVICE_FEE_RATE);
      const totalAmount = subtotal + gstAmount + serviceFeeAmount;

      if ($days) {
        $days.textContent = daysActual >= 0 ? daysActual + " (billed " + daysBill + ")" : "—";
      }
      if ($subDay) $subDay.textContent = perDay ? utils.money(perDay) : "—";
      if ($subtotal) $subtotal.textContent = subtotal ? utils.money(subtotal) : "—";
      if ($gst) $gst.textContent = gstAmount > 0 ? utils.money(gstAmount) : "—";
      if ($serviceFee) {
        $serviceFee.textContent = serviceFeeAmount > 0 ? utils.money(serviceFeeAmount) : "—";
      }
      if ($total) $total.textContent = totalAmount ? utils.money(totalAmount) : "—";
      if ($cartTotalRate) $cartTotalRate.textContent = perDay ? utils.money(perDay) : "—";
    }

    function renderCart() {
      if (!$cartItems) return;

      if (!cart.length) {
        $cartItems.innerHTML = "<em>Your quote list is empty.</em>";
        if ($cartSummary) $cartSummary.style.display = "none";
        updateBadges();
        computeTotals();
        return;
      }

      if ($cartSummary) $cartSummary.style.display = "";

      $cartItems.innerHTML = cart
        .map(function (line, i) {
          const itemName = utils.escapeHTML(line.name || "");
          const priceText = line.priceMoney
            ? utils.escapeHTML(utils.money(utils.priceNum(line.priceMoney)))
            : "—";
          const qtyText = utils.escapeHTML(String(line.qty || "1"));
          return (
            '<div class="cart-item">' +
            '  <div>' +
            '    <div class="cart-item-title">' +
            itemName +
            "</div>" +
            '    <div class="cart-item-meta">Price/day: ' +
            priceText +
            "</div>" +
            "  </div>" +
            '  <div class="cart-item-controls">' +
            '    <input type="number" min="1" data-i="' +
            i +
            '" value="' +
            qtyText +
            '">' +
            '    <button type="button" class="cart-item-remove" data-rm="' +
            i +
            '">&times;</button>' +
            "  </div>" +
            "</div>"
          );
        })
        .join("");

      Array.prototype.forEach.call(
        $cartItems.querySelectorAll("input[type=number]"),
        function (inp) {
          inp.addEventListener("change", function (e) {
            const idx = parseInt(e.target.getAttribute("data-i"), 10);
            if (Number.isNaN(idx) || !cart[idx]) return;
            cart[idx].qty = String(Math.max(1, parseInt(e.target.value || "1", 10)));
            saveCart();
            updateBadges();
            computeTotals();
          });
        }
      );

      Array.prototype.forEach.call($cartItems.querySelectorAll("[data-rm]"), function (btn) {
        btn.addEventListener("click", function () {
          const idx = parseInt(btn.getAttribute("data-rm"), 10);
          if (Number.isNaN(idx)) return;
          cart.splice(idx, 1);
          saveCart();
          renderCart();
        });
      });

      updateBadges();
      computeTotals();
    }

    function addToCart(variationId, name, priceMoney) {
      const line = cart.find(function (l) {
        return l.variationId === variationId;
      });
      if (line) {
        line.qty = String((parseInt(line.qty || "1", 10) || 1) + 1);
      } else {
        cart.push({ variationId: variationId, name: name, priceMoney: priceMoney, qty: "1" });
      }
      saveCart();
      renderCart();
      showToast("Added to quote");
    }

    function inCat(it) {
      if (activeCat === "all") return true;
      const ids = utils.itemCatIds(it);
      if (activeCat === "__unassigned") return ids.length === 0;
      return ids.indexOf(activeCat) >= 0;
    }

    function renderGrid() {
      const query = ($search ? $search.value : "").toLowerCase().trim();

      const list = items.filter(function (it) {
        if (!inCat(it)) return false;
        if (!query) return true;
        return (it.item_data && it.item_data.name ? it.item_data.name : "")
          .toLowerCase()
          .includes(query);
      });

      if (!list.length) {
        $grid.innerHTML = "<em>No items match your search or filter.</em>";
        return;
      }

      list.sort(function (a, b) {
        const na = (a.item_data && a.item_data.name) || "";
        const nb = (b.item_data && b.item_data.name) || "";
        return na.localeCompare(nb);
      });

      $grid.innerHTML = list
        .map(function (item) {
          const itemData = item.item_data || {};
          const vars = Array.isArray(itemData.variations) ? itemData.variations : [];
          const first = vars[0];
          const hasMultipleVariants = vars.length > 1;
          const imgId = itemData.image_ids && itemData.image_ids[0];
          const imageUrl = imgId && imagesById[imgId] && imagesById[imgId].image_data
            ? imagesById[imgId].image_data.url || ""
            : "";
          const safeImage = /^https?:\/\//.test(imageUrl) ? utils.escapeHTML(imageUrl) : "";

          const itemName = itemData.name || "Item";
          const title = utils.escapeHTML(itemName);
          const selectedVariationName =
            (first &&
              first.item_variation_data &&
              first.item_variation_data.name &&
              first.item_variation_data.name.trim()) ||
            "Default";
          const catName = categories.find(function (c) {
            return c.id === itemCatId(item);
          });
          const catLabel = utils.escapeHTML(
            (catName && catName.category_data && catName.category_data.name) || "Unassigned"
          );

          const firstPrice = first && first.item_variation_data ? first.item_variation_data.price_money : null;
          const priceText = firstPrice
            ? utils.escapeHTML(utils.money(firstPrice.amount / 100) + " / day")
            : "—";

          const options = vars
            .map(function (v) {
              const vd = v.item_variation_data || {};
              const p = vd.price_money || null;
              const pjson = p ? JSON.stringify(p).replace(/"/g, "&quot;") : "";
              const vname = utils.escapeHTML(vd.name || "Default");
              const linePrice = p ? utils.escapeHTML(utils.money(p.amount / 100)) : "";
              return (
                '<option value="' +
                utils.escapeHTML(v.id || "") +
                '" data-price="' +
                pjson +
                '">' +
                vname +
                (linePrice ? " — " + linePrice : "") +
                " / day</option>"
              );
            })
            .join("");

          const singleVariantLabel =
            !hasMultipleVariants &&
            selectedVariationName &&
            selectedVariationName.toLowerCase() !== "default" &&
            selectedVariationName.toLowerCase() !== "regular"
              ? '<div class="gear-variant">' + utils.escapeHTML(selectedVariationName) + "</div>"
              : "";

          return (
            '<article class="gear-card glass-panel">' +
            (safeImage
              ? '<img class="gear-image" loading="lazy" src="' +
                safeImage +
                '" alt="' +
                title +
                '">'
              : "") +
            '<div class="gear-header">' +
            '  <div class="gear-category">' +
            catLabel +
            "</div>" +
            '  <div class="gear-price" data-price-for="' +
            utils.escapeHTML(item.id || "") +
            '">' +
            priceText +
            "</div>" +
            "</div>" +
            '<h3 class="gear-title">' +
            title +
            "</h3>" +
            (hasMultipleVariants
              ? '<select class="rs-variant" data-item="' +
                utils.escapeHTML(item.id || "") +
                '">' +
                options +
                "</select>"
              : singleVariantLabel) +
            '<button type="button" class="btn btn-secondary add-to-quote-btn" data-add="' +
            utils.escapeHTML(item.id || "") +
            '" data-variation-id="' +
            utils.escapeHTML((first && first.id) || "") +
            '">Add to Quote</button>' +
            "</article>"
          );
        })
        .join("");

      Array.prototype.forEach.call($grid.querySelectorAll(".rs-variant"), function (sel) {
        sel.addEventListener("change", function () {
          const itemId = sel.getAttribute("data-item");
          const opt = sel.options[sel.selectedIndex];
          const priceStr = opt ? opt.getAttribute("data-price") : null;
          const priceObj = priceStr ? JSON.parse(priceStr.replaceAll("&quot;", '"')) : null;
          const priceEl = $grid.querySelector('[data-price-for="' + itemId + '"]');
          if (priceEl) {
            priceEl.textContent = priceObj ? utils.money(priceObj.amount / 100) + " / day" : "";
          }
        });
      });

      Array.prototype.forEach.call($grid.querySelectorAll("[data-add]"), function (btn) {
        btn.addEventListener("click", function () {
          const itemId = btn.getAttribute("data-add");
          const item = items.find(function (i) {
            return i.id === itemId;
          });
          if (!item || !item.item_data) return;

          const sel = $grid.querySelector('.rs-variant[data-item="' + itemId + '"]');
          const varId = (sel && sel.value) || btn.getAttribute("data-variation-id");
          const variations = Array.isArray(item.item_data.variations) ? item.item_data.variations : [];
          const v =
            variations.find(function (x) {
              return x.id === varId;
            }) || variations[0];
          if (!v || !v.id) return;

          const vName = (v.item_variation_data && v.item_variation_data.name) || "Default";
          const lineName = (item.item_data.name || "Item") + " — " + vName;
          const price = v.item_variation_data ? v.item_variation_data.price_money || null : null;
          addToCart(v.id, lineName, price);
        });
      });
    }

    function renderCategories(nameById) {
      if (!$cats) return;

      const counts = new Map();
      let unassigned = 0;

      items.forEach(function (it) {
        const cid = utils.displayCategoryId(it, nameById, EXCLUDE_SET);
        if (cid) {
          counts.set(cid, (counts.get(cid) || 0) + 1);
        } else {
          unassigned += 1;
        }
      });

      const chips = [{ id: "all", name: "All", count: items.length }];
      const entries = Array.from(counts.entries())
        .map(function (pair) {
          return { id: pair[0], name: nameById[pair[0]] || "Category", count: pair[1] };
        })
        .sort(function (a, b) {
          return a.name.localeCompare(b.name);
        });
      chips.push.apply(chips, entries);
      if (unassigned > 0) chips.push({ id: "__unassigned", name: "Unassigned", count: unassigned });

      $cats.innerHTML = chips
        .map(function (c) {
          const active = c.id === activeCat ? " active" : "";
          return (
            '<button type="button" class="filter-btn' +
            active +
            '" data-cat="' +
            utils.escapeHTML(c.id) +
            '">' +
            '<span>' +
            utils.escapeHTML(c.name) +
            "</span>" +
            " (" +
            c.count +
            ")" +
            "</button>"
          );
        })
        .join("");

      Array.prototype.forEach.call($cats.querySelectorAll("[data-cat]"), function (btn) {
        btn.addEventListener("click", function () {
          activeCat = btn.getAttribute("data-cat") || "all";
          Array.prototype.forEach.call($cats.querySelectorAll(".filter-btn"), function (el) {
            el.classList.remove("active");
          });
          btn.classList.add("active");
          renderGrid();
        });
      });
    }

    async function loadCatalog() {
      try {
        $grid.innerHTML = "<em>Loading catalog...</em>";
        const response = await fetch(PROXY_BASE + "/api/catalog?bust=" + Date.now());
        if (!response.ok) {
          throw new Error("HTTP " + response.status + ": " + response.statusText);
        }

        const data = await response.json();
        objects = Array.isArray(data && data.objects) ? data.objects : [];
        imagesById = Object.fromEntries(
          objects
            .filter(function (o) {
              return o.type === "IMAGE" && o.image_data;
            })
            .map(function (o) {
              return [o.id, o];
            })
        );
        categories = objects.filter(function (o) {
          return o.type === "CATEGORY" && !o.is_deleted && o.category_data;
        });

        const itemsRaw = objects.filter(function (o) {
          return o.type === "ITEM" && !o.is_deleted && o.item_data;
        });

        const nameById = Object.fromEntries(
          categories.map(function (c) {
            return [c.id, c.category_data.name];
          })
        );

        items = itemsRaw.filter(function (it) {
          const pt = ((it.item_data && it.item_data.product_type) || "REGULAR").toUpperCase();
          if (pt !== "REGULAR") return false;

          const catIds = utils.itemCatIds(it);
          if (catIds.length) {
            const names = catIds
              .map(function (id) {
                return nameById[id];
              })
              .filter(Boolean);
            const excluded = names.some(function (nm) {
              return EXCLUDE_SET.has(utils.normalize(nm));
            });
            if (excluded) return false;
          }

          const locs =
            it.present_at_location_ids ||
            (it.item_data && it.item_data.present_at_location_ids) ||
            [];
          const absent =
            it.absent_at_location_ids ||
            (it.item_data && it.item_data.absent_at_location_ids) ||
            [];

          if (absent.indexOf(LOCATION_ID) >= 0) return false;
          return locs.length === 0 || locs.indexOf(LOCATION_ID) >= 0;
        });

        renderCategories(nameById);
        renderGrid();
      } catch (error) {
        const msg = error && error.message ? error.message : "Unknown error";
        const isCors = msg.includes("Failed to fetch") || msg.includes("CORS");
        const displayMsg = isCors
          ? "CORS error while loading catalog. Ensure this page is served from an allowed origin."
          : msg;
        $grid.innerHTML =
          "<div style='color:red; padding: 1.5rem;'>" +
          "<strong>Error loading catalog:</strong> " +
          utils.escapeHTML(displayMsg) +
          "</div>";
        if ($cats) {
          $cats.innerHTML = "<em style='color:red;'>Unable to load categories</em>";
        }
      }
    }

    async function submitEstimate() {
      function setStatus(message) {
        if ($status) $status.textContent = message || "";
      }

      try {
        const firstEl = document.getElementById("rental-first");
        const lastEl = document.getElementById("rental-last");
        const emailEl = document.getElementById("rental-email");
        const phoneEl = document.getElementById("rental-phone");
        const startEl = document.getElementById("rental-start");
        const endEl = document.getElementById("rental-end");
        const noteEl = document.getElementById("rental-note");

        const given_name = firstEl ? firstEl.value.trim() : "";
        const family_name = lastEl ? lastEl.value.trim() : "";
        const email_address = emailEl ? emailEl.value.trim() : "";
        const phone_number = phoneEl && phoneEl.value.trim() ? phoneEl.value.trim() : undefined;
        let startStr = startEl ? (startEl.value || "").trim() : "";
        let endStr = endEl ? (endEl.value || "").trim() : "";
        const noteExtra = noteEl ? noteEl.value.trim() : "";

        if (!given_name || !email_address) {
          alert("First name and email are required.");
          return;
        }
        if (!cart.length) {
          alert("Add at least one item.");
          return;
        }
        if (!startStr || !endStr) {
          alert("Choose pickup and dropoff dates.");
          return;
        }
        if (startStr > endStr) {
          alert("Dropoff date must be on/after pickup date.");
          return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_address)) {
          alert("Please enter a valid email address.");
          return;
        }
        if (given_name.length > 100 || family_name.length > 100) {
          alert("Name fields are too long.");
          return;
        }
        if (phone_number && phone_number.length > 20) {
          alert("Phone number is too long.");
          return;
        }
        if (noteExtra.length > 1000) {
          alert("Note is too long (max 1000 characters).");
          return;
        }

        startStr = startStr.slice(0, 10);
        endStr = endStr.slice(0, 10);

        setStatus("Creating customer...");
        const custRes = await fetch(PROXY_BASE + "/api/customer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ given_name: given_name, family_name: family_name, email_address: email_address, phone_number: phone_number })
        });
        const cust = await custRes.json();

        if (!cust || !cust.customer_id) {
          alert("Estimate failed: could not create/find customer.");
          setStatus("");
          return;
        }

        const daysActual = getDays();
        if (daysActual < 0) {
          alert("Invalid date range. Dropoff date must be after pickup date.");
          setStatus("");
          return;
        }
        const daysBill = billableDays(daysActual);
        if (daysBill <= 0) {
          alert("Invalid date range. Billed days must be greater than 0.");
          setStatus("");
          return;
        }

        const line_items = cart.flatMap(function (l) {
          const units = Math.max(1, parseInt(l.qty || "1", 10));
          const base = { catalog_object_id: l.variationId, quantity: String(daysBill) };
          return Array.from({ length: units }, function () {
            return base;
          });
        });

        const subtotal = cart.reduce(function (sum, l) {
          const price = utils.priceNum(l.priceMoney);
          const units = Math.max(1, parseInt(l.qty || "1", 10));
          return sum + price * units * daysBill;
        }, 0);

        const serviceFeeAmountCents = Math.round(subtotal * SERVICE_FEE_RATE * 100);

        let gstTaxId = null;
        if (Array.isArray(objects) && objects.length) {
          const gstTax = objects.find(function (o) {
            return (
              o.type === "TAX" &&
              o.tax_data &&
              o.tax_data.name &&
              o.tax_data.name.toLowerCase().includes("gst")
            );
          });
          if (gstTax) gstTaxId = gstTax.id;
        }

        const taxes = [];
        if (gstTaxId) {
          taxes.push({ catalog_object_id: gstTaxId, scope: "ORDER" });
        } else {
          console.warn("GST tax not found in catalog.");
        }

        const service_charges = [];
        if (serviceFeeAmountCents > 0) {
          service_charges.push({
            name: "Service Fee (3%)",
            amount_money: { amount: serviceFeeAmountCents, currency: "CAD" },
            calculation_phase: "TOTAL_PHASE"
          });
        }

        const note =
          (
            "Rental: Pickup " +
            startStr +
            ", Dropoff " +
            endStr +
            " (" +
            daysActual +
            " day" +
            (daysActual !== 1 ? "s" : "") +
            " in between, billed " +
            daysBill +
            "). " +
            (noteExtra || "")
          ).trim();

        const pickupDate = parseDate(startStr);
        const serviceDate = pickupDate ? new Date(pickupDate.getTime() + MS) : null;
        const serviceDateStr = serviceDate ? toISO(serviceDate) : null;

        setStatus("Submitting estimate...");
        const res = await fetch(PROXY_BASE + "/api/estimate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer_id: cust.customer_id,
            location_id: LOCATION_ID,
            line_items: line_items,
            taxes: taxes,
            service_charges: service_charges,
            note: note,
            publish: true,
            delivery_method: "EMAIL",
            start_date: startStr,
            service_date: serviceDateStr
          })
        });

        const data = await res.json();
        if (!data || !data.ok) {
          alert("Estimate failed:\n" + ((data && data.error) || "HTTP " + res.status));
          setStatus("");
          return;
        }

        setStatus("Estimate sent!");
        alert("Estimate emailed. Thank you!");
        cart.length = 0;
        saveCart();
        renderCart();
        computeTotals();
      } catch (err) {
        alert("Estimate failed:\n" + ((err && err.message) || String(err)));
        setStatus("");
      }
    }

    function bindEvents() {
      if ($search) {
        $search.addEventListener("input", renderGrid);
      }

      const start = document.getElementById("rental-start");
      const end = document.getElementById("rental-end");
      if (start) start.addEventListener("change", computeTotals);
      if (end) end.addEventListener("change", computeTotals);

      if ($form) {
        // Capture-phase handler to ensure rentals.js owns this form submit flow.
        $form.addEventListener(
          "submit",
          function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            submitEstimate();
          },
          true
        );
      }
    }

    (async function startApp() {
      try {
        const today = new Date();
        const tomorrow = new Date(Date.now() + MS);
        const startInput = document.getElementById("rental-start");
        const endInput = document.getElementById("rental-end");
        if (startInput && endInput && !startInput.value && !endInput.value) {
          startInput.value = toISO(today);
          endInput.value = toISO(tomorrow);
        }

        await loadCatalog();
      } catch (e) {
        $grid.innerHTML =
          "<em style='color:red;'>Failed to initialize: " +
          utils.escapeHTML((e && e.message) || "Unknown error") +
          "</em>";
      }

      bindEvents();
      renderCart();
      computeTotals();
      ensureToast();
    })();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
