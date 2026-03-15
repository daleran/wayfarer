// Central registries. Add new ships/NPCs here only.
// Consumers: game.js, designer.js, editor.js
import { NPC_SHIPS, AI_TEMPLATES, CONTENT } from '@data/index.js';
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
// Provides the same interface as the old SHIP_REGISTRY array.

export function getShipRegistry() {
  return Object.entries(CONTENT.hulls).map(([id, entry]) => ({
    id,
    label: entry.label,
    create: entry.create,
  }));
}

/** @deprecated Use getShipRegistry() — kept for backward compat */
export const SHIP_REGISTRY = new Proxy([], {
  get(target, prop) {
    const registry = getShipRegistry();
    if (prop === 'map') return registry.map.bind(registry);
    if (prop === 'find') return registry.find.bind(registry);
    if (prop === 'findIndex') return registry.findIndex.bind(registry);
    if (prop === 'filter') return registry.filter.bind(registry);
    if (prop === 'length') return registry.length;
    if (prop === Symbol.iterator) return registry[Symbol.iterator].bind(registry);
    const idx = typeof prop === 'string' ? parseInt(prop) : NaN;
    if (!isNaN(idx)) return registry[idx];
    return Reflect.get(target, prop);
  },
});

// ── Character roster ────────────────────────────────────────────────────────────
// Auto-generated from NPC_SHIPS data for designer/external consumers.

export const CHARACTER_REGISTRY = Object.entries(NPC_SHIPS).map(([id, data]) => ({
  id,
  label: data.label,
  faction: data.faction,
  behavior: data.aiBehavior || data.character?.behavior || 'player',
  unmanned: data.unmanned || false,
  hullClass: data.shipClass,
  file: `data/namedShips.js#${id}`,
  create: (x, y) => createActor(id, x, y),
}));

// Backward-compat alias
export const NPC_REGISTRY = CHARACTER_REGISTRY;

// ── Generic data-driven factory ───────────────────────────────────────────────

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

export function createActor(id, x, y) {
  const data = NPC_SHIPS[id];
  if (!data) throw new Error(`Unknown actor id: ${id}`);

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

  // 4. Character or unmanned setup
  if (data.unmanned) {
    // Concord machines — set faction/relation/AI directly on ship
    ship.faction = data.faction;
    ship.relation = data.relation;
    if (data.aiBehavior && AI_TEMPLATES[data.aiBehavior]) {
      ship.ai = { ...AI_TEMPLATES[data.aiBehavior] };
    }
  } else if (data.character) {
    const captain = new Character({
      id: data.character.id,
      name: data.character.name,
      faction: data.character.faction || data.faction,
      relation: data.character.relation || data.relation,
      behavior: data.character.behavior || data.aiBehavior,
      flavorText: data.character.flavorText,
    });
    captain.boardShip(ship);
  }

  return ship;
}

// Backward-compat alias
export const createShip = createActor;

// ── Derelict factory ──────────────────────────────────────────────────────────
// Derelicts are ships with no captain — placed in data as wrecks to salvage.

const DERELICT_SHIP_CLASSES = {
  hauler:  'g100-hauler',
  fighter: 'maverick-courier',
  frigate: 'garrison-frigate',
  unknown: 'onyx-tug',
};

export function createDerelict(data) {
  const shipClassId = DERELICT_SHIP_CLASSES[data.derelictClass] ?? 'g100-hauler';
  /** @type {any} */
  const ship = createHullByClass(shipClassId, data.x, data.y);

  ship.relation = 'derelict';
  ship.crew = 0;
  ship.ai = null;
  ship.name = data.name || 'Derelict';
  ship.lootTable = data.lootTable || [];
  ship.salvageTime = data.salvageTime || 3;
  ship.loreText = data.loreText || [];
  ship.derelictClass = data.derelictClass || 'hauler';
  ship.interactionRadius = 120;
  ship.rotation = (Math.random() - 0.5) * 1.2;
  ship.throttleLevel = 0;
  ship.speed = 0;

  return ship;
}
