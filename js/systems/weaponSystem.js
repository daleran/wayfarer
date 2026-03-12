import { Projectile } from '../entities/projectile.js';

export class WeaponSystem {
  constructor() {}

  updateReloads(dt, player, ammo) {
    if (!player) return;
    for (const w of player.weapons) {
      if (!(w._reloadTimer > 0)) continue;
      w._reloadTimer -= dt;
      if (w._reloadTimer <= 0) {
        w._reloadTimer = 0;
        if (w.ammoType && w.magSize !== undefined) {
          const available = ammo[w.ammoType] ?? 0;
          if (available > 0) {
            const needed = w.magSize - w.ammo;
            const take = Math.min(needed, available);
            w.ammo += take;
            ammo[w.ammoType] -= take;
          }
        }
      }
    }
  }

  manualReload(player, ammo) {
    if (!player) return;
    for (const w of player.weapons) {
      if (w.ammoType === undefined || w.magSize === undefined) continue;
      if (w._reloadTimer > 0) continue;
      if (w.ammo >= w.magSize) continue;
      if ((ammo[w.ammoType] ?? 0) <= 0) continue;
      w._reloadTimer = w.reloadTime;
    }
  }

  cycleAmmoMode(weapon, ammo, hud, player) {
    const modes = weapon.ammoModes;
    if (!modes || modes.length < 2) return;
    const next = modes[(modes.indexOf(weapon.currentAmmoMode) + 1) % modes.length];
    ammo[weapon.ammoType] = (ammo[weapon.ammoType] ?? 0) + weapon.ammo;
    weapon.ammo = 0;
    weapon.currentAmmoMode = next;
    weapon._reloadTimer = weapon.reloadTime;
    hud.addPickupText('\u2192 ' + next.toUpperCase(), player.x, player.y, null);
  }

  cycleGuidanceMode(weapon, hud, player) {
    const modes = weapon.guidanceModes;
    if (!modes || modes.length < 2) return;
    weapon.guidanceMode = modes[(modes.indexOf(weapon.guidanceMode) + 1) % modes.length];
    hud.addPickupText('\u2192 ' + weapon.guidanceMode.toUpperCase(), player.x, player.y, null);
  }

  updateGuidance(entities, ships, mouseWorld) {
    const enemies = ships.filter(s => s.active && s.relation === 'hostile');
    for (const entity of entities) {
      if (!(entity instanceof Projectile) || !entity.active || !entity.isGuided) continue;
      if (entity.guidedType === 'wire') {
        if (mouseWorld) {
          entity.guidanceTargetX = mouseWorld.x;
          entity.guidanceTargetY = mouseWorld.y;
        }
      } else if (entity.guidedType === 'heat') {
        let nearest = null;
        let nearestDist = Infinity;
        for (const e of enemies) {
          const dx = e.x - entity.x;
          const dy = e.y - entity.y;
          const d = dx * dx + dy * dy;
          if (d < nearestDist) { nearestDist = d; nearest = e; }
        }
        if (nearest) {
          entity.guidanceTargetX = nearest.x;
          entity.guidanceTargetY = nearest.y;
        }
      }
    }
  }
}
