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
- **Lint:** `npm run lint` (ESLint)
- **Type check:** `npm run check` (TypeScript `checkJs`, no emit)
- **Compile data:** `npm run compile-data` (CSVs → `data/compiledData.js`)
- **Both:** `npm run validate` (lint + check)

### Validate After Every Change

**MANDATORY:** After completing any feature, fix, or unit of work, run `npm run validate` before considering the work done. Fix any new errors or warnings your changes introduced. Do not leave lint violations or type errors behind — the codebase should stay clean after every change.

## Feature Code Workflow

All features move through two stages:

1. **PLAN.md** — feature concepts with a letter code (e.g. `AN`). Ideas start rough and get refined here. Coded items are ready to build directly from this file.
2. **DEVLOG.md** — one line appended when the feature ships. Code is retired here permanently.

Small tweaks and bug fixes live in **FIXES.md** (no codes, just a flat bullet list).

**Assigning codes:** Check PLAN.md for the "next available code" header. Codes are sequential two-letter suffixes after `AM` (the last DEVLOG entry): `AN`, `AO`, `AP`, etc. Assign the next available code to each new idea when you add it to PLAN.md.

## Documentation Guide

**MANDATORY: Update these files whenever you make a relevant change. Do not skip this step.**

| File | Purpose | **Mandatory Update Triggers** |
|---|---|---|
| `MECHANICS.md` | Game mechanics — movement, weapons, damage, AI, economy, HUD | **ANY** mechanic added, removed, or changed. Controls changed. Economy changed. New systems. |
| `LORE.md` | Worldbuilding — history, factions, locations, tone | Faction names/traits changed. Location names changed. World tone or setting changed. |
| `UX.md` | UI aesthetic guide — color palette, component patterns, decision log | New UI component added. Color usage changed. Layout changed. Visual conventions changed. |
| `DEVLOG.md` | Development progress log — major features only | Every session — append one line per major feature completed. |
| `PLAN.md` | Feature plans & concepts with codes — ready to build | New ideas captured. Remove items when completed. |
| `FIXES.md` | Small tweaks & bug fixes (no codes) | Add minor fixes. Remove when completed. |
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
- **In scope:** `js/ships/**`, `js/npcs/**`, `js/world/**`, `js/modules/**`, `js/rendering/colors.js`
- Item slugs are defined in `js/test/designer.js` — check there for current IDs.

## Architecture

### Entry Point

`index.html` → `js/main.js` → creates `GameManager` → starts game loop.

### Core Systems

- **`js/game.js` / `GameManager`** — central orchestrator; owns entities, camera, renderer, HUD, particle pool, subsystems; delegates player inventory state to `PlayerInventory`; drives `update(dt)` and `render()`
- **`js/systems/playerInventory.js` / `PlayerInventory`** — owns all player inventory state: scrap, fuel, fuelMax, cargo, modules, weapons, ammo, fuelBurnRate, reactorOutput, reactorDraw. GameManager exposes forwarding accessors (`game.scrap`, `game.fuel`, etc.) for external consumers
- **`js/systems/salvageSystem.js` / `SalvageSystem`** — owns salvage state (`isSalvaging`, `salvageProgress`, `salvageTotal`, `salvageTarget`); `start()`, `update(dt)` → returns loot entities, `cancel()`
- **`js/systems/repairSystem.js` / `RepairSystem`** — owns repair state (`isRepairing`, `_repairAccum`, `_moduleRepairAccum`); `start()`, `update(dt, player, scrap)` → returns `{ scrapSpent }`, `cancel()`, `hasModulesToRepair(player)`, `maybeBreachModule(ship)` → returns `{ text, colorHint } | null`
- **`js/systems/collisionSystem.js` / `CollisionSystem`** — projectile interception, beam interception, main collision loop, AoE explosions; `update(entities, player, { particlePool, hud, repair, reputation, onEnemyKilled })` → returns `{ newEntities: [] }`
- **`js/systems/bountySystem.js` / `BountySystem`** — owns `activeBounties[]`; `onEnemyKilled()`, `acceptBounty()`, `collectCompleted()`, `updateExpiry()`
- **`js/systems/weaponSystem.js` / `WeaponSystem`** — weapon reload ticks, manual reload, ammo/guidance mode cycling, guided projectile targeting; `updateReloads()`, `manualReload()`, `cycleAmmoMode()`, `cycleGuidanceMode()`, `updateGuidance()`
- **`js/systems/interactionSystem.js` / `InteractionSystem`** — owns `nearbyStation`, `nearbyDerelict`; `updateDerelicts()`, `checkDocking()`, `checkLootPickups()`
- **`js/systems/navigationSystem.js` / `NavigationSystem`** — owns `waypoint { x, y, name, entity }`, `mapOpen`, map zoom/pan state; `setWaypoint()`, `clearWaypoint()`, `distanceTo()`, `bearingTo()`, `etaSeconds()`, `toggleMap()`, `fuelRangeRadius()`, `currentZone()`
- **`js/loop.js`** — fixed-timestep loop (60 ticks/sec), spiral-of-death protection
- **`js/camera.js` / `Camera`** — world↔screen transform, exponential-lerp follow, visibility culling
- **`js/input.js` / `InputHandler`** (singleton) — keyboard hold/just-pressed, mouse position/buttons, flushed each tick
- **`js/renderer.js` / `Renderer`** — clears canvas, draws starfield, renders entities, then HUD/UI overlays
- **`js/hud.js` / `HUD`** — thin orchestrator; bottom strip is DOM-based (`#hud-bottom`, `css/hudBottom.css`), updated via `_updateBottomStrip()` each frame; canvas sub-renderers in `js/hud/`: `minimap.js` (top-right minimap + zone/nav info), `mapView.js` (full-screen map overlay), `navIndicator.js` (edge-of-screen waypoint arrow), `shipAnchored.js` (weapon panels, throttle, integrity), `prompts.js` (dock/repair/salvage prompts, dev controls). Tooltip system via `showTooltip()`/`hideTooltip()`

### Entity Types

`Entity` is the base class (`js/entities/entity.js`). `Ship` extends it with armor/hull/weapons/fuel. Ship subclasses override `_drawShape(ctx)` and `getBounds()`. Other entity types: `Projectile`, `LootDrop`, `Particle`, `Station`, `Planet`. Derelicts are Ships with `crew = 0` (`ship.isDerelict` getter) — no separate Derelict class. Created via `createDerelict(data)` in `js/world/derelict.js`.

Ship classes live in `js/ships/classes/`, player ship in `js/ships/player/`, NPCs (enemies + neutrals) in `js/npcs/<faction>/`. The ship registry (`js/ships/registry.js`) is the single import point — add new ships there.

### Key Patterns

- **Entity list** — all entities in `GameManager.entities[]`, updated/rendered polymorphically; inactive purged each tick
- **Collision detection** — projectile-vs-ship circle checks in `CollisionSystem.update()`
- **Enemy AI** — `js/ai/shipAI.js`; home position + patrol; aggro/deaggro range; behaviors set via `this.ai = { ...AI_TEMPLATES.X }` from `@data/compiledData.js`: stalker, kiter, standoff, lurker, flee. All AI runtime state lives on `ship.ai.*` (e.g. `ship.ai._aggro`, `ship.ai._patrolAngle`, `ship.ai._lurkerState`). The ship's AI status string is `ship.aiStatus` (not `aiState`).
- **Neutral AI** — `js/ai/shipAI.js`; dispatches on `ship.ai.passiveBehavior` ('trader' or 'militia'). Trade route fields: `ship.ai._tradeRouteA/B`. Orbit fields: `ship.ai._orbitCenter/Radius/Speed/Angle`.
- **Weapons** — component objects added via `addWeapon()`; player fires indexed weapon, AI fires all
- **Particle pool** — `js/systems/particlePool.js`, fixed slot count, presets: `explosion()`, `engineTrail()`
- **Zone entities** — each world entity (station, derelict, terrain) is self-contained in `js/data/zones/<zone>/`. Named derelicts live in `js/data/ships/named/`. Every entity exports an object with `instantiate(x, y)` that returns a ready-to-use game entity. No factory dispatchers, no type-specific arrays.
- **MAP format** — maps use a single flat `entities[]` array of pre-instantiated objects. `game.js` has one loop: `for (const entity of map.entities) { push to entities; if Ship, push to ships }`. Zone manifests (e.g. `gravewake.js`) export `{ entities[], zones[], background[] }` which maps spread.
- **Map data** — `js/data/maps/tyr.js` is the full production map; `js/data/maps/` holds all named maps (tyr, arena, blank); each exports `MAP`
- **Centralized stats** — CSV files in `data/` are the single source of truth for all base stats, compiled at build time into `data/compiledData.js` by `scripts/compile-data.js`. Key-value CSVs: `shipBase.csv`, `weaponBase.csv`, `economy.csv`, `reputation.csv`. Tabular CSVs: `shipClasses.csv`, `shipsNamed.csv`, `moduleEngines.csv`, `moduleReactors.csv`, `moduleSensors.csv`, `moduleWeapons.csv`, `aiBehaviors.csv`. All JS files import from `@data/compiledData.js`. Each ship/weapon defines multiplier constants and computes final values as `BASE_* × multiplier`. Never hardcode raw numbers in constructors.
- **Thrust-to-weight** — `Ship.recalcTW(fuel?, cargoUsed?)` derives `speedMax`, `acceleration`, `turnRate` from T/W ratio using power curves. Called event-based (module swap, cargo change, dock/undock, condition change). `_refTwRatio` is set at construction; all derived stats are relative to it. Engine modules provide `thrust` and `weight`; all modules have `weight`. All NPC ships include engine modules in `moduleSlots`.
- **Weapon registry** — `js/modules/weapons/registry.js` exports `WEAPON_REGISTRY` (id → factory map) and `createWeaponById(id)`. Used by SalvageSystem and loot tables to instantiate weapons by string ID.
- **Station registry** — `js/world/stationRegistry.js` is a designer-only catalog. Each entry: `{ entity, id, flavorText }`. No factory dispatcher — entities self-instantiate.
- **UI overlays** — station panel (`#location-overlay`, right 30% DOM panel) and ship panel (`#ship-panel`, left 30% DOM panel) are HTML/CSS; bottom HUD (`#hud-bottom`, 48px fixed bar) is DOM. Docking sets `isDocked = true`, skipping the simulation loop. Ship screen (I key) pauses sim but keeps world rendering. Both panels use `pointer-events: auto` and `stopPropagation` to prevent canvas input bleed
- **Color palette** — `js/rendering/colors.js` exports all color constants; never use inline hex strings
- **Draw API** — `js/rendering/draw.js` exports reusable canvas primitives. Two layers:
  - **Immediate utilities** (take `ctx` as first arg): `polygon`, `polygonFill`, `polygonStroke`, `line`, `lines`, `disc`, `ring`, `trail`, `text`, `pulse`, `engineGlow`
  - **`Shape` class** — composable geometry templates with transform chaining (`.at()`, `.scaled()`, `.rotated()`, `.flipX()`, `.flipY()`) and draw methods (`.fill()`, `.stroke()`, `.draw()`). Factory methods: `Shape.rect()`, `Shape.chamferedRect()`, `Shape.cigar()`, `Shape.trapezoid()`, `Shape.wedge()`, `Shape.stadium()`, `Shape.cross()`, `Shape.ngon()`
  - **`DrawBatch` class** — deferred rendering that groups by style to minimize canvas state changes. Methods: `fillPoly`, `strokePoly`, `poly`, `line`, `disc`, `ring`, `rect`, `text`, then `flush()` to render all
  - **`text(ctx, str, x, y, color, opts)`** — world-space text. Options: `size` (12), `weight` ('normal'), `align` ('center'), `baseline` ('middle'), `alpha` (1), `font` ('monospace'). Batch equivalent: `batch.text(str, x, y, color, opts)`
  - Always use Draw API primitives for new rendering code instead of raw `ctx` calls. Import from `js/rendering/draw.js`.
  - **Prefer Shape factories and Draw helpers over raw point arrays.** When drawing geometry, always use `Shape.rect()`, `Shape.chamferedRect()`, `Shape.trapezoid()`, `Shape.wedge()`, etc. with `.at()`, `.scaled()`, `.rotated()` transforms so that a human can easily tweak position, width, height, scale, and rotation without editing point coordinates. If you need a shape that doesn't exist yet, add a new `Shape` factory method or standalone draw function to `js/rendering/draw.js` rather than hand-placing points. **Exception:** complex ship hull shapes that require directional armor arc rendering (`_drawShape`/`_drawHullArcs`) may use hand-placed point arrays when the hull silhouette cannot be composed from primitives.

### Coordinate System

- Rotation 0 = pointing up (north, negative Y).
- World origin top-left; positive X right, positive Y down.

### Direction & Dimension Terminology

When the user says:
- **Width** — size along the X axis (left to right)
- **Height** — size along the Y axis (top to bottom)
- **Up / move up** — decrease Y (toward top of screen)
- **Down / move down** — increase Y (toward bottom of screen)
- **Left / Right** — decrease / increase X
- **On top / above** — drawn later (higher z-order, visually in front)
- **Underneath / below / behind** — drawn earlier (lower z-order, visually behind)

## Controls Reference

- **W/S or ↑/↓**: Increase/decrease throttle (step per press)
- **A/D or ←/→**: Rotate (continuous while held)
- **F**: Toggle combat mode (enables weapons, tactical HUD)
- **LMB or Space**: Fire primary weapon toward mouse cursor (combat mode only)
- **RMB**: Fire secondary weapon (missiles/torpedoes) toward mouse cursor (combat mode only)
- **R**: Toggle field armor/module repair (must be stopped)
- **E**: Dock at nearby station / begin salvage on nearby derelict
- **I**: Toggle Ship Status screen (paper doll, modules, stats, cargo)
- **M**: Toggle full-screen system map (click to set waypoint, right-click to clear, scroll/drag to zoom/pan)
- **Scroll wheel**: Zoom in/out (0.2–1.5×, smooth lerp)
- **Esc**: Cancel salvage / close station screen / close ship screen / close map

## Rules & Conventions

### Stats: Multiplier Pattern
Never hardcode raw stat numbers in ship/weapon constructors. All base values live in `data/*.csv` (compiled to `data/compiledData.js`; see Key Patterns above). Each ship/weapon file defines a multiplier (e.g. `HULL_MULT = 1.5`) and computes the final value as `BASE_HULL * HULL_MULT`. Global pacing knobs: `SPEED_FACTOR` (in `data/shipBase.csv`) and `PROJECTILE_SPEED_FACTOR` (in `data/weaponBase.csv`).

Ship classes use `this._initStats({ speed, accel, turn, hull, cargo, fuelMax, fuelEff, armorFront, armorSide, armorAft })` from `Ship` base to set all stats in one call. Subclasses that only override a subset (e.g. enemies that don't set cargo/fuel) can omit those keys — they'll keep the parent's values.

### Colors: Always Use `js/rendering/colors.js`
Never use inline hex strings anywhere in the codebase. Import named constants from `js/rendering/colors.js`. If a new color is needed, add it there first.

### Docs: Always Update After Changes
- Mechanic added/changed → `MECHANICS.md`
- Visual/UI changed → `UX.md`
- Lore/names changed → `LORE.md`
- Major feature completed → append one line to `DEVLOG.md`
- New idea → add to `PLAN.md` with next available code
- Small fix or tweak → add to `FIXES.md`

### Commits: Log to DEVLOG.md
Format: `CODE. YYYY-MMM-DD-HHMM: Feature name (one-line description)`
Major features only — no tuning passes, no small fixes.

### Dead Code: Run `/dead-code` After Major Refactors
After any major refactor (file moves, system extractions, renderer rewrites, UI overhauls), run `/dead-code` to scan for orphaned files, unused exports/imports, stale data fields, and dead CSS. Clean up before moving on.

### Skills: Keep `.claude/commands/` in Sync
After any architectural change (new file paths, renamed systems, changed patterns, new module types, new behaviors), scan the skill files in `.claude/commands/wayfarer/` and update any instructions that reference the changed paths or APIs. Specifically watch for:
- File path changes (e.g. `js/data/tuning/*.js` → `data/*.csv` + `@data/compiledData.js`)
- Renamed classes, modules, or behavior types
- New or removed weapon/module/AI types listed in skill templates
- Verification URL changes (`?test` is not a valid harness — use `editor.html?map=arena` or `?designer`)
