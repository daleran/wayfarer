import { createParticle } from '../entities/particle.js';

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
      colors: ['#ff8844', '#ffaa22', '#ffcc66', '#ff4400'],
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
      color: '#ffaa44',
    });
    this._rings.push({
      x, y,
      radius: 3,
      maxRadius: 40,
      life: 0.35,
      maxLife: 0.35,
      color: '#ff6622',
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
    ctx.save();

    // Render expanding rings
    for (const ring of this._rings) {
      const screen = camera.worldToScreen(ring.x, ring.y);
      const alpha = ring.life / ring.maxLife;
      ctx.strokeStyle = ring.color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = alpha * 0.6;
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, ring.radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Render particles
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
