import { createLootDrop, createAmmoDrop } from '@/entities/lootDrop.js';
import { SALVAGE_EFFICIENCY, SALVAGE_FUEL_RATE, SALVAGE_AMMO_RATE } from '@data/compiledData.js';

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

  update(dt) {
    if (!this.salvageTarget || !this.salvageTarget.active || this.salvageTarget.salvaged) {
      this.cancel();
      return null;
    }
    this.salvageProgress += dt;
    if (this.salvageProgress >= this.salvageTotal) return this._complete();
    return null;
  }

  cancel() {
    this.isSalvaging = false;
    this.salvageProgress = 0;
    this.salvageTarget = null;
  }

  _complete() {
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

    const particlePos = { x: derelict.x, y: derelict.y };

    this.isSalvaging = false;
    this.salvageProgress = 0;
    this.salvageTarget = null;

    return { lootEntities, particlePos };
  }
}
