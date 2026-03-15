// kellDock — fuel depot & repair conversation at Kell's Stop.

import { REPUTATION } from '@data/index.js';
import { registerContent } from '@data/dataRegistry.js';

export async function kellDock(ctx) {
  const { game, station, log } = ctx;
  const player = game.player;
  const isAllied = game.reputation?.isAllied(station.reputationFaction) ?? false;
  const discount = isAllied ? (1 - REPUTATION.DISCOUNT_RATE) : 1;

  log.setNpcContext({
    ansa: { name: 'Ansa', color: '#ff8844' },
  });

  log.narrate("The fuel bay is cramped — two work benches, a parts rack, and a fuel line snaking down from the overhead tanks. A woman in welding goggles looks up from a manifold valve.", 'flavor');

  if (!game.storyFlags?.met_kell_mechanic) {
    log.dln("New face. I do fuel and patches. Nothing fancy. You want pretty, fly to the Anchorage.", 'ansa');
    if (game.storyFlags) game.storyFlags.met_kell_mechanic = true;
  } else {
    log.dln("You again. What needs fixing?", 'ansa');
  }

  if (isAllied) {
    log.seq([
      "i::She nods at you — the look of someone who remembers a favor.",
      "s::Allied discount: 15% off all services.",
    ]);
  }

  while (true) {
    const options = [];
    const actions = [];

    // Check what needs doing
    const needsArmor = _needsArmor(player);
    const needsHull = player.hullCurrent < player.hullMax;
    const fuelNeeded = game.fuelMax - game.fuel;

    if (needsArmor) {
      const a = player.armorArcs;
      const am = player.armorArcsMax;
      const dmg = Math.ceil(
        (am.front - a.front) + (am.port - a.port) +
        (am.starboard - a.starboard) + (am.aft - a.aft)
      );
      const cost = Math.ceil(dmg * discount);
      options.push({
        text: `[Patch the armor — ${cost} scrap]`,
        disabled: game.scrap < cost,
        reason: game.scrap < cost ? 'Not enough scrap' : undefined,
      });
      actions.push({ type: 'armor', cost });
    }

    if (needsHull) {
      const cost = Math.ceil((player.hullMax - player.hullCurrent) * 2 * discount);
      options.push({
        text: `[Repair the hull — ${cost} scrap]`,
        disabled: game.scrap < cost,
        reason: game.scrap < cost ? 'Not enough scrap' : undefined,
      });
      actions.push({ type: 'hull', cost });
    }

    if (fuelNeeded > 0.5) {
      const fullCost = Math.ceil(fuelNeeded * 0.5 * discount);
      options.push({
        text: `[Fill the tank — ${fullCost} scrap]`,
        disabled: game.scrap < fullCost,
        reason: game.scrap < fullCost ? 'Not enough scrap' : undefined,
      });
      actions.push({ type: 'fuel_full', cost: fullCost, amount: fuelNeeded });

      if (fuelNeeded > 2) {
        const halfAmount = Math.ceil(fuelNeeded / 2);
        const halfCost = Math.ceil(halfAmount * 0.5 * discount);
        options.push({
          text: `[Half tank — ${halfCost} scrap]`,
          disabled: game.scrap < halfCost,
          reason: game.scrap < halfCost ? 'Not enough scrap' : undefined,
        });
        actions.push({ type: 'fuel_half', cost: halfCost, amount: halfAmount });
      }
    }

    if (!needsArmor && !needsHull && fuelNeeded <= 0.5) {
      log.dln("Ship looks alright to me. Tank's full, plating's solid. Not sure why you're here.", 'ansa');
    }

    options.push({ text: "[Ask about the ship's condition]" });
    actions.push({ type: 'condition' });

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
        log.seq([
          "ansa::Done. Plates are seated. Should hold until the next idiot shoots at you.",
          `s::-${action.cost} scrap. Armor restored.`,
        ]);
        break;
      }

      case 'hull': {
        game.scrap -= action.cost;
        player.hullCurrent = player.hullMax;
        log.seq([
          "ansa::Structural work's done. She's solid.",
          `s::-${action.cost} scrap. Hull integrity restored.`,
        ]);
        break;
      }

      case 'fuel_full': {
        game.scrap -= action.cost;
        game.fuel = game.fuelMax;
        log.seq([
          "ansa::Topped off. Don't waste it.",
          `s::-${action.cost} scrap. Fuel tanks full.`,
        ]);
        break;
      }

      case 'fuel_half': {
        game.scrap -= action.cost;
        game.fuel = Math.min(game.fuelMax, game.fuel + action.amount);
        log.seq([
          "ansa::Half load. That'll get you somewhere, at least.",
          `r::-${action.cost} scrap. Tank at ${Math.floor(game.fuel)}/${game.fuelMax}.`,
        ]);
        break;
      }

      case 'condition': {
        const hullPct = Math.floor((player.hullCurrent / player.hullMax) * 100);
        const fuelPct = Math.floor((game.fuel / game.fuelMax) * 100);

        if (hullPct >= 90 && fuelPct >= 80) {
          log.dln("Hull's good. Fuel's good. You're better off than most who dock here.", 'ansa');
        } else if (hullPct < 50) {
          log.dln(`Hull's at ${hullPct}%. You've been taking hits. Whoever's shooting at you isn't finished.`, 'ansa');
        } else if (fuelPct < 30) {
          log.dln(`Fuel's at ${fuelPct}%. You drift out there with that much, you're not coming back.`, 'ansa');
        } else {
          log.dln(`Hull's ${hullPct}%, fuel at ${fuelPct}%. Could be worse. Usually is.`, 'ansa');
        }

        // Check for damaged modules
        const damaged = (player.moduleSlots ?? []).filter(m => m && m.condition !== 'good');
        if (damaged.length > 0) {
          log.dln(`You've got ${damaged.length} module${damaged.length > 1 ? 's' : ''} in rough shape. Can't help with those here — field repair or find someone with better tools.`, 'ansa');
        }
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

registerContent('conversations', 'kellDock', kellDock);
