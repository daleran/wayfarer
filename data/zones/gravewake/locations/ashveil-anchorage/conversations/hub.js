// ashveilHub — arrival narration + zone selection loop for Ashveil Anchorage.

import { registerContent } from '@data/dataRegistry.js';

export async function ashveilHub(ctx) {
  const { game, log } = ctx;

  log.setNpcContext({
    harbor: { name: 'Harbor Control', color: '#00ffcc' },
  });

  // First visit narration
  if (!game.storyFlags?.visited_ashveil) {
    log.seq([
      "The Anchorage fills your viewport — a decommissioned colony ship, repurposed into something between a town and a machine. Hull sections jut at odd angles, connected by struts and pressurized walkways. Docked ships cling to the outer piers like barnacles.",
      "Inside, the air smells of recycled atmosphere and welding flux. Light filters through patched viewports in bands of amber and white.",
    ]);
    if (game.storyFlags) {
      game.storyFlags.visited_ashveil = true;
    }
  } else {
    log.narrate("Ashveil Anchorage. The colony ship's silhouette is unmistakable — long spine, hab modules jutting from the hull like ribs. The docking collar locks in.", 'flavor');
  }

  log.dln("Anchorage Control, you're cleared to dock. Mind the gantry — it's on a timer.", 'harbor');

  // Hub loop
  while (true) {
    const options = [
      { text: '[Walk to the repair bay]' },
      { text: '[Head to the trade post]' },
      { text: '[Check the bounty board]' },
      { text: '[Look for intel]' },
      { text: '[Check faction standings]' },
      { text: '[Undock]' },
    ];

    const pick = await log.choices(options);

    switch (pick) {
      case 0:
        log.divider('REPAIR BAY');
        await ctx.runZone('repair-bay');
        log.narrate("You walk back toward the main spine.", 'flavor');
        break;
      case 1:
        log.divider('TRADE POST');
        await ctx.runZone('trade-post');
        break;
      case 2:
        log.divider('BOUNTY BOARD');
        await ctx.runZone('bounties');
        break;
      case 3:
        log.divider('INTEL');
        await ctx.runZone('intel');
        break;
      case 4:
        log.divider('FACTION STANDINGS');
        await ctx.runZone('relations');
        break;
      case 5:
      default:
        log.narrate("The docking collar releases. The Anchorage recedes behind you — its running lights blinking in sequence, patient and steady.", 'flavor');
        return;
    }
  }
}

registerContent('conversations', 'ashveilHub', ashveilHub);
