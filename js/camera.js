export class Camera {
  constructor(width, height) {
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;
    this.zoom = 0.44;
    this._targetZoom = this.zoom;
    this._zoomMin = 0.2;
    this._zoomMax = 4.0;
  }

  follow(target, dt) {
    const factor = 1 - Math.pow(1 - 0.08, dt * 60);
    this.x += (target.x - this.x) * factor;
    this.y += (target.y - this.y) * factor;
  }

  /** Set a world-space position to smoothly pan toward. */
  panTo(x, y) {
    this._panTargetX = x;
    this._panTargetY = y;
  }

  /** Advance the pan lerp each frame. */
  updatePan(dt) {
    if (this._panTargetX == null) return;
    const factor = 1 - Math.pow(1 - 0.12, dt * 60);
    this.x += (this._panTargetX - this.x) * factor;
    this.y += (this._panTargetY - this.y) * factor;
  }

  /** Cancel any active pan target. */
  clearPan() {
    this._panTargetX = null;
    this._panTargetY = null;
  }

  applyWheel(wheelDelta) {
    if (wheelDelta === 0) return;
    this._targetZoom *= 1 - wheelDelta * 0.001;
    this._targetZoom = Math.max(this._zoomMin, Math.min(this._zoomMax, this._targetZoom));
  }

  updateZoom(dt) {
    const factor = 1 - Math.pow(1 - 0.15, dt * 60);
    this.zoom += (this._targetZoom - this.zoom) * factor;
  }

  /** Smoothly transition to a cinematic zoom level, saving the previous target for restore. */
  pushZoom(level) {
    if (this._savedZoom == null) {
      this._savedZoom = this._targetZoom;
    }
    this._targetZoom = Math.max(this._zoomMin, Math.min(this._zoomMax, level));
  }

  /** Restore the zoom level saved by pushZoom. */
  popZoom() {
    if (this._savedZoom != null) {
      this._targetZoom = this._savedZoom;
      this._savedZoom = null;
    }
  }

  worldToScreen(wx, wy) {
    return {
      x: (wx - this.x) * this.zoom + this.width / 2,
      y: (wy - this.y) * this.zoom + this.height / 2,
    };
  }

  screenToWorld(sx, sy) {
    return {
      x: (sx - this.width / 2) / this.zoom + this.x,
      y: (sy - this.height / 2) / this.zoom + this.y,
    };
  }

  isVisible(wx, wy, margin = 0) {
    const s = this.worldToScreen(wx, wy);
    const m = margin * this.zoom;
    return (
      s.x >= -m &&
      s.x <= this.width + m &&
      s.y >= -m &&
      s.y <= this.height + m
    );
  }
}
