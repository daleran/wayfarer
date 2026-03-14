import { GarrisonFrigate } from '@/ships/classes/garrisonFrigate.js';
import { OnyxDriveUnit } from '@/modules/shipModule.js';
import { Character } from '@/characters/character.js';

export function createMilitiaPatrol(x, y) {
  const ship = new GarrisonFrigate(x, y);
  ship.shipType = 'militia-patrol';
  ship.moduleSlots = [new OnyxDriveUnit()];
  ship._applyModules();
  ship.flavorText =
    'A settlement-operated Garrison-class Frigate running security on nearby approaches. ' +
    'Not as well-armed as the original spec, but better maintained than most scavenger conversions.';

  const captain = new Character({
    id: 'militia-patrol',
    name: 'Militia Officer',
    faction: 'neutral',
    relation: 'neutral',
    behavior: 'militia',
    flavorText:
      'A settlement security officer on permanent patrol rotation. Steady, ' +
      'professional, and territorial. They enforce order within their zone ' +
      'and ignore everything outside it. Not your ally, but not your enemy — ' +
      'unless you make them one.',
  });
  captain.boardShip(ship);
  return ship;
}
