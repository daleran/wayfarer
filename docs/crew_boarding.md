# Crew & Boarding Design Spec

> **Status:** Design Spec
> **Scope:** Crew casualties, morale, "The Boarding Action," and captain progression.

---

## 1. The Human Element: Crew

In a system with <50,000 souls, a crew of five is a community.

### 1.1 Crew Casualties
Crew members do not have individual health; they are a pool.
- **Hull Breach:** If a ship takes hull damage while armor is 0, there is a chance of losing 1-3 crew.
- **Radiation/Nebulae:** Prolonged exposure in a "Stripped Frame" can cause gradual crew loss.
- **The "Skeleton Crew" Penalty:** If crew count drops below 25% of max, all ship stats are halved.

### 1.2 Morale & Motivation
Morale is affected by:
- **Consistent Success:** Successful trades and won battles boost morale.
- **Casualties:** Losing a crew member triggers a morale hit.
- **The "Captain's Speech":** Certain captains can "Boost Morale" once per docking.
- **Effect:** High morale increases armor repair speed. Low morale increases misfire chance.

---

## 2. The Boarding Action

A high-risk, high-reward tactical sub-game.

### 2.1 The Breach
- **Prerequisite:** Targeted ship must be at <20% Hull or "Stalled" by E-War.
- **The Hook:** Player docks with the target and initiates "Boarding."
- **The Battle:** A text-based tactical sequence (consistent with `narrative_events.md`) where the player makes choices: "Breach the Bridge," "Secure the Cargo," or "Disable the Reactor."

### 2.2 Boarding Outcomes
- **Capture:** Seize the ship for the fleet (if within fleet limit).
- **Ransom:** Force the crew to pay credits for release.
- **Scuttle:** Automatically strip all high-tier tech and scuttle the hull for maximum Scrap.

---

## 3. Captain Progression

Captains are the "Hero" units of *Wayfarer*.

### 3.1 Experience & Traits
- **The Log:** Every ship has a history. A captain who survives three major battles gains a **Trait Upgrade**.
- **Trait Upgrades (Examples):**
    - **"Void-Walker":** Increases lander fuel efficiency.
    - **"Iron-Side":** +15% Armor for their assigned ship.
    - **"Merchant-Eye":** Reveals surplus/deficit status of a station on the minimap from a distance.

---

## 4. Implementation Phases

- **Phase 1:** Crew casualty calculation based on hull damage.
- **Phase 2:** Morale stat tracking and its effect on ship performance.
- **Phase 3:** Text-based "Boarding Action" sequence and outcomes.
- **Phase 4:** Captain XP system and trait-unlock progression.
