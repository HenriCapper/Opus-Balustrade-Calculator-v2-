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

        // Precompute gap label positions (center of each gap region)
        const gapCenters: number[] = [];
        let cursor = 0; // left edge of container
        // leading gap
        gapCenters.push(px(layout.gap / 2));
        cursor += layout.gap;
        // gaps between panels
        layout.panelWidths.forEach((w) => {
          cursor += w;
          gapCenters.push(px(cursor + layout.gap / 2));
          cursor += layout.gap;
        });

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
                <div
                  className="relative w-full overflow-visible rounded border border-slate-300 bg-white"
                >
                  <div className="flex h-20 items-stretch">
                    {/* leading gap spacer */}
                    <div style={{ width: px(layout.gap) }} />
                    {layout.panelWidths.map((w, j) => (
                      <React.Fragment key={j}>
                        <div
                          className="relative shrink-0 border border-sky-300 bg-sky-200/80"
                          style={{ width: px(w) }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-slate-700">
                            {w.toFixed(0)}
                          </div>
                        </div>
                        {/* inter-panel gap spacer */}
                        <div style={{ width: px(layout.gap) }} />
                      </React.Fragment>
                    ))}
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
