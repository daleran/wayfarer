# CLAUDE.md

Project instructions for Claude Code.

> **ALWAYS read these before and after making any change:**
> - `@MECHANICS.md` — game mechanics, systems, controls, balancing
> - `@LORE.md` — worldbuilding, factions, setting, tone
> - `@UX.md` — visual conventions, color palette, component patterns
>
> **ALWAYS update them when anything relevant changes.** If you add, remove, or modify a mechanic → update `MECHANICS.md`. If you change colors, layouts, or UI patterns → update `UX.md`. If you change lore, faction names, location names, or world tone → update `LORE.md`. These files are the source of truth. Do not let them go stale.
>
> **For any UI or graphics work:** Read `@UX.md` in full before writing a single line of rendering code. The aesthetic rules (colors, typography, layout patterns, world-space vs HUD placement, component conventions) are all there. Never invent a visual pattern that isn't already in `UX.md` — add it to `UX.md` first, then implement it.

## Commands

- **Dev server:** `npm run dev` (Vite, hot-reload)
- **Build:** `npm run build` (output to `dist/`)
- **Preview build:** `npm run preview`

No test framework or linter is configured.

## Feature Code Workflow

All features move through three stages:

1. **IDEA.md** — raw concept with a letter code (e.g. `AN`). Not yet planned for implementation. May be vague. Good place for brainstorming.
2. **NEXT.md** — moved here when the idea is prioritized. "UP NEXT" section = ready to build. Minor tweaks and bugs live in the lower section without codes.
3. **DEVLOG.md** — one line appended when the feature ships. Code is retired here permanently.

**Assigning codes:** Check IDEA.md for the "next available code" header. Codes are sequential two-letter suffixes after `AM` (the last DEVLOG entry): `AN`, `AO`, `AP`, etc. Assign the next available code to each new idea when you add it to IDEA.md.

## Documentation Guide

**MANDATORY: Update these files whenever you make a relevant change. Do not skip this step.**

| File | Purpose | **Mandatory Update Triggers** |
|---|---|---|
| `MECHANICS.md` | Game mechanics — movement, weapons, damage, AI, economy, HUD | **ANY** mechanic added, removed, or changed. Controls changed. Economy changed. New systems. |
| `LORE.md` | Worldbuilding — history, factions, locations, tone | Faction names/traits changed. Location names changed. World tone or setting changed. |
| `UX.md` | UI aesthetic guide — color palette, component patterns, decision log | New UI component added. Color usage changed. Layout changed. Visual conventions changed. |
| `DEVLOG.md` | Development progress log — major features only | Every session — append one line per major feature completed. |
| `NEXT.md` | UP NEXT (coded features ready to build) + minor fix list | Promote ideas from IDEA.md. Remove items when completed. |
| `IDEA.md` | Raw feature concepts with codes — not yet planned | New ideas captured. Move to NEXT.md when prioritized. |
| `CLAUDE.md` | This file — dev flow, architecture, rules | New systems or patterns introduced. Architecture changes. |

## Dev Harnesses

Two harnesses. Both run on the same `startLoop` — each implements `update(dt)` / `render()`.

| URL | Mode | Purpose |
|---|---|---|
| `editor.html?map=<name>` | Editor | Full game on a named map with EditorOverlay dev controls |
| `?designer` | Unified Designer | Browse all ships, POIs, and weapons with stats panels |

### `editor.html` — Editor / Playtest

- **Entry:** `js/editor-main.js`
- **Maps:** `js/data/maps/` — each file exports `MAP`; pass `?map=<name>` to select
- **Config:** `js/data/testConfig.js` — `startScrap`, `addRockets`, etc.
- **Default map:** `arena` — Pale at center, six derelicts in a hex ring, clean combat sandbox

**Available maps:**

| Param | File | Purpose |
|---|---|---|
| `?map=arena` (default) | `js/data/maps/arena.js` | Combat sandbox around Pale |
| `?map=blank` | `js/data/maps/blank.js` | Empty 18000×10000 scratch space |
| `?map=tyr` | `js/data/maps/tyr.js` | Full production map (Tyr) |

**Dev spawn controls (shown in EditorOverlay):**
- **Z**: Spawn Light Fighter (stalker) at mouse cursor
- **X**: Spawn Armed Hauler (kiter) at mouse cursor
- **C**: Spawn Salvage Mothership (standoff) at mouse cursor

**Every development iteration**, update the relevant map in `js/data/maps/` to include new entities/features so they're easy to reach. Tell the user to open `editor.html?map=<name>` to validate.

### `?designer` — Unified Designer

- **Source:** `js/test/designer.js`, entry: `js/designer-main.js`
- **Navigation:** `↑/↓` change category, `←/→` cycle item, `T` toggle rotation (ships), `R` reset view, scroll/drag to zoom/pan
- **Deep-link:** `?designer&category=<cat>&id=<slug>`
- **In scope:** `js/ships/**`, `js/enemies/**`, `js/world/**`, `js/weapons/**`, `js/ui/colors.js`
- Item slugs are defined in `js/test/designer.js` — check there for current IDs.

## Architecture

### Entry Point

`index.html` → `js/main.js` → creates `GameManager` → starts game loop.

### Core Systems

- **`js/game.js` / `GameManager`** — central orchestrator; owns entities, camera, renderer, HUD, particle pool, game state; drives `update(dt)` and `render()`
- **`js/loop.js`** — fixed-timestep loop (60 ticks/sec), spiral-of-death protection
- **`js/camera.js` / `Camera`** — world↔screen transform, exponential-lerp follow, visibility culling
- **`js/input.js` / `InputHandler`** (singleton) — keyboard hold/just-pressed, mouse position/buttons, flushed each tick
- **`js/renderer.js` / `Renderer`** — clears canvas, draws starfield, renders entities, then HUD/UI overlays

### Entity Types

`Entity` is the base class (`js/entities/entity.js`). `Ship` extends it with armor/hull/weapons/fuel. Ship subclasses override `_drawShape(ctx)` and `getBounds()`. Other entity types: `Projectile`, `LootDrop`, `Particle`, `Station`, `Planet`, `Derelict`.

Ship classes live in `js/ships/classes/`, player ship in `js/ships/player/`, enemies in `js/enemies/`, neutrals in `js/ships/neutral/`. The ship registry (`js/ships/registry.js`) is the single import point — add new ships there.

### Key Patterns

- **Entity list** — all entities in `GameManager.entities[]`, updated/rendered polymorphically; inactive purged each tick
- **Collision detection** — projectile-vs-ship circle checks in `GameManager._runCollisions()`
- **Raider AI** — `updateRaiderAI()` in `js/ai/raiderAI.js`; home position + patrol; aggro/deaggro range; behaviors: stalker, kiter, standoff, lurker, flee
- **Neutral AI** — `updateNeutralAI()` in `js/ai/neutralAI.js`; dispatches on `ship.neutralBehavior` ('trader' or 'militia')
- **Weapons** — component objects added via `addWeapon()`; player fires indexed weapon, AI fires all
- **Particle pool** — `js/systems/particlePool.js`, fixed slot count, presets: `explosion()`, `engineTrail()`
- **Map data** — `js/data/maps/tyr.js` is the full production map; `js/data/maps/` holds all named maps (tyr, arena, blank); each exports `MAP`
- **Centralized stats** — `js/data/stats.js` is the single source of truth for all base stats. Each ship/weapon defines multiplier constants and computes final values as `BASE_* × multiplier`. Never hardcode raw numbers in constructors.
- **UI overlays** — drawn on canvas, handle their own input; docking sets `isDocked = true`, skipping the simulation loop
- **Color palette** — `js/ui/colors.js` exports all color constants; never use inline hex strings

### Coordinate System

- Rotation 0 = pointing up (north, negative Y).
- World origin top-left; positive X right, positive Y down.

## Controls Reference

- **W/S or ↑/↓**: Increase/decrease throttle (step per press)
- **A/D or ←/→**: Rotate (continuous while held)
- **LMB or Space**: Fire primary weapon toward mouse cursor
- **RMB**: Fire secondary weapon (missiles/torpedoes) toward mouse cursor
- **R**: Toggle field armor/module repair (must be stopped)
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
- New idea → add to `IDEA.md` with next available code
- Feature ready to build → move from `IDEA.md` to `NEXT.md`

### Commits: Log to DEVLOG.md
Format: `CODE. YYYY-MMM-DD-HHMM: Feature name (one-line description)`
Major features only — no tuning passes, no small fixes.
