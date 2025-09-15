import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLayoutStore } from '@/store/useLayoutStore';
import SceneCanvas from './SceneCanvas';
import { SpigotLayout } from './objects/SpigotLayout';

// Container page for /:system/:calc/:shape/3d-view
export default function ThreeDView() {
  const { system, calc, shape } = useParams();
  const navigate = useNavigate();
  const input = useLayoutStore(s => s.input);
  const result = useLayoutStore(s => s.result);
  const setLayout = useLayoutStore(s=>s.setLayout);
  const [localSpigotsMode, setLocalSpigotsMode] = useState<'auto'|'2'|'3'|null>(null);

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
    // Update only spigotsPerPanel and re-store same result (geometry recomputed in 3D from mode)
    setLayout({ ...input, spigotsPerPanel: mode }, { ...result });
    setLocalSpigotsMode(mode);
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
          <div className="mt-4 text-[10px] text-slate-500">3D view is indicative only. Dimensions shown reflect calculated spacing.</div>
        </aside>
      </div>
    </div>
  );
}
