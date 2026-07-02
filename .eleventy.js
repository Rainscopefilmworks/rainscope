module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("_headers");
  eleventyConfig.addPassthroughCopy("_redirects");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("worker");

  eleventyConfig.addFilter("basePath", (url) => {
    if (!url || url === "/") return "";
    const depth = url.split("/").filter(Boolean).length;
    return "../".repeat(depth);
  });

  eleventyConfig.addFilter("youtubeId", (embed) => {
    if (!embed) return "";
    const match = String(embed).match(/embed\/([^?&]+)/);
    return match ? match[1] : "";
  });

  eleventyConfig.addFilter("truncate", (str, len = 80) => {
    if (!str || str.length <= len) return str || "";
    return str.slice(0, len).trim() + "...";
  });

  eleventyConfig.addFilter("slug", (str) => {
    if (!str) return "";
    return String(str)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  });

  eleventyConfig.addFilter("mediaUrl", (url, base = "") => {
    if (!url) return "";
    if (/^https?:\/\//.test(url)) return url;
    return `${base}${url}`;
  });

  eleventyConfig.addFilter("json", (value) => JSON.stringify(value ?? null));

  eleventyConfig.addFilter("withTag", (items, tag) => {
    if (!tag || !Array.isArray(items)) return items || [];
    return items.filter((item) => Array.isArray(item.tags) && item.tags.includes(tag));
  });

  return {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["html", "njk", "md"]
  };
};
