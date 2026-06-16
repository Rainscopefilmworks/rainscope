#!/usr/bin/env node
/**
 * Fetches content from Sanity at build time.
 * Uses SANITY_PROJECT_ID env, else sanity.config.json (for Cloudflare Pages builds).
 * Falls back to committed _data/*.json only when no project ID is configured.
 */
require("./load-env");

const fs = require("fs");
const path = require("path");
const { getSanityConfig } = require("./sanity-config");

const ROOT = path.join(__dirname, "..");
const DATA_DIR = path.join(ROOT, "_data");

const QUERIES = {
  siteSettings: `*[_type == "siteSettings"][0]`,
  sitePages: `*[_type == "page"] | order(slug asc)`,
  films: `*[_type == "film"] | order(sortOrder asc, year desc)`,
  workReels: `*[_type == "workReel"] | order(sortOrder asc)`,
  teamMembers: `*[_type == "teamMember"] | order(sortOrder asc)`,
  liveServices: `*[_type == "liveService"] | order(sortOrder asc)`,
  liveProjects: `*[_type == "liveProject"] | order(sortOrder asc)`,
  filmworksServices: `*[_type == "filmworksService"] | order(sortOrder asc)`,
  faqItems: `*[_type == "faqItem"] | order(sortOrder asc)`,
  formCopy: `*[_type == "formCopy"][0]`,
  testimonials: `*[_type == "testimonial"] | order(sortOrder asc)`
};

function stripSanityMeta(value) {
  if (Array.isArray(value)) {
    return value.map(stripSanityMeta);
  }
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, val] of Object.entries(value)) {
      if (key.startsWith("_")) continue;
      out[key] = stripSanityMeta(val);
    }
    return out;
  }
  return value;
}

async function fetchFromSanity() {
  const { projectId, dataset } = getSanityConfig();

  if (!projectId) {
    console.log("[fetch-sanity] No Sanity project ID — using committed _data/*.json");
    return false;
  }

  console.log(`[fetch-sanity] Fetching ${dataset} from project ${projectId}`);

  const { createClient } = require("@sanity/client");
  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    useCdn: false
  });

  for (const [filename, query] of Object.entries(QUERIES)) {
    let result = await client.fetch(query);
    result = stripSanityMeta(result);

    const isEmpty =
      result === null ||
      result === undefined ||
      (Array.isArray(result) && result.length === 0);

    const outPath = path.join(DATA_DIR, `${filename}.json`);
    if (isEmpty && fs.existsSync(outPath)) {
      console.log(`[fetch-sanity] Skipped ${filename}.json (Sanity empty, kept local file)`);
      continue;
    }

    fs.writeFileSync(outPath, JSON.stringify(result, null, 2) + "\n");
    console.log(`[fetch-sanity] Wrote ${filename}.json`);
  }

  return true;
}

fetchFromSanity().catch((err) => {
  console.error("[fetch-sanity] Error:", err.message);
  process.exit(1);
});
