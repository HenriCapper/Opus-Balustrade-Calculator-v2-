// Head selection options for standoff and clamp systems
// Maps calculator keys to their available head types with images

import type { CalcKey } from './calcOptions';

// Import SD50 head images
import SD50_SH from '@/assets/standoffs/heads/SD50/SD50-SH-SS.webp';
import SD50_FH from '@/assets/standoffs/heads/SD50/SD50-FH-SS.webp';
import SD50_BH from '@/assets/standoffs/heads/SD50/SD50-BH-SS.webp';
import ASD50 from '@/assets/standoffs/heads/SD50/ASD50-SS.webp';

// Import PF150 clamp images
import PF150R from '@/assets/standoffs/PF150R.webp';

export interface HeadOption {
  value: string;
  label: string;
  image: string;
}

// Head options by calculator
export const HEAD_OPTIONS: Partial<Record<CalcKey, HeadOption[]>> = {
  sd50: [
    {
      value: 'SD50-SH',
      label: 'Screw Head',
      image: SD50_SH,
    },
    {
      value: 'SD50-FH',
      label: 'Flat Head',
      image: SD50_FH,
    },
    {
      value: 'SD50-BH',
      label: 'Bevelled Head',
      image: SD50_BH,
    },
    {
      value: 'ASD50-SH',
      label: 'Adjustable Screw Head',
      image: ASD50,
    },
  ],
  pf150: [
    {
      value: 'PF150',
      label: 'Standard Clamp',
      image: PF150R, // Using same image as placeholder
    },
    {
      value: 'PF150R',
      label: 'Concealed Clamp',
      image: PF150R,
    },
    {
      value: 'PF150S',
      label: 'Square Clamp',
      image: PF150R, // Using same image as placeholder
    },
  ],
  // Add more standoff systems as needed
  // sd75: [...],
  // sd100: [...],
  // pradis: [...],
};

/**
 * Get head options for a specific calculator
 */
export function getHeadOptions(calcKey: CalcKey | null | undefined): HeadOption[] {
  if (!calcKey) return [];
  return HEAD_OPTIONS[calcKey] || [];
}

/**
 * Check if a calculator has head selection options
 */
export function hasHeadSelection(calcKey: CalcKey | null | undefined): boolean {
  if (!calcKey) return false;
  return (HEAD_OPTIONS[calcKey]?.length ?? 0) > 0;
}
