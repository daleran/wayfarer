# Balance — Comparative Stat Analysis

Generate formatted comparison tables for all ships, weapons, and modules. Flag statistical outliers to identify balance issues.

## What to Analyze

### 1. Ship class comparison

**Data source:** `CONTENT.hulls` + `data/shipClasses.js` (via `SHIP_CLASSES`)

**Table columns:**
| Hull | HP | Weight | Cargo | Fuel | Armor F/S/A | Mounts (S/L) | Engine Slots |

**Derived stats** (compute from hull multipliers × base values in `data/tuning.js`):
- Effective HP = `BASE_HULL * hullMult`
- Effective cargo = `BASE_CARGO * cargoMult`
- Effective fuel = `BASE_FUEL_MAX * fuelMaxMult`
- Armor values = `BASE_ARMOR * armorFront/Side/Aft`
- Mount count from `MOUNT_POINTS.length` in hull files

**Outlier detection:** Flag any stat >2 standard deviations from the mean across all hulls.

### 2. Named ship comparison

**Data source:** `CONTENT.ships` + `CONTENT.characters`

**Table columns:**
| Ship | Hull Class | Captain | Faction | Behavior | Module Count | Weapons |

**Checks:**
- Ships with empty module slots (may be intentional for derelicts)
- Ships without weapons (non-combat roles like traders)
- Faction/behavior mismatches (e.g. trader with stalker behavior)

### 3. Weapon comparison

**Data source:** `CONTENT.weapons` + `data/weapons.js` (via `MODULE_WEAPONS`)

**Table columns:**
| Weapon | DPS | Range | Speed | Mag | Reload | Flags |

**Derived stats:**
- DPS = `(BASE_DAMAGE * damageMult) / (BASE_COOLDOWN * cooldownMult)`
- For magazine weapons: account for reload time in effective DPS
- Range (world units) = `BASE_WEAPON_RANGE * rangeMult`
- Projectile speed = `BASE_PROJECTILE_SPEED * speedMult * PROJECTILE_SPEED_FACTOR`

**Outlier detection:** Flag DPS or range outliers.

### 4. Module comparison

**Data sources:** `data/modules/engines.js`, `data/modules/reactors.js`, `data/modules/sensors.js`, `data/modules/utilities.js`

**Engine table:**
| Engine | Thrust | Weight | Fuel Eff | Fuel Drain | Power Draw |

**Reactor table:**
| Reactor | Power Out | Fuel Drain | Weight | Overhaul Interval | Overhaul Cost |

**Sensor table:**
| Sensor | Power Draw | Weight | Range | Features |

**Utility table:**
| Utility | Power Draw | Weight | Effect |

### 5. Power budget analysis

**For each named ship:** Calculate total power output (reactors) vs total power draw (engines + weapons + sensors + utilities). Flag ships where draw > output.

### 6. Economy sanity

**Check:**
- Bounty rewards vs difficulty of target (HP + DPS)
- Repair costs vs damage capacity
- Fuel costs vs fuel tank sizes
- Trade commodity margins

## How to Run

1. Read `data/tuning.js` for all `BASE_*` constants
2. Read `data/shipClasses.js` for hull multipliers
3. Read `data/modules/*.js` for module stats (via `MODULE_ENGINES`, `MODULE_REACTORS`, `MODULE_SENSORS`, `MODULE_WEAPONS`)
4. Read hull files in `data/hulls/*/hull.js` for mount points
5. Read ship configs from `data/locations/**/ships/*.js` and `data/ships/player/*.js`
6. Compute derived stats and format tables

## Report Format

```
=== BALANCE REPORT ===

── Ship Classes ────────────────────────────────────────────
| Hull              | HP   | Weight | Cargo | Fuel | Armor F/S/A | Mounts |
|-------------------|------|--------|-------|------|-------------|--------|
| Onyx-Class Tug    | 150  | 1.0    | 80    | 100  | 40/30/20    | 4 (2S/2L) |
| ...               | ...  | ...    | ...   | ...  | ...         | ...    |

OUTLIERS:
  ⚠ garrison-frigate HP (300) is 2.1σ above mean (175)

── Weapons ─────────────────────────────────────────────────
| Weapon     | DPS  | Range | Speed | Mag | Reload | Flags        |
|------------|------|-------|-------|-----|--------|--------------|
| Autocannon | 12.5 | 600   | 400   | ∞   | —      | manual       |
| ...        | ...  | ...   | ...   | ... | ...    | ...          |

OUTLIERS:
  (none)

── Power Budgets ───────────────────────────────────────────
| Ship           | Power Out | Power Draw | Surplus |
|----------------|-----------|------------|---------|
| player-tug     | 160       | 140        | +20     |
| ...            | ...       | ...        | ...     |

WARNINGS:
  ⚠ heavy-patrol: power draw (180) exceeds output (160) — ship will brownout

SUMMARY: X hull outliers, Y weapon outliers, Z power budget warnings
```

## After Reporting

Ask the user: "Any balance adjustments you'd like me to make?" Common fixes:
- Adjust multipliers in `data/shipClasses.js`
- Adjust weapon stats in `data/modules/weapons.js`
- Adjust module stats in `data/modules/*.js`
- Swap modules in ship configs
