# New Ship — Full Creation Workflow

The user wants to add a new ship to Wayfarer. Follow every step in order. Do not skip the docs update at the end.

## Step 1 — Gather requirements

Ask the user (or infer from their description) for:
- **Display name** — e.g. "Sentinel Class Corvette"
- **Ship type slug** — kebab-case, e.g. `sentinel-corvette` (used as `shipType` field)
- **Role** — player ship, enemy, or neutral (trader/militia)
- **Base class** — must extend one of:
  - `MaverickCourier` (`js/ships/classes/maverickCourier.js`) — fast, light, personal craft
  - `G100ClassHauler` (`js/ships/classes/g100Hauler.js`) — boxy medium hauler
  - `GarrisonFrigate` (`js/ships/classes/garrisonFrigate.js`) — H-beam heavy frigate
  - `OnyxClassTug` (`js/ships/classes/onyxTug.js`) — wide hammerhead tug/capital
  - Or create a new base class if the hull profile doesn't fit any existing class
- **Visual identity** — hull shape description (used in `_drawShape`)
- **Weapons** — pick from `shipModule.js` exports: `AutocannonModule`, `LanceModuleSmall`, `CannonModule`, `RocketPodModule`
- **Flavor text** — one paragraph tactical/lore description

## Step 2 — Decide on stats

All stats use the multiplier pattern. Import from `@data/compiledData.js`:
```js
import {
  BASE_SPEED, BASE_ACCELERATION, BASE_TURN_RATE, SPEED_FACTOR,
  BASE_HULL, BASE_ARMOR, BASE_FUEL_MAX
} from '@data/compiledData.js';
```

Define multiplier constants at the top of the file:
```js
const SPEED_MULT = 1.0;   // comment: expected u/s
const ACCEL_MULT = 1.0;
const TURN_MULT  = 1.0;
const HULL_MULT  = 1.0;   // comment: expected hp
const FUEL_MULT  = 1.0;   // comment: expected fuel units
const FUEL_EFF   = 1.0;   // drain rate multiplier (1.0 = standard)
```

Armor arc multipliers (base = 100 per arc):
```js
const ARMOR_FRONT = 1.0;
const ARMOR_SIDE  = 0.8;
const ARMOR_AFT   = 0.6;
```

**Balance guidelines by role:**
- Light/fast (Maverick base): SPEED 1.0–1.4, HULL 0.5–0.8, thin armor
- Haulers (G100 base): SPEED 0.5–0.8, HULL 1.2–2.0, moderate armor
- Frigates (Garrison base): SPEED 0.35–0.55, HULL 2.0–3.5, heavy front
- Capitals/tugs (Onyx base): SPEED 0.25–0.45, HULL 3.0–6.0, heavy all-round

## Step 3 — Create the ship file

**File locations:**
- Base/template ships → `js/ships/classes/<name>.js`
- Player variants → `js/ships/player/<name>.js`
- NPC variants (enemies + neutrals) → `js/npcs/<faction>/<name>.js`

Template for a new base class:
```js
import { Ship } from '../ship.js';   // adjust path for depth
import { BASE_SPEED, BASE_ACCELERATION, BASE_TURN_RATE, SPEED_FACTOR, BASE_HULL } from '@data/compiledData.js';

const SPEED_MULT = 1.0;
const ACCEL_MULT = 1.0;
const TURN_MULT  = 1.0;
const HULL_MULT  = 1.0;
const ARMOR_FRONT = 1.0;
const ARMOR_SIDE  = 0.8;
const ARMOR_AFT   = 0.6;

export class SentinelCorvette extends Ship {
  constructor(x, y) {
    super(x, y);

    this.shipType    = 'sentinel-corvette';
    this.displayName = 'Sentinel Class Corvette';

    this.speedMax     = BASE_SPEED        * SPEED_MULT * SPEED_FACTOR;
    this.acceleration = BASE_ACCELERATION * ACCEL_MULT * SPEED_FACTOR;
    this.turnRate     = BASE_TURN_RATE    * TURN_MULT  * SPEED_FACTOR;

    this.hullMax     = BASE_HULL * HULL_MULT;
    this.hullCurrent = this.hullMax;

    this._initArmorArcs(ARMOR_FRONT, ARMOR_SIDE, ARMOR_AFT);

    // Optional: fuel tank
    // this.fuelMax        = BASE_FUEL * FUEL_MULT;
    // this.fuelEfficiency = FUEL_EFF;
    // this.fuelCurrent    = this.fuelMax;

    // Module slots (player/enemy only — not bare base classes)
    // this.moduleSlots = [new WeaponModule()];
    // this._applyModules();
  }

  _drawShape(ctx) {
    // Draw hull centered at (0,0), pointing up (rotation 0 = north).
    // Use colors from js/rendering/colors.js — NEVER inline hex.
    // ctx is pre-translated to ship position and rotated.
    //
    // DIRECTIONAL ARMOR RENDERING — REQUIRED for all ship classes.
    // When this.relation === 'player', use health-based fill and per-arc outline coloring
    // instead of flat relation colors. The Ship base class provides two helpers:
    //
    //   this._playerHullFill()
    //     Returns an rgba fill color based on hull health ratio:
    //     green (>75%) → yellow-green (>50%) → orange (>25%) → red (critical)
    //
    //   this._drawHullArcs(ctx, HULL_POINTS, arcSegmentMap)
    //     Draws each arc's hull outline segment in armorArcColor(ratio).
    //     arcSegmentMap = { front: [i0,i1,...], starboard: [...], aft: [...], port: [...] }
    //     Returns true if drawn (player); false if NPC (caller should ctx.stroke() normally).
    //
    //   this._strokeArcCurrent(ctx, arcKey)
    //     Strokes the CURRENT ctx path with the arc health color.
    //     Returns true if player (drew arc color); false if NPC (caller should stroke normally).
    //     Use for separate polygon components (nacelles, engine pods) that belong to one arc.
    //
    // Pattern for a simple single-polygon ship:
    //
    //   const ARC_MAP = {
    //     front:     [indices for front face of the hull polygon],
    //     starboard: [indices for right side],
    //     aft:       [indices for stern],
    //     port:      [indices for left side],
    //   };
    //   ctx.beginPath(); ... ctx.closePath();
    //   if (this.relation === 'player') {
    //     ctx.fillStyle = this._playerHullFill(); ctx.fill();
    //     this._drawHullArcs(ctx, HULL_POINTS, ARC_MAP);
    //   } else {
    //     ctx.fillStyle = this.hullFill; ctx.fill();
    //     ctx.strokeStyle = this.hullStroke; ctx.lineWidth = 1.5; ctx.stroke();
    //   }
    //
    // For ships with separate nacelle/engine polygons, call _strokeArcCurrent() after
    // filling each sub-polygon. See garrisonFrigate.js and g100Hauler.js for examples.
  }

  getBounds() {
    // Return { x: this.x, y: this.y, radius: NN } — used for collision/visibility
    return { x: this.x, y: this.y, radius: 20 };
  }
}
```

For player ships, also add:
```js
this.flavorText = 'One paragraph. What the ship is, who built it, its role, strengths, weaknesses.';
```

## Step 4 — Register in ship registry

Open `js/ships/registry.js`. Add:
1. An import at the top
2. An entry in `SHIP_REGISTRY`:
```js
{
  id: 'sentinel-corvette',
  label: 'Sentinel Class Corvette',
  create: (x, y) => new SentinelCorvette(x, y),
  faction: 'settlements',   // or 'scavengers', 'concord', etc.
  role: 'player',           // 'player', 'enemy', or 'neutral'
}
```

## Step 5 — Add designer entry

Open `js/test/designer.js`. Add to the correct category (Ships, Enemies, or Neutrals):
```js
{
  id: 'sentinel-corvette',
  label: 'Sentinel Class Corvette',
  create: (x, y) => new SentinelCorvette(x, y),
  statsPanel: (ship) => [
    { label: 'HULL',  value: ship.hullMax },
    { label: 'SPEED', value: ship.speedMax.toFixed(1) },
    { label: 'TURN',  value: ship.turnRate.toFixed(2) },
  ],
}
```

Verify: `?designer&category=Ships&id=sentinel-corvette`

## Step 6 — Add to arena map

Open `js/data/maps/arena.js`. For enemy/neutral ships, add a spawn entry to the `entities` array using `spawnEnemy()` or the appropriate helper. Place it close to the player start for easy testing.

## Step 7 — Update MECHANICS.md

Find the relevant section (Player Ships, Enemies, or Neutral Traffic). Add:
- Ship name, file path, base class
- Key stats (SPEED_MULT, HULL_MULT, weapons if applicable)
- Role summary (one sentence)

## Step 8 — Done

Tell the user to:
1. Open `?designer&category=Ships&id=<slug>` to verify the visual and stats panel
2. Open `editor.html?map=arena` to verify in-game behavior (enemy/neutral ships should be visible near player start)
