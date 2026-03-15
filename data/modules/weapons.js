import { registerData, registerContent, WEAPONS } from '../dataRegistry.js';
import {
  AutocannonModule, LanceModuleSmall, CannonModule, RocketPodModule,
} from '@/modules/shipModule.js';
import { Autocannon } from '@/modules/weapons/autocannon.js';
import { Cannon } from '@/modules/weapons/cannon.js';
import { Lance } from '@/modules/weapons/lance.js';
import { Railgun } from '@/modules/weapons/railgun.js';
import { GatlingGun } from '@/modules/weapons/gatlingGun.js';
import { PlasmaCannon } from '@/modules/weapons/plasmaCannon.js';
import { RocketPodSmall } from '@/modules/weapons/rocket.js';
import { RocketPodLarge } from '@/modules/weapons/rocketLarge.js';
import { Torpedo } from '@/modules/weapons/torpedo.js';
import {
  AMBER, GREEN, CYAN, RAIL_WHITE, PLASMA_GREEN, TORPEDO_AMBER, CANNON_AMBER,
} from '@/rendering/colors.js';

registerData(WEAPONS, {
  autocannon: {
    displayName: 'AUTOCANNON',
    size: 'S',
    weight: 30,
    powerDraw: 20,
    damageMult: 1,
    rangeMult: 1,
    speedMult: 1,
    cooldownMult: 1.04,
    magSize: 60,
    reloadTime: 10,
    acceptedAmmoTypes: '25mm',
  },
  cannon: {
    displayName: 'CANNON',
    size: 'S',
    weight: 50,
    powerDraw: 30,
    damageMult: 3.24,
    hullDamageMult: 4.5,
    rangeMult: 0.933,
    speedMult: 0.65,
    cooldownMult: 3,
    magSize: 4,
    reloadTime: 14,
    acceptedAmmoTypes: '90mm',
  },
  'lance-sf': {
    displayName: 'LANCE-SF',
    size: 'S',
    weight: 25,
    powerDraw: 30,
    rangeMult: 0.4,
    isBeam: 1,
    isFixed: 1,
  },
  'lance-st': {
    displayName: 'LANCE-ST',
    size: 'S',
    weight: 25,
    powerDraw: 15,
    rangeMult: 0.34,
    isBeam: 1,
  },
  'lance-lf': {
    displayName: 'LANCE-LF',
    size: 'L',
    weight: 25,
    powerDraw: 60,
    rangeMult: 0.7,
    isBeam: 1,
    isFixed: 1,
  },
  'lance-lt': {
    displayName: 'LANCE-LT',
    size: 'L',
    weight: 25,
    powerDraw: 50,
    rangeMult: 0.4,
    isBeam: 1,
  },
  'railgun-sf': {
    displayName: 'RAILGUN-SF',
    size: 'S',
    damageMult: 10.6,
    hullDamageMult: 12,
    rangeMult: 2,
    speedMult: 4.5,
    magSize: 1,
    reloadTime: 5.4,
    acceptedAmmoTypes: '30mm-kp',
    isFixed: 1,
  },
  'railgun-lt': {
    displayName: 'RAILGUN-LT',
    size: 'S',
    damageMult: 10.6,
    hullDamageMult: 12,
    rangeMult: 2,
    speedMult: 4.5,
    magSize: 1,
    reloadTime: 5.4,
    acceptedAmmoTypes: '60mm-kp',
  },
  'railgun-lf': {
    displayName: 'RAILGUN-LF',
    size: 'L',
    damageMult: 21.2,
    hullDamageMult: 24,
    rangeMult: 2,
    speedMult: 4.5,
    magSize: 2,
    reloadTime: 8.5,
    acceptedAmmoTypes: '60mm-kp',
    isFixed: 1,
  },
  gatling: {
    displayName: 'GATLING',
    size: 'S',
    damageMult: 0.24,
    hullDamageMult: 0.2,
    rangeMult: 0.333,
    speedMult: 2,
    cooldownMult: 0.06,
    magSize: 200,
    reloadTime: 8,
    acceptedAmmoTypes: '8mm',
    canIntercept: 1,
  },
  'plasma-s': {
    displayName: 'PLASMA-S',
    size: 'S',
    damageMult: 1.47,
    hullDamageMult: 8,
    rangeMult: 0.27,
    speedMult: 1.6,
    cooldownMult: 1,
  },
  'plasma-l': {
    displayName: 'PLASMA-L',
    size: 'L',
    damageMult: 2.94,
    hullDamageMult: 12,
    rangeMult: 0.4,
    speedMult: 1.6,
    cooldownMult: 1.6,
  },
  'rocket-s': {
    displayName: 'RPOD-S',
    size: 'S',
    weight: 35,
    powerDraw: 10,
    damageMult: 5.3,
    hullDamageMult: 6.5,
    speedMult: 1.4,
    cooldownMult: 1,
    magSize: 2,
    reloadTime: 13,
    acceptedAmmoTypes: ['RKT', 'WG', 'HT'],
    isSecondary: 1,
    isInterceptable: 1,
    guidanceStrength: [2.5, 3],
    burstSpread: 0.07,
  },
  'rocket-l': {
    displayName: 'RPOD-L',
    size: 'L',
    weight: 60,
    powerDraw: 10,
    damageMult: 5.3,
    hullDamageMult: 6.5,
    speedMult: 1.4,
    cooldownMult: 1.5,
    magSize: 8,
    reloadTime: 13,
    blastRadius: 280,
    acceptedAmmoTypes: ['RKT', 'WG', 'HT'],
    isSecondary: 1,
    isInterceptable: 1,
    guidanceStrength: [2.5, 3],
    burstSpread: 0.07,
  },
  torpedo: {
    displayName: 'TORPEDO',
    size: 'L',
    damageMult: 17.65,
    hullDamageMult: 22,
    rangeMult: 1.467,
    speedMult: 0.45,
    cooldownMult: 15,
    magSize: 3,
    blastRadius: 200,
    isFixed: 1,
    isSecondary: 1,
    isInterceptable: 1,
  },
});

// ── Weapon modules → CONTENT.modules ─────────────────────────────────────────
registerContent('modules', 'autocannon', { category: 'WEAPON', create: () => new AutocannonModule() });
registerContent('modules', 'lance-st',   { category: 'WEAPON', create: () => new LanceModuleSmall() });
registerContent('modules', 'cannon',     { category: 'WEAPON', create: () => new CannonModule() });
registerContent('modules', 'rocket-s',   { category: 'WEAPON', create: (guidance) => new RocketPodModule('small', guidance) });
registerContent('modules', 'rocket-l',   { category: 'WEAPON', create: (guidance) => new RocketPodModule('large', guidance) });

// ── Standalone weapons → CONTENT.weapons ─────────────────────────────────────
registerContent('weapons', 'Autocannon', {
  slug: 'autocannon', label: 'Autocannon', create: () => new Autocannon(),
  flavorText: "Rotating breech, medium caseless, point-and-fire. AP or HE mode. Standard issue for anyone who can afford it.",
  projColor: AMBER, projLen: 3, projTrail: true, flags: ['manual', 'ammo-modes'],
});
registerContent('weapons', 'GatlingGun', {
  slug: 'gatling', label: 'Gatling', create: () => new GatlingGun(),
  flavorText: "Six barrels, one aim. Shreds at close range. Reloads slow. Point defense capable.",
  projColor: GREEN, projLen: 3, projTrail: false, flags: ['manual', 'intercept', 'ammo'],
});
registerContent('weapons', 'RailgunSmall', {
  slug: 'railgun-sf', label: 'Railgun (SF)', create: () => new Railgun('small-fixed'),
  flavorText: "Small fixed rail accelerator. No pivot mount — the whole ship is the gun platform.",
  projColor: RAIL_WHITE, projLen: 12, projTrail: true, flags: ['fixed', 'hull-dmg', 'ammo'],
});
registerContent('weapons', 'RailgunLargeTurret', {
  slug: 'railgun-lt', label: 'Railgun (LT)', create: () => new Railgun('large-turret'),
  flavorText: "Two conductive rails, one very fast slug. Accuracy drops before effective range does.",
  projColor: RAIL_WHITE, projLen: 12, projTrail: true, flags: ['manual', 'hull-dmg', 'ammo'],
});
registerContent('weapons', 'RailgunLarge', {
  slug: 'railgun-lf', label: 'Railgun (LF)', create: () => new Railgun('large-fixed'),
  flavorText: "The full-length rail cannon. Massive penetrator. Hull-mount only. Devastating.",
  projColor: RAIL_WHITE, projLen: 12, projTrail: true, flags: ['fixed', 'hull-dmg', 'ammo'],
});
registerContent('weapons', 'LanceSmall', {
  slug: 'lance-sf', label: 'Lance (SF)', create: () => new Lance('small-fixed'),
  flavorText: "Hull-mounted lance projector. No gimbal. Ramps to high damage. Aim with the ship.",
  projColor: CYAN, flags: ['beam', 'fixed', 'ramp-dmg', 'hull-dmg'],
});
registerContent('weapons', 'LanceSmallTurret', {
  slug: 'lance-st', label: 'Lance (ST)', create: () => new Lance('small-turret'),
  flavorText: "Point-defense beam. Low power draw. Can intercept missiles passing through the beam.",
  projColor: CYAN, flags: ['beam', 'ramp-dmg', 'intercept'],
});
registerContent('weapons', 'LanceLarge', {
  slug: 'lance-lf', label: 'Lance (LF)', create: () => new Lance('large-fixed'),
  flavorText: "Heavy fixed lance. Full hull-damage application. Maximum ramp ceiling.",
  projColor: CYAN, flags: ['beam', 'fixed', 'ramp-dmg', 'hull-dmg'],
});
registerContent('weapons', 'LanceLargeTurret', {
  slug: 'lance-lt', label: 'Lance (LT)', create: () => new Lance('large-turret'),
  flavorText: "Heavy turret lance. Full hull damage, wide tracking arc. Power hungry.",
  projColor: CYAN, flags: ['beam', 'ramp-dmg', 'hull-dmg'],
});
registerContent('weapons', 'PlasmaCannonSmall', {
  slug: 'plasma-s', label: 'Plasma (S)', create: () => new PlasmaCannon('small'),
  flavorText: "Superheated bolt, damage falls with distance. Best used close; worst used as a threat.",
  projColor: PLASMA_GREEN, projLen: 5, projTrail: false, flags: ['manual', 'falloff', 'hull-dmg'],
});
registerContent('weapons', 'PlasmaCannonLarge', {
  slug: 'plasma-l', label: 'Plasma (L)', create: () => new PlasmaCannon('large'),
  flavorText: "Long-cycle plasma system. More mass, longer burn, further reach.",
  projColor: PLASMA_GREEN, projLen: 5, projTrail: false, flags: ['manual', 'falloff', 'hull-dmg'],
});
registerContent('weapons', 'Cannon', {
  slug: 'cannon', label: 'Cannon', create: () => new Cannon(),
  flavorText: "Smoothbore heavy round. AP or HE mode. No electronics. It hits or it doesn't.",
  projColor: CANNON_AMBER, projLen: 7, projTrail: false, flags: ['manual', 'aoe', 'hull-dmg', 'ammo', 'ammo-modes'],
});
registerContent('weapons', 'RocketPodSmall', {
  slug: 'rpod-s', label: 'Rocket Pod (S)', create: () => new RocketPodSmall(),
  flavorText: "Two-tube pod. Dumbfire rockets, wire-guided, or heat-seeking. Each is a separate ammo type.",
  projColor: AMBER, projLen: 8, projTrail: true, flags: ['secondary', 'aoe', 'hull-dmg', 'ammo', 'ammo-modes'],
});
registerContent('weapons', 'RocketPodLarge', {
  slug: 'rpod-l', label: 'Rocket Pod (L)', create: () => new RocketPodLarge(),
  flavorText: "Eight-tube burst pod. Staggered fire. Fills the sky. Same ammo options as small pod.",
  projColor: AMBER, projLen: 8, projTrail: true, flags: ['secondary', 'aoe', 'hull-dmg', 'ammo', 'burst', 'ammo-modes'],
});
registerContent('weapons', 'Torpedo', {
  slug: 'torpedo', label: 'Torpedo', create: () => new Torpedo(),
  flavorText: "Heavy ship-killer. Fixed forward only. Interceptable. Takes commitment.",
  projColor: TORPEDO_AMBER, projLen: 16, projTrail: true, flags: ['secondary', 'fixed', 'interceptable', 'aoe', 'hull-dmg', 'ammo'],
});
