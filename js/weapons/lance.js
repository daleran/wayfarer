import { BASE_DAMAGE, BASE_WEAPON_RANGE } from '../data/stats.js';

// Lance: ramping beam — baseDamage (at t=0) to maxDamage (at rampTime)
// Range expressed as a fraction of BASE_WEAPON_RANGE
const FIXED = { BASE_MULT: 0.88, MAX_MULT: 4.12, RANGE_MULT: 0.233 };  // 15→70 dmg, 350u
const LARGE = { BASE_MULT: 0.71, MAX_MULT: 3.24, RANGE_MULT: 0.233 };  // 12→55 dmg, 350u
const SMALL = { BASE_MULT: 0.47, MAX_MULT: 2.35, RANGE_MULT: 0.167 };  // 8→40 dmg, 250u

export class Lance {
  constructor(variant = 'small') {
    this.isSecondary = false;
    this.isAutoFire  = false;
    this.isBeam      = true;
    this.isFixed     = variant === 'fixed';

    const V = variant === 'fixed' ? FIXED : variant === 'large' ? LARGE : SMALL;
    this.baseDamage  = BASE_DAMAGE * V.BASE_MULT;
    this.maxDamage   = BASE_DAMAGE * V.MAX_MULT;
    this.maxRange    = BASE_WEAPON_RANGE * V.RANGE_MULT;
    this.displayName = variant === 'fixed' ? 'LANCE-F' : variant === 'large' ? 'LANCE-L' : 'LANCE-S';
    this.rampTime = 2.0;   // seconds to reach full damage

    // State
    this._rampUp      = 0;   // 0..rampTime
    this._isFiring    = false;
    this._hitTarget   = null;
    this._beamOriginX = 0;
    this._beamOriginY = 0;
    this._beamEndX    = 0;
    this._beamEndY    = 0;
  }

  update(dt) {
    if (this._isFiring) {
      this._rampUp = Math.min(this._rampUp + dt, this.rampTime);
      // Apply damage to hit target
      if (this._hitTarget && this._hitTarget.active) {
        const t = this._rampUp / this.rampTime;
        const dmgPerSec = this.baseDamage + (this.maxDamage - this.baseDamage) * t;
        this._hitTarget.takeDamage(dmgPerSec * dt, 0, this._beamEndX, this._beamEndY);
        if (this._hitTarget.isDestroyed) this._hitTarget = null;
      }
    } else {
      this._rampUp = Math.max(this._rampUp - dt * 2, 0);
    }
    this._isFiring = false; // reset each frame; fire() re-sets it
  }

  fire(ship, tx, ty, entities) {
    this._isFiring    = true;
    this._beamOriginX = ship.x;
    this._beamOriginY = ship.y;

    let nx, ny, beamLength;
    if (this.isFixed) {
      nx = Math.sin(ship.rotation);
      ny = -Math.cos(ship.rotation);
      beamLength = this.maxRange;
    } else {
      const dx = tx - ship.x;
      const dy = ty - ship.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist === 0) return;
      nx = dx / dist;
      ny = dy / dist;
      beamLength = Math.min(dist, this.maxRange);
    }

    this._beamEndX = ship.x + nx * beamLength;
    this._beamEndY = ship.y + ny * beamLength;
    this._hitTarget = null;

    // Hitscan — find closest ship along beam
    let closestT = beamLength;
    for (const entity of entities) {
      if (!entity.active || !entity.isShip) continue;
      if (entity === ship) continue;
      if (entity.faction && ship.faction && entity.faction === ship.faction) continue;
      const ecx = entity.x - ship.x;
      const ecy = entity.y - ship.y;
      const t = ecx * nx + ecy * ny;
      if (t < 0 || t > closestT) continue;
      const px = ecx - t * nx;
      const py = ecy - t * ny;
      const r = entity.getBounds().radius;
      if (px*px + py*py < (r + 4) * (r + 4)) {
        closestT = t;
        this._hitTarget = entity;
      }
    }

    if (this._hitTarget) {
      this._beamEndX = ship.x + nx * closestT;
      this._beamEndY = ship.y + ny * closestT;
    }
  }
}
