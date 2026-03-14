// ashveilDock — repair bay + reactor overhaul at Ashveil Anchorage.

import { REPUTATION } from '@data/compiledData.js';

export async function ashveilDock(ctx) {
  const { game, station, log } = ctx;
  const player = game.player;
  const isAllied = game.reputation?.isAllied(station.reputationFaction) ?? false;
  const discount = isAllied ? (1 - REPUTATION.DISCOUNT_RATE) : 1;

  log.narrate("The repair bay fills the lower gantry — a pressurized cavern strung with work lights and overhead cranes. The smell of ionized metal hangs in the air. Two mechanics work a plasma cutter on a hull section.", 'flavor');

  if (!game.storyFlags?.met_ashveil_chief) {
    log.dialogue('Chief Maro', "You need work done, you talk to me. Nobody else touches your ship without my say.", '#44aaff');
    if (game.storyFlags) game.storyFlags.met_ashveil_chief = true;
  } else {
    log.dialogue('Chief Maro', "What have you done to it this time?", '#44aaff');
  }

  if (isAllied) {
    log.result('Allied discount: 15% off all services.', 'cyan');
  }

  while (true) {
    const options = [];
    const actions = [];

    // Armor
    const needsArmor = _needsArmor(player);
    if (needsArmor) {
      const a = player.armorArcs;
      const am = player.armorArcsMax;
      const dmg = Math.ceil(
        (am.front - a.front) + (am.port - a.port) +
        (am.starboard - a.starboard) + (am.aft - a.aft)
      );
      const cost = Math.ceil(dmg * discount);
      options.push({
        text: `[Armor repair — ${cost} scrap]`,
        disabled: game.scrap < cost,
        reason: game.scrap < cost ? 'Not enough scrap' : undefined,
      });
      actions.push({ type: 'armor', cost });
    }

    // Hull
    if (player.hullCurrent < player.hullMax) {
      const cost = Math.ceil((player.hullMax - player.hullCurrent) * 2 * discount);
      options.push({
        text: `[Hull repair — ${cost} scrap]`,
        disabled: game.scrap < cost,
        reason: game.scrap < cost ? 'Not enough scrap' : undefined,
      });
      actions.push({ type: 'hull', cost });
    }

    // Fuel
    const fuelNeeded = game.fuelMax - game.fuel;
    if (fuelNeeded > 0.5) {
      const cost = Math.ceil(fuelNeeded * 0.5 * discount);
      options.push({
        text: `[Refuel — ${cost} scrap]`,
        disabled: game.scrap < cost,
        reason: game.scrap < cost ? 'Not enough scrap' : undefined,
      });
      actions.push({ type: 'fuel', cost });
    }

    // Reactor overhaul
    if (station.canOverhaulReactor) {
      const fissionMods = (player.moduleSlots ?? []).filter(m => m?.isFissionReactor);
      for (const mod of fissionMods) {
        const label = mod.isOverdue
          ? `[Reactor overhaul: ${mod.displayName} — ${mod.overhaulCost} scrap — OVERDUE]`
          : `[Reactor overhaul: ${mod.displayName} — ${mod.overhaulCost} scrap]`;
        options.push({
          text: label,
          disabled: game.scrap < mod.overhaulCost,
          reason: game.scrap < mod.overhaulCost ? 'Not enough scrap' : undefined,
        });
        actions.push({ type: 'reactor', mod });
      }
    }

    if (!needsArmor && player.hullCurrent >= player.hullMax && fuelNeeded <= 0.5) {
      log.dialogue('Chief Maro', "Ship's in good shape. Fuel's topped off. You don't need me.", '#44aaff');
    }

    options.push({ text: '[Head back]' });
    actions.push({ type: 'back' });

    const pick = await log.choices(options);
    if (pick < 0) return;

    const action = actions[pick];

    switch (action.type) {
      case 'armor': {
        const am = player.armorArcsMax;
        game.scrap -= action.cost;
        player.armorArcs.front = am.front;
        player.armorArcs.port = am.port;
        player.armorArcs.starboard = am.starboard;
        player.armorArcs.aft = am.aft;
        log.dialogue('Chief Maro', "Plating's set. Good as it gets without a proper shipyard.", '#44aaff');
        log.result(`-${action.cost} scrap. Armor restored.`, 'green');
        break;
      }

      case 'hull': {
        game.scrap -= action.cost;
        player.hullCurrent = player.hullMax;
        log.dialogue('Chief Maro', "Structural integrity's back to spec. Try not to fly into anything.", '#44aaff');
        log.result(`-${action.cost} scrap. Hull restored.`, 'green');
        break;
      }

      case 'fuel': {
        game.scrap -= action.cost;
        game.fuel = game.fuelMax;
        log.dialogue('Chief Maro', "Tanks are full. Safe travels.", '#44aaff');
        log.result(`-${action.cost} scrap. Fuel tanks full.`, 'green');
        break;
      }

      case 'reactor': {
        const mod = action.mod;
        game.scrap -= mod.overhaulCost;
        mod.resetOverhaul();
        if (mod.isOverdue) {
          log.dialogue('Chief Maro', `That ${mod.displayName} was running hot. Another week and it would've been a paperweight.`, '#44aaff');
        } else {
          log.dialogue('Chief Maro', `${mod.displayName} is serviced. Clock's reset.`, '#44aaff');
        }
        log.result(`-${mod.overhaulCost} scrap. ${mod.displayName} overhauled.`, 'green');
        break;
      }

      case 'back':
        return;
    }
  }
}

function _needsArmor(player) {
  const a = player.armorArcs;
  const am = player.armorArcsMax;
  return a && am && (
    a.front < am.front || a.port < am.port ||
    a.starboard < am.starboard || a.aft < am.aft
  );
}
