# Wayfarer — Development Log

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

## Pending (future phases)

- Phase 4: Trade economy (cargo, commodity prices, trade routes) ✓
- Phase 5: Floating loot pickups, asteroid mining
- Jump gates / warp travel
- Nebulae with sensor/speed penalties
- Crew hiring at stations
- Save/load system
