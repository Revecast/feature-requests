#!/usr/bin/env node
// Regenerates data.json with all issues + reactions + comment counts.
// Powered by the gh CLI (already authenticated in the Actions runner via GH_TOKEN).

import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const repo = process.env.GH_REPO;
if (!repo) {
  console.error("GH_REPO env var is required.");
  process.exit(1);
}

function gh(args) {
  return execSync(`gh ${args}`, { encoding: "utf8", maxBuffer: 50 * 1024 * 1024 });
}

const fields = [
  "number",
  "title",
  "body",
  "state",
  "stateReason",
  "labels",
  "reactionGroups",
  "comments",
  "author",
  "createdAt",
  "updatedAt",
  "closedAt",
  "url",
].join(",");

const raw = gh(`issue list --repo ${repo} --state all --limit 1000 --json ${fields}`);
const issues = JSON.parse(raw);

function reactionCount(rg, content) {
  const match = (rg || []).find((r) => r.content === content);
  return match?.users?.totalCount ?? 0;
}

function productLabel(labels) {
  const l = (labels || []).find((x) => x.name?.startsWith("product:"));
  return l ? l.name.slice("product:".length) : null;
}

function statusLabel(labels) {
  const l = (labels || []).find((x) => x.name?.startsWith("status:"));
  return l ? l.name.slice("status:".length) : null;
}

const items = issues.map((i) => ({
  number: i.number,
  title: i.title,
  body: i.body || "",
  state: i.state,
  stateReason: i.stateReason || null,
  product: productLabel(i.labels),
  status: statusLabel(i.labels),
  labels: (i.labels || []).map((l) => l.name),
  votes: reactionCount(i.reactionGroups, "THUMBS_UP"),
  hearts: reactionCount(i.reactionGroups, "HEART"),
  hooray: reactionCount(i.reactionGroups, "HOORAY"),
  comments: i.comments,
  author: i.author?.login || null,
  authorAvatar: i.author?.is_bot ? null : `https://github.com/${i.author?.login}.png?size=40`,
  createdAt: i.createdAt,
  updatedAt: i.updatedAt,
  closedAt: i.closedAt || null,
  url: i.url,
}));

const summary = {
  generatedAt: new Date().toISOString(),
  total: items.length,
  byProduct: {},
  byStatus: {},
};
for (const it of items) {
  if (it.product) summary.byProduct[it.product] = (summary.byProduct[it.product] || 0) + 1;
  if (it.status) summary.byStatus[it.status] = (summary.byStatus[it.status] || 0) + 1;
}

const out = { summary, items };
writeFileSync("data.json", JSON.stringify(out, null, 2));
console.log(`Wrote ${items.length} items to data.json`);
