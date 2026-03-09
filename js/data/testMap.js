// Compact Gravewake test map.
// Load with ?test: npm run dev → http://localhost:5173/?test
// Map is 8000×5000 — same proportions as full map, ~44% scale.

export const TEST_MAP = {
  mapSize: { width: 8000, height: 5000 },
  playerStart: { x: 6500, y: 1200 },

  stations: [
    {
      id: 'kells_stop',
      name: "Kell's Stop",
      x: 2400, y: 1700,
      faction: 'neutral',
      renderer: 'fuel_depot',
      services: ['fuel', 'repair'],
      lore: [
        "KELL'S STOP — OPEN PORT",
        'Classification: Neutral',
        '',
        'A fuel platform bolted to an old survey barge.',
        'Two massive tanks, one docking spar. Small.',
        "Kell is usually asleep. Knock twice.",
        '',
        '[ FUEL DEPOT ]  [ FIELD REPAIRS ]',
      ],
      bountyContracts: [
        {
          id: 'kells_b1', type: 'kill',
          title: 'Wanted: Grave-Clan Lurker',
          targetName: '"Ironback" Marel',
          targetShipType: 'grave-clan-ambusher',
          targetPosition: { x: 1800, y: 3200 },
          reward: 90, expirySeconds: 300,
        },
        {
          id: 'kells_b2', type: 'kill',
          title: 'Clear the Approach',
          targetName: '"Gutshot" Drev',
          targetShipType: 'light-fighter',
          targetPosition: { x: 1400, y: 2600 },
          reward: 60, expirySeconds: 120,  // short for expiry testing
        },
      ],
    },
    {
      id: 'ashveil_anchorage',
      name: 'Ashveil Anchorage',
      x: 7000, y: 2200,
      faction: 'neutral',
      services: ['repair', 'trade'],
      canOverhaulReactor: true,
      commodities: { ration_packs: 'medium', machine_parts: 'medium', electronics: 'medium', medical_supplies: 'medium', data_cores: 'low', nav_charts: 'low', bio_cultures: 'high' },
      lore: [
        'ASHVEIL ANCHORAGE — OPEN PORT',
        'Classification: Neutral',
        '',
        'Eastern terminus of the Gravewake trade lanes.',
        'Repairs are expensive. Being stranded is worse.',
        '',
        '[ REPAIR BAY ]  [ TRADE POST ]',
      ],
      bountyContracts: [
        {
          id: 'ashveil_b1', type: 'kill',
          title: 'Silence the Mothership',
          targetName: '"Pale Widow"',
          targetShipType: 'salvage-mothership',
          targetPosition: { x: 6500, y: 3800 },
          reward: 140, expirySeconds: 360,
        },
      ],
    },
    {
      id: 'the_coil',
      name: 'The Coil',
      x: 6500, y: 1200,
      faction: 'salvage_lords',
      renderer: 'coil',
      services: ['repair', 'trade'],
      commodities: { weapons_cache: 'surplus', raw_ore: 'medium', hull_plating: 'low', contraband: 'surplus', alloys: 'high', void_crystals: 'low' },
      lore: [
        'SALVAGE LORDS TERRITORY — OPEN PORT',
        'Classification: Hostile Neutral',
        '',
        'Assembled from four decommissioned cargo haulers,',
        'welded together over two decades of desperation',
        'and bad decisions. It shouldn\'t float. It does.',
        '',
        '[ MARKET — PORT FREIGHT DECK ]',
        'Black-market goods, fenced salvage, contraband',
        'ROM cartridges from pre-Exile archive runs.',
        'Prices are negotiable. Arguments are not.',
        '',
        '[ THE PITS — CENTRAL HUB ]',
        'Cantina, bunks, and synthetic alcohol that will',
        'leave you three days behind schedule. The Salvage',
        'Lords hold court here when they bother to meet.',
        '',
        '[ SHIPYARD — STARBOARD WING ]',
        'Illicit repairs and unregistered hull work.',
        'The welders ask no questions. Neither should you.',
        '',
        '[ THE VAULT — EAST END ]',
        'Sealed. Always sealed. The Lords haven\'t opened',
        'it while anyone was watching.',
      ],
    },
  ],

  planets: [],

  background: [
    {
      type: 'pale',
      name: 'Pale',
      x: 4000,
      y: 2500,
      radius: 540,
      colorLimb: '#4a7a9a',
      colorAtmo: '#1a3a5a',
    },
  ],

  zones: [
    { id: 'gravewake', center: { x: 4500, y: 2500 }, radius: 4500 },
  ],

  arkshipSpines: [
    // Flanking the approach to The Coil
    { x: 2000, y: 1400, rotation: 0.40, length: 2200, width: 140 },
    { x: 1800, y: 3400, rotation: -0.30, length: 1900, width: 110 },
    // Deep zone spines near The Coil
    { x: 3800, y: 900, rotation: 0.70, length: 2800, width: 160 },
    { x: 6800, y: 3500, rotation: 1.20, length: 1800, width: 100 },
  ],

  // Partial Wall of Wrecks — diagonal belt with one gap (trade lane)
  wallOfWrecks: [
    { x: 2400, y: 1300, spreadRadius: 350, fragmentCount: 28 },
    { x: 2800, y: 1700, spreadRadius: 380, fragmentCount: 32 },
    { x: 3200, y: 2100, spreadRadius: 360, fragmentCount: 30 },
    // gap (trade lane)
    { x: 3900, y: 2800, spreadRadius: 370, fragmentCount: 30 },
    { x: 4300, y: 3200, spreadRadius: 350, fragmentCount: 28 },
    { x: 4700, y: 3600, spreadRadius: 380, fragmentCount: 32 },
  ],

  derelicts: [
    {
      name: 'Gutted Pioneer', x: 1200, y: 2200, salvageTime: 3,
      derelictClass: 'hauler',
      lootTableId: 'derelict-hauler',
      lootTable: [
        { type: 'scrap', amount: 20 },
        { type: 'fuel',  amount: 12 },
        { type: 'moduleId', id: 'HydrogenFuelCell', condition: 'worn' },
        { type: 'ammo',  ammoType: 'rocket', amount: 3 },
      ],
      loreText: [
        'GUTTED PIONEER — G100-class hauler, cargo hold stripped.',
        'Independent registry. Approached the Wall and did not clear it.',
      ],
    },
    {
      name: 'Hollow March', x: 2800, y: 2800, salvageTime: 5,
      derelictClass: 'unknown',
      lootTableId: 'derelict-unknown',
      lootTable: [
        { type: 'scrap',         amount: 40 },
        { type: 'void_crystals', amount: 2 },
        { type: 'moduleId', id: 'LargeFusionReactor', condition: 'damaged' },
      ],
      loreText: [
        'HOLLOW MARCH — hull class unidentified. Pre-Collapse origin suspected.',
        'No registry. No crew manifest. Power signature: anomalous.',
      ],
    },
    {
      name: 'Cold Remnant', x: 4200, y: 1000, salvageTime: 4,
      derelictClass: 'fighter',
      lootTableId: 'derelict-fighter',
      lootTable: [
        { type: 'scrap',  amount: 28 },
        { type: 'weaponId', id: 'Autocannon' },
        { type: 'ammo',   ammoType: 'autocannon', amount: 30 },
      ],
      loreText: [
        'COLD REMNANT — Maverick-class courier, combat-modified.',
        'Grave Clan markings. Hardpoint still attached.',
      ],
    },
    {
      name: 'Broken Covenant', x: 5500, y: 3200, salvageTime: 5,
      derelictClass: 'frigate',
      lootTableId: 'derelict-frigate',
      lootTable: [
        { type: 'scrap',  amount: 35 },
        { type: 'moduleId', id: 'SmallFissionReactor', condition: 'faulty' },
        { type: 'ammo',   ammoType: 'autocannon', amount: 20 },
      ],
      loreText: [
        'BROKEN COVENANT — Garrison-class frigate, registry struck.',
        'Reactor: unsecured. Drive section intact.',
      ],
    },
  ],

  raiderSpawns: [
  ],

  lurkerSpawns: [
    { x: 1500, y: 2200, count: 1, shipType: 'grave-clan-ambusher' },
    { x: 3700, y: 1750, count: 1, shipType: 'grave-clan-ambusher' },
  ],

  tradeConvoys: [
    { id: 'convoy_west_thorngate', routeA: { x: 600, y: 2500 }, routeB: { x: 2400, y: 1700 }, shipCount: 1, shipType: 'trader-convoy' },
    { id: 'convoy_thorngate_coil', routeA: { x: 2400, y: 1700 }, routeB: { x: 6500, y: 1200 }, shipCount: 1, shipType: 'trader-convoy' },
  ],

  militiaPatrols: [
    { id: 'coil_inner_patrol', orbitCenter: { x: 6500, y: 1200 }, orbitRadius: 280, orbitSpeed: 0.12, count: 2, shipType: 'militia-patrol' },
  ],

  asteroidFields: [],
  nebulae: [],
};

// Test verification steps — shown on-screen in test mode.
export const TEST_STEPS = [
  // Bug fixes
  'FLAK RANGE: cycle to FLAK-S (press 2 twice), move cursor far — crosshair GREEN at ≤1275u, RED beyond.',
  'AI RANGE: spawn armed hauler (X), back off to 1600u+ — hauler should NOT fire at that distance.',
  'ENEMY DAMAGE: spawn light fighter (Z), damage to ~50% hull — ship darkens visually.',
  'ENEMY DAMAGE: damage to ~25% hull — fires slower. ~10% hull — moves sluggishly.',
  'COIL COLOR: fly to The Coil (6500, 1200) — station structure is AMBER (not red).',
  // Ship screen
  'SHIP SCREEN: press I — overlay shows paper doll with armor rings, stats, 4 module slots, cargo list.',
  'SHIP SCREEN MODULES: slots show ONYX DRIVE / AUTOCANNON / FISSION REACTOR (S) / SALVAGED SENSORS / EMPTY (test mode).',
  'FUEL CELL DRAIN: sit at throttle 0 — reactor draws no fuel. Only drive unit idle drain applies.',
  // Enemy AI
  'LIGHT FIGHTERS: two red needle ships patrol east. Approach — they stalk to your aft and fire when aligned.',
  'ARMED HAULER: boxy red ship at (2200, 2100). Kites at range with autocannon and lance beam.',
  'SALVAGE MOTHERSHIP: large frigate at (2800, 2700). Holds at 1200u, lobs cannon shells + heat missiles.',
  // Neutral traffic
  'TRADE CONVOY: amber haulers travel the trade lane. MILITIA: amber frigates orbit The Coil.',
  'DOCKING: approach Thorngate Relay (2400, 1700) or Ashveil Anchorage (7000, 2200) — E to dock.',
  // Lurker AI
  'LURKER HIDING: Grave-Clan Ambusher at (1500, 2200) waits at cover — does NOT aggro player at range.',
  'LURKER POUNCE: watch it attack when trade convoy passes within 700u of its cover point.',
  'LURKER SWITCH: approach lurker within 1400u while it is pouncing — it should retarget to player.',
  'LURKER FLEE: damage lurker below 30% hull — it rotates away and runs at full throttle.',
  // Kill log + range circle
  'KILL LOG: destroy any enemy — upper-right shows "<Name> destroyed" in red, fades after 3s.',
  'RANGE CIRCLE: equip primary weapon — dashed cyan ring around player shows max range.',
  'FLAK RING: cycle to FLAK-S (primary) — second dashed ring appears at cursor showing blast AoE.',
  // Module installation
  'MODULE LOOT: kill enemies until a CYAN diamond drop appears — fly over it to pick up.',
  'MODULE INSTALL: press I, click an empty slot (green) — SALVAGED SENSORS listed, click to start install.',
  'MODULE PROGRESS: green fill bar animates for 1.5s, then slot fills. Cargo column shows removal.',
  'MODULE REMOVE: click an installed module in the slot — it moves back to cargo.',
  // Bounty board
  'BOUNTY TAB: dock Kell\'s Stop — "Bounties" tab visible; dock The Coil — no Bounties tab.',
  'ACCEPT: click Accept on "Ironback" Marel — contract moves to YOUR CONTRACTS; target spawns near (1800,3200).',
  'KILL: destroy the named target — HUD shows "Bounty Complete: +90 scrap" floating text.',
  'COLLECT: redock Kell\'s Stop — scrap increases by 90; completed entry gone from list.',
  'EXPIRY: accept "Gutshot" Drev (2 min timer), wait without killing — card turns RED then EXPIRED.',
  // Power plants
  'FISSION REACTOR: press I — slot 2 shows FISSION REACTOR (S) at +160W.',
  'OVERHAUL TIMER: hover the reactor slot — tooltip shows OVERHAUL IN: Xh Xm and OVERHAUL COST: 800 scrap.',
  'REACTOR OVERDUE: open browser console, run: game.player.moduleSlots[1].timeSinceOverhaul = 11000 to force overdue. HUD shows flashing "REACTOR OVERHAUL REQUIRED". Slot shows +96W ! in magenta.',
  'OVERHAUL SERVICE: dock Ashveil Anchorage (7000, 2200) — Services tab shows "REACTOR OVERHAUL" section with !! button. Click to spend 800 scrap — reactor resets to healthy.',
  // Salvage expansion
  'HULL SHAPES: fly to each derelict — Gutted Pioneer (hauler, octagon), Hollow March (unknown, asymmetric), Cold Remnant (fighter, dart), Broken Covenant (frigate, H-beam). Each has a distinct color.',
  'LORE LINE: approach any derelict — a dim lore line appears above the AMBER "Press E to salvage" prompt.',
  'AMMO DROP: salvage Cold Remnant (fighter at 4200, 1000) — expect GREEN ammo diamond(s) + MAGENTA weapon diamond. Pick up — HUD shows "+N Autocannon Ammo" text.',
  'WEAPON CARGO: press I after picking up weapon drop — WEAPONS (CARGO) section appears in right column showing weapon name and PRIMARY/SECONDARY.',
  'MODULE CONDITION: salvage Hollow March (unknown at 2800, 2800) — module drop appears. Press I, hover the module pill — tooltip shows CONDITION and MULT rows in appropriate color.',
  'DESTROYED MODULE: open console, set: game.modules[0].condition = "destroyed" then drag it back to cargo via click; or: manually test createModuleDrop with a destroyed module — it should drop an AMBER scrap diamond, not a CYAN module diamond.',
  'CONDITION BADGE: salvage Broken Covenant (frigate at 5500, 3200) — module with FAULTY condition drops. Press I — slot/cargo pill shows orange "FAULTY" badge below module name.',
  // Hull breach + module repair
  'HULL BREACH: take enough hits to drop below 60% hull. Continue taking hits — orange floating text "MODULE DAMAGED" or "MODULE WORN" should appear when a module condition degrades.',
  'BREACH TIERS: drive hull to <30% then <10% — breach chance increases. Console: game.player.moduleSlots to check conditions.',
  'MODULE REPAIR: stop ship (throttle 0) with damaged modules and scrap. Repair prompt shows "15 scrap/step". Press R — orange "MODULE REPAIR..." bar appears above the armor repair bar.',
  'REPAIR SIMULTANEOUS: armor and module repair run together. Both bars visible when both are needed.',
  'REPAIR COMPLETE: module condition improves one step (e.g. damaged → faulty → worn → good) per 4 seconds at 15 scrap each. Press I to verify badge updates.',
  // Commodity expansion
  'TRADE FILTERED: dock The Coil — Trade tab shows ~6 rows (Weapons Cache, Raw Ore, Hull Plating, Contraband, Alloys, Void Crystals). No empty rows.',
  'TRADE PRICES: Weapons Cache at Coil (surplus) buys cheap; sell at Ashveil (not stocked) for full price.',
  'COMMODITY LOOT: kill scavengers — pickup text shows new names (Raw Ore, Machine Parts, etc.) not "food" or "ore".',
  'VOID CRYSTALS: salvage Hollow March (2800, 2800) — Void Crystals cargo item appears (was Exotics).',
  // Reputation system
  'REP HEADER: dock any station — below faction label shows standing level (e.g. NEUTRAL [+0]) in DIM color.',
  'REP RELATIONS: click Relations tab — all 6 factions listed with level + numeric standing.',
  'REP KILL: kill 2–3 scavenger enemies → dock The Coil — header shows WARY [-10...-20] in orange.',
  'REP RIVAL BONUS: killing scavengers also raises Settlements by +5 each — check Relations tab.',
  'REP BOUNTY: complete a bounty at Kell\'s Stop — Settlements standing rises by +20 on collect.',
  'REP NEUTRAL HIT: fire a shot at a trade convoy hauler — HUD pickup text confirms; Settlements drops by -25.',
  'REP HOSTILE (devmode): open console, run: game.reputation.standings.scavengers = -51 → try docking The Coil — "DOCKING REFUSED" floats in RED, docking prevented.',
  'REP ALLIED (devmode): open console, run: game.reputation.standings.settlements = 51 → dock Kell\'s Stop — repair/fuel costs show 15% discount; badge shows ALLIED in CYAN.',
];
