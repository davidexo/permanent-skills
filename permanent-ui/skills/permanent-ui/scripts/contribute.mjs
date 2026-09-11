#!/usr/bin/env node
/* Pushes a staged contribution to github.com/davidexo/permanent-ui without a
   local checkout, then opens the pull request. Uses `gh` for auth.

   node contribute.mjs --dir <staging dir> --branch add/<slug> --title "Add <name>" [--body-file notes.md] [--no-merge]

   After the PR is open: if the signed-in user can push to the repo, the script
   waits for the checks and squash-merges the PR itself, so a maintainer's
   contribution lands in one go. Without push access, or with --no-merge, the
   PR is left for review.

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
const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a === "--no-merge"));
const args = Object.fromEntries(argv.map((a, i, all) => (a.startsWith("--") && a !== "--no-merge" ? [a.slice(2), all[i + 1]] : [])).filter((x) => x.length));
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

let prUrl = gh("pr", "list", "--repo", REPO, "--head", branch, "--json", "url", "--jq", ".[0].url");
if (prUrl) {
  console.log(`pull request already open: ${prUrl}`);
} else {
  const prArgs = ["pr", "create", "--repo", REPO, "--head", branch, "--base", "main", "--title", title];
  if (args["body-file"] && existsSync(args["body-file"])) prArgs.push("--body-file", args["body-file"]);
  else prArgs.push("--body", `${title}\n\nContributed with the permanent-ui skill.`);
  prUrl = gh(...prArgs).split("\n").find((l) => l.startsWith("https://")) ?? "";
  console.log(`pull request: ${prUrl}`);
}

/* maintainers land it themselves; everyone else hands it to review */
const canPush = api(`repos/${REPO}`).permissions?.push === true;
if (!canPush || flags.has("--no-merge")) {
  console.log(canPush ? "left open for review (--no-merge)." : "you do not have push access to the library; the PR is open for a maintainer to review.");
  console.log("CI validates the contract; Vercel posts a preview URL on the PR. Open ?c=<slug> there to try the knobs.");
  process.exit(0);
}

console.log("you can push to the library: waiting for the checks, then merging.");
let green = true;
try {
  execFileSync("gh", ["pr", "checks", prUrl, "--repo", REPO, "--watch", "--fail-fast"], { stdio: "inherit" });
} catch {
  green = false;
}
if (!green) {
  console.log(`a check failed. Fix the staged files, rerun this script (it updates the branch), or read the log: gh run list --repo ${REPO} --branch ${branch}`);
  process.exit(1);
}
execFileSync("gh", ["pr", "merge", prUrl, "--repo", REPO, "--squash", "--delete-branch"], { stdio: "inherit" });
console.log(`merged. Vercel redeploys main; it will be on the wall in a minute or two.`);
