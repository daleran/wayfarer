import { COMMODITIES } from '@data/commodities.js';
import { SCRAP_MASS, AMMO } from '@data/index.js';

export class PlayerInventory {
  constructor({ startScrap = 0, player = null } = {}) {
    this.scrap = startScrap;
    this.fuel = 0;
    this.fuelMax = 0;
    this.cargo = Object.fromEntries(Object.keys(COMMODITIES).map(id => [id, 0]));
    this.modules = [];   // uninstalled ShipModule instances
    this.weapons = [];   // unequipped weapon instances from loot
    this.ammo = {};      // { '25mm-ap': N, 'rkt': N, ... } reserve pool keyed by ammo id

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

  /** Total mass of everything in cargo (mass units). */
  get totalCargoUsed() {
    // Scrap
    let mass = this.scrap * SCRAP_MASS;

    // Commodities
    for (const [id, qty] of Object.entries(this.cargo)) {
      if (qty > 0) mass += qty * (COMMODITIES[id]?.mass ?? 1);
    }

    // Ammo in magazines (installed weapons)
    if (this._player) {
      for (const w of this._player.weapons) {
        if (w.ammo !== undefined && w.currentAmmoId) {
          mass += w.ammo * (AMMO[w.currentAmmoId]?.weight ?? 0.01);
        }
      }
    }

    // Ammo in reserve pool
    for (const [id, qty] of Object.entries(this.ammo)) {
      mass += qty * (AMMO[id]?.weight ?? 0.01);
    }

    // Modules in cargo
    for (const mod of this.modules) mass += mod.weight || 0;

    // Weapons in cargo
    for (const wep of this.weapons) mass += wep.weight || 0;

    return Math.round(mass * 10) / 10; // round to 0.1
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
