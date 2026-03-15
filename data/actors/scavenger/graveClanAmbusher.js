import { registerData, NPC_SHIPS, registerContent } from '@data/dataRegistry.js';

const ACTOR = {
  'grave-clan-ambusher': {
    label: 'Grave-Clan Ambusher',
    shipClass: 'maverick-courier',
    faction: 'scavenger',
    relation: 'hostile',
    aiBehavior: 'lurker',
    modules: ['onyx-drive-unit', 'autocannon-module', 'rocket-pod-s:ht'],
    flavorText:
      'A Maverick Courier fielded by Grave-Clan cells. They pick a spar or debris ' +
      'shadow and wait. When a convoy moves through they commit hard: autocannon ' +
      'for armor, a heat missile to finish it.',
    character: {
      id: 'grave-clan-ambusher',
      name: 'Grave-Clan Hunter',
      faction: 'scavenger',
      relation: 'hostile',
      behavior: 'lurker',
      flavorText:
        'The most patient killers in the Gravewake. Grave-Clan hunters know the ' +
        'trade lanes the way scavengers know wreckage — intimately and by feel. ' +
        'They commit fully when they attack. No fallback plan. The ones who ' +
        'hesitated are already dead.',
    },
  },
};

registerData(NPC_SHIPS, ACTOR);

for (const [id, data] of Object.entries(ACTOR)) {
  registerContent('actors', id, data);
}
