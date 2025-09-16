import { useState, useRef, useEffect, useCallback } from 'react';
import Button from '@/components/ui/Button';

/**
 * Simplified React re‑implementation of the legacy freehand custom shape logic.
 * Goals:
 *  - Allow the user to click points on an infinite grid (pan + zoom) to define connected straight runs
 *  - Snap lengths to 5 mm increments & angles to 5° increments (like legacy)
 *  - Produce ordered side list (A, B, C, …) with editable numeric inputs (mm)
 *  - Expose the lengths & vectors to parent via onChange callback
 *  - Undo / Clear support (basic)
 *
 * Differences from legacy (kept intentionally minimal for first pass):
 *  - No multi‑shape branching / resume from previous point sets (treats single polyline only)
 *  - No joiner / corner classification yet
 *  - No gate checkboxes (can be added later)
 */

export interface CustomRun {
  id: string;        // A, B, C ...
  length: number;    // mm (snapped)
  dx: number;        // mm delta x (plan view)
  dy: number;        // mm delta y (plan view)
}

export interface CustomShapeDesignerProps {
  value?: CustomRun[];
  onChange?: (runs: CustomRun[]) => void;
  className?: string;
  height?: number;
}

// Scale: 1 SVG unit == 10 mm (legacy MM_PER_PIXEL = 10)
const MM_PER_UNIT = 10; // we keep same naming concept
const ANGLE_SNAP = 5;   // degrees
const LENGTH_SNAP_MM = 5; // mm

interface Pt { x: number; y: number; }

function snapLength(rawDx: number, rawDy: number): { dx: number; dy: number; lenMm: number } {
  const distUnits = Math.sqrt(rawDx * rawDx + rawDy * rawDy);
  const distMmRaw = distUnits * MM_PER_UNIT;
  const snappedMm = Math.round(distMmRaw / LENGTH_SNAP_MM) * LENGTH_SNAP_MM;
  if (distUnits === 0) return { dx: 0, dy: 0, lenMm: 0 };
  const scale = snappedMm / (distUnits * MM_PER_UNIT);
  return { dx: rawDx * scale, dy: rawDy * scale, lenMm: snappedMm };
}

function snapAngle(from: Pt, to: Pt): Pt {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx*dx + dy*dy);
  if (dist === 0) return to;
  const angle = Math.atan2(dy, dx) * 180/Math.PI;
  const snapped = Math.round(angle / ANGLE_SNAP) * ANGLE_SNAP;
  const rad = snapped * Math.PI/180;
  return { x: from.x + dist * Math.cos(rad), y: from.y + dist * Math.sin(rad) };
}

export default function CustomShapeDesigner({ value, onChange, className, height = 420 }: CustomShapeDesignerProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [points, setPoints] = useState<Pt[]>(() => []);
  const [ghost, setGhost] = useState<Pt | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<{x:number;y:number}>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panOrigin = useRef<{x:number;y:number;startX:number;startY:number} | null>(null);
  const [runs, setRuns] = useState<CustomRun[]>(value || []);

  // derive runs from points whenever points change (except while editing numeric fields manually)
  useEffect(() => {
    if (points.length < 2) {
      setRuns([]);
      onChange?.([]);
      return;
    }
    const newRuns: CustomRun[] = [];
    for (let i=1;i<points.length;i++) {
      const a = points[i-1];
      const b = points[i];
      const rawDx = (b.x - a.x);
      const rawDy = (b.y - a.y);
      const { dx, dy, lenMm } = snapLength(rawDx, rawDy);
      newRuns.push({ id: String.fromCharCode(65 + (i-1)), length: lenMm, dx: dx * MM_PER_UNIT, dy: dy * MM_PER_UNIT });
    }
    setRuns(newRuns);
    onChange?.(newRuns);
  }, [points, onChange]);

  // pointer coordinate to svg logical coordinates (pre‑pan/zoom applied as transform)
  const clientToSvg = useCallback((evt: React.MouseEvent | MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return { x:0, y:0 };
    const rect = svg.getBoundingClientRect();
    const x = (evt.clientX - rect.left) / zoom - pan.x;
    const y = (evt.clientY - rect.top) / zoom - pan.y;
    return { x, y };
  }, [zoom, pan]);

  function handleClick(e: React.MouseEvent) {
    if (isPanning || e.ctrlKey) return;
    const svgPt = clientToSvg(e);
    // Snap angle & length relative to previous point if exists
    let next = svgPt;
    if (points.length) {
      const snappedAngle = snapAngle(points[points.length-1], svgPt);
      const { dx, dy, lenMm } = snapLength(snappedAngle.x - points[points.length-1].x, snappedAngle.y - points[points.length-1].y);
      const prev = points[points.length-1];
      next = { x: prev.x + dx, y: prev.y + dy };
      if (lenMm === 0) return; // ignore zero length
    }
    setPoints(p => [...p, next]);
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (isPanning && panOrigin.current) {
      const pt = clientToSvg(e);
      const ox = panOrigin.current.startX;
      const oy = panOrigin.current.startY;
      setPan({ x: pt.x - ox, y: pt.y - oy });
      return;
    }
    if (!points.length) return;
    const svgPt = clientToSvg(e);
    const snappedAngle = snapAngle(points[points.length-1], svgPt);
    const { dx, dy } = snapLength(snappedAngle.x - points[points.length-1].x, snappedAngle.y - points[points.length-1].y);
    const prev = points[points.length-1];
    setGhost({ x: prev.x + dx, y: prev.y + dy });
  }

  function startPan(e: React.MouseEvent) {
    if (e.button !== 1 && !(e.ctrlKey && e.button === 0)) return; // middle OR ctrl+left
    e.preventDefault();
    const pt = clientToSvg(e);
    panOrigin.current = { x: pan.x, y: pan.y, startX: pt.x - pan.x, startY: pt.y - pan.y };
    setIsPanning(true);
  }
  function endPan() { setIsPanning(false); panOrigin.current = null; }

  function handleWheel(e: React.WheelEvent) {
    if (!e.ctrlKey) return; // ctrl + wheel to zoom
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    let next = zoom * factor;
    next = Math.min(5, Math.max(0.5, next));
    setZoom(next);
  }

  function handleLengthEdit(i: number, v: string) {
    const mm = parseFloat(v);
    if (isNaN(mm) || mm <= 0) return;
    // Adjust point i+1 based on new length along same direction
    setPoints(prev => {
      if (i+1 >= prev.length) return prev;
      const a = prev[i];
      const b = prev[i+1];
      const dirx = b.x - a.x;
      const diry = b.y - a.y;
      const dist = Math.sqrt(dirx*dirx + diry*diry) || 1;
      const scale = (mm / MM_PER_UNIT) / dist;
      const nx = a.x + dirx * scale;
      const ny = a.y + diry * scale;
      const nextPts = [...prev];
      nextPts[i+1] = { x: nx, y: ny };
      return nextPts;
    });
  }

  function handleUndo() {
    setPoints(prev => prev.slice(0, -1));
  }
  function handleClear() {
    setPoints([]);
    setGhost(null);
  }

  return (
    <div className={`flex flex-col gap-3 ${className || ''}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Custom Shape Designer</h3>
        <div className="flex gap-2">
          <Button type="button" onClick={handleUndo} disabled={points.length < 1}>Undo</Button>
          <Button type="button" onClick={handleClear} disabled={!points.length}>Clear</Button>
        </div>
      </div>
      <div className="relative rounded-lg border border-slate-300 bg-white">
        <svg
          ref={svgRef}
          width="100%"
          height={height}
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setGhost(null)}
          onMouseDown={startPan}
          onMouseUp={endPan}
          onWheel={handleWheel}
          className="cursor-crosshair select-none"
        >
          {/* background grid via pattern */}
          <defs>
            <pattern id="grid" width={50} height={50} patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e2e8f0" strokeWidth={1} />
            </pattern>
          </defs>
          <rect x={-10000} y={-10000} width={20000} height={20000} fill="url(#grid)" />
          <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
            {/* drawn lines */}
            {points.map((p, i) => {
              if (i === 0) return null;
              const a = points[i-1];
              const b = p;
              return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#0f172a" strokeWidth={3} strokeLinecap="round" />
            })}
            {/* ghost line */}
            {ghost && points.length > 0 && (
              <line x1={points[points.length-1].x} y1={points[points.length-1].y} x2={ghost.x} y2={ghost.y} stroke="#0369a1" strokeDasharray="6 6" strokeWidth={2} />
            )}
            {/* points */}
            {points.map((p,i)=>(
              <g key={`pt-${i}`}>
                <circle cx={p.x} cy={p.y} r={7} fill="#0284c7" stroke="#fff" strokeWidth={2} />
                <text x={p.x+12} y={p.y-12} fontSize={14} fontFamily="system-ui, sans-serif" fill="#0369a1" fontWeight={600}>{String.fromCharCode(65+i)}</text>
              </g>
            ))}
            {/* ghost measurement label */}
            {ghost && points.length>0 && (()=>{
              const a = points[points.length-1];
              const b = ghost; 
              const dx = b.x - a.x; const dy = b.y - a.y;
              const { lenMm } = snapLength(dx, dy);
              const mx = (a.x + b.x)/2; const my = (a.y + b.y)/2;
              return <text x={mx} y={my-10} textAnchor="middle" fontSize={14} fill="#0369a1" fontFamily="system-ui">{lenMm} mm</text>
            })()}
          </g>
        </svg>
        <div className="pointer-events-none absolute bottom-2 right-2 rounded bg-slate-800/80 px-2 py-1 text-[10px] font-medium text-white">Ctrl + wheel: zoom • Middle drag or Ctrl+Drag: pan</div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        {runs.length === 0 && (
          <p className="text-xs text-slate-500">Click to start drawing sides. Each click adds a new point. Segments snap to 5° & lengths to 5&nbsp;mm.</p>
        )}
        {runs.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {runs.map((r,i)=>(
              <label key={r.id} className="flex flex-col text-[11px] font-medium text-slate-600">
                <span className="mb-1 text-slate-500">Side {r.id}</span>
                <input
                  type="number"
                  className="w-28 rounded border border-slate-300 bg-white px-2 py-1 text-xs focus:border-sky-400 focus:ring-2 focus:ring-sky-300/40"
                  value={r.length}
                  min={100}
                  step={5}
                  onChange={(e)=>handleLengthEdit(i, e.target.value)}
                />
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
