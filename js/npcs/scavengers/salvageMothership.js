import { GarrisonFrigate } from '@/ships/classes/garrisonFrigate.js';
import { CannonModule, RocketPodModule, OnyxDriveUnit } from '@/modules/shipModule.js';
import { Character } from '@/characters/character.js';

export function createSalvageMothership(x, y) {
  const ship = new GarrisonFrigate(x, y);
  ship.shipType = 'salvage-mothership';
  ship.moduleSlots = [new OnyxDriveUnit(), new CannonModule(), new RocketPodModule('large', 'ht'), null, null];
  ship._applyModules();
  ship.flavorText =
    'A Garrison-class Frigate repurposed as a mobile salvage base and clan flagship. ' +
    'Cannon for hard targets. Missiles for deterrence. Where you find one of ' +
    'these, the clan has been working this sector a long time.';

  const captain = new Character({
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
  });
  captain.boardShip(ship);
  return ship;
}
