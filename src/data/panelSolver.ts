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

// Legacy mixed solver (A/B panels differing by up to 200mm) used only when allowMixed=true
function legacyMixed(
  run: number,
  gapMin: number,
  gapMax: number,
  maxPanelWidth: number,
  panelStep: number,
  ps1?: Ps1Row,
  maxSpigotsPerPanel?: number
): PanelLayoutSide | null {
  const step = panelStep || 1;
  let count = Math.ceil(run / maxPanelWidth);
  while (count < 600) {
    for (let A = maxPanelWidth; A >= 200; A -= step) {
      for (let B = A; B >= A - 200 && B >= 200; B -= step) {
        for (let k = 1; k < count; k++) {
          // Enforce spigot constraints per width if requested
            if (ps1 && maxSpigotsPerPanel) {
              const maxWidthAllowed = ps1.edge * 2 + (maxSpigotsPerPanel - 1) * ps1.internal;
              if (A > maxWidthAllowed) continue;
              if (B > maxWidthAllowed) continue;
            }
          const totalPanelsWidth = (count - k) * A + k * B;
          const gap = (run - totalPanelsWidth) / (count + 1);
          if (gap >= gapMin && gap <= gapMax) {
            return { panelWidths: [...Array(count - k).fill(A), ...Array(k).fill(B)], gap, adjustedLength: run };
          }
        }
      }
    }
    count++;
  }
  return null;
}

// Replicates legacy findBestLayout (without gate handling) including ±5mm nudge
export function findBestLayout(
  run: number,
  gapMin: number,
  gapMax: number,
  maxPanelWidth: number,
  panelStep: number,
  ps1?: Ps1Row,
  maxSpigotsPerPanel?: number,
  allowMixed: boolean = false
): PanelLayoutSide | null {
  // Use legacy preference: try mixed first if allowed, else symmetric
  const tryExact = (): PanelLayoutSide | null => {
    if (allowMixed) {
      return (
        legacyMixed(run, gapMin, gapMax, maxPanelWidth, panelStep, ps1, maxSpigotsPerPanel) ||
        solveSymmetric(run, gapMin, gapMax, maxPanelWidth, panelStep, ps1, maxSpigotsPerPanel)
      );
    }
    return solveSymmetric(run, gapMin, gapMax, maxPanelWidth, panelStep, ps1, maxSpigotsPerPanel);
  };
  let best = tryExact();
  if (best) return best;
  // Nudge ±1..5mm preferring shorter first (- then +) and fewer panels (implicit in underlying solver)
  for (let nudge = 1; nudge <= 5 && !best; nudge++) {
    for (const dir of [-1, 1] as const) {
      const adjusted = run + dir * nudge;
      if (adjusted < 200) continue;
      const candidate = allowMixed
        ? legacyMixed(adjusted, gapMin, gapMax, maxPanelWidth, panelStep, ps1, maxSpigotsPerPanel) ||
          solveSymmetric(adjusted, gapMin, gapMax, maxPanelWidth, panelStep, ps1, maxSpigotsPerPanel)
        : solveSymmetric(adjusted, gapMin, gapMax, maxPanelWidth, panelStep, ps1, maxSpigotsPerPanel);
      if (candidate) {
        // store adjusted length
        candidate.adjustedLength = adjusted;
        best = candidate;
        break;
      }
    }
  }
  return best;
}

// Gate-adjusted layout: when placing a gate in a side, the uniform fence gaps typically reduce by one,
// effectively making the number of gaps equal to the number of panels (cnt) instead of (cnt+1).
// This mirrors the legacy calculator's gate solver. Supports optional mixed panels and spigot constraints.
export function findGateAdjustedLayout(
  run: number,
  gapMin: number,
  gapMax: number,
  maxPanelWidth: number,
  panelStep: number,
  ps1?: Ps1Row,
  maxSpigotsPerPanel?: number,
  allowMixed: boolean = false
): PanelLayoutSide | null {
  const step = panelStep || 1;

  const sym = (): PanelLayoutSide | null => {
    // fewest panels first
    let cnt = Math.ceil(run / maxPanelWidth);
    while (cnt < 600) {
      let pw = Math.min(maxPanelWidth, Math.floor(run / cnt / step) * step);
      while (pw >= 200) {
        // spigot constraint per panel width
        if (ps1 && maxSpigotsPerPanel) {
          const maxWidthAllowed = ps1.edge * 2 + (maxSpigotsPerPanel - 1) * ps1.internal;
          if (pw > maxWidthAllowed) {
            pw = maxWidthAllowed;
          }
        }
        // gate-adjusted gap formula: gaps = cnt
        const gap = (run - pw * cnt) / cnt;
        if (gap >= gapMin && gap <= gapMax) {
          return { panelWidths: Array(cnt).fill(pw), gap, adjustedLength: run };
        }
        pw -= step;
      }
      cnt++;
    }
    return null;
  };

  const mix = (): PanelLayoutSide | null => {
    let cnt = Math.ceil(run / maxPanelWidth);
    while (cnt < 600) {
      for (let A = maxPanelWidth; A >= 200; A -= step) {
        for (let B = A; B >= Math.max(200, A - 200); B -= step) {
          for (let k = 1; k < cnt; k++) {
            if (ps1 && maxSpigotsPerPanel) {
              const maxWidthAllowed = ps1.edge * 2 + (maxSpigotsPerPanel - 1) * ps1.internal;
              if (A > maxWidthAllowed || B > maxWidthAllowed) continue;
            }
            const tot = (cnt - k) * A + k * B;
            const gap = (run - tot) / cnt; // gate-adjusted
            if (gap >= gapMin && gap <= gapMax) {
              return { panelWidths: [...Array(cnt - k).fill(A), ...Array(k).fill(B)], gap, adjustedLength: run };
            }
          }
        }
      }
      cnt++;
    }
    return null;
  };

  // try exact run first
  let best = allowMixed ? (mix() || sym()) : sym();
  if (best) return best;
  // try small nudges ±1..5mm
  for (let n = 1; n <= 5 && !best; n++) {
    for (const dir of [-1, 1] as const) {
      const adjusted = run + dir * n;
      if (adjusted < 200) continue;
      // temporarily recurse using adjusted value
      const candidate = findGateAdjustedLayout(
        adjusted,
        gapMin,
        gapMax,
        maxPanelWidth,
        panelStep,
        ps1,
        maxSpigotsPerPanel,
        allowMixed
      );
      if (candidate) {
        candidate.adjustedLength = adjusted;
        best = candidate;
        break;
      }
    }
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
