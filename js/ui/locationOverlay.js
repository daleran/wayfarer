// LocationOverlay — HTML overlay controller replacing StationScreen (BH)
// Generic full-screen station UI. Delegates rendering to layout files + service modules.

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
    this.visible  = false;
    this._station = null;
    this._game    = null;
    this._nav     = { view: 'map', zoneId: null, serviceId: null };
    this._el      = document.getElementById('location-overlay');
  }

  open(station, game) {
    this._station = station;
    this._game    = game;
    this._nav     = { view: 'map', zoneId: null, serviceId: null };
    this.visible  = true;
    this._el.classList.remove('hidden');
    this._render();
  }

  close() {
    this.visible = false;
    this._el.classList.add('hidden');
    this._el.innerHTML = '';
    this._station = null;
    this._game    = null;
  }

  // Called each game tick while docked — no-op (timers live in DOM)
  update(_dt, _game) {}

  handleInput(input, _game) {
    if (!this.visible) return;
    if (input.wasJustPressed('escape')) {
      if (this._nav.serviceId !== null) {
        this._nav.serviceId = null;
        this._render();
      } else if (this._nav.view === 'zone') {
        this._nav.view    = 'map';
        this._nav.zoneId  = null;
        this._render();
      } else {
        this.close();
      }
    }
  }

  // ── Internal rendering ────────────────────────────────────────────────────────

  _render() {
    this._el.innerHTML = '';

    const station = this._station;
    const layout  = station.layout ?? { type: 'auto', theme: 'neutral' };

    // Set accent CSS var from faction color
    const accent = FACTION[station.faction] ?? FACTION.neutral;
    this._el.style.setProperty('--loc-accent', accent);

    if (this._nav.view === 'map') {
      this._renderMapView(station, layout);
    } else {
      this._renderZoneView(station, layout);
    }
  }

  // ── Map view ──────────────────────────────────────────────────────────────────

  _renderMapView(station, layout) {
    this._el.appendChild(this._buildHeader(station, null));

    if (layout.type === 'zone-map') {
      this._renderSvgMapView(station, layout);
    } else {
      this._renderSimpleMapView(station, layout);
    }
  }

  _renderSimpleMapView(station, layout) {
    const wrap = document.createElement('div');
    wrap.className = 'loc-map-simple';

    const grid = document.createElement('div');
    grid.className = 'loc-zone-grid';

    for (const zone of this._getZones(station, layout)) {
      grid.appendChild(this._buildZoneCard(zone, station));
    }

    wrap.appendChild(grid);
    this._el.appendChild(wrap);
  }

  _renderSvgMapView(station, layout) {
    const container = document.createElement('div');
    container.className = 'loc-map-container';

    // SVG schematic
    const svgWrap = document.createElement('div');
    svgWrap.className = 'loc-map-svg-wrap';
    svgWrap.innerHTML = layout.svg;

    // Wire up SVG zone hotspots
    for (const zone of layout.zones) {
      const locked = this._isZoneLocked(zone, station);
      const el     = svgWrap.querySelector(`#${zone.svgId}`);
      if (!el) continue;
      el.classList.add('zone-hotspot');
      if (locked) {
        el.classList.add('locked');
      } else {
        el.addEventListener('click', () => this._enterZone(zone.id));
      }
    }

    container.appendChild(svgWrap);

    // Sidebar zone list
    const sidebar = document.createElement('div');
    sidebar.className = 'loc-zone-sidebar';

    for (const zone of layout.zones) {
      sidebar.appendChild(this._buildZoneCard(zone, station));
    }

    container.appendChild(sidebar);
    this._el.appendChild(container);
  }

  // ── Zone view ─────────────────────────────────────────────────────────────────

  _renderZoneView(station, layout) {
    const zones = this._getZones(station, layout);
    const zone  = zones.find(z => z.id === this._nav.zoneId);
    if (!zone) { this._nav.view = 'map'; this._render(); return; }

    this._el.appendChild(this._buildHeader(station, zone));

    const panel = document.createElement('div');
    panel.className = 'loc-zone-panel';

    // Flavor text column
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
      panel.appendChild(flavorDiv);
    }

    // Service button column
    const svcList = document.createElement('div');
    svcList.className = 'loc-zone-service-list';

    for (const svcId of (zone.services ?? [])) {
      const btn = document.createElement('button');
      btn.className = `loc-service-btn${this._nav.serviceId === svcId ? ' active' : ''}`;
      btn.textContent = SERVICE_LABELS[svcId] ?? svcId;
      btn.addEventListener('click', () => {
        this._nav.serviceId = svcId;
        this._render();
      });
      svcList.appendChild(btn);
    }

    panel.appendChild(svcList);

    // Service content panel (shown when a service is selected)
    if (this._nav.serviceId) {
      const content = document.createElement('div');
      content.className = 'loc-service-panel';
      this._buildServiceContent(content, this._nav.serviceId, station);
      panel.appendChild(content);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'loc-service-panel';
      const hint = document.createElement('div');
      hint.className = 'loc-service-placeholder';
      hint.textContent = 'Select a service.';
      placeholder.appendChild(hint);
      panel.appendChild(placeholder);
    }

    this._el.appendChild(panel);
  }

  // ── Header ────────────────────────────────────────────────────────────────────

  _buildHeader(station, zone) {
    const header = document.createElement('div');
    header.className = 'loc-header';

    if (zone) {
      // Back button
      const back = document.createElement('button');
      back.className = 'loc-back-btn';
      back.textContent = '< MAP';
      back.addEventListener('click', () => {
        this._nav.view      = 'map';
        this._nav.zoneId    = null;
        this._nav.serviceId = null;
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
    } else {
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
    }

    // Standing badge
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

    // Scrap readout (always far-right)
    const scrap = document.createElement('span');
    scrap.className   = 'loc-scrap-readout';
    scrap.textContent = `Scrap: ${this._game?.scrap ?? 0}`;
    header.appendChild(scrap);

    // Esc hint
    const esc = document.createElement('span');
    esc.className   = 'loc-esc-hint';
    esc.textContent = '[Esc]';
    header.appendChild(esc);

    return header;
  }

  // ── Zone cards ────────────────────────────────────────────────────────────────

  _buildZoneCard(zone, station) {
    const locked = this._isZoneLocked(zone, station);

    const card = document.createElement('div');
    card.className = `loc-zone-card${locked ? ' locked' : ''}`;

    const name = document.createElement('div');
    name.className   = 'loc-zone-card-name';
    name.textContent = zone.label;
    card.appendChild(name);

    if (zone.description) {
      const desc = document.createElement('div');
      desc.className   = 'loc-zone-card-desc';
      desc.textContent = zone.description;
      card.appendChild(desc);
    }

    if (locked) {
      const lockEl = document.createElement('div');
      lockEl.className   = 'loc-zone-card-lock';
      lockEl.textContent = `LOCKED — ${zone.requiredStanding?.toUpperCase() ?? 'HIGHER'} STANDING REQUIRED`;
      card.appendChild(lockEl);
    } else {
      const tags = document.createElement('div');
      tags.className = 'loc-zone-card-tags';
      for (const svcId of (zone.services ?? [])) {
        const tag = document.createElement('span');
        tag.className   = 'loc-service-tag';
        tag.textContent = SERVICE_LABELS[svcId] ?? svcId;
        tags.appendChild(tag);
      }
      card.appendChild(tags);
      card.addEventListener('click', () => this._enterZone(zone.id));
    }

    return card;
  }

  // ── Navigation helpers ────────────────────────────────────────────────────────

  _enterZone(zoneId) {
    this._nav.view      = 'zone';
    this._nav.zoneId    = zoneId;
    this._nav.serviceId = null;
    this._render();
  }

  _getZones(station, layout) {
    if (layout.type === 'auto') return this._autoZones(station);
    return layout.zones ?? [];
  }

  // Auto-generate zones from station.services + canOverhaulReactor
  _autoZones(station) {
    const zones   = [];
    const services = station.services ?? [];

    const hasRepair = services.includes('repair') || services.includes('fuel');
    if (hasRepair) {
      const svcList = ['repair'];
      if (station.canOverhaulReactor) svcList.push('reactor');
      zones.push({
        id: 'dock', label: 'Services',
        description: 'Hull repair, armor restoration, and refueling.',
        services: svcList, flavor: [],
        requiredStanding: null,
      });
    }

    if (services.includes('trade')) {
      zones.push({
        id: 'trade', label: 'Trade',
        description: 'Buy and sell commodities.',
        services: ['trade'], flavor: [],
        requiredStanding: null,
      });
    }

    if ((station.bounties?.length ?? 0) > 0) {
      zones.push({
        id: 'bounties', label: 'Bounty Board',
        description: 'Contracts and active bounties.',
        services: ['bounties'], flavor: [],
        requiredStanding: null,
      });
    }

    if (station.lore?.length > 0) {
      zones.push({
        id: 'intel', label: 'Intel',
        description: 'Station intelligence and history.',
        services: ['intel'], flavor: [],
        requiredStanding: null,
      });
    }

    zones.push({
      id: 'relations', label: 'Relations',
      description: 'Faction standings.',
      services: ['relations'], flavor: [],
      requiredStanding: null,
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
