import { GREEN, RED } from './ui/colors.js';
import { input } from './input.js';

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
    this._renderBeams(game, camera);
    game.particlePool.render(ctx, camera);
    game.hud.render(ctx, game);

    // Flank speed warning — pulsing amber edge glow
    if (game.player && game.player.throttleLevel === 5) {
      this._renderFlankWarning(camera);
    }

    // CRT post-processing
    this._renderScanlines(camera);
    this._renderVignette(camera);

    // Crosshair cursor — always on top
    this._renderCrosshair(game, camera);
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
    const screen = camera.worldToScreen(pale.x, pale.y);
    const cx = screen.x;
    const cy = screen.y;
    const r = pale.radius * camera.zoom;

    ctx.save();

    // Outer atmospheric halo — proportional to radius
    ctx.strokeStyle = pale.colorAtmo;
    ctx.beginPath();
    ctx.arc(cx, cy, r + r * 0.036, 0, Math.PI * 2);
    ctx.lineWidth = r * 0.033;
    ctx.globalAlpha = 0.12;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, r + r * 0.010, 0, Math.PI * 2);
    ctx.lineWidth = r * 0.012;
    ctx.globalAlpha = 0.18;
    ctx.stroke();

    // Planet body
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = pale.colorAtmo;
    ctx.globalAlpha = 0.48;
    ctx.fill();

    // Cloud band striations at fractional radii
    ctx.strokeStyle = pale.colorLimb;
    ctx.lineWidth = Math.max(1.5, r * 0.006);
    ctx.globalAlpha = 0.1;
    for (const frac of [0.98, 0.95, 0.91, 0.87]) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * frac, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Limb outline — solid bright edge
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = pale.colorLimb;
    ctx.lineWidth = 2.5;
    ctx.globalAlpha = 0.8;
    ctx.stroke();

    // Name label (only visible when near the limb)
    const distToEdge = Math.sqrt(
      (camera.x - pale.x) ** 2 + (camera.y - pale.y) ** 2
    ) - pale.radius;
    if (distToEdge < pale.radius * 0.33) {
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = pale.colorLimb;
      ctx.globalAlpha = Math.max(0, 1 - distToEdge / (r * 0.33)) * 0.5;
      ctx.fillText(pale.name.toUpperCase(), cx, cy - r + 20);
    }

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
