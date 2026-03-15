// =============================================================================
// WAYFARER — Data Boot Loader
// Imports content files (triggering registration), then re-exports everything.
// =============================================================================

// Boot — import content files to trigger registration
import './modules/engines.js';
import './modules/reactors.js';
import './modules/sensors.js';
import './modules/weapons.js';
import './modules/utilities.js';
import './shipClasses.js';
import './aiBehaviors.js';
import './ammo.js';

// Hull classes — self-register into CONTENT.hulls
import './hulls/onyx-tug/hull.js';
import './hulls/maverick-courier/hull.js';
import './hulls/g100-hauler/hull.js';
import './hulls/garrison-frigate/hull.js';
import './hulls/drone-control-hull/hull.js';
import './hulls/snatcher-drone-hull/hull.js';

// Ships — self-register into CONTENT.ships
import './ships/player/hullbreaker.js';
import './ships/player/crashDummy.js';
import './ships/scavenger/lightFighter.js';
import './ships/scavenger/armedHauler.js';
import './ships/scavenger/salvageMothership.js';
import './ships/scavenger/graveClanAmbusher.js';
import './ships/neutral/traderConvoy.js';
import './ships/neutral/militiaPatrol.js';
import './ships/concord/droneControlFrigate.js';
import './ships/concord/snatcHerDrone.js';

// Characters — self-register into CHARACTERS + CONTENT.characters
import './characters/player.js';
import './characters/scavenger.js';
import './characters/neutral.js';

// Stations — self-register into CONTENT.stations
import './locations/the-coil/station.js';
import './locations/kells-stop/station.js';
import './locations/ashveil-anchorage/station.js';

// Conversations — self-register into CONTENT.conversations
import './conversations/genericHub.js';
import './conversations/genericDock.js';
import './locations/kells-stop/conversations/hub.js';
import './locations/kells-stop/conversations/dock.js';
import './locations/kells-stop/conversations/intel.js';
import './locations/kells-stop/conversations/bounties.js';
import './locations/kells-stop/conversations/trade.js';
import './locations/kells-stop/conversations/relations.js';
import './locations/ashveil-anchorage/conversations/hub.js';
import './locations/ashveil-anchorage/conversations/dock.js';
import './locations/ashveil-anchorage/conversations/intel.js';
import './locations/ashveil-anchorage/conversations/bounties.js';
import './locations/ashveil-anchorage/conversations/trade.js';
import './locations/ashveil-anchorage/conversations/relations.js';

// Derelicts — self-register into CONTENT.derelicts
import './ships/named/brokenCovenant.js';
import './ships/named/coldRemnant.js';
import './ships/named/fracturedWake.js';
import './ships/named/guttedPioneer.js';
import './ships/named/hollowMarch.js';
import './ships/named/paleWitness.js';

// Re-export everything consumers need
export * from './tuning.js';
export {
  SHIP_CLASSES,
  ENGINES,
  REACTORS,
  SENSORS,
  WEAPONS,
  UTILITIES,
  AI_TEMPLATES,
  AMMO,
  CHARACTERS,
  CONTENT,
  registerData,
  registerContent,
} from './dataRegistry.js';
