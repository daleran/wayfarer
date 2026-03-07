# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wayfarer is a browser-based top-down 2D space trading and combat game inspired by Sid Meier's Pirates!. Built with HTML5 Canvas and vanilla JavaScript (ES6 modules), bundled with Vite.

The full game design spec is in `SPEC.md`. The development log tracking what's been implemented per phase is in `DEVLOG.md`.

## Commands

- **Dev server:** `npm run dev` (Vite, hot-reload)
- **Build:** `npm run build` (output to `dist/`)
- **Preview build:** `npm run preview`

No test framework or linter is configured.

### Test Map (Playtesting)

A compact test map exists for validating new features quickly. Everything is close together so you don't have to fly across the whole galaxy.

- **Run test mode:** `npm run dev` then open `http://localhost:5173/?test`
- **Test map file:** `js/data/testMap.js` — reduced distances (3000x3000 vs 20000x20000)
- **Verification steps** are shown on-screen in a magenta-bordered overlay (bottom-left)

**Every development iteration**, update `js/data/testMap.js`:
1. Add any new entities/features to the test map so they're easy to reach
2. Update `TEST_STEPS` with verification steps for the new features
3. Tell the user to open `?test` and follow the on-screen steps to validate

## Key Documentation Files

The following markdown files at the project root are living documents. **Review and update each one during every development iteration** to keep them accurate and in sync with the codebase.

| File | Purpose | Review / Update During Iteration |
|---|---|---|
| `SPEC.md` | Full game design spec — features, systems, phases, balancing | Mark newly implemented features as complete. Update any spec details that changed during implementation. |
| `DEVLOG.md` | Development progress log — tracks what was built per phase | Append a summary of what was implemented, changed, or fixed this iteration. |
| `LORE.md` | Worldbuilding — history, factions, locations, aesthetics | Update if new factions, locations, story threads, or lore-relevant content was added. **Also update when the user gives feedback about how the game world should feel, look, or be** — any guidance on tone, setting, or world identity belongs here. |
| `UI.md` | UI aesthetic guide — color palette, component patterns, decision log | Update if new UI components were added or visual conventions changed. **Also update when the user gives feedback about visual style, ship appearance, color choices, or aesthetic direction** — log decisions and rationale in the Decision Log section. |
| `docs/ship_overhaul.md` | Ship & Faction Overhaul Spec — classes, modifiers, captains, and locations | Reference during the phased implementation of the new ship and factional systems. |
| `docs/location_overhaul.md` | Location Overhaul Spec — station types, new commodities, and planet landing | Reference during the phased implementation of the "Living System" system. |
| `docs/economy_overhaul.md` | Economy Overhaul Spec — dynamic pricing, market events, and smuggling | Reference during the phased implementation of the "Living Market" system. |
| `docs/combat_tactics.md` | Combat Tactics Spec — formations, command hotkeys, and E-War | Reference during the phased implementation of the "Fleet Command" system. |
| `docs/narrative_events.md` | Narrative Events Spec — procedural events, dialogue, and reputation | Reference during the phased implementation of the "Living Void" system. |
| `CLAUDE.md` | This file — project instructions for Claude Code | Update the Architecture section if new systems, entities, or patterns were introduced. |

## Architecture

### Entry Point

`index.html` loads `js/main.js`, which creates a `GameManager` and starts the game loop.

### Core Systems

- **`js/game.js` — `GameManager`**: Central orchestrator. Owns the entity list, camera, renderer, HUD, particle pool, and game state (credits, docking). Its `update(dt)` drives the tick: input processing, entity updates, AI, collisions, particle effects, docking checks. Its `render()` delegates to `Renderer`.
- **`js/loop.js`**: Fixed-timestep game loop (60 ticks/sec) with spiral-of-death protection. Calls `game.update(dt)` and `game.render()` via `requestAnimationFrame`.
- **`js/camera.js`**: World-to-screen coordinate transform with smooth follow (exponential lerp) and visibility culling.
- **`js/input.js`**: Singleton `InputHandler` — keyboard hold (`isDown`), just-pressed (`wasJustPressed`), mouse position/buttons, `mouseWorld(camera)` helper. State is flushed each tick via `tick()`.
- **`js/renderer.js`**: Clears canvas, draws parallax starfield, renders all entities, then HUD/UI overlays.

### Entity Hierarchy

```
Entity (js/entities/entity.js)  — base: x, y, vx, vy, rotation, active
  Ship (js/entities/ship.js)    — armor/hull health, throttle (6 levels), weapons
    ScrapShip (js/ships/player/flagship.js) — player ship, asymmetric hull + weld seam details
    Gunship (js/ships/player/gunship.js)    — brawler, boxy rectangular hull
    Frigate (js/ships/player/frigate.js)    — kiter, swept-wing angular hull
    Hauler (js/ships/player/hauler.js)      — cockpit + 3 trailing cargo containers (position history)
    Raider (js/enemies/scavengers/raider.js) — scavenger enemy, red color scheme
  Projectile (js/entities/projectile.js)   — velocity-driven, deactivates on range/hit
  LootDrop (js/entities/lootDrop.js)       — amber diamond, auto-pickup, 30s lifetime
  Particle (js/entities/particle.js)       — short-lived visual effect
  Station (js/world/station.js)            — hexagonal, faction-colored, dockable
  Planet (js/world/planet.js)              — gradient-filled circle, name label
  Derelict (js/world/derelict.js)          — salvageable wreck, loot table, spark particles
```

Ship subclasses override `_drawShape(ctx)` for custom rendering and `getBounds()` for collision radius.

### Key Patterns

- **All game entities** live in `GameManager.entities[]` and are updated/rendered polymorphically. Inactive entities are purged each tick.
- **Collision detection** is projectile-vs-ship circle checks in `GameManager._runCollisions()`.
- **AI** is functional — `updateRaiderAI(raider, player, entities, dt)` in `js/ai/raiderAI.js` runs per-raider each tick. Raiders have a `homePosition` (set from their spawn station) and patrol nearby. They only aggro when the player enters ~800 units and deaggro at ~1200 units.
- **Weapons** are component objects attached to ships via `addWeapon()`. Each weapon has its own cooldown and `fire()` method that spawns projectiles into the entity list. Two weapon types: `Autocannon` (kinetic, amber, standard on all ships) and `LaserTurret` (energy, cyan, rare — high armor damage, low hull damage via `hullDamage` override on projectiles).
- **Particles** use an object pool (`js/systems/particlePool.js`, 200 slots) with preset emitters (`explosion()`, `engineTrail()`).
- **World data** is defined in `js/data/map.js` — station/planet/derelict positions, faction info, map size. `js/data/testMap.js` provides a compact variant for playtesting. Raiders are spawned via `raiderSpawns` entries in map data, each referencing a station ID.
- **UI overlays** (e.g., `js/ui/stationScreen.js`) are drawn directly on canvas and handle their own input when active. Docking sets `isDocked = true`, which skips the main simulation loop.
- **Shared color palette** (`js/ui/colors.js`) — all color constants (CYAN, AMBER, GREEN, RED, MAGENTA, etc.) and faction color map. All rendering code imports from this module instead of using inline hex strings.
- **Fuel system** — `game.fuel`/`game.fuelMax` consumed per throttle level (exponential scaling). Empty = clamp to 1/4 speed (free crawl). Refuel at stations.
- **Scrap resource** — `game.scrap` consumed by armor repair (1 per armor point). Acquired from loot/salvage/trade. Not cargo — separate resource like credits.
- **Loot drops** — `LootDrop` entities scattered from destroyed enemies and completed salvage. Auto-collected on contact with floating pickup text feedback.
- **Derelicts** — `Derelict` entities with loot tables. E to salvage (progress bar), spawns loot on completion. Sparking particle effects.
- **Salvage state machine** — `isSalvaging`, `salvageProgress`, `salvageTarget` in GameManager. Player frozen during salvage, E/Esc cancels.

### Coordinate System

- Rotation 0 = pointing up (north, negative Y). Ships move in their facing direction.
- World origin is top-left; positive X is right, positive Y is down.
- Camera converts world coords to screen coords for rendering.

### Controls

- **W/S or Up/Down arrows**: Increase/decrease throttle (step per press, not held)
- **A/D or Left/Right arrows**: Rotate left/right (continuous while held)
- **LMB or Spacebar**: Fire manual weapons (missiles, torpedoes) toward mouse cursor
- **Turret weapons** (lasers): Auto-fire at nearest enemy in range with lead targeting
- **E**: Dock/undock at nearby stations
