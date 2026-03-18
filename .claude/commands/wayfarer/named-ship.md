# Named Ship — Create or Edit

Create a new named ship or edit an existing one. Named ships are configured instances of a ship class: a hull + modules + optionally a captain (Character). A ship without a captain is a derelict.

## Step 1 — Identify scope

**Creating new?** Ask the user for:
- **Display name** — e.g. "Void Cutter"
- **Slug** — kebab-case, e.g. `void-cutter`
- **Base ship class** — one of the hulls in `CONTENT.hulls` (check `engine/entities/registry.js`, which proxies to `CONTENT.hulls`):
  - `onyx-tug`, `maverick-courier`, `g100-hauler`, `garrison-frigate`, `drone-control-hull`, `snatcher-drone-hull`
  - Or a new class if none fits (see `/ship-class`)
- **Has a captain?** — Yes = active NPC/player. No = derelict wreck.
- **Modules** — pick from `CONTENT.modules` (browse via designer or data files in `data/modules/`)
- **Flavor text** — one paragraph tactical/lore description

**If captained**, also ask:
- **Faction** — `'scavengers'`, `'concord'`, `'settlements'`, `'monastic'`, `'communes'`, `'zealots'`, `'casimir'`, or a child faction
- **Relation** — derived from faction reputation at runtime (do NOT hardcode for NPCs; only `'player'` for player characters)
- **Combat behavior** — `stalker`, `kiter`, `standoff`, `lurker`, `flee` (hostile); `trader`, `militia` (neutral passive)
- **Character** — create new (see `/character`) or reference existing from `data/locations/<system>/<body>/<node>/characters/*.js` or `data/characters/player.js`

**If derelict (no captain)**, also ask:
- **Ship class** — a hull ID from `CONTENT.hulls` (e.g. `'g100-hauler'`, `'maverick-courier'`, `'garrison-frigate'`, `'onyx-tug'`)
- **Salvage time** — seconds to complete salvage
- **Lore text** — multi-line flavor shown on approach

**Editing existing?** Read the file first. Ask what to change. Common edits:
- Swap modules / weapons
- Change AI behavior or captain
- Adjust flavor text
- Switch base class

## Step 2 — Read reference files

- `engine/entities/registry.js` — `getCharacterRegistry()`, `createNPC()` / `createShip()` helpers
- `engine/entities/character.js` — Character class, `boardShip()` pattern
- `CONTENT.modules` — available modules (self-registered from `data/modules/*.js`)
- `CONTENT.weapons` — available weapons (self-registered from `data/modules/weapons.js`)
- `data/locations/<system>/<body>/<node>/ships/` — ship config definitions (self-register into `CONTENT.ships`); player ships in `data/ships/player/`
- `data/locations/<system>/<body>/<node>/characters/*.js` — named NPC characters with backstories/bounties; player character in `data/characters/player.js`
- Existing derelicts in `data/locations/<system>/<body>/<node>/derelicts/` for derelict pattern

## Step 3 — Data entry (if applicable)

If the named ship needs a data entry, add/update in `data/locations/<system>/<body>/<node>/ships/<shipName>.js` (zone-specific) or `data/ships/player/<shipName>.js` (player ships) using `registerContent('ships', '<slug>', { ... })` from `data/dataRegistry.js`. Content self-registers at import time — no `data/index.js` edit needed (auto-discovered by `import.meta.glob`).

## Step 4 — Create or edit the ship entry

### Captained ship (active NPC or player)

Location: `data/locations/<system>/<body>/<node>/ships/<shipName>.js` (zone-specific) or `data/ships/player/<shipName>.js` (player) — register into `CONTENT.ships`:

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

Module IDs use kebab-case keys matching `CONTENT.modules` (e.g. `'autocannon'`, `'hydrogen-fuel-cell'`). Use `'null'` string for empty slots. For rocket pods with guidance: `'rocket-s:ht'` or `'rocket-l:ht'`.

Characters are defined separately in `data/locations/<system>/<body>/<node>/characters/*.js` (zone-specific) or `data/characters/player.js` (player) with a `shipId` field referencing this ship's ID. See `/character`.

**Unmanned ships (Concord machines):** Add `unmanned: true`, `faction`, `relation`, `aiBehavior`, and `entityClass: '<entity-class-id>'` to the ship data. Entity subclasses live in `engine/entities/concord/`.

**Named characters with bounties:** Add an entry to `data/locations/<system>/<body>/<node>/characters/*.js` using `registerData(CHARACTERS, ...)` + `registerContent('characters', ...)`.

**Behavior setup notes:**
- `lurker`: spawn code must set `ship.ai._coverPoint = { x, y }` post-creation
- `trader`: set `ship.ai._tradeRouteA` and `ship.ai._tradeRouteB` to station positions
- `militia`: set `ship.ai._orbitCenter/Radius/Speed/Angle`

### Derelict (no captain)

Derelicts self-register into `CONTENT.derelicts` via `registerContent()`. Location: `data/locations/<system>/<body>/<node>/derelicts/<camelCaseName>.js`.

```js
import { CONTENT, registerContent } from '@data/dataRegistry.js';
import { createDerelict } from '@/entities/registry.js';

registerContent('derelicts', '<slug>', {
  name: '<Display Name>',
  shipClass: '<hull-id>',
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

**Captained ships:** Ship config self-registers at import time via `registerContent('ships', ...)`. Character data self-registers via `registerContent('characters', ...)`. `getCharacterRegistry()` in `engine/entities/registry.js` reads from `CONTENT.characters`. No manual registry editing needed.

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

- Named vessel with lore → `scripts/templates/setting.md`
- New faction member → `scripts/templates/setting.md` faction section
