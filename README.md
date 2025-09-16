# Opus Balustrade Calculator v2

Modern React + TypeScript + Vite application for configuring balustrade, spigot, standoff and (future) post systems. Includes compliant layout calculation and an experimental 3D plan view.

### Tech Stack

React 19, Zustand, Framer Motion, TailwindCSS, React Router v6, Three.js via @react-three/fiber and @react-three/drei.

---

### Routing Flow

Pattern: `/:system?/:calculator?/:shape?`

Examples:

- `/channel` – system selected
- `/channel/lugano` – calculator selected, prompts shape
- `/channel/lugano/corner` – full selection ready for layout input

Valid systems: `channel`, `spigots`, `standoffs` (`posts` reserved). Shapes: `inline`, `corner`, `u`, `enclosed`, `custom`.

Behavior:

- Direct navigation hydrates Zustand store
- URL kept in sync with user selections
- Invalid first segment redirects to `/`

---

### 3D Plan View (Beta)

Route pattern: `/:system/:calculator/:shape/3d-view`

Access via the `View 3D Plan` button after a compliant layout is calculated. A refresh without state redirects back to the calculator form.

Current capabilities:

* Multi‑panel segmentation per side (symmetric legacy solver) with uniform gap placement.
* Per‑panel spigot placement using PS1 internal + edge spacing (legacy formula) with in‑3D override (Auto / 2 / 3).
* `SceneCanvas` provides camera, lights, grid and HDR environment.
* `Model` attempts GLB load (`src/assets/<group>/models/<code>.glb`) else falls back to primitives.

Upcoming parity work:

* Gates (hinge / latch panel adjustments).
* Mixed / stock mode non‑uniform panels & size optimisation.
* Ground polygon + gap visualization for complex & custom shapes.
* Advanced in‑3D recalculation (panel sizing mode changes) & export (GLB / image / PDF overlay).

---

### Development Scripts

`pnpm dev` (or `npm run dev`) – Start Vite dev server `pnpm build` – Type check + production build `pnpm preview` – Preview built app

---

### ESLint & Type Safety

Type-aware rules configured via `tsconfig.app.json` & `tsconfig.node.json`. Extend eslint config for stricter style/preferences as needed.

---

### Environment / Assets

HDR environment: `src/assets/threejs/citrus_orchard_road_puresky_4k.hdr`. Replace or add more HDRIs as required.

---

### Custom Shape Designer (Beta)

The React custom shape designer (shape key `custom`) replicates legacy freehand drafting logic:

* Click to add sequential points (polyline). Each segment snaps to 5° and lengths snap to 5 mm increments.
* Ctrl + mouse wheel: zoom. Middle‑mouse drag or Ctrl + drag: pan.
* Side list (A, B, C …) auto‑generates and values are editable; editing adjusts geometry proportionally along the same bearing.
* Dynamic side lengths flow into the standard compliant layout calculation pipeline identically to predefined shapes.
* Arbitrary angles (snapped to 5°) are now reproduced in the 3D plan view – segments render exactly along drawn bearings instead of forced 90° turns.

Planned enhancements for full legacy parity:

* Corner joiner classification (90° vs adjustable) & codes
* Multiple disjoint polylines & resume drawing from existing nodes
* Gate designation per side + hardware logic
* Undo/redo history expansion & PDF/3D integration extras

> NOTE: Initial implementation focuses on core drafting + length export. Provide feedback to prioritise the remaining parity tasks.

---

### Contributing

1. Create feature branch
2. Ensure no type or lint errors (`pnpm lint`)
3. Submit PR with concise description & screenshots (especially for 3D changes)

---

### License

Internal use – adapt as necessary.
