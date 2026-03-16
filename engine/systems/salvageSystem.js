import { createLootDrop, createAmmoDrop, createModuleDrop, createWeaponDrop } from '@/entities/lootDrop.js';
import { SALVAGE_EFFICIENCY, SALVAGE_TIME_PER_ARMOR } from '@data/index.js';

export class SalvageSystem {
  constructor() {
    this.isSalvaging = false;
    this.salvageProgress = 0;
    this.salvageTotal = 0;
    this.salvageTarget = null;
  }

  start(derelict, player) {
    const { front, port, starboard, aft } = derelict.armorArcs;
    const totalArmor = front + port + starboard + aft;
    this.isSalvaging = true;
    this.salvageProgress = 0;
    this.salvageTotal = totalArmor * SALVAGE_TIME_PER_ARMOR;
    this.salvageTarget = derelict;
    player.throttleLevel = 0;
  }

  update(dt, opts = {}) {
    if (!this.salvageTarget || !this.salvageTarget.active || this.salvageTarget.salvaged) {
      this.cancel();
      return null;
    }
    this.salvageProgress += dt;
    if (this.salvageProgress >= this.salvageTotal) return this._complete(opts);
    return null;
  }

  cancel() {
    this.isSalvaging = false;
    this.salvageProgress = 0;
    this.salvageTarget = null;
  }

  _complete(opts = {}) {
    const derelict = this.salvageTarget;
    derelict.salvaged = true;

    const lootEntities = [];
    const eff = SALVAGE_EFFICIENCY;
    const mult = 1.0; // player salvage multiplier (future upgrade)
    const rand = () => 0.5 + Math.random() * 0.5;

    // Armor ratio — damaged ships yield less of everything
    const { front, port, starboard, aft } = derelict.armorArcs;
    const totalArmor = front + port + starboard + aft;
    const maxArcs = derelict.armorArcsMax;
    const totalArmorMax = maxArcs.front + maxArcs.port + maxArcs.starboard + maxArcs.aft;
    const armorRatio = totalArmorMax > 0 ? totalArmor / totalArmorMax : 0;

    // Scrap from remaining armor
    const scrap = Math.max(1, Math.floor(totalArmor * eff * mult * rand()));
    lootEntities.push(createLootDrop(derelict.x, derelict.y, 'scrap', scrap));

    // Fuel scaled by armor ratio
    const fuel = Math.floor((derelict.fuelMax || 0) * armorRatio * mult * rand());
    if (fuel > 0) lootEntities.push(createLootDrop(derelict.x, derelict.y, 'fuel', fuel));

    // Ammo scaled by armor ratio
    for (const w of derelict.weapons) {
      if (w.magSize && w.currentAmmoId) {
        const ammo = Math.floor(w.magSize * armorRatio * mult * rand());
        if (ammo > 0) lootEntities.push(createAmmoDrop(derelict.x, derelict.y, w.currentAmmoId, ammo));
      }
    }

    // Salvage Bay — extract installed modules/weapons from derelict
    if (opts.hasSalvageBay) {
      for (const mod of (derelict.moduleSlots || [])) {
        if (!mod || mod.condition === 'destroyed') continue;
        if (mod.weapon) {
          lootEntities.push(createWeaponDrop(derelict.x, derelict.y, mod.weapon));
        } else {
          lootEntities.push(createModuleDrop(derelict.x, derelict.y, mod));
        }
      }
    }

    const particlePos = { x: derelict.x, y: derelict.y };

    this.isSalvaging = false;
    this.salvageProgress = 0;
    this.salvageTarget = null;

    return { lootEntities, particlePos };
  }
}
