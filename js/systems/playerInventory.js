import { COMMODITIES } from '@/data/commodities.js';

export class PlayerInventory {
  constructor({ startScrap = 0, player = null } = {}) {
    this.scrap = startScrap;
    this.fuel = 0;
    this.fuelMax = 0;
    this.cargo = Object.fromEntries(Object.keys(COMMODITIES).map(id => [id, 0]));
    this.modules = [];   // uninstalled ShipModule instances
    this.weapons = [];   // unequipped weapon instances from loot
    this.ammo = {};      // { autocannon: N, rocket: N, ... } reserve pool

    // Live fuel/power telemetry (updated every tick, read by HUD)
    this.fuelBurnRate = 0;
    this.reactorOutput = 0;
    this.reactorDraw = 0;

    if (player) this.initFromPlayer(player);
  }

  initFromPlayer(player) {
    this.fuel = player.fuelMax;
    this.fuelMax = player.fuelMax;
  }

  get totalCargoCapacity() {
    return this._player ? this._player.cargoCapacity : 0;
  }

  get totalCargoUsed() {
    const scrapUnits = Math.floor(this.scrap / 20);
    let ammoUnits = 0;
    if (this._player) {
      for (const w of this._player.weapons) {
        if (w.ammo !== undefined && w.ammoCargoWeight !== undefined) {
          ammoUnits += Math.ceil(w.ammo * w.ammoCargoWeight);
        }
      }
    }
    return Object.values(this.cargo).reduce((s, v) => s + v, 0) + scrapUnits + ammoUnits;
  }

  enforceCargoCapacity() {
    const cap = this.totalCargoCapacity;
    const order = Object.keys(COMMODITIES);
    while (this.totalCargoUsed > cap) {
      let jettisoned = false;
      for (const id of order) {
        if (this.cargo[id] > 0) { this.cargo[id]--; jettisoned = true; break; }
      }
      if (!jettisoned) break;
    }
  }

  // Bind to player reference (for computed getters)
  bindPlayer(player) {
    this._player = player;
  }
}
