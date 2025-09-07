import "./App.css";
import Header from "@/components/Header.tsx";
import ShapeSelector from "@/components/ShapeSelector.tsx";
import Container from "@/components/ui/Container";
import LayoutForm from "@/components/LayoutForm";
import { AnimatePresence, motion } from "framer-motion";
import { useShapeStore } from "@/store/useShapeStore";

function App() {
  const selected = useShapeStore((s) => s.selected);
  return (
    <div className="min-h-dvh bg-slate-50/80">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
        <Header />
        <div className="mt-6">
          <AnimatePresence mode="wait" initial={false}>
            <Container>
              {!selected && (
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
              {selected && (
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

export default App;
