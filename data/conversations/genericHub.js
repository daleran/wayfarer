// genericHub — auto-generated hub from station data for stations without authored conversations.

import { registerContent } from '@data/dataRegistry.js';

export async function genericHub(ctx) {
  const { station, log, game } = ctx;

  log.narrate(`Docking clamps engage. You're aboard ${station.name}.`, 'flavor');

  // Hub loop — present zone choices, run zone conversations, loop back
  while (true) {
    const zones = station.layout?.zones ?? [];
    const options = [];
    const zoneMap = [];

    for (const zone of zones) {
      const locked = _isZoneLocked(zone, station, game);
      options.push({
        text: `[${zone.label}]`,
        disabled: locked,
        reason: locked ? 'LOCKED' : undefined,
      });
      zoneMap.push(zone.id);
    }

    options.push({ text: '[Undock]' });

    const pick = await log.choices(options);
    if (pick === options.length - 1 || pick < 0) {
      // Undock
      log.narrate('The docking clamps release. You drift clear of the station.', 'flavor');
      return;
    }

    const zoneId = zoneMap[pick];
    const zone = zones.find(z => z.id === zoneId);
    if (zone) {
      log.divider(zone.label.toUpperCase());

      // Show flavor text
      if (zone.flavor?.length > 0) {
        for (const line of zone.flavor) {
          if (line === '') continue;
          const isHeading = line.startsWith('[') ||
            (line === line.toUpperCase() && line.length > 2 && !line.includes("'"));
          log.narrate(line, isHeading ? 'system' : 'flavor');
        }
      }

      // Run zone conversation
      await ctx.runZone(zoneId);
    }
  }
}

function _isZoneLocked(zone, station, game) {
  if (!zone.requiredStanding) return false;
  const faction = zone.requiredFaction ?? station.reputationFaction;
  const level = game?.reputation?.getLevel(faction) ?? 'Neutral';
  const ORDER = ['Hostile', 'Wary', 'Neutral', 'Trusted', 'Allied'];
  return ORDER.indexOf(level) < ORDER.indexOf(zone.requiredStanding);
}

registerContent('conversations', 'genericHub', genericHub);
