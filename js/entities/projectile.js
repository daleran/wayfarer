import { Entity } from './entity.js';
import { GREEN, RED, AMBER, PLASMA_GREEN } from '../rendering/colors.js';

const ROCKET_TRAIL_MAX = 80;
const BOLT_TRAIL_MAX   = 18;

export class Projectile extends Entity {
  constructor(x, y, vx, vy, damage, owner) {
    super(x, y);
    this.vx = vx;
    this.vy = vy;
    this.damage = damage;
    this.hullDamage = null;   // null → remaining armor bleeds to hull
    this.owner = owner;
    this.distanceTravelled = 0;
    this.maxRange = 350;
    this.color = null;
    this.glowColor = null;
    this.length = 4;

    // Tracer trail
    this.hasTrail = false;
    this._trail = [];

    // Rocket / missile visuals
    this.isRocket = false;
    this.isTorpedo = false;
    this._rocketTrail = [];
    this._rocketAge = 0;
    this.rocketTargetX = null;
    this.rocketTargetY = null;
    this.shouldDetonate = false;
    this.blastRadius = 280;

    // AoE flags
    this.detonatesOnContact = false;
    this.detonatesOnExpiry  = false;

    // Guided missile
    this.isGuided = false;
    this.guidedType = null;
    this.guidanceStrength = 3.0;
    this.guidanceTargetX = null;
    this.guidanceTargetY = null;
    this._guideSelfDestructTimer = null;

    // Interception
    this.isInterceptable = false;
    this.canIntercept = false;

    // Plasma
    this.isPlasma = false;

    // Reputation tracking
    this._neutralPenaltyApplied = false;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.distanceTravelled += Math.sqrt(this.vx * this.vx + this.vy * this.vy) * dt;

    // Guided steering
    if (this.isGuided && this.guidanceTargetX !== null && this.guidanceTargetY !== null) {
      const dx = this.guidanceTargetX - this.x;
      const dy = this.guidanceTargetY - this.y;
      const targetAngle = Math.atan2(dy, dx);
      const currentAngle = Math.atan2(this.vy, this.vx);
      let delta = targetAngle - currentAngle;
      while (delta >  Math.PI) delta -= Math.PI * 2;
      while (delta < -Math.PI) delta += Math.PI * 2;
      const maxTurn = this.guidanceStrength * dt;
      const turn = Math.max(-maxTurn, Math.min(maxTurn, delta));
      const newAngle = currentAngle + turn;
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      this.vx = Math.cos(newAngle) * speed;
      this.vy = Math.sin(newAngle) * speed;
    }

    // Self-destruct timer (heat missiles)
    if (this._guideSelfDestructTimer !== null) {
      this._guideSelfDestructTimer -= dt;
      if (this._guideSelfDestructTimer <= 0) {
        if (this.isRocket) this.shouldDetonate = true;
        this.active = false;
        return;
      }
    }

    if (this.hasTrail) {
      this._trail.push({ x: this.x, y: this.y });
      if (this._trail.length > BOLT_TRAIL_MAX) this._trail.shift();
    }

    if (this.isRocket) {
      this._rocketAge += dt;
      this._rocketTrail.push({ x: this.x, y: this.y });
      if (this._rocketTrail.length > ROCKET_TRAIL_MAX) this._rocketTrail.shift();

      // Non-guided rockets detonate at click target
      if (!this.isGuided && this.rocketTargetX !== null) {
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
      if (this.isRocket || this.detonatesOnExpiry) this.shouldDetonate = true;
      this.active = false;
    }
  }

  render(ctx, camera) {
    if (this.isRocket) { this._renderRocket(ctx, camera); return; }
    if (this.isPlasma)  { this._renderPlasma(ctx, camera);  return; }

    const screen = camera.worldToScreen(this.x, this.y);
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed === 0) return;
    const nx = this.vx / speed;
    const ny = this.vy / speed;

    const isPlayer = this.owner && (this.owner.faction === 'player');
    const baseColor  = this.color    || (isPlayer ? GREEN : RED);
    const sharpColor = this.glowColor || (isPlayer ? '#ccffcc' : '#ffcccc');
    const len = this.length;

    ctx.save();

    if (this.hasTrail && this._trail.length > 1) {
      ctx.lineCap = 'round';
      for (let i = 1; i < this._trail.length; i++) {
        const p0 = camera.worldToScreen(this._trail[i - 1].x, this._trail[i - 1].y);
        const p1 = camera.worldToScreen(this._trail[i].x, this._trail[i].y);
        const t = i / this._trail.length;
        ctx.strokeStyle = baseColor;
        ctx.globalAlpha = t * 0.35;
        ctx.lineWidth = t * 1.5;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    ctx.strokeStyle = baseColor;
    ctx.lineWidth = 5;
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.moveTo(screen.x - nx * (len + 1), screen.y - ny * (len + 1));
    ctx.lineTo(screen.x + nx * (len + 1), screen.y + ny * (len + 1));
    ctx.stroke();

    ctx.strokeStyle = sharpColor;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.moveTo(screen.x - nx * len, screen.y - ny * len);
    ctx.lineTo(screen.x + nx * len, screen.y + ny * len);
    ctx.stroke();

    ctx.restore();
  }

  _renderPlasma(ctx, camera) {
    const screen = camera.worldToScreen(this.x, this.y);
    const falloff = Math.max(0, 1 - this.distanceTravelled / this.maxRange);
    const r = (3 + falloff * 4) * camera.zoom;
    ctx.save();
    ctx.globalAlpha = 0.10 + falloff * 0.20;
    ctx.fillStyle = PLASMA_GREEN;
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, r * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.55 + falloff * 0.45;
    ctx.fillStyle = '#ccffee';
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, r * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  _renderRocket(ctx, camera) {
    ctx.save();
    ctx.lineCap = 'round';

    const trail = this._rocketTrail;
    const trailColor = this.isTorpedo ? '#996633' : AMBER;
    for (let i = 1; i < trail.length; i++) {
      const p0 = camera.worldToScreen(trail[i - 1].x, trail[i - 1].y);
      const p1 = camera.worldToScreen(trail[i].x, trail[i].y);
      const t = i / trail.length;
      ctx.strokeStyle = trailColor;
      ctx.globalAlpha = t * 0.55;
      ctx.lineWidth = 1 + t * 2.5;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
    }

    const screen = camera.worldToScreen(this.x, this.y);
    const pulse = 0.7 + 0.3 * Math.sin(this._rocketAge * 18);

    const headColor  = this.isTorpedo ? '#cc8800' : AMBER;
    const coreColor  = this.isTorpedo ? '#ffcc66' : '#ffe0a0';
    const glowAlpha  = this.isTorpedo ? 0.12 : 0.18;

    ctx.globalAlpha = glowAlpha * pulse;
    ctx.strokeStyle = headColor;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, 5 * pulse, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = coreColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, 2.5 * pulse, 0, Math.PI * 2);
    ctx.stroke();

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
