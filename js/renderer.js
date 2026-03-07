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
  constructor(ctx, mapSize) {
    this.ctx = ctx;
    this.mapSize = mapSize;

    // Generate star layers
    this.starLayers = STAR_LAYERS.map((cfg) => ({
      stars: generateStars(cfg.count, mapSize.width, mapSize.height),
      parallax: cfg.parallax,
      size: cfg.size,
    }));
  }

  render(game) {
    const { ctx } = this;
    const { camera, entities } = game;

    // Clear
    ctx.clearRect(0, 0, camera.width, camera.height);
    ctx.fillStyle = '#000005';
    ctx.fillRect(0, 0, camera.width, camera.height);

    this._renderStarfield(camera);
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
