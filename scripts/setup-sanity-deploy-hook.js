#!/usr/bin/env node
/**
 * Wire Sanity CMS publishes to Cloudflare Pages rebuilds.
 *
 * Creates (or reuses):
 *   1. A Cloudflare Pages deploy hook on the production project
 *   2. A Sanity document webhook that POSTs to that hook
 *   3. Production build env vars SANITY_PROJECT_ID + SANITY_DATASET
 *
 * Auth:
 *   Cloudflare — CLOUDFLARE_API_TOKEN, or wrangler OAuth token on disk
 *   Sanity — SANITY_MANAGEMENT_TOKEN (needs webhooks write), or `sanity login` CLI token
 *
 * Usage:
 *   node scripts/setup-sanity-deploy-hook.js
 *   CF_PAGES_PROJECT=rainscope-preview node scripts/setup-sanity-deploy-hook.js
 */
require("./load-env");

const fs = require("fs");
const os = require("os");
const path = require("path");

const CF_API = "https://api.cloudflare.com/client/v4";
const DEPLOY_HOOK_NAME = "Sanity CMS publish";
const SANITY_WEBHOOK_NAME = "Cloudflare Pages rebuild";
const CONTENT_FILTER =
  '_type in ["siteSettings","page","film","workReel","teamMember","liveService","liveProject","faqItem","formCopy"]';

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET || "production";
const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID || "023f3f4e2494ed1ce69bdfcc0cf5e52e";
const cfPagesProject = process.env.CF_PAGES_PROJECT || "rainscope-site";
const cfBranch = process.env.CF_PAGES_BRANCH || "main";

function readWranglerOAuthToken() {
  const candidates = [
    path.join(os.homedir(), "Library", "Preferences", ".wrangler", "config", "default.toml"),
    path.join(os.homedir(), ".wrangler", "config", "default.toml")
  ];
  for (const file of candidates) {
    if (!fs.existsSync(file)) continue;
    const match = fs.readFileSync(file, "utf8").match(/^oauth_token\s*=\s*"([^"]+)"/m);
    if (match) return match[1];
  }
  return null;
}

function readSanityCliToken() {
  const file = path.join(os.homedir(), ".config", "sanity", "config.json");
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")).authToken || null;
  } catch {
    return null;
  }
}

async function cfRequest(token, method, endpoint, body) {
  const res = await fetch(`${CF_API}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(`Cloudflare API ${method} ${endpoint}: ${JSON.stringify(data.errors || data)}`);
  }
  return data.result;
}

async function sanityRequest(token, method, endpoint, body) {
  const res = await fetch(`https://${projectId}.api.sanity.io/v2025-02-19${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  if (data.statusCode && data.statusCode >= 400) {
    throw new Error(`Sanity API ${method} ${endpoint}: ${data.message || JSON.stringify(data)}`);
  }
  return data;
}

function deployHookUrl(hookId) {
  return `https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/${hookId}`;
}

async function ensureDeployHook(cfToken) {
  const hooks = await cfRequest(
    cfToken,
    "GET",
    `/accounts/${cfAccountId}/pages/projects/${cfPagesProject}/deploy_hooks`
  );
  const existing = hooks.find((hook) => hook.name === DEPLOY_HOOK_NAME);
  if (existing) {
    console.log(`[cf] Reusing deploy hook "${DEPLOY_HOOK_NAME}" (${existing.hook_id})`);
    return deployHookUrl(existing.hook_id);
  }

  const created = await cfRequest(
    cfToken,
    "POST",
    `/accounts/${cfAccountId}/pages/projects/${cfPagesProject}/deploy_hooks`,
    { name: DEPLOY_HOOK_NAME, branch: cfBranch }
  );
  console.log(`[cf] Created deploy hook "${DEPLOY_HOOK_NAME}" (${created.hook_id})`);
  return deployHookUrl(created.hook_id);
}

async function ensureSanityWebhook(sanityToken, deployUrl) {
  const hooks = await sanityRequest(sanityToken, "GET", `/hooks/projects/${projectId}`);
  const list = Array.isArray(hooks) ? hooks : [];
  const existing = list.find((hook) => hook.name === SANITY_WEBHOOK_NAME);
  if (existing) {
    console.log(`[sanity] Reusing webhook "${SANITY_WEBHOOK_NAME}" (${existing.id})`);
    return existing.id;
  }

  const created = await sanityRequest(sanityToken, "POST", `/hooks/projects/${projectId}`, {
    type: "document",
    name: SANITY_WEBHOOK_NAME,
    description: `Triggers ${cfPagesProject} (${cfBranch}) deploy when CMS content is published`,
    url: deployUrl,
    dataset,
    apiVersion: "v2025-02-19",
    httpMethod: "POST",
    includeDrafts: false,
    rule: {
      on: ["create", "update", "delete"],
      filter: CONTENT_FILTER
    }
  });
  console.log(`[sanity] Created webhook "${SANITY_WEBHOOK_NAME}" (${created.id})`);
  return created.id;
}

async function ensureBuildEnvVars(cfToken) {
  await cfRequest(cfToken, "PATCH", `/accounts/${cfAccountId}/pages/projects/${cfPagesProject}`, {
    deployment_configs: {
      production: {
        env_vars: {
          SANITY_PROJECT_ID: { type: "plain_text", value: projectId },
          SANITY_DATASET: { type: "plain_text", value: dataset }
        }
      }
    }
  });
  console.log(`[cf] Set production env vars SANITY_PROJECT_ID and SANITY_DATASET on ${cfPagesProject}`);
}

async function main() {
  if (!projectId) {
    console.error("Missing SANITY_PROJECT_ID. Add it to .env first.");
    process.exit(1);
  }

  const cfToken = process.env.CLOUDFLARE_API_TOKEN || readWranglerOAuthToken();
  if (!cfToken) {
    console.error("No Cloudflare auth. Run `npx wrangler login` or set CLOUDFLARE_API_TOKEN.");
    process.exit(1);
  }

  const sanityToken =
    process.env.SANITY_MANAGEMENT_TOKEN || readSanityCliToken() || process.env.SANITY_TOKEN;
  if (!sanityToken) {
    console.error(
      "No Sanity auth with webhook permissions. Run `npx sanity login` in studio/ or set SANITY_MANAGEMENT_TOKEN."
    );
    process.exit(1);
  }

  console.log(`[setup] project=${cfPagesProject} branch=${cfBranch} sanity=${projectId}/${dataset}`);

  const deployUrl = await ensureDeployHook(cfToken);
  await ensureSanityWebhook(sanityToken, deployUrl);
  await ensureBuildEnvVars(cfToken);

  console.log("\nDone. Publish a change in Sanity Studio to verify:");
  console.log("  1. sanity.io/manage → API → Webhooks → Attempts (expect 200)");
  console.log(`  2. Cloudflare → ${cfPagesProject} → Deployments (source: deploy_hook)`);
}

main().catch((err) => {
  console.error("[setup] Error:", err.message);
  process.exit(1);
});
