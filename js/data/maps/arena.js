// Arena combat sandbox map.
// Load with: editor.html?map=arena
// Pale at center (4000, 3000). Player spawns south. Six derelicts ring the planet.

import { TheCoil } from '@/data/zones/gravewake/theCoil.js';
import { PlanetPale } from '@/data/zones/gravewake/planetPale.js';
import { createDerelict } from '@/world/derelict.js';
import { createShip } from '@/ships/registry.js';
import { KellsStop } from '@/data/zones/gravewake/kellsStop.js';
import { createModuleDrop } from '@/entities/lootDrop.js';
import { SalvageBayModule, EngineeringBayModule } from '@/modules/shipModule.js';

function spawnEnemy(x, y, shipType) {
  const ship = createShip(shipType, x, y);
  ship.homePosition = { x, y };
  ship._canRespawn = true;
  return ship;
}

export const MAP = {
  mapSize: { width: 8000, height: 6000 },
  playerStart: { x: 4000, y: 5800 },

  background: [
    PlanetPale.backgroundData({ x: 4000, y: 3000 }),
  ],

  zones: [
    { id: 'arena', center: { x: 4000, y: 3000 }, radius: 4000 },
  ],

  entities: [
    // The Coil — for BH station overlay testing
    TheCoil.instantiate(4000, 5200),
    KellsStop.instantiate(3000, 5600),

    // Module drops near player spawn for testing Salvage Bay / Engineering Bay
    createModuleDrop(4050, 5750, new SalvageBayModule()),
    createModuleDrop(3950, 5750, new EngineeringBayModule()),

    // Six derelicts in a hex ring at r≈1800 around Pale
    createDerelict({
      name: 'Drifting Vigil', x: 4000, y: 1200, salvageTime: 4,
      derelictClass: 'frigate',
      loreText: [
        'DRIFTING VIGIL — Garrison-class frigate, registry struck.',
        'Reactor unsecured. Drive section intact.',
      ],
    }),
    createDerelict({
      name: 'Hollow March', x: 5560, y: 2100, salvageTime: 5,
      derelictClass: 'unknown',
      loreText: [
        'HOLLOW MARCH — hull class unidentified. Pre-Collapse origin suspected.',
        'No registry. No crew manifest. Power signature: anomalous.',
      ],
    }),
    createDerelict({
      name: 'Cold Remnant', x: 5560, y: 3900, salvageTime: 4,
      derelictClass: 'fighter',
      loreText: [
        'COLD REMNANT — Maverick-class courier, combat-modified.',
        'Grave Clan markings. Hardpoint still attached.',
      ],
    }),
    createDerelict({
      name: 'Gutted Pioneer', x: 4000, y: 4800, salvageTime: 3,
      derelictClass: 'hauler',
      loreText: [
        'GUTTED PIONEER — G100-class hauler, cargo hold stripped.',
        'Approached the ring and did not clear it.',
      ],
    }),
    createDerelict({
      name: 'Broken Covenant', x: 2440, y: 3900, salvageTime: 5,
      derelictClass: 'frigate',
      loreText: [
        'BROKEN COVENANT — Garrison-class frigate, registry struck.',
        'Reactor: unsecured. Drive section intact.',
      ],
    }),
    createDerelict({
      name: 'Pale Witness', x: 2440, y: 2100, salvageTime: 4,
      derelictClass: 'unknown',
      loreText: [
        "PALE WITNESS — drifting in Pale's shadow for decades.",
        'Whatever it was watching for, it never reported back.',
      ],
    }),

    // Enemies
    spawnEnemy(2800, 2000, 'drone-control-frigate'),
  ],

  asteroidFields: [],
  nebulae: [],
};
