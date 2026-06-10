const pages = require("./sitePages.json");
module.exports = Object.fromEntries(pages.map((p) => [p.slug, p]));
