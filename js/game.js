import { Camera } from './camera.js';
import { Renderer } from './renderer.js';
import { HUD } from './hud.js';
import { input } from './input.js';
import { MAP } from './data/maps/tyr.js';
import { createHullbreaker } from './ships/player/hullbreaker.js';
import { createCrashDummy } from './ships/player/crashDummy.js';
import { Autocannon } from './modules/weapons/autocannon.js';
import { RocketPodSmall } from './modules/weapons/rocket.js';
import { RocketPodLarge } from './modules/weapons/rocketLarge.js';
import { Railgun } from './modules/weapons/railgun.js';
import { GatlingGun } from './modules/weapons/gatlingGun.js';
import { Lance } from './modules/weapons/lance.js';
import { PlasmaCannon } from './modules/weapons/plasmaCannon.js';
import { Cannon } from './modules/weapons/cannon.js';
import { Torpedo } from './modules/weapons/torpedo.js';
import { ParticlePool } from './systems/particlePool.js';
import { SalvageSystem } from './systems/salvageSystem.js';
import { RepairSystem } from './systems/repairSystem.js';
import { CollisionSystem } from './systems/collisionSystem.js';
import { BountySystem } from './systems/bountySystem.js';
import { WeaponSystem } from './systems/weaponSystem.js';
import { InteractionSystem } from './systems/interactionSystem.js';
import { updateShipAI } from './ai/shipAI.js';
import { Station } from './world/station.js';
import { LocationOverlay } from './ui/locationOverlay.js';
import { ShipScreen } from './ui/shipScreen.js';
import {
  DEFAULT_SCRAP, FUEL_RATES, SPAWN,
} from '@data/compiledData.js';
import {
  SMOKE_DARK, SMOKE_MID, SMOKE_TINT,
  SPARK_YELLOW, AMBER, CYAN, WHITE,
} from './rendering/colors.js';
import { ReputationSystem } from './systems/reputation.js';
import { PlayerInventory } from './systems/playerInventory.js';
import { NavigationSystem } from './systems/navigationSystem.js';
import { createModuleById } from './modules/registry.js';
import { createShip } from './ships/registry.js';

export class GameManager {
  constructor(options = {}) {
    this.canvas = null;
    this.ctx = null;
    this.entities = [];
    this.player = null;
    this.ships = [];   // all non-player ships; relation drives hostile/neutral/friendly
    this.camera = null;
    this.renderer = null;
    this.hud = null;
    this.particlePool = null;
    this.map = options.map || MAP;
    this.isTestMode = options.testMode || false;
    this.testSteps = options.testSteps || [];
    this._addRockets = options.addRockets || false;
    this.inventory = new PlayerInventory({ startScrap: options.startScrap ?? DEFAULT_SCRAP });
    this.isPaused = false;
    this.isDocked = false;
    this.stationScreen = null;
    this.shipScreen = null;
    this._cachedMouseWorld = null;
    this._respawnQueue = [];
    this._prevMouseRight = false;
    this.reputation = new ReputationSystem();
    this.totalTime = 0;

    // Subsystems
    this.salvage = new SalvageSystem();
    this.repair = new RepairSystem();
    this.collision = new CollisionSystem();
    this.bounty = new BountySystem();
    this.weaponSys = new WeaponSystem();
    this.interaction = new InteractionSystem();
    this.navigation = new NavigationSystem();

    // Pan mode (editor sets this via EditorOverlay)
    this.isPanMode = false;

    // AI freeze (editor sets this via EditorOverlay)
    this.aiDisabled = false;

    // Combat mode — F key toggle
    this.combatMode = false;

    // Player death screen (production mode only)
    this._playerDead = false;
  }

  init() {
    /** @type {HTMLCanvasElement} */
    this.canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('game'));
    this.canvas.style.cursor = 'none';
    this._resizeCanvas();
    this.ctx = this.canvas.getContext('2d', { alpha: false });

    window.addEventListener('resize', () => {
      this._resizeCanvas();
      this.camera.width = this.canvas.width;
      this.camera.height = this.canvas.height;
    });

    this.camera = new Camera(this.canvas.width, this.canvas.height);
    this.hud = new HUD();
    this.stationScreen = new LocationOverlay();
    this.shipScreen = new ShipScreen();
    this.renderer = new Renderer(this.ctx, this.map.mapSize, this.map.background);
    this.particlePool = new ParticlePool();

    // Spawn player — use Crash Dummy in test/editor mode, Hullbreaker in production
    const start = this.map.playerStart || { x: 400, y: 400 };
    this.player = this.isTestMode
      ? createCrashDummy(start.x, start.y)
      : createHullbreaker(start.x, start.y);
    this.inventory.bindPlayer(this.player);
    this.inventory.initFromPlayer(this.player);

    if (this.isTestMode) {
      // Swap slot 2 (H2 fuel cell) to small fission reactor for testing overhaul mechanic
      this.player.moduleSlots[2] = createModuleById('SmallFissionReactor');

      // Full weapon roster in test mode — replace module-installed weapons
      this.player.weapons = [];
      // Primaries
      this.player.addWeapon(new Autocannon());
      this.player.addWeapon(new GatlingGun());
      this.player.addWeapon(new Railgun('small-fixed'));
      this.player.addWeapon(new Railgun('large-turret'));
      this.player.addWeapon(new Railgun('large-fixed'));
      this.player.addWeapon(new Lance('small-fixed'));
      this.player.addWeapon(new Lance('small-turret'));
      this.player.addWeapon(new Lance('large-fixed'));
      this.player.addWeapon(new Lance('large-turret'));
      this.player.addWeapon(new PlasmaCannon('small'));
      this.player.addWeapon(new PlasmaCannon('large'));
      this.player.addWeapon(new Cannon());
      // Secondaries
      this.player.addWeapon(new RocketPodSmall());
      this.player.addWeapon(new RocketPodLarge());
      this.player.addWeapon(new Torpedo());

      // Seed cargo ammo reserves for test mode
      this.inventory.ammo['25mm-ap'] = 300;
      this.inventory.ammo['25mm-he'] = 100;
      this.inventory.ammo['8mm'] = 600;
      this.inventory.ammo['90mm-ap'] = 12;
      this.inventory.ammo['90mm-he'] = 8;
      this.inventory.ammo['rkt'] = 20;
      this.inventory.ammo['wg'] = 10;
      this.inventory.ammo['ht'] = 10;
      this.inventory.ammo['30mm-kp'] = 10;
      this.inventory.ammo['60mm-kp'] = 6;
    }
    // Normal mode: weapons come from installed modules (set up in ship constructor)

    this.entities.push(this.player);

    // World entities — pre-instantiated by zone manifests / map files
    for (const entity of this.map.entities ?? []) {
      this.entities.push(entity);
      if (entity.isShip) this.ships.push(entity);
    }

    this.mapZones = this.map.zones || [];

    this.camera.x = this.player.x;
    this.camera.y = this.player.y;
  }

  _resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  update(dt) {
    input.tick();
    this.totalTime += dt;

    // Player death — freeze game in production mode
    if (this._playerDead) return;
    if (!this.isTestMode && this.player && !this.player.active) {
      this._playerDead = true;
      this._showDeathScreen();
      return;
    }

    // Map toggle — M key (available any time except docked / ship screen)
    if (input.wasJustPressed('m') && !this.isDocked && !this.shipScreen.visible) {
      this.navigation.toggleMap(this);
    }

    // When map is open, consume input for map controls, skip game camera zoom
    if (this.navigation.mapOpen) {
      this._handleMapInput();
      if (input.wasJustPressed('escape')) this.navigation.closeMap();
    }

    if (!this.navigation.mapOpen) {
      this.camera.applyWheel(input.wheelDelta);
    }
    this.camera.updateZoom(dt);

    if (this.isDocked) {
      // Ship screen toggle available while docked
      const justToggledShip = input.wasJustPressed('i') || input.wasJustPressed('tab');
      if (justToggledShip) this.shipScreen.toggle(this);
      if (this.shipScreen.visible && !justToggledShip) {
        this.shipScreen.update(dt, this);
        this.shipScreen.handleInput(input, this);
      }
      this.stationScreen.update(dt, this);
      this.stationScreen.handleInput(input, this);
      this.camera.updatePan(dt);
      if (!this.stationScreen.visible) {
        this.isDocked = false;
        this.camera.clearPan();
        // Recalc T/W after undocking — fuel/cargo may have changed at station
        if (this.player?.active) this.player.recalcTW(this.fuel, this.totalCargoUsed);
      }
      return;
    }

    if (this.salvage.isSalvaging) {
      const result = this.salvage.update(dt);
      if (result) {
        for (const e of result.lootEntities) this.entities.push(e);
        this.particlePool.explosion(result.particlePos.x, result.particlePos.y, 10);
      }
    }

    // Pause toggle — space bar; checked before processInput so fire is skipped
    if (input.wasJustPressed(' ')) this.isPaused = !this.isPaused;

    if (!this.navigation.mapOpen) this._processInput(dt);

    if (this.shipScreen.visible && !this.isDocked) {
      this.shipScreen.update(dt, this);
      if (!this._shipScreenJustToggled) {
        this.shipScreen.handleInput(input, this);
      }
    }
    this._shipScreenJustToggled = false;

    if (this.isPaused) return;

    this._updateModules(dt);
    this._consumeFuel(dt);
    this._updatePowerBalance();

    for (const entity of this.entities) {
      if (!entity.active) continue;
      if ((this.salvage.isSalvaging || this.repair.isRepairing) && entity === this.player) continue;
      entity.update(dt, this.entities);
      if (entity instanceof Station && this.player) {
        entity.updateZoneFade(dt, this.player.x, this.player.y);
      }
    }

    // Process entity spawn queues (e.g. DroneControlFrigate → SnatcHerDrone)
    for (const entity of [...this.entities]) {
      if (!entity._spawnQueue?.length && !entity._pickupTextQueue?.length) continue;
      while (entity._spawnQueue?.length > 0) {
        const drone = entity._spawnQueue.shift();
        this.entities.push(drone);
        this.ships.push(drone);
      }
      while (entity._pickupTextQueue?.length > 0) {
        const msg = entity._pickupTextQueue.shift();
        if (this.player) this.hud.addPickupText(msg.text, this.player.x, this.player.y, msg.colorHint ?? null);
      }
    }

    for (const ship of this.ships) {
      if (!ship.active || ship.isDerelict) continue;
      if (this.aiDisabled) {
        ship.throttleLevel = 0;
        ship.rotationInput = 0;
      } else if (!ship._isLatched) {
        updateShipAI(ship, this.player, this.entities, dt);
      }
    }

    // Auto-fire turrets
    const enemies = this.ships.filter(s => s.active && s.relation === 'hostile');
    if (this.combatMode && this.player && this.player.active && !this.salvage.isSalvaging && !this.repair.isRepairing) {
      this.player.fireAutoWeapons(enemies, this.entities);
    }

    if (this.repair.isRepairing) {
      const { scrapSpent } = this.repair.update(dt, this.player, this.inventory.scrap);
      this.inventory.scrap -= scrapSpent;
    }
    this.weaponSys.updateReloads(dt, this.player, this.inventory.ammo);

    // Update guided projectile targets
    this.weaponSys.updateGuidance(this.entities, this.ships, this._cachedMouseWorld);

    this.particlePool.update(dt);
    const collisionResult = this.collision.update(this.entities, this.player, {
      particlePool: this.particlePool,
      hud: this.hud,
      repair: this.repair,
      reputation: this.reputation,
      onEnemyKilled: (target) => this.bounty.onEnemyKilled(target, {
        particlePool: this.particlePool, hud: this.hud, reputation: this.reputation, entities: this.entities,
      }),
      onEnemyCrippled: (target) => this.bounty.onEnemyCrippled(target, {
        particlePool: this.particlePool, hud: this.hud, reputation: this.reputation,
      }),
    });
    for (const e of collisionResult.newEntities) this.entities.push(e);
    this.interaction.checkLootPickups(this.entities, this.player, this);
    // Recalc T/W after loot pickups may have changed cargo weight
    if (this.player?.active) this.player.recalcTW(this.fuel, this.totalCargoUsed);
    this._processRespawns(dt);
    this.bounty.updateExpiry(this.totalTime);
    this._updateDamageEffects(dt);
    this._purgeInactive();

    this.interaction.updateDerelicts(dt, this.entities, this.player, this.salvage, input);
    if (!this.salvage.isSalvaging) {
      const dockResult = this.interaction.checkDocking(this.entities, this.player, input, {
        reputation: this.reputation, hud: this.hud, stationScreen: this.stationScreen,
        bounty: this.bounty, game: this,
      });
      if (dockResult.isDocked) this.isDocked = true;
    }

    if (this.player && this.player.active && !this.isPanMode) {
      this.camera.follow(this.player, dt);
    }

  }

  _updateModules(dt) {
    if (!this.player) return;
    for (const mod of (this.player.moduleSlots || [])) {
      if (mod?.update) mod.update(this.player, dt, this);
    }
  }

  _consumeFuel(dt) {
    if (!this.player || !this.player.active) return;

    // Accumulate all drain sources into fuelBurnRate
    let burn = 0;
    burn += (FUEL_RATES[this.player.throttleLevel] || 0) * this.player.fuelEfficiency;
    for (const mod of (this.player.moduleSlots || [])) {
      if (mod?.fuelDrainRate && mod.isPowered !== false) burn += mod.fuelDrainRate;
    }

    this.inventory.fuelBurnRate = burn;
    if (burn > 0) {
      this.inventory.fuel = Math.max(0, this.inventory.fuel - burn * dt);
      if (this.inventory.fuel <= 0 && this.player.throttleLevel > 1) {
        this.player.throttleLevel = 1;
      }
    }
  }

  _updatePowerBalance() {
    if (!this.player) return;
    const modules = this.player.moduleSlots || [];
    let out = 0, totalDraw = 0;
    for (const mod of modules) {
      if (!mod) continue;
      out += (/** @type {any} */ (mod).effectivePowerOutput ?? mod.powerOutput) || 0;
      totalDraw += mod.powerDraw || 0;
    }
    this.inventory.reactorOutput = out;
    this.inventory.reactorDraw = totalDraw;

    // Enforce power budget — depower lowest-priority consumers first
    const consumers = [];
    for (const mod of modules) {
      if (!mod || !mod.powerDraw) continue;
      consumers.push(mod);
    }
    // Sort: lowest priority first, then highest draw first (greedy depower)
    consumers.sort((a, b) => (a.powerPriority - b.powerPriority) || (b.powerDraw - a.powerDraw));

    let remainingDraw = totalDraw;
    let changed = false;

    for (const mod of consumers) /** @type {any} */ (mod)._powerPending = true;

    // Depower from lowest priority until draw fits in budget
    for (const mod of consumers) {
      if (remainingDraw <= out) break;
      /** @type {any} */ (mod)._powerPending = false;
      remainingDraw -= mod.powerDraw;
    }

    for (const mod of consumers) {
      const wasPowered = mod.isPowered;
      mod.isPowered = /** @type {any} */ (mod)._powerPending;
      delete /** @type {any} */ (mod)._powerPending;
      if (wasPowered !== mod.isPowered) changed = true;
      if (mod.weapon) mod.weapon._unpowered = !mod.isPowered;
    }

    if (changed) {
      this.player.refreshCapabilities();
      this.player.recalcTW(this.fuel, this.totalCargoUsed);
    }
  }

  _handleMapInput() {
    const nav = this.navigation;

    // Scroll to zoom map
    if (input.wheelDelta !== 0) {
      nav._mapZoom *= 1 - input.wheelDelta * 0.001;
      nav._mapZoom = Math.max(0.01, Math.min(0.5, nav._mapZoom));
    }

    // Drag to pan
    if (input.mouseButtons.left && !nav._isDragging) {
      nav._isDragging = true;
      nav._dragStartX = input.mouseScreen.x;
      nav._dragStartY = input.mouseScreen.y;
      nav._dragPanStartX = nav._mapPanX;
      nav._dragPanStartY = nav._mapPanY;
    }
    if (nav._isDragging && input.mouseButtons.left) {
      const dx = input.mouseScreen.x - nav._dragStartX;
      const dy = input.mouseScreen.y - nav._dragStartY;
      nav._mapPanX = nav._dragPanStartX - dx / nav._mapZoom;
      nav._mapPanY = nav._dragPanStartY - dy / nav._mapZoom;
    }
    if (nav._isDragging && !input.mouseButtons.left) {
      // Check if it was a click (small drag distance) → set waypoint
      const dx = input.mouseScreen.x - nav._dragStartX;
      const dy = input.mouseScreen.y - nav._dragStartY;
      if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
        this._setWaypointFromMap(input.mouseScreen.x, input.mouseScreen.y);
      }
      nav._isDragging = false;
    }

    // Right-click clears waypoint
    if (input.mouseButtons.right && !this._prevMouseRight) {
      nav.clearWaypoint();
    }
    this._prevMouseRight = input.mouseButtons.right;
  }

  _setWaypointFromMap(screenX, screenY) {
    const nav = this.navigation;
    const screenW = this.canvas.width;
    const screenH = this.canvas.height;

    // Convert screen → world using map transform
    const wx = (screenX - screenW / 2) / nav._mapZoom + nav._mapPanX;
    const wy = (screenY - screenH / 2) / nav._mapZoom + nav._mapPanY;

    // Find nearest clickable entity within 30 screen pixels
    const threshold = 30 / nav._mapZoom; // world-space threshold
    let bestDist = threshold;
    let bestEntity = null;

    for (const e of this.entities) {
      if (!e.active) continue;
      if (!(e instanceof Station) && !e.isDerelict) continue;
      const dx = e.x - wx;
      const dy = e.y - wy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < bestDist) {
        bestDist = dist;
        bestEntity = e;
      }
    }

    if (bestEntity) {
      nav.setWaypoint(bestEntity.x, bestEntity.y, bestEntity.name || '', bestEntity);
    } else {
      nav.setWaypoint(wx, wy);
    }
  }

  _processInput(dt) {
    const p = this.player;
    if (!p || !p.active) return;

    this._cachedMouseWorld = input.mouseWorld(this.camera);
    p._turretTargetWorld = this._cachedMouseWorld;

    // Ship screen toggle — processed before everything else
    // Set flag so handleInput doesn't close it on the same tick
    if (input.wasJustPressed('i') || input.wasJustPressed('tab')) {
      this.shipScreen.toggle(this);
      this._shipScreenJustToggled = true;
    }
    if (this.shipScreen.visible) {
      if (input.wasJustPressed('escape')) this.shipScreen.close();
      return;
    }

    if (this.isPanMode) {
      const speed = 800 * dt;
      if (input.isDown('w') || input.isDown('arrowup')) this.camera.y -= speed;
      if (input.isDown('s') || input.isDown('arrowdown')) this.camera.y += speed;
      if (input.isDown('a') || input.isDown('arrowleft')) this.camera.x -= speed;
      if (input.isDown('d') || input.isDown('arrowright')) this.camera.x += speed;
      return;
    }

    const rightJustPressed = input.mouseButtons.right && !this._prevMouseRight;
    this._prevMouseRight = input.mouseButtons.right;

    if (this.salvage.isSalvaging) {
      if (input.wasJustPressed('e') || input.wasJustPressed('escape')) this.salvage.cancel();
      return;
    }

    // R always triggers weapon reload (regardless of movement/repair state)
    if (input.wasJustPressed('r')) this.weaponSys.manualReload(this.player, this.inventory.ammo);

    if (this.repair.isRepairing) {
      const stillValid = p.throttleLevel === 0 && p.speed < 1 && (p.armorCurrent < p.armorMax || this.repair.hasModulesToRepair(p)) && this.inventory.scrap > 0;
      if (!stillValid || input.wasJustPressed('escape')) {
        this.repair.cancel();
      } else if (input.wasJustPressed('r')) {
        this.repair.cancel();
        return;
      }
      return;
    }

    const canRepair = p.throttleLevel === 0 && p.speed < 1 && (p.armorCurrent < p.armorMax || this.repair.hasModulesToRepair(p)) && this.inventory.scrap > 0;
    if (input.wasJustPressed('r') && canRepair) { this.repair.start(); return; }

    if (input.wasJustPressed('f')) this.combatMode = !this.combatMode;

    if (input.wasJustPressed('w') || input.wasJustPressed('arrowup')) p.increaseThrottle();
    if (input.wasJustPressed('s') || input.wasJustPressed('arrowdown')) p.decreaseThrottle();

    if (this.inventory.fuel <= 0 && p.throttleLevel > 1) p.throttleLevel = 1;

    if (input.isDown('a') || input.isDown('arrowleft')) p.rotationInput = -1;
    if (input.isDown('d') || input.isDown('arrowright')) p.rotationInput = 1;

    if (!this.isPaused) {
      // LMB fires active primary (onlyActive=true for player) — combat mode only
      if (this.combatMode && input.mouseButtons.left) {
        p.fireWeapons(this._cachedMouseWorld.x, this._cachedMouseWorld.y, this.entities, true);
      }

      // RMB fires active secondary — combat mode only
      if (this.combatMode && rightJustPressed) {
        p.fireSecondary(this._cachedMouseWorld.x, this._cachedMouseWorld.y, this.entities, true);
      }

      // Ammo cycling: 1 for active primary, 2 for active secondary
      if (input.wasJustPressed('1')) {
        const w = p._primaryWeapons[p.primaryWeaponIdx];
        if (w?.acceptedAmmoTypes?.length > 1) this.weaponSys.cycleAmmo(w, this.inventory.ammo, this.hud, this.player);
      }
      if (input.wasJustPressed('2')) {
        const w = p._secondaryWeapons[p.secondaryWeaponIdx];
        if (w?.acceptedAmmoTypes?.length > 1) this.weaponSys.cycleAmmo(w, this.inventory.ammo, this.hud, this.player);
      }
    }
  }

  _updateDamageEffects(dt) {
    for (const entity of this.entities) {
      if (!entity.active || !entity.isShip) continue;

      // Derelict sparks — periodic ping effect
      if (entity.isDerelict && !entity.salvaged) {
        entity._sparkTimer += dt;
        if (entity._sparkTimer >= 1.0) {
          entity._sparkTimer -= 1.0;
          this.particlePool.ping(entity.x, entity.y);
        }
        continue;
      }
      const ratio = entity.hullCurrent / entity.hullMax;

      // Smoke at <30% hull — all ships, emits from engine positions
      if (ratio < 0.30) {
        entity._smokeTimer -= dt;
        if (entity._smokeTimer <= 0) {
          // Emit faster the more damaged the ship is
          entity._smokeTimer = 0.10 + ratio * 0.60;
          const sin = Math.sin(entity.rotation);
          const cos = Math.cos(entity.rotation);
          const offsets = entity._engineOffsets || [{ x: 0, y: 8 }];
          const off = offsets[Math.floor(Math.random() * offsets.length)];
          const wx = entity.x + off.x * cos - off.y * sin;
          const wy = entity.y + off.x * sin + off.y * cos;
          this.particlePool.emit(
            wx + (Math.random() - 0.5) * 6,
            wy + (Math.random() - 0.5) * 6,
            2, {
            colors: [SMOKE_DARK, SMOKE_MID, SMOKE_TINT],
            minSpeed: 4, maxSpeed: 18,
            life: 1.2 + Math.random() * 0.8,
            r: 4 + Math.random() * 3,
          }
          );
        }
      }

      // Sparks at <50% hull — player only
      if (entity === this.player && ratio < 0.50) {
        entity._sparkTimer -= dt;
        if (entity._sparkTimer <= 0) {
          entity._sparkTimer = 0.20 + Math.random() * 0.35;
          this.particlePool.emit(
            entity.x + (Math.random() - 0.5) * 16,
            entity.y + (Math.random() - 0.5) * 16,
            3, {
            colors: [SPARK_YELLOW, AMBER, CYAN, WHITE],
            minSpeed: 40, maxSpeed: 110,
            life: 0.15 + Math.random() * 0.15,
            r: 1.5,
          }
          );
        }
      }
    }
  }

  _processRespawns(dt) {
    for (let i = this._respawnQueue.length - 1; i >= 0; i--) {
      const entry = this._respawnQueue[i];
      entry.timer -= dt;
      if (entry.timer <= 0) {
        const angle = Math.random() * Math.PI * 2;
        const dist = SPAWN.ENEMY_RADIUS.MIN + Math.random() * SPAWN.ENEMY_RADIUS.MAX;
        const rx = entry.homePosition.x + Math.sin(angle) * dist;
        const ry = entry.homePosition.y - Math.cos(angle) * dist;
        const ship = createShip(entry.shipType, rx, ry);
        ship.homePosition = { x: entry.homePosition.x, y: entry.homePosition.y };
        ship._canRespawn = true;
        this.entities.push(ship);
        this.ships.push(ship);
        this._respawnQueue.splice(i, 1);
      }
    }
  }

  _purgeInactive() {
    if (this.isTestMode) {
      for (const s of this.ships) {
        if (!s.active && s._canRespawn && s.homePosition && !s.isBountyTarget) {
          this._respawnQueue.push({
            timer: 60,
            homePosition: { x: s.homePosition.x, y: s.homePosition.y },
            shipType: s.shipType,
          });
        }
      }
    }
    this.entities = this.entities.filter(e => e.active);
    this.ships = this.ships.filter(s => s.active);
  }

  // Computed view: all ships currently flagged hostile (for renderer/HUD)
  get hostiles() { return this.ships.filter(s => s.relation === 'hostile'); }

  // Forwarding accessors — state lives in PlayerInventory
  get scrap()          { return this.inventory.scrap; }
  set scrap(v)         { this.inventory.scrap = v; }
  get fuel()           { return this.inventory.fuel; }
  set fuel(v)          { this.inventory.fuel = v; }
  get fuelMax()        { return this.inventory.fuelMax; }
  set fuelMax(v)       { this.inventory.fuelMax = v; }
  get cargo()          { return this.inventory.cargo; }
  get modules()        { return this.inventory.modules; }
  set modules(v)       { this.inventory.modules = v; }
  get weapons()        { return this.inventory.weapons; }
  set weapons(v)       { this.inventory.weapons = v; }
  get ammo()           { return this.inventory.ammo; }
  set ammo(v)          { this.inventory.ammo = v; }
  get fuelBurnRate()   { return this.inventory.fuelBurnRate; }
  get reactorOutput()  { return this.inventory.reactorOutput; }
  get reactorDraw()    { return this.inventory.reactorDraw; }
  get totalCargoCapacity() { return this.inventory.totalCargoCapacity; }
  get totalCargoUsed()     { return this.inventory.totalCargoUsed; }

  // Convenience accessors for external code
  get nearbyStation() { return this.interaction.nearbyStation; }
  get nearbyDerelict() { return this.interaction.nearbyDerelict; }
  get activeBounties() { return this.bounty.activeBounties; }

  render() {
    this.renderer.render(this);
  }

  _showDeathScreen() {
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position: 'fixed', inset: '0', zIndex: '9999',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0)',
      transition: 'background-color 3s ease',
      pointerEvents: 'none',
    });

    const box = document.createElement('div');
    Object.assign(box.style, {
      border: '3px solid #ff4444',
      backgroundColor: '#000',
      padding: '40px 60px',
      fontFamily: 'monospace',
      textAlign: 'center',
      opacity: '0',
      transition: 'opacity 2s ease 2s',
    });

    const msg = document.createElement('div');
    Object.assign(msg.style, { fontSize: '28px', color: '#ff4444', lineHeight: '1.6' });
    msg.textContent = 'Another human lost to the void.';

    const btn = document.createElement('button');
    Object.assign(btn.style, {
      marginTop: '30px', padding: '12px 40px',
      fontFamily: 'monospace', fontSize: '18px',
      color: '#ff4444', backgroundColor: '#000',
      border: '2px solid #ff4444', cursor: 'pointer',
      pointerEvents: 'auto',
    });
    btn.textContent = 'Restart';
    btn.addEventListener('mouseenter', () => { btn.style.backgroundColor = '#1a0000'; });
    btn.addEventListener('mouseleave', () => { btn.style.backgroundColor = '#000'; });
    btn.addEventListener('click', () => location.reload());

    box.appendChild(msg);
    box.appendChild(btn);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.style.backgroundColor = 'rgba(0,0,0,0.7)';
      box.style.opacity = '1';
    });
  }
}
