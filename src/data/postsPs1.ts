// PS1 spacing data for Post Systems (Resolute and Vortex)
// Extracted from legacy HTML calculators

export interface PostPs1Row {
  system: 'balustrade' | 'pool';
  thk: number; // glass thickness mm
  hmin: number; // height min mm
  hmax: number; // height max mm
  zone: string; // wind zone
  internal: number; // internal spacing mm
  edge: number; // edge distance mm (0 for Vortex side-mounted)
  calculator: 'resolute' | 'vortex';
}

// Resolute Post System PS1 Data
// Edge distance: 500mm (reduced for balustrade and certain fixing types)
// Heights: 1000-2000mm in bands
// Thicknesses: 10, 11.2, 12, 13.2, 13.52, 15, 17.2, 17.52mm
const RESOLUTE_PS1: PostPs1Row[] = [];

function generateResolutePS1() {
  const thicknesses = [10, 11.2, 12, 13.2, 13.52, 15, 17.2, 17.52];
  const bands = [
    { hmin: 1000, hmax: 1400, internal: 1650 },
    { hmin: 1400, hmax: 1600, internal: 1500 },
    { hmin: 1600, hmax: 1800, internal: 1150 },
    { hmin: 1800, hmax: 2000, internal: 950 }
  ];
  const zones = ['L', 'M', 'H', 'VH', 'EH'];
  const systems: ('balustrade' | 'pool')[] = ['balustrade', 'pool'];
  
  systems.forEach(system => {
    thicknesses.forEach(thk => {
      bands.forEach(band => {
        zones.forEach(zone => {
          RESOLUTE_PS1.push({
            system,
            thk,
            hmin: band.hmin,
            hmax: band.hmax,
            zone,
            internal: band.internal,
            edge: 500, // Base edge distance (reduced per rules elsewhere)
            calculator: 'resolute'
          });
        });
      });
    });
  });
}

generateResolutePS1();

// Vortex Side Mounted Post System PS1 Data
// Edge distance: 0mm (posts sit between panels)
// Heights: 1000-1500mm
// Thicknesses: 8, 10, 11.2, 12, 13.2, 13.52, 15, 17.52mm
const VORTEX_PS1: PostPs1Row[] = [];

function generateVortexPS1() {
  const rows: PostPs1Row[] = [];
  
  // Helper to add rows
  function addRows(system: 'balustrade' | 'pool', thk: number, ht: number, zone: string, internal: number) {
    rows.push({ system, thk, hmin: ht, hmax: ht, zone, internal, edge: 0, calculator: 'vortex' });
  }
  
  // Balustrade: 8mm toughened / 11.2mm laminated
  ['L', 'M'].forEach(zone => {
    addRows('balustrade', 8, 1000, zone, 1500);
    addRows('balustrade', 11.2, 1000, zone, 1500);
    addRows('balustrade', 8, 1100, zone, 1400);
    addRows('balustrade', 11.2, 1100, zone, 1400);
    addRows('balustrade', 8, 1200, zone, 1300);
    addRows('balustrade', 11.2, 1200, zone, 1300);
    addRows('balustrade', 8, 1300, zone, 1200);
    addRows('balustrade', 11.2, 1300, zone, 1200);
  });
  
  // Balustrade: 8mm / 11.2mm for H zone
  ['H'].forEach(zone => {
    addRows('balustrade', 8, 1000, zone, 1400);
    addRows('balustrade', 11.2, 1000, zone, 1400);
    addRows('balustrade', 8, 1100, zone, 1300);
    addRows('balustrade', 11.2, 1100, zone, 1300);
    addRows('balustrade', 8, 1200, zone, 1200);
    addRows('balustrade', 11.2, 1200, zone, 1200);
    addRows('balustrade', 8, 1300, zone, 1100);
    addRows('balustrade', 11.2, 1300, zone, 1100);
  });
  
  // Balustrade: 8mm / 11.2mm for VH zone
  ['VH'].forEach(zone => {
    addRows('balustrade', 8, 1000, zone, 1300);
    addRows('balustrade', 11.2, 1000, zone, 1300);
    addRows('balustrade', 8, 1100, zone, 1200);
    addRows('balustrade', 11.2, 1100, zone, 1200);
    addRows('balustrade', 8, 1200, zone, 1100);
    addRows('balustrade', 11.2, 1200, zone, 1100);
    addRows('balustrade', 8, 1300, zone, 1000);
    addRows('balustrade', 11.2, 1300, zone, 1000);
  });
  
  // Balustrade: 8mm / 11.2mm for EH zone
  ['EH'].forEach(zone => {
    addRows('balustrade', 8, 1000, zone, 1000);
    addRows('balustrade', 11.2, 1000, zone, 1000);
    addRows('balustrade', 8, 1100, zone, 900);
    addRows('balustrade', 11.2, 1100, zone, 900);
    addRows('balustrade', 8, 1200, zone, 800);
    addRows('balustrade', 11.2, 1200, zone, 800);
  });
  
  // Balustrade: 10mm toughened / 13.2mm laminated
  ['L', 'M'].forEach(zone => {
    addRows('balustrade', 10, 1000, zone, 1700);
    addRows('balustrade', 13.2, 1000, zone, 1700);
    addRows('balustrade', 10, 1100, zone, 1600);
    addRows('balustrade', 13.2, 1100, zone, 1600);
    addRows('balustrade', 10, 1200, zone, 1500);
    addRows('balustrade', 13.2, 1200, zone, 1500);
    addRows('balustrade', 10, 1300, zone, 1400);
    addRows('balustrade', 13.2, 1300, zone, 1400);
  });
  
  // Balustrade: 10mm / 13.2mm for H zone
  ['H'].forEach(zone => {
    addRows('balustrade', 10, 1000, zone, 1600);
    addRows('balustrade', 13.2, 1000, zone, 1600);
    addRows('balustrade', 10, 1100, zone, 1500);
    addRows('balustrade', 13.2, 1100, zone, 1500);
    addRows('balustrade', 10, 1200, zone, 1400);
    addRows('balustrade', 13.2, 1200, zone, 1400);
    addRows('balustrade', 10, 1300, zone, 1300);
    addRows('balustrade', 13.2, 1300, zone, 1300);
  });
  
  // Balustrade: 10mm / 13.2mm for VH zone
  ['VH'].forEach(zone => {
    addRows('balustrade', 10, 1000, zone, 1500);
    addRows('balustrade', 13.2, 1000, zone, 1500);
    addRows('balustrade', 10, 1100, zone, 1400);
    addRows('balustrade', 13.2, 1100, zone, 1400);
    addRows('balustrade', 10, 1200, zone, 1300);
    addRows('balustrade', 13.2, 1200, zone, 1300);
    addRows('balustrade', 10, 1300, zone, 1200);
    addRows('balustrade', 13.2, 1300, zone, 1200);
  });
  
  // Balustrade: 10mm / 13.2mm for EH zone
  ['EH'].forEach(zone => {
    addRows('balustrade', 10, 1000, zone, 1200);
    addRows('balustrade', 13.2, 1000, zone, 1200);
    addRows('balustrade', 10, 1100, zone, 1100);
    addRows('balustrade', 13.2, 1100, zone, 1100);
    addRows('balustrade', 10, 1200, zone, 1000);
    addRows('balustrade', 13.2, 1200, zone, 1000);
  });
  
  // Balustrade: 12mm toughened / 13.52mm Sentry
  ['L', 'M'].forEach(zone => {
    addRows('balustrade', 12, 1000, zone, 1900);
    addRows('balustrade', 13.52, 1000, zone, 1900);
    addRows('balustrade', 12, 1100, zone, 1800);
    addRows('balustrade', 13.52, 1100, zone, 1800);
    addRows('balustrade', 12, 1200, zone, 1700);
    addRows('balustrade', 13.52, 1200, zone, 1700);
    addRows('balustrade', 12, 1300, zone, 1600);
    addRows('balustrade', 13.52, 1300, zone, 1600);
  });
  
  // Balustrade: 12mm / 13.52mm for H zone
  ['H'].forEach(zone => {
    addRows('balustrade', 12, 1000, zone, 1800);
    addRows('balustrade', 13.52, 1000, zone, 1800);
    addRows('balustrade', 12, 1100, zone, 1700);
    addRows('balustrade', 13.52, 1100, zone, 1700);
    addRows('balustrade', 12, 1200, zone, 1600);
    addRows('balustrade', 13.52, 1200, zone, 1600);
    addRows('balustrade', 12, 1300, zone, 1500);
    addRows('balustrade', 13.52, 1300, zone, 1500);
  });
  
  // Balustrade: 12mm / 13.52mm for VH zone
  ['VH'].forEach(zone => {
    addRows('balustrade', 12, 1000, zone, 1700);
    addRows('balustrade', 13.52, 1000, zone, 1700);
    addRows('balustrade', 12, 1100, zone, 1600);
    addRows('balustrade', 13.52, 1100, zone, 1600);
    addRows('balustrade', 12, 1200, zone, 1500);
    addRows('balustrade', 13.52, 1200, zone, 1500);
    addRows('balustrade', 12, 1300, zone, 1400);
    addRows('balustrade', 13.52, 1300, zone, 1400);
  });
  
  // Balustrade: 12mm / 13.52mm for EH zone (no 1000mm)
  ['EH'].forEach(zone => {
    addRows('balustrade', 12, 1100, zone, 1400);
    addRows('balustrade', 13.52, 1100, zone, 1400);
    addRows('balustrade', 12, 1200, zone, 1300);
    addRows('balustrade', 13.52, 1200, zone, 1300);
    addRows('balustrade', 12, 1300, zone, 1200);
    addRows('balustrade', 13.52, 1300, zone, 1200);
  });
  
  // Balustrade: 15mm toughened / 17.52mm Sentry (VH and EH only)
  ['VH'].forEach(zone => {
    addRows('balustrade', 15, 1100, zone, 1600);
    addRows('balustrade', 17.52, 1100, zone, 1600);
    addRows('balustrade', 15, 1200, zone, 1500);
    addRows('balustrade', 17.52, 1200, zone, 1500);
    addRows('balustrade', 15, 1300, zone, 1400);
    addRows('balustrade', 17.52, 1300, zone, 1400);
  });
  
  ['EH'].forEach(zone => {
    addRows('balustrade', 15, 1100, zone, 1500);
    addRows('balustrade', 17.52, 1100, zone, 1500);
    addRows('balustrade', 15, 1200, zone, 1400);
    addRows('balustrade', 17.52, 1200, zone, 1400);
    addRows('balustrade', 15, 1300, zone, 1300);
    addRows('balustrade', 17.52, 1300, zone, 1300);
    addRows('balustrade', 15, 1400, zone, 1100);
    addRows('balustrade', 17.52, 1400, zone, 1100);
    addRows('balustrade', 15, 1500, zone, 1000);
    addRows('balustrade', 17.52, 1500, zone, 1000);
  });
  
  // Pool fence: 10mm toughened / 13.2mm laminated
  ['L', 'M'].forEach(zone => {
    addRows('pool', 10, 1200, zone, 1500);
    addRows('pool', 13.2, 1200, zone, 1500);
    addRows('pool', 10, 1250, zone, 1450);
    addRows('pool', 13.2, 1250, zone, 1450);
    addRows('pool', 10, 1300, zone, 1400);
    addRows('pool', 13.2, 1300, zone, 1400);
  });
  
  ['H'].forEach(zone => {
    addRows('pool', 10, 1200, zone, 1400);
    addRows('pool', 13.2, 1200, zone, 1400);
    addRows('pool', 10, 1250, zone, 1350);
    addRows('pool', 13.2, 1250, zone, 1350);
    addRows('pool', 10, 1300, zone, 1300);
    addRows('pool', 13.2, 1300, zone, 1300);
  });
  
  ['VH'].forEach(zone => {
    addRows('pool', 10, 1200, zone, 1300);
    addRows('pool', 13.2, 1200, zone, 1300);
    addRows('pool', 10, 1250, zone, 1250);
    addRows('pool', 13.2, 1250, zone, 1250);
    addRows('pool', 10, 1300, zone, 1200);
    addRows('pool', 13.2, 1300, zone, 1200);
  });
  
  ['EH'].forEach(zone => {
    addRows('pool', 10, 1200, zone, 1000);
    addRows('pool', 13.2, 1200, zone, 1000);
    addRows('pool', 10, 1250, zone, 950);
    addRows('pool', 13.2, 1250, zone, 950);
    addRows('pool', 10, 1300, zone, 900);
    addRows('pool', 13.2, 1300, zone, 900);
  });
  
  // Pool fence: 12mm toughened / 13.52mm Sentry
  ['L', 'M'].forEach(zone => {
    addRows('pool', 12, 1200, zone, 1600);
    addRows('pool', 13.52, 1200, zone, 1600);
    addRows('pool', 12, 1250, zone, 1550);
    addRows('pool', 13.52, 1250, zone, 1550);
    addRows('pool', 12, 1300, zone, 1500);
    addRows('pool', 13.52, 1300, zone, 1500);
  });
  
  ['H'].forEach(zone => {
    addRows('pool', 12, 1200, zone, 1500);
    addRows('pool', 13.52, 1200, zone, 1500);
    addRows('pool', 12, 1250, zone, 1450);
    addRows('pool', 13.52, 1250, zone, 1450);
    addRows('pool', 12, 1300, zone, 1400);
    addRows('pool', 13.52, 1300, zone, 1400);
  });
  
  ['VH'].forEach(zone => {
    addRows('pool', 12, 1200, zone, 1400);
    addRows('pool', 13.52, 1200, zone, 1400);
    addRows('pool', 12, 1250, zone, 1350);
    addRows('pool', 13.52, 1250, zone, 1350);
    addRows('pool', 12, 1300, zone, 1300);
    addRows('pool', 13.52, 1300, zone, 1300);
  });
  
  ['EH'].forEach(zone => {
    addRows('pool', 12, 1200, zone, 1200);
    addRows('pool', 13.52, 1200, zone, 1200);
    addRows('pool', 12, 1250, zone, 1150);
    addRows('pool', 13.52, 1250, zone, 1150);
    addRows('pool', 12, 1300, zone, 1100);
    addRows('pool', 13.52, 1300, zone, 1100);
  });
  
  return rows;
}

VORTEX_PS1.push(...generateVortexPS1());

// Combined PS1 data
const ALL_POSTS_PS1 = [...RESOLUTE_PS1, ...VORTEX_PS1];

/**
 * Lookup PS1 row for post systems
 */
export function lookupPostsPs1(
  calcKey: 'resolute' | 'vortex',
  fenceType?: string,
  glassThickness?: string,
  glassHeight?: number,
  windZone?: string,
  fixingType?: string
): { internal: number; edge: number; system: string; thk: number; hmin: number; hmax: number; zone: string } | null {
  const system = (fenceType || '').toLowerCase().includes('pool') ? 'pool' : 'balustrade';
  const thk = parseFloat(glassThickness || '0');
  const ht = glassHeight || 0;
  const zone = (windZone || '').toUpperCase();
  
  if (!thk || !ht || !zone) return null;
  
  // Filter by calculator type
  const dataset = ALL_POSTS_PS1.filter(r => r.calculator === calcKey);
  
  // Find exact match
  let rows = dataset.filter(r => 
    r.system === system && 
    Math.abs(r.thk - thk) < 0.01 && 
    r.zone === zone && 
    ht >= r.hmin && 
    ht <= r.hmax
  );
  
  if (rows.length > 0) {
    const row = rows[0];
    let edge = row.edge;
    
    // Resolute: apply edge distance reductions
    if (calcKey === 'resolute' && system === 'balustrade') {
      // Zone-based reductions
      const zoneLimits: Record<string, number> = { H: 350, VH: 300, EH: 300 };
      if (zoneLimits[zone]) {
        edge = Math.min(edge, zoneLimits[zone]);
      }
      // Fixing type reductions
      if (fixingType === 'Timber (Coach Screw)') {
        edge = Math.min(edge, 300);
      } else if (fixingType === 'Timber (Bolt Through)') {
        edge = Math.min(edge, 350);
      }
    }
    
    return {
      internal: row.internal,
      edge: edge,
      system: row.system,
      thk: row.thk,
      hmin: row.hmin,
      hmax: row.hmax,
      zone: row.zone
    };
  }
  
  // If no exact match, find closest height band
  rows = dataset.filter(r => 
    r.system === system && 
    Math.abs(r.thk - thk) < 0.01 && 
    r.zone === zone
  );
  
  if (rows.length === 0) return null;
  
  // Sort by closest mid-point
  rows.sort((a, b) => {
    const midA = (a.hmin + a.hmax) / 2;
    const midB = (b.hmin + b.hmax) / 2;
    return Math.abs(midA - ht) - Math.abs(midB - ht);
  });
  
  const row = rows[0];
  let edge = row.edge;
  
  // Apply edge reductions for Resolute
  if (calcKey === 'resolute' && system === 'balustrade') {
    const zoneLimits: Record<string, number> = { H: 350, VH: 300, EH: 300 };
    if (zoneLimits[zone]) {
      edge = Math.min(edge, zoneLimits[zone]);
    }
    if (fixingType === 'Timber (Coach Screw)') {
      edge = Math.min(edge, 300);
    } else if (fixingType === 'Timber (Bolt Through)') {
      edge = Math.min(edge, 350);
    }
  }
  
  return {
    internal: row.internal,
    edge: edge,
    system: row.system,
    thk: row.thk,
    hmin: row.hmin,
    hmax: row.hmax,
    zone: row.zone
  };
}
