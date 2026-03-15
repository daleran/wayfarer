import { registerData, NPC_SHIPS, registerContent } from '@data/dataRegistry.js';

const ACTOR = {
  'trader-convoy': {
    label: 'Trader Convoy',
    shipClass: 'g100-hauler',
    faction: 'neutral',
    relation: 'neutral',
    aiBehavior: 'trader',
    modules: ['onyx-drive-unit'],
    flavorText:
      'A G100 hauler on a regular trade run — lightly crewed, unarmed or barely ' +
      'armed, carrying whatever the stations need. The backbone of inter-settlement ' +
      'commerce in the Gravewake.',
    character: {
      id: 'trader-convoy',
      name: 'Convoy Hauler',
      faction: 'neutral',
      relation: 'neutral',
      behavior: 'trader',
      flavorText:
        'A working hauler running the circuit between settlements. Not brave, ' +
        'not foolish — just persistent. They know the route, they know the risks, ' +
        'and they keep showing up because someone has to. The settlements would ' +
        'starve without them.',
    },
  },
};

registerData(NPC_SHIPS, ACTOR);

for (const [id, data] of Object.entries(ACTOR)) {
  registerContent('actors', id, data);
}
