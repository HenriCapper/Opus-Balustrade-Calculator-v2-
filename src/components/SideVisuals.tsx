import { useLayoutStore } from "@/store/useLayoutStore";
import type { LayoutCalculationResult } from "@/store/useLayoutStore";
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

    // Recompute gate start mm (matches solver formula in LayoutForm)
    const sumBefore = layout.panelWidths.slice(0, pIndex).reduce((acc, val) => acc + val, 0);
    const gateStartMm = layout.gap + sumBefore + layout.gap * pIndex;

    // Recompute gate start in mm from the chosen boundary (leading gap + preceding panels/gaps)
    // Persist the new hinge + position; 3D view can infer gate start from panelIndex
    gates[sideIndex] = {
      ...current,
      panelIndex: pIndex,
      hingeOnLeft,
      enabled: true,
      gateStartMm,
    };

    setLayout({ ...input }, { ...result, sideGatesRender: gates });
  }
  // Adjust per-side gate leaf width only in visuals controller
  type StoreGate = NonNullable<LayoutCalculationResult['sideGatesRender']>[number];
  type GateMeta = StoreGate & { leafWidth?: number };
  function setGateLeafWidth(sideIndex: number, value: number) {
    if (!input || !result) return;
    const gates = (result.sideGatesRender || []).slice() as GateMeta[];
    const current = gates[sideIndex];
    if (!current || !current.enabled) return;
    const leaf = Math.max(350, Math.min(1000, value));
    // Store width on the gate meta using a local extended type
    gates[sideIndex] = { ...current, leafWidth: leaf } as GateMeta;
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

        const totalPanels = layout.panelWidths.length;
        const gate =
          gatesMeta[i] && gatesMeta[i].enabled
            ? (gatesMeta[i] as unknown as GateMeta)
            : null;
        const gateLeaf = gate?.leafWidth ? Math.max(350, Math.min(1000, gate.leafWidth)) : 890;

        const gateIndexRaw = gate ? Math.max(0, Math.min(totalPanels, gate.panelIndex)) : -1;
        const hasGateBeforePanel = (panelIndex: number) => gate && gateIndexRaw === panelIndex;
        const gateHasRightPanel = gate ? gateIndexRaw < totalPanels : false;
        const gateHasLeftPanel = gate ? gateIndexRaw > 0 : false;
        const hingeGapWidth = gate
          ? gate.hingeOnLeft
            ? gateHasLeftPanel
              ? 5
              : 7
            : gateHasRightPanel
              ? 5
              : 7
          : 0;
        const latchGapWidth = gate
          ? gate.hingeOnLeft
            ? gateHasRightPanel
              ? 10
              : 7.5
            : gateHasLeftPanel
              ? 10
              : 7.5
          : 0;
        const gateTotalWidth = gate ? hingeGapWidth + latchGapWidth + gateLeaf : 0;
        const omitLeadingGap = !!gate && gateIndexRaw === 0;
        const hingePanelIndex = gate
          ? gate.hingeOnLeft
            ? gateHasLeftPanel
              ? gateIndexRaw - 1
              : null
            : gateIndexRaw < totalPanels
              ? gateIndexRaw
              : null
          : null;
        const latchPanelIndex = gate
          ? gate.hingeOnLeft
            ? gateIndexRaw < totalPanels
              ? gateIndexRaw
              : null
            : gateHasLeftPanel
              ? gateIndexRaw - 1
              : null
          : null;

        const gapLabelPositions: number[] = [];
        let cursorMm = 0;
        if (!omitLeadingGap) {
          gapLabelPositions.push(px(cursorMm + layout.gap / 2));
          cursorMm += layout.gap;
        }
        layout.panelWidths.forEach((w, panelIdx) => {
          if (gate && hasGateBeforePanel(panelIdx)) {
            cursorMm += gateTotalWidth;
          }
          cursorMm += w;
          const skipGapAfter = gate && gateIndexRaw === panelIdx + 1;
          if (!skipGapAfter) {
            gapLabelPositions.push(px(cursorMm + layout.gap / 2));
            cursorMm += layout.gap;
          }
        });

        const renderGapSegment = (
          type: "hinge" | "latch",
          widthMm: number,
          toWall: boolean,
          key: string
        ) => {
          if (widthMm <= 0) return null;
          const hingeClasses = toWall
            ? "bg-red-200 border border-red-400"
            : "bg-yellow-200 border border-yellow-400";
          const latchClasses = toWall
            ? "bg-orange-200 border border-orange-500"
            : "bg-orange-200 border border-orange-400";
          const baseClasses = type === "hinge" ? hingeClasses : latchClasses;
          return (
            <div key={key} className="shrink-0" style={{ width: px(widthMm) }}>
              <div className={`h-full ${baseClasses}`} />
            </div>
          );
        };

        return (
          <div key={i} className="w-full">
            <div className="mb-2 text-sm font-medium text-slate-700">
              {`Side ${sideLabels[i] ?? i + 1} (${run.toLocaleString()} mm)`}
            </div>
            {/* Horizontal scroll container to avoid squeezing long sides */}
            <div className="overflow-x-auto">
              <div className="relative" style={{ width: px(run) }}>
                {/* Gap value labels */}
                {gapLabelPositions.map((cx, gi) => (
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
                    {/* leading gap spacer (omit when gate replaces the leading gap) */}
                    {!omitLeadingGap && <div style={{ width: px(layout.gap) }} />}
                    {layout.panelWidths.map((w, j) => {
                      const gateBeforePanel = gate && hasGateBeforePanel(j);
                      const skipGapAfter = gate && gateIndexRaw === j + 1;
                      const isHingePanel = hingePanelIndex === j;
                      const isLatchPanel = latchPanelIndex === j;

                      const labelText = isHingePanel
                        ? `Hinge ${w.toFixed(0)}`
                        : isLatchPanel
                          ? `Latch ${w.toFixed(0)}`
                          : w.toFixed(0);

                      const panelEl = (
                        <div
                          key={`panel-${j}`}
                          className={`relative shrink-0 border ${isHingePanel ? "border-sky-500 bg-sky-100" : "border-sky-300 bg-sky-200/80"}`}
                          style={{ width: px(w) }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-slate-700">
                            {labelText}
                          </div>
                        </div>
                      );

                      const elements: React.ReactNode[] = [];

                      if (gateBeforePanel && gate && gateIndexRaw < totalPanels) {
                        const gateBlocks: React.ReactNode[] = [];
                        if (gate.hingeOnLeft) {
                          gateBlocks.push(
                            renderGapSegment(
                              "hinge",
                              hingeGapWidth,
                              !gateHasLeftPanel,
                              `hinge-gap-${j}`
                            )
                          );
                          gateBlocks.push(
                            <div
                              key={`gate-${j}`}
                              className="relative shrink-0 border border-green-600 bg-green-300/70"
                              style={{ width: px(gateLeaf) }}
                            >
                              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-green-900">
                                {gateHasLeftPanel && gateHasRightPanel ? "GATE" : "WALL-GATE"}
                              </div>
                              <div
                                className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${gate.hingeOnLeft ? "left-0" : "right-0"}`}
                                style={{ width: px(0), height: "100%" }}
                              >
                                <div className="relative h-full w-[6px]">
                                  <div className="absolute left-0 h-2 w-[6px] -translate-x-1/2 -translate-y-1/2 rounded bg-black" style={{ top: "30%" }} />
                                  <div className="absolute left-0 h-2 w-[6px] -translate-x-1/2 -translate-y-1/2 rounded bg-black" style={{ top: "70%" }} />
                                </div>
                              </div>
                               <div
                                className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${gate.hingeOnLeft ? "right-0" : "left-0"}`}
                                style={{ width: px(0), height: "100%" }}
                              >
                                <div className="relative h-full w-[6px]">
                                  <div className="absolute left-0 h-2 w-[6px] -translate-x-1/2 -translate-y-1/2 rounded bg-black" style={{ top: "50%" }} />
                                </div>
                              </div>
                            </div>
                          );
                          gateBlocks.push(
                            renderGapSegment(
                              "latch",
                              latchGapWidth,
                              !gateHasRightPanel,
                              `latch-gap-${j}`
                            )
                          );
                        } else {
                          gateBlocks.push(
                            renderGapSegment(
                              "latch",
                              latchGapWidth,
                              !gateHasLeftPanel,
                              `latch-gap-${j}`
                            )
                          );
                          gateBlocks.push(
                            <div
                              key={`gate-${j}`}
                              className="relative shrink-0 border border-green-600 bg-green-300/70"
                              style={{ width: px(gateLeaf) }}
                            >
                              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-green-900">
                                {gateHasLeftPanel && gateHasRightPanel ? "GATE" : "WALL-GATE"}
                              </div>
                              <div
                                className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${gate.hingeOnLeft ? "left-0" : "right-0"}`}
                                style={{ width: px(0), height: "100%" }}
                              >
                                <div className="relative h-full w-[6px]">
                                  <div className="absolute left-0 h-2 w-[6px] -translate-x-1/2 -translate-y-1/2 rounded bg-black" style={{ top: "30%" }} />
                                  <div className="absolute left-0 h-2 w-[6px] -translate-x-1/2 -translate-y-1/2 rounded bg-black" style={{ top: "70%" }} />
                                </div>
                              </div>
                              <div
                                className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${gate.hingeOnLeft ? "right-0" : "left-0"}`}
                                style={{ width: px(0), height: "100%" }}
                              >
                                <div className="relative h-full w-[6px]">
                                  <div className="absolute left-0 h-2 w-[6px] -translate-x-1/2 -translate-y-1/2 rounded bg-black" style={{ top: "50%" }} />
                                </div>
                              </div>
                              
                            </div>
                          );
                          gateBlocks.push(
                            renderGapSegment(
                              "hinge",
                              hingeGapWidth,
                              !gateHasRightPanel,
                              `hinge-gap-${j}`
                            )
                          );
                        }
                        elements.push(...gateBlocks.filter(Boolean));
                      }

                      elements.push(panelEl);

                      if (!skipGapAfter) {
                        elements.push(
                          <div key={`gap-${j}`} style={{ width: px(layout.gap) }} />
                        );
                      }

                      return <React.Fragment key={j}>{elements}</React.Fragment>;
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
                    {(() => {
                      const hingeLabel = (() => {
                        if (!gate) return "";
                        if (gate.hingeOnLeft) {
                          return gateHasLeftPanel ? `Panel ${gateIndexRaw}` : "Wall";
                        }
                        return gateIndexRaw < totalPanels ? `Panel ${gateIndexRaw + 1}` : "Wall";
                      })();
                      const gateLabel = (() => {
                        if (!gate) return "";
                        if (gate.hingeOnLeft) {
                          return gateIndexRaw < totalPanels ? `Panel ${gateIndexRaw + 1}` : "Wall";
                        }
                        return gateHasLeftPanel ? `Panel ${gateIndexRaw}` : "Wall";
                      })();
                      return `Hinge: ${hingeLabel}, Gate: ${gateLabel}`;
                    })()}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
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
                  <div className="ml-2 flex items-center gap-2">
                    <label className="text-[11px] text-slate-600">Gate width (mm)</label>
                    <input
                      type="number"
                      min={350}
                      max={1000}
                      step={5}
                      defaultValue={gate.leafWidth ?? 890}
                      onChange={(e)=> setGateLeafWidth(i, parseFloat(e.target.value))}
                      className="h-8 w-24 rounded-md border border-slate-300 px-2 text-[12px] focus:border-sky-400 focus:ring-2 focus:ring-sky-300/40"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
