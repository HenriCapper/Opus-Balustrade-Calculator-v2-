import logo from '../assets/SP12.webp'

export default function Header() {
  return (
    <header className="rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-lg">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm">
            <img src={logo} alt="Opus SP12" className="h-12 w-12 object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-700">
              <span className="text-slate-700">Opus Hardware</span>
              <span className="px-2 text-slate-400">–</span>
              <span className="text-sky-700">SP12 Designer</span>
            </h1>
            <p className="text-sm text-slate-400">
              Professional fence design and calculation tool
            </p>
          </div>
        </div>

        <div className="hidden sm:block">
          <span
            title="status"
            className="inline-block h-5 w-10 rounded-full bg-rose-400/90 shadow-inner"
          />
        </div>
      </div>
    </header>
  )
}
