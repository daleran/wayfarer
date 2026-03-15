import { createParticle } from '@/entities/particle.js';
import { DrawBatch } from '@/rendering/draw.js';
import {
  WHITE, MAGENTA, PLASMA_GREEN,
  EXPLOSION_ORANGE, EXPLOSION_YELLOW, EXPLOSION_GOLD, EXPLOSION_RED,
  EXPLOSION_RING_OUTER, EXPLOSION_RING_INNER,
  MAGENTA_DARK, MAGENTA_LIGHT,
} from '@/rendering/colors.js';

const POOL_SIZE = 200;

export class ParticlePool {
  constructor() {
    this._pool = Array.from({ length: POOL_SIZE }, createParticle);
    this._rings = []; // expanding ring effects
  }

  _findSlot() {
    for (const p of this._pool) {
      if (!p.active) return p;
    }
    return null;
  }

  emit(x, y, count, opts = {}) {
    const colors = opts.colors ?? [WHITE];
    const minSpeed = opts.minSpeed ?? 10;
    const maxSpeed = opts.maxSpeed ?? 80;

    for (let i = 0; i < count; i++) {
      const p = this._findSlot();
      if (!p) break;

      const baseAngle = opts.angle ?? Math.random() * Math.PI * 2;
      const angle = opts.spread != null
        ? baseAngle + (Math.random() - 0.5) * opts.spread
        : baseAngle;
      const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);

      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.life = p.maxLife = opts.life ?? (0.4 + Math.random() * 0.4);
      p.r = opts.r ?? (2 + Math.random() * 2);
      p.color = colors[Math.floor(Math.random() * colors.length)];
      p.active = true;
    }
  }

  explosion(x, y, count = 20) {
    this.emit(x, y, count, {
      colors: [EXPLOSION_ORANGE, EXPLOSION_YELLOW, EXPLOSION_GOLD, EXPLOSION_RED],
      minSpeed: 30,
      maxSpeed: 120,
      life: 0.5,
      r: 3,
    });

    // Expanding ring effect
    this._rings.push({
      x, y,
      radius: 5,
      maxRadius: 60,
      life: 0.5,
      maxLife: 0.5,
      color: EXPLOSION_RING_OUTER,
    });
    this._rings.push({
      x, y,
      radius: 3,
      maxRadius: 40,
      life: 0.35,
      maxLife: 0.35,
      color: EXPLOSION_RING_INNER,
    });
  }

  rocketTrail(x, y) {
    this.emit(x, y, 2, {
      colors: [MAGENTA, WHITE, MAGENTA_DARK],
      minSpeed: 5,
      maxSpeed: 30,
      life: 0.3,
      r: 2,
    });
  }

  rocketImpact(x, y) {
    this.emit(x, y, 30, {
      colors: [MAGENTA, WHITE, MAGENTA_LIGHT, MAGENTA_DARK],
      minSpeed: 50,
      maxSpeed: 200,
      life: 0.7,
      r: 4,
    });
    this._rings.push({ x, y, radius: 5, maxRadius: 120, life: 0.6, maxLife: 0.6, color: MAGENTA });
    this._rings.push({ x, y, radius: 3, maxRadius: 80,  life: 0.4, maxLife: 0.4, color: WHITE });
  }

  ping(x, y, color = PLASMA_GREEN) {
    this._rings.push({ x, y, radius: 8, maxRadius: 80, life: 1.2, maxLife: 1.2, color });
  }

  update(dt) {
    for (const p of this._pool) {
      if (!p.active) continue;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) p.active = false;
    }

    // Update rings
    for (let i = this._rings.length - 1; i >= 0; i--) {
      const ring = this._rings[i];
      ring.life -= dt;
      if (ring.life <= 0) {
        this._rings.splice(i, 1);
        continue;
      }
      const t = 1 - ring.life / ring.maxLife;
      ring.radius = 5 + t * (ring.maxRadius - 5);
    }
  }

  render(ctx, camera) {
    const batch = new DrawBatch(ctx);

    // Batch expanding rings
    for (const r of this._rings) {
      const screen = camera.worldToScreen(r.x, r.y);
      const alpha = (r.life / r.maxLife) * 0.6;
      batch.ring(screen.x, screen.y, r.radius * camera.zoom, r.color, 2, alpha);
    }

    // Batch particles — grouped by color + alpha band automatically
    for (const p of this._pool) {
      if (!p.active) continue;
      const screen = camera.worldToScreen(p.x, p.y);
      const alpha = Math.max(0, p.life / p.maxLife);
      batch.disc(screen.x, screen.y, p.r, p.color, alpha);
    }

    batch.flush();
  }
}
