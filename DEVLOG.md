# Wayfarer — Development Log

## Test Harnesses — 2026-03-07

**Files:** `js/main.js`, `js/test/shipDesigner.js`, `js/test/poiDesigner.js`, `js/game.js`, `js/hud.js`, `CLAUDE.md`

- **`?test-ships`** — Ship Designer harness. Left stats panel (hull, armor arcs, movement, weapons), right canvas renders ship at 7× scale via direct `_drawShape()` call. `←/→` cycles all 5 ships, `T` toggles auto-rotation. No Camera needed — plain `ctx.scale()` + `ctx.rotate()`.
- **`?test-poi`** — POI Designer harness. Mock camera (world 0,0 = preview center) renders stations, planets, derelicts, arkship spines, debris clouds. Scroll zoom, drag pan, `R` to reset view. Left info panel shows type-specific fields.
- **`?test` enhancements** — Added dev spawn controls: `Z`/`X`/`C` spawn shielding/kiter/interceptor raider at mouse cursor with `_aggro = true`. `Q` toggles LaserTurret on player. Dev controls shown in top-right HUD panel (amber key legend + current weapon list). `LaserTurret` imported into `game.js`.
- Routed new URL params in `main.js` (`?test-ships`, `?test-poi`). Harnesses implement `update(dt)` / `render()` — compatible with existing `startLoop`.
- Updated `CLAUDE.md` with full Test Modes section covering all three harnesses.

## Station Intel Tab — 2026-03-07

**Files:** `js/ui/stationScreen.js`, `js/data/map.js`, `js/data/testMap.js`

- Added `lore` field to station data (array of pre-wrapped strings).
- `StationScreen` gains a third tab "Intel" — only shown when `station.lore` is non-empty.
- `_renderIntelTab()` renders lore lines at 11px monospace; blank strings become half-height gaps; lines starting with `[` or in all-caps are rendered in the faction accent color, body text in `DIM_TEXT`.
- Tab widths reduced from 125→110 to accommodate three tabs. `panelH = 530` when Intel is active.
- The Coil's lore covers all four districts: Market, The Pits, Shipyard, The Vault.

---

## Gravewake: Scale & Balance Tuning — 2026-03-07

**Files:** `js/world/coilStation.js`, `js/data/map.js`, `js/data/testMap.js`, `js/renderer.js`

- **The Coil scaled to ~1 screen** (~1700×820 wu). All local district coordinates scaled down ~×0.45. `dockingRadius` 1100, `getBounds()` radius 1000.
- **No enemies at The Coil.** Raiders moved to hidden dens on the west side of the map (opposite The Coil). Full map: dens at (3200,2200) and (2800,7500). Test map: dens at (900,4000) and (2000,4200) — south of player start.
- **Pale more opaque:** planet body fill alpha 0.18→0.48; limb outline 0.55→0.80. Atmospheric halo kept light and transparent (colorAtmo, alpha 0.12–0.18). Cloud band alpha 0.04→0.10.

---

## Gravewake: Full Zone Redesign — 2026-03-07

**Files:** `js/world/coilStation.js`, `js/data/map.js`, `js/data/testMap.js`, `js/renderer.js`, `SPEC.md`

### World Scale & Tone
- **Map reframed as a finite zone** — `Gravewake` only. No galaxy, no old stations, no small-icon planets.
- **1 world unit = 1 screen pixel** (no zoom). Structures must be drawn at true navigational scale.
- All old stations (Keelbreak, Crucible, Thornwick) and all small planet icons removed from map.

### The Coil (CoilStation complete redesign)
- Replaced rotating-hauler icon with a massive static terrain structure: ~3750 wide × ~1800 tall (≈2×2 screens).
- **Districts drawn in local canvas space:** Port Freight Deck (MARKET), Central Hub (THE PITS), Starboard Shipyard Wing, The Vault (east, reinforced, cross-braced), North Market Annex (BAZAAR), South Shipyard Annex, Crane Tower A (860u tall) + Tower B + Crane Boom.
- Interior detail: structural ribs, room partitions, window strips, antennae, comms dish, guard posts on Vault corners.
- Docking bays: 3 open notches south of Port Deck, 2 south of Starboard Wing.
- Approach lights: 10 pulsing amber dots leading west.
- `dockingRadius: 2400` — dock from anywhere near the structure.
- `getBounds()` radius 2200 — prevents culling while any part is on screen.

### Planet Pale
- Removed as a small entity. Now rendered as background element in `Renderer._renderPale()`.
- Center at world (9000, 22000) / test (4000, 13000) with radius 14000/9000.
- Only the curved planetary limb is visible from the playspace — atmospheric glow + cloud band striations + bright limb outline. Canvas clips the off-screen circle automatically.
- Rendered in `_renderBackground(game, camera)`, called between starfield atmosphere and entities.
- Map data: `background: [{ type: 'pale', ... }]` — not an entity, not spawned.

### Map (Gravewake zone)
- Full map: 18000×10000. Player enters west at (2000,5000). The Coil at (13000,4500).
- 8 Arkship Spines: 3500–6000 units long, 175–300 wide.
- 13 Wall of Wrecks debris clouds: spread radius 680–760, fragment count 42–50. Two trade lane gaps.
- 6 named derelicts scattered throughout.
- 3 raiders spawn near The Coil.

### Test Map
- 8000×5000. Player at (600,2500). The Coil at (5000,1800) — full-size structure, ~5 screens east.
- 4 spines, 6 debris clouds, 3 derelicts, Pale background. Zone radius 4500.
- 17 TEST_STEPS updated to match new world.

---

## Gravewake Phase 1: Foundation — 2026-03-07

**Files:** `js/world/arkshipSpine.js` (new), `js/world/debrisCloud.js` (new), `js/world/coilStation.js` (new), `js/data/map.js`, `js/game.js`, `js/renderer.js`, `js/data/testMap.js`, `SPEC.md`

### Phase 1: Static Terrain & Hub Station
- **`arkshipSpine.js`** — New `Entity` subclass. Renders as a large wireframe structural beam with outer hull outline, longitudinal spine, vertical ribs, and diagonal X-bracing. Props: `length`, `width`, `rotation`. Culling via circumscribed-circle `getBounds()`.
- **`debrisCloud.js`** — New `Entity` subclass. Pre-generates `fragmentCount` fragment positions using golden-angle deterministic distribution within `spreadRadius`. Each fragment is an elongated pentagon rendered at `VERY_DIM` @ 0.35 alpha.
- **`coilStation.js`** — `Station` subclass. 4 cargo hauler rects rotate at 0.08 rad/s around a central hex hub (amber, dark fill). Blinking nav lights follow rotation. Station name in AMBER at y+72. `dockingRadius` 180. Faction `salvage_lords`.
- **`map.js`** — Added `zones[]` (Gravewake, center 15000,9000, radius 5000), `arkshipSpines[]` (8 entries), `wallOfWrecks[]` (18 debris cloud positions with 3 trade lane gaps), and The Coil station with `renderer: 'coil'`.
- **`game.js`** — Imports 3 new creators. Station loop checks `renderer === 'coil'` to use `createCoilStation`. Two new spawn loops for spines and debris clouds. Passes `map.zones` to `Renderer`.
- **`renderer.js`** — Constructor accepts `zones` arg. Pre-generates 300 Gravewake micro-debris fragments (golden-angle, parallax 0.15–0.4, size 2–5px). `_renderGravewakeAtmosphere(camera)` fades alpha 0→0.36 over 1000u inside zone boundary; fragments use parallax wrap. Called between starfield and entities.
- **`testMap.js`** — The Coil at (2400,800), 2 Arkship Spines, 6 Wall of Wrecks clouds with gap, Gravewake zone. 4 new TEST_STEPS for Gravewake features.
- **`SPEC.md`** — §18 "Gravewake Orbital Zone" added.

---

## Combat2 Overhaul — 2026-03-07

**Files:** `js/entities/ship.js`, `js/ships/player/flagship.js`, `js/enemies/scavengers/raider.js`, `js/game.js`, `js/hud.js`, `js/ai/raiderAI.js`, `js/ui/stationScreen.js`, `js/systems/particlePool.js`, `js/weapons/rocket.js` (new), `js/data/testMap.js`, `js/data/testConfig.js`, `SPEC.md`, `docs/combat2.spec.md`

### Phase 1: Quad-Arc Positional Armor
- **`ship.js`** — Replaced flat `armorMax/armorCurrent` with `armorArcs`/`armorArcsMax` object (`front/port/starboard/aft`). Computed getter backward-compat. `_getImpactArc(hitX, hitY)` determines hit arc from projectile position relative to ship facing. `takeDamage()` now takes optional `hitX, hitY`; aft hits apply 1.5× hull bleed and 50% engine integrity damage. Hull degradation: random `_engineCutout` and `_weaponsOffline` flags computed per tick based on hull %.
- **`flagship.js`** — `armorArcsMax`: front 120 / port 90 / starboard 90 / aft 70.
- **`raider.js`** — `armorArcsMax`: front 50 / port 35 / starboard 35 / aft 25. Added `behaviorType = 'shielding'`.
- **`game.js`** — Collision passes `proj.x, proj.y` to `takeDamage`. `_updateRepair` repairs most-depleted arc first. Rocket import + `_addRockets` option. RMB input fires secondary weapons. Rocket trail particles emitted per active rocket entity. `behaviorType` propagated from spawn data to raider.
- **`stationScreen.js`** — Armor repair restores all 4 arcs.
- **`hud.js`** — Replaced ARMOR + HULL bars with 90×90 Square Status Box: 4 colored arc segments (fills proportional to armor), center hull fill (bottom-to-top), arc labels (F/A/P/S). Flash white 150ms on hit. Integrity row `[R][E][S]` below. Rocket ammo pips (MAGENTA) + cooldown `...` indicator. Kept FUEL, CARGO, SCRAP readouts below.

### Phase 2: Tactical AI Behaviors
- **`raiderAI.js`** — Strategy dispatch: `shielding` (orbits + rotates best arc toward player), `interceptor` (flanks to player's aft), `kiter` (backs off at <400u, fires at range). `_doLeadFire` extracted as shared helper. Flee behavior preserved across all types.

### Phase 3: Rockets
- **`rocket.js`** — New secondary weapon: 6 ammo, 35 armor damage, 25 hull damage, 2.0s cooldown, 550 speed, 900 range. MAGENTA streak projectile.
- **`particlePool.js`** — Added `rocketTrail(x,y)` (magenta puffs) and `rocketImpact(x,y)` (30 particles + 2 large expanding rings).
- **`testConfig.js`** — `addRockets: true` equips player with rockets in test mode.

### Docs
- `SPEC.md` §4.1, §4.3, §6.3, §14.1 updated with arc armor schema, weapon table, and status box description.
- `docs/combat2.spec.md` marked as superseded (merged).

---

## Phase 1: Engine

**Files:** `js/camera.js`, `js/renderer.js`, `js/loop.js`, `js/input.js`, `js/main.js`, `js/entities/entity.js`, `js/entities/ship.js`, `js/ships/player/flagship.js`, `js/data/map.js`

### Implemented
- **Canvas game loop** — fixed-timestep loop via `startLoop()` in `loop.js`; drives `update(dt)` and `render()` each frame
- **Camera** — world-to-screen / screen-to-world transform; smooth follow with exponential lerp (`camera.follow(target, dt)`); `isVisible()` for culling
- **Input handler** — keyboard hold (`isDown`), just-pressed (`wasJustPressed`) per-tick; mouse position + buttons; `mouseWorld(camera)` helper
- **Starfield renderer** — three parallax layers (200/100/50 stars) that wrap across the screen as the camera moves
- **Entity base class** — `x, y, rotation, active`, overridable `update/render/getBounds/onDestroy`
- **Ship base class** — armor + hull health; 5-level throttle system; `takeDamage()` (armor absorbs first); crew/cargo fields; `fireWeapons()`
- **Flagship** — 5-point hull polygon, engine glow that brightens with throttle, 22px collision radius; crew 12/20

---

## Phase 2: Combat

**Files:** `js/entities/projectile.js`, `js/entities/particle.js`, `js/systems/particlePool.js`, `js/weapons/laserTurret.js`, `js/enemies/pirates/raider.js`, `js/ai/raiderAI.js`, `js/hud.js`, `js/game.js`

### Implemented
- **LaserTurret** — 0.25s cooldown; fires `Projectile` toward mouse cursor; `maxRange` 350 units
- **Projectile** — velocity-driven entity; deactivates on range expiry or hit; rendered as a short line segment
- **Particle + ParticlePool** — 200-slot object pool; generic `emit()` with color, speed, spread, life options; `explosion()` preset; `engineTrail()` preset
- **Raider ship** — 5-point hull, red color scheme; 60 hull / 40 armor; faster turn rate than flagship
- **Raider AI** (`raiderAI.js`) — approach player until within 200u, then orbit at that range; auto-fires when within firing range
- **Collision system** (`_runCollisions`) — projectile vs ship AABB-circle check; hit spark (5 particles); ship destroy explosion (20 particles)
- **HUD** — ARMOR bar (cyan, flashes red <25%) and HULL bar (orange, flashes red <25%); 5-pip throttle indicator with label + speed readout

---

## Phase 3: World & Stations

**Files (new):** `js/world/station.js`, `js/world/planet.js`, `js/ui/stationScreen.js`
**Files (modified):** `js/data/map.js`, `js/entities/ship.js`, `js/game.js`, `js/hud.js`, `js/input.js`

### Implemented
- **Station entity** — hexagonal geometry (28px radius), faction-colored (neutral `#4af`, independent `#8f4`, military `#f84`); outer glow ring; 4 docking arms; blinking nav lights every 0.8s; `dockingRadius: 150`
- **Planet entity** — radial gradient filled circle; name label below; radius in world-units = pixels on screen (no zoom)
- **Map data populated** — 3 stations (Haven Station, Frontier Outpost, Bastion) + 3 planets (Verdant, Arid, Glacius) live in `MAP`
- **World entity spawning** — `init()` iterates `map.stations` / `map.planets` and pushes entities; rendered via existing `_renderEntities` pipeline
- **Credits economy** — `game.credits` starts at 500; killing a raider awards 50–149 cr at the collision site
- **Crew armor repair** — `crewRepairRate: 0.5` armor/sec/crew added to `Ship`; auto-ticks in `Ship.update(dt)` while armor is below max
- **Engine trails** — `_emitEngineTrails()` called each frame; emits `particlePool.engineTrail()` from the rear of every moving Ship (speed > 5 u/s)
- **Docking system** — `_checkDocking()` sets `nearbyStation` each frame; E-key opens `StationScreen` and sets `isDocked = true`; `isDocked` causes `update()` to skip simulation
- **StationScreen overlay** — full-screen dark backdrop; 400×320 panel with faction border; shows station name, credit balance, Repair Hull button (cost = hull deficit × 2, greyed if insufficient credits), Close button; closes on Esc or E
- **Input: `wasJustClicked()`** — pending-click flag flushed each tick, mirrors `wasJustPressed` pattern
- **HUD additions:**
  - Credits readout — top-right, `#fd8` color
  - Dock prompt — bottom-center above throttle bar, `#4fa`, shown only near a station
  - Minimap — 150×150px panel bottom-right; scale 0.0075× (full 20000u world); player crosshair, station squares, planet circles, raider red dots; clipped to panel

---

## Phase 4: Trade Economy

**Files (new):** `js/data/commodities.js`
**Files (modified):** `js/data/map.js`, `js/world/station.js`, `js/game.js`, `js/ui/stationScreen.js`, `js/hud.js`

### Implemented
- **Commodity data** — 4 tradeable goods (food, ore, tech, exotics) with base prices; 6 supply levels (surplus → none) with price multipliers; buy/sell price functions with 10% sell margin
- **Station commodity supply** — each station has distinct supply levels creating trade routes: Haven has cheap food, Frontier has cheap ore, Bastion needs tech; exotics rare everywhere
- **Cargo system** — `game.cargo` tracks per-commodity quantities; capacity limited by ship's `cargoCapacity` (flagship: 100)
- **HUD cargo indicator** — top-right below credits; shows `Cargo X/Y`; turns orange when full
- **Station screen tabs** — Services / Trade tab bar with underline indicator; panel expanded to 380px height
- **Trade UI** — commodity table with item name, price, quantity, Buy/Sell buttons; buttons gray out when unavailable (no supply, can't afford, cargo full, zero quantity); 1 unit per click
- **Trade routes** — buy food at Haven (7 cr) → sell at Frontier (14 cr); buy ore at Frontier (40 cr) → sell at Haven (108 cr); tech cheapest at Haven, most expensive at Bastion

---

## QoL & Polish Pass

**Files (modified):** `js/game.js`, `js/ai/raiderAI.js`, `js/ai/fleetAI.js`, `js/ships/player/frigate.js`, `js/ships/player/gunship.js`, `js/ships/player/hauler.js`, `js/data/testMap.js`

### Implemented
- **Arrow keys + spacebar** — Arrow keys work as alternate to WASD; spacebar fires weapons (same as LMB)
- **Test mode starting credits** — 2000 credits in test mode (vs 500 normally) for easier fleet testing
- **Enemy lead aiming** — Raiders now predict player velocity and aim ahead instead of at current position
- **Fleet ship colors** — All player fleet ships (frigate, gunship, hauler) now use the same blue color scheme as the flagship; shape alone differentiates ship types
- **Tighter fleet formation** — Formation offsets reduced ~45% (brawlers 45px lateral/20px fore, kiters 55px/30px, haulers 60px aft); follow thresholds tightened to match
- **Enemy respawn (test mode)** — Destroyed raiders respawn after 60 seconds near their home station in test mode only
- **Auto-fire turret weapons** — Turret weapons (LaserTurret) have `isAutoFire = true` and auto-acquire the nearest enemy in range with lead targeting; no player input needed. Manual weapons (future missiles/torpedoes) still fire via LMB/spacebar toward the mouse cursor. `Ship.fireAutoWeapons(enemies, entities)` handles target acquisition and lead calculation

---

## UI Overhaul: Vector Monitor / Cassette Futurism

**Files (new):** `js/ui/colors.js`
**Files (modified):** `js/renderer.js`, `js/hud.js`, `js/ui/stationScreen.js`, `js/ships/player/flagship.js`, `js/ships/player/gunship.js`, `js/ships/player/frigate.js`, `js/ships/player/hauler.js`, `js/enemies/pirates/raider.js`, `js/entities/ship.js`, `js/world/station.js`, `js/world/planet.js`, `js/entities/projectile.js`, `js/systems/particlePool.js`, `js/data/testMap.js`

### Implemented
- **Shared color module** (`js/ui/colors.js`) — centralized palette constants (CYAN, AMBER, GREEN, RED, MAGENTA, etc.) used by all UI and entity files; faction color map
- **CRT post-processing** — scanline overlay (3px spacing, 7% opacity), radial vignette darkening at screen edges
- **Starfield tinting** — stars tinted cyan/white with varied opacity per star for depth
- **Segmented health bars** — 10-segment digital bars with outlined tracks; ARMOR = cyan, HULL = amber; critical (<25%) pulses red
- **Outlined throttle pips** — inactive pips show dim outline only; active pip fills cyan with white text
- **Minimap corner brackets** — L-shaped bracket marks at corners; proper palette: white stations, red enemies, dim green planets, cyan fleet/player
- **Dock prompt pulse** — green text with alpha oscillation
- **Station screen corner brackets** — panel framed with L-shaped brackets instead of plain strokeRect; outlined-only buttons (no fill); palette-correct colors
- **Color-by-relation rule** — ship color indicates relation to player: green = player-owned, amber = neutral, red = hostile, blue = friendly. Ship type is distinguished by size/shape (silhouette), not color. Non-ship entities (planets, asteroids, stations) exempt
- **Ship wireframe style** — all player ships use near-transparent green fill with green stroke; enemies use red
- **Engine glow** — pulsing outline circles at exhaust points (replaced gradient blobs); green for player, red for enemies
- **Engine trails** — long fading lines (Homeworld-style) recorded from engine positions; 120-point history per engine; trails fade when stopped. Replaced particle-based engine trails
- **Station wireframe** — darker fill, wireframe hex outline, subtle outer ring stroke, station name label below
- **Planet wireframe** — replaced gradient fill with faint solid fill + outline circle
- **Projectile glow** — dual-pass rendering (wide glow + sharp core); relation-colored (green = player, red = enemy)
- **Explosion rings** — expanding concentric circle effects that fade out, alongside existing spark particles

---

## Lore Overhaul & Ship Redesign

**Files (new):** `js/enemies/scavengers/raider.js`
**Files (modified):** `js/ships/player/flagship.js`, `js/ships/player/gunship.js`, `js/ships/player/frigate.js`, `js/ships/player/hauler.js`, `js/data/map.js`, `js/data/testMap.js`, `js/data/shipTypes.js`, `js/ui/colors.js`, `js/game.js`, `CLAUDE.md`

### Implemented
- **Lore name integration** — stations renamed: Haven → Keelbreak, Frontier → Crucible Station, Bastion → Thornwick Archive; planets renamed: Verdant → Thalassa, Arid → Grist, Glacius → Pale
- **Faction update** — pirates → scavengers; raider moved to `js/enemies/scavengers/raider.js`; FACTION color map updated with scavengers, monastic, communes, zealots
- **Scrap ship (flagship)** — asymmetric 8-point hull polygon (off-center nose, uneven port/starboard); weld seam line and patched plate overlay at reduced alpha; asymmetric engine positions
- **Brawler (gunship)** — 6-point boxy rectangular hull with beveled nose; horizontal bridge slit detail; renamed display name to "Brawler" in shipTypes.js
- **Frigate** — 7-point swept-wing hull with narrow neck and wide wing tips
- **Hauler** — complete rewrite: small rectangular cockpit pulling 3 trailing cargo containers via position history buffer (120 entries, 18-frame spacing); containers drawn at 0.7 alpha with coupling lines; collision on cockpit only (radius 14)
- **Ship silhouette differentiation** — each ship type now has a radically different shape: asymmetric scrap, boxy tank, swept-wing, multi-segment train

---

## Weapon System: Kinetic Standard

**Files (new):** `js/weapons/autocannon.js`
**Files (modified):** `js/weapons/laserTurret.js`, `js/entities/projectile.js`, `js/entities/ship.js`, `js/game.js`, `js/ships/player/gunship.js`, `js/ships/player/frigate.js`, `js/enemies/scavengers/raider.js`

### Implemented
- **25mm Autocannon** — new default weapon for all ships. Amber projectiles (`#ffaa00` glow, `#ffe0a0` core), slower speed (380 u/s vs laser's 800), higher per-hit damage (12), longer range (400u), 0.35s cooldown. Auto-fire turret with lead targeting
- **Projectile custom colors** — projectiles now carry `color`, `glowColor`, and `length` properties set by the weapon. Falls back to relation-based coloring (green/red) if unset
- **Laser turret redesigned** — now a rare, expensive energy weapon. Fast (800 u/s), high rate of fire (0.15s cooldown), cyan bolts. Split damage model: 15 armor damage but only 4 hull damage. Strips armor fast, weak against exposed hull
- **Split damage system** — `Ship.takeDamage(amount, hullDamageOverride)` supports optional hull damage override for weapons like lasers that deal different damage to armor vs hull
- **All starting ships use autocannons** — player flagship, brawler, frigate, and scavenger raiders all spawn with Autocannon instead of LaserTurret

---

## Ship Detail Pass — All Ships Redesigned

**Files (modified):** `js/ships/player/gunship.js`, `js/ships/player/frigate.js`, `js/ships/player/hauler.js`, `js/enemies/scavengers/raider.js`, `js/data/testMap.js`

### Implemented
- **Brawler (gunship)** — complete hull redesign: angled bow deflector plate, wide body with flanking engine nacelles, two horizontal armor plate seams, turret ring circle detail, viewport slit in deflector, 3 engines (2 nacelle + 1 center). Collision radius increased to 20
- **Frigate** — complete hull redesign: long sensor spike nose, narrow neck widening to swept-back wings with clipped tips, central spine line, wing spar structural ribs, diamond-shaped cockpit canopy. 20 hull points. Collision radius increased to 16
- **Hauler** — cockpit redesigned: bumper frame with chamfered nose wider than the cab body, windshield band, antenna/sensor mast, cab mid-section seam, engine pod housings (small rectangles around each engine), double-strut pylons for rigidity. Cargo containers now have X cross-bracing detail lines
- **Raider** — complete hull redesign: asymmetric scavenger attack ship with off-center ram prow, heavy starboard side with welded-on armor plate, oversized starboard engine nacelle vs smaller port thruster, exposed structural ribs, ram prow reinforcement line, armor weld seam. Mismatched engine glow sizes. Collision radius increased to 16
- **Design philosophy** — every ship now has: (1) a distinctive multi-point hull polygon, (2) internal detail lines (seams, ribs, frames), (3) a cockpit/viewport feature, (4) character-appropriate asymmetry or structural details matching their lore role

---

## Phase 5: Loot, Salvage, Scrap, Fuel & UI Fixes

**Files (new):** `js/entities/lootDrop.js`, `js/world/derelict.js`
**Files (modified):** `js/game.js`, `js/hud.js`, `js/ui/stationScreen.js`, `js/entities/ship.js`, `js/ai/fleetAI.js`, `js/ai/raiderAI.js`, `js/data/commodities.js`, `js/data/map.js`, `js/data/testMap.js`, `js/ui/colors.js`, `js/main.js`

### Implemented
- **6-level throttle** — Stop, 1/4, 1/2, 3/4, Full, Flank. Flank is 150% of old Full speed (1.5x speedMax). HUD shows 6 pips (32px each). All AI (fleet + raider) updated for new throttle scale
- **Fuel system** — `game.fuel` / `game.fuelMax` (100). Exponential fuel consumption per throttle level: free at 1/4, 0.3/s at 1/2, up to 2.5/s at Flank. Empty fuel clamps throttle to 1/4 (free crawl). Fuel bar in HUD (top-right, segmented, amber/red). Refuel button on station Services tab
- **Scrap resource** — `game.scrap` (fleet-wide). Used by crew to repair armor (1 scrap per armor point). Acquired from loot drops, salvage, and station trade. Scrap added as 5th commodity in trade tab (buy/sell between credits and scrap directly, not cargo). HUD scrap readout top-right
- **Armor repair rework** — Moved from `Ship.update()` to `GameManager._updateArmorRepair()`. Now consumes scrap. Rate reduced from 0.5 to 0.15 armor/sec/crew. Stops when scrap runs out
- **Loot drops** (`js/entities/lootDrop.js`) — Amber wireframe diamonds with pulsing glow. Scatter from explosions with drag-to-stop. 30s lifetime, blink near expiry. Types: credits, scrap, commodities
- **Enemy loot generation** — Destroyed enemies spawn loot drops: always credits (30-100) + scrap (2-5), 25% chance commodity (ore 50%, tech 30%, food 15%, exotics 5%)
- **Loot pickup** — Auto-collect credits and scrap on contact. Commodities only collected if cargo has space. Floating amber pickup text drifts up and fades over 1.5s
- **Derelicts** (`js/world/derelict.js`) — Tilted wreck polygons with damage gash lines. Periodic spark particle emissions. Name label below. Interaction radius 120
- **Salvage system** — Press E near derelict to start salvage. Progress bar fills over salvage time (2-4s). Player frozen during salvage, vulnerable to enemies. E/Esc cancels. Completion spawns loot drops from derelict's loot table, derelict removed
- **Station screen 25% larger** — Panel 500x475/575px (was 400x380/460). Fonts scaled up. Tab width 125px. All layout proportionally adjusted
- **Refuel at stations** — Services tab "Refuel" button: 1 cr per fuel unit, instant refill
- **Hull repair progress** — Clicking Repair starts a ~2s progress bar instead of instant heal. Credits deducted on completion
- **Scrap as tradeable** — 5th commodity in trade tab. Scrap bought/sold converts between credits and scrap (not cargo). Stations have scrap supply levels
- **Test overlay text wrapping** — Long test steps word-wrap within panel using `ctx.measureText()`. Panel height adjusts dynamically
- **Minimap markers** — Loot drops: tiny amber dots (1.5px). Derelicts: small amber outlined squares (3px)
- **Derelict prompt** — "Press E to salvage <name>" pulsing amber text when near derelict
- **Map data** — 2 derelicts in production map, 3 in test map (near player start). Scrap supply levels on all stations. Jump gates removed from map data

---

## Phase 6: Shipyard & Fleet Management

**Files (modified):** `js/ui/stationScreen.js`, `js/data/shipTypes.js`, `js/data/map.js`, `js/game.js`

### Implemented
- **Shipyard tab** — third tab on station screen (only at stations with `shipyard` service). Shows available ships for purchase with stat summary (Armor, Hull, Speed, Cargo) and price
- **Buy ships** — purchase gunship, frigate, or hauler from station shipyard; ship spawns near station and joins fleet. Fleet limit of 5 ships (including flagship). Credits deducted on purchase
- **Sell ships** — sell fleet ships back at 50% of purchase price. Ship removed from fleet and entity list. Cargo capacity enforced after sale (excess cargo jettisoned)
- **Ship factories** — `SHIP_FACTORIES` map routes ship type IDs to creation functions (`createGunship`, `createFrigate`, `createHauler`)
- **Station shipyard data** — each station defines a `shipyard` array of available ship type IDs; different stations sell different ships
- **Formation reassignment** — `game.assignFormationOffsets()` called after buy/sell to reposition fleet

---

## Crew System: Effectiveness & Hiring

**Files (modified):** `js/entities/ship.js`, `js/weapons/autocannon.js`, `js/weapons/laserTurret.js`, `js/game.js`, `js/hud.js`, `js/ui/stationScreen.js`, `js/data/shipTypes.js`, `js/data/testMap.js`, `js/ships/player/gunship.js`, `js/ships/player/frigate.js`, `js/ships/player/hauler.js`, `js/enemies/scavengers/raider.js`

### Implemented
- **Crew efficiency system** — `crewEfficiency` getter on Ship: scales from 0.1 (zero crew, ghost ship) through 0.25–0.50 (critical, <25% crew) to 1.0 (full crew). Affects:
  - **Movement speed** — `effectiveSpeedMax` = `speedMax × crewEfficiency`
  - **Turn rate** — `effectiveTurnRate` = `turnRate × crewEfficiency`
  - **Weapon reload** — cooldown inflated by `1/crewEfficiency` (low crew = slower fire rate)
  - **Armor repair** — repair rate now also scaled by efficiency (on top of raw crew count)
  - **Zero crew** — weapons completely offline, ship limps at 10% speed
- **Crew loss on hull damage** — each hull hit has ~15% chance to kill one crew member. Crew does NOT regenerate — must hire at stations
- **Crew hiring UI** — Services tab at stations now has a CREW ROSTER section showing all fleet ships with crew count, efficiency %, and hire buttons (+1 for 10 cr, Fill to hire all missing crew at once)
- **Crew values per ship type** — flagship 20, gunship 15, frigate 8, hauler 6, raider 8. Flagship starts understaffed at 12/20. Purchased ships start at full crew
- **HUD crew readout** — crew count and efficiency % shown in left panel below scrap; fleet status shows per-ship crew count with red highlight when critically low
- **Ship type data** — `crew` field added to `SHIP_TYPES` entries

---

## Pending (future phases)

- Nebulae with sensor/speed penalties
- Save/load system

---

## Systems Overhaul — Crew, Fleet, Controls, Currency Removed

### Removed
- **Crew system** — `crewMax`, `crewCurrent`, `crewRepairRate`, `crewEfficiency` removed from all ships. Hull breach crew casualty mechanic removed. Speed/turn/fire-rate crew penalties removed. Crew section removed from station Services tab. Autocannon/LaserTurret no longer accept `crewEfficiency` parameter.
- **Fleet system** — `game.fleet` removed. Fleet AI (`fleetAI.js`) no longer called. Formation offsets removed. Shipyard tab removed from station screen. No ship purchasing. Minimap fleet markers removed. Fleet status HUD panel removed.
- **Credits currency** — `game.credits` removed entirely. All station service costs now paid in scrap. Trade now uses scrap as the medium of exchange. Loot drops no longer produce credits (replaced with scrap + fuel drops).

### Changed
- **Controls** — Autocannon set to `isAutoFire = false`. Now fires on LMB toward mouse cursor. LaserTurret remains `isAutoFire = true` (point defense role).
- **Auto-repair** — Crew-based auto-repair replaced with simple passive repair: armor restores 0.5/sec at throttle 0 while scrap is available (1 scrap per armor point).
- **Loot** — Enemy drops now yield scrap + optional fuel + optional commodity. No more credit drops.
- **Station services** — Armor repair: 1 scrap/point. Hull repair: 2 scrap/point. Refuel: 1 scrap per 2 fuel.
- **Trade** — Scrap is the barter medium. Commodity prices (food, ore, tech, exotics) denominated in scrap units. Scrap itself removed from the trade commodity list.
- **Starting resources** — Player starts with 20 scrap (60 in test mode). No starting credits.

### Lore
- Economy section added to `LORE.md` explaining the collapse of the old credit system and the return to palace/feudal/barter economies, with scrap as the de-facto universal trade good.
