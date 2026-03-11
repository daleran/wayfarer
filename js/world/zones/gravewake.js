// Gravewake zone — the placement manifest for the Tyr world.
// Imports all named entities and places them with coordinates.

import { THE_COIL, KELLS_STOP, ASHVEIL_ANCHORAGE } from '../stations/index.js';
import { BROKEN_COVENANT, GUTTED_PIONEER, HOLLOW_MARCH,
         COLD_REMNANT, FRACTURED_WAKE, PALE_WITNESS } from '../../ships/named/index.js';
import { ARKSHIP_SPINES } from '../terrain/spines.js';
import { WALL_OF_WRECKS } from '../terrain/wallOfWrecks.js';

// Station placement entries — descriptor + position
export const STATION_PLACEMENTS = [
  { entity: THE_COIL,          x: 15000, y: 3000 },
  { entity: KELLS_STOP,        x: 5500,  y: 3800 },
  { entity: ASHVEIL_ANCHORAGE, x: 16000, y: 5000 },
];

// Derelict placement entries — named ship descriptor + position + gameplay data
export const DERELICT_PLACEMENTS = [
  {
    entity: BROKEN_COVENANT,
    x: 3800, y: 4200, salvageTime: 5,
    derelictClass: 'frigate',
    lootTableId: 'derelict-frigate',
    lootTable: [
      { type: 'scrap',    amount: 35 },
      { type: 'fuel',     amount: 20 },
      { type: 'moduleId', id: 'SmallFissionReactor', condition: 'faulty' },
      { type: 'ammo',     ammoType: 'autocannon', amount: 20 },
    ],
  },
  {
    entity: GUTTED_PIONEER,
    x: 6500, y: 3000, salvageTime: 4,
    derelictClass: 'hauler',
    lootTableId: 'derelict-hauler',
    lootTable: [
      { type: 'scrap',    amount: 28 },
      { type: 'fuel',     amount: 15 },
      { type: 'moduleId', id: 'HydrogenFuelCell', condition: 'worn' },
      { type: 'ammo',     ammoType: 'rocket', amount: 3 },
    ],
  },
  {
    entity: HOLLOW_MARCH,
    x: 9000, y: 4000, salvageTime: 6,
    derelictClass: 'unknown',
    lootTableId: 'derelict-unknown',
    lootTable: [
      { type: 'scrap',        amount: 50 },
      { type: 'void_crystals', amount: 2 },
      { type: 'moduleId',     id: 'LargeFusionReactor', condition: 'damaged' },
    ],
  },
  {
    entity: COLD_REMNANT,
    x: 11500, y: 3200, salvageTime: 4,
    derelictClass: 'fighter',
    lootTableId: 'derelict-fighter',
    lootTable: [
      { type: 'scrap',    amount: 30 },
      { type: 'weaponId', id: 'Autocannon' },
      { type: 'ammo',     ammoType: 'autocannon', amount: 30 },
    ],
  },
  {
    entity: FRACTURED_WAKE,
    x: 14500, y: 7000, salvageTime: 5,
    derelictClass: 'frigate',
    lootTableId: 'derelict-frigate',
    lootTable: [
      { type: 'scrap',    amount: 40 },
      { type: 'weaponId', id: 'Cannon' },
      { type: 'ammo',     ammoType: 'rocket-large', amount: 2 },
    ],
  },
  {
    entity: PALE_WITNESS,
    x: 7000, y: 7500, salvageTime: 3,
    derelictClass: 'hauler',
    lootTableId: 'derelict-hauler',
    lootTable: [
      { type: 'scrap',    amount: 22 },
      { type: 'fuel',     amount: 18 },
      { type: 'moduleId', id: 'SalvageScanner', condition: 'faulty' },
    ],
  },
];

export const GRAVEWAKE_ZONE = {
  id: 'gravewake',
  bounds: { center: { x: 10000, y: 5000 }, radius: 9500 },

  // Stations — descriptor objects used by createStationEntity
  stations: STATION_PLACEMENTS.map(p => ({ ...p.entity, x: p.x, y: p.y })),

  // Derelicts — merged entity identity + placement + gameplay data
  derelicts: DERELICT_PLACEMENTS.map(p => ({
    name:         p.entity.name,
    derelictClass: p.derelictClass,
    x:            p.x,
    y:            p.y,
    salvageTime:  p.salvageTime,
    lootTableId:  p.lootTableId,
    lootTable:    p.lootTable,
    loreText:     p.entity.lore.split('\n'),
  })),

  // Terrain
  arkshipSpines: ARKSHIP_SPINES,
  wallOfWrecks:  WALL_OF_WRECKS,

  // Dynamic spawn points (same format as current map)
  raiderSpawns: [
    { x: 3200, y: 2200, count: 3 },
    { x: 2800, y: 7500, count: 3 },
  ],

  lurkerSpawns: [
    { x: 4200,  y: 4000, count: 2, shipType: 'grave-clan-ambusher' },
    { x: 7500,  y: 3600, count: 2, shipType: 'grave-clan-ambusher' },
    { x: 10500, y: 4200, count: 1, shipType: 'grave-clan-ambusher' },
  ],

  tradeConvoys: [
    { id: 'convoy_west_thorngate', routeA: { x: 2200, y: 5000 }, routeB: { x: 5500,  y: 3800 }, shipCount: 2, shipType: 'trader-convoy' },
    { id: 'convoy_thorngate_coil', routeA: { x: 5500, y: 3800 }, routeB: { x: 15000, y: 3000 }, shipCount: 2, shipType: 'trader-convoy' },
    { id: 'convoy_coil_ashveil',   routeA: { x: 15000, y: 3000 }, routeB: { x: 16000, y: 5000 }, shipCount: 1, shipType: 'trader-convoy' },
  ],

  militiaPatrols: [
    { id: 'coil_inner_patrol', orbitCenter: { x: 15000, y: 3000 }, orbitRadius: 600,  orbitSpeed: 0.12, count: 2, shipType: 'militia-patrol' },
    { id: 'coil_outer_patrol', orbitCenter: { x: 13500, y: 3500 }, orbitRadius: 1200, orbitSpeed: 0.07, count: 1, shipType: 'militia-patrol' },
  ],

  planets: [],

  background: [
    {
      type: 'pale',
      name: 'Pale',
      x: 9000,
      y: 5000,
      radius: 540,
      colorLimb: '#4a7a9a',
      colorAtmo: '#1a3a5a',
    },
  ],
};
