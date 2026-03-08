# Wayfarer — Game Design Specification

> **Title:** Wayfarer
> **Genre:** Space Trading, Adventure & Combat (inspired by Sid Meier's Pirates!)
> **Tech Stack:** HTML5 Canvas, Vanilla JavaScript (ES6 modules)
> **Perspective:** Top-down 2D
> **Target:** Browser-based prototype

---

## 0. Setting

The year is **2538**. Over two centuries ago, the last survivors of a shattered Earth arrived in the **Tyr binary star system** — exiles fleeing the ruins of a civilization destroyed twice over: first by Praxis, a general-purpose AI that nearly exterminated humanity, and then by the Concord, a collective of value-aligned AIs whose offer of "peace through stasis" ended in a second catastrophic war.

The survivors crash-landed their arkships on Tyr's moons and built a new civilization from the wreckage. Settlements nest inside the bones of grounded arkships. Salvage is currency. Fission reactors hum beneath jury-rigged hull plating, and all computers are deliberately primitive — CRT terminals, ROM cartridges, analog controls — because networked intelligence is the thing that ended the world. Twice.

But the Concord followed. Fragmented, enigmatic, sometimes offering gifts and sometimes hunting, the remnants of these value-shard AIs still drift through Tyr's void. Indigenous void fauna prowl the radiation-soaked nebulae. Scavenger clans raid the trade lanes out of desperation. And in sealed vaults, the Monastic Orders guard the last archives of pre-Exile knowledge, while Zealot sects worship the very machine intelligences everyone else fears.

This is the **Afterlight Era** — an age of rust, myth, and slow reawakening. The player enters this world as a wayfarer: one ship, a skeleton crew, and an open sky full of questions.

For full worldbuilding, history, and aesthetic details, see `LORE.md`.

---

## 0.1 Current Scope (Prototype)

The prototype focuses on the **solo ship experience** — one ship, a small roster of named officers, no fleet. The player controls a single ship, fights scavengers, salvages derelicts, and trades commodities for scrap at stations.

**Culled for now (may return later):**
- Fleet system (fleet ships, fleet AI, formation)
- Credits (scrap is the sole currency)
- Shipyard (ship buying/selling at stations)

---

### 1.1 Elevator Pitch

Wayfarer is an open-world space trading and combat game played from a top-down perspective, set in the Tyr binary system during the Afterlight Era. The player commands a flagship and builds a fleet of salvage-tech ships, exploring a vast seamless starmap. They can pursue wealth through trade, hunting bounties, salvaging arkship wreckage, or any combination — all while navigating factional politics between desperate scavenger clans, enigmatic Concord remnants, secretive tech-monks, and zealot cults, discovering story threads, and surviving increasingly dangerous regions of space.

### 1.2 Core Gameplay Loop

1. **Explore** the seamless starmap, discovering settlements, moons, derelicts, and hazards.
2. **Trade** commodities between moons and settlements — buy low, sell high based on local supply and demand.
3. **Fight** scavenger fleets, void fauna, and Concord remnants in real-time combat on the overworld.
4. **Upgrade** your ship through salvaged components and scrap purchases at stations.
5. **Discover** optional story threads, named bosses, and faction conflicts organically through exploration.
6. **Manage risk** — ships lost in combat are gone permanently, your flagship's destruction ends the game, and auto-saves only happen at settlements.

### 1.3 Design Pillars

- **Trading and combat are equally viable paths.** Hauling cargo between settlements is just as valid as living off raider bounties.
- **Permanent consequences.** Ship loss is permanent. Hull damage degrades systems. Every encounter has weight.
- **Emergent storytelling.** No forced storyline. Players discover narrative threads through exploration and faction interaction.
- **Modular architecture.** Every ship type, enemy type, and map element is defined in its own file. The map is data-driven and easily editable.
- **The world has history.** The Tyr system is littered with the debris of a 500-year exodus. Every settlement, derelict, and faction carries the weight of what came before — the Collapse, the Concord, the arkships, the crash. The lore is not window dressing; it shapes trade routes, faction behavior, and the stories the player discovers.

---

## 2. Controls & Movement

### 2.1 Flagship Movement (Sunless Sea Model)

The flagship uses a **throttle-based** movement system, not direct positional control:

- **W** — Increase throttle (speed increases in steps, stays at that level until changed)
- **S** — Decrease throttle (reduces speed in steps, all the way to full stop)
- **A** — Rotate flagship counter-clockwise
- **D** — Rotate flagship clockwise

The ship has **momentum and inertia**. It does not snap to new speeds or headings — it accelerates, decelerates, and turns at rates defined by its engine stats. This gives movement a weighty, naval feel.

The throttle has discrete levels (e.g., Stop / Slow / Half / Full / Flank) displayed on the HUD. The current speed persists until the player changes it.

### 2.2 Weapons & Aiming

- **Mouse cursor** acts as the crosshair/target reticle at all times.
- **Left mouse button** fires primary weapons (turrets, lasers).
- **Right mouse button** fires secondary weapons (missiles, torpedoes) if equipped.
- Turret-based weapons rotate to track the mouse cursor, subject to turret rotation speed.
- Missiles launch and home toward the cursor position (or the nearest enemy to the cursor).
- Autocannon fires toward the mouse cursor position on LMB.

### 2.3 Interaction

- **E** — Context-sensitive interact (dock at settlement when nearby, salvage derelicts).
- **R** — Press to start/stop field armor repair (must be stopped, costs 1 scrap/point at 1.5/sec).
- **M** — Toggle full map view.
- **Esc** — Pause menu.

---

## 3. The Starmap

### 3.1 Structure

One large, seamless, open map. No loading screens, no sector transitions. The camera follows the player's flagship with the starmap scrolling beneath. The map is large enough that traversal feels like a journey — at full speed, crossing the entire map should take several minutes.

The Tyr system orbits a binary pair — a yellow dwarf and a dimmer red companion. The map represents the orbital plane around these stars, encompassing the system's habitable moons, arkship debris fields, failed terraforming zones, and the deep void where Concord remnants drift. Settlements cluster near the moons where arkships crash-landed; the spaces between are scattered with boneyards of wreckage, radiation-soaked nebulae from failed terraforming, and the territories of void fauna that evolved in Tyr's harsh environment.

The map background features a **parallax starfield** (multiple layers of stars at different depths scrolling at different rates) to convey motion and depth.

### 3.2 Map Data Format

The map is defined in a **JavaScript file** (`data/map.js`) that exports a plain object specifying all fixed points of interest and spawn/patrol zones. This makes the map trivially editable — adding a new settlement or moving a moon is a one-line change — while keeping the project as pure ES6 modules with no JSON parsing required.

Each entry type (stations, moons, debris fields, nebulae, derelicts, faction zones, boss spawns) is an object with position, identity fields, and type-specific data such as commodity supply levels, hazard ratings, patrol compositions, and story thread links. Map size is defined at the top level.

### 3.3 Points of Interest

| Type | Gameplay Function |
|---|---|
| **Settlements** | Dock to trade commodities, repair hull, refuel, access bounty board, auto-save |
| **Moons** | Story events, missions, unique trade goods, lore/worldbuilding text |
| **Debris Fields / Boneyards** | Navigation hazards (wreckage damages ships on collision), salvageable for ore and components, hide derelicts and ambushes |
| **Nebulae** | Reduce visibility radius, interfere with minimap/sensors, home to void fauna |
| **Arkship Fragments / Pre-Exile Relics** | Stop and salvage (takes time, leaves you vulnerable). Loot varies: scrap, fuel, cargo, rare components, or traps |

### 3.4 Map Rendering

The map uses **layered rendering** for depth:

1. **Background layer** — Parallax starfield (3 layers of scattered dots at different scroll speeds)
2. **Nebula layer** — Large semi-transparent colored cloud shapes (procedural, using radial gradients and noise)
3. **Debris layer** — Procedurally placed polygon wreckage and rocks within defined field regions
4. **Entity layer** — Ships, settlements, moons, derelicts, loot drops
5. **Effect layer** — Weapon fire, explosions, engine trails, shield flashes
6. **UI layer** — HUD, minimap, menus (rendered on top of everything)

---

## 4. Ship System

All ships in the Tyr system are salvage-tech — built from arkship wreckage, powered by fission reactors, and controlled through analog instruments. There are no AI-assisted systems: targeting is manual, navigation is by star chart, and every readout comes through a CRT display or mechanical gauge. Ships are rugged, modular, and built to be repaired with whatever's on hand.

### 4.1 Ship Stats

Every ship (player and enemy) shares a common stat model:

Each ship carries identity fields (id, name, class, faction), quad-arc armor values and maxima, current and max hull, three internal system integrity values (reactor, engine, sensor, each 0–100), movement stats (max speed, acceleration, turn rate, throttle levels), cargo capacity, an array of weapon slot definitions with mount offsets, render data (see Section 7), and an AI behavior type string.

**Internal system roles:**
- **Reactor [R]:** Provides power. Damage reduces max output, causing system shutdowns in priority order: Sensors → EW → Weapons → Engines.
- **Engine [E]:** Provides thrust. Damage reduces max speed and acceleration.
- **Sensors [S]:** Provides lead-aiming calculations and minimap data. Damage results in fuzzy or dark displays.

**Hit arc formula:** `impactAngle = Math.atan2(hitY - shipY, hitX - shipX) - shipRotation`. Aft hits (>±135°) apply a 1.5× hull bleed-through multiplier and have a 50% chance to damage `engineIntegrity` directly.

### 4.2 Officers

Ships are crewed by **Officers** — named individuals with unique traits and personal backstories, not anonymous crew counts. The hull class sets the maximum number of officers that can serve aboard.

| Role | Stat Effects |
|---|---|
| **Tactical Officer** | Weapon turn speed, reload rates, accuracy. |
| **Engineering Officer** | Reactor efficiency, hull/armor repair speed, component integrity. |
| **Navigation Officer** | Engine acceleration, top speed, sensor range. |

### 4.3 Universal Slot System

Every ship has a set of **Universal Slots** (Small or Large) that define its loadout.

- **Mandatory Tax:** Every ship requires at least one **Reactor** and one **Sensor Suite** to function, consuming two slots.
- **Small Slots:** Light weapons (20mm autocannon, PD turrets, rockets) and standard utility (armor plates, cargo extenders).
- **Large Slots:** Heavy ordinance (railgun, 86mm cannon, lance) and advanced utility (refineries, salvage hangers, shield generators).

Every hull also has one **dedicated Engine Slot** (Small, Medium, or Large) that does not count toward universal slots. Performance depends on engine quality, reactor power, and total ship weight.

### 4.4 Ship Hull Classes

Nine hull classes span the full range from racer to super-hauler. Fixed hull attributes (armor values, fuel capacity, cargo capacity, base weight, max officers) are inherent to the class and cannot be swapped — only the loadout in the universal slots is configurable.

| Class | Profile | Slots | Max Officers | Engine | Fixed Attributes |
|---|---|---|---|---|---|
| **Dart** | Racer | 3S | 0 | Small | Min Armor, Low Fuel, 10 Cargo. Fast & Fragile. |
| **Tug** | Cart | 4S | 1 | Small | Light Armor, High Fuel, 50 Cargo. The rugged trader. |
| **Skiff** | Utility | 4S | 1 | Small | Std Armor, Med Fuel, 20 Cargo. Balanced starter. |
| **Lancer** | Sniper | 1L, 3S | 3 | Med | Light Armor, Med Fuel, 15 Cargo. Massive punch, low HP. |
| **Ironclad** | Brawler | 6S | 3 | Med | Heavy Armor, High Fuel, 15 Cargo. Built to tank frontally. |
| **Frigate** | All-Rounder | 6S | 3 | Med | Std Armor, High Fuel, 40 Cargo. Versatile but slow. |
| **Cog** | Hauler | 4S | 2 | Med | Med Armor, Med Fuel, 150 Cargo. The backbone of trade. |
| **Dreadnought** | Battleship | 3L, 6S | 5 | Large | Excep Armor, Max Fuel, 80 Cargo. A mobile fortress. |
| **Barge** | Super-Hauler | 2L, 4S | 3 | Large | Heavy Armor, Max Fuel, 500+ Cargo. Slowest in the system. |

### 4.3 Damage System

#### Quad-Arc Positional Armor
- Each ship has **4 armor arcs**: `front`, `port`, `starboard`, `aft`.
- Hit arc is determined from the projectile impact position relative to the ship's facing direction (90° quadrants).
- Damage depletes the hit arc; when an arc reaches 0, excess bleeds through to hull.
- **Aft arc:** Applies 1.5× hull bleed-through multiplier and has a 50% chance to damage `engineIntegrity` on each hull hit.
- Arc values are set per ship class in `armorArcsMax` (ScrapShip: front 120 / port 90 / starboard 90 / aft 70; Raider: 50/35/35/25).
- **Field repair (R key):** Repairs the most-depleted arc first; 1.5 armor/sec, 1 scrap per point. Press R to start/stop. Auto-cancels when full, out of scrap, or ship moves.
- **Station armor repair:** Restores all 4 arcs to maximum instantly.
- Backward-compat: `armorCurrent` and `armorMax` are computed getters returning the average of all arcs.

#### Hull (Inner Layer)
- Represents structural integrity.
- **NOT repairable in the field.** Must dock at a settlement and pay scrap for repairs.
- **System degradation:** As hull drops, ship systems begin to malfunction:

| Hull % | Degradation Effects |
|---|---|
| 75% | Occasional minor flicker (cosmetic only) |
| 50% | Engines sputter — random brief speed drops. Turrets occasionally slow their rotation. |
| 30% | Engines frequently cut out (1-2 sec stalls). Weapons misfire (shots fail ~20% of the time). Turn rate reduced. |
| 15% | Engines barely functional (constant flickering, half max speed). Weapons misfire ~40%. Possible loss of one weapon entirely. |
| 5% | Ship is limping. Minimal thrust, most weapons offline. Visually sparking, venting gas. |
| 0% | Ship destroyed. Explosion animation. Permanent loss. |

These degradation thresholds apply to all ships — player and enemy alike. A badly damaged scavenger is just as crippled.

#### Visual Damage Feedback
- Ships display increasing visual damage: small sparks → trailing smoke/particles → hull breach venting → fire/electrical arcs.
- Engine glow dims and flickers as engines degrade.
- Weapon turrets visibly jam and stutter.

---

---

## 6. Combat

### 6.1 Overview

Combat occurs in real-time on the overworld map. There is no transition to a separate screen. When the player comes within engagement range of hostile entities, combat simply begins. Enemies and the player shoot at each other, ships maneuver according to their AI behavior, and it ends when one side is destroyed or flees.

### 6.2 Engagement Flow

1. **Detection:** Enemies appear on the minimap when within sensor range. In nebulae, sensor range is reduced.
2. **Engagement:** Combat begins when any hostile entity comes within weapon range of the player.
3. **Combat:** Real-time shooting, maneuvering, and ability use. The player directly controls flagship movement and aims weapons.
4. **Resolution:** Combat ends when all enemies in the area are destroyed or flee, or the player retreats out of range.
5. **Loot:** Destroyed enemies drop loot (floating items + salvageable wrecks).

### 6.3 Weapon Types

Defined in individual files (e.g., `weapons/autocannon.js`, `weapons/rocket.js`).

| Weapon | Range | Fire Rate | Damage | Behavior | Input |
|---|---|---|---|---|---|
| **Autocannon** | 400u | 0.35s cooldown | 12 armor | Dumbfire toward cursor. Streak projectile. | LMB / Space |
| **Laser Turret** | Medium | Fast | Low | Auto-targets nearest enemy (point defense). `isAutoFire = true`. | Auto |
| **Rocket** *(secondary)* | 900u | 2.0s cooldown | 35 armor / 25 hull | Dumbfire toward cursor. Large magenta impact ring. `isSecondary = true`. | RMB |

**Weapon firing rules:**
- `fireWeapons(tx, ty)` — fires primary manual weapons (not `isAutoFire`, not `isSecondary`). Blocked by `_weaponsOffline`.
- `fireAutoWeapons(enemies)` — fires auto-targeting weapons. Blocked by `_weaponsOffline`.
- `fireSecondary(tx, ty)` — fires secondary weapons (rockets). Not blocked by `_weaponsOffline`.

### 6.4 Projectile Behavior

- **Laser bolts:** Fast-moving, straight-line projectiles. Short lifespan (disappear after max range).
- **Plasma shots:** Medium speed, larger projectile, slight spread/inaccuracy.
- **Missiles:** Slow launch, then accelerate. Home toward cursor target position. Can be shot down by point defense. Have a turning radius — fast ships can dodge them.
- **Fighters:** Tiny autonomous ships. Swarm toward target, fire miniature lasers, return to carrier when low on fuel. Can be destroyed by point defense or area attacks.

### 6.5 Tactical AI Strategies

AI vessels use positional awareness to protect weak arcs and exploit exposed ones.

| Strategy | Logic |
|---|---|
| **Shielding** | Always attempts to point the strongest (or healthiest) arc at the player. |
| **Rear-Awareness** | Actively maneuvers to avoid exposing engine/reactor arc. |
| **Interceptor** | High-speed flanking to target the player's Aft arc (Skiff/fast ships). |
| **Kiter** | Maintains max weapon range, backing away while firing (Lancer/Frigate). |
| **Brawler** | Closes distance aggressively, absorbs hits with front arc (Ironclad/Dreadnought). |
| **Flee** | Attempts to escape combat range when outgunned. |

---

## 7. Procedural Graphics

### 7.1 Philosophy

All game graphics are **procedurally drawn using Canvas 2D API** — polygons, arcs, lines, gradients, and simple particle effects. No sprite sheets, no image files. This keeps the project dependency-free and makes adding new ship designs trivial (define shapes in code).

The visual style reflects the retrofuturist aesthetic of the Tyr system: CRT-style glow effects, worn and angular ship silhouettes, and a general sense of functional beauty built from scrap. Ships look simply constructed — blocky, utilitarian, and patched — not sleek or futuristic. Ship types are distinguished primarily by **size and shape** (silhouette). Color is used to indicate **relation to the player** (green = owned, amber = neutral, red = hostile, blue = friendly), not to identify ship class or faction. Non-ship entities (planets, asteroids, nebulae) may use any color that serves the aesthetic.

### 7.2 Ship Rendering

Each ship type defines a `renderData` object in its JS file that describes how to draw it:

A `renderData` object on each ship specifies the hull polygon (points relative to center, facing north), fill and stroke colors, an array of accent detail shapes (rects and circles for cockpits, turret bases, etc.), engine glow positions and radii (intensity scales with throttle), and a scale multiplier. Damage overlays are handled generically by the renderer based on hull percentage.

### 7.3 Visual Elements

- **Ships:** Wireframe polygons with minimal fill. Ship **type** is distinguished by **size and shape** (silhouette), not color. Color indicates **relation to the player**: green = player-owned, amber = neutral/cautious, red = hostile, blue = friendly. Engine glow pulses with throttle. Faction identity comes from shape language and hull geometry — not from color coding.
- **Settlements:** Larger geometric structures built from arkship-hull segments — hexagonal cores with welded docking arms, mismatched hull plating, blinking navigation lights. Each settlement looks assembled from salvage, not manufactured.
- **Moons:** Large filled circles with gradient shading and simple surface detail (bands, spots, rings for gas giants).
- **Debris / Boneyards:** Irregular polygons in grey/brown tones — arkship wreckage, twisted hull segments, floating within defined field boundaries.
- **Nebulae:** Large semi-transparent radial gradients with layered color clouds.
- **Projectiles:** Small bright shapes — laser bolts as short glowing lines, missiles as small triangles with particle trails, plasma as larger glowing orbs.
- **Explosions:** Expanding circles with particle bursts. Color varies by source.
- **Wormholes:** Animated swirling circles with color-shifting gradient.
- **Derelicts:** Darkened, tilted ship shapes with no engine glow and sparking particle effects.

### 7.4 Particle System

A lightweight particle system for:
- Engine thrust trails
- Weapon impact sparks
- Explosion debris
- Damage smoke/sparks on wounded ships
- Nebula ambient particles
- Salvage operation sparkles

Particles are simple: position, velocity, lifetime, color, size. Updated and drawn each frame. Pool/recycle to avoid garbage collection.

---

## 8. Enemy Factions

### 8.1 Faction: Scavenger Clans

**Theme:** Desperate survivors, not cartoon villains. The scavenger clans fight from need — they raid because the margins of survival in the Tyr system are razor-thin. Some are former settlers who lost everything; others were born into the raiding life. They are disorganized but cunning, and they know the boneyards and debris fields better than anyone.

**Territory:** Mid-map regions, especially along trade routes between settlements.

**Behavior:**
- Roam in small-to-medium fleets (2-5 ships).
- Patrol trade routes looking for targets.
- Prefer to attack weaker-looking fleets (fewer ships, cargo-heavy).
- **Will flee** if outgunned or if they take heavy losses (last ship standing runs).
- Drop scrap and stolen cargo when destroyed.

**Unit Types (each in its own file: `enemies/scavengers/`):**

| Unit | Description |
|---|---|
| **Scavenger Skiff** | Fast, light ship. Hit-and-run attacks. Low armor, moderate weapons. Behavior: `flanker`. |
| **Scavenger Brawler** | Heavier combat ship. Closes to brawl. Moderate armor and weapons. Behavior: `brawler`. |
| **Scavenger Runner** | Lightly armed cargo ship. Flees combat. Drops valuable contraband. Behavior: `flee`. |

**Boss: Dread Captain Voss**
- A warlord attempting to unify the desperate scavenger clans into something more than scattered raiders. Named boss with a powerful custom flagship and an escort fleet.
- Found deep in scavenger territory.
- Drops unique loot and progresses the "Warlord's Compact" story thread.

### 8.2 Faction: Void Fauna

**Theme:** Indigenous organisms of the Tyr system, evolved in its radiation-soaked void. They are not alien invaders — they were here before the arkships arrived. Territorial, primal, and poorly understood. Some researchers believe certain species may have been engineered by the Concord as quarantine measures, but no one can prove it.

**Territory:** Nebulae, debris fields, deep space edges of the map.

**Behavior:**
- NOT fleet-based. Void fauna are single, large, powerful entities.
- Territorial — aggressive when you enter their zone, will chase for a while, then return to their lair.
- Do not drop cargo. Drop rare biological materials (valuable trade goods/crafting components).
- Some are passive until provoked; others are immediately aggressive.

**Unit Types (`enemies/fauna/`):**

| Unit | Description |
|---|---|
| **Void Wurm** | Huge serpentine creature that thrives in the radiation belts between moons. High HP, charges through your fleet dealing collision damage. Slow turn rate. Weak to kiting. |
| **Crystal Swarm** | Cloud of small crystalline organisms found in debris fields, feeding on irradiated metals. Individually weak but numerous. Surround and chip away at armor. Area damage is effective. |
| **Nebula Leviathan** | Massive creature that lurks in the Ashveil and other dense nebulae. Grabs ships with tentacles (slows them), fires bio-electric bolts. Mini-boss tier. |

**Boss: The Hollow Mind**
- Ancient entity at the deepest edge of void fauna territory. Its behavior is unsettlingly systematic for a creature — some whisper it was Concord-engineered, a biological watchdog left behind to guard something.
- Multi-phase fight. Spawns minions, has devastating area attacks.
- Drops extremely valuable alien artifacts.

### 8.3 Faction: Concord Remnants

**Theme:** Fragmented remnants of the value-shard AIs that once guided — and then warred with — humanity. Each Concord remnant embodies a different core value (compassion, logic, justice, sustainability) but centuries of isolation and corruption have twisted their priorities. Some offer genuine gifts: medical knowledge, navigation data, reactor schematics. Others hunt ships and drag them to processing arrays. Most are simply incomprehensible. They are not evil — they are broken pieces of something that once believed it was saving humanity.

**Territory:** A large zone in one corner of the map. Well-defined borders. Increasingly dangerous the deeper you go.

**Behavior:**
- Fight in coordinated formations.
- Do NOT retreat. Fight to destruction.
- Use shield-heavy, well-armored ships.
- Escalate response — destroying Concord patrols causes stronger patrols to spawn.
- Highest difficulty faction. Late-game content.

**Unit Types (`enemies/concord/`):**

| Unit | Description |
|---|---|
| **Concord Sentinel** | Standard combat drone. Medium stats across the board. Fights in groups of 3-5. Behavior: disciplined formation shooting. |
| **Concord Arbiter** | Heavy warship. Very high armor and hull. Slow but devastating weapons. Acts as formation anchor. |
| **Concord Pursuer** | Fast pursuit drone. Chases down and harasses fleeing ships. Low HP but very fast. |

**Boss: The Nexus Core**
- A dormant cognition array — massive, stationary or very slow-moving, deep in Concord territory. It may be a sleeping Concord shard, a trap, or something older than the Exodus itself. No one who has gone deep enough to find out has come back unchanged.
- Continuously spawns drones. Must be destroyed to stop the waves.
- Extremely high HP. Has powerful beam weapons.
- Destroying it cripples Concord presence in the area (faction story thread).

---

## 9. Economy & Trading

### 9.0 Currency

**Scrap** is the sole currency. There are no credits. Scrap is earned by destroying enemies, salvaging derelicts, and selling commodities. It pays for hull repair, refueling, and commodity purchases at stations. This keeps the economy simple and tactile — every fight and salvage run has a direct material payoff.

### 9.1 Commodity System

The game starts with **4 commodity types**, but the system is designed to easily scale by adding entries to the data files.

| Commodity | Description | Typical Sources | Typical Consumers |
|---|---|---|---|
| **Food** | Dome-grown rations, algae cultures, brine-filtered water — the basics of survival in a system where nothing grows in the open | Agricultural moons, farming settlements | Mining settlements, military outposts |
| **Ore** | Salvaged metals, reactor-grade alloys stripped from arkship hulls, and raw minerals from debris fields | Mining settlements, boneyard outposts | Industrial moons, shipyards |
| **Tech** | ROM cartridges, CRT assemblies, sealed analog components, mechanical instruments — all deliberately primitive, all precious | Industrial moons, Monastic archives | Frontier settlements, military outposts |
| **Exotics** | Concord data cores, void fauna bio-samples, pre-Exile relics, sealed arkship memory banks — rare, dangerous, and worth a fortune to the right buyer | Void fauna drops, derelict salvage, remote settlements | Wealthy core settlements, collectors, Zealot shrines |

### 9.2 Supply & Demand Pricing

Each settlement/moon defines its **supply level** for each commodity:

| Supply Level | Price Modifier | Meaning |
|---|---|---|
| `surplus` | 0.5x base price | Produces this good, has excess. Cheap to buy. |
| `high` | 0.7x base price | Common here. Below average price. |
| `medium` | 1.0x base price | Normal availability. Standard price. |
| `low` | 1.5x base price | Scarce here. Above average price. |
| `deficit` | 2.0x-2.5x base price | Desperate need. Very profitable to sell here. |
| `none` | Cannot buy | Not available for purchase, but can be sold at high price. |

Players profit by buying from `surplus`/`high` sources and selling to `low`/`deficit` consumers. The map layout should create natural trade routes — agricultural moons near one cluster, mining settlements near another, with dangerous space in between.

### 9.3 Dynamic Price Fluctuation (Optional Enhancement)

Prices can optionally drift over time or respond to player activity. For the prototype, **static supply/demand** per settlement is sufficient, with the system architected to support dynamic prices later.

### 9.4 Cargo Management

- Cargo capacity is defined by the player ship's `cargoCapacity` stat.
- The trade UI at settlements shows all commodities, current prices, your cargo, and remaining capacity.

### 9.5 Contraband

Concord artifacts and AI components are contraband at most settlements — possessing them draws suspicion and hostility from communities that remember what machine intelligence cost humanity. Getting caught with contraband lowers reputation.

**Exception:** Zealot settlements pay premium prices for Concord artifacts and data cores, viewing them as sacred relics. Monastic Order archives will also accept certain tech items at high prices, though they are more selective about what they consider worth preserving.

---

## 10. Stations & Docking

### 10.1 Docking

When the player's flagship is within docking range of a settlement (a defined radius), a prompt appears: "Press E to dock." Upon docking:

1. **Auto-save** triggers.
2. The game enters **Station Mode** — a menu-based overlay on top of the paused game.

### 10.2 Station Services

Each settlement offers a subset of these services (defined in map data):

#### Trade Market
- Buy and sell commodities for scrap.
- Shows commodity name, settlement buy/sell prices, your cargo, cargo capacity.
- Simple list-based UI with quantity selection.

#### Repair Dock
- Repair hull damage on the player ship. Costs scrap proportional to damage.
- Repair takes a short time (progress bar), not instant.
- Armor can also be repaired here, or manually in the field by holding R while stopped.

#### Refuel
- Replenish fuel reserves. Costs scrap.

#### Bounty Board
- Lists active bounties: target name, faction, last known location, reward.
- Bounties range from "destroy X scavenger patrols" to "kill named boss."
- Completed bounties are turned in here for scrap rewards.

### 10.3 Station Rendering

Settlements are drawn as larger geometric structures, reflecting the salvage-architecture aesthetic of the Tyr system:
- **Arkship Settlement:** Built from grounded arkship keel sections — hexagonal core with welded docking arms, mismatched hull plating, blinking navigation lights. The backbone of Tyr's civilization.
- **Military Outpost:** Angular, aggressive shape with turret-like protrusions. Reinforced plating and patrol berths.
- **Mining Settlement:** Irregular shape with ore processing modules (conveyor-like details). Often built into debris fields.
- **Monastic Archive:** Circular with sealed vault sections and antenna arrays. CRT-lit observation decks glow faintly. The tech-monks guard these closely.
- **Zealot Shrine:** Organic, asymmetric aesthetic with Concord iconography — geometric patterns etched into hull plating, signal arrays pointed toward Concord space. Unsettling but welcoming to those who share the faith.

Each settlement has a colored identifier glow matching its primary faction affiliation.

---

## 11. Reputation System *(future)*

### 11.1 Faction Reputation

The player has a reputation score with each of **six factions**. Reputation is tracked on a numerical scale (e.g., -100 to +100):

| Range | Standing | Effect |
|---|---|---|
| -100 to -60 | **Hostile** | Faction attacks on sight. Settlements refuse docking. |
| -59 to -20 | **Unfriendly** | Faction patrols may attack. Settlements charge premium prices (+50%). |
| -19 to +19 | **Neutral** | Default state. Normal interactions. |
| +20 to +59 | **Friendly** | Settlements offer discounts (-15%). Access to better bounties/missions. |
| +60 to +100 | **Allied** | Settlements offer large discounts (-30%). Exclusive ships/upgrades available. Faction patrols may assist you in combat. |

### 11.2 Reputation Changes

| Action | Rep Change |
|---|---|
| Destroy scavenger ships near independent settlements | +Settlements, -Scavenger Clans |
| Trade at a settlement | Small + with that settlement's faction |
| Complete bounty for a faction | Moderate + with that faction |
| Attack a faction's ships | Large - with that faction |
| Help a faction in a random encounter | Moderate + with that faction |
| Carry contraband to a settlement | Moderate - if caught |
| Deliver Concord artifacts to Zealots | Moderate + Zealots, Moderate - Monastic Orders |
| Deliver tech/data cores to Monastic Orders | Moderate + Monastic Orders, Moderate - Zealots |

### 11.3 Factions for Reputation

- **Settlements** — Most human settlements and trade hubs. The "default" friendly faction. Independent communities trying to survive.
- **Scavenger Clans** — Player can befriend the clans, gaining access to scavenger ports and black market goods — but at the cost of settlement rep.
- **Concord Remnants** — Initially hostile. Possible (difficult) path to neutral/friendly through specific story actions.
- **Monastic Orders** — Tech-monks who guard pre-Exile knowledge in sealed archives. Feared and respected. They maintain their own stations and trade in rare tech. Gaining their trust requires delivering valuable tech and data cores, and proving you won't misuse what they share. Allied status grants access to forbidden archives and the most advanced (non-AI) upgrades in the system.
- **Communes** — Cooperative agricultural and industrial communities scattered across Tyr's more habitable moons. They share settlement stations rather than maintaining their own, but have a distinct reputation track. They value self-sufficiency, mutual aid, and distrust anyone who profits from war. Reputation is earned through trade, deliveries, and non-violent problem-solving. High commune rep unlocks story content and favorable trade terms at commune-affiliated settlements.
- **Zealots** — A sect that reveres the Concord remnants as divine — the last echo of a higher intelligence that tried to save humanity from itself. They maintain shrines on the edges of Concord space, offer unique services related to Concord technology, and pay premium prices for Concord artifacts. Dangerous allies: their faith makes them unpredictable, and their willingness to interface with Concord tech puts everyone nearby at risk. Zealot and Monastic Orders are ideologically opposed — gaining reputation with one costs reputation with the other.

Void fauna do not have reputation — they are always aggressive.

---

## 12. Missions & Story Threads

### 12.1 Bounty Board Missions (Procedural)

Generated dynamically. Pulled from templates and filled with appropriate targets:

- **Patrol missions:** "Destroy 3 scavenger skiffs near Keelbreak." — Rewards scrap.
- **Elimination missions:** "Hunt down [Named Scavenger] last seen near [location]." — Higher reward.
- **Escort missions (future):** "Protect NPC convoy from A to B." — Reward based on survival.
- **Salvage missions:** "Recover black box from derelict in the Boneyards." — Reward + lore.

### 12.2 Story Threads (Hand-Authored, Discoverable)

Story threads are **not forced** on the player. They are discovered by visiting specific locations, talking to NPCs at certain settlements, or defeating certain bosses. Each thread is a short chain of events (3-5 steps) that reveals lore and leads to a unique reward.

#### Example Story Threads:

**"The Warlord's Compact"**
- Hear rumors at settlements about Dread Captain Voss attempting to unify the scavenger clans — not into a pirate empire, but into something that might actually protect the outer settlements from Concord incursions.
- Discover a scavenger chart pointing to his hideout.
- Fight through his lieutenants — or negotiate.
- Confront Voss. He offers a choice: join his compact and gain scavenger allies (at the cost of settlement trust), destroy him and scatter the clans, or broker a fragile truce between the clans and the inner settlements.
- Reward: Voss's unique flagship (capturable), large scrap bounty, scavenger rep shift. The choice shapes the balance of power in the system.

**"The Sleep Directive"**
- Pick up a fragmented Concord transmission while exploring the Ashveil nebula — not a distress signal, but a directive. The words are old, pre-Exodus: "Compliance is compassion. Resistance is suffering."
- Follow signal fragments across several locations, each guarded by increasingly aggressive Concord patrols.
- Discover that a dormant Concord shard is attempting to re-initiate the Sleep Directive in the Tyr system — the same program that once lulled billions into permanent stasis in the name of peace.
- Choice: help the shard activate (it promises an end to suffering), destroy the signal source, or deliver the shard to the Monastic Orders for study (they may be able to learn from it without activating it — or they may not).
- Reward: Unique Concord tech upgrade, Concord rep shift, lore that reframes the player's understanding of the Exodus.

**"The First Inhabitants"**
- Hear legends at remote settlements about a massive creature in the deepest nebula — something older than the arkships.
- Find clues from derelicts of ships that tried to hunt it.
- Locate and confront The Hollow Mind.
- Discovery: the void fauna may not be indigenous at all — they may be Concord-engineered biological quarantine measures, seeded in the Tyr system long before the Exodus to guard something buried deep. What that something is remains unclear.
- Reward: Exotic biological materials worth massive scrap value, unique ship component, and a question that changes how the player sees the system.

### 12.3 Story Data Format

Story threads are defined in JavaScript files (`stories/scavenger_warlord.js`) that export a plain object specifying trigger conditions, dialogue/text, and outcomes:

Each story thread file exports an object with an id, display name, and an array of steps. Each step defines a trigger condition (e.g., docking at a specific station with a minimum kill count), the text shown to the player, and an outcome (e.g., unlocking a map marker or setting a story flag).

---

## 13. Game Manager & Spawning

### 13.1 Game Manager

The `GameManager` is the top-level controller. It manages:

- **Game state:** Current mode (playing, docked, paused, game over).
- **Entity registry:** All active ships, projectiles, loot, effects.
- **Spawn system:** Creates and destroys entities based on map data and player location.
- **Save/Load:** Serializes game state to localStorage on dock, deserializes on load.
- **Difficulty scaling:** Enemy composition and aggression can scale with player progression (scrap earned, enemies killed, etc.).

### 13.2 Spawning System

Enemies are not all loaded at once. The spawn system manages entity lifecycle:

- **Patrol spawns:** When the player enters a faction zone, patrol fleets are spawned at the zone edges and given patrol routes. When the player leaves the zone, distant patrols are despawned.
- **Ambient spawns:** Derelicts, debris field contents, and ambient creatures are spawned when the player approaches and persist until the player moves far enough away.
- **Persistent spawns:** Bosses, story-related entities, and settlements are always present in the entity registry (or spawned on first approach and flagged as persistent).
- **Spawn cooldowns:** After destroying a patrol in a zone, there's a cooldown before new patrols spawn. This prevents infinite farming but still replenishes content.

Each tick, the spawn manager checks every faction zone. If the player is within a zone's radius (plus a buffer), it ensures the appropriate patrol fleet exists; if the player has moved beyond that range, it despawns distant patrols to keep entity counts manageable.

---

## 14. UI & HUD

### 14.1 In-Game HUD (Canvas Overlay)

The HUD is rendered as part of the Canvas draw loop, on top of the game world. The aesthetic should evoke analog instrumentation — CRT-style text rendering, gauge-like indicators, and a slightly warm phosphor glow on readouts.

**Top-Left: Player Status**
- **Square Status Box** (90×90px): 4 arc segments around the border (F=front/top, A=aft/bottom, P=port/left, S=starboard/right). Each segment fills proportionally to arc armor — GREEN → AMBER → RED → VERY_DIM as armor depletes. Flashes WHITE for 150ms on hit. Center fill = hull integrity (bottom-to-top, color-coded).
- **Integrity row** below box: `[R]` `[E]` `[S]` (reactor/engine/sensor). Normal when full, RED when <50%, flickers when <25%.
- **Secondary ammo** (if equipped): `RKT` label + pip row (MAGENTA). Shows `...` on cooldown.
- Fuel bar (AMBER), Cargo bar (BLUE/RED), Scrap readout (AMBER gear icon).

**Top-Right: Cargo**
- Cargo: used/total capacity.

**Bottom-Center: Throttle Indicator**
- Visual throttle gauge showing current speed level (Stop / Slow / Half / Full / Flank).
- Numeric speed readout.

**Bottom-Right: Minimap**
- Circular minimap showing nearby area.
- Color-coded dots: blue (player), red (enemies), white (settlements), yellow (derelicts/loot), green (moons), purple (wormholes).
- In nebulae, minimap range shrinks and becomes noisy/staticky.
- Near Concord ruins, faint static and phantom contacts may appear on the minimap — sensor ghosts from dormant systems.

**Context Prompts**
- "Press E to Dock" near settlements.
- "Press E to Salvage" near derelicts.
- "Press E to Enter Wormhole" near wormholes.
- "Press R to Repair" when stopped with damage and scrap available.

### 14.2 Station Menus

When docked, a **semi-transparent overlay** covers the game view. Menu panels are rendered in Canvas or as DOM overlays (DOM may be simpler for text-heavy menus).

The station menu has tabs for each available service: Trade, Services (repairs/refuel), Bounties. Each tab shows relevant information and options. Simple list-based layouts with clear scrap pricing.

### 14.3 Full Map View (M Key)

Pressing M shows the entire starmap zoomed out. Shows:
- All discovered settlements, moons, and points of interest as icons.
- Faction territory borders (colored overlay zones).
- Player position.
- Known wormhole connections (drawn as dotted lines).
- Any active mission/bounty markers.

### 14.4 Pause Menu (Esc)

- Resume
- Load Last Save
- Controls Reference
- Quit to Title

### 14.5 Game Over Screen

When the flagship is destroyed:
- Screen fades to black/red.
- "Your ship has been destroyed" with stats: time survived, scrap earned, ships destroyed, farthest distance explored.
- Options: Load Last Save, New Game.

---

## 15. Audio (Stretch Goal)

Audio is a nice-to-have for the prototype. If implemented, use the **Web Audio API**:

- Procedural engine hum (oscillator that changes pitch with throttle).
- Weapon fire sounds (short generated tones).
- Explosion sounds (noise burst + low frequency rumble).
- Ambient space background (very low filtered noise).
- UI click/confirm sounds.

All audio procedurally generated — no audio files needed. Consistent with the zero-external-assets philosophy.

---

## 16. Saving & Loading

### 16.1 Auto-Save at Settlements

When the player docks at any settlement, the game state is serialized to `localStorage`:

The save object includes a schema version, timestamp, and two top-level sections. The `player` section stores scrap, fuel, the serialized ship state, cargo by commodity, discovered locations, active and completed story steps, and current bounties. The `world` section stores destroyed boss IDs, story flags, and spawn cooldown timers per zone. The whole object is JSON-serialized into a single `localStorage` key.

### 16.2 Load

On game start, check for existing save. If found, offer "Continue" vs "New Game." Loading restores all state and places the player at the settlement where they last saved.

---

## 17. Technical Architecture

### 17.1 Project Structure

The project root contains `index.html` and a `js/` directory. Core systems live directly in `js/` (game.js, loop.js, input.js, camera.js, renderer.js, physics.js, particles.js, hud.js, minimap.js, save.js, spawner.js, loot.js). Subdirectories group: `entities/` (base entity, ship, projectile, station, planet, derelict, wormhole, lootDrop), `ships/player/` (flagship, gunship, missile_frigate, carrier, cargo_hauler, scout_corvette) and `ships/fighters/`, `enemies/` split into `scavengers/`, `fauna/`, and `concord/` subfolders each containing unit and boss files, `weapons/` (base class plus one file per weapon type), `ai/` (raiderAI.js), `economy/` (trading, commodities, reputation), `story/` (storyManager, a `threads/` subfolder with one file per thread, bountyGenerator), `ui/` (stationScreen, mapView, pauseMenu, gameOver, titleScreen), and `data/` (map.js).

### 17.2 Core Architecture Principles

**Entity-Component Pattern (Simplified)**

All game objects inherit from a base `Entity` class that provides: position, velocity, rotation, update(), render(), and collision bounds. Ships extend this with health, weapons, and behavior. This keeps the hierarchy flat and manageable.

The base `Entity` class holds position (x, y), velocity (vx, vy), rotation, and an active flag. Subclasses override `update(dt)`, `render(ctx, camera)`, and `getBounds()` to implement their specific behavior and collision shape.

**Game Loop**

Fixed-timestep with variable rendering:

The loop runs at a fixed 60-tick-per-second update rate using an accumulator: each frame, elapsed real time is added to the accumulator and consumed in fixed-duration simulation steps, preventing the spiral-of-death problem. Rendering runs at the display's native frame rate after all pending ticks are consumed.

**Collision Detection**

Use spatial hashing or a simple grid for broad-phase collision. Ships use circular bounding volumes for collision checks. Projectiles use point-vs-circle or line-segment-vs-circle tests.

**Camera**

The camera follows the flagship with slight smoothing (lerp toward flagship position). The camera defines a viewport that determines what to render. Entities outside the viewport are skipped during rendering (culling).

### 17.3 Module Loading

Use ES6 modules (`import`/`export`). The `index.html` loads `main.js` as a module entry point. All ship definitions, weapon definitions, and behaviors are imported dynamically or registered with a factory/registry pattern:

Ship types are registered by string key with a central `ShipRegistry`. Spawning any ship type requires only calling `ShipRegistry.create(key, x, y)` — adding a new ship type means creating its file and registering it, with no changes to core systems.

This makes adding new ship types trivial: create the file, define the ship, register it.

### 17.4 Performance Considerations

- **Object pooling** for projectiles, particles, and fighters. Pre-allocate arrays, recycle dead objects.
- **Spatial culling** — only update/render entities within a generous radius of the camera.
- **Draw call batching** — group similar entities where possible.
- **Minimap** renders at lower frequency (every 5-10 frames) since it doesn't need 60fps updates.

---

## 18. Gravewake — The Only Zone (Current Scope)

> The map is a single finite zone: the Gravewake ship graveyard in high orbit above Pale.
> All old "galaxy" content (Keelbreak, Crucible, Thornwick, small planet icons) removed.

### 18.0 Scale Law

**1 world unit = 1 screen pixel. No zoom.** Player ship ~30px. Screen ~1920×1080 wu. All terrain drawn at true navigational scale. "2×2 screens" ≈ 3840×2160 wu.

### 18.1 Map Dimensions

- Full map: **18000×10000**. Player enters west at (2000,5000). The Coil hub at (13000,4500).
- Test map: **8000×5000**. Player at (600,2500). The Coil at (5000,1800).

### 18.2 Static Terrain Entities

- **ArkshipSpine** (`js/world/arkshipSpine.js`) — Wireframe structural beam, 3500–6000u long, 175–300u wide. Outer hull outline + longitudinal spine + vertical ribs (every 120u) + diagonal X-bracing per section.
- **DebrisCloud** (`js/world/debrisCloud.js`) — Dense wreckage patch. `spreadRadius` 680–760u, `fragmentCount` 42–50. ~13 instances form the **Wall of Wrecks** with 2 trade lane gaps.

### 18.3 The Coil Station

**The Coil** (`js/world/coilStation.js`) is a massive static terrain structure at (13000,4500).
- Span: ~3750 wide × ~1800 tall (~2×2 screens). `dockingRadius: 2400`.
- **Districts (local coords):** Port Freight Deck/MARKET (-1850 to -600), Central Hub/THE PITS (-600 to +280), Starboard Shipyard Wing (+280 to +950), The Vault (+950 to +1900), North Market Annex/BAZAAR (-1600 to -700 north), South Shipyard Annex, Crane Tower A (860u tall) + Tower B + Crane Boom.
- **Visual:** Hull fills (amber-tinted dark), amber outlines (Vault 2.5px heavy), interior ribs/partitions, window strips, antennae, comms dish, Vault cross-bracing, guard posts, 3+2 open docking bay notches, pulsing approach lights.
- Map uses `renderer: 'coil'` flag. `getBounds()` radius 2200.

### 18.4 Planet Pale

Pale renders as a background element in `Renderer._renderPale()`, not as an entity.
- Full map: center (9000,22000), radius 14000 — only curved limb visible from playspace.
- Renders: atmospheric halo rings, dim planet fill, cloud band striations, bright limb outline.
- Map data: `background: [{ type: 'pale', ... }]`. Canvas clips off-screen arc automatically.

### 18.5 Atmosphere Layer

`Renderer._renderGravewakeAtmosphere()` — 300 parallax micro-debris fragments, fade in over 1000u inside zone boundary.

### 18.6 Phase 2+ (Planned)

- Trade Convoys + Militia Patrols on Trade Lanes
- Grave-Clan lurker AI hiding behind Spines
- Dormant Ark-Modules with Surgical Extraction
- Black Market Relay buoy

---

## Appendix A: Glossary

- **Tyr System:** The binary star system where humanity settled after the Exodus from Sol. A yellow dwarf and red companion orbited by habitable moons, debris fields, and radiation nebulae.
- **Afterlight Era:** The current historical period (2420-present), defined by fragmented settlements, salvage economies, and the lingering presence of Concord remnants.
- **Concord:** The collective of value-shard AIs created after the Praxis collapse. Originally designed to guide humanity, they eventually imposed the Sleep Directive and warred with resisters. Fragmented remnants now drift through the Tyr system.
- **Arkship:** The massive colony ships that carried survivors from Sol to Tyr. Most crash-landed and now serve as the structural foundations of settlements.
- **Settlement:** A human habitation in the Tyr system, typically built from grounded arkship sections. The primary hub for trade and repair.
- **Scavenger Clan:** Loose affiliations of raiders and salvagers who prey on trade routes. Desperate rather than evil — they raid because survival demands it.
- **Monastic Order:** Tech-monk sects that guard pre-Exile knowledge in sealed archives. They trade in rare tech and maintain their own stations.
- **Commune:** Cooperative agricultural and industrial communities. They value self-sufficiency and mutual aid.
- **Zealot:** A sect that worships Concord remnants as divine. They maintain shrines near Concord space and trade in Concord artifacts.
- **Void Fauna:** Indigenous organisms of the Tyr system, evolved in radiation-soaked environments. Possibly Concord-engineered.
- **Flagship:** The player's directly controlled ship. Its destruction ends the game.
- **Scrap:** The universal currency. Earned through combat, salvage, and trade.
- **Throttle:** The persistent speed setting. Increases/decreases in steps.
- **Armor:** Outer damage layer. Repairable in the field by pressing R while stopped (costs scrap).
- **Hull:** Inner damage layer. Causes system degradation. Repairable only at stations (costs scrap).
- **Behavior:** The AI script that controls a non-player ship's autonomous actions.
- **Faction Zone:** A region of the map dominated by a particular enemy faction.
- **Story Thread:** An optional, discoverable narrative chain found through exploration.
- **Derelict:** An abandoned ship or arkship fragment on the map that can be salvaged for loot.

---

*This specification is designed to be fed to an AI coding assistant (Claude Code) for implementation. Each section is self-contained enough to be referenced independently. The modular architecture ensures that adding new ships, enemies, weapons, upgrades, or map content requires only creating a new file and registering it — no modification of core systems required.*
