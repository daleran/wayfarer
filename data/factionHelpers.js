// =============================================================================
// WAYFARER — Faction Helpers
// Content-driven faction lookups, relationship checks, and reputation derivation.
// All factions self-register into CONTENT.factions at import time.
// =============================================================================

import { CONTENT } from './dataRegistry.js';
import { RELATION } from './enums.js';
import { REPUTATION } from './tuning.js';

/** Look up a faction definition from CONTENT.factions. */
export function getFaction(id) {
  return CONTENT.factions[id] ?? null;
}

/** Display name for a faction id, with fallback to the raw id. */
export function getFactionName(id) {
  return CONTENT.factions[id]?.name ?? id;
}

/** All registered faction ids. */
export function getAllFactions() {
  return Object.keys(CONTENT.factions);
}

/** Only root factions (no parent) — these are the reputation-tracked factions. */
export function getRootFactions() {
  return Object.keys(CONTENT.factions).filter(id => !CONTENT.factions[id].parent);
}

/** Walk parent chain to the top-level faction (used as reputation key). */
export function getRootFaction(id) {
  let current = id;
  let safety = 10;
  while (safety-- > 0) {
    const faction = CONTENT.factions[current];
    if (!faction || !faction.parent) return current;
    current = faction.parent;
  }
  return current;
}

/** Check if two factions (or their roots) are hostile to each other. */
export function areFactionsHostile(a, b) {
  if (!a || !b || a === b) return false;
  // Check direct relationships
  if (_hasRelationship(a, b, 'hostile') || _hasRelationship(b, a, 'hostile')) return true;
  // Check root-level relationships
  const rootA = getRootFaction(a);
  const rootB = getRootFaction(b);
  if (rootA === rootB) return false;
  return _hasRelationship(rootA, rootB, 'hostile') || _hasRelationship(rootB, rootA, 'hostile');
}

/** Check if two factions (or their roots) are allied. */
export function areFactionsAllied(a, b) {
  if (!a || !b) return false;
  if (a === b) return true;
  const rootA = getRootFaction(a);
  const rootB = getRootFaction(b);
  if (rootA === rootB) return true;
  return _hasRelationship(rootA, rootB, 'allied') || _hasRelationship(rootB, rootA, 'allied');
}

/**
 * Derive RELATION enum value from faction + reputation standings.
 * @param {string} factionId  The entity's faction
 * @param {{ getStanding: (f: string) => number }} reputationSystem
 * @returns {string} A RELATION enum value
 */
export function getRelationToPlayer(factionId, reputationSystem) {
  if (!factionId || factionId === 'player') return RELATION.PLAYER;
  const rootFaction = getRootFaction(factionId);
  const standing = reputationSystem.getStanding(rootFaction);
  if (standing <= REPUTATION.HOSTILE_THRESHOLD) return RELATION.HOSTILE;
  if (standing >= REPUTATION.ALLIED_THRESHOLD) return RELATION.FRIENDLY;
  return RELATION.NEUTRAL;
}

// ── Internal ──────────────────────────────────────────────────────────────────

function _hasRelationship(factionA, factionB, type) {
  const faction = CONTENT.factions[factionA];
  if (!faction?.relationships) return false;
  return faction.relationships.some(r => r.target === factionB && r.type === type);
}
