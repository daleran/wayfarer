#!/usr/bin/env node
// =============================================================================
// WAYFARER — CSV-to-JS Compiler
// Reads all data/*.csv files and generates data/compiledData.js.
// Run: node scripts/compile-data.js
// =============================================================================

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const OUT_FILE = join(DATA_DIR, 'compiledData.js');

// ─── CSV Parsing ─────────────────────────────────────────────────────────────

function parseCSV(text) {
  const lines = text.trim().split('\n').filter(l => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(',').map(v => v.trim());
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      const val = vals[j] ?? '';
      if (val !== '') row[headers[j]] = val;
    }
    rows.push(row);
  }
  return { headers, rows };
}

function coerce(val) {
  if (val === undefined || val === '') return undefined;
  // Pipe-delimited → array
  if (typeof val === 'string' && val.includes('|')) {
    return val.split('|').map(v => coerce(v));
  }
  // Boolean-like
  if (val === 'true') return true;
  if (val === 'false') return false;
  // Number
  const n = Number(val);
  if (!isNaN(n) && val !== '') return n;
  return val;
}

// ─── Key-Value CSV → flat object ─────────────────────────────────────────────

function parseKeyValueCSV(filename) {
  const text = readFileSync(join(DATA_DIR, filename), 'utf8');
  const { rows } = parseCSV(text);
  const result = {};
  for (const row of rows) {
    result[row.key] = coerce(row.value);
  }
  return result;
}

// ─── Tabular CSV → object keyed by id ────────────────────────────────────────

function parseTabularCSV(filename) {
  const text = readFileSync(join(DATA_DIR, filename), 'utf8');
  const { headers, rows } = parseCSV(text);
  const result = {};
  for (const row of rows) {
    const id = row.id;
    if (!id) continue;
    const entry = {};
    for (const h of headers) {
      if (h === 'id') continue;
      const val = coerce(row[h]);
      if (val !== undefined) entry[h] = val;
    }
    result[id] = entry;
  }
  return result;
}

// ─── Build SPAWN nested object from flat keys ────────────────────────────────

function buildSpawn(kv) {
  return {
    ENEMY_RADIUS: { MIN: kv.SPAWN_ENEMY_RADIUS_MIN, MAX: kv.SPAWN_ENEMY_RADIUS_MAX },
    LURKER_RADIUS: { MIN: kv.SPAWN_LURKER_RADIUS_MIN, MAX: kv.SPAWN_LURKER_RADIUS_MAX },
  };
}

// ─── Build BOUNTY nested object ──────────────────────────────────────────────

function buildBounty(kv) {
  return { EXPIRY_WARNING_SECS: kv.BOUNTY_EXPIRY_WARNING_SECS };
}

// ─── Build REPUTATION nested object ──────────────────────────────────────────

function buildReputation(kv) {
  return {
    KILL_PENALTY: kv.KILL_PENALTY,
    RIVAL_BONUS: kv.RIVAL_BONUS,
    BOUNTY_BONUS: kv.BOUNTY_BONUS,
    ATTACK_NEUTRAL_PENALTY: kv.ATTACK_NEUTRAL_PENALTY,
    HOSTILE_THRESHOLD: kv.HOSTILE_THRESHOLD,
    ALLIED_THRESHOLD: kv.ALLIED_THRESHOLD,
    DISCOUNT_RATE: kv.DISCOUNT_RATE,
  };
}

// ─── Serialize JS value ──────────────────────────────────────────────────────

function toJS(val, indent = 0) {
  const pad = '  '.repeat(indent);
  const pad1 = '  '.repeat(indent + 1);
  if (val === null || val === undefined) return 'undefined';
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (typeof val === 'string') return JSON.stringify(val);
  if (Array.isArray(val)) {
    const items = val.map(v => toJS(v, 0));
    return '[' + items.join(', ') + ']';
  }
  if (typeof val === 'object') {
    const entries = Object.entries(val);
    if (entries.length === 0) return '{}';
    const lines = entries.map(([k, v]) => {
      const key = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
      return `${pad1}${key}: ${toJS(v, indent + 1)},`;
    });
    return `{\n${lines.join('\n')}\n${pad}}`;
  }
  return String(val);
}

// ─── Main ────────────────────────────────────────────────────────────────────

// Key-value CSVs
const shipBase = parseKeyValueCSV('shipBase.csv');
const weaponBase = parseKeyValueCSV('weaponBase.csv');
const economy = parseKeyValueCSV('economy.csv');
const reputation = parseKeyValueCSV('reputation.csv');

// Tabular CSVs
const SHIP_CLASSES = parseTabularCSV('shipClasses.csv');
const NPC_SHIPS = parseTabularCSV('shipsNamed.csv');
const ENGINES = parseTabularCSV('moduleEngines.csv');
const REACTORS = parseTabularCSV('moduleReactors.csv');
const SENSORS = parseTabularCSV('moduleSensors.csv');
const WEAPONS = parseTabularCSV('moduleWeapons.csv');
const AI_TEMPLATES = parseTabularCSV('aiBehaviors.csv');

// Build nested objects
const SPAWN = buildSpawn(shipBase);
const BOUNTY = buildBounty(economy);
const REPUTATION = buildReputation(reputation);

// ─── Generate output ─────────────────────────────────────────────────────────

const lines = [
  '// =============================================================================',
  '// WAYFARER — Compiled Data (auto-generated by scripts/compile-data.js)',
  '// DO NOT EDIT — modify data/*.csv and re-run: node scripts/compile-data.js',
  '// =============================================================================',
  '',
  '// ─── Ship Base Constants ──────────────────────────────────────────────────────',
];

// Ship base constants — individual exports
for (const [k, v] of Object.entries(shipBase)) {
  if (k.startsWith('SPAWN_')) continue; // handled by SPAWN object
  lines.push(`export const ${k} = ${toJS(v)};`);
}
lines.push(`export const SPAWN = ${toJS(SPAWN)};`);

lines.push('');
lines.push('// ─── Weapon Base Constants ────────────────────────────────────────────────────');
for (const [k, v] of Object.entries(weaponBase)) {
  lines.push(`export const ${k} = ${toJS(v)};`);
}

lines.push('');
lines.push('// ─── Economy Constants ───────────────────────────────────────────────────────');
for (const [k, v] of Object.entries(economy)) {
  if (k === 'BOUNTY_EXPIRY_WARNING_SECS') continue; // handled by BOUNTY object
  lines.push(`export const ${k} = ${toJS(v)};`);
}
lines.push(`export const BOUNTY = ${toJS(BOUNTY)};`);

lines.push('');
lines.push('// ─── Reputation Constants ────────────────────────────────────────────────────');
lines.push(`export const REPUTATION = ${toJS(REPUTATION)};`);

lines.push('');
lines.push('// ─── Ship Classes ────────────────────────────────────────────────────────────');
lines.push(`export const SHIP_CLASSES = ${toJS(SHIP_CLASSES)};`);

lines.push('');
lines.push('// ─── Named Ships (NPCs + Player) ────────────────────────────────────────────');
lines.push(`export const NPC_SHIPS = ${toJS(NPC_SHIPS)};`);

lines.push('');
lines.push('// ─── Engine Modules ──────────────────────────────────────────────────────────');
lines.push(`export const ENGINES = ${toJS(ENGINES)};`);

lines.push('');
lines.push('// ─── Reactor Modules ─────────────────────────────────────────────────────────');
lines.push(`export const REACTORS = ${toJS(REACTORS)};`);

lines.push('');
lines.push('// ─── Sensor Modules ──────────────────────────────────────────────────────────');
lines.push(`export const SENSORS = ${toJS(SENSORS)};`);

lines.push('');
lines.push('// ─── Weapon Modules ──────────────────────────────────────────────────────────');
lines.push(`export const WEAPONS = ${toJS(WEAPONS)};`);

lines.push('');
lines.push('// ─── AI Templates ────────────────────────────────────────────────────────────');
lines.push(`export const AI_TEMPLATES = ${toJS(AI_TEMPLATES)};`);

lines.push('');

writeFileSync(OUT_FILE, lines.join('\n'), 'utf8');
console.log(`✓ Compiled ${readdirSync(DATA_DIR).filter(f => f.endsWith('.csv')).length} CSVs → ${OUT_FILE}`);
