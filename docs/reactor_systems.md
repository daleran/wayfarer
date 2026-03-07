# Reactor & Energy Systems Design Spec

> **Status:** Design Spec
> **Scope:** Power generation, energy distribution (Pips), fuel management, and the Cyan-themed energy HUD.

---

## 1. The Pulse of the Ship: Reactors

Every ship in the Tyr system is built around its reactor. In the Afterlight Era, these are rarely new; they are salvaged fission cores or, for the lucky, rare pre-Exile fusion arrays.

### 1.1 Reactor Tiers
- **Fission Core (Standard):** Reliable but heavy. Slow to ramp up power. Found in Carts and Oxen.
- **Overclocked Fission (Scavenger):** High output but prone to "Leaking" (minor hull damage over time if pushed to 100%).
- **Fusion Shard (Rare):** High efficiency, low weight, near-instant power response. Coveted by Monastic Orders.
- **Concord Singularity (Exotic):** Geometric alien tech. Silent, infinite power, but attracts Concord attention.

---

## 2. Energy Distribution (The Pip System)

The player must manually route power from the reactor to three primary subsystems. This is done via a 12-pip distribution matrix.

### 2.1 The Three Pillars
- **ENG (Engines):** 
    - 0 Pips: Base speed, sluggish turning.
    - Max Pips: +50% Top Speed, +100% Acceleration, significantly faster turn rate.
- **WPN (Weapons):** 
    - 0 Pips: Slow fire rate, turrets rotate slowly.
    - Max Pips: +40% Fire Rate, instant turret tracking, faster missile lock-on.
- **SYS (Systems):** 
    - 0 Pips: Sensor range halved, armor repair is dormant.
    - Max Pips: +50% Sensor Range, +100% Crew Repair Rate, enables E-War modules.

### 2.2 Tactical Shifting
Players use the arrow keys or a UI dial to shift pips in real-time. 
- **Full ENG:** For running or intercepting.
- **Full WPN:** For the killing blow.
- **Full SYS:** For surviving a siege or searching nebulae.

---

## 3. Fuel & Consumption

Power isn't free. Consumption is a factor of **Throttle + Pip Allocation**.

- **Standard Consumption:** 1 Fuel Unit per 60s at Half Throttle / Balanced Pips.
- **High Consumption:** Up to 4x usage at Flank Speed / Max ENG Pips.
- **Refueling:** Can be done at any Fuel Depot or by landing on mineral-rich planets (Grist) to "Mine" raw isotopes.

---

## 4. Aesthetic: The Cyan Interface

Following the `UI.md` guidelines, the Energy System is represented in **Electric Cyan (`#00ffcc`)**.

### 4.1 HUD Elements
- **The Power Bar:** A vertical cyan segmented bar showing current reactor output.
- **The Pip Matrix:** Three horizontal sliders labeled ENG, WPN, SYS. Active pips are solid cyan blocks; inactive pips are hollow cyan outlines.
- **Visual Feedback:** When shifting pips, the corresponding ship systems (engines or weapons) briefly pulse with a cyan glow.
- **Reactor Overload:** If the reactor takes damage or is overclocked, the cyan display flickers with amber "WARNING" text.

---

## 5. Implementation Phases

- **Phase 1:** Core `EnergySystem` class to track pips and calculate stat multipliers.
- **Phase 2:** Cyan HUD overlay with interactive pip shifting.
- **Phase 3:** Fuel consumption logic and station-based refueling.
- **Phase 4:** Reactor modifiers (e.g., "Leaky Core", "Efficiency Tuning") and unique reactor types.
