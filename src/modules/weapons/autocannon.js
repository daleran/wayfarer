import { Projectile } from '@/entities/projectile.js';
import { AMBER, AUTOCANNON_GLOW } from '@/rendering/colors.js';
import { BASE_DAMAGE, BASE_HULL_DAMAGE, BASE_WEAPON_RANGE, BASE_PROJECTILE_SPEED,
         PROJECTILE_SPEED_FACTOR, BASE_COOLDOWN,
         AUTOCANNON_MAG_SIZE, AUTOCANNON_RELOAD_TIME,
         HE_AUTOCANNON_BLAST, AMMO } from '@data/index.js';
import { normalizeToTarget } from '@/utils/math.js';

const DAMAGE_MULT  = 1.0;
const RANGE_MULT   = 1.0;
const SPEED_MULT   = 1.0;
const COOLDOWN_MULT = 1.04;

// Ballistic behavior keyed by ammo id
const AMMO_BEHAVIOR = {
  '25mm-ap': {
    damageMult:    1.0,
    hullDamageBase: null,
    blastRadius:   0,
    detonatesOnContact: false,
    canIntercept:  false,
  },
  '25mm-he': {
    damageMult:    0.25,
    hullDamageBase: BASE_HULL_DAMAGE * 1.65,
    blastRadius:   HE_AUTOCANNON_BLAST,
    detonatesOnContact: true,
    canIntercept:  true,
  },
};

export class Autocannon {
  constructor() {
    this.damage = BASE_DAMAGE * DAMAGE_MULT;
    this.cooldownMax = BASE_COOLDOWN * COOLDOWN_MULT;
    this._cooldown = 0;
    this.projectileSpeed = BASE_PROJECTILE_SPEED * SPEED_MULT * PROJECTILE_SPEED_FACTOR;
    this.maxRange = BASE_WEAPON_RANGE * RANGE_MULT;
    this.isAutoFire = false;
    this.color = AMBER;
    this.glowColor = AUTOCANNON_GLOW;
    // Magazine
    this.magSize        = AUTOCANNON_MAG_SIZE;
    this.ammo           = AUTOCANNON_MAG_SIZE;
    this.reloadTime     = AUTOCANNON_RELOAD_TIME;
    this._reloadTimer   = 0;
    // Ammo item system
    this.acceptedAmmoTypes = ['25mm-ap', '25mm-he'];
    this.currentAmmoId     = '25mm-ap';
  }

  get displayName() {
    const tag = AMMO[this.currentAmmoId]?.tag;
    return tag ? 'AUTOCANNON [' + tag + ']' : 'AUTOCANNON';
  }

  get isReloading() { return this._reloadTimer > 0; }

  update(dt) {
    if (this._cooldown > 0) this._cooldown -= dt;
  }

  fire(ship, tx, ty, entities) {
    if (this._cooldown > 0 || this._reloadTimer > 0) return;
    if (ship.relation === 'player' && this.ammo <= 0) return;
    const n = normalizeToTarget(ship.x, ship.y, tx, ty);
    if (!n) return;
    const { nx, ny, dist } = n;
    const behavior = AMMO_BEHAVIOR[this.currentAmmoId] ?? AMMO_BEHAVIOR['25mm-ap'];
    const proj = new Projectile(
      ship.x, ship.y,
      nx * this.projectileSpeed,
      ny * this.projectileSpeed,
      this.damage * behavior.damageMult,
      ship
    );
    proj.color = this.color;
    proj.glowColor = this.glowColor;
    proj.length = 3;
    proj.hasTrail = true;
    if (behavior.hullDamageBase !== null) proj.hullDamage = behavior.hullDamageBase;
    if (behavior.blastRadius > 0) {
      proj.blastRadius = behavior.blastRadius;
      proj.maxRange           = Math.min(dist + 20, this.maxRange);
      proj.detonatesOnExpiry  = true;
      proj.detonatesOnContact = true;
    } else {
      proj.maxRange = this.maxRange;
    }
    if (behavior.canIntercept) proj.canIntercept = true;
    entities.push(proj);
    if (ship.relation === 'player') {
      this.ammo--;
      if (this.ammo <= 0) this._reloadTimer = this.reloadTime;
    }
    this._cooldown = this.cooldownMax * (ship._fireCooldownMult ?? 1);
  }
}
