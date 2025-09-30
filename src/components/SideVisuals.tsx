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
  const setLayout = useLayoutStore((s) => s.setLayout);

  if (!input || !result) return null;
  const layouts = result.sidePanelLayouts || [];
  const runs = result.sideRuns || [];
  const gatesMeta = result.sideGatesRender || [];
  if (!layouts.length || !runs.length) return null;

  const sideLabels = ["A", "B", "C", "D"];

  // Helpers to adjust hinge-gate interactively (legacy-style controls)
  function updateGate(sideIndex: number, next: { panelIndex?: number; hingeOnLeft?: boolean }) {
    if (!input || !result) return;
    const layouts = result.sidePanelLayouts || [];
    const gates = (result.sideGatesRender || []).slice();
    const layout = layouts[sideIndex];
    if (!layout) return;
    const totalPanels = layout.panelWidths.length;
    const current = gates[sideIndex] || { enabled: false, panelIndex: 0, hingeOnLeft: false };
    if (!current.enabled) return;

    // Clamp panelIndex to valid range [0, totalPanels-1]
    let pIndex = current.panelIndex;
    if (typeof next.panelIndex === 'number') {
      pIndex = Math.max(0, Math.min(totalPanels - 1, next.panelIndex));
    }
    const hingeOnLeft = typeof next.hingeOnLeft === 'boolean' ? next.hingeOnLeft : current.hingeOnLeft;

    // Recompute gate start in mm from the chosen boundary (leading gap + preceding panels/gaps)
    // Persist the new hinge + position; 3D view can infer gate start from panelIndex
    gates[sideIndex] = { ...current, panelIndex: pIndex, hingeOnLeft, enabled: true };

    setLayout({ ...input }, { ...result, sideGatesRender: gates });
  }

  // Flip hinge only: keep gate position and panels as-is, just invert hinge side
  function flipHinge(sideIndex: number) {
    if (!result?.sideGatesRender?.[sideIndex]) return;
    updateGate(sideIndex, { hingeOnLeft: !result.sideGatesRender[sideIndex]!.hingeOnLeft });
  }

  // Move hinge-gate pair left/right: shift to previous/next boundary between panels
  function moveGate(sideIndex: number, dir: -1 | 1) {
    const gate = result?.sideGatesRender?.[sideIndex];
    const layout = result?.sidePanelLayouts?.[sideIndex];
    if (!gate || !gate.enabled || !layout) return;
    updateGate(sideIndex, { panelIndex: gate.panelIndex + dir });
  }

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
        const omitLeadingGap = !!gate && gate.hingeOnLeft && gate.panelIndex === 0; // replace leading gap by hinge gap

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
                    {/* leading gap spacer (omit when hinge-to-wall at start) */}
                    <div style={{ width: omitLeadingGap ? 0 : px(layout.gap) }} />
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
                      const isBeforeGate = !!gate && j === gate.panelIndex - 1; // gap after this panel is replaced by the gate sequence

                      if (!isGateHere) {
                        return (
                          <React.Fragment key={j}>
                            {panelEl}
                            {!isBeforeGate && gapEl}
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

                      // Gate leaf 890mm (with hinge markers like legacy)
                      blocks.push(
                        <div key={`gate-${j}`} className="relative shrink-0 border border-green-600 bg-green-300/70" style={{ width: px(890) }}>
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-green-900">
                            {isWallToGlassHinge || isWallToGlassLatch ? 'WALL-GATE' : 'GATE'}
                          </div>
                          {/* Hinge markers: small black cylinders on hinge side */}
                          <div
                            className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${gate?.hingeOnLeft ? 'left-0' : 'right-0'}`}
                            style={{ width: px(0), height: '100%' }}
                          >
                            <div className="relative h-full w-[6px]">
                              <div className="absolute left-0 h-2 w-[6px] -translate-x-1/2 -translate-y-1/2 rounded bg-black" style={{ top: '30%' }} />
                              <div className="absolute left-0 h-2 w-[6px] -translate-x-1/2 -translate-y-1/2 rounded bg-black" style={{ top: '50%' }} />
                              <div className="absolute left-0 h-2 w-[6px] -translate-x-1/2 -translate-y-1/2 rounded bg-black" style={{ top: '70%' }} />
                            </div>
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

                      // Always render current panel j, then the gate sequence; do NOT render the usual gap here
                      return (
                        <React.Fragment key={j}>
                          {panelEl}
                          {blocks}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            {/* Controls: flip/move hinge-gate (legacy SP12-style) */}
            {gate && (
              <div className="mt-3 rounded-lg border border-sky-100 bg-sky-50 p-3">
                <div className="mb-2 text-[11px] font-medium text-slate-700">
                  Position:
                  <span className="ml-1 rounded bg-white px-2 py-0.5 text-sky-700 ring-1 ring-sky-200">
                    Hinge: Panel {gate.hingeOnLeft ? gate.panelIndex + 1 : gate.panelIndex + 2}, Gate: Panel {gate.hingeOnLeft ? gate.panelIndex + 2 : gate.panelIndex + 1}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => flipHinge(i)}
                    className="rounded-md bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white shadow hover:bg-slate-800"
                  >
                    Flip Hinge-Gate Orientation
                  </button>
                  <button
                    type="button"
                    onClick={() => moveGate(i, -1)}
                    disabled={gate.panelIndex <= 0}
                    className={`rounded-md px-3 py-1.5 text-[11px] font-semibold shadow ${gate.panelIndex <= 0 ? 'cursor-not-allowed bg-slate-200 text-slate-500' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                  >
                    ← Move Hinge-Gate Left
                  </button>
                  <button
                    type="button"
                    onClick={() => moveGate(i, 1)}
                    disabled={gate.panelIndex >= layout.panelWidths.length - 1}
                    className={`rounded-md px-3 py-1.5 text-[11px] font-semibold shadow ${gate.panelIndex >= layout.panelWidths.length - 1 ? 'cursor-not-allowed bg-slate-200 text-slate-500' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                  >
                    Move Hinge-Gate Right →
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
