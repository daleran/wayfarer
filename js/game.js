import { Camera } from './camera.js';
import { Renderer } from './renderer.js';
import { HUD } from './hud.js';
import { input } from './input.js';
import { MAP } from './data/map.js';
import { createHullbreaker } from './ships/player/hullbreaker.js';
import { createLightFighter } from './enemies/scavengers/lightFighter.js';
import { createArmedHauler } from './enemies/scavengers/armedHauler.js';
import { createSalvageMothership } from './enemies/scavengers/salvageMothership.js';
import { Autocannon } from './weapons/autocannon.js';

import { Rocket } from './weapons/rocket.js';
import { Railgun } from './weapons/railgun.js';
import { FlakCannon } from './weapons/flakCannon.js';
import { Lance } from './weapons/lance.js';
import { PlasmaCannon } from './weapons/plasmaCannon.js';
import { Cannon } from './weapons/cannon.js';
import { RocketLarge } from './weapons/rocketLarge.js';
import { MissileWire } from './weapons/missileWire.js';
import { MissileHeat } from './weapons/missileHeat.js';
import { Torpedo } from './weapons/torpedo.js';
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
import { RocketExplosion } from './entities/rocketExplosion.js';

import { DEFAULT_SCRAP, FUEL_RATES,
         REPAIR_RATE, REPAIR_COST_PER_PT } from './data/stats.js';

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
    this.scrap = options.startScrap ?? DEFAULT_SCRAP;
    this.fuel = 0;    // set from player.fuelMax in init()
    this.fuelMax = 0; // set from player.fuelMax in init()
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

    // Pan mode (test only)
    this.isPanMode = false;

    // AI freeze mode (test only) — V key toggle
    this.aiDisabled = false;

    // Auto-fire mode — F key toggle
    this.autoFireMode = false;
  }

  init() {
    this.canvas = document.getElementById('game');
    this.canvas.style.cursor = 'none';
    this._resizeCanvas();
    this.ctx = this.canvas.getContext('2d');

    window.addEventListener('resize', () => {
      this._resizeCanvas();
      this.camera.width = this.canvas.width;
      this.camera.height = this.canvas.height;
    });

    this.camera = new Camera(this.canvas.width, this.canvas.height);
    this.hud = new HUD();
    this.stationScreen = new StationScreen();
    this.renderer = new Renderer(this.ctx, this.map.mapSize, this.map.zones);
    this.particlePool = new ParticlePool();

    // Spawn player
    const start = this.map.playerStart || { x: 400, y: 400 };
    this.player = createHullbreaker(start.x, start.y);
    this.fuel    = this.player.fuelMax;
    this.fuelMax = this.player.fuelMax;

    if (this.isTestMode) {
      // Full weapon roster in test mode
      this.player.addWeapon(new Autocannon());
      this.player.addWeapon(new Railgun());
      this.player.addWeapon(new FlakCannon('small'));
      this.player.addWeapon(new Lance('small'));
      this.player.addWeapon(new PlasmaCannon('small'));
      this.player.addWeapon(new Cannon());
      // Secondary
      this.player.addWeapon(new Rocket());
      this.player.addWeapon(new RocketLarge());
      this.player.addWeapon(new MissileWire('small'));
      this.player.addWeapon(new MissileWire('large'));
      this.player.addWeapon(new MissileHeat('small'));
      this.player.addWeapon(new Torpedo());
    } else {
      this.player.addWeapon(new Autocannon());
      this.player.addWeapon(new Rocket());
    }

    this.entities.push(this.player);

    // World entities
    for (const s of this.map.stations) {
      const station = s.renderer === 'coil' ? createCoilStation(s) : createStation(s);
      this.entities.push(station);
    }
    for (const p of this.map.planets) this.entities.push(createPlanet(p));
    for (const d of (this.map.derelicts || [])) this.entities.push(createDerelict(d));

    // Raiders
    for (const spawn of (this.map.raiderSpawns || [])) {
      const station = this.map.stations.find(s => s.id === spawn.stationId);
      const home = station ? { x: station.x, y: station.y } : { x: spawn.x, y: spawn.y };
      for (let i = 0; i < spawn.count; i++) {
        const angle = (i / spawn.count) * Math.PI * 2 + Math.random() * 0.5;
        const dist = 150 + Math.random() * 200;
        const rx = home.x + Math.sin(angle) * dist;
        const ry = home.y - Math.cos(angle) * dist;
        const raider = spawn.shipType === 'armed-hauler'       ? createArmedHauler(rx, ry)
                     : spawn.shipType === 'salvage-mothership' ? createSalvageMothership(rx, ry)
                     : createLightFighter(rx, ry);
        raider.homePosition = { x: home.x, y: home.y };
        if (spawn.behaviorType) raider.behaviorType = spawn.behaviorType;
        this.entities.push(raider);
        this.raiders.push(raider);
      }
    }

    for (const spine of (this.map.arkshipSpines || []))
      this.entities.push(createArkshipSpine(spine));
    for (const cloud of (this.map.wallOfWrecks || []))
      this.entities.push(createDebrisCloud(cloud));

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

    if (this.isSalvaging) this._updateSalvage(dt);

    this._processInput(dt);
    this._consumeFuel(dt);

    for (const entity of this.entities) {
      if (!entity.active) continue;
      if ((this.isSalvaging || this.isRepairing) && entity === this.player) continue;
      entity.update(dt, this.entities);
    }

    for (const raider of this.raiders) {
      if (!raider.active) continue;
      if (this.aiDisabled) {
        raider.throttleLevel = 0;
        raider.rotationInput = 0;
      } else {
        updateRaiderAI(raider, this.player, this.entities, dt);
      }
    }

    // Auto-fire turrets
    const enemies = this.raiders.filter(r => r.active);
    if (this.player && this.player.active && !this.isSalvaging && !this.isRepairing) {
      this.player.fireAutoWeapons(enemies, this.entities);

      // F-key auto-fire mode: active primary also fires at nearest enemy
      if (this.autoFireMode) {
        let nearest = null;
        let nearestDist = Infinity;
        for (const e of enemies) {
          const dx = e.x - this.player.x;
          const dy = e.y - this.player.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < nearestDist) { nearestDist = d; nearest = e; }
        }
        if (nearest) {
          this.player.fireWeapons(nearest.x, nearest.y, this.entities, true);
        }
      }
    }

    if (this.isRepairing) this._updateRepair(dt);

    // Update guided projectile targets
    this._updateGuidedProjectiles();

    this.particlePool.update(dt);
    this._runCollisions();
    this._checkLootPickups();
    this._processRaiderRespawns(dt);
    this._updateDerelictSparks(dt);
    this._purgeInactive();

    this._checkDerelictInteraction();
    if (!this.isSalvaging) this._checkDocking();

    if (this.player && this.player.active && !this.isPanMode) {
      this.camera.follow(this.player, dt);
    }
  }

  _updateGuidedProjectiles() {
    const enemies = this.raiders.filter(r => r.active);
    for (const entity of this.entities) {
      if (!(entity instanceof Projectile) || !entity.active || !entity.isGuided) continue;
      if (entity.guidedType === 'wire') {
        if (this._cachedMouseWorld) {
          entity.guidanceTargetX = this._cachedMouseWorld.x;
          entity.guidanceTargetY = this._cachedMouseWorld.y;
        }
      } else if (entity.guidedType === 'heat') {
        let nearest = null;
        let nearestDist = Infinity;
        for (const e of enemies) {
          const dx = e.x - entity.x;
          const dy = e.y - entity.y;
          const d = dx * dx + dy * dy;
          if (d < nearestDist) { nearestDist = d; nearest = e; }
        }
        if (nearest) {
          entity.guidanceTargetX = nearest.x;
          entity.guidanceTargetY = nearest.y;
        }
      }
    }
  }

  _consumeFuel(dt) {
    if (!this.player || !this.player.active) return;
    const rate = FUEL_RATES[this.player.throttleLevel] || 0;
    if (rate > 0) {
      this.fuel -= rate * this.player.fuelEfficiency * dt;
      if (this.fuel <= 0) {
        this.fuel = 0;
        if (this.player.throttleLevel > 1) this.player.throttleLevel = 1;
      }
    }
  }

  _startRepair() { this.isRepairing = true; this._repairAccum = 0; }
  _cancelRepair() { this.isRepairing = false; this._repairAccum = 0; }

  _updateRepair(dt) {
    const ship = this.player;
    if (!ship || !ship.active) return;
    this._repairAccum += REPAIR_RATE * dt;
    const arcOrder = ['front', 'port', 'starboard', 'aft'];
    while (this._repairAccum >= 1 && this.scrap > 0) {
      let targetArc = null;
      let maxDiff = 0;
      for (const arc of arcOrder) {
        const diff = ship.armorArcsMax[arc] - ship.armorArcs[arc];
        if (diff > maxDiff) { maxDiff = diff; targetArc = arc; }
      }
      if (!targetArc || maxDiff < 1) break;
      ship.armorArcs[targetArc] = Math.min(ship.armorArcs[targetArc] + 1, ship.armorArcsMax[targetArc]);
      this.scrap -= REPAIR_COST_PER_PT;
      this._repairAccum -= 1;
    }
    if (ship.armorCurrent >= ship.armorMax || this.scrap <= 0) this._cancelRepair();
  }

  _handleTestInput() {
    const mx = this._cachedMouseWorld?.x ?? (this.player.x + 300);
    const my = this._cachedMouseWorld?.y ?? this.player.y;

    const spawnEnemy = (factory) => {
      const r = factory(mx, my);
      r.homePosition = { x: mx, y: my };
      r._aggro = true;
      this.entities.push(r);
      this.raiders.push(r);
    };

    if (input.wasJustPressed('?')) this.isPanMode = !this.isPanMode;
    if (input.wasJustPressed('v')) this.aiDisabled = !this.aiDisabled;

    if (input.wasJustPressed('z')) spawnEnemy(createLightFighter);
    if (input.wasJustPressed('x')) spawnEnemy(createArmedHauler);
    if (input.wasJustPressed('c')) spawnEnemy(createSalvageMothership);

    // Weapon cycling
    if (input.wasJustPressed('1')) this.player.cyclePrimary(-1);
    if (input.wasJustPressed('2')) this.player.cyclePrimary(1);
    if (input.wasJustPressed('3')) this.player.cycleSecondary(-1);
    if (input.wasJustPressed('4')) this.player.cycleSecondary(1);
  }

  _processInput(dt) {
    const p = this.player;
    if (!p || !p.active) return;

    this._cachedMouseWorld = input.mouseWorld(this.camera);

    if (this.isTestMode) this._handleTestInput();

    if (this.isPanMode) {
      const speed = 800 * dt;
      if (input.isDown('w') || input.isDown('arrowup'))    this.camera.y -= speed;
      if (input.isDown('s') || input.isDown('arrowdown'))  this.camera.y += speed;
      if (input.isDown('a') || input.isDown('arrowleft'))  this.camera.x -= speed;
      if (input.isDown('d') || input.isDown('arrowright')) this.camera.x += speed;
      return;
    }

    const rightJustPressed = input.mouseButtons.right && !this._prevMouseRight;
    this._prevMouseRight = input.mouseButtons.right;

    if (this.isSalvaging) {
      if (input.wasJustPressed('e') || input.wasJustPressed('escape')) this._cancelSalvage();
      return;
    }

    if (this.isRepairing) {
      const stillValid = p.throttleLevel === 0 && p.armorCurrent < p.armorMax && this.scrap > 0;
      if (!stillValid || input.wasJustPressed('escape')) {
        this._cancelRepair();
      } else if (input.wasJustPressed('r')) {
        this._cancelRepair();
        return;
      }
      return;
    }

    const canRepair = p.throttleLevel === 0 && p.armorCurrent < p.armorMax && this.scrap > 0;
    if (input.wasJustPressed('r') && canRepair) { this._startRepair(); return; }

    if (input.wasJustPressed('f')) this.autoFireMode = !this.autoFireMode;

    if (input.wasJustPressed('w') || input.wasJustPressed('arrowup')) p.increaseThrottle();
    if (input.wasJustPressed('s') || input.wasJustPressed('arrowdown')) p.decreaseThrottle();

    if (this.fuel <= 0 && p.throttleLevel > 1) p.throttleLevel = 1;

    if (input.isDown('a') || input.isDown('arrowleft'))  p.rotationInput = -1;
    if (input.isDown('d') || input.isDown('arrowright')) p.rotationInput = 1;

    // LMB / space fires active primary (onlyActive=true for player)
    if (input.mouseButtons.left || input.isDown(' ')) {
      p.fireWeapons(this._cachedMouseWorld.x, this._cachedMouseWorld.y, this.entities, true);
    }

    // RMB fires active secondary
    if (rightJustPressed) {
      p.fireSecondary(this._cachedMouseWorld.x, this._cachedMouseWorld.y, this.entities, true);
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

    if (this.nearbyDerelict && input.wasJustPressed('e')) this._startSalvage(this.nearbyDerelict);
  }

  _startSalvage(derelict) {
    this.isSalvaging = true;
    this.salvageProgress = 0;
    this.salvageTotal = derelict.salvageTime;
    this.salvageTarget = derelict;
    this.player.throttleLevel = 0;
  }

  _updateSalvage(dt) {
    if (!this.salvageTarget || !this.salvageTarget.active || this.salvageTarget.salvaged) {
      this._cancelSalvage();
      return;
    }
    this.salvageProgress += dt;
    if (this.salvageProgress >= this.salvageTotal) this._completeSalvage();
  }

  _completeSalvage() {
    const derelict = this.salvageTarget;
    derelict.salvaged = true;
    derelict.active = false;
    for (const loot of derelict.lootTable) {
      this.entities.push(createLootDrop(derelict.x, derelict.y, loot.type, loot.amount));
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
          entity.y + (Math.random() - 0.5) * 16, 3
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
        const factory = entry.shipType === 'armed-hauler'       ? createArmedHauler
                       : entry.shipType === 'salvage-mothership' ? createSalvageMothership
                       : createLightFighter;
        const raider = factory(rx, ry);
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
    // --- Interception pass: canIntercept projectiles vs isInterceptable projectiles ---
    const interceptors = [];
    const interceptables = [];
    for (const e of this.entities) {
      if (!(e instanceof Projectile) || !e.active) continue;
      if (e.canIntercept)    interceptors.push(e);
      if (e.isInterceptable) interceptables.push(e);
    }
    for (const inter of interceptors) {
      const ib = inter.getBounds();
      for (const tgt of interceptables) {
        if (!tgt.active) continue;
        if (inter.owner?.faction === tgt.owner?.faction) continue;
        const tb = tgt.getBounds();
        const dx = ib.x - tb.x;
        const dy = ib.y - tb.y;
        if (dx * dx + dy * dy < 144) { // (6+6)²
          inter.active = false;
          tgt.active = false;
          tgt.shouldDetonate = false; // prevent AoE on interception
          this.particlePool.explosion(tgt.x, tgt.y, 3);
          break;
        }
      }
    }

    // --- Main collision pass ---
    for (const entity of this.entities) {
      if (!(entity instanceof Projectile)) continue;

      // AoE expiry detonation (rockets / flak that ran out of range)
      if ((entity.isRocket || entity.detonatesOnExpiry) && entity.shouldDetonate && !entity.active) {
        const tx = entity.rocketTargetX ?? entity.x;
        const ty = entity.rocketTargetY ?? entity.y;
        const radius = entity.blastRadius || 280;
        this._aoeExplode(tx, ty, entity.damage, entity.hullDamage ?? 0, radius);
        this.particlePool.explosion(tx, ty, entity.isRocket ? 20 : 12);
        if (entity.isRocket) this.entities.push(new RocketExplosion(tx, ty, radius));
        entity.shouldDetonate = false;
        continue;
      }

      if (!entity.active) continue;
      const proj = entity;
      const pb = proj.getBounds();

      for (const target of this.entities) {
        if (!target.active || !(target instanceof Ship)) continue;
        if (proj.owner === target) continue;
        if (proj.owner?.faction && target.faction && proj.owner.faction === target.faction) continue;

        const sb = target.getBounds();
        const dx = pb.x - sb.x;
        const dy = pb.y - sb.y;
        if (Math.sqrt(dx * dx + dy * dy) < pb.radius + sb.radius) {
          if (proj.isRocket || proj.detonatesOnContact) {
            // AoE on direct hit
            proj.active = false;
            const radius = proj.blastRadius || 280;
            this._aoeExplode(proj.x, proj.y, proj.damage, proj.hullDamage ?? 0, radius);
            this.particlePool.explosion(proj.x, proj.y, 20);
            if (proj.isRocket) this.entities.push(new RocketExplosion(proj.x, proj.y, radius));
          } else if (proj.isPlasma) {
            // Plasma falloff — more damage up close
            const falloff = Math.max(0, 1 - proj.distanceTravelled / proj.maxRange);
            const armorDmg = proj.damage * falloff;
            const hullDmg  = (proj.hullDamage ?? proj.damage) * (0.3 + falloff * 0.7);
            target.takeDamage(armorDmg, hullDmg, proj.x, proj.y);
            proj.active = false;
            this.particlePool.explosion(proj.x, proj.y, 5);
            if (target.isDestroyed) {
              this.particlePool.explosion(target.x, target.y, 20);
              if (target !== this.player) {
                const drops = generateEnemyLoot(target.x, target.y);
                for (const drop of drops) this.entities.push(drop);
              }
            }
          } else {
            // Standard direct hit
            target.takeDamage(proj.damage, proj.hullDamage, proj.x, proj.y);
            proj.active = false;
            this.particlePool.explosion(proj.x, proj.y, 5);
            if (target.isDestroyed) {
              this.particlePool.explosion(target.x, target.y, 20);
              if (target !== this.player) {
                const drops = generateEnemyLoot(target.x, target.y);
                for (const drop of drops) this.entities.push(drop);
              }
            }
          }
          break;
        }
      }
    }
  }

  _aoeExplode(x, y, damage, hullDamage, blastRadius) {
    for (const entity of this.entities) {
      if (!entity.active || !(entity instanceof Ship)) continue;
      const sb = entity.getBounds();
      const dx = sb.x - x;
      const dy = sb.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < blastRadius + sb.radius) {
        const falloff = 1 - (dist / (blastRadius + sb.radius)) * 0.7;
        entity.takeDamage(damage * falloff, (hullDamage || 0) * falloff, x, y);
        if (entity.isDestroyed && entity !== this.player) {
          this.particlePool.explosion(entity.x, entity.y, 20);
          const drops = generateEnemyLoot(entity.x, entity.y);
          for (const drop of drops) this.entities.push(drop);
        }
      }
    }
  }

  _purgeInactive() {
    if (this.isTestMode) {
      for (const r of this.raiders) {
        if (!r.active && r.homePosition) {
          this._raiderRespawnQueue.push({
            timer: 60,
            homePosition: { x: r.homePosition.x, y: r.homePosition.y },
            shipType: r.shipType,
          });
        }
      }
    }
    this.entities = this.entities.filter(e => e.active);
    this.raiders  = this.raiders.filter(r => r.active);
  }

  get totalCargoCapacity() { return this.player ? this.player.cargoCapacity : 0; }
  get totalCargoUsed() { return Object.values(this.cargo).reduce((s, v) => s + v, 0); }

  _enforceCargoCapacity() {
    const cap = this.totalCargoCapacity;
    const order = ['food', 'ore', 'tech', 'exotics'];
    while (this.totalCargoUsed > cap) {
      let jettisoned = false;
      for (const id of order) {
        if (this.cargo[id] > 0) { this.cargo[id]--; jettisoned = true; break; }
      }
      if (!jettisoned) break;
    }
  }

  render() {
    this.renderer.render(this);
  }
}
