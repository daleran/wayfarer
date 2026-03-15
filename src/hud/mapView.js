import { Station } from '@/entities/station.js';
import {
  MAP_BG, MAP_ZONE_BORDER, NAV_WAYPOINT, NAV_COURSE_LINE, NAV_FUEL_RANGE,
  FACTION, MINIMAP_PLANET, MINIMAP_STATION, MINIMAP_ENEMY, MINIMAP_PLAYER,
  MINIMAP_DERELICT, DIM_TEXT, AMBER, CYAN, RED,
} from '@/rendering/colors.js';
import { PROMPT, FONT } from '@/rendering/draw.js';

/**
 * Full-screen canvas map overlay with its own world→screen transform.
 */
export function renderMapView(ctx, game) {
  const { player, entities, camera } = game;
  if (!player) return;

  const nav = game.navigation;
  const screenW = camera.width;
  const screenH = camera.height;

  /** Convert world coords to map screen coords. */
  function worldToMap(wx, wy) {
    return {
      x: (wx - nav._mapPanX) * nav._mapZoom + screenW / 2,
      y: (wy - nav._mapPanY) * nav._mapZoom + screenH / 2,
    };
  }

  const canSeeShips    = player.capabilities.minimap_ships;

  ctx.save();

  // ── Background ──────────────────────────────────────────────────────────
  ctx.fillStyle = MAP_BG;
  ctx.fillRect(0, 0, screenW, screenH);

  // ── Zone circles ────────────────────────────────────────────────────────
  for (const zone of game.mapZones) {
    const c = worldToMap(zone.center.x, zone.center.y);
    const r = zone.radius * nav._mapZoom;
    ctx.beginPath();
    ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = MAP_ZONE_BORDER;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Zone name
    if (zone.name && r > 40) {
      ctx.font = `normal 11px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = MAP_ZONE_BORDER;
      ctx.fillText(zone.name.toUpperCase(), c.x, c.y - r - 14);
    }
  }

  // ── Planets ─────────────────────────────────────────────────────────────
  {
    for (const e of entities) {
      if (!e.isPlanet || !e.active) continue;
      const p = worldToMap(e.x, e.y);
      const r = Math.max(4, e.radius * nav._mapZoom);
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = MINIMAP_PLANET;
      ctx.globalAlpha = 0.5;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // ── Stations ──────────────────────────────────────────────────────────
    for (const e of entities) {
      if (!(e instanceof Station) || !e.active) continue;
      const p = worldToMap(e.x, e.y);
      const color = FACTION[e.faction] ?? MINIMAP_STATION;

      // Station icon — filled diamond
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.9;
      ctx.fillRect(-5, -5, 10, 10);
      ctx.strokeStyle = MINIMAP_STATION;
      ctx.lineWidth = 1;
      ctx.strokeRect(-5, -5, 10, 10);
      ctx.globalAlpha = 1;
      ctx.restore();

      // Label (hide at far zoom)
      if (nav._mapZoom > 0.02) {
        ctx.font = `normal 11px ${FONT}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = color;
        ctx.fillText(e.name, p.x + 10, p.y);
      }
    }

    // ── Derelicts ─────────────────────────────────────────────────────────
    for (const e of entities) {
      if (!e.isDerelict || !e.active || e.salvaged) continue;
      const p = worldToMap(e.x, e.y);
      ctx.strokeStyle = MINIMAP_DERELICT;
      ctx.lineWidth = 1;
      ctx.strokeRect(p.x - 3, p.y - 3, 6, 6);
    }
  }

  // ── Bounty target markers ───────────────────────────────────────────────
  for (const b of game.activeBounties) {
    if (!b.target?.active) continue;
    const p = worldToMap(b.target.x, b.target.y);
    // Pulsing red diamond
    const pulse = 0.6 + Math.sin(Date.now() * 0.006) * 0.4;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.globalAlpha = pulse;
    ctx.strokeStyle = RED;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -8); ctx.lineTo(6, 0); ctx.lineTo(0, 8); ctx.lineTo(-6, 0);
    ctx.closePath();
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // ── Hostile ships (sensor-gated) ────────────────────────────────────────
  if (canSeeShips) {
    const rangeSq = player.capabilities.sensor_range * player.capabilities.sensor_range;
    for (const s of game.ships) {
      if (!s.active || s.relation !== 'hostile') continue;
      const dx = s.x - player.x;
      const dy = s.y - player.y;
      if (dx * dx + dy * dy > rangeSq) continue;
      const p = worldToMap(s.x, s.y);
      ctx.fillStyle = MINIMAP_ENEMY;
      ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
    }
  }

  // ── Course line (dotted amber from player to waypoint) ──────────────────
  if (nav.waypoint) {
    const pp = worldToMap(player.x, player.y);
    const wp = worldToMap(nav.waypoint.x, nav.waypoint.y);
    ctx.setLineDash([6, 8]);
    ctx.strokeStyle = NAV_COURSE_LINE;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(pp.x, pp.y);
    ctx.lineTo(wp.x, wp.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }

  // ── Fuel range circle (amber dashed) ────────────────────────────────────
  const fuelRange = nav.fuelRangeRadius(
    game.fuel, game.fuelBurnRate, player.speed > 1 ? player.speed : player.speedMax * 0.5
  );
  if (fuelRange > 0) {
    const pp = worldToMap(player.x, player.y);
    const r = fuelRange * nav._mapZoom;
    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = NAV_FUEL_RANGE;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(pp.x, pp.y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // ── Waypoint marker (inverted triangle) ─────────────────────────────────
  if (nav.waypoint) {
    const wp = worldToMap(nav.waypoint.x, nav.waypoint.y);
    ctx.fillStyle = NAV_WAYPOINT;
    ctx.beginPath();
    ctx.moveTo(wp.x - 6, wp.y - 10);
    ctx.lineTo(wp.x + 6, wp.y - 10);
    ctx.lineTo(wp.x, wp.y);
    ctx.closePath();
    ctx.fill();

    // Waypoint name + distance
    if (nav.waypoint.name) {
      ctx.font = `bold 11px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = NAV_WAYPOINT;
      ctx.fillText(nav.waypoint.name, wp.x, wp.y - 13);
    }
    const dist = nav.distanceTo(player.x, player.y);
    ctx.font = `normal 10px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = AMBER;
    ctx.fillText(`${Math.round(dist)}u`, wp.x, wp.y + 3);
  }

  // ── Player marker (green triangle with heading) ─────────────────────────
  const pp = worldToMap(player.x, player.y);
  ctx.save();
  ctx.translate(pp.x, pp.y);
  ctx.rotate(player.rotation);
  ctx.fillStyle = MINIMAP_PLAYER;
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.lineTo(5, 6);
  ctx.lineTo(-5, 6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // ── Close prompt ────────────────────────────────────────────────────────
  ctx.font = PROMPT.font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = DIM_TEXT;
  ctx.fillText('M \u2014 CLOSE    LMB \u2014 SET WAYPOINT    RMB \u2014 CLEAR WAYPOINT    SCROLL \u2014 ZOOM', screenW / 2, screenH - 16);

  // ── Title ───────────────────────────────────────────────────────────────
  ctx.font = `bold 14px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = CYAN;
  ctx.fillText('SYSTEM MAP', screenW / 2, 16);

  ctx.restore();
}
