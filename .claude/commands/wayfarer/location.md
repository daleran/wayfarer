# Location — Create or Edit Location Tree Nodes

Create a new location tree node (system, planet, orbital zone, surface zone) or edit an existing one. Location nodes form the spatial backbone of the game world — every station, ship, derelict, and terrain feature lives inside a location node.

## Step 1 — Identify scope

**Creating new?** Ask the user for:
- **Node type** — one of:
  - `system` — top-level star system (e.g. `tyr`)
  - `body` — planet or moon within a system (e.g. `pale`)
  - `zone` — orbital or surface region around a body (e.g. `orbital`, `surface`)
- **Name** — display name (e.g. "Pale", "Gravewake")
- **Parent** — where in the tree this sits (e.g. `tyr/pale/`)
- **Zone definition** — for zones: center coords, radius, name (for the zone boundary)
- **Content plan** — what stations, ships, characters, derelicts, terrain will populate this zone?
- **Atmosphere** — optional background layer (parallax debris, nebula, etc.)

**Editing existing?** Read the manifest and relevant files first. Common edits:
- Add/remove entities from the manifest
- Adjust zone boundaries
- Modify atmosphere/background layers
- Add new sub-content directories

## Step 2 — Read reference files

- `data/locations/tyr/pale/orbital/manifest.js` — the only existing production manifest (full pattern reference)
- `data/maps/tyr.js` — how maps consume manifests
- `data/maps/arena.js` — test map pattern
- `engine/rendering/colors.js` — colors for background layers
- `SPEC.md` (Setting section) — existing locations and world context

## Step 3 — Create directory structure

Location tree path: `data/locations/<system>/<body>/<zone>/`

For a new zone, create the full directory scaffold:

```
data/locations/<system>/<body>/<zone>/
├── manifest.js              # Entity placement + zone definitions + backgrounds
├── locations/               # Station directories
│   └── <station-slug>/
│       ├── station.js       # Station data + instantiate()
│       ├── renderer.js      # Custom Station subclass (optional)
│       └── conversations/   # Station conversation scripts
│           ├── hub.js
│           ├── dock.js
│           └── ...
├── ships/                   # Ship config data
│   └── <shipName>.js
├── characters/              # Character definitions
│   └── <filename>.js
├── derelicts/               # Derelict descriptors
│   └── <camelCaseName>.js
├── terrain/                 # Terrain features
│   └── <terrain-id>/
│       └── index.js
└── planets/                 # Planet background objects
    └── <planetName>.js
```

**Note:** Only `manifest.js` needs to exist initially. Sub-directories and content files are created as needed. All content files under `data/locations/` (except `manifest.js`) are auto-discovered by `import.meta.glob` — no `data/index.js` edit needed.

## Step 4 — Create the manifest

The manifest is the placement file — it pre-instantiates all entities for the zone. Maps import and spread it.

```js
// <Zone Name> — placement manifest for <system>.
// Every entity is pre-instantiated. Maps just spread this into MAP.

import { <Station> } from './locations/<slug>/station.js';
// ... more station/derelict/terrain imports ...

import { ZONE_BG_STROKE } from '@/rendering/colors.js';
import { createShip, createNPC } from '@/entities/registry.js';
import { SPAWN } from '@data/index.js';

// ── Spawn helpers (copy from orbital/manifest.js as needed) ──────────────

function npcGroup(x, y, count, id, { unmanned = false } = {}) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const dist = SPAWN.ENEMY_RADIUS.MIN + Math.random() * SPAWN.ENEMY_RADIUS.MAX;
    const ship = unmanned
      ? createShip(id, x + Math.sin(angle) * dist, y - Math.cos(angle) * dist)
      : createNPC(id, x + Math.sin(angle) * dist, y - Math.cos(angle) * dist);
    ship.homePosition = { x, y };
    return ship;
  });
}

function lurkerGroup(x, y, count) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / Math.max(count, 1)) * Math.PI * 2;
    const dist = SPAWN.LURKER_RADIUS.MIN + Math.random() * SPAWN.LURKER_RADIUS.MAX;
    const rx = x + Math.sin(angle) * dist;
    const ry = y - Math.cos(angle) * dist;
    const ship = createNPC('<lurker-character-id>', rx, ry);
    ship.ai._coverPoint = { x: rx, y: ry };
    ship.homePosition = { x, y };
    return ship;
  });
}

function convoy(routeA, routeB, shipCount) {
  return Array.from({ length: shipCount }, (_, i) => {
    const t = shipCount > 1 ? i / shipCount : 0;
    const sx = routeA.x + (routeB.x - routeA.x) * t;
    const sy = routeA.y + (routeB.y - routeA.y) * t;
    const ship = createNPC('<trader-character-id>', sx, sy);
    ship.ai._tradeRouteA = { ...routeA };
    ship.ai._tradeRouteB = { ...routeB };
    return ship;
  });
}

function militia(orbitCenter, orbitRadius, orbitSpeed, count) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const sx = orbitCenter.x + Math.sin(angle) * orbitRadius;
    const sy = orbitCenter.y - Math.cos(angle) * orbitRadius;
    const ship = createNPC('<militia-character-id>', sx, sy);
    ship.ai._orbitCenter = { ...orbitCenter };
    ship.ai._orbitRadius = orbitRadius;
    ship.ai._orbitSpeed = orbitSpeed;
    ship.ai._orbitAngle = angle;
    return ship;
  });
}

// ── Atmosphere background layer (optional) ──────────────────────────────

function createAtmosphere(zone) {
  // Pre-generate parallax fragments
  const count = 300;
  const goldenAngle = 2.399963;
  const fragments = [];
  for (let i = 0; i < count; i++) {
    const r = Math.sqrt(Math.random()) * zone.radius;
    const theta = i * goldenAngle;
    fragments.push({
      wx: zone.center.x + Math.cos(theta) * r,
      wy: zone.center.y + Math.sin(theta) * r,
      parallax: 0.15 + (i % 17) * 0.015,
      size: 2 + (i % 4),
      angle: theta,
    });
  }

  return {
    type: '<zone-id>-atmosphere',
    render(ctx, camera) {
      const dx = camera.x - zone.center.x;
      const dy = camera.y - zone.center.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const fadeStart = zone.radius;
      const fadeEnd = zone.radius - 1000;
      const t = Math.max(0, Math.min(1, (fadeStart - dist) / (fadeStart - fadeEnd)));
      const maxAlpha = 0.6 * t;
      if (maxAlpha <= 0) return;

      ctx.save();
      ctx.strokeStyle = ZONE_BG_STROKE;
      ctx.lineWidth = 1;

      for (const frag of fragments) {
        const px = frag.wx - camera.x * frag.parallax * camera.zoom;
        const py = frag.wy - camera.y * frag.parallax * camera.zoom;
        const sw = camera.width;
        const sh = camera.height;
        const sx = ((px % sw) + sw) % sw;
        const sy = ((py % sh) + sh) % sh;
        ctx.globalAlpha = maxAlpha * 0.6;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(frag.angle);
        ctx.strokeRect(-frag.size, -frag.size * 0.3, frag.size * 2, frag.size * 0.6);
        ctx.restore();
      }

      ctx.globalAlpha = 1;
      ctx.restore();
    },
  };
}

// ── Zone definition ─────────────────────────────────────────────────────

const <ZONE_CONST> = {
  id: '<zone-id>',
  name: '<Zone Name>',
  center: { x: XXXX, y: YYYY },
  radius: RRRR,
};

// ── Zone export ─────────────────────────────────────────────────────────

export const <ZONE_NAME> = {
  entities: [
    // Stations
    <Station>.instantiate(XXXX, YYYY),

    // Derelicts
    // <Derelict>.instantiate(XXXX, YYYY),

    // Terrain
    // ...<Terrain>.instantiate(),

    // Enemies
    // ...npcGroup(XXXX, YYYY, count, 'character-id'),

    // Lurkers
    // ...lurkerGroup(XXXX, YYYY, count),

    // Trade convoys
    // ...convoy({ x: X1, y: Y1 }, { x: X2, y: Y2 }, count),

    // Militia patrols
    // ...militia({ x: XXXX, y: YYYY }, radius, speed, count),
  ],

  zones: [
    <ZONE_CONST>,
  ],

  background: [
    createAtmosphere(<ZONE_CONST>),
    // Planet background objects...
  ],
};
```

## Step 5 — Add to map

Open or create the relevant map file in `data/maps/`:

```js
import { <ZONE_NAME> } from '../locations/<system>/<body>/<zone>/manifest.js';

export const MAP = {
  name: '<Map Name>',
  entities: [
    ...<ZONE_NAME>.entities,
  ],
  zones: [
    ...<ZONE_NAME>.zones,
  ],
  background: [
    ...<ZONE_NAME>.background,
  ],
};
```

For the production map (`data/maps/tyr.js`), spread the new zone alongside existing ones.

## Step 6 — Validate & verify

1. Run `npm run validate` — fix any errors
2. Tell the user:
   - `editor.html?map=<mapName>` — verify zone renders, entities placed correctly
   - Check zone boundary visible on map (M key)
   - Verify atmosphere fades in/out at boundary

## Step 7 — Update docs

- New system/planet/zone → `scripts/templates/setting.md`
- Zone visual identity → `scripts/templates/ux-philosophy.md`
- Major new location → append to `DEVLOG.md`
