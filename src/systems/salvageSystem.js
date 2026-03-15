import { createLootDrop, createAmmoDrop, createModuleDrop, createWeaponDrop } from '@/entities/lootDrop.js';
import { SALVAGE_EFFICIENCY, SALVAGE_FUEL_RATE, SALVAGE_AMMO_RATE } from '@data/index.js';

export class SalvageSystem {
  constructor() {
    this.isSalvaging = false;
    this.salvageProgress = 0;
    this.salvageTotal = 0;
    this.salvageTarget = null;
  }

  start(derelict, player) {
    this.isSalvaging = true;
    this.salvageProgress = 0;
    this.salvageTotal = derelict.salvageTime;
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

    // Scrap from remaining armor
    const { front, port, starboard, aft } = derelict.armorArcs;
    const totalArmor = front + port + starboard + aft;
    const scrap = Math.max(1, Math.floor(totalArmor * eff * mult * rand()));
    lootEntities.push(createLootDrop(derelict.x, derelict.y, 'scrap', scrap));

    // Fuel from tank size
    const fuel = Math.floor((derelict.fuelMax || 0) * SALVAGE_FUEL_RATE * mult * rand());
    if (fuel > 0) lootEntities.push(createLootDrop(derelict.x, derelict.y, 'fuel', fuel));

    // Ammo from each weapon's magazine
    for (const w of derelict.weapons) {
      if (w.magSize && w.currentAmmoId) {
        const ammo = Math.floor(w.magSize * SALVAGE_AMMO_RATE * mult * rand());
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
