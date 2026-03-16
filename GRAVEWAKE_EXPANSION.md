# Gravewake System Expansion — Master Plan

## Context

Gravewake currently has 3 stations, 6 derelicts, 2 terrain systems, and NPCs from only 3 of 7 factions. This expansion finishes the zone: every faction gets ships, stations, and characters. Three story threads get seeded. The Coil gets full conversation scripts for all 5 districts. New terrain (Frozen Fleet, Cinder moon) creates sub-regions. 30+ named characters populate the world.

All content uses **existing game systems** — no new mechanics (no gravity wells, skiffs, crew, or module affixes).

**PLAN.md codes: CV through DF** (next available after: DG)

---

## Project 1: Faction Hull Classes & Ship Configs

**Goal**: Build the ships every new faction needs before they can exist in the world.

### 3 New Hull Classes

| Hull ID | Name | Faction | Role | Weight | Key Trait |
|---|---|---|---|---|---|
| `pilgrim-barge` | Pilgrim Barge | Zealots | Ceremonial convoy vessel | Heavy (~2.2) | High armor, slow, large |
| `cloister-cruiser` | Cloister Cruiser | Monastic | Capital expedition ship | Very heavy (~3.0) | Largest NPC hull, 7 mounts |
| `commune-tender` | Commune Tender | Communes | Supply hauler | Light (~0.7) | High cargo, low armor, rounded shape |

### 8 New Ship Configs

| Ship ID | Hull | Faction Dir | Weapons | Role |
|---|---|---|---|---|
| `pilgrim-convoy` | pilgrim-barge | `zealot/` | lance-st | Caravan vessel |
| `zealot-escort` | maverick-courier | `zealot/` | rocket-s, lance-sf | Armed escort |
| `monastic-cruiser` | cloister-cruiser | `monastic/` | rocket-l, railgun, lance-st, lance-sf | Expedition flagship |
| `monastic-frigate` | garrison-frigate | `monastic/` | milspec-rocket-l, railgun | Military escort |
| `commune-tender` | commune-tender | `commune/` | cruising-ion-s (unarmed) | Supply runner |
| `casimir-patrol` | cutter-scout | `casimir/` | milspec-rocket-s, autocannon, railgun | Lane patrol |
| `casimir-cutter` | cutter-scout | `casimir/` | milspec-rocket-s, lance-sf, autocannon | Patrol variant |
| `rogue-capital` | garrison-frigate | `scavenger/` | rocket-l, cannon, rocket-pod-l | Rogue Lord flagship |

### 5 New Character Files

- `data/characters/zealot.js` — zealot-pilgrim, zealot-escort (+ named later)
- `data/characters/monastic.js` — monastic-captain, monastic-escort
- `data/characters/commune.js` — commune-hauler
- `data/characters/casimir.js` — casimir-officer
- `data/characters/scavenger.js` (additions) — rogue-lord-kael + rogue escorts

### Files

Create:
- `data/hulls/pilgrim-barge/hull.js`
- `data/hulls/cloister-cruiser/hull.js`
- `data/hulls/commune-tender/hull.js`
- `data/ships/zealot/pilgrimConvoy.js`, `zealotEscort.js`
- `data/ships/monastic/monasticCruiser.js`, `monasticFrigate.js`
- `data/ships/commune/communeTender.js`
- `data/ships/casimir/casimirPatrol.js`, `casimirCutter.js`
- `data/ships/scavenger/rogueCapital.js`
- `data/characters/zealot.js`, `monastic.js`, `commune.js`, `casimir.js`

Modify:
- `data/index.js` — import all new files
- `data/characters/scavenger.js` — add rogue characters
- `src/test/designer.js` — add new hulls/ships to categories

**Patterns to follow**: `data/hulls/garrison-frigate/hull.js` (hull class), `data/ships/scavenger/lightFighter.js` (ship config), `data/characters/scavenger.js` (character data)

---

## Project 2: Terrain — Frozen Fleet, Cinder, and POIs

**Goal**: New terrain sub-regions that create destinations and visual variety.

### Frozen Fleet (`data/terrain/frozen-fleet/index.js`)
- **Position**: (6500, 6500) — south of Pale, below the Wall of Wrecks
- 6-8 pristine early colonization ships encased in hydrogen ice
- Visual: intact wireframe hulls with crystalline ice-haze in PALE_ICE/FROZEN_ICE colors
- Rich derelict territory — 4 new derelicts placed nearby

### Cinder — Small Moon of Pale (`data/terrain/cinder/index.js`)
- **Position**: (11000, 4200) — NE offset from Pale (9000, 5000)
- Background parallax celestial (0.7), radius ~180
- Rocky, crater-pocked surface — angular concentric polygons
- Colors: `CINDER_ROCK (#8a7a6a)`, `CINDER_DUST (#5a4a3a)`
- Gameplay hook: pre-Exile observatory site; Monastic Order forward camp location

### Voss's Waystation Marker (`data/terrain/voss-waystation/index.js`)
- **Position**: (2500, 8000) — deep SW, scavenger territory
- Small wireframe dock structure with pulsing red nav light
- Hidden from minimap until within ~1500 units

### Black Market Relay Buoy (`data/terrain/relay-buoy/index.js`)
- **Position**: (12500, 8500) — deep south
- Vertical antenna with pulsing magenta light
- Story trigger point for later narrative hooks

### 4 New Derelicts (near Frozen Fleet + Cinder)

| Name | Hull | Position | Lore Hook |
|---|---|---|---|
| Frozen Ark | garrison-frigate | (6200, 6300) | Pre-Exile colony ship, sealed in ice |
| Silent Voyager | g100-hauler | (6800, 6800) | Intact hauler, cargo holds still pressurized |
| Icebound Sentinel | cutter-scout | (7000, 6200) | Military escort frozen mid-patrol |
| Cinder Watch | maverick-courier | (10800, 4400) | Crashed on Cinder approach; someone was watching |

### Files

Create:
- `data/terrain/frozen-fleet/index.js`
- `data/terrain/cinder/index.js`
- `data/terrain/voss-waystation/index.js`
- `data/terrain/relay-buoy/index.js`
- `data/ships/named/frozenArk.js`, `silentVoyager.js`, `iceboundSentinel.js`, `cinderWatch.js`

Modify:
- `src/rendering/colors.js` — add CINDER_ROCK, CINDER_DUST, FROZEN_ICE
- `data/zones/gravewake.js` — place all terrain + derelicts
- `data/index.js` — import derelict files

**Patterns to follow**: `data/terrain/arkship-spines/index.js` (terrain), `data/ships/named/brokenCovenant.js` (derelict)

**Dependencies**: None

---

## Project 3: Faction NPC Placement

**Goal**: Every faction has living ships flying through Gravewake.

### NPC Groups (in `data/zones/gravewake.js`)

| Faction | Type | Position | Count | Behavior |
|---|---|---|---|---|
| Zealot | Pilgrim convoy | (3000, 6000) → (9500, 5200) | 2 barges + 2 escorts | trader + militia |
| Monastic | Expedition | (11500, 4500) near Cinder | 1 cruiser + 2 frigates | militia orbit |
| Commune | Supply run | (4000, 3500) → (15000, 3000) | 2 tenders | trader (convoy) |
| Casimir | Lane patrol | (14000, 4000) | 2 officers | militia orbit |
| Scavenger (Rogue) | Fleet | (4000, 8500) | 1 capital + 3 fighters | militia + stalker |
| Scavenger | Kiter group | (8000, 8000) near Frozen Fleet | 2 gunners | kiter |
| Scavenger | Lurker group | (6000, 6500) inside Frozen Fleet | 2 ambushers | lurker |

### 3 New Bounty Targets
- `frostbite_yara` — lurker in Frozen Fleet
- `rust_tongue_dek` — stalker harassing Commune supply lines
- `burning_eye_caro` — rogue zealot escort attacking non-believers

Modify: `data/zones/gravewake.js`, `data/characters/scavenger.js`, `data/characters/zealot.js`

**Dependencies**: Project 1 (ships), Project 2 (Cinder for Monastic placement)

---

## Project 4: New Stations — Reliquary, Vigil, Haven

**Goal**: One station per missing faction.

### The Reliquary (Monastic Order)
- **Position**: (11200, 4000) — near Cinder
- **Services**: trade (rare tech), intel, relations, bounties
- **Visual**: Compact octagon with sensor arms, MAGENTA accent, CRT display banks
- **Zones**: Research Bay (trade), Archive Terminal (intel), Monastery (relations)
- **Commodities**: data_cores (surplus), electronics (surplus), nav_charts, machine_parts, ration_packs

### The Vigil (Zealot Shrine)
- **Position**: (7500, 5800) — south of Pale, on pilgrimage route
- **Services**: trade (Concord artifacts), intel, relations, bounties
- **Visual**: Tall pyramidal structure, AMBER accent, central spire with pulse
- **Zones**: Offering Hall (trade), The Sanctum (intel), Standings (relations)
- **Commodities**: void_crystals (surplus), data_cores, contraband, ration_packs

### Haven (Commune Depot)
- **Position**: (4000, 3500) — quiet western edge
- **Services**: trade (food surplus), repair, relations
- **Visual**: Small, rounded, GREEN accent, dome shapes, warm glow
- **Zones**: Supply Cache (trade/repair), Common Room (intel), Standings (relations)
- **Commodities**: ration_packs (surplus), bio_cultures (surplus), reactor_fuel, medical_supplies
- No bounties (Communes are pacifists)

### Files per station
- `data/locations/<id>/station.js`
- `data/locations/<id>/renderer.js`
- `data/locations/<id>/conversations/hub.js`, `dock.js`, `intel.js`, `relations.js`, (`bounties.js` where applicable)

**Patterns to follow**: `data/locations/kells-stop/` (full station structure)

**Dependencies**: Project 1, Project 2

---

## Project 5: Hidden Stations — Voss's Waystation & The Exile

**Goal**: Two scavenger-faction stations with restricted access and unique narrative roles.

### Voss's Waystation
- **Position**: (2500, 8000) — on terrain marker from Project 2
- **Faction**: scavengers (salvage_lords)
- **Access**: Hidden until scavenger rep "Trusted" OR story flag `has_voss_chart`
- **Services**: trade (black market), repair, bounties, intel
- **Visual**: Brutalist engine housing with bolt-on habs, RED accent
- **Key NPCs**: Dread Captain Voss (conversation NPC), Quartermaster Sable
- **Bounties**: 3 (rival clans, Concord patrols, Casimir interlopers)

### The Exile (Rogue Fleet Flagship)
- **Position**: (4200, 8700) — near rogue fleet from Project 3
- **Faction**: scavengers (rogue)
- **Services**: trade, intel, relations
- **Visual**: Modified garrison-frigate with welded cargo pods, rebel banner detail
- **Key NPC**: Kael the Displaced (conversation + spawned ship)
- No bounties

### Files per station
Same structure as Project 4. Plus character additions for Voss and Sable.

**Dependencies**: Project 2 (terrain marker), Project 3 (rogue fleet)

---

## Project 6: The Coil Completion

**Goal**: Full conversation scripts for all 5 Coil districts. Replace generic fallbacks with authored content.

### 8 Conversation Scripts

| File | Zone | NPC | Purpose |
|---|---|---|---|
| `hub.js` | Entry | Docking master | First-visit narration, zone selection, return variations |
| `dock.js` | Dock & Salvage | Harbor Master "Greel" | Repair, fuel, reactor. Grants `has_voss_chart` at Trusted rep |
| `market.js` | Marketplace | "Siv" the broker | Trade. Rumors about Frozen Fleet, Zealots, Casimir |
| `slums.js` | The Slums | 3 NPCs | Pure narrative. Grandmother Vex, drunk Kiv, child Brek |
| `citadel.js` | The Palace | Salvage Lord "Dorran" | High-tier trade, 2 elite bounties. Requires Trusted rep |
| `bounties.js` | — | — | Bounty board (existing + 2 new Citadel contracts) |
| `intel.js` | — | — | Coil history, Salvage Lords lore |
| `relations.js` | — | — | Faction standings |

### Key Story Hooks Planted
- Greel reveals route to Voss's Waystation (story flag)
- Siv drops rumors about all factions
- Grandmother Vex tells stories about Pale and what's beneath the ice
- Kiv claims to have seen "the old machines" near Cinder
- Dorran's perspective on Voss, the Rogue Fleet, and the Monastic Order

Create: `data/locations/the-coil/conversations/` (8 files)
Modify: `data/locations/the-coil/station.js`, `data/index.js`, `data/characters/scavenger.js` (Citadel bounty targets)

**Dependencies**: Projects 1, 3 (factions must exist for references)

---

## Project 7: Named NPC Roster & Story Seeds

**Goal**: Replace generic NPCs with hand-authored individuals. Plant story thread seeds across all stations.

### 15 New Named Characters

| ID | Name | Faction | Ship | Placement |
|---|---|---|---|---|
| `iron_kess` | "Iron" Kess | Scavenger | armed-hauler | Frozen Fleet approaches |
| `no_name_cort` | "No-Name" Cort | Scavenger | light-fighter | Near The Coil |
| `ashblood_mira` | "Ashblood" Mira | Scavenger | salvage-mothership | South of Wall |
| `splinter_tosk` | "Splinter" Tosk | Scavenger | armed-hauler | Near Cinder |
| `grave_warden` | The Grave Warden | Scavenger | grave-clan-ambusher | Frozen Fleet legend |
| `prior_solenne` | Prior Solenne | Zealot | pilgrim-convoy | Pilgrimage caravan |
| `acolyte_fen` | Acolyte Fen | Zealot | zealot-escort | Aggressive escort |
| `voice_of_static` | Voice of Static | Zealot | zealot-escort | Claims Concord transmissions |
| `archivist_thane` | Archivist Thane | Monastic | monastic-cruiser | Cinder expedition leader |
| `brother_corr` | Brother Corr | Monastic | monastic-frigate | Distrustful escort |
| `tender_pel` | "Tender" Pel | Commune | commune-tender | Quiet supply runner |
| `old_sow_marina` | "Old Sow" Marina | Commune | commune-tender | Gruff senior hauler |
| `lieutenant_vane` | Lt. Vane | Casimir | casimir-patrol | By-the-book patrol |
| `ensign_rathe` | Ensign Rathe | Casimir | casimir-cutter | Eager junior officer |
| `dread_voss` | Dread Captain Voss | Scavenger | — | Conversation NPC at waystation |

### Story Thread Seeds (via conversation scripts + story flags)

**"The Warlord's Compact"**: Coil Slums (Vex rumor) → Coil Market (Siv rumor) → Voss's Waystation (direct) → The Exile (counter-perspective) → Citadel (Dorran worried)

**"The Sleep Directive"**: Ashveil intel (strange transmissions) → Reliquary (Thane's Cinder findings) → Vigil (Zealot interpretation) → Cinder Watch derelict (transmission fragment)

**"The First Inhabitants"**: Coil Slums (Kiv's stories) → Haven intel (lost supply ships) → Pale Witness derelict (updated lore hinting pre-human construction)

**Dependencies**: All previous projects

---

## Project 8: Polish Pass & Cross-References

**Goal**: Connect everything. Every station references other stations. Bounty targets filled out. Arena map updated for testing.

- Cross-reference pass on all station intel/conversation scripts
- 6-8 new bounty target characters for new station boards
- Return-visit conversation variations
- Story flag consistency check
- `data/maps/arena.js` updated with new faction NPCs and derelicts for testing

**Dependencies**: All previous projects

---

## Gravewake Zone Map After Expansion

```
    0         3000       6000       9000      12000      15000     18000
    |          |          |          |          |          |          |
0   +..........+..........+..........+..........+..........+..........+
    |                                                  [The Coil]    |
    |   [Scav.Stalkers]          [Spine]         [PLAYER START]     |
    |              [Spine]                                           |
3000|        [Haven]  [Derelicts]           [ColdRemnant]           |
    |                          [HollowMarch]      ~~~~              |
    |     [Spine]     [GuttedPioneer]    [Cinder]  [Casimir Patrol] |
    |                              ============    [Reliquary]      |
4000|   [Lurkers]  ===WALL===   [PALE]   =====     [FracturedWake] |
    |  [KellsStop]  =========           [MonasticExp]   [Ashveil]  |
    |          ===gap===  [Spine]                                    |
5000|                   [Vigil]                                      |
    |                                                               |
    |  [FrozenFleet]  ===WALL===                                    |
6000|  [Zealot Conv]  =========                                     |
    |  [+Derelicts]      ===gap===                                  |
    |   [Spine]                                                     |
7000|  [Scav.Stalkers]      [Spine]        [Concord]               |
    |                                                               |
    |  [Voss's WS]                    [RelayBuoy]   [Concord]      |
8000|                    [Scav.Kiter]                               |
    |  [Rogue Fleet]                                                |
    |  [The Exile]           [Spine]   ===WALL===                   |
9000|                        =========                              |
    |                                                               |
10000+..........+..........+..........+..........+..........+..........+
```

---

## Final Zone Summary

| Metric | Before | After |
|---|---|---|
| Stations | 3 | 8 |
| Derelicts | 6 | 10 |
| Hull classes | 7 | 10 |
| Ship configs | ~13 | ~21 |
| Named characters | ~15 | 45+ |
| Factions with presence | 3 | 7 |
| Story threads seeded | 0 | 3 |
| Conversation scripts | ~16 | 55+ |
| Terrain features | 3 types | 7 types |

## Verification

After each project:
1. `npm run validate` — zero new lint/type errors
2. Open `designer.html` — verify new hulls/ships/stations render correctly
3. Open `editor.html?map=tyr` — verify NPCs spawn, stations dock, terrain renders
4. Open `editor.html?map=arena` — quick combat test with new ships (after Project 8)
