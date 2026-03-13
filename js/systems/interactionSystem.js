import { Station } from '@/world/station.js';
import { LootDrop } from '@/entities/lootDrop.js';
import { SCRAP_MASS, AMMO } from '@data/compiledData.js';
import { COMMODITIES } from '@/data/commodities.js';

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
      if (!entity.isDerelict || !entity.active || entity.salvaged) continue;
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
    if (this.nearbyDerelict) {
      this.nearbyDerelict.canSalvage = stopped;
      this.nearbyDerelict._salvageBayActive = !!player.capabilities.has_salvage_bay;
    }
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
        // Fuel doesn't take cargo space — always pick up
        if (entity.lootType === 'fuel') {
          game.fuel = Math.min(game.fuelMax, game.fuel + entity.amount);
          entity.active = false;
          game.hud.addPickupText(entity.label, entity.x, entity.y, 'scrap');
          continue;
        }

        // Compute mass of this pickup
        const itemMass = this._lootMass(entity);
        if (itemMass > 0 && game.totalCargoUsed + itemMass > game.totalCargoCapacity) {
          // Throttle "full" messages to avoid spam
          if (!this._lastFullMsg || Date.now() - this._lastFullMsg > 1000) {
            game.hud.addPickupText('CARGO BAY FULL', player.x, player.y, 'hostile');
            this._lastFullMsg = Date.now();
          }
          continue;
        }

        if (entity.lootType === 'scrap') {
          game.scrap += entity.amount;
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
          game.cargo[entity.lootType] = (game.cargo[entity.lootType] || 0) + entity.amount;
          entity.active = false;
          game.hud.addPickupText(entity.label, entity.x, entity.y, 'cargo');
        }
      }
    }
  }

  _lootMass(entity) {
    if (entity.lootType === 'scrap') return entity.amount * SCRAP_MASS;
    if (entity.lootType === 'module' && entity.moduleData) return entity.moduleData.weight || 0;
    if (entity.lootType === 'weapon' && entity.weaponData) return entity.weaponData.weight || 0;
    if (entity.lootType === 'ammo' && entity.ammoType) return entity.amount * (AMMO[entity.ammoType]?.weight ?? 0.01);
    if (entity.lootType === 'fuel') return 0;
    return entity.amount * (COMMODITIES[entity.lootType]?.mass ?? 1);
  }
}
