# PLAN.md — Feature Plans & Concepts

Feature concepts and plans. Coded items are ready to build directly from this file. Ideas start rough and get refined here before implementation.

**Next available code: ED**

---

## Code Index

| Code | Title | Category |
|---|---|---|
| AP | Tribute & Favor System | Economy |
| AR | Black Market & Under-Barter | Economy |
| AS | Gravewake Zone Features & The Coil | World / Map |
| AV | Specialized Enemy Factions | AI / Enemies |
| AX | Named Bosses | AI / Enemies |
| BA | Story Threads & Trigger System | Narrative |
| BB | Mission & Bounty Board | Gameplay |
| BD | Procedural Audio | Audio |
| BE | Named NPC Ships & Persistent World Characters | AI / World |
| BF | Cloud Save System | Platform |
| BG | Module Affixes & Randomized Traits | Modules / Equipment |
| BL | Core Combat Philosophy — Disabling vs. Destroying | Gameplay |
| BM | Crew System — Named Crew, Health & Performance | Ship Systems |
| BO | Data Extraction — Computer Salvage | Scavenging |
| BQ | Crew Active Abilities | Ship Systems |
| BR | Electronic Warfare | Modules / Equipment |
| BU | Skiff & Planetary Landing | Gameplay |
| BV | Rogue Salvage Lord Fleet | AI / Enemies |
| BW | Player Housing & Personal Stash | Gameplay |
| BX | Monastic Order Expeditionary Ship | AI / World |
| BZ | Systemic Narrative Engine | Narrative |
| DD | Pale & Gravewake (Outer Fringe) | World / Map |
| DE | Cocytus & The Captain Lords (Ice Giant) | World / Map |
| DF | Boreas & House Casimir (Gas Giant) | World / Map |
| DG | Aethelgard & House Valerius (Super-Earth) | World / Map |
| DH | Khem & House Aridani (Starting Zone) | World / Map |
| DI | Ferrum & House Ignis (Twilight Ring) | World / Map |
| DJ | Non-Aligned Powers & System Geopolitics | World / Map |
| DK | Lore System Overhaul | Systems |
| DL | Gravewake Legacy Cleanup | World / Map |
| DN | Origin Stories — The Shared Incident | Narrative |
| DO | Contract System | Gameplay |
| DP | Advanced Salvaging | Gameplay |
| DQ | Barter / Favor / Influence System | Economy |
| DR | Small Item System | Gameplay |
| DS | Commodities Expansion | Economy |
| DT | The Kesra Belt (Asteroid Zone) | World / Map |
| DU | The Corra Family | World / Factions |
| DV | Great Houses — Culture & Character | World / Factions |
| DW | Mining — Asteroid Towing & Discovery | Gameplay |
| DX | Hauling Contracts — Procurement & Transportation | Economy |
| DY | Investigation & Informant Network | Gameplay |
| DZ | Salvage System Overhaul | Scavenging |
| EA | Crew System | Ship Systems |
| EB | Captain Skills | Ship Systems |
| EC | Experience Pools & Progression | Ship Systems |

---

## Editor and Designer



---

## Economy

### AP: Tribute & Favor System

Stations have periodic resource "Needs" — scarce goods they want delivered. Delivering a deficit good grants **Standing** and **Favor** (a separate social currency from faction reputation). Favor is spent to "request" high-tier items rather than buying them outright — the station invests the item in you as a trusted protector. High-tier requests (experimental weapons, ship hulls) have a delivery delay (1–2 in-game days) while authorities authorize the transfer.

- Stations have a "Needs" array with deficit goods, payout, and desperation timer
- Dynamic Desperation: if a station hasn't received a needed resource in 10 days, the Favor payout doubles
- Favor tracked separately from reputation per faction
- Provisioning screen: browse requestable items, see Favor cost and delivery delay
- Transaction locking: cargo is "locked" during active trades; prevents accidental jettison mid-dock
- Exotics (isomers/data-cores) as a third commodity — high-density portable wealth, small cargo footprint, used for large-favor transactions and high-tier provisioning

---

### DQ: Barter / Favor / Influence System

Non-scrap economy layer. Each Captain Lord tracks **Influence** separately from faction reputation.

- **Influence** — earned by completing contracts, delivering deficit goods, doing personal favors for a lord
- **Influence unlocks:** better prices, exclusive contracts, restricted station areas, narrative branches, intel
- **Favor tokens** — one-time-use rewards from lords (e.g., "Vance owes you a fuel fill" or "Kaelen will install one module free")
- **Cross-lord influence:** spending influence with one lord can be perceived as taking sides — optional tension mechanic

*Note: supersedes AP (Tribute & Favor System) with a Cocytus-specific implementation. AP's core concepts (station needs, dynamic desperation, provisioning) are absorbed here.*

---

### DR: Small Item System

Non-cargo-hold inventory for trinkets with narrative, barter, and story value.

- **Personal inventory** — separate from cargo hold, limited slots (5–10), zero mass
- **Item types:** data ROMs, keepsakes, tools, credentials, curiosities
- **Uses:** barter currency (some NPCs want specific items), conversation unlocks (show item to trigger dialogue), quest items, story flags made physical

**Initial roster:**
- Data ROM (various — nav data, encrypted logs, software fragments)
- Three-string guitar (worthless to most, priceless to one NPC)
- Drazel officer's insignia (old House badge — opens doors in some places, closes them in others)
- Concord shard fragment (Zealots want it, Monastics want it destroyed)
- Forged transit pass (lets you bluff past certain checkpoints)
- Miner's lucky charm (Ptolomea keepsake — sentimental value)
- Solis proxy mask (one of Solis's communication masks — very valuable, very suspicious)

**Key files:** `data/enums.js` (add `ITEM_TYPE`), `engine/systems/playerInventory.js` (add `items[]`), `data/items/` (new directory, self-registering)

---

### DS: Commodities Expansion

Split scrap into tiers and add commodity depth for the Cocytus Circuit economy.

**Scrap tiers:**
- **Junk scrap** — lowest value, most common (hull fragments, wiring). Current "scrap" becomes this.
- **Salvage scrap** — medium value (intact components, usable parts). Drops from better derelicts.
- **Refined scrap** — highest value, only from processing or high-tier salvage. Universal premium currency.

**New commodities:**
- **Coolant** — needed for forge operations (Antenora imports)
- **Oxygen** — life support consumable (all stations need, Caina produces as byproduct)
- **Spare parts** — generic repair material (distinct from machine_parts — more basic)

**Changes:** `data/commodities.js` (add entries, split scrap), `engine/systems/playerInventory.js` (scrap becomes commodity tracked in cargo), loot tables, salvage yields, trade prices rebalanced for Cocytus Circuit.

---

### DX: Hauling Contracts — Procurement & Transportation

*Note: This replaces and supersedes the hauling/acquisition components of DO (Contract System). DO's mercenary contracts remain unchanged.*

Trading is not buy-low-sell-high speculation. The player is a hauler — someone trusted to move important goods between people who need them. This is an identity, not just a mechanic.

**Two Contract Types**

**Transportation:** A client needs goods moved from location A to location B. The player picks up the cargo and delivers it. Reward scales with distance, cargo value, and time sensitivity. Reliability matters — a hauler who consistently delivers on time builds reputation; one who fails loses contracts.

**Procurement:** A client needs a specific item or quantity of material sourced and delivered. The client doesn't care *how* the player gets it — mine it, buy it from surplus stock at another station, pull it from a salvaged wreck, or find it some other way entirely. This creates emergent multi-system play: a rare engine part procurement might be solved through salvage (DZ), mining (DW), or following an informant lead (DY).

**Relationship-Based, Not Market-Based**

Contracts come from relationships, not an open exchange. Clients trust haulers they know. Players build a roster of repeat clients through good work, and those clients offer better contracts over time — higher value, more interesting cargo, more flexibility on method.

There is no galactic commodity ticker. Players do not arbitrage price differences between stations. The economy is personal and relational.

**Cargo Risk**

Hauled cargo can be lost to combat, tether failure (if being towed), or failed salvage. Some cargo is regulated or contraband in certain jurisdictions — carrying it through inspected space has its own risks. Clients who lose their shipment are not happy.

---

### AR: Black Market & Under-Barter

Every command economy has a shadow. Hidden fence dealers at Scrapper hubs allow direct scrap-for-goods swaps — no Favor required, but at a 50% premium. Risk of reputation damage if scanned carrying restricted goods.

- Fence dealer UI: available at The Coil, Voss's Waystation, other Scrapper hubs
- Black Market Manifest module (see AN) hides cargo from station scanners
- Black Market Relay Buoy: untraceable comms buoy in Gravewake, offers illicit bounties not on standard boards
- Concord Transponder module (see AN) spoofs Concord IFF signal
- Lineage & Genetic Keys: flagship's arkship lineage (e.g., Persevere vs. Anvil) affects initial trust at faction stations and unlocks dormant Concord vaults via lineage-coded access sequences

---

## World / Map

### AS: Gravewake Zone Features & The Coil

The Gravewake orbital zone is dense with history. The Coil is its central hub — a massive U-shaped station built by bolting derelict ships and abandoned stations together over decades. It wraps around a central harbor of active scrapping operations. Lawless and backwater. Ruled by an elite class of Salvage Lords.

**The Coil Interior Districts:**

**1. The Dock (Repair Yard)**
- Primary entry point: docking, refueling, full ship repair
- Owned by one of the Salvage Lords; managed by a shady Harbor Master
- Fuel prices cheaper than standalone depots but still steep; Salvage Lord monopoly keeps overall prices high

**2. The Salvage Yard**
- Primary industrial store for ship parts and salvage
- Run by a different Salvage Lord
- Used equipment, salvaged modules, raw scrap, ship components
- After completing a specific questline, player can hire a specialized salvage crew member here

**3. The Central Market (Black Market)**
- Lively, eclectic, shady marketplace — hub for all non-ship goods; reflects Gravewake's lawless character
- Goods: food, contraband (drugs, alcohol), illegal AI cores, character equipment
- **The Tavern:** buy food/drink, gather rumors, pick up quests
- **The Chop Shop:** shady medical clinic; pay to heal injured crew members
- **Specialty Stalls:** ammo vendors, personal goods, knick-knacks
- **The Oddities Store:** rare and mysterious items salvaged from deep-space wrecks

**4. "The Palace" (Elite District)**
- Luxurious living quarters for the station's elite — stark contrast to surrounding squalor
- Home to the main Salvage Lord captains and their cronies
- Initially barred to the player; houses the station's primary wealth; late-game / high-reputation area

**5. The Slums**
- Massive, densely packed residential labyrinth of welded-together shipping containers
- No stores — narrative hub filled with diverse NPCs, characters, and lore
- Player can eventually purchase their own home here (see BW)

**Megastructure Terrain:**
- Arkship Spines — kilometers-long shattered structural beams as massive wireframe polygons with internal ribbing; navigation landmarks, cover from enemies
- Wall of Wrecks — dense looping belt of early colonization craft; physical chokepoints that force ships into predictable Trade Lanes
- The Frozen Fleet — cluster of pristine early colonization ships encased in hydrogen ice; rich pre-Exile tech inside, but hull damage risk and high ambush probability

**Hidden POIs:**
- Voss's Waystation — fortified resupply point for Dread Captain Voss; requires high scavenger reputation or deciphered patrol routes to find; unique black-market inventory
- Black Market Relay Buoy — untraceable comms buoy; high-tier illicit bounties

---

### DD: Pale & Gravewake (Outer Fringe)

**Progression tier: Endgame.** The true frontier — the deep unknown.

The boundary between the inner system and the Kuiper-style asteroid belts. First landing point of all humans exiled from Earth; a massive, frozen archaeological site.

- Landscape is a graveyard of ancient ships and orbital debris
- Primary territory of the Salvage Lords — independent clans scrapping "Old World" wrecks for pre-Exile electronics and hull plating
- Geopolitics: an "Outer Wild West" existing just beyond the formal authority of House Casimir
- See AS for The Coil and zone features

---

### DE: Cocytus & The Captain Lords (Ice Giant)

A massive ice giant in the outer Tyr system. Solar energy is non-existent — all power comes from geothermal taps, chemical refining, or salvaged reactor cores. Four Captain Lords — disgraced veterans of the Casimir Uprising — each control one moon from orbit aboard a rusting dreadnought too broken to leave. The Cocytus Circuit is a desperate survival economy enforced by mutual blockade — each lord controls one critical resource, ensuring none can be eliminated without collapsing the whole system.

**Progression tier: Late Mid-game.** The player reaches Cocytus after escaping inner system politics. Nobody chooses Cocytus. You end up here because everywhere else spit you out.

**The Four Moons:**

| Moon | Nickname | Captain Lord | Ship | Specialization |
|---|---|---|---|---|
| **Caina** | The Dirty Tap | Vance | Acheron | Fuel & chemicals — taps frozen volatiles for liquid hydrogen/oxygen |
| **Antenora** | The Scrap Forge | Kaelen | Iron Sovereign | Heavy industry — geothermal-powered fabrication, reliant on ore imports |
| **Ptolomea** | The Slag Heap | Vorosh | World-Breaker | Rare earth mining — high-metallic core, mines nearly exhausted |
| **Judecca** | The Algae Vats | Solis | Radiant Aegis | Farming — massive light-capture algae farms, only food source in orbit |

**Zone Layout:**

Scale: ~20,000 × 12,000 world units. Cocytus itself is a massive background element (like Pale) — the moons orbit it at varying distances.

- **Cocytus (background):** Enormous ice giant rendered as CRT-style topographic sphere (adapt PlanetPale renderer). Banded atmosphere — methane blues, ammonia whites. Centered, parallax-scrolled. NOT collidable.
- **Caina (NW):** ~4000, 2500 — volatile geysers, frozen chemical lakes, pipeline infrastructure
- **Antenora (NE):** ~16000, 2500 — geothermal vents, forge glow, orbital scrap rings
- **Ptolomea (SE):** ~16000, 9500 — cratered, dark, mine shaft openings visible from orbit
- **Judecca (SW):** ~4000, 9500 — pale green algae bloom glow, light-capture arrays
- **Trade lanes** between moons marked by beacon buoys — visible convoy routes
- **Drift zones** between lanes — debris fields where independents lurk
- **The Gap** — empty central space around Cocytus, dangerous to cross (no cover)

---

**CAINA — The Dirty Tap** (Lord Captain Vance)

*Fuel refinery moon. Frozen volatiles tapped for liquid hydrogen/oxygen.*

- **Station: Tap Station** — fuel depot bolted to a cracking refinery platform. Functional, minimal, smells like chemical burn. Services: fuel (cheapest in system), basic repair, trade.
- **Dreadnought: Acheron** — visible in high orbit, running lights still blinking. Vance broadcasts price lists and threats from here.
- **Vance:** Former Drazel quartermaster who embezzled fuel reserves during the collapse. Businesslike, transactional, sees everything as a ledger entry. Will deal with anyone who pays. The most "reasonable" of the four lords — which makes him the most dangerous, because he never acts without calculating the margin.
- **Commodities:** Surplus: reactor_fuel. Deficit: machine_parts, ration_packs. Imports food and parts, exports fuel at extortionate markup.
- **Terrain:** Chemical geyser vents (periodic hazard — visual + minor knockback), frozen pipeline infrastructure (cover/terrain), fuel storage tank clusters.
- **Local threats:** Independents raid fuel convoys leaving Caina. Zealot missionaries sometimes approach broadcasting sermons.
- **Narrative beats:**
  - First dock: Vance's dock master explains the Circuit — prices, rules, who controls what
  - Fuel debt: dock with no scrap, Vance offers fuel on credit — creating a debt he will collect on later (favor/influence hook)
  - Intel: Vance knows everything about everyone's supply lines. Will sell information for scrap or favors.

---

**ANTENORA — The Scrap Forge** (Lord Captain Kaelen)

*Heavy industry moon. Geothermal-powered fabrication hub.*

- **Station: The Forge Floor** — built into a geothermal vent shaft. Hot, loud, crowded. Sparks and slag. Services: repair (best in system), module installation, trade.
- **Dreadnought: Iron Sovereign** — in low orbit, listing badly, hull scored with old battle damage.
- **Kaelen:** Mutineer who killed her commanding officer during the Fall of Drazel. Pragmatic, blunt, respects competence. Runs the fabricators and mechanics — nothing gets repaired in Cocytus without her cut. Knows every ship in the subsystem by the sound of its drive.
- **Commodities:** Surplus: alloys, hull_plating. Deficit: raw_ore, reactor_fuel. Imports ore and fuel, exports finished goods.
- **Terrain:** Orbital scrap rings (fabrication waste), geothermal vent plumes, work-light glow visible at distance.
- **Local threats:** Independents steal finished goods from outbound convoys. Concord probes drawn to electromagnetic forge signatures.
- **Narrative beats:**
  - First dock: Kaelen's foreman assesses your ship and tells you what's wrong with it (tutorial for repair/modules)
  - Reputation gate: higher-tier module work requires standing with Kaelen
  - Kaelen's grudge: unfinished business with Vorosh (he supplies her ore but squeezes her on price). Player can be drawn into this tension.

---

**PTOLOMEA — The Slag Heap** (Lord Captain Vorosh)

*Mining moon. High-metallic core, mines nearly exhausted.*

- **Station: Pit Head** — mine head elevator platform converted into a station. Grim, spartan, workers move like ghosts. Services: trade (raw materials cheap), basic repair, salvage processing.
- **Dreadnought: World-Breaker** — in high orbit, weapons still operational (the only lord who maintains armament). Uses the threat of orbital bombardment to keep miners in line.
- **Vorosh:** Brutal taskmaster who worked prisoners to death in the Drazel ore mines, then kept working them when the House fell. His mines are nearly exhausted — he's desperate, which makes him volatile. The most openly dangerous lord. Will hire mercenaries for dirty work.
- **Commodities:** Surplus: raw_ore. Deficit: ration_packs, medical_supplies. Imports everything his workers need to survive, exports the only thing he has.
- **Terrain:** Cratered surface, mine shaft openings (dark voids), tailings piles, ore hauler debris. The darkest moon — minimal reflected light.
- **Local threats:** Concord probes drawn to mineral signatures. Desperate miners sometimes steal ships and turn independent.
- **Narrative beats:**
  - First dock: the station is oppressive — workers barely speak, overseers watch everything
  - Dirty work: Vorosh offers high-paying but morally ugly contracts (suppress a miner revolt, intercept a deserter ship, intimidate a trade partner)
  - The exhaustion: Vorosh knows his mines are dying. He's looking for new mineral sources — mid-game quest hook
  - Whispers: some miners have heard Concord transmissions coming from deep in the mines

---

**JUDECCA — The Algae Vats** (Lord Captain Solis)

*Farming moon. Massive light-capture algae farms, only food source in orbit.*

- **Station: The Green** — sterile, controlled, smells like wet metal and chlorophyll. Airlocked sections, UV decontamination. Services: trade (food commodities), medical, intel.
- **Dreadnought: Radiant Aegis** — in distant orbit, barely visible. Solis has not been seen in person for years. Communicates through proxies.
- **Solis:** Paranoid hermit who speaks through intermediaries. Controls the only food production in the subsystem. Rumors: she's not actually aboard the Radiant Aegis anymore. Or she's merged with something. Or she's dead and the proxies are running the show. Nobody knows. The algae tastes like copper and regret but it keeps you alive.
- **Commodities:** Surplus: ration_packs, bio_cultures. Deficit: electronics, reactor_fuel. Imports power and tech to keep the vats running, exports food.
- **Terrain:** Light-capture arrays (geometric panels reflecting dim starlight), algae bloom glow (faint green), sealed biodome structures on the surface.
- **Local threats:** Zealot missionaries specifically target Judecca — food supply is leverage, and converting Solis's workers would give them control over the entire Circuit.
- **Narrative beats:**
  - First dock: you deal with a proxy. Everything is indirect, filtered, controlled.
  - The mystery: what happened to Solis? Multiple competing rumors, no confirmation
  - Food leverage: Solis's proxies trade information and favors for protecting food shipments from Zealots
  - Late-game reveal potential: what's really going on aboard the Radiant Aegis

---

**Enemy Roster (3 threat types):**

1. **Independents / Drifters** (most common) — failed settlers, mutineers, stranded travelers raiding supply runs. Fly cobbled-together Onyx Tugs and beat-up Couriers. AI: lurker (ambush from drift zones) and stalker (hit-and-run). Low threat individually, dangerous in packs. Some desperate enough to surrender. Faction: none (unaligned, no rep consequence).

2. **Concord Probes** (rare, dangerous) — autonomous Concord fragments drawn to electromagnetic signatures. Fly drone-type ships (existing Concord entity subclasses). AI: patrol + aggressive when approached. High-value salvage (Concord tech modules, data cores). Faction: concord.

3. **Zealot Missionaries** (uncommon, hostile) — Zealots of the Directive preaching conversion or elimination. Fly modified ships with broadcasting equipment. AI: kiter (stay at range, broadcast, engage if approached). Hostile to all non-aligned humans. Target Judecca food supply. Carry propaganda items and Concord-derived tech. Faction: zealots.

**Factions:** Each Captain Lord is a root faction (vance, kaelen, vorosh, solis) with independent reputation tracking.

**Cocytus Progression (mid-game arc):**
- **Arrival:** player reaches Cocytus fleeing inner system entanglements — underpowered, underequipped
- **Survive the Circuit:** earn scrap hauling between moons, take odd jobs, salvage drift-zone wrecks
- **Captain Lord politics:** Kaelen vs Vorosh tension, Solis mystery, Vance's schemes
- **Escape outward:** earn/build/steal enough to make the journey toward Gravewake and the outer fringe
- **The gate:** leaving Cocytus requires either enough fuel + hull integrity to survive the transit, OR a favor from Vance (fuel discount) + intel from Solis (safe route)

---

### DF: Boreas & House Casimir (Gas Giant)

**Progression tier: Mid-game.** Casimir heartland.

A massive gas giant with a prominent ring system. Formerly the seat of House Drazel; now the power base of House Casimir following the uprising (2487–2491). Casimir absorbed the other three Houses — Valerius, Aridani, and Ignis retain regional identity but operate under Casimir authority.

- Casimir is culturally perceived as "New Blood" — their legitimacy is still questioned in some quarters
- The Boreas Ring debris field is a monument to the decisive battle that broke Drazel's fleet

**The Order of the Static (Moon: Vesper):**
- Independent monastic order on a moon of Boreas
- Fanatically anti-Concord — believe Concord's technology led to humanity's downfall and exile
- Hoard and tweak pre-Exile technology; the only entity capable of producing "modern" electronics, though stalled at roughly 1980s-level technology (analog circuits, early digital systems)

---

### DG: Aethelgard & House Valerius (Super-Earth)

**Progression tier: Early Mid-game.** The political capital.

The administrative and economic capital of Tyr. House Valerius retains significant influence as Casimir's diplomatic arm — they merged their trade networks into the Casimir apparatus but kept their bureaucratic machinery intact.

**The Primary (The Veiled World):**
- 4–6× Earth's mass with a crushing, thick atmosphere
- Surface conditions are an impenetrable mystery

**The Twin Industrial Moons — The Cosmopolis:**
- **Oros** and **Thalassa** (0.7 and 0.8 Earth masses)
- **The Shipwright Guild (Independent):** Based in massive orbital drydocks of Oros. Monopolizes the skills and tech needed to integrate components (Casimir steel, Ignis reactors, Static electronics) into functional starships. No House can build a ship without their blessing

---

### DH: Khem & House Aridani (Starting Zone)

**Progression tier: Starting area.** The player begins here. All three origins converge on Khem / the Kesra Belt.

A rocky planet positioned between Aethelgard and the inner sun — hotter than Mars, thin atmosphere. House Aridani became "Casimir's breadbasket" after the absorption — they grow the food, Casimir sets the prices. Quietly resentful, deeply proud, obsessed with self-sufficiency.

- Focused on large-scale terraforming and agricultural logistics
- Khem provides the bulk calories that feed the population of Tyr
- **The Water Road:** Khem is entirely reliant on constant ice shipments from Cocytus and Boreas to maintain its vast farming complexes. One interrupted ice shipment from catastrophe.
- **Gravity:** 0.7g

**Visual Design:**

*Surface:*
- Baked, bleached rock. Not red — pale yellows, washed-out oranges, bone-white where rock has been cooked over millions of years
- No evidence of water. No canyons, no riverbeds. Everything shaped by wind: rolling dunes, jagged rocky mountain ranges with sharp angular edges (no water erosion to soften them)
- Constant dust storms — slow-moving, horizon-blotting events

*Sky:*
- Thin atmosphere means almost no light scattering
- Deep dark purple-black at zenith during the day
- Fades to pale yellowish-white haze near the horizon
- The sun looks visibly larger and more brutal than from Earth
- Harsh, unforgiving shadows with almost no diffusion

**Settlements — Crater Architecture:**

Khem's settlers use craters as the foundation for habitation. Crater rims act as natural windbreaks against dust storms. The bowl shape reduces dome structural load. Depth below the rim lowers the height the dome must span.

- From orbit: craters with glittering transparent membrane stretched across the top
- Larger ancient impact craters = larger settlements. Small craters = single farming operations or remote outposts
- **The Domes:** Transparent — capturing intense direct sunlight is the whole point. UV-filtered glass, structurally low-profile, heavily anchored against wind. From orbit they catch light and glitter against the pale hostile landscape. Inside: lush, carefully managed crops. The contrast between the brutal alien sky above and the green below is a defining visual of Khem.

**Infrastructure — The Water Road:**

Khem has no natural water. All water arrives as ice from Cocytus and Boreas via orbital ice haulers. This is Khem's fundamental vulnerability and the source of enormous political tension.

- **The Main Hub (capital crater — NAME TBD):** The largest ancient impact crater on the planet. Has a dedicated orbital station above it. Ice haulers descend from orbit, offload water, load food, and take back off. The crater city below is a logistics hub — warehouses, Aridani administrative buildings, Corra Family legitimate business fronts.
- **The Train Corridors:** From the hub, pressurized trains run along fixed corridors across the surface, carrying water out to the farming plantations and food back. Trains have large fans on the front that blow sand clear of the tracks. Tracks are slightly raised / reinforced to resist dune encroachment.
- **Trucks:** The smallest and most remote settlements get by with pressurized surface trucks. Slow, dangerous in storms, but cheaper than train infrastructure.
- **Flight is difficult:** 0.7g helps but the thin atmosphere gives aircraft almost nothing to work with — enormous inefficient engines needed for even short hops. Not viable for cargo. Trains and trucks win.

**Items pending development:**
- Khem capital crater — name TBD
- Khem orbital station — name and character TBD
- Khem governor — specific Aridani character TBD

---

### DT: The Kesra Belt (Asteroid Zone)

A new asteroid belt zone between Khem and Aethelgard. The connective tissue between the farming world and the capital — busy with trade traffic, loosely policed, and full of independent operators trying to stay off everyone's radar.

- Dense enough to provide cover and ambush points
- Mining operations, some legitimate, some fronts
- Corra Family has depots and contacts embedded here
- Casimir patrols the edges but doesn't venture deep
- Natural home turf for the Salvage Kid origin
- Independents and pirates here are unaligned (no faction, no rep consequence) — similar to Cocytus Drifters

**Narrative role:** This is where the shared origin incident happens — a Corra Family raid on a salvage craft. The Combat Pilot's first job. The Salvage Kid's father killed. The PI's quarry fled from here.

---

### DI: Ferrum & House Ignis (Twilight Ring)

The innermost planet — a dense iron world tidally locked to the sun. House Ignis negotiated favorable terms during the Casimir absorption — their smelters and reactors are too valuable to punish.

- The smallest and most heavily armed former Great House
- **The Uranium Monopoly:** controls the only viable uranium ore deposits in the system
- **The Great Ring Road:** a massive underground highway connecting crater-citadels in the twilight band
- Military specialty: advanced nuclear reactors and high-velocity railguns

---

### DU: The Corra Family

The dominant organized crime syndicate of the inner system. Not a pirate clan — a **crime family** with legitimate business fronts, political contacts, and three centuries of leverage. Think mafia, not pirates. Embedded in the Kesra Belt between Khem and Aethelgard, with tendrils into both planets.

**Origin:** The Corra Family did not become criminals after humanity arrived at Tyr. They were **essential during the Exodus fleet itself.** When official supply chains collapsed on the generation ships — and they did, constantly — the Corras were the people who found food when there was no food, medicine when the dispensaries ran dry, parts when the engineers said the ship was unfixable. They saved lives. They also charged everything they could, and built a network of favors and debts that survived the landing intact. By the time the fleet reached Tyr, the Corra family had three generations of leverage over half the people in the inner system. They didn't claw their way up — they were grandfathered in before civilization started.

**Structure:**
- **Matriarch-led.** The current head is a woman old enough to have heard the fleet stories firsthand from her grandmother. She sees herself as a steward of something ancient and necessary, not a criminal. *The system needs us. It always has.*
- Mix of legitimate business (shipping, logistics, import/export) and criminal operations (smuggling, extortion, contract violence, black market goods)
- Operates primarily in the Kesra Belt and on Khem, with contacts on Aethelgard
- Everyone knows about the Corra Family. Authorities sometimes crack down. Sometimes they turn a blind eye — especially when Casimir needs something moved quietly.

**Faction:** `corra` — "The Corra Family", defaultReputation: 0 (neutral until triggered)

**Items pending development:**
- Matriarch — name and personality TBD. Key traits: old, sharp, believes in the family's historical legitimacy, personally dangerous, capable of genuine warmth and genuine cruelty.

---

### DV: Great Houses — Culture & Character

Each house has been shaped by the world they inhabit. Not just political factions — distinct cultures.

**House Aridani — Khem (The Farmers):**
Quietly resentful, deeply proud, obsessed with self-sufficiency. They grow everything everyone eats and Casimir sets the prices — a fundamentally humiliating position. Think in seasons and harvests, not quick deals. Patient, long-memoried, slow to trust outsiders. Feudally feel like landed gentry — governors managing crater estates for generations. Outwardly gracious and hospitable (you don't turn away visitors on a world this unforgiving). Inwardly calculating what they can extract. Governor type: old family estates, formal titles, inherited positions, obsessive record-keeping.

**House Casimir — Boreas (The Bureaucrats):**
New money pretending it's old. Won the Uprising through supply chain manipulation and a carefully sprung ambush, not martial glory. Compensate with rigid bureaucracy, elaborate protocol, and manufactured legitimacy. Rules, ranks, titles, documentation. Disciplined, administratively ruthless, quietly paranoid about legitimacy challenges. Governor type: appointed administrators, not hereditary lords. Formal to the point of coldness.

**House Valerius — Aethelgard (The Diplomats):**
Old network, old money, genuinely old bloodline. Survived every political upheaval by being useful to whoever was winning. Cultured, cosmopolitan, elegant — they run the capital world and they know it. Speak in careful language, never say anything directly, never make an enemy when they can make a complicated friend. The most dangerous house to negotiate with because you'll leave the table thinking you won. Governor type: hereditary but worn lightly — power from relationships and trade networks. More dinner invitation than formal audience.

**House Ignis — Ferrum (The Pragmatists):**
Hardened by their world. Everything on Ferrum is difficult. Compact, practical, no-nonsense. No time for ceremony. They have uranium and railguns — that is enough. The most blunt and direct of all the houses. Respected but not particularly liked. Negotiated favorable terms because everyone knew their smelters were too valuable to touch. They know exactly what their leverage is and never let anyone forget it. Governor type: military-adjacent, titles tied to industrial output and technical expertise.

---

### DK: Lore System Overhaul

Standardize all flavor text under a unified lore format with tags and entity references. Currently `flavorText` is a bare string on ships, characters, stations, weapons, derelicts (and derelicts use a separate `lore` field). Standardize to a consistent shape.

**Changes:**
- Add `LORE_TAG` enum to `data/enums.js` — freeze all current free-form tag strings as enum values (e.g., `LORE_TAG.TYR`, `LORE_TAG.CONCORD`, `LORE_TAG.GROUNDING`, `LORE_TAG.CAPTAIN_LORDS`, etc.)
- Rename `CONTENT.history` → `CONTENT.lore` in `data/dataRegistry.js`
- Update `registerContent('history', ...)` → `registerContent('lore', ...)` in `globalHistory.js` and `tyrHistory.js`
- Standardize all `flavorText` fields across content types to shape: `{ text: string, tags: LORE_TAG[], related?: string[] }` where `related` is an array of entity/content IDs
- Derelict `lore` field → same standardized shape
- Update designer History category → "Lore" category
- Update all consumers: designer panel, narrative log, station sections, HUD pickup text

**Key files:** `data/enums.js`, `data/dataRegistry.js`, `data/lore/*.js`, all content files with `flavorText`, `engine/test/designer.js`, `engine/ui/designerPanel.js`

---

### DL: Gravewake Legacy Cleanup

Strip outdated Gravewake content. Keep reusable graphics and renderers. Delete legacy faction code.

**Delete:**
- `data/factions.js` (legacy wrappers: `FACTIONS`, `FACTION_LABELS`, `FACTION_MAP`, `RIVALS`)
- `data/lore/factions/root.js` — remove `settlements`, `scavengers`, `communes` entries
- `data/lore/factions/children.js` — remove `kells-stop`, `ashveil`, `the-coil`, `grave-clan`
- `data/locations/tyr/pale/orbital/locations/kells-stop/` — entire directory
- `data/locations/tyr/pale/orbital/locations/ashveil-anchorage/` — entire directory
- `data/locations/tyr/pale/orbital/characters/` — all character files
- `data/locations/tyr/pale/orbital/ships/` — all ship configs
- `data/locations/tyr/pale/orbital/derelicts/` — all derelict files
- `data/locations/tyr/pale/orbital/manifest.js`

**Keep (relocate or preserve as templates):**
- `the-coil/renderer.js` — CoilStation renderer (957 lines, most elaborate station visual)
- `terrain/planet-pale/index.js` — PlanetPale background renderer (reusable CRT-style planet template)
- `terrain/debris-clouds/index.js` — DebrisCloud class (reusable)
- `terrain/arkship-spines/index.js` — ArkshipSpine class (reusable)
- `planets/pale.js` — Planet entity pattern (template for Cocytus moons)

**Update references:**
- `engine/systems/collisionSystem.js` — change `'settlements'` to new faction
- `engine/rendering/colors.js` — update faction color palette (add captain lord factions)
- `engine/game.js` — remove debug `'scavengers'` reference
- `data/index.js` — remove `data/factions.js` re-export
- Skill files in `.claude/commands/wayfarer/` — update faction lists
- `scripts/templates/setting.md` — update worldbuilding narrative

**Add 6 new root factions** to `data/lore/factions/root.js`:
- `vance` — "Lord Captain Vance" (Caina/fuel), defaultReputation: 0
- `kaelen` — "Lord Captain Kaelen" (Antenora/fabrication), defaultReputation: 0
- `vorosh` — "Lord Captain Vorosh" (Ptolomea/mining), defaultReputation: 0
- `solis` — "Lord Captain Solis" (Judecca/food), defaultReputation: 0
- `corra` — "The Corra Family" (Kesra Belt/Khem), defaultReputation: 0
- `aridani` — "House Aridani" (Khem), defaultReputation: 10

Remaining roots after cleanup: **concord, monastic, zealots, casimir, vance, kaelen, vorosh, solis, corra, aridani** (10 total)

---

### DJ: Non-Aligned Powers & System Geopolitics

The Casimir consolidation left three entities outside House authority:

| Entity | Base | Role |
|---|---|---|
| **The Order of the Static** | Vesper (Boreas) | Controls all electronic logic and computer systems |
| **The Shipwright Guild** | Oros (Aethelgard) | Controls all high-end manufacturing and naval construction |
| **The Salvage Lords** | The Coil (Gravewake) | Control the flow of ancient "high-tech" scrap |

**House Casimir** holds the inner system through trade and the absorbed strength of three former Houses:

| Former House | Base | Current Role Under Casimir |
|---|---|---|
| **Valerius** | Aethelgard | Diplomatic apparatus, trade networks |
| **Aridani** | Khem | Agricultural production |
| **Ignis** | Ferrum | Nuclear industry, military hardware |

---

## AI / Enemies


---

### BX: Monastic Order Expeditionary Ship

A single massive, heavily armored capital ship belonging to the Monastic Order of techno-priests. Present in Gravewake on a scavenging mission — they are hunting long-lost artifacts or a super-weapon capable of defeating the Concord AI, which they are diabolically opposed to.

- Their main base is elsewhere in the system; this is a forward expeditionary deployment
- Initially **strictly off-limits and locked** to the player; access can eventually be gained through reputation or story progression
- Not aggressive unless provoked or restricted areas are violated

**The Mercy Mechanic:**
- If the player approaches in a critical state (< 25% fuel or severely damaged hull), the monks will patch up the ship and provide enough fuel to return to safety — for free
- Accepting charity creates a **favor debt** to the Order: the player will owe them something, collected at a later story moment
- This mechanic makes the Order feel present and morally distinct even before the player has access to their ship

---

## Ship Systems

### BM: Crew System — Named Crew, Health & Performance

Ships are operated by small, named crews — 1 to 5 members depending on ship size. Not abstract officer roles; individual people with health that can be directly damaged.

**Crew Health & Derelict System:**
- Each crew member has individual HP, damaged especially by explosive weapons
- If all crew are killed, the ship immediately becomes a **Derelict** — disabled but with potentially intact hull and modules; prime high-value salvage target
- Crew death chance spikes when hull drops below 25% (Red tier)

**Performance Degradation Tiers** (applies to both crew health and module health):
- **Green (76–100%):** Peak proficiency, no performance penalty
- **Yellow (50–75%):** Minor degradation begins
- **Orange (25–50%):** Significant performance loss
- **Red (0–25%):** Critical failure; crew death chance from incoming fire is dramatically elevated

Crew are recruited at stations (reputation-gated), found via rescue events, or inherited. Permanent death — no respawn. The ship is meaningfully weaker for losing a crew member.

---

### BQ: Crew Active Abilities

Specific crew roles unlock active, high-risk/high-reward combat maneuvers. Each costs resources or causes damage.

- **Engine Burst (Engineer):** Burns a large amount of fuel to jump the ship — extremely fast movement for ~3 seconds to secure a tactical position. Risk: chance to damage the engine module.
- **Overdrive / Enhanced Flank (Engineer):** Pushes flank speed significantly above normal. Burns extra fuel and damages the engine over time.
- **Crazy Ivan (Pilot):** Instantaneous 180° rotation — immediately reverses heading. Cost: stress damage directly to hull points.
- **Rapid Fire (Gunner):** Significantly reduces weapon cooldown timers. Cost: direct damage to the fired weapon modules.
- **Data Siphon (Electronics Expert):** Safely bypasses derelict security to extract Software ROMs (new EW abilities or ship software upgrades) and valuable system logs. See also BO.

---

### EA: Crew System

*Note: Expands and replaces BM (Crew System — Named Crew, Health & Performance). BM's health/performance concepts remain valid; this document adds the four-role taxonomy, skill trees, and hiring system.*

Crew are NPCs hired to fill specialist roles aboard the player's ship. The player is the captain — they are never simply another crewmember. The crew handles technical execution; the captain handles command, diplomacy, and personal action.

**The Four Crew Roles**

**Piloting:** Navigation, maneuvering, and flight operations. Two specialization branches:
- *Combat Pilot* — evasion, tactical maneuvering, pursuit, combat approach angles
- *Navigator* — long-haul routing, fuel efficiency, hazard avoidance, chart reading

**Combat:** Weapons operation, targeting, and tactical response.
- *Gunner* — weapon accuracy, reload speed, target prioritization
- *Boarding Specialist* — personal combat, ship boarding, close-quarters action (used when boarding derelicts or enemy ships on foot)

**Engineering:** All technical ship systems. Broadest role with the most branches:
- *Salvage Tech* — extraction speed, module recovery quality, hull assessment
- *Mechanic* — hull repair speed, module repair, damage control
- *Systems Engineer* — power management, electronic systems, hacking, electronic warfare

**Science:** Research, analysis, and life support adjacent roles.
- *Medic* — crew health, injury treatment, drug synthesis
- *Analyst* — data recovery from derelict computers, scanner interpretation, log decryption
- *Botanist/Biologist* — ship-grown food, organic material processing, biological skill checks

**Skill Trees & Specialization**

Each role has a shared skill tree with branches. A hired crew member arrives with some skills already developed and a natural *learning affinity* — they advance faster in their specialty branch but can cross-train into adjacent skills over time. An engineer hired as a salvage specialist can eventually pick up repair skills; they just progress more slowly there.

**Hiring**

Crew are found at stations — not universally available everywhere. Some specialists are rare in certain regions. A hire's existing skills and affinities are visible at hire time. Traits (see EB) may also be visible.

**Crew Loss**

Losing a crew member is a setback, not a catastrophe. Their accumulated experience is gone, but the player can retrain a new hire using the same experience pools (EC). Captain skills can reduce crew loss risk and speed up new crew development.

---

### EB: Captain Skills

The player-character's personal progression. Captain skills are distinct from crew skills in two ways: some apply global modifiers that help both the captain and matching crew, and some are exclusive to the captain as the ship's sole diplomat and commander.

**Four Technical Branches (Mirror Crew Roles)**

The captain has their own piloting, combat, engineering, and science skill trees. These represent the captain's personal competence — useful when acting alone, and also applied as global modifiers that slightly boost the equivalent crew member's performance. However, captain skills in these areas will *never* match a dedicated specialist. The modifier is meaningful but the ceiling is lower.

**Two Captain-Exclusive Branches**

*Diplomacy:* The captain is always the face of the ship. Trading negotiation (better contract rates, procurement options), faction persuasion, bribery effectiveness, interrogation, and reading people (see DY). No crew member replaces the captain here.

*Leadership:* Crew morale and performance management. Skills here boost experience gain rates for crew (EC), reduce the chance of crew defection or poor morale, and provide active abilities like rallying crew during a crisis. Leadership is the multiplier on everything else.

**Traits**

Traits are permanent modifiers acquired at character creation (via origin selection) and potentially through major in-game events. They are not skills — they cannot be trained. Examples:
- *Salvager Origin:* +15% salvage extraction speed; crew gain salvage-branch experience 25% faster
- *PI Origin:* Bribery attempts cost less; informant network contacts start at higher trust
- *Combat Origin:* Personal combat skills start with one tier unlocked; combat pilot crew gain experience faster

Traits give origin starts flavor and a head start without locking players into a path. Starting as a PI but pivoting to salvage? Your PI traits don't hurt salvage — they just don't help it either.

---

### EC: Experience Pools & Progression

Skills are not purchased with generic points. Experience is earned by doing, categorized by type, and spent specifically.

**Five Experience Pools**

- **Combat Experience** — earned through successful weapon hits, kills, surviving combat, completing combat contracts
- **Piloting Experience** — earned through navigation, hazard avoidance, docking maneuvers, long-haul travel
- **Engineering Experience** — earned through salvage operations, repairs, module extraction, mining
- **Science Experience** — earned through scanning, data recovery, medical treatment, botanical yields
- **Diplomacy Experience** — earned through successful negotiations, bribery, interrogation, completed investigation contracts

Each pool has its own bar that fills through relevant gameplay. Pools fill faster or slower depending on what the player actually does — a session of pure combat builds combat experience rapidly, negligibly advances science.

**Spending Experience**

Accumulated experience points in each pool are spent to unlock or upgrade skills in the matching tree — for both the player captain and crew members. A crew member's skill unlock costs experience from the relevant pool; the player captain draws from the same shared pools.

This creates interesting allocation decisions: spend engineering experience on the captain's own engineering skills, or use it to advance the crew's salvage tech branch? A hybrid crew skill (e.g. an engineer ability that also requires combat experience) draws from multiple pools simultaneously.

**Hybrid Skills**

Some advanced skills at the intersection of two disciplines require two pool types to unlock. This creates meaningful choices: you may have abundant combat experience but insufficient engineering experience to unlock a cross-discipline ability. Pursuing hybrid skills incentivizes varied play.

**Captain Leadership Multiplier**

High leadership skills (EB) increase the rate at which experience pools fill — both for the captain and for crew operating in their specialty. This makes leadership investment feel impactful across the entire progression system without making it mandatory.

**Crew Loss & Retraining**

When a crew member is lost, their personal skill development is gone. However, the experience *pools* are unaffected — the player still has all the accumulated engineering experience they spent developing that crew member. Hiring and re-developing a replacement costs experience, but the pools exist to absorb that cost if the player has been active in the relevant gameplay.

---

## Narrative

### DN: Origin Stories — The Shared Incident

Three origins built around **one shared inciting incident** seen from three different positions. No player will know this on their first run. On a second playthrough as a different origin, everything recontextualizes.

**The incident:** A Corra Family raid on a salvage craft in the Kesra Belt. A father is killed. His son is left for dead. The young raider who pulled the trigger flees.

All three start broke. All three start in the Khem / Kesra Belt region. All three are entangled in the same incident without knowing it. Same narrative structure (async conversation with sub-choices), same `game.applyOrigin()` API.

---

**Origin 1: The Combat Pilot**
*Gameplay focus: Fighting, mercenary work, aggressive play*

- **Ship:** Old rusty scout ship — barely armed, minimal fuel, fragile. Hard start.
- **Starting location:** Khem orbital station / Kesra Belt vicinity
- **Background:** Grew up in the Kesra Belt, raised by the Corra Family. Obsessed as a kid with stories of chivalrous space knights — mythologized figures from before the Exile. At sixteen, the family gave you your first ship — an old rusty scout. Your first job was a raid on a salvage craft. A father and his son. The father was killed. The son was left alive. You sat in the cockpit and realized: in every story you loved, you were the bandit. Not the knight. You fled instead of returning home.
- **Corra relationship:** They consider you a liability. You know names, routes, contacts. They will eventually want to deal with that.
- **Mechanical implications:** Starts with combat skills, minimal everything else. Driven to take risky, underpaid jobs helping people — trying to become the knight. The son is out there somewhere. That thread emerges in late game.

---

**Origin 2: The Salvage Kid**
*Gameplay focus: Trading, salvaging, economic survival*

- **Ship:** Father's stripped salvage hauler — barely flying, cargo hold picked clean, damaged
- **Starting location:** Limps to Khem — the nearest planet
- **Background:** Your father ran a small salvage operation in the Kesra Belt. Just the two of you. A raid hit your ship. You don't know who ordered it. Pirates boarded, your father was killed, they stripped everything of value and left you drifting. You limped to Khem on fumes.
- **Corra relationship:** Has no idea it was the Corra Family specifically. Just knows it was raiders. As they work the belt and build contacts, the Corra Family name starts appearing. The slow realization is one of the best narrative threads in the game.
- **Mechanical implications:** Driven by economic survival first, then grief, then eventually justice — or the choice to let it go. The question of whether the Combat Pilot ever confesses — if they meet — is a major late-game moment.

---

**Origin 3: The Private Investigator**
*Gameplay focus: Questing, information gathering, faction navigation*

- **Ship:** Small, fast, fragile — minimal cargo, no weapons worth mentioning
- **Starting location:** Khem — the last known location of the target
- **Player defined:** Name and gender are player-defined.
- **Background:** You're a small-time private eye. The Corra Family hired you to track down a young raider who fled the family. A kid, by all accounts. Last seen heading toward Khem. The family pays well. You didn't ask why.
- **Corra relationship:** On their payroll. They know your face. You're useful to them — which means they'll keep pulling you back in.
- **Mechanical implications:** Immediately embedded in a morally complex situation. The further you dig into *why* this kid ran, the harder it becomes to complete the job. Gameplay is entirely about talking, gathering intel, spending favors, following leads. Cannot fight or haul your way through problems. Hard/diplomatic mode. At some point must decide: complete the job, bury it, or burn the contract and make an enemy of the Corra Family.

---

| Origin | Ship | Gameplay | Emotional Hook | Corra Relationship |
|---|---|---|---|---|
| **Combat Pilot** | Rusty scout, barely armed | Fighting, mercenary work | Guilt, redemption | Fled the family. They want you quiet. |
| **Salvage Kid** | Stripped hauler, barely flying | Trading, salvaging | Grief, survival, unknowing justice | Doesn't know it was them. Yet. |
| **PI** | Small fast ship, no weapons | Questing, intel, faction nav | Moral ambiguity, the family's leash | On their payroll. For now. |

**Items pending development:**
- Space knights mythology — what are the chivalrous figures the Combat Pilot idolized? Real historical faction? Myth? Still-existing group in the outer system? Should connect to late-game lore.
- The son / combat pilot reunion — late-game narrative thread, mechanics TBD

**File:** rewrite `data/conversations/originSelection.js`

---

### BA: Story Threads & Trigger System

Three optional story threads discoverable through exploration. No forced storyline — each unfolds via found items, faction interactions, and player choices.

**"The Warlord's Compact"** — Hear rumors about Dread Captain Voss unifying scavenger clans. Find a scavenger chart to his hideout. Fight or negotiate with his lieutenants. Final choice: join (gain scavenger allies, lose settlement trust), destroy (bounty + rep shift), or broker a truce. Reward: Voss's flagship, major scrap payout.

**"The Sleep Directive"** — Find a fragmented Concord transmission in the Ashveil nebula. Follow signal fragments across locations guarded by Concord patrols. Discover a dormant Concord shard attempting to re-initiate the Sleep Directive. Choice: help activate it, destroy the signal, or deliver it to the Monastic Orders. Reward: unique Concord tech upgrade, major faction rep shifts.

**"The First Inhabitants"** — Hear legends about a creature in the deepest nebula, older than the arkships. Find clues from ships that tried to hunt it. Confront The Hollow Mind. Discovery: void fauna may be Concord-engineered quarantine measures — the system was locked, not abandoned. Reward: exotic biological materials, unique ship component, world-reframing lore.

**Trigger System Architecture:** Each thread is a JS file exporting an object with `id`, `name`, and `steps[]`. Steps contain trigger conditions (flag checks, location proximity, item possession), text, and outcomes (set flags, grant items, modify rep). `game.storyFlags{}` tracks progression passively.

---

### BZ: Systemic Narrative Engine

A framework for weaving handcrafted narrative threads into the systemic world. Avoids the "random event" feel of pure procedural generation and the *Sunless Sea* problem where strict item requirements stall progression and force backtracking. Narratives are consequence-driven, diegetic, and localized to the player's current situation.

**State Access API (Dot-Notation Interface):**
- Story files query game state via abstracted string paths, decoupled from internal code
- Entity proximity: `world.distance.pale < 1000`
- Inventory/modules: `ship.modules.contains.fission_reactor_faulty`
- Reputation/stats: `faction.concord.rep <= -50`
- Combat state: `combat.recent_kills.scavenger > 3`
- If underlying systems change, only the API translation layer updates — narrative files remain stable

**Multi-Faceted Triggers (Multiple Entry Points):**
- Story beats accept multiple trigger paths rather than a single specific action
- Example: a Concord anomaly plotline triggers from salvaging a specific derelict, OR being scanned by Concord while carrying tech, OR docking at Ashveil with a ruined reactor
- **Systemic Alternatives (The Sunless Sea Fix):** if a beat requires bypassing a lock, the system accepts systemic solutions — high faction rep, OR large scrap payment, OR a specific module installed, OR accepting hull damage to force it

**Diegetic Delivery Methods:**
- **Comms Queue:** short text transmissions pushed to the existing Pickup Text system
- **World-Space Anchors:** lore text rendered next to derelicts/stations/anomalies, readable only when the ship is close
- **Station Service Overrides:** a routine station tab temporarily hijacked by a story interaction (NPC encounter, hacked terminal)
- **Systemic State Changes:** story physically alters the world — faction hostility flips, unmapped derelicts spawn nearby, player modules forced offline

**Telegraphing & Pacing:**
- **Breadcrumb System:** before a major systemic shift, the game drops minor hints — a comms whisper (*"He knows what you took."*), then local neutrals flee instead of trading, then the threat spawns
- **Active Thread Tracking:** the "Intel" tab at stations passively summarizes current entanglements based on active story flags — a diegetic memory aid, not a quest log
- **Locality Bias:** once a thread is active, subsequent steps heavily favor nearby POIs or the player's current zone; the story comes to the player rather than forcing a twenty-minute fetch trip

**Prototype Story: "The Ghost in the Core":**
- *Phase 1 — The Hook:* triggered by salvaging a high-tier derelict OR spending 1000+ scrap at The Coil. Delivery: magenta world-space text — *"Unrecognized sub-routine installed. Do not power down."*
- *Phase 2 — The Escalation:* monitors the player's reactor module for damage or repair attempts. Reactor output halved by the story engine; a Concord drone spawns nearby ignoring normal AI, broadcasts coordinates
- *Phase 3 — The Resolution:* player goes to the coordinates (spawned locally) and faces a Concord terminal. Solution A: surrender the salvaged data core. Solution B: destroy the terminal (spawns hostile Concord hunters, fixes reactor). Solution C: use an Electronic Warfare module to purge the infection

*Note: supersedes BA's trigger architecture with a more flexible, systemic approach. BA's three story threads remain as content — BZ provides the engine that runs them.*

---

## Gameplay

### DO: Contract System

Formalize contracts as a game system beyond the current bounty board. Each Captain Lord's station offers contracts based on their needs and rivalries.

**Contract types:**
1. **Hauling** — deliver commodity X from moon A to moon B. Reward: scrap + reputation with destination lord. Risk: convoy interdiction by independents.
2. **Mercenary: Kill** — eliminate a named target (independent raider, Zealot cell leader). Existing bounty system, expanded.
3. **Mercenary: Escort** — protect a convoy between moons. Reward: scrap + rep. Failure: rep penalty.
4. **Mercenary: Capture** — disable (not destroy) a target ship for salvage. Requires precision weapons. Higher reward.
5. **Mercenary: Find** — locate a missing ship/person in drift zones. Exploration + potential combat.
6. **Acquisition** — find and deliver a specific module, commodity, or small item. Scavenge or trade for it.

**System architecture:**
- `engine/systems/contractSystem.js` — manages active contracts, expiry, completion detection
- Station conversation `contracts.js` — browse/accept available contracts (replaces per-station bounties.js)
- Contracts generated from station data: each station defines contract templates based on its lord's needs
- Active contract HUD indicator (destination marker, time remaining)

---

### DP: Advanced Salvaging

Expand the current salvage system (which is just a timer → loot roll) into a more engaging loop.

- **Salvage scanning:** before committing, scan the derelict to see potential loot (modules visible, cargo manifest, structural integrity)
- **Salvage choices:** player chooses focus — strip modules (slow, high value), grab cargo (fast, medium value), or scrap the hull (fast, low value but guaranteed)
- **Hazards:** some derelicts are trapped (Concord countermeasures, unstable reactors, ambush triggers)
- **Salvage bay module tiers:** basic (cargo only) → advanced (modules + weapons) → experimental (Concord tech extraction)

---

### DW: Mining — Asteroid Towing & Discovery

Mining is not a grinding or clicking loop — it is a discovery and logistics loop. The interesting part is the *hunt*, not the extraction.

**Discovery — The Hunt**

Asteroids are not all equal or obvious. Players scan asteroid fields looking for valuable signatures. Rare or high-value asteroids have distinct scanner readings that reward attention and skill. Dense fields require careful navigation to even reach candidates. Discovery itself is the primary skill expression.

**Core Sampling**

Once a promising asteroid is identified, the player must dock with it to core sample — drilling in to analyze what is actually inside. This creates a risk window: the player is stopped, exposed, and vulnerable while determining whether the find is worth towing. The decision — is this worth the risk of extraction? — is the central tension of the activity.

**Towing**

Small-to-medium asteroids are attached via tether and towed back to port. The tether has a rated weight limit but can be overloaded if the find is valuable enough. Risks of overloading scale with how far over capacity the load is:
- At recommended capacity: tether holds reliably
- Over capacity: increasing chance of tether snap mid-transit, losing the asteroid entirely
- Players cannot chase and recover a lost asteroid — it is gone

**Large Asteroid Splitting**

Asteroids too large to tow intact must be broken apart with explosives first. This creates a debris cloud of chunks. The player then selectively jettisons worthless rock while keeping ore-rich pieces — a quick spatial/physics puzzle managed through the tether and ship positioning. Not a minigame; just managing momentum and mass.

**Combat Interruption**

If attacked while towing, the player must decide:
- Disconnect tether, fight or flee, return for the asteroid later (it drifts free)
- Attempt to fight while towing (severely hampered maneuverability)

The asteroid drifting free is not instant loss — a skilled player can return and re-attach if the area is cleared quickly.

**Interconnection**

Mining ties into procurement contracts (DX): a client who needs rare ore may tip the player toward a known asteroid field. Informant network contacts (DY) may know where a particularly rich deposit was recently spotted.

---

### DY: Investigation & Informant Network

Core mechanic for the Private Investigator origin (and available to all players as a playstyle). Investigation is not a menu system or quest marker — it is a social and spatial puzzle built from the game's existing world.

**No Quest Markers**

The game has no waypoint markers. Players must remember, take notes, and act on information gathered through play. Investigation makes this explicit: you are given a *name* or *problem*, not a destination.

**Finding People**

A primary activity is locating a specific person — to question them, deliver a message, or apprehend them. Finding someone is dynamic, not scripted:
- Contacts at stations have observed people coming and going
- Bartenders, vendors, and residents remember faces
- The target moves through the world on their own schedule; your information may be stale

**The Informant Network**

Over time, players build a personal network of paid contacts across stations, settlements, and factions. Network members are NPC individuals with their own personalities, loyalties, and reliability. Building the network requires investment: paying for information, doing favors, earning trust. A larger and more diverse network means faster and more reliable leads.

Informant contacts also serve as connectors — "I don't know, but I know someone who might." The network has depth, not just breadth.

**Reading People & Bribery**

Bribery is not a universal tool. Offering money to the wrong person causes offense and damages or destroys that contact permanently. Before attempting a bribe, players should read the contact through dialogue — do they seem motivated by money? Do they hint at financial trouble? Does their faction suggest corruption? Offering a bribe is a risk/read decision, not a default option.

The same logic applies to intimidation and flattery — different approaches work on different people, and misreading someone has consequences.

**Dialogue & Stat Checks**

Standard dialogue trees with randomized stat checks and skill-influenced outcomes. Nothing unusual here — the novelty is in *what* information you're seeking and *why it matters* rather than the mechanical structure of conversations.

**Interconnection**

The informant network ties into all other systems. A contact may point toward a derelict worth salvaging (DZ). A procurement contract client (DX) may confide that the item they need was last seen on a specific ship. Informant leads replace quest markers throughout the game.

---

### BL: Core Combat Philosophy — Disabling vs. Destroying

Combat is designed to feel weighty and strategic — positioning, timing, and resource management over arcade action. The key tension: **how** you defeat an enemy determines what you get from it.

**Weapon damage profiles shape outcome:**
- **Explosive weapons (missiles, HE rounds):** High hull damage; high crew kill chance (especially sub-25% hull); high chance of destroying equipped modules. Fast kill, little left intact.
- **Precision/energy weapons (railguns, lance beams):** High armor damage; low hull damage; low crew/module collateral. Preserves the target — ideal for boarding prep or high-value module extraction.

The player must decide before engaging: do I want this ship dead, or do I want what's inside it?

---

### BB: Mission & Bounty Board

Procedurally generated missions available at stations, cycling on a timer. All bounties are tied to named people and listed crimes — not anonymous "kill 3 enemies."

**Mission types:**
- **Patrol** — "Destroy 3 scavenger skiffs near Keelbreak" — rep + scrap reward
- **Elimination** — "Hunt down [Named Captain] for [specific crime] last seen near [location]" — larger payout
- **Escort** — "Protect NPC convoy from A to B" — favor reward from destination faction; failure damages rep with both factions
- **Salvage** — "Recover black box from derelict in the Boneyards" — exotic/module reward

High-tier missions unlock at higher reputation thresholds. Bounties are for real crimes against the pre-generated NPC population (see BE) — the victim or their faction posts the bounty.

---

### BU: Skiff & Planetary Landing

The player's main ship cannot navigate gravity wells or land on planetary/lunar surfaces directly. To do so, it must be equipped with a **Skiff** — a smaller, independent dropship stored in a dedicated large module slot.

- The Skiff launches from the main ship while it holds position in orbit
- Designed to navigate gravity wells, land on surfaces, and explore planetary environments
- Required to land on Pale (see BS) and any other landable body in the system
- Surface exploration is a separate gameplay context from space combat — expect radiation, hostile environments, ruins, and on-foot (or skiff-scale) encounters
- The Skiff itself has its own stats: hull, fuel, and cargo capacity; it can be upgraded or swapped
- If the Skiff is destroyed on the surface, the player must find another way off (emergency signal, rescue, or alternative route)

---

### BW: Player Housing & Personal Stash

In The Coil's Slums, the player can eventually purchase their own home — a converted shipping container unit in the residential labyrinth.

- Functions as a personal stash: store excess items and cargo when the ship's hold is full
- Provides a persistent world anchor — a place the player "lives" beyond their ship
- Stash access only while docked at The Coil
- Home can potentially be upgraded over time (larger storage, workbench, etc.)
- Access gated behind some combination of scrap cost and Coil reputation / story progression

---

## Modules / Equipment

### BG: Module Affixes & Randomized Traits

Diablo 2-style randomized modifier system for modules. Each module found in the wild has a randomly rolled affix (or pair of affixes) that slightly changes its properties — a Worn Autocannon with a "Rapid" affix has higher fire rate but lower damage; a Faulty Fission Reactor with a "Stable" affix has lower power but resets its overhaul timer. Creates build variety and makes scavenging feel like loot hunting.

Affixes are constrained by module type — not every affix applies to every module. Common affixes slightly improve one stat, Rare affixes trade off two stats, Exotic affixes are unique and potentially game-changing. Station-purchased modules are clean (no affixes); salvage is where the interesting rolls happen.

---

### BR: Electronic Warfare

Managed by a "Computer/Electronics Expert" crew member (see BQ). Provides non-lethal combat options for disabling rather than destroying.

- **Decoys** — deployable countermeasures that draw enemy fire and distract tracking missiles
- **Disruptors** — targeted weapon modules that fire electronic payloads; temporarily disable specific enemy systems (engines, weapons) without hull damage; ideal for capture/salvage setups

---

## Scavenging

### DZ: Salvage System Overhaul

*Note: Supersedes and expands DP (Advanced Salvaging). Retain DP's scanning and hazard concepts; this document adds equipment tiers, visual reading, ship towing, and log discovery.*

Salvage is tiered by equipment, skill-gated, and discovery-driven. The loop begins with finding something worth salvaging — which is itself the first challenge.

**Finding Derelicts**

Derelicts are rare and not marked. Players find them through:
- Distress signal echoes (scanner contact, direction only — no distance)
- Debris field trails leading back to a wreck
- Informant network tips (DY) — contacts who know about recent losses
- Log entries recovered from previously salvaged ships pointing to others

**Visual Reading**

Before committing to a salvage approach, experienced players can read a derelict's exterior to estimate its value:
- Visible module types on exterior hardpoints suggest what's inside
- Hull condition, visible damage, and construction quality signal likely loot
- Ship class and faction markings indicate probable cargo
- A cobbled-together scavenger skiff with scrap armor is probably not worth the time; a Concord frigate is

This rewards learning the game's ship visual language. It is not a guaranteed assessment — surprises exist in both directions.

**Equipment Tiers**

Three tiers of salvage capability, determined by modules installed:

*No salvage equipment (baseline):* Strip scrap metal from hull plating. Drain fuel tanks. Take ammo. Nothing else.

*Salvage Bay (medium module slot):* Extract intact modules from derelict racks. Recover cargo. Still cannot repair or assess module condition reliably.

*Engineering Bay (large module slot):* Repair damaged modules using materials. Repair other ships. Assess module condition accurately. The engineering bay does not help with extraction speed — it helps with what you do with what you've extracted.

**Skill & Risk in Repair**

Attempting to repair a module beyond your skill level risks destroying it. The check factors in the player's engineering skill and any engineering crew (EA). A damaged but potentially valuable module presents a genuine decision: repair now at risk, or sell it damaged?

**Ship Towing**

Intact enough derelicts can be towed back to port whole (using the same tether system as asteroid mining, DW). A ship in good condition is worth significantly more sold intact than parted out. However:
- Heavily damaged ships may break apart during the tow
- Mid-tow combat requires dropping the tow (lose it) or fighting at severe disadvantage
- The player must assess hull integrity before committing to a tow

**Log Discovery**

Derelicts contain recoverable data: ship logs, crew records, navigational history. These serve dual purposes:
- Lore — flavor text that expands the game world and specific story threads
- Actionable leads — logs may reference other derelicts, stash locations, or people worth finding (feeding back into DY)

---

### BO: Data Extraction — Computer Salvage

With a Computer/Electronics Expert crew member (see BQ), the player can interface with a derelict's mainframe before scrapping.

- Recovers encrypted lore logs, navigational data, and Software ROMs
- Software ROMs unlock new Electronic Warfare abilities or upgrade existing ship software
- Requires the Data Siphon crew ability to bypass derelict security safely
- High-value targets (Concord derelicts, pre-Exile ships) carry the most interesting data


---

### BF: Cloud Save System

Persistent save data stored remotely via a Cloudflare KV database. Allows play across devices and protects against browser data loss.

- Save slot keyed to a user identifier (generated on first play, stored in a cookie or localStorage)
- CSRF protection to prevent unauthorized writes
- Schema: version, timestamp, player state (scrap, fuel, cargo, modules, ship stats), world state (story flags, destroyed boss IDs, discovered locations, NPC roster states)
- Auto-save at dock; manual save option in pause menu
- Offline fallback: continue using localStorage if KV is unreachable; sync on next successful connection

---

## Audio

### BD: Procedural Audio (Stretch Goal)

All audio generated via Web Audio API — no asset files required.

- **Engine sound** — oscillator pitch and volume track throttle level; distinct tones per ship class
- **Weapon fire** — short generated tones per weapon type (high ping for railgun, thud for cannon, buzz for autocannon, low hum for lance beam)
- **Explosions** — noise burst with low-frequency rumble, scaled by blast radius
- **Ambient background** — very low filtered noise for deep-space atmosphere
- **UI sounds** — click/confirm tones on dock, purchase, and menu actions

---

## Ship Systems / Modules


**Future ideas (unshipped):**
- Wear & Tear: low-quality modules degrade during regular use, not just combat

---

## System Progression (Inner → Outer)

| Zone | Body | Progression Tier |
|---|---|---|
| **Starting Zone** | Khem + The Kesra Belt (DH, DT) | Starting area |
| **Early Mid** | Aethelgard + Oros/Thalassa moons (DG) | Political capital |
| **Mid** | Boreas + Vesper moon (DF) | Casimir heartland |
| **Late Mid** | Cocytus + four moons (DE) | The Captain Lords |
| **Endgame** | Gravewake / Pale (DD, AS) | The outer frontier |

Inner system is tight, controlled, watched. Moving outward feels like genuine escape — less law, more freedom, more emptiness. Cocytus becomes a mid-game hub (the escape hatch from inner system politics). Gravewake becomes the true endgame frontier.

---

## Build Order

| Phase | Features | Dependency |
|---|---|---|
| **1. Foundation** | DK (lore overhaul), DL (legacy cleanup) | None — do first |
| **2. Starting World** | DH (Khem), DT (Kesra Belt), DU (Corra Family), DN (origins) | Needs DK + DL done |
| **3. Loops** | DO (contracts), DP (salvaging) | Needs DH/DT world to exist |
| **4. Economy** | DQ (barter/influence), DR (small items), DS (commodities) | Needs DO + DP loops |
| **5. Expansion** | DE (Cocytus), DG (Aethelgard), DF (Boreas), DD (Gravewake) | Needs core loops working |

