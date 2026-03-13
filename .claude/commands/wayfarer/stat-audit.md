# Stat Audit — Find Convention Violations

Scan the codebase for stat and color convention violations. The CSV files in `data/` are the single source of truth. Report every violation with a suggested fix. Do not automatically apply fixes — report first, then ask the user which to fix.

## Data Pipeline Overview

`data/*.csv` → `scripts/compile-data.js` → `data/compiledData.js` → imported as `@data/compiledData.js`

**Key-value CSVs** (exported as individual constants):
- `data/shipBase.csv` — `SPEED_FACTOR`, `BASE_SPEED`, `BASE_ACCELERATION`, `BASE_TURN_RATE`, `BASE_HULL`, `BASE_ARMOR`, `BASE_CARGO`, `BASE_FUEL_MAX`, `BASE_FUEL_EFFICIENCY`, `BASE_HULL_WEIGHT`, `FUEL_WEIGHT_PER_UNIT`, `TW_*`, `THROTTLE_*`, `SPAWN_*`
- `data/weaponBase.csv` — `PROJECTILE_SPEED_FACTOR`, `BASE_PROJECTILE_SPEED`, `BASE_WEAPON_RANGE`, `BASE_DAMAGE`, `BASE_HULL_DAMAGE`, `BASE_COOLDOWN`, magazine/reload constants, blast radii, module breach constants
- `data/economy.csv` — `DEFAULT_SCRAP`, `FUEL_RATES`, `REPAIR_RATE`, `REPAIR_COST_PER_PT`, `MODULE_REPAIR_RATE`, `MODULE_REPAIR_COST`, `BOUNTY_EXPIRY_WARNING_SECS`, `SCRAP_MASS`
- `data/reputation.csv` — `KILL_PENALTY`, `RIVAL_BONUS`, `BOUNTY_BONUS`, `ATTACK_NEUTRAL_PENALTY`, threshold/discount constants

**Tabular CSVs** (exported as lookup objects/arrays):
- `data/shipClasses.csv` — `SHIP_CLASSES[id]` → `{ speedMult, accelMult, turnMult, hullMult, weightMult, cargoMult, armorFront, armorSide, armorAft, fuelMaxMult, fuelEffMult }`
- `data/shipsNamed.csv` — `SHIPS_NAMED[id]` → `{ shipClass, faction, relation, aiBehavior, modules }`
- `data/moduleWeapons.csv` — `MODULE_WEAPONS[id]` → `{ damageMult, hullDamageMult, rangeMult, speedMult, cooldownMult, magSize, reloadTime, blastRadius, ammoType, isBeam, isFixed, isSecondary, canIntercept, isInterceptable, guidanceStrength, burstSpread, ... }`
- `data/moduleEngines.csv` — `MODULE_ENGINES[id]` → `{ thrust, fuelEffMult, fuelDrainRate, powerDraw, weight }`
- `data/moduleReactors.csv` — `MODULE_REACTORS[id]` → `{ powerOutput, fuelDrainRate, overhaulInterval, overhaulCost, degradedOutput, weight }`
- `data/moduleSensors.csv` — `MODULE_SENSORS[id]` → `{ powerDraw, weight, sensorRange, feature flags... }`
- `data/aiBehaviors.csv` — `AI_TEMPLATES[id]` → `{ combatBehavior, passiveBehavior, aggroRange, deaggroRange, fireRange, ... }`

## What to Audit

### 1. CSV ↔ JS Consistency

**Check that tabular CSV rows are consumed correctly in JS:**

For each ship class in `data/shipClasses.csv`:
- Find the corresponding JS file in `js/ships/classes/` and verify it imports and uses the class multipliers from `SHIP_CLASSES`
- Flag any JS file that hardcodes a multiplier value instead of reading it from the CSV data

For each named ship in `data/shipsNamed.csv`:
- Verify the JS file references the correct `shipClass` and `aiBehavior`
- Verify module loadout matches between CSV and JS

For each weapon in `data/moduleWeapons.csv`:
- Verify the JS weapon file in `js/modules/weapons/` uses the CSV stats (damageMult, rangeMult, etc.) rather than hardcoding them

For each module in `data/moduleEngines.csv`, `data/moduleReactors.csv`, `data/moduleSensors.csv`:
- Verify the JS module in `js/modules/` reads stats from compiled data rather than hardcoding

**What to flag:**
- JS file hardcodes a value that exists in a CSV column: `this.hullMult = 1.8` when `shipClasses.csv` already has `hullMult=1.8` for that class
- JS file uses a different value than what's in the CSV
- CSV row exists with no corresponding JS consumer
- JS file defines stats that should be in a CSV but aren't

### 2. Hardcoded stats in ship/weapon constructors

**The rule:** Ship stats come from `BASE_* × classMult × FACTOR`. Weapon stats come from `BASE_* × weaponMult`. Raw numbers are never allowed for gameplay-affecting stats.

**Files to scan:**
- `js/ships/**/*.js`
- `js/npcs/**/*.js`
- `js/modules/weapons/**/*.js`
- `js/modules/shipModule.js`

**Properties that must use the multiplier pattern:**
- Ship movement: `speedMax`, `acceleration`, `turnRate` (via `_initStats` or direct assignment)
- Ship durability: `hullMax`, `armorFront`, `armorSide`, `armorAft` (via `_initStats` or `_initArmorArcs`)
- Ship resources: `fuelMax`, `fuelEfficiency`, `cargoMax`
- Weapon stats: `damage`, `hullDamage`, `fireRate`, `projectileSpeed`, `range`

**What to flag:**
- Any of the above assigned a raw number literal: `this.speedMax = 180` ❌
- Any stat that doesn't trace back to a `BASE_*` constant and a multiplier: `this.hullMax = BASE_HULL` (missing multiplier) ⚠️
- Multiplier constants defined as hardcoded numbers are fine: `const SPEED_MULT = 1.2` ✅ (though these should ideally come from the CSV)

### 3. Inline hex color strings

**The rule:** No hex color strings anywhere except `js/rendering/colors.js`. All colors import from there.

**Files to scan:** All `js/**/*.js` files

**What to flag:**
- Any string matching `'#[0-9a-fA-F]{3,8}'` or `"#[0-9a-fA-F]{3,8}"` used as a color
- **Exception:** `js/rendering/colors.js` itself (the definition file)

### 4. Rogue BASE_ constants

**The rule:** `BASE_*` constants live only in `data/compiledData.js`. No JS file should define its own `const BASE_*`.

**Files to scan:** All `js/**/*.js`

**What to flag:**
- Any `const BASE_` declaration outside `data/compiledData.js`

### 5. Stats that should be in CSV but aren't

**Check for numeric constants in JS files that represent gameplay stats and should be centralized in a CSV.**

**What to flag:**
- Magic numbers in ship/weapon/module constructors that aren't cosmetic (e.g. draw offsets are fine, but `this.sensorRange = 3000` is a stat)
- Module stats (weight, powerDraw, powerOutput, thrust, etc.) hardcoded in `js/modules/` files instead of coming from the corresponding CSV

## Audit Output Format

```
=== STAT AUDIT RESULTS ===

[CSV ↔ JS Mismatches]
  data/shipClasses.csv:onyx-tug — hullMult=1.8 but js/ships/classes/onyxTug.js uses HULL_MULT=1.6
  data/moduleWeapons.csv:autocannon — damageMult=1.0 but js/modules/weapons/autocannon.js hardcodes damage

[Hardcoded Stats]
  js/ships/classes/someShip.js:42 — this.speedMax = 180
  js/npcs/scavengers/lightFighter.js:55 — this.damage = 25

[Inline Colors]
  js/world/someRenderer.js:88 — ctx.strokeStyle = '#ff4422'

[Rogue BASE_ Constants]
  (none)

[Stats Missing from CSV]
  js/modules/shipModule.js:120 — SmallFissionReactor powerOutput=160 should be in moduleReactors.csv

TOTAL: X csv mismatches, X stat violations, X color violations, X rogue constants, X missing csv entries
```

If no violations are found in a category, show `(none)`.

## After Reporting

Ask the user: "Which violations would you like me to fix?" Then fix only the ones they confirm.

**Fixing priorities:**
1. **CSV ↔ JS mismatches**: Update the JS to read from compiled data, or update the CSV if the JS value is intentionally different
2. **Hardcoded stats**: Add a multiplier constant and use `BASE_X * MULT * FACTOR`
3. **Stats missing from CSV**: Add the stat to the appropriate CSV, run `npm run compile-data`, then update the JS to import from compiled data
4. **Inline colors**: Import from `js/rendering/colors.js` (add new constant there if needed)
5. **Rogue BASE_ constants**: Remove and import from `@data/compiledData.js` instead

After any CSV changes, run `npm run compile-data` to regenerate `data/compiledData.js`.
