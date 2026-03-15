# Named Ship — Create or Edit

Create a new named ship or edit an existing one. Named ships are configured instances of a ship class: a hull + modules + optionally a captain (Character). A ship without a captain is a derelict.

## Step 1 — Identify scope

**Creating new?** Ask the user for:
- **Display name** — e.g. "Void Cutter"
- **Slug** — kebab-case, e.g. `void-cutter`
- **Base ship class** — one of the hulls in `CONTENT.hulls` (check `src/entities/registry.js`, which proxies to `CONTENT.hulls`):
  - `onyx-tug`, `maverick-courier`, `g100-hauler`, `garrison-frigate`, `drone-control-hull`, `snatcher-drone-hull`
  - Or a new class if none fits (see `/ship-class`)
- **Has a captain?** — Yes = active NPC/player. No = derelict wreck.
- **Modules** — pick from `MODULE_REGISTRY` in `src/modules/shipModule.js`
- **Flavor text** — one paragraph tactical/lore description

**If captained**, also ask:
- **Faction** — `'scavenger'`, `'concord'`, `'settlements'`, `'monastic'`, `'communes'`, `'zealots'`, or `'player'`
- **Relation** — `'hostile'`, `'neutral'`, or `'player'`
- **Combat behavior** — `stalker`, `kiter`, `standoff`, `lurker`, `flee` (hostile); `trader`, `militia` (neutral passive)
- **Character** — create new (see `/character`) or reference existing from `data/characters/*.js`

**If derelict (no captain)**, also ask:
- **Derelict class** — `'hauler'`, `'fighter'`, `'frigate'`, `'unknown'` (affects salvage color/condition distributions)
- **Salvage time** — seconds to complete salvage
- **Lore text** — multi-line flavor shown on approach

**Editing existing?** Read the file first. Ask what to change. Common edits:
- Swap modules / weapons
- Change AI behavior or captain
- Adjust flavor text
- Switch base class

## Step 2 — Read reference files

- `src/entities/registry.js` — `getCharacterRegistry()`, `createNPC()` / `createShip()` helpers
- `src/entities/character.js` — Character class, `boardShip()` pattern
- `src/modules/shipModule.js` — `MODULE_REGISTRY` for available modules
- `src/modules/weapons/registry.js` — `WEAPON_REGISTRY` for available weapons
- `data/ships/<faction>/` — ship config definitions (self-register into `CONTENT.ships`)
- `data/characters/*.js` — named NPC characters with backstories/bounties
- Existing derelicts in `data/ships/named/` for derelict pattern

## Step 3 — Data entry (if applicable)

If the named ship needs a data entry, add/update in `data/ships/<faction>/<shipName>.js` using `registerContent('ships', '<slug>', { ... })` from `data/dataRegistry.js`. Content self-registers at import time.

## Step 4 — Create or edit the ship entry

### Captained ship (active NPC or player)

Location: `data/ships/<faction>/<shipName>.js` — register into `CONTENT.ships`:

```js
import { registerContent } from '@data/dataRegistry.js';

registerContent('ships', '<slug>', {
  id: '<slug>',
  label: '<Display Name>',
  shipClass: '<base-class-slug>',
  name: '<Vessel Name>',
  modules: ['<module-id>', '<module-id>', 'null'],
  flavorText: '<One paragraph ship description.>',
});
```

Module IDs use `MODULE_REGISTRY` keys from `src/modules/registry.js`. Use `'null'` string for empty slots. For rocket pods with guidance: `'rocket-pod-s:ht'` or `'rocket-pod-l:ht'`.

Characters are defined separately in `data/characters/*.js` with a `shipId` field referencing this ship's ID. See `/character`.

**Unmanned ships (Concord machines):** Add `unmanned: true`, `faction`, `relation`, `aiBehavior`, and `entityClass: '<entity-class-id>'` to the ship data. Entity subclasses live in `src/entities/concord/`.

**Named characters with bounties:** Add an entry to `data/characters/*.js` using `registerData(CHARACTERS, ...)` + `registerContent('characters', ...)`.

**Behavior setup notes:**
- `lurker`: spawn code must set `ship.ai._coverPoint = { x, y }` post-creation
- `trader`: set `ship.ai._tradeRouteA` and `ship.ai._tradeRouteB` to station positions
- `militia`: set `ship.ai._orbitCenter/Radius/Speed/Angle`

### Derelict (no captain)

Derelicts self-register into `CONTENT.derelicts` via `registerContent()`. Location: `data/ships/named/<camelCaseName>.js`.

```js
import { CONTENT, registerContent } from '@data/dataRegistry.js';
import { createDerelict } from '@/entities/registry.js';

registerContent(CONTENT.derelicts, '<slug>', {
  name: '<Display Name>',
  derelictClass: '<hauler|fighter|frigate|unknown>',
  salvageTime: 5,
  lore: `<DISPLAY NAME> — <class> description.
Second line of lore.
Third line.`,

  instantiate(x, y) {
    return createDerelict({
      ...this, x, y,
      loreText: this.lore.split('\n'),
    });
  },
});
```

## Step 5 — Register

**Captained ships:** Ship config self-registers at import time via `registerContent('ships', ...)`. Character data self-registers via `registerContent('characters', ...)`. `CHARACTER_REGISTRY` is built from `CONTENT.characters` via `getCharacterRegistry()` in `src/entities/registry.js`. No manual registry editing needed.

**For derelicts:** Content self-registers into `CONTENT.derelicts` at import time. The designer auto-discovers from `CONTENT.derelicts` — no separate designer entry needed.

## Step 6 — Add to maps

Add spawn entries to `data/maps/arena.js` (testing) and the relevant zone manifest / `data/maps/tyr.js` (production).

- Captained ships: `createNPC('<slug>', x, y)` from registry
- Derelicts: `<PascalName>.instantiate(x, y)`

## Step 7 — Validate & verify

1. Run `npm run validate` — fix any errors
2. Tell the user:
   - Captained: `designer.html?category=named-ships&id=<slug>` and `editor.html?map=arena`
   - Derelicts: `designer.html?category=derelicts&id=<slug>` and `editor.html?map=arena`

## Step 8 — Update docs

- New enemy type or neutral traffic → `MECHANICS.md`
- Named vessel with lore → `LORE.md`
- New faction member → `LORE.md` faction section
