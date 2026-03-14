import { MaverickCourier } from '@/ships/classes/maverickCourier.js';
import { AutocannonModule, OnyxDriveUnit } from '@/modules/shipModule.js';
import { Character } from '@/characters/character.js';

export function createLightFighter(x, y) {
  const ship = new MaverickCourier(x, y);
  ship.shipType = 'light-fighter';
  ship.moduleSlots = [new OnyxDriveUnit(), new AutocannonModule(), null];
  ship._applyModules();
  ship.flavorText =
    'A Maverick Courier stripped for aggression — autocannon bolted to the nose, ' +
    'everything non-essential jettisoned. Cheap to field, cheap to replace.';

  const captain = new Character({
    id: 'light-fighter',
    name: 'Scavenger Pilot',
    faction: 'scavenger',
    relation: 'hostile',
    behavior: 'stalker',
    flavorText:
      'One of hundreds who scrape a living raiding trade lanes in the Gravewake. ' +
      'No rank, no name worth remembering. They come in packs and they stay moving — ' +
      'the ones who stop moving are the ones you find drifting.',
  });
  captain.boardShip(ship);
  return ship;
}
