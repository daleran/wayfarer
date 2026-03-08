import { Projectile } from '../entities/projectile.js';
import { AMBER } from '../ui/colors.js';
import { BASE_DAMAGE, BASE_WEAPON_RANGE, BASE_PROJECTILE_SPEED,
         PROJECTILE_SPEED_FACTOR, BASE_COOLDOWN } from '../data/stats.js';

const DAMAGE_MULT  = 1.0;
const RANGE_MULT   = 1.0;
const SPEED_MULT   = 1.0;
const COOLDOWN_MULT = 1.04;

export class Autocannon {
  constructor() {
    this.damage = BASE_DAMAGE * DAMAGE_MULT;
    this.cooldownMax = BASE_COOLDOWN * COOLDOWN_MULT;
    this._cooldown = 0;
    this.projectileSpeed = BASE_PROJECTILE_SPEED * SPEED_MULT * PROJECTILE_SPEED_FACTOR;
    this.maxRange = BASE_WEAPON_RANGE * RANGE_MULT;
    this.isAutoFire = false;
    this.displayName = 'AUTOCANNON';
    this.color = AMBER;
    this.glowColor = '#ffe0a0';
  }

  update(dt) {
    if (this._cooldown > 0) this._cooldown -= dt;
  }

  fire(ship, tx, ty, entities) {
    if (this._cooldown > 0) return;
    const dx = tx - ship.x;
    const dy = ty - ship.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return;

    const nx = dx / dist;
    const ny = dy / dist;
    const proj = new Projectile(
      ship.x, ship.y,
      nx * this.projectileSpeed,
      ny * this.projectileSpeed,
      this.damage,
      ship
    );
    proj.maxRange = this.maxRange;
    proj.color = this.color;
    proj.glowColor = this.glowColor;
    proj.length = 3;       // small tight bolt
    proj.hasTrail = true;  // short tracer tail
    entities.push(proj);
    this._cooldown = this.cooldownMax;
  }
}
