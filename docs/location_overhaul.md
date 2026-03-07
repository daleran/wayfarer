# Location Overhaul Design Spec

> **Status:** Design spec (not yet implemented)
> **Scope:** Replace 3 identical stations + 3 inert planets with 15 distinct station types and landable planets with surface gameplay.

---

## 1. Station Types

The current game has 3 stations that all render as identical hexagons and offer the same services. This overhaul introduces **15 distinct station types**, each with a unique wireframe silhouette, service mix, and role in the game world. The full map will contain **~35-45 station instances** spread across these types.

### 1.1 Station Type Catalog

Each station type defines:
- **Silhouette** — unique wireframe shape drawn with `_drawShape(ctx)`
- **Services** — which station menu tabs are available
- **Commodity profile** — default supply level tendencies (individual instances can override)
- **Faction affinity** — which factions commonly operate this type

---

#### 1. Trade Hub
- **Silhouette:** Wide hexagon with extended docking arms (8 spokes radiating from center)
- **Services:** Trade, Repair, Crew Hire
- **Commodity profile:** Balanced medium supply across all goods; best selection
- **Role:** General-purpose trading post. Most common station type.
- **Faction:** Settlements, Communes
- **Count on map:** 6-8

#### 2. Shipyard
- **Silhouette:** Rectangular frame with internal gantry lines (dry dock shape)
- **Services:** Shipyard, Repair, Trade (limited)
- **Commodity profile:** High ore/scrap demand, surplus tech
- **Role:** Buy/sell ships, major repairs. Rarer than trade hubs.
- **Faction:** Settlements
- **Count on map:** 3-4

#### 3. Refinery
- **Silhouette:** Vertical stack of circles connected by pipes (industrial tower)
- **Services:** Trade (ore/scrap specialist), Repair (basic)
- **Commodity profile:** Surplus ore/scrap, deficit food/medicine
- **Role:** Converts raw materials. Best prices for selling ore.
- **Faction:** Settlements, Communes
- **Count on map:** 3-4

#### 4. Farm Station
- **Silhouette:** Dome shape — semicircle top with flat base and radial struts
- **Services:** Trade (food/medicine specialist), Crew Hire
- **Commodity profile:** Surplus food/medicine, deficit tech/ore
- **Role:** Agricultural hub. Cheap food source.
- **Faction:** Communes
- **Count on map:** 3-4

#### 5. Archive
- **Silhouette:** Concentric circles (3 rings) with a central dot — radar/antenna feel
- **Services:** Trade (tech/data specialist), Upgrades
- **Commodity profile:** Surplus tech/data, deficit everything else
- **Role:** Monastic Order knowledge vault. Rare tech and upgrades.
- **Faction:** Monastic Orders
- **Count on map:** 2

#### 6. Military Outpost
- **Silhouette:** Diamond/rhombus with angular turret protrusions at each corner
- **Services:** Repair, Bounty Board, Trade (weapons/ammo)
- **Commodity profile:** Deficit food/medicine, medium ore/scrap
- **Role:** Faction military presence. Bounties and combat supplies.
- **Faction:** Settlements
- **Count on map:** 2-3

#### 7. Fuel Depot
- **Silhouette:** Two large circles (tanks) connected by a narrow bridge
- **Services:** Refuel (discounted), Trade (limited)
- **Commodity profile:** Minimal commodity selection
- **Role:** Cheap refueling point along trade routes. Strategic placement.
- **Faction:** Settlements, Communes
- **Count on map:** 3-4

#### 8. Relay Beacon
- **Silhouette:** Tall vertical line with horizontal crossbars (antenna tower)
- **Services:** Refuel (basic), Bounty Board
- **Commodity profile:** None — no trade
- **Role:** Navigation aid and bounty posting point. Reveals nearby map fog.
- **Faction:** Neutral
- **Count on map:** 3-4

#### 9. Shrine
- **Silhouette:** Pointed arch / gothic window shape — tall triangle with curved sides
- **Services:** Trade (exotics/data specialist), Unique upgrades
- **Commodity profile:** Buys exotics/data at premium, sells contraband
- **Role:** Zealot worship site. Concord artifacts trade hub.
- **Faction:** Zealots
- **Count on map:** 2

#### 10. Scavenger Den
- **Silhouette:** Irregular jagged polygon (5-7 points, asymmetric) — cobbled-together look
- **Services:** Trade (contraband, scrap), Repair (cheap but unreliable), Black Market
- **Commodity profile:** Surplus contraband/scrap, buys everything at low prices
- **Role:** Fence stolen goods, buy contraband. Hostile to high-rep settlement players.
- **Faction:** Scavenger Clans
- **Count on map:** 2-3

#### 11. Commune Hub
- **Silhouette:** Circle with 4 evenly-spaced smaller circles on its perimeter (modular pod cluster)
- **Services:** Trade, Crew Hire, Repair
- **Commodity profile:** Surplus food/medicine, medium everything else
- **Role:** Cooperative community station. Good prices, peaceful.
- **Faction:** Communes
- **Count on map:** 2-3

#### 12. Prison Barge
- **Silhouette:** Long narrow rectangle with cross-hatched interior lines (barred windows)
- **Services:** Bounty Board (turn in bounties), Trade (limited)
- **Commodity profile:** Deficit food/medicine
- **Role:** Turn in captured bounties for reward. Grim atmosphere.
- **Faction:** Settlements
- **Count on map:** 1

#### 13. Derelict Dock
- **Silhouette:** Broken hexagon — 2-3 sides missing, remaining sides have jagged edges
- **Services:** Salvage Shop (buy salvage tools/upgrades), Trade (scrap only)
- **Commodity profile:** Surplus scrap
- **Role:** Staging point near debris fields. Salvage-oriented services.
- **Faction:** Neutral, Scavenger Clans
- **Count on map:** 2

#### 14. Medical Station
- **Silhouette:** Plus/cross shape with rounded ends
- **Services:** Crew Heal, Trade (medicine specialist), Repair
- **Commodity profile:** Surplus medicine, deficit everything else
- **Role:** Heal injured crew, buy medicine cheap.
- **Faction:** Communes, Settlements
- **Count on map:** 1-2

#### 15. Concord Relic
- **Silhouette:** Perfect octagon with a pulsing inner circle — alien, geometric, precise
- **Services:** Unique (story-dependent — locked until storyline progress)
- **Commodity profile:** Trades only in data and exotics
- **Role:** Mysterious Concord structure. Story-gated content.
- **Faction:** Concord Remnants
- **Count on map:** 1-2

---

### 1.2 Station Rendering

All stations continue to use the wireframe rendering style (stroke, no fill) consistent with the vector monitor aesthetic. Key rendering rules:

- Each type has a distinct `_drawShape(ctx)` implementation
- Base color comes from faction color map in `js/ui/colors.js`
- Docking range indicator: dashed circle at `dockRadius` when player is nearby
- Station name label rendered below in monospace
- Station type subtitle rendered below name in smaller text (e.g., "TRADE HUB", "ARCHIVE")
- Size varies by type: relay beacons are small (~20px), shipyards are large (~60px)

### 1.3 Station Data Structure

```js
// In station type definitions
{
  type: 'trade_hub',           // station type key
  name: 'Keelbreak',          // unique instance name
  id: 'keelbreak',            // unique instance id
  x: 2200, y: 2800,
  faction: 'settlement',
  services: ['trade', 'repair', 'crew_hire'],
  commodities: { food: 'high', ore: 'low', ... },
  // type-specific defaults applied if not overridden:
  // silhouette, base services, commodity tendencies
}
```

Station types are defined in a new `js/data/stationTypes.js` file. Map data references types by key, with per-instance overrides.

---

## 2. Commodity Expansion

### 2.1 New Commodities

The current 5 commodities (Food, Ore, Tech, Exotics, Scrap) expand to **8** with three new types:

| Commodity | Base Price | Description | Sources | Consumers |
|-----------|-----------|-------------|---------|-----------|
| Food | 10 | Agricultural produce, rations | Farm Stations, Communes | Military, Scavenger Dens |
| Ore | 80 | Raw minerals, metals | Refineries, Mining planets | Shipyards, Trade Hubs |
| Tech | 50 | Components, circuits, parts | Archives, Shipyards | Everywhere (medium demand) |
| Exotics | 200 | Rare artifacts, alien specimens | Shrines, Concord Relics | Archives, Shrines |
| Scrap | 15 | Salvaged metal, junk | Derelict Docks, Scav Dens | Refineries, Shipyards |
| **Medicine** | **35** | **Medical supplies, chems, biofilters** | **Medical Stations, Farm Stations** | **Military, Prison Barge, everywhere** |
| **Data** | **120** | **ROM cartridges, star charts, encrypted logs** | **Archives, Relay Beacons** | **Shrines, Concord Relics, Archives** |
| **Contraband** | **150** | **Banned tech, AI cores, prohibited weapons** | **Scavenger Dens, Shrines** | **Scavenger Dens (only)** |

### 2.2 Contraband Rules

- Contraband cannot be sold at non-Scavenger/Zealot stations
- If docked at a Settlement or Commune station with contraband in cargo, there is a chance of detection:
  - **Detection chance:** 15% per contraband unit on dock
  - **Penalty:** Confiscation + fine (200 credits per unit) + reputation hit with that faction
- Contraband sells at 2x base price at Scavenger Dens
- High Scavenger reputation reduces detection chance at non-hostile stations

### 2.3 Supply Level System

No changes to the existing supply multiplier system. New commodities slot into the same `SUPPLY_MULTIPLIERS` table:

```
surplus: 0.5x | high: 0.7x | medium: 1.0x | low: 1.5x | deficit: 2.25x | none: N/A
```

---

## 3. Planet Landing

### 3.1 Overview

Planets transition from inert visual objects to **landable locations with surface gameplay**. Landing on a planet switches from the space map to a **surface gameplay map** — a separate 2D play area with its own terrain, entities, and mechanics. This is NOT a menu overlay; it is a distinct gameplay mode.

### 3.2 Landing Sequence

1. **Approach:** Player flies ship within landing range of a planet (similar to station dock range)
2. **Prompt:** "Press E to deploy lander" appears
3. **Transition:** Screen fades/wipes to surface map. Mothership is parked in orbit (safe).
4. **Surface play:** Player controls the lander on a 2D surface map
5. **Launch:** Player returns to landing pad and presses E to launch back to orbit

### 3.3 The Lander

The lander is a separate vehicle with its own stats, distinct from the player's ship:

| Stat | Value | Notes |
|------|-------|-------|
| Hull | 30 | Very fragile — no armor layer |
| Speed | 60% of flagship | Slower, more deliberate movement |
| Cargo | 10 | Limited surface haul capacity |
| Fuel | 60 seconds of thrust | Fuel drains while moving; stranding = distress call (costs credits) |
| Weapons | None | Unarmed — must avoid surface hazards |

- The lander is **unarmed** — surface gameplay is about exploration and resource gathering, not combat
- If the lander is destroyed, the player loses cargo on the lander and pays a recovery fee (500 credits) to respawn at the orbiting ship
- Lander fuel is separate from ship fuel; refills on return to ship
- Lander cargo transfers to/from ship cargo on launch/land

### 3.4 Surface Map

Each planet has a **surface map** — a bounded 2D area (roughly 3000x2000 units) with:

- **Terrain features:** Rendered as colored regions/boundaries (no tile system — vector style consistent with space map)
- **Points of interest:** Surface settlements, resource nodes, ruins, caves
- **Hazards:** Terrain that damages the lander (lava flows, acid pools, radiation zones) — shown as pulsing colored regions
- **NPCs:** Surface characters for dialogue/trade (drawn as simple figures or icons)

### 3.5 Surface Activities

| Activity | Mechanic | Reward |
|----------|----------|--------|
| **Resource gathering** | Fly to resource node, press E to collect | Ore, food, medicine, exotics (planet-dependent) |
| **Settlement trade** | Land near surface settlement, press E to open trade menu | Buy/sell at surface prices (often cheaper than orbital) |
| **Ruin exploration** | Enter ruin zone, navigate interior | Data, tech, story items, lore fragments |
| **NPC interaction** | Approach NPC marker, press E for dialogue | Quests, information, reputation |

### 3.6 Planet Profiles

Each planet defines its surface characteristics:

#### Thalassa (Green/Agricultural)
- **Surface:** Brine marshes, dome farms, algae fields
- **Hazards:** Brine pools (corrosive — slow hull drain)
- **Resources:** Food (abundant), Medicine (common)
- **Settlements:** Commune farming outposts, 2-3 small trade posts
- **Unique:** Cheapest food in the game; commune quest givers

#### Grist (Brown/Industrial)
- **Surface:** Strip mines, ore veins, slag heaps, refinery ruins
- **Hazards:** Unstable mine shafts (collapse damage zones), toxic slag
- **Resources:** Ore (abundant), Scrap (common), Tech (rare)
- **Settlements:** Mining camps, 1-2 rough trade posts
- **Unique:** Richest ore deposits; mining guild contacts

#### Pale (Blue/Ice)
- **Surface:** Ice plains, crevasses, frozen caves, buried structures
- **Hazards:** Crevasses (instant lander destruction if entered), blizzard zones (reduced visibility + fuel drain)
- **Resources:** Data (rare — from buried pre-Exile structures), Exotics (rare)
- **Settlements:** Hermit outposts, 1 research station
- **Unique:** Story-critical buried ruins; most dangerous surface but highest-value finds

### 3.7 Surface Rendering

The surface map uses the same vector/wireframe aesthetic as space:

- **Terrain boundaries** drawn as colored wireframe outlines
- **Background** is dark with subtle ground texture (dot grid or scan lines)
- **Hazard zones** pulse with their danger color (red for lava, cyan for ice, green for acid)
- **The lander** is drawn as a small triangular craft with landing legs
- **Resource nodes** shown as blinking diamond markers (similar to loot drops in space)
- **NPCs** shown as simple humanoid wireframe figures
- **A minimap** in the corner shows the full surface with POI markers

### 3.8 Surface Data Structure

```js
// In planet definition (map.js)
{
  id: 'thalassa',
  name: 'Thalassa',
  x: 3500, y: 4500,
  radius: 180,
  colorInner: '#2a6a2a',
  colorOuter: '#1a3a1a',
  landable: true,
  surface: {
    size: { width: 3000, height: 2000 },
    terrain: [
      { type: 'brine_marsh', points: [...], color: '#2a4a2a', hazard: true, damage: 0.5 },
      { type: 'dome_farm', points: [...], color: '#3a7a3a' },
    ],
    resources: [
      { type: 'food', x: 500, y: 800, amount: 5 },
      { type: 'medicine', x: 1200, y: 400, amount: 3 },
    ],
    settlements: [
      { name: 'Tidecrest', x: 800, y: 1000, services: ['trade'], commodities: { food: 'surplus', medicine: 'high' } },
    ],
    npcs: [
      { name: 'Elder Moss', x: 850, y: 1020, dialogue: 'elder_moss_intro' },
    ],
    landingPad: { x: 1500, y: 1000 },
  },
}
```

---

## 4. Location Relationships

### 4.1 Orbital Proximity

Stations and planets exist in a spatial relationship. Some stations orbit specific planets:

| Station | Orbits | Relationship |
|---------|--------|-------------|
| Keelbreak (Trade Hub) | Thalassa | Built from crashed arkship on Thalassa's surface |
| Crucible (Military Outpost) | Grist | Guards the mining moon |
| Thornwick (Archive) | Boneyards (debris field) | Orbits at the edge of the debris field |
| Farm stations | Thalassa | Agricultural operations linked to the moon |
| Fuel depots | Open space | Placed along major trade routes |
| Relay beacons | Open space | Navigation network coverage |

### 4.2 Trade Route Logic

Station placement creates natural trade routes based on commodity supply/demand:

- **Food route:** Thalassa farm stations (surplus) -> Military outposts, Scavenger dens (deficit)
- **Ore route:** Grist refineries (surplus) -> Shipyards (deficit)
- **Tech route:** Archives (surplus) -> Everyone (medium-high demand)
- **Data route:** Archives, Relay beacons -> Shrines, Concord relics (premium prices)
- **Contraband route:** Scavenger dens -> Scavenger dens (risky but profitable)
- **Medicine route:** Medical stations, Farm stations -> Military, Prison barge, everywhere

### 4.3 Danger Zones

Station density and type correlate with area danger level:

| Zone | Station Density | Types Present | Danger |
|------|----------------|---------------|--------|
| Inner system (near Thalassa) | High | Trade hubs, farms, communes, fuel depots | Low |
| Mid system (trade routes) | Medium | Relay beacons, fuel depots, refineries | Medium |
| Outer system (near Pale) | Low | Archives, shrines, scavenger dens | High |
| Boneyards / Ashveil | Very low | Derelict docks, scavenger dens | Very high |
| Concord space | Minimal | Concord relics only | Extreme |

---

## 5. Implementation Notes

### 5.1 New Files

| File | Purpose |
|------|---------|
| `js/data/stationTypes.js` | Station type definitions (silhouette, default services, commodity tendencies) |
| `js/world/surface.js` | Surface map manager (terrain, resources, NPCs, hazards) |
| `js/entities/lander.js` | Lander entity (movement, fuel, cargo, collision) |
| `js/ui/surfaceHUD.js` | Surface gameplay HUD (fuel gauge, cargo, minimap) |

### 5.2 Modified Files

| File | Changes |
|------|---------|
| `js/data/commodities.js` | Add Medicine, Data, Contraband definitions |
| `js/data/map.js` | Expand to ~35-45 stations with type keys; add surface data to planets |
| `js/data/testMap.js` | Add representative station types and one landable planet |
| `js/world/station.js` | Refactor to use station type for silhouette dispatch |
| `js/world/planet.js` | Add landing range check and transition trigger |
| `js/game.js` | Add surface mode state machine (space <-> surface transitions) |
| `js/ui/stationScreen.js` | Handle variable service sets per station type |
| `js/renderer.js` | Add surface map rendering path |

### 5.3 Suggested Implementation Order

1. **Commodity expansion** — Add 3 new commodities to data files, update trade UI
2. **Station types** — Create type definitions, refactor station rendering to dispatch on type
3. **Map expansion** — Place ~35-45 stations across the map with appropriate types
4. **Planet landing (basic)** — Lander entity, surface map rendering, transition logic
5. **Surface content** — Resource nodes, settlements, hazards, NPCs
6. **Contraband system** — Detection, penalties, faction-specific trade rules
7. **Polish** — Test map updates, balance commodity prices/distances, verify trade routes

### 5.4 Balance Considerations

- Trade route distances should make hauling meaningful but not tedious (30-60 seconds between complementary stations at mid throttle)
- Surface fuel limit (60s) should allow exploration of ~60-70% of a planet surface per landing — encourages multiple trips and planning
- Contraband risk/reward should net ~2x profit over safe commodity runs after accounting for detection losses
- Station density in safe zones should mean the player is never more than ~15 seconds from a refueling point
- Medicine should be universally useful (crew healing) to create baseline demand everywhere
- Data should be high-value but niche — only a few stations buy it, making route knowledge valuable
