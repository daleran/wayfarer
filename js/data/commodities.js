// Scrap is the currency and is not listed here as a commodity.
export const COMMODITIES = {
  ration_packs:      { id: 'ration_packs',      name: 'Ration Packs',       basePrice: 12,  mass: 0.5 },
  recycled_polymer:  { id: 'recycled_polymer',  name: 'Recycled Polymer',   basePrice: 25,  mass: 1.0 },
  bio_cultures:      { id: 'bio_cultures',      name: 'Bio-Cultures',       basePrice: 38,  mass: 0.5 },
  alloys:            { id: 'alloys',            name: 'Alloys',             basePrice: 50,  mass: 2.0 },
  machine_parts:     { id: 'machine_parts',     name: 'Machine Parts',      basePrice: 65,  mass: 1.5 },
  hull_plating:      { id: 'hull_plating',      name: 'Hull Plating',       basePrice: 70,  mass: 3.0 },
  electronics:       { id: 'electronics',       name: 'Electronics',        basePrice: 85,  mass: 0.5 },
  raw_ore:           { id: 'raw_ore',           name: 'Raw Ore',            basePrice: 90,  mass: 4.0 },
  medical_supplies:  { id: 'medical_supplies',  name: 'Medical Supplies',   basePrice: 100, mass: 1.0 },
  reactor_fuel:      { id: 'reactor_fuel',      name: 'Reactor Fuel',       basePrice: 125, mass: 2.0 },
  weapons_cache:     { id: 'weapons_cache',     name: 'Weapons Cache',      basePrice: 155, mass: 3.0 },
  nav_charts:        { id: 'nav_charts',        name: 'Navigation Charts',  basePrice: 175, mass: 0.2 },
  data_cores:        { id: 'data_cores',        name: 'Data Cores',         basePrice: 200, mass: 0.5 },
  contraband:        { id: 'contraband',        name: 'Contraband',         basePrice: 260, mass: 1.0 },
  void_crystals:     { id: 'void_crystals',     name: 'Void Crystals',      basePrice: 320, mass: 0.5 },
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
