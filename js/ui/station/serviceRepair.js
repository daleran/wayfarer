import { REPUTATION } from '../../data/tuning/economyTuning.js';

const REPAIR_DURATION = 2000; // ms

export function buildRepairPanel(container, station, game) {
  container.innerHTML = '';

  const player = game.player;
  const isAllied = game.reputation?.isAllied(station.reputationFaction) ?? false;
  const discount = isAllied ? (1 - REPUTATION.DISCOUNT_RATE) : 1;

  // Stats row
  const stats = document.createElement('div');
  stats.className = 'svc-stats';
  const fuelLabel = Math.floor(game.fuel) + ' / ' + game.fuelMax;
  stats.innerHTML = `
    <div class="svc-stat">
      <span class="svc-stat-label">Scrap</span>
      <span class="svc-stat-value">${game.scrap}</span>
    </div>
    <div class="svc-stat">
      <span class="svc-stat-label">Fuel</span>
      <span class="svc-stat-value">${fuelLabel}</span>
    </div>
  `;
  container.appendChild(stats);

  if (isAllied) {
    const badge = document.createElement('div');
    badge.className = 'svc-allied-note';
    badge.textContent = 'ALLIED — 15% DISCOUNT';
    container.appendChild(badge);
  }

  const hr1 = document.createElement('hr');
  hr1.className = 'svc-divider';
  container.appendChild(hr1);

  // ── Repair Armor ──────────────────────────────────────────────────────────────
  const a = player.armorArcs;
  const am = player.armorArcsMax;
  const needsArmor = a && am && (
    a.front < am.front || a.port < am.port ||
    a.starboard < am.starboard || a.aft < am.aft
  );

  if (needsArmor) {
    const dmg = Math.ceil(
      (am.front - a.front) + (am.port - a.port) +
      (am.starboard - a.starboard) + (am.aft - a.aft)
    );
    const cost = Math.ceil(dmg * discount);
    const canAfford = game.scrap >= cost;

    const btn = document.createElement('button');
    btn.className = 'svc-action-btn green';
    btn.disabled = !canAfford;
    btn.textContent = `Repair Armor  —  ${cost} scrap`;
    btn.addEventListener('click', () => {
      game.scrap -= cost;
      player.armorArcs.front     = am.front;
      player.armorArcs.port      = am.port;
      player.armorArcs.starboard = am.starboard;
      player.armorArcs.aft       = am.aft;
      buildRepairPanel(container, station, game);
    });
    container.appendChild(btn);
  }

  // ── Repair Hull ───────────────────────────────────────────────────────────────
  const needsHull = player.hullCurrent < player.hullMax;
  if (needsHull) {
    const cost = Math.ceil((player.hullMax - player.hullCurrent) * 2 * discount);
    const canAfford = game.scrap >= cost;

    const btn = document.createElement('button');
    btn.className = 'svc-action-btn cyan';
    btn.disabled = !canAfford;
    btn.textContent = `Repair Hull  —  ${cost} scrap`;
    btn.addEventListener('click', () => {
      if (!canAfford) return;
      // Replace button with progress bar
      const wrap = document.createElement('div');
      wrap.className = 'svc-progress-wrap';
      wrap.innerHTML = `
        <div class="svc-progress-fill" style="width:0%"></div>
        <div class="svc-progress-label">Repairing…  0%</div>
      `;
      btn.replaceWith(wrap);

      const fill  = wrap.querySelector('.svc-progress-fill');
      const label = wrap.querySelector('.svc-progress-label');
      const start = Date.now();

      const ticker = setInterval(() => {
        const pct = Math.min(100, ((Date.now() - start) / REPAIR_DURATION) * 100);
        fill.style.width = pct + '%';
        label.textContent = `Repairing…  ${Math.floor(pct)}%`;
        if (pct >= 100) clearInterval(ticker);
      }, 50);

      setTimeout(() => {
        game.scrap -= cost;
        player.hullCurrent = player.hullMax;
        buildRepairPanel(container, station, game);
      }, REPAIR_DURATION);
    });
    container.appendChild(btn);
  } else {
    const ok = document.createElement('div');
    ok.className = 'svc-status-ok';
    ok.textContent = 'Hull at full integrity';
    container.appendChild(ok);
  }

  const hr2 = document.createElement('hr');
  hr2.className = 'svc-divider';
  container.appendChild(hr2);

  // ── Refuel ────────────────────────────────────────────────────────────────────
  const fuelNeeded = game.fuelMax - game.fuel;
  if (fuelNeeded > 0.5) {
    const cost = Math.ceil(fuelNeeded * 0.5 * discount);
    const canAfford = game.scrap >= cost;

    const btn = document.createElement('button');
    btn.className = 'svc-action-btn amber';
    btn.disabled = !canAfford;
    btn.textContent = `Refuel  —  ${cost} scrap`;
    btn.addEventListener('click', () => {
      game.scrap -= cost;
      game.fuel = game.fuelMax;
      buildRepairPanel(container, station, game);
    });
    container.appendChild(btn);
  } else {
    const ok = document.createElement('div');
    ok.className = 'svc-status-ok';
    ok.textContent = 'Fuel tanks full';
    container.appendChild(ok);
  }
}
