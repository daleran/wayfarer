// FuelDepotStation renderer — Kell's Stop visual representation.
import { Station } from '@/entities/station.js';
import { AMBER, WHITE } from '@/rendering/colors.js';

const HULL_FILL = 'rgba(0,4,8,0.9)';
const TANK_FILL = 'rgba(0,6,12,0.92)';

export class FuelDepotStation extends Station {
  constructor(x, y, data) {
    super(x, y, data);
    this.dockingRadius = 150;
  }

  update(dt) { super.update(dt); }

  render(ctx, camera) {
    const screen = camera.worldToScreen(this.x, this.y);
    const cx = screen.x, cy = screen.y;
    const t = this._navPulse;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(camera.zoom, camera.zoom);

    const accent = this.accentColor;

    // ── TANK AMBIENT GLOW ─────────────────────────────────────────────────────
    const tankGlow = ctx.createRadialGradient(88, -4, 8, 88, -4, 80);
    tankGlow.addColorStop(0, 'rgba(255,170,0,0.05)');
    tankGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = tankGlow;
    ctx.fillRect(10, -90, 160, 180);

    // ── OPS MODULE (left side) ────────────────────────────────────────────────
    ctx.beginPath();
    ctx.rect(-65, -25, 30, 42);
    ctx.fillStyle = HULL_FILL;
    ctx.fill();
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 1.4;
    ctx.globalAlpha = 0.6;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Ops module window strip
    ctx.beginPath();
    ctx.rect(-59, -18, 18, 8);
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fill();
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 0.8;
    ctx.globalAlpha = 0.3;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Ops module panel line
    ctx.beginPath();
    ctx.moveTo(-65, -5);
    ctx.lineTo(-35, -5);
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.15;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // ── MAIN PLATFORM ─────────────────────────────────────────────────────────
    ctx.beginPath();
    ctx.rect(-35, -10, 88, 20);
    ctx.fillStyle = HULL_FILL;
    ctx.fill();
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 1.4;
    ctx.globalAlpha = 0.6;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Platform rib lines
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.12;
    for (const rx of [-12, 12, 36]) {
      ctx.beginPath();
      ctx.moveTo(rx, -10);
      ctx.lineTo(rx, 10);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // ── PIPE CONNECTOR ───────────────────────────────────────────────────────
    ctx.beginPath();
    ctx.rect(53, -4, 18, 8);
    ctx.fillStyle = HULL_FILL;
    ctx.fill();
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 1.0;
    ctx.globalAlpha = 0.45;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // ── TANK VERTICAL BRACKET ─────────────────────────────────────────────────
    ctx.beginPath();
    ctx.moveTo(70, -36);
    ctx.lineTo(70, 28);
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 3.5;
    ctx.globalAlpha = 0.4;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // ── FUEL TANKS — always AMBER ─────────────────────────────────────────────
    const TANK_R = 30;
    const TANK_X = 90;
    const tankCenters = [-36, 28];

    for (let i = 0; i < 2; i++) {
      const TCY = tankCenters[i];

      // Per-tank ambient glow
      const glow = ctx.createRadialGradient(TANK_X, TCY, 4, TANK_X, TCY, TANK_R + 14);
      glow.addColorStop(0, 'rgba(255,170,0,0.07)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(TANK_X, TCY, TANK_R + 14, 0, Math.PI * 2);
      ctx.fill();

      // Tank body
      ctx.beginPath();
      ctx.arc(TANK_X, TCY, TANK_R, 0, Math.PI * 2);
      ctx.fillStyle = TANK_FILL;
      ctx.fill();
      ctx.strokeStyle = AMBER;
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Hazard diagonal stripes — clipped to tank interior
      ctx.save();
      ctx.beginPath();
      ctx.arc(TANK_X, TCY, TANK_R - 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.strokeStyle = AMBER;
      ctx.lineWidth = 6;
      ctx.globalAlpha = 0.07;
      for (let s = -70; s < 70; s += 15) {
        ctx.beginPath();
        ctx.moveTo(TANK_X + s - TANK_R, TCY - TANK_R);
        ctx.lineTo(TANK_X + s + TANK_R, TCY + TANK_R);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.restore();

      // Horizontal rib lines
      ctx.strokeStyle = AMBER;
      ctx.lineWidth = 0.8;
      ctx.globalAlpha = 0.22;
      for (const ry of [-14, 0, 14]) {
        const hw = Math.sqrt(Math.max(0, TANK_R * TANK_R - ry * ry));
        ctx.beginPath();
        ctx.moveTo(TANK_X - hw, TCY + ry);
        ctx.lineTo(TANK_X + hw, TCY + ry);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Safety light on tank outer edge
      const isOn = Math.floor((t + i * 1.1) / 1.1) % 2 === 0;
      ctx.beginPath();
      ctx.arc(TANK_X + TANK_R, TCY, 3, 0, Math.PI * 2);
      ctx.fillStyle = AMBER;
      ctx.globalAlpha = isOn ? 0.88 : 0.12;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // ── DOCKING SPAR ─────────────────────────────────────────────────────────
    ctx.beginPath();
    ctx.rect(-8, 10, 16, 40);
    ctx.fillStyle = HULL_FILL;
    ctx.fill();
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 1.0;
    ctx.globalAlpha = 0.45;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Docking spar tip beacon
    const sparPulse = 0.35 + 0.55 * Math.sin(t * Math.PI * 1.6);
    ctx.beginPath();
    ctx.arc(0, 52, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = accent;
    ctx.globalAlpha = sparPulse * 0.15;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 52, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = accent;
    ctx.globalAlpha = sparPulse;
    ctx.fill();
    ctx.globalAlpha = 1;

    // ── CORNER NAV LIGHTS ────────────────────────────────────────────────────
    const navLit = Math.floor(t / 0.9) % 2 === 0;
    if (navLit) {
      for (const [lx, ly] of [[-65, -25], [-65, 17], [53, -10], [53, 10]]) {
        ctx.beginPath();
        ctx.arc(lx, ly, 2, 0, Math.PI * 2);
        ctx.fillStyle = accent;
        ctx.globalAlpha = 0.75;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // Docking lights — red/green pair at the docking spar
    this._renderDockingLights(ctx, 0, 52, 12);

    this._renderNameLabel(ctx, camera, 68);

    ctx.restore();
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 50 };
  }
}
