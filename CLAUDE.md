# CLAUDE.md

Project instructions for Claude Code.

> **ALWAYS read these before and after making any change:**
> - `@SPEC.md` — game design, systems, mechanics
> - `@LORE.md` — worldbuilding, factions, setting, tone
> - `@UI.md` — visual conventions, color palette, component patterns
>
> **ALWAYS update them when anything relevant changes.** If you add, remove, or modify a mechanic → update `SPEC.md`. If you change colors, layouts, or UI patterns → update `UI.md`. If you change lore, faction names, location names, or world tone → update `LORE.md`. These files are the source of truth. Do not let them go stale.

## Commands

- **Dev server:** `npm run dev` (Vite, hot-reload)
- **Build:** `npm run build` (output to `dist/`)
- **Preview build:** `npm run preview`

No test framework or linter is configured.

### Test Modes

Three test harnesses, activated by URL param. All run on the same `startLoop` as the game — each implements `update(dt)` / `render()`.

| URL | Mode | Purpose |
|---|---|---|
| `?test` | Playtest map | Full game on compact map with dev spawn controls |
| `?test-ships` | Ship Designer | Isolated ship viewer/stats panel, no world |
| `?test-poi` | POI Designer | Live render of stations, planets, derelicts etc. |

#### `?test` — Playtest Map

- **Run:** `npm run dev` → `http://localhost:5173/?test`
- **Map:** `js/data/testMap.js` — compact 8000×5000, all key features nearby
- **Config:** `js/data/testConfig.js` — `startScrap`, `addRockets`, etc.
- **Overlay:** magenta-bordered verification steps (bottom-right) + dev controls (top-right)

**Dev controls (test mode only — shown in top-right HUD panel):**
- **Z**: Spawn shielding raider at mouse cursor
- **X**: Spawn kiter raider at mouse cursor
- **C**: Spawn interceptor raider at mouse cursor
- **Q**: Toggle LaserTurret on/off for player

**Every development iteration**, update `js/data/testMap.js`:
1. Add any new entities/features so they're easy to reach
2. Update `TEST_STEPS` with verification steps for the new features
3. Tell the user to open `?test` and follow the on-screen steps to validate

#### `?test-ships` — Ship Designer

- **Run:** `http://localhost:5173/?test-ships`
- **Source:** `js/test/shipDesigner.js`
- **Controls:** `←/→` cycle ships, `T` toggle auto-rotation
- Ships drawn at 7× scale. Stats panel on left shows armor arcs, movement, weapons.
- **When working here:** edit only the ship JS file (`js/ships/` or `js/enemies/`). Vite HMR reloads on save. When stats finalized, update `SPEC.md` and `js/data/shipTypes.js`.
- **In scope:** `js/ships/**`, `js/enemies/**`, `js/ui/colors.js`

#### `?test-poi` — POI Designer

- **Run:** `http://localhost:5173/?test-poi`
- **Source:** `js/test/poiDesigner.js`
- **Controls:** `←/→` cycle POIs, scroll zoom, drag pan, `R` reset view
- Mock camera: POI placed at world (0,0), camera centers it. Info panel shows key-specific fields.
- **When working here:** edit the POI renderer in `js/world/`. For map data changes, edit `js/data/map.js`. For lore, update `LORE.md`. For mechanics/encounters, update `SPEC.md`.
- **In scope:** `js/world/**`, `js/data/map.js`, `js/data/testMap.js`

## Key Documentation Files

**MANDATORY: Update these files whenever you make a relevant change. Do not skip this step.**

| File | Purpose | **Mandatory Update Triggers** |
|---|---|---|
| `SPEC.md` | Full game design spec — features, systems, phases, balancing | **ANY** mechanic added, removed, or changed. Controls changed. Currency/economy changed. New systems. Mark phases complete. |
| `LORE.md` | Worldbuilding — history, factions, locations, economy, aesthetics | Faction names/traits changed. Location names changed. World tone or setting changed. User gives feedback about feel. |
| `UI.md` | UI aesthetic guide — color palette, component patterns, decision log | New UI component added. Color usage changed. Layout changed. Visual conventions changed. User gives aesthetic feedback. |
| `DEVLOG.md` | Development progress log | Every session — append a summary of what was implemented, changed, or fixed. |
| `CLAUDE.md` | This file | New systems or patterns introduced. Architecture changes. |

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
Entity (js/entities/entity.js)          — base: x, y, vx, vy, rotation, active
  Ship (js/entities/ship.js)            — armor/hull health, throttle (6 levels), weapons
    ScrapShip (js/ships/player/flagship.js) — player ship
    Gunship   (js/ships/player/gunship.js)  — unused; future use
    Frigate   (js/ships/player/frigate.js)  — unused; future use
    Hauler    (js/ships/player/hauler.js)   — unused; future use (trailing container rendering)
    Raider    (js/enemies/scavengers/raider.js) — scavenger enemy
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
- **Raider AI** — `updateRaiderAI()` in `js/ai/raiderAI.js`. Raiders have a `homePosition`, patrol nearby, aggro at ~800u, deaggro at ~1200u.
- **Weapons** — component objects added via `addWeapon()`. Two types:
  - `Autocannon` (`isAutoFire = false`) — fires on LMB toward mouse cursor
  - `LaserTurret` (`isAutoFire = true`) — point defense, auto-fires at nearest enemy with lead targeting
- **Particle pool** — `js/systems/particlePool.js`, 200 slots, presets: `explosion()`, `engineTrail()`.
- **Map data** — `js/data/map.js` defines stations, planets, derelicts, raider spawns. `js/data/testMap.js` is the compact playtesting variant.
- **UI overlays** — drawn on canvas, handle their own input. Docking sets `isDocked = true`, skipping the simulation loop.
- **Color palette** — `js/ui/colors.js` exports all color constants. Never use inline hex strings.
- **Economy** — `game.scrap` is the sole currency (no credits). `game.fuel` / `game.fuelMax` drive movement. Trade, repairs, and refueling all cost scrap.
- **Field repair** — press R to toggle armor repair when stopped. 1.5 armor/sec, 1 scrap per armor point. Auto-cancels when full, out of scrap, or ship moves. Press R again to cancel manually.
- **Salvage state machine** — `isSalvaging`, `salvageProgress`, `salvageTarget` on `GameManager`. Player frozen during salvage; E or Esc cancels.

### Coordinate System

- Rotation 0 = pointing up (north, negative Y).
- World origin top-left; positive X right, positive Y down.

### Controls

- **W/S or ↑/↓**: Increase/decrease throttle (step per press)
- **A/D or ←/→**: Rotate (continuous while held)
- **LMB or Space**: Fire autocannon toward mouse cursor
- **R**: Toggle field armor repair (must be stopped; 1.5 armor/sec, 1 scrap/pt)
- **E**: Dock at nearby station / begin salvage on nearby derelict
- **Esc**: Cancel salvage / close station screen
