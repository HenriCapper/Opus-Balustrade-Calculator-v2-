// Centralized per-model Y offsets (in millimeters)
// Positive values move objects up. Use mmToMeters() when applying to 3D positions.

export const MODEL_Y_OFFSETS_MM: Record<string, number> = {
  SP10: -31,
  SP12: -33,
  SP13: -36,
  SP14: -33,
  SP15: -31,
  RMP160: -41,
  SMP160: -41,
  SD50: 25,
};

// Ground/grid plane Y (in millimeters) per model.
// Slightly below 0 by default to avoid z-fighting.
export const GROUND_Y_OFFSETS_MM: Record<string, number> = {
  SP10: -31,
  SP12: -33,
  SP13: -500,
  SP14: -35,
  SP15: -31,
  RMP160: -41,
  SMP160: -41,
  SD50: -300
};

export const MODEL_XZ_OFFSETS_MM: Record<string, { x?: number; z?: number }> = {
  SD50: { x: -9 },
};

export interface WallRenderConfig {
  /** Offset in millimetres to push the wall backward along the outward normal */
  offsetMm: number;
  /** World-space Y position (in millimetres) for the wall mesh centre */
  centerYMm?: number;
}

export const MODEL_WALL_CONFIG: Record<string, WallRenderConfig> = {
  SP13: { offsetMm: 58, centerYMm: -286.5 },
  SD50: { offsetMm: 75, centerYMm: -50 },
  SD75: { offsetMm: 45, centerYMm: -286.5 },
  SD100: { offsetMm: 45, centerYMm: -286.5 },
  PF150: { offsetMm: 45, centerYMm: -286.5 },
};

export const mmToMeters = (mm: number) => mm * 0.001;

export const getModelCodeUpper = (code?: string | null, fallback: string = 'SP12') =>
  (code || fallback).toUpperCase();
