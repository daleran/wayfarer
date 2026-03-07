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
  }

  _renderStarfield(camera) {
    const { ctx } = this;

    for (const layer of this.starLayers) {
      ctx.fillStyle = '#fff';

      for (const star of layer.stars) {
        // Parallax: offset star position by a fraction of camera displacement from world origin
        const px = star.x - camera.x * layer.parallax;
        const py = star.y - camera.y * layer.parallax;

        // Wrap stars so they tile across the screen
        const sw = camera.width;
        const sh = camera.height;
        const sx = ((px % sw) + sw) % sw;
        const sy = ((py % sh) + sh) % sh;

        ctx.fillRect(sx, sy, layer.size, layer.size);
      }
    }
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
