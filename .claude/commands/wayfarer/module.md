# Module or Weapon — Create or Edit

Create a new module/weapon or edit an existing one. Modules are installable ship components. Weapons are a specific module category that wrap a weapon instance and wire into the ship's fire control.

## Step 1 — Identify scope

**Creating new?** Ask the user for:
- **Display name** — e.g. "HEAVY PLATING" or "Flak Cannon"
- **Module ID** — kebab-case, e.g. `heavy-plating` or `flak-cannon`
- **Category** — one of:
  - **WEAPON** — wraps a weapon instance; wired into `ship.weapons` on install
  - **ENGINE** — provides thrust, weight, fuel efficiency; extends `EngineModule`
  - **POWER** — generates watts (`powerOutput`); may consume fuel
  - **SENSOR** — grants detection/targeting capabilities via boolean flags
  - **UTILITY** — any other effect (armor boost, cargo expansion, salvage bay, etc.)
- **Mount size** — `'small'` or `'large'`
- **Key stats** — power draw/output, multipliers, special flags
- **Description** — one sentence for tooltip

**If creating a weapon**, also ask:
- **Weapon type** — projectile, beam, rocket/missile, or torpedo
- **Firing mode** — manual, auto-fire, fixed (ship-aimed)
- **Ammo** — infinite or ammo-consuming (needs `ammoType`)
- **Special flags** — AoE, intercept, interceptable, hull-damage, falloff, ramp-damage, burst
- **Flavor text** — lore blurb for designer
- **Projectile visuals** — color (from `colors.js`), length, trail

**Editing existing?** Read the file first. Ask what to change. Common edits:
- Rebalance stats (damage, range, cooldown, power draw)
- Change firing behavior or ammo type
- Update visuals (projectile color, beam appearance)
- Adjust module weight or power budget

## Step 2 — Read reference files

### For modules:
- `js/modules/shipModule.js` — all module class definitions and `MODULE_REGISTRY`
- `js/modules/registry.js` — ID-to-constructor registry (used by `createModuleById`)
- Relevant data files: `data/engines.js`, `data/reactors.js`, `data/sensors.js`, `data/weapons.js`

### For weapons:
- `js/modules/weapons/registry.js` — `WEAPON_REGISTRY` with designer metadata
- Existing weapon files in `js/modules/weapons/` for pattern reference
- `data/weapons.js` — weapon stat multipliers
- `js/entities/projectile.js` — projectile behavior flags
- `js/rendering/colors.js` — projectile/beam color constants

### Always:
- `UX.md` — visual conventions
- `data/compiledData.js` imports — `BASE_DAMAGE`, `BASE_HULL_DAMAGE`, `BASE_PROJECTILE_SPEED`, `BASE_WEAPON_RANGE`, `BASE_COOLDOWN`, `PROJECTILE_SPEED_FACTOR`

## Step 3 — Data stats

### Module stats
Add/update entries in the relevant data file using `registerData(TABLE, { ... })`:
- **Engines**: `data/engines.js` — `{ displayName, size, thrust, fuelEffMult, fuelDrainRate, powerDraw, weight }`
- **Reactors**: `data/reactors.js` — `{ displayName, size, powerOutput, fuelDrainRate, overhaulInterval, overhaulCost, degradedOutput, weight }`
- **Sensors**: `data/sensors.js` — `{ displayName, powerDraw, weight, sensorRange, ...feature flags }`
- **Weapons**: `data/weapons.js` — `{ displayName, size, damageMult, hullDamageMult, rangeMult, speedMult, cooldownMult, magSize, reloadTime, ... }`

## Step 4 — Create or edit the code

### Module class (in `js/modules/shipModule.js`)

#### Passive / utility module:
```js
export class <ClassName> extends ShipModule {
  constructor() {
    super();
    this.name        = '<kebab-id>';
    this.displayName = '<DISPLAY NAME>';
    this.description = '<One sentence.>';
    this.powerDraw   = XX;
    this.weight      = XX;
    this.size        = '<small|large>';
  }
  onInstall(ship) { /* apply effects */ }
  onRemove(ship)  { /* undo effects */ }
}
```

#### Engine module:
```js
export class <ClassName> extends EngineModule {
  constructor() {
    super();
    const E = MODULE_ENGINES['<id>'];
    this.name          = '<kebab-id>';
    this.displayName   = '<DISPLAY NAME>';
    this.description   = '<One sentence.>';
    this.thrust        = E.thrust;
    this.weight        = E.weight;
    this.fuelEffMult   = E.fuelEffMult;
    this.fuelDrainRate = E.fuelDrainRate;
    this.powerDraw     = E.powerDraw;
  }
}
```

#### Power module:
```js
export class <ClassName> extends ShipModule {
  constructor() {
    super();
    const R = MODULE_REACTORS['<id>'];
    this.name          = '<kebab-id>';
    this.displayName   = '<DISPLAY NAME>';
    this.description   = '<One sentence.>';
    this.powerOutput   = R.powerOutput;
    this.fuelDrainRate = R.fuelDrainRate;
    this.weight        = R.weight;
  }
  get effectivePowerOutput() {
    return Math.round(this.powerOutput * this.conditionMultiplier);
  }
}
```

#### Weapon module:
```js
export class <ClassName> extends ShipModule {
  constructor() {
    super();
    this.name        = '<kebab-id>';
    this.displayName = '<DISPLAY NAME>';
    this.description = '<One sentence.>';
    this.powerDraw   = XX;
    this.weight      = XX;
    this.size        = '<small|large>';
    this.weapon      = new <WeaponClass>();
  }
  onInstall(ship) { ship.addWeapon(this.weapon); this._applyConditionToWeapon(); }
  onRemove(ship)  { ship.removeWeapon(this.weapon); }
}
```

### Weapon class (new file in `js/modules/weapons/`)

Location: `js/modules/weapons/<camelCaseName>.js`

```js
import {
  BASE_DAMAGE, BASE_HULL_DAMAGE, BASE_PROJECTILE_SPEED,
  BASE_WEAPON_RANGE, BASE_COOLDOWN, PROJECTILE_SPEED_FACTOR,
  MODULE_WEAPONS,
} from '@data/compiledData.js';
import { <PROJ_COLOR> } from '@/rendering/colors.js';

const W = MODULE_WEAPONS['<weapon-id>'];

export class <WeaponName> {
  constructor() {
    this.name         = '<display name>';
    this.damage       = BASE_DAMAGE       * W.damageMult;
    this.hullDamage   = BASE_HULL_DAMAGE  * W.hullDamageMult;
    this.range        = BASE_WEAPON_RANGE * W.rangeMult;
    this.projectileSpeed = BASE_PROJECTILE_SPEED * W.speedMult * PROJECTILE_SPEED_FACTOR;
    this.cooldown     = BASE_COOLDOWN     * W.cooldownMult;
    this.magazineSize = W.magSize;
    this.reloadTime   = W.reloadTime;

    this.isBeam       = false;
    this.isFixed      = false;
    this.isSecondary  = false;
    this.isAutoFire   = false;
    this.canIntercept = false;
    this.isInterceptable = false;

    // Projectile visuals
    this.projectileColor  = <PROJ_COLOR>;
    this.projectileLength = 5;
    this.projectileTrail  = false;

    // AoE (if applicable)
    // this.detonatesOnContact = true;
    // this.detonatesOnExpiry  = false;
    // this.blastRadius = W.blastRadius;

    // Ammo (if applicable)
    // this.ammoType = '<ammo-type>';
  }

  fire(ship, targetX, targetY, entities) {
    // Create and return projectile(s)
  }

  update(dt) {
    // Per-tick logic (beams, ramp damage, etc.)
  }
}
```

## Step 5 — Register

### Module registry (`js/modules/shipModule.js`)
Add to `MODULE_REGISTRY` array:
```js
{ id: '<kebab-id>', category: '<ENGINE|WEAPON|POWER|SENSOR|UTILITY>', create: () => new <ClassName>() },
```

### ID registry (`js/modules/registry.js`)
Add to `MODULE_REGISTRY` object:
```js
'<kebab-id>': <ClassName>,
```

### Weapon registry (weapons only — `js/modules/weapons/registry.js`)
Add to `WEAPON_REGISTRY` array:
```js
{
  id: '<WeaponClassName>', slug: '<kebab-slug>', label: '<Display Name>',
  create: () => new <WeaponName>(),
  flavorText: '<Lore blurb.>',
  projColor: <COLOR_CONST>, projLen: 5, projTrail: false,
  flags: ['manual', 'ammo', ...],
},
```

## Step 6 — Add to loot tables (if salvageable)

If the module/weapon should drop from derelicts, open `js/data/lootTables.js` and add the ID to the appropriate derelict class loot table.

## Step 7 — Validate & verify

1. Run `npm run validate` — fix any errors
2. Tell the user:
   - Modules: `designer.html?category=modules&id=<id>`
   - Weapons: `designer.html?category=weapons&id=<slug>`
   - Install on a test ship and open `editor.html?map=arena` to verify in-game behavior

## Step 8 — Update docs

- New weapon family or module category → `MECHANICS.md`
- New projectile/beam colors → `UX.md` and `js/rendering/colors.js`
