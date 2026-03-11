export function buildIntelPanel(container, station, game) {
  container.innerHTML = '';

  const lore = station.lore;
  if (!lore || lore.length === 0) {
    const msg = document.createElement('div');
    msg.className = 'svc-status-dim';
    msg.textContent = 'No intelligence available.';
    container.appendChild(msg);
    return;
  }

  const block = document.createElement('div');
  block.className = 'intel-block';

  for (const line of lore) {
    const p = document.createElement('p');
    if (line === '') {
      p.className = 'intel-blank';
    } else {
      const isHeading = line.startsWith('[') ||
        (line === line.toUpperCase() && line.length > 2 && !line.includes("'"));
      p.className = isHeading ? 'intel-heading' : '';
      p.textContent = line;
    }
    block.appendChild(p);
  }

  container.appendChild(block);
}
