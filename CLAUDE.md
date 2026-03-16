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

- **Entry:** `engine/editor-main.js`
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

Editor UI chrome is DOM-based (not canvas). Classes in `engine/ui/editorPanels.js`, styled by `css/editor.css`:
- **`EditorHUDBar`** — fixed top status bar with hotkey segments
- **`EditorSidebar`** — right panel for object browsing/placement (toggle: `-` key)
- **`EditorItemMenu`** — left panel for adding items to cargo (toggle: `[` key)
- **`EditorPanBanner`** — pan mode indicator banner

Only `_renderDebugOverlay()` remains on canvas (world-space entity tracking).

### `designer.html` — Unified Designer

- **Source:** `engine/test/designer.js`, entry: `engine/designer-main.js`
- **Navigation:** `↑/↓` change category, `←/→` cycle item, `T` toggle rotation (ships), `R` reset view, scroll/drag to zoom/pan
- **Deep-link:** `designer.html?category=<cat>&id=<slug>`
- **In scope:** `data/hulls/**`, `engine/entities/**`, `engine/modules/**`, `engine/rendering/colors.js`, `data/ships/**`, `data/zones/**`
- Item slugs are defined in `engine/test/designer.js` — check there for current IDs.

### `designer.html` — DOM Panel

Stats panel is DOM-based. `DesignerPanel` class in `engine/ui/designerPanel.js`, styled by `css/designer.css`. Preview renderers (ship silhouettes, grids, module icons, weapon animations, module slot boxes + connection lines) remain on canvas.

## Architecture

### Entry Point

`index.html` → `engine/main.js` → creates `GameManager` → starts game loop.

### Core Systems

- **`engine/game.js` / `GameManager`** — central orchestrator; owns entities, camera, renderer, HUD, particle pool, subsystems; delegates player inventory state to `PlayerInventory`; drives `update(dt)` and `render()`
- **`engine/systems/playerInventory.js` / `PlayerInventory`** — owns all player inventory state: scrap, fuel, fuelMax, cargo, modules, weapons, ammo, fuelBurnRate, reactorOutput, reactorDraw. GameManager exposes forwarding accessors (`game.scrap`, `game.fuel`, etc.) for external consumers
- **`engine/systems/salvageSystem.js` / `SalvageSystem`** — owns salvage state (`isSalvaging`, `salvageProgress`, `salvageTotal`, `salvageTarget`); `start()`, `update(dt)` → returns loot entities, `cancel()`
- **`engine/systems/repairSystem.js` / `RepairSystem`** — owns repair state (`isRepairing`, `_repairAccum`, `_moduleRepairAccum`); `start()`, `update(dt, player, scrap)` → returns `{ scrapSpent }`, `cancel()`, `hasModulesToRepair(player)`, `maybeBreachModule(ship)` → returns `{ text, colorHint } | null`
- **`engine/systems/collisionSystem.js` / `CollisionSystem`** — projectile interception, beam interception, main collision loop, AoE explosions; `update(entities, player, { particlePool, hud, repair, reputation, onEnemyKilled })` → returns `{ newEntities: [] }`
- **`engine/systems/bountySystem.js` / `BountySystem`** — owns `activeBounties[]`; `onEnemyKilled()`, `acceptBounty()`, `collectCompleted()`, `updateExpiry()`
- **`engine/systems/weaponSystem.js` / `WeaponSystem`** — weapon reload ticks, manual reload, ammo cycling, guided projectile targeting; `updateReloads()`, `manualReload()`, `cycleAmmo()`, `updateGuidance()`
- **`engine/systems/interactionSystem.js` / `InteractionSystem`** — owns `nearbyStation`, `nearbyDerelict`; `updateDerelicts()`, `checkDocking()`, `checkLootPickups()`
- **`engine/systems/navigationSystem.js` / `NavigationSystem`** — owns `waypoint { x, y, name, entity }`, `mapOpen`, map zoom/pan state; `setWaypoint()`, `clearWaypoint()`, `distanceTo()`, `bearingTo()`, `etaSeconds()`, `toggleMap()`, `fuelRangeRadius()`, `currentZone()`
- **`engine/loop.js`** — fixed-timestep loop (60 ticks/sec), spiral-of-death protection
- **`engine/camera.js` / `Camera`** — world↔screen transform, exponential-lerp follow, visibility culling
- **`engine/input.js` / `InputHandler`** (singleton) — keyboard hold/just-pressed, mouse position/buttons, flushed each tick
- **`engine/renderer.js` / `Renderer`** — clears canvas, draws starfield, renders entities, then HUD/UI overlays
- **`engine/hud.js` / `HUD`** — thin orchestrator; bottom strip is DOM-based (`#hud-bottom`, `css/hudBottom.css`), updated via `_updateBottomStrip()` each frame; canvas sub-renderers in `engine/hud/`: `minimap.js` (top-right minimap + zone/nav info), `mapView.js` (full-screen map overlay), `navIndicator.js` (edge-of-screen waypoint arrow), `shipAnchored.js` (weapon panels, throttle, integrity), `prompts.js` (dock/repair/salvage prompts, dev controls). Tooltip system via `showTooltip()`/`hideTooltip()`

### Entity Types

`Entity` is the base class (`engine/entities/entity.js`). Every entity has an `entityType` string tag set in the constructor: `'ship'`, `'station'`, `'projectile'`, `'loot'`, `'explosion'`, `'entity'` (default). **Never use `instanceof` for entity type checks** — use `entity.entityType === 'ship'` instead. This avoids circular dependency issues (entity classes imported into systems/HUD creates import cycles through game.js). The data lint script enforces this ban. `Ship` extends Entity with armor/hull/weapons/fuel. Ship subclasses override `_drawShape(ctx)` and `getBounds()`. Other entity types: `Projectile`, `LootDrop`, `Particle`, `Station`, `Planet`. Derelicts are Ships with `crew = 0` (`ship.isDerelict` getter) — no separate Derelict class. Created via `createDerelict(data)` from `engine/entities/registry.js`. Ship has getter/setter pairs for `faction`, `relation`, `ai` that delegate to `this.captain` when a Character is aboard, falling back to `_machineFaction`/`_machineRelation`/`_machineAi` for unmanned ships (Concord machines).

**Character** (`engine/entities/character.js`) — a person who can inhabit a ship. Has `id`, `name`, `faction`, `relation`, `behavior`, `flavorText`, `ai`, `inShip`. `boardShip(ship)` sets `ship.captain` (ship then delegates faction/relation/ai to the character via getters); `leaveShip()` clears `ship.captain`, reverting the ship to its machine defaults. Concord machines (drones, frigates) are unmanned — no Character, faction/relation/ai set via `_machine*` fields directly on the ship.

Ship hull classes live in `data/hulls/*/hull.js` — each self-registers into `CONTENT.hulls` at import time. Concord entity subclasses (with custom behavior like drone spawning, latching) live in `engine/entities/concord/`. The registry (`engine/entities/registry.js`) provides `createNPC()`/`createDerelict()`/`createShip()` factories that read from `CONTENT.hulls`, `CONTENT.ships`, and `CHARACTERS`. `game.characters[]` tracks all active Characters; `game.playerCharacter` is the player's Character.

**Data-driven NPC creation** — Ship definitions live in `data/ships/<faction>/*.js` (loadouts, flavorText) — each self-registers into `CONTENT.ships`. Character definitions live in `data/characters/*.js` — each self-registers into `CHARACTERS` + `CONTENT.characters`. `createNPC(characterId, x, y)` looks up the character, creates a ship from `charData.shipId`, creates a Character, and boards it. `createShip(shipId, x, y)` creates a configured ship from `CONTENT.ships` (used for unmanned Concord ships). No per-NPC factory files.

### Key Patterns

- **Entity list** — all entities in `GameManager.entities[]`, updated/rendered polymorphically; inactive purged each tick
- **Collision detection** — projectile-vs-ship circle checks in `CollisionSystem.update()`
- **Enemy AI** — `engine/ai/shipAI.js`; home position + patrol; aggro/deaggro range; behaviors set via `this.ai = { ...AI_TEMPLATES.X }` from `@data/index.js`: stalker, kiter, standoff, lurker, flee. All AI runtime state lives on `ship.ai.*` (e.g. `ship.ai._aggro`, `ship.ai._patrolAngle`, `ship.ai._lurkerState`). The ship's AI status string is `ship.aiStatus` (not `aiState`).
- **Neutral AI** — `engine/ai/shipAI.js`; dispatches on `ship.ai.passiveBehavior` ('trader' or 'militia'). Trade route fields: `ship.ai._tradeRouteA/B`. Orbit fields: `ship.ai._orbitCenter/Radius/Speed/Angle`.
- **Weapons** — component objects added via `addWeapon()`; player fires indexed weapon, AI fires all
- **Particle pool** — `engine/systems/particlePool.js`, fixed slot count, presets: `explosion()`, `engineTrail()`
- **Zone entities** — content is zone-centric under `data/zones/<zone>/`: locations (station data + renderer + conversations), terrain, ships, characters, derelicts, planets. Global content (hulls, modules, player ships/character) stays in `data/`. All self-register into `CONTENT` tables at import time via `registerContent()`. `data/index.js` uses `import.meta.glob` to auto-discover zone content — no manual import lines needed for new files.
- **MAP format** — maps use a single flat `entities[]` array of pre-instantiated objects. `game.js` has one loop: `for (const entity of map.entities) { push to entities; if Ship, push to ships }`. Zone manifests (e.g. `data/zones/gravewake/manifest.js`) export `{ entities[], zones[], background[] }` which maps spread.
- **Map data** — `data/maps/tyr.js` is the full production map; `data/maps/` holds all named maps (tyr, arena, blank); each exports `MAP`
- **Centralized stats** — JS data files in `data/` are the single source of truth for all base stats and content definitions. Single registry file `data/dataRegistry.js` holds both equipment tables (ENGINES, WEAPONS, etc.) and content tables (`CONTENT.hulls`, `.ships`, `.stations`, `.conversations`, `.derelicts`, `.terrain`, `.characters`, `.planets`). Two helpers: `registerData(table, entries)` for bulk-assigning equipment entries, `registerContent(type, id, entry)` for single content entries. Content files self-register at import time. `data/index.js` uses `import.meta.glob` to auto-discover content under `data/zones/`, `data/hulls/`, `data/ships/player/`, `data/characters/player.js`, and `data/conversations/`. Global content: `data/hulls/` (hull classes), `data/ships/player/` (player ships), `data/characters/player.js` (player character), `data/modules/` (equipment), `data/maps/` (map definitions), `data/factions.js` (faction keys). Zone content: `data/zones/<zone>/` — locations, ships, characters, derelicts, terrain, planets, conversations. `data/tuning.js` holds global scalar constants. Each ship/weapon defines multiplier constants and computes final values as `BASE_* × multiplier`. Never hardcode raw numbers in constructors. To add new zone content, create a file under `data/zones/<zone>/` that calls `registerContent()` — it's auto-discovered, no `data/index.js` edit needed.
- **Thrust-to-weight** — `Ship.recalcTW(fuel?, cargoUsed?)` derives `speedMax`, `acceleration`, `turnRate`, and `fuelEfficiency` purely from engine modules. Hull classes define only mass, durability, cargo, fuel tank, and armor — no inherent speed or agility. T/W ratio is computed against a global `REFERENCE_TW` constant using power curves. Called event-based (module swap, cargo change, dock/undock, condition change). Engine modules provide `thrust`, `weight`, and `fuelEffMult`; all modules have `weight`. All NPC ships include engine modules in `moduleSlots`.
- **Mount points** — each ship class defines `MOUNT_POINTS[]` and overrides `get _mountPoints()`. Index `i` maps to `moduleSlots[i]`. Each mount has `{ x, y, arc, size, slot? }` where `arc` is `'front'|'port'|'starboard'|'aft'`, `size` is `'small'|'large'`, and `slot` is `'engine'` for engine-only mounts (omitted for general-purpose). Used for: (1) drawing module icons on the hull via `_drawModules(ctx)` in `Ship.render()`, (2) positional module breach routing — hits to an arc preferentially damage modules in that arc, (3) install constraints in the Ship Screen — engine slots only accept engines and vice versa. Empty mounts render as dotted white squares; engine mounts show `[E]`. Module visuals: `engine/rendering/moduleVisuals.js`.
- **Module registry** — `engine/modules/registry.js` exports `createModuleById(id)`, which reads from `CONTENT.modules`. Used by ship configs and loot tables to instantiate modules by string ID.
- **Content registry** — `data/dataRegistry.js` exports `CONTENT` (type-keyed sub-objects) and `registerContent(type, id, entry)`. Content files call `registerContent()` at import time. Designer and editor read from `CONTENT.stations`, `CONTENT.derelicts`, `CONTENT.modules`, `CONTENT.weapons`, etc. instead of hand-maintained registry arrays.
- **UI overlays** — narrative panel (`#narrative-panel`, right 30% DOM panel, `engine/ui/narrativePanel.js`) and ship panel (`#ship-panel`, left 30% DOM panel) are HTML/CSS; bottom HUD (`#hud-bottom`, 48px fixed bar) is DOM. Docking sets `isDocked = true`, skipping the simulation loop. Ship screen (I key) pauses sim but keeps world rendering. Both panels use `pointer-events: auto` and `stopPropagation` to prevent canvas input bleed
- **Narrative system** — station interactions use scrolling conversation logs (Disco Elysium-style). `NarrativePanel` reads from `CONTENT.conversations`. Conversation scripts are async functions in `data/zones/<zone>/locations/<station>/conversations/` (station-specific) or `data/conversations/` (generic) that `await log.choices(...)` for player input. Each self-registers via `registerContent('conversations', id, fn)`. Station data includes `conversations: { hub, zones: {} }` pointing to script IDs. `game.storyFlags = {}` tracks first-visit flags and NPC memory (session-only)
- **Color palette** — `engine/rendering/colors.js` exports all color constants; never use inline hex strings
- **CSS utility system** — `css/panel.css` defines CSS custom properties (`--p-text: 13px`, `--p-title: 16px`, `--p-small: 11px`), text color utilities (`.t-cyan`, `.t-amber`, etc.), and typography patterns (`.p-heading`, `.p-subheading`, `.p-text`, `.p-label`, `.p-hint`, `.p-small`). All DOM panel CSS files inherit from these. Never hardcode `px` font sizes in panel CSS — use `var()` references.
- **Draw API** — `engine/rendering/draw.js` exports reusable canvas primitives. Two layers:
  - **Immediate utilities** (take `ctx` as first arg): `polygon`, `polygonFill`, `polygonStroke`, `line`, `lines`, `disc`, `ring`, `trail`, `text`, `pulse`, `engineGlow`
  - **`Shape` class** — composable geometry templates with transform chaining (`.at()`, `.scaled()`, `.rotated()`, `.flipX()`, `.flipY()`) and draw methods (`.fill()`, `.stroke()`, `.draw()`). Factory methods: `Shape.rect()`, `Shape.chamferedRect()`, `Shape.cigar()`, `Shape.trapezoid()`, `Shape.wedge()`, `Shape.stadium()`, `Shape.cross()`, `Shape.ngon()`
  - **`DrawBatch` class** — deferred rendering that groups by style to minimize canvas state changes. Methods: `fillPoly`, `strokePoly`, `poly`, `line`, `disc`, `ring`, `rect`, `text`, then `flush()` to render all
  - **`text(ctx, str, x, y, color, opts)`** — world-space text. Options: `size` (12), `weight` ('normal'), `align` ('center'), `baseline` ('middle'), `alpha` (1), `font` ('monospace'). Batch equivalent: `batch.text(str, x, y, color, opts)`
  - Always use Draw API primitives for new rendering code instead of raw `ctx` calls. Import from `engine/rendering/draw.js`.
  - **Prefer Shape factories and Draw helpers over raw point arrays.** When drawing geometry, always use `Shape.rect()`, `Shape.chamferedRect()`, `Shape.trapezoid()`, `Shape.wedge()`, etc. with `.at()`, `.scaled()`, `.rotated()` transforms so that a human can easily tweak position, width, height, scale, and rotation without editing point coordinates. If you need a shape that doesn't exist yet, add a new `Shape` factory method or standalone draw function to `engine/rendering/draw.js` rather than hand-placing points. **Exception:** complex ship hull shapes that require directional armor arc rendering (`_drawShape`/`_drawHullArcs`) may use hand-placed point arrays when the hull silhouette cannot be composed from primitives.

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
- **F1**: Toggle controls help panel

## Rules & Conventions

### Stats: Multiplier Pattern
Never hardcode raw stat numbers in ship/weapon constructors. All base values live in `data/*.js` (see Key Patterns above). Each ship/weapon file defines a multiplier (e.g. `HULL_MULT = 1.5`) and computes the final value as `BASE_HULL * HULL_MULT`. Global pacing knobs: `SPEED_FACTOR` and `PROJECTILE_SPEED_FACTOR` in `data/tuning.js`.

Ship classes use `this._initStats({ hull, weight, cargo, fuelMax, armorFront, armorSide, armorAft })` from `Ship` base to set hull stats. Movement stats (speed, acceleration, turn rate) and fuel efficiency are **purely engine-derived** via `recalcTW()` — hull classes never define them.

### Enums: Always Use `data/enums.js`
Never use raw strings for entity types, relations, conditions, loot types, arcs, or mount sizes. Import frozen enum objects (`ENTITY`, `RELATION`, `CONDITION`, `LOOT_TYPE`, `ARC`, `MOUNT_SIZE`, `MOUNT_SLOT`) from `data/enums.js`. The data lint script enforces this for `entityType` comparisons. If a new enum value is needed, add it to `data/enums.js` first.

### Colors: Always Use `engine/rendering/colors.js`
Never use inline hex strings anywhere in the codebase. Import named constants from `engine/rendering/colors.js`. If a new color is needed, add it there first.

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
| `/named-ship` | Configured ship instances (captained = NPC, no captain = derelict) | `CONTENT.ships` in `data/zones/*/ships/*.js` or `data/ships/player/*.js`; `CONTENT.characters` in `data/zones/*/characters/*.js`; `CONTENT.derelicts` in `data/zones/*/derelicts/` |
| `/character` | Named people who board ships | `CHARACTERS` + `CONTENT.characters` in `data/zones/*/characters/*.js` or `data/characters/player.js`; Character class in `engine/entities/character.js` |
| `/station` | Dockable locations with services and renderers | `CONTENT.stations` in `data/zones/*/locations/*/station.js`; renderers in same dir; conversations in `conversations/` subdir |
| `/module` | Ship modules AND weapons (combined) | `CONTENT.modules` (self-registered from `data/modules/*.js`); `CONTENT.weapons` (self-registered from `data/modules/weapons.js`); `createModuleById()` in `engine/modules/registry.js` |

**Audit skills:** `/code-review`, `/stat-audit`, `/dead-code`

**MANDATORY: After any substantive change to a system, registry, or content type:**
1. Read all skill files in `.claude/commands/wayfarer/` that reference the changed system
2. Update file paths, class names, registry formats, CSV columns, behavior types, and designer category IDs
3. Update `engine/test/designer.js` if the change affects how items are built, categorized, or displayed
4. Verify designer deep-links still work (`designer.html?category=<cat>&id=<slug>`)

**Watch for these specific changes:**
- File path moves (e.g. data file reorganizations)
- Renamed classes, modules, or behavior types
- New or removed entries in any registry (`CONTENT.hulls`, `CONTENT.ships`, `CONTENT.characters`, `CONTENT.stations`, `CONTENT.derelicts`, `CONTENT.conversations`, `CONTENT.modules`, `CONTENT.weapons`, `CHARACTERS`)
- Data field additions/removals in `data/**/*.js`
- Designer category changes in `engine/test/designer.js` (`CATEGORIES` array)
- New or changed `Character` fields in `engine/entities/character.js`
- New or changed NPC data in `data/zones/*/ships/*.js`, `data/zones/*/characters/*.js`, `data/ships/player/*.js`
- New boot imports needed in `data/index.js` for self-registering content
