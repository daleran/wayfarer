import { Derelict } from '../world/derelict.js';
import { Station } from '../world/station.js';
import { LootDrop } from '../entities/lootDrop.js';

export class InteractionSystem {
  constructor() {
    this.nearbyStation = null;
    this.nearbyDerelict = null;
  }

  updateDerelicts(dt, entities, player, salvage, input) {
    const LORE_RADIUS = 400;
    const LORE_FADE_SPEED = 1.2;

    if (this.nearbyDerelict) this.nearbyDerelict.isNearby = false;
    this.nearbyDerelict = null;
    if (!player || !player.active) return;

    for (const entity of entities) {
      if (!(entity instanceof Derelict) || !entity.active || entity.salvaged) continue;
      const dx = entity.x - player.x;
      const dy = entity.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const loreTarget = dist < LORE_RADIUS ? 1 : 0;
      entity._loreAlpha += (loreTarget - entity._loreAlpha) * Math.min(1, LORE_FADE_SPEED * dt);

      if (salvage.isSalvaging) continue;
      if (dist < entity.interactionRadius) {
        this.nearbyDerelict = entity;
        entity.isNearby = true;
      }
    }

    const stopped = player.throttleLevel === 0 && player.speed < 1;
    if (this.nearbyDerelict) this.nearbyDerelict.canSalvage = stopped;
    if (this.nearbyDerelict && stopped && input.wasJustPressed('e')) salvage.start(this.nearbyDerelict, player);
  }

  checkDocking(entities, player, input, { reputation, hud, stationScreen, bounty, game }) {
    this.nearbyStation = null;
    for (const entity of entities) {
      if (!(entity instanceof Station)) continue;
      if (entity.isInDockingZone(player.x, player.y)) {
        this.nearbyStation = entity;
        break;
      }
    }
    if (this.nearbyStation && input.wasJustPressed('e') && player.throttleLevel === 0 && player.speed < 1) {
      if (reputation.isHostile(this.nearbyStation.reputationFaction)) {
        hud.addPickupText('DOCKING REFUSED', this.nearbyStation.x, this.nearbyStation.y, 'hostile');
        return { isDocked: false };
      }
      const result = bounty.collectCompleted(this.nearbyStation, { scrap: game.scrap, reputation, hud, player });
      game.scrap += result.scrapEarned;
      stationScreen.open(this.nearbyStation, game);
      return { isDocked: true };
    }
    return { isDocked: false };
  }

  checkLootPickups(entities, player, game) {
    if (!player || !player.active) return;
    const px = player.x;
    const py = player.y;
    for (const entity of entities) {
      if (!(entity instanceof LootDrop) || !entity.active) continue;
      const dx = entity.x - px;
      const dy = entity.y - py;
      if (Math.sqrt(dx * dx + dy * dy) < entity.pickupRadius) {
        if (entity.lootType === 'scrap') {
          game.scrap += entity.amount;
          entity.active = false;
          game.hud.addPickupText(entity.label, entity.x, entity.y, 'scrap');
        } else if (entity.lootType === 'fuel') {
          game.fuel = Math.min(game.fuelMax, game.fuel + entity.amount);
          entity.active = false;
          game.hud.addPickupText(entity.label, entity.x, entity.y, 'scrap');
        } else if (entity.lootType === 'module' && entity.moduleData) {
          game.modules.push(entity.moduleData);
          entity.active = false;
          game.hud.addPickupText(entity.label, entity.x, entity.y, 'module');
        } else if (entity.lootType === 'weapon' && entity.weaponData) {
          game.weapons.push(entity.weaponData);
          entity.active = false;
          game.hud.addPickupText(entity.label, entity.x, entity.y, 'module');
        } else if (entity.lootType === 'ammo' && entity.ammoType) {
          game.ammo[entity.ammoType] = (game.ammo[entity.ammoType] || 0) + entity.amount;
          entity.active = false;
          game.hud.addPickupText(entity.label, entity.x, entity.y, 'ammo');
        } else {
          if (game.totalCargoUsed < game.totalCargoCapacity) {
            game.cargo[entity.lootType] = (game.cargo[entity.lootType] || 0) + entity.amount;
            entity.active = false;
            game.hud.addPickupText(entity.label, entity.x, entity.y, 'cargo');
          }
        }
      }
    }
  }
}
