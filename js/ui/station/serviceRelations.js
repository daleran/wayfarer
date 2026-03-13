import { FACTIONS, FACTION_LABELS } from '@/systems/reputation.js';
import { standingColor } from '@/rendering/colors.js';

export function buildRelationsPanel(container, station, game) {
  container.innerHTML = '';

  const title = document.createElement('div');
  title.className = 'relations-title';
  title.textContent = 'Faction Standings';
  container.appendChild(title);

  for (const faction of FACTIONS) {
    const label    = FACTION_LABELS[faction];
    const standing = game.reputation.getStanding(faction);
    const level    = game.reputation.getLevel(faction);
    const color    = standingColor(level);
    const sign     = standing >= 0 ? '+' : '';

    const row = document.createElement('div');
    row.className = 'relations-row';
    row.innerHTML = `
      <span class="relations-faction">${label}</span>
      <span class="relations-level" style="color:${color}">${level}  [${sign}${standing}]</span>
    `;
    container.appendChild(row);
  }
}
