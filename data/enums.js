// =============================================================================
// WAYFARER — Frozen Enums
// Type-safe string constants for entity types, relations, conditions, etc.
// Never use raw strings for these — import the enum and use its property.
// =============================================================================

/** Entity type tags — set in each entity constructor. */
export const ENTITY = Object.freeze({
  SHIP:       'ship',
  STATION:    'station',
  PROJECTILE: 'projectile',
  LOOT:       'loot',
  EXPLOSION:  'explosion',
  ENTITY:     'entity',
});

/** Ship/station relation to the player. */
export const RELATION = Object.freeze({
  PLAYER:   'player',
  HOSTILE:  'hostile',
  NEUTRAL:  'neutral',
  FRIENDLY: 'friendly',
  NONE:     'none',
});

/** Module condition progression (ordered worst → best for repair, best → worst for damage). */
export const CONDITION = Object.freeze({
  GOOD:      'good',
  WORN:      'worn',
  FAULTY:    'faulty',
  DAMAGED:   'damaged',
  DESTROYED: 'destroyed',
  /** Ordered array for stepping through conditions. */
  STEPS: Object.freeze(['good', 'worn', 'faulty', 'damaged', 'destroyed']),
});

/** Loot drop categories. */
export const LOOT_TYPE = Object.freeze({
  SCRAP:  'scrap',
  FUEL:   'fuel',
  MODULE: 'module',
  WEAPON: 'weapon',
  AMMO:   'ammo',
});

/** Directional armor arcs. */
export const ARC = Object.freeze({
  FRONT:     'front',
  PORT:      'port',
  STARBOARD: 'starboard',
  AFT:       'aft',
});

/** Module mount sizes. */
export const MOUNT_SIZE = Object.freeze({
  SMALL: 'small',
  LARGE: 'large',
});

/** Mount slot constraints. */
export const MOUNT_SLOT = Object.freeze({
  ENGINE: 'engine',
});
