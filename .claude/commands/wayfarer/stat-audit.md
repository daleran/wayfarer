# Stat Audit — Find Convention Violations

Scan the codebase for hardcoded numeric stats and inline color strings that violate project conventions. Report every violation with a suggested fix. Do not automatically apply fixes — report first, then ask the user which to fix.

## What to Scan

### 1. Hardcoded numeric stats in ship/weapon constructors

**The rule:** Every numeric stat assigned in a constructor must be `BASE_X * MULT * FACTOR`. Raw numbers are never allowed.

**Files to scan:**
- `js/ships/**/*.js`
- `js/npcs/**/*.js`
- `js/modules/weapons/**/*.js`
- `js/modules/shipModule.js` (for weapon module damage values)

**Properties that must use the multiplier pattern:**
- `this.speedMax`
- `this.acceleration`
- `this.turnRate`
- `this.hullMax`
- `this.armorFront`, `this.armorSide`, `this.armorAft` (or `_initArmorArcs` call)
- `this.damage`, `this.hullDamage` on weapon modules
- `this.fireRate`, `this.projectileSpeed`, `this.range` on weapon modules
- `this.fuelMax`, `this.fuelEfficiency`

**What to flag:**
- Any of the above assigned a raw number literal: `this.speedMax = 180` ❌
- Any of the above that don't reference a `BASE_*` constant and a multiplier: `this.hullMax = BASE_HULL` (missing multiplier) ⚠️
- Multiplier constants defined as hardcoded numbers are fine: `const SPEED_MULT = 1.2` ✅

**Report format per violation:**
```
FILE: js/ships/classes/someShip.js
LINE: 42
FOUND: this.speedMax = 180
FIX:   const SPEED_MULT = X.X; ... this.speedMax = BASE_SPEED * SPEED_MULT * SPEED_FACTOR;
```

### 2. Inline hex color strings

**The rule:** No hex color strings anywhere in the codebase. All colors come from `js/rendering/colors.js`.

**Files to scan:** All `js/**/*.js` files

**What to flag:**
- Any string matching `/#[0-9a-fA-F]{3,8}/` used as a color argument (e.g. in `ctx.fillStyle`, `ctx.strokeStyle`, `ctx.shadowColor`)
- Exception: `js/rendering/colors.js` itself — that file is the definition file and is allowed to contain hex strings

**Report format per violation:**
```
FILE: js/world/someRenderer.js
LINE: 88
FOUND: ctx.strokeStyle = '#ff4422';
FIX:   import { RED } from '../rendering/colors.js'; ... ctx.strokeStyle = RED;
       (If no matching color exists, add one to js/rendering/colors.js first)
```

### 3. Stats defined outside compiled data

**The rule:** `BASE_*` constants live only in `data/compiledData.js` (generated from `data/*.csv` by `scripts/compile-data.js`). No other file should define a constant named `BASE_*`.

The source CSVs are:
- `data/shipBase.csv` — movement, health, fuel
- `data/weaponBase.csv` — damage, range, fire rate, ammo
- `data/aiBehaviors.csv` — AI behavior templates
- `data/moduleEngines.csv`, `data/moduleReactors.csv`, `data/moduleSensors.csv`, `data/moduleWeapons.csv` — module stats
- `data/economy.csv` — economy stats

**Files to scan:** All `js/**/*.js`

**What to flag:**
- Any `const BASE_` declaration in `js/**/*.js`

## Audit Output Format

Group violations by file. For each file, list all violations. End with a summary count:

```
=== STAT AUDIT RESULTS ===

[Hardcoded Stats]
  js/ships/classes/someShip.js:42 — this.speedMax = 180
  js/npcs/scavengers/lightFighter.js:55 — this.damage = 25

[Inline Colors]
  js/world/someRenderer.js:88 — ctx.strokeStyle = '#ff4422'

[Rogue BASE_ constants]
  (none)

TOTAL: 2 stat violations, 1 color violation, 0 rogue BASE_ constants
```

If no violations are found, say so clearly.

## After Reporting

Ask the user: "Which violations would you like me to fix?" Then fix only the ones they confirm.

When fixing a stat violation:
1. Check `data/compiledData.js` for the appropriate `BASE_*` constant (from shipBase.csv, weaponBase.csv, etc.)
2. Add a `MULT` constant at the top of the file
3. Replace the raw number with `BASE_X * MULT` (plus `* SPEED_FACTOR` for movement stats)
4. Do not change any other code in the file

When fixing a color violation:
1. Check `js/rendering/colors.js` for an existing matching color
2. If no match exists, add a new named constant to `js/rendering/colors.js` first
3. Replace the inline hex with the imported constant
4. Add the import line if the file doesn't already import from colors.js
