// =============================================================================
// WAYFARER — Child Faction Definitions
// Sub-factions that inherit reputation from their root parent.
// =============================================================================

import { registerContent } from '@data/dataRegistry.js';

registerContent('factions', 'kells-stop', {
  name: "Kell's Stop",
  parent: 'settlements',
});

registerContent('factions', 'ashveil', {
  name: 'Ashveil Anchorage',
  parent: 'settlements',
});

registerContent('factions', 'the-coil', {
  name: 'The Coil',
  parent: 'scavengers',
});

registerContent('factions', 'grave-clan', {
  name: 'Grave Clan',
  parent: 'scavengers',
});
