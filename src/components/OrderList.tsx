import { useLayoutStore } from "@/store/useLayoutStore";

function formatQuantity(qty: number): string {
  if (Number.isInteger(qty)) return qty.toLocaleString();
  const rounded = Math.round(qty * 10) / 10;
  return rounded.toFixed(1).replace(/\.0$/, "");
}

export default function OrderList() {
  const orderItems = useLayoutStore((s) => s.result?.orderItems ?? []);
  if (!orderItems.length) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-slate-700">Order List</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-slate-600">Description</th>
              <th className="px-4 py-2 text-left font-medium text-slate-600">Code</th>
              <th className="px-4 py-2 text-right font-medium text-slate-600">Qty</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orderItems.map((item) => (
              <tr key={`${item.code}-${item.description}`}>
                <td className="px-4 py-2 text-slate-700">{item.description}</td>
                <td className="px-4 py-2 font-mono text-slate-500">{item.code}</td>
                <td className="px-4 py-2 text-right font-semibold text-slate-700">{formatQuantity(item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
