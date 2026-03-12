// Scrap is the currency and is not listed here as a commodity.
export const COMMODITIES = {
  ration_packs:      { id: 'ration_packs',      name: 'Ration Packs',       basePrice: 12  },
  recycled_polymer:  { id: 'recycled_polymer',  name: 'Recycled Polymer',   basePrice: 25  },
  bio_cultures:      { id: 'bio_cultures',      name: 'Bio-Cultures',       basePrice: 38  },
  alloys:            { id: 'alloys',            name: 'Alloys',             basePrice: 50  },
  machine_parts:     { id: 'machine_parts',     name: 'Machine Parts',      basePrice: 65  },
  hull_plating:      { id: 'hull_plating',      name: 'Hull Plating',       basePrice: 70  },
  electronics:       { id: 'electronics',       name: 'Electronics',        basePrice: 85  },
  raw_ore:           { id: 'raw_ore',           name: 'Raw Ore',            basePrice: 90  },
  medical_supplies:  { id: 'medical_supplies',  name: 'Medical Supplies',   basePrice: 100 },
  reactor_fuel:      { id: 'reactor_fuel',      name: 'Reactor Fuel',       basePrice: 125 },
  weapons_cache:     { id: 'weapons_cache',     name: 'Weapons Cache',      basePrice: 155 },
  nav_charts:        { id: 'nav_charts',        name: 'Navigation Charts',  basePrice: 175 },
  data_cores:        { id: 'data_cores',        name: 'Data Cores',         basePrice: 200 },
  contraband:        { id: 'contraband',        name: 'Contraband',         basePrice: 260 },
  void_crystals:     { id: 'void_crystals',     name: 'Void Crystals',      basePrice: 320 },
};

const SUPPLY_MULTIPLIERS = {
  surplus: 0.5,
  high:    0.7,
  medium:  1.0,
  low:     1.5,
  deficit: 2.25,
  none:    null,
};

export function getBuyPrice(commodityId, supplyLevel) {
  const mult = SUPPLY_MULTIPLIERS[supplyLevel];
  if (mult === null || mult === undefined) return null;
  return Math.round(COMMODITIES[commodityId].basePrice * mult);
}

export function getSellPrice(commodityId, supplyLevel) {
  const mult = SUPPLY_MULTIPLIERS[supplyLevel];
  if (mult === null || mult === undefined) return null;
  return Math.round(COMMODITIES[commodityId].basePrice * mult * 0.9);
}
