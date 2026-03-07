# Salvage & Wreckage Design Spec

> **Status:** Design Spec
> **Scope:** Derelict generation, extraction mechanics (Surgical vs. Bulk), salvage hazards, and the "Scrap Economy."

---

## 1. The Lifeblood of Tyr: Salvage

In a depopulated system, manufacturing is a myth. Everything is repurposed. Salvaging is not just "looting"; it is a tactical operation requiring time, power, and risk management.

### 1.1 Derelict Types
- **Shattered Hull:** 80% Scrap, 20% Ore. Fast to strip, low risk.
- **Dormant Ark-Module:** High Tech and Data potential. Likely contains "Ghost Signals" or internal hazards.
- **Combat Wreck:** High chance of finding "Unique Modifiers" or weapons. May have unexploded ordinance.
- **Concord Fragment:** Geometric, "Bleeding" energy. Provides Exotics and Data. Extremely dangerous (Radiation).

---

## 2. Extraction Mechanics: The "Cut"

When docked or tethered to a derelict, the player chooses an extraction mode:

### 2.1 Surgical Extraction (Focus: Tech/Data)
- **Time:** Slow (3x).
- **Yield:** High chance of rare components, data logs, and intact weapons.
- **Risk:** High chance of triggering "Internal Collapses" or "Security Pings."
- **Pip Requirement:** High **SYS** (Systems) pips required for precision sensors.

### 2.2 Bulk Rip (Focus: Scrap/Ore)
- **Time:** Fast (1x).
- **Yield:** High volume of Scrap and Ore. Tech is "Crushed" into scrap.
- **Risk:** Low. Mostly structural stability issues.
- **Pip Requirement:** High **ENG** (Engines) pips for tractor-beam stability.

---

## 3. Salvage Hazards

The void is never truly empty, and wrecks are unstable.

- **Internal Pressure (Pop):** A compartment breaches, dealing physical damage and pushing the player's ship away.
- **Radiation Leak:** A slow hull-degradation field around the wreck. Requires "Void-Hardened" modifier or high SYS pips.
- **Ghost Signal:** A Concord-infected terminal that scrambles the player's HUD or summons a local Sentinel patrol.
- **Dormant Drones:** Security bots that "Wake Up" if Surgical Extraction fails a check.

---

## 4. The "Black Box" Narrative

Every 10th salvage operation (roughly) yields a **Narrative Item**.
- **Encrypted Manifests:** Points to a hidden "Stash" in a nearby nebula.
- **Personal Keepsakes:** Return to a specific settlement for a massive Reputation boost.
- **Corrupted AI Shards:** Can be sold to Zealots or "Purged" for Monastic Order rep.

---

## 5. Implementation Phases

- **Phase 1:** Basic `Derelict` entity with loot tables and "Extraction Timer."
- **Phase 2:** Surgical vs. Bulk UI toggle and yield modifiers.
- **Phase 3:** Environmental hazards (Radiation, Pressure Pops).
- **Phase 4:** Narrative item integration and waypoint generation.
