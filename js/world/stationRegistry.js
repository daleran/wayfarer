// Central station registry. Add new stations here only.
// game.js and designer.js both import from here.

import { createStation }         from './station.js';
import { createCoilStation }     from './coilStation.js';
import { createFuelDepotStation } from './fuelDepot.js';

// ── Factory dispatcher ────────────────────────────────────────────────────────
// Used by game.js to instantiate map stations by renderer type.

export function createStationEntity(data) {
  switch (data.renderer) {
    case 'coil':       return createCoilStation(data);
    case 'fuel_depot': return createFuelDepotStation(data);
    default:           return createStation(data);
  }
}

// ── Designer registry ─────────────────────────────────────────────────────────
// Each entry is one item in the designer's Stations category.
// Mirrors the SHIP_REGISTRY pattern.
//
// Fields:
//   id            — kebab-case slug, stable, used for designer URL deep-link
//   label         — display name shown in designer
//   faction       — faction string (drives color in generic renderer)
//   renderer      — renderer type: null = generic hex, 'coil', 'fuel_depot'
//   file          — source file (informational)
//   services      — services offered (for info panel)
//   dockingRadius — docking range (for info panel)
//   designerZoom  — camera zoom level when this item is selected
//   create(x,y)   — returns a station entity for designer preview

export const STATION_REGISTRY = [
  // ── Kell's Stop — fuel depot (actual in-game station) ───────────────────────
  {
    id: 'kells-stop',
    label: "Kell's Stop",
    faction: 'neutral',
    renderer: 'fuel_depot',
    file: 'js/world/fuelDepot.js',
    services: ['fuel', 'repair'],
    dockingRadius: 150,
    designerZoom: 4.0,
    flavorText: "A roadside anomaly turned waystation. Kell herself has been dead for eleven years. Nobody's updated the sign.",
    create: (x, y) => createFuelDepotStation({
      x, y,
      id: 'kells_stop',
      name: "Kell's Stop",
      faction: 'neutral',
      services: ['fuel', 'repair'],
    }),
  },

  // ── The Coil — lawless hub (actual in-game station) ─────────────────────────
  {
    id: 'the-coil',
    label: 'The Coil',
    faction: 'salvage_lords',
    renderer: 'coil',
    file: 'js/world/coilStation.js',
    services: ['repair', 'trade'],
    dockingRadius: 200,
    designerZoom: 0.35,
    flavorText: "A salvage lord's court dressed in wreckage and rust. The only law here is the price of docking.",
    create: (x, y) => createCoilStation({
      x, y,
      id: 'the_coil',
      name: 'The Coil',
      faction: 'salvage_lords',
      services: ['repair', 'trade'],
    }),
  },

  // ── Ashveil Anchorage — neutral repair/trade (actual in-game station) ────────
  {
    id: 'ashveil-anchorage',
    label: 'Ashveil Anchorage',
    faction: 'neutral',
    renderer: null,
    file: 'js/world/station.js',
    services: ['repair', 'trade'],
    dockingRadius: 150,
    designerZoom: 3.5,
    flavorText: "Neutral ground by tradition, respected by necessity. The nebula keeps most trouble at bay.",
    create: (x, y) => createStation({
      x, y,
      id: 'ashveil_anchorage',
      name: 'Ashveil Anchorage',
      faction: 'neutral',
      services: ['repair', 'trade'],
    }),
  },

];
