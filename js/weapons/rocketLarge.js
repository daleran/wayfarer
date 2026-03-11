import { Projectile } from '../entities/projectile.js';
import { BASE_DAMAGE, BASE_HULL_DAMAGE, BASE_PROJECTILE_SPEED,
         PROJECTILE_SPEED_FACTOR, BASE_COOLDOWN } from '../data/stats.js';

const DAMAGE_MULT      = 5.3;   // ~90 armor damage per rocket
const HULL_DAMAGE_MULT = 6.5;   // 65 hull per rocket
const SPEED_MULT       = 1.4;
const COOLDOWN_MULT    = 12.0;
const LARGE_MAG_SIZE   = 8;     // 8 tubes
const LARGE_RELOAD_TIME = 13.0; // shared ammo pool with small pod

export class RocketPodLarge {
  constructor() {
    this.isSecondary = true;
    this.isAutoFire  = false;
    this.ammoType    = 'rocket'; // shared pool with RocketPodSmall
    this.damage      = BASE_DAMAGE      * DAMAGE_MULT;
    this.hullDamage  = BASE_HULL_DAMAGE * HULL_DAMAGE_MULT;
    this.projectileSpeed = BASE_PROJECTILE_SPEED * SPEED_MULT * PROJECTILE_SPEED_FACTOR;
    this.cooldownMax = BASE_COOLDOWN * COOLDOWN_MULT;
    this._cooldown   = 0;
    this.magSize        = LARGE_MAG_SIZE;
    this.ammo           = LARGE_MAG_SIZE;
    this.reloadTime     = LARGE_RELOAD_TIME;
    this._reloadTimer   = 0;
    this.ammoCargoWeight = 1.0; // 1 cargo unit per rocket
    this.pipCount    = LARGE_MAG_SIZE;
    // Guidance mode
    this.guidanceModes = ['dumbfire', 'wire', 'heat'];
    this.guidanceMode  = 'dumbfire';
    // Burst state
    this._burstCount  = 0;
    this._burstTimer  = 0;
    this._burstShip   = null;
    this._burstTx     = 0;
    this._burstTy     = 0;
  }

  get displayName() {
    return 'RPOD-L [' + this.guidanceMode.toUpperCase() + ']';
  }

  get isReloading() { return this._reloadTimer > 0; }

  update(dt, entities) {
    if (this._cooldown > 0) this._cooldown -= dt;
    if (this._burstCount > 0 && entities) {
      this._burstTimer -= dt;
      if (this._burstTimer <= 0) {
        this._fireOneRocket(entities);
        this._burstCount--;
        if (this._burstCount > 0) this._burstTimer = 0.12;
      }
    }
  }

  fire(ship, tx, ty, entities) {
    if (this._cooldown > 0 || this._reloadTimer > 0) return;
    if (ship.relation === 'player' && this.ammo <= 0) return;
    this._burstShip  = ship;
    this._burstTx    = tx;
    this._burstTy    = ty;
    this._burstCount = LARGE_MAG_SIZE - 1; // remaining after first
    this._burstTimer = 0.12;
    this._fireOneRocket(entities); // fire first immediately
    if (ship.relation === 'player') {
      this.ammo = 0; // all tubes fired in burst
      this._reloadTimer = this.reloadTime;
    }
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
    proj.hullDamage      = this.hullDamage;
    proj.maxRange        = dist + 20;
    proj.blastRadius     = 280;
    proj.isInterceptable = true;

    if (this.guidanceMode === 'dumbfire') {
      proj.isRocket      = true;
      proj.rocketTargetX = ship.x + Math.cos(angle) * dist;
      proj.rocketTargetY = ship.y + Math.sin(angle) * dist;
    } else if (this.guidanceMode === 'wire') {
      proj.isGuided         = true;
      proj.guidedType       = 'wire';
      proj.guidanceStrength = 3.0;
    } else if (this.guidanceMode === 'heat') {
      proj.isGuided         = true;
      proj.guidedType       = 'heat';
      proj.guidanceStrength = 2.5;
    }

    entities.push(proj);
  }
}

// Backward-compat alias
export { RocketPodLarge as RocketLarge };
