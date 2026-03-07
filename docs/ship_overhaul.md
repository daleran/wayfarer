# Ship Overhaul Design Spec

> **Status:** Design Spec (In Progress)
> **Scope:** A complete overhaul of ship variety, factional life, unique ship traits, and the introduction of fleet captains.

---

## 1. Ambient Life & Factional Ecosystem

The Tyr system is no longer a silent void. It is a living, breathing economy where ships move with purpose according to their faction's needs.

### 1.1 Factional Behaviors
- **Trade Ships (Neutral/Friendly):** Move between planets and stations in predictable "Trade Lanes." They carry commodities and are the primary targets for Scavengers.
- **Militia Patrols:** Faction-specific ships (Settlements, Communes) that orbit stations and patrol nearby "Safe Zones." They will intervene if the player or Scavengers attack neutral traders within their sensor range.
- **Scavenger Ambushes:** Scavengers no longer just wander; they lurk in debris fields or hide behind moons, waiting for trade ships (or the player) to pass.

### 1.2 The "Life-Link" System
All non-player ships now have a **Home Station**. 
- Traders return to their home station to "offload" every 5-10 minutes.
- If a home station is attacked, all local faction ships will converge to defend it.

---

## 2. Expanded Ship Classes

Ships are now categorized into **Commerce** and **Combat** hulls. All ships are now equipped with at least a Light Machine Gun (LMG) for basic defense—in the Afterlight Era, an unarmed ship is a derelict-in-waiting.

### 2.1 Commerce Hulls (The Lifeblood)
| Class | Lore Name | Shape Profile | Cargo | Armament |
|---|---|---|---|---|
| **Cart** | **"The Sledge"** | A small, boxy tug with a single trailing container. | 1 | 1x LMG (Fixed Forward) |
| **Hauler** | **"The Ox"** | A medium frame pulling two coupled cargo containers. | 3 | 1x LMG (Turreted) |
| **Caravel** | **"The Argosy"** | A heavy merchant vessel with three large, armored containers. | 6 | 2x LMG (Turreted) |

### 2.2 Combat Hulls (The Teeth)
| Class | Lore Name | Behavior | Special Weapon |
|---|---|---|---|
| **Missile Frigate** | **"The Rainmaker"** | Kiter | **Launchers:** Fires a volley of 3 low-velocity, high-impact missiles at long range. |
| **Lancer** | **"The Torch"** | Brawler | **Ablator Beam:** A continuous laser beam that strips armor rapidly but deals minimal hull damage. Requires "Cool-down" periods. |
| **Carrier** | **"The Hive"** | Standoff | **Fighter Bays:** Deploys 3 autonomous "Gnat" fighters that harass targets. |

---

## 3. Unique Ships & The Modifier System

Generic ship models are a relic of the past. Every ship in the Afterlight Era is a unique assembly of salvaged parts, bad history, and jury-rigged miracles.

### 3.1 Procedural Identity
When a ship is generated (for purchase or as an enemy), it is assigned:
1. **A Unique Name:** (e.g., *The Rusty Rivet*, *Silence of Grist*, *Voss's Regret*)
2. **A Flavor Blurb:** (e.g., "A former algae-hauler with a reinforced keel.")
3. **One or More Modifiers:**

### 3.2 Ship Modifiers (The "Quirk" List)
| Modifier | Effect | Lore Flavor |
|---|---|---|
| **Uparmored** | +30% Armor, -15% Speed | Thick arkship plating bolted directly to the frame. |
| **Modded Engines** | +20% Speed, +50% Fuel Burn | Someone bypassed the safety regulators. It screams. |
| **Void-Hardened** | +Nebula Resistance, +10% Hull | Extra lead-lining and radiation shielding. |
| **Stripped Frame** | +15% Accel, +15% Turn, -20% Hull | Everything non-essential has been thrown out a vacuum lock. |
| **Overcharged Caps** | +25% Fire Rate, -20% Range | The weapon feeds hum with dangerous energy. |
| **Focusing Lenses** | +30% Range, -15% Fire Rate | Precision optics salvaged from a pre-Exile lab. |
| **Auxiliary Battery** | +40% Armor Repair Rate, -1 Cargo | Dedicated power banks for the welding drones. |
| **Hidden Holds** | +2 Cargo, -10% Armor | Cut-outs in the internal bulkheads for extra room. |
| **Ruggedized** | -50% System Degradation Penalty | High-tolerance analog parts that don't quit. |
| **High-Gain Array** | +50% Minimap Range, -10% Turn | A massive, rotating sensor dish dominates the hull. |
| **Muffled Baffles** | -30% Aggro Range, -10% Accel | Experimental exhaust cooling to stay off the scanners. |
| **Bulkhead Bracing** | +25% Hull, -15% Cargo | Internal supports welded into the cargo bays. |
| **Auto-Loader** | +30% Fire Rate, -25% Crew Max | Clockwork mechanisms replace three loaders. |
| **Long-Haul Tanks** | +50% Fuel Capacity, -10% Accel | Oversized fuel bladders strapped to the exterior. |
| **Jury-Rigged** | +10% to all stats, random 2s stall | It's a miracle it works at all. Don't touch the wires. |

### 3.3 Legendary Ships
Some ships have histories that precede them, known across the system and sought after by collectors and warlords alike. These ships cannot be purchased; they must be found or captured.
- **The Breakhook:** Originally a House Drazel heavy boarding vessel, this ship vanished during a mutinous siege. It resurfaced decades later as a half-gutted, jury-rigged "press-ganged fortress" in the hands of black-market scavengers. It boasts incredibly high hull integrity and devastating close-range capabilities.

---

## 4. Captains of the Void

The player can now recruit and assign **Captains** to their fleet ships. A ship without a captain operates on basic autonomous sub-routines; a ship with a captain gains personality and power.

### 4.1 Recruitment
Captains are found in **Settlement Bars** or rescued from **Escape Pods**. They have names, histories, and a **Trait** that provides a fleet-wide or ship-specific bonus.

### 4.2 Captain Traits (Examples)
- **"The Driller" (Grist Miner):** +10% Ore selling price for the fleet.
- **"The Veteran" (Ex-Militia):** +15% Weapon Accuracy for their ship.
- **"The Speed-Freak":** +10% Speed for their ship, but ignores "Stop" throttle occasionally.
- **"The Fixer":** Automatically repairs minor hull damage over time (out of combat).

### 4.3 Unique Hireable Captains
Players can encounter unique, named captains with deep backstories and powerful synergies:
- **Korrin Vale (Salvage Lord):** A former Great House officer who rules through practical efficiency. *Trait:* +Bonus to salvage value and ship maximum hull durability.
- **Dr. Nara Dell (Medic/Botanist):** Direct and practical with grease under her nails. *Trait:* +Reduced crew loss in combat and a bonus to "Food" production/selling.
- **Tessa Kaine (Chief Engineer):** Knows Concord tech and jury-rigged systems equally well. *Trait:* +Faster mid-combat repair rates and a bonus to "Tech" reliability.
- **Jace Harrow (Navigator):** Always calculating odds and optimal routes. *Trait:* +Increased sensor range and significant fuel efficiency.
- **Brack (Security):** A man of few words who keeps his hand near his weapon. *Trait:* +Strong defense against boarding actions and increased weapon accuracy.

---

## 5. Implementation Phases

### Phase 1: The Living System (Integrated Location Overhaul)
- Replace static map with **Factional Trade Lanes** and **Patrol Zones**.
- Implement the 15 station types from `location_overhaul.md` as the backdrop for this new life.
- Basic "Neutral Ship" AI that follows paths between stations.

### Phase 2: The Commerce Overhaul
- Implement **The Sledge**, **The Ox**, and **The Argosy**.
- Update `GameManager` to spawn traders with random cargo based on their route.
- Implement the "LMG" weapon component for all non-combat ships.

### Phase 3: The Specialized Combat Fleet
- Implement **Missile Frigates**, **Lancers**, and **Carriers**.
- Create lore-specific silhouettes for each (e.g., Lancer is a long, needle-like ship with glowing lens).
- Add "Fighter" entity type for the Carrier swarm.

### Phase 4: Personality & Modifiers
- Implement the **Ship Modifier System**.
- Add the "Unique Name" generator for all ships.
- Update the **Shipyard UI** to show modifiers and flavor text before purchase.
- Apply random modifiers to enemy ships to vary combat difficulty.

### Phase 5: The Captain's Deck
- Implement the **Captain Entity** and recruitment system.
- Add the **Fleet Management UI** to assign captains to specific ships.
- Apply Captain trait bonuses to ship stats during the `update()` loop.

---

## 6. Lore & Aesthetic Integration

- **Lore:** Names for ships and captains should feel weathered—referencing the "Long Fall," "Arkships," or specific moon locations (e.g., *The Grist-Grinder*).
- **UI:** The **Shipyard** should look like an analog technical readout. Ship modifiers should be displayed in **Amber** with a "WARNING" or "CERTIFIED" tag. Captain portraits (if any) should be low-res green/cyan pixel art or just a textual description of their appearance.
- **Visuals:** Combat ships use **Red** (Scavenger) or **Cyan** (Settlement) accents on their wireframes to denote faction, but their core hull remains the relation-based color (Green/Red/Amber) as per `UI.md`.

---
*This plan moves the focus from static locations to the entities that inhabit them, creating a dynamic, lore-rich world where every ship has a story.*
