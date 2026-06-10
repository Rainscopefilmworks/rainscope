const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.join(ROOT, ".env"));
loadEnvFile(path.join(ROOT, "studio", ".env"));

// Keep root + studio env in sync
if (!process.env.SANITY_PROJECT_ID && process.env.SANITY_STUDIO_PROJECT_ID) {
  process.env.SANITY_PROJECT_ID = process.env.SANITY_STUDIO_PROJECT_ID;
}
if (!process.env.SANITY_STUDIO_PROJECT_ID && process.env.SANITY_PROJECT_ID) {
  process.env.SANITY_STUDIO_PROJECT_ID = process.env.SANITY_PROJECT_ID;
}
if (!process.env.SANITY_DATASET && process.env.SANITY_STUDIO_DATASET) {
  process.env.SANITY_DATASET = process.env.SANITY_STUDIO_DATASET;
}
