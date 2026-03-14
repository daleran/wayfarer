import { G100ClassHauler } from '@/ships/classes/g100Hauler.js';
import { AutocannonModule, LanceModuleSmall, OnyxDriveUnit } from '@/modules/shipModule.js';
import { Character } from '@/characters/character.js';

export function createArmedHauler(x, y) {
  const ship = new G100ClassHauler(x, y);
  ship.shipType = 'armed-hauler';
  ship.moduleSlots = [new OnyxDriveUnit(), new AutocannonModule(), new LanceModuleSmall(), null];
  ship._applyModules();
  ship.flavorText =
    'A G100 hauler with the cargo bays gutted and armor plate welded over ' +
    'everything. What was once a trade vessel became a mobile fire platform.';

  const captain = new Character({
    id: 'armed-hauler',
    name: 'Scavenger Gunner',
    faction: 'scavenger',
    relation: 'hostile',
    behavior: 'kiter',
    flavorText:
      'A veteran scavenger who graduated from courier raids to a proper gun platform. ' +
      'Patient, methodical, and hard to rattle. Prefers to keep distance and let ' +
      'the lance do the talking. Has survived longer than most — which in the ' +
      'Gravewake means they know when to run.',
  });
  captain.boardShip(ship);
  return ship;
}
