import { MaverickCourier } from '../../ships/classes/maverickCourier.js';
import { AI_TEMPLATES } from '../../data/tuning/aiTuning.js';
import { CONCORD_BLUE, ENEMY_FILL } from '../../ui/colors.js';
import { engineGlow } from '../../rendering/draw.js';

const SPEED_MULT = 2.0;   // ~196 u/s — extremely fast
const ACCEL_MULT = 2.2;
const TURN_MULT  = 2.2;
const HULL_MULT  = 0.15;  // 30 HP — very fragile
const ARMOR_ALL  = 0.1;   // 10 per arc

const LATCH_RANGE          = 35;   // px
const DRAIN_INTERVAL       = 0.25; // seconds per tick
const ARMOR_DRAIN_PER_TICK = 2;    // 8/sec
const HULL_DRAIN_PER_TICK  = 0.5;  // 2/sec bleed

// Tiny hexagonal dart — ~14px
const DRONE_POINTS = [
  { x:  0, y: -14 },
  { x:  9, y:   0 },
  { x:  4, y:   6 },
  { x:  0, y:  10 },
  { x: -4, y:   6 },
  { x: -9, y:   0 },
];

const ENGINE_POS = [{ x: 0, y: 10 }];

export class SnatcHerDrone extends MaverickCourier {
  constructor(x, y) {
    super(x, y);

    this.faction     = 'concord';
    this.relation    = 'hostile';
    this.shipType    = 'snatcher-drone';
    this.displayName = 'Snatcher Drone';
    this.ai          = { ...AI_TEMPLATES.stalker };

    this.flavorText =
      'A Concord Remnant autonomous intercept unit. No weapons, no crew, ' +
      'no hesitation. Designed to latch onto a hull and drain it from the outside. ' +
      'Fragile under fire — priority target when latched.';

    this._initStats({
      speed: SPEED_MULT, accel: ACCEL_MULT, turn: TURN_MULT,
      hull: HULL_MULT, armorFront: ARMOR_ALL, armorSide: ARMOR_ALL, armorAft: ARMOR_ALL,
    });

    this.weapons = [];  // no weapons — latch mechanic only

    this._canRespawn = false;

    // Latch state
    this._isLatched     = false;
    this._latchTarget   = null;
    this._latchOffset   = { x: 0, y: 0 };
    this._drainAccum    = 0;

    // HUD notifications for game.js to dispatch
    this._pickupTextQueue = [];
    this._spawnQueue      = [];  // unused but safe for generic queue processor
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
      this._latchTarget = entities.find(e => e.relation === 'player' && e.active) ?? null;
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

  _drawShape(ctx) {
    // Tiny hexagonal dart — Concord machine aesthetic
    ctx.beginPath();
    ctx.moveTo(DRONE_POINTS[0].x, DRONE_POINTS[0].y);
    for (let i = 1; i < DRONE_POINTS.length; i++) {
      ctx.lineTo(DRONE_POINTS[i].x, DRONE_POINTS[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = ENEMY_FILL;
    ctx.fill();
    ctx.strokeStyle = CONCORD_BLUE;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Core dot
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fillStyle = CONCORD_BLUE;
    ctx.fill();

    // Engine glow — aft
    engineGlow(ctx, ENGINE_POS, this.engineColor, 2 + this.throttleLevel * 0.5, 2, 2, 0.3);
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 14 };
  }
}

export function createSnatcHerDrone(x, y) {
  return new SnatcHerDrone(x, y);
}
