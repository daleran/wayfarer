// Station registry — designer catalog only.
// game.js no longer needs a factory dispatcher; entities self-instantiate.

import { TheCoil }          from './zones/gravewake/theCoil/index.js';
import { KellsStop }        from './zones/gravewake/kellsStop.js';
import { AshveilAnchorage } from './zones/gravewake/ashveilAnchorage.js';

export const STATION_REGISTRY = [
  {
    entity: TheCoil,
    id: 'the-coil',
    designerZoom: 0.35,
    flavorText: "A salvage lord's court dressed in wreckage and rust. The only law here is the price of docking.",
  },
  {
    entity: KellsStop,
    id: 'kells-stop',
    designerZoom: 4.0,
    flavorText: "A roadside anomaly turned waystation. Kell herself has been dead for eleven years. Nobody's updated the sign.",
  },
  {
    entity: AshveilAnchorage,
    id: 'ashveil-anchorage',
    designerZoom: 1.8,
    flavorText: "Neutral ground by tradition, respected by necessity. The nebula keeps most trouble at bay.",
  },
];
