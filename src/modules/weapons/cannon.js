import { Projectile } from '@/entities/projectile.js';
import { AMBER, TORPEDO_AMBER } from '@/rendering/colors.js';
import { BASE_DAMAGE, BASE_HULL_DAMAGE, BASE_WEAPON_RANGE, BASE_PROJECTILE_SPEED,
         PROJECTILE_SPEED_FACTOR, BASE_COOLDOWN,
         CANNON_MAG_SIZE, CANNON_RELOAD_TIME,
         HE_CANNON_BLAST, AMMO } from '@data/index.js';
import { normalizeToTarget } from '@/utils/math.js';

const DAMAGE_MULT      = 3.24;  // ~55 armor
const HULL_DAMAGE_MULT = 4.5;   // 45 hull
const COOLDOWN_MULT    = 3.0;
const SPEED_MULT       = 0.65;
const RANGE_MULT       = 0.933; // ~1400u

// Ballistic behavior keyed by ammo id
const AMMO_BEHAVIOR = {
  '90mm-ap': {
    damageMult:         1.0,
    hullDamageBase:     BASE_HULL_DAMAGE * HULL_DAMAGE_MULT,
    blastRadius:        0,
    detonatesOnContact: false,
    canIntercept:       false,
  },
  '90mm-he': {
    damageMult:         0.3,
    hullDamageBase:     BASE_HULL_DAMAGE * 5.0,
    blastRadius:        HE_CANNON_BLAST,
    detonatesOnContact: true,
    canIntercept:       true,
  },
};

export class Cannon {
  constructor() {
    this.isSecondary = false;
    this.isAutoFire  = false;
    this.damage      = BASE_DAMAGE      * DAMAGE_MULT;
    this.hullDamage  = BASE_HULL_DAMAGE * HULL_DAMAGE_MULT;
    this.projectileSpeed = BASE_PROJECTILE_SPEED * SPEED_MULT * PROJECTILE_SPEED_FACTOR;
    this.maxRange       = BASE_WEAPON_RANGE * RANGE_MULT;
    this.cooldownMax    = BASE_COOLDOWN * COOLDOWN_MULT;
    this._cooldown      = 0;
    // Magazine
    this.magSize      = CANNON_MAG_SIZE;
    this.ammo         = CANNON_MAG_SIZE;
    this.reloadTime   = CANNON_RELOAD_TIME;
    this._reloadTimer = 0;
    // Ammo item system
    this.acceptedAmmoTypes = ['90mm-ap', '90mm-he'];
    this.currentAmmoId     = '90mm-ap';
  }

  get displayName() {
    const tag = AMMO[this.currentAmmoId]?.tag;
    return tag ? 'CANNON [' + tag + ']' : 'CANNON';
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
    const behavior = AMMO_BEHAVIOR[this.currentAmmoId] ?? AMMO_BEHAVIOR['90mm-ap'];
    const proj = new Projectile(ship.x, ship.y, nx * this.projectileSpeed, ny * this.projectileSpeed, this.damage * behavior.damageMult, ship);
    proj.hullDamage = behavior.hullDamageBase;
    proj.color      = TORPEDO_AMBER;
    proj.glowColor  = AMBER;
    proj.length     = 7;
    proj.blastRadius = behavior.blastRadius;
    if (this.currentAmmoId === '90mm-he') {
      proj.maxRange           = Math.min(dist + 20, this.maxRange);
      proj.detonatesOnExpiry  = true;
      proj.detonatesOnContact = true;
    } else {
      proj.maxRange           = this.maxRange;
      proj.detonatesOnContact = behavior.detonatesOnContact;
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
