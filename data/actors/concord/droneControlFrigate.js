import { registerData, NPC_SHIPS, registerContent } from '@data/dataRegistry.js';

const ACTOR = {
  'drone-control-frigate': {
    label: 'Drone Control Frigate',
    shipClass: 'garrison-frigate',
    faction: 'concord',
    relation: 'hostile',
    aiBehavior: 'standoff',
    unmanned: true,
    entityClass: 'drone-control-frigate',
    modules: ['onyx-drive-unit', 'lance-small', 'null'],
    flavorText:
      'A Concord Remnant command vessel — repurposed garrison hull stripped of ' +
      'crew provisions and rebuilt as a drone carrier. Geometric sensor arrays ' +
      'replace the bow tower. Bay notches on the flanks cycle drones continuously. ' +
      'It does not rush. It does not retreat. It deploys and waits. ' +
      'Strength: relentless drone harassment, fortress-grade frontal armor. ' +
      'Weakness: drones are fragile; destroy them before focusing the hull.',
  },
};

registerData(NPC_SHIPS, ACTOR);

for (const [id, data] of Object.entries(ACTOR)) {
  registerContent('actors', id, data);
}
