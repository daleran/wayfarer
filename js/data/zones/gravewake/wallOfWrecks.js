// Wall of Wrecks — diagonal debris belt creating 2 trade lane chokepoints.
// Belt runs NW→SE across the mid-zone.

import { createDebrisCloud } from '@/world/debrisCloud.js';

const CLUSTERS = [
  { x: 5200,  y: 2800, spreadRadius: 700, fragmentCount: 45 },
  { x: 5700,  y: 3250, spreadRadius: 750, fragmentCount: 50 },
  { x: 6200,  y: 3700, spreadRadius: 680, fragmentCount: 42 },
  { x: 6700,  y: 4150, spreadRadius: 720, fragmentCount: 48 },
  { x: 7200,  y: 4600, spreadRadius: 690, fragmentCount: 44 },
  // gap (first trade lane)
  { x: 8200,  y: 5500, spreadRadius: 740, fragmentCount: 47 },
  { x: 8700,  y: 5950, spreadRadius: 710, fragmentCount: 46 },
  { x: 9200,  y: 6400, spreadRadius: 760, fragmentCount: 50 },
  { x: 9700,  y: 6850, spreadRadius: 700, fragmentCount: 44 },
  { x: 10200, y: 7300, spreadRadius: 730, fragmentCount: 48 },
  { x: 10700, y: 7750, spreadRadius: 750, fragmentCount: 46 },
  // gap (second trade lane)
  { x: 11700, y: 8650, spreadRadius: 720, fragmentCount: 45 },
  { x: 12200, y: 9100, spreadRadius: 700, fragmentCount: 42 },
];

export const WallOfWrecks = {
  instantiate() {
    return CLUSTERS.map(d => createDebrisCloud(d));
  },
};
