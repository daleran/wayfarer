# New Station — Full Creation Workflow

The user wants to add a new station to Wayfarer. Follow every step in order. Do not skip the docs update at the end.

## Step 1 — Gather requirements

Ask the user (or infer from their description) for:
- **Display name** — e.g. "Ironveil Outpost"
- **Lore name** — same or different from display name; goes into LORE.md
- **Faction** — `'settlements'`, `'scavengers'`, `'concord'`, `'monastic'`, `'communes'`, or `'zealots'`
- **Services** — array of strings from: `'repair'`, `'fuel'`, `'trade'`, `'bounty'`, `'overhaul'`
- **Renderer type** — one of: `'default'` (hex), `'coil'`, `'fuel_depot'`, or `'new'` (needs a new renderer file)
- **Map position** — world coordinates `{ x, y }` (ask user or pick a thematically fitting region)
- **Visual identity** — brief description of shape/color/vibe if creating a new renderer

## Step 2 — Create the renderer file (if new renderer type)

File goes in `js/world/`. Filename: camelCase of the station name, e.g. `ironveilOutpost.js`.

The renderer class must extend the base `Station` class:

```js
import { Station } from './station.js';
import { CYAN, AMBER, RED, MAGENTA, GREEN } from '../ui/colors.js';

export class IronveilOutpost extends Station {
  constructor(data) {
    super(data);
    // Override accent color if needed — defaults to CYAN (friendly), RED (scavenger), AMBER (neutral)
    // this.accentColor is set by base class based on relation
  }

  _drawShape(ctx) {
    // ctx is already translated to (0, 0) and scaled by camera zoom
    // Draw at origin; station center = (0, 0)
    // Use this.accentColor for primary color
    // Use this._navPulse (0..1 oscillating) for animations
    // NEVER use inline hex strings — import all colors from js/ui/colors.js

    ctx.save();
    // ... draw station geometry ...
    ctx.restore();
  }
}
```

**Available base class fields:**
- `this.accentColor` — CYAN (settlements/neutral), RED (scavengers), AMBER (others) — set by relation
- `this._navPulse` — oscillates 0→1→0 each second; use for blinking lights, pulse rings
- `this._renderNameLabel(ctx, camera, yOffset)` — draws the station name label below the shape
- `this.name` — display name string
- `this.dockingRadius` — default 80; override if needed

**Renderer conventions:**
- Use `ctx.save()` / `ctx.restore()` around all draw calls
- ctx is already in local space (translated + scaled by camera); draw around (0, 0)
- Keep the silhouette readable at small zoom levels
- Existing examples: `js/world/coilStation.js`, `js/world/fuelDepot.js`

## Step 3 — Register in stationRegistry.js

Open `js/world/stationRegistry.js`. Make two changes:

**1. Add import at the top:**
```js
import { IronveilOutpost } from './ironveilOutpost.js';
```

**2. Add a case to `createStationEntity`:**
```js
case 'ironveil_outpost':
  entity = new IronveilOutpost(data);
  break;
```

**3. Add entry to `STATION_REGISTRY` array:**
```js
{
  id: 'ironveil-outpost',
  label: 'Ironveil Outpost',
  renderer: 'ironveil_outpost',
  faction: 'scavengers',
  designerZoom: 0.4,
}
```

## Step 4 — Add to map data

Open `js/data/maps/tyr.js`. Add to the `stations` array:
```js
{
  id: 'ironveil_outpost',
  name: 'Ironveil Outpost',
  renderer: 'ironveil_outpost',       // must match the switch case key
  x: XXXX, y: YYYY,
  faction: 'scavengers',
  services: ['repair', 'trade'],
  commodities: { fuel: 120, scrap: 200 },
  // canOverhaulReactor: true,          // only for reactor overhaul stations
  reputationFaction: 'scavengers',    // drives standing checks and docking refusal
}
```

Also add to `js/data/maps/arena.js` with coordinates reachable from player start.

## Step 5 — Add a designer entry

Open `js/test/designer.js`. Find the `Stations` category array and add:
```js
{
  id: 'ironveil-outpost',
  label: 'Ironveil Outpost',
  create: (x, y) => createStationEntity({ ...ironveilOutpostData, x, y }),
  designerZoom: 0.4,
}
```

Verify with `?designer&category=Stations&id=ironveil-outpost`.

## Step 6 — Update LORE.md

Find the "Stations & Locations" section in `LORE.md`. Add an entry:
- Station name and world coordinates
- Faction affiliation and brief lore blurb (1–2 sentences)
- Services available
- Any story hooks or notable NPCs

## Step 7 — Update MECHANICS.md

Find the "Stations" section in `MECHANICS.md`. Add:
- Station name, renderer type, faction
- Services list
- Any special behavior (e.g. reactor overhaul, Allied discount)

## Step 8 — Done

Tell the user to open `?designer&category=Stations&id=<slug>` to verify the renderer, and `editor.html?map=arena` to verify docking and services in-game.
