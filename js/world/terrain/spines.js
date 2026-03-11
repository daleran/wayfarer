// Arkship Spines — shattered structural beams from the Exile Fleet.
// Much larger than ships: 3000–6000 units long, 150–300 wide.
// Exported individually for zone file composition; also exported as ARKSHIP_SPINES array.

// Western approach corridor
export const SPINE_WEST_A = { x: 4200,  y: 3200, rotation: 0.35,  length: 4500, width: 220 };
export const SPINE_WEST_B = { x: 3500,  y: 6800, rotation: -0.25, length: 3800, width: 190 };

// Mid-zone (flanking trade path)
export const SPINE_MID_A = { x: 7800,  y: 2500, rotation: 0.80,  length: 5500, width: 270 };
export const SPINE_MID_B = { x: 8500,  y: 7200, rotation: -0.60, length: 4800, width: 240 };

// Deep zone (surrounding The Coil)
export const SPINE_DEEP_A = { x: 11200, y: 2000, rotation: 0.15,  length: 6000, width: 300 };
export const SPINE_DEEP_B = { x: 15000, y: 6800, rotation: 1.20,  length: 4000, width: 200 };
export const SPINE_DEEP_C = { x: 16500, y: 3500, rotation: -0.90, length: 5000, width: 250 };
export const SPINE_DEEP_D = { x: 10500, y: 8200, rotation: 2.10,  length: 3500, width: 175 };

export const ARKSHIP_SPINES = [
  SPINE_WEST_A,
  SPINE_WEST_B,
  SPINE_MID_A,
  SPINE_MID_B,
  SPINE_DEEP_A,
  SPINE_DEEP_B,
  SPINE_DEEP_C,
  SPINE_DEEP_D,
];
