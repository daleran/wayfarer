In the **Gravewake Orbital Zone**, the environment is a dense, looping "graveyard" of history where massive derelicts and ancient machinery define the terrain. Because it serves as the original staging ground for the Exile Fleet, the orbit is cluttered with megastructures that dwarf the player's fleet.

### 1. Major Megastructures (Static Terrain)

These are "Sector-Scale" entities that act as the primary navigational landmarks and physical barriers within the orbital loop.

* **Arkship Spines**: Kilometers-long, shattered structural beams from the original fleet, rendered as massive wireframe polygons with visible internal ribbing.
* **The Wall of Wrecks**: A dense, looping belt of early colonization craft and warships that creates physical chokepoints, forcing ships into predictable Trade Lanes.
* **The Coil**: A massive station serving as the zone's central lawless hub. It is constructed from four coupled cargo haulers rotating around a central docking hub:
  * *The Bazaar*: The primary trade deck where black-market ROMs and fenced goods are exchanged.
  * *The Shipyard*: A chaotic mesh of welding arms for illicit ship repairs and unregulated upgrades.
  * *The Pits*: The residential and cantina sector, thick with tension and cheap synthetic alcohol.
  * *The Vault*: The heavily guarded storage hauler.
  * *Political Dynamics*: The Coil is ruled by the **Salvage Lords**, a volatile council of former pirates and warlords who enforce an uneasy, lawless peace. They ensure trade flows, but their internal power struggles occasionally spill out into the docking bays.

---

### 2. Active Factional Life

The orbit is a "living" economy where ships move with purpose according to their home station's needs.

* **Trade Convoys**: Traders hauling commodities (Ore, Food, Tech) between The Coil and hidden scavenger dens.
* **Militia Patrols**: Settlement or Commune ships that orbit near The Coil to intervene if traders are attacked within sensor range.
* **The Grave-Clans (Scavengers)**: Specialized scavenger raiders adapted to the dense ice and wreckage. They lurk behind Arkship Spines and use grapple lines and harpoons to ambush unsuspecting convoys.
* **Zealot Pilgrims**: Cultist convoys seeking the oldest Concord wrecks from the Arrival Drift. They traverse the most dangerous debris fields and are willing to pay massive payouts for safe escort or recovered artifacts.
* **Concord Ghosts**: Rarely seen, dormant, half-broken Concord sentinels. They are not part of an active invasion but instead mindlessly repeat century-old patrol routes, acting as dangerous, unpredictable hazards to anyone who crosses their path.
* **Monastic "Archive" Guardians**: Heavily armed ships patrolling near the Thornwick Archive to protect pre-Exile tech.

---

### 3. Hazards & Points of Interest

These entities provide gameplay risks and rewards for players brave enough to venture away from the trade lanes.

* **Dormant Ark-Modules**: High-value derelicts that may contain "Ghost Signals" or internal hazards, requiring Surgical Extraction to loot safely.
* **The Frozen Fleet**: A cluster of perfectly preserved early colonization craft encased in hydrogen ice. Attempting to salvage here yields pristine pre-Exile tech but carries immense risk of hull damage and ambush.
* **Black Market Relay**: An untraceable communication buoy used by the Salvage Lords. A prime location to pick up high-tier, illicit bounties that aren't available on standard settlement boards.
* **Voss's Waystation**: A hidden, fortified resupply point used by Dread Captain Voss's forces. Finding it requires high scavenger reputation or deciphering encrypted patrol routes, but offers unique black-market ship parts.

---

## 4. Phased Implementation Plan

### Phase 1: The Gravewake Foundation (Environment & Hub)
*   **Static Terrain:** Implement the **Arkship Spines** and **The Wall of Wrecks** as large collision/navigational boundaries in `js/data/map.js`.
*   **The Coil Station:** Create the data entry for The Coil, including its unique four-hauler description and basic services (Bazaar, Shipyard).
*   **Atmosphere:** Implement the parallax starfield and debris field density specific to the Gravewake zone.

### Phase 2: Local Traffic & Scavenging Economy
*   **Basic AI Traffic:** Implement **Trade Convoys** (Tugs/Cogs) and **Militia Patrols** (Frigates) moving along the Trade Lanes defined by the Wall of Wrecks.
*   **Grave-Clans:** Add the first specialized enemy AI—raiders that use "Lurker" behavior, hiding behind Spines and ambushing traders.
*   **Dormant Modules:** Populate the zone with standard **Ark-Modules** and implement the basic "Surgical Extraction" loot timer.

### Phase 3: Factional Specialization & Mid-Tier Hazards
*   **Zealot & Monastic AI:** Implement unique behaviors for Zealot Pilgrims (shield-heavy escorts) and Monastic Guardians (aggressive area denial).
*   **The Black Market Relay:** Add the untraceable buoy and the logic for "Illegal" bounties.
*   **Ghost Signals:** Implement the "Ghost Signal" hazard for Dormant Modules—attracting local raiders or Concord Ghosts when tampering begins.

### Phase 4: The Deep Graveyard (Secrets & Endgame)
*   **Concord Ghosts:** Implement the mindless, looping patrol AI for dormant Concord sentinels.
*   **The Frozen Fleet:** Create the "Hydrogen Ice" hazard and the high-value derelict cluster.
*   **Voss's Waystation:** Implement the reputation-gated entry for Voss's hidden base and its unique inventory.
