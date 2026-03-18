import { registerData, registerContent, UTILITIES } from '../dataRegistry.js';
import { UtilityModule } from '@/modules/shipModule.js';
import { disc, ring, line } from '@/rendering/draw.js';
import { AMBER, CYAN, GREEN, WHITE } from '@/rendering/colors.js';

/** @param {UtilityModule} mod @param {string} id */
function _initUtility(mod, id) {
  const U = UTILITIES[id];
  mod.name        = id;
  mod.displayName = U.displayName;
  mod.weight      = U.weight;
  mod.size        = U.size === 'L' ? 'large' : 'small';
  mod.isUtility   = true;
  mod._cargoBonus = U.cargoBonus || 0;
  mod._fuelBonus  = U.fuelBonus  || 0;
  mod._armorBonus = U.armorBonus || 0;
}

/** Draw a polygon from point array, fill + stroke */
function _poly(ctx, pts, color, fillAlpha, strokeAlpha, lw = 0.5) {
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.globalAlpha = fillAlpha;
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.globalAlpha = strokeAlpha;
  ctx.lineWidth = lw;
  ctx.stroke();
}

class ExpandedHoldSmall extends UtilityModule {
  constructor() {
    super();
    _initUtility(this, 'expanded-hold-s');
    this.description = 'Welded-in cargo frames. More hold space — heavier hull, thinner armor.';
    this.isCargoExpansion = true;
  }
  drawAtMount(ctx, color, alpha) {
    // 7×7 cargo frame rack
    const h = 3.5;
    _poly(ctx, [
      { x: -h, y: -h }, { x: h, y: -h }, { x: h, y: h }, { x: -h, y: h },
    ], color, alpha * 0.1, alpha * 0.85);
    // 2 shelf bars
    line(ctx, -h, -1.2, h, -1.2, color, 0.5, alpha * 0.4);
    line(ctx, -h, 1.2, h, 1.2, color, 0.5, alpha * 0.4);
    // Center divider
    line(ctx, 0, -h, 0, h, color, 0.4, alpha * 0.3);
    // 4 corner bolts
    disc(ctx, -2.8, -2.8, 0.35, color, alpha * 0.5);
    disc(ctx, 2.8, -2.8, 0.35, color, alpha * 0.5);
    disc(ctx, -2.8, 2.8, 0.35, color, alpha * 0.5);
    disc(ctx, 2.8, 2.8, 0.35, color, alpha * 0.5);
    // Amber center dot accent
    disc(ctx, 0, 0, 0.6, AMBER, alpha * 0.7);
  }
}

class ExpandedHoldLarge extends UtilityModule {
  constructor() {
    super();
    _initUtility(this, 'expanded-hold-l');
    this.description = 'Full cargo bay extension. Major capacity gain — significant mass and armor penalty.';
    this.isCargoExpansion = true;
  }
  drawAtMount(ctx, color, alpha) {
    // 14×12 cargo bay pod
    _poly(ctx, [
      { x: -7, y: -6 }, { x: 7, y: -6 }, { x: 7, y: 6 }, { x: -7, y: 6 },
    ], color, alpha * 0.1, alpha * 0.85);
    // 3 shelf lines
    line(ctx, -7, -2, 7, -2, color, 0.5, alpha * 0.4);
    line(ctx, -7, 0, 7, 0, color, 0.5, alpha * 0.35);
    line(ctx, -7, 2, 7, 2, color, 0.5, alpha * 0.4);
    // 2 vertical partitions
    line(ctx, -2.3, -6, -2.3, 6, color, 0.4, alpha * 0.3);
    line(ctx, 2.3, -6, 2.3, 6, color, 0.4, alpha * 0.3);
    // Bolt rows top/bottom
    for (const bx of [-5, -2.5, 0, 2.5, 5]) {
      disc(ctx, bx, -5.3, 0.3, color, alpha * 0.5);
      disc(ctx, bx, 5.3, 0.3, color, alpha * 0.5);
    }
    // 2 Amber dots at top
    disc(ctx, -2, -4, 0.5, AMBER, alpha * 0.7);
    disc(ctx, 2, -4, 0.5, AMBER, alpha * 0.7);
  }
}

class AuxTankSmall extends UtilityModule {
  constructor() {
    super();
    _initUtility(this, 'aux-tank-s');
    this.description = 'Bolt-on fuel bladder. Extended range — adds weight, weakens hull plating.';
  }
  drawAtMount(ctx, color, alpha) {
    // Cylindrical fuel bladder — circle r=3
    ring(ctx, 0, 0, 3, color, 0.8, alpha * 0.85);
    disc(ctx, 0, 0, 3, color, alpha * 0.1);
    // Inner pressure ring
    ring(ctx, 0, 0, 1.8, color, 0.5, alpha * 0.35);
    // Fill port stub top
    line(ctx, 0, -3, 0, -4.2, color, 0.6, alpha * 0.5);
    disc(ctx, 0, -4.2, 0.35, color, alpha * 0.5);
    // Feed line bottom
    line(ctx, 0, 3, 0, 4.2, color, 0.6, alpha * 0.5);
    disc(ctx, 0, 4.2, 0.35, color, alpha * 0.5);
    // Cyan center disc accent
    disc(ctx, 0, 0, 0.8, CYAN, alpha * 0.7);
  }
}

class AuxTankLarge extends UtilityModule {
  constructor() {
    super();
    _initUtility(this, 'aux-tank-l');
    this.description = 'Pressurized reserve tank. Long-range capability — heavy, reduces armor protection.';
  }
  drawAtMount(ctx, color, alpha) {
    // Stadium 14×10 pressurized tank
    const hw = 7, hh = 5, r = 3;
    // Outer body — rounded rect approximated as rect + end caps
    _poly(ctx, [
      { x: -hw, y: -hh + r }, { x: -hw + 1, y: -hh }, { x: hw - 1, y: -hh },
      { x: hw, y: -hh + r }, { x: hw, y: hh - r }, { x: hw - 1, y: hh },
      { x: -hw + 1, y: hh }, { x: -hw, y: hh - r },
    ], color, alpha * 0.1, alpha * 0.85);
    // 3 pressure bands
    line(ctx, -6, -2, 6, -2, color, 0.5, alpha * 0.35);
    line(ctx, -6, 0, 6, 0, color, 0.5, alpha * 0.3);
    line(ctx, -6, 2, 6, 2, color, 0.5, alpha * 0.35);
    // 2 fill ports top
    line(ctx, -2.5, -hh, -2.5, -hh - 1.8, color, 0.6, alpha * 0.5);
    disc(ctx, -2.5, -hh - 1.8, 0.35, CYAN, alpha * 0.7);
    line(ctx, 2.5, -hh, 2.5, -hh - 1.8, color, 0.6, alpha * 0.5);
    disc(ctx, 2.5, -hh - 1.8, 0.35, CYAN, alpha * 0.7);
    // Feed line bottom
    line(ctx, 0, hh, 0, hh + 2, color, 0.6, alpha * 0.5);
    disc(ctx, 0, hh + 2, 0.35, color, alpha * 0.5);
    // 6 bolts (3 per side)
    for (const by of [-3, 0, 3]) {
      disc(ctx, -hw + 0.8, by, 0.3, color, alpha * 0.5);
      disc(ctx, hw - 0.8, by, 0.3, color, alpha * 0.5);
    }
    // Cyan center accent
    disc(ctx, 0, 0, 0.9, CYAN, alpha * 0.6);
  }
}

class StrippedWeightSmall extends UtilityModule {
  constructor() {
    super();
    _initUtility(this, 'stripped-weight-s');
    this.description = 'Non-essential systems removed. Lighter hull — less armor protection.';
  }
  drawAtMount(ctx, color, alpha) {
    // 7×7 exposed hull cutaway — very faint fill
    const h = 3.5;
    _poly(ctx, [
      { x: -h, y: -h }, { x: h, y: -h }, { x: h, y: h }, { x: -h, y: h },
    ], color, alpha * 0.05, alpha * 0.6);
    // 3 diagonal rib lines
    line(ctx, -h, -h, h, h, color, 0.4, alpha * 0.3);
    line(ctx, -h, -1, h - 1, h, color, 0.4, alpha * 0.25);
    line(ctx, -1, -h, h, h - 1, color, 0.4, alpha * 0.25);
    // Dangling wire stubs
    line(ctx, -2, h, -2, h + 1.5, color, 0.4, alpha * 0.35);
    line(ctx, 1, h, 1, h + 1.8, color, 0.4, alpha * 0.3);
    // Empty bolt holes (rings)
    ring(ctx, -2.5, -2.5, 0.5, color, 0.5, alpha * 0.4);
    ring(ctx, 2.5, -2.5, 0.5, color, 0.5, alpha * 0.4);
    ring(ctx, -2.5, 2.5, 0.5, color, 0.5, alpha * 0.4);
    ring(ctx, 2.5, 2.5, 0.5, color, 0.5, alpha * 0.4);
    // Green center dot
    disc(ctx, 0, 0, 0.5, GREEN, alpha * 0.7);
  }
}

class StrippedWeightLarge extends UtilityModule {
  constructor() {
    super();
    _initUtility(this, 'stripped-weight-l');
    this.description = 'Gutted interior, thinned bulkheads. Major weight reduction — armor severely compromised.';
  }
  drawAtMount(ctx, color, alpha) {
    // 14×14 gutted interior skeleton
    const h = 7;
    _poly(ctx, [
      { x: -h, y: -h }, { x: h, y: -h }, { x: h, y: h }, { x: -h, y: h },
    ], color, alpha * 0.05, alpha * 0.6);
    // I-beam ribs (horizontal + vertical cross)
    line(ctx, -h, 0, h, 0, color, 0.6, alpha * 0.35);
    line(ctx, 0, -h, 0, h, color, 0.6, alpha * 0.35);
    // Diagonal ribs
    line(ctx, -h, -h, h, h, color, 0.4, alpha * 0.25);
    line(ctx, h, -h, -h, h, color, 0.4, alpha * 0.25);
    // 6 empty bolt rings
    ring(ctx, -5, -5, 0.5, color, 0.5, alpha * 0.4);
    ring(ctx, 5, -5, 0.5, color, 0.5, alpha * 0.4);
    ring(ctx, -5, 5, 0.5, color, 0.5, alpha * 0.4);
    ring(ctx, 5, 5, 0.5, color, 0.5, alpha * 0.4);
    ring(ctx, -5, 0, 0.5, color, 0.5, alpha * 0.4);
    ring(ctx, 5, 0, 0.5, color, 0.5, alpha * 0.4);
    // Wire stubs
    line(ctx, -3, h, -3, h + 2, color, 0.4, alpha * 0.3);
    line(ctx, 2, h, 2, h + 2.2, color, 0.4, alpha * 0.28);
    line(ctx, -1, h, -1, h + 1.5, color, 0.4, alpha * 0.25);
    // Cut marks (short dashes along edges)
    line(ctx, -h, -3, -h - 0.8, -3, color, 0.3, alpha * 0.3);
    line(ctx, h, 2, h + 0.8, 2, color, 0.3, alpha * 0.3);
    // Green center + intersection dots
    disc(ctx, 0, 0, 0.6, GREEN, alpha * 0.7);
    disc(ctx, -5, -5, 0.35, GREEN, alpha * 0.4);
    disc(ctx, 5, 5, 0.35, GREEN, alpha * 0.4);
  }
}

class ExtraArmorSmall extends UtilityModule {
  constructor() {
    super();
    _initUtility(this, 'extra-armor-s');
    this.description = 'Bolted armor plating. Better protection — heavier ship.';
  }
  drawAtMount(ctx, color, alpha) {
    // 7×8 chamfered armor plate
    _poly(ctx, [
      { x: -2.5, y: -4 }, { x: 2.5, y: -4 }, { x: 3.5, y: -3 },
      { x: 3.5, y: 3 }, { x: 2.5, y: 4 }, { x: -2.5, y: 4 },
      { x: -3.5, y: 3 }, { x: -3.5, y: -3 },
    ], color, alpha * 0.15, alpha * 0.85);
    // Center seam
    line(ctx, -3.5, 0, 3.5, 0, color, 0.5, alpha * 0.4);
    // 6 heavy bolts (2×3 grid)
    for (const by of [-2.5, 0, 2.5]) {
      disc(ctx, -1.5, by, 0.45, color, alpha * 0.6);
      disc(ctx, 1.5, by, 0.45, color, alpha * 0.6);
    }
    // Diagonal reinforcement lines
    line(ctx, -3, -3.5, 3, 3.5, color, 0.4, alpha * 0.25);
    line(ctx, 3, -3.5, -3, 3.5, color, 0.4, alpha * 0.25);
    // Edge bevel highlight
    line(ctx, -2.5, -4, 2.5, -4, WHITE, 0.6, alpha * 0.5);
  }
}

class ExtraArmorLarge extends UtilityModule {
  constructor() {
    super();
    _initUtility(this, 'extra-armor-l');
    this.description = 'Heavy composite armor panels. Substantial protection boost — significant mass penalty.';
  }
  drawAtMount(ctx, color, alpha) {
    // Overlapping panels: outer 14×12, inner 12×10
    _poly(ctx, [
      { x: -7, y: -6 }, { x: 7, y: -6 }, { x: 7, y: 6 }, { x: -7, y: 6 },
    ], color, alpha * 0.12, alpha * 0.85);
    _poly(ctx, [
      { x: -6, y: -5 }, { x: 6, y: -5 }, { x: 6, y: 5 }, { x: -6, y: 5 },
    ], color, alpha * 0.08, alpha * 0.5);
    // 12 bolts (3×4 grid)
    for (const bx of [-4, -1.3, 1.3, 4]) {
      for (const by of [-3.5, 0, 3.5]) {
        disc(ctx, bx, by, 0.4, color, alpha * 0.55);
      }
    }
    // Cross-hatch weave
    for (let i = -5; i <= 5; i += 2.5) {
      line(ctx, -6, i, 6, i + 3, color, 0.3, alpha * 0.15);
      line(ctx, -6, i, 6, i - 3, color, 0.3, alpha * 0.15);
    }
    // 2 seam lines
    line(ctx, -7, -2, 7, -2, color, 0.5, alpha * 0.35);
    line(ctx, -7, 2, 7, 2, color, 0.5, alpha * 0.35);
    // Corner gussets (small triangular reinforcements)
    line(ctx, -7, -4.5, -5.5, -6, color, 0.5, alpha * 0.4);
    line(ctx, 7, -4.5, 5.5, -6, color, 0.5, alpha * 0.4);
    line(ctx, -7, 4.5, -5.5, 6, color, 0.5, alpha * 0.4);
    line(ctx, 7, 4.5, 5.5, 6, color, 0.5, alpha * 0.4);
    // White top edge highlight + 2 center bolt dots
    line(ctx, -7, -6, 7, -6, WHITE, 0.7, alpha * 0.5);
    disc(ctx, -1.3, 0, 0.5, WHITE, alpha * 0.4);
    disc(ctx, 1.3, 0, 0.5, WHITE, alpha * 0.4);
  }
}

class SalvageBayModule extends UtilityModule {
  constructor() {
    super();
    _initUtility(this, 'salvage-bay');
    this.description = 'Field salvage bay. Extracts installed modules and weapons from derelicts during salvage.';
    this.hasSalvageBay = true;
  }
  drawAtMount(ctx, color, alpha) {
    // 14×10 cutting/extraction platform
    _poly(ctx, [
      { x: -7, y: -5 }, { x: 7, y: -5 }, { x: 7, y: 5 }, { x: -7, y: 5 },
    ], color, alpha * 0.1, alpha * 0.85);
    // Side rails
    line(ctx, -7, -3.5, -7, 3.5, color, 0.8, alpha * 0.6);
    line(ctx, 7, -3.5, 7, 3.5, color, 0.8, alpha * 0.6);
    // 2 arm track lines
    line(ctx, -5, -2, 5, -2, color, 0.5, alpha * 0.35);
    line(ctx, -5, 1, 5, 1, color, 0.5, alpha * 0.35);
    // Cutting head at center
    ring(ctx, 0, -0.5, 1.5, color, 0.6, alpha * 0.5);
    disc(ctx, 0, -0.5, 0.8, AMBER, alpha * 0.7);
    // 4 clamps bottom
    for (const cx of [-5, -2, 2, 5]) {
      line(ctx, cx, 3.5, cx, 5, color, 0.5, alpha * 0.45);
      disc(ctx, cx, 4.2, 0.35, AMBER, alpha * 0.5);
    }
    // Tool rack right
    line(ctx, 5.5, -3, 5.5, 2, color, 0.4, alpha * 0.3);
    disc(ctx, 5.5, -2, 0.3, color, alpha * 0.4);
    disc(ctx, 5.5, 0, 0.3, color, alpha * 0.4);
    disc(ctx, 5.5, 2, 0.3, color, alpha * 0.4);
    // 4 corner bolts
    disc(ctx, -6.2, -4.2, 0.3, color, alpha * 0.5);
    disc(ctx, 6.2, -4.2, 0.3, color, alpha * 0.5);
    disc(ctx, -6.2, 4.2, 0.3, color, alpha * 0.5);
    disc(ctx, 6.2, 4.2, 0.3, color, alpha * 0.5);
  }
}

class EngineeringBayModule extends UtilityModule {
  constructor() {
    super();
    _initUtility(this, 'engineering-bay');
    this.description = 'Field engineering bay. Enables hull repair using scrap while stationary.';
    this.hasEngineeringBay = true;
  }
  drawAtMount(ctx, color, alpha) {
    // 14×10 chamfered repair workshop
    _poly(ctx, [
      { x: -6, y: -5 }, { x: 6, y: -5 }, { x: 7, y: -4 },
      { x: 7, y: 4 }, { x: 6, y: 5 }, { x: -6, y: 5 },
      { x: -7, y: 4 }, { x: -7, y: -4 },
    ], color, alpha * 0.1, alpha * 0.85);
    // 2 partition lines (3 compartments)
    line(ctx, -2.3, -5, -2.3, 5, color, 0.5, alpha * 0.4);
    line(ctx, 2.3, -5, 2.3, 5, color, 0.5, alpha * 0.4);
    // Welding arm — ring + extending line (left compartment)
    ring(ctx, -4.5, -1, 1.2, color, 0.6, alpha * 0.5);
    disc(ctx, -4.5, -1, 0.5, GREEN, alpha * 0.7);
    line(ctx, -4.5, -1, -4.5, 2.5, color, 0.5, alpha * 0.45);
    // Workbench + tools (center compartment)
    _poly(ctx, [
      { x: -1.5, y: -2 }, { x: 1.5, y: -2 }, { x: 1.5, y: 2 }, { x: -1.5, y: 2 },
    ], color, alpha * 0.08, alpha * 0.35);
    disc(ctx, -0.5, -0.5, 0.3, color, alpha * 0.45);
    disc(ctx, 0.5, 0.5, 0.3, color, alpha * 0.45);
    line(ctx, -1, 1, 1, 1, color, 0.4, alpha * 0.3);
    // Conduit line (right compartment, vertical)
    line(ctx, 4.5, -4, 4.5, 4, GREEN, 0.5, alpha * 0.4);
    // 4 corner bolts
    disc(ctx, -6.2, -4.2, 0.3, color, alpha * 0.5);
    disc(ctx, 6.2, -4.2, 0.3, color, alpha * 0.5);
    disc(ctx, -6.2, 4.2, 0.3, color, alpha * 0.5);
    disc(ctx, 6.2, 4.2, 0.3, color, alpha * 0.5);
  }
}

registerData(UTILITIES, {
  'expanded-hold-s': {
    displayName: 'EXPANDED HOLD (S)',
    size: 'S',
    weight: 30,
    cargoBonus: 30,
    fuelBonus: 0,
    armorBonus: -15,
  },
  'expanded-hold-l': {
    displayName: 'EXPANDED HOLD (L)',
    size: 'L',
    weight: 60,
    cargoBonus: 60,
    fuelBonus: 0,
    armorBonus: -25,
  },
  'aux-tank-s': {
    displayName: 'AUX TANK (S)',
    size: 'S',
    weight: 25,
    cargoBonus: 0,
    fuelBonus: 20,
    armorBonus: -10,
  },
  'aux-tank-l': {
    displayName: 'AUX TANK (L)',
    size: 'L',
    weight: 50,
    cargoBonus: 0,
    fuelBonus: 40,
    armorBonus: -20,
  },
  'stripped-weight-s': {
    displayName: 'STRIPPED WEIGHT (S)',
    size: 'S',
    weight: -40,
    cargoBonus: 0,
    fuelBonus: 0,
    armorBonus: -20,
  },
  'stripped-weight-l': {
    displayName: 'STRIPPED WEIGHT (L)',
    size: 'L',
    weight: -80,
    cargoBonus: 0,
    fuelBonus: 0,
    armorBonus: -40,
  },
  'extra-armor-s': {
    displayName: 'EXTRA ARMOR (S)',
    size: 'S',
    weight: 40,
    cargoBonus: 0,
    fuelBonus: 0,
    armorBonus: 30,
  },
  'extra-armor-l': {
    displayName: 'EXTRA ARMOR (L)',
    size: 'L',
    weight: 80,
    cargoBonus: 0,
    fuelBonus: 0,
    armorBonus: 60,
  },
  'salvage-bay': {
    displayName: 'SALVAGE BAY (L)',
    size: 'L',
    weight: 40,
    cargoBonus: 0,
    fuelBonus: 0,
    armorBonus: 0,
  },
  'engineering-bay': {
    displayName: 'ENGINEERING BAY (L)',
    size: 'L',
    weight: 35,
    cargoBonus: 0,
    fuelBonus: 0,
    armorBonus: 0,
  },
});

// Self-register into CONTENT.modules
registerContent('modules', 'expanded-hold-s',  { category: 'UTILITY', create: () => new ExpandedHoldSmall() });
registerContent('modules', 'expanded-hold-l',  { category: 'UTILITY', create: () => new ExpandedHoldLarge() });
registerContent('modules', 'aux-tank-s',       { category: 'UTILITY', create: () => new AuxTankSmall() });
registerContent('modules', 'aux-tank-l',       { category: 'UTILITY', create: () => new AuxTankLarge() });
registerContent('modules', 'stripped-weight-s', { category: 'UTILITY', create: () => new StrippedWeightSmall() });
registerContent('modules', 'stripped-weight-l', { category: 'UTILITY', create: () => new StrippedWeightLarge() });
registerContent('modules', 'extra-armor-s',    { category: 'UTILITY', create: () => new ExtraArmorSmall() });
registerContent('modules', 'extra-armor-l',    { category: 'UTILITY', create: () => new ExtraArmorLarge() });
registerContent('modules', 'salvage-bay',      { category: 'UTILITY', create: () => new SalvageBayModule() });
registerContent('modules', 'engineering-bay',   { category: 'UTILITY', create: () => new EngineeringBayModule() });
