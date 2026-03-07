# Faction AI & World Simulation Spec

> **Status:** Design Spec
> **Scope:** Faction behavior, patrol logic, trader pathfinding, and "Response Heat."

---

## 1. The Living System: Faction AI

In *Wayfarer*, non-player ships are not just random spawns. They are actors in a system-wide simulation.

### 1.1 Faction Intentions
- **Settlements (Merchant/Peaceful):** Prioritize trade routes. Avoid debris fields. Flee when outgunned.
- **Scavengers (Aggressive/Ambush):** Lurk in high-yield zones. Target cargo-heavy fleets. Flee when low on armor.
- **Monastic Orders (Mysterious/Protective):** Patrol pre-Exile sites. Ignore traders unless provoked. High aggression against Concord.
- **Concord (Systematic/Hostile):** Erase all wake-signals. Coordinate in geometric formations. Do not flee.

---

## 2. World Simulation: Trade & Patrols

The `WorldSim` manager coordinates entity behavior on a global scale.

### 2.1 Trade Lane Generation
- **Pathfinding:** Traders move between complementary stations (e.g., Farm -> Mining Outpost) along "Trade Lanes."
- **Risk Assessment:** If a trade lane has high Scavenger activity, traders will "Cluster" (form a convoy) or take a longer, safer route.
- **Escorts:** Wealthy trade convoys (Ox + 2 Carts) will hire 1-2 Militia Gunships for protection.

### 2.2 Patrol Logic
- **Militia Patrols:** Orbit within `PatrolRadius` of their home station. Will intervene if combat is detected within sensor range.
- **Hunter-Killer Fleets:** If the player gains high negative reputation with a faction, specialized pursuit fleets (Frigates + Lancer) will spawn and track the player across sectors.

---

## 3. Faction "Response Heat"

Actions have consequences that escalate.

- **Level 1 (Curiosity):** A single patrol ship follows at sensor range.
- **Level 2 (Investigation):** A patrol intercepts and demands a "Cargo Scan" (contraband check).
- **Level 3 (Intervention):** A combat fleet interdicts the player's path and demands a fine or surrender.
- **Level 4 (Kill Order):** Faction sends Hunter-Killer fleets. Stations are locked. Attack on sight.

---

## 4. Interaction & Communication

- **Hail (H Key):** The player can "Hail" any non-hostile ship for a quick dialogue or trade request.
- **Distress Pings:** Traders under attack will broadcast pings on the HUD. Helping them provides a reputation boost and potential credit rewards.

---

## 5. Implementation Phases

- **Phase 1:** Core `WorldSim` manager to track trade-lane paths.
- **Phase 2:** Faction-specific AI states (Patrol, Flee, Intercept, Trade).
- **Phase 3:** "Response Heat" tracking and escalation logic.
- **Phase 4:** NPC hailing and dialogue system integration.
