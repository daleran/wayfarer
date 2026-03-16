import { ENTITY } from '@data/enums.js';
import {
  FACTION,
  MINIMAP_BG, MINIMAP_BORDER, MINIMAP_PLANET, MINIMAP_STATION,
  MINIMAP_ENEMY, MINIMAP_PLAYER,
  MINIMAP_LOOT, MINIMAP_DERELICT,
  AMBER, MINIMAP_INFO_TEXT,
} from '@/rendering/colors.js';
import { MINIMAP as MINIMAP_TEXT, FONT } from '@/rendering/draw.js';

const MM_MARGIN = 24;
const MM_PANEL  = 225;

export function renderMinimap(ctx, game) {
  const { player, entities, hostiles } = game;
  if (!player || !player.active) return;

  const canSeeShips    = player.capabilities.minimap_ships;

  const mapW  = game.map.mapSize.width;
  const mapH  = game.map.mapSize.height;
  const SCALE = MM_PANEL / Math.max(mapW, mapH);
  const ox    = MM_MARGIN;
  const oy    = MM_MARGIN;
  const BRKT  = 8;

  ctx.save();

  ctx.fillStyle = MINIMAP_BG;
  ctx.fillRect(ox, oy, MM_PANEL, MM_PANEL);

  ctx.strokeStyle = MINIMAP_BORDER;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(ox, oy + BRKT); ctx.lineTo(ox, oy); ctx.lineTo(ox + BRKT, oy);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ox + MM_PANEL - BRKT, oy); ctx.lineTo(ox + MM_PANEL, oy); ctx.lineTo(ox + MM_PANEL, oy + BRKT);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ox, oy + MM_PANEL - BRKT); ctx.lineTo(ox, oy + MM_PANEL); ctx.lineTo(ox + BRKT, oy + MM_PANEL);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ox + MM_PANEL - BRKT, oy + MM_PANEL); ctx.lineTo(ox + MM_PANEL, oy + MM_PANEL); ctx.lineTo(ox + MM_PANEL, oy + MM_PANEL - BRKT);
  ctx.stroke();

  ctx.beginPath();
  ctx.rect(ox, oy, MM_PANEL, MM_PANEL);
  ctx.clip();

  // Planets, stations, derelicts, loot — always visible (built-in minimap)
  {
    for (const e of entities) {
      if (!e.isPlanet || !e.active) continue;
      const mx = ox + e.x * SCALE;
      const my = oy + e.y * SCALE;
      const mr = Math.max(2, e.radius * SCALE);
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, Math.PI * 2);
      ctx.fillStyle = MINIMAP_PLANET;
      ctx.fill();
    }

    for (const e of entities) {
      if (e.entityType !== ENTITY.STATION || !e.active) continue;
      const mx    = ox + e.x * SCALE;
      const my    = oy + e.y * SCALE;
      const color = FACTION[e.faction] ?? MINIMAP_STATION;
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.9;
      ctx.fillRect(mx - 4, my - 4, 8, 8);
      ctx.strokeStyle = MINIMAP_STATION;
      ctx.lineWidth = 1;
      ctx.strokeRect(mx - 4, my - 4, 8, 8);
      ctx.globalAlpha = 1;
      ctx.font = MINIMAP_TEXT.font;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = color;
      ctx.fillText(e.name, mx + 6, my);
    }

    for (const e of entities) {
      if (!e.isDerelict || !e.active || e.salvaged) continue;
      const mx = ox + e.x * SCALE;
      const my = oy + e.y * SCALE;
      ctx.strokeStyle = MINIMAP_DERELICT;
      ctx.lineWidth = 1;
      ctx.strokeRect(mx - 1.5, my - 1.5, 3, 3);
    }

    for (const e of entities) {
      if (e.entityType !== ENTITY.LOOT || !e.active) continue;
      const mx = ox + e.x * SCALE;
      const my = oy + e.y * SCALE;
      ctx.fillStyle = MINIMAP_LOOT;
      ctx.fillRect(mx - 0.75, my - 0.75, 1.5, 1.5);
    }
  }

  if (canSeeShips) {
    const rangeSq = player.capabilities.sensor_range * player.capabilities.sensor_range;
    for (const r of hostiles) {
      if (!r.active) continue;
      const dx = r.x - player.x;
      const dy = r.y - player.y;
      if (dx * dx + dy * dy > rangeSq) continue;
      const mx = ox + r.x * SCALE;
      const my = oy + r.y * SCALE;
      ctx.fillStyle = MINIMAP_ENEMY;
      ctx.fillRect(mx - 1.5, my - 1.5, 3, 3);
    }
  }

  const px = ox + player.x * SCALE;
  const py = oy + player.y * SCALE;
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(player.rotation);
  ctx.fillStyle = MINIMAP_PLAYER;
  ctx.beginPath();
  ctx.moveTo(0, -5);
  ctx.lineTo(3.5, 4);
  ctx.lineTo(-3.5, 4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // ── Waypoint marker on minimap ────────────────────────────────────────
  const nav = game.navigation;
  if (nav?.waypoint) {
    const wmx = ox + nav.waypoint.x * SCALE;
    const wmy = oy + nav.waypoint.y * SCALE;
    ctx.fillStyle = AMBER;
    ctx.beginPath();
    ctx.moveTo(wmx - 3, wmy - 5);
    ctx.lineTo(wmx + 3, wmy - 5);
    ctx.lineTo(wmx, wmy);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();

  // ── Nav info below minimap ──────────────────────────────────────────────
  let infoY = oy + MM_PANEL + 10;
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // Current zone name
  if (nav && game.mapZones) {
    const zone = nav.currentZone(player.x, player.y, game.mapZones);
    const zoneName = zone?.name ?? 'Tyr System';
    ctx.font = `bold 12px ${FONT}`;
    ctx.fillStyle = MINIMAP_INFO_TEXT;
    ctx.fillText(zoneName, ox, infoY);
    infoY += 16;
  }

  // Waypoint destination + distance + ETA
  if (nav?.waypoint) {
    const dist = nav.distanceTo(player.x, player.y);
    const distStr = dist >= 1000 ? `${(dist / 1000).toFixed(1)}ku` : `${Math.round(dist)}u`;
    const eta = nav.etaSeconds(player.x, player.y, player.speed);
    const etaStr = eta < Infinity ? _formatEta(eta) : '';
    const wpName = nav.waypoint.name || 'Waypoint';
    ctx.font = `normal 12px ${FONT}`;
    ctx.fillStyle = AMBER;
    ctx.fillText(`\u25b6 ${wpName}  ${distStr}${etaStr ? '  ' + etaStr : ''}`, ox, infoY);
    infoY += 16;
  }

  // Map hint
  ctx.font = `normal 11px ${FONT}`;
  ctx.fillStyle = MINIMAP_INFO_TEXT;
  ctx.globalAlpha = 0.7;
  ctx.fillText('M \u2014 MAP', ox, infoY);
  ctx.globalAlpha = 1;

  ctx.restore();
}

function _formatEta(seconds) {
  if (seconds > 3600) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `ETA ${m}:${s.toString().padStart(2, '0')}`;
}
