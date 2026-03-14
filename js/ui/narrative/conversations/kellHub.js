// kellHub — arrival narration + zone selection loop for Kell's Stop.

export async function kellHub(ctx) {
  const { game, log } = ctx;

  // First visit narration
  if (!game.storyFlags?.visited_kells) {
    log.narrate("The docking clamps engage with a shudder. Through the viewport, Kell's Stop unfolds — a squat fuel platform bolted to whatever was left of an old survey barge.", 'flavor');
    log.narrate("The two tanks on the starboard side are older than the platform. Nobody knows whose they were.", 'flavor');
    if (game.storyFlags) game.storyFlags.visited_kells = true;
  } else {
    log.narrate("The familiar shape of Kell's Stop fills the viewport. The docking spar locks in.", 'flavor');
  }

  log.dialogue('Dock Master', "Another one in from the black. What do you need?", '#ffaa00');

  // Hub loop
  while (true) {
    const options = [
      { text: '[Walk to the fuel depot]' },
      { text: '[Check the bounty board]' },
      { text: '[Ask around for intel]' },
      { text: '[Browse the trade post]' },
      { text: '[Check faction standings]' },
      { text: '[Undock]' },
    ];

    const pick = await log.choices(options);

    switch (pick) {
      case 0:
        log.divider('FUEL DEPOT & REPAIRS');
        await ctx.runZone('dock');
        log.dialogue('Dock Master', "Back already?", '#ffaa00');
        break;
      case 1:
        log.divider('BOUNTY BOARD');
        await ctx.runZone('bounties');
        break;
      case 2:
        log.divider('INTEL');
        await ctx.runZone('intel');
        break;
      case 3:
        log.divider('TRADE POST');
        await ctx.runZone('trade');
        break;
      case 4:
        log.divider('FACTION STANDINGS');
        await ctx.runZone('relations');
        break;
      case 5:
      default:
        log.narrate("The docking clamps release. You drift clear of Kell's Stop, back into the cold.", 'flavor');
        return;
    }
  }
}
