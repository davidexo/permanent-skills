# Default — standing house rules

Every rule here came from a direct correction. They are cheap to follow and expensive to miss,
because each one is invisible on canvas until it isn't.

## Build rules

### `clipsContent = false` on everything you create

Not just the outer screen frame — every nested container, every component **main**, every set,
every section. System Buttons, Inputs and cards carry drop shadows, and any ancestor with
clipping on slices them off at its bounds. The damage is subtle: the design looks fine until you
notice buttons have a shadow on three sides.

`figma.createFrame()` and `figma.createAutoLayout()` both default `clipsContent` to **true**, so
this is opt-out on every single node. Make the sweep the last step of every build:

```js
const nodes = root.query('*').toArray().filter(n => !n.id.includes(';')); // owned only
nodes.push(root);
for (const n of nodes) if ('clipsContent' in n && n.clipsContent) n.clipsContent = false;
```

The only legitimate exception is a container whose purpose *is* to crop (a masked thumbnail).

### No white fills on new nodes

Only the one surface that genuinely needs a background gets a fill — bound to the right
`background`/`card` token. Every inner container stays fill-less. Stacked white fills are
redundant, they make token audits noisier, and they hide real dark-mode background problems.

### New components live in a named SECTION, sets get the purple stroke

1. Never leave new components loose on a page. Group related ones into one `SECTION` named for
   what they are ("Dropdown Menu", "Setup", "Workflows").
2. Every `COMPONENT_SET` gets `#9747FF`, `strokeWeight 1`, `dashPattern [10,5]`,
   `strokeAlign 'OUTSIDE'`. Figma draws this automatically for sets made in the UI, but
   `combineAsVariants` via the API produces a set with **no strokes at all**. Single components
   don't need it.

Appending into a `SECTION` does **not** preserve absolute position — compute the bounding box,
then offset each child by the section origin.

### Every table header carries a semantic leading icon

Product-wide. Pick the icon from the column's data type or entity, never leave a header bare.
House variant is always `filled=on, stroke=2, radius=2, join=round`. Mechanics and the
established column→icon map are in `files-and-keys.md`.

### Placeholder people come from the fixed roster

Never invent generic names (John Doe, User 1) and never normalise the spelling — the accents and
long names in the roster are deliberate truncation/diacritic stress-tests. Shuffle to fit
context; keep one person's email/initials/role consistent within a mockup. See the team's
`dummy-names` skill for the roster.

### Onboarding and auth screens are minimal centered columns

~360px wide, directly on the screen frame: no card wrapper, no split left-form/right-visual, no
decorative artwork (dot textures, floating app-icon tiles, gradients). Centered vertical
auto-layout, gap 24, children fill width, text centred, brand mark on top.

## Working rules

### Never restore work that disappeared

The design lead edits the file live while the agent works — adding variant axes, regrouping
columns, deleting UI that was just built. **If a node you created is missing, that is a decision,
not a regression.** Say what changed and move on; only restore when asked. Same for content
they've clearly authored: renamed layers, recoloured boxes, reordered sections — work around it,
don't normalise it back.

### Reference screens from the old file: content is the spec, styling is not

The old Figma explorations are the look being *replaced*. Take the field list, copy and states
from them; drop the chrome around them. Reproducing that styling reads as reviving it.

### Swap what exists, report the rest

When a component has no system twin, do not hand-build a lookalike and do not quietly leave it
pointing at an old library. Do every swap that's possible, then report the holdouts by name and
count. The holdout list is useful information — it's the system's backlog.

### Verify against the real node, not the build-time screenshot

Re-render the actual node before saying it's done. Screenshots taken immediately after a write
can render mid-layout (stale overlap), and the file may have changed under you.

### Report the judgment calls you made

Every non-obvious decision taken without asking — an accepted visual diff, a substituted
component, a token that didn't exist — goes in the summary. That list is where the next
correction comes from, and corrections are the input to the loop below.

## Feeding the loop

This whole way of working is cumulative. The rules above exist because someone said them once
and they got written down. So:

**When you learn something non-obvious, write it to memory before the session ends** — a
component key, a token id, an API gotcha, a convention you were corrected on, an "outlier" that
turned out to be intentional. One fact per memory file, with *why* it matters and *how to apply*
it.

**When a memory turns out to be a durable rule rather than a project fact, promote it into this
skill and commit it**, so it travels to everyone else on the team instead of living on one
machine. That promotion step is the difference between one person having a well-trained agent and
the team having one.
