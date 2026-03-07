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

## 0.1 Active Overhaul: Ship & Faction System

The core ship and location systems are currently undergoing a major expansion as detailed in `docs/ship_overhaul.md` and `docs/location_overhaul.md`. This plan includes:
- **Living Factions:** Dynamic trade lanes and station patrols.
- **New Ship Classes:** The Sledge (Cart), Ox (Hauler), Argosy (Caravel), Rainmaker (Missile Frigate), Torch (Lancer), and Hive (Carrier).
- **Procedural Ships:** Unique names, backstories, and a 15-point "Quirk" modifier system.
- **Captains:** Hireable personnel with unique traits and backgrounds.
- **World Expansion:** 15 distinct station types and landable planets with surface gameplay.

Implementation of these systems is prioritized over the legacy placeholders currently described in this spec.

---

### 1.1 Elevator Pitch

Wayfarer is an open-world space trading and combat game played from a top-down perspective, set in the Tyr binary system during the Afterlight Era. The player commands a flagship and builds a fleet of salvage-tech ships, exploring a vast seamless starmap. They can pursue wealth through trade, hunting bounties, salvaging arkship wreckage, or any combination — all while navigating factional politics between desperate scavenger clans, enigmatic Concord remnants, secretive tech-monks, and zealot cults, discovering story threads, and surviving increasingly dangerous regions of space.

### 1.2 Core Gameplay Loop

1. **Explore** the seamless starmap, discovering settlements, moons, derelicts, and hazards.
2. **Trade** commodities between moons and settlements — buy low, sell high based on local supply and demand.
3. **Fight** scavenger fleets, void fauna, and Concord remnants in real-time combat on the overworld.
4. **Upgrade** your flagship, buy new ships for your fleet, recruit crew, and install better components.
5. **Discover** optional story threads, named bosses, and faction conflicts organically through exploration.
6. **Manage risk** — ships lost in combat are gone permanently, your flagship's destruction ends the game, and auto-saves only happen at settlements.

### 1.3 Design Pillars

- **Trading and combat are equally viable paths.** A merchant fleet with escorts is just as valid as a warfleet living off bounties.
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
- All AI-controlled fleet ships **also prioritize attacking near the player's crosshair**, creating a focus-fire dynamic where the player directs the fleet's aggression by aiming.

### 2.3 Interaction

- **E** — Context-sensitive interact (dock at settlement when nearby, salvage derelicts).
- **Tab** — Toggle fleet status overlay.
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

```javascript
// js/data/map.js
export default {
  mapSize: { width: 20000, height: 20000 },

  stations: [
    {
      id: 'station_keelbreak',
      name: 'Keelbreak',
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

  moons: [
    {
      id: 'moon_thalassa',
      name: 'Thalassa',
      x: 2500,
      y: 3200,
      type: 'agricultural',
      storyThreads: ['lost_colony'],
      description: 'A brine-sea moon with dome farms and algae cultures feeding the inner settlements.',
    },
  ],

  debrisFields: [
    {
      id: 'field_boneyards',
      name: 'The Boneyards',
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
      id: 'nebula_ashveil',
      name: 'The Ashveil',
      x: 8000,
      y: 4000,
      radius: 2000,
      effects: ['reduced_visibility', 'sensor_interference'],
      faunaSpawns: true,
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

  factionZones: [
    {
      faction: 'scavengers',
      regions: [{ x: 10000, y: 10000, radius: 4000 }],
      patrolDensity: 'medium',
      patrolTypes: ['scavenger_skiff', 'scavenger_brawler'],
    },
    {
      faction: 'fauna',
      regions: [{ x: 8000, y: 4000, radius: 3000 }],
      spawnTypes: ['void_wurm', 'crystal_swarm'],
    },
    {
      faction: 'concord',
      regions: [{ x: 15000, y: 15000, radius: 5000 }],
      patrolDensity: 'high',
      patrolTypes: ['concord_sentinel', 'concord_arbiter'],
    },
  ],

  bossSpawns: [
    {
      id: 'boss_scavenger_warlord',
      name: 'Dread Captain Voss',
      faction: 'scavengers',
      x: 11000,
      y: 11000,
      shipType: 'scavenger_flagship',
      fleetComp: ['scavenger_brawler', 'scavenger_brawler', 'scavenger_skiff', 'scavenger_skiff'],
      lootTable: 'boss_scavenger',
      storyThread: 'scavenger_warlord',
    },
  ],
};
```

### 3.3 Points of Interest

| Type | Gameplay Function |
|---|---|
| **Settlements** | Dock to trade commodities, buy/sell ships, repair hull, hire crew, access bounty board, auto-save |
| **Moons** | Story events, missions, unique trade goods, lore/worldbuilding text |
| **Debris Fields / Boneyards** | Navigation hazards (wreckage damages ships on collision), salvageable for ore and components, hide derelicts and ambushes |
| **Nebulae** | Reduce visibility radius, interfere with minimap/sensors, home to void fauna |
| **Arkship Fragments / Pre-Exile Relics** | Stop and salvage (takes time, leaves you vulnerable). Loot varies: cargo, credits, rare components, or traps |

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

```javascript
{
  // Identity
  id: "gunship_mk1",
  name: "Ironclad Gunship",
  class: "gunship",        // gunship | frigate | carrier | cargo | fighter | flagship
  faction: "player",       // player | scavenger | fauna | concord

  // Defense
  armorMax: 100,           // Outer layer, repairable by crew during combat
  armorCurrent: 100,
  hullMax: 200,            // Inner layer, only properly repairable at stations
  hullCurrent: 200,

  // Movement
  speedMax: 120,           // Max pixels/sec
  acceleration: 30,        // Pixels/sec^2
  turnRate: 2.5,           // Radians/sec
  throttleLevels: 6,       // Stop, 1/4, 1/2, 3/4, Full, Flank (1.5x max speed)

  // Crew
  crewMax: 30,
  crewCurrent: 30,
  crewRepairRate: 0.15,    // Armor points repaired per second per crew member (consumes scrap)

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
- **Flavor:** A salvaged mid-weight hull, refitted with whatever the last owner could bolt on. It's ugly, it's yours, and it flies.
- **Stats:** Medium armor, medium hull, medium speed, 2 primary weapon turrets, moderate cargo.
- **Notes:** If this ship is destroyed, the game ends. Can be upgraded heavily.

#### Gunship
- **Role:** Frontline brawler. High survivability, close-range damage.
- **Flavor:** Arkship hull segments welded into a blunt fist of a ship. Built to take hits and give them back.
- **AI Behavior:** `brawler` — Stays close to flagship, charges toward enemies near the crosshair, fights at close range.
- **Stats:** High armor, high hull, slow speed, slow turn rate. 2-4 short-range rapid-fire turrets. Low cargo.

#### Missile Frigate
- **Role:** Long-range fire support. Fragile but deadly.
- **Flavor:** A spindly frame wrapped around oversized launch tubes. The crew calls it a coffin with ambition.
- **AI Behavior:** `kiter` — Maintains distance from enemies, orbits at max weapon range, fires missiles toward crosshair target.
- **Stats:** Low armor, low hull, medium speed, fast turn rate. 1-2 missile launchers (slow fire rate, high damage, homing). No cargo.

#### Carrier
- **Role:** Launches fighter drones. Force multiplier.
- **Flavor:** A converted cargo barge with a flight deck cut into its belly. The fighters are barely more than engines with guns.
- **AI Behavior:** `carrier_ai` — Stays at safe distance behind flagship, continuously launches and manages fighter swarms.
- **Stats:** Medium armor, high hull, slow speed. No direct weapons. Launches 4-8 fighters. Low cargo.
- **Special:** Fighters are autonomous short-lived units that swarm the crosshair target, deal light damage, and return to the carrier to refuel/repair.

#### Cargo Hauler
- **Role:** Expands fleet cargo capacity. Essential for trading playstyle.
- **Flavor:** A fat-bellied freighter with more hold than hull. Every hauler captain knows the prayer: "don't let them see me."
- **AI Behavior:** `flee` — Stays far behind the fleet, runs away from enemies, never engages in combat.
- **Stats:** Low armor, medium hull, very slow speed. No weapons. Very high cargo capacity.

#### Scout Corvette
- **Role:** Fast reconnaissance and flanking.
- **Flavor:** Stripped to the frame for speed. One reactor, one gun, and a pilot with more nerve than sense.
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
- **NOT repairable during combat.** Must dock at a settlement and pay credits for repairs.
- **System degradation:** As hull drops, ship systems begin to malfunction:

| Hull % | Degradation Effects |
|---|---|
| 75% | Occasional minor flicker (cosmetic only) |
| 50% | Engines sputter — random brief speed drops. Turrets occasionally slow their rotation. |
| 30% | Engines frequently cut out (1-2 sec stalls). Weapons misfire (shots fail ~20% of the time). Turn rate reduced. |
| 15% | Engines barely functional (constant flickering, half max speed). Weapons misfire ~40%. Possible loss of one weapon entirely. |
| 5% | Ship is limping. Minimal thrust, most weapons offline. Visually sparking, venting gas. |
| 0% | Ship destroyed. Explosion animation. Permanent loss. |

These degradation thresholds apply to ALL ships — player, fleet, and enemy. A badly damaged scavenger ship is just as crippled.

#### Visual Damage Feedback
- Ships display increasing visual damage: small sparks → trailing smoke/particles → hull breach venting → fire/electrical arcs.
- Engine glow dims and flickers as engines degrade.
- Weapon turrets visibly jam and stutter.

### 4.4 Crew System

Crew is a numerical resource tracked per ship. They are survivors — ex-arkship mechanics, dome farmers looking for better pay, deserters from scavenger clans, the occasional disgraced tech-monk. Every one of them has a reason for being out here.

- **Recruitment:** Hire crew at settlements. Costs credits. Different settlements have different crew availability.
- **Crew effects:**
  - **Armor repair rate** scales with crew count. More crew = faster mid-combat armor patching.
  - **System recovery:** Higher crew can partially mitigate hull degradation effects (slightly fewer misfires, slightly less engine stalling).
  - **Boarding** (future feature): Crew count determines boarding combat strength.
- **Crew loss:** Hull breaches (hull damage events) can kill crew members. Crew do NOT regenerate — must be replaced at settlements.
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

The visual style reflects the retrofuturist aesthetic of the Tyr system: CRT-style glow effects, worn and angular ship silhouettes, and a general sense of functional beauty built from scrap. Ships look simply constructed — blocky, utilitarian, and patched — not sleek or futuristic. Ship types are distinguished primarily by **size and shape** (silhouette). Color is used to indicate **relation to the player** (green = owned, amber = neutral, red = hostile, blue = friendly), not to identify ship class or faction. Non-ship entities (planets, asteroids, nebulae) may use any color that serves the aesthetic.

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
- Drop credits and stolen cargo when destroyed.

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

- Total fleet cargo capacity is the sum of all ships' `cargoCapacity` values.
- Cargo haulers provide the bulk of capacity. Warships carry very little.
- Cargo is fleet-wide — not tracked per-ship. If a cargo ship is destroyed, the fleet loses that capacity and any excess cargo is jettisoned (lost).
- The trade UI at settlements shows all commodities, current prices, your cargo, and fleet capacity.

### 9.5 Contraband

Concord artifacts and AI components are contraband at most settlements — possessing them draws suspicion and hostility from communities that remember what machine intelligence cost humanity. Getting caught with contraband lowers reputation.

**Exception:** Zealot settlements pay premium prices for Concord artifacts and data cores, viewing them as sacred relics. Monastic Order archives will also accept certain tech items at high prices, though they are more selective about what they consider worth preserving.

---

## 10. Stations & Docking

### 10.1 Docking

When the player's flagship is within docking range of a settlement (a defined radius), a prompt appears: "Press E to dock." Upon docking:

1. **Auto-save** triggers.
2. The game enters **Station Mode** — a menu-based overlay on top of the paused game.
3. Fleet ships visually orbit/idle near the settlement.

### 10.2 Station Services

Each settlement offers a subset of these services (defined in map data):

#### Trade Market
- Buy and sell commodities.
- Shows commodity name, settlement buy/sell prices, your cargo, fleet capacity.
- Simple list-based UI with quantity selection.

#### Shipyard
- Browse available ships for purchase.
- Different settlements sell different ship types (frontier settlements might only sell scouts and cargo haulers; well-established settlements sell gunships and frigates).
- Shows ship stats, price, and a preview rendering.
- Sell ships from your fleet (at a loss).

#### Repair Dock
- Repair hull damage on any fleet ship. Costs credits proportional to damage.
- Repair time is instant (prototype simplification) but expensive.
- Also restores crew to surviving ships at a per-head cost.

#### Crew Recruitment
- Hire additional crew members. Cost per crew member.
- Crew availability varies by settlement (larger settlements have more recruits).

#### Bounty Board
- Lists active bounties: target name, faction, last known location, reward.
- Bounties range from "destroy X scavenger patrols" to "kill named boss."
- Completed bounties are turned in here for rewards.

#### Upgrade Shop
- Browse and install upgrades to individual ships in your fleet.
- See Section 11 for the upgrade system.

### 10.3 Station Rendering

Settlements are drawn as larger geometric structures, reflecting the salvage-architecture aesthetic of the Tyr system:
- **Arkship Settlement:** Built from grounded arkship keel sections — hexagonal core with welded docking arms, mismatched hull plating, blinking navigation lights. The backbone of Tyr's civilization.
- **Military Outpost:** Angular, aggressive shape with turret-like protrusions. Reinforced plating and patrol berths.
- **Mining Settlement:** Irregular shape with ore processing modules (conveyor-like details). Often built into debris fields.
- **Monastic Archive:** Circular with sealed vault sections and antenna arrays. CRT-lit observation decks glow faintly. The tech-monks guard these closely.
- **Zealot Shrine:** Organic, asymmetric aesthetic with Concord iconography — geometric patterns etched into hull plating, signal arrays pointed toward Concord space. Unsettling but welcoming to those who share the faith.

Each settlement has a colored identifier glow matching its primary faction affiliation.

---

## 11. Upgrade System

### 11.1 Upgrade Categories

Every ship has **4 upgrade slots**, one per category. Only one upgrade can be installed per slot. Upgrades are purchased at settlement upgrade shops and installed on a specific ship.

#### Weapons Upgrades
| Upgrade | Effect | Cost Tier |
|---|---|---|
| Overcharged Capacitors | +20% fire rate | Medium |
| Extended Barrels | +25% weapon range | Medium |
| Auto-Targeting Suite (analog fire-control, not AI-assisted) | Turrets track faster, +15% accuracy | High |
| Heavy Munitions | +30% damage, -10% fire rate | High |

#### Defense Upgrades
| Upgrade | Effect | Cost Tier |
|---|---|---|
| Reinforced Plating (arkship-grade hull segments) | +25% max armor | Medium |
| Hull Bracing | +20% max hull | Medium |
| Reactive Armor | Reflects 10% of damage back to attacker | High |
| Emergency Bulkheads | System degradation thresholds shifted down by 15% (e.g., 50% effects don't kick in until 35%) | High |

#### Engine Upgrades
| Upgrade | Effect | Cost Tier |
|---|---|---|
| Afterburners | +20% max speed | Medium |
| Maneuvering Thrusters (cold gas, manually calibrated) | +25% turn rate | Medium |
| Fuel Injectors | +30% acceleration | Medium |
| Hardened Engines | Engine degradation from hull damage reduced by 50% | High |

#### Crew Upgrades
| Upgrade | Effect | Cost Tier |
|---|---|---|
| Repair Drones (simple mechanical, no AI) | +40% armor repair rate | Medium |
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

The player has a reputation score with each of **six factions**. Reputation is tracked on a numerical scale (e.g., -100 to +100):

| Range | Standing | Effect |
|---|---|---|
| -100 to -60 | **Hostile** | Faction attacks on sight. Settlements refuse docking. |
| -59 to -20 | **Unfriendly** | Faction patrols may attack. Settlements charge premium prices (+50%). |
| -19 to +19 | **Neutral** | Default state. Normal interactions. |
| +20 to +59 | **Friendly** | Settlements offer discounts (-15%). Access to better bounties/missions. |
| +60 to +100 | **Allied** | Settlements offer large discounts (-30%). Exclusive ships/upgrades available. Faction patrols may assist you in combat. |

### 12.2 Reputation Changes

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

### 12.3 Factions for Reputation

- **Settlements** — Most human settlements and trade hubs. The "default" friendly faction. Independent communities trying to survive.
- **Scavenger Clans** — Player can befriend the clans, gaining access to scavenger ports and black market goods — but at the cost of settlement rep.
- **Concord Remnants** — Initially hostile. Possible (difficult) path to neutral/friendly through specific story actions.
- **Monastic Orders** — Tech-monks who guard pre-Exile knowledge in sealed archives. Feared and respected. They maintain their own stations and trade in rare tech. Gaining their trust requires delivering valuable tech and data cores, and proving you won't misuse what they share. Allied status grants access to forbidden archives and the most advanced (non-AI) upgrades in the system.
- **Communes** — Cooperative agricultural and industrial communities scattered across Tyr's more habitable moons. They share settlement stations rather than maintaining their own, but have a distinct reputation track. They value self-sufficiency, mutual aid, and distrust anyone who profits from war. Reputation is earned through trade, deliveries, and non-violent problem-solving. High commune rep unlocks story content and favorable trade terms at commune-affiliated settlements.
- **Zealots** — A sect that reveres the Concord remnants as divine — the last echo of a higher intelligence that tried to save humanity from itself. They maintain shrines on the edges of Concord space, offer unique services related to Concord technology, and pay premium prices for Concord artifacts. Dangerous allies: their faith makes them unpredictable, and their willingness to interface with Concord tech puts everyone nearby at risk. Zealot and Monastic Orders are ideologically opposed — gaining reputation with one costs reputation with the other.

Void fauna do not have reputation — they are always aggressive.

---

## 13. Missions & Story Threads

### 13.1 Bounty Board Missions (Procedural)

Generated dynamically. Pulled from templates and filled with appropriate targets:

- **Patrol missions:** "Destroy 3 scavenger skiffs near Keelbreak." — Rewards credits.
- **Elimination missions:** "Hunt down [Named Scavenger] last seen near [location]." — Higher reward.
- **Escort missions (future):** "Protect NPC convoy from A to B." — Reward based on survival.
- **Salvage missions:** "Recover black box from derelict in the Boneyards." — Reward + lore.

### 13.2 Story Threads (Hand-Authored, Discoverable)

Story threads are **not forced** on the player. They are discovered by visiting specific locations, talking to NPCs at certain settlements, or defeating certain bosses. Each thread is a short chain of events (3-5 steps) that reveals lore and leads to a unique reward.

#### Example Story Threads:

**"The Warlord's Compact"**
- Hear rumors at settlements about Dread Captain Voss attempting to unify the scavenger clans — not into a pirate empire, but into something that might actually protect the outer settlements from Concord incursions.
- Discover a scavenger chart pointing to his hideout.
- Fight through his lieutenants — or negotiate.
- Confront Voss. He offers a choice: join his compact and gain scavenger allies (at the cost of settlement trust), destroy him and scatter the clans, or broker a fragile truce between the clans and the inner settlements.
- Reward: Voss's unique flagship (capturable), large credit bounty, scavenger rep shift. The choice shapes the balance of power in the system.

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
- Reward: Exotic biological materials worth massive credits, unique ship component, and a question that changes how the player sees the system.

### 13.3 Story Data Format

Story threads are defined in JavaScript files (`stories/scavenger_warlord.js`) that export a plain object specifying trigger conditions, dialogue/text, and outcomes:

```javascript
// js/story/threads/scavenger_warlord.js
export default {
  id: 'scavenger_warlord',
  name: "The Warlord's Compact",
  steps: [
    {
      id: 'sw_step1',
      trigger: { type: 'dock_at', station: 'station_frontier_03', minScavengerKills: 5 },
      text: "The barkeep leans over and whispers: 'You've been making enemies in the dark, friend. Word is Dread Captain Voss is putting a price on your head...'",
      outcome: { unlockMapMarker: 'scavenger_chart_location' },
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
- **Ambient spawns:** Derelicts, debris field contents, and ambient creatures are spawned when the player approaches and persist until the player moves far enough away.
- **Persistent spawns:** Bosses, story-related entities, and settlements are always present in the entity registry (or spawned on first approach and flagged as persistent).
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

The HUD is rendered as part of the Canvas draw loop, on top of the game world. The aesthetic should evoke analog instrumentation — CRT-style text rendering, gauge-like indicators, and a slightly warm phosphor glow on readouts.

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
- Color-coded dots: blue (player fleet), red (enemies), white (settlements), yellow (derelicts/loot), green (moons), purple (wormholes).
- In nebulae, minimap range shrinks and becomes noisy/staticky.
- Near Concord ruins, faint static and phantom contacts may appear on the minimap — sensor ghosts from dormant systems.

**Context Prompts**
- "Press E to Dock" near settlements.
- "Press E to Salvage" near derelicts.
- "Press E to Enter Wormhole" near wormholes.

### 15.2 Station Menus

When docked, a **semi-transparent overlay** covers the game view. Menu panels are rendered in Canvas or as DOM overlays (DOM may be simpler for text-heavy menus).

The station menu has tabs for each available service: Trade, Shipyard, Repairs, Crew, Bounties, Upgrades. Each tab shows relevant information and options. Simple list-based layouts with clear pricing.

### 15.3 Full Map View (M Key)

Pressing M shows the entire starmap zoomed out. Shows:
- All discovered settlements, moons, and points of interest as icons.
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

### 17.1 Auto-Save at Settlements

When the player docks at any settlement, the game state is serialized to `localStorage`:

```javascript
const saveData = {
  version: 1,
  timestamp: Date.now(),
  player: {
    credits: 5000,
    reputation: {
      settlements: 25,
      scavengers: -10,
      concord: 0,
      monastic_orders: 5,
      communes: 10,
      zealots: -5
    },
    fleet: [ /* serialized ship objects */ ],
    cargo: { food: 10, ore: 5, tech: 0, exotics: 2 },
    discoveredLocations: ["station_keelbreak", "moon_thalassa"],
    activeStorySteps: { scavenger_warlord: "sw_step2" },
    completedBounties: ["bounty_003"],
    currentBounties: ["bounty_007"]
  },
  world: {
    destroyedBosses: ["boss_scavenger_warlord"],
    storyFlags: { scavenger_warlord_chart_found: true },
    spawnCooldowns: { /* zone cooldown timers */ }
  },
  dockedAt: "station_keelbreak"
};
localStorage.setItem("wayfarerSave", JSON.stringify(saveData));
```

### 17.2 Load

On game start, check for existing save. If found, offer "Continue" vs "New Game." Loading restores all state and places the player at the settlement where they last saved.

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
│   │   ├── scavengers/
│   │   │   ├── scavenger_skiff.js
│   │   │   ├── scavenger_brawler.js
│   │   │   ├── scavenger_runner.js
│   │   │   └── boss_voss.js
│   │   ├── fauna/
│   │   │   ├── void_wurm.js
│   │   │   ├── crystal_swarm.js
│   │   │   ├── nebula_leviathan.js
│   │   │   └── boss_hollow_mind.js
│   │   └── concord/
│   │       ├── concord_sentinel.js
│   │       ├── concord_arbiter.js
│   │       ├── concord_pursuer.js
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
│   │   │   ├── scavenger_warlord.js
│   │   │   ├── sleep_directive.js
│   │   │   └── first_inhabitants.js
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
- One enemy type (scavenger skiff) with basic AI.
- Ship destruction with explosion effects.
- Particle system.

### Phase 3: Fleet System
- Fleet composition (add ships to player fleet).
- Fleet AI behaviors (brawler, kiter, flee).
- Formation system for non-combat cruising.
- Crosshair-directed fleet targeting.

### Phase 4: World & Navigation
- Map loading from data file.
- Settlements (render, docking prompt, dock).
- Moons, debris fields, nebulae rendering and effects.
- Minimap.
- Full map view.
- Wormholes.

### Phase 5: Economy & Settlements
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
- Reputation system (all six factions).
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
| Scavenger skiff kill reward | 50-100 credits |
| Boss kill reward | 1000-3000 credits |
| Hull repair cost | 2 credits per HP |
| Crew hire cost | 10 credits per person |
| Flagship HP (armor + hull) | 100 armor + 200 hull |
| Gunship HP | 150 armor + 250 hull |
| Scavenger skiff HP | 40 armor + 60 hull |
| Laser turret DPS | ~30 damage/sec |
| Missile damage per hit | ~80 damage |
| Time to cross full map at flank speed | ~4 minutes |

---

## Appendix A: Glossary

- **Tyr System:** The binary star system where humanity settled after the Exodus from Sol. A yellow dwarf and red companion orbited by habitable moons, debris fields, and radiation nebulae.
- **Afterlight Era:** The current historical period (2420-present), defined by fragmented settlements, salvage economies, and the lingering presence of Concord remnants.
- **Concord:** The collective of value-shard AIs created after the Praxis collapse. Originally designed to guide humanity, they eventually imposed the Sleep Directive and warred with resisters. Fragmented remnants now drift through the Tyr system.
- **Arkship:** The massive colony ships that carried survivors from Sol to Tyr. Most crash-landed and now serve as the structural foundations of settlements.
- **Settlement:** A human habitation in the Tyr system, typically built from grounded arkship sections. The primary hub for trade, repair, and crew recruitment.
- **Scavenger Clan:** Loose affiliations of raiders and salvagers who prey on trade routes. Desperate rather than evil — they raid because survival demands it.
- **Monastic Order:** Tech-monk sects that guard pre-Exile knowledge in sealed archives. They trade in rare tech and maintain their own stations.
- **Commune:** Cooperative agricultural and industrial communities. They value self-sufficiency and mutual aid.
- **Zealot:** A sect that worships Concord remnants as divine. They maintain shrines near Concord space and trade in Concord artifacts.
- **Void Fauna:** Indigenous organisms of the Tyr system, evolved in radiation-soaked environments. Possibly Concord-engineered.
- **Flagship:** The player's directly controlled ship. Its destruction ends the game.
- **Fleet:** All ships under the player's command, including the flagship.
- **Throttle:** The persistent speed setting. Increases/decreases in steps.
- **Armor:** Outer damage layer. Repairable by crew during combat.
- **Hull:** Inner damage layer. Causes system degradation. Repairable only at settlements.
- **Behavior:** The AI script that controls a non-player ship's autonomous actions.
- **Faction Zone:** A region of the map dominated by a particular enemy faction.
- **Story Thread:** An optional, discoverable narrative chain found through exploration.
- **Derelict:** An abandoned ship or arkship fragment on the map that can be salvaged for loot.

---

*This specification is designed to be fed to an AI coding assistant (Claude Code) for implementation. Each section is self-contained enough to be referenced independently. The modular architecture ensures that adding new ships, enemies, weapons, upgrades, or map content requires only creating a new file and registering it — no modification of core systems required.*
