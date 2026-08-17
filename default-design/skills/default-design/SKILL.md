---
name: default-design
description: >-
  The house method for designing Default (Default Infra) surfaces in Figma — how this team
  extends the Default Infra System library on-spec instead of inventing new UI. Use this for
  any work touching the Default Infra System file or the Default-Infra product file: building
  or restyling a screen, adding a component or variant, swapping instances onto the published
  system library, binding fills/text/effects to the system's tokens, or auditing a frame's
  provenance. Trigger it even when the request doesn't say "design system" — "build the
  workflows home page", "make this match the others", "clean this frame up", "use our
  components", "relink these instances", instances showing "Restore Component", or any
  figma.com URL into either Default file all qualify. It governs the DISCIPLINE (discover
  before you create, bind don't hardcode, one library only, verify by screenshot); it composes
  with figma-use (Plugin API mechanics) and figma-token-binding (re-valuing tokens).
---

# Designing Default in Figma

The job is never "make something that looks right on its own." It is **extend a living product
so the new piece is indistinguishable from one the design lead would have made.** The existing
files are the source of truth — not your taste, not generic SaaS conventions, not shadcn defaults.

**Load `figma-use` first.** It covers `use_figma` mechanics (page rules, atomic calls, returning
node ids) that every step below depends on. This skill is the method layered on top.

## Before you touch anything

1. **Read `references/files-and-keys.md`** — which file you're in, the token collections, the
   library keys. Getting this wrong is the single most common way work has to be redone.
2. **Find the closest thing that already exists** and read how it is built. There is almost
   always a finished sibling: another home page, another table, another card. Clone-and-adapt a
   finished surface beats composing one from atoms.
3. **Ask for a node URL** if the target is ambiguous. `figma.currentPage` resets to the first
   page on every `use_figma` call, so the plugin cannot see the user's live selection.

## The six disciplines

### 1. Discover before you create — copy a sibling, don't invent

Mirror a sibling's **construction**, not just its appearance: node hierarchy, layer names,
auto-layout mode/padding/gap, which variable each paint binds to, which text style, stroke
weight and align. Read it with a small read-only `use_figma` script that walks `children` and
reports `boundVariables`, `fills`, `textStyleId`, `strokeWeight` — then reproduce it.

Design systems encode dozens of invisible decisions. Eyeballing reproduces the silhouette and
silently breaks the rest. Copying construction inherits all of them for free.

### 2. One library only — Default Infra System

Everything must resolve to the **Default Infra System** file. Near-duplicate collections named
`Tokens` and `shadcn_ui kit …` exist with the *same variable names and near-identical values* —
a wrong-library binding looks perfectly correct on canvas and is the main source of invisible
drift. Same trap on styles: `text-sm/leading-normal/medium` exists in more than one library with
different keys.

**Compare keys, never names.** See `references/files-and-keys.md` for the key table.

When a needed component genuinely has no system twin, do not fake it and do not silently leave
old-library debt: **swap everything that exists, then report the holdouts by name and count.**

### 3. Bind to tokens — never hardcode a value the system already names

Every fill, stroke, text colour and effect binds to the variable or style its peers use. Find
the token a sibling binds to, take its id, bind the new node's paint to the *same* variable.

```js
const v = await figma.variables.getVariableByIdAsync("VariableID:…");
let paint = { type: 'SOLID', color: { r: 0, g: 0, b: 0 } }; // hex is a fallback only
paint = figma.variables.setBoundVariableForPaint(paint, 'color', v);
node.fills = [paint];
```

A hardcoded value looks identical today and breaks the moment dark mode is applied or a token
is re-valued. If the task runs the other direction — re-valuing tokens so they match a screen,
repairing mis-pointed aliases, a full bound-state sweep — switch to `figma-token-binding`.

### 4. Obey the standing house rules

These are non-negotiable and come from repeated direct feedback. Full list with rationale in
`references/house-rules.md`; the short version:

- `clipsContent = false` on **every** frame, component, set and section you create — mains too,
  not just screens. Clipping crops the button/input drop shadows. Both create APIs default it to
  `true`, so this is opt-out on every node; sweep the whole tree as the last step of any build.
- **No white fills on new nodes.** Only the one surface that genuinely needs a background gets a
  fill, bound to a token. Inner containers stay fill-less.
- **New components live inside a named SECTION**, and every `COMPONENT_SET` gets the purple
  dashed stroke (`#9747FF`, 1px, dash `[10,5]`, `OUTSIDE`) — `combineAsVariants` produces sets
  with no stroke at all.
- **Every table header carries a semantic leading icon**, chosen from the column's data type,
  house variant `filled=on, stroke=2, radius=2, join=round`.
- **Placeholder people come from the fixed roster** — never invent names. (See the team's
  `dummy-names` skill; the roster is the single source of truth for demo humans.)
- **Never restore work that disappeared.** The design lead edits the file live while you work. A
  node that vanished is a decision, not a regression — say it's gone, don't re-add it.

### 5. Verify by screenshot, against neighbours

A card that looks right alone reads too heavy the instant it sits in the row. After building,
screenshot the node **and** its container, and compare against real neighbours. Never declare
done off a build-time screenshot: re-render the actual node, because the file may have changed
under you and screenshots taken immediately after a write can catch mid-layout state.

The only meaningful test is whether a stranger could pick your addition out of the lineup.

### 6. Work incrementally, return ids, and write down what you learn

Small `use_figma` calls, validated one at a time, each returning the ids it created or mutated.
`use_figma` is atomic — one bad read at the end rolls the whole call back and nothing lands.

Then **record anything non-obvious to memory**: a component key, a token id, a gotcha, a
convention the user corrected you on. That accumulation is the entire reason this workflow gets
faster; see `references/house-rules.md` § "Feeding the loop".

## Workflow: build or rework a screen

1. Confirm file + page + target frame (node URL). Read `references/files-and-keys.md`.
2. Find the **reference surface** — the closest finished screen. The house pattern is
   left = reference, right = working copy, side by side on the page.
3. Read the spec source (a comment, a call transcript, a Mobbin reference). When a reference
   screen comes from the *old* Figma explorations: **its content is the spec, its styling is
   not.** Reproducing that chrome revives the look being replaced.
4. Compose from published system instances; clone whole finished sub-surfaces where possible.
5. Bind every owned node's paints/styles/scalars to Default Infra System.
6. Sweep `clipsContent`, strip stray white fills, set the dummy names from the roster.
7. Screenshot, compare to the reference frame, fix, then report: what you built, what you
   couldn't (holdouts, unpublished twins), what you decided on your own.

## Workflow: relink / provenance sweep

Standard sequence, proven across ~10 surfaces:

1. Enumerate instances; keep only **outermost** ones (`!id.includes(";")`) — nested instances
   ride along inside the new main.
2. Resolve each main → set name + variant, match the same-named published system variant by
   order-insensitive `key=value`, then `importComponentByKeyAsync(variantKey)` (cache per key)
   → `swapComponent`. Wrap each instance in try/catch so one failure doesn't roll back the batch.
3. Parse variant props from the node **name**, not `.variantProperties` — the latter throws
   "Component set has existing errors" on some system sets.
4. Re-check what the swap dropped: explicit heights, nested `Type` overrides, icon-glyph swaps
   and hotkeys commonly reset to the new main's defaults. Restore them per instance.
5. Rebind owned nodes' paints/styles/vars to Default Infra System; audit for 0 old-lib refs.
6. Report holdouts with no system twin instead of hand-building lookalikes.

Cross-file swaps require the system library to be **published and enabled** in the consuming
file. `getPublishStatusAsync()` is unreliable here — an actual `importComponentByKeyAsync` is
the only ground truth. If it returns "not found", the answer is a republish by the file owner,
not a workaround.

## Composing with other skills

- **`figma-use`** — always; the API layer.
- **`figma-token-binding`** — re-valuing/repairing tokens, bound-state sweeps.
- **`figma-generate-library`** — net-new component libraries from code.
- **`dummy-names`** — the placeholder-people roster.
- **Mobbin MCP** (`search_screens` / `search_flows`) — for reference-shopping a pattern before
  designing it. Reference for *structure and content*, never for styling: styling comes from the
  system.

## References

- `references/files-and-keys.md` — files, pages, token collections, library keys, publish state.
- `references/house-rules.md` — the standing rules, with the reasoning behind each.
- `references/figma-api-gotchas.md` — the expensive Plugin API traps (instance overrides,
  atomicity, what silently reverts).
