// Planet Pale — register into CONTENT.planets for designer/editor access.

import { PlanetPale } from '../terrain/planet-pale/index.js';
import { registerContent } from '@data/dataRegistry.js';

registerContent('planets', 'planet-pale', {
  label: 'Pale (ice planet)',
  flavorText:
    "A frozen world of nitrogen plains and fractured ice. Navigation charts " +
    "list it as uninhabitable — the scavenger clans who've built settlements " +
    "on its cryo-flats prefer it that way.",
  backgroundData: (overrides) => PlanetPale.backgroundData(overrides),
});
