import { Projectile } from '../entities/projectile.js';
import { BASE_DAMAGE, BASE_HULL_DAMAGE, BASE_PROJECTILE_SPEED,
         PROJECTILE_SPEED_FACTOR, BASE_COOLDOWN } from '../data/stats.js';

const DAMAGE_MULT      = 5.3;   // ~90 armor damage per rocket
const HULL_DAMAGE_MULT = 6.5;   // 65 hull per rocket
const SPEED_MULT       = 1.4;
const COOLDOWN_MULT    = 12.0;

export class RocketLarge {
  constructor() {
    this.isSecondary = true;
    this.isAutoFire  = false;
    this.displayName = 'ROCKET×5';
    this.ammoType    = 'rocket-large';
    this.damage      = BASE_DAMAGE      * DAMAGE_MULT;
    this.hullDamage  = BASE_HULL_DAMAGE * HULL_DAMAGE_MULT;
    this.projectileSpeed = BASE_PROJECTILE_SPEED * SPEED_MULT * PROJECTILE_SPEED_FACTOR;
    this.cooldownMax = BASE_COOLDOWN * COOLDOWN_MULT;
    this._cooldown   = 0;
    this.ammo        = 3;
    this.ammoMax     = 3;
    this.ammoCargoWeight = 2; // 2 cargo units per salvo pod
    this.pipCount    = 5;     // 5-rocket burst pod
    // Burst state
    this._burstCount  = 0;
    this._burstTimer  = 0;
    this._burstShip   = null;
    this._burstTx     = 0;
    this._burstTy     = 0;
  }

  update(dt, entities) {
    if (this._cooldown > 0) this._cooldown -= dt;
    if (this._burstCount > 0 && entities) {
      this._burstTimer -= dt;
      if (this._burstTimer <= 0) {
        this._fireOneRocket(entities);
        this._burstCount--;
        if (this._burstCount > 0) this._burstTimer = 0.18;
      }
    }
  }

  fire(ship, tx, ty, entities) {
    if (this._cooldown > 0) return;
    if (ship.relation === 'player' && this.ammo <= 0) return;
    this._burstShip  = ship;
    this._burstTx    = tx;
    this._burstTy    = ty;
    this._burstCount = 4; // 4 remaining after first
    this._burstTimer = 0.18;
    this._fireOneRocket(entities); // fire first immediately
    if (ship.relation === 'player') this.ammo--;
    this._cooldown = this.cooldownMax;
  }

  _fireOneRocket(entities) {
    const ship = this._burstShip;
    const tx   = this._burstTx;
    const ty   = this._burstTy;
    const spread = (Math.random() - 0.5) * 0.16;
    const dx = tx - ship.x;
    const dy = ty - ship.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist === 0) return;
    const baseAngle = Math.atan2(dy, dx);
    const angle = baseAngle + spread;
    const proj = new Projectile(
      ship.x, ship.y,
      Math.cos(angle) * this.projectileSpeed,
      Math.sin(angle) * this.projectileSpeed,
      this.damage, ship
    );
    proj.hullDamage    = this.hullDamage;
    proj.maxRange      = dist + 20;
    proj.isRocket      = true;
    proj.blastRadius   = 280;
    proj.rocketTargetX = ship.x + Math.cos(angle) * dist;
    proj.rocketTargetY = ship.y + Math.sin(angle) * dist;
    entities.push(proj);
  }
}
