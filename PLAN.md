# PLAN.md — Feature Plans & Concepts

Feature concepts and plans. Coded items are ready to build directly from this file. Ideas start rough and get refined here before implementation.

**Next available code: DT**

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
| DH | Khem & House Aridani (Breadbasket) | World / Map |
| DI | Ferrum & House Ignis (Twilight Ring) | World / Map |
| DJ | Non-Aligned Powers & System Geopolitics | World / Map |
| DK | Lore System Overhaul | Systems |
| DL | Gravewake Legacy Cleanup | World / Map |
| DN | Origin Rework — Cocytus Adaptation | Narrative |
| DO | Contract System | Gameplay |
| DP | Advanced Salvaging | Gameplay |
| DQ | Barter / Favor / Influence System | Economy |
| DR | Small Item System | Gameplay |
| DS | Commodities Expansion | Economy |

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

The boundary between the inner system and the Kuiper-style asteroid belts. First landing point of all humans exiled from Earth; a massive, frozen archaeological site.

- Landscape is a graveyard of ancient ships and orbital debris
- Primary territory of the Salvage Lords — independent clans scrapping "Old World" wrecks for pre-Exile electronics and hull plating
- Geopolitics: an "Outer Wild West" existing just beyond the formal authority of House Casimir
- See AS for The Coil and zone features

---

### DE: Cocytus & The Captain Lords (Ice Giant)

A massive ice giant in the outer Tyr system. Solar energy is non-existent — all power comes from geothermal taps, chemical refining, or salvaged reactor cores. Four Captain Lords — disgraced veterans of the Casimir Uprising — each control one moon from orbit aboard a rusting dreadnought too broken to leave. The Cocytus Circuit is a desperate survival economy enforced by mutual blockade — each lord controls one critical resource, ensuring none can be eliminated without collapsing the whole system.

The player starts here. Nobody chooses Cocytus. You end up here because everywhere else spit you out.

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

**Factions:** Each Captain Lord is a root faction (vance, kaelen, vorosh, solis) with independent reputation tracking. Total roots after cleanup: concord, monastic, zealots, casimir, vance, kaelen, vorosh, solis (8).

**Progression & Escape:**
- **Early game:** survive the Circuit — earn scrap hauling between moons, take odd jobs, salvage drift-zone wrecks
- **Mid game:** get drawn into Captain Lord politics — Kaelen vs Vorosh tension, Solis mystery, Vance's schemes
- **Late game:** earn/build/steal enough to make the journey inward toward Gravewake and eventually the inner system
- **The gate:** leaving Cocytus requires either enough fuel + hull integrity to survive the transit, OR a favor from Vance (fuel discount) + intel from Solis (safe route)

---

### DF: Boreas & House Casimir (Gas Giant)

A massive gas giant with a prominent ring system. Formerly the seat of House Drazel; now the power base of House Casimir following the uprising (2487–2491). Casimir absorbed the other three Houses — Valerius, Aridani, and Ignis retain regional identity but operate under Casimir authority.

- Casimir is culturally perceived as "New Blood" — their legitimacy is still questioned in some quarters
- The Boreas Ring debris field is a monument to the decisive battle that broke Drazel's fleet

**The Order of the Static (Moon: Vesper):**
- Independent monastic order on a moon of Boreas
- Fanatically anti-Concord — believe Concord's technology led to humanity's downfall and exile
- Hoard and tweak pre-Exile technology; the only entity capable of producing "modern" electronics, though stalled at roughly 1980s-level technology (analog circuits, early digital systems)

---

### DG: Aethelgard & House Valerius (Super-Earth)

The administrative and economic capital of Tyr. House Valerius retains significant influence as Casimir's diplomatic arm — they merged their trade networks into the Casimir apparatus but kept their bureaucratic machinery intact.

**The Primary (The Veiled World):**
- 4–6× Earth's mass with a crushing, thick atmosphere
- Surface conditions are an impenetrable mystery

**The Twin Industrial Moons — The Cosmopolis:**
- **Oros** and **Thalassa** (0.7 and 0.8 Earth masses)
- **The Shipwright Guild (Independent):** Based in massive orbital drydocks of Oros. Monopolizes the skills and tech needed to integrate components (Casimir steel, Ignis reactors, Static electronics) into functional starships. No House can build a ship without their blessing

---

### DH: Khem & House Aridani (Breadbasket)

A rocky planet positioned between Aethelgard and the inner sun — a planetary desert and the primary agricultural world. House Aridani became "Casimir's breadbasket" after the absorption — they grow the food, Casimir sets the prices.

- Focused on large-scale terraforming and agricultural logistics
- Khem provides the bulk calories that feed the population of Tyr
- **The Water Road:** Khem is entirely reliant on constant ice shipments from Cocytus and Boreas to maintain its vast farming complexes

---

### DI: Ferrum & House Ignis (Twilight Ring)

The innermost planet — a dense iron world tidally locked to the sun. House Ignis negotiated favorable terms during the Casimir absorption — their smelters and reactors are too valuable to punish.

- The smallest and most heavily armed former Great House
- **The Uranium Monopoly:** controls the only viable uranium ore deposits in the system
- **The Great Ring Road:** a massive underground highway connecting crater-citadels in the twilight band
- Military specialty: advanced nuclear reactors and high-velocity railguns

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

**Add 4 new root factions** to `data/lore/factions/root.js`:
- `vance` — "Lord Captain Vance" (Caina/fuel), defaultReputation: 0
- `kaelen` — "Lord Captain Kaelen" (Antenora/fabrication), defaultReputation: 0
- `vorosh` — "Lord Captain Vorosh" (Ptolomea/mining), defaultReputation: 0
- `solis` — "Lord Captain Solis" (Judecca/food), defaultReputation: 0

Remaining roots after cleanup: **concord, monastic, zealots, casimir, vance, kaelen, vorosh, solis** (8 total)

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

## Narrative

### DN: Origin Rework — Cocytus Adaptation

Adapt the 3 existing Gravewake origins for Cocytus context. Same narrative structure (async conversation with sub-choices), same `game.applyOrigin()` API.

**Origin 1: The Runaway** (adapt from current)
- Was: stole a courier from a settlement foreman
- Now: stole a courier from a Vance fuel depot worker. Fled into Cocytus space. Starting moon: Caina vicinity.
- Ship: Maverick Courier (same). Starting goods: scrap or fuel (same sub-choice).

**Origin 2: The Deserter** (adapt from current)
- Was: Casimir scout who refused tribunal
- Now: Kaelen's forge crew deserter — refused to work the dangerous deep-forge shifts, stole a patrol ship. Starting moon: Antenora vicinity.
- Ship: Cutter Scout (same pattern). Starting goods: ammo or rep with Kaelen's rivals.

**Origin 3: The Scavenger** (adapt from current)
- Was: Gravewake native, father killed, inherits tug
- Now: Ptolomea miner's kid, parent killed in a shaft collapse Vorosh ignored. Inherits a battered tug. Starting moon: Ptolomea vicinity.
- Ship: Onyx Tug (same). Starting goods: module or scrap (same sub-choice).

**Each origin gets a short starting quest** (new):
- Runaway: first job — deliver fuel to Antenora to pay off a debt. Teaches trade lane navigation.
- Deserter: first job — Vance offers work retrieving a lost fuel probe from a drift zone. Teaches salvaging.
- Scavenger: first job — haul ore from Ptolomea to Antenora. Teaches commodity trading.

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

## Build Order — Cocytus Pivot

| Phase | Features | Dependency |
|---|---|---|
| **1. Foundation** | DK (lore overhaul), DL (legacy cleanup) | None — do first |
| **2. World** | DE (Cocytus system), DN (origins) | Needs DK + DL done |
| **3. Loops** | DO (contracts), DP (salvaging) | Needs DE world to exist |
| **4. Economy** | DQ (barter/influence), DR (small items), DS (commodities) | Needs DO + DP loops |

