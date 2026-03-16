import { registerData, registerContent, ENGINES } from '../dataRegistry.js';
import { EngineModule } from '@/modules/shipModule.js';

// ── Engine subclasses with custom drawAtMount visuals ────────────────────────

class VintageMagplasmaSmall extends EngineModule {
  constructor() {
    super('vintage-magplasma-s');
  }
  drawAtMount(ctx, color, alpha) {
    // Nozzle — small rect at top (exhaust port)
    const nozzle = [
      { x: -1.5, y: -7 },
      { x: 1.5, y: -7 },
      { x: 1.5, y: -5 },
      { x: -1.5, y: -5 },
    ];
    ctx.beginPath();
    ctx.moveTo(nozzle[0].x, nozzle[0].y);
    for (let i = 1; i < nozzle.length; i++) ctx.lineTo(nozzle[i].x, nozzle[i].y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha * 0.4;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.8;
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = color;
    ctx.stroke();

    // Coil housing — large square body with 4 vertical bars (magnetic coils)
    const body = [
      { x: -3.5, y: -5 },
      { x: 3.5, y: -5 },
      { x: 3.5, y: 3 },
      { x: -3.5, y: 3 },
    ];
    ctx.beginPath();
    ctx.moveTo(body[0].x, body[0].y);
    for (let i = 1; i < body.length; i++) ctx.lineTo(body[i].x, body[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.3;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.8;
    ctx.stroke();

    // 4 vertical bars inside the housing
    ctx.lineWidth = 0.4;
    for (const bx of [-2, -0.7, 0.7, 2]) {
      ctx.beginPath();
      ctx.moveTo(bx, -4);
      ctx.lineTo(bx, 2);
      ctx.globalAlpha = alpha * 0.6;
      ctx.stroke();
    }

    // Intake bell — trapezoid, wider at top narrowing toward bottom
    const bell = [
      { x: -3.5, y: 3.5 },
      { x: 3.5, y: 3.5 },
      { x: 2, y: 8 },
      { x: -2, y: 8 },
    ];
    ctx.beginPath();
    ctx.moveTo(bell[0].x, bell[0].y);
    for (let i = 1; i < bell.length; i++) ctx.lineTo(bell[i].x, bell[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.4;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.8;
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

class VintageMagplasmaLarge extends EngineModule {
  constructor() {
    super('vintage-magplasma-l');
  }
  drawAtMount(ctx, color, alpha) {
    // Twin nozzles at top (dual exhaust ports)
    for (const nx of [-3.5, 3.5]) {
      const nozzle = [
        { x: nx - 1.8, y: -8 },
        { x: nx + 1.8, y: -8 },
        { x: nx + 1.8, y: -5.5 },
        { x: nx - 1.8, y: -5.5 },
      ];
      ctx.beginPath();
      ctx.moveTo(nozzle[0].x, nozzle[0].y);
      for (let i = 1; i < nozzle.length; i++) ctx.lineTo(nozzle[i].x, nozzle[i].y);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha * 0.4;
      ctx.fill();
      ctx.globalAlpha = alpha * 0.8;
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = color;
      ctx.stroke();

      // Inner nozzle detail line
      ctx.lineWidth = 0.3;
      ctx.beginPath();
      ctx.moveTo(nx, -7.5);
      ctx.lineTo(nx, -5.8);
      ctx.globalAlpha = alpha * 0.5;
      ctx.stroke();
    }

    // Upper flange — wide collar between nozzles and coil housing
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(-7, -5.5);
    ctx.lineTo(7, -5.5);
    ctx.lineTo(7, -4.5);
    ctx.lineTo(-7, -4.5);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.5;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.8;
    ctx.stroke();

    // Flange bolt dots
    for (const bx of [-5.5, -3, -0.5, 2, 4.5]) {
      ctx.beginPath();
      ctx.arc(bx, -5, 0.35, 0, Math.PI * 2);
      ctx.globalAlpha = alpha * 0.4;
      ctx.fill();
    }

    // Coil housing — large rectangular body filling mount width
    const body = [
      { x: -7, y: -4.5 },
      { x: 7, y: -4.5 },
      { x: 7, y: 6 },
      { x: -7, y: 6 },
    ];
    ctx.beginPath();
    ctx.moveTo(body[0].x, body[0].y);
    for (let i = 1; i < body.length; i++) ctx.lineTo(body[i].x, body[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.3;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.8;
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // 8 vertical bars (magnetic coils)
    ctx.lineWidth = 0.45;
    for (const bx of [-5.5, -4, -2.5, -1, 1, 2.5, 4, 5.5]) {
      ctx.beginPath();
      ctx.moveTo(bx, -3.5);
      ctx.lineTo(bx, 5);
      ctx.globalAlpha = alpha * 0.55;
      ctx.stroke();
    }

    // 4 horizontal cross-bars (coil bracing)
    ctx.lineWidth = 0.35;
    for (const by of [-2.5, -0.5, 1.5, 3.5]) {
      ctx.beginPath();
      ctx.moveTo(-6, by);
      ctx.lineTo(6, by);
      ctx.globalAlpha = alpha * 0.35;
      ctx.stroke();
    }

    // Lower flange — wide collar between housing and intake bell
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(-8, 6.5);
    ctx.lineTo(8, 6.5);
    ctx.lineTo(8, 8);
    ctx.lineTo(-8, 8);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.5;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.8;
    ctx.stroke();

    // Lower flange bolt line
    ctx.lineWidth = 0.3;
    for (const bx of [-6.5, -4.5, -2.5, -0.5, 1.5, 3.5, 5.5]) {
      ctx.beginPath();
      ctx.arc(bx, 7.25, 0.35, 0, Math.PI * 2);
      ctx.globalAlpha = alpha * 0.4;
      ctx.fill();
    }

    // Intake bell — extends well beyond mount box, narrowing downward
    const bell = [
      { x: -7, y: 8.5 },
      { x: 7, y: 8.5 },
      { x: 3.5, y: 20 },
      { x: -3.5, y: 20 },
    ];
    ctx.beginPath();
    ctx.moveTo(bell[0].x, bell[0].y);
    for (let i = 1; i < bell.length; i++) ctx.lineTo(bell[i].x, bell[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.4;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.8;
    ctx.lineWidth = 0.7;
    ctx.stroke();

    // Inner bell vanes (5 flow guides converging inward)
    ctx.lineWidth = 0.35;
    for (const vx of [-4.5, -2, 0, 2, 4.5]) {
      ctx.beginPath();
      ctx.moveTo(vx, 9);
      ctx.lineTo(vx * 0.5, 19.5);
      ctx.globalAlpha = alpha * 0.3;
      ctx.stroke();
    }

    // Bell circumferential rings
    ctx.lineWidth = 0.3;
    for (const t of [0.25, 0.55, 0.8]) {
      const y = 8.5 + t * 11.5;
      const halfTop = 7;
      const halfBot = 3.5;
      const halfW = halfTop + t * (halfBot - halfTop);
      ctx.beginPath();
      ctx.moveTo(-halfW, y);
      ctx.lineTo(halfW, y);
      ctx.globalAlpha = alpha * 0.2;
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }
}

class MakeshiftThermalModule extends EngineModule {
  constructor() {
    super('makeshift-thermal-s');
  }
  drawAtMount(ctx, color, alpha) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    // Main housing — asymmetric, lopsided box (wider on left)
    const housing = [
      { x: -1.8, y: -3 },
      { x: -3.2, y: -1.5 },
      { x: -3.5, y: 3.5 },
      { x: 2.8, y: 3 },
      { x: 3, y: -0.5 },
      { x: 2, y: -2.5 },
    ];
    ctx.beginPath();
    ctx.moveTo(housing[0].x, housing[0].y);
    for (let i = 1; i < housing.length; i++) ctx.lineTo(housing[i].x, housing[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.35;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.8;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Patch plate — welded-on rectangle at a slight angle
    const patch = [
      { x: -2.5, y: -1 },
      { x: 0.5, y: -1.3 },
      { x: 0.8, y: 1.2 },
      { x: -2.2, y: 1.5 },
    ];
    ctx.beginPath();
    ctx.moveTo(patch[0].x, patch[0].y);
    for (let i = 1; i < patch.length; i++) ctx.lineTo(patch[i].x, patch[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.2;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.6;
    ctx.lineWidth = 0.4;
    ctx.stroke();

    // Scattered bolts — irregular placement
    ctx.globalAlpha = alpha * 0.6;
    for (const [bx, by] of [
      [-2.5, -2], [1.5, -1.8], [-2.8, 2.5], [2, 2.2],
      [-1, 0.3], [1.8, 0.5], [-0.5, -1.2],
    ]) {
      ctx.beginPath();
      ctx.arc(bx, by, 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    // Bracket stub — one side only (asymmetric mounting)
    ctx.beginPath();
    ctx.rect(-3.5, 0.5, -1.5, 2);
    ctx.globalAlpha = alpha * 0.4;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.7;
    ctx.lineWidth = 0.4;
    ctx.stroke();

    // Bell nozzle — straight flare, but rough
    const bell = [
      { x: -2.2, y: 4 },
      { x: 2.2, y: 4 },
      { x: 3.3, y: 9.5 },
      { x: -3.3, y: 9.5 },
    ];
    ctx.beginPath();
    ctx.moveTo(bell[0].x, bell[0].y);
    for (let i = 1; i < bell.length; i++) ctx.lineTo(bell[i].x, bell[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.4;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.8;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Weld seam across the bell (visible repair)
    ctx.beginPath();
    ctx.moveTo(-2.5, 6);
    ctx.lineTo(-0.5, 6.3);
    ctx.lineTo(1, 5.8);
    ctx.lineTo(2.5, 6.2);
    ctx.globalAlpha = alpha * 0.4;
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // Dent mark on bell — short diagonal scratch
    ctx.beginPath();
    ctx.moveTo(1.5, 7.5);
    ctx.lineTo(2.5, 8.2);
    ctx.globalAlpha = alpha * 0.3;
    ctx.lineWidth = 0.4;
    ctx.stroke();

    ctx.globalAlpha = 1;
  }
}

class StandardRocketSmall extends EngineModule {
  constructor() {
    super('standard-rocket-s');
  }
  drawAtMount(ctx, color, alpha) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    // Chamfered housing box
    const housing = [
      { x: -2.2, y: -2 },
      { x: -3, y: -1 },
      { x: -3, y: 3 },
      { x: 3, y: 3 },
      { x: 3, y: -1 },
      { x: 2.2, y: -2 },
    ];
    ctx.beginPath();
    ctx.moveTo(housing[0].x, housing[0].y);
    for (let i = 1; i < housing.length; i++) ctx.lineTo(housing[i].x, housing[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.4;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.8;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Single bracing line
    ctx.lineWidth = 0.3;
    ctx.beginPath();
    ctx.moveTo(-2.5, 0.5);
    ctx.lineTo(2.5, 0.5);
    ctx.globalAlpha = alpha * 0.3;
    ctx.stroke();

    // Bell nozzle
    const bell = [
      { x: -2, y: 3.5 },
      { x: 2, y: 3.5 },
      { x: 3.3, y: 9.5 },
      { x: -3.3, y: 9.5 },
    ];
    ctx.beginPath();
    ctx.moveTo(bell[0].x, bell[0].y);
    for (let i = 1; i < bell.length; i++) ctx.lineTo(bell[i].x, bell[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.45;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.8;
    ctx.lineWidth = 0.6;
    ctx.stroke();

    ctx.globalAlpha = 1;
  }
}

class StandardRocketLarge extends EngineModule {
  constructor() {
    super('standard-rocket-l');
  }
  drawAtMount(ctx, color, alpha) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    // Chamfered housing box — fills large mount
    const housing = [
      { x: -5, y: -7 },
      { x: -7, y: -4 },
      { x: -7, y: 5 },
      { x: 7, y: 5 },
      { x: 7, y: -4 },
      { x: 5, y: -7 },
    ];
    ctx.beginPath();
    ctx.moveTo(housing[0].x, housing[0].y);
    for (let i = 1; i < housing.length; i++) ctx.lineTo(housing[i].x, housing[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.4;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.8;
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // Two bracing lines
    ctx.lineWidth = 0.35;
    for (const by of [-1, 3]) {
      ctx.beginPath();
      ctx.moveTo(-6, by);
      ctx.lineTo(6, by);
      ctx.globalAlpha = alpha * 0.3;
      ctx.stroke();
    }

    // Bell nozzle — extends beyond mount box
    const bell = [
      { x: -5, y: 5.5 },
      { x: 5, y: 5.5 },
      { x: 8, y: 20 },
      { x: -8, y: 20 },
    ];
    ctx.beginPath();
    ctx.moveTo(bell[0].x, bell[0].y);
    for (let i = 1; i < bell.length; i++) ctx.lineTo(bell[i].x, bell[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.4;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.8;
    ctx.lineWidth = 0.7;
    ctx.stroke();

    // Single center rib
    ctx.lineWidth = 0.3;
    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.lineTo(0, 19.5);
    ctx.globalAlpha = alpha * 0.25;
    ctx.stroke();

    ctx.globalAlpha = 1;
  }
}

class CruisingIonSmall extends EngineModule {
  constructor() {
    super('cruising-ion-s');
  }
  drawAtMount(ctx, color, alpha) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    // Cylindrical body — tall rect with ring bands
    const body = [
      { x: -3, y: -6 },
      { x: 3, y: -6 },
      { x: 3, y: 4 },
      { x: -3, y: 4 },
    ];
    ctx.beginPath();
    ctx.moveTo(body[0].x, body[0].y);
    for (let i = 1; i < body.length; i++) ctx.lineTo(body[i].x, body[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.25;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.8;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Ring bands along the body
    ctx.lineWidth = 0.4;
    for (const by of [-4.5, -2.5, -0.5, 1.5, 3]) {
      ctx.beginPath();
      ctx.moveTo(-3, by);
      ctx.lineTo(3, by);
      ctx.globalAlpha = alpha * 0.35;
      ctx.stroke();
    }

    // Magnet stubs — small rectangles protruding from sides
    ctx.lineWidth = 0.4;
    for (const [mx, my] of [[-3, -3.5], [-3, 0], [3, -3.5], [3, 0]]) {
      const dir = mx < 0 ? -1 : 1;
      ctx.beginPath();
      ctx.rect(mx, my - 0.8, dir * 1.5, 1.6);
      ctx.globalAlpha = alpha * 0.5;
      ctx.fill();
      ctx.globalAlpha = alpha * 0.7;
      ctx.stroke();
    }

    // Grid channel — short, narrow, straight exhaust
    const channel = [
      { x: -2.2, y: 4.5 },
      { x: 2.2, y: 4.5 },
      { x: 2.2, y: 7.8 },
      { x: -2.2, y: 7.8 },
    ];
    ctx.beginPath();
    ctx.moveTo(channel[0].x, channel[0].y);
    for (let i = 1; i < channel.length; i++) ctx.lineTo(channel[i].x, channel[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.2;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.7;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Ion grid plates — horizontal lines across the channel (edge-on view)
    ctx.lineWidth = 0.5;
    for (const t of [0.25, 0.55, 0.85]) {
      const y = 4.5 + t * 3.3;
      ctx.beginPath();
      ctx.moveTo(-2.2, y);
      ctx.lineTo(2.2, y);
      ctx.globalAlpha = alpha * 0.55;
      ctx.stroke();
    }

    // Central cathode channel line
    ctx.lineWidth = 0.3;
    ctx.beginPath();
    ctx.moveTo(0, 4.5);
    ctx.lineTo(0, 7.8);
    ctx.globalAlpha = alpha * 0.3;
    ctx.stroke();

    ctx.globalAlpha = 1;
  }
}

class CruisingIonLarge extends EngineModule {
  constructor() {
    super('cruising-ion-l');
  }
  drawAtMount(ctx, color, alpha) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    // Cylindrical body — fills most of the large mount box
    const body = [
      { x: -5.5, y: -7 },
      { x: 5.5, y: -7 },
      { x: 5.5, y: 6 },
      { x: -5.5, y: 6 },
    ];
    ctx.beginPath();
    ctx.moveTo(body[0].x, body[0].y);
    for (let i = 1; i < body.length; i++) ctx.lineTo(body[i].x, body[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.25;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.8;
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // Ring bands along the body
    ctx.lineWidth = 0.45;
    for (const by of [-5.5, -3.5, -1.5, 0.5, 2.5, 4.5]) {
      ctx.beginPath();
      ctx.moveTo(-5.5, by);
      ctx.lineTo(5.5, by);
      ctx.globalAlpha = alpha * 0.3;
      ctx.stroke();
    }

    // Longitudinal surface lines
    ctx.lineWidth = 0.25;
    for (const bx of [-3.5, -1.5, 1.5, 3.5]) {
      ctx.beginPath();
      ctx.moveTo(bx, -6.5);
      ctx.lineTo(bx, 5.5);
      ctx.globalAlpha = alpha * 0.15;
      ctx.stroke();
    }

    // Magnet stubs — 3 per side
    ctx.lineWidth = 0.5;
    for (const my of [-4.5, -1, 2.5]) {
      for (const side of [-1, 1]) {
        const mx = side * 5.5;
        ctx.beginPath();
        ctx.rect(mx, my - 1, side * 2.5, 2);
        ctx.globalAlpha = alpha * 0.45;
        ctx.fill();
        ctx.globalAlpha = alpha * 0.7;
        ctx.stroke();
        // Magnet detail line
        ctx.lineWidth = 0.3;
        ctx.beginPath();
        ctx.moveTo(mx + side * 0.8, my - 0.5);
        ctx.lineTo(mx + side * 0.8, my + 0.5);
        ctx.globalAlpha = alpha * 0.3;
        ctx.stroke();
        ctx.lineWidth = 0.5;
      }
    }

    // Mounting bolts on body
    ctx.globalAlpha = alpha * 0.4;
    for (const [bx, by] of [[-4.5, -6.2], [4.5, -6.2], [-4.5, 5.2], [4.5, 5.2]]) {
      ctx.beginPath();
      ctx.arc(bx, by, 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Grid housing flange
    ctx.beginPath();
    ctx.moveTo(-6.5, 6.5);
    ctx.lineTo(6.5, 6.5);
    ctx.lineTo(6.5, 7.5);
    ctx.lineTo(-6.5, 7.5);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.5;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.8;
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // Flange bolts
    ctx.globalAlpha = alpha * 0.4;
    for (const bx of [-5, -2.5, 0, 2.5, 5]) {
      ctx.beginPath();
      ctx.arc(bx, 7, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Grid channel — short, narrow, straight exhaust extending beyond mount
    const channel = [
      { x: -4, y: 8 },
      { x: 4, y: 8 },
      { x: 4, y: 14 },
      { x: -4, y: 14 },
    ];
    ctx.beginPath();
    ctx.moveTo(channel[0].x, channel[0].y);
    for (let i = 1; i < channel.length; i++) ctx.lineTo(channel[i].x, channel[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.2;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.7;
    ctx.lineWidth = 0.7;
    ctx.stroke();

    // Ion grid plates — horizontal lines across the channel (edge-on view)
    ctx.lineWidth = 0.6;
    for (const t of [0.15, 0.4, 0.65, 0.9]) {
      const y = 8 + t * 6;
      ctx.beginPath();
      ctx.moveTo(-4, y);
      ctx.lineTo(4, y);
      ctx.globalAlpha = alpha * 0.5;
      ctx.stroke();
    }

    // Cathode channel lines — 3 longitudinal lines through grid
    ctx.lineWidth = 0.3;
    for (const vx of [-1.8, 0, 1.8]) {
      ctx.beginPath();
      ctx.moveTo(vx, 8);
      ctx.lineTo(vx, 14);
      ctx.globalAlpha = alpha * 0.25;
      ctx.stroke();
    }

    // Exhaust lip
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-4, 14);
    ctx.lineTo(4, 14);
    ctx.globalAlpha = alpha * 0.6;
    ctx.stroke();

    ctx.globalAlpha = 1;
  }
}

class MilspecRocketSmall extends EngineModule {
  constructor() {
    super('milspec-rocket-s');
  }
  drawAtMount(ctx, color, alpha) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    // Heavy armored housing — thick-walled box with reinforced corners
    const housing = [
      { x: -1.8, y: -3.5 },
      { x: -3.5, y: -2 },
      { x: -3.5, y: 3 },
      { x: 3.5, y: 3 },
      { x: 3.5, y: -2 },
      { x: 1.8, y: -3.5 },
    ];
    ctx.beginPath();
    ctx.moveTo(housing[0].x, housing[0].y);
    for (let i = 1; i < housing.length; i++) ctx.lineTo(housing[i].x, housing[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.45;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.9;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Corner gussets — reinforcement triangles
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = alpha * 0.4;
    for (const [gx, gy, dx, dy] of [[-3.5, -2, 1.2, 0], [3.5, -2, -1.2, 0], [-3.5, 3, 1.2, 0], [3.5, 3, -1.2, 0]]) {
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx + dx, gy);
      ctx.lineTo(gx, gy + dy);
      ctx.closePath();
      ctx.fill();
    }

    // Heavy bracing lines
    ctx.lineWidth = 0.5;
    for (const by of [-1.2, 1.2]) {
      ctx.beginPath();
      ctx.moveTo(-3, by);
      ctx.lineTo(3, by);
      ctx.globalAlpha = alpha * 0.4;
      ctx.stroke();
    }

    // Mounting bolts — heavy rivets
    ctx.globalAlpha = alpha * 0.55;
    for (const [bx, by] of [[-2.5, -2.2], [2.5, -2.2], [-2.8, 2.2], [2.8, 2.2]]) {
      ctx.beginPath();
      ctx.arc(bx, by, 0.45, 0, Math.PI * 2);
      ctx.fill();
    }

    // Thick throat collar
    ctx.beginPath();
    ctx.moveTo(-3.5, 3.2);
    ctx.lineTo(3.5, 3.2);
    ctx.lineTo(3.5, 4.2);
    ctx.lineTo(-3.5, 4.2);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.5;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.9;
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // Bell nozzle — shorter and stockier than standard
    const bell = [
      { x: -2.5, y: 4.5 },
      { x: 2.5, y: 4.5 },
      { x: 3.8, y: 9 },
      { x: -3.8, y: 9 },
    ];
    ctx.beginPath();
    ctx.moveTo(bell[0].x, bell[0].y);
    for (let i = 1; i < bell.length; i++) ctx.lineTo(bell[i].x, bell[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.45;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.9;
    ctx.lineWidth = 0.7;
    ctx.stroke();

    // Bell stiffening ribs
    ctx.lineWidth = 0.3;
    for (const vx of [-1, 1]) {
      const spread = vx / 2.5 * 1.3;
      ctx.beginPath();
      ctx.moveTo(vx, 5);
      ctx.lineTo(vx + spread, 8.7);
      ctx.globalAlpha = alpha * 0.3;
      ctx.stroke();
    }

    // Bell circumferential band
    ctx.lineWidth = 0.4;
    const bandY = 7;
    const bandHW = 2.5 + (7 - 4.5) / 4.5 * 1.3;
    ctx.beginPath();
    ctx.moveTo(-bandHW, bandY);
    ctx.lineTo(bandHW, bandY);
    ctx.globalAlpha = alpha * 0.35;
    ctx.stroke();

    // Heavy bell lip
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-3.8, 9);
    ctx.lineTo(3.8, 9);
    ctx.globalAlpha = alpha * 0.6;
    ctx.stroke();

    ctx.globalAlpha = 1;
  }
}

class MilspecRocketLarge extends EngineModule {
  constructor() {
    super('milspec-rocket-l');
  }
  drawAtMount(ctx, color, alpha) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    // Heavy armored housing — thick walls, reinforced corners
    const housing = [
      { x: -4, y: -7 },
      { x: -7, y: -4 },
      { x: -7, y: 5 },
      { x: 7, y: 5 },
      { x: 7, y: -4 },
      { x: 4, y: -7 },
    ];
    ctx.beginPath();
    ctx.moveTo(housing[0].x, housing[0].y);
    for (let i = 1; i < housing.length; i++) ctx.lineTo(housing[i].x, housing[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.45;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.9;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Corner gussets — heavy reinforcement triangles
    ctx.lineWidth = 0.6;
    ctx.globalAlpha = alpha * 0.4;
    for (const [gx, gy, dx, dy] of [
      [-7, -4, 2, 0], [7, -4, -2, 0],
      [-7, 5, 2, 0], [7, 5, -2, 0],
    ]) {
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx + dx, gy);
      ctx.lineTo(gx, gy + dy);
      ctx.closePath();
      ctx.fill();
    }

    // Heavy bracing lines
    ctx.lineWidth = 0.5;
    for (const by of [-1.5, 1, 3.5]) {
      ctx.beginPath();
      ctx.moveTo(-6, by);
      ctx.lineTo(6, by);
      ctx.globalAlpha = alpha * 0.35;
      ctx.stroke();
    }

    // Mounting bolts — heavy rivets
    ctx.globalAlpha = alpha * 0.55;
    for (const [bx, by] of [
      [-5.5, -3], [5.5, -3], [-5.5, 3.5], [5.5, 3.5],
      [-3, -6], [3, -6],
    ]) {
      ctx.beginPath();
      ctx.arc(bx, by, 0.55, 0, Math.PI * 2);
      ctx.fill();
    }

    // Armor side rails — thickened strips along housing edges
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = alpha * 0.3;
    ctx.beginPath();
    ctx.moveTo(-7, -3.5);
    ctx.lineTo(-7, 4.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(7, -3.5);
    ctx.lineTo(7, 4.5);
    ctx.stroke();

    // Thick throat collar
    ctx.beginPath();
    ctx.moveTo(-7.5, 5.5);
    ctx.lineTo(7.5, 5.5);
    ctx.lineTo(7.5, 7);
    ctx.lineTo(-7.5, 7);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.5;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.9;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Bell nozzle — stocky and wide, extends beyond mount
    const bell = [
      { x: -5.5, y: 7.5 },
      { x: 5.5, y: 7.5 },
      { x: 8.5, y: 18 },
      { x: -8.5, y: 18 },
    ];
    ctx.beginPath();
    ctx.moveTo(bell[0].x, bell[0].y);
    for (let i = 1; i < bell.length; i++) ctx.lineTo(bell[i].x, bell[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.45;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.9;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Bell stiffening ribs
    ctx.lineWidth = 0.4;
    for (const vx of [-3, -1, 1, 3]) {
      const spread = vx / 5.5 * 3;
      ctx.beginPath();
      ctx.moveTo(vx, 8);
      ctx.lineTo(vx + spread, 17.5);
      ctx.globalAlpha = alpha * 0.25;
      ctx.stroke();
    }

    // Bell circumferential bands
    ctx.lineWidth = 0.45;
    for (const t of [0.35, 0.7]) {
      const y = 7.5 + t * 10.5;
      const halfW = 5.5 + t * 3;
      ctx.beginPath();
      ctx.moveTo(-halfW, y);
      ctx.lineTo(halfW, y);
      ctx.globalAlpha = alpha * 0.3;
      ctx.stroke();
    }

    // Heavy bell lip
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-8.5, 18);
    ctx.lineTo(8.5, 18);
    ctx.globalAlpha = alpha * 0.6;
    ctx.stroke();

    ctx.globalAlpha = 1;
  }
}

// ── Data registration ────────────────────────────────────────────────────────

registerData(ENGINES, {
  'makeshift-thermal-s': {
    displayName: 'MAKESHIFT THERMAL (S)',
    description: 'Jury-rigged rocket cobbled from scavenged parts. Barely functional. The engine you replace, not the engine you want.',
    size: 'S',
    thrust: 800,
    fuelEffMult: 2.0,
    fuelDrainRate: 0,
    powerDraw: 1,
    weight: 35,
    breachMultiplier: 2.0,
  },
  'vintage-magplasma-s': {
    displayName: 'VINTAGE MAGPLASMA (S)',
    description: 'Pre-Exile magnetic-plasma engine. Centuries old, irreplaceable. Superb efficiency when it works — demands constant maintenance.',
    size: 'S',
    thrust: 1200,
    fuelEffMult: 0.4,
    fuelDrainRate: 0.012,
    powerDraw: 50,
    weight: 55,
    breachMultiplier: 1.5,
  },
  'vintage-magplasma-l': {
    displayName: 'VINTAGE MAGPLASMA (L)',
    description: 'Heavy pre-Exile plasma drive. Elegant engineering from the Arrival period. Outstanding range — if you can keep it running.',
    size: 'L',
    thrust: 2000,
    fuelEffMult: 0.65,
    fuelDrainRate: 0.024,
    powerDraw: 90,
    weight: 100,
    breachMultiplier: 1.5,
  },
  'standard-rocket-s': {
    displayName: 'STANDARD ROCKET (S)',
    description: 'Mass-manufactured rocket engine. Time-tested design, interchangeable parts. The backbone of civilian fleets.',
    size: 'S',
    thrust: 1800,
    fuelEffMult: 2.0,
    fuelDrainRate: 0,
    powerDraw: 2,
    weight: 70,
    breachMultiplier: 0.7,
  },
  'standard-rocket-l': {
    displayName: 'STANDARD ROCKET (L)',
    description: 'Heavy standard-pattern rocket. Same reliable design, scaled up. Parts available at any settlement forge.',
    size: 'L',
    thrust: 3000,
    fuelEffMult: 3.0,
    fuelDrainRate: 0,
    powerDraw: 3,
    weight: 130,
    breachMultiplier: 0.7,
  },
  'milspec-rocket-s': {
    displayName: 'MILSPEC ROCKET (S)',
    description: 'Prime Machinists Guild military engine. Raw thrust for combat sorties. Burns fuel like it has a fleet tender waiting.',
    size: 'S',
    thrust: 2800,
    fuelEffMult: 6.0,
    fuelDrainRate: 0,
    powerDraw: 3,
    weight: 90,
    breachMultiplier: 1.0,
  },
  'milspec-rocket-l': {
    displayName: 'MILSPEC ROCKET (L)',
    description: 'Heavy milspec propulsion. Peak thrust output in its class. Designed for carrier-based operations, not independent cruising.',
    size: 'L',
    thrust: 4500,
    fuelEffMult: 9.0,
    fuelDrainRate: 0,
    powerDraw: 5,
    weight: 170,
    breachMultiplier: 1.0,
  },
  'cruising-ion-s': {
    displayName: 'CRUISING ION (S)',
    description: 'Refined ion drive optimized for sustained output. Crosses the system on a single fuel load. Terrible in a fight.',
    size: 'S',
    thrust: 350,
    fuelEffMult: 0.02,
    fuelDrainRate: 0.001,
    powerDraw: 100,
    weight: 45,
    breachMultiplier: 0.5,
  },
  'cruising-ion-l': {
    displayName: 'CRUISING ION (L)',
    description: 'Heavy ion thruster for long-haul cargo runs. Maximum range per unit of fuel. Solid-state reliability, zero combat agility.',
    size: 'L',
    thrust: 600,
    fuelEffMult: 0.035,
    fuelDrainRate: 0.002,
    powerDraw: 180,
    weight: 85,
    breachMultiplier: 0.5,
  },
});

// Custom module classes for engines with unique visuals
const ENGINE_CLASSES = {
  'makeshift-thermal-s': MakeshiftThermalModule,
  'vintage-magplasma-s': VintageMagplasmaSmall,
  'vintage-magplasma-l': VintageMagplasmaLarge,
  'standard-rocket-s': StandardRocketSmall,
  'standard-rocket-l': StandardRocketLarge,
  'cruising-ion-s': CruisingIonSmall,
  'cruising-ion-l': CruisingIonLarge,
  'milspec-rocket-s': MilspecRocketSmall,
  'milspec-rocket-l': MilspecRocketLarge,
};

// Self-register into CONTENT.modules
for (const id of Object.keys(ENGINES)) {
  const Cls = ENGINE_CLASSES[id];
  registerContent('modules', id, { category: 'ENGINE', create: Cls ? () => new Cls() : () => new EngineModule(id) });
}
