import { useLayoutStore } from '@/store/useLayoutStore';
import Button from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';

export default function CompliantLayout(){
  const input = useLayoutStore(s=>s.input);
  const result = useLayoutStore(s=>s.result);
  const navigate = useNavigate();
  if(!input || !result) return null;
  const { ps1 } = result;
  
  // Detect system types for proper hardware labeling
  const isPostSystem = input.system === 'posts' || input.calcKey === 'resolute' || input.calcKey === 'vortex';
  const isStandoffSystem = input.system === 'standoffs' || ['sd50', 'sd75', 'sd100', 'pf150', 'pradis'].includes(input.calcKey || '');
  const isChannelSystem = input.system === 'channels';
  const isSD50 = input.calcKey === 'sd50'; // SD50 has 2 discs per position
  
  const hardwareLabel = isPostSystem 
    ? 'Posts' 
    : isStandoffSystem 
      ? 'Standoffs' 
      : isChannelSystem 
        ? 'Channels' 
        : 'Spigots';
  
  // Derive dynamic overrides when user forces spigots per panel ("2" or "3") after calculation
  let panelsSummary = result.panelsSummary;
  let totalHardware = result.totalSpigots;
  
  // SD50 uses double discs: each mounting position has 2 physical discs
  // The calculation counts positions, but we should show actual disc count
  if (isSD50 && totalHardware) {
    totalHardware = totalHardware * 2;
  }
  
  if (isPostSystem && result.allPanels && result.allPanels.length) {
    // Post system calculation: 1 post for ≤600mm panels, 2 posts for >600mm panels
    const groups: Record<string,{count:number;width:number;}> = {};
    result.allPanels.forEach(w => {
      const key = w.toFixed(2);
      if(!groups[key]) groups[key] = { count:0, width:w };
      groups[key].count++;
    });
    
    panelsSummary = Object.values(groups)
      .sort((a,b)=> b.width - a.width)
      .map(g => {
        const postsPerPanel = g.width <= 600 ? 1 : 2;
        return `${g.count} × @${g.width.toFixed(2)} mm (${postsPerPanel} post${postsPerPanel > 1 ? 's' : ''} each)`;
      })
      .join('<br>');
    
    // Calculate total posts based on panel widths
    totalHardware = result.allPanels.reduce((total, width) => {
      return total + (width <= 600 ? 1 : 2);
    }, 0);
  } else if (input.system === 'spigots' && result.allPanels && result.allPanels.length && input.spigotsPerPanel && input.spigotsPerPanel !== 'auto') {
    // Spigot system with forced spigots per panel
    const forced = parseInt(input.spigotsPerPanel, 10);
    if (!isNaN(forced)) {
      const groups: Record<string,{count:number;width:number;}> = {};
      result.allPanels.forEach(w => {
        const key = w.toFixed(2);
        if(!groups[key]) groups[key] = { count:0, width:w };
        groups[key].count++;
      });
      panelsSummary = Object.values(groups)
        .sort((a,b)=> b.width - a.width)
        .map(g => `${g.count} × @${g.width.toFixed(2)} mm (${forced} spigots each)`) // mimic legacy formatting
        .join('<br>');
      totalHardware = forced * result.allPanels.length;
    }
  }
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-slate-700">Compliant Layout (beta)</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b">
              <th className="w-1/4 bg-slate-50 px-3 py-2 text-left font-medium text-slate-600">Total run</th>
              <td className="px-3 py-2 font-medium">{result.totalRun.toLocaleString()} mm</td>
            </tr>
            <tr className="border-b">
              <th className="bg-slate-50 px-3 py-2 text-left font-medium text-slate-600">Sides</th>
              <td className="px-3 py-2">{result.sideRuns.map(r=> `${r}mm`).join(' + ')}</td>
            </tr>
            {panelsSummary && (
              <tr className="border-b align-top">
                <th className="bg-slate-50 px-3 py-2 text-left font-medium text-slate-600">Panels</th>
                <td className="px-3 py-2" dangerouslySetInnerHTML={{__html: panelsSummary}} />
              </tr>
            )}
            {typeof totalHardware === 'number' && (
              <tr className="border-b">
                <th className="bg-slate-50 px-3 py-2 text-left font-medium text-slate-600">{hardwareLabel}</th>
                <td className="px-3 py-2">{totalHardware}</td>
              </tr>
            )}
            {ps1 && (
              <>
              <tr className="border-b">
                <th className="bg-slate-50 px-3 py-2 text-left font-medium text-slate-600">Internal spacing</th>
                <td className="px-3 py-2">{ps1.internal} mm</td>
              </tr>
              <tr className="border-b">
                <th className="bg-slate-50 px-3 py-2 text-left font-medium text-slate-600">Edge spacing</th>
                <td className="px-3 py-2">{ps1.edge} mm</td>
              </tr>
              </>
            )}
            {!result.panelsSummary && result.estimatedPanels && (
              <tr className="border-b">
                <th className="bg-slate-50 px-3 py-2 text-left font-medium text-slate-600">Panels (est)</th>
                <td className="px-3 py-2">{result.estimatedPanels}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {result.notes && result.notes.length > 0 && (
        <ul className="mt-3 list-disc pl-5 text-xs text-slate-500">
          {result.notes.map((n,i)=> <li key={i}>{n}</li>)}
        </ul>
      )}
      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Button disabled>Download Plan (PDF)</Button>
        <Button disabled>Download Glass Order (PDF)</Button>
        <Button
          disabled={!input || !result || !input.system || !input.calcKey || !input.shape}
          onClick={() => {
            if(!input) return;
            if(input.system && input.calcKey && input.shape){
              navigate(`/${input.system}/${input.calcKey}/${input.shape}/3d-view`);
            }
          }}
        >View 3D Plan</Button>
      </div>
    </div>
  );
}
