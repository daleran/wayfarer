// Arena combat sandbox map.
// Load with: editor.html?map=arena
// Pale at center (4000, 3000). Player spawns south. Six derelicts ring the planet.

import { TheCoil } from '../../world/zones/gravewake/theCoil/index.js';
import { createDerelict } from '../../world/derelict.js';
import { RAIDER_REGISTRY } from '../../enemies/raiderRegistry.js';

function spawnRaider(x, y, shipType) {
  const factory = RAIDER_REGISTRY[shipType] ?? RAIDER_REGISTRY['light-fighter'];
  const ship = factory(x, y);
  ship.homePosition = { x, y };
  ship._canRespawn = true;
  return ship;
}

export const MAP = {
  mapSize: { width: 8000, height: 6000 },
  playerStart: { x: 4000, y: 4400 },

  background: [
    {
      type: 'pale',
      name: 'Pale',
      x: 4000,
      y: 3000,
      radius: 540,
      colorLimb: '#4a7a9a',
      colorAtmo: '#1a3a5a',
    },
  ],

  zones: [
    { id: 'arena', center: { x: 4000, y: 3000 }, radius: 4000 },
  ],

  entities: [
    // The Coil — for BH station overlay testing
    TheCoil.instantiate(4000, 400),

    // Six derelicts in a hex ring at r≈1800 around Pale
    createDerelict({
      name: 'Drifting Vigil', x: 4000, y: 1200, salvageTime: 4,
      derelictClass: 'frigate', lootTableId: 'derelict-frigate',
      lootTable: [
        { type: 'scrap', amount: 35 },
        { type: 'moduleId', id: 'SmallFissionReactor', condition: 'faulty' },
        { type: 'ammo', ammoType: 'autocannon', amount: 20 },
      ],
      loreText: [
        'DRIFTING VIGIL — Garrison-class frigate, registry struck.',
        'Reactor unsecured. Drive section intact.',
      ],
    }),
    createDerelict({
      name: 'Hollow March', x: 5560, y: 2100, salvageTime: 5,
      derelictClass: 'unknown', lootTableId: 'derelict-unknown',
      lootTable: [
        { type: 'scrap', amount: 40 },
        { type: 'void_crystals', amount: 2 },
        { type: 'moduleId', id: 'LargeFusionReactor', condition: 'damaged' },
      ],
      loreText: [
        'HOLLOW MARCH — hull class unidentified. Pre-Collapse origin suspected.',
        'No registry. No crew manifest. Power signature: anomalous.',
      ],
    }),
    createDerelict({
      name: 'Cold Remnant', x: 5560, y: 3900, salvageTime: 4,
      derelictClass: 'fighter', lootTableId: 'derelict-fighter',
      lootTable: [
        { type: 'scrap', amount: 28 },
        { type: 'weaponId', id: 'Autocannon' },
        { type: 'ammo', ammoType: 'autocannon', amount: 120 },
      ],
      loreText: [
        'COLD REMNANT — Maverick-class courier, combat-modified.',
        'Grave Clan markings. Hardpoint still attached.',
      ],
    }),
    createDerelict({
      name: 'Gutted Pioneer', x: 4000, y: 4800, salvageTime: 3,
      derelictClass: 'hauler', lootTableId: 'derelict-hauler',
      lootTable: [
        { type: 'scrap', amount: 20 },
        { type: 'fuel', amount: 12 },
        { type: 'moduleId', id: 'HydrogenFuelCell', condition: 'worn' },
        { type: 'ammo', ammoType: 'rocket', amount: 3 },
      ],
      loreText: [
        'GUTTED PIONEER — G100-class hauler, cargo hold stripped.',
        'Approached the ring and did not clear it.',
      ],
    }),
    createDerelict({
      name: 'Broken Covenant', x: 2440, y: 3900, salvageTime: 5,
      derelictClass: 'frigate', lootTableId: 'derelict-frigate',
      lootTable: [
        { type: 'scrap', amount: 35 },
        { type: 'moduleId', id: 'SmallFissionReactor', condition: 'worn' },
        { type: 'ammo', ammoType: 'autocannon', amount: 20 },
      ],
      loreText: [
        'BROKEN COVENANT — Garrison-class frigate, registry struck.',
        'Reactor: unsecured. Drive section intact.',
      ],
    }),
    createDerelict({
      name: 'Pale Witness', x: 2440, y: 2100, salvageTime: 4,
      derelictClass: 'unknown', lootTableId: 'derelict-unknown',
      lootTable: [
        { type: 'scrap', amount: 32 },
        { type: 'void_crystals', amount: 1 },
        { type: 'moduleId', id: 'LargeFusionReactor', condition: 'worn' },
      ],
      loreText: [
        "PALE WITNESS — drifting in Pale's shadow for decades.",
        'Whatever it was watching for, it never reported back.',
      ],
    }),

    // Raiders
    spawnRaider(2800, 2000, 'drone-control-frigate'),
  ],

  asteroidFields: [],
  nebulae: [],
};
