import { generateEnemyLoot } from '../entities/lootDrop.js';
import { createShip } from '../ships/registry.js';
import { REPUTATION } from '../data/tuning/economyTuning.js';

export class BountySystem {
  constructor() {
    this.activeBounties = [];
  }

  onEnemyKilled(target, { particlePool, hud, reputation, entities }) {
    particlePool.explosion(target.x, target.y, 20);
    if (target.displayName) hud.addKill(target.displayName);
    const drops = generateEnemyLoot(target.x, target.y);
    for (const drop of drops) entities.push(drop);
    if (target.faction) reputation.onKill(target.faction);
    for (const bounty of this.activeBounties) {
      if (bounty.status === 'active' && bounty.targetEntity === target) {
        bounty.status = 'completed';
        hud.addPickupText(`Bounty Complete: +${bounty.contract.reward} scrap`, target.x, target.y);
      }
    }
  }

  acceptBounty(station, contract, totalTime) {
    if (this.activeBounties.find(b => b.contract.id === contract.id)) return null;
    const target = createShip(contract.targetShipType,
      contract.targetPosition.x, contract.targetPosition.y);
    target.displayName = contract.targetName;
    target.homePosition = { ...contract.targetPosition };
    target.isBountyTarget = true;
    const idx = station.bounties.indexOf(contract);
    if (idx !== -1) station.bounties.splice(idx, 1);
    this.activeBounties.push({
      contract,
      stationId: station.id,
      acceptedAt: totalTime,
      expiryTime: totalTime + contract.expirySeconds,
      status: 'active',
      targetEntity: target,
    });
    return { targetEntity: target };
  }

  collectCompleted(station, { scrap, reputation, hud, player }) {
    let total = 0;
    let completedCount = 0;
    for (const b of this.activeBounties) {
      if (b.stationId === station.id && b.status === 'completed') {
        total += b.contract.reward;
        completedCount++;
      }
    }
    if (completedCount > 0) {
      reputation.change(station.reputationFaction, REPUTATION.BOUNTY_BONUS * completedCount);
    }
    this.activeBounties = this.activeBounties.filter(
      b => !(b.stationId === station.id && (b.status === 'completed' || b.status === 'expired'))
    );
    if (total > 0) {
      hud.addPickupText(`Bounty Paid: +${total} scrap`, player.x, player.y);
    }
    return { scrapEarned: total };
  }

  updateExpiry(totalTime) {
    for (const b of this.activeBounties) {
      if (b.status !== 'active') continue;
      if (totalTime >= b.expiryTime) {
        b.status = 'expired';
        if (b.targetEntity && b.targetEntity.active) b.targetEntity.active = false;
      }
    }
  }
}
