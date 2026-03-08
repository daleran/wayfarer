import { Entity } from './entity.js';
import { GREEN, RED, AMBER } from '../ui/colors.js';

const ROCKET_TRAIL_MAX = 80;

export class Projectile extends Entity {
  constructor(x, y, vx, vy, damage, owner) {
    super(x, y);
    this.vx = vx;
    this.vy = vy;
    this.damage = damage;
    this.owner = owner;
    this.distanceTravelled = 0;
    this.maxRange = 350;
    // Custom colors — set by weapon after creation, or fall back to relation-based
    this.color = null;
    this.glowColor = null;
    this.length = 4; // half-length of the streak in pixels

    // Rocket-specific
    this.isRocket = false;
    this._rocketTrail = []; // world-space position history
    this._rocketAge = 0;    // used for pulse animation
    this.rocketTargetX = null;
    this.rocketTargetY = null;
    this.shouldDetonate = false; // set true when rocket reaches destination
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.distanceTravelled += Math.sqrt(this.vx * this.vx + this.vy * this.vy) * dt;

    if (this.isRocket) {
      this._rocketAge += dt;
      this._rocketTrail.push({ x: this.x, y: this.y });
      if (this._rocketTrail.length > ROCKET_TRAIL_MAX) this._rocketTrail.shift();

      // Detonate at target position
      if (this.rocketTargetX !== null) {
        const dx = this.rocketTargetX - this.x;
        const dy = this.rocketTargetY - this.y;
        if (dx * dx + dy * dy < 20 * 20) {
          this.shouldDetonate = true;
          this.active = false;
          return;
        }
      }
    }

    if (this.distanceTravelled > this.maxRange) {
      if (this.isRocket) this.shouldDetonate = true;
      this.active = false;
    }
  }

  render(ctx, camera) {
    if (this.isRocket) {
      this._renderRocket(ctx, camera);
      return;
    }

    const screen = camera.worldToScreen(this.x, this.y);
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed === 0) return;
    const nx = this.vx / speed;
    const ny = this.vy / speed;

    const isPlayer = this.owner && (this.owner.faction === 'player');
    const baseColor = this.color || (isPlayer ? GREEN : RED);
    const sharpColor = this.glowColor || (isPlayer ? '#ccffcc' : '#ffcccc');
    const len = this.length;

    ctx.save();

    // Glow pass — wider, low alpha
    ctx.strokeStyle = baseColor;
    ctx.lineWidth = 5;
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.moveTo(screen.x - nx * (len + 1), screen.y - ny * (len + 1));
    ctx.lineTo(screen.x + nx * (len + 1), screen.y + ny * (len + 1));
    ctx.stroke();

    // Sharp pass
    ctx.strokeStyle = sharpColor;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.moveTo(screen.x - nx * len, screen.y - ny * len);
    ctx.lineTo(screen.x + nx * len, screen.y + ny * len);
    ctx.stroke();

    ctx.restore();
  }

  _renderRocket(ctx, camera) {
    ctx.save();
    ctx.lineCap = 'round';

    // --- Trail ---
    const trail = this._rocketTrail;
    for (let i = 1; i < trail.length; i++) {
      const p0 = camera.worldToScreen(trail[i - 1].x, trail[i - 1].y);
      const p1 = camera.worldToScreen(trail[i].x, trail[i].y);
      const t = i / trail.length; // 0 = oldest, 1 = newest
      ctx.strokeStyle = AMBER;
      ctx.globalAlpha = t * 0.55;
      ctx.lineWidth = 1 + t * 2.5;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
    }

    // --- Pulsing head circle ---
    const screen = camera.worldToScreen(this.x, this.y);
    const pulse = 0.7 + 0.3 * Math.sin(this._rocketAge * 18); // fast pulse

    // Outer glow
    ctx.globalAlpha = 0.18 * pulse;
    ctx.strokeStyle = AMBER;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, 5 * pulse, 0, Math.PI * 2);
    ctx.stroke();

    // Inner bright circle
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = '#ffe0a0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, 2.5 * pulse, 0, Math.PI * 2);
    ctx.stroke();

    // Hot core dot
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 3 };
  }
}
