// =============================================================================
// Data Linter — Cross-reference validator for self-registered content.
// Uses Vite SSR to resolve aliases and import the full data boot chain,
// then walks registries checking that every reference points to a real entry.
// =============================================================================

import { createServer } from 'vite';

const errors = [];

function err(tag, msg) {
  errors.push(`  [${tag}] ${msg}`);
}

async function main() {
  const vite = await createServer({ middlewareMode: true, logLevel: 'silent' });

  try {
    // Boot the data layer — triggers all self-registration
    const data = await vite.ssrLoadModule('/data/index.js');
    const { CONTENT, AI_TEMPLATES } = data;
    const { LOCATION_TYPE } = await vite.ssrLoadModule('/data/enums.js');
    const { getLocationsByType } = await vite.ssrLoadModule('/data/dataRegistry.js');

    // ── ship→hull ───────────────────────────────────────────────────────────
    for (const [shipId, ship] of Object.entries(CONTENT.ships)) {
      if (!ship.shipClass) continue;
      if (!CONTENT.hulls[ship.shipClass]) {
        err('ship→hull', `Ship "${shipId}" shipClass "${ship.shipClass}" — not found in CONTENT.hulls`);
      }
    }

    // ── ship→module ─────────────────────────────────────────────────────────
    for (const [shipId, ship] of Object.entries(CONTENT.ships)) {
      if (!ship.modules) continue;
      ship.modules.forEach((modId, i) => {
        if (!modId || modId === 'null') return; // empty slot
        const baseId = modId.includes(':') ? modId.slice(0, modId.indexOf(':')) : modId;
        if (!CONTENT.modules[baseId]) {
          err('ship→module', `Ship "${shipId}" module[${i}] "${modId}" — not found in CONTENT.modules`);
        }
      });
    }

    // ── char→ship ───────────────────────────────────────────────────────────
    for (const [charId, char] of Object.entries(CONTENT.characters)) {
      if (!char.shipId) continue; // player chars may not have shipId
      if (!CONTENT.ships[char.shipId]) {
        err('char→ship', `Character "${charId}" shipId "${char.shipId}" — not found in CONTENT.ships`);
      }
    }

    // ── char→ai ─────────────────────────────────────────────────────────────
    for (const [charId, char] of Object.entries(CONTENT.characters)) {
      if (!char.behavior || char.behavior === 'player') continue;
      if (!AI_TEMPLATES[char.behavior]) {
        err('char→ai', `Character "${charId}" behavior "${char.behavior}" — not found in AI_TEMPLATES`);
      }
    }

    // ── station→conv ────────────────────────────────────────────────────────
    const stations = getLocationsByType(LOCATION_TYPE.STATION);
    for (const [stationId, loc] of Object.entries(stations)) {
      const convs = loc.entity?.conversations;
      if (!convs) continue; // not all stations have conversations yet

      if (convs.hub && !CONTENT.conversations[convs.hub]) {
        err('station→conv', `Station "${stationId}" hub conv "${convs.hub}" — not found in CONTENT.conversations`);
      }
      if (convs.sections) {
        for (const [zone, convId] of Object.entries(convs.sections)) {
          if (convId && !CONTENT.conversations[convId]) {
            err('station→conv', `Station "${stationId}" zone "${zone}" conv "${convId}" — not found in CONTENT.conversations`);
          }
        }
      }
    }

    // ── bounty→char, bounty→ship ────────────────────────────────────────────
    for (const [stationId, loc] of Object.entries(stations)) {
      const bounties = loc.entity?.bountyContracts;
      if (!bounties) continue;

      bounties.forEach((b, i) => {
        if (b.targetCharacterId && !CONTENT.characters[b.targetCharacterId]) {
          err('bounty→char', `Station "${stationId}" bounty[${i}] targetCharacterId "${b.targetCharacterId}" — not found in CONTENT.characters`);
        }
        if (b.targetShipType && !CONTENT.ships[b.targetShipType]) {
          err('bounty→ship', `Station "${stationId}" bounty[${i}] targetShipType "${b.targetShipType}" — not found in CONTENT.ships`);
        }
      });
    }

    // ── ship→ai (unmanned ships) ───────────────────────────────────────────
    for (const [shipId, ship] of Object.entries(CONTENT.ships)) {
      if (!ship.aiBehavior) continue;
      if (!AI_TEMPLATES[ship.aiBehavior]) {
        err('ship→ai', `Ship "${shipId}" aiBehavior "${ship.aiBehavior}" — not found in AI_TEMPLATES`);
      }
    }

    // ── derelict→hull ───────────────────────────────────────────────────────
    for (const [derelictId, derelict] of Object.entries(CONTENT.derelicts)) {
      if (!derelict.shipClass) continue;
      if (!CONTENT.hulls[derelict.shipClass]) {
        err('derelict→hull', `Derelict "${derelictId}" shipClass "${derelict.shipClass}" — not found in CONTENT.hulls`);
      }
    }

    // ── instanceof ban (static) ────────────────────────────────────────────
    // Entity type checks must use entityType tags, not instanceof.
    // instanceof creates circular dependency risks when entity classes are
    // imported into systems/HUD/renderer files.
    {
      const { readdirSync, readFileSync } = await import('node:fs');
      const { join } = await import('node:path');

      const ENTITY_CLASSES = ['Ship', 'Station', 'Projectile', 'LootDrop', 'Planet', 'Entity', 'RocketExplosion'];
      const instanceofPattern = new RegExp(`instanceof\\s+(${ENTITY_CLASSES.join('|')})\\b`);
      // Flag raw string entityType comparisons — must use ENTITY enum from data/enums.js
      const rawEntityTypePattern = /entityType\s*[!=]==?\s*['"]/;

      function walkJs(dir) {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
          const full = join(dir, entry.name);
          if (entry.isDirectory()) { walkJs(full); continue; }
          if (!entry.name.endsWith('.js')) continue;
          // Allow instanceof in entity files themselves (class hierarchies)
          const inEntities = full.includes('/entities/');
          const lines = readFileSync(full, 'utf8').split('\n');
          lines.forEach((line, i) => {
            if (!inEntities) {
              const m = line.match(instanceofPattern);
              if (m) err('instanceof', `${full}:${i + 1} — use entityType tag instead of instanceof ${m[1]}`);
            }
            if (rawEntityTypePattern.test(line)) {
              err('raw-entityType', `${full}:${i + 1} — use ENTITY enum from data/enums.js instead of raw string`);
            }
          });
        }
      }
      walkJs('engine');
    }

    // ── Report ──────────────────────────────────────────────────────────────
    const checks = 10;
    if (errors.length > 0) {
      console.error('\nDATA LINT ERRORS:\n');
      errors.forEach(e => console.error(e));
      console.error(`\nDATA LINT: ${checks} checks run, ${errors.length} error(s) found.\n`);
      process.exitCode = 1;
    } else {
      console.log(`\nDATA LINT: ${checks} checks passed, 0 errors.\n`);
    }
  } finally {
    await vite.close();
  }
}

main();
