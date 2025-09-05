// no local state; selection managed by Zustand
import inlineImg from "@/assets/shape/inline.webp";
import lImg from "@/assets/shape/lshaped.webp";
import uImg from "@/assets/shape/ushape.webp";
import enclosedImg from "@/assets/shape/enclosed.webp";
import customImg from "@/assets/shape/custom.webp";
import TileCard from "@/components/ui/TileCard";
import Button from "@/components/ui/Button";
import { useShapeStore, type ShapeKey } from "@/store/useShapeStore";

const shapes: { key: ShapeKey; label: string; img: string }[] = [
  { key: "inline", label: "Inline", img: inlineImg },
  { key: "corner", label: "Corner (L)", img: lImg },
  { key: "u", label: "U Shape", img: uImg },
  { key: "enclosed", label: "Enclosed", img: enclosedImg },
  { key: "custom", label: "Custom", img: customImg },
];

export default function ShapeSelector() {
  const selected = useShapeStore((s) => s.selected);
  const setSelected = useShapeStore((s) => s.setSelected);

  return (
    <section>
      <h2 className="mb-6 text-center text-2xl font-semibold text-slate-700">
        Select Fence Shape
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {shapes.slice(0, 4).map((s) => (
          <TileCard
            key={s.key}
            img={s.img}
            label={s.label}
            selected={selected === s.key}
            onClick={() => setSelected(s.key)}
          />
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <div className="w-full max-w-xs">
          <TileCard
            img={customImg}
            label="Custom"
            big
            selected={selected === "custom"}
            onClick={() => setSelected("custom")}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <Button className="w-full max-w-md " disabled={!selected}>
          NEXT
        </Button>
      </div>
    </section>
  );
}
