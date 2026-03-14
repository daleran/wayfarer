# Named Ship — Create or Edit

Create a new named ship or edit an existing one. Named ships are configured instances of a ship class: a hull + modules + optionally a captain (Character). A ship without a captain is a derelict.

## Step 1 — Identify scope

**Creating new?** Ask the user for:
- **Display name** — e.g. "Void Cutter"
- **Slug** — kebab-case, e.g. `void-cutter`
- **Base ship class** — one of the hulls in `SHIP_REGISTRY` (check `js/ships/registry.js`):
  - `onyx-tug`, `maverick-courier`, `g100-hauler`, `garrison-frigate`, `drone-control-hull`, `snatcher-drone-hull`
  - Or a new class if none fits (see `/ship-class`)
- **Has a captain?** — Yes = active NPC/player. No = derelict wreck.
- **Modules** — pick from `MODULE_REGISTRY` in `js/modules/shipModule.js`
- **Flavor text** — one paragraph tactical/lore description

**If captained**, also ask:
- **Faction** — `'scavenger'`, `'concord'`, `'settlements'`, `'monastic'`, `'communes'`, `'zealots'`, or `'player'`
- **Relation** — `'hostile'`, `'neutral'`, or `'player'`
- **Combat behavior** — `stalker`, `kiter`, `standoff`, `lurker`, `flee` (hostile); `trader`, `militia` (neutral passive)
- **Character** — create new (see `/character`) or reference existing from `js/characters/`

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

- `js/ships/registry.js` — `CHARACTER_REGISTRY` format, `createActor()` helper
- `js/characters/character.js` — Character class, `boardShip()` pattern
- `js/modules/shipModule.js` — `MODULE_REGISTRY` for available modules
- `js/modules/weapons/registry.js` — `WEAPON_REGISTRY` for available weapons
- Existing named ships in `js/npcs/<faction>/` for pattern reference
- Existing derelicts in `js/data/ships/named/` for derelict pattern
- `data/namedShips.js` — existing named ship definitions

## Step 3 — Data entry (if applicable)

If the named ship needs a data entry, add/update in `data/namedShips.js` using `registerData(NPC_SHIPS, { ... })`.

## Step 4 — Create or edit the ship file

### Captained ship (active NPC or player)

Location: `js/npcs/<faction>/<camelCaseName>.js`

```js
import { <BaseClass> } from '@/ships/classes/<baseFile>.js';
import { <Module1>, <Module2> } from '@/modules/shipModule.js';
import { Character } from '@/characters/character.js';

export function create<ClassName>(x, y) {
  const ship = new <BaseClass>(x, y);
  ship.shipType = '<slug>';
  ship.moduleSlots = [new <Module1>(), new <Module2>(), null];
  ship._applyModules();
  ship.flavorText = '<One paragraph description.>';

  const captain = new Character({
    id: '<slug>',
    faction: '<faction>',
    relation: '<hostile|neutral|player>',
    behavior: '<stalker|kiter|standoff|lurker|flee|trader|militia>',
  });
  captain.boardShip(ship);
  return ship;
}
```

**Named characters:** If the ship has a named character with backstory, create a character file first (see `/character`), import and use it instead of inline construction.

**Behavior setup notes:**
- `lurker`: spawn code must set `ship.ai._coverPoint = { x, y }` post-creation
- `trader`: set `ship.ai._tradeRouteA` and `ship.ai._tradeRouteB` to station positions
- `militia`: set `ship.ai._orbitCenter/Radius/Speed/Angle`

### Derelict (no captain)

Location: `js/data/ships/named/<camelCaseName>.js`

```js
import { createDerelict } from '@/world/derelict.js';

export const <PascalName> = {
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
};
```

## Step 5 — Register

Open `js/ships/registry.js`:
1. Import the create function
2. Add to `CHARACTER_REGISTRY`:
```js
{
  id: '<slug>',
  label: '<Display Name>',
  faction: '<faction>',
  behavior: '<behavior>',
  hullClass: '<base-class-slug>',
  file: 'js/npcs/<faction>/<fileName>.js',
  create: (x, y) => create<ClassName>(x, y),
  unmanned: true, // only for derelicts / autonomous drones
},
```

**For derelicts:** Also add to the `NAMED_DERELICTS` array in `js/test/designer.js`:
```js
{ def: <PascalName>, slug: '<slug>', file: 'js/data/ships/named/<fileName>.js' },
```

## Step 6 — Add to maps

Add spawn entries to `js/data/maps/arena.js` (testing) and the relevant zone manifest / `js/data/maps/tyr.js` (production).

- Captained ships: `createActor('<slug>', x, y)` from registry
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
