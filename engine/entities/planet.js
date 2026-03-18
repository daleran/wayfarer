import { Entity } from '@/entities/entity.js';
import { ENTITY } from '@data/enums.js';
import { CYAN, AMBER, RED } from '@/rendering/colors.js';
import { getRootFaction } from '@data/factionHelpers.js';

export class Planet extends Entity {
  constructor(x, y, data) {
    super(x, y);
    this.entityType = ENTITY.PLANET;
    this.id = data.id ?? null;
    this.name = data.name;
    this.faction = data.faction ?? 'neutral';
    this.relation = data.relation ?? 'neutral';
    this.reputationFaction = getRootFaction(this.faction);
    this.services = data.services ?? [];
    this.commodities = data.commodities ?? {};
    this.lore = data.lore ?? null;
    this.bounties = [];
    this.layout = data.layout ?? null;
    this.conversations = data.conversations ?? null;
    this.flavorText = data.flavorText ?? null;
    this.dockingRadius = data.dockingRadius ?? 600;
    this._sectionFadeAlphas = {};
  }

  get accentColor() {
    if (this.relation === 'friendly') return CYAN;
    if (this.relation === 'enemy') return RED;
    return AMBER;
  }

  get outlineColor() { return this.accentColor; }

  get fillColor() {
    if (this.relation === 'friendly') return 'rgba(0,255,204,0.15)';
    if (this.relation === 'enemy') return 'rgba(255,68,68,0.15)';
    return 'rgba(255,170,0,0.15)';
  }

  update(_dt) {
    // No-op — background handles visuals
  }

  /** Update per-section flavor text fade based on player proximity. */
  updateSectionFade(dt, playerX, playerY) {
    const sections = this.layout?.sections;
    if (!sections) return;
    const FADE_RADIUS = 400;
    const FADE_SPEED = 1.2;
    for (const section of sections) {
      if (!section.flavor?.length || !section.labelOffset) continue;
      const wx = this.x + (section.worldOffset?.x ?? 0) + section.labelOffset.x;
      const wy = this.y + (section.worldOffset?.y ?? 0) + section.labelOffset.y;
      const dx = wx - playerX;
      const dy = wy - playerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const target = dist < FADE_RADIUS ? 1 : 0;
      const cur = this._sectionFadeAlphas[section.id] ?? 0;
      this._sectionFadeAlphas[section.id] = cur + (target - cur) * Math.min(1, FADE_SPEED * dt);
    }
  }

  /** Can the player land from this world-space position? */
  isInDockingZone(wx, wy) {
    const dx = wx - this.x;
    const dy = wy - this.y;
    return Math.sqrt(dx * dx + dy * dy) < this.dockingRadius;
  }

  render() {
    // No-op — background terrain handles planet visuals
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: this.dockingRadius };
  }
}
