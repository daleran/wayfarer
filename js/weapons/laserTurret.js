import { Projectile } from '../entities/projectile.js';
import { CYAN } from '../ui/colors.js';

// Laser turret — rare, expensive, energy-intensive.
// Fast projectiles that ablate armor quickly but deal reduced hull damage.
export class LaserTurret {
  constructor() {
    this.armorDamage = 15;   // high vs armor
    this.hullDamage = 4;     // low vs hull
    this.cooldownMax = 0.15;
    this._cooldown = 0;
    this.projectileSpeed = 800;
    this.maxRange = 300;
    this.isAutoFire = true;
    this.color = CYAN;
    this.glowColor = '#ccffff';
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
      this.armorDamage,
      ship
    );
    proj.maxRange = this.maxRange;
    proj.color = this.color;
    proj.glowColor = this.glowColor;
    proj.hullDamage = this.hullDamage;
    proj.length = 3; // thin, fast beam bolt
    entities.push(proj);
    this._cooldown = this.cooldownMax;
  }
}
