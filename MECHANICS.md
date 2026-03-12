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
| HEAT | Homes on nearest hostile; interceptable |

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
| `isGuided + guidedType='heat'` | Steers toward nearest hostile |
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

All non-player ships — hostile, neutral, or friendly — share the same AI system (`js/ai/shipAI.js`). There are no separate hostile vs neutral tracking arrays. Every ship tracks in `GameManager.ships[]`. A ship's `relation` field drives behavior:

- `'hostile'` — combat behavior active; counted as an enemy for targeting and loot
- `'neutral'` — passive behavior active; turns hostile immediately if struck by the player
- `'friendly'` — passive behavior active; never targeted

### Ship AI Profile

Each ship carries a flat `ship.ai` object spread from an `AI_TEMPLATES` entry in `js/data/tuning/aiTuning.js`. Characters and spawn overrides can change individual values (e.g. a cautious enemy with longer `deaggroRange`) without touching the base template.

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

- **Trader** — state machine between `traveling` and `waiting`; follows `ship.ai._tradeRouteA` / `ship.ai._tradeRouteB`; reverses route when arriving. Combat fallback: `flee`
- **Militia** — orbit loop around `ship.ai._orbitCenter`; steers toward computed point each tick. Combat fallback: `stalker`

### Relation Transitions

When a player projectile hits a neutral ship:
1. Reputation penalty applied to Settlements faction
2. `ship.relation` set to `'hostile'`
3. `ship.ai._aggro` set to `true` — the ship immediately engages rather than patrolling

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

See `PLAN.md` for features ready to implement. See `FIXES.md` for small tweaks and bug fixes.
