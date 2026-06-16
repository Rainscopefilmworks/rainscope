const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CONFIG_PATH = path.join(ROOT, "sanity.config.json");

function readCommittedConfig() {
  if (!fs.existsSync(CONFIG_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  } catch {
    return null;
  }
}

function getSanityConfig() {
  const committed = readCommittedConfig();
  const projectId =
    process.env.SANITY_PROJECT_ID ||
    process.env.SANITY_STUDIO_PROJECT_ID ||
    committed?.projectId;
  const dataset =
    process.env.SANITY_DATASET ||
    process.env.SANITY_STUDIO_DATASET ||
    committed?.dataset ||
    "production";

  return { projectId, dataset };
}

module.exports = { getSanityConfig, CONFIG_PATH };
