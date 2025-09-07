import logo from "@/assets/SP12.webp";

export default function Header() {
  return (
    <header className="rounded-3xl border border-slate-200 bg-white/95 p-10 shadow-lg">
      <div className="flex m-auto justify-center gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-white shadow-xl">
            <img
              src={logo}
              alt="Opus SP12"
              className="h-20 w-20 object-contain rounded-xl"
            />
          </div>
          <div className="flex flex-col text-center gap-4">
            <h1 className="text-4xl font-semibold text-slate-700">
              <span className="text-slate-700">Opus Hardware</span>
              <span className="px-2 text-slate-400">–</span>
              <span className="text-sky-700">SP12 Designer</span>
            </h1>
            <p className="text-sm text-slate-400 ">
              Professional fence design and calculation tool
            </p>
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
    </header>
  );
}
