export class Camera {
  constructor(width, height) {
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;
  }

  follow(target, dt) {
    const factor = 1 - Math.pow(1 - 0.08, dt * 60);
    this.x += (target.x - this.x) * factor;
    this.y += (target.y - this.y) * factor;
  }

  worldToScreen(wx, wy) {
    return {
      x: wx - this.x + this.width / 2,
      y: wy - this.y + this.height / 2,
    };
  }

  screenToWorld(sx, sy) {
    return {
      x: sx + this.x - this.width / 2,
      y: sy + this.y - this.height / 2,
    };
  }

  isVisible(wx, wy, margin = 0) {
    const s = this.worldToScreen(wx, wy);
    return (
      s.x >= -margin &&
      s.x <= this.width + margin &&
      s.y >= -margin &&
      s.y <= this.height + margin
    );
  }
}
