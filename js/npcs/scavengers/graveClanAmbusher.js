import { MaverickCourier } from '@/ships/classes/maverickCourier.js';
import { AutocannonModule, RocketPodModule, OnyxDriveUnit } from '@/modules/shipModule.js';
import { Character } from '@/characters/character.js';

export function createGraveClanAmbusher(x, y) {
  const ship = new MaverickCourier(x, y);
  ship.shipType = 'grave-clan-ambusher';
  ship.moduleSlots = [new OnyxDriveUnit(), new AutocannonModule(), new RocketPodModule('small', 'ht')];
  ship._applyModules();
  ship.flavorText =
    'A Maverick Courier fielded by Grave-Clan cells. They pick a spar or debris ' +
    'shadow and wait. When a convoy moves through they commit hard: autocannon ' +
    'for armor, a heat missile to finish it.';

  const captain = new Character({
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
  });
  captain.boardShip(ship);
  return ship;
}
