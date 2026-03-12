/**
 * Drawing API — reusable canvas primitives for ship/entity rendering.
 *
 * Two layers:
 *   1. Immediate utilities — standalone functions, take ctx as first arg.
 *   2. DrawBatch — deferred rendering that groups by style to reduce state changes.
 */

const TWO_PI = Math.PI * 2;

// ── Immediate utilities ─────────────────────────────────────────────────────

/** Trace a closed polygon path (no fill/stroke). */
function _tracePoly(ctx, points) {
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.closePath();
}

/** Filled + stroked polygon. */
export function polygon(ctx, points, fill, stroke, lineWidth = 1.5) {
  ctx.beginPath();
  _tracePoly(ctx, points);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

/** Fill-only polygon with optional alpha. */
export function polygonFill(ctx, points, fill, alpha = 1) {
  ctx.beginPath();
  _tracePoly(ctx, points);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.globalAlpha = 1;
}

/** Stroke-only polygon with optional alpha. */
export function polygonStroke(ctx, points, stroke, lineWidth = 1, alpha = 1) {
  ctx.beginPath();
  _tracePoly(ctx, points);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.globalAlpha = alpha;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/** Single line segment. */
export function line(ctx, x1, y1, x2, y2, stroke, lineWidth = 1, alpha = 1) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.globalAlpha = alpha;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/** Batch line segments sharing one style into a single beginPath/stroke.
 *  segments = [[{x,y},{x,y}], ...] */
export function lines(ctx, segments, stroke, lineWidth = 1, alpha = 1) {
  ctx.beginPath();
  for (const seg of segments) {
    ctx.moveTo(seg[0].x, seg[0].y);
    ctx.lineTo(seg[1].x, seg[1].y);
  }
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.globalAlpha = alpha;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/** Filled circle. */
export function disc(ctx, x, y, r, fill, alpha = 1) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TWO_PI);
  ctx.fillStyle = fill;
  ctx.globalAlpha = alpha;
  ctx.fill();
  ctx.globalAlpha = 1;
}

/** Stroked circle. */
export function ring(ctx, x, y, r, stroke, lineWidth = 1, alpha = 1) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TWO_PI);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.globalAlpha = alpha;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/** Fading engine/projectile trail — quantizes into ~8 alpha bands to reduce
 *  state changes vs per-segment alpha.
 *  screenPoints = [{x,y}, ...] already in screen space. */
export function trail(ctx, screenPoints, color, maxAlpha = 0.6, maxWidth = 2.5) {
  const len = screenPoints.length;
  if (len < 2) return;

  const BANDS = 8;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = color;

  // Group segments into alpha bands
  for (let band = 0; band < BANDS; band++) {
    const bandStart = band / BANDS;
    const bandEnd = (band + 1) / BANDS;
    const bandAlpha = ((bandStart + bandEnd) * 0.5) * maxAlpha;
    const bandWidth = 1 + ((bandStart + bandEnd) * 0.5) * (maxWidth - 1);

    ctx.globalAlpha = bandAlpha;
    ctx.lineWidth = bandWidth;
    ctx.beginPath();

    let hasSegment = false;
    for (let i = 1; i < len; i++) {
      const t = i / len;
      if (t >= bandStart && t < bandEnd) {
        ctx.moveTo(screenPoints[i - 1].x, screenPoints[i - 1].y);
        ctx.lineTo(screenPoints[i].x, screenPoints[i].y);
        hasSegment = true;
      }
    }

    if (hasSegment) ctx.stroke();
  }

  ctx.restore();
}

/** Sine-based pulse oscillation value. */
export function pulse(freq = 0.008, min = 0.6, max = 1.0) {
  const range = max - min;
  return min + (0.5 + Math.sin(Date.now() * freq) * 0.5) * range;
}

/** Engine glow — moved from js/systems/engineGlow.js.
 *  Draws inner ring + pulsing outer ring per engine position. */
export function engineGlow(ctx, positions, color, baseRadius, outerOffset, outerScale, outerAlpha) {
  const p = 0.6 + Math.sin(Date.now() * 0.008) * 0.4;
  for (const pos of positions) {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, baseRadius, 0, TWO_PI);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = p;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, baseRadius + outerOffset + p * outerScale, 0, TWO_PI);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = p * outerAlpha;
    ctx.stroke();

    ctx.globalAlpha = 1;
  }
}

// ── Shape ───────────────────────────────────────────────────────────────────

/**
 * Composable geometry template. Define points once, stamp with transforms.
 *
 * Transform methods return a new lightweight points array (not a new Shape),
 * so chaining is cheap. Canonical points are defined once at module load.
 *
 *   const NACELLE = new Shape([
 *     { x: -3, y: -4 }, { x: 3, y: -4 },
 *     { x: 4, y: -3 },  { x: 4, y: 5 },
 *     { x: -4, y: 5 },  { x: -4, y: -3 },
 *   ]);
 *   NACELLE.at(-8, 2).fill(ctx, color);
 *   NACELLE.flipX().at(8, 2).fill(ctx, color);
 */
export class Shape {
  constructor(points) {
    this.points = points;
  }

  // ── Factories for common shapes ──────────────────────────────────────────

  /** Axis-aligned rectangle centered on origin. */
  static rect(w, h) {
    const hw = w / 2, hh = h / 2;
    return new Shape([
      { x: -hw, y: -hh }, { x: hw, y: -hh },
      { x: hw, y: hh },   { x: -hw, y: hh },
    ]);
  }

  /** Rectangle with corners chamfered by `c` pixels. */
  static chamferedRect(w, h, c) {
    const hw = w / 2, hh = h / 2;
    return new Shape([
      { x: -hw + c, y: -hh },     // top edge
      { x:  hw - c, y: -hh },
      { x:  hw,     y: -hh + c },  // right edge
      { x:  hw,     y:  hh - c },
      { x:  hw - c, y:  hh },      // bottom edge
      { x: -hw + c, y:  hh },
      { x: -hw,     y:  hh - c },  // left edge
      { x: -hw,     y: -hh + c },
    ]);
  }

  /** Regular n-gon centered on origin with given radius. */
  static ngon(n, radius) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const angle = (TWO_PI * i) / n - Math.PI / 2; // start pointing up
      pts.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
    }
    return new Shape(pts);
  }

  // ── Transform methods (return TransformedShape for chaining) ─────────────

  /** Translate. */
  at(tx, ty) {
    return new TransformedShape(this.points, tx, ty, 1, 1, 0);
  }

  /** Scale uniformly or non-uniformly (around origin). */
  scaled(sx, sy) {
    return new TransformedShape(this.points, 0, 0, sx, sy ?? sx, 0);
  }

  /** Rotate in radians (around origin). */
  rotated(angle) {
    return new TransformedShape(this.points, 0, 0, 1, 1, angle);
  }

  /** Mirror across Y axis (flip horizontal). */
  flipX() {
    return new TransformedShape(this.points, 0, 0, -1, 1, 0);
  }

  /** Mirror across X axis (flip vertical). */
  flipY() {
    return new TransformedShape(this.points, 0, 0, 1, -1, 0);
  }

  /** Bake current points into a plain array (for use as hull points, etc). */
  bake() {
    return this.points.map(p => ({ x: p.x, y: p.y }));
  }

  // ── Immediate draw methods ───────────────────────────────────────────────

  fill(ctx, fillStyle, alpha = 1) {
    polygonFill(ctx, this.points, fillStyle, alpha);
  }

  stroke(ctx, strokeStyle, lineWidth = 1, alpha = 1) {
    polygonStroke(ctx, this.points, strokeStyle, lineWidth, alpha);
  }

  draw(ctx, fillStyle, strokeStyle, lineWidth = 1.5, alpha = 1) {
    ctx.globalAlpha = alpha;
    polygon(ctx, this.points, fillStyle, strokeStyle, lineWidth);
    ctx.globalAlpha = 1;
  }

  // ── Batch draw methods ───────────────────────────────────────────────────

  batchFill(batch, fill, alpha = 1) {
    batch.fillPoly(this.points, fill, alpha);
  }

  batchStroke(batch, stroke, lineWidth = 1.5, alpha = 1) {
    batch.strokePoly(this.points, stroke, lineWidth, alpha);
  }

  batchDraw(batch, fill, stroke, lineWidth = 1.5, alpha = 1) {
    batch.poly(this.points, fill, stroke, lineWidth, alpha);
  }
}

/**
 * Lazily-transformed shape. Computes transformed points on first access,
 * then caches. Supports chaining transforms before drawing.
 */
class TransformedShape extends Shape {
  constructor(srcPoints, tx, ty, sx, sy, angle) {
    super(null);
    this._src = srcPoints;
    this._tx = tx;
    this._ty = ty;
    this._sx = sx;
    this._sy = sy;
    this._angle = angle;
    this._resolved = null;
  }

  get points() {
    if (!this._resolved) {
      this._resolved = _transformPoints(
        this._src, this._tx, this._ty, this._sx, this._sy, this._angle
      );
    }
    return this._resolved;
  }

  set points(_) { /* ignore — points are computed */ }

  // Override transform methods to chain: apply new transform on top of resolved points
  at(tx, ty) {
    return new TransformedShape(this.points, tx, ty, 1, 1, 0);
  }

  scaled(sx, sy) {
    return new TransformedShape(this.points, 0, 0, sx, sy ?? sx, 0);
  }

  rotated(angle) {
    return new TransformedShape(this.points, 0, 0, 1, 1, angle);
  }

  flipX() {
    return new TransformedShape(this.points, 0, 0, -1, 1, 0);
  }

  flipY() {
    return new TransformedShape(this.points, 0, 0, 1, -1, 0);
  }
}

/** Apply scale → rotate → translate to a points array. */
function _transformPoints(pts, tx, ty, sx, sy, angle) {
  if (sx === 1 && sy === 1 && angle === 0) {
    // Fast path: translate only
    if (tx === 0 && ty === 0) return pts;
    const out = new Array(pts.length);
    for (let i = 0; i < pts.length; i++) {
      out[i] = { x: pts[i].x + tx, y: pts[i].y + ty };
    }
    return out;
  }

  const cos = angle !== 0 ? Math.cos(angle) : 1;
  const sin = angle !== 0 ? Math.sin(angle) : 0;
  const out = new Array(pts.length);
  for (let i = 0; i < pts.length; i++) {
    // Scale
    let x = pts[i].x * sx;
    let y = pts[i].y * sy;
    // Rotate
    if (angle !== 0) {
      const rx = x * cos - y * sin;
      const ry = x * sin + y * cos;
      x = rx;
      y = ry;
    }
    // Translate
    out[i] = { x: x + tx, y: y + ty };
  }
  return out;
}

// ── DrawBatch ───────────────────────────────────────────────────────────────

/** Quantize alpha to 16 bands for grouping. */
function _alphaKey(alpha) {
  return Math.round(alpha * 15);
}

/** Style key for grouping draw calls. */
function _styleKey(type, color, lineWidth, alphaKey) {
  return `${type}|${color}|${lineWidth}|${alphaKey}`;
}

/**
 * Deferred draw-call batcher. Accumulates primitives, then flush() groups them
 * by (type, style, lineWidth, alphaQuantized) to minimize canvas state changes.
 */
export class DrawBatch {
  constructor(ctx) {
    this._ctx = ctx;
    this._groups = new Map();  // styleKey → { type, color, lineWidth, alpha, ops[] }
  }

  _getGroup(type, color, lineWidth, alpha) {
    const ak = _alphaKey(alpha);
    const key = _styleKey(type, color, lineWidth, ak);
    let group = this._groups.get(key);
    if (!group) {
      group = { type, color, lineWidth, alpha: ak / 15, ops: [] };
      this._groups.set(key, group);
    }
    return group;
  }

  fillPoly(points, fill, alpha = 1) {
    this._getGroup('fillPoly', fill, 0, alpha).ops.push(points);
  }

  strokePoly(points, stroke, lineWidth = 1.5, alpha = 1) {
    this._getGroup('strokePoly', stroke, lineWidth, alpha).ops.push(points);
  }

  poly(points, fill, stroke, lineWidth = 1.5, alpha = 1) {
    this.fillPoly(points, fill, alpha);
    this.strokePoly(points, stroke, lineWidth, alpha);
  }

  line(x1, y1, x2, y2, stroke, lineWidth = 1, alpha = 1) {
    this._getGroup('line', stroke, lineWidth, alpha).ops.push({ x1, y1, x2, y2 });
  }

  disc(x, y, r, fill, alpha = 1) {
    this._getGroup('disc', fill, 0, alpha).ops.push({ x, y, r });
  }

  ring(x, y, r, stroke, lineWidth = 1, alpha = 1) {
    this._getGroup('ring', stroke, lineWidth, alpha).ops.push({ x, y, r });
  }

  rect(x, y, w, h, fill, stroke, lineWidth = 1, alpha = 1) {
    if (fill) this._getGroup('fillRect', fill, 0, alpha).ops.push({ x, y, w, h });
    if (stroke) this._getGroup('strokeRect', stroke, lineWidth, alpha).ops.push({ x, y, w, h });
  }

  /** Flush all accumulated primitives, grouped by style. */
  flush() {
    const ctx = this._ctx;
    for (const group of this._groups.values()) {
      const { type, color, lineWidth, alpha, ops } = group;
      if (ops.length === 0) continue;

      ctx.globalAlpha = alpha;

      switch (type) {
        case 'disc': {
          ctx.fillStyle = color;
          ctx.beginPath();
          for (const op of ops) {
            ctx.moveTo(op.x + op.r, op.y);
            ctx.arc(op.x, op.y, op.r, 0, TWO_PI);
          }
          ctx.fill();
          break;
        }

        case 'ring': {
          ctx.strokeStyle = color;
          ctx.lineWidth = lineWidth;
          ctx.beginPath();
          for (const op of ops) {
            ctx.moveTo(op.x + op.r, op.y);
            ctx.arc(op.x, op.y, op.r, 0, TWO_PI);
          }
          ctx.stroke();
          break;
        }

        case 'fillPoly': {
          ctx.fillStyle = color;
          ctx.beginPath();
          for (const points of ops) {
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
            ctx.closePath();
          }
          ctx.fill();
          break;
        }

        case 'strokePoly': {
          ctx.strokeStyle = color;
          ctx.lineWidth = lineWidth;
          ctx.beginPath();
          for (const points of ops) {
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
            ctx.closePath();
          }
          ctx.stroke();
          break;
        }

        case 'line': {
          ctx.strokeStyle = color;
          ctx.lineWidth = lineWidth;
          ctx.beginPath();
          for (const op of ops) {
            ctx.moveTo(op.x1, op.y1);
            ctx.lineTo(op.x2, op.y2);
          }
          ctx.stroke();
          break;
        }

        case 'fillRect': {
          ctx.fillStyle = color;
          for (const op of ops) {
            ctx.fillRect(op.x, op.y, op.w, op.h);
          }
          break;
        }

        case 'strokeRect': {
          ctx.strokeStyle = color;
          ctx.lineWidth = lineWidth;
          for (const op of ops) {
            ctx.strokeRect(op.x, op.y, op.w, op.h);
          }
          break;
        }
      }
    }

    ctx.globalAlpha = 1;
    this._groups.clear();
  }
}
