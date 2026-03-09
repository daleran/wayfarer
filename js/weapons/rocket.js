import { Projectile } from '../entities/projectile.js';
import { BASE_DAMAGE, BASE_HULL_DAMAGE, BASE_PROJECTILE_SPEED,
         PROJECTILE_SPEED_FACTOR, BASE_COOLDOWN } from '../data/stats.js';
import { normalizeToTarget } from '../utils/math.js';

const DAMAGE_MULT      = 5.3;   // ~90 armor damage
const HULL_DAMAGE_MULT = 6.5;   // 65 hull
const SPEED_MULT       = 1.4;
const COOLDOWN_MULT    = 5.0;

export class Rocket {
  constructor() {
    this.isSecondary = true;
    this.isAutoFire  = false;
    this.displayName = 'ROCKET';
    this.ammoType    = 'rocket';
    this.ammo        = 6;
    this.ammoMax     = 6;
    this.ammoCargoWeight = 1; // 1 cargo unit per rocket
    this.pipCount    = 1;     // single-tube launcher
    this.damage      = BASE_DAMAGE      * DAMAGE_MULT;
    this.hullDamage  = BASE_HULL_DAMAGE * HULL_DAMAGE_MULT;
    this.projectileSpeed = BASE_PROJECTILE_SPEED * SPEED_MULT * PROJECTILE_SPEED_FACTOR;
    this.cooldownMax = BASE_COOLDOWN * COOLDOWN_MULT;
    this._cooldown   = 0;
  }

  update(dt) {
    if (this._cooldown > 0) this._cooldown -= dt;
  }

  fire(ship, tx, ty, entities) {
    if (this._cooldown > 0 || this.ammo <= 0) return;
    const n = normalizeToTarget(ship.x, ship.y, tx, ty);
    if (!n) return;
    const { nx, ny, dist } = n;

    const proj = new Projectile(
      ship.x, ship.y,
      nx * this.projectileSpeed,
      ny * this.projectileSpeed,
      this.damage,
      ship
    );
    proj.hullDamage     = this.hullDamage;
    proj.maxRange       = dist + 20; // just enough to reach the target
    proj.isRocket       = true;
    proj.rocketTargetX  = tx;
    proj.rocketTargetY  = ty;

    entities.push(proj);
    this.ammo--;
    this._cooldown = this.cooldownMax;
  }
}
