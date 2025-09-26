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

// Legacy style internal angle calculation (returns 0–180, snapped to ANGLE_SNAP)
function internalAngle(prev: Pt, current: Pt, next: Pt): number {
  // Vectors: current from prev, next from current
  const v1x = current.x - prev.x;
  const v1y = current.y - prev.y;
  const v2x = next.x - current.x;
  const v2y = next.y - current.y;
  const dot = v1x * v2x + v1y * v2y;
  const cross = v1x * v2y - v1y * v2x;
  let angle = Math.atan2(cross, dot) * (180 / Math.PI);
  if (angle < 0) angle += 360;
  angle = 180 - angle; // supplementary so straight line shows 180
  if (angle < 0) angle += 360;
  if (angle > 180) angle = 360 - angle; // keep <= 180
  const snapped = Math.round(angle / ANGLE_SNAP) * ANGLE_SNAP;
  return snapped;
}

export default function CustomShapeDesigner({ value, onChange, className, height = 420 }: CustomShapeDesignerProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [points, setPoints] = useState<Pt[]>(() => []);
  const [ghost, setGhost] = useState<Pt | null>(null);
  const [isDrawingActive, setIsDrawingActive] = useState(true); // ESC cancels, next click resumes
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<{x:number;y:number}>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panOrigin = useRef<{x:number;y:number;startX:number;startY:number} | null>(null);
  const [runs, setRuns] = useState<CustomRun[]>(value || []);
  const cancelBtnRef = useRef<HTMLButtonElement | null>(null);
  const MOUSE_RESUME_HIT_R = 10; // svg units
  const TOUCH_RESUME_HIT_R = 18; // svg units (bigger hit target)

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

  // Keyboard: ESC cancels current drawing (hides ghost and pauses until next click)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setGhost(null);
        setIsDrawingActive(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // pointer coordinate to svg logical coordinates (pre‑pan/zoom applied as transform)
  // Accepts any event-like with clientX/clientY (MouseEvent, PointerEvent, React synthetic)
  const clientToSvg = useCallback((evt: { clientX: number; clientY: number }) => {
    const svg = svgRef.current;
    if (!svg) return { x:0, y:0 };
    const rect = svg.getBoundingClientRect();
    const x = (evt.clientX - rect.left) / zoom - pan.x;
    const y = (evt.clientY - rect.top) / zoom - pan.y;
    return { x, y };
  }, [zoom, pan]);

  // Prevent browser page zoom on Ctrl + wheel when over the drawing container (desktop)
  useEffect(() => {
    const onWheelCapture = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      const el = containerRef.current;
      if (el && e.target && el.contains(e.target as Node)) {
        e.preventDefault();
      }
    };
    window.addEventListener('wheel', onWheelCapture, { passive: false, capture: true });
    return () => {
      window.removeEventListener('wheel', onWheelCapture as EventListener, { capture: true } as EventListenerOptions);
    };
  }, []);

  // Touch-friendly draw: press & hold, drag to desired point, release to set
  const [isDraggingDraw, setIsDraggingDraw] = useState(false);
  const dragPointerId = useRef<number | null>(null);
  const addedAnchorOnDown = useRef(false);
  // Multi-touch pinch zoom
  const pointerPositions = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchRef = useRef<{ active: boolean; id1: number | null; id2: number | null; startZoom: number; startDist: number }>(
    { active: false, id1: null, id2: null, startZoom: 1, startDist: 0 }
  );

  function handlePointerDown(e: React.PointerEvent<SVGSVGElement>) {
    // Only handle touch here; let mouse continue with existing handlers
    if (e.pointerType === 'mouse') return;
    if (isPanning || e.ctrlKey) return;
    const svg = svgRef.current;
    if (svg) svg.setPointerCapture(e.pointerId);
    dragPointerId.current = e.pointerId;
    // Track this pointer
    pointerPositions.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    // If we have two pointers, start pinch mode
    if (pointerPositions.current.size === 2 && !pinchRef.current.active) {
      const ids = Array.from(pointerPositions.current.keys());
      const p1 = pointerPositions.current.get(ids[0])!;
      const p2 = pointerPositions.current.get(ids[1])!;
      const dx = p2.x - p1.x, dy = p2.y - p1.y;
      const dist = Math.hypot(dx, dy) || 1;
      pinchRef.current = { active: true, id1: ids[0], id2: ids[1], startZoom: zoom, startDist: dist };
      // Stop any drawing drag while pinching
      setIsDraggingDraw(false);
      return;
    }

    // If paused, only resume when touching the last point (hit test)
    if (!isDrawingActive && points.length) {
      const svgPt = clientToSvg(e);
      const last = points[points.length - 1];
      const dxh = svgPt.x - last.x;
      const dyh = svgPt.y - last.y;
      const dist = Math.hypot(dxh, dyh);
      if (dist <= TOUCH_RESUME_HIT_R) {
        const snappedAngle = snapAngle(last, svgPt);
        const { dx, dy } = snapLength(snappedAngle.x - last.x, snappedAngle.y - last.y);
        setGhost({ x: last.x + dx, y: last.y + dy });
        setIsDrawingActive(true);
        // don't start a draw drag yet (user can adjust by moving)
        setIsDraggingDraw(true);
      }
      // If not near last point while paused, do nothing (allow pinch/pan only)
      return;
    }

    // If starting from no points, commit the first anchor on touch down
    if (points.length === 0) {
      const svgPt = clientToSvg(e);
      setPoints(p => [...p, svgPt]);
      addedAnchorOnDown.current = true;
    } else {
      addedAnchorOnDown.current = false;
    }

    setIsDraggingDraw(true);
  }

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (e.pointerType === 'mouse') return;
    // Update tracked pointer position
    if (pointerPositions.current.has(e.pointerId)) {
      pointerPositions.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }
    // Handle pinch zoom if active with two pointers
    if (pinchRef.current.active) {
      const { id1, id2, startZoom, startDist } = pinchRef.current;
      if (id1 != null && id2 != null && pointerPositions.current.has(id1) && pointerPositions.current.has(id2)) {
        const p1 = pointerPositions.current.get(id1)!;
        const p2 = pointerPositions.current.get(id2)!;
        const dx = p2.x - p1.x, dy = p2.y - p1.y;
        const dist = Math.hypot(dx, dy) || 1;
        const ratio = dist / (startDist || 1);
        const newZoom = Math.min(5, Math.max(0.5, startZoom * ratio));
        // Use current center for anchor
        const cx = (p1.x + p2.x) / 2;
        const cy = (p1.y + p2.y) / 2;
        const svg = svgRef.current;
        if (svg) {
          const rect = svg.getBoundingClientRect();
          const sx = cx - rect.left;
          const sy = cy - rect.top;
          // Adjust pan so the world under the center stays fixed while zooming
          setPan(prev => ({ x: prev.x + sx * (1 / newZoom - 1 / zoom), y: prev.y + sy * (1 / newZoom - 1 / zoom) }));
          setZoom(newZoom);
        } else {
          setZoom(newZoom);
        }
      }
      return; // do not draw while pinching
    }
    if (!isDraggingDraw) return;
    // If finger hovers over cancel button area, auto-pause drawing
    const btn = cancelBtnRef.current;
    if (btn) {
      const r = btn.getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        // Release capture so button can receive interactions if needed
        const svg = svgRef.current;
        if (svg && dragPointerId.current !== null) svg.releasePointerCapture(dragPointerId.current);
        dragPointerId.current = null;
        setIsDraggingDraw(false);
        if (isDrawingActive) pauseDrawing();
        return;
      }
    }
    if (!isDrawingActive) return;
    if (!points.length) return;
    const svgPt = clientToSvg(e);
    const snappedAngle = snapAngle(points[points.length-1], svgPt);
    const { dx, dy } = snapLength(snappedAngle.x - points[points.length-1].x, snappedAngle.y - points[points.length-1].y);
    const prev = points[points.length-1];
    setGhost({ x: prev.x + dx, y: prev.y + dy });
  }

  function handlePointerUp(e: React.PointerEvent<SVGSVGElement>) {
    if (e.pointerType === 'mouse') return;
    // Remove tracked pointer
    pointerPositions.current.delete(e.pointerId);
    // If pinch was active and one pointer lifted, end pinch mode
    if (pinchRef.current.active) {
      const { id1, id2 } = pinchRef.current;
      if (e.pointerId === id1 || e.pointerId === id2 || pointerPositions.current.size < 2) {
        pinchRef.current = { active: false, id1: null, id2: null, startZoom: 1, startDist: 0 };
      }
    }
    if (dragPointerId.current !== null && e.pointerId !== dragPointerId.current) return;
    const svg = svgRef.current;
    if (svg && dragPointerId.current !== null) svg.releasePointerCapture(dragPointerId.current);
    dragPointerId.current = null;

    if (!isDraggingDraw) return;
    setIsDraggingDraw(false);
    if (!isDrawingActive) return;

    // If we have at least one anchor, commit the next point at release
    if (points.length) {
      const svgPt = clientToSvg(e);
      let next = svgPt;
      const snappedAngle = snapAngle(points[points.length-1], svgPt);
      const { dx, dy, lenMm } = snapLength(snappedAngle.x - points[points.length-1].x, snappedAngle.y - points[points.length-1].y);
      const prev = points[points.length-1];
      next = { x: prev.x + dx, y: prev.y + dy };
      if (lenMm > 0) {
        setPoints(p => [...p, next]);
      }
      setGhost(null);
      return;
    }

    // No points scenario shouldn't reach here because we add first on down
  }

  function handleClick(e: React.MouseEvent) {
    if (isPanning || e.ctrlKey) return;
    const svgPt = clientToSvg(e);
    // If paused, only resume when clicking the last point
    if (!isDrawingActive && points.length) {
      const last = points[points.length - 1];
      const dxh = svgPt.x - last.x;
      const dyh = svgPt.y - last.y;
      const dist = Math.hypot(dxh, dyh);
      if (dist <= MOUSE_RESUME_HIT_R) {
        const snappedAngle = snapAngle(last, svgPt);
        const { dx, dy } = snapLength(snappedAngle.x - last.x, snappedAngle.y - last.y);
        setGhost({ x: last.x + dx, y: last.y + dy });
        setIsDrawingActive(true);
        return; // don't commit a point on this resume click
      }
      return; // clicked elsewhere while paused -> ignore
    }
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
    // Clear ghost so the angle arc disappears until mouse moves again (matches legacy behavior)
    setGhost(null);
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (isPanning && panOrigin.current) {
      const pt = clientToSvg(e);
      const ox = panOrigin.current.startX;
      const oy = panOrigin.current.startY;
      setPan({ x: pt.x - ox, y: pt.y - oy });
      return;
    }
    // While Ctrl is held (desktop pan gesture), don't update ghost to avoid flicker
    if ((e as any).ctrlKey) return;
    if (!points.length) return;
    if (!isDrawingActive) return; // paused via ESC
    const svgPt = clientToSvg(e);
    const snappedAngle = snapAngle(points[points.length-1], svgPt);
    const { dx, dy } = snapLength(snappedAngle.x - points[points.length-1].x, snappedAngle.y - points[points.length-1].y);
    const prev = points[points.length-1];
    setGhost({ x: prev.x + dx, y: prev.y + dy });
  }

  function startPan(e: React.MouseEvent) {
    if (e.button !== 1 && !(e.ctrlKey && e.button === 0)) return; // middle OR ctrl+left
    e.preventDefault();
    // Hide ghost while panning to prevent flicker
    setGhost(null);
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
    const svg = svgRef.current;
    if (svg) {
      const rect = svg.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      // Anchor zoom around cursor position to keep ghost aligned with pointer
      setPan(prev => ({ x: prev.x + sx * (1 / next - 1 / zoom), y: prev.y + sy * (1 / next - 1 / zoom) }));
      setZoom(next);
    } else {
      setZoom(next);
    }
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

  // Mobile-friendly control: pause (cancel) drawing like pressing ESC
  function pauseDrawing() {
    if (!isDrawingActive) return;
    setGhost(null);
    setIsDrawingActive(false);
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
  <div ref={containerRef} className="relative rounded-lg border border-slate-300 bg-white">
        {/* Cancel (ESC) button - visible on all platforms */}
        <button
          ref={cancelBtnRef}
          type="button"
          aria-label="Cancel drawing"
          onClick={(e) => { e.stopPropagation(); pauseDrawing(); }}
          className={`absolute left-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full shadow-lg transition active:scale-95 ${isDrawingActive && points.length > 0 ? 'bg-red-600 text-white' : 'bg-slate-300 text-slate-600 opacity-70'}`}
          disabled={!isDrawingActive || points.length === 0}
          title="Cancel current segment (tap to pause, then click/tap the LAST point to resume)"
        >
          ×
        </button>
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
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className={`${isDrawingActive ? 'cursor-crosshair' : 'cursor-default'} select-none touch-none`}
        >
          {/* background grid via pattern */}
          <defs>
            <pattern id="grid" width={50} height={50} patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e2e8f0" strokeWidth={1} />
            </pattern>
          </defs>
          <rect x={-10000} y={-10000} width={20000} height={20000} fill="url(#grid)" />
          <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
            {/* drawn lines and length labels */}
            {points.map((p, i) => {
              if (i === 0) return null;
              const a = points[i-1];
              const b = p;
              // Calculate length in mm
              const dx = b.x - a.x;
              const dy = b.y - a.y;
              const { lenMm } = snapLength(dx, dy);
              // Midpoint for label
              const mx = (a.x + b.x) / 2;
              const my = (a.y + b.y) / 2;
              // Offset label a bit above the line
              const labelOffset = 14;
              const angle = Math.atan2(dy, dx);
              const lx = mx + labelOffset * Math.sin(angle);
              const ly = my - labelOffset * Math.cos(angle);
              return (
                <g key={i}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#0f172a" strokeWidth={3} strokeLinecap="round" />
                  <text x={lx} y={ly} textAnchor="middle" fontSize={14} fill="#0369a1" fontFamily="system-ui" fontWeight={600}>{`${String.fromCharCode(65 + (i-1))}: ${lenMm} mm`}</text>
                </g>
              );
            })}

            {/* ghost line, length label & live angle arc */}
            {ghost && points.length > 0 && (() => {
              const prev = points[points.length-1];
              const b = ghost;
              const dx = b.x - prev.x; const dy = b.y - prev.y;
              const { lenMm } = snapLength(dx, dy);
              const mx = (prev.x + b.x)/2; const my = (prev.y + b.y)/2;
              const labelOffset = 14;
              const angLine = Math.atan2(dy, dx);
              const lx = mx + labelOffset * Math.sin(angLine);
              const ly = my - labelOffset * Math.cos(angLine);

              // Angle arc only if at least 2 fixed points (we need a previous segment)
              let arcEl: React.ReactNode = null;
              let angleLabel: React.ReactNode = null;
              if (points.length >= 2) {
                const prevPrev = points[points.length - 2];
                const anchor = prev; // vertex point
                const angleDeg = internalAngle(prevPrev, anchor, b);
                // Geometry for arc similar to legacy
                const radius = 45; // svg units
                const startAngle = Math.atan2(prevPrev.y - anchor.y, prevPrev.x - anchor.x);
                const endAngle = Math.atan2(b.y - anchor.y, b.x - anchor.x);
                let diff = endAngle - startAngle;
                if (diff > Math.PI) diff -= 2 * Math.PI;
                if (diff < -Math.PI) diff += 2 * Math.PI;
                const sweepFlag = diff > 0 ? 1 : 0;
                const largeArcFlag = Math.abs(diff) > Math.PI ? 1 : 0;
                const sx = anchor.x + radius * Math.cos(startAngle);
                const sy = anchor.y + radius * Math.sin(startAngle);
                const ex = anchor.x + radius * Math.cos(endAngle);
                const ey = anchor.y + radius * Math.sin(endAngle);
                const pathD = `M ${sx} ${sy} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${ex} ${ey}`;
                arcEl = <path d={pathD} stroke="#0369a1" strokeWidth={2} fill="none" strokeDasharray="4 3" />;
                const midAngle = startAngle + diff / 2;
                const labelR = radius + 18;
                const ax = anchor.x + labelR * Math.cos(midAngle);
                const ay = anchor.y + labelR * Math.sin(midAngle) + 4;
                angleLabel = <text x={ax} y={ay} fontSize={14} fontFamily="system-ui" fontWeight={600} fill="#0369a1" textAnchor="middle">{angleDeg}&deg;</text>;
              }

              return (
                <>
                  <line x1={prev.x} y1={prev.y} x2={b.x} y2={b.y} stroke="#0369a1" strokeDasharray="6 6" strokeWidth={2} />
                  <text x={lx} y={ly} textAnchor="middle" fontSize={14} fill="#0369a1" fontFamily="system-ui" fontWeight={600}>{lenMm} mm</text>
                  {arcEl}
                  {angleLabel}
                </>
              );
            })()}

            {/* points and angle labels */}
            {points.map((p, i) => {
              // Internal angle for middle vertices
              if (i > 0 && i < points.length - 1) {
                const ang = internalAngle(points[i-1], p, points[i+1]);
                if (ang !== 180) {
                  const isRightAngle = ang === 90;
                  const fill = isRightAngle ? '#22c55e' : '#fbbf24';
                  return (
                    <g key={`pt-${i}`}>
                      {/* Angle badge exactly on the point */}
                      <circle cx={p.x} cy={p.y} r={14} fill={fill} stroke="#ffffff" strokeWidth={3} />
                      <text x={p.x} y={p.y+4} fontSize={11} fontFamily="system-ui" fontWeight={700} fill="#ffffff" textAnchor="middle">{ang}&deg;</text>
                    </g>
                  );
                }
              }
              // Endpoints or straight (180°) joints: keep original point styling
              const isLast = i === points.length - 1;
              const clickableWhilePaused = isLast && !isDrawingActive;
              return (
                <g key={`pt-${i}`}>
                  {clickableWhilePaused && <title>Click to resume drawing from here</title>}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={7}
                    fill="#0284c7"
                    stroke="#fff"
                    strokeWidth={2}
                    className={clickableWhilePaused ? 'cursor-pointer' : undefined}
                    onClick={(e) => {
                      if (!clickableWhilePaused) return;
                      e.stopPropagation();
                      // Resume drawing from last point; place ghost toward current mouse position if available
                      const svg = svgRef.current;
                      if (!svg) { setIsDrawingActive(true); return; }
                      const rect = svg.getBoundingClientRect();
                      const clientX = (e as any).clientX ?? rect.left + (p.x + pan.x) * zoom;
                      const clientY = (e as any).clientY ?? rect.top + (p.y + pan.y) * zoom;
                      const svgPt = clientToSvg({ clientX, clientY });
                      const snapped = snapAngle(p, svgPt);
                      const { dx, dy } = snapLength(snapped.x - p.x, snapped.y - p.y);
                      setGhost({ x: p.x + dx, y: p.y + dy });
                      setIsDrawingActive(true);
                    }}
                  />
                </g>
              );
            })}
          </g>
        </svg>
        <div className="pointer-events-none absolute bottom-2 right-2 rounded bg-slate-800/80 px-2 py-1 text-[10px] font-medium text-white">Ctrl + wheel: zoom • Middle drag or Ctrl+Drag: pan • Esc: cancel</div>
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
