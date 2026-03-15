// =============================================================================
// WAYFARER — Faction Data
// Reputation factions, display labels, faction mappings, and rival bonuses.
// =============================================================================

export const FACTIONS = ['settlements', 'scavengers', 'concord', 'monastic', 'communes', 'zealots', 'casimir'];

export const FACTION_LABELS = {
  settlements: 'Settlements',
  scavengers:  'Scavenger Clans',
  concord:     'Concord Remnants',
  monastic:    'Monastic Orders',
  communes:    'Communes',
  zealots:     'Zealots',
  casimir:     'House Casimir',
};

// Maps station/ship .faction string → reputation faction key
export const FACTION_MAP = {
  neutral:      'settlements',
  independent:  'settlements',
  salvage_lords:'scavengers',
  scavengers:   'scavengers',
  military:     'concord',
  monastic:     'monastic',
  communes:     'communes',
  zealots:      'zealots',
  casimir:      'casimir',
};

// Rival bonuses: kill faction X → rival faction gains bonus
export const RIVALS = {
  scavengers: 'settlements',
  concord:    'settlements',
};
