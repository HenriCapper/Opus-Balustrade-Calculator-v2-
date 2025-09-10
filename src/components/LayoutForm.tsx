import { useSelectionStore } from "@/store/useSelectionStore";
import Button from "@/components/ui/Button";
import { useMemo, useState } from "react";
import ShapeDiagram from "@/components/ShapeDiagram";
import { CALC_OPTION_MAP, detectCalcKey, type CalcKey } from "@/data/calcOptions";
import FieldGroup from "@/components/ui/FieldGroup";

export default function LayoutForm() {
  const clear = useSelectionStore((s) => s.clearSelected);
  const shape = useSelectionStore((s) => s.selected);
  const system = useSelectionStore((s) => s.system); // channel | spigots | standoffs | posts
  const selectedCalc = useSelectionStore((s) => s.selectedCalc);
  const [focusedSide, setFocusedSide] = useState<number | null>(null);

  // Determine current calc key (now supports spigots & standoffs mappings)
  const calcKey: CalcKey | null = useMemo(() => {
    const raw = system ? selectedCalc[system] : undefined;
    return detectCalcKey(raw, system);
  }, [selectedCalc, system]);

  const optionSets = calcKey ? CALC_OPTION_MAP[calcKey] : null;

  // Basic derived state (defaults)
  const defaultThickness = optionSets?.glassThicknesses[0];
  const defaultHeight = optionSets?.glassHeights[0];
  const defaultWind = optionSets?.windZones[0];
  const defaultFence = optionSets?.fenceTypes[0]?.value;


  const sideLabels = ["A", "B", "C", "D"] as const;
  const sidesCount = shape
    ? (
        {
          inline: 1,
          corner: 2,
          u: 3,
          enclosed: 4,
          custom: 0, // no predefined sides for custom
        } as const
      )[shape]
    : 0;

  // diagram is now a separate component

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-700">
          Design Parameters
        </h2>
        <button
          type="button"
          onClick={clear}
          className="text-sm font-medium text-sky-600 hover:underline"
        >
          Change shape
        </button>
      </div>
      {shape && shape !== "custom" && (
        <div className="mb-4 flex w-full justify-center">
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <ShapeDiagram shape={shape} focusedSide={focusedSide} />
          </div>
        </div>
      )}
      <form className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {Array.from({ length: sidesCount }).map((_, i) => (
          <FieldGroup key={i}>
            <label className="text-xs font-medium text-slate-500">
              {`Side ${sideLabels[i]} length (mm)`}
            </label>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              onFocus={() => setFocusedSide(i)}
              onBlur={() => setFocusedSide((prev) => (prev === i ? null : prev))}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-300/40"
            />
          </FieldGroup>
        ))}
        <FieldGroup>
          <label className="text-xs font-medium text-slate-500">Fence type</label>
          <select
            disabled={!optionSets}
            defaultValue={defaultFence}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-300/40 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            {!optionSets && <option>—</option>}
            {optionSets?.fenceTypes.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </FieldGroup>
        <FieldGroup>
          <label className="text-xs font-medium text-slate-500">Fixing type</label>
            <select
              disabled={!optionSets}
              defaultValue=""
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-300/40 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              <option value="">– select –</option>
              {optionSets?.fixingTypes.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
        </FieldGroup>
        <FieldGroup>
          <label className="text-xs font-medium text-slate-500">Wind zone</label>
          <select
            disabled={!optionSets}
            defaultValue={defaultWind}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-300/40 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            {!optionSets && <option>—</option>}
            {optionSets?.windZones.map((z) => (
              <option key={z}>{z}</option>
            ))}
          </select>
        </FieldGroup>
        <FieldGroup>
          <label className="text-xs font-medium text-slate-500">Glass height (mm)</label>
          <select
            disabled={!optionSets}
            defaultValue={defaultHeight}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-300/40 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            {!optionSets && <option>—</option>}
            {optionSets?.glassHeights.map((h) => (
              <option key={h}>{h}</option>
            ))}
          </select>
        </FieldGroup>
        <FieldGroup>
          <label className="text-xs font-medium text-slate-500">Glass thickness</label>
          <select
            disabled={!optionSets}
            defaultValue={defaultThickness}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-300/40 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            {!optionSets && <option>—</option>}
            {optionSets?.glassThicknesses.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </FieldGroup>
        <FieldGroup>
          <label className="text-xs font-medium text-slate-500">Handrail</label>
          <select
            disabled={!optionSets}
            defaultValue={optionSets?.handrails[0]?.value}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-300/40 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            {!optionSets && <option>—</option>}
            {optionSets?.handrails.map((h) => (
              <option key={h.value} value={h.value}>{h.label}</option>
            ))}
          </select>
        </FieldGroup>
        <FieldGroup>
          <label className="text-xs font-medium text-slate-500">Hardware finish</label>
          <select
            disabled={!optionSets}
            defaultValue={optionSets?.finishes[0]}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-300/40 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            {!optionSets && <option>—</option>}
            {optionSets?.finishes.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </FieldGroup>
        <div className="md:col-span-2">
          <Button className="mt-4 w-full" disabled>
            Calculate compliant layout
          </Button>
        </div>
      </form>
    </div>
  );
}
