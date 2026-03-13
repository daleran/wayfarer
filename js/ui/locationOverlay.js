// LocationOverlay — HTML overlay controller for station panel.
// Single-level nav: district bar → zone content (flavor + service tabs + service panel).

import { FACTION, standingColor } from '@/rendering/colors.js';
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
    this._el        = document.getElementById('location-overlay');
  }

  open(station, game) {
    this._station   = station;
    this._game      = game;
    this._serviceId = null;
    this.visible    = true;
    this._el.classList.remove('hidden');

    if (game?.camera) {
      game.camera.pushZoom(4.0);
    }

    // Auto-select first unlocked zone
    const zones = this._getZones(station);
    const first = zones.find(z => !this._isZoneLocked(z, station));
    this._zoneId = first?.id ?? zones[0]?.id ?? null;

    this._panToDistrict(zones.find(z => z.id === this._zoneId));
    this._render();
  }

  close() {
    if (this._game?.camera) {
      this._game.camera.popZoom();
      this._game.camera.clearPan();
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
      } else {
        this.close();
      }
    }
  }

  // ── Rendering ─────────────────────────────────────────────────────────────────

  _render() {
    this._el.innerHTML = '';

    const station = this._station;
    const zones = this._getZones(station);
    const zone  = zones.find(z => z.id === this._zoneId);

    // Header
    this._el.appendChild(this._buildHeader(station));

    // District bar
    this._el.appendChild(this._buildDistrictBar(zones, station));

    // Zone content (if a zone is selected)
    if (zone) {
      this._renderZoneContent(zone);
    }
  }

  // ── District bar ────────────────────────────────────────────────────────────

  _buildDistrictBar(zones, station) {
    const bar = document.createElement('div');
    bar.className = 'loc-district-bar';

    for (const zone of zones) {
      const locked = this._isZoneLocked(zone, station);
      const btn = document.createElement('button');
      btn.className = 'loc-district-btn';
      if (zone.id === this._zoneId) btn.classList.add('active');
      if (locked) btn.classList.add('locked');
      btn.textContent = zone.label;

      if (!locked) {
        btn.addEventListener('click', () => {
          this._zoneId    = zone.id;
          this._serviceId = null;
          this._panToDistrict(zone);
          this._render();
        });
      }

      bar.appendChild(btn);
    }

    return bar;
  }

  // ── Zone content (flavor + service tabs + service panel) ────────────────────

  _renderZoneContent(zone) {
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
      this._buildServiceContent(content, this._serviceId, this._station);
      this._el.appendChild(content);
    }
  }

  // ── Camera pan ──────────────────────────────────────────────────────────────

  _panToDistrict(zone) {
    if (!zone || !this._game?.camera || !this._station) return;
    const ox = zone.worldOffset?.x ?? 0;
    const oy = zone.worldOffset?.y ?? 0;
    this._game.camera.panTo(this._station.x + ox, this._station.y + oy);
  }

  // ── World-space district labels ─────────────────────────────────────────────

  // ── Header ───────────────────────────────────────────────────────────────────

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
    const layout = station.layout ?? {};
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
        worldOffset: { x: 0, y: 0 },
      });
    }

    if (services.includes('trade')) {
      zones.push({
        id: 'trade', label: 'Trade',
        description: 'Buy and sell commodities.',
        services: ['trade'], flavor: [], requiredStanding: null,
        worldOffset: { x: 0, y: 0 },
      });
    }

    if ((station.bounties?.length ?? 0) > 0) {
      zones.push({
        id: 'bounties', label: 'Bounty Board',
        description: 'Contracts and active bounties.',
        services: ['bounties'], flavor: [], requiredStanding: null,
        worldOffset: { x: 0, y: 0 },
      });
    }

    if (station.lore?.length > 0) {
      zones.push({
        id: 'intel', label: 'Intel',
        description: 'Station intelligence and history.',
        services: ['intel'], flavor: [], requiredStanding: null,
        worldOffset: { x: 0, y: 0 },
      });
    }

    zones.push({
      id: 'relations', label: 'Relations',
      description: 'Faction standings.',
      services: ['relations'], flavor: [], requiredStanding: null,
      worldOffset: { x: 0, y: 0 },
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
