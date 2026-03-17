// =============================================================================
// Data Extractor — Loads all game data via Vite SSR and outputs markdown tables.
// Usage: node scripts/extract-data.js
// =============================================================================

import { createServer } from 'vite';

function mdTable(headers, rows) {
  const sep = headers.map(() => '---');
  const lines = [
    '| ' + headers.join(' | ') + ' |',
    '| ' + sep.join(' | ') + ' |',
    ...rows.map(r => '| ' + r.map(v => v ?? '').join(' | ') + ' |'),
  ];
  return lines.join('\n');
}

function fmt(v) {
  if (v === undefined || v === null) return '';
  if (Array.isArray(v)) return v.join(', ');
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

function log(msg) {
  process.stderr.write(`  ${msg}\n`);
}

function emitTable(name, sections, cols, rows) {
  log(`  ${name} (${rows.length} entries)`);
  sections.push(`## ${name}\n\n` + mdTable(cols, rows));
}

async function main() {
  log('Starting Vite SSR...');
  const vite = await createServer({ middlewareMode: true, logLevel: 'silent' });

  try {
    log('Loading data layer...');
    const data = await vite.ssrLoadModule('/data/index.js');
    const {
      SHIP_CLASSES, ENGINES, REACTORS, SENSORS, WEAPONS, UTILITIES,
      AI_TEMPLATES, AMMO, CONTENT,
      getFactionName,
    } = data;

    const { ENTITY, LOCATION_TYPE } = await vite.ssrLoadModule('/data/enums.js');
    const { getLocationsByType } = await vite.ssrLoadModule('/data/dataRegistry.js');

    const tuning = await vite.ssrLoadModule('/data/tuning.js');
    const { COMMODITIES } = await vite.ssrLoadModule('/data/commodities.js');
    log('Data loaded. Generating tables:');

    const sections = [];

    // ── Tuning Constants ──────────────────────────────────────────────────────
    {
      const rows = [];
      for (const [k, v] of Object.entries(tuning)) {
        if (typeof v === 'function') continue;
        rows.push([k, fmt(v)]);
      }
      emitTable('Tuning Constants', sections, ['Constant', 'Value'], rows);
    }

    // ── Factions ──────────────────────────────────────────────────────────────
    {
      const factionData = CONTENT.factions || {};
      const rows = Object.entries(factionData).map(([id, f]) => {
        const hostiles = (f.relationships || []).filter(r => r.type === 'hostile').map(r => r.target).join(', ');
        return [id, f.name || '', f.parent || '', f.defaultReputation ?? '', hostiles];
      });
      emitTable('Factions', sections, ['Key', 'Name', 'Parent', 'Default Rep', 'Hostile To'], rows);
    }

    // ── Ship Classes ──────────────────────────────────────────────────────────
    {
      const cols = ['ID', 'Label', 'Speed', 'Accel', 'Turn', 'Hull', 'Weight', 'Cargo', 'ArmorF', 'ArmorS', 'ArmorA', 'FuelMax', 'FuelEff'];
      const rows = Object.entries(SHIP_CLASSES).map(([id, s]) => [
        id, s.label, s.speedMult, s.accelMult, s.turnMult, s.hullMult,
        s.weightMult, s.cargoMult, s.armorFront, s.armorSide, s.armorAft,
        s.fuelMaxMult, s.fuelEffMult,
      ].map(fmt));
      emitTable('Ship Classes', sections, cols, rows);
    }

    // ── Engines ───────────────────────────────────────────────────────────────
    {
      const cols = ['ID', 'Name', 'Size', 'Thrust', 'FuelEff', 'FuelDrain', 'Power', 'Weight'];
      const rows = Object.entries(ENGINES).map(([id, e]) => [
        id, e.displayName, e.size, e.thrust, e.fuelEffMult, e.fuelDrainRate, e.powerDraw, e.weight,
      ].map(fmt));
      emitTable('Engines', sections, cols, rows);
    }

    // ── Reactors ──────────────────────────────────────────────────────────────
    {
      const cols = ['ID', 'Name', 'Size', 'Output', 'FuelDrain', 'Weight'];
      const rows = Object.entries(REACTORS).map(([id, r]) => [
        id, r.displayName, r.size, r.powerOutput, r.fuelDrainRate, r.weight,
      ].map(fmt));
      emitTable('Reactors', sections, cols, rows);
    }

    // ── Sensors ───────────────────────────────────────────────────────────────
    {
      const cols = ['ID', 'Name', 'Power', 'Weight', 'Range', 'Minimap', 'Lead', 'Health', 'Salvage', 'Traj', 'Telemetry', 'Inspect'];
      const rows = Object.entries(SENSORS).map(([id, s]) => [
        id, s.displayName, s.powerDraw, s.weight, s.sensorRange,
        s.minimapShips, s.leadIndicators, s.healthPips,
        s.salvageDetail, s.trajectoryLine, s.enemyTelemetry, s.moduleInspection,
      ].map(fmt));
      emitTable('Sensors', sections, cols, rows);
    }

    // ── Weapons ───────────────────────────────────────────────────────────────
    {
      const cols = ['ID', 'Name', 'Size', 'DmgMult', 'HullDmg', 'Range', 'Speed', 'Cooldown', 'Mag', 'Reload', 'Ammo', 'Flags'];
      const rows = Object.entries(WEAPONS).map(([id, w]) => {
        const flags = [];
        if (w.isBeam) flags.push('beam');
        if (w.isFixed) flags.push('fixed');
        if (w.isSecondary) flags.push('secondary');
        if (w.canIntercept) flags.push('intercept');
        if (w.isInterceptable) flags.push('interceptable');
        return [
          id, w.displayName, w.size, w.damageMult, w.hullDamageMult,
          w.rangeMult, w.speedMult, w.cooldownMult, w.magSize, w.reloadTime,
          fmt(w.acceptedAmmoTypes), flags.join(', '),
        ].map(fmt);
      });
      emitTable('Weapons', sections, cols, rows);
    }

    // ── Utilities ─────────────────────────────────────────────────────────────
    {
      const cols = ['ID', 'Name', 'Size', 'Weight', 'Cargo', 'Fuel', 'Armor'];
      const rows = Object.entries(UTILITIES).map(([id, u]) => [
        id, u.displayName, u.size, u.weight, u.cargoBonus, u.fuelBonus, u.armorBonus,
      ].map(fmt));
      emitTable('Utilities', sections, cols, rows);
    }

    // ── Ammo ──────────────────────────────────────────────────────────────────
    {
      const cols = ['ID', 'Name', 'Tag', 'Weight', 'Value', 'Guided'];
      const rows = Object.entries(AMMO).map(([id, a]) => [
        id, a.name, a.tag, a.weight, a.baseValue, a.guidedType,
      ].map(fmt));
      emitTable('Ammo', sections, cols, rows);
    }

    // ── AI Templates ──────────────────────────────────────────────────────────
    {
      const cols = ['ID', 'Combat', 'Passive', 'Aggro', 'Deaggro', 'Fire', 'Orbit/Kite', 'Flee'];
      const rows = Object.entries(AI_TEMPLATES).map(([id, a]) => [
        id, a.combatBehavior, a.passiveBehavior,
        a.aggroRange, a.deaggroRange, a.fireRange || a.standoffFireRange,
        a.orbitRadius || a.kiteRange || a.standoffRange,
        a.fleeHullRatio,
      ].map(fmt));
      emitTable('AI Templates', sections, cols, rows);
    }

    // ── Commodities ───────────────────────────────────────────────────────────
    {
      const cols = ['ID', 'Name', 'BasePrice', 'Mass'];
      const rows = Object.entries(COMMODITIES).map(([id, c]) => [
        id, c.name, c.basePrice, c.mass,
      ].map(fmt));
      emitTable('Commodities', sections, cols, rows);
    }

    // ── Characters ────────────────────────────────────────────────────────────
    {
      const cols = ['ID', 'Name', 'Faction', 'Behavior', 'Ship', 'Bounty'];
      const rows = Object.entries(CONTENT.characters).map(([id, c]) => [
        id, c.name, c.faction, c.behavior, c.shipId, c.bounty,
      ].map(fmt));
      emitTable('Characters', sections, cols, rows);
    }

    // ── Ships ─────────────────────────────────────────────────────────────────
    {
      const cols = ['ID', 'Label', 'Hull', 'Name', 'Modules', 'Unmanned'];
      const rows = Object.entries(CONTENT.ships).map(([id, s]) => [
        id, s.label, s.shipClass, s.name,
        s.modules ? s.modules.join(', ') : '',
        s.unmanned ? 'yes' : '',
      ]);
      emitTable('Ships', sections, cols, rows);
    }

    // ── Stations ──────────────────────────────────────────────────────────────
    {
      const cols = ['ID', 'Name', 'Faction', 'Services', 'DockRadius'];
      const rows = Object.entries(getLocationsByType(LOCATION_TYPE.STATION)).map(([id, loc]) => {
        const e = loc.entity || {};
        const services = e.services ? e.services.join(', ') : '';
        return [id, loc.name || e.name, e.faction, services, e.dockRadius];
      }).map(r => r.map(fmt));
      emitTable('Stations', sections, cols, rows);
    }

    // ── Derelicts ─────────────────────────────────────────────────────────────
    {
      const cols = ['ID', 'Name', 'Hull'];
      const rows = Object.entries(CONTENT.derelicts).map(([id, d]) => [
        id, d.name, d.shipClass,
      ].map(fmt));
      emitTable('Derelicts', sections, cols, rows);
    }

    // ── History Timeline ────────────────────────────────────────────────────
    {
      const ERA_RANGES = [
        [2035, 2055, 'The Machine Mandate'],
        [2055, 2130, 'The Quiet Collapse'],
        [2130, 2250, 'The Concord Design'],
        [2250, 2304, 'The Dream and the Divide'],
        [2304, 2305, 'The Veiled Collapse'],
        [2305, 2382, 'The Exodus Reclaimed'],
        [2382, 2420, 'The Arrival Drift'],
        [2420, 2600, 'The Afterlight Era'],
      ];

      function eraForYear(year) {
        for (const [start, end, name] of ERA_RANGES) {
          if (year >= start && year < end) return name;
        }
        return '';
      }

      function resolveTemplate(text, related) {
        if (!related) return text;
        return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
          const ref = related[key];
          if (!ref) return `{{${key}}}`;
          if (ref.type === ENTITY.FACTION) return getFactionName(ref.id);
          if (ref.type === ENTITY.STATION) {
            const loc = CONTENT.locations[ref.id];
            return loc ? (loc.name || loc.entity?.name || ref.id) : ref.id;
          }
          return ref.id;
        });
      }

      const entries = Object.entries(CONTENT.history)
        .map(([id, h]) => ({ id, ...h }))
        .sort((a, b) => {
          const ya = a.date.year, yb = b.date.year;
          if (ya !== yb) return ya - yb;
          const ma = a.date.month || 1, mb = b.date.month || 1;
          if (ma !== mb) return ma - mb;
          return (a.date.day || 1) - (b.date.day || 1);
        });

      const cols = ['Date', 'Era', 'Event', 'Tags'];
      const rows = entries.map(h => {
        const d = h.date;
        const dateStr = `${d.year}-${String(d.month || 1).padStart(2, '0')}-${String(d.day || 1).padStart(2, '0')}`;
        return [
          dateStr,
          eraForYear(d.year),
          resolveTemplate(h.text, h.related),
          (h.tags || []).join(', '),
        ];
      });
      emitTable('History Timeline', sections, cols, rows);
    }

    log('Done — 16 tables written.');
    console.log(sections.join('\n\n'));

  } finally {
    await vite.close();
  }
}

main();
