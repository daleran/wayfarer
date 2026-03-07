# Narrative Events Design Spec: The Living Void

> **Status:** Design Spec
> **Scope:** Procedural events, dialogue systems, salvage stories, and reputation-driven milestones.

---

## 1. Procedural Event Engine

The "void" between stations is no longer empty space. It is populated by dynamic encounters.

### 1.1 Event Triggers
Events trigger based on:
- **Location:** Entering a Nebula, Debris Field, or specific Faction Zone.
- **State:** Low Fuel, high Cargo value, or being in a badly damaged ship.
- **RNG:** A flat 5-10% chance every 60 seconds of travel.

### 1.2 Event Catalog (Examples)
- **Distress Call:** A derelict is actually an ambush, or a genuinely stranded trader needs fuel.
- **Escape Pod:** Rescuing a pod has a chance to recruit a **Captain**.
- **The Toll:** A Scavenger fleet demands half your credits to pass.
- **Concord Ghost:** A visual hallucination on the HUD that leads to a hidden artifact.

---

## 2. Dialogue & Interaction System

Interactions with Captains, Faction Leaders, or Barflies are handled through a text-based dialogue overlay.

### 2.1 Interface
- Monospace font, CRT glow.
- Character description (no portrait): "A Grist-born miner with a nervous tic and a heavily modded Ox."
- **Multiple Choice:** Players can choose responses that affect Reputation or initiate combat.

### 2.2 Skill Checks
Certain dialogue options are gated or modified by the specific skills of your hired Captains or the player's own background. Having crew members with specialized skills unlocks new paths:
- **Deception:** Allows the player to bluff past patrols, smuggle contraband undetected, or pass off cheap ore as higher quality.
- **Rhetoric:** Unlocks diplomatic options to talk down hostile factions, negotiate better rewards for bounties, or lower "The Toll" demanded by Scavengers.
- **Ecology:** Unlocks unique insights on Agricultural Moons or allows the player to correctly identify and harvest rare biological materials from Void Fauna.
- **Metallurgy:** Allows the player to identify high-value scrap in debris fields, unlocking better salvage yields.

### 2.3 The "Will" System
Some interactions, such as standoffs, interrogations, or tense negotiations, use a **Will** mechanic instead of immediate combat.
- **Willpower Bar:** Both the player's crew and the opposing NPC have a "Will" bar representing composure and resolve.
- **Actions:** Choices like "Intimidate", "Taunt", or "Reason" deal "Will Damage."
- **Resolution:** Draining an opponent's Will to zero forces them to yield, flee, or offer a concession without firing a single shot. A player whose Will is broken may be forced to surrender cargo, pay a hefty fine, or retreat.

---

## 3. Salvage Stories

Salvaging a derelict is no longer just a loot drop. There is a 10% chance to find a **Narrative Item**.

### 3.1 Data Logs
- Items like "Encrypted Manifest" or "Family Keepsake."
- Reading these items in the cargo hold provides a waypoint to a specific moon or station for a unique reward.
- **Flavor:** Every item should reinforce the lore—referencing the "Long Fall" or the "Exodus."

---

## 4. Reputation Milestones

Reputation is no longer just a price modifier. It unlocks specific gameplay.

### 4.1 Standing Rewards
- **Unfriendly (-40):** Faction ships will "Shadow" the player, staying at the edge of sensor range.
- **Friendly (+40):** Unlocks the "Militia Escort" mission type.
- **Allied (+80):** Access to the **Faction Secret Shop** (e.g., specific Concord-adjacent tech from Zealots).

---

## 5. Implementation Phases

- **Phase 1:** Basic "Escape Pod" and "Distress Call" trigger system.
- **Phase 2:** Text-based dialogue box and basic choices.
- **Phase 3:** Narrative items (Data Logs) that unlock markers.
- **Phase 4:** Faction-specific "Secret Shops" and advanced reputation feedback.
