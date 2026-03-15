// NavigationSystem — waypoint, map view state, zone awareness, fuel range

export class NavigationSystem {
  constructor() {
    // Waypoint
    this.waypoint = null; // { x, y, name, entity }

    // Map view state
    this.mapOpen = false;
    this._mapZoom = 0.06;  // world→screen scale for map view
    this._mapPanX = 0;     // world-space pan offset
    this._mapPanY = 0;
    this._isDragging = false;
    this._dragStartX = 0;
    this._dragStartY = 0;
    this._dragPanStartX = 0;
    this._dragPanStartY = 0;
  }

  setWaypoint(x, y, name = '', entity = null) {
    this.waypoint = { x, y, name, entity };
  }

  clearWaypoint() {
    this.waypoint = null;
  }

  distanceTo(fromX, fromY) {
    if (!this.waypoint) return Infinity;
    const dx = this.waypoint.x - fromX;
    const dy = this.waypoint.y - fromY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  bearingTo(fromX, fromY) {
    if (!this.waypoint) return 0;
    return Math.atan2(this.waypoint.x - fromX, -(this.waypoint.y - fromY));
  }

  etaSeconds(fromX, fromY, speed) {
    if (!this.waypoint || speed < 1) return Infinity;
    return this.distanceTo(fromX, fromY) / speed;
  }

  toggleMap(game) {
    if (this.mapOpen) {
      this.closeMap();
    } else {
      this.openMap(game);
    }
  }

  openMap(game) {
    this.mapOpen = true;
    // Center on player
    if (game.player) {
      this._mapPanX = game.player.x;
      this._mapPanY = game.player.y;
    }
    // Fit map to screen with some padding
    const mapW = game.map.mapSize.width;
    const mapH = game.map.mapSize.height;
    const screenW = game.canvas.width;
    const screenH = game.canvas.height;
    this._mapZoom = Math.min(screenW / mapW, screenH / mapH) * 0.85;
  }

  closeMap() {
    this.mapOpen = false;
    this._isDragging = false;
  }

  /**
   * Returns maximum travel distance in world units given current fuel/burn/speed.
   */
  fuelRangeRadius(fuel, fuelBurnRate, speed) {
    if (fuelBurnRate <= 0 || speed < 1) return 0;
    const timeRemaining = fuel / fuelBurnRate;
    return timeRemaining * speed;
  }

  /**
   * Returns the innermost zone the player is inside, or null.
   */
  currentZone(playerX, playerY, zones) {
    let best = null;
    let bestRadius = Infinity;
    for (const zone of zones) {
      const dx = playerX - zone.center.x;
      const dy = playerY - zone.center.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= zone.radius && zone.radius < bestRadius) {
        best = zone;
        bestRadius = zone.radius;
      }
    }
    return best;
  }
}
