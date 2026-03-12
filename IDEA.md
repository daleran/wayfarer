# IDEA.md — Feature Ideas & Concepts

Raw concepts under consideration. Not yet planned for implementation. Ideas move to `NEXT.md` when prioritized for a build session.

**Next available code: CA**

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
| BZ | Systemic Narrative Engine | Narrative |

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
