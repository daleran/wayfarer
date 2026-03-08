# Scavenging System Specification

## Overview
Scavenging is a core gameplay loop in Wayfarer. Rather than a simple interact button, scavenging high-value wrecks requires preparation, specialized tools, and risk management. Wrecks can yield scrap, fuel, commodities, lore drops, valuable data, locations of hidden stashes, powerful modules, and even unique derelict ships.

## Core Pillars

### 1. Specialized Tools & Multi-Stage Extraction
Scavenging a high-value derelict is a process, not a single action. Players must equip specialized ship modules to interact with different parts of a wreck.
* **Stage 1: Surveying (Deep Scanners):** Players use Active Scanners to ping wrecks. High-tier scanners reveal hidden compartments, structural weak points, and dormant hazards that would otherwise be invisible.
* **Stage 2: Breaching (Cutting Lasers/Charges):** Standard weapons can blast a wreck apart for basic scrap, but precision requires Breaching Tools (e.g., Plasma Cutters). Players target specific weak points to open secure bulkheads without destroying the delicate loot inside.
* **Stage 3: Extraction (Drones/Tethers):** Once breached, players deploy Salvage Drones or Tractor Tethers to carefully pull out high-value modules, data drives, or cargo pods.

### 2. Active Extraction Minigames
Extracting the most valuable assets (lore databases, experimental modules) requires player skill during the breach and extract phases.
* **Data Decryption:** When accessing a derelict's mainframe for map data or lore, players face a time-limited decryption puzzle. Failing might lock the drive permanently or trigger a distress beacon.
* **Power Routing:** To open the most secure vaults on massive Ark-Modules, players might need to manually align their ship's power with the wreck's dormant grid, matching frequencies before the connection overloads or triggers a lockdown.

### 3. Dormant Threats & Ambushes
High-value wrecks are rarely safe. The act of scavenging creates noise and energy signatures.
* **Automated Defenses:** Breaching a military derelict might wake up Concord Ghost sentinels or internal automated point-defense turrets that the player must quickly disable or evade.
* **Scavenger Ambushes:** Using active scanners or heavy plasma cutters emits a noticeable signature across the sector. Lingering too long on a lucrative wreck increases a "heat" meter, eventually causing Grave-Clan raiders or pirate interceptors to warp in and attempt to steal your claim.
* **Risk vs. Reward:** The player must balance the time spent on minigames and multi-stage extraction against the rising threat of an ambush.

## Loot Categorization
* **Tier 1 (Surface Scrap):** Base metals, fuel residue. Requires no special tools, just a basic interaction.
* **Tier 2 (Breached Cargo):** Trade commodities, standard ship weapons, and armor plating. Requires basic breaching tools.
* **Tier 3 (Secure Vaults):** Pre-Exile tech, pristine modules, unique ship blueprints. Requires advanced breaching and extraction minigames.
* **Tier 4 (Mainframe):** Lore logs, encrypted data, coordinates for hidden bases or pristine derelicts. Requires data decryption minigames.

---

## Implementation Roadmap

### Phase 1: Foundations & Tooling (Core Framework)
*   **Ship Module Support**: Update `js/entities/ship.js` and `js/data/shipTypes.js` to support new module slots and types: `Scanners`, `Breaching Tools`, and `Extraction Drones`.
*   **Derelict State Machine**: Update `js/world/derelict.js` to track its state (Untouched, Surveyed, Breached, Depleted).
*   **Scavenging Manager**: Create `js/systems/scavengingManager.js` as the central coordinator for tool verification and state transitions.

### Phase 2: Multi-Stage Extraction (Basic Loop)
*   **Surveying Mechanic**: Implement an "Active Scan" pulse in `js/game.js` that triggers when the player uses their scanner module, revealing a derelict's tier and potential hazards.
*   **Breaching Progress**: Implement a time-based breaching mechanic. The player must remain stationary near a wreck while the "Cutting" progress bar fills.
*   **Loot Spawning**: Connect the `Scavenging Manager` to `js/entities/lootDrop.js` to spawn rewards upon a successful breach and extraction.

### Phase 3: Active Extraction Minigames (Skill Layer)
*   **Minigame Overlay**: Build a UI framework in `js/ui/scavengingMinigames.js` for full-screen or HUD-based puzzles.
*   **Data Decryption Puzzle**: A time-limited code-matching sequence for accessing Tier 4 lore and data.
*   **Power Routing Puzzle**: A frequency-matching minigame required to unlock Tier 3 secure vaults.

### Phase 4: Dynamic Threats (Risk Layer)
*   **Signature Meter**: Introduce a "Heat" or "Signature" meter that fills during breaching. High-tier tools fill it faster.
*   **AI Ambushes**: Hook into the game's event system to spawn `js/enemies/pirates/raider.js` if the signature threshold is crossed.
*   **Defensive Trigger**: Add logic to military-tier derelicts to spawn hostile projectiles or activate dormant Concord Ghost entities if a breach fails or takes too long.

### Phase 5: Polish & Reward Integration
*   **Tiered Loot Tables**: Populate new tables in `js/data/commodities.js` with rewards for all tiers.
*   **Lore Fragments**: Integrate lore snippets from `docs/gravewake.spec.md` into the Tier 4 data rewards.
*   **Visual Feedback**: Add particle effects for breaching and scanning to `js/systems/particlePool.js`.
