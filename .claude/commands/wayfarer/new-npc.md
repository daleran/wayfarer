# New NPC — Full Creation Workflow

The user wants to add a new NPC ship (hostile or neutral) to Wayfarer. Follow every step in order. Do not skip the docs update at the end.

## Step 1 — Gather requirements

Ask the user (or infer from their description) for:
- **Display name** — e.g. "Void Cutter"
- **Base ship class** — must extend one of: `MaverickCourier`, `G100ClassHauler`, `GarrisonFrigate`, `OnyxClassTug`
- **Relation** — `'hostile'` (enemy) or `'neutral'` (friendly/passive)
- **Faction** — `'scavenger'`, `'concord'`, `'settlements'`, `'monastic'`, `'communes'`, or `'zealots'`
- **Weapons** — pick from `shipModule.js` exports: `AutocannonModule`, `LanceModuleSmall`, `CannonModule`, `RocketPodModule`
- **Role / flavor** — a short description of its tactical identity

**If hostile**, also ask:
- **Combat behavior** — one of the five:
  - `stalker` — flanks to player's aft, fires only when nose-aligned; patient, precise
  - `kiter` — maintains distance, backs off when too close, orbits at max range; hit-and-run
  - `standoff` — holds a long fixed range, fires both primary and secondary; capital-style
  - `lurker` — hides at a cover point, scans for traders, pounces; ambush predator. Requires `ship.ai._coverPoint` set at spawn.
  - `flee` — retreat behavior; used as a fallback when hull is critically low

**If neutral**, also ask:
- **Passive behavior** — one of:
  - `trader` — travels between two stations (`ship.ai._tradeRouteA/B`)
  - `militia` — orbits a point (`ship.ai._orbitCenter/Radius/Speed/Angle`)

## Step 2 — Decide on stats

All stats must use the multiplier pattern from `@data/compiledData.js`. Import:
```js
import { BASE_SPEED, BASE_ACCELERATION, BASE_TURN_RATE, SPEED_FACTOR, BASE_HULL } from '@data/compiledData.js';
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

## Step 3 — Create the NPC file

File goes in `js/npcs/<faction>/` (e.g. `js/npcs/scavengers/`, `js/npcs/settlements/`). Filename: camelCase of the display name.

### Hostile NPC template:
```js
import { <BaseClass> } from '../../ships/classes/<baseFile>.js';
import { <WeaponModule1> } from '../../modules/shipModule.js';
import { BASE_SPEED, BASE_ACCELERATION, BASE_TURN_RATE, SPEED_FACTOR, BASE_HULL, AI_TEMPLATES } from '@data/compiledData.js';

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
    this.ai          = { ...AI_TEMPLATES.<behavior> };

    this.flavorText = '<Tactical description. One paragraph.>';

    this._initStats({
      speed: BASE_SPEED * SPEED_MULT * SPEED_FACTOR,
      accel: BASE_ACCELERATION * ACCEL_MULT * SPEED_FACTOR,
      turn:  BASE_TURN_RATE * TURN_MULT * SPEED_FACTOR,
      hull:  BASE_HULL * HULL_MULT,
      armorFront: ARMOR_FRONT,
      armorSide:  ARMOR_SIDE,
      armorAft:   ARMOR_AFT,
    });

    this.moduleSlots = [new <WeaponModule1>()];
    this._applyModules();
  }
}
```

### Neutral NPC template:
```js
import { <BaseClass> } from '../../ships/classes/<baseFile>.js';
import { BASE_SPEED, BASE_ACCELERATION, BASE_TURN_RATE, SPEED_FACTOR, BASE_HULL, AI_TEMPLATES } from '@data/compiledData.js';

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
    this.relation    = 'neutral';
    this.shipType    = '<kebab-slug>';
    this.displayName = '<Display Name>';
    this.ai          = { ...AI_TEMPLATES.passive, passiveBehavior: '<trader|militia>' };

    this.flavorText = '<Description. One paragraph.>';

    this._initStats({
      speed: BASE_SPEED * SPEED_MULT * SPEED_FACTOR,
      accel: BASE_ACCELERATION * ACCEL_MULT * SPEED_FACTOR,
      turn:  BASE_TURN_RATE * TURN_MULT * SPEED_FACTOR,
      hull:  BASE_HULL * HULL_MULT,
      armorFront: ARMOR_FRONT,
      armorSide:  ARMOR_SIDE,
      armorAft:   ARMOR_AFT,
    });
  }
}
```

**Lurker note:** If `behaviorType === 'lurker'`, the spawn code must set `ship.ai._coverPoint = { x, y }` after creation.

**Trader note:** Spawn code must set `ship.ai._tradeRouteA` and `ship.ai._tradeRouteB` to station positions.

**Militia note:** Spawn code must set `ship.ai._orbitCenter`, `ship.ai._orbitRadius`, `ship.ai._orbitSpeed`, `ship.ai._orbitAngle`.

## Step 4 — Register in NPC_REGISTRY

Open `js/ships/registry.js`. Add:
1. An import for the class
2. An entry in `NPC_REGISTRY` with `id`, `label`, `faction`, `behavior`, `shipClass`, and `create`

## Step 5 — Add to map data

Add spawn entries to `js/data/maps/arena.js` (for testing) and `js/data/maps/tyr.js` (for production). Use `createShip()` from the registry or direct instantiation in the zone manifest.

For lurkers, set `ship.ai._coverPoint` post-spawn. For traders, set trade route points. For militia, set orbit params.

## Step 6 — Update MECHANICS.md

Find the appropriate section (Enemies or Neutral Traffic). Add:
- Display name and file path
- Base class, behavior type, faction
- Key stats (SPEED_MULT, HULL_MULT, weapons)
- Tactical role summary (one sentence)

## Step 7 — Done

Tell the user to open `editor.html?map=arena` to verify the NPC spawns and behaves correctly.
