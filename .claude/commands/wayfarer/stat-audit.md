# Stat Audit — Find Convention Violations

Scan the codebase for stat and color convention violations. The JS data files in `data/` are the single source of truth. Report every violation with a suggested fix. Do not automatically apply fixes — report first, then ask the user which to fix.

## Data Pipeline Overview

`data/*.js` content files → `data/dataRegistry.js` tables → `data/index.js` boot → imported as `@data/index.js`

**Tuning constants** (`data/tuning.js`, exported as individual constants):
- Ship base: `SPEED_FACTOR`, `BASE_SPEED`, `BASE_ACCELERATION`, `BASE_TURN_RATE`, `BASE_HULL`, `BASE_ARMOR`, `BASE_CARGO`, `BASE_FUEL_MAX`, `BASE_HULL_WEIGHT`, `FUEL_WEIGHT_PER_UNIT`, `TW_*`, `THROTTLE_*`, `SPAWN`
- Weapon base: `PROJECTILE_SPEED_FACTOR`, `BASE_PROJECTILE_SPEED`, `BASE_WEAPON_RANGE`, `BASE_DAMAGE`, `BASE_HULL_DAMAGE`, `BASE_COOLDOWN`, magazine/reload constants, blast radii, module breach constants
- Economy: `DEFAULT_SCRAP`, `FUEL_RATES`, `REPAIR_RATE`, `REPAIR_COST_PER_PT`, `MODULE_REPAIR_RATE`, `MODULE_REPAIR_COST`, `BOUNTY`, `SCRAP_MASS`
- Reputation: `REPUTATION` object with KILL_PENALTY, RIVAL_BONUS, thresholds, etc.

**Content tables** (populated via `registerData()` in `data/dataRegistry.js`):
- `data/shipClasses.js` — `SHIP_CLASSES[id]` → `{ hullMult, weightMult, cargoMult, armorFront, armorSide, armorAft, fuelMaxMult }`
- `data/ships/<faction>/*.js` — ship config entries in `CONTENT.ships` → `{ shipClass, modules, flavorText }`
- `data/characters/*.js` — character entries in `CONTENT.characters` → `{ name, faction, relation, behavior, shipId }`
- `data/weapons.js` — `WEAPONS[id]` → `{ damageMult, hullDamageMult, rangeMult, speedMult, cooldownMult, magSize, reloadTime, blastRadius, acceptedAmmoTypes, isBeam, isFixed, isSecondary, canIntercept, isInterceptable, guidanceStrength, burstSpread, ... }`
- `data/engines.js` — `ENGINES[id]` → `{ thrust, fuelEffMult, fuelDrainRate, powerDraw, weight }`
- `data/reactors.js` — `REACTORS[id]` → `{ powerOutput, fuelDrainRate, overhaulInterval, overhaulCost, degradedOutput, weight }`
- `data/sensors.js` — `SENSORS[id]` → `{ powerDraw, weight, sensorRange, feature flags... }`
- `data/aiBehaviors.js` — `AI_TEMPLATES[id]` → `{ combatBehavior, passiveBehavior, aggroRange, deaggroRange, fireRange, ... }`

## What to Audit

### 1. Data ↔ JS Consistency

**Check that content table entries are consumed correctly in JS:**

For each ship class in `data/shipClasses.js`:
- Find the corresponding hull file in `data/hulls/*/hull.js` and verify it imports and uses the class multipliers from `SHIP_CLASSES`
- Flag any JS file that hardcodes a multiplier value instead of reading it from the data

For each ship config in `data/ships/<faction>/*.js` (registered in `CONTENT.ships`):
- Verify the entry references the correct `shipClass`
- Verify module loadout matches between data and JS

For each character in `data/characters/*.js` (registered in `CONTENT.characters`):
- Verify `shipId` references a valid `CONTENT.ships` entry
- Verify `behavior` is a valid AI behavior

For each weapon in `data/weapons.js`:
- Verify the JS weapon file in `engine/modules/weapons/` uses the data stats (damageMult, rangeMult, etc.) rather than hardcoding them

For each module in `data/engines.js`, `data/reactors.js`, `data/sensors.js`:
- Verify the JS module in `engine/modules/` reads stats from compiled data rather than hardcoding

**What to flag:**
- JS file hardcodes a value that exists in a data entry: `this.hullMult = 1.8` when `data/shipClasses.js` already has `hullMult: 1.8` for that class
- JS file uses a different value than what's in the data
- Data entry exists with no corresponding JS consumer
- JS file defines stats that should be in a data file but aren't

### 2. Hardcoded stats in ship/weapon constructors

**The rule:** Ship stats come from `BASE_* × classMult × FACTOR`. Weapon stats come from `BASE_* × weaponMult`. Raw numbers are never allowed for gameplay-affecting stats.

**Files to scan:**
- `data/hulls/*/hull.js`
- `data/ships/**/*.js`
- `data/characters/*.js`
- `engine/modules/weapons/**/*.js`
- `engine/modules/shipModule.js`

**Properties that must use the multiplier pattern:**
- Ship movement: `speedMax`, `acceleration`, `turnRate` (via `_initStats` or direct assignment)
- Ship durability: `hullMax`, `armorFront`, `armorSide`, `armorAft` (via `_initStats` or `_initArmorArcs`)
- Ship resources: `fuelMax`, `fuelEfficiency`, `cargoMax`
- Weapon stats: `damage`, `hullDamage`, `fireRate`, `projectileSpeed`, `range`

**What to flag:**
- Any of the above assigned a raw number literal: `this.speedMax = 180` ❌
- Any stat that doesn't trace back to a `BASE_*` constant and a multiplier: `this.hullMax = BASE_HULL` (missing multiplier) ⚠️
- Multiplier constants defined as hardcoded numbers are fine: `const SPEED_MULT = 1.2` ✅ (though these should ideally come from the data file)

### 3. Inline hex color strings

**The rule:** No hex color strings anywhere except `engine/rendering/colors.js`. All colors import from there.

**Files to scan:** All `engine/**/*.js` files

**What to flag:**
- Any string matching `'#[0-9a-fA-F]{3,8}'` or `"#[0-9a-fA-F]{3,8}"` used as a color
- **Exception:** `engine/rendering/colors.js` itself (the definition file)

### 4. Rogue BASE_ constants

**The rule:** `BASE_*` constants live only in `data/tuning.js` (re-exported via `data/index.js`). No JS file should define its own `const BASE_*`.

**Files to scan:** All `engine/**/*.js`

**What to flag:**
- Any `const BASE_` declaration outside `data/tuning.js`

### 5. Stats that should be in data files but aren't

**Check for numeric constants in JS files that represent gameplay stats and should be centralized in a data file.**

**What to flag:**
- Magic numbers in ship/weapon/module constructors that aren't cosmetic (e.g. draw offsets are fine, but `this.sensorRange = 3000` is a stat)
- Module stats (weight, powerDraw, powerOutput, thrust, etc.) hardcoded in `engine/modules/` files instead of coming from the corresponding data file

## Audit Output Format

```
=== STAT AUDIT RESULTS ===

[Data ↔ JS Mismatches]
  data/shipClasses.js:onyx-tug — hullMult=1.8 but data/hulls/onyx-tug/hull.js uses HULL_MULT=1.6
  data/weapons.js:autocannon — damageMult=1.0 but engine/modules/weapons/autocannon.js hardcodes damage

[Hardcoded Stats]
  data/hulls/some-ship/hull.js:42 — this.speedMax = 180
  data/ships/scavenger/lightFighter.js:55 — this.damage = 25

[Inline Colors]
  engine/world/someRenderer.js:88 — ctx.strokeStyle = '#ff4422'

[Rogue BASE_ Constants]
  (none)

[Stats Missing from Data]
  engine/modules/shipModule.js:120 — SmallFissionReactor powerOutput=160 should be in data/reactors.js

TOTAL: X data mismatches, X stat violations, X color violations, X rogue constants, X missing data entries
```

If no violations are found in a category, show `(none)`.

## After Reporting

Ask the user: "Which violations would you like me to fix?" Then fix only the ones they confirm.

**Fixing priorities:**
1. **Data ↔ JS mismatches**: Update the JS to read from compiled data, or update the data file if the JS value is intentionally different
2. **Hardcoded stats**: Add a multiplier constant and use `BASE_X * MULT * FACTOR`
3. **Stats missing from data**: Add the stat to the appropriate `data/*.js` file, then update the JS to import from compiled data
4. **Inline colors**: Import from `engine/rendering/colors.js` (add new constant there if needed)
5. **Rogue BASE_ constants**: Remove and import from `@data/index.js` instead
