# NEXT.md — Upcoming Features

## UP NEXT




### BY — Expanded Debug Overlay

**Dev tool only** (`editor.html`). Rendered per NPC ship entity, world-anchored (moves with ship).

**Toggle:** `=` key cycles through three states: none → simple → detailed → none

---

**Simple overlay (current layer — polish pass):**
- Reduce box background opacity from 0.80 → 0.30 (keep dark tint for readability, lose the heavy panel look)
- Push anchor point farther from ship: 32px right + 40px above entity screen position (was 16px/24px)
- Fix SPD stat: currently broken (shows 0/max or static current). Must read `Math.hypot(ship.vx, ship.vy)` for current and `ship.speedMax` for max. Format: `SPD: {current}/{max}` (both rounded to 1 decimal)
- All other existing stats unchanged: HP, armor arcs (F/P/S/A), BEH, ST, weapon list, velocity vector line, aim line

---

**Detailed overlay (new second layer):**
- Appended below the simple overlay content — same box, extended downward. No separate panel.
- Separator line (dim cyan, 1px) between simple and detailed sections
- Additional stats rows:
  - `ACC: {ship.acceleration}` — world-units/sec²
  - `TRN: {ship.turnRate.toFixed(3)} rad/s`
  - `THR: {ship.throttle}/{THROTTLE_LEVELS}` — current throttle index / max steps
  - `WT: --` — placeholder until weight system implemented
  - `THT: --` — placeholder until thrust system implemented
- Modifier block (if any per-ship multipliers differ from 1.0):
  - `SPD×{speedMult}`, `ACC×{accelMult}`, `TRN×{turnMult}` — only show rows where multiplier ≠ 1.0; omit entire block if all are default
- All text same size/font as simple layer; detailed rows use dim white (not cyan/amber) to visually separate them from primary stats



---

## Minor fixes / polish

- Grave-Clan Ambusher: confirm heat missile target-lock behavior when multiple enemies are present
- Universal ship slots need to be small and large variants
- Expand scavenging
- Tune damage and health of small ships
