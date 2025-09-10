import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSelectionStore, type SystemKey } from '@/store/useSelectionStore'

// Channel assets
import smartTop from '@/assets/channels/Smart_Lock_22_2.webp'
import smartSide from '@/assets/channels/Smart_Lock_22_2.webp'
import lugano from '@/assets/channels/Lugano_Channel.webp'
import vista from '@/assets/channels/Vista_Channel.webp'

// Spigots / mini posts assets
import sp10 from '@/assets/spigots/SP10.webp'
import sp12 from '@/assets/spigots/SP12.webp'
import sp13 from '@/assets/spigots/SP13.webp'
import sp14 from '@/assets/spigots/SP14.webp'
import sp15 from '@/assets/spigots/SP15.webp'
import smp160 from '@/assets/spigots/SMP160.webp'
import rmp160 from '@/assets/spigots/RMP160.webp'

// Point fix (standoffs)
import sd50 from '@/assets/standoffs/SD50-BH.webp'
import sd75 from '@/assets/standoffs/SD75.jpg'
import sd100 from '@/assets/standoffs/SD100.jpg'
import pf150 from '@/assets/standoffs/PF150R.webp'
import pradis from '@/assets/standoffs/Pradis.webp'
export type CalcItem = {
  key: string
  label: string
  desc: string
  img: string
}

export const calculators: Record<SystemKey, CalcItem[]> = {
  channel: [
    { key: 'smart-top', label: 'Smart Lock Top Fix', desc: 'Top-mounted channel system with smart locking mechanism', img: smartTop },
    { key: 'smart-side', label: 'Smart Lock Side Fix', desc: 'Side-mounted channel system with smart locking mechanism', img: smartSide },
    { key: 'lugano', label: 'Lugano Channel', desc: 'Premium channel system for structural glazing applications', img: lugano },
    { key: 'vista', label: 'Vista Channel', desc: 'Advanced channel system for enhanced performance', img: vista },
  ],
  spigots: [
    { key: 'sp10', label: 'SP10', desc: 'Cost-effective compact spigot system for lighter glazing applications', img: sp10 },
    { key: 'sp12', label: 'SP12 Spigot', desc: 'Our strongest spigot system, providing superior strength and stability', img: sp12 },
    { key: 'sp13', label: 'SP13 Spigot', desc: 'Enhanced spigot system with improved structural performance', img: sp13 },
    { key: 'sp14', label: 'SP14', desc: 'Advanced spigot system for demanding applications', img: sp14 },
    { key: 'sp15', label: 'SP15', desc: 'Heavy-duty spigot system for 15mm+ glass applications', img: sp15 },
    { key: 'rmp160', label: 'RMP160', desc: 'Cost-effective rectangular mini post system for structural glazing', img: rmp160 },
    { key: 'smp160', label: 'SMP160', desc: 'Cost-effective square mini post system for structural glazing', img: smp160 },
  ],
  standoffs: [
    { key: 'sd50', label: 'SD50 Double Disc', desc: 'Heavy-duty double disc system for demanding applications', img: sd50 },
    { key: 'pf150', label: 'PF150 Plate Fix', desc: 'Point-fixed glazing system with 150mm plate connectors', img: pf150 },
    { key: 'sd75', label: 'SD75 Single Disc', desc: 'Mid-range single disc system for structural glazing', img: sd75 },
    { key: 'sd100', label: 'SD100 Single Disc', desc: 'Heavy-duty single disc system for demanding applications', img: sd100 },
    { key: 'pradis', label: 'Pradis Clamps', desc: 'Advanced clamping system for structural glazing', img: pradis },
  ],
  posts: [],
}

export default function SystemCalculators() {
  const system = useSelectionStore((s) => s.system)
  const selectedCalc = useSelectionStore((s) => s.selectedCalc)
  const setSelectedCalc = useSelectionStore((s) => s.setSelectedCalc)

  // Decide which active calc key + setter to use
  const { activeKey, setActive } = useMemo(() => {
    if (!system) return { activeKey: null, setActive: (k: string) => { void k } }
    return {
      activeKey: selectedCalc[system] ?? null,
      setActive: (key: string) => setSelectedCalc(system, key),
    }
  }, [system, selectedCalc, setSelectedCalc])

  if (!system || system === 'posts') return null

  const list = calculators[system]
  if (!list.length) return null

  return (
    <section className="mt-10 border-t border-sky-500 pt-10">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-600 text-sm font-semibold text-white shadow-inner">
          2
        </div>
        <h2 className="text-2xl font-semibold text-slate-700">Choose Your Calculator</h2>
      </div>
      <motion.div
        key={system}
        initial="hidden"
        animate="show"
        exit="hidden"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.07, delayChildren: 0.05 },
          },
        }}
        className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
     >
        <AnimatePresence mode="popLayout">
          {list.map((c) => {
            const selected = c.key === activeKey
            return (
              <motion.div
                layout
                key={`${system}-${c.key}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24, mass: 0.6 }}
                className={[
                  'group relative flex flex-col rounded-xl border bg-white p-6 shadow-sm transition-all duration-200',
                  selected
                    ? 'border-sky-500 shadow-md ring-1 ring-sky-400/40'
                    : 'border-slate-200 hover:border-sky-300 hover:shadow-md',
                ].join(' ')}
              >
                <div className="mb-6 flex h-40 w-full items-center justify-center">
                  <img src={c.img} alt={c.label} className="h-32 w-auto object-contain" />
                </div>
                <h3 className="mb-2 text-sm font-semibold text-slate-700 group-hover:text-slate-800">{c.label}</h3>
                <p className="mb-4 line-clamp-3 text-xs leading-relaxed text-slate-500 group-hover:text-slate-600">{c.desc}</p>
                <button
                  type="button"
                  onClick={() => setActive(c.key)}
                  className="text-xs font-semibold text-sky-700 hover:underline"
                >
                  Open Calculator →
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>
    </section>
  )
}
