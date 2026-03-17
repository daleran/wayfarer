# Station — Create or Edit

Create a new station or edit an existing one. Stations are dockable entities with services, layouts, and custom renderers.

## Step 1 — Identify scope

**Creating new?** Ask the user for:
- **Display name** — e.g. "Ironveil Outpost"
- **ID** — kebab-case slug, e.g. `ironveil-outpost`
- **Faction** — `'settlements'`, `'scavengers'`, `'concord'`, `'monastic'`, `'communes'`, `'zealots'`
- **Services** — array from: `'repair'`, `'fuel'`, `'trade'`, `'bounty'`, `'overhaul'`
- **Renderer** — `'default'` (generic hex from Station base) or custom (needs a new renderer class)
- **Location node** — which orbital/surface zone, e.g. `tyr/pale/orbital/`
- **Map position** — world coordinates `{ x, y }`
- **Visual identity** — shape/color/vibe if custom renderer
- **Layout** — station interior sections (docking bay, market, etc.)

**Editing existing?** Read the file first. Common edits:
- Add/remove services
- Modify renderer geometry or colors
- Update layout sections
- Change faction or lore
- Adjust docking radius

## Step 2 — Read reference files

- `engine/entities/station.js` — Station base class, `_renderNameLabel()`, `_navPulse`, accent colors
- `data/locations/tyr/pale/orbital/locations/the-coil/station.js` — complex custom renderer example
- `data/locations/tyr/pale/orbital/locations/kells-stop/station.js` — simpler custom renderer example
- `data/locations/tyr/pale/orbital/locations/ashveil-anchorage/station.js` — another example
- `engine/rendering/colors.js` — all color constants
- `engine/rendering/draw.js` — Shape factories
- `UX.md` — visual conventions
- `LORE.md` — existing stations and world context

## Step 3 — Create or edit station files

Station code is co-located in a single directory under its zone:
1. **Renderer** → `data/locations/<system>/<body>/<node>/locations/<slug>/renderer.js` — custom Station subclass with canvas rendering
2. **Data** → `data/locations/<system>/<body>/<node>/locations/<slug>/station.js` — pure data + layout + `instantiate()`
3. **Conversations** → `data/locations/<system>/<body>/<node>/locations/<slug>/conversations/` — conversation scripts for this station

Content self-registers at import time via `registerContent()` from `data/dataRegistry.js`. New files under `data/locations/` are auto-discovered by `import.meta.glob` — no `data/index.js` edit needed.

### Renderer file (skip for generic hex)

Location: `data/locations/<system>/<body>/<node>/locations/<slug>/renderer.js`

```js
import { Station } from '@/entities/station.js';
import { AMBER, WHITE } from '@/rendering/colors.js';

export class <StationName>Station extends Station {
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
```

### Data file

Location: `data/locations/<system>/<body>/<node>/locations/<slug>/station.js`

```js
import { registerContent } from '@data/dataRegistry.js';
import { LOCATION_TYPE } from '@data/enums.js';
import { <StationName>Station } from './renderer.js';
// For generic hex: import { Station } from '@/entities/station.js';

const LAYOUT = {
  sections: [
    {
      id: 'dock', label: 'Docking Bay',
      description: 'Hull repairs and refueling.',
      services: ['repair'],
      flavor: ['...'],
      requiredStanding: null,
    },
  ],
};

export const <PascalName> = {
  id: '<underscore_id>',
  name: '<Display Name>',
  faction: '<faction>',
  services: ['repair', 'trade'],
  dockingRadius: 150,
  commodities: {},
  lore: [],
  layout: LAYOUT,
  bountyContracts: [],

  instantiate(x, y) {
    return new <StationName>Station(x, y, this);
    // For generic hex: return new Station(x, y, this);
  },
};

registerContent('locations', '<slug>', {
  id: '<slug>',
  locationType: LOCATION_TYPE.STATION,
  name: '<Display Name>',
  flavorText: <PascalName>.flavorText,
  entity: <PascalName>,
});
```

**Renderer conventions:**
- `ctx.save()` / `ctx.restore()` around all draw calls
- Draw around (0, 0) — ctx is already translated + scaled
- Use colors from `engine/rendering/colors.js` — NEVER inline hex
- Use Shape factories from `engine/rendering/draw.js`
- `this._navPulse` for blinking/pulse animations
- `this.accentColor` set by relation (CYAN settlements, RED scavengers, AMBER others)
- Keep silhouette readable at small zoom levels

## Step 4 — Register

### Content registration
Station data self-registers into `CONTENT.locations` (with `LOCATION_TYPE.STATION`) via `registerContent()` at import time (see data file template above). The designer auto-discovers from `CONTENT.locations` — no separate registry entry needed.

### Location manifest
Open the location node's `manifest.js` (e.g. `data/locations/tyr/pale/orbital/manifest.js`) and add to the `entities` array:
```js
<PascalName>.instantiate(XXXX, YYYY),
```

### Arena map (for testing)
Add to `data/maps/arena.js`:
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
- New renderer visual patterns → `UX.md`
