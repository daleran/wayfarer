import { registerData, registerContent, UTILITIES } from '../dataRegistry.js';
import { UtilityModule } from '@/modules/shipModule.js';
import { Shape, line } from '@/rendering/draw.js';
import { AMBER, CYAN, GREEN, WHITE } from '@/rendering/colors.js';

const UTILITY_SHAPE = Shape.chamferedRect(7, 7, 2);

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

/** Shared utility rendering — chamfered box + colored cross */
function _drawUtilityIcon(ctx, color, alpha, glowColor) {
  UTILITY_SHAPE.fill(ctx, color, alpha * 0.25);
  UTILITY_SHAPE.stroke(ctx, color, 0.8, alpha);
  line(ctx, -2.5, 0, 2.5, 0, glowColor, 1, alpha * 0.7);
  line(ctx, 0, -2.5, 0, 2.5, glowColor, 1, alpha * 0.7);
}

class ExpandedHoldSmall extends UtilityModule {
  constructor() {
    super();
    _initUtility(this, 'expanded-hold-s');
    this.description = 'Welded-in cargo frames. More hold space — heavier hull, thinner armor.';
    this.isCargoExpansion = true;
  }
  drawAtMount(ctx, color, alpha) { _drawUtilityIcon(ctx, color, alpha, AMBER); }
}

class ExpandedHoldLarge extends UtilityModule {
  constructor() {
    super();
    _initUtility(this, 'expanded-hold-l');
    this.description = 'Full cargo bay extension. Major capacity gain — significant mass and armor penalty.';
    this.isCargoExpansion = true;
  }
  drawAtMount(ctx, color, alpha) { _drawUtilityIcon(ctx, color, alpha, AMBER); }
}

class AuxTankSmall extends UtilityModule {
  constructor() {
    super();
    _initUtility(this, 'aux-tank-s');
    this.description = 'Bolt-on fuel bladder. Extended range — adds weight, weakens hull plating.';
  }
  drawAtMount(ctx, color, alpha) { _drawUtilityIcon(ctx, color, alpha, CYAN); }
}

class AuxTankLarge extends UtilityModule {
  constructor() {
    super();
    _initUtility(this, 'aux-tank-l');
    this.description = 'Pressurized reserve tank. Long-range capability — heavy, reduces armor protection.';
  }
  drawAtMount(ctx, color, alpha) { _drawUtilityIcon(ctx, color, alpha, CYAN); }
}

class StrippedWeightSmall extends UtilityModule {
  constructor() {
    super();
    _initUtility(this, 'stripped-weight-s');
    this.description = 'Non-essential systems removed. Lighter hull — less armor protection.';
  }
  drawAtMount(ctx, color, alpha) { _drawUtilityIcon(ctx, color, alpha, GREEN); }
}

class StrippedWeightLarge extends UtilityModule {
  constructor() {
    super();
    _initUtility(this, 'stripped-weight-l');
    this.description = 'Gutted interior, thinned bulkheads. Major weight reduction — armor severely compromised.';
  }
  drawAtMount(ctx, color, alpha) { _drawUtilityIcon(ctx, color, alpha, GREEN); }
}

class ExtraArmorSmall extends UtilityModule {
  constructor() {
    super();
    _initUtility(this, 'extra-armor-s');
    this.description = 'Bolted armor plating. Better protection — heavier ship.';
  }
  drawAtMount(ctx, color, alpha) { _drawUtilityIcon(ctx, color, alpha, WHITE); }
}

class ExtraArmorLarge extends UtilityModule {
  constructor() {
    super();
    _initUtility(this, 'extra-armor-l');
    this.description = 'Heavy composite armor panels. Substantial protection boost — significant mass penalty.';
  }
  drawAtMount(ctx, color, alpha) { _drawUtilityIcon(ctx, color, alpha, WHITE); }
}

class SalvageBayModule extends UtilityModule {
  constructor() {
    super();
    _initUtility(this, 'salvage-bay');
    this.description = 'Field salvage bay. Extracts installed modules and weapons from derelicts during salvage.';
    this.hasSalvageBay = true;
  }
  drawAtMount(ctx, color, alpha) { _drawUtilityIcon(ctx, color, alpha, AMBER); }
}

class EngineeringBayModule extends UtilityModule {
  constructor() {
    super();
    _initUtility(this, 'engineering-bay');
    this.description = 'Field engineering bay. Enables hull repair using scrap while stationary.';
    this.hasEngineeringBay = true;
  }
  drawAtMount(ctx, color, alpha) { _drawUtilityIcon(ctx, color, alpha, GREEN); }
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
