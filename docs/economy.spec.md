Economy & Obligation: The Feudal Void

Status: Design Spec (Refined)

Scope: Barter, Favor, Oaths, and Social Capital in the Tyr System.

1. The Death of Credits

In the Afterlight Era, digital banking is a relic of the "Networked Intelligence" that destroyed Earth. With a population under 30,000, trade is personal, physical, and tied to survival. Credits have been purged from all UI and internal logic.

1.1 The Primary Commodities

All value is measured against the "Big Two" and the "Dense One":

- Fuel (Isotopes): The ability to move and stay warm.
- Scrap (Alloys): The ability to repair and maintain structure.
- Exotics (Isomers/Data-Cores): High-density value. Portable wealth used for high-tier upgrades and bribe-capital. These do not weigh as much as Scrap but are the only way to store "savings" without massive cargo fleets.

1.2 Hard Barter & Transaction Locking

Transactions at stations are direct swaps. To acquire a "Brawler" hull, a Shipyard might demand 400 units of Scrap and 100 units of Fuel.

- The Physical Wallet: Since there are no bank accounts, your "buying power" is limited by your Cargo Capacity.
- The Friction: If you cannot carry the required scrap for an upgrade, you cannot buy it. This makes Cargo Haulers essential even for combat fleets.
- Transaction Locking: Once a trade is initiated, the required cargo is "locked" in the manifest until docking is complete, preventing accidental consumption or jettisoning.

2. Palace Economics (The Favor System)

Major settlements (Keelbreak, Crucible, Thornwick) operate as Command Economies. They manage resources for their "subjects."

2.1 Tribute vs. Trade (Dynamic Desperation)

Instead of selling Food to a station, you deliver it as Tribute.

- Fulfillment: Stations have "Needs." Delivering a deficit good (e.g., Medicine to a plague-stricken outpost) grants Standing and Favor.
- Dynamic Desperation: If a station hasn't received a specific resource in 10 in-game days, the Favor payout doubles. This creates organic "Trade Routes" based on scarcity rather than fixed prices.

2.2 Provisioning (The Social Contract)

High Favor allows you to "request" items. You don't buy a Lancer; the Monastic Order invests a Lancer in you because you are a trusted protector.

- The Bureaucracy: High-tier requests are not instant. Large ship hulls or experimental weapons may have a "Delivery Delay" (e.g., 2 days) while the station's authorities authorize the transfer.
- Non-Transactional Favor: Favor is a social currency. "Spending" it for a ship might be better described as "Drawing on your political capital."

2.3 The Under-Barter (Black Market)

Every command economy has a shadow.
- The Fence: Hidden dealers in "Scrapper" hubs allow for direct swaps of Scrap for high-tier items without the need for Favor, but at a 50% premium and a risk of damaging reputation with the "Palace" authorities if scanned.

3. Feudal Obligations & Oaths

3.1 The Warden’s Oath (Protection)

A captain can pledge to defend a specific station or moon.

- On-Duty Status: While within the station's sensor range, fuel and armor repairs are free.
- HUD Feedback: Entering the radius while under oath triggers a [WARDEN STATUS: ACTIVE] indicator.
- The Oath-Breaker: Fleeing during an attack grants the "Oath-Breaker" trait.
    - Penalty: Friendly stations refuse docking.
    - Morale: Crew members may desert or mutiny if they perceive the captain as a coward.
    - Hunters: Triggers "Bounty Hunter" intercepts from the betrayed faction.

3.2 The Blood-Debt (Life Capital)

Crew members are bound by debt or oath.

- Life-Debts: Rescuing escape pods creates Life-Debts from the survivor's family.
- Usage: Life-Debts can be "spent" to bypass reputation requirements, get emergency repairs in hostile space, or recruit high-skill specialists.

3.3 Patronage & Apprenticeships

The Protégé: A Patron asks you to take a junior crew member into your fleet.
- Task: Keep them alive through "Lessons" (Combat, Salvage, etc.).
- Reward: Master-Key ROMs—physical cartridges that unlock pre-Exile ship schematics.

4. Trust Mechanics

4.1 The Hospitality Right (Safe Harbor)

Earning "Guest-Friend" status provides sanctuary.
- Sanctuary: Defensive batteries (PD, Lancers) protect you within the docking radius.
- The Taboo: Initiating combat within a Guest-Friend's territory revokes the status immediately.

4.2 Kinship & Lineage

Your flagship's "Lineage" (e.g., Arkship Persevere vs. Arkship Anvil) affects initial trust and access to dormant Concord vaults via Genetic Keys.

5. Implementation Roadmap

Phase 1: Barter Logic (COMPLETED: Credits Removed)
- Implement swap logic in StationScreen.js (Scrap/Fuel/Exotics as currency).
- [NEW] Implement Transaction Locking in the CargoManifest.

Phase 2: Favor & Tribute
- Add favor tracking to the ReputationSystem.
- Implement "Needs" with Dynamic Desperation multipliers.
- Implement Request delays for high-tier items.

Phase 3: The Oath State
- Change isUnderOath to an activeOaths array in GameManager.
- Implement HUD [WARDEN] indicators for orbital zones.
- Create the "Oath-Breaker" penalty and Crew Morale impact.

Phase 4: Narrative Obligations
- Integrate Life-Debts and Apprenticeships.
- Create "Apprentice" crew entities.
