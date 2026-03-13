import { Entity } from './entity.js';
import { AMBER, WHITE } from '@/rendering/colors.js';

const DURATION = 0.55; // seconds

export class RocketExplosion extends Entity {
  constructor(x, y, blastRadius) {
    super(x, y);
    this.blastRadius = blastRadius; // world units
    this._age = 0;
  }

  update(dt) {
    this._age += dt;
    if (this._age >= DURATION) this.active = false;
  }

  render(ctx, camera) {
    const t = Math.min(this._age / DURATION, 1); // 0→1

    const center = camera.worldToScreen(this.x, this.y);
    const scale = camera.zoom ?? 1;
    const maxR = this.blastRadius * scale;

    ctx.save();

    // Flash core — quick bright burst that fades by t=0.2
    const flashAlpha = Math.max(0, 1 - t / 0.25);
    if (flashAlpha > 0) {
      const flashR = maxR * 0.35 * t * 4; // reaches 35% radius quickly
      const grad = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, Math.max(flashR, 1));
      grad.addColorStop(0, `rgba(255,255,255,${flashAlpha * 0.9})`);
      grad.addColorStop(0.4, `rgba(255,200,80,${flashAlpha * 0.6})`);
      grad.addColorStop(1, `rgba(180,100,20,0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(center.x, center.y, Math.max(flashR, 1), 0, Math.PI * 2);
      ctx.fill();
    }

    // Outer expanding ring — travels full blast radius, fades out late
    const outerR = maxR * t;
    const outerAlpha = 1 - t;
    ctx.strokeStyle = AMBER;
    ctx.lineWidth = (1 - t) * 4 + 0.5; // thicker peak
    ctx.globalAlpha = outerAlpha * 0.85;
    ctx.beginPath();
    ctx.arc(center.x, center.y, Math.max(outerR, 1), 0, Math.PI * 2);
    ctx.stroke();

    // Inner ring — expands to 55% of blast radius, fades faster
    const innerT = Math.min(t / 0.6, 1);
    const innerR = maxR * 0.55 * innerT;
    const innerAlpha = Math.max(0, 1 - innerT);
    ctx.lineWidth = (1 - innerT) * 4 + 1;
    ctx.globalAlpha = innerAlpha * 0.7;
    ctx.beginPath();
    ctx.arc(center.x, center.y, Math.max(innerR, 1), 0, Math.PI * 2);
    ctx.stroke();

    // Outer edge marker ring — drawn at exact blast radius, bright amber/white
    const edgeAlpha = Math.max(0, 0.7 * (1 - t * 1.8));
    if (edgeAlpha > 0) {
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = edgeAlpha;
      ctx.beginPath();
      ctx.arc(center.x, center.y, Math.max(maxR, 1), 0, Math.PI * 2);
      ctx.stroke();
    }

    // Glow halo on outer ring
    ctx.strokeStyle = AMBER;
    ctx.lineWidth = (1 - t) * 10 + 1;
    ctx.globalAlpha = outerAlpha * 0.15;
    ctx.beginPath();
    ctx.arc(center.x, center.y, Math.max(outerR, 1), 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }
}
