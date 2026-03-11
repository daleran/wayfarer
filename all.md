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
- **Raider AI** — `js/ai/shipAI.js`; home position + patrol; aggro/deaggro range; behaviors set via `this.ai = { ...AI_TEMPLATES.X }` from `js/data/tuning/aiTuning.js`: stalker, kiter, standoff, lurker, flee
- **Neutral AI** — `js/ai/shipAI.js`; dispatches on `ship.ai.passiveBehavior` ('trader' or 'militia')
- **Weapons** — component objects added via `addWeapon()`; player fires indexed weapon, AI fires all
- **Particle pool** — `js/systems/particlePool.js`, fixed slot count, presets: `explosion()`, `engineTrail()`
- **Map data** — `js/data/maps/tyr.js` is the full production map; `js/data/maps/` holds all named maps (tyr, arena, blank); each exports `MAP`
- **Centralized stats** — `js/data/tuning/` is the single source of truth for all base stats. Split across: `shipTuning.js` (movement/health/fuel), `weaponTuning.js` (damage/range/ammo), `aiTuning.js` (AI templates), `moduleTuning.js`, `economyTuning.js`. Each ship/weapon defines multiplier constants and computes final values as `BASE_* × multiplier`. Never hardcode raw numbers in constructors.
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
Never hardcode raw stat numbers in ship/weapon constructors. All base values live in `js/data/tuning/` (see Key Patterns above). Each ship/weapon file defines a multiplier (e.g. `HULL_MULT = 1.5`) and computes the final value as `BASE_HULL * HULL_MULT`. Global pacing knobs: `SPEED_FACTOR` (in shipTuning.js) and `PROJECTILE_SPEED_FACTOR` (in weaponTuning.js).

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

### Skills: Keep `.claude/commands/` in Sync
After any architectural change (new file paths, renamed systems, changed patterns, new module types, new behaviors), scan the skill files in `.claude/commands/wayfarer/` and update any instructions that reference the changed paths or APIs. Specifically watch for:
- File path changes (e.g. `js/data/stats.js` → `js/data/tuning/*.js`)
- Renamed classes, modules, or behavior types
- New or removed weapon/module/AI types listed in skill templates
- Verification URL changes (`?test` is not a valid harness — use `editor.html?map=arena` or `?designer`)


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


# === IDEA.md ===

# IDEA.md — Feature Ideas & Concepts

Raw concepts under consideration. Not yet planned for implementation. Ideas move to `NEXT.md` when prioritized for a build session.

**Next available code: BZ**

---

## Code Index

| Code | Title | Category |
|---|---|---|
| AN | Utility Modules | Modules / Equipment |
| AO | Dynamic Thrust-to-Weight System | Ship Systems |
| AP | Tribute & Favor System | Economy |
| AR | Black Market & Under-Barter | Economy |
| AS | Gravewake Zone Features & The Coil | World / Map |
| AV | Specialized Enemy Factions | AI / Enemies |
| AX | Named Bosses | AI / Enemies |
| BA | Story Threads & Trigger System | Narrative |
| BB | Mission & Bounty Board | Gameplay |
| BC | Full Map View | UI |
| BD | Procedural Audio | Audio |
| BE | Named NPC Ships & Persistent World Characters | AI / World |
| BF | Cloud Save System | Platform |
| BG | Module Affixes & Randomized Traits | Modules / Equipment |
| BH | Station Overhaul — Multi-Screen UI | UI |
| BL | Core Combat Philosophy — Disabling vs. Destroying | Gameplay |
| BM | Crew System — Named Crew, Health & Performance | Ship Systems |
| BN | Salvage Bay & Engineering Bay | Scavenging |
| BO | Data Extraction — Computer Salvage | Scavenging |
| BP | Sensor Suite Upgrades | Modules / Equipment |
| BQ | Crew Active Abilities | Ship Systems |
| BR | Electronic Warfare | Modules / Equipment |
| BS | Gravity Wells & Pale (Ice Moon) | World / Map |
| BT | Inner System Locations | World / Map |
| BU | Skiff & Planetary Landing | Gameplay |
| BV | Rogue Salvage Lord Fleet | AI / Enemies |
| BW | Player Housing & Personal Stash | Gameplay |
| BX | Monastic Order Expeditionary Ship | AI / World |
| BY | Expanded Debug Overlay | Dev Tools |

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

**Grave-Clans (Scavenger Specialty):** Specialized Gravewake raiders adapted to dense debris. Use Lurker behavior — hide behind Arkship Spines, ambush with grapple lines and harpoons. Prefer targeting convoys. Asymmetric salvage-rigged ship designs.

**Zealot Pilgrims:** Cultist convoys seeking the oldest Concord wrecks. Neutral by default. Offer large payouts for safe escort or recovered artifacts. Shield-heavy; willing to travel through dangerous debris fields.

**Concord Ghosts:** Dormant, half-broken Concord sentinels that mindlessly repeat century-old patrol routes. Not actively hostile — unpredictable hazards to anyone who interrupts their route or tampers with Ark-Modules they guard.

**Monastic Order (Techno-Priests):** See BX for the full encounter design. In Gravewake they field a single large expeditionary capital ship — initially inaccessible to the player. Diabolically opposed to the Concord AI; scavenging the graveyard for artifacts or a super-weapon to defeat it. Not aggressive unless provoked.

**General AI Improvement — Enemy Retreat & Repair:** Human enemies (raiders, cultists) should flee at ~30% hull rather than fight to the death. They return to their mothership or base to repair, then re-engage. Makes factions feel persistent and dangerous. See also BE for named captains who remember the player.

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
- Fleet composition: one capital ship + 2–4 escort raiders

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

### AO: Dynamic Thrust-to-Weight System

Ship performance is a direct result of the calculated ratio between total **Thrust** (provided by installed Engine modules) and total dynamic **Weight** (hull + modules + cargo + fuel). Performance variables are independently calculated outcomes — not simple flat penalties.

**Weight composition (cumulative):**
- Base hull weight
- Weight of all installed modules (armor plating, reactors, utility slots, etc.)
- Current cargo weight
- Current fuel level

**Performance variables (all independently derived from thrust-to-weight ratio):**
- `Acceleration` — how quickly the ship reaches top speed; most sensitive to weight changes
- `Top Speed` — maximum achievable velocity; less sensitive than acceleration
- `Turn Radius` — rotational agility; can be selectively improved with specialized maneuvering thrusters even on a heavy hull

**Strategic implications:**
- Installing extra armor consumes a slot and raises weight, hurting acceleration and top speed — but high-efficiency Engine modules (acquirable via high Faction Favor, e.g. at Kell's Stop) can compensate, enabling specialized heavy-but-maneuverable builds
- The Stripped Weight utility module (AN) removes non-essentials to shed mass at the cost of armor and fuel cap — pairs with powerful engines for a fragile but extremely fast configuration
- A heavy freighter can have poor acceleration and top speed but retain a reasonable turn radius via maneuvering thruster specialization, creating distinct ship archetypes
- Cargo and fuel loads shift performance dynamically mid-flight — a full hold flies differently than an empty one

This framework ties module choice, inventory management, and exploration directly into combat viability.

---

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

## Gameplay

### BL: Core Combat Philosophy — Disabling vs. Destroying

Combat is designed to feel weighty and strategic — positioning, timing, and resource management over arcade action. The key tension: **how** you defeat an enemy determines what you get from it.

**Weapon damage profiles shape outcome:**
- **Explosive weapons (missiles, HE rounds):** High hull damage; high crew kill chance (especially sub-25% hull); high chance of destroying equipped modules. Fast kill, little left intact.
- **Precision/energy weapons (railguns, lance beams):** High armor damage; low hull damage; low crew/module collateral. Preserves the target — ideal for boarding prep or high-value module extraction.

The player must decide before engaging: do I want this ship dead, or do I want what's inside it?

---

### BB: Mission & Bounty Board

Procedurally generated missions available at stations, cycling on a timer. All bounties are tied to named people and listed crimes — not anonymous "kill 3 raiders."

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

## UI

### BC: Full Map View

Toggle with M key. Shows the entire starmap zoomed out:
- All discovered settlements, moons, and POIs as icons (undiscovered locations hidden)
- Faction territory borders as colored overlay zones
- Player position and heading indicator
- Active mission / bounty markers
- Known hidden route connections as dotted lines
- In nebulae: map range reduced, staticky/noisy appearance
- Near Concord ruins: phantom contacts, faint static

---

### BH: Station Overhaul — Interactive Map-Based Hubs

Replace the current monolithic station screen with full-screen, visually rich station maps unique to each location. Each station has a distinct layout reflecting its character — the sprawling vertical markets of Kell's Stop vs. the cramped, multi-level scrapper decks of The Coil.

**Core design:**
- **Full-screen interactive map** per station — not a menu list, a place you navigate
- **Explorable zones** — click distinct areas on the map to access different services; no single consolidated menu
- **Multiple vendors per station** — different stores and services in different zones, rewarding exploration
- **Lore & flavor** — ambient text, flavor details, and hidden interactions embedded in the station environment; discovery over presentation

**Zone examples per station type:**
- *The Coil:* The Dock → Salvage Yard → Central Market (Tavern, Chop Shop, Oddities) → The Palace (rep-gated) → The Slums (see BW)
- *Kell's Stop:* Repair bay, fuel desk, small trade counter, rumor board — compact and functional
- *Generic settlement:* Trade Floor, Shipyard (module installs), Repair Bay, Rumor Mill / Mission Board, Faction Liaison

**Note on subsystem targeting:** Confirmed out of scope — real-time combat model makes it unworkable.

---

## Modules / Equipment

### AN: Utility Modules

A collection of non-weapon, non-engine ship modules that add strategic variety to ship builds. Each occupies a module slot and provides a passive or active capability.

1. **Expanded Hold** — increases scrap/commodity carry capacity
2. **Compression Baler** — auto-converts low-value commodities into denser scrap (passive income on salvage)
3. **Tow Rig** — lets you latch onto and slowly drag a derelict to a station for a large payout
4. **Auxiliary Tank** — bonus fuel capacity (stackable, weight penalty)
5. **Fuel Reclaimer** — harvests trace fuel from debris clouds and derelicts
6. **Cold Thruster** — silent running mode; no engine glow; reduced detection range by raiders
7. **Reactive Plating** — first hit each fight absorbed, then overloads (limited charges, refillable with scrap)
8. **Point Defense Burst** — active ability; destroys incoming missiles in a radius; short cooldown; costs power
9. **Chaff Pod** — breaks missile lock for a few seconds; consumable
10. **Reinforced Cutting Arm** — reduces salvage time
11. **Remote Scanner** — reveals loot type and quantity before committing to a salvage
12. **Salvage Beacon** — marks a derelict for later retrieval; station pays a finder's fee
13. **Overclock Injector** — temporary speed boost at the cost of hull health
14. **Emergency Scrap Burn** — converts carried scrap directly into armor in a pinch
15. **Hull Stress Frame** — lets you push hull below 0 armor briefly without dying; must be repaired soon or ship is lost
16. **Stripped Weight** — remove non-essentials for +speed/turn; fuel cap and armor drop permanently while installed
17. **Concord Transponder** — spoofs a Concord Remnant IFF signal; raiders hesitate to engage until they see through it
18. **Black Market Manifest** — hides cargo from station scanners; unlocks restricted trade goods
19. **Commune Relay Node** — passive; lets Commune settlements send tip-offs about nearby salvage or threats
20. **Mag-Anchor** — emergency full-stop; instantly kills velocity; strains hull (small armor damage)
21. **Jury-Rig Bay** — passive workshop that slowly converts scrap into field-repairable components; reduces scrap cost of field repairs over time
22. **Passive Radiator Array** — vents excess reactor heat; allows fission reactors to run longer between overhauls
23. **Debris Scoop** — low-yield magnetized intake; passively vacuums micro-loot while flying through debris fields
24. **Cracked Void Lens** — Pre-Collapse artifact; warps local space for a short-range blink jump; massive cooldown; unknown side effects
25. **Pressure Hull Insert** — reinforces internal bulkheads; hull takes damage at a reduced rate when armor is depleted
26. **Scav Signal Jammer** — disrupts raider coordination; enemies deaggro faster and lose targeting more easily
27. **Emergency Fuel Tap** — burns hull integrity directly as fuel when tanks run dry; lets you limp to a station
28. **Thermal Shroud** — reduces damage taken from plasma weapons and AoE explosions
29. **Salvager's Intuition Module** — cracked Concord nav-AI fragment; highlights derelicts on the map and estimates salvage yield; occasionally outputs cryptic lore fragments

---

### BG: Module Affixes & Randomized Traits

Diablo 2-style randomized modifier system for modules. Each module found in the wild has a randomly rolled affix (or pair of affixes) that slightly changes its properties — a Worn Autocannon with a "Rapid" affix has higher fire rate but lower damage; a Faulty Fission Reactor with a "Stable" affix has lower power but resets its overhaul timer. Creates build variety and makes scavenging feel like loot hunting.

Affixes are constrained by module type — not every affix applies to every module. Common affixes slightly improve one stat, Rare affixes trade off two stats, Exotic affixes are unique and potentially game-changing. Station-purchased modules are clean (no affixes); salvage is where the interesting rolls happen.

---

### BP: Sensor Suite Upgrades

Upgrading sensors provides vital combat UI data rather than raw stat boosts.

- Displays estimated trajectory/path of your fired rounds
- Displays estimated enemy position at round impact (lead indicator)
- Reveals detailed enemy telemetry: current speed, heading, hull condition
- Higher-tier suites show crew count and module loadout on targeted ships

---

### BR: Electronic Warfare

Managed by a "Computer/Electronics Expert" crew member (see BQ). Provides non-lethal combat options for disabling rather than destroying.

- **Decoys** — deployable countermeasures that draw enemy fire and distract tracking missiles
- **Disruptors** — targeted weapon modules that fire electronic payloads; temporarily disable specific enemy systems (engines, weapons) without hull damage; ideal for capture/salvage setups

---

## Scavenging

### BN: Salvage Bay & Engineering Bay

Two large-slot ship modules that unlock advanced field operations.

**Salvage Bay:**
- Without it, defeating a ship yields only scrap, fuel, and ammo
- With it, the player can extract intact weapon and ship modules from derelicts
- *Scrapping:* Full deconstruction strips everything — fuel, ammo, all modules — and reduces hull to zero. Base scrap yield is proportional to the hull and armor damage dealt during the fight (reward precision combat)
- Requires a derelict target (crew all dead) or a destroyed hulk

**Engineering Bay** (Large slot):
- Allows field repair of own hull points and damaged modules using special commodities and scrap
- Complements the existing field armor repair system with deeper hull restoration capability

---

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

## Code Architecture

*(BI promoted to NEXT.md)*


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

There are no prices in credits. When you trade at a station, you pay in scrap. When you repair your hull, you pay in scrap. Raiders fight for fuel and salvage, not cash.

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

## 9. Void Fauna: The Silent Guardians

The Tyr system is not just a graveyard of human ambition; it is an ecosystem. Void Fauna are organisms that have evolved—or were engineered—to survive in the radiation-rich void and the thick gases of failed terraforming nebulae.

### 9.1 Common Species
- **Void Wurms:** Kilometer-long, serpentine creatures that feed on solar radiation. They are generally passive unless their "Sun-Basking" is interrupted by ship exhaust. They attack by ramming, using their massive mass as a weapon.
- **Crystal Swarms:** Tiny, hive-minded organisms that cling to debris. They "eat" the residual energy from ship reactors. A swarm can quickly drain a ship's fuel or disable its engines if not brushed off or destroyed with area-of-effect weapons.
- **Nebula Leviathans:** Massive, squid-like entities that inhabit the Ashveil. They use bio-electric pulses to "Jam" ship sensors (E-War) before dragging their prey into their central maw.
- **Dust Scourge:** Microscopic "void-locusts" that appear as a shimmering cloud. They don't attack hulls but "corrode" ship modifiers, temporarily disabling ship perks like "Uparmored" or "Modded Engines."

### 9.2 Nesting Grounds & Ecological Role
Fauna cluster around **Radiation Hotspots** and **Nebula Cores**. Some researchers believe they were seeded by the Concord centuries ago as a biological "Quarantine" to prevent humans from venturing too far into the deep void. Seeing a Concord Shard "tame" or direct a Void Wurm is a rare and terrifying sight.

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

> **Stats, item lists, and specific numbers live in the JS source files (`js/data/tuning/`, `js/data/commodities.js`, `js/data/lootTables.js`, etc.). This document describes behavior only.**

This is the source of truth for how game systems behave. No lore, no code architecture. For world/faction context see `LORE.md`. For visual conventions see `UX.md`.

---

## Movement & Throttle

Six discrete throttle levels from Stop through Flank. W/S step up or down; the level persists until changed. Ships have momentum — acceleration and deceleration are gradual.

Fuel consumption scales with throttle level. The lowest level is free; consumption increases nonlinearly toward Flank. Running out of fuel clamps the ship to the lowest powered throttle level — it can still crawl but cannot fight or flee effectively. Fuel efficiency is a per-ship multiplier that scales how fast each throttle step burns fuel.

---

## Weapons

### Weapon Categories

**Primary weapons** (LMB / Space) — manually aimed toward the mouse cursor. Player fires the currently indexed primary weapon only. AI fires all weapons simultaneously.

**Secondary weapons** (RMB) — rocket pods and torpedoes. Same targeting logic. Player fires the indexed secondary weapon; AI fires all.

**Weapon cycling** — `[` / `]` cycle primary weapon. `{` / `}` cycle secondary weapon. `1` cycles ammo mode on active primary. `2` cycles guidance mode on active secondary (or ammo mode if applicable).

### Weapon Families

Eight weapon families are implemented:

- **Autocannon** — dumbfire kinetic bolt; moderate range; armor-focused; AP/HE ammo modes; magazine-fed
- **Gatling Gun** — high rate-of-fire kinetic; short range; low damage per shot but high DPS; can intercept projectiles; magazine-fed
- **Railgun** — extreme-velocity penetrator; long range; high damage; slow cooldown; three variants: small-fixed (SF), large-turret (LT), large-fixed (LF)
- **Lance** — hitscan beam; ramps up damage over hold period; four variants: small-fixed (SF), small-turret (ST), large-fixed (LF), large-turret (LT); ST variant can intercept projectiles passing through the beam; SF/LF/LT also apply hull damage scaled by `hullFactor`
- **Plasma Cannon** — hull-heavy blob; turret-aimed; damage falls off with distance traveled; small and large variants
- **Cannon** — slow heavy shell; AoE on contact; AP/HE ammo modes; magazine-fed
- **Rocket Pod** — dumbfire, wire-guided, or heat-seeking; detonates on contact and on expiry; interceptable; small (2-tube) and large (8-tube burst) variants; shared ammo pool
- **Torpedo** — fixed-mount (fires along heading); slow; interceptable; very high damage AoE; long cooldown

**Removed weapons** (Wire Missile, Heat Missile, Flak Cannon are no longer separate weapons — rocket pods now cover guided and dumbfire roles; gatling gun provides flak-style interception.)

### Ammo Modes

Autocannon and Cannon support switchable ammo modes (key `1` for primary, key `2` for secondary):

| Weapon | AP Mode | HE Mode |
|---|---|---|
| Autocannon | Standard armor damage | Reduced armor damage; AoE blast; hull damage; can intercept |
| Cannon | Standard AoE armor+hull | Reduced armor damage; larger AoE; high hull damage; can intercept |

Switching mode dumps the current magazine back to cargo reserves and starts a reload.

### Guidance Modes (Rocket Pods)

Rocket Pods support three guidance modes (cycle with key `2`):

| Mode | Behavior |
|---|---|
| DUMBFIRE | Fires at click point; detonates at target or on contact |
| WIRE | Guided by mouse cursor; interceptable |
| HEAT | Homes on nearest raider; interceptable |

### Railgun Variants

| Variant | Size | Mount | Notes |
|---|---|---|---|
| RAILGUN-SF | Small | Fixed | Fires along ship heading |
| RAILGUN-LT | Large | Turret | Mouse-aimed |
| RAILGUN-LF | Large | Fixed | Double damage/hull multipliers vs SF |

### Lance Variants

| Variant | Size | Mount | Hull Damage | Beam Intercept |
|---|---|---|---|---|
| LANCE-SF | Small | Fixed | Yes (1.0×) | No |
| LANCE-ST | Small | Turret | No (0.0×) | Yes — intercepts projectiles passing through beam |
| LANCE-LF | Large | Fixed | Yes (1.0×) | No |
| LANCE-LT | Large | Turret | Yes (1.0×) | No |

### Projectile Special Behaviors

| Flag | Effect |
|---|---|
| `detonatesOnContact` | AoE explosion when hitting any ship |
| `detonatesOnExpiry` | AoE explosion at target point when range runs out |
| `isGuided + guidedType='wire'` | Steers toward mouse cursor each frame |
| `isGuided + guidedType='heat'` | Steers toward nearest raider |
| `isInterceptable` | Can be shot down by weapons with `canIntercept` or `canInterceptBeam` |
| `canIntercept` | Intercepts nearby enemy interceptable projectiles on contact (gatling) |
| `canInterceptBeam` | Lance small-turret intercepts interceptable projectiles passing within 15px of beam |
| `isPlasma` | Damage falls off proportionally as the projectile approaches max range |
| `isBeam` | Lance only; hitscan on fire, rendered as a beam overlay |

### Hit Flash

All ships flash red briefly when they take damage. Flash lasts 0.15 seconds and fades linearly.

### Weapons and the Offline Flag

The `_weaponsOffline` flag on a ship disables all weapons. This flag is set by the hull degradation system at critical hull levels.

---

## Damage System

### Quad-Arc Positional Armor

Each ship has four armor arcs: front, port, starboard, and aft. The arc that takes the hit is determined by the impact angle relative to the ship's facing — 90° quadrants. Damage depletes the hit arc first. When an arc reaches zero, excess damage bleeds through to hull.

The aft arc has amplified hull bleed-through and a chance to damage engine integrity on each hull hit.

### Hull Degradation Cascade

As hull health drops, the ship progressively loses capability. Each threshold adds an effect that persists until hull is repaired at a station:

- **~50%** — engine begins to sputter; enemy ships darken visually; player sparks begin
- **~40%** — enemy fire rate begins to slow (scales worse toward 0%)
- **~30%** — engine cutouts; weapons misfire occasionally; turn rate reduced; smoke emitted from engines
- **~25%** — player screen edges pulse red (gets worse toward 0%)
- **~15%** — speed capped at a fraction of max
- **~10%** — further speed reduction
- **~5%** — barely functional; most weapons offline

At 0% hull the ship is destroyed.

### Enemy AI Fire Range Gate

Before firing, enemy AI checks whether the player is within the weapon's max range. If the player is out of range, the shot is skipped. This prevents enemies from firing pointless shots at extreme distances.

### Field Repair (R key)

Press R when stopped (throttle 0) to enter repair mode. Both armor and module repair run simultaneously:

- **Armor** — repairs the most-depleted arc first; costs scrap per armor point; auto-cancels when all arcs are full
- **Module condition** — improves the worst-condition installed module one step at a time; costs scrap per step; 4 seconds per step

Press R again to cancel. Also cancels automatically when armor is full and no modules need repair, or when scrap runs out.

Hull damage cannot be repaired in the field — dock at a station.

### Station Repair

Docking allows full armor restoration across all four arcs and hull repair. Both cost scrap. Hull repair takes a moment (progress bar).

---

## Ship Classes

Ships are organized as class templates extended by specific variants. Each class defines a hull shape, slot count, and base stats. Specific ships (player, enemy, neutral) extend a class and override multipliers.

The four hull classes:
- **Onyx Class Tug** — heavy salvage tug; asymmetric hammerhead shape; moderate speed, high armor
- **Maverick Class Courier** — fast personal craft; wide muscular body, twin side engines; high speed, low armor
- **G100 Class Hauler** — wide cargo barge; raised cab, twin square engine pods; large cargo capacity, medium stats
- **Garrison Class Frigate** — military workhorse; H/I-beam hull profile, rectangular nacelle pods; high hull, large fuel tank

All stat values are computed from base constants in `js/data/tuning/` via per-ship multipliers.

### Player Ship

The **Hullbreaker** is a salvage-modified Onyx Class Tug — stripped armor for weight savings, enlarged fuel tank. Intended for extended solo operations in the Gravewake Zone.

### Scavenger Enemy Ships

- **Light Fighter** (Maverick hull) — fast stalker; autocannon
- **Armed Hauler** (G100 hull) — kiter; autocannon + lance
- **Salvage Mothership** (Garrison hull) — slow standoff; cannon + heat missiles
- **Grave-Clan Ambusher** (Maverick hull) — lurker; autocannon + heat missile

### Concord Enemy Ships

Concord Remnants are geometric AI constructs — cold precision, machine-origin. They do not use scavenger tactics.

- **Drone Control Frigate** (custom Garrison hull, concord geometric profile) — standoff AI; Lance beam weapon; 400 HP hull, 200/160/120 armor arcs; spawns up to 3 Snatcher Drones every 12 seconds from lateral bay notches. `_canRespawn = false`. Extreme frontal armor — prioritize flanking.
- **Snatcher Drone** (Maverick hull) — stalker AI; no weapons; 30 HP, 10 per arc. Rushes the player at ~196 u/s. When within 35px it latches onto the hull (`_isLatched = true`) and drains 2 armor + 0.5 hull per 0.25 seconds (~8 armor/sec, 2 hull/sec). Drone dies if target goes inactive; player should shoot drones off first.

#### Spawn Queue Pattern

DroneControlFrigate builds Snatcher Drone instances during `update()` and pushes them to `this._spawnQueue`. After the entity update loop in `game.js`, the spawn queue processor pops each queued drone and adds it to `entities[]` and `ships[]`. This avoids mutating `entities[]` while iterating.

#### Pickup Text Pattern

SnatcHerDrone pushes `{ text, colorHint }` entries to `this._pickupTextQueue` when it latches. The same queue processor in `game.js` reads this queue and calls `hud.addPickupText()`. Both queues are safe for any entity — the processor skips entities with no queues.

#### Latched Drone AI Exclusion

The ship AI loop in `game.js` skips `updateShipAI()` for any ship with `_isLatched === true`. This prevents the AI from fighting the latch position update.

### Neutral Ships

- **Trader Convoy** (G100 hull) — follows trade routes between stations; no weapons; drops no loot
- **Militia Patrol** (Garrison hull) — orbits The Coil; no weapons; drops no loot

---

## Combat AI

All non-player ships — hostile, neutral, or friendly — share the same AI system (`js/ai/shipAI.js`). There are no separate raider vs neutral tracking arrays. Every ship tracks in `GameManager.ships[]`. A ship's `relation` field drives behavior:

- `'hostile'` — combat behavior active; counted as an enemy for targeting and loot
- `'neutral'` — passive behavior active; turns hostile immediately if struck by the player
- `'friendly'` — passive behavior active; never targeted

### Ship AI Profile

Each ship carries a flat `ship.ai` object spread from an `AI_TEMPLATES` entry in `js/data/tuning/aiTuning.js`. Characters and spawn overrides can change individual values (e.g. a cautious raider with longer `deaggroRange`) without touching the base template.

Two keys define the full behavior:

| Key | Controls |
|---|---|
| `combatBehavior` | What the ship does when `relation === 'hostile'` |
| `passiveBehavior` | What the ship does when `relation !== 'hostile'` |

### Combat Behaviors

Hostile ships with `aggroRange > 0` patrol home when the player is far, then switch to their combat behavior when the player enters range. Hull below `fleeHullRatio` forces a flee regardless of behavior.

| Behavior | Logic |
|---|---|
| **Stalker** | Positions at the player's aft; fires only when nose aligns with target |
| **Kiter** | Backs away at close range; orbits and fires from max weapon range |
| **Standoff** | Holds at long range; faces player; lobs cannon and missiles |
| **Lurker** | Hides at spawn cover point; scans for nearby traders to pounce; switches to player if player enters aggro range |
| **Flee** | Turns away from the player and runs at full throttle |

### Passive Behaviors

Ships with `passiveBehavior` set follow it when not hostile:

- **Trader** — state machine between `traveling` and `waiting`; follows `_tradeRouteA` / `_tradeRouteB`; reverses route when arriving. Combat fallback: `flee`
- **Militia** — orbit loop around `_orbitCenter`; steers toward computed point each tick. Combat fallback: `stalker`

### Relation Transitions

When a player projectile hits a neutral ship:
1. Reputation penalty applied to Settlements faction
2. `ship.relation` set to `'hostile'`
3. `ship._aggro` set to `true` — the ship immediately engages rather than patrolling

Ships with `aggroRange === 0` (traders, militia) never turn hostile proactively — only through being attacked. Ships with `aggroRange > 0` (scavengers) turn hostile when the player enters range.

All AI tuning constants are in `js/data/tuning/aiTuning.js`.

---

## World & Map

The main map is the Gravewake Zone — a large debris-strewn region surrounding the shattered remains of a Pre-Collapse arkship. Named editor maps in `js/data/maps/` serve as development sandboxes.

### Static Terrain

- **Arkship Spines** — massive wireframe structural beams, remnants of the arkship hull
- **Debris Clouds** — pre-generated fragment fields using golden-angle distribution
- **CoilStation** — massive dockable station structure; hub for trade and transit

### Planet Pale

Rendered as a background element (not an entity) — only the curved atmospheric limb is visible from the playspace.

---

## Ship Modules

Ships have a fixed number of module slots. Slot 0 is always the engine. Other slots are general-purpose. Modules are installed and removed via the Ship Screen (I key).

### Engine Modules

Engine modules modify `speedMax`, `acceleration`, and `fuelEfficiency` via multipliers applied at install. The ship's base stats are frozen before any module runs — swapping an engine always reverts to those clean bases first, then applies the new module's multipliers.

`fuelEffMult` scales the throttle-based fuel drain. Higher = more fuel burned per throttle level.

### Weapon Modules

Hardpoint modules that enable specific weapon types. Each draws power and occupies a slot.

### Power Generation Modules

Power modules add wattage to the ship's power budget. Types:
- **H2 Fuel Cell** — burns fuel continuously even at idle; moderate output
- **Fission Reactor (S/L)** — no fuel burn; requires periodic overhaul at certified stations; output degrades when overdue
- **Fusion Reactor (L)** — Pre-Collapse technology; very high output; trace fuel burn; no overhaul required

### Sensor / Passive Modules

Passive modules that extend minimap range, enable ship tracking, add lead indicators, or improve salvage information.

### Fission Reactor Overhaul

Fission reactors track time since their last overhaul. When overdue:
- Power output drops to a fraction of rated output
- HUD shows a flashing magenta/red `REACTOR OVERHAUL REQUIRED` warning
- Module slot shows power in magenta with `!` suffix
- Tooltip shows overdue status

To overhaul: dock at a station with `canOverhaulReactor: true` (currently Ashveil Anchorage). A button appears in the Services tab. Paying the overhaul cost resets the timer and restores full output. Overhauls can also be performed early to reset the timer proactively.

Overhaul intervals and costs are defined in `js/data/tuning/`.

### Module Condition

Modules salvaged from derelicts have a condition that affects their effectiveness: `good`, `worn`, `faulty`, `damaged`, or `destroyed`. Destroyed modules convert to scrap on pickup.

- Power modules: effective output scales by condition multiplier
- Weapon modules: damage scales by condition multiplier, applied at install

Condition is shown as a colored badge in the Ship Screen and in tooltip rows. Field module repair (R key) improves condition one step at a time.

### Hull Breach — Module Damage

When the player takes hull damage while hull is below a threshold, each hit has a tiered chance to degrade a random installed module by one condition step. The chance increases as hull gets lower. This only applies when hull damage actually lands (not pure armor hits). Weapon modules immediately reapply their damage scaling after degradation.

---

## Ship UI Screen (I key)

Press **I** to toggle the Ship Status overlay. Closes with **I** or **Esc**.

Three-column layout:
- **Left panel** — hull and armor arc health, drive stats, scrap/cargo readout, module slots with power budget, idle fuel burn
- **Center panel** — paper doll: ship silhouette with armor arc rings; each arc labeled with current/max; hull ratio bar below
- **Right panel** — cargo bay contents, capacity bar, active weapon list; salvaged weapons in cargo shown separately

---

## Economy

**Scrap** is the sole currency. No credits. Scrap also takes cargo space — the conversion rate between scrap and cargo units is defined in `js/data/tuning/`.

**Fuel** drives movement. Tank size and drain rate are per-ship. Fuel can be purchased at stations.

Scrap is earned by destroying enemies, salvaging derelicts, and selling commodities.

**Ammo takes cargo space.** Different ammo types consume different amounts of cargo. Autocannon rounds, rockets, and missiles all occupy hold space.

### Commodities

15 specific commodities defined in `js/data/commodities.js` with lore-flavored names. The trade screen shows only rows where the station stocks the commodity or the player is carrying it.

Supply levels (surplus → deficit) apply a price multiplier to the base price. Surplus stations sell cheap; deficit stations buy high. Station commodity profiles are defined in map data.

---

## Stations & Docking

Press **E** within docking radius to dock. Docking pauses the simulation (`isDocked = true`).

Station screen tabs:
- **Services** — armor repair, hull repair, refuel; all cost scrap; Allied standing applies a discount
- **Trade** — buy/sell commodities
- **Intel** — lore text per station (shown when `station.lore` is populated)
- **Bounties** — kill contracts (shown when contracts exist or are active for this station)
- **Relations** — all 6 faction standings

Press **Esc** or **E** to undock.

---

## Bounty Board

Stations post kill contracts against named enemy ships. Each contract has a target, a scrap reward, and an expiry timer.

**Flow:**
1. Accept a contract in the Bounties tab → target ship spawns at a fixed position; contract moves to YOUR CONTRACTS
2. Hunt and kill the target → `status = 'completed'`; HUD shows "Bounty Complete: +N scrap"
3. Dock at the posting station → completed bounties pay out automatically
4. If the timer expires before completion → target despawns; contract clears on next dock

Expiry timer is shown in YOUR CONTRACTS and flashes red when close to expiry. Bounty targets have `isBountyTarget = true` and do not respawn.

---

## Reputation System

`game.reputation` tracks a standing value per faction. Default is Neutral. Standing ranges from strongly negative (Hostile) to strongly positive (Allied).

### Factions

| Key | Label |
|---|---|
| `settlements` | Settlements |
| `scavengers` | Scavenger Clans |
| `concord` | Concord Remnants |
| `monastic` | Monastic Orders |
| `communes` | Communes |
| `zealots` | Zealots |

### Standing Levels

Five levels from Hostile through Allied. At Hostile, docking is refused. At Allied, a discount applies to all station services. Exact thresholds and discount rate are in `js/data/tuning/`.

### Triggers

- Killing an enemy ship reduces standing with that ship's faction
- Killing a scavenger or Concord ship grants a small bonus with Settlements (rival bonus)
- Collecting a bounty at a station grants standing with that station's faction
- Hitting a neutral ship with a projectile imposes a Settlements penalty

Station `reputationFaction` is computed at construction from `FACTION_MAP` in `js/systems/reputation.js`.

---

## Salvage

Press **E** near a derelict to begin salvage. A progress bar fills over several seconds; the player is frozen and vulnerable during this time. **E** or **Esc** cancels.

On completion: loot drops spawn from the derelict's loot table; the derelict is removed.

### Derelict Classes

Four hull classes with distinct polygon shapes and HUD lore text:

| Class | Shape | Color | Loot Focus |
|---|---|---|---|
| **hauler** | wide octagon | warm rust | Fuel, commodities, ammo, fuel cells |
| **fighter** | narrow dart | muted green-grey | Weapon drops, autocannon/missile ammo |
| **frigate** | H/I-beam | muted blue-grey | Heavy weapons, reactors, mixed cargo |
| **unknown** | asymmetric | MAGENTA | Exotics, rare modules, minimal fuel |

The first lore line from the derelict's `loreText[]` array is shown in the HUD approach prompt.

### Loot Types from Derelicts

- **Module drop** (cyan diamond) — module instance with a rolled condition; install via Ship Screen
- **Weapon drop** (magenta diamond) — unequipped weapon stored in `game.weapons[]`; shown in Ship Screen cargo
- **Ammo drop** (green diamond) — adds to `game.ammo[ammoType]` reserve
- **Scrap / Fuel / Commodity** — standard loot drops with auto-pickup

Condition distributions per derelict class are defined in `js/data/lootTables.js`.

---

## HUD / UI Mechanics

- **Status box** — 4 colored arc segments (proportional to current armor), center hull fill; arc labels F/A/P/S; flashes white briefly on hit
- **Integrity row** — `[R][E][S]` indicators for reactor, engine, sensor integrity
- **Weapon readout** — active primary name + cooldown bar; active secondary name + ammo pips
- **Throttle** — row of discrete pips; active pip filled cyan
- **Fuel bar** — segmented amber/red bar
- **Scrap / Cargo** — text readouts with cargo unit consumption
- **Minimap** — bottom-right; player crosshair, stations (white squares), enemies (red dots), derelicts (amber squares), loot (amber dots)
- **Context prompts** — dock / salvage prompts pulse near valid targets
- **Pickup text** — floating text at pickup location; color-coded: amber (default), green (repair), orange (breach)

---

## Neutral Traffic

### Trade Convoys

Trader Convoys follow two-point trade routes between stations. They travel to one endpoint, wait briefly, then reverse. Three routes connect the western entry, Kell's Stop, The Coil, and Ashveil Anchorage. Ships on the same route are staggered at spawn so they don't bunch up.

### Militia Patrols

Militia Patrols orbit The Coil in concentric rings at different speeds. Each patrol advances its orbit angle each tick and steers toward the computed orbit point. Multiple rings provide layered coverage.

---

## Ship vs NPC Architecture

**Ship** (`SHIP_REGISTRY`) — pure hull template. Shape, base stats, slot layout. No faction, no AI behavior, no identity. Four hulls: Onyx Class Tug, Maverick Class Courier, G100 Class Hauler, Garrison Class Frigate.

**NPC** (`NPC_REGISTRY`) — a configured actor built on a hull. Carries `faction`, `behavior` (stalker/kiter/standoff/lurker/trader/militia/player), and `shipClass` (the hull it extends). `createShip(id, x, y)` looks up and spawns NPCs. New NPC types are added to `NPC_REGISTRY` only — hull files stay untouched.

The designer shows both hulls and NPCs, grouping each NPC under its parent hull. The editor sidebar exposes SHIPS and NPCS as separate placement categories.

---

## Editor Harness

The `editor.html` page is a live map viewer for layout and AI debugging. It runs a full `GameManager` with an `EditorOverlay` drawn on top.

### Map loading

Pass `?map=NAME` to select a map at startup:

| Param | Map |
|---|---|
| `?map=arena` (default) | `js/data/maps/arena.js` — combat sandbox around Pale |
| `?map=tyr` | `js/data/maps/tyr.js` — full production map (Tyr) |
| `?map=blank` | `js/data/maps/blank.js` — empty 18000×10000, player at center |

### Editor controls (do not conflict with game controls)

| Key | Action |
|---|---|
| `` ` `` (grave) | Toggle pan mode — WASD pans camera, scroll zooms (0.1–2.0) |
| `G` | Toggle debug overlay |
| `O` | Toggle object sidebar |
| `↑/↓` | Change category (sidebar open) |
| `←/→` | Cycle item (sidebar open) |
| `U` | Place selected object at mouse cursor |

### Debug overlay (G)

When active, each entity in the world shows a stat block to its right: HP, ARM, SPD, and AI state. A green velocity vector extends from the entity toward its current movement direction; a magenta line shows its aim/rotation direction.

### Object sidebar (O)

A 240px panel slides in from the right edge. Categories are generated from `SHIP_REGISTRY` (grouped by faction) plus Stations, and Derelicts. Use `↑/↓` to change category, `←/→` to cycle items, `U` to place the selected item live in the world. Placed entities are fully live (AI active, shootable); position is logged to the browser console for pasting into map code. Clicking an item opens it in the designer at port 5176.

---

## Planned (Next Up)

See `NEXT.md` for features ready to implement. See `IDEA.md` for raw concepts under consideration.


# === NEXT.md ===

# NEXT.md — Upcoming Features

## UP NEXT



---

## Minor fixes / polish

- Grave-Clan Ambusher: confirm heat missile target-lock behavior when multiple enemies are present
- Universal ship slots need to be small and large variants
- Expand scavenging
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

### Module Condition Colors
Used in Ship Screen slot badges, cargo pill badges, and tooltip CONDITION/MULT rows. Helper: `conditionColor(condition)` from `colors.js`.

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

4. **Flicker (very subtle):** Occasional, barely-perceptible global brightness variation (e.g., `globalAlpha` oscillating between 0.97 and 1.0 at ~30Hz). Optional and should be almost subliminal.

These effects are **cosmetic polish**, not critical-path. Implement the clean vector look first; add CRT effects as a final pass.

---

## Typography

- **Font:** `monospace` (system default). If a custom font is ever added, it should be a clean pixel/terminal font (e.g., something like IBM VGA, Terminus, or a bitmap-style web font).
- **Sizes:**
  - Panel headers: 16-18px
  - Labels and readouts: 12-14px
  - Small/secondary text: 10-11px
  - All caps for headers and labels. Mixed case for body text and descriptions.
- **Spacing:** Generous. Instruments are meant to be read at a glance in tense situations. Don't cram text together.

---

## Specific UI Components

### Ship Screen (`js/ui/shipScreen.js`)
- Full-screen overlay, same dark backdrop (`rgba(0,6,14,0.93)`) and `DIM_OUTLINE` border.
- Three equal columns divided by thin `VERY_DIM` lines.
- **Left column:** Hull HP, per-arc armor (F/P/S/A), drive stats, scrap readout, module slot list. Module slots are outlined boxes with name + power annotation (`+W` green / `-W` amber).
- **Center column:** Paper doll — `HULL_POINTS` silhouette scaled ×4, colored by hull health (green/amber/red) with arc-colored outline segments matching the ship's in-game directional armor rendering. Arc direction labels F/S/A/P around the silhouette. Hull ratio bar + numeric below.
- **Right column:** Cargo bay quantities, capacity bar, active weapon list (PRI in cyan, SEC in magenta).
- Close hint centered at bottom: `[I] or [ESC] — close` in dim text.
- Opens with `I`, closes with `I` or `Esc`. Pauses simulation while open.

### Station Screen
- Dark backdrop overlay (near-black, 85% opacity — the game world should barely ghost through).
- Central panel with cyan border and corner brackets.
- Station name in large monospace text, centered, cyan.
- Tab bar: text-only tabs with an underline indicator on the active tab. No tab "boxes."
- Content area: clean rows of data. Commodity lists, ship stats, etc. in aligned monospace columns.
- Buttons: outlined rectangles. Buy/Sell in green/amber.
- Close prompt at bottom: dim text, "[Esc] Close".

### HUD (In-Flight)

The HUD has two zones: **ship-anchored UI** (follows the ship at screen center) and **bottom strip** (fixed screen-space panel at the bottom edge). All elements are projected onto a transparent display — no heavy panel backgrounds.

**Ship-anchored UI (centered on the ship):**
- **Weapon readout** — directly above the ship. Two rows: `PRI` (cyan) and `SEC` (magenta). Name + cooldown/reload bar + ammo count. Anchored ~85px above ship center in screen space.
- **Throttle pips** — directly below the ship. Six labeled pips (`Stop/1/4/1/2/3/4/Full/Flank`), active pip filled cyan. Speed and throttle label above the pips. System integrity symbols `[R][E][S]` below the pips in dim text (red if low).

**Bottom strip (fixed, 32px from screen edges):**
- Two rows. Row 1 (upper): ARMOR pips + Power. Row 2 (lower): HULL bar + FUEL bar + CARGO bar + SCRAP.
- **ARMOR pips (row 1, left):** Same total width as hull bar below it. 4 equal sections labeled `F/P/S/A`, each independently filled green→amber→red by that arc's health ratio. Arc total `current/max` shown to the right.
- **HULL bar (row 2, left):** Red segmented bar. Color shifts green→amber→red by hull health. Flashes red below 25%. `current/max` to the right.
- **FUEL bar (row 2, center):** Amber segmented bar, centered. Burns red below 25%. Burn rate shown above bar at low opacity.
- **POWER readout (row 1, right):** `PWR +300W [+50W]` — dim label, green gross output, net in green/red brackets.
- **CARGO bar (row 2, right):** Blue segmented bar. Turns red when full. `used/capacity` to the right.
- **SCRAP count (row 2, far right):** `⚙ 123` in bold amber to the right of cargo.

**Minimap:** Top-right corner. 225×225, bracket-corner border. Stations (faction-colored squares), derelicts (amber squares), loot (amber dots), enemies (red dots) when sensor capability is installed. Player dot (green triangle, rotation-aware).

**Kill log:** Right-aligned text below the minimap. Entries fade out over 3 seconds.

**Contextual prompts:** Centered horizontally at ~62% screen height. Dock/salvage/repair prompts appear here, pulsing slightly.

**Crosshair cursor:** Custom canvas crosshair replaces the OS cursor (`cursor: none` on canvas). Four short arms with a center dot. Green when mouse is within active primary weapon range; red when out of range. Small "OUT OF RANGE" label appears below the crosshair when red.

**Ship health via ship rendering:** The player ship's hull fill color indicates overall hull health — green (>75%), yellow-green (>50%), orange (>25%), red (critical). The hull outline is split into 4 arc segments (front, starboard, aft, port) each colored by that arc's armor health via `armorArcColor(ratio)`. This applies to **all ships when `relation === 'player'`** — directional damage is readable by looking at the ship itself.

### Game World Elements
- **Ships:** Wireframe polygons with minimal fill. Ship types are distinguished by **size and shape** (silhouette), not color. Color indicates **relation to the player**: green = player-owned, amber = neutral/cautious, red = hostile, blue = friendly. Non-faction entities (planets, asteroids, nebulae) may use any color that serves the aesthetic. Engine glow is pulsing outline circles at exhaust points; engine trails are long fading lines behind moving ships.
- **Stations:** See station design philosophy below.

### Derelict World-Space Labels

Derelicts render two types of text directly in world-space (anchored to the hull's screen position), not in the HUD:

Both are proximity-triggered — only rendered when `derelict.isNearby = true` (player within interaction range). No derelict name label; the lore text replaces it.

1. **Lore paragraph** — Rendered to the **right** of the hull. `9px monospace`, `DIM_TEXT` at 40% alpha. No blinking. Multiple lines from `derelict.loreText[]` spaced 13px apart, vertically centered on the hull. Story unfolds as the player approaches — not in a HUD box.

2. **`[ E ] SALVAGE` prompt** — Rendered **below** the hull. `11px monospace`, AMBER, blinking (sinusoidal alpha 0.55–0.90).

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

4. **Relation color signals station attitude — not faction.** Structure (hull plates, rects, brackets) is always WHITE at partial alpha. Accent elements — nav lights, pier lights, beacons, labels — use the `accentColor` getter driven by `station.relation`: AMBER = neutral (default for all factions), CYAN = friendly, RED = enemy. Fuel tanks are always AMBER regardless of relation (hazard marking, not faction).

5. **Docked ships add life.** Use small boxy ship silhouettes (rectangular hull + cockpit block + wing stubs) parked at jetty tips and inner piers. Vary rotation and scale. They should read as "in various states of disassembly/assembly" — not all perfectly aligned.

6. **Animated docking lights at every pier tip.** Pulsing sinusoid, slightly offset per pier so they don't all pulse in sync. Pier light color = `accentColor`.

7. **Approach beacon at the harbor mouth.** Two beacons at the harbor entrance corners, pulsing together. A faint trapezoidal gradient beam pointing away from the mouth. Beacon color = `accentColor`.

8. **Label below the structure** in `accentColor`, small bold monospace.

**Anti-patterns to avoid:**
- No hexagons
- No symmetric 4-arm or 6-arm radial designs
- No solid fills on hull (dark near-black fill with bright outline only)
- No rounded corners
- Don't draw stations as single closed polygon paths — individual rects are preferred

### Celestial Body Rendering

Planet and moon visuals follow the **CRT surface-scanner aesthetic** — line work only, no gradients, no filled areas. The look is a topographic instrument readout, not a painting.

**Rendering style by planet type:**

- **Ice / rocky worlds (surface visible from space):** Topographic contour polygons clipped to the disk. Draw 3–6 closed irregular polygon paths at decreasing scales — nested, offset, not centered — to suggest terrain elevation layers. Jagged straight-line segments between vertices (no bezier smoothing). The visual reference is the Nostromo descent computer in *Alien* (1979): a CRT scanner reading back surface topology as jagged closed curves. Pale (`#b8ccd8`) is the reference implementation in `_renderPale()` in `renderer.js`.

- **Gas giants:** Horizontal band striations — thin lines or arcs at different y-offsets across the disk, clipped. Bands should vary in spacing and opacity. Optional: planetary rings as thin ellipses angled across the limb. No solid fills.

- **Thick-atmosphere worlds (habitable or shrouded):** Geometric cloud swirls — angular spiral or arc segments that suggest cloud bands without being smooth curves. Straight-line approximations of spiral paths, or stacked arc segments offset from center, clipped to disk.

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


