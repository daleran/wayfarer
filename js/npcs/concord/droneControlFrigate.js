import { GarrisonFrigate } from '../../ships/classes/garrisonFrigate.js';
import { LanceModuleSmall } from '../../modules/shipModule.js';
import { AI_TEMPLATES } from '../../data/tuning/aiTuning.js';
import { CONCORD_BLUE, ENEMY_FILL } from '../../ui/colors.js';
import { engineGlow } from '../../rendering/draw.js';
import { SnatcHerDrone } from './snatcHerDrone.js';

const SPEED_MULT = 0.45;
const ACCEL_MULT = 0.5;
const TURN_MULT  = 0.6;
const HULL_MULT  = 2.0;   // 400 HP

const ARMOR_FRONT = 2.0;  // 200
const ARMOR_SIDE  = 1.6;  // 160
const ARMOR_AFT   = 1.2;  // 120

const DRONE_MAX          = 3;
const DRONE_COOLDOWN     = 12;  // seconds
const DRONE_SPAWN_OFFSET = 80;  // px lateral offset

// Concord command platform hull — wide sensor array, angular drone-bay notches
const HULL_POINTS = [
  { x:  20, y: -55 },  // [0]  nose-top starboard
  { x:  30, y: -30 },  // [1]  shoulder flare
  { x:  55, y: -10 },  // [2]  max-width starboard
  { x:  55, y:  20 },  // [3]  starboard bay wall
  { x:  40, y:  35 },  // [4]  bay aft step
  { x:  25, y:  55 },  // [5]  aft pod outer starboard
  { x:  10, y:  60 },  // [6]  aft starboard corner
  { x: -10, y:  60 },  // [7]  aft port corner
  { x: -25, y:  55 },  // [8]  aft pod outer port
  { x: -40, y:  35 },  // [9]  bay aft step port
  { x: -55, y:  20 },  // [10] port bay wall
  { x: -55, y: -10 },  // [11] max-width port
  { x: -30, y: -30 },  // [12] shoulder flare port
  { x: -20, y: -55 },  // [13] nose-top port
];

const ENGINE_POS = [
  { x:  20, y: 58 },  // starboard aft
  { x: -20, y: 58 },  // port aft
];

export class DroneControlFrigate extends GarrisonFrigate {
  constructor(x, y) {
    super(x, y);

    this.faction     = 'concord';
    this.relation    = 'hostile';
    this.shipType    = 'drone-control-frigate';
    this.displayName = 'Drone Control Frigate';
    this.ai          = { ...AI_TEMPLATES.standoff };

    this.flavorText =
      'A Concord Remnant command vessel — repurposed garrison hull stripped of ' +
      'crew provisions and rebuilt as a drone carrier. Geometric sensor arrays ' +
      'replace the bow tower. Bay notches on the flanks cycle drones continuously. ' +
      'It does not rush. It does not retreat. It deploys and waits. ' +
      'Strength: relentless drone harassment, fortress-grade frontal armor. ' +
      'Weakness: drones are fragile; destroy them before focusing the hull.';

    this._initStats({
      speed: SPEED_MULT, accel: ACCEL_MULT, turn: TURN_MULT,
      hull: HULL_MULT, armorFront: ARMOR_FRONT, armorSide: ARMOR_SIDE, armorAft: ARMOR_AFT,
    });

    this.moduleSlots = [new LanceModuleSmall(), null];
    this._applyModules();

    // Drone management
    this._spawnQueue       = [];
    this._activeDrones     = [];
    this._droneSpawnTimer  = 0;
    this._canRespawn       = false;

    // Pickup text queue (not used by frigate, but keep for consistency)
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

      const drone = new SnatcHerDrone(spawnX, spawnY);
      drone.rotation = this.rotation;

      this._activeDrones.push(drone);
      this._spawnQueue.push(drone);
    }
  }

  _drawShape(ctx) {
    // Main hull polygon — Concord geometric profile
    ctx.beginPath();
    ctx.moveTo(HULL_POINTS[0].x, HULL_POINTS[0].y);
    for (let i = 1; i < HULL_POINTS.length; i++) {
      ctx.lineTo(HULL_POINTS[i].x, HULL_POINTS[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = ENEMY_FILL;
    ctx.fill();
    ctx.strokeStyle = CONCORD_BLUE;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center spine — command module keel
    ctx.beginPath();
    ctx.moveTo(0, -48);
    ctx.lineTo(0, 55);
    ctx.strokeStyle = CONCORD_BLUE;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.35;
    ctx.stroke();

    // Lateral bay notch detail lines — drone bay slots
    ctx.globalAlpha = 0.35;
    for (const bx of [40, -40]) {
      ctx.beginPath();
      ctx.moveTo(bx, -5);
      ctx.lineTo(bx,  30);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;

    // Engine glows — twin aft corners
    engineGlow(ctx, ENGINE_POS, this.engineColor, 4 + this.throttleLevel * 0.8, 3, 3, 0.25);
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 58 };
  }
}

export function createDroneControlFrigate(x, y) {
  return new DroneControlFrigate(x, y);
}
