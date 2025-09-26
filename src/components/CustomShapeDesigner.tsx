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
  gate?: { enabled: boolean; position: 'left'|'middle'|'right'; hingeOnLeft?: boolean };
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
  // Which endpoint to extend from when resuming: 'end' (default, last point) or 'start' (first point)
  const [extendFrom, setExtendFrom] = useState<'start' | 'end'>('end');
  // Use legacy-like viewBox zoom/pan so mouse anchoring matches exactly
  // Start a bit zoomed-in compared to the previous default
  // Start even more zoomed-in (smaller viewBox for closer view)
  const [viewBox, setViewBox] = useState<{ x: number; y: number; width: number; height: number }>(() => ({ x: -500, y: -350, width: 900, height: 600 }));
  const [isPanning, setIsPanning] = useState(false);
  // Track last client position (pixels) for panning deltas
  const panOrigin = useRef<{ clientX: number; clientY: number } | null>(null);
  const [runs, setRuns] = useState<CustomRun[]>(value || []);
  // Gate state per run id (A, B, C...)
  const [gateById, setGateById] = useState<Record<string, { enabled: boolean; position: 'left'|'middle'|'right'; hingeOnLeft?: boolean }>>({});
  const cancelBtnRef = useRef<HTMLButtonElement | null>(null);
  const MOUSE_RESUME_HIT_R = 10; // svg units
  const TOUCH_RESUME_HIT_R = 18; // svg units (bigger hit target)
  // Smooth ghost updates
  const ghostRafId = useRef<number | null>(null);
  const lastMouseClient = useRef<{ x: number; y: number } | null>(null);

  // Dynamic text sizing for ALL SVG text: grows when zooming out, shrinks when zooming in
  // Keep this in sync with the initial viewBox.width below (900)
  const INITIAL_VB_WIDTH = 900;
  const textScaleAll = Math.min(3, Math.max(0.6, viewBox.width / INITIAL_VB_WIDTH));
  const scaledFont = (base: number) => Math.max(8, Math.round(base * textScaleAll));
  const scaledSize = (base: number, min = 0.5) => Math.max(min, base * textScaleAll);

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
      const id = String.fromCharCode(65 + (i-1));
      newRuns.push({ id, length: lenMm, dx: dx * MM_PER_UNIT, dy: dy * MM_PER_UNIT, gate: gateById[id] });
    }
    setRuns(newRuns);
    onChange?.(newRuns);
  }, [points, onChange, gateById]);

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

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (ghostRafId.current != null) cancelAnimationFrame(ghostRafId.current);
      ghostRafId.current = null;
    };
  }, []);

  // pointer coordinate to svg logical coordinates using getScreenCTM (matches legacy)
  const clientToSvg = useCallback((evt: { clientX: number; clientY: number }) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = (svg as any).createSVGPoint ? (svg as any).createSVGPoint() : null;
    const ctm = svg.getScreenCTM?.();
    if (!pt || !ctm) {
      // fallback approximate mapping if CTM unavailable
      const rect = svg.getBoundingClientRect();
      const sx = (evt.clientX - rect.left) / rect.width;
      const sy = (evt.clientY - rect.top) / rect.height;
      return { x: viewBox.x + sx * viewBox.width, y: viewBox.y + sy * viewBox.height };
    }
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    const svgPt = pt.matrixTransform(ctm.inverse());
    return { x: svgPt.x, y: svgPt.y };
  }, [viewBox]);

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
      // Store starting viewBox dimensions and start distance
      pinchRef.current = { active: true, id1: ids[0], id2: ids[1], startZoom: 1, startDist: dist };
      // Stop any drawing drag while pinching
      setIsDraggingDraw(false);
      // Hide ghost during pinch to avoid misalignment during zoom
      setGhost(null);
      return;
    }

    // If paused, resume when touching the LAST or FIRST point (hit test)
    if (!isDrawingActive && points.length) {
      const svgPt = clientToSvg(e);
      const first = points[0];
      const last = points[points.length - 1];
      const dLast = Math.hypot(svgPt.x - last.x, svgPt.y - last.y);
      const dFirst = Math.hypot(svgPt.x - first.x, svgPt.y - first.y);
      if (dLast <= TOUCH_RESUME_HIT_R || dFirst <= TOUCH_RESUME_HIT_R) {
        // Preview: set ghost to raw cursor world coordinates for perfect alignment
        setGhost({ x: svgPt.x, y: svgPt.y });
        setExtendFrom(dFirst <= TOUCH_RESUME_HIT_R ? 'start' : 'end');
        setIsDrawingActive(true);
        // don't start a draw drag yet (user can adjust by moving)
        setIsDraggingDraw(true);
      }
      // If not near endpoints while paused, do nothing (allow pinch/pan only)
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
      const { id1, id2, startDist } = pinchRef.current;
      if (id1 != null && id2 != null && pointerPositions.current.has(id1) && pointerPositions.current.has(id2)) {
        const p1 = pointerPositions.current.get(id1)!;
        const p2 = pointerPositions.current.get(id2)!;
        const dx = p2.x - p1.x, dy = p2.y - p1.y;
        const dist = Math.hypot(dx, dy) || 1;
        const ratio = dist / (startDist || 1);
        // Compute new dimensions (zoom in -> smaller width/height)
        const oldVB = viewBox;
        const newWidth = Math.min(24000, Math.max(200, oldVB.width / ratio));
        const newHeight = newWidth * (oldVB.height / oldVB.width);
        // Anchor around pinch midpoint
        const cx = (p1.x + p2.x) / 2;
        const cy = (p1.y + p2.y) / 2;
        const mouseWorld = clientToSvg({ clientX: cx, clientY: cy });
        const xPrime = mouseWorld.x - (mouseWorld.x - oldVB.x) * (newWidth / oldVB.width);
        const yPrime = mouseWorld.y - (mouseWorld.y - oldVB.y) * (newHeight / oldVB.height);
        setViewBox({ x: xPrime, y: yPrime, width: newWidth, height: newHeight });
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
      // Preview: raw position so ghost is under finger
      setGhost({ x: svgPt.x, y: svgPt.y });
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
      // If user released near the opposite endpoint, close the shape and stop drawing
      if (points.length >= 2) {
        const first = points[0];
        const last = points[points.length - 1];
        const dToFirst = Math.hypot(svgPt.x - first.x, svgPt.y - first.y);
        const dToLast = Math.hypot(svgPt.x - last.x, svgPt.y - last.y);
        if (extendFrom === 'end' && dToFirst <= TOUCH_RESUME_HIT_R) {
          setPoints(prev => [...prev, prev[0]]);
          setGhost(null);
          setIsDrawingActive(false);
          return;
        }
        if (extendFrom === 'start' && dToLast <= TOUCH_RESUME_HIT_R) {
          setPoints(prev => [prev[prev.length - 1], ...prev]);
          setGhost(null);
          setIsDrawingActive(false);
          return;
        }
      }
      const anchorIndex = extendFrom === 'start' ? 0 : points.length - 1;
      const anchor = points[anchorIndex];
      const snappedAngle = snapAngle(anchor, svgPt);
      const { dx, dy, lenMm } = snapLength(snappedAngle.x - anchor.x, snappedAngle.y - anchor.y);
      const next = { x: anchor.x + dx, y: anchor.y + dy };
      if (lenMm > 0) {
        setPoints(p => (extendFrom === 'start' ? [next, ...p] : [...p, next]));
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
      const first = points[0];
      const last = points[points.length - 1];
      const dLast = Math.hypot(svgPt.x - last.x, svgPt.y - last.y);
      const dFirst = Math.hypot(svgPt.x - first.x, svgPt.y - first.y);
      if (dLast <= MOUSE_RESUME_HIT_R || dFirst <= MOUSE_RESUME_HIT_R) {
        const anchor = dFirst <= MOUSE_RESUME_HIT_R ? first : last;
        const snappedAngle = snapAngle(anchor, svgPt);
        // Preview: angle snap only from chosen endpoint
        setGhost({ x: snappedAngle.x, y: snappedAngle.y });
        setExtendFrom(dFirst <= MOUSE_RESUME_HIT_R ? 'start' : 'end');
        setIsDrawingActive(true);
        return; // don't commit a point on this resume click
      }
      return; // clicked elsewhere while paused -> ignore
    }
    // If active and clicking near the opposite endpoint, close and stop drawing
    if (isDrawingActive && points.length >= 2) {
      const first = points[0];
      const last = points[points.length - 1];
      const dToFirst = Math.hypot(svgPt.x - first.x, svgPt.y - first.y);
      const dToLast = Math.hypot(svgPt.x - last.x, svgPt.y - last.y);
      if (extendFrom === 'end' && dToFirst <= MOUSE_RESUME_HIT_R) {
        setPoints(prev => [...prev, prev[0]]);
        setGhost(null);
        setIsDrawingActive(false);
        return;
      }
      if (extendFrom === 'start' && dToLast <= MOUSE_RESUME_HIT_R) {
        setPoints(prev => [prev[prev.length - 1], ...prev]);
        setGhost(null);
        setIsDrawingActive(false);
        return;
      }
    }
    // Snap angle relative to previous point for click commit, then commit directly.
    let next = svgPt;
    if (points.length) {
      const anchorIndex = extendFrom === 'start' ? 0 : points.length - 1;
      const anchor = points[anchorIndex];
      const snappedAngle = snapAngle(anchor, svgPt);
      next = { x: snappedAngle.x, y: snappedAngle.y };
      // Avoid committing a zero-length segment
      const { lenMm } = snapLength(next.x - anchor.x, next.y - anchor.y);
      if (lenMm > 0) {
        setPoints(p => (extendFrom === 'start' ? [next, ...p] : [...p, next]));
      }
    } else {
      setPoints(p => [...p, next]);
    }
    // Clear ghost so the angle arc disappears until mouse moves again (matches legacy behavior)
    setGhost(null);
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (isPanning && panOrigin.current) {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const dxPx = e.clientX - panOrigin.current.clientX;
      const dyPx = e.clientY - panOrigin.current.clientY;
      panOrigin.current.clientX = e.clientX;
      panOrigin.current.clientY = e.clientY;
      const unitsPerPxX = viewBox.width / rect.width;
      const unitsPerPxY = viewBox.height / rect.height;
      setViewBox(prev => ({ ...prev, x: prev.x - dxPx * unitsPerPxX, y: prev.y - dyPx * unitsPerPxY }));
      return;
    }
    // While Ctrl is held (desktop pan gesture), don't update ghost to avoid flicker
    if ((e as any).ctrlKey) return;
    if (!points.length) return;
    if (!isDrawingActive) return; // paused via ESC
    // Smooth ghost updates via rAF
    lastMouseClient.current = { x: e.clientX, y: e.clientY };
    if (ghostRafId.current == null) {
      ghostRafId.current = requestAnimationFrame(() => {
        ghostRafId.current = null;
        if (!lastMouseClient.current) return;
        if (!isDrawingActive || points.length === 0) return;
        const { x: cx, y: cy } = lastMouseClient.current;
        const svgPt = clientToSvg({ clientX: cx, clientY: cy });
        // Preview: raw cursor world position for exact alignment
        setGhost({ x: svgPt.x, y: svgPt.y });
      });
    }
  }

  function startPan(e: React.MouseEvent) {
    if (e.button !== 1 && !(e.ctrlKey && e.button === 0)) return; // middle OR ctrl+left
    e.preventDefault();
    // Hide ghost while panning to prevent flicker
    setGhost(null);
    // Record starting client position
    panOrigin.current = { clientX: e.clientX, clientY: e.clientY };
    setIsPanning(true);
  }
  function endPan() { setIsPanning(false); panOrigin.current = null; }

  function handleWheel(e: React.WheelEvent) {
    if (!e.ctrlKey) return; // ctrl + wheel to zoom
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    const oldVB = viewBox;
    const mouseWorld = clientToSvg(e);
    const newWidth = Math.min(24000, Math.max(200, oldVB.width / factor));
    const newHeight = newWidth * (oldVB.height / oldVB.width);
    // Anchor zoom around cursor position (keep same world under cursor)
    const xPrime = mouseWorld.x - (mouseWorld.x - oldVB.x) * (newWidth / oldVB.width);
    const yPrime = mouseWorld.y - (mouseWorld.y - oldVB.y) * (newHeight / oldVB.height);
    setViewBox({ x: xPrime, y: yPrime, width: newWidth, height: newHeight });
    if (isDrawingActive && points.length > 0) {
      setGhost({ x: mouseWorld.x, y: mouseWorld.y });
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

  // Gate handlers in list UI
  function toggleGateFor(id: string, enabled: boolean) {
    setGateById(prev => ({ ...prev, [id]: { ...(prev[id] || { position: 'middle' as const, hingeOnLeft: false }), enabled } }));
  }
  function setGatePosition(id: string, position: 'left'|'middle'|'right') {
    setGateById(prev => ({ ...prev, [id]: { ...(prev[id] || { enabled: true, hingeOnLeft: false }), position } }));
  }
  function setGateHinge(id: string, hinge: 'left'|'right') {
    setGateById(prev => ({ ...prev, [id]: { ...(prev[id] || { enabled: true, position: 'middle' as const }), hingeOnLeft: hinge === 'left' } }));
  }

  function handleUndo() {
    setPoints(prev => prev.slice(0, -1));
  }
  function handleClear() {
    setPoints([]);
    setGhost(null);
    setIsDrawingActive(true)
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
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
          className={`${isDrawingActive ? 'cursor-crosshair' : 'cursor-default'} select-none touch-none`}
        >
          {/* background grid via pattern */}
          <defs>
            <pattern id="grid" width={50} height={50} patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e2e8f0" strokeWidth={1} />
            </pattern>
          </defs>
          <rect x={-10000} y={-10000} width={20000} height={20000} fill="url(#grid)" />
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
              // Offset label a bit above the line (scale with zoom for readability)
              const labelOffset = 14 * textScaleAll;
              const angle = Math.atan2(dy, dx);
              const lx = mx + labelOffset * Math.sin(angle);
              const ly = my - labelOffset * Math.cos(angle);
              return (
                <g key={i}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#0f172a" strokeWidth={3} strokeLinecap="round" />
                  {/* Gate marker if enabled for this run */}
                  {(() => {
                    const id = String.fromCharCode(65 + (i-1));
                    const cfg = gateById[id];
                    if (!cfg?.enabled) return null;
                    // Place marker based on position selection: left/middle/right
                    let t = 0.5; // middle
                    if (cfg.position === 'left') t = 0.2;
                    if (cfg.position === 'right') t = 0.8;
                    const gx = a.x + (b.x - a.x) * t;
                    const gy = a.y + (b.y - a.y) * t;
                    const w = 50 * textScaleAll; const h = 18 * textScaleAll;
                    return (
                      <g>
                        <rect x={gx - w/2} y={gy - h/2} width={w} height={h} fill="#16a34a" rx={3} ry={3} opacity={0.9} />
                        <text x={gx} y={gy + 4 * textScaleAll} textAnchor="middle" fontSize={scaledFont(12)} fill="#ffffff" fontFamily="system-ui" fontWeight={700}>
                          Gate
                        </text>
                      </g>
                    );
                  })()}
                  <text x={lx} y={ly} textAnchor="middle" fontSize={scaledFont(18)} fill="#0369a1" fontFamily="system-ui" fontWeight={600}>{`${String.fromCharCode(65 + (i-1))}: ${lenMm} mm`}</text>
                </g>
              );
            })}

            {/* ghost line, length label & live angle arc */}
            {ghost && points.length > 0 && (() => {
              const anchorIndex = extendFrom === 'start' ? 0 : points.length - 1;
              const prev = points[anchorIndex];
              const b = ghost;
              const dx = b.x - prev.x; const dy = b.y - prev.y;
              const { lenMm } = snapLength(dx, dy);
              const mx = (prev.x + b.x)/2; const my = (prev.y + b.y)/2;
              const labelOffset = 14 * textScaleAll;
              const angLine = Math.atan2(dy, dx);
              const lx = mx + labelOffset * Math.sin(angLine);
              const ly = my - labelOffset * Math.cos(angLine);

              // Angle arc only if at least 2 fixed points (we need a previous segment)
              let arcEl: React.ReactNode = null;
              let angleLabel: React.ReactNode = null;
              if (points.length >= 2) {
                const anchor = prev; // vertex point
                const prevPrev = extendFrom === 'start' ? points[1] : points[points.length - 2];
                const angleDeg = internalAngle(prevPrev, anchor, b);
                // Geometry for arc similar to legacy
                const radius = 45; // svg units (kept constant in world units)
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
                angleLabel = <text x={ax} y={ay} fontSize={scaledFont(16)} fontFamily="system-ui" fontWeight={600} fill="#0369a1" textAnchor="middle">{angleDeg}&deg;</text>;
              }

              return (
                <>
                  <line x1={prev.x} y1={prev.y} x2={b.x} y2={b.y} stroke="#0369a1" strokeDasharray="6 6" strokeWidth={2} />
                  <text x={lx} y={ly} textAnchor="middle" fontSize={scaledFont(18)} fill="#0369a1" fontFamily="system-ui" fontWeight={600}>{lenMm} mm</text>
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
                      <circle cx={p.x} cy={p.y} r={scaledSize(14)} fill={fill} stroke="#ffffff" strokeWidth={scaledSize(3, 1)} />
                      <text x={p.x} y={p.y+4} fontSize={scaledFont(13)} fontFamily="system-ui" fontWeight={700} fill="#ffffff" textAnchor="middle">{ang}&deg;</text>
                    </g>
                  );
                }
              }
              // Endpoints or straight (180°) joints: keep original point styling
              const isFirst = i === 0;
              const isLast = i === points.length - 1;
              const clickableWhilePaused = (isLast || isFirst) && !isDrawingActive;
              const closable = isDrawingActive && points.length >= 2 && ((extendFrom === 'end' && isFirst) || (extendFrom === 'start' && isLast));
              return (
                <g key={`pt-${i}`}>
                  {(clickableWhilePaused || closable) && (
                    <title>{
                      clickableWhilePaused
                        ? 'Click to resume drawing from here'
                        : (extendFrom === 'end' ? 'Click to close: connect last point to the first point' : 'Click to close: connect first point to the last point')
                    }</title>
                  )}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={scaledSize(7)}
                    fill="#0284c7"
                    stroke="#fff"
                    strokeWidth={scaledSize(2, 1)}
                    className={(clickableWhilePaused || closable) ? 'cursor-pointer' : undefined}
                    onClick={(e) => {
                      // Priority: if paused and this is an endpoint, resume from here.
                      if (clickableWhilePaused) {
                        e.stopPropagation();
                        const svg = svgRef.current;
                        if (!svg) { setIsDrawingActive(true); return; }
                        const clientX = (e as any).clientX ?? 0;
                        const clientY = (e as any).clientY ?? 0;
                        const svgPt = clientToSvg({ clientX, clientY });
                        const snapped = snapAngle(p, svgPt);
                        setGhost({ x: snapped.x, y: snapped.y });
                        setExtendFrom(isFirst ? 'start' : 'end');
                        setIsDrawingActive(true);
                        return;
                      }
                      // If drawing and clicking the opposite endpoint based on current extendFrom, close the path
                      if (closable) {
                        e.stopPropagation();
                        if (extendFrom === 'end' && isFirst) {
                          setPoints(prev => [...prev, prev[0]]);
                        } else if (extendFrom === 'start' && isLast) {
                          setPoints(prev => [prev[prev.length - 1], ...prev]);
                        }
                        setGhost(null);
                        setIsDrawingActive(false);
                        return;
                      }
                    }}
                  />
                </g>
              );
            })}
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
              <div key={r.id} className="flex flex-col gap-1 rounded border border-slate-200 p-2">
                <label className="text-[11px] font-medium text-slate-600">Side {r.id}</label>
                <input
                  type="number"
                  className="w-28 rounded border border-slate-300 bg-white px-2 py-1 text-xs focus:border-sky-400 focus:ring-2 focus:ring-sky-300/40"
                  value={r.length}
                  min={100}
                  step={5}
                  onChange={(e)=>handleLengthEdit(i, e.target.value)}
                />
                <div className="mt-1 flex items-center justify-between gap-2">
                  <label className="inline-flex items-center gap-1 text-[10px] text-slate-600">
                    <input
                      type="checkbox"
                      className="h-3 w-3 accent-sky-600"
                      checked={!!gateById[r.id]?.enabled}
                      onChange={(e)=> toggleGateFor(r.id, e.target.checked)}
                    />
                    Gate?
                  </label>
                  {!!gateById[r.id]?.enabled && (
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] text-slate-600">Pos</label>
                      <select
                        value={gateById[r.id]?.position || 'middle'}
                        onChange={(e)=> setGatePosition(r.id, e.target.value as any)}
                        className="rounded border border-slate-300 bg-white px-1 py-0.5 text-[10px]"
                      >
                        <option value="left">Left</option>
                        <option value="middle">Middle</option>
                        <option value="right">Right</option>
                      </select>
                      <label className="text-[10px] text-slate-600">Hinge</label>
                      <select
                        value={(gateById[r.id]?.hingeOnLeft ? 'left' : 'right')}
                        onChange={(e)=> setGateHinge(r.id, e.target.value as any)}
                        className="rounded border border-slate-300 bg-white px-1 py-0.5 text-[10px]"
                      >
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
