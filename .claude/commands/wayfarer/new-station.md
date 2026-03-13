# New Station — Full Creation Workflow

The user wants to add a new station to Wayfarer. Follow every step in order. Do not skip the docs update at the end.

## Step 1 — Gather requirements

Ask the user (or infer from their description) for:
- **Display name** — e.g. "Ironveil Outpost"
- **Lore name** — same or different from display name; goes into LORE.md
- **Faction** — `'settlements'`, `'scavengers'`, `'concord'`, `'monastic'`, `'communes'`, or `'zealots'`
- **Services** — array of strings from: `'repair'`, `'fuel'`, `'trade'`, `'bounty'`, `'overhaul'`
- **Renderer type** — one of: `'default'` (generic hex from `Station` base), or `'new'` (needs a custom renderer class)
- **Zone** — which zone does this station belong to? Currently only `gravewake/`
- **Map position** — world coordinates `{ x, y }` (ask user or pick a thematically fitting region)
- **Visual identity** — brief description of shape/color/vibe if creating a new renderer

## Step 2 — Create the zone entity file

File goes in `js/world/zones/<zone>/`. Filename: camelCase of the station name, e.g. `ironveilOutpost.js`.

The file contains: renderer class (if custom) + data descriptor + layout + `instantiate(x, y)`.

```js
// js/world/zones/gravewake/ironveilOutpost.js
import { Station } from '../../station.js';
import { CYAN, AMBER, WHITE } from '../../../rendering/colors.js';

// ── Custom renderer (skip if using generic hex) ─────────────────────────────

class IronveilOutpostStation extends Station {
  constructor(x, y, data) {
    super(x, y, data);
    this.dockingRadius = 150;
  }

  render(ctx, camera) {
    const screen = camera.worldToScreen(this.x, this.y);
    ctx.save();
    ctx.translate(screen.x, screen.y);
    ctx.scale(camera.zoom, camera.zoom);
    // ... draw station geometry at origin ...
    this._renderNameLabel(ctx, camera, 68);
    ctx.restore();
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 50 };
  }
}

// ── Layout ──────────────────────────────────────────────────────────────────

const LAYOUT = {
  type:  'simple',   // or 'zone-map' for SVG map layouts
  theme: 'neutral',
  zones: [
    {
      id: 'dock', label: 'Docking Bay',
      description: 'Hull repairs and refueling.',
      services: ['repair'],
      flavor: ['...'],
      requiredStanding: null,
    },
    // ... more zones
  ],
};

// ── Entity descriptor + instantiate ─────────────────────────────────────────

export const IronveilOutpost = {
  id: 'ironveil_outpost',
  name: 'Ironveil Outpost',
  faction: 'scavengers',
  renderer: 'ironveil_outpost',  // null for generic hex
  services: ['repair', 'trade'],
  dockingRadius: 150,
  commodities: { /* ... */ },
  lore: [ /* ... */ ],
  layout: LAYOUT,
  bountyBoard: [],
  bountyContracts: [],

  instantiate(x, y) {
    return new IronveilOutpostStation(x, y, this);
    // For generic hex: return createStation({ ...this, x, y });
  },
};
```

**Available base class fields:**
- `this.accentColor` — CYAN (settlements/neutral), RED (scavengers), AMBER (others) — set by relation
- `this._navPulse` — increments each second; use for blinking lights, pulse rings
- `this._renderNameLabel(ctx, camera, yOffset)` — draws the station name label below the shape
- `this.name` — display name string
- `this.dockingRadius` — default 150; override in constructor

**Renderer conventions:**
- Use `ctx.save()` / `ctx.restore()` around all draw calls
- ctx is already in local space (translated + scaled by camera); draw around (0, 0)
- Keep the silhouette readable at small zoom levels
- Existing examples: `js/world/zones/gravewake/theCoil/index.js`, `js/world/zones/gravewake/kellsStop.js`

## Step 3 — Register in stationRegistry.js (for designer)

Open `js/world/stationRegistry.js`. Add an import and entry:
```js
import { IronveilOutpost } from './zones/gravewake/ironveilOutpost.js';

// In STATION_REGISTRY array:
{
  entity: IronveilOutpost,
  id: 'ironveil-outpost',
  flavorText: 'A sentence of flavor text.',
},
```

## Step 4 — Add to zone manifest

Open `js/world/zones/gravewake.js` (or the relevant zone manifest). Add the import and place in the `entities` array:
```js
import { IronveilOutpost } from './gravewake/ironveilOutpost.js';

// In GRAVEWAKE.entities:
IronveilOutpost.instantiate(XXXX, YYYY),
```

Also add to `js/data/maps/arena.js` for testing:
```js
import { IronveilOutpost } from '../../world/zones/gravewake/ironveilOutpost.js';

// In MAP.entities:
IronveilOutpost.instantiate(XXXX, YYYY),
```

## Step 5 — Update LORE.md

Find the "Stations & Locations" section in `LORE.md`. Add an entry:
- Station name and world coordinates
- Faction affiliation and brief lore blurb (1–2 sentences)
- Services available
- Any story hooks or notable NPCs

## Step 6 — Update MECHANICS.md

Find the "Stations" section in `MECHANICS.md`. Add:
- Station name, renderer type, faction
- Services list
- Any special behavior (e.g. reactor overhaul, Allied discount)

## Step 7 — Done

Tell the user to open `?designer&category=Stations&id=<slug>` to verify the renderer, and `editor.html?map=arena` to verify docking and services in-game.
