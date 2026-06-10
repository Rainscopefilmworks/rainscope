window.SquareUtils = (function () {
  const normalize = (s) =>
    (s || "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  function escapeHTML(str) {
    if (typeof str !== "string") return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function safeParseJSON(str, fallback = []) {
    try {
      const parsed = JSON.parse(str);
      if (!Array.isArray(parsed)) return fallback;
      return parsed.filter(
        (item) =>
          item &&
          typeof item === "object" &&
          typeof item.variationId === "string" &&
          typeof item.name === "string"
      );
    } catch {
      return fallback;
    }
  }

  const money = (n) =>
    n.toLocaleString(undefined, { style: "currency", currency: "CAD" });

  const priceNum = (pm) =>
    pm && typeof pm.amount === "number" ? pm.amount / 100 : 0;

  function itemCatIds(it) {
    const ids = [];
    const categoryId = it?.item_data?.category_id;
    const reportingCategoryId = it?.item_data?.reporting_category?.id;
    if (categoryId) ids.push(categoryId);
    if (reportingCategoryId) ids.push(reportingCategoryId);
    const extraIds = Array.isArray(it?.item_data?.categories)
      ? it.item_data.categories.map((c) => c?.id).filter(Boolean)
      : [];
    ids.push(...extraIds);
    return [...new Set(ids)];
  }

  function displayCategoryId(it, nameById, excludeSet) {
    const ids = itemCatIds(it);
    if (!ids.length) return null;
    const nonExcluded = ids.find(
      (id) => !excludeSet.has(normalize(nameById[id] || ""))
    );
    return nonExcluded || ids[0];
  }

  function buildExcludeSet(names) {
    return new Set(names.map(normalize));
  }

  function buildIncludeSet(names) {
    return new Set(names.map(normalize));
  }

  return {
    normalize,
    escapeHTML,
    safeParseJSON,
    money,
    priceNum,
    itemCatIds,
    displayCategoryId,
    buildExcludeSet,
    buildIncludeSet
  };
})();
