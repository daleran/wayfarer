import {
  REPAIR_RATE, REPAIR_COST_PER_PT,
  MODULE_REPAIR_RATE, MODULE_REPAIR_COST,
} from '@data/compiledData.js';
import {
  MODULE_BREACH_HULL_THRESHOLD, MODULE_BREACH_CHANCE_LOW,
  MODULE_BREACH_CHANCE_MID, MODULE_BREACH_CHANCE_HIGH,
} from '@data/compiledData.js';

const CONDITION_STEPS = ['good', 'worn', 'faulty', 'damaged', 'destroyed'];

export class RepairSystem {
  constructor() {
    this.isRepairing = false;
    this._repairAccum = 0;
    this._moduleRepairAccum = 0;
  }

  start() {
    this.isRepairing = true;
    this._repairAccum = 0;
    this._moduleRepairAccum = 0;
  }

  cancel() {
    this.isRepairing = false;
    this._repairAccum = 0;
    this._moduleRepairAccum = 0;
  }

  update(dt, player, scrap) {
    if (!player || !player.active) return { scrapSpent: 0, done: false };

    let scrapSpent = 0;

    // Armor repair
    this._repairAccum += REPAIR_RATE * dt;
    const arcOrder = ['front', 'port', 'starboard', 'aft'];
    while (this._repairAccum >= 1 && scrap - scrapSpent > 0) {
      let targetArc = null;
      let maxDiff = 0;
      for (const arc of arcOrder) {
        const diff = player.armorArcsMax[arc] - player.armorArcs[arc];
        if (diff > maxDiff) { maxDiff = diff; targetArc = arc; }
      }
      if (!targetArc || maxDiff < 1) break;
      player.armorArcs[targetArc] = Math.min(player.armorArcs[targetArc] + 1, player.armorArcsMax[targetArc]);
      scrapSpent += REPAIR_COST_PER_PT;
      this._repairAccum -= 1;
    }

    // Module repair — runs in parallel with armor repair
    if (this.hasModulesToRepair(player) && scrap - scrapSpent >= MODULE_REPAIR_COST) {
      this._moduleRepairAccum += MODULE_REPAIR_RATE * dt;
      if (this._moduleRepairAccum >= 1) {
        this._moduleRepairAccum -= 1;
        if (scrap - scrapSpent >= MODULE_REPAIR_COST) {
          const mod = this._worstDamagedModule(player);
          if (mod) {
            this._improveCondition(mod, player);
            scrapSpent += MODULE_REPAIR_COST;
          }
        }
      }
    } else {
      this._moduleRepairAccum = 0;
    }

    const armorDone = player.armorCurrent >= player.armorMax;
    const modsDone = !this.hasModulesToRepair(player);
    const done = (armorDone && modsDone) || scrap - scrapSpent <= 0;
    if (done) this.cancel();

    return { scrapSpent, done };
  }

  hasModulesToRepair(player) {
    const slots = player?.moduleSlots;
    if (!slots) return false;
    return slots.some(m => m && m.condition && m.condition !== 'good');
  }

  maybeBreachModule(ship, hitArc) {
    const ratio = ship.hullCurrent / ship.hullMax;
    if (ratio >= MODULE_BREACH_HULL_THRESHOLD) return null;

    let chance;
    if (ratio < 0.10) chance = MODULE_BREACH_CHANCE_HIGH;
    else if (ratio < 0.30) chance = MODULE_BREACH_CHANCE_MID;
    else chance = MODULE_BREACH_CHANCE_LOW;

    if (Math.random() >= chance) return null;

    const slots = ship.moduleSlots ?? [];
    const mounts = ship._mountPoints;

    // Prefer modules in the hit arc; fall back to all non-destroyed modules
    let candidates;
    if (hitArc && mounts) {
      candidates = slots.filter((m, i) =>
        m && m.condition !== 'destroyed' && mounts[i]?.arc === hitArc
      );
    }
    if (!candidates || candidates.length === 0) {
      candidates = slots.filter(m => m && m.condition !== 'destroyed');
    }
    if (candidates.length === 0) return null;

    const mod = candidates[Math.floor(Math.random() * candidates.length)];
    const degraded = this._degradeCondition(mod, ship);
    if (degraded) {
      return {
        text: `${mod.displayName} ${mod.condition.toUpperCase()}`,
        colorHint: 'breach',
      };
    }
    return null;
  }

  _worstDamagedModule(player) {
    const slots = player?.moduleSlots ?? [];
    let worst = null;
    let worstIdx = 0;
    for (const mod of slots) {
      if (!mod || !mod.condition) continue;
      const idx = CONDITION_STEPS.indexOf(mod.condition);
      if (idx > worstIdx) { worstIdx = idx; worst = mod; }
    }
    return worst;
  }

  _improveCondition(mod, player) {
    const idx = CONDITION_STEPS.indexOf(mod.condition);
    if (idx <= 0) return;
    mod.condition = CONDITION_STEPS[idx - 1];
    mod._applyConditionToWeapon();
    player?.recalcTW?.();
    player?.refreshCapabilities();
  }

  _degradeCondition(mod, player) {
    const idx = CONDITION_STEPS.indexOf(mod.condition);
    if (idx < 0 || idx >= CONDITION_STEPS.length - 1) return false;
    mod.condition = CONDITION_STEPS[idx + 1];
    mod._applyConditionToWeapon();
    player?.recalcTW?.();
    player?.refreshCapabilities();
    return true;
  }
}
