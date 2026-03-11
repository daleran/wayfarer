import { Projectile } from '../entities/projectile.js';
import { BASE_DAMAGE, BASE_HULL_DAMAGE, BASE_PROJECTILE_SPEED,
         PROJECTILE_SPEED_FACTOR, BASE_COOLDOWN } from '../data/stats.js';

const SMALL_H = { DAMAGE_MULT: 3.24, HULL_DAMAGE_MULT: 4.2, COOLDOWN_MULT: 3.5, BLAST_RADIUS: 150 };  // ~55 dmg
const LARGE_H = { DAMAGE_MULT: 4.71, HULL_DAMAGE_MULT: 6.0, COOLDOWN_MULT: 5.0, BLAST_RADIUS: 200 };  // ~80 dmg

export class MissileHeat {
  constructor(size = 'small') {
    this.isSecondary = true;
    this.isAutoFire  = false;
    this._size = size;
    const V = size === 'large' ? LARGE_H : SMALL_H;
    // Burst state initialized for all variants (large uses it, small doesn't fire it)
    this._burstCount = 0;
    this._burstTimer = 0;
    this._burstShip  = null;
    this.displayName = size === 'large' ? 'HEAT×2' : 'HEAT-MSL';
    this.ammoType = 'missile';
    this.damage      = BASE_DAMAGE      * V.DAMAGE_MULT;
    this.hullDamage  = BASE_HULL_DAMAGE * V.HULL_DAMAGE_MULT;
    this.cooldownMax = BASE_COOLDOWN    * V.COOLDOWN_MULT;
    this.blastRadius = V.BLAST_RADIUS;
    this.projectileSpeed = BASE_PROJECTILE_SPEED * 1.3 * PROJECTILE_SPEED_FACTOR;
    this._cooldown = 0;
    this.ammo    = 6;
    this.ammoMax = 6;
    this.ammoCargoWeight = 1;
  }

  update(dt, entities) {
    if (this._cooldown > 0) this._cooldown -= dt;
    if (this._size === 'large' && this._burstCount > 0 && entities) {
      this._burstTimer -= dt;
      if (this._burstTimer <= 0) {
        this._fireOneMissile(entities);
        this._burstCount--;
        if (this._burstCount > 0) this._burstTimer = 0.15;
      }
    }
  }

  fire(ship, tx, ty, entities) {
    if (this._cooldown > 0) return;
    if (ship.relation === 'player' && this.ammo <= 0) return;
    if (this._size === 'large') {
      this._burstShip  = ship;
      this._burstCount = 1; // 1 remaining after first
      this._burstTimer = 0.15;
      this._fireOneMissile(entities);
    } else {
      this._fireOneMissile(entities, ship);
    }
    if (ship.relation === 'player') this.ammo--;
    this._cooldown = this.cooldownMax * (ship._fireCooldownMult ?? 1);
  }

  _fireOneMissile(entities, shipOverride) {
    const ship = shipOverride || this._burstShip;
    const nx = Math.sin(ship.rotation);
    const ny = -Math.cos(ship.rotation);
    const proj = new Projectile(
      ship.x, ship.y,
      nx * this.projectileSpeed,
      ny * this.projectileSpeed,
      this.damage, ship
    );
    proj.hullDamage              = this.hullDamage;
    proj.maxRange                = 99999; // use self-destruct timer instead
    proj.isRocket                = true;
    proj.isGuided                = true;
    proj.guidedType              = 'heat';
    proj.guidanceStrength        = 2.5;
    proj.isInterceptable         = true;
    proj.blastRadius             = this.blastRadius;
    proj._guideSelfDestructTimer = 10.0;
    entities.push(proj);
  }
}
