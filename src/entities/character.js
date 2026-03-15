// Character — a person who can inhabit a ship.
// Ships are vehicles; characters are the people flying them.
// When a character boards a ship, the ship's faction/relation/ai are synced from the character.

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
   * Board a ship — syncs faction/relation/ai onto the ship.
   * @param {import('../entities/ship.js').Ship} ship
   */
  boardShip(ship) {
    this.inShip = ship;
    ship.captain = this;
    ship.faction = this.faction;
    ship.relation = this.relation;
    ship.ai = this.ai;
  }

  /**
   * Leave the current ship — resets ship to inert state.
   */
  leaveShip() {
    if (!this.inShip) return;
    this.inShip.captain = null;
    this.inShip.faction = 'none';
    this.inShip.relation = 'none';
    this.inShip.ai = null;
    this.inShip = null;
  }
}
