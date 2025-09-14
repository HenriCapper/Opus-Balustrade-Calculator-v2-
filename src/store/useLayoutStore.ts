import { create } from 'zustand';

export interface LayoutCalculationInput {
  system: string | null;
  calcKey: string | null;
  shape: string | null;
  sideLengths: number[]; // mm per side A,B,C,D (empty entries ignored)
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
}

export interface Ps1ResultRow {
  internal: number; // internal spacing mm
  edge: number;     // edge spacing mm
  source: 'sp10' | 'sp12' | 'sp13';
  meta?: Record<string, any>;
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
