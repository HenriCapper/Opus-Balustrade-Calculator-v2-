import { useLayoutStore } from "@/store/useLayoutStore";
import React from "react";

/**
 * SideVisuals
 * Renders a simple, responsive visualisation of each side/run after calculation.
 * Uses result.sidePanelLayouts (uniform gap per side) to draw panels and gaps scaled to pixels.
 * Matches the spirit of the legacy calculators: blue panels with gap values above.
 */
export default function SideVisuals() {
  const input = useLayoutStore((s) => s.input);
  const result = useLayoutStore((s) => s.result);

  if (!input || !result) return null;
  const layouts = result.sidePanelLayouts || [];
  const runs = result.sideRuns || [];
  const gatesMeta = result.sideGatesRender || [];
  if (!layouts.length || !runs.length) return null;

  const sideLabels = ["A", "B", "C", "D"];

  return (
    <div className="mt-6 space-y-8">
      {layouts.map((layout, i) => {
        const run = runs[i] ?? layout.adjustedLength;
        if (!run || run <= 0) return null;

        // Use a uniform scale across all sides; if too long, the container scrolls.
        const PX_PER_MM = 0.2; // 0.2 px per mm => 2000 mm = 400 px
        const px = (mm: number) => Math.max(0, Math.round(mm * PX_PER_MM));

        // Precompute gap label positions (center of each uniform gap region)
        const gapCenters: number[] = [];
        let cursor = 0; // mm along the run
        gapCenters.push(px(layout.gap / 2));
        cursor += layout.gap;
        layout.panelWidths.forEach((w) => {
          cursor += w;
          gapCenters.push(px(cursor + layout.gap / 2));
          cursor += layout.gap;
        });

        const gate = gatesMeta[i] && gatesMeta[i].enabled ? gatesMeta[i] : null;

        return (
          <div key={i} className="w-full">
            <div className="mb-2 text-sm font-medium text-slate-700">
              {`Side ${sideLabels[i] ?? i + 1} (${run.toLocaleString()} mm)`}
            </div>
            {/* Horizontal scroll container to avoid squeezing long sides */}
            <div className="overflow-x-auto">
              <div className="relative" style={{ width: px(run) }}>
                {/* Gap value labels */}
                {gapCenters.map((cx, gi) => (
                  <div
                    key={gi}
                    className="pointer-events-none absolute -top-5 -translate-x-1/2 text-[11px] font-medium text-sky-700"
                    style={{ left: cx }}
                  >
                    {layout.gap.toFixed(1)}
                  </div>
                ))}

                {/* Bar container */}
                <div className="relative w-full overflow-visible rounded border border-slate-300 bg-white">
                  <div className="flex h-20 items-stretch">
                    {/* leading gap spacer */}
                    <div style={{ width: px(layout.gap) }} />
                    {layout.panelWidths.map((w, j) => {
                      const isGateHere = !!gate && j === gate.panelIndex;
                      const isHingePanel = !!gate && (gate.hingeOnLeft ? j === gate.panelIndex : j === gate.panelIndex + 1);
                      const totalPanels = layout.panelWidths.length;
                      const isWallToGlassHinge = !!gate && gate.hingeOnLeft && gate.panelIndex === 0;
                      const isWallToGlassLatch = !!gate && !gate.hingeOnLeft && gate.panelIndex === totalPanels - 1;

                      const panelEl = (
                        <div
                          className={`relative shrink-0 border ${isHingePanel ? 'border-sky-500 bg-sky-100' : 'border-sky-300 bg-sky-200/80'}`}
                          style={{ width: px(w) }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-slate-700">
                            {isHingePanel ? `Hinge ${w.toFixed(0)}` : w.toFixed(0)}
                          </div>
                        </div>
                      );

                      const gapEl = <div style={{ width: px(layout.gap) }} />;

                      if (!isGateHere) {
                        return (
                          <React.Fragment key={j}>
                            {panelEl}
                            {gapEl}
                          </React.Fragment>
                        );
                      }

                      // Gate sequence: [optional hinge gap] gate 890, [latch gap], then continue
                      const blocks: React.ReactNode[] = [];

                      // If hinge gap before gate (not wall hinge), add 5mm gap block
                      if (!isWallToGlassHinge) {
                        blocks.push(
                          <div key={`hinge-gap-${j}`} className="shrink-0" style={{ width: px(5) }}>
                            <div className="h-full bg-yellow-200 border border-yellow-400" />
                          </div>
                        );
                      } else {
                        // wall-to-glass hinge gap 7mm
                        blocks.push(
                          <div key={`hinge-wall-gap-${j}`} className="shrink-0" style={{ width: px(7) }}>
                            <div className="h-full bg-red-200 border border-red-400" />
                          </div>
                        );
                      }

                      // Gate leaf 890mm
                      blocks.push(
                        <div key={`gate-${j}`} className="relative shrink-0 border border-green-600 bg-green-300/70" style={{ width: px(890) }}>
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-green-900">
                            {isWallToGlassHinge || isWallToGlassLatch ? 'WALL-GATE' : 'GATE'}
                          </div>
                        </div>
                      );

                      // Latch gap after gate: 10mm, unless wall latch -> 7.5mm
                      if (isWallToGlassLatch) {
                        blocks.push(
                          <div key={`latch-wall-gap-${j}`} className="shrink-0" style={{ width: px(7.5) }}>
                            <div className="h-full bg-orange-200 border border-orange-400" />
                          </div>
                        );
                      } else {
                        blocks.push(
                          <div key={`latch-gap-${j}`} className="shrink-0" style={{ width: px(10) }}>
                            <div className="h-full bg-orange-200 border border-orange-400" />
                          </div>
                        );
                      }

                      return (
                        <React.Fragment key={j}>
                          {/* If hinge panel precedes the gate, render it before the hinge gap */}
                          {gate.hingeOnLeft ? panelEl : null}
                          {/* Hinge gap + Gate + Latch gap */}
                          {blocks}
                          {/* If hinge panel follows the gate, render it after latch gap (panelEl already marks hinge) */}
                          {!gate.hingeOnLeft ? panelEl : null}
                          {/* Normal uniform gap after the sequence */}
                          {gapEl}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
