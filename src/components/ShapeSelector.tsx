// no local state; selection managed by Zustand
import inlineImg from "@/assets/shapes/inline.webp";
import lImg from "@/assets/shapes/lshaped.webp";
import uImg from "@/assets/shapes/ushape.webp";
import enclosedImg from "@/assets/shapes/enclosed.webp";
import customImg from "@/assets/shapes/custom.webp";
import TileCard from "@/components/ui/TileCard";
import Button from "@/components/ui/Button";
import { useSelectionStore, type ShapeKey } from "@/store/useSelectionStore";
import { useState } from "react";

const shapes: { key: ShapeKey; label: string; img: string }[] = [
  { key: "inline", label: "Inline", img: inlineImg },
  { key: "corner", label: "Corner (L)", img: lImg },
  { key: "u", label: "U Shape", img: uImg },
  { key: "enclosed", label: "Enclosed", img: enclosedImg },
];

export default function ShapeSelector() {
  const setSelected = useSelectionStore((s) => s.setSelected);
  const clearSystem = useSelectionStore((s) => s.clearSystem);
  const [picked, setPicked] = useState<ShapeKey | null>(null);

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={clearSystem}
          className="text-sm font-medium text-sky-600 hover:text-sky-700 hover:underline focus:outline-none focus-visible:ring focus-visible:ring-sky-300 rounded-md px-1"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-semibold text-slate-700 text-center flex-1">
          Select Fence Shape
        </h2>
        <span className="w-[52px]" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {shapes.slice(0, 4).map((s) => (
          <TileCard
            key={s.key}
            img={s.img}
            label={s.label}
            selected={picked === s.key}
            onClick={() => setPicked(s.key)}
          />
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <div className="w-full max-w-xs">
          <TileCard
            img={customImg}
            label="Custom"
            big
            selected={picked === "custom"}
            onClick={() => setPicked("custom")}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <Button
          className="w-full max-w-md "
          disabled={!picked}
          onClick={() => picked && setSelected(picked)}
        >
          NEXT
        </Button>
      </div>
    </section>
  );
}
