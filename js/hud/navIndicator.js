import { NAV_WAYPOINT, AMBER } from '@/rendering/colors.js';
import { FONT } from '@/rendering/draw.js';

const ORBIT_RADIUS = 200;
const CHEVRON_SIZE = 10;

/**
 * Renders an amber chevron orbiting ~200px around the player's ship,
 * pointing toward the active waypoint. Distance label follows the chevron.
 * If the waypoint entity is on-screen, an inverted triangle is drawn above it.
 */
export function renderNavIndicator(ctx, game) {
  const nav = game.navigation;
  if (!nav.waypoint || nav.mapOpen) return;

  const { player, camera } = game;
  if (!player || !player.active) return;

  const dist = nav.distanceTo(player.x, player.y);
  const wpScreen = camera.worldToScreen(nav.waypoint.x, nav.waypoint.y);
  const onScreen = wpScreen.x >= 0 && wpScreen.x <= camera.width &&
                   wpScreen.y >= 0 && wpScreen.y <= camera.height;

  const playerScreen = camera.worldToScreen(player.x, player.y);
  const bearing = nav.bearingTo(player.x, player.y);

  ctx.save();

  // On-screen waypoint marker (inverted triangle above target)
  if (onScreen) {
    ctx.fillStyle = NAV_WAYPOINT;
    ctx.beginPath();
    ctx.moveTo(wpScreen.x - 5, wpScreen.y - 28);
    ctx.lineTo(wpScreen.x + 5, wpScreen.y - 28);
    ctx.lineTo(wpScreen.x, wpScreen.y - 18);
    ctx.closePath();
    ctx.fill();

    const label = _navLabel(nav.waypoint.name, dist);
    ctx.font = `normal 10px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = AMBER;
    ctx.fillText(label, wpScreen.x, wpScreen.y - 30);
  }

  // Orbiting chevron around ship — always shown when waypoint is set
  const sin = Math.sin(bearing);
  const cos = -Math.cos(bearing);
  const cx = playerScreen.x + sin * ORBIT_RADIUS;
  const cy = playerScreen.y + cos * ORBIT_RADIUS;

  // Draw chevron pointing toward waypoint
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(bearing);
  ctx.fillStyle = NAV_WAYPOINT;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.moveTo(0, -CHEVRON_SIZE);
  ctx.lineTo(CHEVRON_SIZE * 0.6, CHEVRON_SIZE * 0.4);
  ctx.lineTo(0, CHEVRON_SIZE * 0.1);
  ctx.lineTo(-CHEVRON_SIZE * 0.6, CHEVRON_SIZE * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();

  // Distance label next to chevron
  const label = _navLabel(nav.waypoint.name, dist);
  ctx.font = `normal 11px ${FONT}`;
  ctx.fillStyle = AMBER;

  // Place label on the outward side of the chevron
  const labelDist = ORBIT_RADIUS + 18;
  const lx = playerScreen.x + sin * labelDist;
  const ly = playerScreen.y + cos * labelDist;

  // Align based on which side of screen the chevron is on
  if (Math.abs(sin) < 0.3) {
    ctx.textAlign = 'center';
    ctx.textBaseline = cos > 0 ? 'top' : 'bottom';
  } else {
    ctx.textAlign = sin > 0 ? 'left' : 'right';
    ctx.textBaseline = 'middle';
  }
  ctx.fillText(label, lx, ly);

  ctx.restore();
}

function _navLabel(name, dist) {
  const d = dist >= 1000 ? `${(dist / 1000).toFixed(1)}ku` : `${Math.round(dist)}u`;
  return name ? `${name}  ${d}` : d;
}
