import { Camera } from './camera.js';
import { Renderer } from './renderer.js';
import { HUD } from './hud.js';
import { input } from './input.js';
import { MAP } from './data/map.js';
import { createFlagship } from './ships/player/flagship.js';
import { createRaider } from './enemies/pirates/raider.js';
import { LaserTurret } from './weapons/laserTurret.js';
import { ParticlePool } from './systems/particlePool.js';
import { updateRaiderAI } from './ai/raiderAI.js';
import { Ship } from './entities/ship.js';
import { Projectile } from './entities/projectile.js';
import { Station, createStation } from './world/station.js';
import { createPlanet } from './world/planet.js';
import { StationScreen } from './ui/stationScreen.js';

const FLAGSHIP_START = { x: 2000, y: 3000 };

export class GameManager {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.entities = [];
    this.player = null;
    this.raiders = [];
    this.camera = null;
    this.renderer = null;
    this.hud = null;
    this.particlePool = null;
    this.map = MAP;
    this.credits = 500;
    this.cargo = { food: 0, ore: 0, tech: 0, exotics: 0 };
    this.isDocked = false;
    this.stationScreen = null;
    this.nearbyStation = null;
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
    this.player = createFlagship(FLAGSHIP_START.x, FLAGSHIP_START.y);
    this.player.addWeapon(new LaserTurret());
    this.entities.push(this.player);

    // Spawn 2 raiders ~800 units away at 45° and 225°
    const raiderAngles = [Math.PI / 4, Math.PI + Math.PI / 4];
    for (const angle of raiderAngles) {
      const rx = FLAGSHIP_START.x + Math.sin(angle) * 800;
      const ry = FLAGSHIP_START.y - Math.cos(angle) * 800;
      const raider = createRaider(rx, ry);
      this.entities.push(raider);
      this.raiders.push(raider);
    }

    // Spawn world entities from map data
    for (const s of this.map.stations) this.entities.push(createStation(s));
    for (const p of this.map.planets)  this.entities.push(createPlanet(p));

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
      this.stationScreen.handleInput(input, this);
      if (!this.stationScreen.visible) this.isDocked = false;
      return;
    }

    this._processInput(dt);

    for (const entity of this.entities) {
      if (entity.active) entity.update(dt);
    }

    for (const raider of this.raiders) {
      if (raider.active) updateRaiderAI(raider, this.player, this.entities, dt);
    }

    this.particlePool.update(dt);
    this._runCollisions();
    this._purgeInactive();
    this._emitEngineTrails();
    this._checkDocking();

    if (this.player && this.player.active) {
      this.camera.follow(this.player, dt);
    }
  }

  _processInput(dt) {
    const p = this.player;
    if (!p || !p.active) return;

    // Throttle steps once per keypress (not held)
    if (input.wasJustPressed('w')) p.increaseThrottle();
    if (input.wasJustPressed('s')) p.decreaseThrottle();

    // Rotation is continuous while held
    if (input.isDown('a')) p.rotationInput = -1;
    if (input.isDown('d')) p.rotationInput = 1;

    // LMB fires player weapons
    if (input.mouseButtons.left) {
      const mouseWorld = input.mouseWorld(this.camera);
      p.fireWeapons(mouseWorld.x, mouseWorld.y, this.entities);
    }
  }

  _emitEngineTrails() {
    for (const entity of this.entities) {
      if (!(entity instanceof Ship)) continue;
      if (!entity.active || entity.speed < 5) continue;
      const ex = entity.x - Math.sin(entity.rotation) * 14;
      const ey = entity.y + Math.cos(entity.rotation) * 14;
      this.particlePool.engineTrail(ex, ey, entity.rotation);
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

        const sb = target.getBounds();
        const dx = pb.x - sb.x;
        const dy = pb.y - sb.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < pb.radius + sb.radius) {
          target.takeDamage(proj.damage);
          proj.active = false;
          // Small hit spark
          this.particlePool.explosion(proj.x, proj.y, 5);
          // Full explosion on ship destroy
          if (target.isDestroyed) {
            this.particlePool.explosion(target.x, target.y, 20);
            if (target !== this.player) {
              this.credits += 50 + Math.floor(Math.random() * 100);
            }
          }
          break;
        }
      }
    }
  }

  _purgeInactive() {
    this.entities = this.entities.filter(e => e.active);
    this.raiders = this.raiders.filter(r => r.active);
  }

  render() {
    this.renderer.render(this);
  }
}
