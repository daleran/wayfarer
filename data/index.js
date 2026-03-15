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

// Actors — self-register into NPC_SHIPS and CONTENT.actors
import './actors/player/hullbreaker.js';
import './actors/player/crashDummy.js';
import './actors/scavenger/lightFighter.js';
import './actors/scavenger/armedHauler.js';
import './actors/scavenger/salvageMothership.js';
import './actors/scavenger/graveClanAmbusher.js';
import './actors/neutral/traderConvoy.js';
import './actors/neutral/militiaPatrol.js';
import './actors/concord/droneControlFrigate.js';
import './actors/concord/snatcHerDrone.js';

// Characters — bounty NPCs
import './actors/scavenger/characters.js';

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
  NPC_SHIPS,
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
