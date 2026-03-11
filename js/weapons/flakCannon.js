import { Projectile } from '../entities/projectile.js';
import { AMBER } from '../ui/colors.js';
import { BASE_DAMAGE, BASE_HULL_DAMAGE, BASE_WEAPON_RANGE, BASE_PROJECTILE_SPEED,
         PROJECTILE_SPEED_FACTOR, BASE_COOLDOWN } from '../data/tuning/weaponTuning.js';
import { normalizeToTarget } from '../utils/math.js';

const SMALL = { DAMAGE_MULT: 1.06, HULL_DAMAGE_MULT: 2.2, COOLDOWN_MULT: 1.1, BLAST_RADIUS: 80,  RANGE_MULT: 0.85 };
const LARGE = { DAMAGE_MULT: 1.65, HULL_DAMAGE_MULT: 3.0, COOLDOWN_MULT: 1.8, BLAST_RADIUS: 140, RANGE_MULT: 0.85 };

export class FlakCannon {
  constructor(size = 'small') {
    this.isSecondary = false;
    this.isAutoFire  = false;
    this._size = size;
    const V = size === 'large' ? LARGE : SMALL;
    if (size === 'large') {
      this.displayName = 'FLAK-L';
    } else {
      this.displayName = 'FLAK-S';
    }
    this.damage      = BASE_DAMAGE      * V.DAMAGE_MULT;
    this.hullDamage  = BASE_HULL_DAMAGE * V.HULL_DAMAGE_MULT;
    this.cooldownMax = BASE_COOLDOWN    * V.COOLDOWN_MULT;
    this.maxRange    = BASE_WEAPON_RANGE * V.RANGE_MULT;
    this.blastRadius = V.BLAST_RADIUS;
    this.projectileSpeed = BASE_PROJECTILE_SPEED * 1.8 * PROJECTILE_SPEED_FACTOR;
    this._cooldown = 0;
  }
  update(dt) { if (this._cooldown > 0) this._cooldown -= dt; }
  fire(ship, tx, ty, entities) {
    if (this._cooldown > 0) return;
    const n = normalizeToTarget(ship.x, ship.y, tx, ty);
    if (!n) return;
    const { nx, ny, dist } = n;
    if (dist > this.maxRange) return;
    const proj = new Projectile(ship.x, ship.y, nx * this.projectileSpeed, ny * this.projectileSpeed, this.damage, ship);
    proj.hullDamage       = this.hullDamage;
    proj.maxRange         = dist + 20;
    proj.color            = AMBER;
    proj.glowColor        = '#ffe0a0';
    proj.length           = 5;
    proj.detonatesOnExpiry = true;
    proj.blastRadius      = this.blastRadius;
    proj.rocketTargetX    = tx;
    proj.rocketTargetY    = ty;
    proj.canIntercept     = true;
    entities.push(proj);
    this._cooldown = this.cooldownMax * (ship._fireCooldownMult ?? 1);
  }
}
