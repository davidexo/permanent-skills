# Component contract

Every component on the wall lives in `registry/<slug>/` and follows these rules. The
`permanent-ui` skill enforces them when it contributes on your behalf, and
`scripts/build-registry.mjs` validates the parts it can.

## Folder

```
registry/<slug>/
  meta.json            required, see below
  <Name>.tsx           required, default export, "use client"
  <Name>.module.css    optional, styling via theme tokens only
  original/            optional, the project-specific version, any files
    README.md          where it came from, what was stripped
```

`<slug>` is kebab-case. `<Name>` is PascalCase of the slug. The first entry in `files` is the `.tsx` entry.

## meta.json

```json
{
  "slug": "liquid-toggle",
  "name": "Liquid toggle",
  "description": "One sentence. What it does and what makes it worth taking.",
  "section": "inputs | actions | navigation | lists | feedback | data | motion",
  "interaction": "press | drag | hover | scroll | type | keyboard",
  "author": "github-handle, must exist in registry/authors.ts",
  "source": { "label": "Project or site name", "url": "https://optional" },
  "tags": ["lowercase", "search", "words"],
  "controls": {
    "speed":   { "type": "range",   "label": "Speed",   "min": 0, "max": 100, "step": 1, "default": 50, "unit": "" },
    "stroke":  { "type": "boolean", "label": "Stroke",  "default": false },
    "side":    { "type": "select",  "label": "Side",    "options": ["top", "bottom"], "default": "top" },
    "accent":  { "type": "color",   "label": "Accent",  "default": "#0d99ff" },
    "label":   { "type": "text",    "label": "Label",   "default": "Notify me" }
  },
  "files": ["LiquidToggle.tsx", "LiquidToggle.module.css"],
  "dependencies": ["motion"],
  "added": "2026-09-11",
  "tile": { "tone": "surface | dark", "span": 1 }
}
```

Sections are about purpose, not material: a slider that picks a time is `inputs`; a list of
people you tick is `lists`; a hold-to-delete button is `actions`; anything whose reason to exist
is the physics is `motion`.

## The component

- `"use client"` at the top. Default export a function component named `<Name>`.
- Imports allowed: `react`, `motion/react`, its own files. Nothing else. No project code, no
  icon libraries, no Tailwind, no utility packages. Inline small SVG icons.
- Every key in `controls` is an optional prop with the same default. With no props the component
  renders a complete, good-looking demo at natural size. That demo is what the wall shows.
- Sizes are intrinsic. Do not fill the container; the stage centres you. Aim for something
  between 200 and 420px wide.
- Keyboard and screen-reader basics: real `<button>`s, `role`/`aria-*` on custom widgets,
  `:focus-visible` rings via `outline` on `var(--pick)`.
- Prefer `motion/react` springs for anything that moves. Respect `prefers-reduced-motion`
  through the token durations or `useReducedMotion`.
- No `Math.random()` during render, no `Date.now()` in initial state. Hydration must match.

## Styling

Only theme tokens from `registry/_theme/tokens.css`:

- Surfaces: `--bg --surface --surface-2 --surface-3 --elev --card --solid --solid-ink`
- Ink: `--ink --ink-2 … --ink-5 --on-ink`, RGB triplets `--ink-rgb --surface-rgb --elev-rgb --on-ink-rgb`
- Lines: `--rule --rule-soft`
- Accents: `--pick --ok --warn --signal` (use sparingly; the library is mostly monochrome)
- Shadows: `--shadow-sm --shadow-md --shadow-lg`
- Radius: `--radius-sm --radius-md --radius-lg --radius-xl --radius-pill`
- Type: `--font-ui --font-mono`
- Motion: `--ease-out --ease-spring --dur-fast --dur --dur-slow`

No hex or rgb literals in the unified version, except inside an SVG filter matrix or a
`color` control default. Use `rgba(var(--ink-rgb), .12)` for tints. A component that needs a
brand color exposes it as a `color` control.

Class names go through the CSS module. Do not rely on global styles.

## Content

Placeholder people come from the dummy-names roster (Adam Whitfield, Albert Zimtea, Alexa
Reichhart, Antoine Plu, Christian Bollmann, David Bielenberg, Hugo Díaz, Leon Guaiana, Niclas
Ernst, Paolo Sabatella, Suleiman Zakari Mohammed, Théau Sarr, Will DiMondi). Emails are
`first@permanent.is`. Copy is neutral: no client names, no product names, no real data.

## Credit

`author` is the person who made it, by GitHub handle. If you are porting someone else's work
from another project or site, they are the author and you add them to `registry/authors.ts`
with a `url` if they have no GitHub. `source` says where it came from. Never present rebuilt
work as your own.

## Checks before a PR

```
pnpm registry     # validates meta.json and regenerates the index
pnpm typecheck
pnpm lint
pnpm build
```

Open the wall, open the component, drag every control through its full range, toggle dark
mode, toggle the dark stage. Nothing should clip, jump, or turn invisible.
