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
| **Autocannon** | 1500u | 1.04s | 17 (×1.0) | — | Dumbfire bolt, amber tracer trail |
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
| **Rocket** | 6 | 5.0s | 90 (×5.3) | 65 (×6.5) | AoE 280u at click point; friendly fire |
| **Rocket ×5** | 3 sal | 12.0s | 90×5 (×5.3) | 65×5 (×6.5) | Burst of 5 with 0.18s stagger |
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
| 75% | Cosmetic flicker |
| 50% | Engine sputters; turret rotation slows |
| 30% | Engine cutouts (1–2s); weapons misfire ~20%; turn rate reduced |
| 15% | Minimal thrust; weapons misfire ~40%; may lose one weapon |
| 5% | Barely functional; most weapons offline |
| 0% | Destroyed |

Applies to all ships — player and enemy alike.

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
| **Swift Runner** | `ships/classes/swiftRunner.js` | ~134 u/s | 120 hp | F120/S80/A70 | 10u | 60u | Fast personal craft; needle shape; radius 12 |
| **G100 Class Hauler** | `ships/classes/g100Hauler.js` | ~71 u/s | 220 hp | F130/S120/A100 | 175u | 130u | Boxy cargo ship; twin engines; radius 17 |
| **Decommissioned Frigate** | `ships/classes/decFrigate.js` | ~71 u/s | 500 hp | F250/S200/A150 | 75u | 250u | Long military hull; twin engine pods; radius 24 |

### Player Ship

| Ship | Base Class | Notes |
|---|---|---|
| **Hullbreaker** | Onyx Class Tug | Salvage-modified; armor 70% of tug base; fuel tank ~104u, drain 50% |

### Scavenger Enemy Ships

| Ship | Base Class | Speed | Hull | Behavior | Weapons |
|---|---|---|---|---|---|
| **Light Fighter** | Swift Runner | ~130 u/s | 90 hp | stalker | Autocannon |
| **Armed Hauler** | G100 Class Hauler | ~84 u/s | 200 hp | kiter | Autocannon + Lance-S |
| **Salvage Mothership** | Dec. Frigate | ~50 u/s | 440 hp | standoff | Cannon + Heat Missiles |

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

## Economy

- **Scrap** is the sole currency — no credits
- **Fuel** drives movement; tank size and drain rate are per-ship (`ship.fuelMax`, `ship.fuelEfficiency`). Hullbreaker: ~104 unit tank, 50% drain rate. Can be bought at stations.
- Scrap earned by: destroying enemies, salvaging derelicts, selling commodities

### Commodities

| Commodity | Typical Sources | Typical Consumers |
|---|---|---|
| **Food** | Agricultural moons, farming settlements | Mining settlements, military outposts |
| **Ore** | Mining settlements, boneyard outposts | Industrial moons, shipyards |
| **Tech** | Industrial moons, Monastic archives | Frontier settlements, military outposts |
| **Exotics** | Void fauna drops, derelict salvage | Wealthy settlements, Zealot shrines |

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
- Press **Esc** or **E** to undock

---

## Salvage

- Press **E** near a derelict to begin salvage
- Progress bar fills over 2–4 seconds; player is frozen during salvage (vulnerable)
- **E** or **Esc** cancels salvage
- Completion spawns loot drops from the derelict's loot table; derelict is removed
- State on `GameManager`: `isSalvaging`, `salvageProgress`, `salvageTarget`

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

## Planned (Phase 2+)

### A: Trade Convoys & Militia Patrols
NPC convoy ships travelling between stations on trade lanes. Militia patrol ships guarding lanes near The Coil. Player can attack, defend, or escort.

### B: Grave-Clan Lurker AI
Scavenger raiders hiding behind ArkshipSpines and DebrisClouds, ambushing passing ships. Behavior: wait in cover, aggro on proximity, use terrain to break line-of-sight.

### C: Dormant Ark-Module Salvage
High-risk timed extraction events on dormant ark debris. Player must stay in range while progress fills. Triggers enemy spawns mid-salvage. High loot value.

### Other Planned
- Nebulae with sensor/speed penalties
- Save/load system
- Bounty board at stations
- Dynamic price fluctuation based on player activity
