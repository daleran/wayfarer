import { registerContent } from '@data/dataRegistry.js';

const SHIP = {
  id: 'salvage-mothership',
  label: 'Salvage Mothership',
  shipClass: 'garrison-frigate',
  name: 'Salvage Mothership',
  modules: ['onyx-drive-unit', 'cannon-module', 'rocket-pod-l:ht', 'null', 'null'],
  flavorText:
    'A Garrison-class Frigate repurposed as a mobile salvage base and clan flagship. ' +
    'Cannon for hard targets. Missiles for deterrence. Where you find one of ' +
    'these, the clan has been working this sector a long time.',
};

registerContent('ships', SHIP.id, SHIP);
