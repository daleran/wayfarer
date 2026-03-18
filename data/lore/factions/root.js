// =============================================================================
// WAYFARER — Root Faction Definitions
// These are the 7 reputation-tracked factions (no parent).
// =============================================================================

import { registerContent } from '@data/dataRegistry.js';

registerContent('factions', 'settlements', {
  name: 'Settlements',
  defaultReputation: 0,
  relationships: [],
});

registerContent('factions', 'scavengers', {
  name: 'Scavenger Clans',
  defaultReputation: -60,
  relationships: [
    { target: 'settlements', type: 'hostile' },
  ],
});

registerContent('factions', 'concord', {
  name: 'Concord Remnants',
  defaultReputation: -60,
  relationships: [
    { target: 'settlements', type: 'hostile' },
    { target: 'scavengers', type: 'hostile' },
  ],
});

registerContent('factions', 'monastic', {
  name: 'Monastic Orders',
  defaultReputation: 0,
  relationships: [],
});

registerContent('factions', 'zealots', {
  name: 'Zealots of the Directive',
  defaultReputation: -60,
  relationships: [
    { target: 'monastic', type: 'hostile' },
  ],
});

registerContent('factions', 'casimir', {
  name: 'House Casimir',
  defaultReputation: 0,
  relationships: [],
});
