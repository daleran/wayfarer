import { BOUNTY } from '../../data/tuning/economyTuning.js';

export function buildBountiesPanel(container, station, game) {
  container.innerHTML = '';

  const available = station.bounties ?? [];
  const mine = (game.activeBounties ?? []).filter(b => b.stationId === station.id);

  if (available.length === 0 && mine.length === 0) {
    const msg = document.createElement('div');
    msg.className = 'svc-status-dim';
    msg.textContent = 'No contracts available.';
    container.appendChild(msg);
    return;
  }

  // ── Available contracts ────────────────────────────────────────────────────────
  if (available.length > 0) {
    const title = document.createElement('div');
    title.className = 'bounty-section';
    title.textContent = 'Available Contracts';
    container.appendChild(title);

    for (const contract of available) {
      const card = document.createElement('div');
      card.className = 'bounty-card';

      const info = document.createElement('div');
      info.className = 'bounty-info';
      info.innerHTML = `
        <div class="bounty-title">${contract.title}</div>
        <div class="bounty-target">Target: ${contract.targetName}</div>
        <div class="bounty-reward">Reward: ${contract.reward} scrap</div>
      `;

      const acceptBtn = document.createElement('button');
      acceptBtn.className = 'bounty-accept-btn';
      acceptBtn.textContent = 'Accept';
      acceptBtn.addEventListener('click', () => {
        const result = game.bounty.acceptBounty(station, contract, game.totalTime);
        if (result) {
          game.entities.push(result.targetEntity);
          game.ships.push(result.targetEntity);
        }
        buildBountiesPanel(container, station, game);
      });

      card.appendChild(info);
      card.appendChild(acceptBtn);
      container.appendChild(card);
    }
  }

  // ── Active / completed contracts ───────────────────────────────────────────────
  if (mine.length > 0) {
    const title = document.createElement('div');
    title.className = 'bounty-section';
    title.textContent = 'Your Contracts';
    container.appendChild(title);

    for (const bounty of mine) {
      const card = document.createElement('div');
      card.className = 'bounty-card';

      let statusText, statusColor;
      if (bounty.status === 'completed') {
        statusText  = 'COMPLETE — collect on dock';
        statusColor = 'var(--p-green)';
      } else if (bounty.status === 'expired') {
        statusText  = 'EXPIRED';
        statusColor = 'var(--p-red)';
      } else {
        const rem = Math.max(0, bounty.expiryTime - game.totalTime);
        const m   = Math.floor(rem / 60);
        const s   = Math.floor(rem % 60).toString().padStart(2, '0');
        statusText  = `ACTIVE — ${m}:${s} remaining`;
        statusColor = rem < BOUNTY.EXPIRY_WARNING_SECS ? 'var(--p-red)' : 'var(--p-amber)';
      }

      const info = document.createElement('div');
      info.className = 'bounty-info';
      info.innerHTML = `
        <div class="bounty-title">${bounty.contract.title}</div>
        <div class="bounty-status" style="color:${statusColor}">${statusText}</div>
      `;

      card.appendChild(info);
      container.appendChild(card);
    }
  }
}
