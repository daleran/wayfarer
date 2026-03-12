# Designer Harness — Working Guide

Use this skill when the user wants to add, fix, or extend the `?designer` test harness.

## What the Designer Is

URL: `?designer` (append `&category=<cat>&id=<slug>` for deep-links)

The designer is a visual browser for all ships, stations, POIs, and weapons. It renders each item in isolation with a stats panel. No game loop runs — entities are drawn directly.

**Entry points:**
- `js/designer-main.js` — bootstraps the designer mode
- `js/test/designer.js` — all categories, item slugs, `create()` factories, stats panel renderers

**Navigation (keyboard):**
- `↑/↓` — change category
- `←/→` — cycle items within a category
- `T` — toggle rotation (ships only)
- `R` — reset camera to default zoom/pan
- Scroll — zoom in/out
- Drag — pan

## Category Structure in designer.js

Each category is an object with:
```js
{
  name: 'Ships',                // display name
  items: [
    {
      id: 'hullbreaker',        // deep-link slug, must be unique within category
      label: 'Hullbreaker',     // display label in UI
      create: (x, y) => new Hullbreaker(x, y),  // factory function
      designerZoom: 0.5,        // optional camera zoom override (default 0.3)
      statsPanel: (item) => [   // optional — array of { label, value } rows
        { label: 'HULL', value: item.hullMax },
        { label: 'SPEED', value: item.speedMax.toFixed(1) },
      ],
    },
  ],
}
```

**Categories currently in scope:** Ships, Enemies, Stations, Weapons, Modules

## Adding a New Ship/Enemy

1. Import the class at the top of `designer.js`
2. Add an entry to the correct category's `items` array
3. Provide `id` (kebab-slug matching `ship.shipType`), `label`, `create`, and `statsPanel`
4. Use `designerZoom` to set a comfortable default zoom (smaller ships = higher zoom, e.g. 0.6; large = 0.25)
5. Verify: `?designer&category=Ships&id=<slug>`

## Adding a New Station

1. Create the zone entity file in `js/world/zones/<zone>/` with `instantiate(x, y)` method
2. Add entry to `STATION_REGISTRY` in `js/world/stationRegistry.js`: `{ entity: MyStation, id: 'my-station', designerZoom: 3.5, flavorText: '...' }`
3. `_buildStationItems()` in designer.js auto-reads from the registry — no manual designer edit needed
4. Verify: `?designer&category=Stations&id=<slug>`

## Adding a New Weapon

1. Import the weapon module class from `shipModule.js`
2. Add to the `Weapons` category — create a dummy ship, add the weapon, return it
3. Stats panel: damage, range, fireRate, ammoType, any special flags (`isBeam`, `detonatesOnContact`, etc.)
4. Verify: `?designer&category=Weapons&id=<slug>`

## Stats Panel Conventions

- Show the most gameplay-relevant numbers (not internals)
- Use `toFixed(1)` or `toFixed(0)` for floats — no excessive decimals
- Color hint rows are optional; plain `{ label, value }` is sufficient
- The panel is drawn to the right of the canvas; keep rows to ~10–15 max

## Common Mistakes

- **Stale slug** — if a ship's `shipType` was renamed, update the designer id to match
- **Missing import** — designer.js has its own import block; adding to registry.js alone is not enough
- **Wrong zoom** — large stations need low zoom (0.2–0.3); small fighters need high zoom (0.6–0.8)
- **`create()` crashes** — designer entities are created without a game context; avoid any `game.*` calls in constructors

## Updating Existing Items

If a ship/station/weapon's stats or shape changes, no designer.js edit is needed — the `create()` factory always reflects the current class. Only update designer.js if:
- The slug/id changes
- The label changes
- A `statsPanel` needs new or removed rows
- A new item is added or an old item removed
