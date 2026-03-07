# Wayfarer — Game Design Specification

> **Title:** Wayfarer
> **Genre:** Space Trading, Adventure & Combat (inspired by Sid Meier's Pirates!)
> **Tech Stack:** HTML5 Canvas, Vanilla JavaScript (ES6 modules)
> **Perspective:** Top-down 2D
> **Target:** Browser-based prototype

---

## 1. Game Overview

### 1.1 Elevator Pitch

Wayfarer is an open-world space trading and combat game played from a top-down perspective. The player commands a flagship and builds a fleet of specialized ships, exploring a vast seamless starmap. They can pursue wealth through trade, hunting bounties, salvaging wrecks, or any combination — all while navigating factional politics, discovering story threads, and surviving increasingly dangerous regions of space.

### 1.2 Core Gameplay Loop

1. **Explore** the seamless starmap, discovering stations, planets, derelicts, and hazards.
2. **Trade** commodities between planets/stations — buy low, sell high based on local supply and demand.
3. **Fight** enemy fleets, space monsters, and rogue AI in real-time combat on the overworld.
4. **Upgrade** your flagship, buy new ships for your fleet, recruit crew, and install better components.
5. **Discover** optional story threads, named bosses, and faction conflicts organically through exploration.
6. **Manage risk** — ships lost in combat are gone permanently, your flagship's destruction ends the game, and auto-saves only happen at stations.

### 1.3 Design Pillars

- **Trading and combat are equally viable paths.** A merchant fleet with escorts is just as valid as a warfleet living off bounties.
- **Permanent consequences.** Ship loss is permanent. Hull damage degrades systems. Every encounter has weight.
- **Emergent storytelling.** No forced storyline. Players discover narrative threads through exploration and faction interaction.
- **Modular architecture.** Every ship type, enemy type, and map element is defined in its own file. The map is data-driven and easily editable.

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
- All AI-controlled fleet ships **also prioritize attacking near the player's crosshair**, creating a focus-fire dynamic where the player directs the fleet's aggression by aiming.

### 2.3 Interaction

- **E** — Context-sensitive interact (dock at station when nearby, salvage derelicts, activate wormholes).
- **Tab** — Toggle fleet status overlay.
- **M** — Toggle full map view.
- **Esc** — Pause menu.

---

## 3. The Starmap

### 3.1 Structure

One large, seamless, open map. No loading screens, no sector transitions. The camera follows the player's flagship with the starmap scrolling beneath. The map is large enough that traversal feels like a journey — at full speed, crossing the entire map should take several minutes.

The map background features a **parallax starfield** (multiple layers of stars at different depths scrolling at different rates) to convey motion and depth.

### 3.2 Map Data Format

The map is defined in a **JavaScript file** (`data/map.js`) that exports a plain object specifying all fixed points of interest and spawn/patrol zones. This makes the map trivially editable — adding a new station or moving a planet is a one-line change — while keeping the project as pure ES6 modules with no JSON parsing required.

```javascript
// js/data/map.js
export default {
  mapSize: { width: 20000, height: 20000 },

  stations: [
    {
      id: 'station_haven',
      name: 'Haven Station',
      x: 2000,
      y: 3000,
      faction: 'independent',
      services: ['trade', 'repair', 'shipyard', 'crew_hire', 'bounty_board'],
      commodities: {
        food:    { supply: 'high',   basePrice: 10 },
        ore:     { supply: 'low',    basePrice: 80 },
        tech:    { supply: 'medium', basePrice: 50 },
        exotics: { supply: 'none',   basePrice: 200 },
      },
    },
  ],

  planets: [
    {
      id: 'planet_verdant',
      name: 'Verdant Prime',
      x: 2500,
      y: 3200,
      type: 'agricultural',
      storyThreads: ['lost_colony'],
      description: 'A lush world supplying food to nearby stations.',
    },
  ],

  asteroidFields: [
    {
      id: 'field_shattered',
      name: 'The Shattered Belt',
      x: 5000,
      y: 5000,
      radius: 1500,
      density: 'high',
      hazardLevel: 2,
      hiddenContent: ['derelict_003'],
    },
  ],

  nebulae: [
    {
      id: 'nebula_drift',
      name: 'The Crimson Drift',
      x: 8000,
      y: 4000,
      radius: 2000,
      effects: ['reduced_visibility', 'sensor_interference'],
      monsterSpawns: true,
    },
  ],

  derelicts: [
    {
      id: 'derelict_003',
      x: 5200,
      y: 5300,
      lootTable: 'military_salvage',
      salvageTime: 5,
      trapChance: 0.2,
    },
  ],

  wormholes: [
    { id: 'wormhole_alpha', x: 1000,  y: 9000, linkedTo: 'wormhole_beta', description: 'A shimmering tear in space.' },
    { id: 'wormhole_beta',  x: 15000, y: 2000, linkedTo: 'wormhole_alpha' },
  ],

  factionZones: [
    {
      faction: 'pirates',
      regions: [{ x: 10000, y: 10000, radius: 4000 }],
      patrolDensity: 'medium',
      patrolTypes: ['pirate_raider', 'pirate_gunship'],
    },
    {
      faction: 'monsters',
      regions: [{ x: 8000, y: 4000, radius: 3000 }],
      spawnTypes: ['void_wurm', 'crystal_swarm'],
    },
    {
      faction: 'ai_collective',
      regions: [{ x: 15000, y: 15000, radius: 5000 }],
      patrolDensity: 'high',
      patrolTypes: ['ai_sentinel', 'ai_dreadnought'],
    },
  ],

  bossSpawns: [
    {
      id: 'boss_pirate_king',
      name: 'Dread Captain Voss',
      faction: 'pirates',
      x: 11000,
      y: 11000,
      shipType: 'pirate_flagship',
      fleetComp: ['pirate_gunship', 'pirate_gunship', 'pirate_raider', 'pirate_raider'],
      lootTable: 'boss_pirate',
      storyThread: 'pirate_king',
    },
  ],
};
```

### 3.3 Points of Interest

| Type | Gameplay Function |
|---|---|
| **Space Stations** | Dock to trade commodities, buy/sell ships, repair hull, hire crew, access bounty board, auto-save |
| **Planets** | Story events, missions, unique trade goods, lore/worldbuilding text |
| **Asteroid Fields** | Navigation hazards (asteroids damage ships on collision), mineable for ore, hide derelicts and ambushes |
| **Nebulae** | Reduce visibility radius, interfere with minimap/sensors, home to space monsters |
| **Derelict Ships** | Stop and salvage (takes time, leaves you vulnerable). Loot varies: cargo, credits, rare components, or traps |
| **Wormholes** | Paired fast-travel points. Fly into one, emerge at its partner across the map |

### 3.4 Map Rendering

The map uses **layered rendering** for depth:

1. **Background layer** — Parallax starfield (3 layers of scattered dots at different scroll speeds)
2. **Nebula layer** — Large semi-transparent colored cloud shapes (procedural, using radial gradients and noise)
3. **Asteroid layer** — Procedurally placed polygon rocks within defined field regions
4. **Entity layer** — Ships, stations, planets, derelicts, loot drops
5. **Effect layer** — Weapon fire, explosions, engine trails, shield flashes
6. **UI layer** — HUD, minimap, menus (rendered on top of everything)

---

## 4. Ship System

### 4.1 Ship Stats

Every ship (player and enemy) shares a common stat model:

```javascript
{
  // Identity
  id: "gunship_mk1",
  name: "Ironclad Gunship",
  class: "gunship",        // gunship | frigate | carrier | cargo | fighter | flagship
  faction: "player",       // player | pirate | monster | ai_collective

  // Defense
  armorMax: 100,           // Outer layer, repairable by crew during combat
  armorCurrent: 100,
  hullMax: 200,            // Inner layer, only properly repairable at stations
  hullCurrent: 200,

  // Movement
  speedMax: 120,           // Max pixels/sec
  acceleration: 30,        // Pixels/sec^2
  turnRate: 2.5,           // Radians/sec
  throttleLevels: 5,       // Number of discrete speed settings

  // Crew
  crewMax: 30,
  crewCurrent: 30,
  crewRepairRate: 0.5,     // Armor points repaired per second per crew member (scaled)

  // Cargo
  cargoCapacity: 20,       // Units of cargo space

  // Weapons (array of weapon slot definitions)
  weapons: [
    { type: "turret_laser", slot: "primary", mountX: 0, mountY: -10 },
    { type: "turret_laser", slot: "primary", mountX: 0, mountY: 10 }
  ],

  // Upgrade slots
  upgrades: {
    weapons: null,          // Installed upgrade or null
    defense: null,
    engines: null,
    crew: null
  },

  // Visual
  renderData: { /* see Section 7 */ },

  // AI behavior (for non-flagship fleet ships and enemies)
  behaviorType: "brawler"  // brawler | kiter | carrier_ai | flee | swarm | ambush | etc.
}
```

### 4.2 Player Ship Types (Prototype: 6 Types)

Each ship type is defined in its own JS file (e.g., `ships/player/gunship.js`).

#### Flagship (Starting Ship)
- **Role:** The player's directly-controlled ship. Balanced stats.
- **Stats:** Medium armor, medium hull, medium speed, 2 primary weapon turrets, moderate cargo.
- **Notes:** If this ship is destroyed, the game ends. Can be upgraded heavily.

#### Gunship
- **Role:** Frontline brawler. High survivability, close-range damage.
- **AI Behavior:** `brawler` — Stays close to flagship, charges toward enemies near the crosshair, fights at close range.
- **Stats:** High armor, high hull, slow speed, slow turn rate. 2-4 short-range rapid-fire turrets. Low cargo.

#### Missile Frigate
- **Role:** Long-range fire support. Fragile but deadly.
- **AI Behavior:** `kiter` — Maintains distance from enemies, orbits at max weapon range, fires missiles toward crosshair target.
- **Stats:** Low armor, low hull, medium speed, fast turn rate. 1-2 missile launchers (slow fire rate, high damage, homing). No cargo.

#### Carrier
- **Role:** Launches fighter drones. Force multiplier.
- **AI Behavior:** `carrier_ai` — Stays at safe distance behind flagship, continuously launches and manages fighter swarms.
- **Stats:** Medium armor, high hull, slow speed. No direct weapons. Launches 4-8 fighters. Low cargo.
- **Special:** Fighters are autonomous short-lived units that swarm the crosshair target, deal light damage, and return to the carrier to refuel/repair.

#### Cargo Hauler
- **Role:** Expands fleet cargo capacity. Essential for trading playstyle.
- **AI Behavior:** `flee` — Stays far behind the fleet, runs away from enemies, never engages in combat.
- **Stats:** Low armor, medium hull, very slow speed. No weapons. Very high cargo capacity.

#### Scout Corvette
- **Role:** Fast reconnaissance and flanking.
- **AI Behavior:** `flanker` — Circles around enemies at high speed, harasses from the sides, draws fire away from heavier ships.
- **Stats:** Very low armor, low hull, very fast speed, fast turn rate. 1 light turret. Small cargo.

### 4.3 Damage System

#### Armor (Outer Layer)
- Absorbs incoming damage first.
- **Repairable during combat** by crew at a rate proportional to crew count and crew skill.
- When armor reaches 0, all further damage passes through to hull.
- Armor repair is slow enough that it can't keep up with focused fire, but it recovers between engagements.

#### Hull (Inner Layer)
- Represents structural integrity.
- **NOT repairable during combat.** Must dock at a station and pay credits for repairs.
- **System degradation:** As hull drops, ship systems begin to malfunction:

| Hull % | Degradation Effects |
|---|---|
| 75% | Occasional minor flicker (cosmetic only) |
| 50% | Engines sputter — random brief speed drops. Turrets occasionally slow their rotation. |
| 30% | Engines frequently cut out (1-2 sec stalls). Weapons misfire (shots fail ~20% of the time). Turn rate reduced. |
| 15% | Engines barely functional (constant flickering, half max speed). Weapons misfire ~40%. Possible loss of one weapon entirely. |
| 5% | Ship is limping. Minimal thrust, most weapons offline. Visually sparking, venting gas. |
| 0% | Ship destroyed. Explosion animation. Permanent loss. |

These degradation thresholds apply to ALL ships — player, fleet, and enemy. A badly damaged pirate ship is just as crippled.

#### Visual Damage Feedback
- Ships display increasing visual damage: small sparks → trailing smoke/particles → hull breach venting → fire/electrical arcs.
- Engine glow dims and flickers as engines degrade.
- Weapon turrets visibly jam and stutter.

### 4.4 Crew System

Crew is a numerical resource tracked per ship.

- **Recruitment:** Hire crew at stations. Costs credits. Different stations have different crew availability.
- **Crew effects:**
  - **Armor repair rate** scales with crew count. More crew = faster mid-combat armor patching.
  - **System recovery:** Higher crew can partially mitigate hull degradation effects (slightly fewer misfires, slightly less engine stalling).
  - **Boarding** (future feature): Crew count determines boarding combat strength.
- **Crew loss:** Hull breaches (hull damage events) can kill crew members. Crew do NOT regenerate — must be replaced at stations.
- **Minimum crew:** Ships with very low crew (below 25% of max) suffer severe penalties to all operations — even a structurally sound ship is nearly useless without hands to run it.

---

## 5. Fleet System

### 5.1 Fleet Composition

The player's fleet is the collection of all ships they own, led by the flagship. Fleet ships follow the flagship on the overworld and fight alongside it in combat.

- **Fleet limit:** Maximum of 6-8 ships (including flagship). This is a balance lever — can be adjusted or made upgradeable.
- **Fleet movement:** All ships in the fleet match the flagship's throttle setting. Slower ships may lag behind at high throttle. The fleet moves as a loose formation, not a rigid block.

### 5.2 Fleet AI Behaviors

Each ship type has a **default behavior** that governs its autonomous actions in combat. Behaviors are defined per-ship-type in their respective JS files.

#### Behavior: `brawler` (Gunships)
- Advance toward enemies nearest to the player's crosshair.
- Close to short range and circle-strafe.
- Prefer the target the player is aiming at.
- Absorb damage for more fragile ships by staying in front.

#### Behavior: `kiter` (Missile Frigates)
- Maintain a standoff distance from the nearest threat.
- Orbit at maximum weapon range.
- Fire at the crosshair target area.
- Retreat if enemies close distance.

#### Behavior: `carrier_ai` (Carriers)
- Stay behind the flagship at a safe distance.
- Continuously launch fighters up to the max count.
- Fighters swarm toward the crosshair target.
- If threatened directly, attempt to move away from danger.

#### Behavior: `flee` (Cargo Haulers)
- Always stay at the rear of the formation.
- If combat begins, move directly away from the nearest enemy.
- Never fire weapons (cargo ships have none).
- Top priority: survival.

#### Behavior: `flanker` (Scout Corvettes)
- Use speed to circle around to the side/rear of the crosshair target.
- Make fast attack runs, then pull away.
- Avoid sustained engagements — hit and run.

### 5.3 Formation (Non-Combat)

When cruising the overworld outside of combat, fleet ships arrange themselves in a role-based formation around the flagship:

- Gunships: flanking positions, slightly ahead.
- Frigates: behind and to the sides.
- Carriers: directly behind.
- Cargo haulers: center rear, protected.
- Scouts: far flanks or ahead as point.

Formation is loose and organic — ships drift into approximate positions, not rigid grid-locked.

---

## 6. Combat

### 6.1 Overview

Combat occurs in real-time on the overworld map. There is no transition to a separate screen. When the player's fleet comes within engagement range of hostile entities, combat simply begins. Enemies and the player shoot at each other, ships maneuver according to their AI behavior, and it ends when one side is destroyed or flees.

### 6.2 Engagement Flow

1. **Detection:** Enemies appear on the minimap when within sensor range. In nebulae, sensor range is reduced.
2. **Engagement:** Combat begins when any hostile entity comes within weapon range of any fleet ship.
3. **Combat:** Real-time shooting, maneuvering, and ability use. The player directly controls flagship movement and aims weapons.
4. **Resolution:** Combat ends when all enemies in the area are destroyed or flee, or the player retreats out of range.
5. **Loot:** Destroyed enemies drop loot (floating items + salvageable wrecks).

### 6.3 Weapon Types

Defined in individual files (e.g., `weapons/turret_laser.js`).

| Weapon | Range | Fire Rate | Damage | Behavior | Ship Types |
|---|---|---|---|---|---|
| **Laser Turret** | Short-Medium | Fast | Low per shot | Rotates to track mouse cursor. Fires rapid bolts. | Flagship, Gunship, Scout |
| **Plasma Cannon** | Short | Slow | High per shot | Fixed forward arc. Devastating at close range. | Gunship |
| **Missile Launcher** | Long | Slow | High per missile | Missiles home toward cursor position. Can be dodged. Travel time is significant. | Missile Frigate |
| **Point Defense** | Very Short | Very Fast | Very Low | Auto-targets incoming missiles and fighters. Defensive weapon. | Carrier, Flagship (upgrade) |
| **Fighter Swarm** | N/A | Continuous | Low per fighter | Fighters are autonomous units launched from carriers. | Carrier |

### 6.4 Projectile Behavior

- **Laser bolts:** Fast-moving, straight-line projectiles. Short lifespan (disappear after max range).
- **Plasma shots:** Medium speed, larger projectile, slight spread/inaccuracy.
- **Missiles:** Slow launch, then accelerate. Home toward cursor target position. Can be shot down by point defense. Have a turning radius — fast ships can dodge them.
- **Fighters:** Tiny autonomous ships. Swarm toward target, fire miniature lasers, return to carrier when low on fuel. Can be destroyed by point defense or area attacks.

---

## 7. Procedural Graphics

### 7.1 Philosophy

All game graphics are **procedurally drawn using Canvas 2D API** — polygons, arcs, lines, gradients, and simple particle effects. No sprite sheets, no image files. This keeps the project dependency-free and makes adding new ship designs trivial (define shapes in code).

### 7.2 Ship Rendering

Each ship type defines a `renderData` object in its JS file that describes how to draw it:

```javascript
// Example: Gunship render data
renderData: {
  // Base hull shape (polygon points relative to center, facing "up"/north)
  hullShape: [
    { x: 0, y: -20 },   // Nose
    { x: 15, y: 10 },    // Right wing
    { x: 10, y: 18 },    // Right rear
    { x: -10, y: 18 },   // Left rear
    { x: -15, y: 10 }    // Left wing
  ],
  hullColor: "#4a7a8a",
  hullStroke: "#2a4a5a",

  // Accent details (additional shapes drawn on top)
  details: [
    { type: "rect", x: -3, y: -5, w: 6, h: 10, color: "#6aaaba" },  // Cockpit
    { type: "circle", x: 8, y: 5, r: 3, color: "#ff6644" },          // Right turret base
    { type: "circle", x: -8, y: 5, r: 3, color: "#ff6644" }          // Left turret base
  ],

  // Engine glow (drawn at rear, intensity varies with throttle)
  engines: [
    { x: 5, y: 18, radius: 4, color: "#44aaff" },
    { x: -5, y: 18, radius: 4, color: "#44aaff" }
  ],

  // Scale
  scale: 1.0,

  // Damage overlays are handled generically by the renderer based on hull %
}
```

### 7.3 Visual Elements

- **Ships:** Colored polygons with detail overlays. Engine glow pulses with throttle. Faction determines color palette (player = blue/teal, pirates = red/orange, AI = white/purple, monsters = green/organic).
- **Stations:** Larger geometric structures — hexagons, circles with extending docking arms, rotating ring sections.
- **Planets:** Large filled circles with gradient shading and simple surface detail (bands, spots, rings for gas giants).
- **Asteroids:** Irregular polygons in grey/brown tones, randomly generated within field boundaries.
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

### 8.1 Faction: Pirates

**Theme:** Lawless raiders. Disorganized but cunning.

**Territory:** Mid-map regions, especially along trade routes between stations.

**Behavior:**
- Roam in small-to-medium fleets (2-5 ships).
- Patrol trade routes looking for targets.
- Prefer to attack weaker-looking fleets (fewer ships, cargo-heavy).
- **Will flee** if outgunned or if they take heavy losses (last ship standing runs).
- Drop credits and stolen cargo when destroyed.

**Unit Types (each in its own file: `enemies/pirates/`):**

| Unit | Description |
|---|---|
| **Pirate Raider** | Fast, light ship. Hit-and-run attacks. Low armor, moderate weapons. Behavior: `flanker`. |
| **Pirate Gunship** | Heavier combat ship. Closes to brawl. Moderate armor and weapons. Behavior: `brawler`. |
| **Pirate Smuggler** | Lightly armed cargo ship. Flees combat. Drops valuable contraband. Behavior: `flee`. |

**Boss: Dread Captain Voss**
- Named boss with a powerful custom flagship and an escort fleet.
- Found deep in pirate territory.
- Drops unique loot and progresses pirate-related story thread.

### 8.2 Faction: Space Monsters

**Theme:** Alien megafauna. Territorial, primal, terrifying.

**Territory:** Nebulae, asteroid fields, deep space edges of the map.

**Behavior:**
- NOT fleet-based. Monsters are single, large, powerful entities.
- Territorial — aggressive when you enter their zone, will chase for a while, then return to their lair.
- Do not drop cargo. Drop rare biological materials (valuable trade goods/crafting components).
- Some are passive until provoked; others are immediately aggressive.

**Unit Types (`enemies/monsters/`):**

| Unit | Description |
|---|---|
| **Void Wurm** | Huge serpentine creature. High HP, charges through your fleet dealing collision damage. Slow turn rate. Weak to kiting. |
| **Crystal Swarm** | Cloud of small crystalline organisms. Individually weak but numerous. Surround and chip away at armor. Area damage is effective. |
| **Nebula Leviathan** | Massive creature that lurks in nebulae. Grabs ships with tentacles (slows them), fires bio-electric bolts. Mini-boss tier. |

**Boss: The Hollow Mind**
- Ancient alien entity at the deepest edge of monster territory.
- Multi-phase fight. Spawns minions, has devastating area attacks.
- Drops extremely valuable alien artifacts.

### 8.3 Faction: AI Collective

**Theme:** Cold, efficient, relentless machines.

**Territory:** A large zone in one corner of the map. Well-defined borders. Increasingly dangerous the deeper you go.

**Behavior:**
- Fight in coordinated formations.
- Do NOT retreat. Fight to destruction.
- Use shield-heavy, well-armored ships.
- Escalate response — destroying AI patrols causes stronger patrols to spawn.
- Highest difficulty faction. Late-game content.

**Unit Types (`enemies/ai_collective/`):**

| Unit | Description |
|---|---|
| **AI Sentinel** | Standard combat drone. Medium stats across the board. Fights in groups of 3-5. Behavior: disciplined formation shooting. |
| **AI Dreadnought** | Heavy warship. Very high armor and hull. Slow but devastating weapons. Acts as formation anchor. |
| **AI Interceptor** | Fast pursuit drone. Chases down and harasses fleeing ships. Low HP but very fast. |

**Boss: The Nexus Core**
- Massive AI command station (stationary or very slow-moving).
- Continuously spawns drones. Must be destroyed to stop the waves.
- Extremely high HP. Has powerful beam weapons.
- Destroying it cripples AI Collective presence in the area (faction story thread).

---

## 9. Economy & Trading

### 9.1 Commodity System

The game starts with **4 commodity types**, but the system is designed to easily scale by adding entries to the data files.

| Commodity | Description | Typical Sources | Typical Consumers |
|---|---|---|---|
| **Food** | Agricultural products, rations | Agricultural planets, farming stations | Mining stations, military outposts |
| **Ore** | Raw minerals and metals | Mining stations, asteroid belt outposts | Industrial planets, shipyards |
| **Tech** | Electronics, components, software | Industrial planets, research stations | Frontier stations, military outposts |
| **Exotics** | Rare alien artifacts, luxury goods, bio-samples | Monster drops, derelict salvage, remote stations | Wealthy core stations, collectors |

### 9.2 Supply & Demand Pricing

Each station/planet defines its **supply level** for each commodity:

| Supply Level | Price Modifier | Meaning |
|---|---|---|
| `surplus` | 0.5x base price | Produces this good, has excess. Cheap to buy. |
| `high` | 0.7x base price | Common here. Below average price. |
| `medium` | 1.0x base price | Normal availability. Standard price. |
| `low` | 1.5x base price | Scarce here. Above average price. |
| `deficit` | 2.0x-2.5x base price | Desperate need. Very profitable to sell here. |
| `none` | Cannot buy | Not available for purchase, but can be sold at high price. |

Players profit by buying from `surplus`/`high` sources and selling to `low`/`deficit` consumers. The map layout should create natural trade routes — agricultural planets near one cluster, mining stations near another, with dangerous space in between.

### 9.3 Dynamic Price Fluctuation (Optional Enhancement)

Prices can optionally drift over time or respond to player activity. For the prototype, **static supply/demand** per station is sufficient, with the system architected to support dynamic prices later.

### 9.4 Cargo Management

- Total fleet cargo capacity is the sum of all ships' `cargoCapacity` values.
- Cargo haulers provide the bulk of capacity. Warships carry very little.
- Cargo is fleet-wide — not tracked per-ship. If a cargo ship is destroyed, the fleet loses that capacity and any excess cargo is jettisoned (lost).
- The trade UI at stations shows all commodities, current prices, your cargo, and fleet capacity.

### 9.5 Contraband (Future Enhancement)

Some goods could be flagged as contraband at certain stations. Getting caught with contraband lowers reputation. Architecture should support this.

---

## 10. Stations & Docking

### 10.1 Docking

When the player's flagship is within docking range of a station (a defined radius), a prompt appears: "Press E to dock." Upon docking:

1. **Auto-save** triggers.
2. The game enters **Station Mode** — a menu-based overlay on top of the paused game.
3. Fleet ships visually orbit/idle near the station.

### 10.2 Station Services

Each station offers a subset of these services (defined in map data):

#### Trade Market
- Buy and sell commodities.
- Shows commodity name, station buy/sell prices, your cargo, fleet capacity.
- Simple list-based UI with quantity selection.

#### Shipyard
- Browse available ships for purchase.
- Different stations sell different ship types (frontier stations might only sell scouts and cargo haulers; military stations sell gunships and frigates).
- Shows ship stats, price, and a preview rendering.
- Sell ships from your fleet (at a loss).

#### Repair Dock
- Repair hull damage on any fleet ship. Costs credits proportional to damage.
- Repair time is instant (prototype simplification) but expensive.
- Also restores crew to surviving ships at a per-head cost.

#### Crew Recruitment
- Hire additional crew members. Cost per crew member.
- Crew availability varies by station (larger stations have more recruits).

#### Bounty Board
- Lists active bounties: target name, faction, last known location, reward.
- Bounties range from "destroy X pirate patrols" to "kill named boss."
- Completed bounties are turned in here for rewards.

#### Upgrade Shop
- Browse and install upgrades to individual ships in your fleet.
- See Section 11 for the upgrade system.

### 10.3 Station Rendering

Stations are drawn as larger geometric structures:
- **Trading Hub:** Hexagonal core with extending docking arms, blinking navigation lights.
- **Military Outpost:** Angular, aggressive shape with turret-like protrusions.
- **Mining Station:** Irregular shape with ore processing modules (conveyor-like details).
- **Research Station:** Circular with rotating ring section and antenna arrays.

Each station has a colored identifier glow matching its primary faction affiliation.

---

## 11. Upgrade System

### 11.1 Upgrade Categories

Every ship has **4 upgrade slots**, one per category. Only one upgrade can be installed per slot. Upgrades are purchased at station upgrade shops and installed on a specific ship.

#### Weapons Upgrades
| Upgrade | Effect | Cost Tier |
|---|---|---|
| Overcharged Capacitors | +20% fire rate | Medium |
| Extended Barrels | +25% weapon range | Medium |
| Auto-Targeting Suite | Turrets track faster, +15% accuracy | High |
| Heavy Munitions | +30% damage, -10% fire rate | High |

#### Defense Upgrades
| Upgrade | Effect | Cost Tier |
|---|---|---|
| Reinforced Plating | +25% max armor | Medium |
| Hull Bracing | +20% max hull | Medium |
| Reactive Armor | Reflects 10% of damage back to attacker | High |
| Emergency Bulkheads | System degradation thresholds shifted down by 15% (e.g., 50% effects don't kick in until 35%) | High |

#### Engine Upgrades
| Upgrade | Effect | Cost Tier |
|---|---|---|
| Afterburners | +20% max speed | Medium |
| Maneuvering Thrusters | +25% turn rate | Medium |
| Fuel Injectors | +30% acceleration | Medium |
| Hardened Engines | Engine degradation from hull damage reduced by 50% | High |

#### Crew Upgrades
| Upgrade | Effect | Cost Tier |
|---|---|---|
| Repair Drones | +40% armor repair rate | Medium |
| Medical Bay | Crew losses from hull breaches reduced by 50% | Medium |
| Combat Training | Crew provides better system malfunction mitigation | High |
| Extended Barracks | +30% max crew capacity | Medium |

### 11.2 Upgrade Architecture

Upgrades are defined in data files (`upgrades/weapons/overcharged_capacitors.js`, etc.) with a common interface:

```javascript
export default {
  id: "overcharged_capacitors",
  name: "Overcharged Capacitors",
  category: "weapons",
  description: "+20% fire rate for all weapons on this ship.",
  cost: 500,
  rarity: "uncommon",
  effects: {
    fireRateMultiplier: 1.2
  },
  apply(ship) { /* modify ship stats */ },
  remove(ship) { /* revert ship stats */ }
};
```

---

## 12. Reputation System

### 12.1 Faction Reputation

The player has a reputation score with each faction. Reputation is tracked on a numerical scale (e.g., -100 to +100):

| Range | Standing | Effect |
|---|---|---|
| -100 to -60 | **Hostile** | Faction attacks on sight. Stations refuse docking. |
| -59 to -20 | **Unfriendly** | Faction patrols may attack. Stations charge premium prices (+50%). |
| -19 to +19 | **Neutral** | Default state. Normal interactions. |
| +20 to +59 | **Friendly** | Stations offer discounts (-15%). Access to better bounties/missions. |
| +60 to +100 | **Allied** | Stations offer large discounts (-30%). Exclusive ships/upgrades available. Faction patrols may assist you in combat. |

### 12.2 Reputation Changes

| Action | Rep Change |
|---|---|
| Destroy pirate ships near independent stations | +Independent, -Pirates |
| Trade at a station | Small + with that station's faction |
| Complete bounty for a faction | Moderate + with that faction |
| Attack a faction's ships | Large - with that faction |
| Help a faction in a random encounter | Moderate + with that faction |
| Carry contraband to a station | Moderate - if caught |

### 12.3 Factions for Reputation

- **Independent** — Most human stations and trade hubs. The "default" friendly faction.
- **Pirates** — Player can befriend pirates, gaining access to pirate ports and black market goods — but at the cost of independent station rep.
- **AI Collective** — Initially hostile. Possible (difficult) path to neutral/friendly through specific story actions.

Monsters do not have reputation — they are always aggressive.

---

## 13. Missions & Story Threads

### 13.1 Bounty Board Missions (Procedural)

Generated dynamically. Pulled from templates and filled with appropriate targets:

- **Patrol missions:** "Destroy 3 pirate raiders near Sector X." — Rewards credits.
- **Elimination missions:** "Hunt down [Named Pirate] last seen near [location]." — Higher reward.
- **Escort missions (future):** "Protect NPC convoy from A to B." — Reward based on survival.
- **Salvage missions:** "Recover black box from derelict in [asteroid field]." — Reward + lore.

### 13.2 Story Threads (Hand-Authored, Discoverable)

Story threads are **not forced** on the player. They are discovered by visiting specific locations, talking to NPCs at certain stations, or defeating certain bosses. Each thread is a short chain of events (3-5 steps) that reveals lore and leads to a unique reward.

#### Example Story Threads:

**"The Pirate King"**
- Hear rumors at stations about Dread Captain Voss unifying the pirate clans.
- Discover a pirate chart pointing to his hideout.
- Fight through his lieutenants.
- Confront Voss in a boss battle.
- Reward: Voss's unique flagship (capturable), large credit bounty, pirate rep shift.

**"The Silent Signal"**
- Pick up a mysterious signal while exploring a nebula.
- Follow signal fragments across several locations.
- Discover the AI Collective's origin — a lost colony ship's AI that went rogue.
- Choice: help a faction of "friendly" AI or destroy the signal source.
- Reward: Unique AI tech upgrade, AI Collective rep shift, lore.

**"The Leviathan's Nest"**
- Hear legends about a massive creature in the deepest nebula.
- Find clues from derelicts of ships that tried to hunt it.
- Locate and defeat The Hollow Mind.
- Reward: Exotic biological materials worth massive credits, unique ship component.

### 13.3 Story Data Format

Story threads are defined in JavaScript files (`stories/pirate_king.js`) that export a plain object specifying trigger conditions, dialogue/text, and outcomes:

```javascript
// js/story/threads/pirate_king.js
export default {
  id: 'pirate_king',
  name: 'The Pirate King',
  steps: [
    {
      id: 'pk_step1',
      trigger: { type: 'dock_at', station: 'station_frontier_03', minPirateKills: 5 },
      text: "The barkeep leans over and whispers: 'You've been making enemies in the dark, friend. Word is Dread Captain Voss is putting a price on your head...'",
      outcome: { unlockMapMarker: 'pirate_chart_location' },
    },
  ],
};
```

---

## 14. Game Manager & Spawning

### 14.1 Game Manager

The `GameManager` is the top-level controller. It manages:

- **Game state:** Current mode (playing, docked, paused, game over).
- **Entity registry:** All active ships, projectiles, loot, effects.
- **Spawn system:** Creates and destroys entities based on map data and player location.
- **Save/Load:** Serializes game state to localStorage on dock, deserializes on load.
- **Difficulty scaling:** Enemy fleet sizes and compositions can scale with player progression (fleet value, time played, etc.).

### 14.2 Spawning System

Enemies are not all loaded at once. The spawn system manages entity lifecycle:

- **Patrol spawns:** When the player enters a faction zone, patrol fleets are spawned at the zone edges and given patrol routes. When the player leaves the zone, distant patrols are despawned.
- **Ambient spawns:** Derelicts, asteroid field contents, and ambient creatures are spawned when the player approaches and persist until the player moves far enough away.
- **Persistent spawns:** Bosses, story-related entities, and space stations are always present in the entity registry (or spawned on first approach and flagged as persistent).
- **Spawn cooldowns:** After destroying a patrol in a zone, there's a cooldown before new patrols spawn. This prevents infinite farming but still replenishes content.

```javascript
// Spawn manager pseudocode
class SpawnManager {
  update(playerPosition, deltaTime) {
    for (const zone of this.factionZones) {
      const distance = distanceTo(playerPosition, zone.center);
      if (distance < zone.radius + SPAWN_BUFFER) {
        this.ensurePatrols(zone);
      } else {
        this.despawnDistantPatrols(zone);
      }
    }
  }
}
```

---

## 15. UI & HUD

### 15.1 In-Game HUD (Canvas Overlay)

The HUD is rendered as part of the Canvas draw loop, on top of the game world.

**Top-Left: Fleet Status**
- Compact bars for each fleet ship: name, armor bar (yellow), hull bar (red), crew icon + count.
- Flagship bar is larger/highlighted.
- Ships in critical condition flash.

**Top-Right: Credits & Cargo**
- Current credits.
- Cargo: used/total capacity.

**Bottom-Center: Throttle Indicator**
- Visual throttle gauge showing current speed level (Stop / Slow / Half / Full / Flank).
- Numeric speed readout.

**Bottom-Right: Minimap**
- Circular minimap showing nearby area.
- Color-coded dots: blue (player fleet), red (enemies), white (stations), yellow (derelicts/loot), green (planets), purple (wormholes).
- In nebulae, minimap range shrinks and becomes noisy/staticky.

**Context Prompts**
- "Press E to Dock" near stations.
- "Press E to Salvage" near derelicts.
- "Press E to Enter Wormhole" near wormholes.

### 15.2 Station Menus

When docked, a **semi-transparent overlay** covers the game view. Menu panels are rendered in Canvas or as DOM overlays (DOM may be simpler for text-heavy menus).

The station menu has tabs for each available service: Trade, Shipyard, Repairs, Crew, Bounties, Upgrades. Each tab shows relevant information and options. Simple list-based layouts with clear pricing.

### 15.3 Full Map View (M Key)

Pressing M shows the entire starmap zoomed out. Shows:
- All discovered stations, planets, and points of interest as icons.
- Faction territory borders (colored overlay zones).
- Player fleet position.
- Known wormhole connections (drawn as dotted lines).
- Any active mission/bounty markers.

### 15.4 Pause Menu (Esc)

- Resume
- Load Last Save
- Controls Reference
- Quit to Title

### 15.5 Game Over Screen

When the flagship is destroyed:
- Screen fades to black/red.
- "Your fleet has been destroyed" with stats: time survived, credits earned, ships destroyed, farthest distance explored.
- Options: Load Last Save, New Game.

---

## 16. Audio (Stretch Goal)

Audio is a nice-to-have for the prototype. If implemented, use the **Web Audio API**:

- Procedural engine hum (oscillator that changes pitch with throttle).
- Weapon fire sounds (short generated tones).
- Explosion sounds (noise burst + low frequency rumble).
- Ambient space background (very low filtered noise).
- UI click/confirm sounds.

All audio procedurally generated — no audio files needed. Consistent with the zero-external-assets philosophy.

---

## 17. Saving & Loading

### 17.1 Auto-Save at Stations

When the player docks at any station, the game state is serialized to `localStorage`:

```javascript
const saveData = {
  version: 1,
  timestamp: Date.now(),
  player: {
    credits: 5000,
    reputation: { independent: 25, pirates: -10, ai_collective: 0 },
    fleet: [ /* serialized ship objects */ ],
    cargo: { food: 10, ore: 5, tech: 0, exotics: 2 },
    discoveredLocations: ["station_haven", "planet_verdant"],
    activeStorySteps: { pirate_king: "pk_step2" },
    completedBounties: ["bounty_003"],
    currentBounties: ["bounty_007"]
  },
  world: {
    destroyedBosses: ["boss_pirate_king"],
    storyFlags: { pirate_king_chart_found: true },
    spawnCooldowns: { /* zone cooldown timers */ }
  },
  dockedAt: "station_haven"
};
localStorage.setItem("wayfarerSave", JSON.stringify(saveData));
```

### 17.2 Load

On game start, check for existing save. If found, offer "Continue" vs "New Game." Loading restores all state and places the player at the station where they last saved.

---

## 18. Technical Architecture

### 18.1 Project Structure

```
wayfarer/
├── index.html                  # Entry point, canvas setup
├── css/
│   └── style.css               # Minimal CSS for canvas and DOM menus
├── js/
│   ├── main.js                 # Entry point, game loop initialization
│   ├── game.js                 # GameManager class - top level state & coordination
│   ├── loop.js                 # requestAnimationFrame loop, delta time
│   ├── input.js                # Keyboard & mouse input handler
│   ├── camera.js               # Camera follow, scroll, zoom
│   ├── renderer.js             # Master render pipeline (layers)
│   ├── physics.js              # Movement, collision detection
│   ├── particles.js            # Particle system
│   ├── hud.js                  # HUD rendering
│   ├── minimap.js              # Minimap rendering
│   ├── save.js                 # Save/Load system
│   ├── spawner.js              # Spawn manager
│   ├── loot.js                 # Loot drop & salvage system
│   │
│   ├── entities/
│   │   ├── entity.js           # Base entity class
│   │   ├── ship.js             # Base ship class (extends entity)
│   │   ├── projectile.js       # Base projectile class
│   │   ├── asteroid.js         # Asteroid entity
│   │   ├── station.js          # Station entity
│   │   ├── planet.js           # Planet entity
│   │   ├── derelict.js         # Derelict entity
│   │   ├── wormhole.js         # Wormhole entity
│   │   └── lootDrop.js         # Floating loot entity
│   │
│   ├── ships/
│   │   ├── player/
│   │   │   ├── flagship.js
│   │   │   ├── gunship.js
│   │   │   ├── missile_frigate.js
│   │   │   ├── carrier.js
│   │   │   ├── cargo_hauler.js
│   │   │   └── scout_corvette.js
│   │   └── fighters/
│   │       └── carrier_fighter.js
│   │
│   ├── enemies/
│   │   ├── pirates/
│   │   │   ├── pirate_raider.js
│   │   │   ├── pirate_gunship.js
│   │   │   ├── pirate_smuggler.js
│   │   │   └── boss_voss.js
│   │   ├── monsters/
│   │   │   ├── void_wurm.js
│   │   │   ├── crystal_swarm.js
│   │   │   ├── nebula_leviathan.js
│   │   │   └── boss_hollow_mind.js
│   │   └── ai_collective/
│   │       ├── ai_sentinel.js
│   │       ├── ai_dreadnought.js
│   │       ├── ai_interceptor.js
│   │       └── boss_nexus_core.js
│   │
│   ├── weapons/
│   │   ├── weapon.js           # Base weapon class
│   │   ├── turret_laser.js
│   │   ├── plasma_cannon.js
│   │   ├── missile_launcher.js
│   │   ├── point_defense.js
│   │   └── fighter_bay.js
│   │
│   ├── behaviors/
│   │   ├── behavior.js         # Base AI behavior
│   │   ├── brawler.js
│   │   ├── kiter.js
│   │   ├── flanker.js
│   │   ├── carrier_ai.js
│   │   ├── flee.js
│   │   ├── swarm.js            # Fighter swarm behavior
│   │   ├── patrol.js           # Enemy patrol route following
│   │   └── formation.js        # Fleet formation positioning
│   │
│   ├── upgrades/
│   │   ├── upgrade.js          # Base upgrade class
│   │   ├── weapons/
│   │   │   ├── overcharged_capacitors.js
│   │   │   ├── extended_barrels.js
│   │   │   ├── auto_targeting.js
│   │   │   └── heavy_munitions.js
│   │   ├── defense/
│   │   │   ├── reinforced_plating.js
│   │   │   ├── hull_bracing.js
│   │   │   ├── reactive_armor.js
│   │   │   └── emergency_bulkheads.js
│   │   ├── engines/
│   │   │   ├── afterburners.js
│   │   │   ├── maneuvering_thrusters.js
│   │   │   ├── fuel_injectors.js
│   │   │   └── hardened_engines.js
│   │   └── crew/
│   │       ├── repair_drones.js
│   │       ├── medical_bay.js
│   │       ├── combat_training.js
│   │       └── extended_barracks.js
│   │
│   ├── economy/
│   │   ├── trading.js          # Trade logic, price calculation
│   │   ├── commodities.js      # Commodity definitions
│   │   └── reputation.js       # Reputation tracker
│   │
│   ├── story/
│   │   ├── storyManager.js     # Tracks story progress, checks triggers
│   │   ├── threads/
│   │   │   ├── pirate_king.js
│   │   │   ├── silent_signal.js
│   │   │   └── leviathan_nest.js
│   │   └── bountyGenerator.js  # Procedural bounty creation
│   │
│   ├── ui/
│   │   ├── stationMenu.js      # Station docking UI
│   │   ├── tradeUI.js          # Trade interface
│   │   ├── shipyardUI.js       # Ship buying/selling
│   │   ├── repairUI.js         # Repair interface
│   │   ├── bountyUI.js         # Bounty board
│   │   ├── upgradeUI.js        # Upgrade shop
│   │   ├── mapView.js          # Full map overlay
│   │   ├── pauseMenu.js        # Pause screen
│   │   ├── gameOver.js         # Game over screen
│   │   └── titleScreen.js      # Title/start screen
│   │
│   └── data/
│       └── map.js              # Master map definition
│
└── README.md
```

### 18.2 Core Architecture Principles

**Entity-Component Pattern (Simplified)**

All game objects inherit from a base `Entity` class that provides: position, velocity, rotation, update(), render(), and collision bounds. Ships extend this with health, weapons, crew, and behavior. This keeps the hierarchy flat and manageable.

```javascript
// Base entity
class Entity {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.rotation = 0;
    this.active = true;
  }
  update(dt) { /* override */ }
  render(ctx, camera) { /* override */ }
  getBounds() { /* collision shape */ }
}
```

**Game Loop**

Fixed-timestep with variable rendering:

```javascript
const TICK_RATE = 60;
const TICK_DURATION = 1000 / TICK_RATE;
let accumulator = 0;

function gameLoop(timestamp) {
  const delta = timestamp - lastTimestamp;
  lastTimestamp = timestamp;
  accumulator += delta;

  while (accumulator >= TICK_DURATION) {
    game.update(TICK_DURATION / 1000);
    accumulator -= TICK_DURATION;
  }

  game.render(ctx);
  requestAnimationFrame(gameLoop);
}
```

**Collision Detection**

Use spatial hashing or a simple grid for broad-phase collision. Ships use circular bounding volumes for collision checks. Projectiles use point-vs-circle or line-segment-vs-circle tests.

**Camera**

The camera follows the flagship with slight smoothing (lerp toward flagship position). The camera defines a viewport that determines what to render. Entities outside the viewport are skipped during rendering (culling).

### 18.3 Module Loading

Use ES6 modules (`import`/`export`). The `index.html` loads `main.js` as a module entry point. All ship definitions, weapon definitions, and behaviors are imported dynamically or registered with a factory/registry pattern:

```javascript
// Ship registry pattern
import { ShipRegistry } from './ships/registry.js';
import Gunship from './ships/player/gunship.js';
import MissileFrigate from './ships/player/missile_frigate.js';

ShipRegistry.register('gunship', Gunship);
ShipRegistry.register('missile_frigate', MissileFrigate);

// Spawning a ship
const newShip = ShipRegistry.create('gunship', x, y);
```

This makes adding new ship types trivial: create the file, define the ship, register it.

### 18.4 Performance Considerations

- **Object pooling** for projectiles, particles, and fighters. Pre-allocate arrays, recycle dead objects.
- **Spatial culling** — only update/render entities within a generous radius of the camera.
- **Draw call batching** — group similar entities where possible.
- **Minimap** renders at lower frequency (every 5-10 frames) since it doesn't need 60fps updates.

---

## 19. Implementation Phases

Recommended build order for the prototype:

### Phase 1: Core Engine
- Canvas setup, game loop, camera, input handling.
- Base Entity class, Ship class.
- Flagship movement (throttle model, rotation).
- Parallax starfield background.
- Basic rendering pipeline.

### Phase 2: Combat Fundamentals
- Weapon system (laser turrets firing at mouse cursor).
- Projectile system with collision detection.
- Armor/hull damage model with system degradation.
- One enemy type (pirate raider) with basic AI.
- Ship destruction with explosion effects.
- Particle system.

### Phase 3: Fleet System
- Fleet composition (add ships to player fleet).
- Fleet AI behaviors (brawler, kiter, flee).
- Formation system for non-combat cruising.
- Crosshair-directed fleet targeting.

### Phase 4: World & Navigation
- Map loading from JSON.
- Space stations (render, docking prompt, dock).
- Planets, asteroid fields, nebulae rendering and effects.
- Minimap.
- Full map view.
- Wormholes.

### Phase 5: Economy & Stations
- Trading system (buy/sell commodities).
- Station menu UI (trade, shipyard, repair, crew hire).
- Cargo system.
- Credits.
- Price calculation based on supply/demand.

### Phase 6: Full Content
- All player ship types.
- All enemy types across three factions.
- Faction zones and patrol spawning.
- Upgrade system.
- Reputation system.
- Bounty board.
- Derelict salvaging and loot drops.

### Phase 7: Story & Polish
- Story thread system and triggers.
- Boss encounters.
- Save/load system.
- Title screen, game over screen.
- HUD polish.
- Balance tuning.
- Audio (if time permits).

---

## 20. Balance Targets (Starting Values)

These are starting points — expect tuning.

| Metric | Target |
|---|---|
| Starting credits | 500 |
| Cheapest ship (scout) | 300 credits |
| Most expensive ship (carrier) | 3000 credits |
| Basic weapon upgrade | 200-500 credits |
| Trade route profit margin | 30-80% on good routes |
| Pirate raider kill reward | 50-100 credits |
| Boss kill reward | 1000-3000 credits |
| Hull repair cost | 2 credits per HP |
| Crew hire cost | 10 credits per person |
| Flagship HP (armor + hull) | 100 armor + 200 hull |
| Gunship HP | 150 armor + 250 hull |
| Pirate raider HP | 40 armor + 60 hull |
| Laser turret DPS | ~30 damage/sec |
| Missile damage per hit | ~80 damage |
| Time to cross full map at flank speed | ~4 minutes |

---

## Appendix A: Glossary

- **Flagship:** The player's directly controlled ship. Its destruction ends the game.
- **Fleet:** All ships under the player's command, including the flagship.
- **Throttle:** The persistent speed setting. Increases/decreases in steps.
- **Armor:** Outer damage layer. Repairable by crew during combat.
- **Hull:** Inner damage layer. Causes system degradation. Repairable only at stations.
- **Behavior:** The AI script that controls a non-player ship's autonomous actions.
- **Faction Zone:** A region of the map dominated by a particular enemy faction.
- **Story Thread:** An optional, discoverable narrative chain found through exploration.
- **Derelict:** An abandoned ship on the map that can be salvaged for loot.

---

*This specification is designed to be fed to an AI coding assistant (Claude Code) for implementation. Each section is self-contained enough to be referenced independently. The modular architecture ensures that adding new ships, enemies, weapons, upgrades, or map content requires only creating a new file and registering it — no modification of core systems required.*
