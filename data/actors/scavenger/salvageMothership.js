import { registerData, NPC_SHIPS, registerContent } from '@data/dataRegistry.js';

const ACTOR = {
  'salvage-mothership': {
    label: 'Salvage Mothership',
    shipClass: 'garrison-frigate',
    faction: 'scavenger',
    relation: 'hostile',
    aiBehavior: 'standoff',
    modules: ['onyx-drive-unit', 'cannon-module', 'rocket-pod-l:ht', 'null', 'null'],
    flavorText:
      'A Garrison-class Frigate repurposed as a mobile salvage base and clan flagship. ' +
      'Cannon for hard targets. Missiles for deterrence. Where you find one of ' +
      'these, the clan has been working this sector a long time.',
    character: {
      id: 'salvage-mothership',
      name: 'Salvage Lord',
      faction: 'scavenger',
      relation: 'hostile',
      behavior: 'standoff',
      flavorText:
        'A clan boss who commands from the back. They earned their ship the old way — ' +
        'took it from someone who had it first. Now they sit behind armor and missiles ' +
        'while the fighters do the dying. Every piece of scrap in this sector ' +
        'passes through their hands eventually.',
    },
  },
};

registerData(NPC_SHIPS, ACTOR);

for (const [id, data] of Object.entries(ACTOR)) {
  registerContent('actors', id, data);
}
