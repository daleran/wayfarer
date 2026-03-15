// Character — a person who can inhabit a ship.
// Ships are vehicles; characters are the people flying them.
// When a character boards a ship, the ship delegates faction/relation/ai
// to the captain via getters — no syncing needed.

import { AI_TEMPLATES } from '@data/index.js';

export class Character {
  /**
   * @param {{ id: string, name?: string, faction: string, relation: string, behavior: string, flavorText?: string }} opts
   */
  constructor({ id, name, faction, relation, behavior, flavorText }) {
    this.id = id;
    this.name = name ?? null;
    this.faction = faction;
    this.relation = relation;
    this.behavior = behavior;
    this.flavorText = flavorText ?? '';

    // AI template — copied fresh so each character has independent state
    const template = AI_TEMPLATES[behavior];
    this.ai = template ? { ...template } : null;

    /** @type {import('../entities/ship.js').Ship | null} */
    this.inShip = null;
  }

  /**
   * Board a ship — ship delegates faction/relation/ai to this character.
   * @param {import('../entities/ship.js').Ship} ship
   */
  boardShip(ship) {
    this.inShip = ship;
    ship.captain = this;
  }

  /**
   * Leave the current ship — ship reverts to machine defaults.
   */
  leaveShip() {
    if (!this.inShip) return;
    this.inShip.captain = null;
    this.inShip = null;
  }
}
