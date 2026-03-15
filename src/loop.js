const TICK_DURATION = 1000 / 60; // ms per tick (~16.67ms)
const MAX_CATCHUP_TICKS = 5;     // prevent spiral of death

export function startLoop(game) {
  let lastTimestamp = null;
  let accumulator = 0;
  const dt = TICK_DURATION / 1000; // seconds per tick

  function gameLoop(timestamp) {
    if (lastTimestamp === null) lastTimestamp = timestamp;

    const elapsed = timestamp - lastTimestamp;
    lastTimestamp = timestamp;
    accumulator += elapsed;

    // Cap catchup to avoid spiral of death after tab focus restore
    const maxAccum = TICK_DURATION * MAX_CATCHUP_TICKS;
    if (accumulator > maxAccum) accumulator = maxAccum;

    let ticks = 0;
    while (accumulator >= TICK_DURATION && ticks < MAX_CATCHUP_TICKS) {
      game.update(dt);
      accumulator -= TICK_DURATION;
      ticks++;
    }

    game.render();

    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);
}
