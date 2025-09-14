import type { Ps1Row } from './spigotsPs1';

export interface PanelLayoutSide {
  panelWidths: number[]; // mm
  gap: number; // mm
  adjustedLength: number; // mm after potential nudge
}

// Simplified symmetrical solver focusing on matching legacy output for standard mode, no gates, no mixed panels.
// Attempts to find uniform panel width (>=200) such that gaps between panels (including both ends) fall within range.
// Returns the layout with minimal panel count (wider panels) similar to legacy preference.
export function solveSymmetric(run: number, gapMin: number, gapMax: number, maxPanelWidth: number, panelStep: number): PanelLayoutSide | null {
  let best: PanelLayoutSide | null = null;
  // Panel count lower bound via max width
  let cnt = Math.ceil(run / maxPanelWidth);
  while (cnt < 600) {
    // derive candidate width by distributing run minus gaps; iterate widths descending
    let pw = Math.min(maxPanelWidth, Math.floor(run / cnt / (panelStep || 1)) * (panelStep || 1));
    while (pw >= 200) {
      const gap = (run - pw * cnt) / (cnt + 1);
      if (gap >= gapMin && gap <= gapMax) {
        const layout: PanelLayoutSide = { panelWidths: Array(cnt).fill(pw), gap, adjustedLength: run };
        best = layout; // first (widest) valid for this count
        return best; // prefer earliest count (fewest panels)
      }
      pw -= panelStep || 1; // in continuous mode step becomes 1mm for search fallback
    }
    cnt++;
  }
  return best;
}

// Compute spigots per panel replicating legacy formula: max(2, ceil((panelWidth - 2*edge)/internal)+1)
export function spigotsForPanel(panelWidth: number, ps1: Ps1Row): number {
  return Math.max(2, Math.ceil((panelWidth - 2 * ps1.edge) / ps1.internal) + 1);
}

export interface AggregateResult {
  panelsSummary: string;
  totalSpigots: number;
  totalPanels: number;
}

export function aggregatePanels(panels: number[], ps1: Ps1Row): AggregateResult {
  // group identical widths to two decimals
  const groups: Record<string, { count: number; width: number; spigots: number; }>= {};
  panels.forEach(w => {
    const key = w.toFixed(2);
    if(!groups[key]) groups[key] = { count:0, width:w, spigots: spigotsForPanel(w, ps1) };
    groups[key].count++;
  });
  const summary = Object.values(groups)
    .sort((a,b)=>b.width - a.width)
    .map(g => `${g.count} × @${g.width.toFixed(2)} mm (${g.spigots} spigots each)`) // format like legacy
    .join('<br>');
  const totalSpigots = Object.values(groups).reduce((acc,g)=> acc + g.count * g.spigots,0);
  const totalPanels = panels.length;
  return { panelsSummary: summary, totalSpigots, totalPanels };
}
