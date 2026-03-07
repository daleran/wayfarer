# Economy Overhaul Design Spec: The Living Market

> **Status:** Design Spec
> **Scope:** Dynamic pricing, station production/consumption, black markets, and investment systems.

---

## 1. Dynamic Market Simulation

The economy of the Tyr system is no longer static. Supply and demand shift based on time and player interaction.

### 1.1 Production & Consumption
Every station has a **Production Profile** and a **Consumption Profile**.
- **Tick Rate:** Every 5 minutes (or upon certain player actions), stations update their inventory.
- **Consumption:** A Mining Station (Grist) consumes 2 units of **Food** every tick. If Food is empty, the station enters a "Famine" state, doubling the price they are willing to pay for it.
- **Production:** A Farm Station (Thalassa) produces 3 units of **Food** every tick, up to its max capacity. As capacity fills, the selling price drops.

### 1.2 Price Elasticity
Prices follow a curve based on current stock vs. max capacity.
- **Surplus (80-100% full):** 0.5x Base Price.
- **Deficit (0-20% full):** 2.5x Base Price.
- **Player Impact:** Selling a massive haul of Ore to a station will visibly drop the price for subsequent sales.

---

## 2. Market Events (Volatility)

Random events can disrupt trade routes, forcing the player to adapt.
- **Mine Collapse (Grist):** Ore production stops for 15 minutes. Ore prices spike system-wide.
- **Concord Interference:** A specific trade lane is blocked by a Concord shard. Stations at either end see prices skyrocket due to lack of supply.
- **Bumper Crop (Thalassa):** Food production triples. Food becomes nearly free at agricultural hubs.

---

## 3. Black Markets & Smuggling

Contraband (Concord Artifacts, Prohibited AI Cores) cannot be sold at standard terminals in Settlement stations.

### 3.1 The Fence
- Players must find a **Fence** (located in Scavenger Dens or hidden in Settlement bars).
- **Smuggling Heat:** Carrying contraband increases the chance of a Militia Patrol scanning you.
- **Silent Running:** A new toggle (linked to Muffled Baffles modifier) that reduces sensor profile at the cost of speed, allowing players to slip past patrols into stations.

---

## 4. Investment & Trade Convoys

Late-game players can move from "Hauler" to "Merchant Prince."

### 4.1 Convoy Funding
- Fund a neutral AI trade convoy (2 Carts + 1 Ox).
- You take a 20% cut of their profits.
- **Risk:** You must protect them from Scavengers, or they will be destroyed and your investment lost.

### 4.2 Station Shares
- Invest a large sum (e.g., 50,000 credits) into a station's infrastructure.
- Provides a permanent 5-10% discount on all goods and repairs at that station.

---

## 5. Implementation Phases

- **Phase 1:** Basic Production/Consumption loop for Food and Ore.
- **Phase 2:** Market Events system (UI alerts for spikes/crashes).
- **Phase 3:** Smuggling mechanics and Fence locations.
- **Phase 4:** Investment and Convoy systems.
