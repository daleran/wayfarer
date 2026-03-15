import { registerData, NPC_SHIPS, registerContent } from '@data/dataRegistry.js';

const ACTOR = {
  'light-fighter': {
    label: 'Light Fighter',
    shipClass: 'maverick-courier',
    faction: 'scavenger',
    relation: 'hostile',
    aiBehavior: 'stalker',
    modules: ['onyx-drive-unit', 'autocannon-module', 'null'],
    flavorText:
      'A Maverick Courier stripped for aggression — autocannon bolted to the nose, ' +
      'everything non-essential jettisoned. Cheap to field, cheap to replace.',
    character: {
      id: 'light-fighter',
      name: 'Scavenger Pilot',
      faction: 'scavenger',
      relation: 'hostile',
      behavior: 'stalker',
      flavorText:
        'One of hundreds who scrape a living raiding trade lanes in the Gravewake. ' +
        'No rank, no name worth remembering. They come in packs and they stay moving — ' +
        'the ones who stop moving are the ones you find drifting.',
    },
  },
};

registerData(NPC_SHIPS, ACTOR);

for (const [id, data] of Object.entries(ACTOR)) {
  registerContent('actors', id, data);
}
