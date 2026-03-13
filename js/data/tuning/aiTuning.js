// =============================================================================
// WAYFARER — AI TUNING
// AI behavior templates. Each ship receives a shallow copy of a template so
// individual characters can override specific values while keeping defaults.
//
// Two keys define a ship's behavior:
//   passiveBehavior — what the ship does when relation !== 'hostile'
//                     ('trader' | 'militia' | undefined for idle)
//   combatBehavior  — what the ship does when relation === 'hostile'
//                     ('stalker' | 'kiter' | 'standoff' | 'lurker' | 'flee')
//
// Ships that are always hostile (scavengers) have no passiveBehavior.
// Ships that start neutral (traders, militia) have both — combatBehavior
// activates the moment their relation is set to 'hostile'.
// =============================================================================

export const AI_TEMPLATES = {

  // ─── Combat behaviors ─────────────────────────────────────────────────────

  // Flanks to player's aft, fires only when nose-aligned
  stalker: {
    combatBehavior:     'stalker',
    aggroRange:          1400,
    deaggroRange:        2000,
    fireRange:            800,
    orbitRadius:          550,
    patrolRadius:         300,
    fleeHullRatio:        0.3,
    aftDistance:          300,
    aimTolerance:         0.4,
    orbitHoldThreshold:    80,
  },

  // Maintains distance; retreats when player closes
  kiter: {
    combatBehavior:     'kiter',
    aggroRange:          1400,
    deaggroRange:        2000,
    fireRange:            800,
    kiteRange:            750,
    patrolRadius:         300,
    fleeHullRatio:        0.3,
    orbitHoldThreshold:    80,
  },

  // Holds long range; fires cannon + missiles
  standoff: {
    combatBehavior:     'standoff',
    aggroRange:          1400,
    deaggroRange:        2000,
    standoffRange:       1200,
    standoffFireRange:   1400,
    patrolRadius:         300,
    fleeHullRatio:        0.3,
  },

  // Charges directly at player to latch; no weapons, no orbit
  latch: {
    combatBehavior:     'latch',
    aggroRange:          1800,
    deaggroRange:        2400,
    patrolRadius:         200,
    fleeHullRatio:        0,       // never flees — expendable
  },

  // Hides near cover; pounces on traders and switches to player if closer
  lurker: {
    combatBehavior:     'lurker',
    aggroRange:          1400,
    deaggroRange:        2000,
    standoffFireRange:   1400,
    lurkerScanRange:      700,
    lurkerHideRadius:     150,
    fleeHullRatio:        0.3,
  },

  // ─── Passive behaviors (with combat fallback) ──────────────────────────────

  // Travels a route between two waypoints; flees if turned hostile
  trader: {
    passiveBehavior:    'trader',
    combatBehavior:     'flee',
    aggroRange:           0,       // never proactively aggros
    travelThrottle:       3,
    approachThrottle:     1,
    arriveRadius:         120,
    slowRadius:           400,
    waitMin:               5,
    waitMax:               8,
    fleeHullRatio:        0.3,
  },

  // Orbits a fixed center; fights back with stalker behavior if turned hostile
  militia: {
    passiveBehavior:    'militia',
    combatBehavior:     'stalker',
    aggroRange:           0,       // never proactively aggros
    deaggroRange:        2000,
    fireRange:            800,
    orbitRadius:          550,
    patrolRadius:         300,
    fleeHullRatio:        0.3,
    aftDistance:          300,
    aimTolerance:         0.4,
    orbitHoldThreshold:    80,
  },
};
