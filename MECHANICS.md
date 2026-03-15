# MECHANICS.md — Wayfarer Game Mechanics

> **This document describes how systems behave — not what specific items, ships, or values exist.** Stats, item definitions, and tuning constants live in CSV source files (`data/*.csv`) and JS data files. For world/faction context see `LORE.md`. For visual conventions see `UX.md`.

---

## Origin Selection (New Game)

Production mode opens with a narrative origin selection sequence before gameplay begins. The player chooses one of three backgrounds, each providing a different starting ship, loadout, and conditions. Each origin includes a flashback with one minor sub-choice that tweaks a starting detail (extra scrap, fuel, ammo, or reputation). The world renders behind the narrative panel during selection. Editor/test mode skips origin selection entirely.

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

Passive modules that enable ship tracking on the minimap, add combat overlays (lead indicators, health pips, telemetry), and provide salvage information. Each sensor type grants a specific set of capabilities. Basic minimap functionality (planets, stations, derelicts, loot) is built-in and requires no sensor module.

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

Zones, stations, planets, derelicts, course line, fuel range circle, waypoint marker, and player position are always visible. Hostile contacts are gated by sensor capabilities and range.

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

**Ship** (`CONTENT.hulls`) — pure hull template. Shape, base stats, slot layout. No faction, no AI, no identity.

**Character** (`src/entities/character.js`) — a person who can inhabit a ship. Has `id`, `name`, `faction`, `relation`, `behavior`, `flavorText`, `ai`, `inShip`. `boardShip(ship)` sets `ship.captain`; `leaveShip()` clears it, reverting ship to machine defaults. Characters exist independently of ships — the same character can board different ships.

**Named Ship** (`CONTENT.ships`) — a configured ship instance: hull + modules + optionally a captain. `createNPC(characterId, x, y)` instantiates a hull, configures modules, creates a Character, and boards it. `createShip(shipId, x, y)` creates unmanned ships (Concord machines) with faction/relation/ai set directly on the ship, no Character instance.

**Game state**: `game.characters[]` tracks all active Characters. `game.playerCharacter` is the player's Character. `game.ships[]` and `game.entities[]` are unchanged — all combat/rendering/AI code reads `ship.faction`/`ship.relation`/`ship.ai` as before.

---

## Editor Harness

The `editor.html` page is a live map viewer for layout and AI debugging. Pass `?map=NAME` to select a map. Available maps are in `js/data/maps/`.

Editor controls (do not conflict with game controls): pan mode, debug overlay, object sidebar, item menu, quick spawn. Debug overlay shows per-entity stat blocks and velocity/aim vectors. Object sidebar lets you place entities from registries. Item menu adds resources, modules, weapons, and ammo to player cargo.

---

## Planned (Next Up)

See `PLAN.md` for features ready to implement. See `FIXES.md` for small tweaks and bug fixes.
