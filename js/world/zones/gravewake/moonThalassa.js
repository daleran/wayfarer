// Moon Thalassa — background celestial body (not an interactive entity).
// Renders as a CRT-style topographic sphere with brine-sea contour lines.
// The most habitable moon in Tyr — brine seas, dome farms, algae cultures.

import { THALASSA_BRINE, THALASSA_LAND, THALASSA_HAZE } from '../../../rendering/colors.js';

// Terrain contour shapes — normalized coords (r=1), closed polygon per entry.
// Designed to read as brine-sea coastlines and continental shelves.
const THALASSA_CONTOURS = [
  // Large southern continent (Perseverance crash site)
  [ [-0.10, 0.20], [ 0.25, 0.15], [ 0.45, 0.30], [ 0.50, 0.55],
    [ 0.30, 0.68], [-0.05, 0.72], [-0.35, 0.58], [-0.42, 0.35],
    [-0.25, 0.18] ],
  // Northern archipelago chain
  [ [-0.30,-0.55], [-0.10,-0.62], [ 0.08,-0.50], [ 0.15,-0.35],
    [-0.02,-0.30], [-0.22,-0.38], [-0.35,-0.48] ],
  // Eastern island cluster
  [ [ 0.35,-0.20], [ 0.55,-0.08], [ 0.58, 0.10], [ 0.42, 0.12],
    [ 0.30,-0.05] ],
  // Western brine shelf
  [ [-0.55,-0.10], [-0.40,-0.18], [-0.28, 0.00], [-0.38, 0.12],
    [-0.58, 0.05] ],
  // Polar ice cap (north)
  [ [-0.15,-0.70], [ 0.10,-0.72], [ 0.20,-0.60], [ 0.05,-0.55],
    [-0.12,-0.58] ],
];

// Landmasses are filled faintly, coastlines stroked
const CONTOUR_ALPHAS = [0.18, 0.14, 0.12, 0.10, 0.16];
const COAST_ALPHAS   = [0.30, 0.25, 0.22, 0.20, 0.28];

export const MoonThalassa = {
  backgroundData(overrides = {}) {
    return {
      type: 'thalassa',
      name: 'Thalassa',
      x: 3500,
      y: 2000,
      radius: 200,
      ...overrides,

      render(ctx, camera) {
        // Parallax — Thalassa is closer than Pale but still a background body
        const PARALLAX = 0.8;
        const cx = camera.width  / 2 + (this.x - camera.x) * camera.zoom * PARALLAX;
        const cy = camera.height / 2 + (this.y - camera.y) * camera.zoom * PARALLAX;
        const r  = this.radius * camera.zoom;

        // Cull if off-screen
        if (cx + r < 0 || cx - r > camera.width || cy + r < 0 || cy - r > camera.height) return;

        ctx.save();

        // Faint brine-sea fill
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = THALASSA_BRINE;
        ctx.globalAlpha = 0.08;
        ctx.fill();

        // Landmass contours — clipped to disk
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.clip();

        const lw = Math.max(0.5, r * 0.006);

        for (let ci = 0; ci < THALASSA_CONTOURS.length; ci++) {
          const pts = THALASSA_CONTOURS[ci];
          ctx.beginPath();
          ctx.moveTo(cx + pts[0][0] * r, cy + pts[0][1] * r);
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(cx + pts[i][0] * r, cy + pts[i][1] * r);
          }
          ctx.closePath();

          // Faint land fill
          ctx.fillStyle = THALASSA_LAND;
          ctx.globalAlpha = CONTOUR_ALPHAS[ci];
          ctx.fill();

          // Coastline stroke
          ctx.strokeStyle = THALASSA_BRINE;
          ctx.lineWidth = lw;
          ctx.globalAlpha = COAST_ALPHAS[ci];
          ctx.stroke();
        }

        ctx.restore(); // removes clip

        ctx.save();

        // Thin atmosphere haze ring
        ctx.beginPath();
        ctx.arc(cx, cy, r + r * 0.03, 0, Math.PI * 2);
        ctx.strokeStyle = THALASSA_HAZE;
        ctx.lineWidth = Math.max(1.5, r * 0.018);
        ctx.globalAlpha = 0.08;
        ctx.stroke();

        // Limb outline
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = THALASSA_BRINE;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.55;
        ctx.stroke();

        // Name label
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = THALASSA_BRINE;
        ctx.globalAlpha = 0.45;
        ctx.fillText(this.name.toUpperCase(), cx, cy - r - 10);

        ctx.globalAlpha = 1;
        ctx.restore();
      },
    };
  },
};
