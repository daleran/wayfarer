# Manifest — Create or Edit Placement Manifests

Create a new placement manifest or edit an existing one. Manifests are the bridge between content definitions and the game world — they pre-instantiate entities with positions, AI state, and patrol routes.

## Step 1 — Identify scope

**Creating new?** Ask the user for:
- **Zone** — which location tree node (e.g. `tyr/pale/orbital/`)
- **Stations** — which stations to place (positions)
- **NPCs** — enemy groups, patrol routes, lurker positions
- **Derelicts** — wreck positions
- **Terrain** — terrain features to include
- **Zone boundary** — center, radius, name for map display
- **Background** — atmosphere layer, planet backgrounds

**Editing existing?** Read the manifest first. Common edits:
- Reposition entities
- Add/remove NPC groups
- Adjust patrol routes or orbit parameters
- Change zone boundary

## Step 2 — Read reference files

- `data/locations/tyr/pale/orbital/manifest.js` — the production manifest (full pattern reference)
- `engine/entities/registry.js` — `createNPC()`, `createShip()` factories
- `data/index.js` — `SPAWN` constants for radius ranges
- `engine/ai/shipAI.js` — AI state fields reference

## Step 3 — Spawn pattern reference

### `npcGroup(x, y, count, id, options)` — Cluster of NPCs

Spawns `count` ships in a circle around `(x, y)`. Each gets `homePosition` set.

- `id` — character ID for manned (`createNPC`), ship ID for unmanned (`createShip`)
- `options.unmanned` — `true` for Concord machines
- Ships scatter within `SPAWN.ENEMY_RADIUS.MIN` to `SPAWN.ENEMY_RADIUS.MAX`

```js
...npcGroup(3200, 2200, 3, 'scavenger-pilot'),
...npcGroup(14000, 8000, 1, 'drone-control-frigate', { unmanned: true }),
```

### `lurkerGroup(x, y, count)` — Ambush positions

Spawns lurker-behavior NPCs around a point. Each gets:
- `ship.ai._coverPoint = { x, y }` — position they hide at
- `ship.homePosition = { x, y }` — center of patrol area

```js
...lurkerGroup(4200, 4000, 2),
```

### `convoy(routeA, routeB, shipCount)` — Trade route

Spawns trader NPCs evenly distributed along a route. Each gets:
- `ship.ai._tradeRouteA = { x, y }` — route start
- `ship.ai._tradeRouteB = { x, y }` — route end

```js
...convoy({ x: 2200, y: 5000 }, { x: 5500, y: 3800 }, 2),
```

### `militia(orbitCenter, orbitRadius, orbitSpeed, count)` — Patrol orbit

Spawns militia NPCs in a circular orbit. Each gets:
- `ship.ai._orbitCenter = { x, y }` — center of orbit
- `ship.ai._orbitRadius` — orbit distance
- `ship.ai._orbitSpeed` — radians per second
- `ship.ai._orbitAngle` — starting angle (evenly distributed)

```js
...militia({ x: 15000, y: 3000 }, 600, 0.12, 2),
```

### Station/Derelict placement

Stations and derelicts use their `instantiate(x, y)` method:

```js
TheCoil.instantiate(15000, 3000),
BrokenCovenant.instantiate(3800, 4200),
```

### Terrain placement

Terrain features that spawn arrays use `...spread`:

```js
...ArkshipSpines.instantiate(),
...WallOfWrecks.instantiate(),
```

## Step 4 — AI state field reference

When placing NPCs, these AI state fields must be initialized post-creation:

| Field | Behavior | Purpose |
|---|---|---|
| `ship.homePosition` | All combat NPCs | Center of patrol/roam area |
| `ship.ai._coverPoint` | `lurker` | Position to hide at when not aggro'd |
| `ship.ai._tradeRouteA` | `trader` | Route start (station position) |
| `ship.ai._tradeRouteB` | `trader` | Route end (station position) |
| `ship.ai._orbitCenter` | `militia` | Center of patrol orbit |
| `ship.ai._orbitRadius` | `militia` | Distance from orbit center |
| `ship.ai._orbitSpeed` | `militia` | Orbital speed (radians/sec) |
| `ship.ai._orbitAngle` | `militia` | Starting angle on orbit |

## Step 5 — Zone definition

Every manifest defines at least one zone for the map display:

```js
const ZONE_DEF = {
  id: '<zone-id>',        // kebab-case slug
  name: '<Display Name>',  // shown on map (M key)
  center: { x: XXXX, y: YYYY },
  radius: RRRR,           // zone boundary radius in world units
};
```

## Step 6 — Export structure

The manifest exports a single object with three arrays:

```js
export const <ZONE_NAME> = {
  entities: [ /* all pre-instantiated entities */ ],
  zones: [ /* zone boundary definitions */ ],
  background: [ /* atmosphere layers, planet backgrounds */ ],
};
```

Maps spread these into `MAP`:
```js
export const MAP = {
  entities: [...<ZONE_A>.entities, ...<ZONE_B>.entities],
  zones: [...<ZONE_A>.zones, ...<ZONE_B>.zones],
  background: [...<ZONE_A>.background, ...<ZONE_B>.background],
};
```

## Step 7 — Validate & verify

1. Run `npm run validate` — fix any errors
2. Tell the user:
   - `editor.html?map=<name>` — verify entity positions, AI patrols
   - Press `M` to check zone boundary on map
   - Verify trade routes connect between correct stations
   - Verify lurkers hide near terrain features

## Step 8 — Update docs

- New zone with content → `scripts/templates/setting.md`
- Significant entity placement changes → `scripts/templates/setting.md` zone description
