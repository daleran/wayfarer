// Shared ship stat computation — used by both ShipScreen (in-game) and Designer
import { THROTTLE_RATIOS, FUEL_WEIGHT_PER_UNIT } from '@data/index.js';

/**
 * Compute hull & armor stats.
 * @param {import('@/entities/ship.js').Ship} ship
 * @param {{ live?: boolean }} [opts] - live: show current/max, otherwise just max
 * @returns {{ label: string, value: string, cls: string }[]}
 */
export function hullStats(ship, opts = {}) {
  const rows = [];
  if (opts.live) {
    const hullRatio = ship.hullCurrent / ship.hullMax;
    const hullCls = hullRatio > 0.5 ? 'green' : hullRatio > 0.25 ? '' : 'red';
    rows.push({ label: 'HULL', value: `${Math.round(ship.hullCurrent)}/${Math.round(ship.hullMax)}`, cls: hullCls });
  } else {
    rows.push({ label: 'HULL', value: `${Math.round(ship.hullMax)}`, cls: 'green' });
  }

  for (const [arc, label] of [['front', 'ARM-F'], ['port', 'ARM-P'], ['starboard', 'ARM-S'], ['aft', 'ARM-A']]) {
    if (opts.live) {
      const cur = ship.armorArcs[arc] || 0;
      const max = ship.armorArcsMax[arc] || 0;
      const ratio = max > 0 ? cur / max : 0;
      const arcCls = ratio > 0.5 ? 'green' : ratio > 0.25 ? '' : 'red';
      rows.push({ label, value: `${Math.round(cur)}/${Math.round(max)}`, cls: arcCls });
    } else {
      rows.push({ label, value: `${Math.round(ship.armorArcsMax[arc] || 0)}`, cls: 'green' });
    }
  }

  rows.push({ label: 'CARGO', value: `${ship.cargoCapacity}`, cls: 'amber' });

  return rows;
}

/**
 * Compute mass & thrust breakdown.
 * @param {import('@/entities/ship.js').Ship} ship
 * @param {{ fuel?: number, cargoMass?: number }} [opts]
 * @returns {{ label: string, value: string, cls: string }[]}
 */
export function massStats(ship, opts = {}) {
  const rows = [];

  const baseWeight = ship.baseWeight ?? 0;
  let moduleWeight = 0;
  for (const mod of (ship.moduleSlots || [])) {
    if (mod) moduleWeight += mod.weight || 0;
  }
  const fuel = opts.fuel ?? ship.fuelMax ?? 0;
  const cargoMass = opts.cargoMass ?? 0;
  const fuelWeight = Math.round(fuel * FUEL_WEIGHT_PER_UNIT);

  rows.push({ label: 'HULL MASS', value: `${baseWeight}`, cls: '' });
  rows.push({ label: 'MODULES', value: `+${moduleWeight}`, cls: '' });
  rows.push({ label: 'FUEL', value: `+${fuelWeight}`, cls: '' });
  rows.push({ label: 'CARGO', value: `+${cargoMass}`, cls: cargoMass > 0 ? 'amber' : '' });

  const totalWeight = ship._totalWeight ?? (baseWeight + moduleWeight + fuelWeight + cargoMass);
  rows.push({ label: 'TOTAL', value: `${Math.round(totalWeight)}`, cls: 'cyan' });

  const totalThrust = ship._totalThrust ?? 0;
  const twRatio = ship._twRatio ?? 0;
  const twPct = Math.round(twRatio * 100);
  const twCls = twRatio >= 1.0 ? 'green' : twRatio >= 0.8 ? '' : twRatio >= 0.5 ? 'amber' : 'red';

  rows.push({ label: 'THRUST', value: `${Math.round(totalThrust)}`, cls: 'green' });
  rows.push({ label: 'T/W', value: `${twRatio.toFixed(2)} (${twPct}%)`, cls: twCls });

  return rows;
}

/**
 * Compute derived movement stats.
 * @param {import('@/entities/ship.js').Ship} ship
 * @returns {{ label: string, value: string, cls: string }[]}
 */
export function movementStats(ship) {
  const cruiseSpeed = Math.round(ship.speedMax * THROTTLE_RATIOS[4]);
  return [
    { label: 'ACCEL', value: `${Math.round(ship.acceleration)} u/s²`, cls: 'cyan' },
    { label: 'TOP SPD', value: `${cruiseSpeed} u/s`, cls: 'cyan' },
    { label: 'TURN', value: `${(ship.turnRate * (180 / Math.PI)).toFixed(0)}°/s`, cls: 'cyan' },
  ];
}

/**
 * Compute fuel stats.
 * @param {import('@/entities/ship.js').Ship} ship
 * @param {{ fuel?: number }} [opts]
 * @returns {{ label: string, value: string, cls: string }[]}
 */
export function fuelStats(ship, opts = {}) {
  const rows = [];
  if (opts.fuel !== undefined) {
    const fuelRatio = ship.fuelMax > 0 ? opts.fuel / ship.fuelMax : 0;
    const fuelCls = fuelRatio < 0.25 ? 'red' : '';
    rows.push({ label: 'FUEL', value: `${Math.floor(opts.fuel)}/${ship.fuelMax}`, cls: fuelCls });
  } else {
    rows.push({ label: 'TANK', value: `${ship.fuelMax} u`, cls: 'amber' });
  }
  rows.push({ label: 'EFFICIENCY', value: `×${ship.fuelEfficiency.toFixed(2)}`, cls: 'amber' });
  return rows;
}

/**
 * Tooltip rows for a module.
 * @param {*} mod
 * @returns {{ label: string, value: string, cls: string }[]}
 */
export function moduleTooltipRows(mod) {
  const rows = [];
  if (mod.condition) {
    const mult = mod.conditionMultiplier;
    rows.push({ label: 'CONDITION', value: `${mod.condition.toUpperCase()} ×${mult.toFixed(2)}`, cls: mod.condition === 'good' ? 'green' : '' });
  }
  if (mod.isPowered === false && mod.powerDraw > 0) {
    rows.push({ label: 'STATUS', value: 'UNPOWERED', cls: 'red' });
  }
  const effOut = mod.effectivePowerOutput ?? mod.powerOutput;
  if (effOut > 0) rows.push({ label: 'POWER', value: `+${effOut}W`, cls: 'green' });
  if (mod.powerDraw > 0) rows.push({ label: 'DRAW', value: `-${mod.powerDraw}W`, cls: 'amber' });
  if (mod.fuelDrainRate > 0) rows.push({ label: 'FUEL DRAIN', value: `${mod.fuelDrainRate.toFixed(3)}/s`, cls: 'amber' });
  if (mod.thrust) rows.push({ label: 'THRUST', value: `${mod.thrust}`, cls: 'green' });
  if (mod.weight) rows.push({ label: 'WEIGHT', value: `${mod.weight > 0 ? '+' : ''}${mod.weight}`, cls: mod.weight < 0 ? 'green' : '' });
  if (mod.fuelEffMult && mod.fuelEffMult !== 1.0) rows.push({ label: 'FUEL EFF', value: `×${mod.fuelEffMult.toFixed(2)}`, cls: '' });
  if (mod.isUtility) {
    if (mod.cargoBonus) rows.push({ label: 'CARGO', value: `${mod.cargoBonus > 0 ? '+' : ''}${mod.cargoBonus}`, cls: mod.cargoBonus > 0 ? 'green' : 'red' });
    if (mod.fuelBonus)  rows.push({ label: 'FUEL CAP', value: `${mod.fuelBonus > 0 ? '+' : ''}${mod.fuelBonus}`, cls: mod.fuelBonus > 0 ? 'green' : 'red' });
    if (mod.armorBonus) rows.push({ label: 'ARMOR', value: `${mod.armorBonus > 0 ? '+' : ''}${mod.armorBonus}`, cls: mod.armorBonus > 0 ? 'green' : 'red' });
  }
  if (mod.isFissionReactor) {
    const interval = mod._overhaulInterval || 0;
    const elapsed = mod.timeSinceOverhaul || 0;
    if (mod.isOverdue) {
      rows.push({ label: 'OVERHAUL', value: 'OVERDUE', cls: 'red' });
    } else if (interval > 0) {
      const remaining = Math.max(0, interval - elapsed);
      const mins = Math.floor(remaining / 60);
      const secs = Math.floor(remaining % 60);
      rows.push({ label: 'OVERHAUL IN', value: `${mins}m ${secs}s`, cls: '' });
    }
    if (mod.overhaulCost) rows.push({ label: 'OVERHAUL COST', value: `${mod.overhaulCost} scrap`, cls: 'amber' });
  }
  if (mod.description) rows.push({ label: '', value: mod.description, cls: 'dim' });
  return rows;
}

/**
 * Tooltip rows for a weapon.
 * @param {*} wep
 * @returns {{ label: string, value: string, cls: string }[]}
 */
export function weaponTooltipRows(wep) {
  const rows = [];
  if (wep.damage) rows.push({ label: 'DAMAGE', value: `${wep.damage}`, cls: 'red' });
  if (wep.hullDamage) rows.push({ label: 'HULL DMG', value: `${wep.hullDamage}`, cls: 'red' });
  if (wep.maxRange) rows.push({ label: 'RANGE', value: `${wep.maxRange}`, cls: '' });
  if (wep.cooldownMax) rows.push({ label: 'FIRE RATE', value: `${(1 / wep.cooldownMax).toFixed(1)}/s`, cls: '' });
  if (wep.magSize) rows.push({ label: 'MAGAZINE', value: `${wep.magSize}`, cls: '' });
  if (wep.isBeam) rows.push({ label: 'TYPE', value: 'BEAM', cls: 'cyan' });
  if (wep.blastRadius) rows.push({ label: 'BLAST', value: `${wep.blastRadius}`, cls: 'amber' });
  if (wep.isSecondary) rows.push({ label: 'SLOT', value: 'SECONDARY', cls: '' });
  return rows;
}
