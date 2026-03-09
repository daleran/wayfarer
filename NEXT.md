# NEXT.md — Upcoming Features

## ~~C. Module installation from cargo~~ ✓ DONE
Module loot drops (10% from kills, cyan diamond), install via Ship Screen click, 1.5s progress bar, remove by clicking slot.

---

## ~~A. Bounty Board~~ ✓ DONE
Per-station kill contracts with named targets, timed expiry, scrap rewards. Bounties tab in station screen (hidden when no contracts). Accept → target spawns → kill → collect on dock. Future: escort contracts, faction standing bonus.

---

## ~~C. Reputation System (Light)~~ ✓ DONE
Tracks -100 to +100 standing per faction. Kill penalty (-10), rival bonus (+5), bounty completion (+20), neutral attack (-25). Station header shows standing level badge. Relations tab lists all 6 factions. Docking refused at ≤-50; 15% service discount at ≥+50.

---

## ~~Hull Breach + Module Repair~~ ✓ DONE
Hull hits below 60% degrade random installed modules (tiered 12/25/40% per hit); field module repair via R key (15 scrap/step, 4 sec/step); orange HUD repair bar; floating breach alerts.

---

## ~~Salvage Expansion~~ ✓ DONE
4 derelict hull classes (hauler/fighter/frigate/unknown) with distinct shapes and lore text; module condition system (good/worn/faulty/damaged/destroyed) with conditionMultiplier on power/weapon modules; weapon drops (MAGENTA) and ammo drops (GREEN); ammoType metadata on weapons; Ship Screen condition badges, tooltip MULT row, WEAPONS (CARGO) section.

## Weight System

Weight system. Heavier modules decrease acceleration. Less modules increase accleration. Top speed remains the same but adding additional modules, especially really heavy modules like additional cargo bays and armor increases the weight of the ship which reduces accleration and turning rate.

---

## Minor fixes / polish

- Grave-Clan Ambusher: confirm heat missile target-lock behavior when multiple enemies are present
- Universal ship slots need to be small and large
- Expand scavenging
- Skills
- Crew members
- Enemy AI appears broken
- Tune damage and health of small ships. 

---

## Utility Module Ideas (Unscheduled)

1. **Expanded Hold** — increases scrap/commodity carry capacity
2. **Compression Baler** — auto-converts low-value commodities into denser scrap (passive income on salvage)
3. **Tow Rig** — lets you latch onto and slowly drag a derelict to a station for a large payout
4. **Auxiliary Tank** — bonus fuel capacity (stackable, weight penalty)
5. **Fuel Reclaimer** — harvests trace fuel from debris clouds and derelicts
6. **Cold Thruster** — silent running mode, no engine glow, reduced detection range by raiders
7. **Reactive Plating** — first hit each fight absorbed, then overloads (limited charges, refillable with scrap)
8. **Point Defense Burst** — active ability, destroys incoming missiles in a radius, short cooldown, costs power
9. **Chaff Pod** — breaks missile lock for a few seconds, consumable
10. **Reinforced Cutting Arm** — reduces salvage time
11. **Remote Scanner** — reveals loot type and quantity before committing to a salvage
12. **Salvage Beacon** — marks a derelict for later retrieval; station pays a finders fee
13. **Overclock Injector** — temporary speed boost at the cost of hull health
14. **Emergency Scrap Burn** — converts carried scrap directly into armor in a pinch
15. **Hull Stress Frame** — lets you push hull below 0 armor briefly without dying, but must be repaired soon or the ship is lost
16. **Stripped Weight** — remove non-essentials for +speed/turn, but fuel cap and armor drop permanently while installed
17. **Concord Transponder** — spoofs a Concord Remnant IFF signal; raiders hesitate to engage until they see through it
18. **Black Market Manifest** — hides cargo from station scanners, unlocks restricted trade goods
19. **Commune Relay Node** — passive, lets Commune settlements send tip-offs about nearby salvage or threats
20. **Mag-Anchor** — emergency full-stop; instantly kills velocity, but strains the hull (small armor damage)
21. **Jury-Rig Bay** — passive workshop that slowly converts scrap into field-repairable components; reduces the scrap cost of field repairs over time
22. **Passive Radiator Array** — vents excess reactor heat, allowing fission reactors to run longer between overhauls
23. **Debris Scoop** — low-yield magnetized intake; passively vacuums micro-loot while flying through debris fields
24. **Cracked Void Lens** — Pre-Collapse artifact; warps local space for a short-range blink jump (~400u), massive cooldown, unknown side effects
25. **Pressure Hull Insert** — reinforces internal bulkheads; hull takes damage at 60% the normal rate when armor is depleted
26. **Scav Signal Jammer** — disrupts raider coordination; enemies deaggro faster and lose targeting more easily
27. **Emergency Fuel Tap** — burns hull integrity directly as fuel when tanks run dry; lets you limp to a station
28. **Thermal Shroud** — reduces damage taken from plasma weapons and AoE explosions
29. **Salvager's Intuition Module** — cracked Concord nav-AI fragment; highlights derelicts on the map and estimates salvage yield, occasionally outputs cryptic lore fragments
