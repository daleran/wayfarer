# New Enemy — Full Creation Workflow

The user wants to add a new enemy ship to Wayfarer. Follow every step in order. Do not skip the docs update at the end.

## Step 1 — Gather requirements

Ask the user (or infer from their description) for:
- **Display name** — e.g. "Void Cutter"
- **Base ship class** — must extend one of the existing ship classes: `MaverickCourier`, `G100ClassHauler`, `GarrisonFrigate`, `OnyxClassTug`. Pick the most thematically appropriate one.
- **Behavior type** — one of the five:
  - `stalker` — flanks to player's aft, fires only when nose-aligned; patient, precise
  - `kiter` — maintains distance, backs off when too close, orbits at max range; hit-and-run
  - `standoff` — holds a long fixed range, fires both primary and secondary; capital-style
  - `lurker` — hides at a cover point, scans for traders, pounces; ambush predator. Requires `ship.ai._coverPoint` set at spawn.
  - `flee` — retreat behavior; used as a fallback when hull is critically low
- **Faction** — `'scavenger'` (most common), `'concord'`, or other lore-appropriate value
- **Weapons** — pick from `shipModule.js` module exports: `AutocannonModule`, `LanceModuleSmall`, `CannonModule`, `RocketPodModule`, `TorpedoModule`
- **Role / flavor** — a short description of its tactical identity

## Step 2 — Decide on stats

All stats must use the multiplier pattern from `js/data/tuning/shipTuning.js`. Import:
```js
import { BASE_SPEED, BASE_ACCELERATION, BASE_TURN_RATE, SPEED_FACTOR, BASE_HULL } from '../../data/tuning/shipTuning.js';
```

Define multiplier constants at the top of the file:
```js
const SPEED_MULT = 1.0;   // comment: expected u/s
const ACCEL_MULT = 1.0;
const TURN_MULT  = 1.0;
const HULL_MULT  = 1.0;   // comment: expected hp
```

Armor arc multipliers for quad-arc system (front/side/aft). Default base is 100 per arc:
```js
const ARMOR_FRONT = 1.0;  // 100
const ARMOR_SIDE  = 0.8;  //  80
const ARMOR_AFT   = 0.6;  //  60
```

**Balance guidelines:**
- Light fighters (Maverick base): SPEED 1.0–1.3, HULL 0.5–0.8, light armor
- Armed haulers (G100 base): SPEED 0.6–0.8, HULL 1.2–1.8, moderate armor
- Frigates (Garrison base): SPEED 0.4–0.6, HULL 2.0–3.5, heavy armor
- Motherships (Onyx base): SPEED 0.3–0.5, HULL 3.0–5.0, heavy all-round armor

## Step 3 — Create the enemy file

File goes in `js/npcs/<faction>/` (e.g. `js/npcs/scavengers/`, `js/npcs/concord/`). Filename: camelCase of the display name, e.g. `voidCutter.js`.

Template:
```js
import { <BaseClass> } from '../../ships/classes/<baseFile>.js';
import { <WeaponModule1>, <WeaponModule2> } from '../../modules/shipModule.js';
import { BASE_SPEED, BASE_ACCELERATION, BASE_TURN_RATE, SPEED_FACTOR, BASE_HULL } from '../../data/tuning/shipTuning.js';
import { AI_TEMPLATES } from '../../data/tuning/aiTuning.js';

const SPEED_MULT = X;
const ACCEL_MULT = X;
const TURN_MULT  = X;
const HULL_MULT  = X;

const ARMOR_FRONT = X;
const ARMOR_SIDE  = X;
const ARMOR_AFT   = X;

export class <ClassName> extends <BaseClass> {
  constructor(x, y) {
    super(x, y);

    this.faction     = '<faction>';
    this.relation    = 'hostile';
    this.shipType    = '<kebab-slug>';
    this.displayName = '<Display Name>';
    this.ai          = { ...AI_TEMPLATES.<behaviorTemplate> };  // stalker | kiter | standoff | lurker

    this.flavorText =
      '<Tactical description. One paragraph. Include: what it is, how it fights, ' +
      'what faction fields it, its strengths, its weaknesses.>';

    this.speedMax     = BASE_SPEED        * SPEED_MULT * SPEED_FACTOR;
    this.acceleration = BASE_ACCELERATION * ACCEL_MULT * SPEED_FACTOR;
    this.turnRate     = BASE_TURN_RATE    * TURN_MULT  * SPEED_FACTOR;

    this.hullMax     = BASE_HULL * HULL_MULT;
    this.hullCurrent = this.hullMax;

    this._initArmorArcs(ARMOR_FRONT, ARMOR_SIDE, ARMOR_AFT);

    this.moduleSlots = [new <WeaponModule1>(), new <WeaponModule2>()];
    this._applyModules();
  }
}

export function create<ClassName>(x, y) {
  return new <ClassName>(x, y);
}
```

**Lurker note:** If `behaviorType === 'lurker'`, the spawn code in map.js must set `enemy.ai._coverPoint = { x, y }` after creation. Add a comment in the file reminding the map author of this.

## Step 4 — Register in NPC_REGISTRY

Open `js/ships/registry.js`. Add:
1. An import line for the factory function from the new NPC file
2. An entry in `NPC_REGISTRY` with `id`, `label`, `faction`, `behavior`, `shipClass`, `file`, and `create`

## Step 5 — Add to map data

Open `js/data/maps/tyr.js` and `js/data/maps/arena.js`. Add a spawn entry in the `entities` array:
```js
{ type: '<kebab-slug>', x: XXXX, y: YYYY, homePosition: { x: XXXX, y: YYYY } }
```

For lurkers, also set `ship.ai._coverPoint` — do this in the spawn helper or as a post-spawn property on the `ship.ai` object.

In `arena.js` place the spawn close enough to the player's start that it's reachable quickly.

## Step 6 — Update MECHANICS.md

Find the "Enemies" or "AI Behaviors" section in `MECHANICS.md`. Add the new enemy with:
- Display name and file path
- Base class and behavior type
- Key stats (SPEED_MULT, HULL_MULT, weapons)
- Tactical role summary (one sentence)

## Step 7 — Done

Tell the user to open `editor.html?map=arena` to verify the new enemy spawns, behaves correctly, and uses the right weapons.
