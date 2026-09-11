# Worked example: the liquid toggle

The reference implementation on the wall. Everything a contribution needs, in three files.

## meta.json

```json
{
  "slug": "liquid-toggle",
  "name": "Liquid toggle",
  "description": "A switch whose thumb is followed by a second blob on a lagging spring, so it stretches like goo exactly as fast as you move it.",
  "section": "inputs",
  "interaction": "press",
  "author": "bencho",
  "source": { "label": "bencho.dev", "url": "https://bencho.dev" },
  "tags": ["switch", "toggle", "spring", "goo", "svg filter"],
  "controls": {
    "speed": { "type": "range", "label": "Speed", "min": 0, "max": 100, "default": 50 },
    "stretch": { "type": "range", "label": "Stretch", "min": 0, "max": 100, "default": 36 },
    "stroke": { "type": "boolean", "label": "Stroke", "default": false }
  },
  "files": ["LiquidToggle.tsx", "LiquidToggle.module.css"],
  "dependencies": ["motion"],
  "added": "2026-09-11"
}
```

## LiquidToggle.tsx (shape)

```tsx
"use client";
import { useId, useState } from "react";
import { animate, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import styles from "./LiquidToggle.module.css";

export type LiquidToggleProps = { speed?: number; stretch?: number; stroke?: boolean; defaultOn?: boolean; onChange?: (on: boolean) => void };

export default function LiquidToggle({ speed = 50, stretch = 36, stroke = false, defaultOn = false, onChange }: LiquidToggleProps) {
  // one position, two blobs: the thumb writes x, the drop chases it on a softer spring
  ...
  return <button type="button" role="switch" aria-checked={on} className={styles.track} data-on={on || undefined} data-stroke={stroke || undefined} onClick={toggle}>…</button>;
}
```

Notes on why it passes the contract:

- Default export, `"use client"`, imports only react, motion and its own CSS module.
- Every control key (`speed`, `stretch`, `stroke`) is an optional prop with the same default as meta.
- Extra props (`defaultOn`, `onChange`) are fine; they are not controls, so the wall ignores them.
- All colour comes from `var(--ink)`, `var(--surface-3)`, `rgba(var(--ink-rgb), .18)`, `var(--rule)`.
- The SVG filter id comes from `useId`, so many instances on one wall do not collide.
- No randomness, no `Date.now()`, so the server and client render the same first frame.

## The original folder

The liquid toggle has none because it was rebuilt from a description. A component ported from a
project would have `registry/liquid-toggle/original/LiquidToggle.tsx` (or whatever it was called there,
Tailwind and all) plus `original/README.md`:

```
From: <project name>, src/components/feed/Toggle.tsx, 2026-08-30
Stripped: project theme classes, analytics call on toggle, i18n label lookup
Needs: tailwind v4 with the project preset, framer-motion 11
```
