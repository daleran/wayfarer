# Ship Class — Create or Edit

Create a new ship hull class or edit an existing one. Ship classes are pure vessel templates: shape, stats, slot layout. No faction, no AI, no identity.

## Step 1 — Identify scope

**Creating new?** Ask the user for:
- **Display name** — e.g. "Sentinel Class Corvette"
- **Slug** — kebab-case, e.g. `sentinel-corvette`
- **Visual identity** — hull shape, proportions, distinctive features
- **Size** — small (r 12–18), medium (r 20–28), large (r 30–45)
- **Mount points** — count, positions (arc: front/port/starboard/aft), sizes (small/large), engine-only slots

**Editing existing?** Read the file first. Ask what the user wants to change. Common edits:
- Reshape the hull (update `HULL_POINTS`, `ARC_MAP`, `_drawShape`)
- Add/move mount points (update `MOUNT_POINTS`)
- Rebalance stats (update entry in `data/shipClasses.js`)
- Resize collision bounds (update `getBounds()`)

## Step 2 — Read reference files

Before writing any code:
- `src/entities/ship.js` — `_initStats()`, `_drawHullArcs()`, `_playerHullFill()`, `_strokeArcCurrent()`, mount point system
- `src/rendering/colors.js` — all color constants
- `src/rendering/draw.js` — Shape factories and Draw API
- `data/shipClasses.js` — existing class stat multipliers
- `UX.md` — visual conventions and color palette
- Existing ship hull classes in `data/hulls/*/hull.js` for pattern reference

## Step 3 — Data stats

**New class:** Add an entry to `data/shipClasses.js` using `registerData(SHIP_CLASSES, { ... })`:
```js
'<slug>': {
  label: '<Display Name>',
  hullMult: 1.0, weightMult: 1.0, cargoMult: 1.0,
  armorFront: 1.0, armorSide: 1.0, armorAft: 1.0,
  fuelMaxMult: 1.0,
},
```

**Editing stats:** Update the existing entry in `data/shipClasses.js`.

**Balance guidelines:**
- Small/fast: speed 1.0–1.4, hull 0.5–0.8, thin armor, 2–3 small mounts
- Medium: speed 0.5–0.9, hull 1.0–2.0, moderate armor, 3–5 mixed mounts
- Large/heavy: speed 0.3–0.6, hull 2.0–4.0, heavy front, 5–7 mounts with large slots

## Step 4 — Ship class file

Location: `data/hulls/<slug>/hull.js`

Key requirements:
- Import stats from `SHIP_CLASSES['<id>']` via `@data/index.js`
- Use `this._initStats({ speed, accel, turn, hull, armorFront, armorSide, armorAft })` with data multipliers
- Set `this.shipClassName` and `this.shipType`
- Define `HULL_POINTS[]` array and `ARC_MAP { front, starboard, aft, port }` with index ranges
- Define `MOUNT_POINTS[]` with `{ x, y, arc, size, slot? }` entries
- Override `get _mountPoints()` to return `MOUNT_POINTS`
- Override `_drawShape(ctx)` with directional armor rendering:
  - Player: `this._playerHullFill()` fill + `this._drawHullArcs()` outline
  - NPC: `this.hullFill` fill + `this.hullStroke` outline
- Override `getBounds()` with collision radius
- Export `HULL_POINTS` (used by HUD minimap for player ship silhouette)
- Use colors from `src/rendering/colors.js` — NEVER inline hex
- Use Shape factories from `src/rendering/draw.js` where possible

For ships with separate components (nacelles, pods), use `_strokeArcCurrent(ctx, arcKey)` per sub-polygon. See `garrisonFrigate.js` and `g100Hauler.js` for examples.

## Step 5 — Register

Hull files self-register into `CONTENT.hulls` at import time via `registerContent()` from `data/dataRegistry.js`. `getShipRegistry()` in `src/entities/registry.js` reads from `CONTENT.hulls`:

```js
// In data/hulls/<slug>/hull.js
import { CONTENT, registerContent } from '@data/dataRegistry.js';

registerContent(CONTENT.hulls, '<slug>', {
  label: '<Display Name>',
  create: (x, y) => new <ClassName>(x, y),
});
```

The designer auto-discovers from `CONTENT.hulls` — no separate designer entry needed.

## Step 6 — Validate & verify

1. Run `npm run validate` — fix any errors
2. Tell the user to open `designer.html?category=ship-classes&id=<slug>` to verify:
   - Hull shape renders correctly at various zoom levels
   - Mount points visible as dotted squares
   - Stats panel shows expected values

## Step 7 — Update docs

- New hull archetype or size category → `MECHANICS.md`
- New visual patterns → `UX.md`
- Lore significance → `LORE.md`
