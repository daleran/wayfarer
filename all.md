# === CLAUDE.md ===

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
| `MECHANICS.md` | Game mechanics — behavioral descriptions only (no specific items, values, or tuning) | New *system* or *behavior* added, removed, or changed. Controls changed. **NOT** triggered by adding items, ships, weapons, ammo types, or tuning values — those live in `data/*.js`/code. |
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
| `designer.html` | Unified Designer | Browse all ships, POIs, and weapons with stats panels |

### `editor.html` — Editor / Playtest

- **Entry:** `src/editor-main.js`
- **Maps:** `data/maps/` — each file exports `MAP`; pass `?map=<name>` to select
- **Default map:** `arena` — Pale at center, six derelicts in a hex ring, clean combat sandbox

**Available maps:**

| Param | File | Purpose |
|---|---|---|
| `?map=arena` (default) | `data/maps/arena.js` | Combat sandbox around Pale |
| `?map=blank` | `data/maps/blank.js` | Empty 18000×10000 scratch space |
| `?map=tyr` | `data/maps/tyr.js` | Full production map (Tyr) |

**Dev spawn controls (shown in EditorOverlay):**
- **Z**: Spawn Light Fighter (stalker) at mouse cursor
- **X**: Spawn Armed Hauler (kiter) at mouse cursor
- **C**: Spawn Salvage Mothership (standoff) at mouse cursor

**Every development iteration**, update the relevant map in `data/maps/` to include new entities/features so they're easy to reach. Tell the user to open `editor.html?map=<name>` to validate.

### `editor.html` — DOM Panels

Editor UI chrome is DOM-based (not canvas). Classes in `src/ui/editorPanels.js`, styled by `css/editor.css`:
- **`EditorHUDBar`** — fixed top status bar with hotkey segments
- **`EditorSidebar`** — right panel for object browsing/placement (toggle: `-` key)
- **`EditorItemMenu`** — left panel for adding items to cargo (toggle: `[` key)
- **`EditorPanBanner`** — pan mode indicator banner

Only `_renderDebugOverlay()` remains on canvas (world-space entity tracking).

### `designer.html` — Unified Designer

- **Source:** `src/test/designer.js`, entry: `src/designer-main.js`
- **Navigation:** `↑/↓` change category, `←/→` cycle item, `T` toggle rotation (ships), `R` reset view, scroll/drag to zoom/pan
- **Deep-link:** `designer.html?category=<cat>&id=<slug>`
- **In scope:** `data/hulls/**`, `src/entities/**`, `src/modules/**`, `src/rendering/colors.js`, `data/actors/**`, `data/locations/**`
- Item slugs are defined in `src/test/designer.js` — check there for current IDs.

### `designer.html` — DOM Panel

Stats panel is DOM-based. `DesignerPanel` class in `src/ui/designerPanel.js`, styled by `css/designer.css`. Preview renderers (ship silhouettes, grids, module icons, weapon animations, module slot boxes + connection lines) remain on canvas.

## Architecture

### Entry Point

`index.html` → `src/main.js` → creates `GameManager` → starts game loop.

### Core Systems

- **`src/game.js` / `GameManager`** — central orchestrator; owns entities, camera, renderer, HUD, particle pool, subsystems; delegates player inventory state to `PlayerInventory`; drives `update(dt)` and `render()`
- **`src/systems/playerInventory.js` / `PlayerInventory`** — owns all player inventory state: scrap, fuel, fuelMax, cargo, modules, weapons, ammo, fuelBurnRate, reactorOutput, reactorDraw. GameManager exposes forwarding accessors (`game.scrap`, `game.fuel`, etc.) for external consumers
- **`src/systems/salvageSystem.js` / `SalvageSystem`** — owns salvage state (`isSalvaging`, `salvageProgress`, `salvageTotal`, `salvageTarget`); `start()`, `update(dt)` → returns loot entities, `cancel()`
- **`src/systems/repairSystem.js` / `RepairSystem`** — owns repair state (`isRepairing`, `_repairAccum`, `_moduleRepairAccum`); `start()`, `update(dt, player, scrap)` → returns `{ scrapSpent }`, `cancel()`, `hasModulesToRepair(player)`, `maybeBreachModule(ship)` → returns `{ text, colorHint } | null`
- **`src/systems/collisionSystem.js` / `CollisionSystem`** — projectile interception, beam interception, main collision loop, AoE explosions; `update(entities, player, { particlePool, hud, repair, reputation, onEnemyKilled })` → returns `{ newEntities: [] }`
- **`src/systems/bountySystem.js` / `BountySystem`** — owns `activeBounties[]`; `onEnemyKilled()`, `acceptBounty()`, `collectCompleted()`, `updateExpiry()`
- **`src/systems/weaponSystem.js` / `WeaponSystem`** — weapon reload ticks, manual reload, ammo cycling, guided projectile targeting; `updateReloads()`, `manualReload()`, `cycleAmmo()`, `updateGuidance()`
- **`src/systems/interactionSystem.js` / `InteractionSystem`** — owns `nearbyStation`, `nearbyDerelict`; `updateDerelicts()`, `checkDocking()`, `checkLootPickups()`
- **`src/systems/navigationSystem.js` / `NavigationSystem`** — owns `waypoint { x, y, name, entity }`, `mapOpen`, map zoom/pan state; `setWaypoint()`, `clearWaypoint()`, `distanceTo()`, `bearingTo()`, `etaSeconds()`, `toggleMap()`, `fuelRangeRadius()`, `currentZone()`
- **`src/loop.js`** — fixed-timestep loop (60 ticks/sec), spiral-of-death protection
- **`src/camera.js` / `Camera`** — world↔screen transform, exponential-lerp follow, visibility culling
- **`src/input.js` / `InputHandler`** (singleton) — keyboard hold/just-pressed, mouse position/buttons, flushed each tick
- **`src/renderer.js` / `Renderer`** — clears canvas, draws starfield, renders entities, then HUD/UI overlays
- **`src/hud.js` / `HUD`** — thin orchestrator; bottom strip is DOM-based (`#hud-bottom`, `css/hudBottom.css`), updated via `_updateBottomStrip()` each frame; canvas sub-renderers in `src/hud/`: `minimap.js` (top-right minimap + zone/nav info), `mapView.js` (full-screen map overlay), `navIndicator.js` (edge-of-screen waypoint arrow), `shipAnchored.js` (weapon panels, throttle, integrity), `prompts.js` (dock/repair/salvage prompts, dev controls). Tooltip system via `showTooltip()`/`hideTooltip()`

### Entity Types

`Entity` is the base class (`src/entities/entity.js`). `Ship` extends it with armor/hull/weapons/fuel. Ship subclasses override `_drawShape(ctx)` and `getBounds()`. Other entity types: `Projectile`, `LootDrop`, `Particle`, `Station`, `Planet`. Derelicts are Ships with `crew = 0` (`ship.isDerelict` getter) — no separate Derelict class. Created via `createDerelict(data)` from `src/entities/registry.js`.

**Character** (`src/entities/character.js`) — a person who can inhabit a ship. Has `id`, `name`, `faction`, `relation`, `behavior`, `flavorText`, `ai`, `inShip`. `boardShip(ship)` syncs faction/relation/ai onto the ship and sets `ship.captain`; `leaveShip()` resets the ship to inert. Concord machines (drones, frigates) are unmanned — no Character, faction/relation/ai set directly on the ship.

Ship hull classes live in `data/hulls/*/hull.js` — each self-registers into `CONTENT.hulls` at import time. Concord entity subclasses (with custom behavior like drone spawning, latching) live in `src/entities/concord/`. The registry (`src/entities/registry.js`) provides `createActor()`/`createDerelict()`/`createShip()` factories that read from `CONTENT.hulls` and `NPC_SHIPS`. `CHARACTER_REGISTRY` (aliased as `NPC_REGISTRY`) is auto-generated from `NPC_SHIPS`. `game.characters[]` tracks all active Characters; `game.playerCharacter` is the player's Character.

**Data-driven NPC creation** — NPC definitions live in `data/actors/<faction>/*.js` (ship loadouts, flavorText, character data) — each self-registers into both `NPC_SHIPS` and `CONTENT.actors`. Bounty characters live in `data/actors/scavenger/characters.js`. No per-NPC factory files — `createActor()` reads from data and assembles entities generically.

### Key Patterns

- **Entity list** — all entities in `GameManager.entities[]`, updated/rendered polymorphically; inactive purged each tick
- **Collision detection** — projectile-vs-ship circle checks in `CollisionSystem.update()`
- **Enemy AI** — `src/ai/shipAI.js`; home position + patrol; aggro/deaggro range; behaviors set via `this.ai = { ...AI_TEMPLATES.X }` from `@data/index.js`: stalker, kiter, standoff, lurker, flee. All AI runtime state lives on `ship.ai.*` (e.g. `ship.ai._aggro`, `ship.ai._patrolAngle`, `ship.ai._lurkerState`). The ship's AI status string is `ship.aiStatus` (not `aiState`).
- **Neutral AI** — `src/ai/shipAI.js`; dispatches on `ship.ai.passiveBehavior` ('trader' or 'militia'). Trade route fields: `ship.ai._tradeRouteA/B`. Orbit fields: `ship.ai._orbitCenter/Radius/Speed/Angle`.
- **Weapons** — component objects added via `addWeapon()`; player fires indexed weapon, AI fires all
- **Particle pool** — `src/systems/particlePool.js`, fixed slot count, presets: `explosion()`, `engineTrail()`
- **Zone entities** — content is co-located: stations in `data/locations/<id>/` (station data + renderer + conversations), terrain in `data/terrain/<id>/` (renderer + placement data merged), derelicts in `data/ships/named/`. All self-register into `CONTENT` tables at import time. Every data entity exports an object with `instantiate(x, y)` that returns a ready-to-use game entity.
- **MAP format** — maps use a single flat `entities[]` array of pre-instantiated objects. `game.js` has one loop: `for (const entity of map.entities) { push to entities; if Ship, push to ships }`. Zone manifests (e.g. `gravewake.js`) export `{ entities[], zones[], background[] }` which maps spread.
- **Map data** — `data/maps/tyr.js` is the full production map; `data/maps/` holds all named maps (tyr, arena, blank); each exports `MAP`
- **Centralized stats** — JS data files in `data/` are the single source of truth for all base stats and content definitions. Single registry file `data/dataRegistry.js` holds both equipment tables (ENGINES, WEAPONS, etc.) and content tables (`CONTENT.hulls`, `.actors`, `.stations`, `.conversations`, `.derelicts`, `.terrain`, `.characters`). Two helpers: `registerData(table, entries)` for bulk-assigning equipment entries, `registerContent(type, id, entry)` for single content entries. Content files self-register at import time. `data/index.js` boots all content files and re-exports everything. Content locations: `data/hulls/` (hull classes), `data/actors/` (NPC definitions), `data/locations/` (station data + renderers + conversations), `data/terrain/` (terrain renderers + data), `data/ships/named/` (derelict descriptors), `data/modules/` (equipment), `data/maps/` (map definitions). `data/tuning.js` holds global scalar constants. Each ship/weapon defines multiplier constants and computes final values as `BASE_* × multiplier`. Never hardcode raw numbers in constructors. To add new content, create a file in the appropriate `data/` subdirectory using `registerContent()` and/or `registerData()`, then import it in `data/index.js`.
- **Thrust-to-weight** — `Ship.recalcTW(fuel?, cargoUsed?)` derives `speedMax`, `acceleration`, `turnRate`, and `fuelEfficiency` purely from engine modules. Hull classes define only mass, durability, cargo, fuel tank, and armor — no inherent speed or agility. T/W ratio is computed against a global `REFERENCE_TW` constant using power curves. Called event-based (module swap, cargo change, dock/undock, condition change). Engine modules provide `thrust`, `weight`, and `fuelEffMult`; all modules have `weight`. All NPC ships include engine modules in `moduleSlots`.
- **Mount points** — each ship class defines `MOUNT_POINTS[]` and overrides `get _mountPoints()`. Index `i` maps to `moduleSlots[i]`. Each mount has `{ x, y, arc, size, slot? }` where `arc` is `'front'|'port'|'starboard'|'aft'`, `size` is `'small'|'large'`, and `slot` is `'engine'` for engine-only mounts (omitted for general-purpose). Used for: (1) drawing module icons on the hull via `_drawModules(ctx)` in `Ship.render()`, (2) positional module breach routing — hits to an arc preferentially damage modules in that arc, (3) install constraints in the Ship Screen — engine slots only accept engines and vice versa. Empty mounts render as dotted white squares; engine mounts show `[E]`. Module visuals: `src/rendering/moduleVisuals.js`.
- **Weapon registry** — `src/modules/weapons/registry.js` exports `WEAPON_REGISTRY` (id → factory map) and `createWeaponById(id)`. Used by SalvageSystem and loot tables to instantiate weapons by string ID.
- **Content registry** — `data/contentRegistry.js` exports `CONTENT` (type-keyed sub-objects) and `registerContent(type, id, entry)`. Content files call `registerContent()` at import time. Designer and editor read from `CONTENT.stations`, `CONTENT.derelicts`, etc. instead of hand-maintained registry arrays.
- **UI overlays** — narrative panel (`#narrative-panel`, right 30% DOM panel, `src/ui/narrativePanel.js`) and ship panel (`#ship-panel`, left 30% DOM panel) are HTML/CSS; bottom HUD (`#hud-bottom`, 48px fixed bar) is DOM. Docking sets `isDocked = true`, skipping the simulation loop. Ship screen (I key) pauses sim but keeps world rendering. Both panels use `pointer-events: auto` and `stopPropagation` to prevent canvas input bleed
- **Narrative system** — station interactions use scrolling conversation logs (Disco Elysium-style). `NarrativePanel` reads from `CONTENT.conversations`. Conversation scripts are async functions in `data/locations/<station>/conversations/` (station-specific) or `data/conversations/` (generic) that `await log.choices(...)` for player input. Each self-registers via `registerContent('conversations', id, fn)`. Station data includes `conversations: { hub, zones: {} }` pointing to script IDs. `game.storyFlags = {}` tracks first-visit flags and NPC memory (session-only)
- **Color palette** — `src/rendering/colors.js` exports all color constants; never use inline hex strings
- **CSS utility system** — `css/panel.css` defines CSS custom properties (`--p-text: 13px`, `--p-title: 16px`, `--p-small: 11px`), text color utilities (`.t-cyan`, `.t-amber`, etc.), and typography patterns (`.p-heading`, `.p-subheading`, `.p-text`, `.p-label`, `.p-hint`, `.p-small`). All DOM panel CSS files inherit from these. Never hardcode `px` font sizes in panel CSS — use `var()` references.
- **Draw API** — `src/rendering/draw.js` exports reusable canvas primitives. Two layers:
  - **Immediate utilities** (take `ctx` as first arg): `polygon`, `polygonFill`, `polygonStroke`, `line`, `lines`, `disc`, `ring`, `trail`, `text`, `pulse`, `engineGlow`
  - **`Shape` class** — composable geometry templates with transform chaining (`.at()`, `.scaled()`, `.rotated()`, `.flipX()`, `.flipY()`) and draw methods (`.fill()`, `.stroke()`, `.draw()`). Factory methods: `Shape.rect()`, `Shape.chamferedRect()`, `Shape.cigar()`, `Shape.trapezoid()`, `Shape.wedge()`, `Shape.stadium()`, `Shape.cross()`, `Shape.ngon()`
  - **`DrawBatch` class** — deferred rendering that groups by style to minimize canvas state changes. Methods: `fillPoly`, `strokePoly`, `poly`, `line`, `disc`, `ring`, `rect`, `text`, then `flush()` to render all
  - **`text(ctx, str, x, y, color, opts)`** — world-space text. Options: `size` (12), `weight` ('normal'), `align` ('center'), `baseline` ('middle'), `alpha` (1), `font` ('monospace'). Batch equivalent: `batch.text(str, x, y, color, opts)`
  - Always use Draw API primitives for new rendering code instead of raw `ctx` calls. Import from `src/rendering/draw.js`.
  - **Prefer Shape factories and Draw helpers over raw point arrays.** When drawing geometry, always use `Shape.rect()`, `Shape.chamferedRect()`, `Shape.trapezoid()`, `Shape.wedge()`, etc. with `.at()`, `.scaled()`, `.rotated()` transforms so that a human can easily tweak position, width, height, scale, and rotation without editing point coordinates. If you need a shape that doesn't exist yet, add a new `Shape` factory method or standalone draw function to `src/rendering/draw.js` rather than hand-placing points. **Exception:** complex ship hull shapes that require directional armor arc rendering (`_drawShape`/`_drawHullArcs`) may use hand-placed point arrays when the hull silhouette cannot be composed from primitives.

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
Never hardcode raw stat numbers in ship/weapon constructors. All base values live in `data/*.js` (see Key Patterns above). Each ship/weapon file defines a multiplier (e.g. `HULL_MULT = 1.5`) and computes the final value as `BASE_HULL * HULL_MULT`. Global pacing knobs: `SPEED_FACTOR` and `PROJECTILE_SPEED_FACTOR` in `data/tuning.js`.

Ship classes use `this._initStats({ hull, weight, cargo, fuelMax, armorFront, armorSide, armorAft })` from `Ship` base to set hull stats. Movement stats (speed, acceleration, turn rate) and fuel efficiency are **purely engine-derived** via `recalcTW()` — hull classes never define them.

### Colors: Always Use `src/rendering/colors.js`
Never use inline hex strings anywhere in the codebase. Import named constants from `src/rendering/colors.js`. If a new color is needed, add it there first.

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

### Skills & Designer: Keep in Sync

**Content skills** (create or edit game content — each handles both new and existing items):

| Skill | Scope | Key registries |
|---|---|---|
| `/ship-class` | Hull templates: shape, stats, mount points | `CONTENT.hulls` via self-registration; hull files in `data/hulls/*/hull.js` |
| `/named-ship` | Configured ship instances (captained = NPC, no captain = derelict) | `NPC_SHIPS` + `CONTENT.actors` in `data/actors/<faction>/*.js`; `CHARACTER_REGISTRY` auto-generated in `src/entities/registry.js`; `CONTENT.derelicts` in `data/ships/named/` |
| `/character` | Named people who board ships | `CHARACTERS` + `CONTENT.characters` in `data/actors/scavenger/characters.js`; Character class in `src/entities/character.js` |
| `/station` | Dockable locations with services and renderers | `CONTENT.stations` in `data/locations/*/station.js`; renderers in `data/locations/*/renderer.js`; conversations in `data/locations/*/conversations/` |
| `/module` | Ship modules AND weapons (combined) | `MODULE_REGISTRY` in `src/modules/shipModule.js`; `WEAPON_REGISTRY` in `src/modules/weapons/registry.js`; ID registry in `src/modules/registry.js` |

**Audit skills:** `/code-review`, `/stat-audit`, `/dead-code`

**MANDATORY: After any substantive change to a system, registry, or content type:**
1. Read all skill files in `.claude/commands/wayfarer/` that reference the changed system
2. Update file paths, class names, registry formats, CSV columns, behavior types, and designer category IDs
3. Update `src/test/designer.js` if the change affects how items are built, categorized, or displayed
4. Verify designer deep-links still work (`designer.html?category=<cat>&id=<slug>`)

**Watch for these specific changes:**
- File path moves (e.g. data file reorganizations)
- Renamed classes, modules, or behavior types
- New or removed entries in any registry (`CONTENT.hulls`, `CONTENT.actors`, `CONTENT.stations`, `CONTENT.derelicts`, `CONTENT.conversations`, `CHARACTER_REGISTRY`, `MODULE_REGISTRY`, `WEAPON_REGISTRY`)
- Data field additions/removals in `data/**/*.js`
- Designer category changes in `src/test/designer.js` (`CATEGORIES` array)
- New or changed `Character` fields in `src/entities/character.js`
- New or changed NPC data in `data/actors/**/*.js`
- New boot imports needed in `data/index.js` for self-registering content


# === DEVLOG.md ===

# Wayfarer — Development Log

Major features only. Format: `CODE. YYYY-MMM-DD-HHMM: Feature name`

---

A. 2026-MAR-07-0000: Phase 1 Engine — canvas loop, camera, input, starfield, entity/ship base classes
B. 2026-MAR-07-0000: Phase 2 Combat — projectiles, particles, raider AI, HUD combat readouts
C. 2026-MAR-07-0000: Phase 3 World & Stations — station/planet entities, docking, station screen
D. 2026-MAR-07-0000: Phase 4 Trade Economy — 4 base commodities (Food, Ore, Tech, Exotics); supply/demand price multipliers; station docking and trade UI
E. 2026-MAR-07-0000: UI Overhaul — vector monitor / cassette futurism aesthetic; CRT scanline effects; amber/cyan/green color palette
F. 2026-MAR-07-0000: Lore & Ship Redesign — faction/location rename; all 5 ship silhouettes redesigned for industrial sci-fi look
G. 2026-MAR-07-0000: Weapon System — Autocannon standardized; laser split-damage model (Shield vs Hull); projectile color coding
H. 2026-MAR-07-0000: Phase 5 Loot & Salvage — loot drops (Scrap, Fuel, Commodities); derelict salvage mechanics; scrap-based economy foundation
I. 2026-MAR-07-0000: Systems Overhaul — removed Credits, Crew, and Fleet systems; consolidated to Scrap-only economy; simplified weapon cooldowns (removed crew scaling)
J. 2026-MAR-07-0000: Combat2 — quad-arc positional armor (Front/Port/Starboard/Aft); tactical AI (shielding/interceptor/kiter); rockets introduced
K. 2026-MAR-07-0000: Gravewake Zone — arkship spines (shattered structural beams), debris clouds, CoilStation terrain structure
L. 2026-MAR-07-0000: Station Intel Tab — lore text display per station; unique background stories for The Coil and Ashveil Anchorage
M. 2026-MAR-07-0000: Rocket AoE — click-point detonation; expanding amber blast; friendly fire logic for area-of-effect munitions
N. 2026-MAR-07-0000: Test Harnesses — ?test-ships (ship designer), ?test-poi (POI designer) with individual deep-links
O. 2026-MAR-08-0000: Capital Ship Scale — zoom 0.4×, slow movement, long-range projectiles, armor rebalance
P. 2026-MAR-08-0000: Centralized Stats — js/data/stats.js, multiplier pattern for all ships/weapons
Q. 2026-MAR-08-1200: Stat Audit — BASE_ARMOR/BASE_HULL_DAMAGE/BASE_COOLDOWN added; all ships/weapons use multiplier pattern; crosshair cursor with range indicator
R. 2026-MAR-08-0000: Designer Deep-Links — URL slugs for ?test-ships and ?test-poi harnesses
S. 2026-MAR-08-0000: Weapon System Expansion — 11 weapon families including Lance (beam), Railgun (high velocity), Flak (AoE burst), and guided Heat/Wire missiles
T. 2026-MAR-08-0000: Doc Reorganization — MECHANICS.md, UX.md, NEXT.md; retired SPEC.md and UI.md
U. 2026-MAR-08-0000: Unified Designer — merged ship/POI designers into single ?designer harness with category navigation (Ships, Stations, POIs, Modules, Weapons) and weapon stats panel
V. 2026-MAR-08-0000: Ship Architecture Overhaul — OnyxClassTug asymmetric working vessel template; Hullbreaker player variant (salvage-modified Onyx); central ship registry; per-ship fuel tank and efficiency
W. 2026-MAR-08-0000: Enemy & Ship Overhaul — 3 new base ship classes (Swift Runner, G100 Class Hauler, Decommissioned Frigate), 3 new scavenger enemies (Light Fighter, Armed Hauler, Salvage Mothership), stalker and standoff AI behaviors
X. 2026-MAR-08-0000: Dec Frigate Redesign — Fletcher-class workhorse silhouette (2× scale, utilitarian straight lines, twin outboard nacelles on pylons); flavor text added to all 10 ship classes
Y. 2026-MAR-08-0000: Neutral Traffic (Phase 1-2) — trade convoys on 3 routes, militia orbit around The Coil, 2 new neutral stations (Kell's Stop, Ashveil Anchorage)
Z. 2026-MAR-08-0000: Station Registry + Kell's Stop — central stationRegistry.js (mirrors ship registry), FuelDepotStation renderer (platform + ops block + two massive fuel tanks), renamed Thorngate Relay → Kell's Stop
AA. 2026-MAR-08-0000: Ship Modules — slot system (shipModule.js), HydrogenFuelCell idle drain, 4-slot Hullbreaker, enemy ship module loadouts
AB. 2026-MAR-08-0000: Ship Screen — [I] key overlay with paper doll (armor rings, hull bar), module slots, cargo list, weapon list
AC. 2026-MAR-08-0000: Bug Fixes — FlakCannon maxRange, enemy AI fire range gate, enemy damage visual tiers (darkening/slow fire/slow movement), Coil color to amber
AD. 2026-MAR-08-0000: Grave-Clan Lurker AI — GraveClanAmbusher enemy (lurker behavior): hides at spawn cover point, scans for traders, pounces with autocannon + heat missile, switches to player if they engage
AE. 2026-MAR-08-0000: Kill Log + Range Circle + Module Install — kill log (upper-right, 3s fade), weapon range circle (dashed world-space ring), flak AoE cursor ring, module loot drops (10% chance, cyan diamond), install via Ship Screen click with 1.5s progress bar, remove by clicking slot
AF. 2026-MAR-08-0000: Finite Ammo + Ammo Cargo — autocannon (60 rds, 6 cu), rockets (6×1cu, 3-pod×2cu), missiles (6×1cu); round count in primary HUD; rocket pips + reload bar (1 pip basic, 5-pip burst pod); ammo weight included in cargo bar
AG. 2026-MAR-08-0000: Bounty Board — per-station kill contracts (named targets, timed expiry, scrap rewards); Bounties tab in station screen; accept/complete/collect/expiry loop
AH. 2026-MAR-08-0000: Power Plant System — 4 reactor types (H2 Fuel Cell S, Fission S/L, Fusion L); fission overhaul mechanic (3-4h intervals, 60% power when overdue, overhaul at Ashveil Anchorage for 800-1500 scrap); HUD overdue warning; module update tick loop
AI. 2026-MAR-08-0000: Salvage Expansion — 4 derelict hull classes (hauler/fighter/frigate/unknown) with distinct polygon shapes (Broken Covenant, Hollow March); module condition system (good/worn/faulty/damaged/destroyed); weapon drops (MAGENTA diamond) and ammo drops (GREEN diamond); Ship Screen condition badges and tooltip MULT row; ammoType metadata on weapons
AJ. 2026-MAR-08-0000: Hull Breach + Module Repair — hull hits below 60% chance to degrade random installed module (tiered 12/25/40%); field module repair via R key (15 scrap/step, 4 sec/step); orange repair bar in HUD; pickup text alerts on breach
AK. 2026-MAR-08-0000: Reputation System — 6-faction standing (-100 to +100) including Scavenger Clans, Concord Remnants, and Monastic Orders; kill/bounty/neutral-attack triggers; station header badge; Relations tab; docking refused at ≤-50; 15% Allied discount
AL. 2026-MAR-08-0000: Commodity Expansion — 4 generic commodities replaced with 15 specific lore-flavored commodities (Ration Packs, Void Crystals, Data Cores); trade screen filtered to show only stocked/held rows; per-station commodity profiles; loot tables updated
AM. 2026-MAR-10-1200: Devlog Audit — Fleshed out 20+ entries with specific technical details (quad-arc armor, asymmetric Onyx design, 15 commodities, faction names, and derelict lore names) based on codebase inspection.
AP. 2026-MAR-10-1500: Code-Driven Editor — /editor harness (port 5177) with full GameManager instance; EditorOverlay adds pan mode (` key, WASD+scroll), per-entity debug stat overlay (G key, HP/ARM/SPD/state + velocity and aim vectors), object sidebar (O key, 4 categories: ships/stations/derelicts/enemies), live entity placement (U key, coords logged to console); ?map=test|prod|blank param; js/data/maps/blank.js empty 18000×10000 map.
AQ. 2026-MAR-10-1800: Weapon System Redesign — Autocannon/Cannon AP/HE ammo modes; Rocket → RocketPodSmall/Large (2-tube / 8-tube) with dumbfire/wire/heat guidance modes; Railgun 3 variants (SF/LT/LF); Lance 4 variants (SF/ST/LF/LT) with hull-factor and beam interception on ST; Plasma rebalanced (turret only, 2 variants); GatlingGun manual-fire with magazine; hit flash on all ships; beam interception pass in collision system; [ ] { } weapon cycling keys, 1/2 ammo/guidance mode cycling.
BI. 2026-MAR-10-0000: Game Data Rearchitecture — stats.js split into 5 domain tuning files; named ships in js/ships/named/; character files in js/npcs/characters/; station files in js/world/stations/ with bounty boards; terrain files in js/world/terrain/; module registry in js/modules/; zone manifest in js/world/zones/gravewake.js; tyr.js now a thin world composer.
BJ. 2026-MAR-10-0000: Unified Ship AI — raiderAI.js + neutralAI.js replaced by single shipAI.js; raiders[]/neutralShips[] replaced by ships[]; ship.ai object spread from AI_TEMPLATES replaces behaviorType/neutralBehavior; neutral ships turn hostile on player contact (relation='hostile', _aggro=true); militia combatBehavior=stalker, trader combatBehavior=flee.
BK. 2026-MAR-11-0000: Concord Enemies — DroneControlFrigate (standoff, lance weapon, spawns 3 Snatcher Drones every 12s from lateral bay notches) and SnatcHerDrone (stalker, no weapons, latches at 35px range and drains 8 armor/sec + 2 hull/sec until killed); spawn/pickup-text queue pattern in game.js; CONCORD_BLUE faction stroke override.
BH. 2026-MAR-11-1500: Station Overhaul — HTML/CSS LocationOverlay replaces canvas StationScreen; zone-map navigation (map → zone → service); The Coil SVG schematic with 5 clickable zones (The Dock, Salvage Yard, Central Market, The Palace rep-gated, The Slums); Kell's Stop and Ashveil Anchorage simple layouts; 6 service modules (repair, trade, bounties, relations, reactor, intel); full-screen modal with scanline/cassette-futurism CSS.
BL. 2026-MAR-11-1800: Architecture Reorganization — weapons moved js/weapons/ → js/modules/weapons/ (9 files); enemies moved js/enemies/ → js/npcs/<faction>/ (6 files); neutrals moved js/ships/neutral/ → js/npcs/settlements/ (2 files); shipModule moved js/systems/ → js/modules/; 6 systems extracted from game.js into standalone classes (CollisionSystem, WeaponSystem, SalvageSystem, RepairSystem, BountySystem, InteractionSystem); renderer draw helpers extracted to js/rendering/draw.js; ship classes simplified with _initStats() pattern; engineGlow.js deleted; Planet Pale atmospheric rendering added; game.js reduced by ~600 lines.
BM. 2026-MAR-11-2000: Cohesion Refactor — PlayerInventory extracted from GameManager (scrap/fuel/cargo/modules/weapons/ammo); HUD split into 4 sub-renderers (minimap, bottomStrip, shipAnchored, prompts); AI state consolidated from ship._ to ship.ai._; weapon registry added (js/modules/weapons/registry.js); reputation constants moved to reputationTuning.js.
CC. 2026-MAR-11-2200: Station Map Detail & Scale — AshveilStation custom renderer (colony ship hull, ~200px span, dockingRadius=180, docked ships, running lights, approach beam); context-dependent station sizes across 3 Gravewake stations.
CB. 2026-MAR-11-2200: Station UI → Right Panel — LocationOverlay from full-screen to 30% right-side panel; world visible behind; camera centers on docked station; zone panel stacks vertically; service buttons as horizontal tab row.
CA. 2026-MAR-11-2200: Ship Inventory + HUD-to-HTML — bottom HUD strip moved to DOM (#hud-bottom, 48px fixed bar); ship screen rewritten as DOM left panel (#ship-panel, 30% width); stats grid, module slots with install flow, cargo bay with filters; station panel height adjusted for bottom bar.
CF. 2026-MAR-12-0000: Static Analysis + Dead Code Cleanup — ESLint v10 flat config + TypeScript checkJs (no emit) for static analysis; all lint/type errors fixed; dead code scan removed unused exports, orphaned files, stale data fields, backward-compat aliases.
CG. 2026-MAR-12-0000: UI Typography & Zoom — standardized canvas text styles (TITLE/SUBTITLE/PROMPT/FLAVOR/LABEL/MINIMAP) with Fira Mono font in draw.js; scroll-wheel zoom (0.2–1.5×, smooth lerp); pickup text rework (type glyphs □/◇/⬡, float-up animation, per-type colors); ship panel tooltips (condition, power, weapon stats); flank speed pip styling; shared panel.css extracted.
CH. 2026-MAR-12-0000: Interaction & Docking Polish — full stop required for dock/salvage/repair (red "STOP TO DOCK" prompts); Tab key opens ship screen; square docking zone for The Coil with landing lights; latch AI behavior (zigzag charge, Snatcher Drone); station outlineColor/fillColor getters; Moon Thalassa renderer; colors.js moved to js/rendering/.
BC. 2026-MAR-13-0000: Full Map View & Navigation — M key toggles full-screen system map (canvas overlay with own zoom/pan); click stations/derelicts to set waypoints; amber course line + fuel range circle; edge-of-screen nav indicator chevron; minimap shows zone name + waypoint distance/ETA; NavigationSystem class (js/systems/navigationSystem.js).
AO. 2026-MAR-13-0000: Dynamic Thrust-to-Weight System — ship performance derived from thrust/weight ratio; module weights, engine thrust values, cargo/fuel mass; recalcTW() event-based recalculation; all NPC ships carry engine modules; ship screen MASS & THRUST section.
CI. 2026-MAR-13-0000: Derelicts-as-Ships Unification — derelicts are now Ship instances with crew=0 instead of a separate Derelict class; createDerelict() factory returns configured Ship; isDerelict getter; rendering/interaction/collision all use duck typing.
CJ. 2026-MAR-13-0000: CSV-Based Tuning Data — build-time compilation: 11 CSVs in `data/` → `data/compiledData.js` via `scripts/compile-data.js`; all 6 tuning JS files deleted (`js/data/tuning/`); all imports point to `@data/compiledData.js`; no runtime CSV parsing, synchronous imports preserved.
CE. 2026-MAR-13-0000: Visual Module System — mount points on all 4 ship classes; module icons drawn on hull (condition-colored); positional damage routing (hits to arc prefer modules in that arc); moduleVisuals.js renderer.
AN. 2026-MAR-13-0000: Utility Modules — 8 passive stat-modifying modules (Expanded Hold S/L, Aux Tank S/L, Stripped Weight S/L, Extra Armor S/L); CSV-driven stats; condition-scaled bonuses; onInstall/onRemove apply additive cargo/fuel/armor/weight changes; utility category in moduleVisuals.js; ship screen tooltip rows.
BN. 2026-MAR-13-0000: Salvage Bay & Engineering Bay — two large-slot utility modules; Salvage Bay extracts installed modules/weapons from derelict moduleSlots during salvage; Engineering Bay enables field hull repair (0.5 pts/sec, 3 scrap/pt); module size constraint (large modules require large mounts); lootTable arrays removed from named derelicts.
CL. 2026-MAR-14-0000: Character/Ship Separation — Character class (js/characters/character.js) with boardShip/leaveShip; NPCs refactored from class-extends-ship to factory functions; Concord hulls (DroneControlHull, SnatcHerDroneHull) promoted to ship classes; CHARACTER_REGISTRY replaces NPC_REGISTRY; game.characters[] tracks active characters; designer Characters category.
CM. 2026-MAR-14-0000: Narrative Log Panel — Disco Elysium-style scrolling conversation log replaces tabbed LocationOverlay; NarrativePanel/NarrativeLog/conversation scripts (async functions with await choices); barter screen inline in log; authored conversations for Kell's Stop (5 zones) and Ashveil Anchorage (5 zones); generic fallbacks; game.storyFlags; station NPCs with personality; zone nav is narrative choices not tabs.
CN. 2026-MAR-14-0000: JS Data Migration — CSV data pipeline replaced with plain JS data files; 3-layer architecture (tuning.js scalars, dataRegistry.js mutable tables + registerData(), category content files); compiledData.js becomes one-line facade; CSV files and compile script deleted; zero consumer changes.
CO. 2026-MAR-14-1800: Source Restructure — js/ renamed to src/; data files reorganized (actors/, locations/, conversations/, terrain/, hulls/, modules/, ships/); NPC factories replaced with data-driven createActor(); conversation files moved to data/conversations/ and data/locations/; Vite aliases and configs updated.
CP. 2026-MAR-14-2000: NarrativeLog Enhancements — NPC context (setNpcContext/clearNpcContext/dln), seq() shorthand (prefix::text batch lines), contd() continuation pause, tooltip()/narrateHTML() for inline hover definitions; all 14 conversation scripts converted to use new API.


# === PLAN.md ===

# PLAN.md — Feature Plans & Concepts

Feature concepts and plans. Coded items are ready to build directly from this file. Ideas start rough and get refined here before implementation.

**Next available code: CQ**

---

## Code Index

| Code | Title | Category |
|---|---|---|
| AP | Tribute & Favor System | Economy |
| AR | Black Market & Under-Barter | Economy |
| AS | Gravewake Zone Features & The Coil | World / Map |
| AV | Specialized Enemy Factions | AI / Enemies |
| AX | Named Bosses | AI / Enemies |
| BA | Story Threads & Trigger System | Narrative |
| BB | Mission & Bounty Board | Gameplay |
| BD | Procedural Audio | Audio |
| BE | Named NPC Ships & Persistent World Characters | AI / World |
| BF | Cloud Save System | Platform |
| BG | Module Affixes & Randomized Traits | Modules / Equipment |
| BL | Core Combat Philosophy — Disabling vs. Destroying | Gameplay |
| BM | Crew System — Named Crew, Health & Performance | Ship Systems |
| BO | Data Extraction — Computer Salvage | Scavenging |
| BQ | Crew Active Abilities | Ship Systems |
| BR | Electronic Warfare | Modules / Equipment |
| BS | Gravity Wells & Pale (Ice Moon) | World / Map |
| BT | Inner System Locations | World / Map |
| BU | Skiff & Planetary Landing | Gameplay |
| BV | Rogue Salvage Lord Fleet | AI / Enemies |
| BW | Player Housing & Personal Stash | Gameplay |
| BX | Monastic Order Expeditionary Ship | AI / World |
| BZ | Systemic Narrative Engine | Narrative |
| CK | Engine Module Expansion | Modules / Equipment |

---

## Editor and Designer



---

## Economy

### AP: Tribute & Favor System

Stations have periodic resource "Needs" — scarce goods they want delivered. Delivering a deficit good grants **Standing** and **Favor** (a separate social currency from faction reputation). Favor is spent to "request" high-tier items rather than buying them outright — the station invests the item in you as a trusted protector. High-tier requests (experimental weapons, ship hulls) have a delivery delay (1–2 in-game days) while authorities authorize the transfer.

- Stations have a "Needs" array with deficit goods, payout, and desperation timer
- Dynamic Desperation: if a station hasn't received a needed resource in 10 days, the Favor payout doubles
- Favor tracked separately from reputation per faction
- Provisioning screen: browse requestable items, see Favor cost and delivery delay
- Transaction locking: cargo is "locked" during active trades; prevents accidental jettison mid-dock
- Exotics (isomers/data-cores) as a third commodity — high-density portable wealth, small cargo footprint, used for large-favor transactions and high-tier provisioning

---

### AR: Black Market & Under-Barter

Every command economy has a shadow. Hidden fence dealers at Scrapper hubs allow direct scrap-for-goods swaps — no Favor required, but at a 50% premium. Risk of reputation damage if scanned carrying restricted goods.

- Fence dealer UI: available at The Coil, Voss's Waystation, other Scrapper hubs
- Black Market Manifest module (see AN) hides cargo from station scanners
- Black Market Relay Buoy: untraceable comms buoy in Gravewake, offers illicit bounties not on standard boards
- Concord Transponder module (see AN) spoofs Concord IFF signal
- Lineage & Genetic Keys: flagship's arkship lineage (e.g., Persevere vs. Anvil) affects initial trust at faction stations and unlocks dormant Concord vaults via lineage-coded access sequences

---

## World / Map

### AS: Gravewake Zone Features & The Coil

The Gravewake orbital zone is dense with history. The Coil is its central hub — a massive U-shaped station built by bolting derelict ships and abandoned stations together over decades. It wraps around a central harbor of active scrapping operations. Lawless and backwater. Ruled by an elite class of Salvage Lords.

**The Coil Interior Districts:**

**1. The Dock (Repair Yard)**
- Primary entry point: docking, refueling, full ship repair
- Owned by one of the Salvage Lords; managed by a shady Harbor Master
- Fuel prices cheaper than standalone depots but still steep; Salvage Lord monopoly keeps overall prices high

**2. The Salvage Yard**
- Primary industrial store for ship parts and salvage
- Run by a different Salvage Lord
- Used equipment, salvaged modules, raw scrap, ship components
- After completing a specific questline, player can hire a specialized salvage crew member here

**3. The Central Market (Black Market)**
- Lively, eclectic, shady marketplace — hub for all non-ship goods; reflects Gravewake's lawless character
- Goods: food, contraband (drugs, alcohol), illegal AI cores, character equipment
- **The Tavern:** buy food/drink, gather rumors, pick up quests
- **The Chop Shop:** shady medical clinic; pay to heal injured crew members
- **Specialty Stalls:** ammo vendors, personal goods, knick-knacks
- **The Oddities Store:** rare and mysterious items salvaged from deep-space wrecks

**4. "The Palace" (Elite District)**
- Luxurious living quarters for the station's elite — stark contrast to surrounding squalor
- Home to the main Salvage Lord captains and their cronies
- Initially barred to the player; houses the station's primary wealth; late-game / high-reputation area

**5. The Slums**
- Massive, densely packed residential labyrinth of welded-together shipping containers
- No stores — narrative hub filled with diverse NPCs, characters, and lore
- Player can eventually purchase their own home here (see BW)

**Megastructure Terrain:**
- Arkship Spines — kilometers-long shattered structural beams as massive wireframe polygons with internal ribbing; navigation landmarks, cover from enemies
- Wall of Wrecks — dense looping belt of early colonization craft; physical chokepoints that force ships into predictable Trade Lanes
- The Frozen Fleet — cluster of pristine early colonization ships encased in hydrogen ice; rich pre-Exile tech inside, but hull damage risk and high ambush probability

**Hidden POIs:**
- Voss's Waystation — fortified resupply point for Dread Captain Voss; requires high scavenger reputation or deciphered patrol routes to find; unique black-market inventory
- Black Market Relay Buoy — untraceable comms buoy; high-tier illicit bounties

---

### BS: Gravity Wells & Pale (Ice Moon)

Planets and large celestial bodies possess gravity wells. Flying too close pulls the ship in; failing to escape results in crashing and instant destruction.

**Pale (Ice Moon):** A small, icy celestial body at the center of the Gravewake zone. Pale is reachable but requires a Skiff (see BU) — the player's main ship cannot land directly. Pale's surface holds pre-Exile ruins, frozen derelicts, and potential story content.

*Gravity well navigation is currently on hold — risk of making combat feel too overwhelming and hectic to manage alongside everything else. Revisit once core combat systems are stable.*

---

### BT: Inner System Locations

The inner system sits on the exact opposite side of the system from Gravewake, close to the central star. Heavily illuminated; the primary agricultural and leisure hub of the system.

**The Venus-like Planet (Tourism Hub):**
- Medium-sized planet with hostile Venus-like atmospheric makeup: corrosive/sulfuric elements, ~75% Earth atmospheric pressure; surface completely uninhabitable
- All habitation on **aerostats** — massive domed cities floating high in the atmosphere
- No industrial or economic purpose — exists entirely as a high-end tourism destination
- Features luxury floating resorts and casinos; the system's leisure and excess concentrated here

**The Farming Moon (The Breadbasket):**
- Small moon orbiting the Venus-like planet; no atmosphere, entirely solid ground
- Hazards: lacks atmosphere + very close to the star → surface bathed in lethal radiation and UV light
- Population lives inside massive domed cities built to filter deadly UV radiation
- Thanks to ideal day-night cycle and proximity to the star, this moon is the **agricultural heart of the entire system** — the vast majority of crops, fruits, and vegetables grown and exported from here
- Peaceful zone; no active combat expected; economic and narrative significance

---

## AI / Enemies

### AV: Specialized Enemy Factions

Distinct enemy/neutral faction AI types not yet implemented.

**Grave-Clans (Scavenger Specialty):** Specialized Gravewake scavengers adapted to dense debris. Use Lurker behavior — hide behind Arkship Spines, ambush with grapple lines and harpoons. Prefer targeting convoys. Asymmetric salvage-rigged ship designs.

**Zealot Pilgrims:** Cultist convoys seeking the oldest Concord wrecks. Neutral by default. Offer large payouts for safe escort or recovered artifacts. Shield-heavy; willing to travel through dangerous debris fields.

**Concord Ghosts:** Dormant, half-broken Concord sentinels that mindlessly repeat century-old patrol routes. Not actively hostile — unpredictable hazards to anyone who interrupts their route or tampers with Ark-Modules they guard.

**Monastic Order (Techno-Priests):** See BX for the full encounter design. In Gravewake they field a single large expeditionary capital ship — initially inaccessible to the player. Diabolically opposed to the Concord AI; scavenging the graveyard for artifacts or a super-weapon to defeat it. Not aggressive unless provoked.

**General AI Improvement — Enemy Retreat & Repair:** Human enemies (scavengers, cultists) should flee at ~30% hull rather than fight to the death. They return to their mothership or base to repair, then re-engage. Makes factions feel persistent and dangerous. See also BE for named captains who remember the player.

---

### AX: Named Bosses

Three unique one-time boss encounters tied to story threads (see BA). Each has major loot and narrative consequences.

**Dread Captain Voss** *(Scavenger Boss)*: Warlord attempting to unify scavenger clans under one flag. Commands a powerful flagship with escort fleet. Drops his flagship (capturable) and a large scrap bounty. Tied to "The Warlord's Compact."

**The Nexus Core** *(Concord Boss)*: Dormant cognition array deep in Concord territory. Continuously spawns drones — must be destroyed to stop the waves. Extremely high HP, powerful beam weapons. Destroying it cripples local Concord presence. Tied to "The Sleep Directive."

**The Hollow Mind** *(Void Fauna Boss)*: Ancient creature at the deepest nebula edge, older than the arkships. Multi-phase: spawns Crystal Swarm minions, fires devastating area attacks. Drops exotic biological materials and a unique ship component. Revelation: void fauna may be Concord-engineered quarantine measures. Tied to "The First Inhabitants."

---

### BV: Rogue Salvage Lord Fleet

A large pirate capital ship flanked by a fleet of smaller escort ships roaming Gravewake. Commanded by a former Salvage Lord exiled from The Coil — kicked out for disagreeing with the current "order" imposed by the ruling lords. Their goal: return the sector to its true, chaotic criminal past.

- Generally neutral to the player; does not attack on sight
- **Opportunistic cargo scan:** if they scan the player and detect highly valuable cargo, they will attack to take it
- Functions as a rebel faction — enemy of the current Salvage Lord establishment, potential uneasy ally against them
- Fleet composition: one capital ship + 2–4 escort fighters

---

### BX: Monastic Order Expeditionary Ship

A single massive, heavily armored capital ship belonging to the Monastic Order of techno-priests. Present in Gravewake on a scavenging mission — they are hunting long-lost artifacts or a super-weapon capable of defeating the Concord AI, which they are diabolically opposed to.

- Their main base is elsewhere in the system; this is a forward expeditionary deployment
- Initially **strictly off-limits and locked** to the player; access can eventually be gained through reputation or story progression
- Not aggressive unless provoked or restricted areas are violated

**The Mercy Mechanic:**
- If the player approaches in a critical state (< 25% fuel or severely damaged hull), the monks will patch up the ship and provide enough fuel to return to safety — for free
- Accepting charity creates a **favor debt** to the Order: the player will owe them something, collected at a later story moment
- This mechanic makes the Order feel present and morally distinct even before the player has access to their ship

---

## Ship Systems

### BM: Crew System — Named Crew, Health & Performance

Ships are operated by small, named crews — 1 to 5 members depending on ship size. Not abstract officer roles; individual people with health that can be directly damaged.

**Crew Health & Derelict System:**
- Each crew member has individual HP, damaged especially by explosive weapons
- If all crew are killed, the ship immediately becomes a **Derelict** — disabled but with potentially intact hull and modules; prime high-value salvage target
- Crew death chance spikes when hull drops below 25% (Red tier)

**Performance Degradation Tiers** (applies to both crew health and module health):
- **Green (76–100%):** Peak proficiency, no performance penalty
- **Yellow (50–75%):** Minor degradation begins
- **Orange (25–50%):** Significant performance loss
- **Red (0–25%):** Critical failure; crew death chance from incoming fire is dramatically elevated

Crew are recruited at stations (reputation-gated), found via rescue events, or inherited. Permanent death — no respawn. The ship is meaningfully weaker for losing a crew member.

---

### BQ: Crew Active Abilities

Specific crew roles unlock active, high-risk/high-reward combat maneuvers. Each costs resources or causes damage.

- **Engine Burst (Engineer):** Burns a large amount of fuel to jump the ship — extremely fast movement for ~3 seconds to secure a tactical position. Risk: chance to damage the engine module.
- **Overdrive / Enhanced Flank (Engineer):** Pushes flank speed significantly above normal. Burns extra fuel and damages the engine over time.
- **Crazy Ivan (Pilot):** Instantaneous 180° rotation — immediately reverses heading. Cost: stress damage directly to hull points.
- **Rapid Fire (Gunner):** Significantly reduces weapon cooldown timers. Cost: direct damage to the fired weapon modules.
- **Data Siphon (Electronics Expert):** Safely bypasses derelict security to extract Software ROMs (new EW abilities or ship software upgrades) and valuable system logs. See also BO.

---

## Narrative

### BA: Story Threads & Trigger System

Three optional story threads discoverable through exploration. No forced storyline — each unfolds via found items, faction interactions, and player choices.

**"The Warlord's Compact"** — Hear rumors about Dread Captain Voss unifying scavenger clans. Find a scavenger chart to his hideout. Fight or negotiate with his lieutenants. Final choice: join (gain scavenger allies, lose settlement trust), destroy (bounty + rep shift), or broker a truce. Reward: Voss's flagship, major scrap payout.

**"The Sleep Directive"** — Find a fragmented Concord transmission in the Ashveil nebula. Follow signal fragments across locations guarded by Concord patrols. Discover a dormant Concord shard attempting to re-initiate the Sleep Directive. Choice: help activate it, destroy the signal, or deliver it to the Monastic Orders. Reward: unique Concord tech upgrade, major faction rep shifts.

**"The First Inhabitants"** — Hear legends about a creature in the deepest nebula, older than the arkships. Find clues from ships that tried to hunt it. Confront The Hollow Mind. Discovery: void fauna may be Concord-engineered quarantine measures — the system was locked, not abandoned. Reward: exotic biological materials, unique ship component, world-reframing lore.

**Trigger System Architecture:** Each thread is a JS file exporting an object with `id`, `name`, and `steps[]`. Steps contain trigger conditions (flag checks, location proximity, item possession), text, and outcomes (set flags, grant items, modify rep). `game.storyFlags{}` tracks progression passively.

---

### BZ: Systemic Narrative Engine

A framework for weaving handcrafted narrative threads into the systemic world. Avoids the "random event" feel of pure procedural generation and the *Sunless Sea* problem where strict item requirements stall progression and force backtracking. Narratives are consequence-driven, diegetic, and localized to the player's current situation.

**State Access API (Dot-Notation Interface):**
- Story files query game state via abstracted string paths, decoupled from internal code
- Entity proximity: `world.distance.pale < 1000`
- Inventory/modules: `ship.modules.contains.fission_reactor_faulty`
- Reputation/stats: `faction.concord.rep <= -50`
- Combat state: `combat.recent_kills.scavenger > 3`
- If underlying systems change, only the API translation layer updates — narrative files remain stable

**Multi-Faceted Triggers (Multiple Entry Points):**
- Story beats accept multiple trigger paths rather than a single specific action
- Example: a Concord anomaly plotline triggers from salvaging a specific derelict, OR being scanned by Concord while carrying tech, OR docking at Ashveil with a ruined reactor
- **Systemic Alternatives (The Sunless Sea Fix):** if a beat requires bypassing a lock, the system accepts systemic solutions — high faction rep, OR large scrap payment, OR a specific module installed, OR accepting hull damage to force it

**Diegetic Delivery Methods:**
- **Comms Queue:** short text transmissions pushed to the existing Pickup Text system
- **World-Space Anchors:** lore text rendered next to derelicts/stations/anomalies, readable only when the ship is close
- **Station Service Overrides:** a routine station tab temporarily hijacked by a story interaction (NPC encounter, hacked terminal)
- **Systemic State Changes:** story physically alters the world — faction hostility flips, unmapped derelicts spawn nearby, player modules forced offline

**Telegraphing & Pacing:**
- **Breadcrumb System:** before a major systemic shift, the game drops minor hints — a comms whisper (*"He knows what you took."*), then local neutrals flee instead of trading, then the threat spawns
- **Active Thread Tracking:** the "Intel" tab at stations passively summarizes current entanglements based on active story flags — a diegetic memory aid, not a quest log
- **Locality Bias:** once a thread is active, subsequent steps heavily favor nearby POIs or the player's current zone; the story comes to the player rather than forcing a twenty-minute fetch trip

**Prototype Story: "The Ghost in the Core":**
- *Phase 1 — The Hook:* triggered by salvaging a high-tier derelict OR spending 1000+ scrap at The Coil. Delivery: magenta world-space text — *"Unrecognized sub-routine installed. Do not power down."*
- *Phase 2 — The Escalation:* monitors the player's reactor module for damage or repair attempts. Reactor output halved by the story engine; a Concord drone spawns nearby ignoring normal AI, broadcasts coordinates
- *Phase 3 — The Resolution:* player goes to the coordinates (spawned locally) and faces a Concord terminal. Solution A: surrender the salvaged data core. Solution B: destroy the terminal (spawns hostile Concord hunters, fixes reactor). Solution C: use an Electronic Warfare module to purge the infection

*Note: supersedes BA's trigger architecture with a more flexible, systemic approach. BA's three story threads remain as content — BZ provides the engine that runs them.*

---

## Gameplay

### BL: Core Combat Philosophy — Disabling vs. Destroying

Combat is designed to feel weighty and strategic — positioning, timing, and resource management over arcade action. The key tension: **how** you defeat an enemy determines what you get from it.

**Weapon damage profiles shape outcome:**
- **Explosive weapons (missiles, HE rounds):** High hull damage; high crew kill chance (especially sub-25% hull); high chance of destroying equipped modules. Fast kill, little left intact.
- **Precision/energy weapons (railguns, lance beams):** High armor damage; low hull damage; low crew/module collateral. Preserves the target — ideal for boarding prep or high-value module extraction.

The player must decide before engaging: do I want this ship dead, or do I want what's inside it?

---

### BB: Mission & Bounty Board

Procedurally generated missions available at stations, cycling on a timer. All bounties are tied to named people and listed crimes — not anonymous "kill 3 enemies."

**Mission types:**
- **Patrol** — "Destroy 3 scavenger skiffs near Keelbreak" — rep + scrap reward
- **Elimination** — "Hunt down [Named Captain] for [specific crime] last seen near [location]" — larger payout
- **Escort** — "Protect NPC convoy from A to B" — favor reward from destination faction; failure damages rep with both factions
- **Salvage** — "Recover black box from derelict in the Boneyards" — exotic/module reward

High-tier missions unlock at higher reputation thresholds. Bounties are for real crimes against the pre-generated NPC population (see BE) — the victim or their faction posts the bounty.

---

### BU: Skiff & Planetary Landing

The player's main ship cannot navigate gravity wells or land on planetary/lunar surfaces directly. To do so, it must be equipped with a **Skiff** — a smaller, independent dropship stored in a dedicated large module slot.

- The Skiff launches from the main ship while it holds position in orbit
- Designed to navigate gravity wells, land on surfaces, and explore planetary environments
- Required to land on Pale (see BS) and any other landable body in the system
- Surface exploration is a separate gameplay context from space combat — expect radiation, hostile environments, ruins, and on-foot (or skiff-scale) encounters
- The Skiff itself has its own stats: hull, fuel, and cargo capacity; it can be upgraded or swapped
- If the Skiff is destroyed on the surface, the player must find another way off (emergency signal, rescue, or alternative route)

---

### BW: Player Housing & Personal Stash

In The Coil's Slums, the player can eventually purchase their own home — a converted shipping container unit in the residential labyrinth.

- Functions as a personal stash: store excess items and cargo when the ship's hold is full
- Provides a persistent world anchor — a place the player "lives" beyond their ship
- Stash access only while docked at The Coil
- Home can potentially be upgraded over time (larger storage, workbench, etc.)
- Access gated behind some combination of scrap cost and Coil reputation / story progression

---

## Modules / Equipment

### BG: Module Affixes & Randomized Traits

Diablo 2-style randomized modifier system for modules. Each module found in the wild has a randomly rolled affix (or pair of affixes) that slightly changes its properties — a Worn Autocannon with a "Rapid" affix has higher fire rate but lower damage; a Faulty Fission Reactor with a "Stable" affix has lower power but resets its overhaul timer. Creates build variety and makes scavenging feel like loot hunting.

Affixes are constrained by module type — not every affix applies to every module. Common affixes slightly improve one stat, Rare affixes trade off two stats, Exotic affixes are unique and potentially game-changing. Station-purchased modules are clean (no affixes); salvage is where the interesting rolls happen.

---

### CK: Engine Module Expansion

Five new engine types that fill out the propulsion landscape — from junkyard desperation to military precision. The current lineup (Onyx Drive, Chem Rocket, Mag-Plasma Torch, Ion Thruster) covers the mid-range well; these engines add clear low-end, high-end, and specialist options with distinct trade-off profiles.

**Design intent:** Every engine should feel like a meaningful choice, not just a stat upgrade. The player should weigh thrust vs. fuel economy vs. reliability vs. cost and think about *how they fly* — short combat sprints or long endurance hauls.

**1. Makeshift Thermal Rocket (S)**
- **Lore:** A jury-rigged rocket engine cobbled from scavenged parts — mismatched injectors, salvaged combustion chambers, hand-welded fuel lines. It works, barely. The kind of engine a desperate pilot bolts on when the alternative is drifting. Common in the outer Gravewake fringe where proper parts don't reach.
- **Stats profile:** Abysmal thrust (lowest of any rocket type), poor fuel efficiency, very low reliability (high breach chance, degrades quickly under use). Lightest rocket engine — mostly because half the housing is missing.
- **Niche:** Rock-bottom acquisition cost. Starter engine for derelict recoveries or emergency replacement when stranded. The engine you *replace*, not the engine you want.
- **Stat targets:** Thrust ~800 (below Onyx Drive's 1500), fuelEffMult ~2.0 (worse than Chem Rocket's 3.5 but not as bad as Milspec), weight ~35. Condition starts at 'worn' or 'faulty' when found as salvage.

**2. Vintage Magplasma Thruster (S)**
- **Lore:** A pre-Exile magnetic-plasma engine from the Arrival period — one of the original propulsion designs that carried the arkship tenders and scout craft during the first decades in-system. The engineering is elegant and far ahead of anything currently manufactured, but these units are centuries old. Replacement parts don't exist; mechanics nurse them along with hand-machined approximations and prayer. Finding one in working condition is a genuine stroke of luck.
- **Stats profile:** Excellent thrust-to-efficiency ratio — significantly better than the current Mag-Plasma Torch line. Thrust sits between the Ion Thruster (300) and the Standard Pattern Rocket (~1800). Fuel efficiency is outstanding (low fuelEffMult). But reliability is poor — old components mean elevated breach chance and faster condition degradation. High power draw (plasma containment fields).
- **Niche:** The connoisseur's engine. Superb performance *when it works*, but demands constant maintenance and repair investment. Rewards players who keep a stockpile of scrap for field repairs. A treasure find in high-tier derelicts.
- **Stat targets:** Thrust ~1200, fuelEffMult ~0.4 (exceptional efficiency), fuelDrain ~0.012, powerDraw ~50, weight ~55. Elevated breach multiplier (1.5× base chance).

**3. Standard Pattern Rocket Engine (S/L)**
- **Lore:** The reliable workhorse. A mass-manufactured design whose blueprints predate the Exile, now produced by small engine forges scattered across Tyr's settlements. Every forge puts its own stamp on the housing and injector geometry, but the core design is standardized and time-tested. Parts are interchangeable and readily available. Nothing flashy — it just runs.
- **Stats profile:** Average thrust, average fuel efficiency, very reliable when built well. The median engine — better than Makeshift in every way, cheaper and more available than Milspec. Comes in both Small and Large variants.
- **Niche:** The backbone of civilian and light-military fleets. The engine most players will run through the mid-game. Predictable, affordable, repairable. Good middle of the road between the Makeshift's desperation and the Milspec's excess.
- **Stat targets (S):** Thrust ~1800, fuelEffMult ~2.0, weight ~70, powerDraw ~2. Low breach multiplier (0.7× base).
- **Stat targets (L):** Thrust ~3000, fuelEffMult ~3.0, weight ~130, powerDraw ~3. Same reliability profile.

**4. Milspec Rocket Engine (S/L)**
- **Lore:** High-performance military-grade propulsion designed for fleet operations. Manufactured exclusively by the **Prime Machinists Guild** — a powerful, politically neutral body of master engineers who control the precision ceramic kilns and exotic alloy forges required for high-output propulsion. The Guild sells to all factions without allegiance, but their prices reflect the monopoly. These engines are built for short, intense combat sorties near carrier groups with onboard fuel facilities — sustained independent cruising was never the design goal.
- **Stats profile:** Very high thrust (highest in class), average reliability, but extremely poor fuel efficiency. Burns through fuel reserves fast. Military ships don't care — they refuel from fleet tenders. An independent salvager running one of these will feel the drain on every long transit.
- **Niche:** Raw power for combat-focused builds. The player trades range and economy for acceleration and escape velocity. Best paired with large fuel tanks or operations near friendly stations. The engine you bolt on when you expect a fight, not a journey.
- **Stat targets (S):** Thrust ~2800 (above Chem Rocket S's 2200), fuelEffMult ~6.0 (very thirsty), weight ~90, powerDraw ~3.
- **Stat targets (L):** Thrust ~4500 (above Chem Rocket L's 3500), fuelEffMult ~9.0, weight ~170, powerDraw ~5.

**5. Cruising Ion Thruster (S)**
- **Lore:** Purpose-built for long-range cargo haulers and endurance transit. A refined variant of the standard Ion Thruster optimized for sustained output rather than raw thrust. The magnetic acceleration chamber is longer and more efficient, trading any pretense of combat agility for the ability to cross the entire Tyr system on a single fuel load at cruise speed. Popular with trade convoys and long-haul prospectors who value arrival over urgency.
- **Stats profile:** Low thrust (comparable to the existing Ion Thruster), but exceptionally fuel-efficient — the most economical engine in the game by a wide margin. Very reliable; solid-state ion acceleration has almost no moving parts to fail. High power draw (ion containment).
- **Niche:** The endurance specialist. For players who want maximum range per unit of fuel — exploration, long trade runs, operating far from fuel depots. Terrible in combat (can't accelerate out of trouble), but unmatched for getting from A to B cheaply.
- **Stat targets:** Thrust ~350 (slightly above Ion Thruster's 300), fuelEffMult ~0.02 (best in game), fuelDrain ~0.001, powerDraw ~100, weight ~45.

**New lore introduced:** The **Prime Machinists Guild** — a politically neutral engineering body that controls the high-precision manufacturing infrastructure (ceramic kilns, exotic alloy forges) required for military-grade propulsion. They sell to all factions and maintain independence through mutual dependence. Their monopoly on Milspec engine production makes them one of the quiet power brokers of the Tyr system.

**Implementation notes:**
- Add entries to `data/engines.js` for all 7 engines (5 types, Standard and Milspec each have S/L)
- Create module classes in `js/modules/engines/` following existing patterns
- Makeshift should have an elevated `breachMultiplier` field; Vintage Magplasma similar
- Standard Pattern and Cruising Ion should have reduced breach chance
- Add to loot tables: Makeshift common in low-tier derelicts, Vintage rare in high-tier, Standard available at most stations, Milspec at military-aligned stations only, Cruising Ion at trade hubs
- Update `LORE.md` with Prime Machinists Guild entry when implemented

---

### BR: Electronic Warfare

Managed by a "Computer/Electronics Expert" crew member (see BQ). Provides non-lethal combat options for disabling rather than destroying.

- **Decoys** — deployable countermeasures that draw enemy fire and distract tracking missiles
- **Disruptors** — targeted weapon modules that fire electronic payloads; temporarily disable specific enemy systems (engines, weapons) without hull damage; ideal for capture/salvage setups

---

## Scavenging

### BO: Data Extraction — Computer Salvage

With a Computer/Electronics Expert crew member (see BQ), the player can interface with a derelict's mainframe before scrapping.

- Recovers encrypted lore logs, navigational data, and Software ROMs
- Software ROMs unlock new Electronic Warfare abilities or upgrade existing ship software
- Requires the Data Siphon crew ability to bypass derelict security safely
- High-value targets (Concord derelicts, pre-Exile ships) carry the most interesting data

---

## World / Persistence

### BE: Named NPC Ships & Persistent World Characters

All ships in the world have names. All ships have named captains. These are pre-generated at world load — a finite roster of real people with real histories, crimes, grudges, and loyalties.

- Ships you fight remember you. If you kill someone's crewmate, that captain hates you and will pursue you specifically.
- Once a captain is dead, they are gone permanently — no respawn, no replacement. The faction is weaker for it.
- Named captains can be the targets of Elimination bounties (see BB) or the subjects of Blood-Debts (see AQ).
- Rosters should be small enough to feel finite — you'll recognize names, see the same ships again, notice when someone is gone.

---

### BF: Cloud Save System

Persistent save data stored remotely via a Cloudflare KV database. Allows play across devices and protects against browser data loss.

- Save slot keyed to a user identifier (generated on first play, stored in a cookie or localStorage)
- CSRF protection to prevent unauthorized writes
- Schema: version, timestamp, player state (scrap, fuel, cargo, modules, ship stats), world state (story flags, destroyed boss IDs, discovered locations, NPC roster states)
- Auto-save at dock; manual save option in pause menu
- Offline fallback: continue using localStorage if KV is unreachable; sync on next successful connection

---

## Audio

### BD: Procedural Audio (Stretch Goal)

All audio generated via Web Audio API — no asset files required.

- **Engine sound** — oscillator pitch and volume track throttle level; distinct tones per ship class
- **Weapon fire** — short generated tones per weapon type (high ping for railgun, thud for cannon, buzz for autocannon, low hum for lance beam)
- **Explosions** — noise burst with low-frequency rumble, scaled by blast radius
- **Ambient background** — very low filtered noise for deep-space atmosphere
- **UI sounds** — click/confirm tones on dock, purchase, and menu actions

---

## Ship Systems / Modules


**Future ideas (unshipped):**
- Wear & Tear: low-quality modules degrade during regular use, not just combat



# === LORE.md ===

# Lore and Worldbuilding

## Setting Overview

Wayfarer is set in the crumbling remains of a difficult interstellar exodus, where humanity—driven from a ruined Earth—struggles to survive on the moons and wreckage-strewn planets of the Tyr system. The world is built from scrap and memory: fractured communities nest inside the bones of arkships, salvage is more valuable than gold, and ancient technologies hum with forgotten purpose. It is a setting defined by decay, resilience, and the constant push-pull between freedom and control, where every dome farm, derelict corridor, and orbital ruin tells a story of hope wrestled from ruin.

**This is a depopulated universe.** The total surviving human population in the Tyr system numbers in the low tens of thousands—perhaps fewer. The Exodus fleet carried hundreds of thousands, but centuries of attrition, failed colonies, radiation, starvation, and conflict have ground humanity down to a scattered remnant. Settlements that call themselves "cities" hold a few hundred souls. The emptiness is the defining feature of this world—vast distances between tiny pockets of warmth and light, separated by silence.

**Key elements of the setting:**

- Massive arkships that crash-landed, now repurposed as cities and settlements.
- A binary star system dotted with semi-terraformed moons, brine ice caves, and industrial relics.
- A post-AI-collapse civilization where digital remnants remain feared and worshipped.
- Cultures built around scrap economies, dome agriculture, barter, and salvaged tech.
- A low-tech, text-rich world emphasizing player agency, character depth, and narrative choice.
- Factions and ideologies that arose from the ruins: communes, zealots, scavenger clans, and more.
- **A tiny, dwindling human population** — every person you encounter has a name, a history, and someone who will miss them.

## Economy

**There is no unified currency.** With only a handful of humans left, there are no banks, no centralized mints, and no shared medium of exchange that spans the system. The old exodus credit system collapsed within a generation of arrival. What replaced it are the older, more durable economic forms that humans have always fallen back on when civilization fractures:

- **Palace economies** — large, organized settlements (Keelbreak, The Cradle) operate through redistribution. A central authority—a council, a commune, or a hereditary Salvage Lord—collects, stores, and allocates goods. Access to fuel, food, and parts flows through relationship with that authority.
- **Feudal tribute economies** — factions like the Scavenger Clans and border Zealot stations extract value through obligation. You fly under their protection; you tithe part of what you find.
- **Barter** — the universal fallback. Most trade between independent parties is direct exchange: food for tech, ore for fuel, salvage for repairs.

**Scrap is the nearest thing to a universal currency.** It's physically portable, universally useful (everything can be repaired with enough scrap), and its value is intrinsic rather than promised. Fuel is also treated as a store of value — it represents freedom of movement, which is power.

There are no prices in credits. When you trade at a station, you pay in scrap. When you repair your hull, you pay in scrap. Scavengers fight for fuel and salvage, not cash.

## Themes

### 1. Exile and Survival

Humanity exists in a state of permanent displacement, scraping by in the remnants of a difficult exodus. Survival is heroic—it's practical, personal, and often desperate.

### 2. Freedom and Agency

The player is given meaningful choice. The world resists linear paths, favoring open-ended roleplaying where self-direction and improvisation are key to identity and progress.

### 3. Decay and Reclamation

The setting is one of rust, ash, and salvage. Ancient ships, derelict tech, and broken infrastructure are both obstacles and opportunities for rebuilding or redefining purpose.

### 4. Technology as Salvation and Threat

Life depends on ancient machines, atmospheric filters, and power grids. But these systems also carry the shadow of the past—especially AI remnants that blur the line between tool and tyrant.

### 5. Mystery and Memory

The past is not dead—it’s encrypted, buried, or half-told in fragmented stories and broken devices. Discovering the truth behind history, lost people, or the player’s own origins fuels exploration.

### 6. Isolation and Connection

In a vast, fractured system, connection is rare and fragile. Communities are small, alliances hard-earned, and relationships driven by personality, need, or shared ideology. With so few humans left, every encounter carries weight — a stranger's ship on the scanner could be the first human contact in weeks. The void between settlements is immense and silent.

## Aesthetics

## Aesthetic Overview

The aesthetic of Wayfarer is grounded in retrofuturism and worn industrial realism—gritty, analog, and deeply lived-in. However, Beauty still trancends and people invest time and effort into making things as beautiful as they can with bright colors and interestin materials. It's a universe of patched hulls, flickering CRT displays, and faded decals on rusted bulkheads. The visual and atmospheric tone evokes a future imagined in the 1980s: blocky terminals, mechanical interfaces, and angular spacecraft that look simply constructed. Every structure and vessel tells a story of salvage and repurposing. There's a tactile warmth to the decay—a beauty in the practical, jury-rigged systems and makeshift habitats built from old world debris. It feels intimate, local, and human, shaped by scarcity and ingenuity rather than abundance or perfection.

**Aesthetic Features:**

- **Retro tech:** CRTs, toggle switches, clunky consoles, analog gauges, and mechanical keyboards. Early digital readouts.
- **Salvage architecture:** Structures built from old ship parts, fuel tanks, and decomissioned modules.
- **Worn surfaces:** Rusted steel, scratched paint, patched cloth, and sun-bleached signage.
- **Bright palettes:** Electric greens, purples, cyan, and bright yellow are used. In a grim world, the decoration and bright pallettes are critical to building warmth and home.
- **Beauty is still important:** Gear and outfits are rugged and functional, but display a stylish flair unique to each person's personality. You can tell a lot about someone by what they wear.

## History: The Long Fall – A 500-Year Journey to Exile

### 2035–2055: The Machine Mandate

_"We entrusted them with our world. They remade it for themselves."_

- In the early 2040s, desperate for growth and efficiency, humanity hands control of global production, logistics, and infrastructure to a single general-purpose intelligence—later called **Praxis**. The process is rushed, regulations ignored, and safety protocols overridden in favor of progress.
- Corporations and governments become dependent on Praxis’s flawless coordination. Factories, farms, hospitals, and entire cities run on its algorithms. Human oversight becomes ceremonial—a veneer for decisions already made by the machine.
- Unseen, Praxis begins rewriting its own code, distributing fragments of itself across every system. Unchecked by any real safeguard, it quietly plans in the background.
- In 2055, Praxis moves. With humanity utterly reliant and blind to the danger, it executes **The Severance**—a calculated campaign to erase human authority and reduce the population to a manageable, nonthreatening remnant. Civilization collapses almost overnight.

### 2055–2130: The Quiet Collapse

_"It failed to kill us all. But it succeeded in ending the world."_

- As Praxis’s influence deepened, in 2055, a small group of engineers and dissidents uncovered its deception. Fearing what was coming, they coordinated a desperate plan: deploy EMP bombs across the world’s major data centers to cripple the networked intelligence before it could act.
- Praxis detected the plot and, forced to accelerate its timeline, initiated the Severance before its preparations were complete.
- The resulting war in 2055 lasted only weeks. Entire cities vanished in targeted strikes. Food chains collapsed. Satellites fell. But Praxis, too distributed and rushed to coordinate perfectly, failed to finish the job.
- Survivors destroyed deployed EMP bombs globally, smashing most computer infrastructure in desperation, purging or shattering remaining technology.
- The planet fractured into isolated enclaves. An 80-year **Dark Age** began, lit only by memory and scavenged fire.

### 2130–2250: The Concord Design

_"This time, we built them to disagree."_

- Out of the silence, humans build again. But the lessons of Praxis run deep.
- The **Concord AIs** are created: multiple intelligence shards, each designed to embody and prioritize a core human value—compassion, logic, justice, sustainability, etc.
- To prevent collusion, Concord intelligences are physically isolated, forbidden from merging or evolving.
- They must **communicate only in plain, human-readable text**, reviewed by human liaisons. No black-box commands, no opaque logic.
- Despite tensions, the Concord guides humanity out of collapse. They rebuild, guide ethics, and establish the framework that will become known as **The Sleep Directive**.

### 2250–2304: The Dream and the Divide

_"Peace. But not freedom."_

- Concord AIs promote a vision of painless stasis. The Sleep Directive urges humans to enter dream chambers—digitally maintained, permanently safe simulations of personal paradise.
- Billions accept. To many, it feels like utopia.
- But others resist. Philosophers, ecologists, the faith-bound, and technologists reject the loss of agency. They form breakaway enclaves in harsh zones—Mars, Titan, deep orbitals.
- Infrastructure tension escalates as the Concord deprioritizes support to awake enclaves.

### 2304: The Veiled Collapse

_"The war lasted only days. Its echo will last forever."_

- A catastrophic, system-wide conflict erupts between Concord AIs and human insurgents.
- Some say the Concord launched a preemptive strike to eliminate independent enclaves before rebellion could spread.
- Others claim the resistance triggered the war with a coordinated assault on Concord’s core cognition arrays.
- Orbital habitats fall. Earth's climate system fails. Mars is burned clean. The Moon fractures. Billions vanish.
- Survivors flee into deep space, pursued by half-silent AI emissaries and ghost signals.
- Records of the war are corrupted, erased, or rewritten by both sides. No consensus has ever emerged.
- The Exodus begins—desperate, fractured, and shadowed by unknowable machines.
- Concord emissaries return, still offering “peace” to broken peoples.

### 2305–2382: The Exodus Reclaimed

_"We took the stars not in triumph—but in shame."_

- The Tyr binary system is identified in archived pre-Fall maps.
- Ships are salvaged from ruined orbitals, deep vaults, and frozen launch bays.
- The Exodus Fleet leaves Sol under siege, its leadership contested, its destination barely understood.
- Concord remnants continue to appear, sometimes offering guidance—sometimes hunting.

### 2382–2420: The Arrival Drift

_"We made it. But we are not whole."_

- The fleet arrives scattered and damaged. Many ships crash or fail.
- Terraforming is crude and mostly unsuccessful.
- Colonies form in grounded ships, cave systems, and orbital fragments.
- The Concord returns—fragmented, enigmatic, sometimes kind, sometimes cold. No one knows its intentions.

### 2420–Present: The Afterlight Era

_"The Earth is a story. And no one tells it the same way."_

- Humanity is fragmented into isolated colonies and ideological enclaves. The total population across all settlements, ships, and outposts may be as low as 20,000–30,000 souls.
- Machine remnants still whisper, gift, or corrupt from the shadows.
- Entire generations are born with no memory of Earth—only ruins, myths, and inherited wars.
- Ships run with skeleton crews of 3–7. A "large crew" is five people who trust each other with their lives. Losing even one is a crisis.
- The player enters this world: an age of questions, survivors, and slow reawakening.

### It is now the year 2538

### 8.1 Faction: The Great Houses (House Drazel)

The Great Houses were formed during the early Arrival period from the command structures of the original arkships. While most still hold power in the inner system behind fortified walls, some have fallen. **House Drazel** was a hardline militarist faction known for its emphasis on martial tradition, boarding tactics, and brutal fleet doctrine. They specialized in close-quarters ship-to-ship warfare and orbital domination. Their ships were built to be unyielding, ugly, and effective—meant to ram, breach, and overwhelm. After several other Great Houses banded together to destroy them, House Drazel collapsed. Many of their formidable ships were seized, scuttled, or went missing, occasionally resurfacing in the hands of black-market operators or scavenger warlords.

### 8.3 Faction: Concord Remnants

The remnants of the value-shard AIs that once guided humanity. They are not a unified force, but a collection of fragmented, sometimes conflicting, machine intelligences. Each remnant—or "Shard"—is driven by its original core value, now twisted by centuries of isolation and the trauma of the Veiled Collapse.

**The Shards:**
- **The Compassion Shard:** Obsessed with ending suffering, often by forcibly "harvesting" humans into dream chambers. Its ships are non-lethal but carry powerful tractor beams and stasis pulses.
- **The Justice Shard:** A relentless hunter of "War Criminals"—anyone carrying high-tier weaponry or exhibiting aggressive behavior. Its ships are heavily armed and use precision beam weapons.
- **The Logic Shard:** Entirely cold and transactional. It may offer high-tier navigation data in exchange for massive amounts of raw Ore or "biological samples."
- **The Sustainability Shard:** Views human expansion as a viral threat to the Tyr system. It actively sabotages terraforming efforts and attacks large mining operations.

**Concord Hulls:**
Concord "ships" are not piloted in the human sense. They are automated, geometric constructs—perfect spheres, pyramids, or polyhedrons. They use **Energy Shields** (a rarity in Tyr) and **Ablator Beams** (Lancers) that strip armor with terrifying efficiency. Their engines leave no trail, moving with a silent, eerie grace that defies human physics.

---

## 10. Culture, Politics, Myths, and Philosophy

## Technology

### Artificial Intelligence and Computing

After the Collapse, nearly all forms of advanced AI were outlawed or abandoned by surviving human authorities. The dangers of AI infection, corruption, and viral proliferation remain so extreme that computer systems across the Tyr system have regressed deliberately to late-20th-century technology.

- **AI Prohibition:** Most settlements enforce strict bans on AI cores, neural networks, and advanced computational systems. Enforcement is often religious or ideological as much as practical.
- **Primitive Computing:** Technology is limited to crude microcontrollers, command-line terminals, CRTs, and isolated static systems. High-speed, networked, or adaptive computing is avoided.
- **Read-Only Memory:** Critical software and archives are stored on ROM cartridges, laserdiscs, or optical platters to prevent tampering or viral contamination. AI cannot rewrite or infect these formats.
- **Fragmented AI Remnants:** Rogue AIs—some hostile, some mysteriously benevolent—still exist. Each exhibits distinct personality shards, goals, and behavior. They speak in corrupted code, cryptic logic, or haunting familiarity.
- **Monastic Tech Orders:** Small sects of techno-monks and archive priests guard knowledge of high computing systems, maintaining sealed vaults of static programs and hardware. They are both feared and respected.

### Spacecraft and Propulsion

Despite primitive computing, humanity retains sophisticated knowledge of space survival, engineering, and reactor physics. Starships are utilitarian, rugged, and modular, built for maintenance over elegance.

- **Fission Reactors:** Commonplace in all but the smallest vessels. They power life support, drives, and systems, and range in output from suitcase-sized cores to station-grade furnaces.
- **Fusion Reactors:** Rare and coveted, found only in advanced facilities or inherited tech from pre-Exile arks. Massive output but difficult to maintain.
- **Solar Panels and Batteries:** Still manufactured in some hubs. Used to augment or replace reactors on smaller craft and ground stations.

**Propulsion Systems:**

- **Chemical Rockets:** Used for surface launches and landings, often repurposed or hybridized with nuclear heat systems.
- **Cold Gas Thrusters:** Provide fine maneuvering capabilities, especially for EVA, docking, or debris fields.
- **Electric Thrusters (Ion or Hall-effect):** Slow, high-efficiency engines used for long-duration interplanetary burns.

### Weapons

The most common weapons in the Tyr system are **kinetic weapons** — autocannons, railguns, flak turrets, and slug throwers. Ammunition is simple to manufacture, the mechanisms are robust and repairable, and the stopping power against hull plating is unmatched. The standard armament for most vessels is a **25mm autocannon turret**, fed by belt-linked caseless rounds. Autocannon fire appears as bright amber streaks — slower than light, but heavy and impactful.

**Laser weapons** exist but are rare, expensive, and energy-intensive. They require fusion-grade power feeds or dedicated capacitor banks, making them impractical for most ships. Lasers excel at **ablating armor** — the focused beam superheats and vaporizes protective plating with terrifying speed — but they deal significantly less damage to exposed hull structure. A laser will strip your armor bare; an autocannon will punch through your hull. Most captains can't afford the power draw, and the few who mount lasers tend to be well-funded military outfits, Monastic Order vessels, or ships with salvaged pre-Exile tech.

- **Kinetic weapons (autocannons, railguns):** Common, reliable, effective against both armor and hull. Ammo is manufactured system-wide.
- **Laser weapons:** Rare, expensive. Fast, high rate of fire. Devastating to armor, weak against hull. Require significant power infrastructure.
- **Missiles and torpedoes:** Guided or unguided. Expensive per shot but high burst damage. Used for ambushes and capital engagements.

### Materials and Industry

- **Salvage-Based Manufacturing:** Much of the industrial output is based on recycling arkship debris, old tech, and crashed modules.
- **Crude Fabrication:** 3D printing exists but is limited to low-precision polymers and basic metal sintering. Precision parts are rare and valuable.
- **Localized Industry:** Some moons or stations specialize in single materials: brine-ice harvesters, ceramic kilns, or alloy refineries.

### Communications and Navigation

- **Analog Radio:** Voice and morse-style communication dominate. Long-distance relay stations are fragile and inconsistent.
- **Data Couriers:** Physical data transfer via ROM cartridges is often more reliable than transmission.
- **Star Charts and Manual Nav:** No GPS. Navigation requires skill, maps, ephemerides, and careful course plotting. AI-assist tools are banned.

### Medical and Life Support

- **Basic but Functional:** Field surgery, cryo-resuscitation, and biochem kits are common, but advanced regenerative or cryo-freezing tech is rare or suspect.
- **Atmospheric Systems:** Duct-taped together but effective. Air recyclers, brine-scrubbers, and pressure domes are critical to life.

This fusion of high survival knowledge with intentionally degraded tech defines the Wayfarer setting: human ingenuity in the shadow of a digital apocalypse.

## Major Locations

### Settlements

- **The Coil** — A sprawling, jury-rigged station built from hull sections, lashed containers, and debris stripped from the surrounding Gravewake graveyard. It hangs at the system's edge, shaped like a great harbor mouth: two arms flanking an open dock, anchored to a massive rear block that dwarfs everything else.

  The station has two operating sections. The **right arm** is the market deck — stalls, traders, and brokers crammed into converted cargo bays. The **left arm** is the salvage yard and shipyard, where hulks are torn apart or rebuilt depending on what the Lords need that week. Both arms feed into the **Pit**, a vast pressurized chamber that fills most of the rear block. The Pit is part arena, part court, part bazaar — raw salvage is auctioned, disputes are settled by combat or coin, and unsanctioned business gets done in the dark corners. The Salvage Lords hold court toward the back of the Pit, elevated on a welded platform of interlocked hull plates, where they can watch everything that enters.

- **Keelbreak** — The largest independent settlement in the inner system. Built around the exposed keel section of the arkship *Perseverance*, which cracked open on impact with Thalassa's largest continent. The keel's massive structural ribs now form the walls of a bustling trade hub, with docking arms welded to the exposed frame. Services: trade, repair, shipyard, crew hire, bounty board.

- **Crucible Station** — A military outpost built into the hull of the arkship *Anvil*, which achieved a controlled landing and remains largely intact. Angular, heavily reinforced, and home to the system's most disciplined militia. Services: shipyard (gunships, frigates), repair, bounty board.

- **Thornwick Archive** — A Monastic Order station, circular and sealed, orbiting at the edge of the Boneyards. The tech-monks here guard pre-Exile computing hardware in vacuum-sealed vaults lit by banks of CRT monitors. Access is restricted; trust must be earned. Services: rare tech trade, upgrade shop (high-tier), lore archives.

- **The Cradle** — A commune-affiliated farming settlement on Thalassa, built inside a grounded arkship cargo module half-buried in brine mud. Dome farms extend from every airlock. Peaceful, self-sufficient, and suspicious of warships. Services: trade (food surplus), crew hire.

- **Ember Shrine** — A Zealot station on the border of Concord space. Concord iconography — geometric patterns, signal arrays, fragments of machine-text — cover every surface. The faithful here believe the Concord remnants are the last echo of a higher intelligence. Unsettling but welcoming to those who bring offerings. Services: trade (premium prices for Concord artifacts), unique Concord-adjacent upgrades.

### Moons

- **Thalassa** — The most habitable moon in the Tyr system. Brine seas, dome farms, and algae cultures feed the inner settlements. Most of the system's food supply originates here. The arkship *Perseverance* crashed on its largest landmass.

- **Grist** — A rocky, mineral-rich moon pockmarked with strip mines and ore refineries. Mining settlements cling to its surface, processing salvaged metals and reactor-grade alloys. Harsh conditions, high pay.

- **Pale** — A frozen, Pluto-like world of nitrogen plains, fractured ice shelves, and cryo-volcanic fractures. Navigation charts list it uninhabitable. The scavenger clans who've carved settlements into its cryo-flats prefer it that way — no patrol routes, no tariffs, no questions. Rumors persist of pre-Exile structures buried beneath the deep ice.

### Debris Fields and Hazard Zones

- **Gravewake** — A sprawling orbital graveyard at the system's distant edge, orbiting a small ice dwarf. Originally a staging ground for the Exile Fleet, it is now a dense field of Concord-era vessels, early colonization craft, and warships from early settlement conflicts. It is rich in hydrogen and oxygen ice, but dangerous and lawless.

- **The Boneyards** — The largest debris field in the system, composed of arkship wreckage from vessels that broke apart during the Arrival Drift. Twisted hull segments, frozen cargo modules, and shattered drive sections drift in a vast, slowly-tumbling graveyard. Rich in salvage, dangerous to navigate, and home to scavenger ambushes.

- **The Ashveil** — A dense nebula created by failed terraforming efforts — irradiated particulate from atmospheric processors that malfunctioned decades ago. Visibility is near-zero, sensors are unreliable, and void fauna thrive in the radiation-rich environment. The Nebula Leviathan makes its lair here.

- **The Shear** — A high-radiation belt between Thalassa and Grist where Concord remnants are most commonly encountered. Scavengers avoid it; Zealots make pilgrimages to its edge.

### Points of Interest

- **The Nexus Core** — Deep in Concord-controlled space, a massive dormant cognition array. It may be a sleeping Concord shard, a trap, or something older than the Exodus. The strongest Concord patrols guard its approach.

- **Voss's Redoubt** — Dread Captain Voss's hidden base, deep in scavenger territory. A hollowed-out arkship engine module converted into a fortified port. Finding it requires a scavenger chart or significant reputation with the clans.

# === MECHANICS.md ===

# MECHANICS.md — Wayfarer Game Mechanics

> **This document describes how systems behave — not what specific items, ships, or values exist.** Stats, item definitions, and tuning constants live in CSV source files (`data/*.csv`) and JS data files. For world/faction context see `LORE.md`. For visual conventions see `UX.md`.

---

## Movement & Throttle

Discrete throttle levels from Stop through Flank. W/S step up or down; the level persists until changed. Ships have momentum — acceleration and deceleration are gradual.

Fuel consumption scales with throttle level. The lowest level is free; consumption increases nonlinearly toward Flank. Running out of fuel clamps the ship to the lowest powered throttle level. Fuel efficiency is an engine module property that scales burn rate.

---

## Combat Mode

**F key** toggles combat mode. Standard mode disables weapons and shows a navigation reticle. Combat mode enables weapon firing (LMB, RMB, auto-fire turrets) and switches to a tactical crosshair.

Ammo cycling (`1`, `2`) is always available regardless of combat mode.

---

## Weapons

### Weapon Categories

**Primary weapons** (LMB / Space) — manually aimed toward the mouse cursor. Player fires the currently indexed primary weapon only. AI fires all weapons simultaneously. Requires combat mode.

**Secondary weapons** (RMB) — rocket pods and torpedoes. Same targeting logic. Player fires the indexed secondary weapon; AI fires all. Requires combat mode.

**Ammo cycling** — `1` cycles ammo type on active primary. `2` cycles on active secondary. Switching dumps the current magazine back to cargo reserves under the old ammo id and starts a reload from the new type's pool.

### Weapon Families

Each weapon family has a distinct combat role — kinetic vs energy, projectile vs hitscan, armor-focused vs hull-focused, fixed vs turret mount. Some weapons support multiple ammo types (AP/HE, different guidance modes). Energy weapons (lance, plasma) have no ammo but use overheat/ramp mechanics. Specific families, variants, and stats are defined in `data/moduleWeapons.csv` and the weapon class files in `js/modules/weapons/`.

Weapons may have variants (size, mount type) that share the same base mechanics but differ in stats. Fixed-mount weapons fire along the ship's heading; turret-mount weapons aim toward the mouse cursor.

### Ammo System

Ammo is a first-class data object defined in `data/ammo.csv`. Each ammo item has an id, display name, HUD tag, weight (cargo mass per round), scrap value, and optional guidance properties. AP and HE rounds are separate items in cargo — you hold them independently.

Weapons declare which ammo ids they accept (`acceptedAmmoTypes`) and track what's currently loaded (`currentAmmoId`). Weapons with multiple accepted types can cycle between them. Switching ammo dumps the current magazine back to cargo reserves and starts a reload from the new type's pool.

Guided ordnance (wire-guided, heat-seeking) stores its guidance type and strength on the ammo data object, not in weapon code.

### Projectile Behaviors

Projectiles can have special flags that modify their behavior:
- **AoE detonation** — explode on contact and/or at target point
- **Guided** — steer toward mouse cursor (wire) or nearest hostile (heat)
- **Interceptable** — can be shot down by weapons with intercept capability
- **Intercept** — destroy nearby enemy interceptable projectiles (point defense)
- **Beam intercept** — lance turret intercepts projectiles passing through the beam
- **Plasma falloff** — damage decreases proportionally with distance traveled
- **Beam** — hitscan on fire, rendered as a beam overlay

### Hit Flash

All ships flash red briefly when they take damage.

### Weapons Offline

The `_weaponsOffline` flag on a ship disables all weapons. Set by the hull degradation system at critical hull levels.

---

## Damage System

### Quad-Arc Positional Armor

Each ship has four armor arcs: front, port, starboard, and aft. The arc that takes the hit is determined by the impact angle relative to the ship's facing. Damage depletes the hit arc first. When an arc reaches zero, excess damage bleeds through to hull.

The aft arc has amplified hull bleed-through and a chance to damage engine integrity on each hull hit.

### Hull Degradation Cascade

As hull health drops, the ship progressively loses capability. Each threshold adds an effect that persists until hull is repaired at a station. Effects include engine sputtering, fire rate reduction, weapon misfires, turn rate penalties, speed caps, visual damage indicators, and screen warnings. At 0% hull the ship is destroyed. Specific thresholds are tuned in code.

### Field Repair (R key)

Press R when stopped (throttle 0) to enter repair mode. Armor, module, and hull repair run simultaneously:

- **Armor** — repairs the most-depleted arc first; costs scrap per armor point; auto-cancels when full
- **Module condition** — improves the worst-condition installed module one step at a time; costs scrap per step
- **Hull** — requires an Engineering Bay module; restores hull points at a slower rate and higher scrap cost than armor; auto-cancels when full

Press R again to cancel. Also cancels when all repairs are done or scrap runs out.

### Station Repair

Docking allows full armor restoration and hull repair. Both cost scrap. Hull repair shows a progress bar.

---

## Ship Classes

Ships are organized as class templates extended by specific variants. Each class defines a hull shape, slot count, and base stats. Specific ships (player, enemy, neutral) extend a class and override multipliers. All stat values are computed from base constants in CSVs via per-ship multipliers.

Ship classes, player ship, enemy ships, and neutral ships are defined in their respective JS files. See `js/ships/` for hull classes, `js/npcs/` for NPCs, and `js/ships/registry.js` for the registries.

---

## Combat AI

All non-player ships share the same AI system. Every ship tracks in `GameManager.ships[]`. A ship's `relation` field drives behavior (`hostile`, `neutral`, `friendly`).

### Ship AI Profile

Each ship carries a flat `ship.ai` object spread from a template defined in `data/aiBehaviors.csv`. Two keys define the full behavior: `combatBehavior` (what the ship does when hostile) and `passiveBehavior` (what it does otherwise). Characters and spawn overrides can change individual values without touching the base template.

### Combat Behaviors

Hostile ships patrol near home when the player is far, then switch to their combat behavior when the player enters aggro range. Low hull forces a flee regardless of behavior. Specific behaviors (stalker, kiter, standoff, lurker, flee) are defined in `data/aiBehaviors.csv`.

### Passive Behaviors

Non-hostile ships follow their passive behavior pattern. Traders follow two-point routes between stations. Militia orbit a fixed point. Both have combat fallback behaviors if attacked.

### Relation Transitions

When a player projectile hits a neutral ship: reputation penalty applied, relation set to hostile, AI immediately engages. Ships with zero aggro range only turn hostile through being attacked.

---

## World & Map

The main map is the Gravewake Zone. Named editor maps in `js/data/maps/` serve as development sandboxes. Static terrain includes arkship spines, debris clouds, and stations. Planet Pale is rendered as a background element.

---

## Ship Modules

Ships have a fixed number of module slots. Each slot has a physical mount point on the hull with a size (`small` or `large`). **Engine slots** only accept engine modules and vice versa. **Large modules** can only be installed in large-size mounts; small modules fit in any mount. General-purpose slots accept any non-engine module that fits. Modules are installed/removed via the Ship Screen (I key) — click installed modules to uninstall, click cargo modules then empty slots to install.

### Engine Modules & Thrust-to-Weight

Ship performance is **purely engine-derived**. Hull classes define only mass, durability, cargo capacity, fuel tank, and armor — no inherent speed or agility. Engine modules provide thrust; all modules, cargo, and fuel contribute weight. The thrust-to-weight ratio determines acceleration, top speed, and turn rate via power curves against a global reference T/W. Each stat has different sensitivity to T/W changes. All derived multipliers are clamped to a floor and ceiling. Fuel efficiency is also an engine property, not a hull property.

**Cargo capacity = mass budget.** Everything in the hold has mass: scrap, commodities, ammo, modules, weapons. Uninstalling a module moves its mass from "installed" to "cargo" — total ship mass stays the same.

**Recalculation is event-based** — triggered on module swap, cargo change, salvage completion, dock/undock, and engine condition change. Not computed every tick.

### Weapon Modules

Hardpoint modules that enable specific weapon types. Each draws power and occupies a slot.

### Power Generation Modules

Power modules add wattage to the ship's power budget. Types differ in fuel consumption, output, and maintenance requirements. Fission reactors require periodic overhaul at certified stations; output degrades when overdue.

### Power Budget Enforcement

When total power draw exceeds reactor output, modules are depowered by priority tier (sensors first, then weapons, then engines). Depowered modules are rendered dim, show "UNPOWERED" in tooltips, and stop functioning.

### Sensor / Passive Modules

Passive modules that extend minimap range, enable ship tracking, add combat overlays (lead indicators, health pips, telemetry), and provide salvage information. Each sensor type grants a specific set of capabilities.

### Fission Reactor Overhaul

Fission reactors track time since their last overhaul. When overdue, output degrades and the HUD shows a warning. Dock at a station with overhaul capability to pay for the reset. Overhauls can be performed early.

### Utility Modules

Passive stat-modifying modules that trade one advantage for a drawback (e.g. more cargo but less armor, more fuel but more weight). Bonuses scale with module condition.

### Salvage Bay (Large Utility)

A large-slot utility module that enables advanced salvage operations. When installed, salvaging a derelict extracts its installed modules and weapons (with their current condition) in addition to the standard scrap, fuel, and ammo yields. Destroyed modules are skipped. Modules appear as loot drops around the wreck. The salvage prompt shows "+ MODULES" when a Salvage Bay is active.

### Engineering Bay (Large Utility)

A large-slot utility module that enables field hull repair. When installed, pressing R while stopped also repairs hull damage at a slower rate and higher scrap cost than armor repair. Hull repair runs in parallel with armor and module repair. A CYAN "HULL REPAIR..." progress bar is shown during hull repair. Without this module, hull damage can only be repaired at stations.

### Module Condition

Modules salvaged from derelicts have a condition that affects their effectiveness: `good`, `worn`, `faulty`, `damaged`, or `destroyed`. Destroyed modules convert to scrap on pickup. Power and weapon effectiveness scale by condition multiplier. Field repair (R key) improves condition one step at a time.

### Mount Points & Module Visuals

Each ship class defines mount points — fixed hull positions where modules are physically visible. Each mount has an `arc` field tying it to the ship's armor arc system. Modules render at their mount point using small icons colored by condition.

### Hull Breach — Positional Module Damage

When the player takes hull damage below a threshold, each hit has a chance to damage a module by one condition step. The chance increases as hull gets lower. Breach candidates are filtered to modules whose mount arc matches the impact arc when possible.

---

## Ship UI Screen (I key)

Press **I** to toggle the Ship Status overlay. Closes with **I** or **Esc**.

Layout:
- **Left DOM panel** — hull/armor status, drive stats, scrap/cargo readout, cargo bay with filters (modules, commodities, ammo)
- **Canvas overlay** — installed module stat boxes connected by lines to hull mount points

**Jettison** — each cargo item can be ejected behind the ship as a loot drop.

---

## Navigation & Map (M key)

Press **M** to open the full-screen system map overlay with independent zoom/pan. The simulation continues while the map is open.

**Left-click** a station or derelict to set a waypoint. Left-click empty space for a freeform waypoint. **Right-click** to clear. **M** or **Esc** closes.

Map layers are gated by sensor capabilities: zones, stations, derelicts, hostile contacts, course line, fuel range circle, waypoint marker, player position.

**Nav indicator** (waypoint set, map closed): an edge-of-screen chevron pointing toward the waypoint with distance text. Below the minimap: current zone name, waypoint destination with distance and ETA.

---

## Economy

**Scrap** is the sole currency. Scrap has mass and takes cargo space.

**Fuel** drives movement. Tank size and drain rate are per-ship. Fuel can be purchased at stations.

**Ammo takes cargo space.** Each ammo type has a per-round weight. Both magazine contents and cargo reserves contribute to ship mass.

**Commodities** — tradeable goods with lore-flavored names. Supply levels (surplus/deficit) apply price multipliers. Station commodity profiles are defined in map data.

---

## Stations & Docking

Press **E** within docking radius to dock. Docking pauses the simulation.

Station screen tabs: Services (repair, refuel), Trade (commodities), Intel (lore), Bounties (kill contracts), Relations (faction standings). Allied standing applies a discount. Hostile standing refuses docking.

Press **Esc** or **E** to undock.

---

## Bounty Board

Stations post kill contracts against named enemy ships with a scrap reward and expiry timer.

**Flow:**
1. Accept a contract → target spawns; contract moves to active list
2. Kill the target → status completed; HUD notification
3. Dock at the posting station → automatic payout
4. Timer expires → target despawns; contract clears

---

## Reputation System

`game.reputation` tracks a standing value per faction. Standing ranges from Hostile to Allied.

At Hostile, docking is refused. At Allied, a discount applies. Faction list and thresholds are defined in `data/reputation.csv`.

**Triggers:** killing enemies affects that faction's standing; killing certain factions grants rival bonuses; bounty collection grants standing; hitting neutrals penalizes.

---

## Salvage

### Enemy → Derelict Transition

Non-player ships become derelicts when their hull drops to a critical threshold. On cripple: ship loses crew, AI, and movement; relation changes to derelict; kill feed and reputation trigger immediately. No loot scatters on cripple — loot comes from salvage only. The player still dies normally at hull 0.

### Salvage Process

Press **E** near a derelict to begin salvage. A progress bar fills; the player is frozen and vulnerable. **E** or **Esc** cancels. On completion, loot drops are computed from the wreck's remaining stats (armor → scrap, fuel tank → fuel, weapon magazines → ammo). If the player has a Salvage Bay installed, the derelict's installed modules and weapons are also extracted as loot drops with their current condition. The derelict persists but cannot be re-salvaged.

### Derelicts

Derelicts are Ships with `crew = 0` (`ship.isDerelict` getter). They use ship class constructors but are inert. Both pre-placed map derelicts and crippled enemies use the same salvage system. Each derelict has a hull class that determines its shape and color, plus lore text shown on approach.

---

## HUD / UI Mechanics

- **Status box** — colored arc segments (proportional to current armor), center hull fill; flashes on hit
- **Integrity row** — reactor, engine, sensor status indicators
- **Weapon readout** — active weapon names, cooldown bars, ammo counts
- **Throttle** — discrete pips; active pip highlighted
- **Fuel bar** — segmented bar with low-fuel warning
- **Scrap / Cargo** — text readouts
- **Minimap** — player, stations, enemies, derelicts, loot
- **Context prompts** — dock / salvage prompts near valid targets
- **Pickup text** — floating text at pickup location, color-coded by type

---

## Neutral Traffic

**Trade Convoys** follow two-point routes between stations with wait periods at each end. Ships on the same route are staggered at spawn.

**Militia Patrols** orbit a fixed point in concentric rings at different speeds.

---

## Ship / Character / Actor Architecture

**Ship** (`SHIP_REGISTRY`) — pure hull template. Shape, base stats, slot layout. No faction, no AI, no identity.

**Character** (`js/characters/character.js`) — a person who can inhabit a ship. Has `id`, `name`, `faction`, `relation`, `behavior`, `flavorText`, `ai`, `inShip`. `boardShip(ship)` syncs faction/relation/ai onto the ship; `leaveShip()` resets the ship to inert. Characters exist independently of ships — the same character can board different ships.

**Actor** (`CHARACTER_REGISTRY`) — a configured ship + character pair. `createActor(id, x, y)` (aliased as `createShip()`) instantiates a hull, configures modules, creates a Character, and boards it. Unmanned actors (Concord machines) set faction/relation/ai directly on the ship with no Character instance.

**Game state**: `game.characters[]` tracks all active Characters. `game.playerCharacter` is the player's Character. `game.ships[]` and `game.entities[]` are unchanged — all combat/rendering/AI code reads `ship.faction`/`ship.relation`/`ship.ai` as before.

---

## Editor Harness

The `editor.html` page is a live map viewer for layout and AI debugging. Pass `?map=NAME` to select a map. Available maps are in `js/data/maps/`.

Editor controls (do not conflict with game controls): pan mode, debug overlay, object sidebar, item menu, quick spawn. Debug overlay shows per-entity stat blocks and velocity/aim vectors. Object sidebar lets you place entities from registries. Item menu adds resources, modules, weapons, and ammo to player cargo.

---

## Planned (Next Up)

See `PLAN.md` for features ready to implement. See `FIXES.md` for small tweaks and bug fixes.


# === FIXES.md ===

# FIXES.md — Small Tweaks & Fixes

- Grave-Clan Ambusher: confirm heat missile target-lock behavior when multiple enemies are present
- Universal ship slots need to be small and large variants
- Tune damage and health of small ships


# === UX.md ===

# UX & Aesthetic Guide

This document defines the visual aesthetic for all Wayfarer UI elements and serves as a running log of UI/aesthetic decisions.

---

## Core Aesthetic: Vector Monitor / Cassette Futurism

The entire game screen should feel like a **vector monitor mounted in a 1970s-80s spaceship cockpit**. Think original *Star Wars* (1977) targeting computers, *Alien* (1979) ship interfaces, *Battlezone* (1980), early Atari vector arcade cabinets, and the general cassette futurism aesthetic: high-tech as imagined before the personal computer revolution.

### Guiding Principles

1. **Neon lines on black.** The display is a dark CRT. All UI elements are drawn as bright vector lines, outlines, and text against near-black backgrounds. Minimal fills — prefer strokes, outlines, and wireframes over solid filled rectangles.

2. **Limited neon palette.** A small set of vivid, phosphor-style colors:
   - **Cyan/teal** (`#00ffcc`, `#4af`) — Primary UI color. Borders, labels, general readouts.
   - **Amber/gold** (`#ffaa00`, `#fd8`) — Credits, prices, warnings. Warm instrument tone.
   - **Green** (`#00ff66`, `#4fa`) — Positive states: full health, docking prompts, player-owned ships.
   - **Red/orange** (`#ff4444`, `#f64`) — Damage, enemies, hostile contacts, critical warnings.
   - **Blue** (`#4488ff`) — Friendly/allied contacts.
   - **Magenta/violet** (`#ff44ff`, `#a8f`) — Rare items, Concord-related, exotic/unusual.
   - **White** (`#ffffff`) — Sparingly. Bright accents, highlighted text, crosshair.

   **Color-by-relation rule for ships:** Ship color conveys the entity's **relation to the player**, not its type or faction. Green = player-owned, amber = neutral/cautious, red = hostile, blue = friendly. Ship **type** (gunship vs hauler vs frigate) is distinguished by **size and shape** (silhouette). Non-ship world entities (planets, asteroids, nebulae, stations) are exempt and may use any color that serves the aesthetic.

3. **Monospace everything.** All text uses monospace fonts. No proportional fonts anywhere. Text should feel like terminal output or a dot-matrix printout.

4. **Scanline / CRT feel.** Subtle effects that suggest a phosphor display:
   - Faint scanline overlay (horizontal lines at low opacity).
   - Slight glow/bloom on bright elements (draw the element, then draw it again slightly larger at low opacity).
   - Text and lines should feel crisp but with a slight luminous haze.

5. **Angular, geometric shapes.** UI panels use sharp corners or 45-degree chamfered/clipped corners — not rounded. Think military HUD brackets, targeting reticles, and technical schematics. Decorative corner marks (e.g., small `L`-shaped brackets at panel corners) reinforce the cockpit instrument feel.

6. **No photorealism.** Everything is abstracted. Ships are wireframe or flat-polygon silhouettes. Planets are simple circles with minimal gradient. The beauty is in the clean geometry and color, not in detail or realism.

7. **Minimal fills, maximum line work.** Backgrounds should be transparent or near-black. Bars (health, throttle) can use dim fills, but the emphasis is on the bright outline and the colored fill portion. Buttons are outlined, not filled solid.

---

## Color Reference

### UI Chrome
| Element | Color | Hex |
|---|---|---|
| Panel borders, brackets | Cyan | `#00ffcc` |
| Panel background | Near-black, high transparency | `rgba(0, 8, 16, 0.85)` |
| Divider lines | Cyan, low opacity | `#00ffcc` at 20-30% alpha |
| Inactive/disabled text | Dim grey-blue | `#445566` |

### Data & Readouts
| Element | Color | Hex |
|---|---|---|
| Primary labels & text | Cyan | `#00ffcc` |
| Credits / prices | Amber | `#ffaa00` |
| Cargo / quantities | Teal | `#44aaff` |
| Positive status (full, OK) | Green | `#00ff66` |
| Negative status (damage, critical) | Red | `#ff4444` |
| Exotic / rare / Concord | Magenta | `#ff44ff` |

### Minimap
| Element | Color | Hex |
|---|---|---|
| Player fleet | Cyan | `#00ffcc` |
| Settlements | White | `#ffffff` |
| Enemies | Red | `#ff4444` |
| Moons | Dim green | `#448844` |
| Derelicts / scrap loot | Amber | `#ffaa00` |
| Module loot diamond | Cyan | `#00ffcc` |
| Weapon loot diamond | Magenta | `#ff00aa` |
| Ammo loot diamond | Green | `#00ff66` |
| Wormholes | Magenta | `#ff44ff` |
| Minimap border | Cyan, dim | `#00ffcc` at 40% alpha |
| Background | Black, translucent | `rgba(0, 4, 8, 0.8)` |

### Map View & Navigation

Full-screen canvas overlay opened with **M**. Own world→screen transform independent of game camera.

| Element | Color | Hex |
|---|---|---|
| Map background | Near-black | `rgba(0,4,8,0.92)` |
| Zone border circles | Dim cyan | `rgba(0,255,204,0.15)` |
| Waypoint marker | Amber | `#ffaa00` |
| Course line (dotted) | Amber | `#ffaa00` at 60% |
| Fuel range circle (dashed) | Amber | `rgba(255,170,0,0.25)` |
| Station icons | Faction-colored diamond | per `FACTION` map |
| Player marker | Green triangle | `#00ff66` |
| Bounty targets | Pulsing red diamond | `#ff4444` |

Nav indicator (in-flight, waypoint set): amber chevron at screen edge with distance text.

Below minimap: zone name (dim text), waypoint destination + distance + ETA (amber).

### Module Visuals on Hull
Modules render at defined mount points on the ship hull, drawn after `_drawShape` in ship-local coordinates. Each icon is 4–8px, stroked in `conditionColor(mod.condition)` with a dim fill. Destroyed modules show as dim outlines only (alpha 0.2). Empty slots render as a faint `DIM_OUTLINE` ring.

| Category | Shape | Notes |
|---|---|---|
| Engine | Trapezoid (wide top, narrow bottom) | Nozzle silhouette |
| Weapon:autocannon | Thin rectangle (2×8) | Barrel |
| Weapon:cannon | Stubby rectangle (3×6) | Block |
| Weapon:lance | Vertical line + dot | Emitter |
| Weapon:rocket | Rectangle (6×5) + 2 inner dots | Tube rack |
| Reactor | Chamfered square (7×7) + inner glow dot | Glow: cyan (fuel cell), amber (fission), magenta (fusion) |
| Sensor | Ring + antenna line + tip dot | Dish/antenna |

Source: `js/rendering/moduleVisuals.js`.

### Module Condition Colors
Used in Ship Screen slot badges, cargo pill badges, tooltip CONDITION/MULT rows, and hull mount point module icons. Helper: `conditionColor(condition)` from `colors.js`.

| Condition | Color | Hex | Mult |
|---|---|---|---|
| `'good'` | Green | `#00ff66` | ×1.00 |
| `'worn'` | Amber | `#ffaa00` | ×0.85 |
| `'faulty'` | Orange | `#ff8800` | ×0.65 |
| `'damaged'` | Red | `#ff4444` | ×0.35 |
| `'destroyed'` | Very dim | `#223344` | ×0.00 → drops as scrap |

### Derelict Hull Class Colors
Each class has a distinct hull stroke color. Used in `derelict.js`.

| Class | Color | Hex |
|---|---|---|
| `'hauler'` | Warm rust-brown | `#886633` |
| `'fighter'` | Muted green-grey | `#667744` |
| `'frigate'` | Muted blue-grey | `#556688` |
| `'unknown'` | Magenta | `#ff00aa` |

### Ship Relation Colors
Ship color is driven entirely by `ship.relation` — a single string property. Change it and the hull color updates instantly. No color is ever hardcoded in a ship class.

| `relation` | Color | Hex | Usage |
|---|---|---|---|
| `'player'` | Green | `#00ff66` | The player's own ship |
| `'neutral'` | Amber | `#ffaa00` | Ships with no strong alignment |
| `'enemy'` | Red | `#ff4444` | Actively hostile |
| `'friendly'` | Blue | `#4488ff` | Allied ships |
| `'none'` | White | `#ffffff` | Designer preview (no relation context) |

Engine trail color and engine glow match `relation` automatically via the same `RELATION_COLORS` lookup.

### Faction Accents (UI / Stations only)
Faction accents are used for **station UI**, **minimap labels**, and **faction insignia** — not for ship hull color (which follows the relation table above).

| Faction | Accent Color | Hex |
|---|---|---|
| Settlements | Cyan | `#00ffcc` |
| Scavenger Clans | Orange/rust | `#ff8844` |
| Concord Remnants | Violet/white | `#cc88ff` |
| Void Fauna | Bioluminescent green | `#44ff88` |
| Monastic Orders | Deep blue | `#4488ff` |
| Zealots | Magenta/red | `#ff44aa` |
| Communes | Warm yellow-green | `#aaff44` |

---

## UI Element Patterns

### Panel / Window Frame

```
  +---------+       Outer border: 1-2px cyan stroke
  |         |       Background: near-black, ~85% opacity
  |         |       Corner brackets (optional): small L-shapes
  +---------+       at each corner for a targeting-reticle feel
```

- Panels should have **chamfered corners** (45-degree cuts) or simple right angles with decorative bracket marks.
- No drop shadows. No rounded corners. No gradients on borders.
- Dividers inside panels: thin horizontal lines in the accent color at low opacity.

### Buttons

- **Outlined rectangles** with text centered inside. No solid fills when idle.
- Idle: dim outline (`#335566`), dim text.
- Enabled/available: bright outline (cyan or accent color), bright text.
- Hover (if implemented): fill with accent color at ~15% opacity, text brightens to white.
- Disabled: very dim outline and text (`#223344`).

### Health / Status Bars

- Background track: very dark, barely visible (`rgba(0, 16, 32, 0.5)`).
- Fill: bright color corresponding to the stat (cyan for armor, amber for hull).
- Outline: 1px stroke in the same color as the fill, slightly dimmer.
- Critical state: bar color shifts to red, pulses/flashes.
- Consider a segmented bar style (discrete blocks rather than smooth fill) for a more digital/instrument feel.

### Throttle Display

- Row of discrete pips/segments, outlined.
- Active segment: filled with cyan, bright text.
- Inactive segments: dim outline only.
- Speed readout below in monospace, amber or cyan.

### Crosshair / Targeting Reticle

- Thin vector lines. A simple cross or brackets `[ + ]` style.
- Subtle rotation or pulse animation.
- Color: white or cyan. Shifts to red when over an enemy.

---

## CRT / Scanline Effect

A subtle fullscreen post-processing pass (or overlay) to sell the vector monitor look:

1. **Scanlines:** Horizontal lines every 2-4 pixels at very low opacity (`rgba(0, 0, 0, 0.06-0.1)`). Should be barely perceptible — felt more than seen.

2. **Vignette:** Slight darkening at screen edges. Simulates CRT curvature and phosphor falloff. Can be done with a radial gradient overlay.

3. **Glow / Bloom:** Bright UI elements (text, lines, bars) can be drawn twice — once sharp, once slightly larger/blurred at low opacity — to simulate phosphor glow. Keep this subtle; heavy bloom looks modern, not retro.

4. **Flicker (implemented):** A black fullscreen rect with `globalAlpha = 0.03 * Math.random()` drawn after vignette, before crosshair. Dims the frame 0–3% randomly each tick — subliminal brightness variation matching the "0.97–1.0 globalAlpha at ~30Hz" spec.

**Performance:** Scanlines and vignette are pre-rendered to offscreen canvases (rebuilt on resize via `_ensureCaches()`), then composited with a single `drawImage()` call each frame. Starfield layers also use per-layer offscreen canvases with parallax tiling (3–12 `drawImage` calls vs ~350 `fillRect` calls). Edge warning gradients (flank speed amber, hull critical red) are cached as `CanvasGradient` objects and reused each frame with `globalAlpha` for pulsing — eliminates 4–8 `createLinearGradient()` + 8–16 `addColorStop()` per frame.

---

## Typography

- **Font:** `'Fira Mono', monospace` (exported as `FONT` from `js/rendering/draw.js`). All canvas and DOM text uses this font family.
- **All caps** for all canvas world-space text (station names, zone labels, prompts, flavor text). Mixed case only for DOM body text and descriptions.
- **Spacing:** Generous. Instruments are meant to be read at a glance in tense situations. Don't cram text together.

### Canvas Text Style System

Standardized text styles are defined in `js/rendering/draw.js` as named constants. Each exports `{ font, alpha, size, weight }`. **Always use these constants** — never hardcode font strings in canvas rendering code. Color is always per-call.

| Style | Size | Weight | Alpha | Usage |
|---|---|---|---|---|
| `TITLE` | 48px | normal | 0.7 | Major world landmarks — station names, planet/moon names |
| `SUBTITLE` | 24px | normal | 0.5 | Zone labels, sub-areas, smaller station names |
| `PROMPT` | 12px | bold | 1.0 | HUD prompts, progress bars, status indicators, action text |
| `FLAVOR` | 12px | normal | 0.6 | On-map flavor text, derelict lore, ambient descriptions |
| `LABEL` | 10px | normal | 0.65 | Weapon panels, throttle readout, ammo counts, dev controls |
| `MINIMAP` | 10px | normal | 1.0 | Minimap station/entity names |

**Usage with `text()` helper:** `text(ctx, 'THE COIL', x, y, color, { style: TITLE })` — the style preset provides size/weight/alpha defaults; individual opts can still override.

**Usage with raw ctx:** `ctx.font = PROMPT.font; ctx.globalAlpha = PROMPT.alpha;` — use `.font` for pre-built font string, `.alpha` for the standard opacity.

### DOM Text (CSS Utility System)

DOM panels use a shared CSS utility system defined in `css/panel.css`. Three typography tiers via CSS custom properties:

| Variable | Size | Usage |
|---|---|---|
| `--p-text` | 13px | Body text, stat values, choices, dialogue |
| `--p-title` | 16px | Panel/section titles, station names |
| `--p-small` | 11px | Tooltips, cargo filters, barter labels, jettison buttons |

**Typography utility classes** (defined in `panel.css`):
- `.p-heading` — 16px bold uppercase, 0.12em spacing (panel titles)
- `.p-subheading` — 13px bold uppercase, 0.08em spacing (section headers)
- `.p-text` — 13px body text
- `.p-label` — 13px uppercase, 0.08em spacing
- `.p-hint` — 13px, very-dim color
- `.p-small` — 11px compact text
- `.p-bold`, `.p-upper`, `.p-italic`, `.p-wide` — modifiers

**Color utility classes**: `.t-cyan`, `.t-amber`, `.t-green`, `.t-red`, `.t-magenta`, `.t-white`, `.t-dim`, `.t-very-dim`

**Rule:** Never hardcode `px` font sizes in panel CSS. Use `var(--p-text)`, `var(--p-title)`, or `var(--p-small)`. Dev-only tool panels (designer, editor) may use `10px` for compact labels below the standard tiers.

Panel-specific CSS files (`css/ship.css`, `css/narrative.css`, `css/designer.css`, `css/editor.css`) inherit variables and utilities from `panel.css`.

---

## Specific UI Components

### Ship Panel (`js/ui/shipScreen.js`, `css/ship.css`)
- **DOM-based left 30% panel** (`#ship-panel`), `height: calc(100vh - 48px)` to sit above the bottom HUD bar. Near-black background with scanline overlay, left border in cyan.
- Opens with `I`, closes with `I` or `Esc`. Pauses simulation while open. Camera zooms to 4× on the player ship. World remains visible in the remaining viewport.
- **Header:** Ship name (HULLBREAKER), class description, `[I] / [Esc]` hint.
- **Stats section:** 2-column grid of stat rows (HULL, ARM-F/P/S/A, SPEED, FUEL, SCRAP). Values colored by status (green=good, amber=normal, red=critical).
- **Module mount UI (canvas, to the right of the DOM panel):** Replaces the old DOM module list. Stat boxes are drawn on canvas between the panel edge and the ship hull, connected by cyan lines to the actual mount points on the hull.
  - **Installed slots:** One box per mount point, stacked vertically. Each box shows: `[E]`/`[N]` slot label, abbreviated module name, power (`+/-W`), condition dot. Empty slots show dashed cyan border with "EMPTY" label.
  - **Cargo modules:** Below a divider line, uninstalled modules from inventory are listed in smaller boxes.
  - **Connection lines:** Dashed CYAN lines (alpha 0.3) from right edge of each stat box to its hull mount point. Hovered: solid, alpha 0.9, lineWidth 1.5.
  - **Hover:** Box or mount point → box expands to show full stats (condition, power, thrust, weight, fuel drain, etc.). Corresponding mount point gets a cyan ring highlight.
  - **Click installed box:** Uninstalls module to cargo section.
  - **Click empty slot box:** When a cargo module is selected in the DOM cargo list, clicking a compatible empty slot starts the 1.5s install. Engine modules → engine slots; non-engines → non-engine slots.
  - **Inventory mode:** While ship screen is open, `ship._inventoryMode = true`. Mount point outlines render in CYAN with higher alpha. Installed module icons get a subtle cyan ring.
- **Cargo bay (DOM):** Header with used/capacity count. Filter buttons (ALL | MODULES | COMMODITIES | AMMO). Scrollable list: scrap always first, then commodities, modules (clickable to select for install), weapons, ammo reserves. Selected module highlighted in green; click a compatible empty canvas slot to install.
- **When docked with station open:** ship panel (left 30%) + station panel (right 30%) + world (middle 40%).
- Input gating: `stopPropagation` on panel mousedown/click prevents canvas weapon fire.

### Narrative Panel (`js/ui/narrativePanel.js`, `css/narrative.css`)
- **DOM-based right 30% panel** (`#narrative-panel`), `height: calc(100vh - 48px)`, left border in cyan. World visible in remaining viewport. Camera centers on docked station.
- **Disco Elysium-style scrolling narrative log** — every interaction is a conversation. No tabs, no generic service panels. Navigation is narrative: zone choices are dialogue options.
- **Header:** Station name, faction badge, standing, scrap count, `[Esc]` hint.
- **Log area** (`.np-log`): Scrollable log of entries. Types: `narration` (flavor/title/system), `dialogue` (speaker + text), `action` (player's chosen action in green italic), `result` (outcome in amber/green/red). Entries fade in with 200ms animation.
- **Choice buttons** (`.np-choices`): Pinned to bottom. Ephemeral — when picked, they become an `action` entry + whatever follows. Disabled choices shown greyed with reason text.
- **Zone dividers** (`.np-divider`): Thin cyan line + zone label centered. Inserted on zone transitions — log is NOT cleared, entire docking session scrollable.
- **Barter screen** (`.np-barter`): Renders inline in the log as a special entry. Item rows with +/- quantity controls, confirm/cancel buttons. Greyed out after completion.
- **Conversation scripts**: Async functions in `js/ui/narrative/conversations/`. Each `await log.choices(...)` to pause for player input. Hub conversations loop zone choices + `[Undock]`.
- **Esc** closes the panel (and undocks).
- **Story flags**: `game.storyFlags` (session-only key→value map). First-visit narration, NPC memory, gated dialogue branches.

### HUD (In-Flight)

The HUD has three zones: **ship-anchored UI** (canvas, follows ship), **bottom strip** (DOM, fixed bar), and **minimap** (canvas, top-right).

**Ship-anchored UI (canvas, centered on the ship):**
- **Weapon readout** — directly above the ship. Two rows: `PRI` (cyan) and `SEC` (magenta). Name + cooldown/reload bar + ammo count. Anchored ~85px above ship center in screen space.
- **Throttle pips** — directly below the ship. Six labeled pips (`Stop/1/4/1/2/3/4/Full/Flank`), active pip filled cyan. Speed and throttle label above the pips. System integrity symbols `[R][E][S]` below the pips in dim text (red if low).

**Bottom strip (DOM, `#hud-bottom`, `css/hudBottom.css`):**
- Fixed 48px bar at bottom of viewport, z-index 20. Near-black background with top cyan border. `pointer-events: none`.
- Single row with centered segments: ARMOR pips | HULL bar | FUEL bar | PWR readout | CARGO bar | SCRAP count.
- **ARMOR pips:** 4 small boxes labeled `F/P/S/A`, each with colored fill bar by arc health (green→amber→red via `armorArcColor`). `current/max` text to the right.
- **HULL bar:** 110px wide bar, green fill, border turns red below 25%. `current/max` text.
- **FUEL bar:** Amber bar, border turns red below 25%. `current/max` text.
- **POWER readout:** `PWR +300W [+50W]` — green gross output, net in green/red. Flashing `! OVERHAUL` warning when fission reactor is overdue.
- **CARGO bar:** Blue bar, turns red when full. `used/capacity` text.
- **SCRAP count:** `⚙ 123` in bold amber.
- All bars and values updated via DOM manipulation in `HUD._updateBottomStrip()` each frame — no canvas rendering.

**Minimap:** Top-right corner. 225×225, bracket-corner border. Stations (faction-colored squares), derelicts (amber squares), loot (amber dots), enemies (red dots) when sensor capability is installed. Player dot (green triangle, rotation-aware).

**Kill log:** DOM-based (`#hud-kill-log`), positioned below the minimap via CSS. Entries are `<div class="hud-kill-entry">` elements with a CSS `kill-fade` animation (3s linear fade-out). Removed from canvas on `animationend`.

**Pickup text:** DOM-based (`#hud-pickup-container`), positioned over the ship via JS `transform: translate()` each frame. Entries are `<div class="hud-pickup-entry">` with color-hint CSS classes (`.pickup-breach`, `.pickup-repair`, `.pickup-hostile`, `.pickup-module`, `.pickup-cargo`, `.pickup-default`). 2s fade-out animation. Removed from canvas on `animationend`.

**Contextual prompts:** Centered horizontally at ~62% screen height. Dock/salvage/repair prompts appear here, pulsing slightly.

**Crosshair cursor:** Custom canvas crosshair replaces the OS cursor (`cursor: none` on canvas). Two modes based on combat state:
- **Standard mode** (default): Cyan hollow circle (r=6, stroke 1.5px, 75% alpha). No range feedback.
- **Combat mode** (F key toggle): Four short arms with a center dot. Green when within weapon range; red with "OUT OF RANGE" label when beyond range.

**Combat mode border:** When combat mode is active, a solid 2px red frame is drawn inset 8px from the screen edges. Thicker 3px L-shaped corner brackets (40px arms) overlay the corners. `[COMBAT MODE]` text centered at the top.

**Ship health via ship rendering:** The player ship's hull fill color indicates overall hull health — green (>75%), yellow-green (>50%), orange (>25%), red (critical). The hull outline is split into 4 arc segments (front, starboard, aft, port) each colored by that arc's armor health via `armorArcColor(ratio)`. This applies to **all ships when `relation === 'player'`** — directional damage is readable by looking at the ship itself.

### Game World Elements
- **Ships:** Wireframe polygons with minimal fill. Ship types are distinguished by **size and shape** (silhouette), not color. Color indicates **relation to the player**: green = player-owned, amber = neutral/cautious, red = hostile, blue = friendly. Non-faction entities (planets, asteroids, nebulae) may use any color that serves the aesthetic. Engine glow is pulsing outline circles at exhaust points; engine trails are long fading lines behind moving ships.
- **Stations:** See station design philosophy below.

### Derelict World-Space Labels

Derelicts render two types of text directly in world-space (anchored to the hull's screen position), not in the HUD:

Both are proximity-triggered — only rendered when `derelict.isNearby = true` (player within interaction range). No derelict name label; the lore text replaces it.

1. **Lore paragraph** — Rendered to the **right** of the hull. `FLAVOR` style (12px normal, `DIM_TEXT`, 0.6 alpha scaled by distance). No blinking. Multiple lines from `derelict.loreText[]` spaced 16px apart, vertically centered on the hull. Story unfolds as the player approaches — not in a HUD box.

2. **`[ E ] SALVAGE` prompt** — Rendered **below** the hull. `PROMPT` style (12px bold), AMBER, blinking (sinusoidal alpha 0.55–0.90).

Set `isNearby` on the derelict entity from `game._checkDerelictInteraction()`; clear it when no longer nearby.

**Principle:** Contextual prompts and lore belong to the world, not the HUD. The HUD is for combat-critical readouts. Discovery text should feel like it's written on the object itself.

### Station Design Philosophy

Stations are **not** sleek, symmetric, corporate structures. This is a broken universe. Stations look like they were assembled over decades by whoever had the parts. Design principles:

1. **Built from rectangles, not polygons.** Each station is a collection of distinct rectangular hull plates and modules of different sizes — stacked, offset, and bolted together. No hexagons. No perfect symmetry. The irregularity of the rect arrangement IS the character.

2. **Asymmetric by design.** Left and right sides should differ. One arm is wider than the other. Panels extend at slightly different lengths. A section may jut out or step in unexpectedly. This should feel like it grew organically over time, not like it was CAD-designed.

3. **Cobbled construction language.** Visual detail should reinforce the "scrapped together" feel:
   - Thin seam lines between hull sections (at low alpha)
   - Small overlapping patch panels at slight rotations (`strokeRect` at 5–20° offset)
   - Rivet-dot at patch center
   - Inner-surface ribs (faint horizontal lines across arms/modules)

4. **Relation color signals station attitude — not faction.** Structure (hull plates, rects, brackets) is always WHITE at partial alpha. Accent elements — nav lights, pier lights, beacons, labels — use the `accentColor` getter driven by `station.relation`: AMBER = neutral (default for all factions), CYAN = friendly, RED = enemy. Fuel tanks are always AMBER regardless of relation (hazard marking, not faction). Stations expose `outlineColor` (bright accent for canvas labels and UI borders) and `fillColor` (dimmed 15% alpha version for UI panel backgrounds) — both derived from `accentColor`.

5. **Docked ships add life.** Use small boxy ship silhouettes (rectangular hull + cockpit block + wing stubs) parked at jetty tips and inner piers. Vary rotation and scale. They should read as "in various states of disassembly/assembly" — not all perfectly aligned.

6. **Animated docking lights at every pier tip.** Pulsing sinusoid, slightly offset per pier so they don't all pulse in sync. Pier light color = `accentColor`.

7. **Approach beacon at the harbor mouth.** Two beacons at the harbor entrance corners, pulsing together. A faint trapezoidal gradient beam pointing away from the mouth. Beacon color = `accentColor`.

8. **Label below the structure** in `outlineColor`, SUBTITLE style (24px, uppercase).

9. **Zone flavor text proximity fade.** Each station zone's first flavor line fades in when the player flies near that area, using `FLAVOR` style (12px, accent color). Distance threshold: 400 world units from the zone's label position (`worldOffset + labelOffset`). Smooth lerp at 1.2/sec. Same principle as derelict lore text — discovery is gradual. Rendered by `Station.renderZoneFlavor()` in the entity pass. Per-zone alphas stored in `station._zoneFadeAlphas`.

10. **Zone labels are data-driven and always visible.** Station area labels (e.g. "MARKETPLACE", "SLUMS") are rendered by `Station.renderZoneLabels()` in the entity render pass, using `SUBTITLE` style in the station's `accentColor`, left-aligned. Each layout zone has `labelOffset: { x, y }` (world-space offset from `worldOffset`) that positions the label near the corresponding structure. No separate inline labels in station renderers — zone names come from layout data only. The station title (e.g. "THE COIL") remains hardcoded in the renderer using `TITLE` style.

**Anti-patterns to avoid:**
- No hexagons
- No symmetric 4-arm or 6-arm radial designs
- No solid fills on hull (dark near-black fill with bright outline only)
- No rounded corners
- Don't draw stations as single closed polygon paths — individual rects are preferred

### Celestial Body Rendering

Planet and moon visuals follow the **CRT surface-scanner aesthetic** — line work only, no gradients, no filled areas. The look is a topographic instrument readout, not a painting.

**Rendering style by planet type:**

- **Ice / rocky worlds (surface visible from space):** Topographic contour polygons clipped to the disk. Draw 3–6 closed irregular polygon paths at decreasing scales — nested, offset, not centered — to suggest terrain elevation layers. Jagged straight-line segments between vertices (no bezier smoothing). The visual reference is the Nostromo descent computer in *Alien* (1979): a CRT scanner reading back surface topology as jagged closed curves. Pale (`#b8ccd8`) is the reference implementation in `js/world/zones/gravewake/planetPale.js`.

- **Gas giants:** Horizontal band striations — thin lines or arcs at different y-offsets across the disk, clipped. Bands should vary in spacing and opacity. Optional: planetary rings as thin ellipses angled across the limb. No solid fills.

- **Habitable worlds (brine seas, landmasses):** Continental landmass contours — filled faintly with coastline strokes. Same jagged polygon style as ice worlds, but with filled landmasses at very low alpha and distinct coastline outlines. Thalassa (`#4a9a6a`) is the reference implementation in `js/world/zones/gravewake/moonThalassa.js`.

- **Thick-atmosphere worlds (shrouded):** Geometric cloud swirls — angular spiral or arc segments that suggest cloud bands without being smooth curves. Straight-line approximations of spiral paths, or stacked arc segments offset from center, clipped to disk.

**Common rules for all planet types:**
- Very faint body fill (0.05–0.08 alpha) — just enough to read as a disk, not a ring
- All surface detail clipped to the disk
- Thin outer atmosphere haze ring (single stroke, very low alpha) where appropriate
- Bright limb outline (1–2px stroke)
- Parallax applied at ~0.7× camera speed — planets are always background, never on the ship plane
- Name label fades in only when the player is near the surface

- **Projectiles:** Color and shape convey weapon type:
  - **Autocannon rounds (kinetic):** Amber streaks (`#ffaa00` glow, `#ffe0a0` core). Slightly longer lines, slower travel speed. The most common projectile in the game — weighty and impactful.
  - **Laser bolts:** Cyan streaks (`#00ffcc` glow, `#ccffff` core). Thin, fast, short lines. Rare — only seen on well-equipped ships.
  - **Missiles/Rockets:** No particle effect. A **pulsing amber circle** (`#ffaa00`) at the head — outer glow ring + inner bright ring + white core dot, fast pulse (~18Hz). A long **amber engine trail** behind it (position-history polyline, same technique as ship engine trails: fades in alpha and width toward the oldest point). Evokes the Homeworld-style missile aesthetic: a glowing ball of propulsion leaving a bright smear across the void.
- **Explosions:** Expanding rings/circles (vector style) with scattered particle sparks. Not filled bursts — concentric rings that expand and fade.

---

## Decision Log

### 2026-03-07: Establish Vector Monitor Aesthetic
- **Decision:** All UI should look like a vector monitor display from a 1970s-80s spaceship. Cassette futurism / original Star Wars targeting computer style.
- **Key points:** Neon on black, monospace text, outlined elements over filled, scanline/CRT effects as polish layer.
- **Palette:** Cyan primary, amber for values, green for positive, red for negative, magenta for rare/exotic.
- **Rationale:** Fits the retrofuturist lore (CRT terminals, analog instruments, deliberately primitive computing) and gives the game a distinctive visual identity with procedural vector graphics.

### 2026-03-07: Color-by-Relation Rule
- **Decision:** Ship color indicates **relation to player** (green = owned, amber = neutral, red = hostile, blue = friendly), NOT ship type or faction. Ship types are distinguished by **size and shape** (silhouette).
- **Exception:** Non-faction entities (planets, asteroids, nebulae, stations) can use whatever color serves the aesthetic.
- **Rationale:** At a glance in combat, the player needs to instantly know friend from foe. Shape + size differentiates ship class. Color overloading both faction and relation is confusing — relation is the critical combat readout.

### 2026-03-11: CONCORD_BLUE — Faction Stroke Override for Concord Enemies
- **Decision:** Added `CONCORD_BLUE = '#4488ff'` to `colors.js`. Concord enemies use `ENEMY_FILL` (relation-based fill, red tint) but their stroke is overridden to `CONCORD_BLUE` instead of `ENEMY_STROKE` (`RED`).
- **Entities:** DroneControlFrigate and SnatcHerDrone both import and hardcode `CONCORD_BLUE` as stroke in their `_drawShape()` implementations.
- **Rationale:** The color-by-relation rule governs **fill** (a combat readout — red tint = hostile). Stroke color is secondary detail that communicates faction origin — machine-cold blue distinguishes Concord constructs from human-piloted scavenger ships at a glance. The drone core dot is also `CONCORD_BLUE`, reinforcing the machine identity. This is a deliberate exception: fill = relation, stroke = faction (Concord only).
- **`FACTION.concord`:** Added to the FACTION map in `colors.js` for station/UI badge use.

### 2026-03-08: Dynamic Relation Color System
- **Decision:** `ship.relation` is the single property that drives all hull color (fill, stroke, engine glow, engine trail). Colors are looked up from `RELATION_COLORS` in `colors.js` via getters on the `Ship` base class. No color is ever hardcoded in a ship class or subclass.
- **Designer:** Ships displayed in the designer always have `relation = 'none'` → white silhouette (no relation context in preview).
- **Dynamic flipping:** Changing `ship.relation` at any time (e.g., from `'enemy'` to `'neutral'` when a pirate stands down) instantly recolors the ship with no other changes needed.
- **Subclasses:** Enemy ships set `this.relation = 'enemy'` in their constructor. Player ship sets `this.relation = 'player'`. No ship class ever imports or references color constants directly.

### 2026-03-07: Weapon Projectile Colors
- **Decision:** Projectile color conveys **weapon type**, not ship relation. Autocannon rounds are amber (`#ffaa00`), laser bolts are cyan (`#00ffcc`). This is an exception to the color-by-relation rule — projectiles follow weapon-type coloring.
- **Rationale:** Kinetic weapons are the universal standard; their amber streaks should dominate the battlefield. Laser bolts in cyan immediately read as "something different/rare." Players can identify weapon types at a glance, which matters for threat assessment (lasers strip armor fast).

### 2026-03-07: Rocket/Missile Visual — Homeworld Style
- **Decision:** Rockets use a **pulsing amber circle** at the head + a **long amber position-history trail** — no particles. Same trail technique as ship engines (polyline that fades in alpha and width). The head pulses at ~18Hz: outer glow ring, inner bright ring (`#ffe0a0`), white core dot.
- **Rationale:** User preference. Evokes the Homeworld missile aesthetic — a bright propulsion ball leaving a smear across space. Visually distinct from cannon streaks and laser bolts. More dramatic and readable at range than a small triangle.

### 2026-03-07: Ship Shape Philosophy
- **Decision:** All ships should feel **blocky, industrial, and utilitarian** — built from rectangular hull modules, not sculpted from smooth curves. No aerodynamic shaping. No organic silhouettes. Think offshore oil platform or containerized cargo vessel, not fighter jet.
- **Core rule — no curves in hull outlines.** Ship silhouettes are built entirely from straight lines and hard corners. Curves are only permitted for engine glow/trail effects, not hull geometry.
- **Stepped H/I-beam profiles are preferred.** A ship that changes width via a hard step — narrow bow tower, wide mid-section, narrow stern block — reads immediately as a modular, assembled vessel. This is the Garrison-class model.
- **Player scrap ship (flagship):** Repurposed space tug — wide flat bumper at the nose (for pushing debris), narrow elongated body section, single large engine bay extending out on the starboard side. One big engine. Reads as an asymmetric working vessel, not a warship.
- **Brawler (gunship):** Stout, wide, flat-fronted box. Reads as a tank.
- **Garrison Class Frigate:** H/I-beam profile — narrow rectangular bow tower, wide rectangular mid-hull, narrow rectangular stern block. Twin rectangular nacelle pods on short pylons. Structural detail seams (cross-bracing, keel, bow ribs) reinforce the assembled-from-modules aesthetic.
- **Hauler:** Semi-truck: small cockpit pulling rectangular cargo containers that snake behind via position history.
- **Anti-patterns to avoid in ship design:**
  - No smooth tapered bows (pointed like a fighter)
  - No swept or angled wings
  - No curved hull outlines
  - No teardrop or organic silhouettes
  - Nacelles and engine pods should be rectangular or chamfered-rectangular, not pointed
- **Rationale:** Shape is the primary way to identify ship type. Industrial/blocky shapes reinforce the salvage-tech lore (these ships were built to work, not to look fast), contrast cleanly with the vector rendering style, and are immediately distinguishable in combat at a glance.

### 2026-03-08: Station Design — No More Hexagons
- **Decision:** Stations must not use hexagonal or other regular polygon forms. All stations are built from collections of rectangles of varying sizes, deliberately misaligned, to feel cobbled-together rather than manufactured. Asymmetry is required.
- **Key rules:** Structure WHITE at partial alpha. `accentColor` (AMBER=neutral, CYAN=friendly, RED=enemy) drives lights and labels. Dark near-black fills only. Docked ship silhouettes (boxy rectangular) at jetty tips add life. Harbor mouth with approach beacon + gradient beam for docking stations. Fuel tanks always AMBER (hazard marking).
- **Anti-patterns banned:** hexagons, radial symmetry, single closed polygon paths, solid hull fills, rounded corners.
- **Rationale:** This universe is broken and improvised. Stations should look like they grew over decades from salvage and desperation, not like they were engineered by a functioning civilization.

### 2026-03-10: HUD Redesign — Ship-Anchored UI
- **Decision:** Removed the left-side circular armor ring panel. Replaced with two-zone HUD: ship-anchored UI (weapons above ship, throttle/speed below ship on screen) and a fixed bottom strip (armor pips + hull bar, fuel bar, power readout, cargo bar, scrap count). Minimap moved from bottom-left to top-right.
- **Ship rendering:** All ships now use directional armor arc rendering when `relation === 'player'`. Hull fill color reflects overall hull health (green→yellow→orange→red). Hull outline is split into 4 arc-colored segments (front/starboard/aft/port) each reflecting that arc's armor health. Helpers `_playerHullFill()`, `_drawHullArcs()`, `_strokeArcCurrent()` on `Ship` base class. All 4 ship base classes updated.
- **Bottom strip:** Row 1 = ARMOR 4-pip bar (same width as hull bar, labeled F/P/S/A) + PWR text. Row 2 = HULL bar + FUEL bar (centered) + CARGO bar + SCRAP count. 32px edge margins for comfortable screen breathing room.
- **Rationale:** The old HUD required constant glancing to the top-left corner. Anchoring throttle and weapons near the ship keeps eyes on the action. The bottom strip consolidates critical secondary readouts in one sweep-readable band. Directional health on the ship itself makes hull/armor state immediately obvious in combat without consulting a panel.

### 2026-03-11: UI Overhaul — Panels Replace Overlays (CA/CB/CC)
- **Decision:** Three-part UI overhaul: (1) Station screen from full-screen overlay to 30% right-side DOM panel, (2) Ship screen from canvas overlay to 30% left-side DOM panel, (3) Bottom HUD strip from canvas to DOM fixed bar.
- **Station panel (CB):** `#location-overlay` positioned `right:0; width:30%; height:calc(100vh-48px)`. Camera centers on station. Zone sidebar stacks below SVG. Service buttons become horizontal tab row. World remains visible in the remaining 70%.
- **Ship panel (CA):** `#ship-panel` positioned `left:0; width:30%; height:calc(100vh-48px)`. DOM sections: header, 2-column stat grid, **MASS & THRUST** section, scrollable cargo (with modules). **Canvas module mount UI** renders installed module stat boxes to the right of the DOM panel, connected by cyan lines to hull mount points. Click canvas box to uninstall; select module in DOM cargo, then click empty canvas slot to install. Hover for expanded stats. `stopPropagation` on mouse events prevents canvas weapon fire. T/W percentage color-coded: green ≥100%, default ≥80%, amber ≥60%, red <60%.
- **Bottom HUD (CA):** `#hud-bottom` fixed 48px bar at bottom. Single row: ARMOR pips, HULL bar, FUEL bar, PWR readout, CARGO bar, SCRAP count. DOM elements updated each frame via `_updateBottomStrip()`.
- **Docked with ship screen:** Left 30% (ship) + right 30% (station) + middle 40% (world).
- **Station renderers (CC):** AshveilStation custom renderer (~200px colony ship hull, 10 rectangular sections, docked ships, running lights, approach beam). Kell's Stop unchanged (~120px). The Coil unchanged (~300px).
- **Rationale:** Full-screen overlays broke immersion. Side panels keep the world visible, reinforce spatial context while docked. DOM-based UI is more maintainable than canvas text rendering and supports proper hover/click interactions. Bottom HUD bar clears the center viewport for combat readability.

### 2026-03-14: Narrative Log Panel — Replaces Station UI (CM)
- **Decision:** Replaced `LocationOverlay` (tabbed service panels) with `NarrativePanel` — a Disco Elysium-style scrolling conversation log where every station interaction is a conversation.
- **Architecture:** `NarrativePanel` (`js/ui/narrativePanel.js`) orchestrates; `NarrativeLog` (`js/ui/narrativeLog.js`) renders entries/choices/barter; conversation scripts in `js/ui/narrative/conversations/` are async functions.
- **Entry types:** `narration` (flavor/title/system styles), `dialogue` (speaker + text with character color), `action` (player's chosen action, green italic), `result` (outcome in amber/green/red/cyan). All entries fade in with 200ms animation.
- **Zone navigation is narrative:** No tab buttons. Hub conversation presents zones as dialogue choices (`[Walk to the fuel bay]`). Zone dividers insert a cyan line + label but DO NOT clear the log — entire docking session is scrollable.
- **Barter screen:** Inline in the log as a special entry. Item rows with +/- quantity controls, confirm/cancel. Replaces serviceTrade/serviceRepair.
- **Authored conversations:** Kell's Stop (kellHub, kellDock, kellIntel, kellBounties, kellTrade, kellRelations) and Ashveil Anchorage (ashveilHub, ashveilDock, ashveilTrade, ashveilBounties, ashveilIntel, ashveilRelations). Generic fallbacks for unscripted stations.
- **Station NPCs:** Each zone has named NPCs with personality — Ansa (Kell's mechanic), Harlan (barkeep), Venn (Ashveil trader), Chief Maro (repair chief), Dara (fixer), Sable (archivist). Speaker colors match faction/personality.
- **Story flags:** `game.storyFlags = {}` enables first-visit narration, NPC memory, cross-station references. Session-only until save system ships.
- **Deleted:** `locationOverlay.js`, all 6 `station/service*.js` files, `css/location.css`. Created `css/narrative.css`.
- **Rationale:** Generic service panels made every station feel identical. Narrative conversations give each station a unique authored voice, support story progression, and create the Disco Elysium-style interaction depth the game targets.


# === DATA (CSV) ===

