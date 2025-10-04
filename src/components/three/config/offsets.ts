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
};

export const MODEL_XZ_OFFSETS_MM: Record<string, { x?: number; z?: number }> = {
  SD50: { x: -9},
};

export const mmToMeters = (mm: number) => mm * 0.001;

export const getModelCodeUpper = (code?: string | null, fallback: string = 'SP12') =>
  (code || fallback).toUpperCase();
