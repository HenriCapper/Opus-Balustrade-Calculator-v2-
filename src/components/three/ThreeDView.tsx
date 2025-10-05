import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLayoutStore } from '@/store/useLayoutStore';
import { CALC_OPTION_MAP, type CalcKey } from '@/data/calcOptions';
import SceneCanvas from './SceneCanvas';
import { SpigotLayout } from './objects/SpigotLayout';
import { findBestLayout, solveSymmetric, aggregatePanels, findGateAdjustedLayout } from '@/data/panelSolver';

// Container page for /:system/:calc/:shape/3d-view
export default function ThreeDView() {
  const { system, calc, shape } = useParams();
  const navigate = useNavigate();
  const input = useLayoutStore(s => s.input);
  const result = useLayoutStore(s => s.result);
  const setLayout = useLayoutStore(s=>s.setLayout);
  const [localSpigotsMode, setLocalSpigotsMode] = useState<'auto'|'2'|'3'|null>(null);
  // Preserve the original (auto) panels summary + totals + layouts so we can restore when user toggles back to 'auto'
  const originalPanelsRef = useRef<{
    summary?: string;
    totalSpigots?: number;
    estimatedSpigots?: number;
    sidePanelLayouts?: any[];
    allPanels?: number[];
    sideGates?: NonNullable<typeof result>['sideGatesRender'];
  } | null>(null);

  // Capture original result once (or when a brand new calculation arrives)
  useEffect(() => {
    // Capture the ORIGINAL auto calculation only when current input mode is 'auto'
    if (result && input?.spigotsPerPanel === 'auto') {
      const key = (result.allPanels || []).join('|');
      if (!originalPanelsRef.current || (originalPanelsRef.current as any)._key !== key) {
        originalPanelsRef.current = {
          summary: result.panelsSummary,
          totalSpigots: result.totalSpigots,
          estimatedSpigots: result.estimatedSpigots,
          sidePanelLayouts: result.sidePanelLayouts,
          allPanels: result.allPanels,
          sideGates: result.sideGatesRender?.map(g => (g ? { ...g } : g)),
          _key: key as any,
        } as any;
      }
    }
  }, [result, input?.spigotsPerPanel]);
  const finishes = useMemo(() => {
    const key = input?.calcKey as CalcKey | undefined;
    return key ? (CALC_OPTION_MAP[key]?.finishes || []) : [];
  }, [input?.calcKey]);

  // If user refreshed or hit URL directly without prior calculation, redirect back
  useEffect(() => {
    if (!input || !result) {
      if (system && calc && shape) {
        navigate(`/${system}/${calc}/${shape}`, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [input, result, system, calc, shape]);

  const title = useMemo(() => {
    if (!input) return '3D Plan';
    return `${input.system?.toUpperCase() || ''} – ${input.calcKey || ''} 3D Plan`;
  }, [input]);

  function applySpigotsMode(mode: 'auto'|'2'|'3'){
    if(!input || !result) return;
    let nextResult = { ...result };
    const ps1 = result.ps1;
    const sideRuns = result.sideRuns || input.sideLengths || [];
    const originalGates = originalPanelsRef.current?.sideGates;
    const gatesMeta = (mode === 'auto' && originalGates ? originalGates : result.sideGatesRender) || [];
    const updatedGates = gatesMeta.map(g => (g ? { ...g } : undefined));
    let gatesDirty = false;
    const fenceType = input.fenceType || 'balustrade';
    const isPool = fenceType.toLowerCase().includes('pool');
    const gapMin = isPool ? 14 : 14;
    const gapMax = isPool ? 99 : 20;
    // Max panel cap (handrail rules like initial calc)
    let cap = 2000;
    if (input.glassThickness === '12' && input.handrail === 'S25') cap = 1700;
    else if (input.handrail === 'S40') cap = 1900;
    // Panel step consistent with LayoutForm (10mm standard, 25mm stock)
    const panelStep = input.glassMode === 'standard' ? 10 : 25;
    const allowMixed = input.glassMode === 'stock' && input.allowMixedSizes;
    const gateCount = gatesMeta.filter(g => g?.enabled).length;
    
    // Function to calculate actual gate total width based on gate meta
    const getGateTotalWidth = (sideIndex: number): number => {
      const gate = gatesMeta[sideIndex];
      if (!gate?.enabled) return 0;
      
      const hingeOnLeft = !!gate.hingeOnLeft;
      const isWallToGlassHinge = hingeOnLeft && gate.panelIndex === 0;
      const hingeGapMm = isWallToGlassHinge ? 7 : 5;
      const isWallToGlassLatch = !hingeOnLeft && gate.panelIndex === 0;
      const latchGapMm = isWallToGlassLatch ? 7.5 : 10;
      
      // Use actual gate leaf width from gate meta or default
      // Clamp to valid range 350-1000mm
      const rawLeafWidth = (gate as any).leafWidth ?? 890;
      const leafWidthMm = Math.max(350, Math.min(1000, rawLeafWidth));
      
      return leafWidthMm + hingeGapMm + latchGapMm;
    };
    
    const effectiveLengthForSide = (len: number, sideIndex: number) => {
      const gate = gatesMeta[sideIndex];
      if (gate?.enabled) {
        const gateTotalWidth = getGateTotalWidth(sideIndex);
        return Math.max(0, len - gateTotalWidth);
      }
      return len;
    };
    const recalcGateStart = (sideIndex: number, layout?: { panelWidths: number[]; gap: number }) => {
      const gate = updatedGates[sideIndex];
      if (!gate?.enabled || !layout || !layout.panelWidths || !layout.panelWidths.length) {
        return;
      }
      const boundaries: number[] = [];
      let cursor = layout.gap;
      layout.panelWidths.forEach((w) => {
        boundaries.push(cursor);
        cursor += w + layout.gap;
      });
      if (!boundaries.length) return;
      const clampedIdx = Math.min(Math.max(gate.panelIndex ?? 0, 0), boundaries.length - 1);
      const fallback = boundaries[clampedIdx];
      const target = typeof gate.gateStartMm === 'number' ? gate.gateStartMm : fallback;
      let bestIdx = clampedIdx;
      let bestVal = fallback;
      let bestDist = Math.abs(fallback - target);
      boundaries.forEach((val, idx) => {
        const dist = Math.abs(val - target);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = idx;
          bestVal = val;
        }
      });
      gate.panelIndex = Math.min(layout.panelWidths.length - 1, Math.max(0, bestIdx));
      gate.gateStartMm = bestVal;
      gatesDirty = true;
    };
    const solverRow = ps1 ? { internal: ps1.internal, edge: ps1.edge, system: ps1.source||'spigots', thk:0,hmin:0,hmax:0,zone:'' } as any : null;
    const solveGateLayout = (
      len: number,
      maxSpigots?: number
    ): { panelWidths:number[]; gap:number; adjustedLength:number; } | null => {
      if (!solverRow) return null;
      return (findGateAdjustedLayout as unknown as (
        run: number,
        gapMin: number,
        gapMax: number,
        maxPanelWidth: number,
        panelStep: number,
        ps1?: any,
        maxSpigotsPerPanel?: number,
        allowMixed?: boolean
      ) => { panelWidths:number[]; gap:number; adjustedLength:number; } | null)(
        len,
        gapMin,
        gapMax,
        cap,
        panelStep,
        solverRow,
        maxSpigots,
        allowMixed
      );
    };
    const solvePanelLayout = (
      len: number,
      maxSpigots?: number
    ): { panelWidths:number[]; gap:number; adjustedLength:number; } | null => {
      if (!solverRow) return null;
      return (
        findBestLayout(
          len,
          gapMin,
          gapMax,
          cap,
          panelStep,
          solverRow,
          maxSpigots,
          allowMixed
        ) ||
        solveSymmetric(
          len,
          gapMin,
          gapMax,
          cap,
          panelStep,
          solverRow,
          maxSpigots
        )
      );
    };

    if (mode === 'auto') {
      if (originalPanelsRef.current) {
        // Restore saved original state
        nextResult = {
          ...nextResult,
          panelsSummary: originalPanelsRef.current.summary,
          totalSpigots: originalPanelsRef.current.totalSpigots,
          estimatedSpigots: originalPanelsRef.current.estimatedSpigots,
          sidePanelLayouts: originalPanelsRef.current.sidePanelLayouts,
          allPanels: originalPanelsRef.current.allPanels,
          sideGatesRender: originalPanelsRef.current.sideGates?.map(g => (g ? { ...g } : g)),
        } as any;
      } else if (ps1) {
        // Fallback: recompute layouts with no spigot constraint (auto) if original missing
        const newLayouts: { panelWidths:number[]; gap:number; adjustedLength:number;}[] = [];
        const allPanels: number[] = [];
        sideRuns.forEach((len:number, idx:number) => {
          const effectiveLen = effectiveLengthForSide(len, idx);
          const hasGate = !!gatesMeta[idx]?.enabled;
          const layout = hasGate ? solveGateLayout(effectiveLen) : solvePanelLayout(effectiveLen);
          if (layout) {
            newLayouts.push(layout);
            allPanels.push(...layout.panelWidths);
            recalcGateStart(idx, layout);
          }
        });
        if (allPanels.length) {
          const groups: Record<string,{count:number;width:number;}> = {};
          allPanels.forEach(w=>{ const k=w.toFixed(2); if(!groups[k]) groups[k]={count:0,width:w}; groups[k].count++; });
          const summary = Object.values(groups)
            .sort((a,b)=>b.width - a.width)
            .map(g=>`${g.count} × @${g.width.toFixed(2)} mm (${Math.max(2, Math.ceil((g.width - 2*ps1.edge)/ps1.internal)+1)} spigots each)`).join('<br>');
          const totalSpigotsPanels = allPanels.reduce((acc,w)=>{
            const s = Math.max(2, Math.ceil((w - 2*ps1.edge)/ps1.internal)+1);
            return acc + s;
          },0);
          nextResult = {
            ...nextResult,
            sidePanelLayouts: newLayouts,
            allPanels,
            panelsSummary: summary,
            totalSpigots: totalSpigotsPanels + gateCount * 2,
            estimatedSpigots: totalSpigotsPanels + gateCount * 2,
          };
          if (gatesDirty && updatedGates.length) {
            nextResult = {
              ...nextResult,
              sideGatesRender: updatedGates as any,
            };
          }
        }
      }
      setLayout({ ...input, spigotsPerPanel: mode }, nextResult);
      setLocalSpigotsMode(mode);
      return;
    }


    // Recalculate layouts with spigot constraint
    const maxSpigotsPerPanel = parseInt(mode, 10); // 2 or 3
    const newLayouts: { panelWidths:number[]; gap:number; adjustedLength:number;}[] = [];
    const allPanels: number[] = [];
    if (ps1 && sideRuns.length) {
  // 1) Try to lock a common panel width per opposing side group so panel joints align
  //    across each pair (even indices together, odd indices together). This lets long
  //    sides (often the even group) use a wider width for 3 spigots without being capped
  //    by the shorter sides. We search from the effective maximum allowed width downward
  //    in panelStep increments and pick the first width that yields a valid gap for all
  //    sides in that group. If a group fails, we fall back to the per-side solver.
      const spigotConstrainedWidth = ps1.edge * 2 + (maxSpigotsPerPanel - 1) * ps1.internal;
      const effectiveMaxWidth = Math.min(cap, spigotConstrainedWidth);
      const snapDown = (w:number) => Math.floor(w / (panelStep || 1)) * (panelStep || 1);
      const canSolveWithWidth = (L:number, W:number, hasGate:boolean): {cnt:number; gap:number} | null => {
        // Find smallest count (fewest panels) such that gap in [gapMin, gapMax]
        // Using inequalities to bound cnt quickly
        const step = 1;
        if (L <= 0) return null;
        let cnt: number;
        let cntMax: number;
        if (hasGate) {
          cnt = Math.max(1, Math.ceil(L / (W + gapMax)));
          cntMax = Math.max(cnt, Math.floor(L / (W + gapMin)));
        } else {
          cnt = Math.max(1, Math.ceil((L - gapMax) / (W + gapMax)));
          cntMax = Math.max(cnt, Math.floor((L - gapMin) / (W + gapMin)));
        }
        for (; cnt <= Math.min(600, cntMax); cnt += step) {
          const gap = hasGate ? (L - cnt * W) / cnt : (L - cnt * W) / (cnt + 1);
          if (gap >= gapMin && gap <= gapMax) return { cnt, gap };
        }
        return null;
      };

  const groups: number[][] = [[], []];
  sideRuns.forEach((_, i) => groups[i % 2].push(i));

      const groupWidth: (number | null)[] = [null, null];
      for (let gi = 0; gi < groups.length; gi++) {
        const indices = groups[gi];
        if (indices.length === 0) continue;
        let chosen: number | null = null;

        // Heuristic for custom shapes: derive width from the LONGEST side in the group
        // so short sides don't dictate an excessively small common width.
  const isCustom = String((input as any).shape || '').toLowerCase().includes('custom');
        if (isCustom) {
          const longestIdx = indices.slice().sort((a,b)=> sideRuns[b] - sideRuns[a])[0];
          const hasGate = !!gatesMeta[longestIdx]?.enabled;
          const len = effectiveLengthForSide(sideRuns[longestIdx], longestIdx);
          // Solve per-side with constraint to get its natural widest width
          const layoutLongest = hasGate ? solveGateLayout(len, maxSpigotsPerPanel) : solvePanelLayout(len, maxSpigotsPerPanel);
          if (layoutLongest && layoutLongest.panelWidths.length) {
            const wCandidate = snapDown(Math.min(effectiveMaxWidth, Math.max(...layoutLongest.panelWidths)));
            const actualSpigots = Math.max(2, Math.ceil((wCandidate - 2 * ps1.edge) / ps1.internal) + 1);
            if (wCandidate >= 200 && actualSpigots <= maxSpigotsPerPanel) {
              chosen = wCandidate;
            }
          }
        }
        // Non-custom or fallback: search downward like before with relaxed feasibility rule
        if (chosen == null) {
          for (let W = snapDown(effectiveMaxWidth); W >= 200; W -= (panelStep || 1)) {
            const actualSpigots = Math.max(2, Math.ceil((W - 2 * ps1.edge) / ps1.internal) + 1);
            if (actualSpigots > maxSpigotsPerPanel) continue;
            const feasibleCount = indices.reduce((acc,i)=>{
              const hasGate = !!gatesMeta[i]?.enabled;
              const effLen = effectiveLengthForSide(sideRuns[i], i);
              return acc + (canSolveWithWidth(effLen, W, hasGate) ? 1 : 0);
            }, 0);
            const need = Math.min(2, indices.length);
            if (feasibleCount >= need) { chosen = W; break; }
          }
        }
        groupWidth[gi] = chosen;
      }

      const fallBackToPerSide = groupWidth.every(w => w == null);

      if (maxSpigotsPerPanel === 3 && !fallBackToPerSide) {
        // Build layouts using the group's width when available; if a group has no common
        // width, fall back to per-side solver just for those indices
        sideRuns.forEach((len:number, idx:number) => {
          const gi = idx % 2;
          const W = groupWidth[gi];
          const hasGate = !!gatesMeta[idx]?.enabled;
          const effLen = effectiveLengthForSide(len, idx);
          if (W != null) {
            const solved = canSolveWithWidth(effLen, W, hasGate);
            if (solved) {
              const { cnt, gap } = solved;
              const layout = { panelWidths: Array(cnt).fill(W), gap, adjustedLength: effLen };
              newLayouts.push(layout);
              allPanels.push(...layout.panelWidths);
              recalcGateStart(idx, layout);
              return;
            }
          }
          // Per-side fallback for this particular side
          const layout = hasGate ? solveGateLayout(effLen, maxSpigotsPerPanel) : solvePanelLayout(effLen, maxSpigotsPerPanel);
          if (layout) {
            newLayouts.push(layout);
            allPanels.push(...layout.panelWidths);
            recalcGateStart(idx, layout);
          }
        });
      } else {
        // Fallback: Try legacy findBestLayout per side (previous behavior)
        sideRuns.forEach((len:number, idx:number) => {
          const hasGate = !!gatesMeta[idx]?.enabled;
          const effLen = effectiveLengthForSide(len, idx);
          const layout = hasGate ? solveGateLayout(effLen, maxSpigotsPerPanel) : solvePanelLayout(effLen, maxSpigotsPerPanel);
          if (layout) {
            newLayouts.push(layout);
            allPanels.push(...layout.panelWidths);
            recalcGateStart(idx, layout);
          }
        });
      }
    }
    // Aggregate with actual spigot count (should equal forced)
    if (ps1 && allPanels.length) {
      aggregatePanels(allPanels, { internal: ps1.internal, edge: ps1.edge, system: ps1.source||'spigots', thk:0,hmin:0,hmax:0,zone:'' } as any);
      // Force display spigots each to chosen mode (ensures consistent legacy formatting)
      const groups: Record<string,{count:number;width:number;}> = {};
      allPanels.forEach(w => { const k = w.toFixed(2); if(!groups[k]) groups[k]={count:0,width:w}; groups[k].count++; });
      const summary = Object.values(groups)
        .sort((a,b)=>b.width - a.width)
        .map(g => `${g.count} × @${g.width.toFixed(2)} mm (${maxSpigotsPerPanel} spigots each)`) // match forced mode style
        .join('<br>');
      const totalPanels = allPanels.length;
      const totalSpigots = totalPanels * maxSpigotsPerPanel + gateCount * 2;
      nextResult = {
        ...nextResult,
        sidePanelLayouts: newLayouts,
        allPanels,
        panelsSummary: summary,
        totalSpigots,
        estimatedSpigots: totalSpigots,
      };
      if (gatesDirty && updatedGates.length) {
        nextResult = {
          ...nextResult,
          sideGatesRender: updatedGates as any,
        };
      }
    }
    if (!gatesDirty && updatedGates.length && ps1) {
      nextResult = {
        ...nextResult,
        sideGatesRender: updatedGates as any,
      };
    }
    setLayout({ ...input, spigotsPerPanel: mode }, nextResult);
    setLocalSpigotsMode(mode);
  }

  function applyFinish(next: string){
    if(!input || !result) return;
    setLayout({ ...input, finish: next }, { ...result });
  }

  // Helper function to regenerate panel summary with correct hardware terminology
  function regeneratePanelSummary(
    allPanels: number[], 
    ps1: { internal: number; edge: number },
    systemType: string,
    calcKey?: string
  ): string {
    const isPost = systemType === 'posts';
    const isStandoff = systemType === 'standoffs';
    const isChannel = systemType === 'channels';
    const isSD50 = calcKey === 'sd50';
    
    const hardwareUnit = isPost 
      ? 'post' 
      : isStandoff 
        ? 'standoff' 
        : isChannel 
          ? 'channel' 
          : 'spigot';
    
    const groups: Record<string,{count:number;width:number;}> = {};
    allPanels.forEach(w => {
      const k = w.toFixed(2);
      if(!groups[k]) groups[k] = {count:0, width:w};
      groups[k].count++;
    });
    
    return Object.values(groups)
      .sort((a,b)=>b.width - a.width)
      .map(g => {
        let hardwareCount: number;
        if (isPost) {
          hardwareCount = g.width <= 600 ? 1 : 2;
        } else {
          hardwareCount = Math.max(2, Math.ceil((g.width - 2*ps1.edge)/ps1.internal)+1);
        }
        // For SD50, show disc count (2× positions)
        const displayCount = isSD50 ? hardwareCount * 2 : hardwareCount;
        const plural = displayCount > 1 ? 's' : '';
        return `${g.count} × @${g.width.toFixed(2)} mm (${displayCount} ${hardwareUnit}${plural} each)`;
      })
      .join('<br>');
  }

  return (
    <div className="flex h-dvh flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <h1 className="text-sm font-semibold text-slate-700">{title}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
          >Back</button>
          <button
            onClick={() => {
              if (system && calc && shape) navigate(`/${system}/${calc}/${shape}`);
            }}
            className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-sky-600"
          >Edit Layout</button>
        </div>
      </div>
      <div className="flex flex-1 flex-col md:flex-row">
        <div className="flex-1">
          <SceneCanvas>
            <SpigotLayout />
          </SceneCanvas>
        </div>
        <aside className="w-full max-w-xs border-t md:border-t-0 md:border-l border-slate-200 bg-white p-4 text-xs">
          <h2 className="mb-2 font-semibold text-slate-700">Summary</h2>
          {result && (
            <ul className="space-y-1">
              <li><span className="font-medium">Total Run:</span> {result.totalRun} mm</li>
              {result.totalSpigots && (() => {
                const isPost = input?.system === 'posts';
                const isStandoff = input?.system === 'standoffs';
                const isChannel = input?.system === 'channels';
                const isSD50 = input?.calcKey === 'sd50';
                const label = isPost ? 'Posts' : isStandoff ? 'Standoffs' : isChannel ? 'Channels' : 'Spigots';
                // SD50 has 2 discs per position, show actual disc count
                const count = isSD50 ? result.totalSpigots * 2 : result.totalSpigots;
                return <li><span className="font-medium">{label}:</span> {count}</li>;
              })()}
              {(() => {
                // Regenerate panel summary for non-spigot systems to show correct terminology
                const needsRegeneration = input?.system !== 'spigots' && result.allPanels && result.ps1;
                if (needsRegeneration && result.allPanels && result.ps1) {
                  const summary = regeneratePanelSummary(
                    result.allPanels, 
                    { internal: result.ps1.internal, edge: result.ps1.edge },
                    input!.system!,
                    input?.calcKey || undefined
                  );
                  return <li className="leading-snug" dangerouslySetInnerHTML={{ __html: summary }} />;
                } else if (result.panelsSummary) {
                  return <li className="leading-snug" dangerouslySetInnerHTML={{ __html: result.panelsSummary }} />;
                }
                return null;
              })()}
            </ul>
          )}
          {input && input.system==='spigots' && (
            <div className="mt-4">
              <p className="mb-1 font-medium text-slate-600">Spigots per panel</p>
              <div className="flex flex-wrap gap-2">
                {(['auto','2','3'] as const).map(m => (
                  <button
                    key={m}
                    onClick={()=>applySpigotsMode(m)}
                    className={`rounded border px-2 py-1 text-[11px] ${ (localSpigotsMode || input.spigotsPerPanel) === m ? 'bg-sky-500 border-sky-500 text-white' : 'border-slate-300 text-slate-600 hover:bg-slate-100'}`}
                  >{m}</button>
                ))}
              </div>
            </div>
          )}
          {finishes.length > 0 && (
            <div className="mt-4">
              <p className="mb-1 font-medium text-slate-600">Hardware finish</p>
              <select
                value={input?.finish ?? finishes[0]}
                onChange={(e)=>applyFinish(e.target.value)}
                className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-[11px] text-slate-700 hover:bg-slate-50"
              >
                {finishes.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          )}
          <div className="mt-4 text-[10px] text-slate-500">3D view is indicative only. Dimensions shown reflect calculated spacing.</div>
        </aside>
      </div>
    </div>
  );
}
