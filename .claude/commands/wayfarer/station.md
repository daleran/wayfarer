# Station — Create or Edit

Create a new station or edit an existing one. Stations are dockable entities with services, layouts, and custom renderers.

## Step 1 — Identify scope

**Creating new?** Ask the user for:
- **Display name** — e.g. "Ironveil Outpost"
- **ID** — kebab-case slug, e.g. `ironveil-outpost`
- **Faction** — `'settlements'`, `'scavengers'`, `'concord'`, `'monastic'`, `'communes'`, `'zealots'`
- **Services** — array from: `'repair'`, `'fuel'`, `'trade'`, `'bounty'`, `'overhaul'`
- **Renderer** — `'default'` (generic hex from Station base) or custom (needs a new renderer class)
- **Zone** — which zone, e.g. `gravewake/`
- **Map position** — world coordinates `{ x, y }`
- **Visual identity** — shape/color/vibe if custom renderer
- **Layout** — station interior zones (docking bay, market, etc.)

**Editing existing?** Read the file first. Common edits:
- Add/remove services
- Modify renderer geometry or colors
- Update layout zones
- Change faction or lore
- Adjust docking radius

## Step 2 — Read reference files

- `js/world/station.js` — Station base class, `_renderNameLabel()`, `_navPulse`, accent colors
- `js/data/zones/gravewake/theCoil.js` — complex custom renderer example
- `js/data/zones/gravewake/kellsStop.js` — simpler custom renderer example
- `js/data/zones/gravewake/ashveilAnchorage.js` — another example
- `js/world/stationRegistry.js` — designer registry format
- `js/rendering/colors.js` — all color constants
- `js/rendering/draw.js` — Shape factories
- `UX.md` — visual conventions
- `LORE.md` — existing stations and world context

## Step 3 — Create or edit the zone entity file

Location: `js/data/zones/<zone>/<camelCaseName>.js`

The file contains: renderer class (if custom) + data descriptor + layout + `instantiate(x, y)`.

```js
import { Station } from '@/world/station.js';
import { CYAN, AMBER, WHITE, DIM_OUTLINE } from '@/rendering/colors.js';
import { Shape } from '@/rendering/draw.js';

// ── Custom renderer (skip if using generic hex) ─────────────────────────────

class <StationName>Station extends Station {
  constructor(x, y, data) {
    super(x, y, data);
    this.dockingRadius = 150;
  }

  render(ctx, camera) {
    const screen = camera.worldToScreen(this.x, this.y);
    ctx.save();
    ctx.translate(screen.x, screen.y);
    ctx.scale(camera.zoom, camera.zoom);
    // ... draw station geometry at origin using Shape factories ...
    this._renderNameLabel(ctx, camera, 68);
    ctx.restore();
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 50 };
  }
}

// ── Layout ──────────────────────────────────────────────────────────────────

const LAYOUT = {
  type: 'simple',
  theme: 'neutral',
  zones: [
    {
      id: 'dock', label: 'Docking Bay',
      description: 'Hull repairs and refueling.',
      services: ['repair'],
      flavor: ['...'],
      requiredStanding: null,
    },
  ],
};

// ── Entity descriptor ───────────────────────────────────────────────────────

export const <PascalName> = {
  id: '<underscore_id>',
  name: '<Display Name>',
  faction: '<faction>',
  renderer: '<renderer_id>',  // null for generic hex
  services: ['repair', 'trade'],
  dockingRadius: 150,
  commodities: {},
  lore: [],
  layout: LAYOUT,
  bountyBoard: [],
  bountyContracts: [],

  instantiate(x, y) {
    return new <StationName>Station(x, y, this);
    // For generic hex: return new Station(x, y, this);
  },
};
```

**Renderer conventions:**
- `ctx.save()` / `ctx.restore()` around all draw calls
- Draw around (0, 0) — ctx is already translated + scaled
- Use colors from `js/rendering/colors.js` — NEVER inline hex
- Use Shape factories from `js/rendering/draw.js`
- `this._navPulse` for blinking/pulse animations
- `this.accentColor` set by relation (CYAN settlements, RED scavengers, AMBER others)
- Keep silhouette readable at small zoom levels

## Step 4 — Register

### Station registry (for designer)
Open `js/world/stationRegistry.js`:
```js
import { <PascalName> } from '@/data/zones/<zone>/<fileName>.js';

// In STATION_REGISTRY array:
{
  entity: <PascalName>,
  id: '<kebab-slug>',
  flavorText: '<One sentence of flavor text.>',
},
```

### Zone manifest
Open `js/data/zones/<zone>.js` and add to the `entities` array:
```js
<PascalName>.instantiate(XXXX, YYYY),
```

### Arena map (for testing)
Add to `js/data/maps/arena.js`:
```js
<PascalName>.instantiate(XXXX, YYYY),
```

## Step 5 — Validate & verify

1. Run `npm run validate` — fix any errors
2. Tell the user:
   - `designer.html?category=stations&id=<slug>` — verify renderer and stats
   - `editor.html?map=arena` — verify docking, services, layout in-game

## Step 6 — Update docs

- Station lore, name, faction → `LORE.md`
- New service type or station behavior → `MECHANICS.md`
- New renderer visual patterns → `UX.md`
