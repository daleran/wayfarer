export function buildReactorPanel(container, station, game) {
  container.innerHTML = '';

  if (!station.canOverhaulReactor) {
    const msg = document.createElement('div');
    msg.className = 'svc-status-dim';
    msg.textContent = 'No reactor overhaul services available here.';
    container.appendChild(msg);
    return;
  }

  const fissionMods = (game.player.moduleSlots ?? []).filter(m => m?.isFissionReactor);

  if (fissionMods.length === 0) {
    const msg = document.createElement('div');
    msg.className = 'svc-status-ok';
    msg.textContent = 'No fission reactors installed.';
    container.appendChild(msg);
    return;
  }

  for (const mod of fissionMods) {
    const canAfford = game.scrap >= mod.overhaulCost;

    const card = document.createElement('div');
    card.className = `reactor-card${mod.isOverdue ? ' overdue' : ''}`;

    const nameEl = document.createElement('div');
    nameEl.className = 'reactor-name';
    nameEl.textContent = mod.displayName;

    const statusEl = document.createElement('div');
    statusEl.className = 'reactor-status';
    if (mod.isOverdue) {
      statusEl.style.color = 'var(--loc-magenta)';
      statusEl.textContent = '!! OVERHAUL OVERDUE';
    } else {
      const remaining = mod.overhaulInterval - mod.timeSinceOverhaul;
      const h = Math.floor(remaining / 3600);
      const m = Math.floor((remaining % 3600) / 60);
      statusEl.style.color = 'var(--loc-dim)';
      statusEl.textContent = `Next overhaul in ${h}h ${m}m`;
    }

    const btn = document.createElement('button');
    btn.className = `svc-action-btn${mod.isOverdue ? ' magenta' : ' cyan'}`;
    btn.disabled  = !canAfford;
    btn.textContent = `Overhaul  —  ${mod.overhaulCost} scrap${mod.isOverdue ? '  [OVERDUE]' : ''}`;
    btn.addEventListener('click', () => {
      game.scrap -= mod.overhaulCost;
      mod.resetOverhaul();
      buildReactorPanel(container, station, game);
    });

    card.appendChild(nameEl);
    card.appendChild(statusEl);
    card.appendChild(btn);
    container.appendChild(card);
  }
}
