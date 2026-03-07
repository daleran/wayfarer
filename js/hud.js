import { Station } from './world/station.js';
import { Planet } from './world/planet.js';

const THROTTLE_LABELS = ['Stop', 'Slow', 'Half', 'Full', 'Flank'];

const PIP_W = 36;
const PIP_H = 14;
const PIP_GAP = 6;
const PIP_BOTTOM_MARGIN = 20;
const PIP_LABEL_OFFSET = 18;

export class HUD {
  render(ctx, game) {
    const { player, camera } = game;
    if (!player) return;
    this._renderHealthBars(ctx, player);
    this._renderThrottle(ctx, player, camera);
    this._renderCredits(ctx, game);
    this._renderCargo(ctx, game);
    this._renderDockPrompt(ctx, game);
    this._renderMinimap(ctx, game);
    if (game.stationScreen) game.stationScreen.render(ctx, game);
  }

  _renderHealthBars(ctx, player) {
    const margin = 20;
    const labelW = 46;
    const barW = 120;
    const barH = 10;
    const rowGap = 8;

    ctx.save();
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    // ARMOR bar
    const armorRatio = Math.max(0, player.armorCurrent / player.armorMax);
    const armorFlash = armorRatio < 0.25 && Math.floor(Date.now() / 300) % 2 === 0;
    const armorBarX = margin + labelW;
    const armorBarY = margin;

    ctx.fillStyle = '#112233';
    ctx.fillRect(armorBarX, armorBarY, barW, barH);
    ctx.fillStyle = armorFlash ? '#f44' : '#4af';
    ctx.fillRect(armorBarX, armorBarY, barW * armorRatio, barH);
    ctx.fillStyle = '#8bf';
    ctx.fillText('ARMOR', margin, armorBarY + barH / 2);

    // HULL bar
    const hullRatio = Math.max(0, player.hullCurrent / player.hullMax);
    const hullFlash = hullRatio < 0.25 && Math.floor(Date.now() / 300) % 2 === 0;
    const hullBarX = margin + labelW;
    const hullBarY = margin + barH + rowGap;

    ctx.fillStyle = '#112233';
    ctx.fillRect(hullBarX, hullBarY, barW, barH);
    ctx.fillStyle = hullFlash ? '#f44' : '#f84';
    ctx.fillRect(hullBarX, hullBarY, barW * hullRatio, barH);
    ctx.fillStyle = '#fa8';
    ctx.fillText('HULL', margin, hullBarY + barH / 2);

    ctx.restore();
  }

  _renderCredits(ctx, game) {
    const { camera } = game;
    ctx.save();
    ctx.font = '12px monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#fd8';
    ctx.fillText(`${game.credits} cr`, camera.width - 20, 20);
    ctx.restore();
  }

  _renderCargo(ctx, game) {
    const { camera } = game;
    const used = Object.values(game.cargo).reduce((s, v) => s + v, 0);
    const cap = game.player.cargoCapacity;
    ctx.save();
    ctx.font = '12px monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillStyle = used >= cap ? '#f84' : '#8bf';
    ctx.fillText(`Cargo ${used}/${cap}`, camera.width - 20, 36);
    ctx.restore();
  }

  _renderDockPrompt(ctx, game) {
    if (!game.nearbyStation) return;
    const { camera } = game;
    ctx.save();
    ctx.font = '13px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = '#4fa';
    ctx.fillText(
      `Press E to dock at ${game.nearbyStation.name}`,
      camera.width / 2,
      camera.height - PIP_BOTTOM_MARGIN - PIP_H - PIP_LABEL_OFFSET - 24
    );
    ctx.restore();
  }

  _renderMinimap(ctx, game) {
    const { camera, player, entities, raiders } = game;
    const MAP_SIZE = 20000;
    const PANEL = 150;
    const SCALE = PANEL / MAP_SIZE;
    const MARGIN = 20;
    const ox = camera.width - MARGIN - PANEL;
    const oy = camera.height - MARGIN - PANEL;

    ctx.save();

    // Panel background + border
    ctx.fillStyle = 'rgba(0, 10, 30, 0.7)';
    ctx.fillRect(ox, oy, PANEL, PANEL);
    ctx.strokeStyle = '#246';
    ctx.lineWidth = 1;
    ctx.strokeRect(ox, oy, PANEL, PANEL);

    // Clip to panel
    ctx.beginPath();
    ctx.rect(ox, oy, PANEL, PANEL);
    ctx.clip();

    // Planets
    for (const e of entities) {
      if (!(e instanceof Planet) || !e.active) continue;
      const mx = ox + e.x * SCALE;
      const my = oy + e.y * SCALE;
      const mr = Math.max(2, e.radius * SCALE);
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, Math.PI * 2);
      ctx.fillStyle = '#888';
      ctx.fill();
    }

    // Stations
    for (const e of entities) {
      if (!(e instanceof Station) || !e.active) continue;
      const mx = ox + e.x * SCALE;
      const my = oy + e.y * SCALE;
      ctx.fillStyle = '#4af';
      ctx.fillRect(mx - 2, my - 2, 4, 4);
    }

    // Raiders
    for (const r of raiders) {
      if (!r.active) continue;
      const mx = ox + r.x * SCALE;
      const my = oy + r.y * SCALE;
      ctx.fillStyle = '#f64';
      ctx.fillRect(mx - 1.5, my - 1.5, 3, 3);
    }

    // Player crosshair
    const px = ox + player.x * SCALE;
    const py = oy + player.y * SCALE;
    ctx.strokeStyle = '#4af';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px - 4, py);
    ctx.lineTo(px + 4, py);
    ctx.moveTo(px, py - 4);
    ctx.lineTo(px, py + 4);
    ctx.stroke();

    ctx.restore();
  }

  _renderThrottle(ctx, player, camera) {
    const levels = player.throttleLevels;
    const current = player.throttleLevel;
    const totalW = levels * PIP_W + (levels - 1) * PIP_GAP;
    const startX = (camera.width - totalW) / 2;
    const pipY = camera.height - PIP_BOTTOM_MARGIN - PIP_H;

    ctx.save();
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < levels; i++) {
      const x = startX + i * (PIP_W + PIP_GAP);
      const active = i === current;

      // Pip background
      ctx.fillStyle = active ? 'rgba(68, 170, 255, 0.85)' : 'rgba(30, 60, 90, 0.6)';
      ctx.strokeStyle = active ? '#4af' : '#246';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.rect(x, pipY, PIP_W, PIP_H);
      ctx.fill();
      ctx.stroke();

      // Label
      ctx.fillStyle = active ? '#fff' : '#68a';
      ctx.fillText(THROTTLE_LABELS[i], x + PIP_W / 2, pipY + PIP_H / 2);
    }

    // Speed readout below pips
    const speed = Math.round(player.speed);
    const label = THROTTLE_LABELS[current];
    ctx.fillStyle = '#8bf';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${label}  ${speed} u/s`,
      camera.width / 2,
      pipY + PIP_H + PIP_LABEL_OFFSET
    );

    ctx.restore();
  }
}
