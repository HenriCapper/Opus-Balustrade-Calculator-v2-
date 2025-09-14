import { useSelectionStore } from "@/store/useSelectionStore";
import Button from "@/components/ui/Button";
import { useMemo, useState, useEffect } from "react";
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

  // New layout parameters
  const [fenceType, setFenceType] = useState<string | undefined>(defaultFence);
  const [glassMode, setGlassMode] = useState<'standard' | 'stock'>('standard'); // default Standard
  const [gapSize, setGapSize] = useState<number>(20); // default gap for Standard
  const [allowMixedSizes, setAllowMixedSizes] = useState<boolean>(false); // only for stock mode
  const [spigotsPerPanel, setSpigotsPerPanel] = useState<'auto' | '2' | '3'>('auto');
  // Glass & handrail selections (now controlled to enable rules logic)
  const [glassThickness, setGlassThickness] = useState<string | undefined>(defaultThickness);
  const [handrail, setHandrail] = useState<string>('none');
  const [handrailLocked, setHandrailLocked] = useState<boolean>(false);
  const [handrailError, setHandrailError] = useState<string | null>(null);

  // Sync fenceType when optionSets changes
  useEffect(() => {
    if (optionSets) {
      setFenceType(optionSets.fenceTypes[0]?.value);
      setGlassThickness(optionSets.glassThicknesses[0]);
      // Reset handrail to re-evaluate under new option set
      setHandrail('none');
      setHandrailLocked(false);
      setHandrailError(null);
    }
  }, [optionSets]);

  // Determine if current fenceType is pool or balustrade (affects gaps)
  const fenceCategory = useMemo(() => {
    if (!fenceType) return 'balustrade';
    return fenceType.toLowerCase().includes('pool') ? 'pool' : 'balustrade';
  }, [fenceType]);

  // Whether to display the "No Handrail" option in the dropdown
  const showNoHandrailOption = useMemo(() => {
    if (fenceCategory === 'pool') return true; // always optional for pool fences
    // balustrade: only allow none for sentry glass
    return glassThickness === '13.52' || glassThickness === '17.52';
  }, [fenceCategory, glassThickness]);

  // Enforce handrail rules based on glass thickness & fence category
  useEffect(() => {
    if (!glassThickness) return;
    if (fenceCategory === 'pool') {
      // Pool fence: no mandatory handrail, never lock. Keep selection (allow none)
      setHandrailLocked(false);
      setHandrailError(null);
      return;
    }
    const isSentry = glassThickness === '13.52' || glassThickness === '17.52';
    const isToughened = glassThickness === '12' || glassThickness === '15';
    if (isSentry) {
      // Sentry glass: auto no handrail & lock select
      if (handrail !== 'none') setHandrail('none');
      setHandrailLocked(true);
      setHandrailError(null);
    } else if (isToughened) {
      // Toughened: must choose a handrail (cannot remain none). Unlock select.
      setHandrailLocked(false);
      if (handrail === 'none' && optionSets?.handrails?.length) {
        setHandrail(optionSets.handrails[0].value);
      }
      // Validation: if somehow none, show error
      setHandrailError(handrail === 'none' ? 'Handrail required for toughened glass balustrade (12mm & 15mm).' : null);
    } else {
      // Default fallback
      setHandrailLocked(false);
      setHandrailError(null);
    }
  }, [glassThickness, fenceCategory, handrail, optionSets]);

  // Gap options logic
  const gapOptions = useMemo(() => {
    // Standard mode custom sizing: specific ranges
    if (glassMode === 'standard') {
      const [min, max] = fenceCategory === 'balustrade' ? [14, 20] : [14, 99];
      const arr: number[] = [];
      for (let g = min; g <= max; g++) arr.push(g);
      return arr;
    }
    // Stock size mode original behavior: 10-25 (balustrade) or 10-50 (pool)
    const [min, max] = fenceCategory === 'balustrade' ? [10, 25] : [10, 50];
    const arr: number[] = [];
    for (let g = min; g <= max; g++) arr.push(g);
    return arr;
  }, [glassMode, fenceCategory]);

  // Ensure gapSize remains valid when dependencies change
  useEffect(() => {
    if (!gapOptions.includes(gapSize)) {
      // Standard mode default always 20 else first in list
      const fallback = glassMode === 'standard' ? 20 : gapOptions[0];
      setGapSize(fallback);
    }
  }, [gapOptions, gapSize, glassMode]);

  // Reset allowMixedSizes when switching to standard mode
  useEffect(() => {
    if (glassMode === 'standard' && allowMixedSizes) setAllowMixedSizes(false);
  }, [glassMode, allowMixedSizes]);


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
            value={fenceType}
            onChange={(e) => setFenceType(e.target.value)}
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
            value={glassThickness}
            onChange={(e) => setGlassThickness(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-300/40 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            {!optionSets && <option>—</option>}
            {optionSets?.glassThicknesses.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </FieldGroup>
        <FieldGroup>
          <label className="text-xs font-medium text-slate-500 flex items-center gap-2">Handrail {handrailLocked && <span className="text-[10px] rounded bg-slate-200 px-1 py-0.5 font-normal text-slate-600">Auto</span>}</label>
          <select
            disabled={!optionSets || handrailLocked}
            value={handrail}
            onChange={(e) => setHandrail(e.target.value)}
            className={`rounded-lg border bg-white px-3 py-2 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-300/40 disabled:cursor-not-allowed disabled:bg-slate-100 ${handrailError ? 'border-red-400' : 'border-slate-300'}`}
          >
            {showNoHandrailOption && <option value="none">No Handrail</option>}
            {optionSets?.handrails.map((h) => (
              <option key={h.value} value={h.value}>{h.label}</option>
            ))}
          </select>
          {handrailError && (
            <p className="mt-1 text-[11px] font-medium text-red-600">{handrailError}</p>
          )}
          {handrailLocked && fenceCategory === 'balustrade' && (glassThickness === '13.52' || glassThickness === '17.52') && (
            <p className="mt-1 text-[11px] text-slate-500">Sentry glass selected – handrail not required.</p>
          )}
          {fenceCategory === 'pool' && (
            <p className="mt-1 text-[11px] text-slate-500">Pool fence – handrail optional.</p>
          )}
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

        {/* Glass Mode */}
        <FieldGroup>
          <label className="text-xs font-medium text-slate-500">Glass Mode</label>
          <select
            value={glassMode}
            onChange={(e) => setGlassMode(e.target.value as 'standard' | 'stock')}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-300/40"
          >
            <option value="standard">Standard</option>
            <option value="stock">Stock Sizes</option>
          </select>
        </FieldGroup>

        {/* Gap Size */}
        <FieldGroup>
          <label className="text-xs font-medium text-slate-500">Gap size (mm)</label>
          <select
            value={gapSize}
            onChange={(e) => setGapSize(Number(e.target.value))}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-300/40"
          >
            {gapOptions.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </FieldGroup>

        {/* Allow Mixed Sizes - only in stock mode */}
        {glassMode === 'stock' && (
          <FieldGroup>
            <label className="text-xs font-medium text-slate-500">Panel sizing</label>
            <div className="mt-1 flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-sky-600"
                  checked={allowMixedSizes}
                  onChange={(e) => setAllowMixedSizes(e.target.checked)}
                />
                <span className="font-medium text-slate-600">Allow mixed sizes</span>
              </label>
            </div>
          </FieldGroup>
        )}

        {/* Spigots per panel - only show for spigots calculators */}
        {system === 'spigots' && (
          <div className="md:col-span-2">
            <FieldGroup>
              <label className="text-xs font-medium text-slate-500">Spigots per panel</label>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs">
                {['auto','2','3'].map(v => (
                  <label key={v} className="inline-flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="spigots-per-panel"
                      value={v}
                      checked={spigotsPerPanel === v}
                      onChange={() => setSpigotsPerPanel(v as 'auto' | '2' | '3')}
                      className="h-4 w-4 accent-sky-600"
                    />
                    <span>{v === 'auto' ? 'Auto' : `${v} posts per panel`}</span>
                  </label>
                ))}
              </div>
            </FieldGroup>
          </div>
        )}
        
        <div className="md:col-span-2">
          <Button className="mt-4 w-full" disabled>
            Calculate compliant layout
          </Button>
        </div>
      </form>
    </div>
  );
}
