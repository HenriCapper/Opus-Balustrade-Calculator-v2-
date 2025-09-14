// PS1 data extracted verbatim from legacy calculators for SP10, SP12, SP13.
// Each array must NOT be manually modified (source of truth: original calculator HTML files).
// Consumer functions perform lookups without mutating the data.

export interface Ps1Row {
  system: string; // 'balustrade' | 'pool'
  thk: number;    // glass thickness (mm or laminated value e.g., 13.52)
  hmin: number;   // min height band
  hmax: number;   // max height band
  zone: string;   // wind zone code
  internal: number; // internal spacing mm
  edge: number;     // edge spacing mm
}

// SP10 (truncated to PS1 segment only from legacy)
export const SP10_PS1: Ps1Row[] = [
  {"system":"balustrade","thk":12.0,"hmin":1000,"hmax":1150,"zone":"L","internal":850,"edge":200},
  {"system":"balustrade","thk":12.0,"hmin":1150,"hmax":1200,"zone":"L","internal":700,"edge":200},
  {"system":"balustrade","thk":12.0,"hmin":1000,"hmax":1150,"zone":"M","internal":850,"edge":200},
  {"system":"balustrade","thk":12.0,"hmin":1150,"hmax":1200,"zone":"M","internal":700,"edge":200},
  {"system":"balustrade","thk":12.0,"hmin":1000,"hmax":1100,"zone":"H","internal":750,"edge":200},
  {"system":"balustrade","thk":12.0,"hmin":1100,"hmax":1200,"zone":"H","internal":600,"edge":200},
  {"system":"balustrade","thk":12.0,"hmin":1000,"hmax":1050,"zone":"VH","internal":750,"edge":200},
  {"system":"balustrade","thk":12.0,"hmin":1050,"hmax":1100,"zone":"VH","internal":600,"edge":150},
  {"system":"balustrade","thk":12.0,"hmin":1000,"hmax":1050,"zone":"EH","internal":600,"edge":150},
  {"system":"balustrade","thk":13.52,"hmin":1000,"hmax":1150,"zone":"L","internal":850,"edge":200},
  {"system":"balustrade","thk":13.52,"hmin":1150,"hmax":1200,"zone":"L","internal":700,"edge":200},
  {"system":"balustrade","thk":13.52,"hmin":1000,"hmax":1150,"zone":"M","internal":850,"edge":200},
  {"system":"balustrade","thk":13.52,"hmin":1150,"hmax":1200,"zone":"M","internal":700,"edge":200},
  {"system":"balustrade","thk":13.52,"hmin":1000,"hmax":1100,"zone":"H","internal":750,"edge":200},
  {"system":"balustrade","thk":13.52,"hmin":1100,"hmax":1200,"zone":"H","internal":600,"edge":200},
  {"system":"balustrade","thk":13.52,"hmin":1000,"hmax":1050,"zone":"VH","internal":750,"edge":200},
  {"system":"balustrade","thk":13.52,"hmin":1050,"hmax":1100,"zone":"VH","internal":600,"edge":150},
  {"system":"balustrade","thk":13.52,"hmin":1000,"hmax":1050,"zone":"EH","internal":600,"edge":150},
  {"system":"pool","thk":12.0,"hmin":1200,"hmax":1200,"zone":"L","internal":800,"edge":300},
  {"system":"pool","thk":12.0,"hmin":1200,"hmax":1200,"zone":"M","internal":800,"edge":300},
  {"system":"pool","thk":12.0,"hmin":1200,"hmax":1200,"zone":"H","internal":700,"edge":300},
  {"system":"pool","thk":12.0,"hmin":1200,"hmax":1200,"zone":"VH","internal":600,"edge":200},
];

export const SP12_PS1: Ps1Row[] = [
  {"system":"balustrade","thk":12.0,"hmin":1000,"hmax":1150,"zone":"L","internal":800,"edge":250},
  {"system":"balustrade","thk":12.0,"hmin":1150,"hmax":1200,"zone":"L","internal":750,"edge":250},
  {"system":"balustrade","thk":12.0,"hmin":1000,"hmax":1150,"zone":"M","internal":800,"edge":250},
  {"system":"balustrade","thk":12.0,"hmin":1150,"hmax":1200,"zone":"M","internal":750,"edge":250},
  {"system":"balustrade","thk":12.0,"hmin":1000,"hmax":1150,"zone":"H","internal":800,"edge":250},
  {"system":"balustrade","thk":12.0,"hmin":1150,"hmax":1200,"zone":"H","internal":750,"edge":250},
  {"system":"balustrade","thk":12.0,"hmin":1000,"hmax":1100,"zone":"VH","internal":800,"edge":250},
  {"system":"balustrade","thk":12.0,"hmin":1050,"hmax":1150,"zone":"VH","internal":750,"edge":250},
  {"system":"balustrade","thk":12.0,"hmin":1000,"hmax":1050,"zone":"EH","internal":800,"edge":250},
  {"system":"balustrade","thk":12.0,"hmin":1050,"hmax":1100,"zone":"EH","internal":750,"edge":250},
  {"system":"balustrade","thk":13.52,"hmin":1000,"hmax":1150,"zone":"L","internal":800,"edge":250},
  {"system":"balustrade","thk":13.52,"hmin":1150,"hmax":1200,"zone":"L","internal":750,"edge":250},
  {"system":"balustrade","thk":13.52,"hmin":1000,"hmax":1150,"zone":"M","internal":800,"edge":250},
  {"system":"balustrade","thk":13.52,"hmin":1150,"hmax":1200,"zone":"M","internal":750,"edge":250},
  {"system":"balustrade","thk":13.52,"hmin":1000,"hmax":1150,"zone":"H","internal":800,"edge":250},
  {"system":"balustrade","thk":13.52,"hmin":1150,"hmax":1200,"zone":"H","internal":750,"edge":250},
  {"system":"balustrade","thk":13.52,"hmin":1000,"hmax":1100,"zone":"VH","internal":800,"edge":250},
  {"system":"balustrade","thk":13.52,"hmin":1050,"hmax":1150,"zone":"VH","internal":750,"edge":250},
  {"system":"balustrade","thk":13.52,"hmin":1000,"hmax":1050,"zone":"EH","internal":800,"edge":250},
  {"system":"balustrade","thk":13.52,"hmin":1050,"hmax":1100,"zone":"EH","internal":750,"edge":250},
  {"system":"balustrade","thk":15.0,"hmin":1000,"hmax":1250,"zone":"L","internal":800,"edge":250},
  {"system":"balustrade","thk":15.0,"hmin":1250,"hmax":1300,"zone":"L","internal":750,"edge":250},
  {"system":"balustrade","thk":15.0,"hmin":1000,"hmax":1250,"zone":"M","internal":800,"edge":250},
  {"system":"balustrade","thk":15.0,"hmin":1250,"hmax":1300,"zone":"M","internal":750,"edge":250},
  {"system":"balustrade","thk":15.0,"hmin":1000,"hmax":1250,"zone":"H","internal":800,"edge":250},
  {"system":"balustrade","thk":15.0,"hmin":1250,"hmax":1300,"zone":"H","internal":750,"edge":250},
  {"system":"balustrade","thk":15.0,"hmin":1000,"hmax":1200,"zone":"VH","internal":800,"edge":250},
  {"system":"balustrade","thk":15.0,"hmin":1200,"hmax":1250,"zone":"VH","internal":750,"edge":250},
  {"system":"balustrade","thk":15.0,"hmin":1000,"hmax":1150,"zone":"EH","internal":800,"edge":250},
  {"system":"balustrade","thk":15.0,"hmin":1150,"hmax":1200,"zone":"EH","internal":750,"edge":250},
  {"system":"balustrade","thk":17.52,"hmin":1000,"hmax":1250,"zone":"L","internal":800,"edge":250},
  {"system":"balustrade","thk":17.52,"hmin":1250,"hmax":1300,"zone":"L","internal":750,"edge":250},
  {"system":"balustrade","thk":17.52,"hmin":1000,"hmax":1250,"zone":"M","internal":800,"edge":250},
  {"system":"balustrade","thk":17.52,"hmin":1250,"hmax":1300,"zone":"M","internal":750,"edge":250},
  {"system":"balustrade","thk":17.52,"hmin":1000,"hmax":1250,"zone":"H","internal":800,"edge":250},
  {"system":"balustrade","thk":17.52,"hmin":1250,"hmax":1300,"zone":"H","internal":750,"edge":250},
  {"system":"balustrade","thk":17.52,"hmin":1000,"hmax":1200,"zone":"VH","internal":800,"edge":250},
  {"system":"balustrade","thk":17.52,"hmin":1200,"hmax":1250,"zone":"VH","internal":750,"edge":250},
  {"system":"balustrade","thk":17.52,"hmin":1000,"hmax":1150,"zone":"EH","internal":800,"edge":250},
  {"system":"balustrade","thk":17.52,"hmin":1150,"hmax":1200,"zone":"EH","internal":750,"edge":250},
  {"system":"pool","thk":12.0,"hmin":1200,"hmax":1300,"zone":"L","internal":1000,"edge":500},
  {"system":"pool","thk":12.0,"hmin":1200,"hmax":1300,"zone":"M","internal":1000,"edge":500},
  {"system":"pool","thk":12.0,"hmin":1200,"hmax":1250,"zone":"H","internal":1000,"edge":500},
  {"system":"pool","thk":12.0,"hmin":1200,"hmax":1250,"zone":"VH","internal":800,"edge":350},
  {"system":"pool","thk":15.0,"hmin":1200,"hmax":1300,"zone":"L","internal":1000,"edge":500},
  {"system":"pool","thk":15.0,"hmin":1200,"hmax":1300,"zone":"M","internal":1000,"edge":500},
  {"system":"pool","thk":15.0,"hmin":1200,"hmax":1300,"zone":"H","internal":1000,"edge":500},
  {"system":"pool","thk":15.0,"hmin":1200,"hmax":1300,"zone":"VH","internal":800,"edge":350},
  {"system":"pool","thk":15.0,"hmin":1200,"hmax":1250,"zone":"EH","internal":700,"edge":300},
  {"system":"pool","thk":15.0,"hmin":1250,"hmax":1300,"zone":"EH","internal":600,"edge":300},
];

export const SP13_PS1: Ps1Row[] = [
  {"system": "balustrade", "thk": 12.0, "hmin": 1000, "hmax": 1050, "zone": "EH", "internal": 750, "edge": 200},
  {"system": "balustrade", "thk": 12.0, "hmin": 1000, "hmax": 1100, "zone": "H", "internal": 800, "edge": 200},
  {"system": "balustrade", "thk": 12.0, "hmin": 1100, "hmax": 1150, "zone": "H", "internal": 750, "edge": 200},
  {"system": "balustrade", "thk": 12.0, "hmin": 1000, "hmax": 1150, "zone": "L", "internal": 800, "edge": 200},
  {"system": "balustrade", "thk": 12.0, "hmin": 1150, "hmax": 1200, "zone": "L", "internal": 750, "edge": 200},
  {"system": "balustrade", "thk": 12.0, "hmin": 1000, "hmax": 1150, "zone": "M", "internal": 800, "edge": 200},
  {"system": "balustrade", "thk": 12.0, "hmin": 1150, "hmax": 1200, "zone": "M", "internal": 750, "edge": 200},
  {"system": "balustrade", "thk": 12.0, "hmin": 1000, "hmax": 1050, "zone": "VH", "internal": 800, "edge": 200},
  {"system": "balustrade", "thk": 12.0, "hmin": 1050, "hmax": 1100, "zone": "VH", "internal": 750, "edge": 200},
  {"system": "balustrade", "thk": 13.52, "hmin": 1000, "hmax": 1050, "zone": "EH", "internal": 750, "edge": 200},
  {"system": "balustrade", "thk": 13.52, "hmin": 1000, "hmax": 1100, "zone": "H", "internal": 800, "edge": 200},
  {"system": "balustrade", "thk": 13.52, "hmin": 1100, "hmax": 1150, "zone": "H", "internal": 750, "edge": 200},
  {"system": "balustrade", "thk": 13.52, "hmin": 1000, "hmax": 1150, "zone": "L", "internal": 800, "edge": 200},
  {"system": "balustrade", "thk": 13.52, "hmin": 1150, "hmax": 1200, "zone": "L", "internal": 750, "edge": 200},
  {"system": "balustrade", "thk": 13.52, "hmin": 1000, "hmax": 1150, "zone": "M", "internal": 800, "edge": 200},
  {"system": "balustrade", "thk": 13.52, "hmin": 1150, "hmax": 1200, "zone": "M", "internal": 750, "edge": 200},
  {"system": "balustrade", "thk": 13.52, "hmin": 1000, "hmax": 1050, "zone": "VH", "internal": 800, "edge": 200},
  {"system": "balustrade", "thk": 13.52, "hmin": 1050, "hmax": 1100, "zone": "VH", "internal": 750, "edge": 200},
  {"system": "balustrade", "thk": 15.0, "hmin": 1000, "hmax": 1100, "zone": "EH", "internal": 800, "edge": 200},
  {"system": "balustrade", "thk": 15.0, "hmin": 1100, "hmax": 1200, "zone": "EH", "internal": 750, "edge": 200},
  {"system": "balustrade", "thk": 15.0, "hmin": 1000, "hmax": 1200, "zone": "H", "internal": 800, "edge": 200},
  {"system": "balustrade", "thk": 15.0, "hmin": 1200, "hmax": 1300, "zone": "H", "internal": 750, "edge": 200},
  {"system": "balustrade", "thk": 15.0, "hmin": 1000, "hmax": 1200, "zone": "L", "internal": 800, "edge": 200},
  {"system": "balustrade", "thk": 15.0, "hmin": 1200, "hmax": 1300, "zone": "L", "internal": 750, "edge": 200},
  {"system": "balustrade", "thk": 15.0, "hmin": 1000, "hmax": 1200, "zone": "M", "internal": 800, "edge": 200},
  {"system": "balustrade", "thk": 15.0, "hmin": 1200, "hmax": 1300, "zone": "M", "internal": 750, "edge": 200},
  {"system": "balustrade", "thk": 15.0, "hmin": 1000, "hmax": 1150, "zone": "VH", "internal": 800, "edge": 200}, 
  {"system": "balustrade", "thk": 15.0, "hmin": 1150, "hmax": 1250, "zone": "VH", "internal": 750, "edge": 200}, 
  {"system": "balustrade", "thk": 17.52, "hmin": 1000, "hmax": 1100, "zone": "EH", "internal": 800, "edge": 200},
  {"system": "balustrade", "thk": 17.52, "hmin": 1100, "hmax": 1200, "zone": "EH", "internal": 750, "edge": 200}, 
  {"system": "balustrade", "thk": 17.52, "hmin": 1000, "hmax": 1200, "zone": "H", "internal": 800, "edge": 200},
  {"system": "balustrade", "thk": 17.52, "hmin": 1200, "hmax": 1300, "zone": "H", "internal": 750, "edge": 200},
  {"system": "balustrade", "thk": 17.52, "hmin": 1000, "hmax": 1200, "zone": "L", "internal": 800, "edge": 200},
  {"system": "balustrade", "thk": 17.52, "hmin": 1200, "hmax": 1300, "zone": "L", "internal": 750, "edge": 200},
  {"system": "balustrade", "thk": 17.52, "hmin": 1000, "hmax": 1200, "zone": "M", "internal": 800, "edge": 200},
  {"system": "balustrade", "thk": 17.52, "hmin": 1200, "hmax": 1300, "zone": "M", "internal": 750, "edge": 200},
  {"system": "balustrade", "thk": 17.52, "hmin": 1000, "hmax": 1150, "zone": "VH", "internal": 800, "edge": 200},
  {"system": "balustrade", "thk": 17.52, "hmin": 1150, "hmax": 1250, "zone": "VH", "internal": 750, "edge": 200},
  {"system": "pool", "thk": 12.0, "hmin": 1200, "hmax": 1250, "zone": "H", "internal": 750, "edge": 375},
  {"system": "pool", "thk": 12.0, "hmin": 1200, "hmax": 1250, "zone": "L", "internal": 900, "edge": 400},
  {"system": "pool", "thk": 12.0, "hmin": 1200, "hmax": 1250, "zone": "M", "internal": 900, "edge": 375},
  {"system": "pool", "thk": 12.0, "hmin": 1200, "hmax": 1250, "zone": "VH", "internal": 600, "edge": 300},
  {"system": "pool", "thk": 15.0, "hmin": 1200, "hmax": 1300, "zone": "EH", "internal": 600, "edge": 300},
  {"system": "pool", "thk": 15.0, "hmin": 1200, "hmax": 1250, "zone": "H", "internal": 900, "edge": 400},
  {"system": "pool", "thk": 15.0, "hmin": 1250, "hmax": 1300, "zone": "H", "internal": 800, "edge": 400},
  {"system": "pool", "thk": 15.0, "hmin": 1200, "hmax": 1300, "zone": "L", "internal": 900, "edge": 400},
  {"system": "pool", "thk": 15.0, "hmin": 1200, "hmax": 1300, "zone": "M", "internal": 900, "edge": 400},
  {"system": "pool", "thk": 15.0, "hmin": 1200, "hmax": 1300, "zone": "VH", "internal": 750, "edge": 375}
];

// SP14 PS1 (verbatim from legacy SP14 calculator) - do not modify manually
export const SP14_PS1: Ps1Row[] = [
  {"system":"balustrade","thk":12.0,"hmin":1000,"hmax":1150,"zone":"L","internal":800,"edge":250},
  {"system":"balustrade","thk":12.0,"hmin":1150,"hmax":1200,"zone":"L","internal":720,"edge":250},
  {"system":"balustrade","thk":12.0,"hmin":1000,"hmax":1150,"zone":"M","internal":800,"edge":250},
  {"system":"balustrade","thk":12.0,"hmin":1150,"hmax":1200,"zone":"M","internal":720,"edge":250},
  {"system":"balustrade","thk":12.0,"hmin":1000,"hmax":1100,"zone":"H","internal":800,"edge":250},
  {"system":"balustrade","thk":12.0,"hmin":1100,"hmax":1200,"zone":"H","internal":720,"edge":250},
  {"system":"balustrade","thk":12.0,"hmin":1000,"hmax":1050,"zone":"VH","internal":800,"edge":250},
  {"system":"balustrade","thk":12.0,"hmin":1050,"hmax":1100,"zone":"VH","internal":720,"edge":250},
  {"system":"balustrade","thk":12.0,"hmin":1000,"hmax":1050,"zone":"EH","internal":720,"edge":250},
  {"system":"balustrade","thk":13.52,"hmin":1000,"hmax":1150,"zone":"L","internal":800,"edge":250},
  {"system":"balustrade","thk":13.52,"hmin":1150,"hmax":1200,"zone":"L","internal":720,"edge":250},
  {"system":"balustrade","thk":13.52,"hmin":1000,"hmax":1150,"zone":"M","internal":800,"edge":250},
  {"system":"balustrade","thk":13.52,"hmin":1150,"hmax":1200,"zone":"M","internal":720,"edge":250},
  {"system":"balustrade","thk":13.52,"hmin":1000,"hmax":1100,"zone":"H","internal":800,"edge":250},
  {"system":"balustrade","thk":13.52,"hmin":1100,"hmax":1200,"zone":"H","internal":720,"edge":250},
  {"system":"balustrade","thk":13.52,"hmin":1000,"hmax":1050,"zone":"VH","internal":800,"edge":250},
  {"system":"balustrade","thk":13.52,"hmin":1050,"hmax":1100,"zone":"VH","internal":720,"edge":250},
  {"system":"balustrade","thk":13.52,"hmin":1000,"hmax":1050,"zone":"EH","internal":720,"edge":250},
  {"system":"balustrade","thk":15.0,"hmin":1000,"hmax":1200,"zone":"L","internal":800,"edge":250},
  {"system":"balustrade","thk":15.0,"hmin":1200,"hmax":1300,"zone":"L","internal":720,"edge":250},
  {"system":"balustrade","thk":15.0,"hmin":1000,"hmax":1200,"zone":"M","internal":800,"edge":250},
  {"system":"balustrade","thk":15.0,"hmin":1200,"hmax":1300,"zone":"M","internal":720,"edge":250},
  {"system":"balustrade","thk":15.0,"hmin":1000,"hmax":1200,"zone":"H","internal":800,"edge":250},
  {"system":"balustrade","thk":15.0,"hmin":1200,"hmax":1300,"zone":"H","internal":720,"edge":250},
  {"system":"balustrade","thk":15.0,"hmin":1000,"hmax":1150,"zone":"VH","internal":800,"edge":250},
  {"system":"balustrade","thk":15.0,"hmin":1150,"hmax":1250,"zone":"VH","internal":720,"edge":250},
  {"system":"balustrade","thk":15.0,"hmin":1000,"hmax":1100,"zone":"EH","internal":800,"edge":250},
  {"system":"balustrade","thk":15.0,"hmin":1100,"hmax":1200,"zone":"EH","internal":720,"edge":250},
  {"system":"balustrade","thk":17.52,"hmin":1000,"hmax":1200,"zone":"L","internal":800,"edge":250},
  {"system":"balustrade","thk":17.52,"hmin":1200,"hmax":1300,"zone":"L","internal":720,"edge":250},
  {"system":"balustrade","thk":17.52,"hmin":1000,"hmax":1200,"zone":"M","internal":800,"edge":250},
  {"system":"balustrade","thk":17.52,"hmin":1200,"hmax":1300,"zone":"M","internal":720,"edge":250},
  {"system":"balustrade","thk":17.52,"hmin":1000,"hmax":1200,"zone":"H","internal":800,"edge":250},
  {"system":"balustrade","thk":17.52,"hmin":1200,"hmax":1300,"zone":"H","internal":720,"edge":250},
  {"system":"balustrade","thk":17.52,"hmin":1000,"hmax":1150,"zone":"VH","internal":800,"edge":250},
  {"system":"balustrade","thk":17.52,"hmin":1150,"hmax":1250,"zone":"VH","internal":720,"edge":250},
  {"system":"balustrade","thk":17.52,"hmin":1000,"hmax":1100,"zone":"EH","internal":800,"edge":250},
  {"system":"balustrade","thk":17.52,"hmin":1100,"hmax":1200,"zone":"EH","internal":720,"edge":250},
  {"system":"pool","thk":12.0,"hmin":1200,"hmax":1200,"zone":"L","internal":1200,"edge":500},
  {"system":"pool","thk":12.0,"hmin":1200,"hmax":1200,"zone":"M","internal":1200,"edge":500},
  {"system":"pool","thk":12.0,"hmin":1200,"hmax":1200,"zone":"H","internal":1000,"edge":500},
  {"system":"pool","thk":12.0,"hmin":1200,"hmax":1200,"zone":"VH","internal":750,"edge":375},
  {"system":"pool","thk":15.0,"hmin":1200,"hmax":1300,"zone":"L","internal":1000,"edge":500},
  {"system":"pool","thk":15.0,"hmin":1200,"hmax":1300,"zone":"M","internal":1000,"edge":500},
  {"system":"pool","thk":15.0,"hmin":1200,"hmax":1300,"zone":"H","internal":750,"edge":375},
  {"system":"pool","thk":15.0,"hmin":1200,"hmax":1300,"zone":"VH","internal":600,"edge":300},
  {"system":"pool","thk":15.0,"hmin":1200,"hmax":1200,"zone":"EH","internal":600,"edge":300}
];

// SP15 PS1 (verbatim from legacy SP15 calculator) - do not modify manually
export const SP15_PS1: Ps1Row[] = [
  {"system":"balustrade","thk":12.0,"hmin":1000,"hmax":1150,"zone":"L","internal":800,"edge":250},
  {"system":"balustrade","thk":12.0,"hmin":1150,"hmax":1200,"zone":"L","internal":750,"edge":250},
  {"system":"balustrade","thk":12.0,"hmin":1000,"hmax":1150,"zone":"M","internal":800,"edge":250},
  {"system":"balustrade","thk":12.0,"hmin":1150,"hmax":1200,"zone":"M","internal":750,"edge":250},
  {"system":"balustrade","thk":12.0,"hmin":1000,"hmax":1150,"zone":"H","internal":800,"edge":250},
  {"system":"balustrade","thk":12.0,"hmin":1150,"hmax":1200,"zone":"H","internal":750,"edge":250},
  {"system":"balustrade","thk":12.0,"hmin":1000,"hmax":1100,"zone":"VH","internal":800,"edge":250},
  {"system":"balustrade","thk":12.0,"hmin":1050,"hmax":1150,"zone":"VH","internal":750,"edge":250},
  {"system":"balustrade","thk":12.0,"hmin":1000,"hmax":1050,"zone":"EH","internal":800,"edge":200},
  {"system":"balustrade","thk":12.0,"hmin":1050,"hmax":1100,"zone":"EH","internal":750,"edge":200},
  {"system":"balustrade","thk":13.52,"hmin":1000,"hmax":1150,"zone":"L","internal":800,"edge":250},
  {"system":"balustrade","thk":13.52,"hmin":1150,"hmax":1200,"zone":"L","internal":750,"edge":250},
  {"system":"balustrade","thk":13.52,"hmin":1000,"hmax":1150,"zone":"M","internal":800,"edge":250},
  {"system":"balustrade","thk":13.52,"hmin":1150,"hmax":1200,"zone":"M","internal":750,"edge":250},
  {"system":"balustrade","thk":13.52,"hmin":1000,"hmax":1150,"zone":"H","internal":800,"edge":250},
  {"system":"balustrade","thk":13.52,"hmin":1150,"hmax":1200,"zone":"H","internal":750,"edge":250},
  {"system":"balustrade","thk":13.52,"hmin":1000,"hmax":1100,"zone":"VH","internal":800,"edge":250},
  {"system":"balustrade","thk":13.52,"hmin":1050,"hmax":1150,"zone":"VH","internal":750,"edge":250},
  {"system":"balustrade","thk":13.52,"hmin":1000,"hmax":1050,"zone":"EH","internal":800,"edge":200},
  {"system":"balustrade","thk":13.52,"hmin":1050,"hmax":1100,"zone":"EH","internal":750,"edge":200},
  {"system":"balustrade","thk":15.0,"hmin":1000,"hmax":1250,"zone":"L","internal":800,"edge":250},
  {"system":"balustrade","thk":15.0,"hmin":1250,"hmax":1300,"zone":"L","internal":750,"edge":250},
  {"system":"balustrade","thk":15.0,"hmin":1000,"hmax":1250,"zone":"M","internal":800,"edge":250},
  {"system":"balustrade","thk":15.0,"hmin":1250,"hmax":1300,"zone":"M","internal":750,"edge":250},
  {"system":"balustrade","thk":15.0,"hmin":1000,"hmax":1250,"zone":"H","internal":800,"edge":250},
  {"system":"balustrade","thk":15.0,"hmin":1250,"hmax":1300,"zone":"H","internal":750,"edge":250},
  {"system":"balustrade","thk":15.0,"hmin":1000,"hmax":1200,"zone":"VH","internal":800,"edge":250},
  {"system":"balustrade","thk":15.0,"hmin":1200,"hmax":1250,"zone":"VH","internal":750,"edge":250},
  {"system":"balustrade","thk":15.0,"hmin":1000,"hmax":1150,"zone":"EH","internal":800,"edge":200},
  {"system":"balustrade","thk":15.0,"hmin":1150,"hmax":1200,"zone":"EH","internal":750,"edge":200},
  {"system":"balustrade","thk":17.52,"hmin":1000,"hmax":1250,"zone":"L","internal":800,"edge":250},
  {"system":"balustrade","thk":17.52,"hmin":1250,"hmax":1300,"zone":"L","internal":750,"edge":250},
  {"system":"balustrade","thk":17.52,"hmin":1000,"hmax":1250,"zone":"M","internal":800,"edge":250},
  {"system":"balustrade","thk":17.52,"hmin":1250,"hmax":1300,"zone":"M","internal":750,"edge":250},
  {"system":"balustrade","thk":17.52,"hmin":1000,"hmax":1250,"zone":"H","internal":800,"edge":250},
  {"system":"balustrade","thk":17.52,"hmin":1250,"hmax":1300,"zone":"H","internal":750,"edge":250},
  {"system":"balustrade","thk":17.52,"hmin":1000,"hmax":1200,"zone":"VH","internal":800,"edge":250},
  {"system":"balustrade","thk":17.52,"hmin":1200,"hmax":1250,"zone":"VH","internal":750,"edge":250},
  {"system":"balustrade","thk":17.52,"hmin":1000,"hmax":1150,"zone":"EH","internal":800,"edge":200},
  {"system":"balustrade","thk":17.52,"hmin":1150,"hmax":1200,"zone":"EH","internal":750,"edge":200},
  {"system":"pool","thk":12.0,"hmin":1200,"hmax":1300,"zone":"L","internal":1000,"edge":500},
  {"system":"pool","thk":12.0,"hmin":1200,"hmax":1300,"zone":"M","internal":1000,"edge":500},
  {"system":"pool","thk":12.0,"hmin":1200,"hmax":1250,"zone":"H","internal":1000,"edge":500},
  {"system":"pool","thk":12.0,"hmin":1200,"hmax":1250,"zone":"VH","internal":800,"edge":375},
  {"system":"pool","thk":15.0,"hmin":1200,"hmax":1300,"zone":"L","internal":1000,"edge":500},
  {"system":"pool","thk":15.0,"hmin":1200,"hmax":1300,"zone":"M","internal":1000,"edge":500},
  {"system":"pool","thk":15.0,"hmin":1200,"hmax":1300,"zone":"H","internal":1000,"edge":500},
  {"system":"pool","thk":15.0,"hmin":1200,"hmax":1300,"zone":"VH","internal":800,"edge":375},
  {"system":"pool","thk":15.0,"hmin":1200,"hmax":1250,"zone":"EH","internal":700,"edge":300},
  {"system":"pool","thk":15.0,"hmin":1250,"hmax":1300,"zone":"EH","internal":600,"edge":300}
];

// RMP160 PS1 (verbatim from legacy RMP160 calculator) - do not modify manually
export const RMP160_PS1: Ps1Row[] = [
  {"system":"balustrade","thk":12.0,"hmin":1000,"hmax":1150,"zone":"L","internal":850,"edge":200},
  {"system":"balustrade","thk":12.0,"hmin":1150,"hmax":1200,"zone":"L","internal":700,"edge":200},
  {"system":"balustrade","thk":12.0,"hmin":1000,"hmax":1150,"zone":"M","internal":850,"edge":200},
  {"system":"balustrade","thk":12.0,"hmin":1150,"hmax":1200,"zone":"M","internal":700,"edge":200},
  {"system":"balustrade","thk":12.0,"hmin":1000,"hmax":1100,"zone":"H","internal":750,"edge":200},
  {"system":"balustrade","thk":12.0,"hmin":1100,"hmax":1200,"zone":"H","internal":600,"edge":200},
  {"system":"balustrade","thk":12.0,"hmin":1000,"hmax":1050,"zone":"VH","internal":750,"edge":200},
  {"system":"balustrade","thk":12.0,"hmin":1050,"hmax":1100,"zone":"VH","internal":600,"edge":150},
  {"system":"balustrade","thk":13.52,"hmin":1000,"hmax":1150,"zone":"L","internal":850,"edge":200},
  {"system":"balustrade","thk":13.52,"hmin":1150,"hmax":1200,"zone":"L","internal":700,"edge":200},
  {"system":"balustrade","thk":13.52,"hmin":1000,"hmax":1150,"zone":"M","internal":850,"edge":200},
  {"system":"balustrade","thk":13.52,"hmin":1150,"hmax":1200,"zone":"M","internal":700,"edge":200},
  {"system":"balustrade","thk":13.52,"hmin":1000,"hmax":1100,"zone":"H","internal":750,"edge":200},
  {"system":"balustrade","thk":13.52,"hmin":1100,"hmax":1200,"zone":"H","internal":600,"edge":200},
  {"system":"balustrade","thk":13.52,"hmin":1000,"hmax":1050,"zone":"VH","internal":750,"edge":200},
  {"system":"balustrade","thk":13.52,"hmin":1050,"hmax":1100,"zone":"VH","internal":600,"edge":150},
  {"system":"pool","thk":12.0,"hmin":1200,"hmax":1200,"zone":"L","internal":800,"edge":300},
  {"system":"pool","thk":12.0,"hmin":1200,"hmax":1200,"zone":"M","internal":800,"edge":300},
  {"system":"pool","thk":12.0,"hmin":1200,"hmax":1200,"zone":"H","internal":700,"edge":300},
  {"system":"pool","thk":12.0,"hmin":1200,"hmax":1200,"zone":"VH","internal":600,"edge":200}
];

// SMP160 PS1 (verbatim from legacy SMP160 calculator) - do not modify manually
export const SMP160_PS1: Ps1Row[] = [
  {"system":"balustrade","thk":12.0,"hmin":1000,"hmax":1150,"zone":"L","internal":850,"edge":200},
  {"system":"balustrade","thk":12.0,"hmin":1150,"hmax":1200,"zone":"L","internal":700,"edge":200},
  {"system":"balustrade","thk":12.0,"hmin":1000,"hmax":1150,"zone":"M","internal":850,"edge":200},
  {"system":"balustrade","thk":12.0,"hmin":1150,"hmax":1200,"zone":"M","internal":700,"edge":200},
  {"system":"balustrade","thk":12.0,"hmin":1000,"hmax":1100,"zone":"H","internal":750,"edge":200},
  {"system":"balustrade","thk":12.0,"hmin":1100,"hmax":1200,"zone":"H","internal":600,"edge":200},
  {"system":"balustrade","thk":12.0,"hmin":1000,"hmax":1050,"zone":"VH","internal":750,"edge":200},
  {"system":"balustrade","thk":12.0,"hmin":1050,"hmax":1100,"zone":"VH","internal":600,"edge":150},
  {"system":"balustrade","thk":13.52,"hmin":1000,"hmax":1150,"zone":"L","internal":850,"edge":200},
  {"system":"balustrade","thk":13.52,"hmin":1150,"hmax":1200,"zone":"L","internal":700,"edge":200},
  {"system":"balustrade","thk":13.52,"hmin":1000,"hmax":1150,"zone":"M","internal":850,"edge":200},
  {"system":"balustrade","thk":13.52,"hmin":1150,"hmax":1200,"zone":"M","internal":700,"edge":200},
  {"system":"balustrade","thk":13.52,"hmin":1000,"hmax":1100,"zone":"H","internal":750,"edge":200},
  {"system":"balustrade","thk":13.52,"hmin":1100,"hmax":1200,"zone":"H","internal":600,"edge":200},
  {"system":"balustrade","thk":13.52,"hmin":1000,"hmax":1050,"zone":"VH","internal":750,"edge":200},
  {"system":"balustrade","thk":13.52,"hmin":1050,"hmax":1100,"zone":"VH","internal":600,"edge":150},
  {"system":"pool","thk":12.0,"hmin":1200,"hmax":1200,"zone":"L","internal":800,"edge":300},
  {"system":"pool","thk":12.0,"hmin":1200,"hmax":1200,"zone":"M","internal":800,"edge":300},
  {"system":"pool","thk":12.0,"hmin":1200,"hmax":1200,"zone":"H","internal":700,"edge":300},
  {"system":"pool","thk":12.0,"hmin":1200,"hmax":1200,"zone":"VH","internal":600,"edge":200}
];

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

export function lookupSpigotsPs1(calcKey: string | null, fenceType: string | undefined, thk: string | undefined, ht: number | undefined, zone: string | undefined) {
  if (!calcKey || !fenceType || !thk || !ht || !zone) return null;
  const system = fenceType; // 'balustrade' or 'pool'
  if (calcKey === 'sp10') return genericLookup(SP10_PS1, system, thk, ht, zone);
  if (calcKey === 'sp12') return genericLookup(SP12_PS1, system, thk, ht, zone);
  if (calcKey === 'sp13') return genericLookup(SP13_PS1, system, thk, ht, zone);
  if (calcKey === 'sp14') return genericLookup(SP14_PS1, system, thk, ht, zone);
  if (calcKey === 'sp15') return genericLookup(SP15_PS1, system, thk, ht, zone);
  if (calcKey === 'rmp160') return genericLookup(RMP160_PS1, system, thk, ht, zone);
  if (calcKey === 'smp160') return genericLookup(SMP160_PS1, system, thk, ht, zone);
  return null;
}
