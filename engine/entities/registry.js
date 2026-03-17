// Central registries. Add new ships/NPCs here only.
// Consumers: game.js, designer.js, editor.js
import { AI_TEMPLATES, CHARACTERS, CONTENT, RELATION } from '@data/index.js';
import { Character } from '@/entities/character.js';
import { createModuleById } from '@/modules/registry.js';

// Concord entity subclasses (have custom update behavior)
import { DroneControlFrigateShip } from '@/entities/concord/droneControlFrigate.js';
import { SnatcHerDroneShip }      from '@/entities/concord/snatcHerDrone.js';

// ── Entity class overrides ────────────────────────────────────────────────────
// Concord machines use entity subclasses with custom behavior (drone spawning, latching).
// Other ships use the base hull class from CONTENT.hulls.

const ENTITY_CLASS_MAP = {
  'drone-control-frigate': (x, y) => new DroneControlFrigateShip(x, y),
  'snatcher-drone':        (x, y) => new SnatcHerDroneShip(x, y),
};

// ── Hull registry (from CONTENT.hulls) ───────────────────────────────────────
// Self-registered by hull files at import time.

export function getShipRegistry() {
  return Object.entries(CONTENT.hulls).map(([id, entry]) => ({
    id,
    label: entry.label,
    create: entry.create,
  }));
}

// ── Character registry ──────────────────────────────────────────────────────
// Built from CONTENT.characters for designer/external consumers.

export function getCharacterRegistry() {
  return Object.entries(CONTENT.characters).map(([id, data]) => ({
    id,
    label: data.name || id,
    faction: data.faction,
    behavior: data.behavior,
    shipId: data.shipId,
    file: `data/characters/`,
    create: (x, y) => createNPC(id, x, y),
  }));
}

// ── Ship registry (named ships) ─────────────────────────────────────────────
// Built from CONTENT.ships for designer/external consumers.

export function getNamedShipRegistry() {
  return Object.entries(CONTENT.ships).map(([id, data]) => ({
    id,
    label: data.label || data.name || id,
    shipClass: data.shipClass,
    unmanned: data.unmanned || false,
    file: `data/ships/`,
    create: (x, y) => createShip(id, x, y),
  }));
}

// ── Generic helpers ─────────────────────────────────────────────────────────

function createHullByClass(shipClassId, x, y) {
  const entry = CONTENT.hulls[shipClassId];
  if (!entry) throw new Error(`Unknown ship class: ${shipClassId}`);
  return entry.create(x, y);
}

function installModules(ship, moduleIds) {
  if (!moduleIds) return;
  const ids = Array.isArray(moduleIds) ? moduleIds : [moduleIds];
  ship.moduleSlots = ids.map(id => id === 'null' ? null : createModuleById(id));
  ship._applyModules();
}

// ── Ship factory ────────────────────────────────────────────────────────────
// Creates a configured ship from CONTENT.ships. For unmanned ships, sets
// machine faction/relation/AI directly. For manned ships, returns ship without
// a captain — use createNPC() to get a captained ship.

export function createShip(id, x, y) {
  const data = CONTENT.ships[id];
  if (!data) throw new Error(`Unknown ship id: ${id}`);

  // 1. Create hull — use entity subclass if specified, otherwise base hull class
  let ship;
  if (data.entityClass && ENTITY_CLASS_MAP[data.entityClass]) {
    ship = ENTITY_CLASS_MAP[data.entityClass](x, y);
  } else {
    ship = createHullByClass(data.shipClass, x, y);
  }

  // 2. Set identity
  ship.shipType = id;
  if (data.name) ship.name = data.name;
  if (data.flavorText) ship.flavorText = data.flavorText;

  // 3. Install modules
  installModules(ship, data.modules);

  // 4. Unmanned setup (Concord machines)
  if (data.unmanned) {
    ship._machineFaction = data.faction;
    ship._machineRelation = data.relation ?? RELATION.NEUTRAL;
    if (data.aiBehavior && AI_TEMPLATES[data.aiBehavior]) {
      ship._machineAi = { ...AI_TEMPLATES[data.aiBehavior] };
    }
  }

  return ship;
}

// ── NPC factory ─────────────────────────────────────────────────────────────
// Creates a ship + character pair from CHARACTERS data.
// Returns the ship (with captain boarded).

export function createNPC(characterId, x, y) {
  const charData = CHARACTERS[characterId];
  if (!charData) throw new Error(`Unknown character id: ${characterId}`);

  const shipId = charData.shipId;
  const ship = createShip(shipId, x, y);

  const captain = new Character({
    id: characterId,
    name: charData.name,
    faction: charData.faction,
    relation: charData.relation ?? RELATION.NEUTRAL,
    behavior: charData.behavior,
    flavorText: charData.flavorText,
  });
  captain.boardShip(ship);

  return ship;
}

// ── Derelict factory ──────────────────────────────────────────────────────────
// Derelicts are ships with no captain — any ship without a captain is a derelict.
// data.shipClass must be a valid hull ID in CONTENT.hulls.

export function createDerelict(data) {
  /** @type {any} */
  const ship = createHullByClass(data.shipClass, data.x, data.y);

  ship.crew = 0;
  ship._machineAi = null;
  ship.name = data.name || 'Derelict';
  ship.lootTable = data.lootTable || [];
  ship.loreText = data.loreText || [];
  ship.interactionRadius = 120;
  ship.rotation = (Math.random() - 0.5) * 1.2;
  ship.throttleLevel = 0;
  ship.speed = 0;

  return ship;
}
