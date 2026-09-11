---
name: permanent-ui
description: The contract for PERMANENT ui, our internal component library (React, motion, CSS modules, one shared theme). Use it to CONTRIBUTE a component from the project you are working in ("add this to the library", "put this tooltip on the wall", "/permanent-ui add path/to/Component.tsx"), to TAKE a component from the library into a project ("grab the liquid toggle from permanent ui"), or to BOOKMARK a reference site for the team. Also triggers at the end of any frontend session where the user leaned on external reference links, so those links land in the library's References page.
---

# PERMANENT ui

Internal component library at `https://permanent-ui.vercel.app`, source in `github.com/davidexo/permanent-ui`.
Every component on the wall is a folder under `registry/<slug>/` with a `meta.json`, a self-contained
React component styled only with the shared theme tokens, optional knobs the wall renders as controls,
and the GitHub handle of whoever made it. This skill is the one way things get in and out.

Three jobs: **contribute**, **take**, **bookmark**. Read the section you need. The rules in
`references/contract.md` apply to everything you write into the registry.

## Contribute a component

You are in some project (a client codebase, a prototype) and the user points at a component they built.
Get it onto the wall as two versions: the **unified** one that follows the library theme, and the
**original** one exactly as it shipped, so nothing is lost.

### 1. Get a library checkout

```bash
test -d ~/permanent-ui || gh repo clone davidexo/permanent-ui ~/permanent-ui
cd ~/permanent-ui && git checkout main && git pull --ff-only && pnpm install
git checkout -b add/<slug>
```

If the user has the library checked out elsewhere, use that. Never write into the user's project;
the project stays untouched and keeps using its own copy of the component.

### 2. Read the source, all of it

Open the component and every file it imports from its own project: hooks, utils, sibling components,
icons, styles, theme files, Tailwind config. Understand:

- What the interaction actually is. The behaviour is the thing we are keeping.
- Which parts are project-specific: copy, brand colours, icon libraries, data shapes, analytics calls,
  routing, i18n, feature flags, global store access.
- Which values are tuning knobs: spring stiffness, durations, sizes, thresholds, variants.

### 3. Identify

Decide, and state to the user in one line each:

- `slug` kebab-case, `name` in sentence case (e.g. "Liquid toggle").
- `section`: inputs, actions, navigation, lists, feedback, data, motion. About purpose, not material.
- `interaction`: press, drag, hover, scroll, type, keyboard. The primary one.
- `author`: the GitHub handle of who built it. Default to the user's handle from `gh api user --jq .login`.
  If the user is porting someone else's work, that person is the author.
- `source`: `{ "label": "<project name>" }`, plus `url` if public. Client names are fine here.

### 4. Write the unified version

Create `registry/<slug>/<Name>.tsx` and `registry/<slug>/<Name>.module.css`. Rewrite, do not paste:

- `"use client"`, default export, function named `<Name>`.
- Imports: `react`, `motion/react`, own files. Nothing else. Inline any icon as a small SVG.
  Replace utility libraries with plain code. Replace Tailwind classes with the CSS module.
- Colours, radii, shadows, fonts, durations: only tokens from `registry/_theme/tokens.css`.
  See `references/contract.md` for the list. Brand colours become a `color` control or a tint of ink.
- Copy becomes neutral. Client copy out, plain words in. People come from the dummy-names roster.
- Data becomes a small internal array with a sensible default. No fetching, no store, no router.
- Every tuning knob becomes an optional prop with a default that matches how it shipped.
  Aim for 2 to 4 controls that visibly change something. Physics and timing make good ranges;
  variants make good selects; on/off features make good booleans.
- Two conventions the wall already uses, add them when they make sense: `fill` as a select
  `["light", "dark"]` that sets `data-theme={fill === "dark" ? "dark" : undefined}` on the root
  so the component previews on the other theme, and `stroke` as a boolean that draws a hairline
  ring in `var(--rule)`.
- With no props it must render a complete demo at natural size, 200 to 420px wide.
- Keep the accessibility that was there and add what was missing: real buttons, roles, focus ring
  via `outline` on `var(--pick)`.

Test it in your head against three grounds: the light tile, the dark theme, and the flipped stage.
Tints of `var(--ink-rgb)` and `var(--elev)` cards read on all three.

### 5. Keep the original

Copy the source files as they are into `registry/<slug>/original/`, preserving relative paths, plus
`original/README.md` with: the project it came from, the commit or date, what the unified version
stripped, and anything a reader needs to run it (dependencies, context providers, theme).
Strip secrets and real customer data; keep everything else. The wall shows both and offers both
for install.

### 6. Write meta.json

```json
{
  "slug": "<slug>",
  "name": "<Name in sentence case>",
  "description": "One sentence. What it does and what makes it worth taking.",
  "section": "<section>",
  "interaction": "<interaction>",
  "author": "<github-handle>",
  "source": { "label": "<project>", "url": "<optional>" },
  "tags": ["three", "to", "eight", "search", "words"],
  "controls": {
    "<prop>": { "type": "range", "label": "Speed", "min": 0, "max": 100, "step": 1, "default": 50 }
  },
  "files": ["<Name>.tsx", "<Name>.module.css"],
  "dependencies": ["motion"],
  "added": "<today, ISO date>"
}
```

Control types: `range` (min, max, step, default, optional unit), `boolean`, `select` (options, default),
`color` (hex default), `text`. Keys equal prop names.

If the author is new, add them to `registry/authors.ts` with `id` equal to the GitHub handle,
`name`, `github`, and a short `note` (usually "PERMANENT").

### 7. Bookmark what you leaned on

If the session used external reference links for this component (a site you studied, a library whose
demo you matched, a shader you borrowed an idea from), add each to `registry/references.json` unless the
URL is already there. See **Bookmark** below. Say which you added.

### 8. Verify

```bash
pnpm registry && pnpm typecheck && pnpm lint && pnpm build
```

Fix everything the registry script complains about; it validates the contract. Then run
`pnpm dev`, open `http://localhost:3000/?c=<slug>`, drag every control through its range, flip the
stage theme, and check the tile on the wall. If you have browser tools, do it yourself; otherwise ask
the user to look and wait.

### 9. Open the PR

```bash
git add registry/<slug> registry/authors.ts registry/references.json
git commit -m "Add <name>"
git push -u origin add/<slug>
gh pr create --title "Add <name>" --body "<what it is, where it came from, the controls, what was stripped, references added>"
```

Report the PR link and the deep link `https://permanent-ui.vercel.app/?c=<slug>` the wall will have once merged.
The PR author is the GitHub identity; that is how credit works here.

## Take a component into a project

Every component is a shadcn-compatible registry item:

```bash
npx shadcn@latest add https://permanent-ui.vercel.app/r/<slug>.json            # unified
npx shadcn@latest add https://permanent-ui.vercel.app/r/<slug>-original.json   # as it shipped, when it exists
```

Without shadcn, fetch the JSON and write each `files[].content` to `files[].path`. The unified item
also ships `styles/permanent-ui-tokens.css`; import it once, or better, map the variables it defines onto
the project's own theme so the component takes the project's look. The component only reads those
variables, so restyling is a matter of redefining them, then editing the module CSS if a detail needs
to change. Install `dependencies` from the item (usually `motion`).

`https://permanent-ui.vercel.app/r/index.json` lists everything with its meta, for searching without the UI.

## Bookmark a reference

`registry/references.json` is the team's bookmark list, shown at `/references` and in the ⌘K palette.
Append an object:

```json
{
  "title": "<site or page name>",
  "url": "<canonical url, no tracking params>",
  "note": "<one line: why a teammate would open it>",
  "tags": ["lowercase", "words"],
  "addedBy": "<github-handle, must exist in registry/authors.ts>",
  "added": "<today, ISO date>"
}
```

Skip a URL that is already present (compare hostnames plus path, ignore trailing slashes). Skip
documentation for libraries already in the stack (React, Next, motion docs) and anything behind a login.
Keep design references, component galleries, shader and motion libraries, typography sources, and any
page the user explicitly said was useful. When bookmarking on its own, open a PR titled
"Bookmark <title>"; when part of a contribution, ship it in the same PR.

## Things you never do

- Present rebuilt or ported work under the wrong name. The author field is who made it.
- Paste project code into the unified version. It is a rewrite against the contract.
- Add dependencies beyond `react` and `motion`.
- Put hex colours, Tailwind classes or icon packages in a unified component.
- Push to `main`. Everything is a PR.
- Edit `registry/types.ts`, `registry/_theme/tokens.css`, `scripts/`, or `src/` as part of a
  contribution. Those change through their own PRs.
