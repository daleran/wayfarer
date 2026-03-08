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
    game.particlePool.render(ctx, camera);
    game.hud.render(ctx, game);

    // Flank speed warning — pulsing amber edge glow
    if (game.player && game.player.throttleLevel === 5) {
      this._renderFlankWarning(camera);
    }

    // CRT post-processing
    this._renderScanlines(camera);
    this._renderVignette(camera);
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
    const r = pale.radius;

    ctx.save();

    // Outer atmospheric halo — light, transparent (colorAtmo)
    ctx.strokeStyle = pale.colorAtmo;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 320, 0, Math.PI * 2);
    ctx.lineWidth = 300;
    ctx.globalAlpha = 0.12;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, r + 90, 0, Math.PI * 2);
    ctx.lineWidth = 110;
    ctx.globalAlpha = 0.18;
    ctx.stroke();

    // Planet body — more opaque than before but still translucent
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = pale.colorAtmo;
    ctx.globalAlpha = 0.48;
    ctx.fill();

    // Cloud band striations (slightly more visible)
    ctx.strokeStyle = pale.colorLimb;
    ctx.lineWidth = 55;
    ctx.globalAlpha = 0.1;
    for (const offset of [-1800, -800, +400, +1600]) {
      ctx.beginPath();
      ctx.arc(cx, cy, r - Math.abs(offset) * 0.12, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Limb outline — solid bright edge
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = pale.colorLimb;
    ctx.lineWidth = 2.5;
    ctx.globalAlpha = 0.8;
    ctx.stroke();

    // Name label (only visible when limb is close to camera)
    const distToEdge = Math.sqrt(
      (camera.x - pale.x) ** 2 + (camera.y - pale.y) ** 2
    ) - pale.radius;
    if (distToEdge < 3000) {
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = pale.colorLimb;
      ctx.globalAlpha = Math.max(0, 1 - distToEdge / 3000) * 0.5;
      ctx.fillText(pale.name.toUpperCase(), cx, cy - r + 60);
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
      const px = frag.wx - camera.x * frag.parallax;
      const py = frag.wy - camera.y * frag.parallax;

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
        const px = star.x - camera.x * layer.parallax;
        const py = star.y - camera.y * layer.parallax;

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

  _renderEntities(entities, camera) {
    for (const entity of entities) {
      if (!entity.active) continue;
      const bounds = entity.getBounds();
      if (!camera.isVisible(bounds.x, bounds.y, bounds.radius + 64)) continue;
      entity.render(this.ctx, camera);
    }
  }
}
