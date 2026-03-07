# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wayfarer is a browser-based top-down 2D space trading and combat game inspired by Sid Meier's Pirates!. Built with HTML5 Canvas and vanilla JavaScript (ES6 modules), bundled with Vite.

The full game design spec is in `WAYFARER_SPEC.md`. The development log tracking what's been implemented per phase is in `devlog.md`.

## Commands

- **Dev server:** `npm run dev` (Vite, hot-reload)
- **Build:** `npm run build` (output to `dist/`)
- **Preview build:** `npm run preview`

No test framework or linter is configured.

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
  Ship (js/entities/ship.js)    — armor/hull health, throttle (5 levels), crew repair, weapons
    Flagship (js/ships/player/flagship.js) — player ship, custom hull polygon + engine glow
    Raider (js/enemies/pirates/raider.js)  — enemy pirate, red color scheme
  Projectile (js/entities/projectile.js)   — velocity-driven, deactivates on range/hit
  Particle (js/entities/particle.js)       — short-lived visual effect
  Station (js/world/station.js)            — hexagonal, faction-colored, dockable
  Planet (js/world/planet.js)              — gradient-filled circle, name label
```

Ship subclasses override `_drawShape(ctx)` for custom rendering and `getBounds()` for collision radius.

### Key Patterns

- **All game entities** live in `GameManager.entities[]` and are updated/rendered polymorphically. Inactive entities are purged each tick.
- **Collision detection** is projectile-vs-ship circle checks in `GameManager._runCollisions()`.
- **AI** is functional — `updateRaiderAI(raider, player, entities, dt)` in `js/ai/raiderAI.js` runs per-raider each tick.
- **Weapons** are component objects attached to ships via `addWeapon()`. Each weapon has its own cooldown and `fire()` method that spawns projectiles into the entity list.
- **Particles** use an object pool (`js/systems/particlePool.js`, 200 slots) with preset emitters (`explosion()`, `engineTrail()`).
- **World data** is defined in `js/data/map.js` — station/planet positions, faction info, map size.
- **UI overlays** (e.g., `js/ui/stationScreen.js`) are drawn directly on canvas and handle their own input when active. Docking sets `isDocked = true`, which skips the main simulation loop.

### Coordinate System

- Rotation 0 = pointing up (north, negative Y). Ships move in their facing direction.
- World origin is top-left; positive X is right, positive Y is down.
- Camera converts world coords to screen coords for rendering.

### Controls

- **W/S**: Increase/decrease throttle (step per press, not held)
- **A/D**: Rotate left/right (continuous while held)
- **LMB**: Fire weapons toward mouse cursor
- **E**: Dock/undock at nearby stations
