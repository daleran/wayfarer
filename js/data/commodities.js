// Scrap is the currency and is not listed here as a commodity.
export const COMMODITIES = {
  food:    { id: 'food',    name: 'Food',    basePrice: 10 },
  ore:     { id: 'ore',     name: 'Ore',     basePrice: 80 },
  tech:    { id: 'tech',    name: 'Tech',    basePrice: 50 },
  exotics: { id: 'exotics', name: 'Exotics', basePrice: 200 },
};

export const SUPPLY_MULTIPLIERS = {
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
