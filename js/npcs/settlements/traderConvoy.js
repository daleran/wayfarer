import { CompactHauler } from '@/ships/classes/compactHauler.js';
import { OnyxDriveUnit } from '@/modules/shipModule.js';
import { Character } from '@/characters/character.js';

export function createTraderConvoy(x, y) {
  const ship = new CompactHauler(x, y);
  ship.shipType = 'trader-convoy';
  ship.moduleSlots = [new OnyxDriveUnit()];
  ship._applyModules();
  ship.flavorText =
    'A G100 hauler on a regular trade run — lightly crewed, unarmed or barely ' +
    'armed, carrying whatever the stations need. The backbone of inter-settlement ' +
    'commerce in the Gravewake.';

  const captain = new Character({
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
  });
  captain.boardShip(ship);
  return ship;
}
