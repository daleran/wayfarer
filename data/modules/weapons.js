import { registerData, registerContent, WEAPONS } from '../dataRegistry.js';
import { ShipModule } from '@/modules/shipModule.js';
import { disc, ring, line } from '@/rendering/draw.js';
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

/** Draw a polygon from point array, fill + stroke */
function _poly(ctx, pts, color, fillAlpha, strokeAlpha, lw = 0.5) {
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.globalAlpha = fillAlpha;
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.globalAlpha = strokeAlpha;
  ctx.lineWidth = lw;
  ctx.stroke();
}

// ── Weapon module classes ────────────────────────────────────────────────────

class AutocannonModule extends ShipModule {
  constructor() {
    super();
    const W = WEAPONS.autocannon;
    this.name        = 'autocannon';
    this.displayName = 'AUTOCANNON (S)';
    this.description = 'Kinetic hardpoint. Fires on trigger, mouse-aimed.';
    this.powerDraw   = W.powerDraw;
    this.weight      = W.weight;
    this.size        = W.size === 'L' ? 'large' : 'small';
    this.powerPriority = 2;
    this.weapon      = new Autocannon();
  }
  drawAtMount(ctx, color, alpha) {
    // 2×10 barrel
    _poly(ctx, [
      { x: -1, y: -5 }, { x: 1, y: -5 }, { x: 1, y: 5 }, { x: -1, y: 5 },
    ], color, alpha * 0.12, alpha * 0.85);
    // 4×4 breech block
    _poly(ctx, [
      { x: -2, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 5 }, { x: -2, y: 5 },
    ], color, alpha * 0.15, alpha * 0.7);
    // Barrel bore line
    line(ctx, 0, -5, 0, 2, color, 0.4, alpha * 0.3);
    // Muzzle brake slots
    line(ctx, -1, -4, 1, -4, color, 0.4, alpha * 0.35);
    line(ctx, -1, -3.2, 1, -3.2, color, 0.4, alpha * 0.3);
    // 2 breech bolts
    disc(ctx, -1.2, 3.5, 0.3, color, alpha * 0.55);
    disc(ctx, 1.2, 3.5, 0.3, color, alpha * 0.55);
    // Feed chute stub
    line(ctx, 2, 3.5, 3, 3.5, color, 0.5, alpha * 0.4);
    disc(ctx, 3, 3.5, 0.25, color, alpha * 0.4);
    // Amber muzzle dot
    disc(ctx, 0, -5, 0.5, AMBER, alpha * 0.7);
  }
  onInstall(ship) { ship.addWeapon(this.weapon); this._applyConditionToWeapon(); }
  onRemove(ship)  { ship.removeWeapon(this.weapon); }
}

class LanceModuleSmall extends ShipModule {
  constructor() {
    super();
    const W = WEAPONS['lance-st'];
    this.name        = 'lance-s';
    this.displayName = 'LANCE (S)';
    this.description = 'Hitscan beam emitter. Continuous fire, high power draw.';
    this.powerDraw   = W.powerDraw;
    this.weight      = W.weight;
    this.size        = W.size === 'L' ? 'large' : 'small';
    this.powerPriority = 2;
    this.weapon      = new Lance('small');
  }
  drawAtMount(ctx, color, alpha) {
    // Circle head r=2
    ring(ctx, 0, -3, 2, color, 0.7, alpha * 0.8);
    disc(ctx, 0, -3, 2, color, alpha * 0.08);
    // Inner lens ring
    ring(ctx, 0, -3, 1, color, 0.5, alpha * 0.4);
    // Cyan emitter disc
    disc(ctx, 0, -3, 0.6, CYAN, alpha * 0.7);
    // 1.5×4 neck
    _poly(ctx, [
      { x: -0.75, y: -1 }, { x: 0.75, y: -1 }, { x: 0.75, y: 3 }, { x: -0.75, y: 3 },
    ], color, alpha * 0.12, alpha * 0.7);
    // Power conduit line
    line(ctx, 0, -1, 0, 3, color, 0.4, alpha * 0.35);
    // 3×3 base
    _poly(ctx, [
      { x: -1.5, y: 3 }, { x: 1.5, y: 3 }, { x: 1.5, y: 5 }, { x: -1.5, y: 5 },
    ], color, alpha * 0.15, alpha * 0.7);
    // 2 cooling fin stubs
    line(ctx, -2, -2.5, -3, -2.5, color, 0.5, alpha * 0.4);
    line(ctx, 2, -2.5, 3, -2.5, color, 0.5, alpha * 0.4);
    // 2 base bolts
    disc(ctx, -1, 4, 0.3, color, alpha * 0.55);
    disc(ctx, 1, 4, 0.3, color, alpha * 0.55);
    // Cyan head glow ring
    ring(ctx, 0, -3, 1.5, CYAN, 0.4, alpha * 0.25);
  }
  onInstall(ship) { ship.addWeapon(this.weapon); this._applyConditionToWeapon(); }
  onRemove(ship)  { ship.removeWeapon(this.weapon); }
}

class CannonModule extends ShipModule {
  constructor() {
    super();
    const W = WEAPONS.cannon;
    this.name        = 'cannon';
    this.displayName = 'CANNON (S)';
    this.description = 'Heavy slug thrower. Slow fire rate, punishing impact.';
    this.powerDraw   = W.powerDraw;
    this.weight      = W.weight;
    this.size        = W.size === 'L' ? 'large' : 'small';
    this.powerPriority = 2;
    this.weapon      = new Cannon();
  }
  drawAtMount(ctx, color, alpha) {
    // 3×7 barrel
    _poly(ctx, [
      { x: -1.5, y: -5 }, { x: 1.5, y: -5 }, { x: 1.5, y: 2 }, { x: -1.5, y: 2 },
    ], color, alpha * 0.12, alpha * 0.85);
    // 5×4 breech block
    _poly(ctx, [
      { x: -2.5, y: 2 }, { x: 2.5, y: 2 }, { x: 2.5, y: 5 }, { x: -2.5, y: 5 },
    ], color, alpha * 0.15, alpha * 0.75);
    // Thick bore line
    line(ctx, 0, -5, 0, 2, color, 0.6, alpha * 0.35);
    // Muzzle ring
    ring(ctx, 0, -5, 1.2, color, 0.6, alpha * 0.5);
    // Cannon amber muzzle dot
    disc(ctx, 0, -5, 0.5, CANNON_AMBER, alpha * 0.7);
    // 2 recoil spring bars
    line(ctx, -1, 1, -1, 4.5, color, 0.4, alpha * 0.35);
    line(ctx, 1, 1, 1, 4.5, color, 0.4, alpha * 0.35);
    // 4 breech bolts
    disc(ctx, -1.8, 2.8, 0.3, color, alpha * 0.55);
    disc(ctx, 1.8, 2.8, 0.3, color, alpha * 0.55);
    disc(ctx, -1.8, 4.2, 0.3, color, alpha * 0.55);
    disc(ctx, 1.8, 4.2, 0.3, color, alpha * 0.55);
    // Trunnion stubs (side pivot points)
    line(ctx, -2.5, 3, -3.5, 3, color, 0.5, alpha * 0.45);
    disc(ctx, -3.5, 3, 0.3, CANNON_AMBER, alpha * 0.5);
    line(ctx, 2.5, 3, 3.5, 3, color, 0.5, alpha * 0.45);
    disc(ctx, 3.5, 3, 0.3, CANNON_AMBER, alpha * 0.5);
  }
  onInstall(ship) { ship.addWeapon(this.weapon); this._applyConditionToWeapon(); }
  onRemove(ship)  { ship.removeWeapon(this.weapon); }
}

class RocketPodModule extends ShipModule {
  constructor(rocketSize = 'small', defaultMode = 'ht') {
    super();
    const id = rocketSize === 'large' ? 'rocket-l' : 'rocket-s';
    const W = WEAPONS[id];
    this.name        = rocketSize === 'large' ? 'rocket-l' : 'rocket-s';
    this.displayName = rocketSize === 'large' ? 'RPOD-L' : 'RPOD-S';
    this.description = 'Rocket pod. Fires RKT (dumbfire), WG (wire-guided), or HT (heat-seeking) ordnance.';
    this.powerDraw   = W.powerDraw;
    this.weight      = W.weight;
    this.size        = W.size === 'L' ? 'large' : 'small';
    this.powerPriority = 2;
    this.weapon      = rocketSize === 'large' ? new RocketPodLarge() : new RocketPodSmall();
    this.weapon.currentAmmoId = defaultMode;
  }
  drawAtMount(ctx, color, alpha) {
    if (this.size === 'large') {
      // ── RPOD-L: 14×10 eight-tube launcher ──
      // Chamfered body
      _poly(ctx, [
        { x: -6, y: -5 }, { x: 6, y: -5 }, { x: 7, y: -4 },
        { x: 7, y: 4 }, { x: 6, y: 5 }, { x: -6, y: 5 },
        { x: -7, y: 4 }, { x: -7, y: -4 },
      ], color, alpha * 0.1, alpha * 0.85);
      // 2×4 tube ring grid
      for (const tx of [-4.5, -1.5, 1.5, 4.5]) {
        for (const ty of [-2, 2]) {
          ring(ctx, tx, ty, 1.3, color, 0.6, alpha * 0.5);
          ring(ctx, tx, ty, 0.7, color, 0.4, alpha * 0.3);
          disc(ctx, tx, ty, 0.4, AMBER, alpha * 0.6);
        }
      }
      // 3 exhaust slots bottom
      for (const sx of [-3, 0, 3]) {
        line(ctx, sx - 1, 5, sx + 1, 5, color, 0.5, alpha * 0.4);
      }
      // Side rails
      line(ctx, -7, -3, -7, 3, color, 0.7, alpha * 0.5);
      line(ctx, 7, -3, 7, 3, color, 0.7, alpha * 0.5);
      // 6 bolts
      disc(ctx, -6.2, -4.2, 0.3, color, alpha * 0.5);
      disc(ctx, 6.2, -4.2, 0.3, color, alpha * 0.5);
      disc(ctx, -6.2, 0, 0.3, color, alpha * 0.5);
      disc(ctx, 6.2, 0, 0.3, color, alpha * 0.5);
      disc(ctx, -6.2, 4.2, 0.3, color, alpha * 0.5);
      disc(ctx, 6.2, 4.2, 0.3, color, alpha * 0.5);
      // Hinge line
      line(ctx, -7, -4.5, 7, -4.5, AMBER, 0.4, alpha * 0.3);
    } else {
      // ── RPOD-S: 6×6 twin launch tubes ──
      _poly(ctx, [
        { x: -3, y: -3 }, { x: 3, y: -3 }, { x: 3, y: 3 }, { x: -3, y: 3 },
      ], color, alpha * 0.1, alpha * 0.85);
      // 2 tube rings
      ring(ctx, -1.2, 0, 1.2, color, 0.6, alpha * 0.55);
      ring(ctx, 1.2, 0, 1.2, color, 0.6, alpha * 0.55);
      // Inner nose rings
      ring(ctx, -1.2, 0, 0.6, color, 0.4, alpha * 0.3);
      ring(ctx, 1.2, 0, 0.6, color, 0.4, alpha * 0.3);
      // Amber tube center dots
      disc(ctx, -1.2, 0, 0.35, AMBER, alpha * 0.7);
      disc(ctx, 1.2, 0, 0.35, AMBER, alpha * 0.7);
      // Blast plate + exhaust slots bottom
      line(ctx, -3, 2.5, 3, 2.5, color, 0.5, alpha * 0.4);
      line(ctx, -1.5, 3, -0.5, 3, color, 0.4, alpha * 0.35);
      line(ctx, 0.5, 3, 1.5, 3, color, 0.4, alpha * 0.35);
      // 4 corner bolts
      disc(ctx, -2.5, -2.5, 0.3, color, alpha * 0.5);
      disc(ctx, 2.5, -2.5, 0.3, color, alpha * 0.5);
      disc(ctx, -2.5, 2.5, 0.3, color, alpha * 0.5);
      disc(ctx, 2.5, 2.5, 0.3, color, alpha * 0.5);
    }
  }
  onInstall(ship) { ship.addWeapon(this.weapon); this._applyConditionToWeapon(); }
  onRemove(ship)  { ship.removeWeapon(this.weapon); }
}

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
