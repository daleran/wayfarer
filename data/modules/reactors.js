import { registerData, registerContent, REACTORS } from '../dataRegistry.js';
import { ShipModule } from '@/modules/shipModule.js';
import { disc, line, ring } from '@/rendering/draw.js';
import { CYAN, AMBER, MAGENTA } from '@/rendering/colors.js';

/** @param {ShipModule} mod @param {string} id */
function _initReactor(mod, id) {
  const R = REACTORS[id];
  mod.name          = id;
  mod.displayName   = R.displayName;
  mod.powerOutput   = R.powerOutput;
  mod.fuelDrainRate = R.fuelDrainRate;
  mod.weight        = R.weight;
  mod.size          = R.size === 'L' ? 'large' : 'small';
}

class HydrogenFuelCell extends ShipModule {
  constructor() {
    super();
    _initReactor(this, 'hydrogen-fuel-cell');
    this.description = 'Small fuel cell. Steady 80W — burns fuel continuously.';
  }
  drawAtMount(ctx, color, alpha) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    // Main fuel cell stack body — rectangular block
    const body = [
      { x: -3.5, y: -2.5 },
      { x: 3.5, y: -2.5 },
      { x: 3.5, y: 4 },
      { x: -3.5, y: 4 },
    ];
    ctx.beginPath();
    ctx.moveTo(body[0].x, body[0].y);
    for (let i = 1; i < body.length; i++) ctx.lineTo(body[i].x, body[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.15;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.9;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Horizontal membrane lines (fuel cell stack plates)
    for (const ly of [-0.5, 1, 2.5]) {
      line(ctx, -3, ly, 3, ly, color, 0.5, alpha * 0.3);
    }

    // Control module on top — smaller rect (the blue box from the reference)
    const ctrl = [
      { x: -2.2, y: -4.5 },
      { x: 2.2, y: -4.5 },
      { x: 2.2, y: -2.5 },
      { x: -2.2, y: -2.5 },
    ];
    ctx.beginPath();
    ctx.moveTo(ctrl[0].x, ctrl[0].y);
    for (let i = 1; i < ctrl.length; i++) ctx.lineTo(ctrl[i].x, ctrl[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.2;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.9;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Compressor port — small circle on the left side (turbo intake)
    ring(ctx, -4.5, 1, 1.2, color, 0.7, alpha * 0.7);
    disc(ctx, -4.5, 1, 0.5, CYAN, alpha * 0.5);

    // Pipe from compressor to body
    line(ctx, -3.5, 1, -4.5 + 1.2, 1, color, 0.6, alpha * 0.5);

    // Cyan power indicator glow on control module
    disc(ctx, 0, -3.5, 0.8, CYAN, alpha * 0.6);

    ctx.globalAlpha = 1;
  }
  get effectivePowerOutput() {
    return Math.round(this.powerOutput * this.conditionMultiplier);
  }
}

class SmallFissionReactor extends ShipModule {
  constructor() {
    super();
    _initReactor(this, 'fission-reactor-s');
    const R = REACTORS['fission-reactor-s'];
    this.description       = 'Compact fission core. High output, no fuel burn. Requires periodic overhaul.';
    this._overhaulInterval = R.overhaulInterval;
    this.overhaulCost      = R.overhaulCost;
    this._degradedOutput   = R.degradedOutput;
    this.timeSinceOverhaul = 0;
    this.isOverdue         = false;
    this.isFissionReactor  = true;
  }
  drawAtMount(ctx, color, alpha) {
    // Top-down view: circular pressure vessel with core glow & pipe stubs

    // Outer vessel shell
    ring(ctx, 0, 0, 4, color, 0.8, alpha * 0.9);
    disc(ctx, 0, 0, 4, color, alpha * 0.1);

    // Inner containment ring
    ring(ctx, 0, 0, 2.2, color, 0.5, alpha * 0.4);

    // Core glow — amber hot center
    disc(ctx, 0, 0, 1.5, AMBER, alpha * 0.3);
    disc(ctx, 0, 0, 0.7, AMBER, alpha * 0.7);

    // Coolant pipe stubs radiating outward (4 cardinal directions)
    line(ctx, 0, -4, 0, -5.5, color, 0.7, alpha * 0.6);
    line(ctx, 0, 4, 0, 5.5, color, 0.7, alpha * 0.6);
    line(ctx, -4, 0, -5.5, 0, color, 0.7, alpha * 0.6);
    line(ctx, 4, 0, 5.5, 0, color, 0.7, alpha * 0.6);

    // Pipe end caps
    disc(ctx, 0, -5.5, 0.4, color, alpha * 0.5);
    disc(ctx, 0, 5.5, 0.4, color, alpha * 0.5);
    disc(ctx, -5.5, 0, 0.4, color, alpha * 0.5);
    disc(ctx, 5.5, 0, 0.4, color, alpha * 0.5);

    // Control rod dots on the lid (visible from above)
    disc(ctx, -1, -1, 0.35, color, alpha * 0.6);
    disc(ctx, 1, -1, 0.35, color, alpha * 0.6);
    disc(ctx, -1, 1, 0.35, color, alpha * 0.6);
    disc(ctx, 1, 1, 0.35, color, alpha * 0.6);
  }
  update(_ship, dt, _game) {
    this.timeSinceOverhaul += dt;
    this.isOverdue = this.timeSinceOverhaul >= this._overhaulInterval;
  }
  get effectivePowerOutput() {
    const base = this.isOverdue ? Math.round(this.powerOutput * this._degradedOutput) : this.powerOutput;
    return Math.round(base * this.conditionMultiplier);
  }
  resetOverhaul() {
    this.timeSinceOverhaul = 0;
    this.isOverdue = false;
  }
}

class LargeFissionReactor extends ShipModule {
  constructor() {
    super();
    _initReactor(this, 'fission-reactor-l');
    const R = REACTORS['fission-reactor-l'];
    this.description       = 'Heavy fission plant. Maximum fission output. Requires overhaul at certified stations.';
    this._overhaulInterval = R.overhaulInterval;
    this.overhaulCost      = R.overhaulCost;
    this._degradedOutput   = R.degradedOutput;
    this.timeSinceOverhaul = 0;
    this.isOverdue         = false;
    this.isFissionReactor  = true;
  }
  drawAtMount(ctx, color, alpha) {
    // Top-down view: larger pressure vessel — double containment, more pipes

    // Outer vessel shell
    ring(ctx, 0, 0, 6, color, 0.8, alpha * 0.9);
    disc(ctx, 0, 0, 6, color, alpha * 0.08);

    // Secondary containment ring
    ring(ctx, 0, 0, 4, color, 0.6, alpha * 0.35);

    // Inner containment ring
    ring(ctx, 0, 0, 2.2, color, 0.5, alpha * 0.4);

    // Core glow — amber hot center (larger)
    disc(ctx, 0, 0, 2, AMBER, alpha * 0.3);
    disc(ctx, 0, 0, 1, AMBER, alpha * 0.7);

    // Coolant pipe stubs — 8 directions (cardinal + diagonal)
    const pipeR = 6;
    const stubLen = 2;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
      const cx = Math.cos(a), cy = Math.sin(a);
      line(ctx, cx * pipeR, cy * pipeR, cx * (pipeR + stubLen), cy * (pipeR + stubLen), color, 0.7, alpha * 0.55);
      disc(ctx, cx * (pipeR + stubLen), cy * (pipeR + stubLen), 0.5, color, alpha * 0.5);
    }

    // Control rod dots on the lid — ring of 6
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      disc(ctx, Math.cos(a) * 3, Math.sin(a) * 3, 0.4, color, alpha * 0.6);
    }

    // Center control rod
    disc(ctx, 0, 0, 0.4, color, alpha * 0.7);
  }
  update(_ship, dt, _game) {
    this.timeSinceOverhaul += dt;
    this.isOverdue = this.timeSinceOverhaul >= this._overhaulInterval;
  }
  get effectivePowerOutput() {
    const base = this.isOverdue ? Math.round(this.powerOutput * this._degradedOutput) : this.powerOutput;
    return Math.round(base * this.conditionMultiplier);
  }
  resetOverhaul() {
    this.timeSinceOverhaul = 0;
    this.isOverdue = false;
  }
}

class HydrogenI6Engine extends ShipModule {
  constructor() {
    super();
    _initReactor(this, 'hydrogen-i6');
    this.description = 'Inline-6 hydrogen ICE generator. Good output, drinks fuel fast.';
  }
  drawAtMount(ctx, color, alpha) {
    // Top-down view: inline-6 engine block — long rectangular block with
    // 6 cylinder heads in a row, intake manifold on one side, exhaust on other

    // Engine block — elongated rectangle
    const block = [
      { x: -2.5, y: -5 },
      { x: 2.5, y: -5 },
      { x: 2.5, y: 5 },
      { x: -2.5, y: 5 },
    ];
    ctx.beginPath();
    ctx.moveTo(block[0].x, block[0].y);
    for (let i = 1; i < block.length; i++) ctx.lineTo(block[i].x, block[i].y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha * 0.12;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha * 0.9;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // 6 cylinder head circles in a line
    for (let i = 0; i < 6; i++) {
      const cy = -4 + i * 1.7;
      ring(ctx, 0, cy, 0.9, color, 0.5, alpha * 0.5);
      disc(ctx, 0, cy, 0.35, AMBER, alpha * 0.5);
    }

    // Intake manifold — pipe runners on left side
    for (let i = 0; i < 6; i++) {
      const cy = -4 + i * 1.7;
      line(ctx, -2.5, cy, -4, cy, color, 0.5, alpha * 0.4);
    }
    // Intake rail
    line(ctx, -4, -4, -4, 4.5, color, 0.6, alpha * 0.5);

    // Exhaust manifold — pipe runners on right side
    for (let i = 0; i < 6; i++) {
      const cy = -4 + i * 1.7;
      line(ctx, 2.5, cy, 4, cy, color, 0.5, alpha * 0.4);
    }
    // Exhaust collector merging to single pipe
    line(ctx, 4, -4, 4, 4.5, color, 0.6, alpha * 0.5);
    line(ctx, 4, 0.25, 5.5, 0.25, color, 0.7, alpha * 0.6);
    disc(ctx, 5.5, 0.25, 0.5, color, alpha * 0.4);

    // Generator housing at bottom
    const gen = [
      { x: -1.8, y: 5 },
      { x: 1.8, y: 5 },
      { x: 1.8, y: 6.5 },
      { x: -1.8, y: 6.5 },
    ];
    ctx.beginPath();
    ctx.moveTo(gen[0].x, gen[0].y);
    for (let i = 1; i < gen.length; i++) ctx.lineTo(gen[i].x, gen[i].y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha * 0.15;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha * 0.7;
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // Generator power dot
    disc(ctx, 0, 5.75, 0.5, AMBER, alpha * 0.6);

    ctx.globalAlpha = 1;
  }
  get effectivePowerOutput() {
    return Math.round(this.powerOutput * this.conditionMultiplier);
  }
}

class HydrogenV12Engine extends ShipModule {
  constructor() {
    super();
    _initReactor(this, 'hydrogen-v12');
    this.description = 'V12 hydrogen ICE generator. Serious power, serious thirst. No overhaul needed.';
  }
  drawAtMount(ctx, color, alpha) {
    // Top-down view: V12 engine block — scaled to fill large mount (±7)

    // Engine block housing — chamfered rect filling large mount
    const block = [
      { x: -5, y: -7 },
      { x: -7, y: -5 },
      { x: -7, y: 7 },
      { x: 7, y: 7 },
      { x: 7, y: -5 },
      { x: 5, y: -7 },
    ];
    ctx.beginPath();
    ctx.moveTo(block[0].x, block[0].y);
    for (let i = 1; i < block.length; i++) ctx.lineTo(block[i].x, block[i].y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha * 0.1;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha * 0.9;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Center valley line (V split)
    line(ctx, 0, -6.5, 0, 6.5, color, 0.5, alpha * 0.25);

    // Left bank — 6 cylinders
    for (let i = 0; i < 6; i++) {
      const cy = -5.5 + i * 2.2;
      ring(ctx, -3, cy, 1.3, color, 0.5, alpha * 0.45);
      disc(ctx, -3, cy, 0.5, AMBER, alpha * 0.5);
    }

    // Right bank — 6 cylinders
    for (let i = 0; i < 6; i++) {
      const cy = -5.5 + i * 2.2;
      ring(ctx, 3, cy, 1.3, color, 0.5, alpha * 0.45);
      disc(ctx, 3, cy, 0.5, AMBER, alpha * 0.5);
    }

    // Intake manifold — top (air intake plenum)
    const intake = [
      { x: -4, y: -7 },
      { x: 4, y: -7 },
      { x: 4, y: -9 },
      { x: -4, y: -9 },
    ];
    ctx.beginPath();
    ctx.moveTo(intake[0].x, intake[0].y);
    for (let i = 1; i < intake.length; i++) ctx.lineTo(intake[i].x, intake[i].y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha * 0.12;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha * 0.7;
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // Dual exhaust pipes — left and right side exits
    line(ctx, -7, -1.5, -9, -1.5, color, 0.7, alpha * 0.55);
    line(ctx, -7, 1.5, -9, 1.5, color, 0.7, alpha * 0.55);
    line(ctx, -9, -1.5, -9, 1.5, color, 0.6, alpha * 0.4);
    disc(ctx, -9, 0, 0.6, color, alpha * 0.4);

    line(ctx, 7, -1.5, 9, -1.5, color, 0.7, alpha * 0.55);
    line(ctx, 7, 1.5, 9, 1.5, color, 0.7, alpha * 0.55);
    line(ctx, 9, -1.5, 9, 1.5, color, 0.6, alpha * 0.4);
    disc(ctx, 9, 0, 0.6, color, alpha * 0.4);

    // Generator housing at bottom
    const gen = [
      { x: -4, y: 7 },
      { x: 4, y: 7 },
      { x: 4, y: 10 },
      { x: -4, y: 10 },
    ];
    ctx.beginPath();
    ctx.moveTo(gen[0].x, gen[0].y);
    for (let i = 1; i < gen.length; i++) ctx.lineTo(gen[i].x, gen[i].y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha * 0.15;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha * 0.7;
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // Generator power dot
    disc(ctx, 0, 8.5, 0.8, AMBER, alpha * 0.6);

    ctx.globalAlpha = 1;
  }
  get effectivePowerOutput() {
    return Math.round(this.powerOutput * this.conditionMultiplier);
  }
}

class LargeFusionReactor extends ShipModule {
  constructor() {
    super();
    _initReactor(this, 'fusion-reactor-l');
    this.description = 'Pre-Collapse fusion core. Immense output. Consumes trace fuel — no overhaul required.';
  }
  drawAtMount(ctx, color, alpha) {
    // Top-down view: stellarator fusion reactor — toroidal plasma ring
    // with magnetic confinement coil segments, magenta plasma core

    const R = 4.5;   // torus major radius (center of ring)
    const r = 1.8;   // torus minor radius (tube thickness)
    const coils = 8; // number of magnetic coil bands

    // Outer torus wall
    ring(ctx, 0, 0, R + r, color, 0.8, alpha * 0.85);

    // Faint torus fill
    disc(ctx, 0, 0, R + r, color, alpha * 0.06);

    // Inner torus wall (the hole)
    ring(ctx, 0, 0, R - r, color, 0.6, alpha * 0.5);

    // Clear the center hole
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    disc(ctx, 0, 0, R - r - 0.3, '#000', 0.85);
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();

    // Plasma glow ring — magenta, follows the torus center-line
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.strokeStyle = MAGENTA;
    ctx.lineWidth = r * 0.8;
    ctx.globalAlpha = alpha * 0.2;
    ctx.stroke();
    ctx.lineWidth = r * 0.3;
    ctx.globalAlpha = alpha * 0.5;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Magnetic confinement coils — short radial line segments across the torus
    for (let i = 0; i < coils; i++) {
      const a = (i / coils) * Math.PI * 2;
      const cos = Math.cos(a), sin = Math.sin(a);
      // Inner edge of coil
      const ix = cos * (R - r - 0.5), iy = sin * (R - r - 0.5);
      // Outer edge of coil
      const ox = cos * (R + r + 0.5), oy = sin * (R + r + 0.5);
      line(ctx, ix, iy, ox, oy, color, 0.8, alpha * 0.55);
    }

    // Coil band dots at outer tips (magnetic field emitters)
    for (let i = 0; i < coils; i++) {
      const a = (i / coils) * Math.PI * 2;
      disc(ctx, Math.cos(a) * (R + r + 0.5), Math.sin(a) * (R + r + 0.5), 0.4, color, alpha * 0.5);
    }

    // Bright plasma hot-spot at one point on the ring
    disc(ctx, R, 0, 0.8, MAGENTA, alpha * 0.7);
  }
  get effectivePowerOutput() {
    return Math.round(this.powerOutput * this.conditionMultiplier);
  }
}

registerData(REACTORS, {
  'hydrogen-fuel-cell': {
    displayName: 'H2 FUEL CELL (S)',
    size: 'S',
    powerOutput: 80,
    fuelDrainRate: 0.025,
    degradedOutput: 0,
    weight: 20,
  },
  'fission-reactor-s': {
    displayName: 'FISSION REACTOR (S)',
    size: 'S',
    powerOutput: 160,
    fuelDrainRate: 0,
    overhaulInterval: 10800,
    overhaulCost: 800,
    degradedOutput: 0.6,
    weight: 40,
  },
  'fission-reactor-l': {
    displayName: 'FISSION REACTOR (L)',
    size: 'L',
    powerOutput: 300,
    fuelDrainRate: 0,
    overhaulInterval: 14400,
    overhaulCost: 1500,
    degradedOutput: 0.6,
    weight: 80,
  },
  'hydrogen-i6': {
    displayName: 'H2 I6 ENGINE (S)',
    size: 'S',
    powerOutput: 120,
    fuelDrainRate: 0.045,
    degradedOutput: 0,
    weight: 30,
  },
  'hydrogen-v12': {
    displayName: 'H2 V12 ENGINE (L)',
    size: 'L',
    powerOutput: 240,
    fuelDrainRate: 0.08,
    degradedOutput: 0,
    weight: 65,
  },
  'fusion-reactor-l': {
    displayName: 'FUSION REACTOR (L)',
    size: 'L',
    powerOutput: 500,
    fuelDrainRate: 0.005,
    degradedOutput: 0,
    weight: 100,
  },
});

// Self-register into CONTENT.modules
registerContent('modules', 'hydrogen-fuel-cell', { category: 'POWER', create: () => new HydrogenFuelCell() });
registerContent('modules', 'fission-reactor-s',  { category: 'POWER', create: () => new SmallFissionReactor() });
registerContent('modules', 'fission-reactor-l',  { category: 'POWER', create: () => new LargeFissionReactor() });
registerContent('modules', 'hydrogen-i6',         { category: 'POWER', create: () => new HydrogenI6Engine() });
registerContent('modules', 'hydrogen-v12',        { category: 'POWER', create: () => new HydrogenV12Engine() });
registerContent('modules', 'fusion-reactor-l',    { category: 'POWER', create: () => new LargeFusionReactor() });
