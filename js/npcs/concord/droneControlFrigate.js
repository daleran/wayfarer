import { DroneControlHull } from '@/ships/classes/droneControlHull.js';
import { LanceModuleSmall, OnyxDriveUnit } from '@/modules/shipModule.js';
import { AI_TEMPLATES } from '@data/compiledData.js';
import { createSnatcHerDrone } from './snatcHerDrone.js';

const DRONE_MAX          = 3;
const DRONE_COOLDOWN     = 12;  // seconds
const DRONE_SPAWN_OFFSET = 80;  // px lateral offset

/** Drone Control Frigate — unmanned Concord command vessel with drone spawning. */
class DroneControlFrigateShip extends DroneControlHull {
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

      const drone = createSnatcHerDrone(spawnX, spawnY);
      drone.rotation = this.rotation;

      this._activeDrones.push(drone);
      this._spawnQueue.push(drone);
    }
  }
}

export function createDroneControlFrigate(x, y) {
  const ship = new DroneControlFrigateShip(x, y);
  ship.shipType = 'drone-control-frigate';
  ship.faction   = 'concord';
  ship.relation  = 'hostile';
  ship.ai        = { ...AI_TEMPLATES.standoff };
  ship.flavorText =
    'A Concord Remnant command vessel — repurposed garrison hull stripped of ' +
    'crew provisions and rebuilt as a drone carrier. Geometric sensor arrays ' +
    'replace the bow tower. Bay notches on the flanks cycle drones continuously. ' +
    'It does not rush. It does not retreat. It deploys and waits. ' +
    'Strength: relentless drone harassment, fortress-grade frontal armor. ' +
    'Weakness: drones are fragile; destroy them before focusing the hull.';
  ship.moduleSlots = [new OnyxDriveUnit(), new LanceModuleSmall(), null];
  ship._applyModules();
  return ship;
}
