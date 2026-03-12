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

import { createShip }           from '../../ships/registry.js';
import { SPAWN }               from '../../data/tuning/shipTuning.js';

// ── Spawn helpers ───────────────────────────────────────────────────────────

function npcGroup(x, y, count, shipType) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const dist = SPAWN.ENEMY_RADIUS.MIN + Math.random() * SPAWN.ENEMY_RADIUS.MAX;
    const ship = createShip(shipType,
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
    const ship = createShip('grave-clan-ambusher', rx, ry);
    ship.ai._coverPoint = { x: rx, y: ry };
    ship.homePosition   = { x, y };
    ship._canRespawn    = true;
    return ship;
  });
}

function convoy(routeA, routeB, shipCount) {
  return Array.from({ length: shipCount }, (_, i) => {
    const t = shipCount > 1 ? i / shipCount : 0;
    const sx = routeA.x + (routeB.x - routeA.x) * t;
    const sy = routeA.y + (routeB.y - routeA.y) * t;
    const ship = createShip('trader-convoy', sx, sy);
    ship.ai._tradeRouteA = { ...routeA };
    ship.ai._tradeRouteB = { ...routeB };
    return ship;
  });
}

function militia(orbitCenter, orbitRadius, orbitSpeed, count) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const sx = orbitCenter.x + Math.sin(angle) * orbitRadius;
    const sy = orbitCenter.y - Math.cos(angle) * orbitRadius;
    const ship = createShip('militia-patrol', sx, sy);
    ship.ai._orbitCenter = { ...orbitCenter };
    ship.ai._orbitRadius = orbitRadius;
    ship.ai._orbitSpeed  = orbitSpeed;
    ship.ai._orbitAngle  = angle;
    return ship;
  });
}

// ── Atmosphere background layer ──────────────────────────────────────────────

function createGravewakeAtmosphere(zone) {
  // Pre-generate micro-debris fragments
  const count = 300;
  const goldenAngle = 2.399963;
  const fragments = [];
  for (let i = 0; i < count; i++) {
    const r = Math.sqrt(Math.random()) * zone.radius;
    const theta = i * goldenAngle;
    fragments.push({
      wx: zone.center.x + Math.cos(theta) * r,
      wy: zone.center.y + Math.sin(theta) * r,
      parallax: 0.15 + (i % 17) * 0.015,
      size: 2 + (i % 4),
      angle: theta,
    });
  }

  return {
    type: 'gravewake-atmosphere',
    render(ctx, camera) {
      const dx = camera.x - zone.center.x;
      const dy = camera.y - zone.center.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Fade in over 1000 units inside zone boundary
      const fadeStart = zone.radius;
      const fadeEnd = zone.radius - 1000;
      const t = Math.max(0, Math.min(1, (fadeStart - dist) / (fadeStart - fadeEnd)));
      const maxAlpha = 0.6 * t;
      if (maxAlpha <= 0) return;

      ctx.save();
      ctx.strokeStyle = '#334455';
      ctx.lineWidth = 1;

      for (const frag of fragments) {
        const px = frag.wx - camera.x * frag.parallax * camera.zoom;
        const py = frag.wy - camera.y * frag.parallax * camera.zoom;

        const sw = camera.width;
        const sh = camera.height;
        const sx = ((px % sw) + sw) % sw;
        const sy = ((py % sh) + sh) % sh;

        ctx.globalAlpha = maxAlpha * 0.6;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(frag.angle);
        ctx.strokeRect(-frag.size, -frag.size * 0.3, frag.size * 2, frag.size * 0.6);
        ctx.restore();
      }

      ctx.globalAlpha = 1;
      ctx.restore();
    },
  };
}

// ── Zone definition ──────────────────────────────────────────────────────────

const GRAVEWAKE_ZONE = { id: 'gravewake', center: { x: 10000, y: 5000 }, radius: 9500 };

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

    // Enemies
    ...npcGroup(3200, 2200, 3, 'light-fighter'),
    ...npcGroup(2800, 7500, 3, 'light-fighter'),
    ...npcGroup(14000, 4200, 1, 'drone-control-frigate'),
    ...npcGroup(10500, 2500, 1, 'drone-control-frigate'),

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
    GRAVEWAKE_ZONE,
  ],

  background: [
    createGravewakeAtmosphere(GRAVEWAKE_ZONE),
    PlanetPale.backgroundData(),
  ],
};
