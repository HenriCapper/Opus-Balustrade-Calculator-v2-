import logo from "@/assets/SP12.webp";
import { useSelectionStore } from "@/store/useSelectionStore";
import { calculators } from "@/components/SystemCalculators";
import { AnimatePresence, motion } from "framer-motion";

type HeaderProps = {
  className?: string;
};

export default function Header({ className = "" }: HeaderProps) {
  const system = useSelectionStore((s) => s.system);
  const selectedCalc = useSelectionStore((s) => s.selectedCalc);
  const HERO_LOGO = "/Opus_Logo.svg";

  const hasCalcSelected = Boolean(system && selectedCalc[system!]);
  const isHero = !hasCalcSelected;
  const currentCalc = hasCalcSelected
    ? calculators[system!].find((c) => c.key === selectedCalc[system!])
    : undefined;
  const activeLogo = currentCalc?.img ?? logo;
  const activeTitle = currentCalc?.label ?? "Calculator";

  return (
    <AnimatePresence mode="wait" initial={false}>
      {isHero ? (
        <motion.header
          key="hero"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className={[
            "relative overflow-hidden rounded-3xl bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-800 px-6 pt-16 pb-14 sm:pb-20",
            "border border-neutral-800/70 shadow-xl",
            "animated-grid",
            className,
          ].join(" ")}
        >
          <div className="mx-auto flex flex-col items-center text-center">
            <div className="mb-8 flex h-40 w-40 items-center justify-center">
              <img
                src={HERO_LOGO}
                alt="Opus Hardware Logo"
                className="h-44 w-44 select-none object-contain drop-shadow-lg invert"
                loading="eager"
                decoding="async"
                draggable={false}
              />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Glass Calculator Hub</h1>
            <p className="mt-4 max-w-xl text-sm font-medium text-neutral-300">Choose your glass fixing system to access the right calculator</p>
          </div>
        </motion.header>
      ) : (
        <motion.header
          key="standard"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className={["rounded-3xl border border-slate-200 bg-white/95 p-10 shadow-lg", className].join(" ")}
        >
          <div className="flex m-auto justify-center gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-white shadow-xl">
                <img src={activeLogo} alt={activeTitle} className="h-20 w-20 object-contain rounded-xl" />
              </div>
              <div className="flex flex-col text-center gap-4">
                <h1 className="text-4xl font-semibold text-slate-700">
                  <span className="text-slate-700">Opus Hardware</span>
                  <span className="px-2 text-slate-400">–</span>
                  <span className="text-sky-700">{activeTitle}</span>
                </h1>
                <p className="text-sm text-slate-400 ">Professional fence design and calculation tool</p>
              </div>
              <div className="hidden sm:block w-10 mt-3">
                <span
                  title="status"
                  className="m-auto font-semibold h-5 w-full rounded-full bg-rose-400/90 shadow-inner p-2 text-center text-white"
                >
                  Beta
                </span>
              </div>
            </div>
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
}
