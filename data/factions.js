// =============================================================================
// WAYFARER — Faction Data (LEGACY)
// These exports are deprecated. Use factionHelpers.js instead.
// Kept temporarily for extract-data.js compatibility.
// =============================================================================

import { getRootFactions, getFactionName } from './factionHelpers.js';

/** @deprecated Use getRootFactions() */
export const FACTIONS = getRootFactions();

/** @deprecated Use getFactionName(id) */
export const FACTION_LABELS = Object.fromEntries(
  getRootFactions().map(id => [id, getFactionName(id)])
);

/** @deprecated Use getRootFaction(entityFaction) */
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

/** @deprecated Use areFactionsHostile() */
export const RIVALS = {
  scavengers: 'settlements',
  concord:    'settlements',
};
