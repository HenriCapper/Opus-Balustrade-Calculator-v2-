import { useSelectionStore } from "@/store/useSelectionStore";
import Button from "@/components/ui/Button";

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-1">{children}</div>;
}

export default function LayoutForm() {
  const clear = useSelectionStore((s) => s.clearSelected);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-700">
          Design Parameters
        </h2>
        <button
          type="button"
          onClick={clear}
          className="text-sm font-medium text-sky-600 hover:underline"
        >
          Change shape
        </button>
      </div>
      <form className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FieldGroup>
          <label className="text-xs font-medium text-slate-500">
            Side A length (mm)
          </label>
          <input className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-300/40" />
        </FieldGroup>
        <FieldGroup>
          <label className="text-xs font-medium text-slate-500">
            Side B length (mm)
          </label>
          <input className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-300/40" />
        </FieldGroup>
        <FieldGroup>
          <label className="text-xs font-medium text-slate-500">
            Fence type
          </label>
          <select className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-300/40">
            <option>Balustrade (14–20 mm)</option>
          </select>
        </FieldGroup>
        <FieldGroup>
          <label className="text-xs font-medium text-slate-500">
            Fixing type
          </label>
          <select className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-300/40">
            <option>– select –</option>
          </select>
        </FieldGroup>
        <FieldGroup>
          <label className="text-xs font-medium text-slate-500">
            Wind zone
          </label>
          <select className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-300/40">
            <option>L</option>
          </select>
        </FieldGroup>
        <FieldGroup>
          <label className="text-xs font-medium text-slate-500">
            Glass height (mm)
          </label>
          <select className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-300/40">
            <option>1000</option>
          </select>
        </FieldGroup>
        <FieldGroup>
          <label className="text-xs font-medium text-slate-500">
            Glass thickness
          </label>
          <select className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-300/40">
            <option>12</option>
          </select>
        </FieldGroup>
        <FieldGroup>
          <label className="text-xs font-medium text-slate-500">Handrail</label>
          <select className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-300/40">
            <option>S25</option>
          </select>
        </FieldGroup>
        <FieldGroup>
          <label className="text-xs font-medium text-slate-500">
            Hardware finish
          </label>
          <select className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-300/40">
            <option>SSS</option>
          </select>
        </FieldGroup>
        <div className="md:col-span-2">
          <Button className="mt-4 w-full" disabled>
            Calculate compliant layout
          </Button>
        </div>
      </form>
    </div>
  );
}
