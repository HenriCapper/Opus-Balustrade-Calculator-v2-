import channelImg from '@/assets/systems/Channel.webp'
import spigotsImg from '@/assets/systems/Spigots.webp'
import standoffsImg from '@/assets/systems/Standoffs.webp'
import postsImg from '@/assets/systems/Post.webp'
import { useSelectionStore } from '@/store/useSelectionStore'
import { useNavigate } from 'react-router-dom'

type SystemDef = {
  key: 'channels' | 'spigots' | 'standoffs' | 'posts'
  label: string
  desc: string
  img: string
  disabled?: boolean
}

const systems: SystemDef[] = [
  {
    key: 'channels',
    label: 'Channel Systems',
    desc: 'Structural glazing with aluminum channels',
    img: channelImg,
  },
  {
    key: 'spigots',
    label: 'Spigots & MiniPosts',
    desc: 'Post-mounted glass panels with spigots and mini posts',
    img: spigotsImg,
  },
  {
    key: 'standoffs',
    label: 'Point Fix Systems',
    desc: 'Point-fixed glazing with disc and plate connectors',
    img: standoffsImg,
  },
  {
    key: 'posts',
    label: 'Post Systems',
    desc: 'Coming Soon - Resolute and Vortex post systems',
    img: postsImg,
    disabled: true,
  },
]

export default function SystemSelector() {
  const system = useSelectionStore((s) => s.system)
  const setSystem = useSelectionStore((s) => s.setSystem)
  const navigate = useNavigate()

  return (
    <section>
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-600 text-sm font-semibold text-white shadow-inner">
          1
        </div>
        <h2 className="text-2xl font-semibold text-slate-700">
          Choose Your System Type
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {systems.map((s) => {
          const selected = s.key === system
          return (
            <button
              key={s.key}
              type="button"
              disabled={s.disabled}
              onClick={() => {
                if (s.disabled) return
                setSystem(s.key)
                // navigate to /system
                navigate(`/${s.key}`)
                // scroll after slight delay to allow layout
                setTimeout(() => {
                  const el = document.getElementById('system-calculators')
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }, 50)
              }}
              className={[
                // layout + base
                'group relative flex flex-col items-center overflow-hidden rounded-2xl bg-white p-6 text-center transition-all duration-200 ease-out',
                // pseudo element base (animated gradient bar like TileCard)
                'before:origin-left before:transition-all before:duration-300 before:ease-out',
                // border + shadow states
                selected
                  ? [
                      'border-2 border-sky-400 shadow-lg',
                      'before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-sky-400 before:via-green-400 before:to-sky-400 before:content-["" ]',
                      'before:scale-x-100 before:opacity-100',
                    ].join(' ')
                  : [
                      'border border-slate-200 shadow-sm hover:border-sky-400 hover:shadow-md',
                      'before:scale-x-0 before:opacity-0',
                    ].join(' '),
                s.disabled
                  ? 'cursor-not-allowed opacity-60 hover:shadow-sm hover:border-slate-200'
                  : 'cursor-pointer',
              ].join(' ')}
            >
              <div
                className={[
                  'mb-4 flex h-40 w-full items-center justify-center rounded-xl bg-slate-50 ring-1 ring-inset ring-slate-200',
                  selected ? 'ring-sky-300 bg-sky-50' : '',
                ].join(' ')}
              >
                <img
                  src={s.img}
                  alt={s.label}
                  className="h-28 w-28 object-contain drop-shadow-sm"
                />
              </div>
              <h3
                className={[
                  'mb-2 text-base font-semibold text-slate-700 transition-colors',
                  selected ? 'text-sky-600' : 'group-hover:text-slate-800',
                ].join(' ')}
              >
                {s.label}
              </h3>
              <p className="text-xs leading-relaxed text-slate-500 group-hover:text-slate-600">
                {s.desc}
              </p>
            </button>
          )
        })}
      </div>
    </section>
  )
}
