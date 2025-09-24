import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLayoutStore } from '@/store/useLayoutStore';
import { CALC_OPTION_MAP, type CalcKey } from '@/data/calcOptions';
import SceneCanvas from './SceneCanvas';
import { SpigotLayout } from './objects/SpigotLayout';
import { findBestLayout, solveSymmetric, aggregatePanels } from '@/data/panelSolver';

// Container page for /:system/:calc/:shape/3d-view
export default function ThreeDView() {
  const { system, calc, shape } = useParams();
  const navigate = useNavigate();
  const input = useLayoutStore(s => s.input);
  const result = useLayoutStore(s => s.result);
  const setLayout = useLayoutStore(s=>s.setLayout);
  const [localSpigotsMode, setLocalSpigotsMode] = useState<'auto'|'2'|'3'|null>(null);
  // Preserve the original (auto) panels summary + totals + layouts so we can restore when user toggles back to 'auto'
  const originalPanelsRef = useRef<{ summary?: string; totalSpigots?: number; estimatedSpigots?: number; sidePanelLayouts?: any[]; allPanels?: number[] } | null>(null);

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
        } as any;
      } else if (ps1) {
        // Fallback: recompute layouts with no spigot constraint (auto) if original missing
        const newLayouts: { panelWidths:number[]; gap:number; adjustedLength:number;}[] = [];
        const allPanels: number[] = [];
        sideRuns.forEach((len:number) => {
          const layout = findBestLayout(
            len,
            gapMin,
            gapMax,
            cap,
            panelStep,
            { internal: ps1.internal, edge: ps1.edge, system: ps1.source||'spigots', thk:0,hmin:0,hmax:0,zone:'' } as any,
            undefined,
            allowMixed
          ) || solveSymmetric(
            len,
            gapMin,
            gapMax,
            cap,
            panelStep,
            { internal: ps1.internal, edge: ps1.edge, system: ps1.source||'spigots', thk:0,hmin:0,hmax:0,zone:'' } as any
          );
          if (layout) { newLayouts.push(layout); allPanels.push(...layout.panelWidths); }
        });
        if (allPanels.length) {
          const groups: Record<string,{count:number;width:number;}> = {};
          allPanels.forEach(w=>{ const k=w.toFixed(2); if(!groups[k]) groups[k]={count:0,width:w}; groups[k].count++; });
          const summary = Object.values(groups)
            .sort((a,b)=>b.width - a.width)
            .map(g=>`${g.count} × @${g.width.toFixed(2)} mm (${Math.max(2, Math.ceil((g.width - 2*ps1.edge)/ps1.internal)+1)} spigots each)`).join('<br>');
          const totalSpigots = allPanels.reduce((acc,w)=>{
            const s = Math.max(2, Math.ceil((w - 2*ps1.edge)/ps1.internal)+1);
            return acc + s;
          },0);
          nextResult = {
            ...nextResult,
            sidePanelLayouts: newLayouts,
            allPanels,
            panelsSummary: summary,
            totalSpigots,
            estimatedSpigots: totalSpigots,
          };
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
      sideRuns.forEach((len:number) => {
        // Try legacy findBestLayout with constraint; fallback to symmetric
        const layout = findBestLayout(
          len,
          gapMin,
          gapMax,
          cap,
          panelStep,
          { internal: ps1.internal, edge: ps1.edge, system: ps1.source||'spigots', thk: 0, hmin:0,hmax:0, zone: '' } as any,
          maxSpigotsPerPanel,
          allowMixed
        ) || solveSymmetric(
          len,
          gapMin,
          gapMax,
          cap,
          panelStep,
          { internal: ps1.internal, edge: ps1.edge, system: ps1.source||'spigots', thk: 0, hmin:0,hmax:0, zone: '' } as any,
          maxSpigotsPerPanel
        );
        if (layout) {
          newLayouts.push(layout);
          allPanels.push(...layout.panelWidths);
        }
      });
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
      const totalSpigots = totalPanels * maxSpigotsPerPanel;
      nextResult = {
        ...nextResult,
        sidePanelLayouts: newLayouts,
        allPanels,
        panelsSummary: summary,
        totalSpigots,
        estimatedSpigots: totalSpigots,
      };
    }
    setLayout({ ...input, spigotsPerPanel: mode }, nextResult);
    setLocalSpigotsMode(mode);
  }

  function applyFinish(next: string){
    if(!input || !result) return;
    setLayout({ ...input, finish: next }, { ...result });
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
              {result.totalSpigots && <li><span className="font-medium">Spigots:</span> {result.totalSpigots}</li>}
              {result.panelsSummary && <li className="leading-snug" dangerouslySetInnerHTML={{ __html: result.panelsSummary }} />}
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
