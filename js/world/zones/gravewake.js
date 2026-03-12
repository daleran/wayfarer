// Gravewake zone — placement manifest for the Tyr world.
// Every entity is pre-instantiated. Maps just spread this into MAP.

import { TheCoil }           from './gravewake/theCoil/index.js';
import { KellsStop }         from './gravewake/kellsStop.js';
import { AshveilAnchorage }  from './gravewake/ashveilAnchorage.js';
import { BrokenCovenant }    from './gravewake/brokenCovenant.js';
import { GuttedPioneer }     from './gravewake/guttedPioneer.js';
import { HollowMarch }       from './gravewake/hollowMarch.js';
import { ColdRemnant }       from './gravewake/coldRemnant.js';
import { FracturedWake }     from './gravewake/fracturedWake.js';
import { PaleWitness }       from './gravewake/paleWitness.js';
import { PlanetPale }        from './gravewake/planetPale.js';
import { ArkshipSpines }     from './gravewake/arkshipSpines.js';
import { WallOfWrecks }      from './gravewake/wallOfWrecks.js';

import { RAIDER_REGISTRY }     from '../../enemies/raiderRegistry.js';
import { createGraveClanAmbusher } from '../../enemies/scavengers/graveClanAmbusher.js';
import { createTraderConvoy }  from '../../ships/neutral/traderConvoy.js';
import { createMilitiaPatrol } from '../../ships/neutral/militiaPatrol.js';
import { SPAWN }               from '../../data/tuning/shipTuning.js';

// ── Spawn helpers ───────────────────────────────────────────────────────────

function raiderGroup(x, y, count, shipType) {
  const factory = RAIDER_REGISTRY[shipType] ?? RAIDER_REGISTRY['light-fighter'];
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const dist = SPAWN.RAIDER_RADIUS.MIN + Math.random() * SPAWN.RAIDER_RADIUS.MAX;
    const ship = factory(
      x + Math.sin(angle) * dist,
      y - Math.cos(angle) * dist,
    );
    ship.homePosition = { x, y };
    ship._canRespawn  = true;
    return ship;
  });
}

function lurkerGroup(x, y, count) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / Math.max(count, 1)) * Math.PI * 2;
    const dist = SPAWN.LURKER_RADIUS.MIN + Math.random() * SPAWN.LURKER_RADIUS.MAX;
    const rx = x + Math.sin(angle) * dist;
    const ry = y - Math.cos(angle) * dist;
    const ship = createGraveClanAmbusher(rx, ry);
    ship._coverPoint  = { x: rx, y: ry };
    ship.homePosition = { x, y };
    ship._canRespawn  = true;
    return ship;
  });
}

function convoy(routeA, routeB, shipCount) {
  return Array.from({ length: shipCount }, (_, i) => {
    const t = shipCount > 1 ? i / shipCount : 0;
    const sx = routeA.x + (routeB.x - routeA.x) * t;
    const sy = routeA.y + (routeB.y - routeA.y) * t;
    const ship = createTraderConvoy(sx, sy);
    ship._tradeRouteA = { ...routeA };
    ship._tradeRouteB = { ...routeB };
    return ship;
  });
}

function militia(orbitCenter, orbitRadius, orbitSpeed, count) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const sx = orbitCenter.x + Math.sin(angle) * orbitRadius;
    const sy = orbitCenter.y - Math.cos(angle) * orbitRadius;
    const ship = createMilitiaPatrol(sx, sy);
    ship._orbitCenter = { ...orbitCenter };
    ship._orbitRadius = orbitRadius;
    ship._orbitSpeed  = orbitSpeed;
    ship._orbitAngle  = angle;
    return ship;
  });
}

// ── Zone export ─────────────────────────────────────────────────────────────

export const GRAVEWAKE = {
  entities: [
    // Stations
    TheCoil.instantiate(15000, 3000),
    KellsStop.instantiate(5500, 3800),
    AshveilAnchorage.instantiate(16000, 5000),

    // Derelicts
    BrokenCovenant.instantiate(3800, 4200),
    GuttedPioneer.instantiate(6500, 3000),
    HollowMarch.instantiate(9000, 4000),
    ColdRemnant.instantiate(11500, 3200),
    FracturedWake.instantiate(14500, 7000),
    PaleWitness.instantiate(7000, 7500),

    // Terrain
    ...ArkshipSpines.instantiate(),
    ...WallOfWrecks.instantiate(),

    // Raiders
    ...raiderGroup(3200, 2200, 3, 'light-fighter'),
    ...raiderGroup(2800, 7500, 3, 'light-fighter'),
    ...raiderGroup(14000, 4200, 1, 'drone-control-frigate'),
    ...raiderGroup(10500, 2500, 1, 'drone-control-frigate'),

    // Lurkers
    ...lurkerGroup(4200, 4000, 2),
    ...lurkerGroup(7500, 3600, 2),
    ...lurkerGroup(10500, 4200, 1),

    // Trade convoys
    ...convoy({ x: 2200, y: 5000 }, { x: 5500,  y: 3800 }, 2),
    ...convoy({ x: 5500, y: 3800 }, { x: 15000, y: 3000 }, 2),
    ...convoy({ x: 15000, y: 3000 }, { x: 16000, y: 5000 }, 1),

    // Militia patrols
    ...militia({ x: 15000, y: 3000 }, 600, 0.12, 2),
    ...militia({ x: 13500, y: 3500 }, 1200, 0.07, 1),
  ],

  zones: [
    { id: 'gravewake', center: { x: 10000, y: 5000 }, radius: 9500 },
  ],

  background: [
    PlanetPale.backgroundData(),
  ],
};
