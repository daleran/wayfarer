// Weapon registry — maps weapon ID strings to factory functions.
// Used by SalvageSystem._createWeaponById and loot tables.

import { Autocannon } from './autocannon.js';
import { Cannon } from './cannon.js';
import { Lance } from './lance.js';
import { Railgun } from './railgun.js';
import { GatlingGun } from './gatlingGun.js';
import { PlasmaCannon } from './plasmaCannon.js';
import { RocketPodSmall } from './rocket.js';
import { RocketPodLarge } from './rocketLarge.js';
import { Torpedo } from './torpedo.js';

export const WEAPON_REGISTRY = {
  'Autocannon':         () => new Autocannon(),
  'Cannon':             () => new Cannon(),
  'LanceSmall':         () => new Lance('small-fixed'),
  'LanceLarge':         () => new Lance('large-fixed'),
  'LanceSmallTurret':   () => new Lance('small-turret'),
  'LanceLargeTurret':   () => new Lance('large-turret'),
  'RailgunSmall':       () => new Railgun('small-fixed'),
  'RailgunLarge':       () => new Railgun('large-fixed'),
  'RailgunLargeTurret': () => new Railgun('large-turret'),
  'GatlingGun':         () => new GatlingGun(),
  'PlasmaCannonSmall':  () => new PlasmaCannon('small'),
  'PlasmaCannonLarge':  () => new PlasmaCannon('large'),
  'RocketPodSmall':     () => new RocketPodSmall(),
  'RocketPodLarge':     () => new RocketPodLarge(),
  'Torpedo':            () => new Torpedo(),
};

export function createWeaponById(id) {
  const factory = WEAPON_REGISTRY[id];
  return factory ? factory() : null;
}
