#!/usr/bin/env node
/* Pushes a staged contribution to github.com/davidexo/permanent-ui without a
   local checkout, then opens the pull request. Uses `gh` for auth.

   node contribute.mjs --dir <staging dir> --branch add/<slug> --title "Add <name>" [--body-file notes.md]

   The staging dir mirrors repo paths, e.g.
     <dir>/registry/<slug>/meta.json
     <dir>/registry/<slug>/<Name>.tsx
     <dir>/registry/<slug>/original/...
     <dir>/registry/authors.ts          (only if changed)
     <dir>/registry/references.json     (only if changed)
   Every file in the dir is committed; nothing else in the repo is touched. */
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const REPO = "davidexo/permanent-ui";
const args = Object.fromEntries(process.argv.slice(2).map((a, i, all) => (a.startsWith("--") ? [a.slice(2), all[i + 1]] : [])).filter((x) => x.length));
const { dir, branch, title } = args;
if (!dir || !branch || !title) {
  console.error("usage: contribute.mjs --dir <staging> --branch add/<slug> --title \"Add <name>\" [--body-file <md>]");
  process.exit(1);
}
const gh = (...a) => execFileSync("gh", a, { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] }).trim();
const api = (path, opts = []) => JSON.parse(gh("api", path, ...opts));

const files = [];
const walk = (d) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else files.push(relative(dir, p));
  }
};
walk(dir);
if (!files.length) {
  console.error("staging dir is empty");
  process.exit(1);
}

const mainSha = api(`repos/${REPO}/git/ref/heads/main`).object.sha;
let branchExists = true;
try {
  api(`repos/${REPO}/git/ref/heads/${branch}`);
} catch {
  branchExists = false;
}
if (!branchExists) {
  api(`repos/${REPO}/git/refs`, ["-X", "POST", "-f", `ref=refs/heads/${branch}`, "-f", `sha=${mainSha}`]);
  console.log(`branch ${branch} created from main`);
}

for (const f of files) {
  const content = readFileSync(join(dir, f)).toString("base64");
  let sha;
  try {
    sha = api(`repos/${REPO}/contents/${f}?ref=${branch}`).sha;
  } catch {}
  const body = ["-X", "PUT", "-f", `message=${sha ? "Update" : "Add"} ${f}`, "-f", `content=${content}`, "-f", `branch=${branch}`];
  if (sha) body.push("-f", `sha=${sha}`);
  api(`repos/${REPO}/contents/${f}`, body);
  console.log(`${sha ? "updated" : "added"} ${f}`);
}

const existing = gh("pr", "list", "--repo", REPO, "--head", branch, "--json", "url", "--jq", ".[0].url");
if (existing) {
  console.log(`pull request already open: ${existing}`);
} else {
  const prArgs = ["pr", "create", "--repo", REPO, "--head", branch, "--base", "main", "--title", title];
  if (args["body-file"] && existsSync(args["body-file"])) prArgs.push("--body-file", args["body-file"]);
  else prArgs.push("--body", `${title}\n\nContributed with the permanent-ui skill.`);
  console.log(gh(...prArgs));
}
console.log("CI validates the contract; Vercel posts a preview URL on the PR. Open ?c=<slug> there to try the knobs.");
