import { DroneControlHull } from '@data/hulls/drone-control-hull/hull.js';
import { createActor } from '@/entities/registry.js';

const DRONE_MAX          = 3;
const DRONE_COOLDOWN     = 12;  // seconds
const DRONE_SPAWN_OFFSET = 80;  // px lateral offset

/** Drone Control Frigate — unmanned Concord command vessel with drone spawning. */
export class DroneControlFrigateShip extends DroneControlHull {
  constructor(x, y) {
    super(x, y);

    // Drone management
    this._spawnQueue       = [];
    this._activeDrones     = [];
    this._droneSpawnTimer  = 0;
    this._canRespawn       = false;
    this._pickupTextQueue  = [];
  }

  update(dt, entities) {
    super.update(dt, entities);

    // Prune dead drones
    this._activeDrones = this._activeDrones.filter(d => d.active);

    // Drone spawn tick
    this._droneSpawnTimer += dt;
    if (this._droneSpawnTimer >= DRONE_COOLDOWN && this._activeDrones.length < DRONE_MAX) {
      this._droneSpawnTimer = 0;

      // Lateral spawn: alternate left/right based on drone count
      const side = (this._activeDrones.length % 2 === 0) ? 1 : -1;
      const spawnX = this.x + (-Math.cos(this.rotation) * side * DRONE_SPAWN_OFFSET);
      const spawnY = this.y + ( Math.sin(this.rotation) * side * DRONE_SPAWN_OFFSET);

      const drone = createActor('snatcher-drone', spawnX, spawnY);
      drone.rotation = this.rotation;

      this._activeDrones.push(drone);
      this._spawnQueue.push(drone);
    }
  }
}
