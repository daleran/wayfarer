import { registerData, AMMO } from './dataRegistry.js';

registerData(AMMO, {
  '8mm': {
    name: '8mm Ball',
    weight: 0.005,
    baseValue: 0.05,
  },
  '25mm-ap': {
    name: '25mm Armor Piercing',
    tag: 'AP',
    weight: 0.01,
    baseValue: 0.2,
  },
  '25mm-he': {
    name: '25mm High Explosive',
    tag: 'HE',
    weight: 0.01,
    baseValue: 0.3,
  },
  '90mm-ap': {
    name: '90mm Armor Piercing',
    tag: 'AP',
    weight: 0.5,
    baseValue: 1,
  },
  '90mm-he': {
    name: '90mm High Explosive',
    tag: 'HE',
    weight: 0.5,
    baseValue: 1.5,
  },
  rkt: {
    name: 'Dumbfire Rocket',
    tag: 'RKT',
    weight: 1,
    baseValue: 2,
  },
  wg: {
    name: 'Wire-Guided Missile',
    tag: 'WG',
    weight: 1.5,
    baseValue: 3,
    guidedType: 'wire',
    guidanceStrength: 3,
  },
  ht: {
    name: 'Heat-Seeking Missile',
    tag: 'HT',
    weight: 1.5,
    baseValue: 3,
    guidedType: 'heat',
    guidanceStrength: 2.5,
  },
  '30mm-kp': {
    name: '30mm Kinetic Penetrator',
    weight: 0.5,
    baseValue: 1.5,
  },
  '60mm-kp': {
    name: '60mm Kinetic Penetrator',
    weight: 1,
    baseValue: 3,
  },
});
