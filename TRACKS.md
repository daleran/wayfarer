# TRACKS.md — Parallel Implementation Tracks

Two parallel tracks to flesh out the game start, starting area, and initial gameplay loops.

---

## Track A: The Physical World

*Build the space the player inhabits. Mostly map/terrain/renderer work (canvas, entities, manifests).*

| Order | Code | What | Why |
|---|---|---|---|
| 1 | **DL** | Gravewake Legacy Cleanup | Clear old Pale/Gravewake content that blocks new world structure |
| 2 | **DH** | Khem (starting planet) | The player's first world — crater settlements, orbital station, visual identity |
| 3 | **DT** | Kesra Belt (asteroid zone) | Adjacent zone — where all three origins converge, first exploration space |
| 4 | **DN** | Origin Stories | Three starting narratives that use DH + DT as their stage |

## Track B: Systems & Identity

*Build what the player does and who they interact with. Mostly data/narrative/system work (lore format, factions, conversations, contract engine).*

| Order | Code | What | Why |
|---|---|---|---|
| 1 | **DK** | Lore System Overhaul | Standardize flavor text format before creating new content |
| 2 | **DU** | The Corra Family | The faction that drives all three origins — needed before DN can land |
| 3 | **DV** | House Aridani culture | Gives Khem its personality — the NPCs, tone, and social texture |
| 4 | **DO** | Contract System (basic) | First gameplay loop — hauling and mercenary work on Khem/Kesra |

---

## Coordination

- DN (Origin Stories) is the convergence point — it needs both the world from Track A and the factions from Track B
- DN should be the last item implemented in either track
- Everything else is independent and can proceed in parallel
