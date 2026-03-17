// Planet Pale — register into CONTENT.locations for designer/editor access.

import { PlanetPale } from '../terrain/planet-pale/index.js';
import { registerContent } from '@data/dataRegistry.js';
import { LOCATION_TYPE } from '@data/enums.js';

registerContent('locations', 'planet-pale', {
  id: 'planet-pale',
  locationType: LOCATION_TYPE.PLANET,
  name: 'Pale (ice planet)',
  flavorText:
    "A frozen world of nitrogen plains and fractured ice. Navigation charts " +
    "list it as uninhabitable — the scavenger clans who've built settlements " +
    "on its cryo-flats prefer it that way.",
  backgroundData: (overrides) => PlanetPale.backgroundData(overrides),
});
