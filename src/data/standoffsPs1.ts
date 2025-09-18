// PS1 data extracted from legacy SD50, PF150, SD100 and Pradis calculators.
// Do not modify values manually; the legacy HTML files are the source of truth.

import type { Ps1Row } from './spigotsPs1';

// Shared helper for height-band lookup with nearest-height fallback
function genericLookup(rows: Ps1Row[], system: string, thk: string | number, ht: string | number, zone: string) {
  const t = parseFloat(String(thk));
  const h = parseFloat(String(ht));
  const z = String(zone || '').toUpperCase();
  let matches = rows.filter(r => r.system === system && Math.abs(r.thk - t) < 0.01 && r.zone === z && h >= r.hmin && h <= r.hmax);
  if (matches.length) return matches[0];
  matches = rows.filter(r => r.system === system && Math.abs(r.thk - t) < 0.01 && r.zone === z);
  if (!matches.length) return null;
  matches.sort((a,b)=> Math.abs(((a.hmin+a.hmax)/2)-h) - Math.abs(((b.hmin+b.hmax)/2)-h));
  return matches[0];
}

// SD50 PS1 (balustrade + pool from legacy). Edge spacing defaults to 200mm per blanket rule.
export const SD50_PS1: Ps1Row[] = [
  // Balustrade 12
  { system: 'balustrade', thk: 12.0, hmin: 950, hmax: 950, zone: 'L', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 12.0, hmin: 950, hmax: 950, zone: 'M', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 12.0, hmin: 950, hmax: 950, zone: 'H', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 12.0, hmin: 950, hmax: 950, zone: 'VH', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 12.0, hmin: 950, hmax: 950, zone: 'EH', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 12.0, hmin: 1000, hmax: 1000, zone: 'L', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 12.0, hmin: 1000, hmax: 1000, zone: 'M', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 12.0, hmin: 1000, hmax: 1000, zone: 'H', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 12.0, hmin: 1000, hmax: 1000, zone: 'VH', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 12.0, hmin: 1000, hmax: 1000, zone: 'EH', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 12.0, hmin: 1050, hmax: 1150, zone: 'L', internal: 400, edge: 200 },
  { system: 'balustrade', thk: 12.0, hmin: 1050, hmax: 1150, zone: 'M', internal: 400, edge: 200 },
  { system: 'balustrade', thk: 12.0, hmin: 1050, hmax: 1150, zone: 'H', internal: 400, edge: 200 },
  { system: 'balustrade', thk: 12.0, hmin: 1050, hmax: 1150, zone: 'VH', internal: 400, edge: 200 },
  { system: 'balustrade', thk: 12.0, hmin: 1050, hmax: 1150, zone: 'EH', internal: 400, edge: 200 },
  // Balustrade 13.52
  { system: 'balustrade', thk: 13.52, hmin: 950, hmax: 950, zone: 'L', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 13.52, hmin: 950, hmax: 950, zone: 'M', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 13.52, hmin: 950, hmax: 950, zone: 'H', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 13.52, hmin: 950, hmax: 950, zone: 'VH', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 13.52, hmin: 950, hmax: 950, zone: 'EH', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 13.52, hmin: 1000, hmax: 1000, zone: 'L', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 13.52, hmin: 1000, hmax: 1000, zone: 'M', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 13.52, hmin: 1000, hmax: 1000, zone: 'H', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 13.52, hmin: 1000, hmax: 1000, zone: 'VH', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 13.52, hmin: 1000, hmax: 1000, zone: 'EH', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 13.52, hmin: 1050, hmax: 1150, zone: 'L', internal: 400, edge: 200 },
  { system: 'balustrade', thk: 13.52, hmin: 1050, hmax: 1150, zone: 'M', internal: 400, edge: 200 },
  { system: 'balustrade', thk: 13.52, hmin: 1050, hmax: 1150, zone: 'H', internal: 400, edge: 200 },
  { system: 'balustrade', thk: 13.52, hmin: 1050, hmax: 1150, zone: 'VH', internal: 400, edge: 200 },
  { system: 'balustrade', thk: 13.52, hmin: 1050, hmax: 1150, zone: 'EH', internal: 400, edge: 200 },
  // Balustrade 15
  { system: 'balustrade', thk: 15.0, hmin: 950, hmax: 950, zone: 'L', internal: 475, edge: 200 },
  { system: 'balustrade', thk: 15.0, hmin: 950, hmax: 950, zone: 'M', internal: 475, edge: 200 },
  { system: 'balustrade', thk: 15.0, hmin: 950, hmax: 950, zone: 'H', internal: 475, edge: 200 },
  { system: 'balustrade', thk: 15.0, hmin: 950, hmax: 950, zone: 'VH', internal: 475, edge: 200 },
  { system: 'balustrade', thk: 15.0, hmin: 950, hmax: 950, zone: 'EH', internal: 475, edge: 200 },
  { system: 'balustrade', thk: 15.0, hmin: 1000, hmax: 1050, zone: 'L', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 15.0, hmin: 1000, hmax: 1050, zone: 'M', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 15.0, hmin: 1000, hmax: 1050, zone: 'H', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 15.0, hmin: 1000, hmax: 1050, zone: 'VH', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 15.0, hmin: 1000, hmax: 1050, zone: 'EH', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 15.0, hmin: 1100, hmax: 1250, zone: 'L', internal: 400, edge: 200 },
  { system: 'balustrade', thk: 15.0, hmin: 1100, hmax: 1250, zone: 'M', internal: 400, edge: 200 },
  { system: 'balustrade', thk: 15.0, hmin: 1100, hmax: 1250, zone: 'H', internal: 400, edge: 200 },
  { system: 'balustrade', thk: 15.0, hmin: 1100, hmax: 1250, zone: 'VH', internal: 400, edge: 200 },
  { system: 'balustrade', thk: 15.0, hmin: 1100, hmax: 1250, zone: 'EH', internal: 400, edge: 200 },
  // Balustrade 17.52
  { system: 'balustrade', thk: 17.52, hmin: 950, hmax: 950, zone: 'L', internal: 475, edge: 200 },
  { system: 'balustrade', thk: 17.52, hmin: 950, hmax: 950, zone: 'M', internal: 475, edge: 200 },
  { system: 'balustrade', thk: 17.52, hmin: 950, hmax: 950, zone: 'H', internal: 475, edge: 200 },
  { system: 'balustrade', thk: 17.52, hmin: 950, hmax: 950, zone: 'VH', internal: 475, edge: 200 },
  { system: 'balustrade', thk: 17.52, hmin: 950, hmax: 950, zone: 'EH', internal: 475, edge: 200 },
  { system: 'balustrade', thk: 17.52, hmin: 1000, hmax: 1050, zone: 'L', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 17.52, hmin: 1000, hmax: 1050, zone: 'M', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 17.52, hmin: 1000, hmax: 1050, zone: 'H', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 17.52, hmin: 1000, hmax: 1050, zone: 'VH', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 17.52, hmin: 1000, hmax: 1050, zone: 'EH', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 17.52, hmin: 1100, hmax: 1250, zone: 'L', internal: 400, edge: 200 },
  { system: 'balustrade', thk: 17.52, hmin: 1100, hmax: 1250, zone: 'M', internal: 400, edge: 200 },
  { system: 'balustrade', thk: 17.52, hmin: 1100, hmax: 1250, zone: 'H', internal: 400, edge: 200 },
  { system: 'balustrade', thk: 17.52, hmin: 1100, hmax: 1250, zone: 'VH', internal: 400, edge: 200 },
  { system: 'balustrade', thk: 17.52, hmin: 1100, hmax: 1250, zone: 'EH', internal: 400, edge: 200 },
  // Pool
  { system: 'pool', thk: 12.0, hmin: 1200, hmax: 1250, zone: 'L', internal: 400, edge: 200 },
  { system: 'pool', thk: 12.0, hmin: 1200, hmax: 1250, zone: 'M', internal: 400, edge: 200 },
  { system: 'pool', thk: 12.0, hmin: 1200, hmax: 1250, zone: 'H', internal: 400, edge: 200 },
  { system: 'pool', thk: 12.0, hmin: 1200, hmax: 1250, zone: 'VH', internal: 999, edge: 200 },
  { system: 'pool', thk: 12.0, hmin: 1200, hmax: 1250, zone: 'EH', internal: 999, edge: 200 },
  { system: 'pool', thk: 15.0, hmin: 1200, hmax: 1250, zone: 'L', internal: 400, edge: 200 },
  { system: 'pool', thk: 15.0, hmin: 1200, hmax: 1250, zone: 'M', internal: 400, edge: 200 },
  { system: 'pool', thk: 15.0, hmin: 1200, hmax: 1250, zone: 'H', internal: 400, edge: 200 },
  { system: 'pool', thk: 15.0, hmin: 1200, hmax: 1250, zone: 'VH', internal: 400, edge: 200 },
  { system: 'pool', thk: 15.0, hmin: 1200, hmax: 1250, zone: 'EH', internal: 999, edge: 200 },
  { system: 'pool', thk: 17.52, hmin: 1200, hmax: 1250, zone: 'L', internal: 400, edge: 200 },
  { system: 'pool', thk: 17.52, hmin: 1200, hmax: 1250, zone: 'M', internal: 400, edge: 200 },
  { system: 'pool', thk: 17.52, hmin: 1200, hmax: 1250, zone: 'H', internal: 400, edge: 200 },
  { system: 'pool', thk: 17.52, hmin: 1200, hmax: 1250, zone: 'VH', internal: 400, edge: 200 },
  { system: 'pool', thk: 17.52, hmin: 1200, hmax: 1250, zone: 'EH', internal: 400, edge: 200 },
];

// PF150 PS1 (balustrade + pool). Edge spacing = 200mm by rule, pool spacing 400 where valid.
export const PF150_PS1: Ps1Row[] = [
  // Balustrade 12, 1000–1150
  { system: 'balustrade', thk: 12.0, hmin: 1000, hmax: 1150, zone: 'L', internal: 500, edge: 200 },
  { system: 'balustrade', thk: 12.0, hmin: 1000, hmax: 1150, zone: 'M', internal: 450, edge: 200 },
  { system: 'balustrade', thk: 12.0, hmin: 1000, hmax: 1150, zone: 'H', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 12.0, hmin: 1000, hmax: 1150, zone: 'VH', internal: 400, edge: 200 },
  { system: 'balustrade', thk: 12.0, hmin: 1000, hmax: 1150, zone: 'EH', internal: 400, edge: 200 },
  // Balustrade 13.52, 1000–1150
  { system: 'balustrade', thk: 13.52, hmin: 1000, hmax: 1150, zone: 'L', internal: 500, edge: 200 },
  { system: 'balustrade', thk: 13.52, hmin: 1000, hmax: 1150, zone: 'M', internal: 450, edge: 200 },
  { system: 'balustrade', thk: 13.52, hmin: 1000, hmax: 1150, zone: 'H', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 13.52, hmin: 1000, hmax: 1150, zone: 'VH', internal: 400, edge: 200 },
  { system: 'balustrade', thk: 13.52, hmin: 1000, hmax: 1150, zone: 'EH', internal: 400, edge: 200 },
  // Balustrade 15, 1000–1250
  { system: 'balustrade', thk: 15.0, hmin: 1000, hmax: 1250, zone: 'L', internal: 500, edge: 200 },
  { system: 'balustrade', thk: 15.0, hmin: 1000, hmax: 1250, zone: 'M', internal: 450, edge: 200 },
  { system: 'balustrade', thk: 15.0, hmin: 1000, hmax: 1250, zone: 'H', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 15.0, hmin: 1000, hmax: 1250, zone: 'VH', internal: 400, edge: 200 },
  { system: 'balustrade', thk: 15.0, hmin: 1000, hmax: 1250, zone: 'EH', internal: 400, edge: 200 },
  // Balustrade 17.52, 1000–1250
  { system: 'balustrade', thk: 17.52, hmin: 1000, hmax: 1250, zone: 'L', internal: 500, edge: 200 },
  { system: 'balustrade', thk: 17.52, hmin: 1000, hmax: 1250, zone: 'M', internal: 450, edge: 200 },
  { system: 'balustrade', thk: 17.52, hmin: 1000, hmax: 1250, zone: 'H', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 17.52, hmin: 1000, hmax: 1250, zone: 'VH', internal: 400, edge: 200 },
  { system: 'balustrade', thk: 17.52, hmin: 1000, hmax: 1250, zone: 'EH', internal: 400, edge: 200 },
  // Pool 12, 1200–1250 (L/M/H only)
  { system: 'pool', thk: 12.0, hmin: 1200, hmax: 1250, zone: 'L', internal: 400, edge: 200 },
  { system: 'pool', thk: 12.0, hmin: 1200, hmax: 1250, zone: 'M', internal: 400, edge: 200 },
  { system: 'pool', thk: 12.0, hmin: 1200, hmax: 1250, zone: 'H', internal: 400, edge: 200 },
  { system: 'pool', thk: 12.0, hmin: 1200, hmax: 1250, zone: 'VH', internal: 999, edge: 200 },
  { system: 'pool', thk: 12.0, hmin: 1200, hmax: 1250, zone: 'EH', internal: 999, edge: 200 },
  // Pool 15, 1200–1250 (up to VH)
  { system: 'pool', thk: 15.0, hmin: 1200, hmax: 1250, zone: 'L', internal: 400, edge: 200 },
  { system: 'pool', thk: 15.0, hmin: 1200, hmax: 1250, zone: 'M', internal: 400, edge: 200 },
  { system: 'pool', thk: 15.0, hmin: 1200, hmax: 1250, zone: 'H', internal: 400, edge: 200 },
  { system: 'pool', thk: 15.0, hmin: 1200, hmax: 1250, zone: 'VH', internal: 400, edge: 200 },
  { system: 'pool', thk: 15.0, hmin: 1200, hmax: 1250, zone: 'EH', internal: 999, edge: 200 },
  // Pool 17.52, 1200–1250 (up to EH)
  { system: 'pool', thk: 17.52, hmin: 1200, hmax: 1250, zone: 'L', internal: 400, edge: 200 },
  { system: 'pool', thk: 17.52, hmin: 1200, hmax: 1250, zone: 'M', internal: 400, edge: 200 },
  { system: 'pool', thk: 17.52, hmin: 1200, hmax: 1250, zone: 'H', internal: 400, edge: 200 },
  { system: 'pool', thk: 17.52, hmin: 1200, hmax: 1250, zone: 'VH', internal: 400, edge: 200 },
  { system: 'pool', thk: 17.52, hmin: 1200, hmax: 1250, zone: 'EH', internal: 400, edge: 200 },
];

// SD100 PS1 (balustrade + pool). Edge spacing = 200mm by rule.
export const SD100_PS1: Ps1Row[] = [
  // Balustrade 12, 1000–1150
  { system: 'balustrade', thk: 12.0, hmin: 1000, hmax: 1000, zone: 'L', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 12.0, hmin: 1000, hmax: 1000, zone: 'M', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 12.0, hmin: 1000, hmax: 1000, zone: 'H', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 12.0, hmin: 1000, hmax: 1000, zone: 'VH', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 12.0, hmin: 1000, hmax: 1000, zone: 'EH', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 12.0, hmin: 1050, hmax: 1150, zone: 'L', internal: 400, edge: 200 },
  { system: 'balustrade', thk: 12.0, hmin: 1050, hmax: 1150, zone: 'M', internal: 400, edge: 200 },
  { system: 'balustrade', thk: 12.0, hmin: 1050, hmax: 1150, zone: 'H', internal: 400, edge: 200 },
  { system: 'balustrade', thk: 12.0, hmin: 1050, hmax: 1150, zone: 'VH', internal: 400, edge: 200 },
  { system: 'balustrade', thk: 12.0, hmin: 1050, hmax: 1150, zone: 'EH', internal: 400, edge: 200 },
  // Balustrade 13.52, 1000–1150
  { system: 'balustrade', thk: 13.52, hmin: 1000, hmax: 1000, zone: 'L', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 13.52, hmin: 1000, hmax: 1000, zone: 'M', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 13.52, hmin: 1000, hmax: 1000, zone: 'H', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 13.52, hmin: 1000, hmax: 1000, zone: 'VH', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 13.52, hmin: 1000, hmax: 1000, zone: 'EH', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 13.52, hmin: 1050, hmax: 1150, zone: 'L', internal: 400, edge: 200 },
  { system: 'balustrade', thk: 13.52, hmin: 1050, hmax: 1150, zone: 'M', internal: 400, edge: 200 },
  { system: 'balustrade', thk: 13.52, hmin: 1050, hmax: 1150, zone: 'H', internal: 400, edge: 200 },
  { system: 'balustrade', thk: 13.52, hmin: 1050, hmax: 1150, zone: 'VH', internal: 400, edge: 200 },
  { system: 'balustrade', thk: 13.52, hmin: 1050, hmax: 1150, zone: 'EH', internal: 400, edge: 200 },
  // Balustrade 15, 1000–1250
  { system: 'balustrade', thk: 15.0, hmin: 1000, hmax: 1050, zone: 'L', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 15.0, hmin: 1000, hmax: 1050, zone: 'M', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 15.0, hmin: 1000, hmax: 1050, zone: 'H', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 15.0, hmin: 1000, hmax: 1050, zone: 'VH', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 15.0, hmin: 1000, hmax: 1050, zone: 'EH', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 15.0, hmin: 1100, hmax: 1250, zone: 'L', internal: 400, edge: 200 },
  { system: 'balustrade', thk: 15.0, hmin: 1100, hmax: 1250, zone: 'M', internal: 400, edge: 200 },
  { system: 'balustrade', thk: 15.0, hmin: 1100, hmax: 1250, zone: 'H', internal: 400, edge: 200 },
  { system: 'balustrade', thk: 15.0, hmin: 1100, hmax: 1250, zone: 'VH', internal: 400, edge: 200 },
  { system: 'balustrade', thk: 15.0, hmin: 1100, hmax: 1250, zone: 'EH', internal: 400, edge: 200 },
  // Balustrade 17.52, 1000–1250
  { system: 'balustrade', thk: 17.52, hmin: 1000, hmax: 1050, zone: 'L', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 17.52, hmin: 1000, hmax: 1050, zone: 'M', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 17.52, hmin: 1000, hmax: 1050, zone: 'H', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 17.52, hmin: 1000, hmax: 1050, zone: 'VH', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 17.52, hmin: 1000, hmax: 1050, zone: 'EH', internal: 425, edge: 200 },
  { system: 'balustrade', thk: 17.52, hmin: 1100, hmax: 1250, zone: 'L', internal: 400, edge: 200 },
  { system: 'balustrade', thk: 17.52, hmin: 1100, hmax: 1250, zone: 'M', internal: 400, edge: 200 },
  { system: 'balustrade', thk: 17.52, hmin: 1100, hmax: 1250, zone: 'H', internal: 400, edge: 200 },
  { system: 'balustrade', thk: 17.52, hmin: 1100, hmax: 1250, zone: 'VH', internal: 400, edge: 200 },
  { system: 'balustrade', thk: 17.52, hmin: 1100, hmax: 1250, zone: 'EH', internal: 400, edge: 200 },
  // Pool 12, 1200–1350 (L/M/H only)
  { system: 'pool', thk: 12.0, hmin: 1200, hmax: 1350, zone: 'L', internal: 400, edge: 200 },
  { system: 'pool', thk: 12.0, hmin: 1200, hmax: 1350, zone: 'M', internal: 400, edge: 200 },
  { system: 'pool', thk: 12.0, hmin: 1200, hmax: 1350, zone: 'H', internal: 400, edge: 200 },
  { system: 'pool', thk: 12.0, hmin: 1200, hmax: 1350, zone: 'VH', internal: 999, edge: 200 },
  { system: 'pool', thk: 12.0, hmin: 1200, hmax: 1350, zone: 'EH', internal: 999, edge: 200 },
  // Pool 15, 1200–1350 (up to VH)
  { system: 'pool', thk: 15.0, hmin: 1200, hmax: 1350, zone: 'L', internal: 400, edge: 200 },
  { system: 'pool', thk: 15.0, hmin: 1200, hmax: 1350, zone: 'M', internal: 400, edge: 200 },
  { system: 'pool', thk: 15.0, hmin: 1200, hmax: 1350, zone: 'H', internal: 400, edge: 200 },
  { system: 'pool', thk: 15.0, hmin: 1200, hmax: 1350, zone: 'VH', internal: 400, edge: 200 },
  { system: 'pool', thk: 15.0, hmin: 1200, hmax: 1350, zone: 'EH', internal: 999, edge: 200 },
  // Pool 17.52, 1200–1350 (up to EH)
  { system: 'pool', thk: 17.52, hmin: 1200, hmax: 1350, zone: 'L', internal: 400, edge: 200 },
  { system: 'pool', thk: 17.52, hmin: 1200, hmax: 1350, zone: 'M', internal: 400, edge: 200 },
  { system: 'pool', thk: 17.52, hmin: 1200, hmax: 1350, zone: 'H', internal: 400, edge: 200 },
  { system: 'pool', thk: 17.52, hmin: 1200, hmax: 1350, zone: 'VH', internal: 400, edge: 200 },
  { system: 'pool', thk: 17.52, hmin: 1200, hmax: 1350, zone: 'EH', internal: 400, edge: 200 },
];

// Pradis PS1 (balustrade + pool). Edge=200 by default; Timber Lag/Coach Screw sets edge=150 via rule below.
export const PRADIS_PS1: Ps1Row[] = [
  // Balustrade 12, 1000–1200
  { system: 'balustrade', thk: 12.0, hmin: 1000, hmax: 1200, zone: 'L', internal: 600, edge: 200 },
  { system: 'balustrade', thk: 12.0, hmin: 1000, hmax: 1200, zone: 'M', internal: 600, edge: 200 },
  { system: 'balustrade', thk: 12.0, hmin: 1000, hmax: 1200, zone: 'H', internal: 600, edge: 200 },
  { system: 'balustrade', thk: 12.0, hmin: 1000, hmax: 1200, zone: 'VH', internal: 450, edge: 200 },
  { system: 'balustrade', thk: 12.0, hmin: 1000, hmax: 1200, zone: 'EH', internal: 400, edge: 200 },
  // Balustrade 13.52, 1000–1200
  { system: 'balustrade', thk: 13.52, hmin: 1000, hmax: 1200, zone: 'L', internal: 600, edge: 200 },
  { system: 'balustrade', thk: 13.52, hmin: 1000, hmax: 1200, zone: 'M', internal: 600, edge: 200 },
  { system: 'balustrade', thk: 13.52, hmin: 1000, hmax: 1200, zone: 'H', internal: 600, edge: 200 },
  { system: 'balustrade', thk: 13.52, hmin: 1000, hmax: 1200, zone: 'VH', internal: 400, edge: 200 },
  { system: 'balustrade', thk: 13.52, hmin: 1000, hmax: 1200, zone: 'EH', internal: 400, edge: 200 },
  // Balustrade 15, 1000–1200
  { system: 'balustrade', thk: 15.0, hmin: 1000, hmax: 1200, zone: 'L', internal: 600, edge: 200 },
  { system: 'balustrade', thk: 15.0, hmin: 1000, hmax: 1200, zone: 'M', internal: 600, edge: 200 },
  { system: 'balustrade', thk: 15.0, hmin: 1000, hmax: 1200, zone: 'H', internal: 600, edge: 200 },
  { system: 'balustrade', thk: 15.0, hmin: 1000, hmax: 1200, zone: 'VH', internal: 400, edge: 200 },
  { system: 'balustrade', thk: 15.0, hmin: 1000, hmax: 1200, zone: 'EH', internal: 300, edge: 200 },
  // Balustrade 17.52, 1000–1200
  { system: 'balustrade', thk: 17.52, hmin: 1000, hmax: 1200, zone: 'L', internal: 600, edge: 200 },
  { system: 'balustrade', thk: 17.52, hmin: 1000, hmax: 1200, zone: 'M', internal: 600, edge: 200 },
  { system: 'balustrade', thk: 17.52, hmin: 1000, hmax: 1200, zone: 'H', internal: 600, edge: 200 },
  { system: 'balustrade', thk: 17.52, hmin: 1000, hmax: 1200, zone: 'VH', internal: 400, edge: 200 },
  { system: 'balustrade', thk: 17.52, hmin: 1000, hmax: 1200, zone: 'EH', internal: 300, edge: 200 },
  // Pool 12, 1200–1250 (up to H)
  { system: 'pool', thk: 12.0, hmin: 1200, hmax: 1250, zone: 'L', internal: 400, edge: 200 },
  { system: 'pool', thk: 12.0, hmin: 1200, hmax: 1250, zone: 'M', internal: 400, edge: 200 },
  { system: 'pool', thk: 12.0, hmin: 1200, hmax: 1250, zone: 'H', internal: 400, edge: 200 },
  { system: 'pool', thk: 12.0, hmin: 1200, hmax: 1250, zone: 'VH', internal: 999, edge: 200 },
  { system: 'pool', thk: 12.0, hmin: 1200, hmax: 1250, zone: 'EH', internal: 999, edge: 200 },
  // Pool 15, 1200–1250 (up to VH)
  { system: 'pool', thk: 15.0, hmin: 1200, hmax: 1250, zone: 'L', internal: 400, edge: 200 },
  { system: 'pool', thk: 15.0, hmin: 1200, hmax: 1250, zone: 'M', internal: 400, edge: 200 },
  { system: 'pool', thk: 15.0, hmin: 1200, hmax: 1250, zone: 'H', internal: 400, edge: 200 },
  { system: 'pool', thk: 15.0, hmin: 1200, hmax: 1250, zone: 'VH', internal: 400, edge: 200 },
  { system: 'pool', thk: 15.0, hmin: 1200, hmax: 1250, zone: 'EH', internal: 999, edge: 200 },
  // Pool 17.52, 1200–1250 (up to EH)
  { system: 'pool', thk: 17.52, hmin: 1200, hmax: 1250, zone: 'L', internal: 400, edge: 200 },
  { system: 'pool', thk: 17.52, hmin: 1200, hmax: 1250, zone: 'M', internal: 400, edge: 200 },
  { system: 'pool', thk: 17.52, hmin: 1200, hmax: 1250, zone: 'H', internal: 400, edge: 200 },
  { system: 'pool', thk: 17.52, hmin: 1200, hmax: 1250, zone: 'VH', internal: 400, edge: 200 },
  { system: 'pool', thk: 17.52, hmin: 1200, hmax: 1250, zone: 'EH', internal: 400, edge: 200 },
];

// Main dispatcher with product-specific post-lookup rules
export function lookupStandoffsPs1(
  calcKey: string | null,
  fenceType: string | undefined,
  thk: string | undefined,
  ht: number | undefined,
  zone: string | undefined,
  fixingType?: string | undefined,
) {
  if (!calcKey || !fenceType || !thk || !ht || !zone) return null;
  const system = fenceType; // 'balustrade' or 'pool'
  let row: Ps1Row | null = null;
  if (calcKey === 'sd50') row = genericLookup(SD50_PS1, system, thk, ht, zone);
  else if (calcKey === 'pf150') row = genericLookup(PF150_PS1, system, thk, ht, zone);
  else if (calcKey === 'sd100') row = genericLookup(SD100_PS1, system, thk, ht, zone);
  else if (calcKey === 'pradis') row = genericLookup(PRADIS_PS1, system, thk, ht, zone);
  if (!row) return null;

  // Copy to allow safe adjustments
  let internal = row.internal;
  let edge = row.edge;

  // Universal pool behaviour already encoded in PS1 (400 or 999). Edge stays 200.

  // PF150 & SD100: cap spacing to 300 in EH or when fixing into Timber (any timber string)
  if ((calcKey === 'pf150' || calcKey === 'sd100') && system === 'balustrade') {
    if (zone.toUpperCase() === 'EH' || (fixingType && fixingType.toLowerCase().includes('timber'))) {
      internal = Math.min(internal, 300);
    }
  }

  // Pradis: Timber Lag/Coach Screw => cap spacing to 300 and set edge=150
  if (calcKey === 'pradis' && fixingType === 'Timber Lag/Coach Screw') {
    internal = Math.min(internal, 300);
    edge = 150;
  }

  return { ...row, internal, edge } as Ps1Row;
}
