# New Module — Full Creation Workflow

The user wants to add a new ship module to Wayfarer. Follow every step in order.

## Step 1 — Gather requirements

Ask the user (or infer from their description) for:
- **Display name** — e.g. "HEAVY PLATING"
- **Module ID** — kebab-case, e.g. `heavy-plating` (used in MODULE_REGISTRY)
- **Category** — one of:
  - **Weapon** — wraps a weapon instance; wired into ship.weapons on install
  - **Engine** — modifies ship speed/accel/fuelEfficiency via multipliers
  - **Power** — generates watts (powerOutput); may consume fuel (fuelDrainRate)
  - **Sensor** — grants minimap/detection capabilities via boolean flags
  - **Passive** — any other effect (armor boost, cargo expansion, etc.)
- **Key stats** — power draw/output, any multipliers, special flags
- **Description** — one sentence for the tooltip

## Step 2 — Check tuning constants

If the module has numeric stats that should be globally tunable:
1. Read `js/data/tuning/moduleTuning.js`
2. Add new constants there (follow the naming pattern: `MODULE_<TYPE>_<STAT>`)
3. Import them in the module file

If it's a simple module with fixed values, inline constants are acceptable.

## Step 3 — Create the module class

All modules live in `js/modules/shipModule.js`. Add the new class there.

### Base passive module:
```js
export class <ClassName> extends ShipModule {
  constructor() {
    super();
    this.name        = '<kebab-id>';
    this.displayName = '<DISPLAY NAME>';
    this.description = '<One sentence description.>';
    this.powerDraw   = XX;
    // any custom flags...
  }
  onInstall(ship) { /* apply effects */ }
  onRemove(ship)  { /* undo effects */ }
}
```

### Weapon module:
```js
export class <ClassName> extends ShipModule {
  constructor() {
    super();
    this.name        = '<kebab-id>';
    this.displayName = '<DISPLAY NAME>';
    this.description = '<One sentence description.>';
    this.powerDraw   = XX;
    this.weapon      = new <WeaponClass>();
  }
  onInstall(ship) { ship.addWeapon(this.weapon); this._applyConditionToWeapon(); }
  onRemove(ship)  { ship.removeWeapon(this.weapon); }
}
```

### Engine module (extends EngineModule):
```js
export class <ClassName> extends EngineModule {
  constructor() {
    super();
    this.name          = '<kebab-id>';
    this.displayName   = '<DISPLAY NAME>';
    this.description   = '<One sentence description.>';
    this.speedMult     = MODULE_<TYPE>_SPEED_MULT;
    this.accelMult     = MODULE_<TYPE>_ACCEL_MULT;
    this.fuelEffMult   = MODULE_<TYPE>_FUEL_EFF_MULT;
    this.fuelDrainRate = MODULE_<TYPE>_FUEL_DRAIN; // if applicable
    this.powerDraw     = MODULE_<TYPE>_POWER_DRAW;
  }
}
```

### Power module:
```js
export class <ClassName> extends ShipModule {
  constructor() {
    super();
    this.name          = '<kebab-id>';
    this.displayName   = '<DISPLAY NAME>';
    this.description   = '<One sentence description.>';
    this.powerOutput   = XX;
    this.fuelDrainRate = XX; // 0 if no fuel cost
  }
  get effectivePowerOutput() {
    return Math.round(this.powerOutput * this.conditionMultiplier);
  }
}
```

### Fission reactor (with overhaul timer):
Follow the `SmallFissionReactor` / `LargeFissionReactor` pattern — includes `isFissionReactor`, `_overhaulInterval`, `overhaulCost`, `timeSinceOverhaul`, `isOverdue`, `update()`, `resetOverhaul()`.

## Step 4 — Register in MODULE_REGISTRY

Open `js/modules/registry.js`. Add:
1. An import for the new class
2. An entry in `MODULE_REGISTRY` mapping the ID string to the class

## Step 5 — Add to loot tables (if salvageable)

If the module should drop from derelicts, open `js/data/lootTables.js` and add the module ID to the appropriate derelict class loot table.

## Step 6 — Update MECHANICS.md

Find the appropriate section (Modules, Engines, Reactors, or Sensors). Add:
- Module name, ID, category
- Key stats (power draw/output, multipliers)
- One-line description of what it does

## Step 7 — Done

Tell the user the module is ready. If it needs to be installed on a ship for testing, suggest which ship file to add it to and which map to test with.
