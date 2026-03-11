import { Projectile } from '../entities/projectile.js';
import { BASE_DAMAGE, BASE_HULL_DAMAGE, BASE_WEAPON_RANGE, BASE_PROJECTILE_SPEED,
         PROJECTILE_SPEED_FACTOR, BASE_COOLDOWN } from '../data/tuning/weaponTuning.js';

const SMALL_W = { DAMAGE_MULT: 2.94, HULL_DAMAGE_MULT: 4.0, COOLDOWN_MULT: 2.5, BLAST_RADIUS: 120 };  // ~50 dmg
const LARGE_W = { DAMAGE_MULT: 4.12, HULL_DAMAGE_MULT: 5.5, COOLDOWN_MULT: 4.0, BLAST_RADIUS: 180 };  // ~70 dmg

export class MissileWire {
  constructor(size = 'small') {
    this.isSecondary = true;
    this.isAutoFire  = false;
    this._size = size;
    const V = size === 'large' ? LARGE_W : SMALL_W;
    if (size === 'large') {
      this.displayName = 'WIRE×3';
    } else {
      this.displayName = 'WIRE-MSL';
    }
    this.ammoType = 'missile';
    this.damage      = BASE_DAMAGE      * V.DAMAGE_MULT;
    this.hullDamage  = BASE_HULL_DAMAGE * V.HULL_DAMAGE_MULT;
    this.cooldownMax = BASE_COOLDOWN    * V.COOLDOWN_MULT;
    this.blastRadius = V.BLAST_RADIUS;
    this.projectileSpeed = BASE_PROJECTILE_SPEED * 1.2 * PROJECTILE_SPEED_FACTOR;
    this.maxRange = BASE_WEAPON_RANGE * 1.5;
    this._cooldown = 0;
    this.ammo    = 6;
    this.ammoMax = 6;
    this.ammoCargoWeight = 1;
  }

  update(dt) { if (this._cooldown > 0) this._cooldown -= dt; }

  fire(ship, tx, ty, entities) {
    if (this._cooldown > 0) return;
    if (ship.relation === 'player' && this.ammo <= 0) return;
    const dx = tx - ship.x;
    const dy = ty - ship.y;
    const baseAngle = Math.atan2(dy, dx);
    const angles = this._size === 'large' ? [-0.15, 0, 0.15] : [0];
    for (const spread of angles) {
      const a = baseAngle + spread;
      const proj = new Projectile(
        ship.x, ship.y,
        Math.cos(a) * this.projectileSpeed,
        Math.sin(a) * this.projectileSpeed,
        this.damage, ship
      );
      proj.hullDamage      = this.hullDamage;
      proj.maxRange        = this.maxRange;
      proj.isRocket        = true;
      proj.isGuided        = true;
      proj.guidedType      = 'wire';
      proj.guidanceStrength = 3.0;
      proj.isInterceptable = true;
      proj.blastRadius     = this.blastRadius;
      entities.push(proj);
    }
    if (ship.relation === 'player') this.ammo--;
    this._cooldown = this.cooldownMax;
  }
}
