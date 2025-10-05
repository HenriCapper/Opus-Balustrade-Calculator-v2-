import { create } from 'zustand';

export interface LayoutCalculationInput {
  system: string | null;
  calcKey: string | null;
  shape: string | null;
  sideLengths: number[]; // mm per side A,B,C,D (empty entries ignored)
  // For custom shape: ordered vectors (dx, dy in mm) describing each run direction.
  // If provided, 3D layout will follow these vectors instead of orthogonal pattern.
  customVectors?: { dx: number; dy: number; length: number; id?: string }[];
  fenceType?: string;
  fixingType?: string;
  windZone?: string;
  glassHeight?: number;
  glassThickness?: string;
  handrail?: string;
  glassMode?: 'standard' | 'stock';
  gapSize?: number;
  allowMixedSizes?: boolean;
  spigotsPerPanel?: 'auto' | '2' | '3';
  finish?: string;
  // Global gate leaf width (mm) applied to any enabled gate on a side/run
  gateLeafWidth?: number; // default 890mm
  discHead?: string | null;
  extraPackers?: number | null;
  powdercoatColor?: string | null;
  // Gate configuration per side (for tracking enabled states)
  sideGates?: { enabled: boolean; position: 'left'|'middle'|'right'; hingeOnLeft?: boolean }[];
}

export interface Ps1ResultRow {
  internal: number; // internal spacing mm
  edge: number;     // edge spacing mm
  source: 'sp10' | 'sp12' | 'sp13';
  meta?: Record<string, unknown>;
}

export interface OrderListItem {
  code: string;
  description: string;
  quantity: number;
}

export interface LayoutCalculationResult {
  totalRun: number; // mm
  sideRuns: number[]; // mm per side used
  ps1?: Ps1ResultRow | null;
  estimatedSpigots?: number; // simple estimate
  estimatedPanels?: number; // basic panel count
  notes?: string[];
  panelsSummary?: string; // e.g. "4 × @970.00 mm (2 spigots each)"
  totalSpigots?: number; // precise total spigots
  // New detailed per-side panel data for 3D view
  sidePanelLayouts?: {
    panelWidths: number[]; // ordered across the side
    gap: number;           // uniform gap between panels & ends (legacy symmetric solver)
    adjustedLength: number; // side length used during solving (may equal original)
  }[];
  // Flattened list of all panel widths (ordered by sides) for convenience
  allPanels?: number[];
  // Gate drawing meta per side (for elevation visuals)
  sideGatesRender?: {
    enabled: boolean;
    panelIndex: number; // draw gate after this panel
    hingeOnLeft: boolean; // default false
    // Optional explicit start position of the gate (mm from side start), used by 3D to align precisely
    gateStartMm?: number;
  }[];
  // Global gate leaf width echoed into result for consumers (SideVisuals/3D)
  gateLeafWidth?: number;
  // Structured order list (when available)
  orderItems?: OrderListItem[];
}

export interface LayoutState {
  input: LayoutCalculationInput | null;
  result: LayoutCalculationResult | null;
  setLayout: (input: LayoutCalculationInput, result: LayoutCalculationResult) => void;
  resetLayout: () => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  input: null,
  result: null,
  setLayout: (input, result) => set({ input, result }),
  resetLayout: () => set({ input: null, result: null }),
}));
