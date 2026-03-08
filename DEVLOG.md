# Wayfarer — Development Log

Major features only. Format: `YYYY-MMM-DD-HHMM: Feature name`

---

2026-MAR-07-0000: Phase 1 Engine — canvas loop, camera, input, starfield, entity/ship base classes
2026-MAR-07-0000: Phase 2 Combat — projectiles, particles, raider AI, HUD combat readouts
2026-MAR-07-0000: Phase 3 World & Stations — station/planet entities, docking, station screen
2026-MAR-07-0000: Phase 4 Trade Economy — commodities, cargo, trade routes, buy/sell UI
2026-MAR-07-0000: UI Overhaul — vector monitor / cassette futurism aesthetic, color palette, CRT effects
2026-MAR-07-0000: Lore & Ship Redesign — faction/location rename, all 5 ship silhouettes redesigned
2026-MAR-07-0000: Weapon System — autocannon as standard, laser split-damage model, projectile color coding
2026-MAR-07-0000: Phase 5 Loot & Salvage — loot drops, derelict salvage, scrap/fuel economy
2026-MAR-07-0000: Systems Overhaul — removed crew, fleet, and credits; scrap-only economy
2026-MAR-07-0000: Combat2 — quad-arc positional armor, tactical AI (shielding/interceptor/kiter), rockets
2026-MAR-07-0000: Gravewake Zone — arkship spines, debris clouds, CoilStation terrain structure
2026-MAR-07-0000: Station Intel Tab — lore text display per station
2026-MAR-07-0000: Rocket AoE — click-point detonation, expanding blast, friendly fire
2026-MAR-07-0000: Test Harnesses — ?test-ships (ship designer), ?test-poi (POI designer)
2026-MAR-08-0000: Capital Ship Scale — zoom 0.4×, slow movement, long-range projectiles, armor rebalance
2026-MAR-08-0000: Centralized Stats — js/data/stats.js, multiplier pattern for all ships/weapons
2026-MAR-08-1200: Stat Audit — BASE_ARMOR/BASE_HULL_DAMAGE/BASE_COOLDOWN added; all ships/weapons use multiplier pattern; crosshair cursor with range indicator
2026-MAR-08-0000: Designer Deep-Links — URL slugs for ?test-ships and ?test-poi harnesses
2026-MAR-08-0000: Weapon System Expansion — 11 weapon families, lance beam, guided missiles, AoE, interception
2026-MAR-08-0000: Doc Reorganization — MECHANICS.md, UX.md, NEXT.md; retired SPEC.md and UI.md
2026-MAR-08-0000: Unified Designer — merged ship/POI designers into single ?designer harness with category navigation and weapon stats panel
2026-MAR-08-0000: Ship Architecture Overhaul — OnyxClassTug class template, Hullbreaker player variant, central ship registry, per-ship fuel tank and efficiency
2026-MAR-08-0000: Enemy & Ship Overhaul — 3 new base ship classes (Swift Runner, G100 Class Hauler, Decommissioned Frigate), 3 new scavenger enemies (Light Fighter, Armed Hauler, Salvage Mothership), stalker and standoff AI behaviors
