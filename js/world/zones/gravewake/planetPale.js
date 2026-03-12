// Planet Pale — background celestial body (not an interactive entity).
// Renders as a CRT-style topographic sphere with contour lines.

import { PALE_ICE, PALE_HAZE } from '../../../ui/colors.js';

// Terrain contour shapes — normalized coords (r=1), closed polygon per entry.
// Designed to read as topographic ice-surface scan data (Nostromo-style CRT aesthetic).
const PALE_CONTOURS = [
  // Outer cryo-plain boundary
  [ [ 0.02,-0.80], [ 0.30,-0.65], [ 0.55,-0.40], [ 0.70, 0.02], [ 0.58, 0.40],
    [ 0.25, 0.62], [-0.18, 0.72], [-0.50, 0.48], [-0.65, 0.08],
    [-0.58,-0.32], [-0.36,-0.60], [-0.10,-0.78] ],
  // Mid-latitude highland shelf
  [ [ 0.10,-0.50], [ 0.35,-0.30], [ 0.50, 0.08], [ 0.38, 0.40],
    [ 0.00, 0.52], [-0.32, 0.35], [-0.50, 0.00], [-0.35,-0.38], [-0.08,-0.52] ],
  // Inner plateau
  [ [ 0.08,-0.26], [ 0.28,-0.06], [ 0.24, 0.24], [-0.06, 0.35],
    [-0.30, 0.16], [-0.26,-0.20], [ 0.02,-0.32] ],
  // Northern ridge
  [ [-0.25,-0.52], [-0.05,-0.62], [ 0.12,-0.48], [ 0.02,-0.36], [-0.20,-0.36] ],
  // Southern shelf
  [ [ 0.15, 0.44], [ 0.40, 0.38], [ 0.45, 0.58], [ 0.22, 0.65], [ 0.00, 0.58] ],
];

const CONTOUR_ALPHAS = [0.22, 0.28, 0.32, 0.24, 0.20];

export const PlanetPale = {
  backgroundData(overrides = {}) {
    return {
      type: 'pale',
      name: 'Pale',
      x: 9000,
      y: 5000,
      radius: 540,
      ...overrides,

      render(ctx, camera) {
        // Parallax — Pale is a distant background body, moves at 70% of camera speed
        const PARALLAX = 0.7;
        const cx = camera.width  / 2 + (this.x - camera.x) * camera.zoom * PARALLAX;
        const cy = camera.height / 2 + (this.y - camera.y) * camera.zoom * PARALLAX;
        const r  = this.radius * camera.zoom;

        // Cull if off-screen
        if (cx + r < 0 || cx - r > camera.width || cy + r < 0 || cy - r > camera.height) return;

        ctx.save();

        // Very faint body fill
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = PALE_ICE;
        ctx.globalAlpha = 0.06;
        ctx.fill();

        // Terrain contour polygons — clipped to disk
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.clip();

        ctx.strokeStyle = PALE_ICE;
        ctx.lineWidth = Math.max(0.5, r * 0.006);

        for (let ci = 0; ci < PALE_CONTOURS.length; ci++) {
          ctx.globalAlpha = CONTOUR_ALPHAS[ci];
          const pts = PALE_CONTOURS[ci];
          ctx.beginPath();
          ctx.moveTo(cx + pts[0][0] * r, cy + pts[0][1] * r);
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(cx + pts[i][0] * r, cy + pts[i][1] * r);
          }
          ctx.closePath();
          ctx.stroke();
        }

        ctx.restore(); // removes clip

        ctx.save();

        // Thin outer atmosphere haze ring
        ctx.beginPath();
        ctx.arc(cx, cy, r + r * 0.025, 0, Math.PI * 2);
        ctx.strokeStyle = PALE_HAZE;
        ctx.lineWidth = Math.max(1.5, r * 0.020);
        ctx.globalAlpha = 0.10;
        ctx.stroke();

        // Limb outline
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = PALE_ICE;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.65;
        ctx.stroke();

        // Name label
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = PALE_ICE;
        ctx.globalAlpha = 0.50;
        ctx.fillText(this.name.toUpperCase(), cx, cy - r - 10);

        ctx.globalAlpha = 1;
        ctx.restore();
      },
    };
  },
};
