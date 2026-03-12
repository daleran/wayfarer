import { Station } from '../world/station.js';
import { Planet } from '../world/planet.js';
import { LootDrop } from '../entities/lootDrop.js';
import { Derelict } from '../world/derelict.js';
import {
  FACTION,
  MINIMAP_BG, MINIMAP_BORDER, MINIMAP_PLANET, MINIMAP_STATION,
  MINIMAP_ENEMY, MINIMAP_PLAYER,
  MINIMAP_LOOT, MINIMAP_DERELICT,
} from '../ui/colors.js';

const MM_MARGIN = 24;
const MM_PANEL  = 225;

export function renderMinimap(ctx, game) {
  const { camera, player, entities, hostiles } = game;
  if (!player.active) return;

  const canSeeStations = player.capabilities.minimap_stations;
  const canSeeShips    = player.capabilities.minimap_ships;
  if (!canSeeStations && !canSeeShips) return;

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

  if (canSeeStations) {
    for (const e of entities) {
      if (!(e instanceof Planet) || !e.active) continue;
      const mx = ox + e.x * SCALE;
      const my = oy + e.y * SCALE;
      const mr = Math.max(2, e.radius * SCALE);
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, Math.PI * 2);
      ctx.fillStyle = MINIMAP_PLANET;
      ctx.fill();
    }

    for (const e of entities) {
      if (!(e instanceof Station) || !e.active) continue;
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
      ctx.font = '8px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = color;
      ctx.fillText(e.name, mx + 6, my);
    }

    for (const e of entities) {
      if (!(e instanceof Derelict) || !e.active || e.salvaged) continue;
      const mx = ox + e.x * SCALE;
      const my = oy + e.y * SCALE;
      ctx.strokeStyle = MINIMAP_DERELICT;
      ctx.lineWidth = 1;
      ctx.strokeRect(mx - 1.5, my - 1.5, 3, 3);
    }

    for (const e of entities) {
      if (!(e instanceof LootDrop) || !e.active) continue;
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

  ctx.restore();
}
