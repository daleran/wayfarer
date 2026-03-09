# CLAUDE.md

Project instructions for Claude Code.

> **ALWAYS read these before and after making any change:**
> - `@MECHANICS.md` — game mechanics, systems, controls, balancing
> - `@LORE.md` — worldbuilding, factions, setting, tone
> - `@UX.md` — visual conventions, color palette, component patterns
>
> **ALWAYS update them when anything relevant changes.** If you add, remove, or modify a mechanic → update `MECHANICS.md`. If you change colors, layouts, or UI patterns → update `UX.md`. If you change lore, faction names, location names, or world tone → update `LORE.md`. These files are the source of truth. Do not let them go stale.

## Commands

- **Dev server:** `npm run dev` (Vite, hot-reload)
- **Build:** `npm run build` (output to `dist/`)
- **Preview build:** `npm run preview`

No test framework or linter is configured.

## Documentation Guide

**MANDATORY: Update these files whenever you make a relevant change. Do not skip this step.**

| File | Purpose | **Mandatory Update Triggers** |
|---|---|---|
| `MECHANICS.md` | Game mechanics — movement, weapons, damage, AI, economy, HUD | **ANY** mechanic added, removed, or changed. Controls changed. Economy changed. New systems. |
| `LORE.md` | Worldbuilding — history, factions, locations, tone | Faction names/traits changed. Location names changed. World tone or setting changed. |
| `UX.md` | UI aesthetic guide — color palette, component patterns, decision log | New UI component added. Color usage changed. Layout changed. Visual conventions changed. |
| `DEVLOG.md` | Development progress log — major features only | Every session — append one line per major feature completed. |
| `NEXT.md` | Upcoming features (A/B/C) + minor fix list | Add new planned features. Remove items when completed. |
| `CLAUDE.md` | This file — dev flow, architecture, rules | New systems or patterns introduced. Architecture changes. |

## Test Modes

Two test harnesses. Both run on the same `startLoop` — each implements `update(dt)` / `render()`.

| URL | Mode | Purpose |
|---|---|---|
| `?test` | Playtest map | Full game on compact map with dev spawn controls |
| `?designer` | Unified Designer | Browse all ships, POIs, and weapons with stats panels |

### `?test` — Playtest Map

- **Run:** `npm run dev` → `http://localhost:5173/?test`
- **Map:** `js/data/testMap.js` — compact 8000×5000, all key features nearby
- **Config:** `js/data/testConfig.js` — `startScrap`, `addRockets`, etc.
- **Overlay:** magenta-bordered verification steps (bottom-right) + dev controls (top-right)

**Dev controls (test mode only — shown in top-right HUD panel):**
- **Z**: Spawn Light Fighter (stalker) at mouse cursor
- **X**: Spawn Armed Hauler (kiter) at mouse cursor
- **C**: Spawn Salvage Mothership (standoff) at mouse cursor

**Every development iteration**, update `js/data/testMap.js`:
1. Add any new entities/features so they're easy to reach
2. Update `TEST_STEPS` with verification steps for the new features
3. Tell the user to open `?test` and follow the on-screen steps to validate

### `?designer` — Unified Designer

- **Run:** `npm run dev:designer` → `http://localhost:5176/designer.html?designer`
- **Source:** `js/test/designer.js`, entry: `js/designer-main.js`
- **Navigation:**
  - `↑/↓` — change category (Ships / Stations / Planets / Derelicts / Environment / Weapons)
  - `←/→` — cycle item within current category
  - `T` — toggle auto-rotation (ships only)
  - `R` — reset view (zoom + pan to item default)
  - Scroll — zoom
  - Drag — pan (non-ship categories)
- **Deep-link:** `?designer&category=<cat>&id=<slug>` — e.g. `?designer&category=weapons&id=railgun`
- **When working here:**
  - Ships: edit `js/ships/**` or `js/enemies/**`. Vite HMR reloads on save.
  - POIs: edit `js/world/**` or `js/data/map.js`.
  - Weapons: edit `js/weapons/**`. Stats panel reads live from the weapon instance.
- **In scope:** `js/ships/**`, `js/enemies/**`, `js/world/**`, `js/weapons/**`, `js/ui/colors.js`

### Designer Item `id` Slugs

Every item in `CATEGORIES` in `js/test/designer.js` has a durable `id` — kebab-case, stable even if the display label changes. Used for URL deep-linking.

- **Ships:** `onyx-tug`, `maverick-courier`, `g100-hauler`, `garrison-frigate`, `hullbreaker`, `raider`, `light-fighter`, `armed-hauler`, `salvage-mothership`, `trader-convoy`, `militia-patrol` (driven from `js/ships/registry.js`)
- **Stations:** `kells-stop`, `the-coil`, `ashveil-anchorage` (driven from `js/world/stationRegistry.js`)
- **Planets:** `planet-thalassa`, `planet-pale`
- **Derelicts:** `derelict-hollow-march`
- **Environment:** `arkship-spine`, `debris-cloud`
- **Weapons:** `autocannon`, `railgun`, `railgun-f`, `flak-s`, `flak-l`, `lance-s`, `lance-l`, `lance-f`, `plasma-s`, `plasma-l`, `cannon`, `rocket`, `rocket-large`, `wire-msl`, `wire-msl-l`, `heat-msl`, `heat-msl-l`, `torpedo`
- **Modules:** `onyx-drive-unit`, `chem-rocket-s`, `chem-rocket-l`, `magplasma-torch-s`, `magplasma-torch-l`, `ion-thruster`, `mod-autocannon`, `mod-lance-s`, `mod-cannon`, `mod-heat-msl`, `mod-heat-msl-l`, `h2-fuel-cell`, `fission-s`, `fission-l`, `fusion-l`, `salvaged-sensors`, `standard-sensors`, `combat-computer`, `salvage-scanner`, `long-range-sensors`

## Architecture

### Entry Point

`index.html` → `js/main.js` → creates `GameManager` → starts game loop.

### Core Systems

| File | Class | Role |
|---|---|---|
| `js/game.js` | `GameManager` | Central orchestrator. Owns entities, camera, renderer, HUD, particle pool, game state. Drives `update(dt)` and `render()`. |
| `js/loop.js` | — | Fixed-timestep loop (60 ticks/sec), spiral-of-death protection. |
| `js/camera.js` | `Camera` | World↔screen transform, exponential-lerp follow, visibility culling. |
| `js/input.js` | `InputHandler` (singleton) | Keyboard hold (`isDown`), just-pressed (`wasJustPressed`), mouse position/buttons, `mouseWorld(camera)`. Flushed each tick via `tick()`. |
| `js/renderer.js` | `Renderer` | Clears canvas, draws parallax starfield, renders entities, then HUD/UI overlays. |

### Entity Hierarchy

```
Entity (js/entities/entity.js)               — base: x, y, vx, vy, rotation, active
  Ship (js/entities/ship.js)                 — armor/hull health, throttle (6 levels), weapons, fuelMax, fuelEfficiency
    OnyxClassTug (js/ships/classes/onyxTug.js)    — class template: hammerhead tug shape, defaults
      Hullbreaker (js/ships/player/hullbreaker.js) — player variant: reduced armor, +fuel tank
    LightFighter      (js/enemies/scavengers/lightFighter.js)      — fast stalker (Maverick Class Courier hull)
    ArmedHauler       (js/enemies/scavengers/armedHauler.js)       — kiter with autocannon + lance (G100 Class Hauler hull)
    SalvageMothership (js/enemies/scavengers/salvageMothership.js) — standoff, lobs missiles (Garrison Class Frigate hull)
    TraderConvoy      (js/ships/neutral/traderConvoy.js)           — neutral hauler, travels trade lanes (G100 hull, no weapons)
    MilitiaPatrol     (js/ships/neutral/militiaPatrol.js)          — neutral frigate, orbits The Coil (Garrison hull, no weapons)
  Projectile  (js/entities/projectile.js) — velocity-driven, deactivates on range/hit
  LootDrop    (js/entities/lootDrop.js)   — auto-pickup, 30s lifetime, types: scrap/fuel/commodity
  Particle    (js/entities/particle.js)   — short-lived visual effect
  Station     (js/world/station.js)       — hexagonal, faction-colored, dockable
  Planet      (js/world/planet.js)        — gradient circle, name label
  Derelict    (js/world/derelict.js)      — salvageable wreck, loot table, spark particles
```

Ship subclasses override `_drawShape(ctx)` and `getBounds()`.

### Key Patterns

- **Entity list** — all entities in `GameManager.entities[]`, updated/rendered polymorphically. Inactive entities purged each tick.
- **Collision detection** — projectile-vs-ship circle checks in `GameManager._runCollisions()`.
- **Enemy AI** — `updateRaiderAI()` in `js/ai/raiderAI.js`. Enemies have a `homePosition`, patrol nearby, aggro at 1400u, deaggro at 2000u. Behaviors: `stalker` (LightFighter), `kiter` (ArmedHauler), `standoff` (SalvageMothership). AI distance constants live in `RAIDER_AI` in `js/data/stats.js`.
- **Neutral AI** — `updateNeutralAI()` in `js/ai/neutralAI.js`. Dispatches on `ship.neutralBehavior`. `'trader'`: state machine between `traveling`/`waiting`, follows `_tradeRouteA`/`_tradeRouteB`. `'militia'`: orbit loop using `_orbitCenter`/`_orbitRadius`/`_orbitAngle`/`_orbitSpeed`. Tuning in `NEUTRAL_AI` in `js/data/stats.js`. Neutral ships tracked in `GameManager.neutralShips[]`, drop no loot on death.
- **Weapons** — component objects added via `addWeapon()`. Two types:
  - `Autocannon` (`isAutoFire = false`) — fires on LMB toward mouse cursor
- **Particle pool** — `js/systems/particlePool.js`, 200 slots, presets: `explosion()`, `engineTrail()`.
- **Map data** — `js/data/map.js` defines stations, planets, derelicts, raider spawns. `js/data/testMap.js` is the compact playtesting variant.
- **Centralized stats** — `js/data/stats.js` is the single source of truth for all base stats and tuning knobs. Each ship/weapon file defines its own multiplier constants (e.g. `HULL_MULT`, `SPEED_MULT`) and computes final values as `BASE_* × multiplier`. `SPEED_FACTOR` and `PROJECTILE_SPEED_FACTOR` are global pacing knobs. Never hardcode raw stat numbers in ship/weapon constructors — define a multiplier instead.
- **Ship registry** — `js/ships/registry.js` is the single import point for all ships. `game.js` and `designer.js` both use it. To add a new ship: create the file, add one entry to `SHIP_REGISTRY`. `BASE_FUEL_MAX` and `BASE_FUEL_EFFICIENCY` are per-ship tank/drain tuning knobs on `ship.fuelMax` / `ship.fuelEfficiency`. `game.fuelMax` is set from `player.fuelMax` on init.
- **UI overlays** — drawn on canvas, handle their own input. Docking sets `isDocked = true`, skipping the simulation loop.
- **Color palette** — `js/ui/colors.js` exports all color constants. Never use inline hex strings.
- **Economy** — `game.scrap` is the sole currency (no credits). `game.fuel` / `game.fuelMax` drive movement. Trade, repairs, and refueling all cost scrap.
- **Field repair** — press R to toggle armor repair when stopped. 1.5 armor/sec, 1 scrap per armor point. Auto-cancels when full, out of scrap, or ship moves. Press R again to cancel manually.
- **Salvage state machine** — `isSalvaging`, `salvageProgress`, `salvageTarget` on `GameManager`. Player frozen during salvage; E or Esc cancels.

### Coordinate System

- Rotation 0 = pointing up (north, negative Y).
- World origin top-left; positive X right, positive Y down.

## Controls Reference

- **W/S or ↑/↓**: Increase/decrease throttle (step per press)
- **A/D or ←/→**: Rotate (continuous while held)
- **LMB or Space**: Fire primary weapon toward mouse cursor
- **RMB**: Fire secondary weapon (missiles/torpedoes) toward mouse cursor
- **R**: Toggle field armor repair (must be stopped; 1.5 armor/sec, 1 scrap/pt)
- **E**: Dock at nearby station / begin salvage on nearby derelict
- **I**: Toggle Ship Status screen (paper doll, modules, stats, cargo)
- **Esc**: Cancel salvage / close station screen / close ship screen

## Rules & Conventions

### Stats: Multiplier Pattern
Never hardcode raw stat numbers in ship/weapon constructors. All base values live in `js/data/stats.js`. Each ship/weapon file defines a multiplier (e.g. `HULL_MULT = 1.5`) and computes the final value as `BASE_HULL * HULL_MULT`. Global pacing knobs: `SPEED_FACTOR` and `PROJECTILE_SPEED_FACTOR`.

### Colors: Always Use `js/ui/colors.js`
Never use inline hex strings anywhere in the codebase. Import named constants from `js/ui/colors.js`. If a new color is needed, add it there first.

### Docs: Always Update After Changes
- Mechanic added/changed → `MECHANICS.md`
- Visual/UI changed → `UX.md`
- Lore/names changed → `LORE.md`
- Major feature completed → append one line to `DEVLOG.md`
- Feature planned or completed → update `NEXT.md`

### Commits: Log to DEVLOG.md
Format: `YYYY-MMM-DD-HHMM: Feature name (one-line description)`
Major features only — no tuning passes, no small fixes.
