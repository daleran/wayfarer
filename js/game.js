import { Camera } from './camera.js';
import { Renderer } from './renderer.js';
import { HUD } from './hud.js';
import { input } from './input.js';
import { MAP } from './data/map.js';
import { createScrapShip } from './ships/player/flagship.js';
import { createRaider } from './enemies/scavengers/raider.js';
import { Autocannon } from './weapons/autocannon.js';
import { LaserTurret } from './weapons/laserTurret.js';
import { Rocket } from './weapons/rocket.js';
import { ParticlePool } from './systems/particlePool.js';
import { updateRaiderAI } from './ai/raiderAI.js';
import { Ship } from './entities/ship.js';
import { Projectile } from './entities/projectile.js';
import { LootDrop, generateEnemyLoot, createLootDrop } from './entities/lootDrop.js';
import { Station, createStation } from './world/station.js';
import { createCoilStation } from './world/coilStation.js';
import { createArkshipSpine } from './world/arkshipSpine.js';
import { createDebrisCloud } from './world/debrisCloud.js';
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
    this.raiders = [];
    this.camera = null;
    this.renderer = null;
    this.hud = null;
    this.particlePool = null;
    this.map = options.map || MAP;
    this.isTestMode  = options.testMode  || false;
    this.testSteps   = options.testSteps || [];
    this._addRockets = options.addRockets || false;
    this.scrap = options.startScrap ?? 20;
    this.fuel = 100;
    this.fuelMax = 100;
    this.cargo = { food: 0, ore: 0, tech: 0, exotics: 0 };
    this.isDocked = false;
    this.stationScreen = null;
    this.nearbyStation = null;
    this.nearbyDerelict = null;
    this._cachedMouseWorld = null;
    this._raiderRespawnQueue = [];
    this._prevMouseRight = false;

    // Salvage state
    this.isSalvaging = false;
    this.salvageProgress = 0;
    this.salvageTotal = 0;
    this.salvageTarget = null;

    // Repair state
    this.isRepairing = false;
    this._repairAccum = 0;
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

    // Renderer (generates starfield + zone atmosphere)
    this.renderer = new Renderer(this.ctx, this.map.mapSize, this.map.zones);

    // Particle pool
    this.particlePool = new ParticlePool();

    // Spawn flagship
    const start = this.map.playerStart || FLAGSHIP_START;
    this.player = createScrapShip(start.x, start.y);
    this.player.addWeapon(new Autocannon());
    if (this._addRockets) this.player.addWeapon(new Rocket());
    this.entities.push(this.player);

    // Spawn world entities from map data
    for (const s of this.map.stations) {
      const station = s.renderer === 'coil' ? createCoilStation(s) : createStation(s);
      this.entities.push(station);
    }
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
        if (spawn.behaviorType) raider.behaviorType = spawn.behaviorType;
        this.entities.push(raider);
        this.raiders.push(raider);
      }
    }

    // Spawn Gravewake terrain entities
    for (const spine of (this.map.arkshipSpines || []))
      this.entities.push(createArkshipSpine(spine));
    for (const cloud of (this.map.wallOfWrecks || []))
      this.entities.push(createDebrisCloud(cloud));

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
      // Freeze player during salvage or repair
      if ((this.isSalvaging || this.isRepairing) && entity === this.player) continue;
      entity.update(dt);
    }

    for (const raider of this.raiders) {
      if (raider.active) updateRaiderAI(raider, this.player, this.entities, dt);
    }

    // Player auto-fire turret weapons at nearest enemy (disabled during salvage/repair)
    const enemies = this.raiders.filter(r => r.active);
    if (this.player && this.player.active && !this.isSalvaging && !this.isRepairing) {
      this.player.fireAutoWeapons(enemies, this.entities);
    }

    // Active repair (player-initiated via Hold R)
    if (this.isRepairing) this._updateRepair(dt);


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
        if (this.player.throttleLevel > 1) this.player.throttleLevel = 1;
      }
    }
  }

  _startRepair() {
    this.isRepairing = true;
    this._repairAccum = 0;
  }

  _cancelRepair() {
    this.isRepairing = false;
    this._repairAccum = 0;
  }

  _updateRepair(dt) {
    const ship = this.player;
    if (!ship || !ship.active) return;

    const REPAIR_RATE = 1.5; // armor/sec, 1 scrap per point
    this._repairAccum += REPAIR_RATE * dt;

    const arcOrder = ['front', 'port', 'starboard', 'aft'];
    while (this._repairAccum >= 1 && this.scrap > 0) {
      // Repair the most depleted arc
      let targetArc = null;
      let maxDiff = 0;
      for (const arc of arcOrder) {
        const diff = ship.armorArcsMax[arc] - ship.armorArcs[arc];
        if (diff > maxDiff) { maxDiff = diff; targetArc = arc; }
      }
      if (!targetArc || maxDiff < 1) break; // all arcs full
      ship.armorArcs[targetArc] = Math.min(ship.armorArcs[targetArc] + 1, ship.armorArcsMax[targetArc]);
      this.scrap--;
      this._repairAccum -= 1;
    }

    // Auto-cancel when done or out of scrap
    if (ship.armorCurrent >= ship.armorMax || this.scrap <= 0) {
      this._cancelRepair();
    }
  }

  _handleTestInput() {
    const mx = this._cachedMouseWorld?.x ?? (this.player.x + 300);
    const my = this._cachedMouseWorld?.y ?? this.player.y;

    const spawnRaider = (behaviorType) => {
      const r = createRaider(mx, my);
      r.homePosition = { x: mx, y: my };
      r.behaviorType = behaviorType;
      r._aggro = true;
      this.entities.push(r);
      this.raiders.push(r);
    };

    if (input.wasJustPressed('z')) spawnRaider('shielding');
    if (input.wasJustPressed('x')) spawnRaider('kiter');
    if (input.wasJustPressed('c')) spawnRaider('interceptor');

    if (input.wasJustPressed('q')) {
      const hasLaser = this.player.weapons.some(w => w instanceof LaserTurret);
      if (hasLaser) {
        this.player.weapons = this.player.weapons.filter(w => !(w instanceof LaserTurret));
      } else {
        this.player.addWeapon(new LaserTurret());
      }
    }
  }

  _processInput(dt) {
    const p = this.player;
    if (!p || !p.active) return;

    this._cachedMouseWorld = input.mouseWorld(this.camera);

    if (this.isTestMode) this._handleTestInput();

    // Always track right mouse button state to avoid false fires after state changes
    const rightJustPressed = input.mouseButtons.right && !this._prevMouseRight;
    this._prevMouseRight = input.mouseButtons.right;

    // Cancel salvage with E or Esc
    if (this.isSalvaging) {
      if (input.wasJustPressed('e') || input.wasJustPressed('escape')) {
        this._cancelSalvage();
      }
      return; // No other input while salvaging
    }

    // Repair: press R to toggle, auto-cancels if conditions not met
    if (this.isRepairing) {
      const stillValid = p.throttleLevel === 0 && p.armorCurrent < p.armorMax && this.scrap > 0;
      if (!stillValid || input.wasJustPressed('escape')) {
        this._cancelRepair();
      } else if (input.wasJustPressed('r')) {
        this._cancelRepair();
        return;
      }
      return; // No other input while repairing
    }

    const canRepair = p.throttleLevel === 0 && p.armorCurrent < p.armorMax && this.scrap > 0;
    if (input.wasJustPressed('r') && canRepair) {
      this._startRepair();
      return;
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
      p.fireWeapons(this._cachedMouseWorld.x, this._cachedMouseWorld.y, this.entities);
    }

    // RMB fires secondary weapons (rockets)
    if (rightJustPressed) {
      p.fireSecondary(this._cachedMouseWorld.x, this._cachedMouseWorld.y, this.entities);
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
        if (entity.lootType === 'scrap') {
          this.scrap += entity.amount;
          entity.active = false;
          this.hud.addPickupText(entity.label, entity.x, entity.y);
        } else if (entity.lootType === 'fuel') {
          this.fuel = Math.min(this.fuelMax, this.fuel + entity.amount);
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
          target.takeDamage(proj.damage, proj.hullDamage, proj.x, proj.y);
          proj.active = false;
          if (!proj.isRocket) {
            this.particlePool.explosion(proj.x, proj.y, 5);
          }
          if (target.isDestroyed) {
            this.particlePool.explosion(target.x, target.y, 20);
            if (target !== this.player) {
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
  }

  get totalCargoCapacity() {
    return this.player ? this.player.cargoCapacity : 0;
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

  render() {
    this.renderer.render(this);
  }
}
