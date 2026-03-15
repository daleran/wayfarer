// Weapon registry — maps weapon ID strings to factory functions.
// Used by SalvageSystem, loot tables, and the designer.
// Each entry carries designer metadata so new weapons auto-appear in the designer.

import { Autocannon } from './autocannon.js';
import { Cannon } from './cannon.js';
import { Lance } from './lance.js';
import { Railgun } from './railgun.js';
import { GatlingGun } from './gatlingGun.js';
import { PlasmaCannon } from './plasmaCannon.js';
import { RocketPodSmall } from './rocket.js';
import { RocketPodLarge } from './rocketLarge.js';
import { Torpedo } from './torpedo.js';
import {
  AMBER, GREEN, CYAN, RAIL_WHITE, PLASMA_GREEN, TORPEDO_AMBER, CANNON_AMBER,
} from '@/rendering/colors.js';

// Designer metadata per entry:
//   slug       — URL-safe id for designer deep-linking
//   label      — display name in designer panel
//   flavorText — lore blurb shown in designer
//   projColor  — color used for preview projectile/beam animation
//   projLen    — preview projectile length (ignored for beams)
//   projTrail  — whether preview shows a trailing gradient
//   flags      — tag array shown in designer stats panel

export const WEAPON_REGISTRY = [
  {
    id: 'Autocannon', slug: 'autocannon', label: 'Autocannon',
    create: () => new Autocannon(),
    flavorText: "Rotating breech, medium caseless, point-and-fire. AP or HE mode. Standard issue for anyone who can afford it.",
    projColor: AMBER, projLen: 3, projTrail: true,
    flags: ['manual', 'ammo-modes'],
  },
  {
    id: 'GatlingGun', slug: 'gatling', label: 'Gatling',
    create: () => new GatlingGun(),
    flavorText: "Six barrels, one aim. Shreds at close range. Reloads slow. Point defense capable.",
    projColor: GREEN, projLen: 3, projTrail: false,
    flags: ['manual', 'intercept', 'ammo'],
  },
  {
    id: 'RailgunSmall', slug: 'railgun-sf', label: 'Railgun (SF)',
    create: () => new Railgun('small-fixed'),
    flavorText: "Small fixed rail accelerator. No pivot mount — the whole ship is the gun platform.",
    projColor: RAIL_WHITE, projLen: 12, projTrail: true,
    flags: ['fixed', 'hull-dmg', 'ammo'],
  },
  {
    id: 'RailgunLargeTurret', slug: 'railgun-lt', label: 'Railgun (LT)',
    create: () => new Railgun('large-turret'),
    flavorText: "Two conductive rails, one very fast slug. Accuracy drops before effective range does.",
    projColor: RAIL_WHITE, projLen: 12, projTrail: true,
    flags: ['manual', 'hull-dmg', 'ammo'],
  },
  {
    id: 'RailgunLarge', slug: 'railgun-lf', label: 'Railgun (LF)',
    create: () => new Railgun('large-fixed'),
    flavorText: "The full-length rail cannon. Massive penetrator. Hull-mount only. Devastating.",
    projColor: RAIL_WHITE, projLen: 12, projTrail: true,
    flags: ['fixed', 'hull-dmg', 'ammo'],
  },
  {
    id: 'LanceSmall', slug: 'lance-sf', label: 'Lance (SF)',
    create: () => new Lance('small-fixed'),
    flavorText: "Hull-mounted lance projector. No gimbal. Ramps to high damage. Aim with the ship.",
    projColor: CYAN,
    flags: ['beam', 'fixed', 'ramp-dmg', 'hull-dmg'],
  },
  {
    id: 'LanceSmallTurret', slug: 'lance-st', label: 'Lance (ST)',
    create: () => new Lance('small-turret'),
    flavorText: "Point-defense beam. Low power draw. Can intercept missiles passing through the beam.",
    projColor: CYAN,
    flags: ['beam', 'ramp-dmg', 'intercept'],
  },
  {
    id: 'LanceLarge', slug: 'lance-lf', label: 'Lance (LF)',
    create: () => new Lance('large-fixed'),
    flavorText: "Heavy fixed lance. Full hull-damage application. Maximum ramp ceiling.",
    projColor: CYAN,
    flags: ['beam', 'fixed', 'ramp-dmg', 'hull-dmg'],
  },
  {
    id: 'LanceLargeTurret', slug: 'lance-lt', label: 'Lance (LT)',
    create: () => new Lance('large-turret'),
    flavorText: "Heavy turret lance. Full hull damage, wide tracking arc. Power hungry.",
    projColor: CYAN,
    flags: ['beam', 'ramp-dmg', 'hull-dmg'],
  },
  {
    id: 'PlasmaCannonSmall', slug: 'plasma-s', label: 'Plasma (S)',
    create: () => new PlasmaCannon('small'),
    flavorText: "Superheated bolt, damage falls with distance. Best used close; worst used as a threat.",
    projColor: PLASMA_GREEN, projLen: 5, projTrail: false,
    flags: ['manual', 'falloff', 'hull-dmg'],
  },
  {
    id: 'PlasmaCannonLarge', slug: 'plasma-l', label: 'Plasma (L)',
    create: () => new PlasmaCannon('large'),
    flavorText: "Long-cycle plasma system. More mass, longer burn, further reach.",
    projColor: PLASMA_GREEN, projLen: 5, projTrail: false,
    flags: ['manual', 'falloff', 'hull-dmg'],
  },
  {
    id: 'Cannon', slug: 'cannon', label: 'Cannon',
    create: () => new Cannon(),
    flavorText: "Smoothbore heavy round. AP or HE mode. No electronics. It hits or it doesn't.",
    projColor: CANNON_AMBER, projLen: 7, projTrail: false,
    flags: ['manual', 'aoe', 'hull-dmg', 'ammo', 'ammo-modes'],
  },
  {
    id: 'RocketPodSmall', slug: 'rpod-s', label: 'Rocket Pod (S)',
    create: () => new RocketPodSmall(),
    flavorText: "Two-tube pod. Dumbfire rockets, wire-guided, or heat-seeking. Each is a separate ammo type.",
    projColor: AMBER, projLen: 8, projTrail: true,
    flags: ['secondary', 'aoe', 'hull-dmg', 'ammo', 'ammo-modes'],
  },
  {
    id: 'RocketPodLarge', slug: 'rpod-l', label: 'Rocket Pod (L)',
    create: () => new RocketPodLarge(),
    flavorText: "Eight-tube burst pod. Staggered fire. Fills the sky. Same ammo options as small pod.",
    projColor: AMBER, projLen: 8, projTrail: true,
    flags: ['secondary', 'aoe', 'hull-dmg', 'ammo', 'burst', 'ammo-modes'],
  },
  {
    id: 'Torpedo', slug: 'torpedo', label: 'Torpedo',
    create: () => new Torpedo(),
    flavorText: "Heavy ship-killer. Fixed forward only. Interceptable. Takes commitment.",
    projColor: TORPEDO_AMBER, projLen: 16, projTrail: true,
    flags: ['secondary', 'fixed', 'interceptable', 'aoe', 'hull-dmg', 'ammo'],
  },
];

// ── Lookup helpers ───────────────────────────────────────────────────────────

const _weaponMap = new Map(WEAPON_REGISTRY.map(w => [w.id, w.create]));

export function createWeaponById(id) {
  const factory = _weaponMap.get(id);
  return factory ? factory() : null;
}
