// LocationOverlay — HTML overlay controller for station panel.
// Two-level nav: area list → area detail (flavor + services).

import { FACTION, standingColor } from './colors.js';
import { buildRepairPanel    } from './station/serviceRepair.js';
import { buildTradePanel     } from './station/serviceTrade.js';
import { buildBountiesPanel  } from './station/serviceBounties.js';
import { buildRelationsPanel } from './station/serviceRelations.js';
import { buildReactorPanel   } from './station/serviceReactor.js';
import { buildIntelPanel     } from './station/serviceIntel.js';

const SERVICE_LABELS = {
  repair:    'Repair & Refuel',
  trade:     'Trade',
  bounties:  'Bounty Board',
  intel:     'Intel',
  relations: 'Relations',
  reactor:   'Reactor Overhaul',
};

export class LocationOverlay {
  constructor() {
    this.visible    = false;
    this._station   = null;
    this._game      = null;
    this._zoneId    = null;
    this._serviceId = null;
    this._prevZoom  = null;
    this._el        = document.getElementById('location-overlay');
  }

  open(station, game) {
    this._station   = station;
    this._game      = game;
    this._zoneId    = null;
    this._serviceId = null;
    this.visible    = true;
    this._el.classList.remove('hidden');

    if (game?.camera) {
      this._prevZoom = game.camera.zoom;
      game.camera.zoom = this._prevZoom * 4;
      game.camera.x = station.x;
      game.camera.y = station.y;
    }

    this._render();
  }

  close() {
    if (this._prevZoom !== null && this._game?.camera) {
      this._game.camera.zoom = this._prevZoom;
      this._prevZoom = null;
    }
    this.visible = false;
    this._el.classList.add('hidden');
    this._el.innerHTML = '';
    this._station = null;
    this._game    = null;
  }

  update(_dt, _game) {}

  handleInput(input, _game) {
    if (!this.visible) return;
    if (input.wasJustPressed('escape')) {
      if (this._serviceId !== null) {
        this._serviceId = null;
        this._render();
      } else if (this._zoneId !== null) {
        this._zoneId = null;
        this._render();
      } else {
        this.close();
      }
    }
  }

  // ── Rendering ─────────────────────────────────────────────────────────────────

  _render() {
    this._el.innerHTML = '';

    const station = this._station;
    const accent = FACTION[station.faction] ?? FACTION.neutral;
    this._el.style.setProperty('--loc-accent', accent);

    if (this._zoneId) {
      this._renderZoneView(station);
    } else {
      this._renderAreaList(station);
    }
  }

  // ── Area list (top level) ─────────────────────────────────────────────────────

  _renderAreaList(station) {
    this._el.appendChild(this._buildHeader(station));

    // Station flavor text
    if (station.flavorText) {
      const flavor = document.createElement('div');
      flavor.className = 'loc-flavor';
      const p = document.createElement('p');
      p.textContent = station.flavorText;
      flavor.appendChild(p);
      this._el.appendChild(flavor);
    }

    // Area cards
    const list = document.createElement('div');
    list.className = 'loc-area-list';

    const zones = this._getZones(station);
    for (const zone of zones) {
      list.appendChild(this._buildAreaCard(zone, station));
    }

    this._el.appendChild(list);
  }

  _buildAreaCard(zone, station) {
    const locked = this._isZoneLocked(zone, station);

    const card = document.createElement('div');
    card.className = `loc-area-card${locked ? ' locked' : ''}`;

    const name = document.createElement('div');
    name.className = 'loc-area-card-name';
    name.textContent = zone.label;
    card.appendChild(name);

    if (zone.description) {
      const desc = document.createElement('div');
      desc.className = 'loc-area-card-desc';
      desc.textContent = zone.description;
      card.appendChild(desc);
    }

    if (locked) {
      const lockEl = document.createElement('div');
      lockEl.className = 'loc-area-card-lock';
      lockEl.textContent = `LOCKED — ${zone.requiredStanding?.toUpperCase() ?? 'HIGHER'} STANDING REQUIRED`;
      card.appendChild(lockEl);
    } else {
      card.addEventListener('click', () => {
        this._zoneId    = zone.id;
        this._serviceId = null;
        this._render();
      });
    }

    return card;
  }

  // ── Zone detail view ──────────────────────────────────────────────────────────

  _renderZoneView(station) {
    const zones = this._getZones(station);
    const zone  = zones.find(z => z.id === this._zoneId);
    if (!zone) { this._zoneId = null; this._render(); return; }

    this._el.appendChild(this._buildZoneHeader(station, zone));

    // Flavor text
    if (zone.flavor?.length > 0) {
      const flavorDiv = document.createElement('div');
      flavorDiv.className = 'loc-zone-flavor';

      for (const line of zone.flavor) {
        const p = document.createElement('p');
        if (line === '') {
          p.className = 'flavor-blank';
        } else {
          const isHeading = line.startsWith('[') ||
            (line === line.toUpperCase() && line.length > 2 && !line.includes("'"));
          p.className = isHeading ? 'flavor-heading' : '';
          p.textContent = line;
        }
        flavorDiv.appendChild(p);
      }
      this._el.appendChild(flavorDiv);
    }

    // Service buttons
    const svcList = document.createElement('div');
    svcList.className = 'loc-zone-service-list';

    for (const svcId of (zone.services ?? [])) {
      const btn = document.createElement('button');
      btn.className = `loc-service-btn${this._serviceId === svcId ? ' active' : ''}`;
      btn.textContent = SERVICE_LABELS[svcId] ?? svcId;
      btn.addEventListener('click', () => {
        this._serviceId = svcId;
        this._render();
      });
      svcList.appendChild(btn);
    }

    this._el.appendChild(svcList);

    // Service content
    if (this._serviceId) {
      const content = document.createElement('div');
      content.className = 'loc-service-panel';
      this._buildServiceContent(content, this._serviceId, station);
      this._el.appendChild(content);
    }
  }

  // ── Headers ───────────────────────────────────────────────────────────────────

  _buildHeader(station) {
    const header = document.createElement('div');
    header.className = 'loc-header';

    const name = document.createElement('span');
    name.className = 'loc-station-name';
    name.textContent = station.name;
    header.appendChild(name);

    if (station.faction) {
      const faction = document.createElement('span');
      faction.className   = 'loc-station-faction';
      faction.style.color = FACTION[station.faction] ?? FACTION.neutral;
      faction.textContent = `[ ${station.faction} ]`;
      header.appendChild(faction);
    }

    this._appendStandingAndScrap(header, station);
    return header;
  }

  _buildZoneHeader(station, zone) {
    const header = document.createElement('div');
    header.className = 'loc-header';

    const back = document.createElement('button');
    back.className = 'loc-back-btn';
    back.textContent = '< BACK';
    back.addEventListener('click', () => {
      this._zoneId    = null;
      this._serviceId = null;
      this._render();
    });
    header.appendChild(back);

    const zoneTitle = document.createElement('span');
    zoneTitle.className = 'loc-zone-title';
    zoneTitle.textContent = zone.label;
    header.appendChild(zoneTitle);

    const sub = document.createElement('span');
    sub.className = 'loc-station-sub';
    sub.textContent = `// ${station.name}`;
    header.appendChild(sub);

    this._appendStandingAndScrap(header, station);
    return header;
  }

  _appendStandingAndScrap(header, station) {
    if (this._game?.reputation && station.reputationFaction) {
      const level    = this._game.reputation.getLevel(station.reputationFaction);
      const standing = this._game.reputation.getStanding(station.reputationFaction);
      const sign     = standing >= 0 ? '+' : '';
      const badge    = document.createElement('span');
      badge.className   = 'loc-standing-badge';
      badge.style.color = standingColor(level);
      badge.textContent = `${level.toUpperCase()}  [${sign}${standing}]`;
      header.appendChild(badge);
    }

    const scrap = document.createElement('span');
    scrap.className   = 'loc-scrap-readout';
    scrap.textContent = `Scrap: ${this._game?.scrap ?? 0}`;
    header.appendChild(scrap);

    const esc = document.createElement('span');
    esc.className   = 'loc-esc-hint';
    esc.textContent = '[Esc]';
    header.appendChild(esc);
  }

  // ── Zone helpers ──────────────────────────────────────────────────────────────

  _getZones(station) {
    const layout = station.layout ?? { type: 'auto' };
    if (layout.zones) return layout.zones;
    return this._autoZones(station);
  }

  _autoZones(station) {
    const zones    = [];
    const services = station.services ?? [];

    const hasRepair = services.includes('repair') || services.includes('fuel');
    if (hasRepair) {
      const svcList = ['repair'];
      if (station.canOverhaulReactor) svcList.push('reactor');
      zones.push({
        id: 'dock', label: 'Services',
        description: 'Hull repair, armor restoration, and refueling.',
        services: svcList, flavor: [], requiredStanding: null,
      });
    }

    if (services.includes('trade')) {
      zones.push({
        id: 'trade', label: 'Trade',
        description: 'Buy and sell commodities.',
        services: ['trade'], flavor: [], requiredStanding: null,
      });
    }

    if ((station.bounties?.length ?? 0) > 0) {
      zones.push({
        id: 'bounties', label: 'Bounty Board',
        description: 'Contracts and active bounties.',
        services: ['bounties'], flavor: [], requiredStanding: null,
      });
    }

    if (station.lore?.length > 0) {
      zones.push({
        id: 'intel', label: 'Intel',
        description: 'Station intelligence and history.',
        services: ['intel'], flavor: [], requiredStanding: null,
      });
    }

    zones.push({
      id: 'relations', label: 'Relations',
      description: 'Faction standings.',
      services: ['relations'], flavor: [], requiredStanding: null,
    });

    return zones;
  }

  _isZoneLocked(zone, station) {
    if (!zone.requiredStanding) return false;
    const faction = zone.requiredFaction ?? station.reputationFaction;
    const level   = this._game?.reputation?.getLevel(faction) ?? 'Neutral';
    const ORDER   = ['Hostile', 'Wary', 'Neutral', 'Trusted', 'Allied'];
    return ORDER.indexOf(level) < ORDER.indexOf(zone.requiredStanding);
  }

  // ── Service dispatch ──────────────────────────────────────────────────────────

  _buildServiceContent(container, serviceId, station) {
    const g = this._game;
    switch (serviceId) {
      case 'repair':    buildRepairPanel(container, station, g);    break;
      case 'trade':     buildTradePanel(container, station, g);     break;
      case 'bounties':  buildBountiesPanel(container, station, g);  break;
      case 'relations': buildRelationsPanel(container, station, g); break;
      case 'reactor':   buildReactorPanel(container, station, g);   break;
      case 'intel':     buildIntelPanel(container, station, g);     break;
      default: {
        const msg = document.createElement('div');
        msg.className   = 'svc-status-dim';
        msg.textContent = `Unknown service: ${serviceId}`;
        container.appendChild(msg);
      }
    }
  }
}
