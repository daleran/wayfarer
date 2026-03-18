// Planet Pale — register into CONTENT.locations for designer/editor access.
// Also exports PalePlanet entity descriptor for manifest placement.

import { PlanetPale } from '../terrain/planet-pale/index.js';
import { Planet } from '@/entities/planet.js';
import { registerContent } from '@data/dataRegistry.js';
import { LOCATION_TYPE } from '@data/enums.js';

// ── Layout ─────────────────────────────────────────────────────────────────

const LAYOUT = {
  sections: [
    {
      id:          'settlement',
      label:       'Cryo-Flat Settlement',
      description: 'A cluster of pressurized shelters on the ice.',
      services:    ['trade'],
      worldOffset: { x: -200, y: 100 },
      flavor: [
        '[ CRYO-FLAT SETTLEMENT ]',
        '',
        'Prefab shelters half-buried in nitrogen frost. Smoke from reclamation furnaces.',
        'The settlers trade in scrap and silence.',
      ],
      requiredStanding: null,
    },
    {
      id:          'intel',
      label:       'Intel',
      description: 'Surface intelligence and local rumors.',
      services:    ['intel'],
      worldOffset: { x: 0, y: -150 },
      flavor: [],
      requiredStanding: null,
    },
    {
      id:          'relations',
      label:       'Relations',
      description: 'Faction standings.',
      services:    ['relations'],
      worldOffset: { x: 200, y: 100 },
      flavor: [],
      requiredStanding: null,
    },
  ],
};

// ── Entity descriptor + instantiate ─────────────────────────────────────────

export const PalePlanet = {
  id: 'pale',
  name: 'Pale',
  flavorText:
    "A frozen world of nitrogen plains and fractured ice. Navigation charts " +
    "list it as uninhabitable — the scavenger clans who've built settlements " +
    "on its cryo-flats prefer it that way.",
  faction: 'settlements',
  dockingRadius: 600,
  layout: LAYOUT,
  conversations: {
    hub: 'genericPlanetHub',
    sections: {},
  },

  instantiate(x, y) {
    return new Planet(x, y, this);
  },
};

registerContent('locations', 'planet-pale', {
  id: 'planet-pale',
  locationType: LOCATION_TYPE.PLANET,
  name: 'Pale (ice planet)',
  flavorText: PalePlanet.flavorText,
  backgroundData: (overrides) => PlanetPale.backgroundData(overrides),
  entity: PalePlanet,
});
