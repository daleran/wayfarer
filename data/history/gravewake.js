// =============================================================================
// WAYFARER — Gravewake Zone History
// Seed lore entries for the Gravewake zone timeline.
// =============================================================================

import { ENTITY } from '../enums.js';
import { registerContent } from '../dataRegistry.js';

registerContent('history', 'gw_zone_collapse', {
  date: { year: 2491, month: 6, day: 3 },
  text: 'A catastrophic jump-gate failure tears open the Gravewake zone, stranding dozens of vessels.',
  tags: ['gravewake', 'history'],
});

registerContent('history', 'gw_scav_claim', {
  date: { year: 2493, month: 1, day: 15 },
  text: 'The {{faction}} establish permanent salvage camps in Gravewake, claiming the wreck fields as territory.',
  related: {
    faction: { type: ENTITY.FACTION, id: 'scavengers' },
  },
  tags: ['gravewake', 'scavengers'],
});

registerContent('history', 'gw_concord_patrol', {
  date: { year: 2497, month: 8, day: 22 },
  text: 'A {{faction}} patrol frigate enters Gravewake on automated survey. It never reports back.',
  related: {
    faction: { type: ENTITY.FACTION, id: 'concord' },
  },
  tags: ['gravewake', 'concord'],
});

registerContent('history', 'gw_pale_founded', {
  date: { year: 2502, month: 4, day: 11 },
  text: '{{station}} is established as a neutral trading post at the edge of the debris field.',
  related: {
    station: { type: ENTITY.STATION, id: 'pale' },
  },
  tags: ['gravewake', 'settlements'],
});

registerContent('history', 'gw_warlord_rise', {
  date: { year: 2507, month: 11, day: 2 },
  text: 'A scavenger warlord unifies three rival clans under a single banner, tightening {{faction}} control over the deep wrecks.',
  related: {
    faction: { type: ENTITY.FACTION, id: 'scavengers' },
  },
  tags: ['gravewake', 'scavengers', 'scavenger_warlord'],
});
