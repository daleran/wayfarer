import { createParticle } from '../entities/particle.js';

const POOL_SIZE = 200;

export class ParticlePool {
  constructor() {
    this._pool = Array.from({ length: POOL_SIZE }, createParticle);
  }

  _findSlot() {
    for (const p of this._pool) {
      if (!p.active) return p;
    }
    return null;
  }

  emit(x, y, count, opts = {}) {
    const colors = opts.colors ?? ['#fff'];
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
      colors: ['#f84', '#fa2', '#ff6', '#f40'],
      minSpeed: 30,
      maxSpeed: 120,
      life: 0.5,
      r: 3,
    });
  }

  engineTrail(x, y, angle) {
    const count = Math.random() < 0.5 ? 2 : 1;
    this.emit(x, y, count, {
      colors: ['#4af', '#28f', '#6cf'],
      angle: angle + Math.PI,
      spread: 0.4,
      minSpeed: 20,
      maxSpeed: 60,
      life: 0.2 + Math.random() * 0.2,
      r: 2,
    });
  }

  update(dt) {
    for (const p of this._pool) {
      if (!p.active) continue;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) p.active = false;
    }
  }

  render(ctx, camera) {
    ctx.save();
    for (const p of this._pool) {
      if (!p.active) continue;
      const screen = camera.worldToScreen(p.x, p.y);
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}
