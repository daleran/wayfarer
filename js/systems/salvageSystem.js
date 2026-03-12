import { createLootDrop, createModuleDrop, createWeaponDrop, createAmmoDrop } from '../entities/lootDrop.js';
import { createModuleById } from '../modules/registry.js';
import { Autocannon } from '../modules/weapons/autocannon.js';
import { Cannon } from '../modules/weapons/cannon.js';
import { Lance } from '../modules/weapons/lance.js';
import { CONDITION_DISTRIBUTIONS } from '../data/lootTables.js';

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
    derelict.active = false;

    const lootEntities = [];
    for (const loot of derelict.lootTable) {
      if (loot.type === 'moduleId') {
        const mod = this._createModuleById(loot.id);
        if (mod) {
          mod.condition = loot.condition || this._rollCondition(derelict.derelictClass);
          lootEntities.push(createModuleDrop(derelict.x, derelict.y, mod));
        }
      } else if (loot.type === 'weaponId') {
        const wep = this._createWeaponById(loot.id);
        if (wep) lootEntities.push(createWeaponDrop(derelict.x, derelict.y, wep));
      } else if (loot.type === 'ammo') {
        lootEntities.push(createAmmoDrop(derelict.x, derelict.y, loot.ammoType, loot.amount));
      } else {
        lootEntities.push(createLootDrop(derelict.x, derelict.y, loot.type, loot.amount));
      }
    }

    const particlePos = { x: derelict.x, y: derelict.y };

    this.isSalvaging = false;
    this.salvageProgress = 0;
    this.salvageTarget = null;

    return { lootEntities, particlePos };
  }

  _rollCondition(derelictClass) {
    const dist = CONDITION_DISTRIBUTIONS[derelictClass] ?? CONDITION_DISTRIBUTIONS.hauler;
    let roll = Math.random();
    for (const [condition, weight] of Object.entries(dist)) {
      roll -= weight;
      if (roll <= 0) return condition;
    }
    return 'worn';
  }

  _createModuleById(id) {
    try {
      return createModuleById(id);
    } catch {
      return null;
    }
  }

  _createWeaponById(id) {
    const map = {
      Autocannon: () => new Autocannon(),
      Cannon: () => new Cannon(),
      LanceSmall: () => new Lance('small'),
    };
    return map[id] ? map[id]() : null;
  }
}
