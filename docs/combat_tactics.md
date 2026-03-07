# Combat Tactics Design Spec: Fleet Command

> **Status:** Design Spec
> **Scope:** Fleet formations, command hotkeys, targeting priority, and Electronic Warfare (E-War).

---

## 1. Fleet Formations (The Shield)

Ships in the fleet no longer drift aimlessly. They follow the flagship in structured **Offsets**.

### 1.1 Formation Profiles
Players can toggle between three presets (Default: **Wedge**):
- **Wedge (Balanced):** Gunships flanking the flagship, Frigates and Carriers trailing behind.
- **Line (Escort):** Combat ships surround the flagship and any Carts/Oxen in a defensive circle.
- **Echelon (Aggressive):** All ships trail off to the left or right, maximizing the forward firing arc of all turrets.

### 1.2 Collision Avoidance
Fleet AI uses a soft **Avoidance Radius** to prevent overlapping. In tight formations, ships will slightly prioritize "Not Hitting Allies" over "Perfect Positioning."

---

## 2. Command Hotkeys (The Sword)

Simple, high-signal commands that the player can issue to the entire fleet (linked to `Tab` menu or number keys).
- **"Focus Fire" (LMB):** Default behavior. All ships target what the player is aiming at.
- **"Defensive Screen":** Fleet ships prioritize shooting down incoming missiles and fighters over attacking main enemy hulls.
- **"Scatter":** Fleet breaks formation and moves in random directions to avoid heavy area damage.
- **"Standoff":** Fleet ships attempt to stay at their individual **Max Weapon Range** from the current target.

---

## 3. Targeting Priority AI

Different ships now have specialized "Threat Assessment."
- **Lancer (The Torch):** Prioritizes the ship with the highest current **Armor** value.
- **Missile Frigate (The Rainmaker):** Prioritizes the largest hull (Ox, Caravel, or Capital) to maximize hit chance.
- **Gunship:** Prioritizes the nearest enemy to the flagship.

---

## 4. Electronic Warfare (E-War)

Not every weapon deals damage to the hull.

### 4.1 Jamming (Sensor Interference)
- **Scrambler Module:** A mid-range burst that scrambles an enemy's minimap and causes their turrets to target randomly for 3-5 seconds.
- **Visual Feedback:** Static on the player's HUD if they are being jammed.

### 4.2 Engine Stall (Stall Missiles)
- Special missiles that deal 0 damage but force an enemy's throttle to "Stop" for 2 seconds.

---

## 5. Boarding Combat

Boarding is an alternative to destroying a ship, allowing for capturing intact hulls or taking high-value hostages.

### 5.1 The Boarding Phase
When two ships collide at very low speeds, and the enemy ship's armor is depleted, the player can initiate a "Boarding Action." This shifts the engagement from ship-to-ship combat into the **Will System** (used in dialogue and narrative events).
- **Crew vs Crew:** The player's assigned Captain and Crew size act as their "Will" baseline.
- **Boarding Actions:** The player chooses tactics (e.g., "Breach the Bridge", "Vent Atmosphere", or "Intimidate") that deal Will Damage to the opposing crew.
- **Resolution:** If the enemy's Will reaches zero, the ship surrenders and can be towed or salvaged. If the player's Will reaches zero, the boarding party is repelled, and the player suffers massive crew loss.

---

## 6. Implementation Phases

- **Phase 1:** Offset-based formations (Wedge).
- **Phase 2:** Command hotkeys for "Defensive Screen" and "Scatter."
- **Phase 3:** Specializing AI targeting by ship class.
- **Phase 4:** E-War modules and visual feedback effects.
- **Phase 5:** Boarding mechanics and integration with the narrative Will System.
