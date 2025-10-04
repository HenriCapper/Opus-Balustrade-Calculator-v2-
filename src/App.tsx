import "./App.css";
import Header from "@/components/Header.tsx";
import ShapeSelector from "@/components/ShapeSelector.tsx";
import SystemSelector from "@/components/SystemSelector";
import Container from "@/components/ui/Container";
import LayoutForm from "@/components/LayoutForm";
import { AnimatePresence, motion } from "framer-motion";
import { useSelectionStore, type SystemKey, type ShapeKey } from "@/store/useSelectionStore";
import SystemCalculators from "@/components/SystemCalculators";
import { useEffect } from "react";
import { useLocation, useNavigate, Routes, Route } from "react-router-dom";
import ThreeDView from '@/components/three/ThreeDView';
import { calculators } from "@/components/SystemCalculators";

function useRouteSync() {
  const location = useLocation();
  const navigate = useNavigate();
  const system = useSelectionStore((s) => s.system);
  const setSystem = useSelectionStore((s) => s.setSystem);
  const selectedCalc = useSelectionStore((s) => s.selectedCalc);
  const setSelectedCalc = useSelectionStore((s) => s.setSelectedCalc);
  const shape = useSelectionStore((s) => s.selected);
  const setShape = useSelectionStore((s) => s.setSelected);

  useEffect(() => {
    // path pattern: /:system?/:calculator?/:shape?
    const segments = location.pathname.replace(/^\/+/, "").split("/").filter(Boolean);
    const [sysSeg, calcSeg, shapeSeg] = segments as [string|undefined,string|undefined,string|undefined];

  const validSystems: SystemKey[] = ["channels", "spigots", "standoffs", "posts"]; // posts currently disabled
    const nextSystem = sysSeg && validSystems.includes(sysSeg as SystemKey) ? (sysSeg as SystemKey) : null;
    if (sysSeg && !nextSystem) {
      // invalid first segment -> redirect home
      navigate('/', { replace: true });
      return;
    }

    if (nextSystem && nextSystem !== system) {
      setSystem(nextSystem);
    }

    // calculator validation
    if (nextSystem) {
      const calcList = calculators[nextSystem].map(c => c.key);
      if (calcSeg && calcList.includes(calcSeg)) {
        if (selectedCalc[nextSystem] !== calcSeg) {
          setSelectedCalc(nextSystem, calcSeg);
        }
      }
    }

    // shape validation
    const validShapes: ShapeKey[] = ["inline", "corner", "u", "enclosed", "custom"]; // custom allowed though not always displayed currently
    if (shapeSeg && validShapes.includes(shapeSeg as ShapeKey)) {
      if (shapeSeg !== shape) setShape(shapeSeg as ShapeKey);
    }
  }, [location.pathname]);

  // Keep URL updated when store changes (source of truth = store after initial parse). Avoid infinite loop.
  useEffect(() => {
    const parts: string[] = [];
    if (system) parts.push(system);
    if (system && selectedCalc[system]) parts.push(selectedCalc[system]!);
    if (system && selectedCalc[system] && shape) parts.push(shape);
    const target = "/" + parts.join("/");
    if (target !== location.pathname) {
      navigate(target, { replace: true });
    }
  }, [system, selectedCalc, shape]);
}

function MainWizard() {
  const system = useSelectionStore((s) => s.system);
  const selectedCalc = useSelectionStore((s) => s.selectedCalc);
  const shape = useSelectionStore((s) => s.selected);
  const hasCalcSelected = Boolean(system && selectedCalc[system!]);
  useRouteSync();
  return (
    <div className="min-h-dvh bg-slate-50/80">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
        <Header />
        <div className="mt-6">
          <AnimatePresence mode="wait" initial={false}>
            <Container>
              {!hasCalcSelected && (
                <motion.div
                  key="system"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <SystemSelector />
                </motion.div>
              )}

              {system && !hasCalcSelected && (
                <motion.div
                  key="calc"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <SystemCalculators />
                </motion.div>
              )}

              {hasCalcSelected && !shape && (
                <motion.div
                  key="shape"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <ShapeSelector />
                </motion.div>
              )}
              {hasCalcSelected && shape && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <LayoutForm />
                </motion.div>
              )}
            </Container>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function App(){
  return (
    <Routes>
      <Route path="/:system/:calc/:shape/3d-view" element={<ThreeDView/>} />
      <Route path="/*" element={<MainWizard/>} />
    </Routes>
  );
}

export default App;

