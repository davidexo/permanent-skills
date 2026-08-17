# Figma Plugin API gotchas (learned the expensive way)

Each of these cost a rolled-back transaction or a debug loop. They apply to any `use_figma` work
in the Default files.

## Atomicity and reads

**`use_figma` is atomic.** One bad read at the end rolls back the entire call — nothing lands,
the file stays clean, and you learn nothing. So keep mutating calls short and read-free.

**Never read a mutated instance subtree in the same call.** Setting an override (`visible`,
`characters`, layout props) on a node *inside* an instance regenerates that subtree and
invalidates every node reference you hold, including ones fetched moments earlier. Symptoms:
`The node with id "…" does not exist`, or `cannot read property 'visible' of undefined`.

Instead: capture "before" values *before* writing; re-resolve each target fresh immediately
before each write (`getNodeByIdAsync` → `findOne`); put **zero** post-write reads in the mutating
call; verify in a separate follow-up call plus a screenshot.

**`figma.currentPage` resets to the first page every call**, so `figma.currentPage.selection`
cannot see the user's live editor selection — ask for a node URL instead.

**Scope your reads.** A `findAll` over a large table subtree can kill the MCP proxy — read
per-column or per-instance. `loadAllPagesAsync` is not supported in the system file; loop
`page.loadAsync()` instead (and prefer it over `setCurrentPageAsync` so parallel per-page scripts
don't race).

## Instance overrides

**`INSTANCE_SWAP` properties take a node id, not a component key.** Passing a 40-char key fails
with "Property value is incompatible with component property type".

```js
const arrow = await figma.importComponentByKeyAsync(KEY); // make it available locally
btn.setProperties({ "Icon Right#267:65": arrow.id });     // .id, NOT .key
```

**`layoutMode` is not override-tracked on instance children — it silently reverts.** Reports
success, throws nothing, gone on the next read, even as the last mutation in the call. By
contrast `itemSpacing`, `counterAxisAlignItems`, `primaryAxisAlignItems` and
`layoutSizingVertical` all persist. Consequence: **you cannot restructure an instance's layout
via overrides** — only retune spacing/alignment inside the structure the main defines.
Restructuring means editing the main, localizing, or detaching.

**`setProperties` clobbers sibling overrides — order matters.** It regenerates enough of the
subtree to silently drop overrides applied earlier in the session (observed: a truncated button
label, a flipped `primaryAxisAlignItems`, a reset `layoutMode`). Sequence as: **all
`setProperties` first, then plain node overrides (text, visible, layout) after** — and re-verify
anything set before a `setProperties` ran.

**Hidden instance children vanish from `.children`.** After `blk.visible = false`, the node is
gone from the parent's array entirely, not merely `visible: false`. Index-based access like
`content.children[1]` will be `undefined` — never assume a stable child count across a visibility
change.

**Nested `resize()` inside an instance silently reverts** where there's no per-instance geometry
override (e.g. Graph bar-chart ramps). Component-default geometry is the accepted diff.

**SLOT children *are* editable per-instance** — `insertChild` / `remove` work inside an instance
with no detach needed. But the API **cannot create** a native slot; one built via API is a plain
auto-layout frame.

## Swapping and relinking

- Filter to **outermost** instances with `!id.includes(";")` — nested ones ride along.
- Parse variant props from the node **name**, not `.variantProperties` — the latter throws
  "Component set has existing errors" on some system sets.
- Compute the full outermost set **before any swap**; swaps invalidate descendant refs.
- Wrap each instance in try/catch so one failure doesn't roll back the batch.
- Swaps preserve overrides when the two sets share property ids (the system sets inherited the old
  libraries' ids, which is why relinks mostly carry text/colour/boolean overrides cleanly). What
  commonly **drops**: explicit heights, nested `Type` overrides on logos, icon-glyph swaps and
  hotkeys inside swapped Buttons. Re-set them per instance.
- **`getPublishStatusAsync()` is unreliable** — it reports UNPUBLISHED for components that import
  fine. An actual `importComponentByKeyAsync` is the only ground truth. If it says "not found",
  the fix is a republish by the file owner, not a workaround.
- **Never `Cmd+X` a component between files.** Cut severs every instance↔main link and orphans
  the set into limbo: `removed === false` but no `mainPage`, instances showing "Restore
  Component" while still rendering. Detect orphans by **set-key mismatch**, not `mc === null`.
  Paste-orphan mains cannot be re-parented — detach and recompose.
- Relinking pulls in the **current** library geometry, so it restyles historical snapshot pages
  too. Confirm before relinking a whole file.

## Layout

- `SPACE_BETWEEN` on `primaryAxisAlignItems` makes `itemSpacing` inert.
- A full-width row cannot live inside an auto-positioned `GRID`.
- Check what a frame's **parent** is before appending siblings — appending into a vertical
  auto-layout parent whose child is `FILL` will shrink that child. Append masters to
  `figma.currentPage`, not `surface.parent`.
- Measure text before sizing a container; don't guess widths.
