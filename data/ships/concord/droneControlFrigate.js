import { registerContent } from '@data/dataRegistry.js';

const SHIP = {
  id: 'drone-control-frigate',
  label: 'Drone Control Frigate',
  shipClass: 'garrison-frigate',
  name: 'Drone Control Frigate',
  unmanned: true,
  faction: 'concord',
  relation: 'hostile',
  aiBehavior: 'standoff',
  entityClass: 'drone-control-frigate',
  modules: ['standard-rocket-l', 'lance-st', 'null'],
  flavorText:
    'A Concord Remnant command vessel — repurposed garrison hull stripped of ' +
    'crew provisions and rebuilt as a drone carrier. Geometric sensor arrays ' +
    'replace the bow tower. Bay notches on the flanks cycle drones continuously. ' +
    'It does not rush. It does not retreat. It deploys and waits. ' +
    'Strength: relentless drone harassment, fortress-grade frontal armor. ' +
    'Weakness: drones are fragile; destroy them before focusing the hull.',
};

registerContent('ships', SHIP.id, SHIP);
