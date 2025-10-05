import { useSelectionStore } from "@/store/useSelectionStore";
import Button from "@/components/ui/Button";
import { useMemo, useState, useEffect, useRef } from "react";
import { useLayoutStore, type LayoutCalculationInput, type LayoutCalculationResult } from "@/store/useLayoutStore";
import { lookupSpigotsPs1 } from "@/data/spigotsPs1";
import { lookupStandoffsPs1 } from "@/data/standoffsPs1";
import { lookupChannelPs1 } from "@/data/channelPs1";
import { lookupPostsPs1 } from "@/data/postsPs1";
import { solveSymmetric, aggregatePanels, findBestLayout, findGateAdjustedLayout } from "@/data/panelSolver";
import ShapeDiagram from "@/components/ShapeDiagram";
import CustomShapeDesigner from "@/components/CustomShapeDesigner";
import { CALC_OPTION_MAP, detectCalcKey, type CalcKey } from "@/data/calcOptions";
import FieldGroup from "@/components/ui/FieldGroup";
import CompliantLayout from "@/components/CompliantLayout";
import SideVisuals from "@/components/SideVisuals";
import OrderList from "@/components/OrderList";
import { computeOrderList } from "@/data/orderLists";
export default function LayoutForm() {
  const clear = useSelectionStore((s) => s.clearSelected);
  const shape = useSelectionStore((s) => s.selected);
  const system = useSelectionStore((s) => s.system); // channel | spigots | standoffs | posts
  const selectedCalc = useSelectionStore((s) => s.selectedCalc);
  const [focusedSide, setFocusedSide] = useState<number | null>(null);
  const setLayout = useLayoutStore(s => s.setLayout);
  const resetLayout = useLayoutStore(s => s.resetLayout);
  const layoutResult = useLayoutStore(s => s.result);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [formWarning, setFormWarning] = useState<string>("");

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
  const [discHead, setDiscHead] = useState<string | undefined>(undefined);
  const [extraPackers, setExtraPackers] = useState<string>('0');
  const [powdercoatColor, setPowdercoatColor] = useState<string>('');

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
    if (fenceCategory === 'pool') return true; // pool: no handrail used (locked to none)
    // balustrade: only allow none for sentry glass
    return glassThickness === '13.52' || glassThickness === '17.52';
  }, [fenceCategory, glassThickness]);

  // Filtered lists based on rules
  const filteredGlassThicknesses = useMemo(() => {
    if (!optionSets) return [] as string[];
    let list = optionSets.glassThicknesses;
    if (fenceCategory === 'pool') {
      // Pool fence: only 12mm or 15mm
      list = list.filter((t) => t === '12' || t === '15');
    }
    return list;
  }, [optionSets, fenceCategory]);

  const filteredHandrails = useMemo(() => {
    if (!optionSets) return [] as { value: string; label: string }[];
    if (fenceCategory === 'pool') {
      // Pool fence: no handrail selectable
      return [];
    }
    // Balustrade: S25 available only if 12mm glass is selected
    let list = optionSets.handrails;
    if (glassThickness !== '12') {
      list = list.filter((h) => h.value !== 'S25');
    }
    return list;
  }, [optionSets, fenceCategory, glassThickness]);

  const discHeadOptions = useMemo(() => {
    if (calcKey === 'sd50') {
      return [
        { value: 'SD50-SH', label: 'Screw Head' },
        { value: 'SD50-FH', label: 'Flat Head' },
        { value: 'SD50-BH', label: 'Bevelled Head' },
        { value: 'ASD50-SH', label: 'Adjustable Screw Head' },
      ];
    }
    if (calcKey === 'pf150') {
      return [
        { value: 'PF150', label: 'Standard Clamp' },
        { value: 'PF150R', label: 'Concealed Clamp' },
        { value: 'PF150S', label: 'Square Clamp' },
      ];
    }
    return [] as { value: string; label: string }[];
  }, [calcKey]);

  const showExtraPackers = useMemo(() => {
    return calcKey ? ['sd50', 'sd100', 'pf150'].includes(calcKey) : false;
  }, [calcKey]);

  const parsedExtraPackers = useMemo(() => {
    const parsed = parseInt(extraPackers, 10);
    if (Number.isNaN(parsed) || parsed < 0) return 0;
    return parsed;
  }, [extraPackers]);

  // Enforce handrail rules based on glass thickness & fence category
  useEffect(() => {
    if (!glassThickness) return;
    if (fenceCategory === 'pool') {
      // Pool fence: do not use handrail – lock to none
      if (handrail !== 'none') setHandrail('none');
      setHandrailLocked(true);
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

  // Keep handrail selection valid against filtered options
  useEffect(() => {
    if (fenceCategory === 'pool') {
      if (handrail !== 'none') setHandrail('none');
      return;
    }
    const allowed = new Set(filteredHandrails.map((h) => h.value));
    if (handrail !== 'none' && !allowed.has(handrail)) {
      if (filteredHandrails.length) setHandrail(filteredHandrails[0].value);
      else setHandrail('none');
    }
  }, [filteredHandrails, fenceCategory, handrail]);

  useEffect(() => {
    if (!discHeadOptions.length) {
      setDiscHead(undefined);
      return;
    }
    if (!discHeadOptions.some((opt) => opt.value === discHead)) {
      setDiscHead(discHeadOptions[0]?.value);
    }
  }, [discHeadOptions, discHead]);

  useEffect(() => {
    if (!showExtraPackers) {
      setExtraPackers('0');
    }
  }, [showExtraPackers]);


  

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

  // Track side lengths (A-D) for current shape (only the first N used)
  const [sideLengths, setSideLengths] = useState<number[]>([0,0,0,0]);
  // Custom shape dynamic runs (A,B,C,...)
  const [customRuns, setCustomRuns] = useState<{id:string; length:number; dx:number; dy:number; gate?: { enabled: boolean; position: 'left'|'middle'|'right'; hingeOnLeft?: boolean; t?: number }}[]>([]);
  // Gate controls
  // For standard shapes A-D: track gate per side and simple position (left/middle/right)
  const [sideGates, setSideGates] = useState<{ enabled: boolean; position: 'left'|'middle'|'right'; hingeOnLeft?: boolean }[]>([
    { enabled: false, position: 'middle', hingeOnLeft: false },
    { enabled: false, position: 'middle', hingeOnLeft: false },
    { enabled: false, position: 'middle', hingeOnLeft: false },
    { enabled: false, position: 'middle', hingeOnLeft: false },
  ]);
  // For custom shapes, allow one gate per run initially (can extend later)
  const [customGateByRun, setCustomGateByRun] = useState<Record<string, { enabled: boolean; position: 'left'|'middle'|'right'; hingeOnLeft?: boolean; t?: number }>>({});

  // Keep custom gate map in sync when designer supplies gate values on runs
  useEffect(() => {
    if (!customRuns || !customRuns.length) {
      setCustomGateByRun({});
      return;
    }
    // Designer is source of truth: if a run has no gate, disable it (don't preserve old state)
    setCustomGateByRun(() => {
      const next: Record<string, { enabled: boolean; position: 'left'|'middle'|'right'; hingeOnLeft?: boolean; t?: number }> = {};
      for (const r of customRuns) {
        const g = r.gate;
        if (g && g.enabled) {
          next[r.id] = {
            enabled: true,
            position: g.position || 'middle',
            hingeOnLeft: !!g.hingeOnLeft,
            t: typeof g.t === 'number' ? g.t : undefined,
          };
        } else {
          next[r.id] = { enabled: false, position: 'middle' };
        }
      }
      return next;
    });
  }, [customRuns]);

  // Additional controlled selects to capture values for calculation
  const [windZone, setWindZone] = useState<string | undefined>(defaultWind);
  const [glassHeight, setGlassHeight] = useState<number | undefined>(defaultHeight);
  const [fixingType, setFixingType] = useState<string | undefined>(undefined);
  const [finish, setFinish] = useState<string | undefined>(undefined);
  const showPowdercoatColor = useMemo(() => {
    return finish ? finish.toLowerCase().includes('powder') : false;
  }, [finish]);

  useEffect(() => {
    if (!showPowdercoatColor) {
      setPowdercoatColor('');
    }
  }, [showPowdercoatColor]);

  // Enforce pool fence glass thickness rules and force 15mm in extra high wind zone
  useEffect(() => {
    if (!optionSets) return;
    const allowed = filteredGlassThicknesses;
    const wz = (windZone || '').toLowerCase();
    const extraHigh = wz.includes('extra') && wz.includes('high');
    if (fenceCategory === 'pool') {
      // If extra high – force 15mm
      if (extraHigh && glassThickness !== '15') {
        setGlassThickness('15');
        return;
      }
      // Ensure current thickness is allowed (12 or 15)
      if (!allowed.includes(glassThickness || '')) {
        setGlassThickness(extraHigh ? '15' : (allowed[0] || '12'));
      }
    } else {
      // Non-pool: just ensure current is part of available list
      if (glassThickness && !optionSets.glassThicknesses.includes(glassThickness)) {
        setGlassThickness(optionSets.glassThicknesses[0]);
      }
    }
  }, [optionSets, fenceCategory, windZone, glassThickness, filteredGlassThicknesses]);

  // Reset layout store when component mounts or URL changes (simple approach)
  useEffect(() => {
    resetLayout();
    // Listen for URL changes (popstate)
    const handler = () => resetLayout();
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [resetLayout]);

  // When option sets change, update controlled defaults
  useEffect(() => {
    if (optionSets) {
      setWindZone(optionSets.windZones[0]);
      setGlassHeight(optionSets.glassHeights[0]);
      setFinish(optionSets.finishes[0]);
      setFixingType(undefined);
    }
  }, [optionSets]);

  // Keep custom gate map in sync when designer supplies gate values on runs
  useEffect(() => {
    if (!customRuns || !customRuns.length) {
      setCustomGateByRun({});
      return;
    }
    // Designer is source of truth: if a run has no gate, disable it (don't preserve old state)
    setCustomGateByRun(() => {
      const next: Record<string, { enabled: boolean; position: 'left'|'middle'|'right'; hingeOnLeft?: boolean; t?: number }> = {};
      for (const r of customRuns) {
        const g = r.gate;
        if (g && g.enabled) {
          next[r.id] = {
            enabled: true,
            position: g.position || 'middle',
            hingeOnLeft: !!g.hingeOnLeft,
            t: typeof g.t === 'number' ? g.t : undefined,
          };
        } else {
          next[r.id] = { enabled: false, position: 'middle' };
        }
      }
      return next;
    });
  }, [customRuns]);

  function handleSideChange(index: number, value: string) {
    const v = value === '' ? 0 : parseFloat(value);
    setSideLengths(prev => {
      const next = [...prev];
      next[index] = isNaN(v) ? 0 : v;
      return next;
    });
  }

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    // Basic validation
    const usedSides = shape === 'custom'
      ? customRuns.map(r => r.length).filter(v=>v>0)
      : sideLengths.slice(0, sidesCount);
    if (shape !== 'custom') {
      // Require all shown sides and min 2000mm
      if (!usedSides.length || !usedSides.every(v => v >= 2000)) return;
    } else {
      if (!usedSides.length) return; // no lengths entered yet
    }
    const resolvedCalcKey = calcKey;
    if (!resolvedCalcKey) return;
    // Lookup PS1 row (spigots vs standoffs vs channels vs posts)
    const isStandoffs = resolvedCalcKey === 'sd50' || resolvedCalcKey === 'pf150' || resolvedCalcKey === 'sd100' || resolvedCalcKey === 'pradis';
    const isChannel = resolvedCalcKey === 'smartlock_top' || resolvedCalcKey === 'smartlock_side' || resolvedCalcKey === 'lugano' || resolvedCalcKey === 'vista';
    const isPost = resolvedCalcKey === 'resolute' || resolvedCalcKey === 'vortex';
    const ps1 = isStandoffs
      ? lookupStandoffsPs1(
          resolvedCalcKey,
          fenceType,
          glassThickness,
          glassHeight,
          windZone || undefined,
          fixingType,
        )
      : isChannel
        ? lookupChannelPs1(
            resolvedCalcKey,
            fenceType,
            glassThickness,
            glassHeight,
            windZone || undefined,
          )
        : isPost
          ? lookupPostsPs1(
              resolvedCalcKey as 'resolute' | 'vortex',
              fenceType,
              glassThickness,
              glassHeight,
              windZone || undefined,
              fixingType,
            )
          : lookupSpigotsPs1(resolvedCalcKey, fenceType, glassThickness, glassHeight, windZone || undefined);
  const totalRun = usedSides.reduce((a,b)=>a+b,0);
  let estimatedSpigots: number | undefined;
  let estimatedPanels: number | undefined;
  let panelsSummary: string | undefined;
  let totalSpigots: number | undefined;
    const notes: string[] = [];
  let sidePanelLayouts: { panelWidths: number[]; gap: number; adjustedLength: number;}[] = [];
  const allPanels: number[] = [];
  let gateCount = 0;
  const sideGatesRender: { enabled: boolean; panelIndex: number; hingeOnLeft: boolean; gateStartMm?: number }[] = [];
    if (ps1) {
      // Symmetric solver per side (legacy simple case). Mixed sizes & gates not yet.
      const gapMin = fenceCategory === 'balustrade' ? 14 : 14;
      const gapMax = fenceCategory === 'balustrade' ? 20 : 99;
      let cap = 2000;
      if (glassThickness === '12' && handrail === 'S25') cap = 1700;
      else if (handrail === 'S40') cap = 1900;
      const baseSideArray = shape === 'custom'
        ? customRuns.map(r => r.length)
        : sideLengths.slice(0, sidesCount);
      // if (shape === 'custom') { /* dev trace removed */ }
      // Convert spigotsPerPanel to numeric constraint for solver
      const maxSpigotsPerPanel = spigotsPerPanel === 'auto' ? undefined : parseInt(spigotsPerPanel, 10);
      
      // Gate handling – fixed legacy total width (890 leaf + 5 hinge + 10 latch)
      const GATE_TOTAL_WIDTH = 905;
      
  sidePanelLayouts = baseSideArray.map((len, idx) => {
        // Legacy behaviour: standard mode uses symmetric only with continuous-ish step (10mm), stock can allow mixed
        const panelStep = glassMode === 'standard' ? 10 : 25;
        const allowMixed = glassMode === 'stock' && allowMixedSizes;

        let effectiveLen = len;
        let hasGate = false;
        if (shape === 'custom') {
          const runId = customRuns[idx]?.id;
          const cfg = runId ? customGateByRun[runId] : undefined;
          hasGate = !!cfg?.enabled;
        } else {
          hasGate = !!sideGates[idx]?.enabled;
        }
        if (hasGate) {
          effectiveLen = len - GATE_TOTAL_WIDTH;
          if (effectiveLen < 200) {
            // Minimum space for at least one panel; ignore gate and leave a note
            notes.push(`Side ${String.fromCharCode(65 + idx)} too short for a gate – requires ≥ ${GATE_TOTAL_WIDTH + 200} mm (gate + min panel). Gate ignored for this side.`);
            hasGate = false;
            effectiveLen = len;
          } else {
            gateCount += 1;
          }
        }

        const baseLayout = hasGate
          ? findGateAdjustedLayout(effectiveLen, gapMin, gapMax, cap, panelStep, ps1, maxSpigotsPerPanel, allowMixed)
          : findBestLayout(effectiveLen, gapMin, gapMax, cap, panelStep, ps1, maxSpigotsPerPanel, allowMixed) ||
            solveSymmetric(effectiveLen, gapMin, gapMax, cap, panelStep, ps1, maxSpigotsPerPanel);

        const layout = baseLayout || { panelWidths: [effectiveLen], gap: gapSize, adjustedLength: effectiveLen };
        if (layout.panelWidths && layout.panelWidths.length) allPanels.push(...layout.panelWidths);
        // Record gate render info for SideVisuals
        if (hasGate) {
          const total = layout.panelWidths.length;
          // Map designer t to mm along the run and choose nearest boundary (leading gap or between panels)
          let pIndex = Math.floor(total / 2);
          let gateStartMm: number | undefined = undefined;
          if (shape === 'custom') {
            const runId = customRuns[idx]?.id;
            const meta = runId ? customGateByRun[runId] : undefined;
            if (meta) {
              const len = baseSideArray[idx] || 0;
              const target = typeof meta.t === 'number' ? Math.max(0, Math.min(1, meta.t)) * len : NaN;
              // accumulate gap boundaries: start at leading gap, then add panel+gap per panel
              let cursor = layout.gap;
              let bestJ = 0;
              let bestDist = Number.POSITIVE_INFINITY;
              for (let j = 0; j < total; j++) {
                const d = isNaN(target) ? Number.POSITIVE_INFINITY : Math.abs(cursor - target);
                if (d < bestDist) { bestDist = d; bestJ = j; gateStartMm = cursor; }
                cursor += layout.panelWidths[j] + layout.gap;
              }
              pIndex = bestJ;
              // Fallback to position if t missing
              if (gateStartMm === undefined) {
                const pos = meta.position || 'middle';
                if (pos === 'left') { pIndex = 0; gateStartMm = layout.gap; }
                else if (pos === 'right') { pIndex = Math.max(0, total - 1); gateStartMm = layout.gap + layout.panelWidths.slice(0, pIndex).reduce((a,b)=>a+b,0) + layout.gap * pIndex; }
                else { pIndex = Math.floor(total/2); gateStartMm = layout.gap + layout.panelWidths.slice(0, pIndex).reduce((a,b)=>a+b,0) + layout.gap * pIndex; }
              }
            }
          } else {
            const pos = sideGates[idx]?.position || 'middle';
            if (pos === 'left') pIndex = 0;
            else if (pos === 'right') pIndex = Math.max(0, total - 1);
            // Compute corresponding start mm for consistency
            gateStartMm = layout.gap + layout.panelWidths.slice(0, pIndex).reduce((a,b)=>a+b,0) + layout.gap * pIndex;
          }
          const hingeOnLeft = shape === 'custom'
            ? !!(customRuns[idx]?.id && customGateByRun[customRuns[idx].id!]?.hingeOnLeft)
            : !!sideGates[idx]?.hingeOnLeft;
          sideGatesRender[idx] = { enabled: true, panelIndex: pIndex, hingeOnLeft, gateStartMm };
        } else {
          sideGatesRender[idx] = { enabled: false, panelIndex: 0, hingeOnLeft: false };
        }
        return layout;
      });
      if (allPanels.length) {
  const agg = aggregatePanels(allPanels, { internal: ps1.internal, edge: ps1.edge, system: fenceCategory, thk: parseFloat(glassThickness||'0') || 0, hmin: 0, hmax: 0, zone: windZone || '' });
        panelsSummary = agg.panelsSummary;
        totalSpigots = agg.totalSpigots + gateCount * 2; // add 2 posts per gate
        estimatedPanels = agg.totalPanels;
        estimatedSpigots = totalSpigots;
      }
    } else {
      notes.push('No PS1 row found for selected parameters (placeholder calculation).');
    }
    const resolvedDiscHead = discHeadOptions.length ? (discHead || discHeadOptions[0]?.value) : undefined;
    const resolvedPowdercoatColor = showPowdercoatColor ? powdercoatColor.trim() : '';
    const resolvedExtraPackers = showExtraPackers ? parsedExtraPackers : 0;
    const layoutInput: LayoutCalculationInput = {
      system,
      calcKey: resolvedCalcKey,
      shape,
      sideLengths: usedSides,
      ...(shape === 'custom' ? { customVectors: customRuns.map(r => ({ dx: r.dx, dy: r.dy, length: r.length, id: r.id })) } : {}),
      fenceType,
      fixingType,
      windZone,
      glassHeight,
      glassThickness,
      handrail,
      glassMode,
      gapSize,
      allowMixedSizes,
      spigotsPerPanel,
      finish,
      discHead: resolvedDiscHead ?? null,
      extraPackers: resolvedExtraPackers,
      powdercoatColor: resolvedPowdercoatColor ? resolvedPowdercoatColor : null,
      sideGates: sideGates.slice(0, sidesCount),
    };

    const layoutResultData: LayoutCalculationResult = {
      totalRun,
      sideRuns: usedSides,
      ps1: ps1 ? { internal: ps1.internal, edge: ps1.edge, source: (resolvedCalcKey as unknown as 'sp10' | 'sp12' | 'sp13') } : null,
      estimatedSpigots,
      estimatedPanels,
      panelsSummary,
      totalSpigots,
      sidePanelLayouts,
      allPanels,
      notes,
      sideGatesRender,
    };

    const orderItems = computeOrderList(resolvedCalcKey, layoutInput, layoutResultData);

    setLayout(layoutInput, { ...layoutResultData, orderItems });
  }

  const hasResult = !!layoutResult;

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
      {shape === 'custom' && (
        <div className="mb-6">
          <CustomShapeDesigner onChange={(runs)=> setCustomRuns(runs)} />
        </div>
      )}
  <form ref={formRef} onSubmit={handleCalculate} className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {Array.from({ length: sidesCount }).map((_, i) => (
          <FieldGroup key={i}>
            <label className="text-xs font-medium text-slate-500">
              {`Side ${sideLabels[i]} length (mm)`}
            </label>
            <input
              type="number"
              inputMode="numeric"
              min={2000}
              required
      value={sideLengths[i] || ''}
      onChange={(e)=>handleSideChange(i, e.target.value)}
              onFocus={() => setFocusedSide(i)}
              onBlur={() => setFocusedSide((prev) => (prev === i ? null : prev))}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-300/40"
            />
            {/* Gate controls per side */}
            <div className="mt-2 flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-sky-600"
                  checked={sideGates[i]?.enabled || false}
                  onChange={(e)=> setSideGates(prev => {
                    const next = [...prev];
                    next[i] = { ...(next[i] || { position: 'middle' as const }), enabled: e.target.checked };
                    return next;
                  })}
                />
                Gate required? (890mm + clearances)
              </label>
              {/* Position and hinge selection removed; adjust in visual below after calculation */}
            </div>
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
            value={fixingType || ''}
            required
            onChange={(e)=> setFixingType(e.target.value || undefined)}
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
            value={windZone}
            onChange={(e)=> setWindZone(e.target.value)}
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
            value={glassHeight}
            onChange={(e)=> setGlassHeight(parseInt(e.target.value))}
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
            {filteredGlassThicknesses.map((t) => (
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
            {filteredHandrails.map((h) => (
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
            <p className="mt-1 text-[11px] text-slate-500">Pool fence – handrail not used.</p>
          )}
        </FieldGroup>
        <FieldGroup>
          <label className="text-xs font-medium text-slate-500">Hardware finish</label>
          <select
            disabled={!optionSets}
            value={finish}
            onChange={(e)=> setFinish(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-300/40 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            {!optionSets && <option>—</option>}
            {optionSets?.finishes.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </FieldGroup>

        {discHeadOptions.length > 0 && (
          <FieldGroup>
            <label className="text-xs font-medium text-slate-500">Disc / clamp head</label>
            <select
              value={discHead || discHeadOptions[0]?.value}
              onChange={(e) => setDiscHead(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-300/40"
            >
              {discHeadOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </FieldGroup>
        )}

        {showExtraPackers && (
          <FieldGroup>
            <label className="text-xs font-medium text-slate-500">Extra packers</label>
            <input
              type="number"
              min={0}
              step={1}
              value={extraPackers}
              onChange={(e) => {
                const next = e.target.value;
                if (next === '') {
                  setExtraPackers('');
                  return;
                }
                const parsed = parseInt(next, 10);
                if (Number.isNaN(parsed) || parsed < 0) return;
                setExtraPackers(String(parsed));
              }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-300/40"
            />
            <p className="mt-1 text-[11px] text-slate-500">Optional gasket packers supplied on top of calculated quantity.</p>
          </FieldGroup>
        )}

        {showPowdercoatColor && (
          <FieldGroup>
            <label className="text-xs font-medium text-slate-500">Powdercoat colour</label>
            <input
              type="text"
              value={powdercoatColor}
              onChange={(e) => setPowdercoatColor(e.target.value)}
              placeholder="e.g. Matt Black, Surfmist"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-300/40"
            />
            <p className="mt-1 text-[11px] text-slate-500">Shown on powdercoat charge lines in the order list.</p>
          </FieldGroup>
        )}

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

        {/* Gap Size (hidden in stock mode; auto-selected by solver) */}
        {glassMode === 'standard' && (
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
        )}

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
          <Button
            type="submit"
            className="mt-4 w-full"
            onClick={() => {
              const form = formRef.current;
              if (!form) return;
              // Trigger native tooltip and show a small warning below when invalid
              if (!form.checkValidity()) {
                form.reportValidity();
                setFormWarning('Please complete all required fields.');
              } else {
                setFormWarning('');
              }
            }}
          >
            Calculate compliant layout
          </Button>
          {formWarning && (
            <p className="mt-2 text-[11px] font-medium text-red-600">{formWarning}</p>
          )}
        </div>
      </form>
      {hasResult && (
        <div className="mt-8 space-y-6">
          <CompliantLayout />
          <OrderList />
          <SideVisuals />
        </div>
      )}
    </div>
  );
}
