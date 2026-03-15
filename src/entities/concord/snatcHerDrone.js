import { SnatcHerDroneHull } from '@data/hulls/snatcher-drone-hull/hull.js';

const LATCH_RANGE          = 35;   // px
const DRAIN_INTERVAL       = 0.25; // seconds per tick
const ARMOR_DRAIN_PER_TICK = 2.6;  // ~10.4/sec
const HULL_DRAIN_PER_TICK  = 0.65; // ~2.6/sec bleed

/** Snatcher Drone — unmanned Concord intercept unit with latch/drain behavior. */
export class SnatcHerDroneShip extends SnatcHerDroneHull {
  constructor(x, y) {
    super(x, y);

    this.weapons = [];  // no weapons — latch mechanic only
    this._canRespawn = false;

    // Latch state
    this._isLatched     = false;
    /** @type {import('../../entities/ship.js').Ship | null} */
    this._latchTarget   = null;
    this._latchOffset   = { x: 0, y: 0 };
    this._drainAccum    = 0;

    // HUD notification queues
    this._pickupTextQueue = [];
    this._spawnQueue      = [];  // unused but safe for generic queue processor
  }

  onDestroy() {
    if (this._isLatched) {
      this._isLatched = false;
      this._latchTarget = null;
      this._pickupTextQueue.push({ text: 'DRONE DETACHED', colorHint: 'repair' });
    }
    super.onDestroy();
  }

  update(dt, entities) {
    if (this._isLatched) {
      if (!this._latchTarget?.active) {
        this.active = false;
        return;
      }
      // Snap position to hull
      this.x = this._latchTarget.x + this._latchOffset.x;
      this.y = this._latchTarget.y + this._latchOffset.y;
      this.vx = 0;
      this.vy = 0;
      this.speed = 0;
      this.throttleLevel = 0;

      // Drain tick
      this._drainAccum += dt;
      while (this._drainAccum >= DRAIN_INTERVAL) {
        this._drainAccum -= DRAIN_INTERVAL;
        this._latchTarget.takeDamage(ARMOR_DRAIN_PER_TICK, HULL_DRAIN_PER_TICK, this.x, this.y);
      }
      return;
    }

    // Cache player target once
    if (!this._latchTarget) {
      this._latchTarget = /** @type {import('../../entities/ship.js').Ship | null} */ (
        entities.find(e => e.relation === 'player' && e.active) ?? null
      );
    }

    super.update(dt, entities);

    // Check latch proximity
    if (this._latchTarget?.active) {
      const dx = this._latchTarget.x - this.x;
      const dy = this._latchTarget.y - this.y;
      if (Math.hypot(dx, dy) <= LATCH_RANGE) {
        this._isLatched = true;
        this._latchOffset = {
          x: this.x - this._latchTarget.x,
          y: this.y - this._latchTarget.y,
        };
        this._pickupTextQueue.push({ text: 'DRONE LATCHED', colorHint: 'breach' });
      }
    }
  }
}
