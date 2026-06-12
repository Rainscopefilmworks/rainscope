#!/usr/bin/env node
/**
 * Seeds Sanity from committed _data/*.json files.
 * Usage: SANITY_PROJECT_ID=xxx SANITY_TOKEN=xxx node scripts/seed-sanity.js
 */
require("./load-env");

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DATA = path.join(ROOT, "_data");

async function main() {
  const projectId = process.env.SANITY_PROJECT_ID;
  const token = process.env.SANITY_TOKEN;
  const dataset = process.env.SANITY_DATASET || "production";

  if (!projectId || !token) {
    console.error("\n[seed-sanity] Missing credentials.");
    console.error("  1. Open https://www.sanity.io/manage → your project → API → Tokens");
    console.error("  2. Create a token with Editor permissions");
    console.error("  3. Add to .env: SANITY_TOKEN=your-token-here\n");
    process.exit(1);
  }

  const { createClient } = require("@sanity/client");
  const client = createClient({
    projectId,
    dataset,
    token,
    apiVersion: "2024-01-01",
    useCdn: false
  });

  const siteSettings = JSON.parse(fs.readFileSync(path.join(DATA, "siteSettings.json"), "utf8"));
  await client.createOrReplace({ _id: "siteSettings", _type: "siteSettings", ...siteSettings });
  console.log("Seeded siteSettings");

  const formCopy = JSON.parse(fs.readFileSync(path.join(DATA, "formCopy.json"), "utf8"));
  await client.createOrReplace({ _id: "formCopy", _type: "formCopy", ...formCopy });
  console.log("Seeded formCopy");

  function docId(type, item, index) {
    const key = item.slug || item.title || item.question || `${type}-${index}`;
    return `${type}-${String(key).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  }

  for (const [file, type] of [
    ["sitePages.json", "page"],
    ["films.json", "film"],
    ["workReels.json", "workReel"],
    ["teamMembers.json", "teamMember"],
    ["liveServices.json", "liveService"],
    ["liveProjects.json", "liveProject"],
    ["faqItems.json", "faqItem"]
  ]) {
    const items = JSON.parse(fs.readFileSync(path.join(DATA, file), "utf8"));
    const list = Array.isArray(items) ? items : [items];
    const seen = new Set();
    const seededIds = [];

    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      const id = docId(type, item, i);
      if (seen.has(id)) {
        console.warn(`[seed-sanity] Skipped duplicate ${type}: ${item.title || item.question || id}`);
        continue;
      }
      seen.add(id);
      seededIds.push(id);
      await client.createOrReplace({ _id: id, _type: type, ...item });
    }

    if (type === "film") {
      const existing = await client.fetch('*[_type == "film"]._id');
      const orphans = existing.filter((id) => !seededIds.includes(id));
      for (const orphanId of orphans) {
        await client.delete(orphanId);
        console.log(`[seed-sanity] Removed orphan film: ${orphanId}`);
      }
    }

    console.log(`Seeded ${seededIds.length} ${type} document(s)`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
