// genericHub — auto-generated hub from station data for stations without authored conversations.

import { registerContent } from '@data/dataRegistry.js';

export async function genericHub(ctx) {
  const { station, log, game } = ctx;

  log.narrate(`Docking clamps engage. You're aboard ${station.name}.`, 'flavor');

  // Hub loop — present section choices, run section conversations, loop back
  while (true) {
    const sections = station.layout?.sections ?? [];
    const options = [];
    const sectionMap = [];

    for (const section of sections) {
      const locked = _isSectionLocked(section, station, game);
      options.push({
        text: `[${section.label}]`,
        disabled: locked,
        reason: locked ? 'LOCKED' : undefined,
      });
      sectionMap.push(section.id);
    }

    options.push({ text: '[Undock]' });

    const pick = await log.choices(options);
    if (pick === options.length - 1 || pick < 0) {
      // Undock
      log.narrate('The docking clamps release. You drift clear of the station.', 'flavor');
      return;
    }

    const sectionId = sectionMap[pick];
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      log.divider(section.label.toUpperCase());

      // Show flavor text
      if (section.flavor?.length > 0) {
        for (const line of section.flavor) {
          if (line === '') continue;
          const isHeading = line.startsWith('[') ||
            (line === line.toUpperCase() && line.length > 2 && !line.includes("'"));
          log.narrate(line, isHeading ? 'system' : 'flavor');
        }
      }

      // Run section conversation
      await ctx.runSection(sectionId);
    }
  }
}

function _isSectionLocked(section, station, game) {
  if (!section.requiredStanding) return false;
  const faction = section.requiredFaction ?? station.reputationFaction;
  const level = game?.reputation?.getLevel(faction) ?? 'Neutral';
  const ORDER = ['Hostile', 'Wary', 'Neutral', 'Trusted', 'Allied'];
  return ORDER.indexOf(level) < ORDER.indexOf(section.requiredStanding);
}

registerContent('conversations', 'genericHub', genericHub);
