// Plain particle object — managed by ParticlePool, not the entity system.
import { WHITE } from '@/rendering/colors.js';

export function createParticle() {
  return {
    x: 0, y: 0,
    vx: 0, vy: 0,
    life: 0, maxLife: 1,
    r: 3,
    color: WHITE,
    active: false,
  };
}
