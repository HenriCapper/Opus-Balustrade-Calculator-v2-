import type { Ps1Row } from './spigotsPs1';

export interface PanelLayoutSide {
  panelWidths: number[]; // mm
  gap: number; // mm
  adjustedLength: number; // mm after potential nudge
}

// Enhanced symmetrical solver that respects spigot constraints from legacy SP12 calculator.
// When maxSpigotsPerPanel is specified, panel widths are constrained to not exceed
// the maximum width achievable with that number of spigots: edge*2 + (spigots-1)*internalSpacing
export function solveSymmetric(
  run: number, 
  gapMin: number, 
  gapMax: number, 
  maxPanelWidth: number, 
  panelStep: number,
  ps1?: Ps1Row,
  maxSpigotsPerPanel?: number
): PanelLayoutSide | null {
  let best: PanelLayoutSide | null = null;
  
  // Apply spigot constraint to max panel width if specified
  let effectiveMaxWidth = maxPanelWidth;
  if (maxSpigotsPerPanel && ps1) {
    const spigotConstrainedWidth = ps1.edge * 2 + (maxSpigotsPerPanel - 1) * ps1.internal;
    effectiveMaxWidth = Math.min(maxPanelWidth, spigotConstrainedWidth);
  }
  
  // Panel count lower bound via effective max width
  let cnt = Math.ceil(run / effectiveMaxWidth);
  while (cnt < 600) {
    // derive candidate width by distributing run minus gaps; iterate widths descending
    let pw = Math.min(effectiveMaxWidth, Math.floor(run / cnt / (panelStep || 1)) * (panelStep || 1));
    while (pw >= 200) {
      // Additional check: ensure panel width doesn't exceed spigot-constrained width
      if (maxSpigotsPerPanel && ps1) {
        const actualSpigots = spigotsForPanel(pw, ps1);
        if (actualSpigots > maxSpigotsPerPanel) {
          // This panel width requires too many spigots, reduce it
          pw = ps1.edge * 2 + (maxSpigotsPerPanel - 1) * ps1.internal;
          if (pw < 200) break; // Too small, try next count
        }
      }
      
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
