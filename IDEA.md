# IDEA.md — Feature Ideas & Concepts

Raw concepts under consideration. Not yet planned for implementation. Ideas move to `NEXT.md` when prioritized for a build session.

**Next available code: BJ**

---

## Code Index

| Code | Title | Category |
|---|---|---|
| AN | Utility Modules | Modules / Equipment |
| AP | Tribute & Favor System | Economy |
| AQ | Feudal Obligations | Economy |
| AR | Black Market & Under-Barter | Economy |
| AS | Gravewake Zone Features | World / Map |
| AT | Advanced Scavenging — Multi-Stage Extraction | Scavenging |
| AU | Scavenging Minigames & Heat System | Scavenging |
| AV | Specialized Enemy Factions | AI / Enemies |
| AW | Void Fauna Expansion | AI / Enemies |
| AX | Named Bosses | AI / Enemies |
| AY | Officers System | Ship Systems |
| AZ | Quad-Arc Armor & Internal System Integrity | Ship Systems |
| BA | Story Threads & Trigger System | Narrative |
| BB | Mission & Bounty Board | Gameplay |
| BC | Full Map View | UI |
| BD | Procedural Audio | Audio |
| BE | Named NPC Ships & Persistent World Characters | AI / World |
| BF | Cloud Save System | Platform |
| BG | Module Affixes & Randomized Traits | Modules / Equipment |
| BH | Station Overhaul — Multi-Screen UI | UI |

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

### AQ: Feudal Obligations

Voluntary commitments the player can make that create meaningful risk/reward tradeoffs.

**Warden's Oath** — pledge to defend a specific station. While within its sensor range, fuel and armor repairs are free. A `[WARDEN STATUS: ACTIVE]` indicator appears on HUD. Fleeing during an attack triggers Oath-Breaker status: friendly stations refuse docking, bounty hunters intercept.

**Blood-Debts** — rescuing escape pods creates Life-Debts from the survivor's family. Debts can be spent to bypass reputation gates, get emergency repairs in hostile space, or recruit high-skill specialists.

**Patronage & Apprenticeships** — a Patron asks you to take a junior crew member into your fleet. Keep them alive through "Lessons" (combat, salvage). Reward: Master-Key ROMs — physical cartridges that unlock pre-Exile ship schematics.

**Hospitality Right (Guest-Friend)** — earn sanctuary at a station. Defensive batteries protect you within docking radius. Initiating combat inside Guest-Friend territory revokes the status immediately.

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

### AS: Gravewake Zone Features

The Gravewake orbital zone is dense with history. Several major world features belong here.

**Megastructure Terrain:**
- Arkship Spines — kilometers-long shattered structural beams as massive wireframe polygons with internal ribbing; navigation landmarks, cover from enemies
- Wall of Wrecks — dense looping belt of early colonization craft; physical chokepoints that force ships into predictable Trade Lanes
- The Frozen Fleet — cluster of pristine early colonization ships encased in hydrogen ice; rich pre-Exile tech inside, but hull damage risk and high ambush probability

**The Coil Interior Districts** (expand existing CoilStation):
- The Bazaar: black-market ROM and fenced goods trade deck
- The Shipyard: illicit ship repairs and unregulated upgrades
- The Pits: residential/cantina sector, rumor sources and faction gossip
- The Vault: heavily guarded storage hauler; Salvage Lords power base
- Salvage Lords council: volatile ruling faction; internal power struggles occasionally spill into docking bays

**Hidden POIs:**
- Voss's Waystation — fortified resupply point for Dread Captain Voss; requires high scavenger reputation or deciphered patrol routes to find; unique black-market inventory
- Black Market Relay Buoy — untraceable comms buoy; high-tier illicit bounties

---

## Scavenging

### AT: Advanced Scavenging — Multi-Stage Extraction

Scavenging high-value wrecks is a process, not a single button press. Three stages require specialized modules.

**Stage 1 — Surveying (Deep Scanner module):** Active scan pulse reveals hidden compartments, structural weak points, dormant hazards, and loot tier. Without a scanner, only surface scrap is accessible.

**Stage 2 — Breaching (Plasma Cutter / Cutting Laser module):** Standard weapons blast wrecks for Tier 1 scrap. Precision breaching with the module targets weak points to open bulkheads without destroying delicate loot. Time-based progress bar; player must stay stationary.

**Stage 3 — Extraction (Salvage Drone / Tractor Tether module):** Deploy to pull out high-value modules, data drives, or cargo pods intact.

**Derelict State Machine:** Untouched → Surveyed → Breached → Depleted. State persists per derelict; a partially breached wreck can be returned to.

**Loot Tiers:**
- Tier 1 (Surface Scrap): base metals, fuel residue — no tools needed
- Tier 2 (Breached Cargo): commodities, standard weapons, armor plating — needs breaching module
- Tier 3 (Secure Vaults): pre-Exile tech, pristine modules, unique blueprints — advanced breaching + extraction
- Tier 4 (Mainframe): lore logs, encrypted data, coordinates for hidden bases — data decryption minigame

---

### AU: Scavenging Minigames & Heat System

The risk and skill layer on top of AT's extraction framework.

**Signature / Heat Meter:** Fills while breaching. High-tier tools fill it faster. Crossing the threshold spawns an AI ambush (Grave-Clan raiders or pirate interceptors warping in to steal the claim).

**Data Decryption Minigame (Tier 4):** Time-limited code-matching sequence for mainframe access. Failure locks the drive permanently or triggers a distress beacon.

**Power Routing Minigame (Tier 3):** Frequency-matching puzzle to open secure vaults. Align ship power with the derelict's dormant grid before the connection overloads or triggers lockdown.

**Automated Defenses:** Military derelicts wake internal point-defense turrets and dormant Concord Ghost sentinels on breach. Player must disable or evade them.

**Ghost Signals:** High-value Ark-Modules emit anomalous signals when tampered with — attracting local raiders or Concord Ghosts.

---

## AI / Enemies

### AV: Specialized Enemy Factions

Four distinct enemy/neutral faction AI types not yet implemented.

**Grave-Clans (Scavenger Specialty):** Specialized Gravewake raiders adapted to dense debris. Use Lurker behavior — hide behind Arkship Spines, ambush with grapple lines and harpoons. Prefer targeting convoys. Asymmetric salvage-rigged ship designs.

**Zealot Pilgrims:** Cultist convoys seeking the oldest Concord wrecks. Neutral by default. Offer large payouts for safe escort or recovered artifacts. Shield-heavy; willing to travel through dangerous debris fields.

**Concord Ghosts:** Dormant, half-broken Concord sentinels that mindlessly repeat century-old patrol routes. Not actively hostile — unpredictable hazards to anyone who interrupts their route or tampers with Ark-Modules they guard.

**Monastic Archive Guardians:** Heavily armed ships patrolling the Thornwick Archive perimeter. Aggressive area denial — will attack anyone entering restricted space regardless of reputation.

**General AI Improvement — Enemy Retreat & Repair:** Human enemies (raiders, cultists) should flee at ~30% hull rather than fight to the death. They return to their mothership or base to repair, then re-engage. Makes factions feel persistent and dangerous. See also BE for named captains who remember the player.

---

### AW: Void Fauna Expansion

Indigenous creatures that evolved in Tyr's harsh environment. Three types beyond current fauna, each with unique spawn zones.

- **Void Wurm** — serpentine, high HP, charges the player for collision damage. Weak to kiting at max range. Body hits cause knockback. Spawn: ice belts and asteroid fields.
- **Crystal Swarm** — dozens of individually weak units that surround the target and chip armor with micro-shots. Vulnerable to AoE weapons; overwhelm point defense with numbers. Spawn: nebula edges.
- **Nebula Leviathan** — massive; grabs with tentacles to slow the player, fires bio-electric bolts. Requires sustained damage to multiple weak points. High HP, slow-moving. Spawn: deep nebulae.

---

### AX: Named Bosses

Three unique one-time boss encounters tied to story threads (see BA). Each has major loot and narrative consequences.

**Dread Captain Voss** *(Scavenger Boss)*: Warlord attempting to unify scavenger clans under one flag. Commands a powerful flagship with escort fleet. Drops his flagship (capturable) and a large scrap bounty. Tied to "The Warlord's Compact."

**The Nexus Core** *(Concord Boss)*: Dormant cognition array deep in Concord territory. Continuously spawns drones — must be destroyed to stop the waves. Extremely high HP, powerful beam weapons. Destroying it cripples local Concord presence. Tied to "The Sleep Directive."

**The Hollow Mind** *(Void Fauna Boss)*: Ancient creature at the deepest nebula edge, older than the arkships. Multi-phase: spawns Crystal Swarm minions, fires devastating area attacks. Drops exotic biological materials and a unique ship component. Revelation: void fauna may be Concord-engineered quarantine measures. Tied to "The First Inhabitants."

---

## Ship Systems

### AY: Officers System

Named individuals with unique traits and backstories assigned to ship roles — not anonymous crew counts.

Three officer roles, each boosting a different stat category:
- **Tactical Officer** — weapon accuracy, fire rate, reload speed
- **Engineering Officer** — repair rate, reactor overhaul interval, module condition recovery
- **Navigation Officer** — acceleration, top speed, sensor range

Hull class determines max officer count. Officers recruited at stations (reputation-gated), found in rescued escape pods (Blood-Debt, see AQ), or inherited through Patronage. Officers can be lost permanently if the ship is critically damaged — they are never replaced by anonymous equivalents.

---

### AZ: Quad-Arc Armor & Internal System Integrity

Replaces the current single-pool armor system with directional and internal damage models.

**Four Armor Arcs:** Front, Port, Starboard, Aft — each with its own HP value derived from the ship class base. Field repair prioritizes the most-depleted arc. Aft arc has 1.5× hull bleed-through multiplier and 50% chance to damage Engine Integrity on hit.

**Internal System Integrity:** Three systems tracked 0–100: Reactor [R], Engine [E], Sensor [S].
- Sensor damage: minimap becomes fuzzy/static; phantom contacts appear near Concord ruins
- Engine damage: sputtering at 50%, frequent cutouts (1–2 sec stalls) at 30%, half speed at 15%
- Reactor damage: power output degrades, weapons lose fire rate, modules deactivate

**Hull Degradation Thresholds:**
- 75%: minor flicker (cosmetic)
- 50%: engines sputter, turrets slow
- 30%: engine cutouts, weapons misfire ~20%, reduced turn rate
- 15%: half speed, weapons misfire ~40%, possible loss of a weapon mount
- 5%: minimal thrust, most weapons offline, sparking/venting visuals

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

### BB: Mission & Bounty Board

Procedurally generated missions available at stations, cycling on a timer. All bounties are tied to named people and listed crimes — not anonymous "kill 3 raiders."

**Mission types:**
- **Patrol** — "Destroy 3 scavenger skiffs near Keelbreak" — rep + scrap reward
- **Elimination** — "Hunt down [Named Captain] for [specific crime] last seen near [location]" — larger payout
- **Escort** — "Protect NPC convoy from A to B" — favor reward from destination faction; failure damages rep with both factions
- **Salvage** — "Recover black box from derelict in the Boneyards" — exotic/module reward

High-tier missions unlock at higher reputation thresholds. Bounties are for real crimes against the pre-generated NPC population (see BE) — the victim or their faction posts the bounty.

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

### BH: Station Overhaul — Multi-Screen UI

Break the current monolithic station screen into a set of distinct sub-screens, each with its own focused purpose. Similar to a real space station having different departments.

Examples: Trade Floor, Shipyard (module installs), Repair Bay, Black Market (if rep allows), Rumor Mill / Mission Board, Faction Liaison (reputation management). Each screen has its own visual identity and available actions. Navigation between screens via station-internal menu.

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