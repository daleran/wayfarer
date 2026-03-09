import { GREEN, RED, RANGE_CIRCLE, PALE_ICE, PALE_HAZE, AMBER, VERY_DIM } from './ui/colors.js';
import { input } from './input.js';

// Terrain contour shapes for Pale — normalized coords (r=1), closed polygon per entry.
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

// Starfield layer config: [count, parallaxFactor, starSize]
const STAR_LAYERS = [
  { count: 200, parallax: 0.05, size: 1 },
  { count: 100, parallax: 0.2,  size: 1.5 },
  { count: 50,  parallax: 0.5,  size: 2 },
];

function generateStars(count, mapW, mapH) {
  const stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * mapW,
      y: Math.random() * mapH,
      opacity: 0.4 + Math.random() * 0.6,
      tint: Math.random() < 0.3 ? '#00ffcc' : '#cceeee',
    });
  }
  return stars;
}

export class Renderer {
  constructor(ctx, mapSize, zones) {
    this.ctx = ctx;
    this.mapSize = mapSize;

    // Generate star layers
    this.starLayers = STAR_LAYERS.map((cfg) => ({
      stars: generateStars(cfg.count, mapSize.width, mapSize.height),
      parallax: cfg.parallax,
      size: cfg.size,
    }));

    // Generate Gravewake micro-debris atmosphere
    this._gravewakeZone = (zones || []).find(z => z.id === 'gravewake') || null;
    this._gravewakeFragments = this._gravewakeZone
      ? this._generateGravewakeFragments(this._gravewakeZone, 300)
      : [];
  }

  _generateGravewakeFragments(zone, count) {
    const frags = [];
    const goldenAngle = 2.399963;
    for (let i = 0; i < count; i++) {
      const r = Math.sqrt(Math.random()) * zone.radius;
      const theta = i * goldenAngle;
      const wx = zone.center.x + Math.cos(theta) * r;
      const wy = zone.center.y + Math.sin(theta) * r;
      frags.push({
        wx, wy,
        parallax: 0.15 + (i % 17) * 0.015,
        size: 2 + (i % 4),
        angle: theta,
      });
    }
    return frags;
  }

  render(game) {
    const { ctx } = this;
    const { camera, entities } = game;

    // Clear
    ctx.clearRect(0, 0, camera.width, camera.height);
    ctx.fillStyle = '#000005';
    ctx.fillRect(0, 0, camera.width, camera.height);

    this._renderStarfield(camera);
    if (this._gravewakeZone) this._renderGravewakeAtmosphere(camera);
    this._renderBackground(game, camera);
    this._renderEntities(entities, camera);
    this._renderTacticalUI(game, camera);
    this._renderWeaponRangeCircle(game, camera);
    this._renderBeams(game, camera);
    game.particlePool.render(ctx, camera);
    game.hud.render(ctx, game);

    // Flank speed warning — pulsing amber edge glow
    if (game.player && game.player.throttleLevel === 5) {
      this._renderFlankWarning(camera);
    }

    // Hull critical warning — pulsing red edge glow when player hull is red (≤25%)
    if (game.player && game.player.active) {
      const hr = game.player.hullCurrent / game.player.hullMax;
      if (hr <= 0.25) this._renderHullWarning(camera, hr);
    }

    // CRT post-processing
    this._renderScanlines(camera);
    this._renderVignette(camera);

    // Crosshair cursor — always on top
    this._renderCrosshair(game, camera);
  }

  _renderTacticalUI(game, camera) {
    const { player, raiders } = game;
    if (!player || !player.active) return;

    if (player.capabilities.health_pips) {
      this._renderHealthPips(raiders, camera);
    }

    if (player.capabilities.lead_indicators) {
      this._renderLeadIndicators(game, camera);
    }
  }

  _renderHealthPips(raiders, camera) {
    const { ctx } = this;
    ctx.save();
    for (const r of raiders) {
      if (!r.active) continue;
      const bounds = r.getBounds();
      if (!camera.isVisible(bounds.x, bounds.y, bounds.radius)) continue;

      const screen = camera.worldToScreen(r.x, r.y);
      const totalIntegrity = r.armorMax + r.hullMax;
      const curIntegrity = r.armorCurrent + r.hullCurrent;
      const ratio = curIntegrity / totalIntegrity;

      const pipW = 10 * camera.zoom;
      const pipH = 3 * camera.zoom;
      const gap = 2 * camera.zoom;
      const xStart = screen.x - (pipW * 4 + gap * 3) / 2;
      const y = screen.y - bounds.radius * camera.zoom - 15 * camera.zoom;

      for (let i = 0; i < 4; i++) {
        const threshold = (i + 1) / 4;
        const filled = ratio >= threshold - 0.125; // slight tolerance
        ctx.fillStyle = filled ? (ratio > 0.5 ? GREEN : ratio > 0.25 ? AMBER : RED) : VERY_DIM;
        ctx.fillRect(xStart + i * (pipW + gap), y, pipW, pipH);
      }
    }
    ctx.restore();
  }

  _renderLeadIndicators(game, camera) {
    const { ctx } = this;
    const { player, raiders } = game;
    const primaries = player._primaryWeapons;
    const weapon = primaries[player.primaryWeaponIdx];
    if (!weapon || !weapon.projectileSpeed) return;

    ctx.save();
    ctx.strokeStyle = AMBER;
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);

    for (const r of raiders) {
      if (!r.active) continue;
      const dx = r.x - player.x;
      const dy = r.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > weapon.maxRange) continue;

      // Simple lead calculation
      const travelTime = dist / weapon.projectileSpeed;
      const tvx = Math.sin(r.rotation) * r.speed;
      const tvy = -Math.cos(r.rotation) * r.speed;
      const leadX = r.x + tvx * travelTime;
      const leadY = r.y + tvy * travelTime;

      const screen = camera.worldToScreen(leadX, leadY);
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, 4 * camera.zoom, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  _renderCrosshair(game, camera) {
    const { ctx } = this;
    const mx = input.mouseScreen.x;
    const my = input.mouseScreen.y;

    // Determine range status
    let inRange = true;
    const player = game.player;
    if (player && player.active) {
      const primaries = player._primaryWeapons;
      const weapon = primaries.length > 0 ? primaries[player.primaryWeaponIdx] : null;
      if (weapon) {
        const world = camera.screenToWorld(mx, my);
        const dx = world.x - player.x;
        const dy = world.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        inRange = dist <= weapon.maxRange;
      }
    }

    const color = inRange ? GREEN : RED;
    const arm = 8;
    const gap = 4;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.9;

    // Four arms
    ctx.beginPath();
    ctx.moveTo(mx - gap, my); ctx.lineTo(mx - gap - arm, my);
    ctx.moveTo(mx + gap, my); ctx.lineTo(mx + gap + arm, my);
    ctx.moveTo(mx, my - gap); ctx.lineTo(mx, my - gap - arm);
    ctx.moveTo(mx, my + gap); ctx.lineTo(mx, my + gap + arm);
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(mx, my, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    if (!inRange) {
      ctx.font = '10px monospace';
      ctx.fillStyle = RED;
      ctx.globalAlpha = 0.85;
      ctx.textAlign = 'center';
      ctx.fillText('OUT OF RANGE', mx, my + gap + arm + 14);
    }

    ctx.restore();
  }

  _renderBackground(game, camera) {
    const bg = game.map.background;
    if (!bg) return;
    for (const el of bg) {
      if (el.type === 'pale') this._renderPale(el, camera);
    }
  }

  _renderPale(pale, camera) {
    const { ctx } = this;

    // Parallax — Pale is a distant background body, moves at 70% of camera speed
    const PARALLAX = 0.7;
    const cx = camera.width  / 2 + (pale.x - camera.x) * camera.zoom * PARALLAX;
    const cy = camera.height / 2 + (pale.y - camera.y) * camera.zoom * PARALLAX;
    const r  = pale.radius * camera.zoom;

    // Cull if off-screen
    if (cx + r < 0 || cx - r > camera.width || cy + r < 0 || cy - r > camera.height) return;

    ctx.save();

    // Very faint body fill — just enough to read as a sphere, not a ring
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

    const alphas = [0.22, 0.28, 0.32, 0.24, 0.20];
    for (let ci = 0; ci < PALE_CONTOURS.length; ci++) {
      ctx.globalAlpha = alphas[ci];
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

    // Name label — always visible above the limb
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = PALE_ICE;
    ctx.globalAlpha = 0.50;
    ctx.fillText(pale.name.toUpperCase(), cx, cy - r - 10);

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  _renderGravewakeAtmosphere(camera) {
    const { ctx } = this;
    const zone = this._gravewakeZone;
    const dx = camera.x - zone.center.x;
    const dy = camera.y - zone.center.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Fade in over 1000 units inside zone boundary
    const fadeStart = zone.radius;
    const fadeEnd = zone.radius - 1000;
    const t = Math.max(0, Math.min(1, (fadeStart - dist) / (fadeStart - fadeEnd)));
    const maxAlpha = 0.6 * t;
    if (maxAlpha <= 0) return;

    ctx.save();
    ctx.strokeStyle = '#334455';
    ctx.lineWidth = 1;

    for (const frag of this._gravewakeFragments) {
      // Parallax offset
      const px = frag.wx - camera.x * frag.parallax * camera.zoom;
      const py = frag.wy - camera.y * frag.parallax * camera.zoom;

      // Wrap to screen
      const sw = camera.width;
      const sh = camera.height;
      const sx = ((px % sw) + sw) % sw;
      const sy = ((py % sh) + sh) % sh;

      ctx.globalAlpha = maxAlpha * 0.6;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(frag.angle);
      ctx.strokeRect(-frag.size, -frag.size * 0.3, frag.size * 2, frag.size * 0.6);
      ctx.restore();
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  _renderStarfield(camera) {
    const { ctx } = this;

    for (const layer of this.starLayers) {
      for (const star of layer.stars) {
        // Parallax: offset star position by a fraction of camera displacement from world origin
        const px = star.x - camera.x * layer.parallax * camera.zoom;
        const py = star.y - camera.y * layer.parallax * camera.zoom;

        // Wrap stars so they tile across the screen
        const sw = camera.width;
        const sh = camera.height;
        const sx = ((px % sw) + sw) % sw;
        const sy = ((py % sh) + sh) % sh;

        ctx.globalAlpha = star.opacity;
        ctx.fillStyle = star.tint;
        ctx.fillRect(sx, sy, layer.size, layer.size);
      }
    }
    ctx.globalAlpha = 1;
  }

  _renderScanlines(camera) {
    const { ctx } = this;
    ctx.fillStyle = 'rgba(0,0,0,0.07)';
    for (let y = 0; y < camera.height; y += 3) {
      ctx.fillRect(0, y, camera.width, 1);
    }
  }

  _renderVignette(camera) {
    const { ctx } = this;
    const cx = camera.width / 2;
    const cy = camera.height / 2;
    const r = Math.max(cx, cy) * 1.2;
    const grad = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, camera.width, camera.height);
  }

  _renderFlankWarning(camera) {
    const { ctx } = this;
    const w = camera.width;
    const h = camera.height;
    const pulse = 0.08 + Math.sin(Date.now() * 0.006) * 0.06;
    const edgeW = 60;

    ctx.save();
    // Left edge
    let grad = ctx.createLinearGradient(0, 0, edgeW, 0);
    grad.addColorStop(0, `rgba(255,170,0,${pulse})`);
    grad.addColorStop(1, 'rgba(255,170,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, edgeW, h);

    // Right edge
    grad = ctx.createLinearGradient(w - edgeW, 0, w, 0);
    grad.addColorStop(0, 'rgba(255,170,0,0)');
    grad.addColorStop(1, `rgba(255,170,0,${pulse})`);
    ctx.fillStyle = grad;
    ctx.fillRect(w - edgeW, 0, edgeW, h);

    // Top edge
    grad = ctx.createLinearGradient(0, 0, 0, edgeW);
    grad.addColorStop(0, `rgba(255,170,0,${pulse})`);
    grad.addColorStop(1, 'rgba(255,170,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, edgeW);

    // Bottom edge
    grad = ctx.createLinearGradient(0, h - edgeW, 0, h);
    grad.addColorStop(0, 'rgba(255,170,0,0)');
    grad.addColorStop(1, `rgba(255,170,0,${pulse})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, h - edgeW, w, edgeW);

    ctx.restore();
  }

  _renderHullWarning(camera, hullRatio) {
    const { ctx } = this;
    const w = camera.width;
    const h = camera.height;
    // Pulse faster as hull drops toward 0 — urgent at very low hull
    const urgency = 1 - hullRatio / 0.25;
    const pulseSpeed = 0.004 + urgency * 0.010;
    const basePulse = 0.07 + Math.sin(Date.now() * pulseSpeed) * 0.07;
    const alpha = basePulse * (0.5 + urgency * 0.7);
    const edgeW = 90;

    ctx.save();
    let grad;

    grad = ctx.createLinearGradient(0, 0, edgeW, 0);
    grad.addColorStop(0, `rgba(255,0,0,${alpha})`);
    grad.addColorStop(1, 'rgba(255,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, edgeW, h);

    grad = ctx.createLinearGradient(w - edgeW, 0, w, 0);
    grad.addColorStop(0, 'rgba(255,0,0,0)');
    grad.addColorStop(1, `rgba(255,0,0,${alpha})`);
    ctx.fillStyle = grad;
    ctx.fillRect(w - edgeW, 0, edgeW, h);

    grad = ctx.createLinearGradient(0, 0, 0, edgeW);
    grad.addColorStop(0, `rgba(255,0,0,${alpha})`);
    grad.addColorStop(1, 'rgba(255,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, edgeW);

    grad = ctx.createLinearGradient(0, h - edgeW, 0, h);
    grad.addColorStop(0, 'rgba(255,0,0,0)');
    grad.addColorStop(1, `rgba(255,0,0,${alpha})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, h - edgeW, w, edgeW);

    ctx.restore();
  }

  _renderWeaponRangeCircle(game, camera) {
    const { ctx } = this;
    const player = game.player;
    if (!player || !player.active) return;

    const primaries = player._primaryWeapons;
    const weapon = primaries.length > 0 ? primaries[player.primaryWeaponIdx] : null;
    if (!weapon || !weapon.maxRange) return;

    const center = camera.worldToScreen(player.x, player.y);
    const screenRadius = weapon.maxRange * camera.zoom;

    ctx.save();
    ctx.strokeStyle = RANGE_CIRCLE;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 8]);
    ctx.beginPath();
    ctx.arc(center.x, center.y, screenRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Flak: also draw blast-AoE ring at cursor position
    if (weapon.detonatesOnExpiry && weapon.blastRadius > 0) {
      const blastScreenRadius = weapon.blastRadius * camera.zoom;
      const mx = input.mouseScreen.x;
      const my = input.mouseScreen.y;
      ctx.beginPath();
      ctx.arc(mx, my, blastScreenRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.setLineDash([]);
    ctx.restore();
  }

  _renderBeams(game, camera) {
    const { ctx } = this;
    for (const entity of game.entities) {
      if (!entity.isShip) continue;
      for (const w of entity.weapons || []) {
        if (!w.isBeam || w._rampUp <= 0) continue;
        const t = Math.min(w._rampUp / w.rampTime, 1);
        const s = camera.worldToScreen(w._beamOriginX, w._beamOriginY);
        const e = camera.worldToScreen(w._beamEndX, w._beamEndY);
        ctx.save();
        ctx.lineCap = 'round';
        // Outer glow
        ctx.strokeStyle = '#00ffaa';
        ctx.lineWidth = (3 + t * 6) * camera.zoom;
        ctx.globalAlpha = 0.12 * t;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(e.x, e.y);
        ctx.stroke();
        // Mid glow
        ctx.strokeStyle = '#88ffdd';
        ctx.lineWidth = (1 + t * 2.5) * camera.zoom;
        ctx.globalAlpha = 0.5 + t * 0.3;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(e.x, e.y);
        ctx.stroke();
        // Bright core
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(0.5, t) * camera.zoom;
        ctx.globalAlpha = t;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(e.x, e.y);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.restore();
      }
    }
  }

  _renderEntities(entities, camera) {
    // Two-pass: scenery first, ships always on top
    for (const entity of entities) {
      if (!entity.active || entity.isShip) continue;
      const bounds = entity.getBounds();
      if (!camera.isVisible(bounds.x, bounds.y, bounds.radius + 64)) continue;
      entity.render(this.ctx, camera);
    }
    for (const entity of entities) {
      if (!entity.active || !entity.isShip) continue;
      const bounds = entity.getBounds();
      if (!camera.isVisible(bounds.x, bounds.y, bounds.radius + 64)) continue;
      entity.render(this.ctx, camera);
    }
  }
}
