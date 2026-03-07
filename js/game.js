import { Camera } from './camera.js';
import { Renderer } from './renderer.js';
import { HUD } from './hud.js';
import { input } from './input.js';
import { MAP } from './data/map.js';
import { createScrapShip } from './ships/player/flagship.js';
import { createRaider } from './enemies/scavengers/raider.js';
import { Autocannon } from './weapons/autocannon.js';
import { ParticlePool } from './systems/particlePool.js';
import { updateRaiderAI } from './ai/raiderAI.js';
import { updateFleetShipAI } from './ai/fleetAI.js';
import { Ship } from './entities/ship.js';
import { Projectile } from './entities/projectile.js';
import { LootDrop, generateEnemyLoot, createLootDrop } from './entities/lootDrop.js';
import { Station, createStation } from './world/station.js';
import { createPlanet } from './world/planet.js';
import { Derelict, createDerelict } from './world/derelict.js';
import { StationScreen } from './ui/stationScreen.js';

const FLAGSHIP_START = { x: 2000, y: 3000 };
const FUEL_RATES = [0, 0, 0.3, 0.6, 1.0, 2.5];

export class GameManager {
  constructor(options = {}) {
    this.canvas = null;
    this.ctx = null;
    this.entities = [];
    this.player = null;
    this.fleet = [];
    this.raiders = [];
    this.camera = null;
    this.renderer = null;
    this.hud = null;
    this.particlePool = null;
    this.map = options.map || MAP;
    this.isTestMode = options.testMode || false;
    this.testSteps = options.testSteps || [];
    this.credits = options.testMode ? 2000 : 500;
    this.scrap = options.startScrap ?? (options.testMode ? 30 : 10);
    this.fuel = 100;
    this.fuelMax = 100;
    this.cargo = { food: 0, ore: 0, tech: 0, exotics: 0 };
    this.isDocked = false;
    this.stationScreen = null;
    this.nearbyStation = null;
    this.nearbyDerelict = null;
    this._cachedMouseWorld = null;
    this._raiderRespawnQueue = [];

    // Salvage state
    this.isSalvaging = false;
    this.salvageProgress = 0;
    this.salvageTotal = 0;
    this.salvageTarget = null;
  }

  init() {
    // Canvas setup
    this.canvas = document.getElementById('game');
    this._resizeCanvas();
    this.ctx = this.canvas.getContext('2d');

    window.addEventListener('resize', () => {
      this._resizeCanvas();
      this.camera.width = this.canvas.width;
      this.camera.height = this.canvas.height;
    });

    // Camera
    this.camera = new Camera(this.canvas.width, this.canvas.height);

    // HUD
    this.hud = new HUD();

    // Station screen overlay
    this.stationScreen = new StationScreen();

    // Renderer (generates starfield)
    this.renderer = new Renderer(this.ctx, this.map.mapSize);

    // Particle pool
    this.particlePool = new ParticlePool();

    // Spawn flagship
    const start = this.map.playerStart || FLAGSHIP_START;
    this.player = createScrapShip(start.x, start.y);
    this.player.addWeapon(new Autocannon());
    this.entities.push(this.player);

    // Spawn world entities from map data
    for (const s of this.map.stations) this.entities.push(createStation(s));
    for (const p of this.map.planets)  this.entities.push(createPlanet(p));

    // Spawn derelicts from map data
    for (const d of (this.map.derelicts || [])) {
      this.entities.push(createDerelict(d));
    }

    // Spawn raiders near their assigned stations
    for (const spawn of (this.map.raiderSpawns || [])) {
      const station = this.map.stations.find(s => s.id === spawn.stationId);
      const home = station ? { x: station.x, y: station.y } : { x: spawn.x, y: spawn.y };
      for (let i = 0; i < spawn.count; i++) {
        const angle = (i / spawn.count) * Math.PI * 2 + Math.random() * 0.5;
        const dist = 150 + Math.random() * 200;
        const rx = home.x + Math.sin(angle) * dist;
        const ry = home.y - Math.cos(angle) * dist;
        const raider = createRaider(rx, ry);
        raider.homePosition = { x: home.x, y: home.y };
        this.entities.push(raider);
        this.raiders.push(raider);
      }
    }

    // Snap camera to player immediately (no lerp on first frame)
    this.camera.x = this.player.x;
    this.camera.y = this.player.y;
  }

  _resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  update(dt) {
    input.tick();

    if (this.isDocked) {
      this.stationScreen.update(dt, this);
      this.stationScreen.handleInput(input, this);
      if (!this.stationScreen.visible) this.isDocked = false;
      return;
    }

    // Salvage state machine
    if (this.isSalvaging) {
      this._updateSalvage(dt);
    }

    this._processInput(dt);

    // Fuel consumption
    this._consumeFuel(dt);

    for (const entity of this.entities) {
      if (!entity.active) continue;
      // Freeze player during salvage (fleet and everything else still updates)
      if (this.isSalvaging && entity === this.player) continue;
      entity.update(dt);
    }

    for (const raider of this.raiders) {
      if (raider.active) updateRaiderAI(raider, this.player, this.entities, dt);
    }

    // Player auto-fire turret weapons at nearest enemy (disabled during salvage)
    const enemies = this.raiders.filter(r => r.active);
    if (this.player && this.player.active && !this.isSalvaging) {
      this.player.fireAutoWeapons(enemies, this.entities);
    }

    // Fleet AI
    for (const ship of this.fleet) {
      if (ship.active) {
        updateFleetShipAI(ship, this.player, this._cachedMouseWorld, enemies, this.entities, dt);
      }
    }

    // Armor repair (consumes scrap)
    this._updateArmorRepair(dt);

    this.particlePool.update(dt);
    this._runCollisions();
    this._checkLootPickups();
    this._processRaiderRespawns(dt);
    this._updateDerelictSparks(dt);
    this._purgeInactive();

    // Check derelicts before docking (E-key priority)
    this._checkDerelictInteraction();
    if (!this.isSalvaging) {
      this._checkDocking();
    }

    if (this.player && this.player.active) {
      this.camera.follow(this.player, dt);
    }
  }

  _consumeFuel(dt) {
    if (!this.player || !this.player.active) return;
    const rate = FUEL_RATES[this.player.throttleLevel] || 0;
    if (rate > 0) {
      this.fuel -= rate * dt;
      if (this.fuel <= 0) {
        this.fuel = 0;
        // Clamp all player ships to throttle 1 (free crawl)
        if (this.player.throttleLevel > 1) this.player.throttleLevel = 1;
        for (const ship of this.fleet) {
          if (ship.throttleLevel > 1) ship.throttleLevel = 1;
        }
      }
    }
  }

  _updateArmorRepair(dt) {
    if (!this._repairAccum) this._repairAccum = new Map();
    const ships = [this.player, ...this.fleet].filter(s => s && s.active);
    for (const ship of ships) {
      if (ship.crewCurrent <= 0 || ship.throttleLevel !== 0) {
        this._repairAccum.delete(ship);
        continue;
      }
      if (this.scrap <= 0) break;

      const repairRate = ship.crewRepairRate * ship.crewCurrent * ship.crewEfficiency * dt;
      let accum = this._repairAccum.get(ship) || 0;

      // Repair armor first
      if (ship.armorCurrent < ship.armorMax) {
        accum += repairRate;
        // Spend 1 scrap per whole point repaired
        while (accum >= 1 && this.scrap > 0 && ship.armorCurrent < ship.armorMax) {
          ship.armorCurrent = Math.min(ship.armorCurrent + 1, ship.armorMax);
          this.scrap--;
          accum -= 1;
        }
        this._repairAccum.set(ship, accum);
        continue; // finish armor before hull
      }

      // Then repair hull (only if above 50%)
      const hullRatio = ship.hullCurrent / ship.hullMax;
      if (hullRatio >= 0.5 && ship.hullCurrent < ship.hullMax) {
        accum += repairRate * 0.5; // hull repairs slower
        while (accum >= 1 && this.scrap > 0 && ship.hullCurrent < ship.hullMax) {
          ship.hullCurrent = Math.min(ship.hullCurrent + 1, ship.hullMax);
          this.scrap--;
          accum -= 1;
        }
        this._repairAccum.set(ship, accum);
        continue;
      }

      this._repairAccum.delete(ship);
    }
  }

  _processInput(dt) {
    const p = this.player;
    if (!p || !p.active) return;

    // Cache mouse world position for fleet AI
    this._cachedMouseWorld = input.mouseWorld(this.camera);

    // Cancel salvage with E or Esc
    if (this.isSalvaging) {
      if (input.wasJustPressed('e') || input.wasJustPressed('escape')) {
        this._cancelSalvage();
      }
      return; // No other input while salvaging
    }

    // Throttle steps once per keypress (not held)
    if (input.wasJustPressed('w') || input.wasJustPressed('arrowup')) p.increaseThrottle();
    if (input.wasJustPressed('s') || input.wasJustPressed('arrowdown')) p.decreaseThrottle();

    // Clamp throttle if out of fuel
    if (this.fuel <= 0 && p.throttleLevel > 1) p.throttleLevel = 1;

    // Rotation is continuous while held
    if (input.isDown('a') || input.isDown('arrowleft')) p.rotationInput = -1;
    if (input.isDown('d') || input.isDown('arrowright')) p.rotationInput = 1;

    // LMB or spacebar fires manual weapons toward cursor
    if (input.mouseButtons.left || input.isDown(' ')) {
      const manualWeapons = p.weapons.filter(w => !w.isAutoFire);
      for (const w of manualWeapons) {
        w.fire(p, this._cachedMouseWorld.x, this._cachedMouseWorld.y, this.entities);
      }
    }
  }

  _checkDerelictInteraction() {
    this.nearbyDerelict = null;
    if (this.isSalvaging) return;
    if (!this.player || !this.player.active) return;

    for (const entity of this.entities) {
      if (!(entity instanceof Derelict) || !entity.active || entity.salvaged) continue;
      const dx = entity.x - this.player.x;
      const dy = entity.y - this.player.y;
      if (Math.sqrt(dx * dx + dy * dy) < entity.interactionRadius) {
        this.nearbyDerelict = entity;
        break;
      }
    }

    if (this.nearbyDerelict && input.wasJustPressed('e')) {
      this._startSalvage(this.nearbyDerelict);
    }
  }

  _startSalvage(derelict) {
    this.isSalvaging = true;
    this.salvageProgress = 0;
    this.salvageTotal = derelict.salvageTime;
    this.salvageTarget = derelict;
    // Freeze player
    this.player.throttleLevel = 0;
  }

  _updateSalvage(dt) {
    if (!this.salvageTarget || !this.salvageTarget.active || this.salvageTarget.salvaged) {
      this._cancelSalvage();
      return;
    }
    this.salvageProgress += dt;
    if (this.salvageProgress >= this.salvageTotal) {
      this._completeSalvage();
    }
  }

  _completeSalvage() {
    const derelict = this.salvageTarget;
    derelict.salvaged = true;
    derelict.active = false;

    // Spawn loot from loot table
    for (const loot of derelict.lootTable) {
      const drop = createLootDrop(derelict.x, derelict.y, loot.type, loot.amount);
      this.entities.push(drop);
    }

    this.particlePool.explosion(derelict.x, derelict.y, 10);
    this.isSalvaging = false;
    this.salvageProgress = 0;
    this.salvageTarget = null;
  }

  _cancelSalvage() {
    this.isSalvaging = false;
    this.salvageProgress = 0;
    this.salvageTarget = null;
  }

  _updateDerelictSparks(dt) {
    for (const entity of this.entities) {
      if (!(entity instanceof Derelict) || !entity.active || entity.salvaged) continue;
      entity._sparkTimer += dt;
      if (entity._sparkTimer >= 1.0) {
        entity._sparkTimer -= 1.0;
        this.particlePool.explosion(
          entity.x + (Math.random() - 0.5) * 16,
          entity.y + (Math.random() - 0.5) * 16,
          3
        );
      }
    }
  }

  _checkLootPickups() {
    if (!this.player || !this.player.active) return;
    const px = this.player.x;
    const py = this.player.y;

    for (const entity of this.entities) {
      if (!(entity instanceof LootDrop) || !entity.active) continue;
      const dx = entity.x - px;
      const dy = entity.y - py;
      if (Math.sqrt(dx * dx + dy * dy) < entity.pickupRadius) {
        if (entity.lootType === 'credits') {
          this.credits += entity.amount;
          entity.active = false;
          this.hud.addPickupText(entity.label, entity.x, entity.y);
        } else if (entity.lootType === 'scrap') {
          this.scrap += entity.amount;
          entity.active = false;
          this.hud.addPickupText(entity.label, entity.x, entity.y);
        } else {
          // Commodity — only if cargo not full
          if (this.totalCargoUsed < this.totalCargoCapacity) {
            this.cargo[entity.lootType] = (this.cargo[entity.lootType] || 0) + entity.amount;
            entity.active = false;
            this.hud.addPickupText(entity.label, entity.x, entity.y);
          }
        }
      }
    }
  }

  _processRaiderRespawns(dt) {
    for (let i = this._raiderRespawnQueue.length - 1; i >= 0; i--) {
      const entry = this._raiderRespawnQueue[i];
      entry.timer -= dt;
      if (entry.timer <= 0) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 150 + Math.random() * 200;
        const rx = entry.homePosition.x + Math.sin(angle) * dist;
        const ry = entry.homePosition.y - Math.cos(angle) * dist;
        const raider = createRaider(rx, ry);
        raider.homePosition = { x: entry.homePosition.x, y: entry.homePosition.y };
        this.entities.push(raider);
        this.raiders.push(raider);
        this._raiderRespawnQueue.splice(i, 1);
      }
    }
  }

  _checkDocking() {
    this.nearbyStation = null;
    for (const entity of this.entities) {
      if (!(entity instanceof Station)) continue;
      const dx = entity.x - this.player.x;
      const dy = entity.y - this.player.y;
      if (Math.sqrt(dx * dx + dy * dy) < entity.dockingRadius) {
        this.nearbyStation = entity;
        break;
      }
    }
    if (this.nearbyStation && input.wasJustPressed('e')) {
      this.isDocked = true;
      this.stationScreen.open(this.nearbyStation);
    }
  }

  _runCollisions() {
    for (const entity of this.entities) {
      if (!entity.active || !(entity instanceof Projectile)) continue;
      const proj = entity;
      const pb = proj.getBounds();

      for (const target of this.entities) {
        if (!target.active || !(target instanceof Ship)) continue;
        if (proj.owner === target) continue;
        if (proj.owner.faction && target.faction && proj.owner.faction === target.faction) continue;

        const sb = target.getBounds();
        const dx = pb.x - sb.x;
        const dy = pb.y - sb.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < pb.radius + sb.radius) {
          target.takeDamage(proj.damage, proj.hullDamage);
          proj.active = false;
          this.particlePool.explosion(proj.x, proj.y, 5);
          if (target.isDestroyed) {
            this.particlePool.explosion(target.x, target.y, 20);
            if (target !== this.player && !this.fleet.includes(target)) {
              // Spawn loot drops instead of direct credit award
              const drops = generateEnemyLoot(target.x, target.y);
              for (const drop of drops) this.entities.push(drop);
            }
          }
          break;
        }
      }
    }
  }

  _purgeInactive() {
    const fleetBefore = this.fleet.length;

    // Queue destroyed raiders for respawn (test mode only)
    if (this.isTestMode) {
      for (const r of this.raiders) {
        if (!r.active && r.homePosition) {
          this._raiderRespawnQueue.push({
            timer: 60,
            homePosition: { x: r.homePosition.x, y: r.homePosition.y },
          });
        }
      }
    }

    this.entities = this.entities.filter(e => e.active);
    this.raiders = this.raiders.filter(r => r.active);
    this.fleet = this.fleet.filter(s => s.active);
    if (this.fleet.length < fleetBefore) {
      this._enforceCargoCapacity();
    }
  }

  get totalCargoCapacity() {
    let cap = this.player ? this.player.cargoCapacity : 0;
    for (const ship of this.fleet) cap += ship.cargoCapacity;
    return cap;
  }

  get totalCargoUsed() {
    return Object.values(this.cargo).reduce((s, v) => s + v, 0);
  }

  _enforceCargoCapacity() {
    const cap = this.totalCargoCapacity;
    const order = ['food', 'ore', 'tech', 'exotics'];
    while (this.totalCargoUsed > cap) {
      let jettisoned = false;
      for (const id of order) {
        if (this.cargo[id] > 0) {
          this.cargo[id]--;
          jettisoned = true;
          break;
        }
      }
      if (!jettisoned) break;
    }
  }

  assignFormationOffsets() {
    let brawlerIdx = 0;
    let kiterIdx = 0;
    let haulerIdx = 0;

    for (const ship of this.fleet) {
      switch (ship.behaviorType) {
        case 'brawler': {
          const side = brawlerIdx % 2 === 0 ? 1 : -1;
          ship.formationOffset = { x: side * 45, y: -20 };
          brawlerIdx++;
          break;
        }
        case 'kiter': {
          const side = kiterIdx % 2 === 0 ? 1 : -1;
          ship.formationOffset = { x: side * 55, y: 30 };
          kiterIdx++;
          break;
        }
        case 'flee':
        default: {
          ship.formationOffset = { x: 0, y: 60 + haulerIdx * 35 };
          haulerIdx++;
          break;
        }
      }
    }
  }

  render() {
    this.renderer.render(this);
  }
}
