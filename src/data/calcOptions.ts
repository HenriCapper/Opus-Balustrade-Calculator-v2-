// Central calculator option definitions extracted from legacy calculators.
// These provide simplified option sets for form selects. Replace/extend with
// dynamic data or API-driven sources later.

export type CalcKey =
  | 'sp10'
  | 'sp12'
  | 'sp13'
  | 'sp14'
  | 'sp15'
  | 'rmp160'
  | 'smp160'
  | 'sd50'
  | 'pf150'
  | 'sd75'
  | 'sd100'
  | 'pradis'
  | 'smartlock_top'
  | 'smartlock_side'
  | 'lugano'
  | 'vista'
  | 'resolute'
  | 'vortex';

export interface DynamicSets {
  fenceTypes: { value: string; label: string }[];
  windZones: string[];
  glassHeights: number[];
  glassThicknesses: string[];
  handrails: { value: string; label: string }[];
  finishes: string[];
  fixingTypes: string[];
}

export const CALC_OPTION_MAP: Record<CalcKey, DynamicSets> = {
// Spigots / mini-post systems
  sp10: {
    fenceTypes: [
      { value: 'balustrade', label: 'Balustrade (1000–1200)' },
      { value: 'pool', label: 'Pool Fence (1200)' },
    ],
    windZones: ['L', 'M', 'H', 'VH', 'EH'],
    glassHeights: [1000, 1050, 1100, 1150, 1200],
    glassThicknesses: ['12', '13.52'],
    handrails: [
      { value: 'S25', label: 'S25' },
      { value: 'AH40', label: 'AH40' },
      { value: 'S40', label: 'S40' },
      { value: 'R40', label: 'R40' },
    ],
    finishes: ['SSS', 'PSS', 'Black'],
    fixingTypes: ['Concrete', 'Steel', 'Timber (Coach Screw)', 'Timber (Bolt Through)'],
  },
  sp12: {
    fenceTypes: [
      { value: 'balustrade', label: 'Balustrade (1000–1300)' },
      { value: 'pool', label: 'Pool Fence (1200–1300)' },
    ],
    windZones: ['L', 'M', 'H', 'VH', 'EH'],
    glassHeights: [1000, 1050, 1100, 1150, 1200, 1250, 1300],
    glassThicknesses: ['12', '13.52', '15', '17.52'],
    handrails: [
      { value: 'S25', label: 'S25' },
      { value: 'AH40', label: 'AH40' },
      { value: 'S40', label: 'S40' },
      { value: 'R40', label: 'R40' },
    ],
  finishes: ['SSS', 'Black', 'Powdercoat'],
    fixingTypes: ['Concrete', 'Steel', 'Timber (Coach Screw)', 'Timber (Bolt Through)'],
  },
  sp13: {
    fenceTypes: [
      { value: 'balustrade', label: 'Balustrade (1000–1300)' },
      { value: 'pool', label: 'Pool Fence (1200–1300)' },
    ],
    windZones: ['L', 'M', 'H', 'VH', 'EH'],
    glassHeights: [1000, 1050, 1100, 1150, 1200, 1250, 1300],
    glassThicknesses: ['12', '13.52', '15', '17.52'],
    handrails: [
      { value: 'S25', label: 'S25' },
      { value: 'AH40', label: 'AH40' },
      { value: 'S40', label: 'S40' },
      { value: 'R40', label: 'R40' },
    ],
  finishes: ['SSS', 'Black', 'Powdercoat'],
    fixingTypes: ['Concrete', 'Steel', 'Timber (Coach Screw)', 'Timber (Bolt Through)'],
  },
  sp14: {
    fenceTypes: [
      { value: 'balustrade', label: 'Balustrade (1000–1300)' },
      { value: 'pool', label: 'Pool Fence (1200–1300)' },
    ],
    windZones: ['L', 'M', 'H', 'VH', 'EH'],
    glassHeights: [1000, 1050, 1100, 1150, 1200, 1250, 1300],
    glassThicknesses: ['12', '13.52', '15', '17.52'],
    handrails: [
      { value: 'S25', label: 'S25' },
      { value: 'AH40', label: 'AH40' },
      { value: 'S40', label: 'S40' },
      { value: 'R40', label: 'R40' },
    ],
  finishes: ['SSS', 'Black', 'Powdercoat'],
    fixingTypes: ['Concrete', 'Steel', 'Timber (Coach Screw)', 'Timber (Bolt Through)'],
  },
  sp15: {
    fenceTypes: [
      { value: 'balustrade', label: 'Balustrade (1000–1300)' },
      { value: 'pool', label: 'Pool Fence (1200–1300)' },
    ],
    windZones: ['L', 'M', 'H', 'VH', 'EH'],
    glassHeights: [1000, 1050, 1100, 1150, 1200, 1250, 1300],
    glassThicknesses: ['12', '13.52', '15', '17.52'],
    handrails: [
      { value: 'S25', label: 'S25' },
      { value: 'AH40', label: 'AH40' },
      { value: 'S40', label: 'S40' },
      { value: 'R40', label: 'R40' },
    ],
  finishes: ['SSS', 'Black', 'Powdercoat'],
    fixingTypes: ['Concrete', 'Steel', 'Timber (Coach Screw)', 'Timber (Bolt Through)'],
  },
  rmp160: {
    fenceTypes: [
      { value: 'balustrade', label: 'Balustrade (1000–1200)' },
      { value: 'pool', label: 'Pool Fence (1200)' },
    ],
    windZones: ['L', 'M', 'H', 'VH'],
    glassHeights: [1000, 1050, 1100, 1150, 1200],
    glassThicknesses: ['12', '13.52'],
    handrails: [
      { value: 'S25', label: 'S25' },
      { value: 'AH40', label: 'AH40' },
      { value: 'S40', label: 'S40' },
      { value: 'R40', label: 'R40' },
    ],
    finishes: ['SSS', 'Black'],
    fixingTypes: ['Concrete', 'Steel', 'Timber (Coach Screw)', 'Timber (Bolt Through)'],
  },
  smp160: {
    fenceTypes: [
      { value: 'balustrade', label: 'Balustrade (1000–1200)' },
      { value: 'pool', label: 'Pool Fence (1200)' },
    ],
    windZones: ['L', 'M', 'H', 'VH'],
    glassHeights: [1000, 1050, 1100, 1150, 1200],
    glassThicknesses: ['12', '13.52'],
    handrails: [
      { value: 'S25', label: 'S25' },
      { value: 'AH40', label: 'AH40' },
      { value: 'S40', label: 'S40' },
      { value: 'R40', label: 'R40' },
    ],
    finishes: ['SSS', 'Black'],
    fixingTypes: ['Concrete', 'Steel', 'Timber (Coach Screw)', 'Timber (Bolt Through)'],
  },
  // Point-fix / standoff systems 
  sd50: {
    fenceTypes: [
      { value: 'balustrade', label: 'Balustrade (1000–1200)' },
    ],
    windZones: ['L', 'M', 'H', 'VH', 'EH'],
    glassHeights: [950, 1000, 1050, 1100, 1150, 1200],
    glassThicknesses: ['12', '13.52', '15', '17.52'],
    handrails: [
      { value: 'S25', label: 'S25' },
      { value: 'AH40', label: 'AH40' },
      { value: 'S40', label: 'S40' },
      { value: 'R40', label: 'R40' },
    ],
    finishes: ['SSS', 'Black'],
    fixingTypes: ['Concrete', 'Steel', 'Timber (Coach Screw)', 'Timber (Bolt Through)'],
  },
  pf150: {
    fenceTypes: [
      { value: 'balustrade', label: 'Balustrade (1000–1300)' },
    ],
    windZones: ['L', 'M', 'H', 'VH', 'EH'],
    glassHeights: [1000, 1050, 1100, 1150, 1200, 1250, 1300],
    glassThicknesses: ['12', '13.52', '15', '17.52'],
    handrails: [
      { value: 'S25', label: 'S25' },
      { value: 'AH40', label: 'AH40' },
      { value: 'S40', label: 'S40' },
      { value: 'R40', label: 'R40' },
    ],
    finishes: ['SSS', 'Black'],
    fixingTypes: [
      'Concrete (Single Fix)',
      'Concrete (Double Fix)',
      'Steel (Single Fix)',
      'Steel (Double Fix)',
      'Timber Bolt Through (Single Fix)',
      'Timber Bolt Through (Double Fix)',
      'Timber Coach Screw (Single Fix)',
      'Timber Coach Screw (Double Fix)',
    ],
  },
  sd75: {
    fenceTypes: [
      { value: 'balustrade', label: 'Balustrade (1000–1300)' },
    ],
    windZones: ['L', 'M', 'H', 'VH', 'EH'],
    glassHeights: [1000, 1050, 1100, 1150, 1200],
    glassThicknesses: ['12', '13.52', '15', '17.52'],
    handrails: [
      { value: 'S25', label: 'S25' },
      { value: 'AH40', label: 'AH40' },
      { value: 'S40', label: 'S40' },
      { value: 'R40', label: 'R40' },
    ],
    finishes: ['SSS', 'Black'],
    fixingTypes: ['Concrete', 'Steel', 'Timber (Coach Screw)', 'Timber (Bolt Through)'],
  },
  sd100: {
    fenceTypes: [
      { value: 'balustrade', label: 'Balustrade (1000–1300)' },
    ],
    windZones: ['L', 'M', 'H', 'VH', 'EH'],
    glassHeights: [1000, 1050, 1100, 1150, 1200],
    glassThicknesses: ['12', '13.52', '15', '17.52'],
    handrails: [
      { value: 'S25', label: 'S25' },
      { value: 'AH40', label: 'AH40' },
      { value: 'S40', label: 'S40' },
      { value: 'R40', label: 'R40' },
    ],
    finishes: ['SSS', 'Black'],
    fixingTypes: ['Concrete', 'Steel', 'Timber (Coach Screw)', 'Timber (Bolt Through)'],
  },
  pradis: {
    fenceTypes: [
      { value: 'balustrade', label: 'Balustrade' },
      { value: 'pool', label: 'Pool Fence' },
    ],
    windZones: ['L', 'M', 'H', 'VH', 'EH'],
    glassHeights: [1000, 1050, 1100, 1150, 1200, 1250],
    glassThicknesses: ['12', '13.52', '15', '17.52'],
    handrails: [
      { value: 'S25', label: 'S25' },
      { value: 'AH40', label: 'AH40' },
      { value: 'S40', label: 'S40' },
      { value: 'R40', label: 'R40' },
    ],
    finishes: ['SA', 'Black', 'Powdercoat'],
    fixingTypes: [
      'Concrete',
      'Steel',
      'Timber Lag/Coach Screw',
      'Timber Through Bolt',
    ],
  },
// Channel systems
  smartlock_top: {
    fenceTypes: [
      { value: 'balustrade', label: 'Balustrade' },
      { value: 'pool', label: 'Pool Fence' },
    ],
    windZones: ['L', 'M', 'H', 'VH', 'EH'],
    glassHeights: [900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
    glassThicknesses: ['12', '13.52', '15', '17.52'],
    handrails: [
      { value: 'S25', label: 'S25' },
      { value: 'AH40', label: 'AH40' },
      { value: 'S40', label: 'S40' },
      { value: 'R40', label: 'R40' },
    ],
    finishes: ['mill', 'Black', 'Powdercoat'],
    fixingTypes: ['Concrete', 'Steel', 'Timber (Coach Screw)', 'Timber (Bolt Through)'],
  },
  smartlock_side: {
    fenceTypes: [
      { value: 'balustrade', label: 'Balustrade' },
      { value: 'pool', label: 'Pool Fence' },
    ],
    windZones: ['L', 'M', 'H', 'VH', 'EH'],
    glassHeights: [900, 950, 1000, 1050, 1100, 1150, 1200, 1250],
    glassThicknesses: ['12', '13.52', '15', '17.52'],
    handrails: [
      { value: 'S25', label: 'S25' },
      { value: 'AH40', label: 'AH40' },
      { value: 'S40', label: 'S40' },
      { value: 'R40', label: 'R40' },
    ],
    finishes: ['mill', 'Black', 'Powdercoat'],
    fixingTypes: ['Concrete', 'Steel', 'Timber (Coach Screw)', 'Timber (Bolt Through)'],
  },
  lugano: {
    fenceTypes: [
      { value: 'balustrade', label: 'Balustrade' },
      { value: 'pool', label: 'Pool Fence' },
    ],
    windZones: ['L', 'M', 'H', 'VH', 'EH'],
    glassHeights: [1000, 1050, 1100, 1150, 1200],
    glassThicknesses: ['12', '13.52', '15', '17.52'],
    handrails: [
      { value: 'S25', label: 'S25' },
      { value: 'AH40', label: 'AH40' },
      { value: 'S40', label: 'S40' },
      { value: 'R40', label: 'R40' },
    ],
    finishes: ['mill', 'Black', 'Powdercoat'],
    fixingTypes: ['Concrete', 'Steel', 'Timber (Coach Screw)', 'Timber (Bolt Through)'],
  },
  vista: {
    fenceTypes: [
      { value: 'balustrade', label: 'Balustrade' },
      { value: 'pool', label: 'Pool Fence' },
    ],
    windZones: ['L', 'M', 'H', 'VH', 'EH'],
    glassHeights: [1000, 1050, 1100, 1150, 1200, 1250],
    glassThicknesses: ['12', '13.52', '15', '17.52'],
    handrails: [
      { value: 'S25', label: 'S25' },
      { value: 'AH40', label: 'AH40' },
      { value: 'S40', label: 'S40' },
      { value: 'R40', label: 'R40' },
    ],
    finishes: ['mill', 'Black', 'Powdercoat'],
    fixingTypes: ['Concrete', 'Steel', 'Timber (Coach Screw)', 'Timber (Bolt Through)'],
  },
  // Post systems
  resolute: {
    fenceTypes: [
      { value: 'balustrade', label: 'Balustrade (1000–2000)' },
      { value: 'pool', label: 'Pool Fence (1200–1300)' },
    ],
    windZones: ['L', 'M', 'H', 'VH', 'EH'],
    glassHeights: [1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000],
    glassThicknesses: ['10', '11.2', '12', '13.2', '13.52', '15', '17.2', '17.52'],
    handrails: [
      { value: 'ST50H', label: 'ST50H' },
      { value: 'RT50H', label: 'RT50H' },
      { value: 'S40', label: 'S40' },
      { value: 'AH40', label: 'AH40' },
      { value: 'R40', label: 'R40' },
    ],
    finishes: ['Mill', 'Powdercoat'],
    fixingTypes: ['Concrete', 'Steel', 'Timber (Coach Screw)', 'Timber (Bolt Through)'],
  },
  vortex: {
    fenceTypes: [
      { value: 'balustrade', label: 'Balustrade (1000–1500)' },
      { value: 'pool', label: 'Pool Fence (1200–1300)' },
    ],
    windZones: ['L', 'M', 'H', 'VH', 'EH'],
    glassHeights: [1000, 1100, 1200, 1250, 1300, 1400, 1500],
    glassThicknesses: ['8', '10', '11.2', '12', '13.2', '13.52', '15', '17.52'],
    handrails: [
      { value: 'VXSHR', label: 'Square Handrail' },
      { value: 'VXRHR', label: 'Rounded Handrail' },
    ],
    finishes: ['Powdercoat', 'Silver', 'Black', 'Mill'],
    fixingTypes: ['Concrete', 'Steel', 'Timber (Coach Screw)', 'Timber (Bolt Through)'],
  },
};

export function detectCalcKey(raw: string | undefined, system: string | null): CalcKey | null {
  if (!raw || !system) return null;
  const lower = raw.toLowerCase();
  // Spigot based systems
  if (system === 'spigots') {
    if (lower.includes('sp10')) return 'sp10';
    if (lower.includes('sp12')) return 'sp12';
    if (lower.includes('sp13')) return 'sp13';
    if (lower.includes('sp14')) return 'sp14';
    if (lower.includes('sp15')) return 'sp15';
    if (lower.includes('rmp160')) return 'rmp160';
    if (lower.includes('smp160')) return 'smp160';
  }
  // Point-fix / standoff style system (assuming 'standoffs')
  if (system === 'standoffs') {
    if (lower.includes('sd50')) return 'sd50';
    if (lower.includes('pf150')) return 'pf150';
    if (lower.includes('sd75')) return 'sd75';
    if (lower.includes('sd100')) return 'sd100';
    if (lower.includes('pradis')) return 'pradis';
  }
  // Channel systems
  if (system === 'channel') {
    if (lower.includes('smart-side') && lower.includes('side')) return 'smartlock_side';
    if (lower.includes('smart-top')) return 'smartlock_top';
    if (lower.includes('lugano')) return 'lugano';
    if (lower.includes('vista')) return 'vista';
  }
  // Post systems
  if (system === 'posts') {
    if (lower.includes('resolute')) return 'resolute';
    if (lower.includes('vortex')) return 'vortex';
  }
  return null;
}
