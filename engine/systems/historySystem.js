// =============================================================================
// WAYFARER — History System
// Structured log of world events with dates, templated text, and entity refs.
// Pre-authored entries come from CONTENT.history; runtime entries are appended.
// =============================================================================

import { CONTENT } from '@data/dataRegistry.js';
import { ENTITY } from '@data/enums.js';
import { getFactionName } from '@data/factionHelpers.js';

// ── Date utilities ───────────────────────────────────────────────────────────

/** Convert a { year, month, day } date to a sortable number. */
function dateToNum({ year, month, day }) {
  return year * 10000 + month * 100 + day;
}

/** Compare two history entries by date (ascending). */
function compareDates(a, b) {
  return dateToNum(a.date) - dateToNum(b.date);
}

// ── Default resolver ─────────────────────────────────────────────────────────

/**
 * Look up a display name from CONTENT tables by entity type and id.
 * @param {string} type  An ENTITY enum value (e.g. ENTITY.SHIP, ENTITY.STATION)
 * @param {string} id    The content id
 * @returns {string}     Display name, or the raw id as fallback
 */
export function defaultHistoryResolver(type, id) {
  switch (type) {
    case ENTITY.SHIP:
      return CONTENT.ships[id]?.name
        ?? CONTENT.hulls[id]?.label
        ?? id;
    case ENTITY.STATION:
      return CONTENT.locations[id]?.name ?? id;
    case ENTITY.CHARACTER:
      return CONTENT.characters[id]?.name ?? id;
    case ENTITY.FACTION:
      return getFactionName(id);
    case ENTITY.ZONE:
      return id;  // zones don't have a label table — use id as-is
    case ENTITY.PLANET:
      return CONTENT.locations[id]?.name ?? id;
    case ENTITY.LOCATION:
      return CONTENT.locations[id]?.name ?? id;
    default:
      return id;
  }
}

// ── History System ───────────────────────────────────────────────────────────

export class HistorySystem {
  constructor() {
    /** @type {Array} Runtime entries appended during play. */
    this._runtimeEntries = [];
    /** @type {Array|null} Cached sorted merge of all entries. */
    this._sorted = null;
  }

  /** Merged + sorted array of all history entries (content + runtime). */
  get entries() {
    if (!this._sorted) {
      const content = Object.values(CONTENT.history);
      this._sorted = [...content, ...this._runtimeEntries].sort(compareDates);
    }
    return this._sorted;
  }

  /** Append a runtime entry and invalidate the cache. */
  append(entry) {
    this._runtimeEntries.push(entry);
    this._sorted = null;
  }

  /** Return entries that include the given tag. */
  byTag(tag) {
    return this.entries.filter(e => e.tags?.includes(tag));
  }

  /** Shorthand for byTag with a zone id. */
  byZone(zoneId) {
    return this.byTag(zoneId);
  }

  /** Return entries within a date range (inclusive). */
  byDateRange(from, to) {
    const lo = dateToNum(from);
    const hi = dateToNum(to);
    return this.entries.filter(e => {
      const n = dateToNum(e.date);
      return n >= lo && n <= hi;
    });
  }

  /**
   * Replace {{alias}} tokens in entry text with display names.
   * @param {object} entry    A history entry with `text` and optional `related`
   * @param {function} [resolver=defaultHistoryResolver]  (type, id) → string
   * @returns {string} Interpolated text
   */
  resolveText(entry, resolver = defaultHistoryResolver) {
    if (!entry.related) return entry.text;
    return entry.text.replace(/\{\{([^}]+)\}\}/g, (_match, alias) => {
      const ref = entry.related[alias];
      if (!ref) return `{{${alias}}}`;
      return resolver(ref.type, ref.id);
    });
  }

  // Static helpers exposed for external use
  static compareDates = compareDates;
  static dateToNum = dateToNum;
}
