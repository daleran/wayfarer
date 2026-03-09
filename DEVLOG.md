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
2026-MAR-08-0000: Dec Frigate Redesign — Fletcher-class workhorse silhouette (2× scale, utilitarian straight lines, twin outboard nacelles on pylons); flavor text added to all 10 ship classes
2026-MAR-08-0000: Neutral Traffic (Phase 1-2) — trade convoys on 3 routes, militia orbit around The Coil, 2 new neutral stations (Kell's Stop, Ashveil Anchorage)
2026-MAR-08-0000: Station Registry + Kell's Stop — central stationRegistry.js (mirrors ship registry), FuelDepotStation renderer (platform + ops block + two massive fuel tanks), renamed Thorngate Relay → Kell's Stop
2026-MAR-08-0000: Ship Modules — slot system (shipModule.js), HydrogenFuelCell idle drain, 4-slot Hullbreaker, enemy ship module loadouts
2026-MAR-08-0000: Ship Screen — [I] key overlay with paper doll (armor rings, hull bar), module slots, cargo list, weapon list
2026-MAR-08-0000: Bug Fixes — FlakCannon maxRange, enemy AI fire range gate, enemy damage visual tiers (darkening/slow fire/slow movement), Coil color to amber
2026-MAR-08-0000: Grave-Clan Lurker AI — GraveClanAmbusher enemy (lurker behavior): hides at spawn cover point, scans for traders, pounces with autocannon + heat missile, switches to player if they engage
2026-MAR-08-0000: Kill Log + Range Circle + Module Install — kill log (upper-right, 3s fade), weapon range circle (dashed world-space ring), flak AoE cursor ring, module loot drops (10% chance, cyan diamond), install via Ship Screen click with 1.5s progress bar, remove by clicking slot
2026-MAR-08-0000: Finite Ammo + Ammo Cargo — autocannon (60 rds, 6 cu), rockets (6×1cu, 3-pod×2cu), missiles (6×1cu); round count in primary HUD; rocket pips + reload bar (1 pip basic, 5-pip burst pod); ammo weight included in cargo bar
2026-MAR-08-0000: Bounty Board — per-station kill contracts (named targets, timed expiry, scrap rewards); Bounties tab in station screen; accept/complete/collect/expiry loop
2026-MAR-08-0000: Power Plant System — 4 reactor types (H2 Fuel Cell S, Fission S/L, Fusion L); fission overhaul mechanic (3-4h intervals, 60% power when overdue, overhaul at Ashveil Anchorage for 800-1500 scrap); HUD overdue warning; module update tick loop
2026-MAR-08-0000: Salvage Expansion — 4 derelict hull classes (hauler/fighter/frigate/unknown) with distinct polygon shapes and lore text; module condition system (good/worn/faulty/damaged/destroyed); weapon drops (MAGENTA diamond) and ammo drops (GREEN diamond); Ship Screen condition badges and tooltip MULT row; ammoType metadata on weapons
2026-MAR-08-0000: Hull Breach + Module Repair — hull hits below 60% chance to degrade random installed module (tiered 12/25/40%); field module repair via R key (15 scrap/step, 4 sec/step); orange repair bar in HUD; pickup text alerts on breach
2026-MAR-08-0000: Reputation System — 6-faction standing (-100 to +100); kill/bounty/neutral-attack triggers; station header badge; Relations tab; docking refused at ≤-50; 15% Allied discount
2026-MAR-08-0000: Commodity Expansion — 4 generic commodities replaced with 15 specific lore-flavored commodities (Ration Packs through Void Crystals); trade screen filtered to show only stocked/held rows; per-station commodity profiles for all 3 stations; loot tables updated
