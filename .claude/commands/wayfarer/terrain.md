# Terrain — Create or Edit Terrain Features

Create a new terrain feature or edit an existing one. Terrain features are non-interactive environmental geometry: planets, asteroid fields, debris clouds, structural wreckage, and other background/foreground objects.

## Step 1 — Identify scope

**Creating new?** Ask the user for:
- **Type** — one of:
  - `planet` — background celestial body with parallax (like Pale)
  - `debris` — procedural debris clusters (like Wall of Wrecks)
  - `structure` — large structural wreckage (like Arkship Spines)
  - `field` — asteroid field, ice field, or environmental hazard
  - `custom` — unique one-off terrain feature
- **Name** — display name and ID slug
- **Visual identity** — shape, color, opacity, scale
- **Placement** — single instance, array of instances, or procedural generation
- **Location** — which zone (e.g. `tyr/pale/orbital/`)
- **Layer** — foreground entity (rendered with entities) or background (rendered before entities, with parallax)

**Editing existing?** Read the file first. Common edits:
- Adjust placement data (positions, rotations, sizes)
- Modify rendering (colors, opacity, shapes)
- Add/remove instances

## Step 2 — Read reference files

- `engine/entities/entity.js` — Entity base class (for foreground terrain)
- `engine/rendering/colors.js` — all color constants
- `engine/rendering/draw.js` — Shape factories and Draw API
- `SPEC.md` (UX section) — visual conventions
- `SPEC.md` (Setting section) — world context

### Existing terrain examples:
- `data/locations/tyr/pale/orbital/terrain/arkship-spines/index.js` — structural wreckage (Entity subclass)
- `data/locations/tyr/pale/orbital/terrain/debris-clouds/index.js` — procedural debris (Entity subclass)
- `data/locations/tyr/pale/orbital/terrain/planet-pale/index.js` — background planet (not an Entity — render object)

## Step 3 — Create the terrain file

Location: `data/locations/<system>/<body>/<zone>/terrain/<terrain-id>/index.js`

Content self-registers at import time via `registerContent()`. New files under `data/locations/` are auto-discovered by `import.meta.glob` — no `data/index.js` edit needed.

### Foreground terrain (Entity subclass)

For terrain that exists in world-space alongside ships and stations:

```js
// <Terrain Name> — description.

import { Entity } from '@/entities/entity.js';
import { DIM_OUTLINE, VERY_DIM } from '@/rendering/colors.js';
import { registerContent } from '@data/dataRegistry.js';

// ── Renderer ────────────────────────────────────────────────────────────────

export class <TerrainClass> extends Entity {
  constructor(x, y, data) {
    super(x, y);
    this.someParam = data.someParam ?? defaultValue;
    this.rotation = data.rotation ?? 0;
  }

  update(_dt) {
    // Static terrain — no update
  }

  render(ctx, camera) {
    const screen = camera.worldToScreen(this.x, this.y);
    ctx.save();
    ctx.translate(screen.x, screen.y);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.rotate(this.rotation);

    // Draw terrain geometry at origin
    // Use colors from colors.js, keep alpha low for terrain
    ctx.strokeStyle = DIM_OUTLINE;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    // ... drawing code ...

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: /* circumscribed circle */ };
  }
}

export function create<TerrainClass>(data) {
  return new <TerrainClass>(data.x, data.y, data);
}

// ── Placement data ──────────────────────────────────────────────────────────

const INSTANCES = [
  { x: XXXX, y: YYYY, rotation: 0.0, someParam: value },
  // ... more instances ...
];

export const <TerrainName> = {
  instantiate() {
    return INSTANCES.map(d => create<TerrainClass>(d));
  },
};

registerContent('terrain', '<terrain-id>', {
  label: '<Display Label>',
  createSingle: create<TerrainClass>,
  instantiate: <TerrainName>.instantiate,
});
```

### Background terrain (render object)

For celestial bodies and distant features rendered behind everything else with parallax:

```js
// <Name> — background description.

import { SOME_COLOR } from '@/rendering/colors.js';
import { registerContent } from '@data/dataRegistry.js';

export const <Name> = {
  backgroundData(overrides = {}) {
    return {
      type: '<id>',
      name: '<Display Name>',
      x: XXXX,
      y: YYYY,
      radius: RRR,
      ...overrides,

      render(ctx, camera) {
        // Parallax — distant body moves slower than camera
        const PARALLAX = 0.7;
        const cx = camera.width / 2 + (this.x - camera.x) * camera.zoom * PARALLAX;
        const cy = camera.height / 2 + (this.y - camera.y) * camera.zoom * PARALLAX;
        const r = this.radius * camera.zoom;

        // Cull if off-screen
        if (cx + r < 0 || cx - r > camera.width || cy + r < 0 || cy - r > camera.height) return;

        ctx.save();
        // ... render the background feature ...
        ctx.globalAlpha = 1;
        ctx.restore();
      },
    };
  },
};

// Background objects don't register as 'terrain' in CONTENT
// They're referenced directly in manifest.js background arrays
```

### Procedural terrain (debris/asteroids)

For terrain with many small fragments generated from a seed pattern:

```js
export class <FieldClass> extends Entity {
  constructor(x, y, data) {
    super(x, y);
    this.spreadRadius = data.spreadRadius ?? 200;
    this.fragmentCount = data.fragmentCount ?? 18;
    this._fragments = this._generateFragments();
  }

  _generateFragments() {
    const frags = [];
    const goldenAngle = 2.399963;
    for (let i = 0; i < this.fragmentCount; i++) {
      const r = Math.sqrt((i + 0.5) / this.fragmentCount) * this.spreadRadius;
      const theta = i * goldenAngle;
      frags.push({
        fx: Math.cos(theta) * r,
        fy: Math.sin(theta) * r,
        size: 4 + ((i * 7) % 9),
        aspect: 0.3 + ((i * 13) % 5) * 0.1,
        angle: (i * 1.618) % (Math.PI * 2),
      });
    }
    return frags;
  }

  // ... render/update/getBounds same as foreground pattern ...
}
```

**Rendering conventions:**
- Use colors from `engine/rendering/colors.js` — `DIM_OUTLINE`, `VERY_DIM`, `ZONE_BG_STROKE`
- Keep opacity low (0.15–0.5) — terrain should not compete with entities
- Use `ctx.save()`/`ctx.restore()` around all draw calls
- Draw at origin — ctx is already translated + scaled
- Golden angle distribution for natural-looking scatter patterns
- Deterministic generation (no `Math.random()` in constructors; use index-based pseudo-random)

## Step 4 — Add to manifest

Open the zone's `manifest.js` and add the terrain:

**Foreground terrain** (in `entities` array):
```js
import { <TerrainName> } from './terrain/<terrain-id>/index.js';

// In entities array:
...<TerrainName>.instantiate(),
// Or for single instances:
create<TerrainClass>({ x: XXXX, y: YYYY, ... }),
```

**Background terrain** (in `background` array):
```js
import { <PlanetName> } from './terrain/<terrain-id>/index.js';

// In background array:
<PlanetName>.backgroundData(),
```

## Step 5 — Validate & verify

1. Run `npm run validate` — fix any errors
2. Tell the user:
   - `editor.html?map=arena` or `editor.html?map=tyr` — verify terrain renders at various zoom levels
   - Check that terrain doesn't obscure ships/stations
   - Verify collision bounds if applicable (`getBounds()`)
   - `designer.html?category=terrain&id=<terrain-id>` — verify in designer (foreground terrain only)

## Step 6 — Update docs

- New named terrain feature → `scripts/templates/setting.md`
- New visual patterns → `scripts/templates/ux-philosophy.md`
