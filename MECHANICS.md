# MECHANICS.md — Wayfarer Game Mechanics

This is the single source of truth for implemented and planned game mechanics. No lore, no code architecture. For world/faction context see `LORE.md`. For visual conventions see `UX.md`.

---

## Movement & Throttle

- **6 throttle levels:** Stop, 1/4, 1/2, 3/4, Full, Flank
- **W/S (or ↑/↓):** Step throttle up/down; level persists until changed
- **A/D (or ←/→):** Rotate continuously while held
- Ships have momentum — acceleration and deceleration are gradual, not instant
- **Fuel consumption** by throttle level: free at 1/4, exponential up to 2.5/sec at Flank
- Empty fuel clamps throttle to 1/4 (free crawl)
- Full 360° turn takes ~14 seconds at current stats

---

## Weapons

### Primary Weapons (LMB / Space)

All damage and cooldown values are computed as `BASE_DAMAGE × mult`, `BASE_HULL_DAMAGE × mult`, `BASE_COOLDOWN × mult`. `BASE_DAMAGE=17`, `BASE_HULL_DAMAGE=10`, `BASE_COOLDOWN=1.0s`.

| Weapon | Range | Cooldown | Armor Dmg | Hull Dmg | Notes |
|---|---|---|---|---|---|
| **Autocannon** | 1500u | 1.04s | 17 (×1.0) | — | 60 rounds (6 cargo units); round count shown in HUD; dumbfire bolt, amber tracer trail |
| **Railgun** | 3000u | 6.0s | 180 (×10.6) | 120 (×12) | Blue-white streak, long trail; fixed-mount variant fires along heading |
| **Flak Cannon** | click dist | 1.1/1.8s | 18/28 (×1.06/1.65) | 22/30 (×2.2/3.0) | Detonates at click point (AoE 80/140u); can intercept missiles |
| **Lance** | 250–350u | none | 8→40/sec (×0.47→2.35) | — | Hitscan beam; ramps over 2s; hold LMB; armor-only |
| **Plasma Cannon** | 550/800u | 1.0/1.6s | 8/12 (×0.47/0.71) | 40/60 (×4/6) | Damage falls off with range; hull-heavy |
| **Cannon** | 1400u | 3.0s | 55 (×3.24) | 45 (×4.5) | Slow shell, AoE on contact (120u radius) |

### Auto-Fire Weapons (always-on while F-mode active)

| Weapon | Range | Cooldown | Notes |
|---|---|---|---|
| **Laser Turret** | 1200u | 0.8s | Point defense; 35 armor (×2.06) / 10 hull (×1.0); lead targeting |
| **Gatling Gun** | 500u | 0.06s | Very fast close-range; 4 armor (×0.24) / 2 hull (×0.2); can intercept missiles |

### Secondary Weapons (RMB)

| Weapon | Ammo | Cooldown | Armor | Hull | Notes |
|---|---|---|---|---|---|
| **Rocket** | 6 | 5.0s | 90 (×5.3) | 65 (×6.5) | 1 cargo unit each; HUD: 1 pip + reload bar + count; click-point detonation, friendly fire |
| **Rocket ×5** | 3 sal | 12.0s | 90×5 (×5.3) | 65×5 (×6.5) | 2 cargo units/salvo; HUD: 5 pips + reload bar + salvo count; burst of 5 with 0.18s stagger |
| **Wire Missile** | 6 | 2.5s | 50 (×2.94) | 40 (×4.0) | Mouse-guided; interceptable; AoE 120u |
| **Wire ×3** | 6 | 4.0s | 70 (×4.12) | 55 (×5.5) | Spread of 3; AoE 180u |
| **Heat Missile** | 6 | 3.5s | 55 (×3.24) | 42 (×4.2) | Locks onto nearest enemy; 10s self-destruct; interceptable |
| **Heat ×2** | 6 | 5.0s | 80 (×4.71) | 60 (×6.0) | Staggered burst of 2 |
| **Torpedo** | 3 | 15.0s | 300 (×17.65) | 220 (×22.0) | Fixed-mount (fires along heading); slow; interceptable; AoE 200u |

### Firing Rules

- Player fires indexed weapon only (`onlyActive = true`); AI fires all weapons
- **1/2:** Cycle primary weapon; **3/4:** Cycle secondary weapon (test mode)
- `fireAutoWeapons()` handles all `isAutoFire` weapons (Laser Turret, Gatling)
- Weapons blocked by `_weaponsOffline` flag (hull degradation)

### Projectile Special Behaviors

| Flag | Effect |
|---|---|
| `detonatesOnContact` | AoE when hitting any ship (Cannon) |
| `detonatesOnExpiry` | AoE at target point when range spent (Flak, Rocket) |
| `isGuided + guidedType='wire'` | Steers toward mouse cursor each frame |
| `isGuided + guidedType='heat'` | Steers toward nearest raider; 10s self-destruct |
| `isInterceptable` | Can be shot down by canIntercept weapons |
| `canIntercept` | Intercepts enemy interceptable projectiles within radius 6 |
| `isPlasma` | Damage = full × (1 - distanceTravelled/maxRange) |
| `isBeam` | Lance only; hitscan, rendered by `_renderBeams` |

---

## Damage System

### Quad-Arc Positional Armor

- Each ship has 4 armor arcs: `front`, `port`, `starboard`, `aft`
- Hit arc determined from projectile impact angle relative to ship facing (90° quadrants)
- Damage depletes hit arc; when arc = 0, excess bleeds to hull
- **Aft arc:** 1.5× hull bleed-through; 50% chance to damage engine integrity per hull hit
All arc values computed as `BASE_ARMOR × mult` (`BASE_ARMOR=100`):

| Ship | Front | Port | Starboard | Aft | Mults (F/S/A) |
|---|---|---|---|---|---|
| **OnyxClassTug** (base) | 200 | 150 | 150 | 120 | ×2.0/1.5/1.2 |
| **Hullbreaker** (player) | 140 | 105 | 105 | 84 | 70% of tug |
| **Raider** | 200 | 150 | 150 | 110 | ×2.0/1.5/1.1 |

### Hull Degradation Thresholds

| Hull % | Effect |
|---|---|
| 50% | Engine sputters. **Enemy ships visually darken (black overlay, max 45% opacity at 0%).** **Player sparks begin** (yellow/cyan particles from hull). |
| 40% | **Enemy fire rate begins slowing** — `_fireCooldownMult` scales from 1.0 → 2.0 linearly as hull drops 40%→0% |
| 30% | Engine cutouts; weapons misfire; turn rate reduced. **All ships emit smoke** from engine positions (faster at lower hull). |
| 25% | **Player red edge glow** — screen edges pulse red, faster and brighter toward 0%. |
| 15% | **Engine cap** — all ships limited to 75% max speed (`effectiveSpeedMax × 0.75`). |
| 10% | Further speed reduction: `effectiveSpeedMax × 0.5`. |
| 5% | Barely functional; most weapons offline. Speed ×0.1. |
| 0% | Destroyed |

Smoke emission: `game._updateDamageEffects()` — gray particles from engine offset positions, interval = 0.10 + ratio×0.60 sec. Sparks: player only, 3 particles every 0.2–0.55s. Red edge: `renderer._renderHullWarning()`, pulse speed and intensity scale with damage past 25%.

### Enemy AI Fire Range Gate

Enemy `_doLeadFire()` in `raiderAI.js` reads `weapon.maxRange` before firing. If player distance exceeds weapon range, the shot is skipped. All weapon classes now define `this.maxRange` from `BASE_WEAPON_RANGE × mult`.

### Field Repair (R key)

- Press R to start/stop armor repair (must be at throttle Stop)
- Repairs most-depleted arc first; 1.5 armor/sec; costs 1 scrap per armor point
- Auto-cancels when: full armor, out of scrap, ship moves
- Hull damage cannot be repaired in the field — dock at a station

### Station Repair

- Armor: restores all 4 arcs to maximum (costs scrap)
- Hull: progress bar (~2s); costs 2 scrap/point

---

## Ship Classes

### Base Hull Classes

| Class | File | Speed | Hull | Armor | Cargo | Fuel | Notes |
|---|---|---|---|---|---|---|---|
| **Onyx Class Tug** | `ships/classes/onyxTug.js` | ~46 u/s | 360 hp | F200/S150/A120 | 125u | 80u | Heavy tug; asymmetric hammerhead shape; radius 20 |
| **Maverick Class Courier** | `ships/classes/maverickCourier.js` | ~109 u/s | 170 hp | F100/S100/A85 | 15u | 80u | Everyman fast personal craft; wide muscular body, twin engines; radius 15 |
| **G100 Class Hauler** | `ships/classes/g100Hauler.js` | ~71 u/s | 220 hp | F130/S120/A100 | 175u | 130u | Wide barge deck + raised cab + twin square engine pods at stern; radius 36 |
| **Garrison Class Frigate** | `ships/classes/garrisonFrigate.js` | ~71 u/s | 500 hp | F250/S200/A150 | 75u | 250u | H/I-beam hull; rectangular nacelle pods; radius 54 |

### Player Ship

| Ship | Base Class | Notes |
|---|---|---|
| **Hullbreaker** | Onyx Class Tug | Salvage-modified; armor 70% of tug base; fuel tank ~104u, drain 50% |

### Scavenger Enemy Ships

| Ship | Base Class | Speed | Hull | Behavior | Weapons |
|---|---|---|---|---|---|
| **Light Fighter** | Maverick Class Courier | ~130 u/s | 90 hp | stalker | Autocannon |
| **Armed Hauler** | G100 Class Hauler | ~84 u/s | 200 hp | kiter | Autocannon + Lance-S |
| **Salvage Mothership** | Dec. Frigate | ~50 u/s | 440 hp | standoff | Cannon + Heat Missiles |
| **Grave-Clan Ambusher** | Maverick Class Courier | ~120 u/s | 130 hp | lurker | Autocannon + Heat Missile |

---

## Combat AI

### Raider AI Behaviors

| Behavior | Logic |
|---|---|
| **Shielding** | Orbits player; rotates healthiest arc to face them |
| **Interceptor** | High-speed flanking; targets player's aft arc |
| **Kiter** | Backs away at close range; fires from max range |
| **Stalker** | Positions at player's aft (300u behind); fires only when nose aligns within 0.4 rad |
| **Standoff** | Holds at 1200u; faces player; lobs cannon + missiles when in range |
| **Lurker** | Hides at cover point (spawn); scans for traders within 700u; pounces on nearest trader; switches to player if player engages within 1400u |
| **Flee** | Attempts to escape when hull < 30% |

### AI Distance Constants (from `js/data/stats.js`)

| Constant | Value |
|---|---|
| AGGRO_RANGE | 1400u |
| DEAGGRO_RANGE | 2000u |
| FIRE_RANGE | 800u |
| ORBIT_RADIUS | 550u |
| KITE_RANGE | 750u |
| STANDOFF_RANGE | 1200u |
| STANDOFF_FIRE_RANGE | 1400u |
| LURKER_SCAN_RANGE | 700u |
| LURKER_HIDE_RADIUS | 150u |

Raiders have a `homePosition` and patrol nearby. Aggro at 1400u, deaggro at 2000u.

---

## World & Map

### Gravewake Zone

- **Full map:** 18000×10000 world units
- **Test map:** 8000×5000 (`js/data/testMap.js`)
- **Scale:** 1 world unit = 1 screen pixel (at zoom 1.0; current default zoom 0.44)
- Player enters west; The Coil (hub station) is far east

### Static Terrain

- **ArkshipSpines:** Large wireframe structural beams. 8 on full map (3500–6000u long).
- **DebrisClouds:** Pre-generated fragment fields using golden-angle distribution. 13 on full map.
- **CoilStation:** Massive static terrain structure (~1700×820u). Hub for trade and docking.

### Planet Pale

- Rendered as background element (not an entity) in `Renderer._renderPale()`
- Only the curved limb is visible from the playspace — atmospheric glow + cloud bands
- Full map center: (9000, 22000), radius 14000

---

## Ship Modules

Module slots are defined on each ship as `ship.moduleSlots[]` (array, may contain null for empty slots). Defined in `js/systems/shipModule.js`.

### Module Types

#### Engine Modules (`isEngine = true`)

Engine modules occupy slot 0 and modify `ship.speedMax`, `ship.acceleration`, and `ship.fuelEfficiency` via multipliers applied at install. The ship's class-defined movement stats are frozen as `_baseSpeedMax` / `_baseAcceleration` / `_baseFuelEff` before any module runs; swapping an engine always reverts to those clean bases first.

`fuelEffMult` multiplies the ship's `fuelEfficiency`, which scales the throttle-based fuel drain (`FUEL_RATES[level] × fuelEfficiency`). Higher fuelEffMult = more fuel burned per throttle step.

| Engine | Power | Fuel Drain | Speed Mult | Accel Mult | FuelEff Mult | Notes |
|---|---|---|---|---|---|---|
| **Onyx Drive Unit** | -2W | +0.005/s | ×1.0 | ×1.0 | ×1.0 | Stock baseline — no stat change |
| **Chem Rocket (S)** | -2W | — | ×1.4 | ×1.65 | ×3.5 | Bipropellant; fast & agile; burns fuel fast under throttle |
| **Chem Rocket (L)** | -3W | — | ×1.8 | ×2.3 | ×5.5 | Extreme thrust; burns fuel very rapidly; heavy mount |
| **Mag-Plasma Torch (S)** | -40W | +0.010/s | ×1.1 | ×1.15 | ×1.3 | EM plasma thruster; balanced; constant plasma fuel draw |
| **Mag-Plasma Torch (L)** | -80W | +0.020/s | ×1.25 | ×1.35 | ×1.6 | Heavier plasma drive; solid gains; significant power/fuel load |
| **Ion Thruster** | -120W | +0.002/s | ×0.65 | ×0.12 | ×0.05 | Electric ion drive; slow top speed; abysmal acceleration; near-zero fuel; heavy power draw |

#### Weapon Modules

| Module | Power | Fuel Drain | Effect |
|---|---|---|---|
| **AutocannonMount** | -20W | — | Kinetic hardpoint |
| **LanceMountSmall** | -15W | — | Hitscan beam hardpoint |
| **CannonMount** | -30W | — | Heavy slug hardpoint |
| **MissileMount** | -10W | — | Guided munitions rack |

#### Power Generation

| Module | Power | Fuel Drain | Effect |
|---|---|---|---|
| **H2 Fuel Cell (S)** | +80W | 0.025/s | Small fuel cell; burns fuel at idle continuously |
| **Fission Reactor (S)** | +160W | — | Compact fission core; requires overhaul every 3h at certified stations |
| **Fission Reactor (L)** | +300W | — | Heavy fission plant; requires overhaul every 4h; more power, heavier |
| **Fusion Reactor (L)** | +500W | 0.005/s | Pre-Collapse fusion core; immense output; trace fuel burn; no overhaul |

#### Sensors / Passive

| Module | Power | Effect |
|---|---|---|
| **Salvaged Sensors** | -2W | Stations on minimap |
| **Standard Sensors** | -8W | Ships + stations on minimap; 3000u range |
| **Combat Computer** | -15W | Lead indicators, health pips; 2000u range |
| **Salvage Scanner** | -12W | Salvage detail; 2500u range |
| **Long-Range Sensors** | -20W | 8000u minimap range |

Each module has a `description` string shown in the Ship Status screen.

### Fission Reactor Overhaul

Fission reactors track `timeSinceOverhaul` (seconds). When overdue:
- Power output drops to **60%** of rated output (`+96W` for S, `+180W` for L)
- HUD shows flashing magenta/red `REACTOR OVERHAUL REQUIRED` warning
- Module slot shows power in magenta with `!` suffix
- Tooltip shows `OVERDUE — output degraded`

**To overhaul:** Dock at a station with `canOverhaulReactor: true` (currently **Ashveil Anchorage**). A button appears in the Services tab. Click to pay the overhaul cost — reactor resets to full output. Overhaul can also be performed early (before overdue) to reset the timer.

| Reactor | Interval | Cost |
|---|---|---|
| Fission (S) | 3 hours | 800 scrap |
| Fission (L) | 4 hours | 1500 scrap |

### Per-Ship Slot Configuration

Ships have **5 module slots**. Slot 0 is always the engine.

| Ship | Slots |
|---|---|
| **Hullbreaker** | OnyxDriveUnit, AutocannonMount, HydrogenFuelCell, SalvagedSensorSuite, _empty_ |
| **LightFighter** | AutocannonMount, _empty_ |
| **ArmedHauler** | AutocannonMount, LanceMountSmall, _empty_ |
| **SalvageMothership** | CannonMount, MissileMount, _empty_, _empty_ |

Fuel cell idle drain is processed in `game._consumeFuel()` even at throttle Stop.

---

## Ship UI Screen (I key)

Press **I** to toggle the Ship Status overlay. Closes with **I** or **Esc**. Pauses simulation while open.

Three-column layout:
- **Left panel**: Hull, armor arcs (F/P/S/A values), drive stats (speed/fuel), economy (scrap w/ cargo units), module slots (5) with descriptions, power balance, idle fuel burn
- **Center panel**: Paper doll — ship silhouette (×4 scale) drawn first, then armor arc rings at R=145 (inner edge 138px clears bow at 104px); each arc label shows letter + cur/max health; hull ratio bar below
- **Right panel**: Cargo bay (dynamic list — scrap + any cargo with qty > 0, or "empty"), capacity bar, active weapon list

Implemented in `js/ui/shipScreen.js`. Rendered by `hud.js` after station screen. `[I] SHIP` hint shown in HUD left panel below scrap readout.

---

## Economy

- **Scrap** is the sole currency — no credits. **20 scrap = 1 cargo unit** (scrap takes hold space)
- **Fuel** drives movement; tank size and drain rate are per-ship (`ship.fuelMax`, `ship.fuelEfficiency`). Hullbreaker: ~104 unit tank, 50% drain rate. Can be bought at stations.
- Scrap earned by: destroying enemies, salvaging derelicts, selling commodities
- **Ammo takes cargo space**: Autocannon rounds: 0.1 cu/round (10 rds = 1 cu); Rockets: 1 cu each; Rocket×5 pods: 2 cu/salvo; Missiles (heat/wire): 1 cu each. Cargo bar includes ammo weight.

### Commodities

15 specific commodities defined in `js/data/commodities.js`. Trade screen shows only rows with supply ≠ `none` or qty > 0.

| ID | Display Name | Base Price | Notes |
|---|---|---|---|
| `ration_packs` | Ration Packs | 12 | Preserved food tins |
| `recycled_polymer` | Recycled Polymer | 25 | Reclaimed plastics, cheap bulk good |
| `bio_cultures` | Bio-Cultures | 38 | Agricultural/pharma organisms |
| `alloys` | Alloys | 50 | Refined metal stock |
| `machine_parts` | Machine Parts | 65 | Mechanical components |
| `hull_plating` | Hull Plating | 70 | Structural steel panels |
| `electronics` | Electronics | 85 | Circuit boards, sensors, salvaged components |
| `raw_ore` | Raw Ore | 90 | Unrefined metal ore |
| `medical_supplies` | Medical Supplies | 100 | Pharma and trauma kits |
| `reactor_fuel` | Reactor Fuel | 125 | Fission rods/isotopes |
| `weapons_cache` | Weapons Cache | 155 | Unassembled weapon components |
| `nav_charts` | Navigation Charts | 175 | Pre-Collapse star charts |
| `data_cores` | Data Cores | 200 | Pre-Collapse archive modules |
| `contraband` | Contraband | 260 | High-risk illegal goods |
| `void_crystals` | Void Crystals | 320 | Unknown crystalline material (was Exotics) |

### Supply & Demand Pricing

| Supply Level | Price Modifier |
|---|---|
| `surplus` | 0.5× base |
| `high` | 0.7× base |
| `medium` | 1.0× base |
| `low` | 1.5× base |
| `deficit` | 2.0–2.5× base |
| `none` | Cannot buy (can still sell at high price) |

---

## Stations & Docking

- Press **E** within docking radius to dock
- Docking pauses simulation (`isDocked = true`)
- **Services tab:** Armor repair (1 scrap/pt), hull repair (2 scrap/pt), refuel (1 scrap per 2 fuel)
- **Trade tab:** Buy/sell commodities for scrap
- **Intel tab:** Lore text per station (only shown when `station.lore` is populated)
- **Bounties tab:** Kill contracts posted per station (only shown when contracts exist or are active)
- Press **Esc** or **E** to undock

---

## Bounty Board

- Each station has a `bounties[]` list populated from map data
- **Bounties tab** appears in the station screen only when contracts are available or active for that station
- **Kill contracts**: Hunt a named enemy ship; target spawns at a fixed position when contract is accepted
  - Target has a unique `displayName` shown in kill log on death
  - `isBountyTarget = true` — does not respawn after death
- **Accepting a contract**: removes it from AVAILABLE; spawns the target ship; adds to YOUR CONTRACTS list
- **Completion**: Killing the target sets `status = 'completed'`; "Bounty Complete: +N scrap" HUD text fires
- **Collection**: On next dock at the posting station, completed bounties pay out scrap automatically
- **Expiry**: Each contract has an `expirySeconds` timer. Timer shown in YOUR CONTRACTS; flashes RED below 60s. Expired contracts deactivate the target ship; contract is cleared on next dock.
- `game.activeBounties[]` — tracked alongside raiders; each entry has `{ contract, stationId, acceptedAt, expiryTime, status, targetEntity }`
- `BOUNTY.EXPIRY_WARNING_SECS = 60` in `js/data/stats.js`

---

## Reputation System

`game.reputation` is a `ReputationSystem` instance (`js/systems/reputation.js`). Tracks a standing value per faction ranging -100 to +100. Default: 0 (Neutral).

### Factions

| Key | Label |
|---|---|
| `settlements` | Settlements |
| `scavengers` | Scavenger Clans |
| `concord` | Concord Remnants |
| `monastic` | Monastic Orders |
| `communes` | Communes |
| `zealots` | Zealots |

### Standing Levels

| Range | Level | Effect |
|---|---|---|
| ≤ -50 | **Hostile** | Docking refused |
| -50 to -10 | **Wary** | — |
| -10 to +10 | **Neutral** | — |
| +10 to +50 | **Trusted** | — |
| ≥ +50 | **Allied** | 15% discount on services |

### Triggers

| Action | Change |
|---|---|
| Kill enemy ship (faction X) | −10 to faction X |
| Kill scavenger/concord | +5 to Settlements (rival bonus) |
| Collect bounty at station | +20 to station's faction |
| Player projectile hits neutral ship | −25 to Settlements |

### Mapping

Station/ship `.faction` strings map to reputation faction keys via `FACTION_MAP` in `js/systems/reputation.js`. E.g. `salvage_lords` → `scavengers`, `neutral` → `settlements`.

### Station Integration

- Each station has a `reputationFaction` property computed at construction
- Station screen header shows standing level + numeric value (color-coded)
- **Relations tab** lists all 6 factions with their current level and value
- Service costs (armor repair, hull repair, refuel) apply 15% discount when Allied
- Docking refused if standing ≤ -50; "DOCKING REFUSED" HUD text appears in RED

### Constants (`js/data/stats.js`)

`REPUTATION.KILL_PENALTY = -10`, `RIVAL_BONUS = 5`, `BOUNTY_BONUS = 20`, `ATTACK_NEUTRAL_PENALTY = -25`, `HOSTILE_THRESHOLD = -50`, `ALLIED_THRESHOLD = 50`, `DISCOUNT_RATE = 0.15`

---

## Salvage

- Press **E** near a derelict to begin salvage
- Progress bar fills over 2–4 seconds; player is frozen during salvage (vulnerable)
- **E** or **Esc** cancels salvage
- Completion spawns loot drops from the derelict's loot table; derelict is removed
- State on `GameManager`: `isSalvaging`, `salvageProgress`, `salvageTarget`

### Derelict Classes

4 hull classes with distinct polygon shapes and HUD lore text:

| Class | Shape | Color | Loot Focus |
|---|---|---|---|
| **hauler** | 8-point octagon (wide) | warm rust `#886633` | Fuel, commodities, ammo, HydrogenFuelCell |
| **fighter** | 7-point dart (narrow, pointed fore) | muted green-grey `#667744` | Weapon drops, autocannon/missile ammo |
| **frigate** | 12-point H/I-beam | muted blue-grey `#556688` | Heavy weapons (Cannon), reactors, mixed cargo |
| **unknown** | 9-point asymmetric | MAGENTA | Exotics, rare modules (LargeFusionReactor), minimal fuel |

First lore line shown in HUD approach prompt (dim, above the amber "Press E" text).

### Module Condition System

Modules salvaged from derelicts have a **condition** property affecting effectiveness:

| Condition | Multiplier | Color |
|---|---|---|
| **good** | ×1.00 | GREEN |
| **worn** | ×0.85 | AMBER |
| **faulty** | ×0.65 | orange |
| **damaged** | ×0.35 | RED |
| **destroyed** | ×0.00 | VERY_DIM — converts to scrap on pickup |

- Power modules: `effectivePowerOutput` scales by `conditionMultiplier`
- Weapon modules: damage/hullDamage scaled on install via `_applyConditionToWeapon()`
- Condition badge shown in Ship Screen installed slot and cargo pill
- Tooltip shows CONDITION row (colored) + MULT row if not 'good'

Condition roll distribution per derelict class:
- **hauler**: worn 50%, faulty 35%, damaged 15%
- **fighter**: worn 40%, faulty 40%, damaged 20%
- **frigate**: good 20%, worn 40%, faulty 30%, damaged 10%
- **unknown**: worn 30%, faulty 30%, damaged 30%, destroyed 10%

### Hull Breach — Module Damage

When the player takes hull damage while hull is below 60%, each hit has a chance to degrade a random installed module by one condition step.

| Hull range | Breach chance per hit |
|---|---|
| 30–60% | 12% |
| 10–30% | 25% |
| < 10%  | 40% |

- Only applies when hull damage is actually dealt (not pure armor hits)
- Picks a random installed module that isn't already 'destroyed'
- Condition steps: good → worn → faulty → damaged → destroyed
- Weapon modules reapply `_applyConditionToWeapon()` immediately (damage rescaled)
- HUD: floating orange text `"MODULE_NAME CONDITION"` at the player's position

### Field Module Repair

Press **R** when stopped (throttle 0) to start repair mode. Armor and module repair run simultaneously.

| Type | Rate | Cost |
|---|---|---|
| Armor | 1.5 pt/sec | 1 scrap/pt |
| Module condition step | 0.25 steps/sec (4 sec/step) | 15 scrap/step |

- Module repair always targets the worst-condition installed module first
- Steps upward: destroyed → damaged → faulty → worn → good
- HUD shows an orange "MODULE REPAIR..." bar above the green armor bar when modules need repair
- Repair prompt updated to list both costs when applicable
- Auto-cancels when both armor is full and no modules need repair, or scrap runs out

### New Loot Types from Derelicts

- **Weapon drop** (MAGENTA diamond) — unequipped weapon instance stored in `game.weapons[]`; shown in WEAPONS (CARGO) section of Ship Screen
- **Ammo drop** (GREEN diamond) — adds to `game.ammo[ammoType]` reserve pool; HUD pickup text shows "+N Type Ammo"
- **`ammoType` metadata** added to all ammo-consuming weapons (autocannon, cannon, rocket, rocket-large, missile) — no behavior change, wires future ammo pool system

---

## HUD / UI Mechanics

- **Status Box (90×90):** 4 colored arc segments (proportional to armor), center hull fill, arc labels F/A/P/S. Flashes white 150ms on hit.
- **Integrity row:** `[R][E][S]` — reactor, engine, sensor integrity indicators
- **Weapon readout:** Active primary name + cooldown bar; active secondary name + ammo pips
- **Throttle:** Row of 6 discrete pips; active pip filled cyan
- **Fuel bar:** Segmented amber/red bar (top-right)
- **Scrap / Cargo:** Text readouts top-right
- **Minimap:** Bottom-right; scale 0.0075×; player crosshair, stations (white squares), enemies (red dots), derelicts (amber squares), loot (amber dots)
- **Context prompts:** Dock / Salvage prompts pulse in green/amber near valid targets
- **Auto-fire indicator:** Pulsing `AUTO-FIRE` text in bottom-left when F-mode is active

---

## Neutral Traffic

### Trade Convoys
- `TraderConvoy` ships (`js/ships/neutral/traderConvoy.js`) — G100 Class Hauler base, `relation = 'neutral'`, no weapons
- State machine: `'traveling'` ↔ `'waiting'`. Reads `_tradeRouteA` / `_tradeRouteB` (set at spawn).
- Steers toward target; throttle 3 underway, throttle 1 within 400u, throttle 0 within 120u. Waits 5–8s then swaps endpoints.
- Three routes: West→Kell's Stop, Kell's Stop→The Coil, The Coil→Ashveil Anchorage
- Ships staggered along route at spawn (t = i / shipCount)

### Militia Patrols
- `MilitiaPatrol` ships (`js/ships/neutral/militiaPatrol.js`) — Dec Frigate base, `relation = 'neutral'`, no weapons
- Reads `_orbitCenter`, `_orbitRadius`, `_orbitSpeed`, `_orbitAngle` (set at spawn).
- Advances `_orbitAngle` each tick; steers toward computed orbit point; throttle 3 if dist > 100, else throttle 2
- Two patrol rings around The Coil: inner (600u, 2 ships, 0.12 rad/s) and outer (1200u, 1 ship, 0.07 rad/s)

### Neutral AI (`js/ai/neutralAI.js`)
- `updateNeutralAI(ship, dt)` — dispatches on `ship.neutralBehavior` ('trader' or 'militia')
- Called in `GameManager.update()` after the raider AI loop
- `GameManager.neutralShips[]` tracks all neutral ships; purged alongside `raiders[]`
- Loot guard: neutral ships drop no loot on death (`target.relation !== 'neutral'` check in collision branches)

### New Stations
| Station | Position | Services | Faction |
|---|---|---|---|
| Kell's Stop | (5500, 3800) | fuel, repair | neutral (fuel_depot renderer) |
| Ashveil Anchorage | (16000, 5000) | repair, trade | neutral |

---

## Planned (Phase 2+)

### A: Trade Convoy Combat
Scavengers attack trade convoys; player can defend for reputation/reward. Player can also attack convoys for cargo. (Partially implemented: Grave-Clan Ambushers already attack traders via lurker AI.)

### B: Grave-Clan Lurker AI — IMPLEMENTED
Grave-Clan Ambushers hide at their spawn (cover point), scan for traders within 700u, pounce at full speed, and switch to the player if they get within 1400u. Flee below 30% hull.

### C: Dormant Ark-Module Salvage
High-risk timed extraction events on dormant ark debris. Player must stay in range while progress fills. Triggers enemy spawns mid-salvage. High loot value.

### Other Planned
- Nebulae with sensor/speed penalties
- Save/load system
- Bounty board at stations
- Dynamic price fluctuation based on player activity
