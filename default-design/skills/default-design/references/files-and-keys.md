# Default — files, tokens and keys

> Point-in-time as of 2026-08-10, re-verified 2026-08-17. Keys and publish state change when the
> library is republished. Verify with a real `importComponentByKeyAsync` before trusting any key
> below — one key here went stale within a week of first being written down.

## The two files

| | File | Figma key |
|---|---|---|
| **System** (the library) | Default Infra System | `iFV77iME8X3h5Bl2pH2emI` |
| **Product** (the screens) | Default-Infra | `Tkd9od44sOpgyZFtu4cmJU` |

They are **separate files**, so the product file can only use system components if the system
file is *published as a team library and enabled in the product file*.

**System file pages** (verified 2026-08-17): vision `0:1`, Icons `1:14228`, then the indented
component pages — Avatar `33:10575`, Badge `1:14084`, Badge Number `33:10627`, Button `1:12493`,
Checkbox `33:12541`, Dropdown `33:10479`, Graphs `1:14083`, Hotkey `33:11279`, Input `33:11450`,
Logos & Boxed Icons `33:6161`, Sidebar `1:13346`, Separator `33:11406`, Slot `71:8805`,
Switch `33:10795`, Table `1:20037`, Tabs Header `1:13987`, Tabs / Segmented `33:11339`.
~2,500+ local components.

A `Components` page (`1:20036`) and a standalone `Boxed Icons` page no longer exist under those
names. A `Slot` page does exist, which does not contradict "the API cannot create native SLOTs"
below — those were made in the UI — but verify before relying on either.

**Product file:** the screens live on **Key Surfaces** (`564:87779`) as prototypes; small
interactions are done in code. Product-local components live on the **Local Components** pages —
note there are **two pages with that name** (`650:28331` and `4:111430`), so address them by id.

## Token architecture (system file)

Four local variable collections, layered:

1. **`1. TailwindCSS`** (`13:1145`) — raw primitives (`tailwind colors/neutral/50`, `alpha/*`).
2. **`2. Theme`** (`13:1146`), modes `Alt` / `Default OS` — holds `colors/<role>-light` and
   `colors/<role>-dark` **pairs**; the light/dark split lives in the variable *name* here.
3. **`3. Mode`** (`13:1147`), modes **Light `13:3` / Dark `13:4`** — **the consumed layer.**
   Screens bind to `base/*` here; each `base/<role>` aliases `colors/<role>-light` in Light and
   `-dark` in Dark. This is where the actual theme switch happens.
4. **`4. Custom`** (`13:1148`), modes `Desktop` / `Mobile`.

**Bind new work to `3. Mode` `base/*`.** Effect/text/paint **styles** are the system file's local
styles (fetch keys by running `getLocalEffectStylesAsync` / `…TextStylesAsync` /
`…PaintStylesAsync` inside `iFV77…`).

### The drift trap

Two other subscribed collections have the **same names and near-identical values**:

| Collection | 3. Mode key | verdict |
|---|---|---|
| **Default Infra System** | `3ff4b16ee4b7beee780eb9a56e995400cfaa222a` | ✅ bind here — verified 08-17, resolves 166 variables (`base/*`, `custom/*`, `alpha/*`) |
| Tokens | `2110fc0c3f77f4accc0747a8f01a3db0c6e6f2de` | ⚠️ near-duplicate, do not bind new work |
| shadcn_ui kit | `e9abae76…` | 🛑 old, purge on sight |

Other Default Infra System collections: `1. TailwindCSS` `a4217c3433dd3256f5d7750bf379022da42d7b32`,
`2. Theme` `cb2c19eaf61b78acb78b080e8a5458270ceb9f88`, `4. Custom` `3b7349664e5cb1e9fef0acd9ea0ba5ccac09f7e4`.

A wrong-library binding renders **pixel-identically** — the only way to catch it is comparing
keys. Bind library vars via `getVariablesInLibraryCollectionAsync(collKey)` → name→key →
`importVariableByKeyAsync`.

### Known non-bug

`base/secondary-foreground` in Dark is `#FAFAFA` (near-white), which is on-spec. A dark-on-dark
label almost always means the **frame is resolving `3. Mode = Light`** while sitting on a dark
background — fix the mode application, not the token value.

Useful: `variable.resolveForConsumer(node)`; a node's effective mode is
`node.resolvedVariableModes["VariableCollectionId:13:1147"]`; force one with
`node.setExplicitVariableModeForCollection(coll, modeId)` (load fonts first — it's font-sensitive).

## Old libraries — purge on sight

Instances resolving to any of these are debt: `🛑 Icons`, `🛑 Buttons`, `Components`
(`lk-42b62e…`), `Molecules`, `Action / *`, `Pattern / Table`, `Patterns / *`, `shadcn_ui kit`.
The system library is `Default Infra System` (`lk-a118…`).

## Frequently used component keys (system, published)

| Component | Key |
|---|---|
| Button (set) | `cf257ecf4f73702c2b43ea23b4aa5eeb05cfa451` ✅ verified 08-17 |
| Button Secondary / icon sm (28×28) | `7ad0c665435cb84d2b86cb0c89cd56b100f5696d` ✅ verified 08-17 |
| Button Ghost / icon sm | `f4fde555…` |
| Input | `5c0a774f…` |
| Badge | `04402bb1…` |
| Badge Outline/None | `f480404f…` |
| Boxed-Icon | `fcbfd95a…` |
| Avatar | `13edf8c8…` (set `33:10583`, has a `Person` axis for roster photos) |
| Separator Vertical | `750d1439…` |
| Table / Head | `0d4a747e2232ea23a908a385e1e5b233affdb289` (set `650:20721`) ✅ verified 08-17 |
| ~~Graph (set)~~ | ~~`53272089433cbd51a98e988b688e3ac763e487f6`~~ 🛑 **DEAD as of 08-17** — the split into `Graph/Type` standalones has completed; the set key returns "not found". Import the individual variants below. |
| Graph / KPI | `b3a2b898ab22333ccb9b0feff094f30b4583fa43` ✅ verified 08-17, imports as `Kind=KPI` |
| Graph / Bar | `406fa2a2688e5f981ead0a1d9b1af62b87a783a4` ✅ verified 08-17, imports as `Kind=Bar` |
| DropdownMenu Trigger | `d24bfca1d92e1308b0609cfcad7dda429ef5a634` ✅ verified 08-17 |

**Button property names** (they are inconsistent — copy exactly):
`Button Text#37:10`, `Show Left Icon#37:11`, `Left Icon#46:0`, `show Icon Right#267:0`
(lowercase "show"), `Icon Right#267:65`, `Shot Hotkey#3595:15` (yes, "Shot").

**Table header icons** — `Table / Head` instance:
```js
inst.setProperties({
  "Left icon #1#853:7": true,              // BOOLEAN — show leading icon
  "Left instance #1#853:2": "<node id>"    // INSTANCE_SWAP — node id, NOT a key
});
```
Established column → icon map: Workflow `Icon / Zap`, Form `Icon / NotepadText`, relative time
`Icon / History`, Status `Icon / CircleDashed`, edited-by `Icon / Pencil`, Person
`Icon / UserRound`, Company `Icon / Building`, Source `Icon / Globe`, CRM sync `Icon / RefreshCw`.
`Icon / RefreshCw` and `Icon / Globe` are stroke-only (no `filled=on`); `Icon / Route` and
`Icon / Megaphone` become illegible blobs at 14px — always zoom-check.

## Known unpublished / missing twins

Recheck these before assuming; as of the last sweep the system had **no** twin for `Activity
Item`, `App/Forms`, `Object Type/Home`, and the `Tabs Header` outer shell was deliberately kept
unpublished in favour of a product-local component (`927:13908`). The plugin API **cannot create
native SLOTs** — a "slot" built via API is a plain auto-layout frame, convertible only in the UI.
