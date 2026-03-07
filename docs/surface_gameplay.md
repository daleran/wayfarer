# Planet Surface & Lander Design Spec

> **Status:** Design Spec
> **Scope:** Surface gameplay, lander physics, resource gathering, and the "Distress Call" mechanic.

---

## 1. The Surface Layer: Overview

Landing on a planet switches from the space map to a dedicated 2D surface map. The player controls a specialized **Lander** to explore, trade, and gather resources while their fleet waits in orbit.

---

## 2. Lander Physics & Control

The lander feels heavy, momentum-based, and fragile. It is a "Thruster-Only" vehicle with zero lateral friction.

### 2.1 Gravity & Thrust
- **Gravity:** Constant downward force that varies by planet.
- **Vertical Thrust:** Controlled by **W**. Consumes fuel.
- **Directional Thrust:** Controlled by **A/D**. Consumes fuel.
- **Soft Landing:** Landing at high velocity (> Threshold) deals hull damage.

### 2.2 Fuel & Stranding
- **Fuel Bar:** A cyan segmented bar on the HUD.
- **The Stranded State:** If fuel hits 0, the lander enters "Drift Mode." The player can issue a **Distress Call**.
- **Distress Call Cost:** 500 Credits (Militia Rescue) or a Reputation Hit (Scavenger Rescue). Transfers player back to orbit.

---

## 3. Surface Activities

Planets are more than just visual backdrops; they are the primary source of raw materials.

### 3.1 Resource Gathering
- **Mineral Veins (Grist):** Land near a node and press **E** to "Mine" raw Ore and Isotopes.
- **Algae Vats (Thalassa):** Hover over a basin to "Extract" high-quality Food.
- **Pre-Exile Ruins (Pale):** Land and enter a ruin zone for high-tier Data and Exotics.

### 3.2 Surface Settlements
Surface settlements are smaller and more specialized than orbital stations.
- **Trade:** Often offer better prices for raw materials but charge premium prices for manufactured Tech.
- **NPC Dialogue:** Encounter surface-bound characters (Miners, Farmers, Hermits) for unique story threads.

---

## 4. Hazards: The Hostile Surface

Each planet has terrain-based hazards that threaten the lander's fragile hull.

- **Thalassa:** Corrosive brine pools. Deal slow hull damage on contact.
- **Grist:** Dust storms. Reduce visibility and increase fuel consumption.
- **Pale:** "Flash-Freeze" zones. Temporarily lock the lander's thrusters.

---

## 5. Implementation Phases

- **Phase 1:** Core `Lander` entity with gravity/thrust physics.
- **Phase 2:** Surface map rendering system and terrain-collision logic.
- **Phase 3:** Resource nodes and "Extraction" progress bars.
- **Phase 4:** Distress call mechanic and orbital transition system.
