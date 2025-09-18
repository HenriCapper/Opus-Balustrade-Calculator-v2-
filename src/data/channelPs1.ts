// Channel systems PS1 data extracted from legacy calculators (Smart Lock Top/Side share the same PS1),
// plus Lugano and Vista channels. Values use the same Ps1Row shape as spigots/standoffs.
// internal = 400 denotes allowed; 999 denotes disallowed. Edge distances follow legacy overhangs:
//  - balustrade: 250 mm
//  - pool: 500 mm

import type { Ps1Row } from './spigotsPs1';

const EDGE_BAL = 250;
const EDGE_POOL = 500;
const OK = 400;

// Smart Lock Top/Side Fix — shared PS1
export const SMARTLOCK_PS1: Ps1Row[] = [
  // Balustrade: 12 mm
  { system: 'balustrade', thk: 12, hmin: 1000, hmax: 1350, zone: 'L', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 12, hmin: 1000, hmax: 1350, zone: 'M', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 12, hmin: 1000, hmax: 1350, zone: 'H', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 12, hmin: 1000, hmax: 1200, zone: 'VH', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 12, hmin: 1000, hmax: 1100, zone: 'EH', internal: OK, edge: EDGE_BAL },
  // Balustrade: 13.52 mm (same as 12 except VH up to 1250)
  { system: 'balustrade', thk: 13.52, hmin: 1000, hmax: 1350, zone: 'L', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 13.52, hmin: 1000, hmax: 1350, zone: 'M', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 13.52, hmin: 1000, hmax: 1350, zone: 'H', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 13.52, hmin: 1000, hmax: 1250, zone: 'VH', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 13.52, hmin: 1000, hmax: 1100, zone: 'EH', internal: OK, edge: EDGE_BAL },
  // Balustrade: 15 mm
  { system: 'balustrade', thk: 15, hmin: 1000, hmax: 1600, zone: 'L', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 15, hmin: 1000, hmax: 1600, zone: 'M', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 15, hmin: 1000, hmax: 1600, zone: 'H', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 15, hmin: 1000, hmax: 1400, zone: 'VH', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 15, hmin: 1150, hmax: 1300, zone: 'EH', internal: OK, edge: EDGE_BAL },
  // Balustrade: 17.52 mm (same as 15)
  { system: 'balustrade', thk: 17.52, hmin: 1000, hmax: 1600, zone: 'L', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 17.52, hmin: 1000, hmax: 1600, zone: 'M', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 17.52, hmin: 1000, hmax: 1600, zone: 'H', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 17.52, hmin: 1000, hmax: 1400, zone: 'VH', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 17.52, hmin: 1150, hmax: 1300, zone: 'EH', internal: OK, edge: EDGE_BAL },
  // Pool: 12 mm (EH not permitted)
  { system: 'pool', thk: 12, hmin: 1200, hmax: 1250, zone: 'L', internal: OK, edge: EDGE_POOL },
  { system: 'pool', thk: 12, hmin: 1200, hmax: 1250, zone: 'M', internal: OK, edge: EDGE_POOL },
  { system: 'pool', thk: 12, hmin: 1200, hmax: 1250, zone: 'H', internal: OK, edge: EDGE_POOL },
  { system: 'pool', thk: 12, hmin: 1200, hmax: 1250, zone: 'VH', internal: OK, edge: EDGE_POOL },
  // No EH row for 12 mm pool (disallowed)
  // Pool: 15 mm
  { system: 'pool', thk: 15, hmin: 1200, hmax: 1250, zone: 'L', internal: OK, edge: EDGE_POOL },
  { system: 'pool', thk: 15, hmin: 1200, hmax: 1250, zone: 'M', internal: OK, edge: EDGE_POOL },
  { system: 'pool', thk: 15, hmin: 1200, hmax: 1250, zone: 'H', internal: OK, edge: EDGE_POOL },
  { system: 'pool', thk: 15, hmin: 1200, hmax: 1250, zone: 'VH', internal: OK, edge: EDGE_POOL },
  { system: 'pool', thk: 15, hmin: 1200, hmax: 1250, zone: 'EH', internal: OK, edge: EDGE_POOL },
];

// Lugano channel
export const LUGANO_PS1: Ps1Row[] = [
  // Balustrade: all thicknesses allowed up to 1100 mm in all zones
  { system: 'balustrade', thk: 12, hmin: 1000, hmax: 1100, zone: 'L', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 12, hmin: 1000, hmax: 1100, zone: 'M', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 12, hmin: 1000, hmax: 1100, zone: 'H', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 12, hmin: 1000, hmax: 1100, zone: 'VH', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 12, hmin: 1000, hmax: 1100, zone: 'EH', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 13.52, hmin: 1000, hmax: 1100, zone: 'L', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 13.52, hmin: 1000, hmax: 1100, zone: 'M', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 13.52, hmin: 1000, hmax: 1100, zone: 'H', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 13.52, hmin: 1000, hmax: 1100, zone: 'VH', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 13.52, hmin: 1000, hmax: 1100, zone: 'EH', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 15, hmin: 1000, hmax: 1100, zone: 'L', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 15, hmin: 1000, hmax: 1100, zone: 'M', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 15, hmin: 1000, hmax: 1100, zone: 'H', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 15, hmin: 1000, hmax: 1100, zone: 'VH', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 15, hmin: 1000, hmax: 1100, zone: 'EH', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 17.52, hmin: 1000, hmax: 1100, zone: 'L', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 17.52, hmin: 1000, hmax: 1100, zone: 'M', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 17.52, hmin: 1000, hmax: 1100, zone: 'H', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 17.52, hmin: 1000, hmax: 1100, zone: 'VH', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 17.52, hmin: 1000, hmax: 1100, zone: 'EH', internal: OK, edge: EDGE_BAL },
  // Pool limits (12/15/17.52) — L: 1200–1300, M/H: 1200–1250, VH/EH: 1200
  { system: 'pool', thk: 12, hmin: 1200, hmax: 1300, zone: 'L', internal: OK, edge: EDGE_POOL },
  { system: 'pool', thk: 12, hmin: 1200, hmax: 1250, zone: 'M', internal: OK, edge: EDGE_POOL },
  { system: 'pool', thk: 12, hmin: 1200, hmax: 1250, zone: 'H', internal: OK, edge: EDGE_POOL },
  { system: 'pool', thk: 12, hmin: 1200, hmax: 1200, zone: 'VH', internal: OK, edge: EDGE_POOL },
  { system: 'pool', thk: 12, hmin: 1200, hmax: 1200, zone: 'EH', internal: OK, edge: EDGE_POOL },
  { system: 'pool', thk: 15, hmin: 1200, hmax: 1300, zone: 'L', internal: OK, edge: EDGE_POOL },
  { system: 'pool', thk: 15, hmin: 1200, hmax: 1250, zone: 'M', internal: OK, edge: EDGE_POOL },
  { system: 'pool', thk: 15, hmin: 1200, hmax: 1250, zone: 'H', internal: OK, edge: EDGE_POOL },
  { system: 'pool', thk: 15, hmin: 1200, hmax: 1200, zone: 'VH', internal: OK, edge: EDGE_POOL },
  { system: 'pool', thk: 15, hmin: 1200, hmax: 1200, zone: 'EH', internal: OK, edge: EDGE_POOL },
  { system: 'pool', thk: 17.52, hmin: 1200, hmax: 1300, zone: 'L', internal: OK, edge: EDGE_POOL },
  { system: 'pool', thk: 17.52, hmin: 1200, hmax: 1250, zone: 'M', internal: OK, edge: EDGE_POOL },
  { system: 'pool', thk: 17.52, hmin: 1200, hmax: 1250, zone: 'H', internal: OK, edge: EDGE_POOL },
  { system: 'pool', thk: 17.52, hmin: 1200, hmax: 1200, zone: 'VH', internal: OK, edge: EDGE_POOL },
  { system: 'pool', thk: 17.52, hmin: 1200, hmax: 1200, zone: 'EH', internal: OK, edge: EDGE_POOL },
];

// Vista channel — from dedicated override in legacy calculator
export const VISTA_PS1: Ps1Row[] = [
  // Balustrade 12 mm: L/M 1000–1250, H 1000–1150, VH/EH 1000–1100
  { system: 'balustrade', thk: 12, hmin: 1000, hmax: 1250, zone: 'L', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 12, hmin: 1000, hmax: 1250, zone: 'M', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 12, hmin: 1000, hmax: 1150, zone: 'H', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 12, hmin: 1000, hmax: 1100, zone: 'VH', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 12, hmin: 1000, hmax: 1100, zone: 'EH', internal: OK, edge: EDGE_BAL },
  // Balustrade 13.52 mm: L/M/H 1000–1300, VH 1000–1250, EH 1000–1100
  { system: 'balustrade', thk: 13.52, hmin: 1000, hmax: 1300, zone: 'L', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 13.52, hmin: 1000, hmax: 1300, zone: 'M', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 13.52, hmin: 1000, hmax: 1300, zone: 'H', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 13.52, hmin: 1000, hmax: 1250, zone: 'VH', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 13.52, hmin: 1000, hmax: 1100, zone: 'EH', internal: OK, edge: EDGE_BAL },
  // Balustrade 15/17.52 mm: L/M/H/VH 1000–1400, EH 1150–1300
  { system: 'balustrade', thk: 15, hmin: 1000, hmax: 1400, zone: 'L', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 15, hmin: 1000, hmax: 1400, zone: 'M', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 15, hmin: 1000, hmax: 1400, zone: 'H', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 15, hmin: 1000, hmax: 1400, zone: 'VH', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 15, hmin: 1150, hmax: 1300, zone: 'EH', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 17.52, hmin: 1000, hmax: 1400, zone: 'L', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 17.52, hmin: 1000, hmax: 1400, zone: 'M', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 17.52, hmin: 1000, hmax: 1400, zone: 'H', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 17.52, hmin: 1000, hmax: 1400, zone: 'VH', internal: OK, edge: EDGE_BAL },
  { system: 'balustrade', thk: 17.52, hmin: 1150, hmax: 1300, zone: 'EH', internal: OK, edge: EDGE_BAL },
  // Pool 12 mm: L/M 1200–1350; H 1200–1250; VH 1200; EH not permitted
  { system: 'pool', thk: 12, hmin: 1200, hmax: 1350, zone: 'L', internal: OK, edge: EDGE_POOL },
  { system: 'pool', thk: 12, hmin: 1200, hmax: 1350, zone: 'M', internal: OK, edge: EDGE_POOL },
  { system: 'pool', thk: 12, hmin: 1200, hmax: 1250, zone: 'H', internal: OK, edge: EDGE_POOL },
  { system: 'pool', thk: 12, hmin: 1200, hmax: 1200, zone: 'VH', internal: OK, edge: EDGE_POOL },
  // 12 mm EH: none
  // Pool 15 mm: L/M 1200–1500; H 1200–1400; VH/EH 1200–1300
  { system: 'pool', thk: 15, hmin: 1200, hmax: 1500, zone: 'L', internal: OK, edge: EDGE_POOL },
  { system: 'pool', thk: 15, hmin: 1200, hmax: 1500, zone: 'M', internal: OK, edge: EDGE_POOL },
  { system: 'pool', thk: 15, hmin: 1200, hmax: 1400, zone: 'H', internal: OK, edge: EDGE_POOL },
  { system: 'pool', thk: 15, hmin: 1200, hmax: 1300, zone: 'VH', internal: OK, edge: EDGE_POOL },
  { system: 'pool', thk: 15, hmin: 1200, hmax: 1300, zone: 'EH', internal: OK, edge: EDGE_POOL },
];

function genericLookup(rows: Ps1Row[], system: string, thk: string | number, ht: string | number, zone: string) {
  const t = parseFloat(String(thk));
  const h = parseFloat(String(ht));
  const z = String(zone || '').toUpperCase();
  const matches = rows.filter(r => r.system === system && Math.abs(r.thk - t) < 0.01 && r.zone === z && h >= r.hmin && h <= r.hmax);
  // For channel PS1, we do NOT fallback across height bands: if no explicit row allows it, it's disallowed.
  return matches.length ? matches[0] : null;
}

export function lookupChannelPs1(calcKey: string | null, fenceType: string | undefined, thk: string | undefined, ht: number | undefined, zone: string | undefined) {
  if (!calcKey || !fenceType || !thk || !ht || !zone) return null;
  const system = fenceType.toLowerCase().includes('pool') ? 'pool' : 'balustrade';
  if (calcKey === 'smartlock_top' || calcKey === 'smartlock_side') return genericLookup(SMARTLOCK_PS1, system, thk, ht, zone);
  if (calcKey === 'lugano') return genericLookup(LUGANO_PS1, system, thk, ht, zone);
  if (calcKey === 'vista') return genericLookup(VISTA_PS1, system, thk, ht, zone);
  return null;
}
