# Legacy Parity – Pending Items

This document lists remaining gaps versus the legacy calculators after multi-panel 3D implementation.

## 1. Gates
* Insert gate definition per side (width / position) – currently absent in input model.
* Adjust adjacent panel widths: hinge panel min width, latch clearance, optional widening logic.
* Render gate leaf differently (swing indication or distinct material) in 3D.
* Spigot logic: hinge side may reuse or add extra spigot depending on width threshold.

## 2. Mixed / Stock Mode Panels
* Introduce stock panel catalogue & greedy/optimised fill algorithm (legacy mixed solver).
* Maintain ordered panelWidths per side (non-uniform) + explicit per-gap values if they vary.
* Update aggregation summary grouping identical widths.

## 3. Gap Visualisation & Ground Polygon
* Generate shape polygon from side vectors (including custom shapes once implemented) and draw outline.
* Display gaps (start, between panels, end) as small markers or dimension overlays toggle.

## 4. Advanced 3D Recalc Overlay
* Allow changing glass mode (standard/stock), gap target, mixed toggle, and trigger full recompute without leaving 3D.
* Diff highlight: animate panels that change width.

## 5. Export Enhancements
* Snapshot image export (canvas.toDataURL) with title block.
* Optional GLB export of assembled scene (panels + hardware proxies).
* PDF layout combining summary + snapshot (jsPDF or server side later).

## 6. Validation / Edge Cases
* Very short sides: enforce minimum panel width fallback logic identical to legacy (currently basic fallback only).
* Extremely long runs: performance profiling (#panels > ~150).
* Non-orthogonal custom shapes: requires storing explicit vertex list instead of direction cycling.

---
Last updated: (auto) – see git history for date.