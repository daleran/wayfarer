import { Projectile } from '../../entities/projectile.js';
import { PLASMA_GREEN } from '../../ui/colors.js';
import { BASE_DAMAGE, BASE_HULL_DAMAGE, BASE_WEAPON_RANGE, BASE_PROJECTILE_SPEED,
         PROJECTILE_SPEED_FACTOR, BASE_COOLDOWN } from '../../data/tuning/weaponTuning.js';

const VARIANTS = {
  small: { DAMAGE_MULT: 1.47, HULL_MULT: 8.0,  COOLDOWN_MULT: 1.0, RANGE_MULT: 0.27 },
  large: { DAMAGE_MULT: 2.94, HULL_MULT: 12.0, COOLDOWN_MULT: 1.6, RANGE_MULT: 0.40 },
};

export class PlasmaCannon {
  constructor(size = 'small') {
    this.isSecondary = false;
    this.isAutoFire  = false;
    const V = VARIANTS[size] ?? VARIANTS.small;
    this.displayName = size === 'large' ? 'PLASMA-L' : 'PLASMA-S';
    this.damage      = BASE_DAMAGE      * V.DAMAGE_MULT;
    this.hullDamage  = BASE_HULL_DAMAGE * V.HULL_MULT;
    this.cooldownMax = BASE_COOLDOWN    * V.COOLDOWN_MULT;
    this.maxRange    = BASE_WEAPON_RANGE * V.RANGE_MULT;
    this.projectileSpeed = BASE_PROJECTILE_SPEED * 1.6 * PROJECTILE_SPEED_FACTOR;
    this._cooldown = 0;
  }
  update(dt) { if (this._cooldown > 0) this._cooldown -= dt; }
  fire(ship, tx, ty, entities) {
    if (this._cooldown > 0) return;
    const dx = tx - ship.x; const dy = ty - ship.y;
    const dist = Math.sqrt(dx*dx + dy*dy); if (dist === 0) return;
    const nx = dx / dist; const ny = dy / dist;
    const proj = new Projectile(ship.x, ship.y, nx * this.projectileSpeed, ny * this.projectileSpeed, this.damage, ship);
    proj.hullDamage = this.hullDamage;
    proj.maxRange   = this.maxRange;
    proj.isPlasma   = true;
    entities.push(proj);
    this._cooldown = this.cooldownMax;
  }
}
