export class Entity {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.rotation = 0; // radians; 0 = pointing up (north)
    this.active = true;
  }

  update(_dt) {
    // Override in subclasses
  }

  render(_ctx, _camera) {
    // Override in subclasses
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 0 };
  }

  // Called once when this entity is destroyed. Override in subclasses.
  onDestroy() {}
}
