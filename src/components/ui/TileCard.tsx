type Props = {
  label: string;
  img: string;
  selected?: boolean;
  big?: boolean;
  onClick?: () => void;
};

export default function TileCard({
  label,
  img,
  selected,
  big,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        // base layout + transitions (include before element animation defaults)
        "group relative flex w-full flex-col items-center overflow-hidden rounded-2xl bg-white p-4 hover:shadow-md",
        "transition-all duration-200 ease-out",
        "before:origin-left before:transition-all before:duration-300 before:ease-out",
        // state styles
        selected
          ? [
              // thicker selected border + color + glow + animated gradient bar revealed
              "border-2 border-sky-400 shadow-lg",
              'before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-sky-400 before:via-green-400 before:to-sky-400 before:content-["" ]',
              "before:scale-x-100 before:opacity-100",
            ].join(" ")
          : [
              // default thin border, neutral color, sky on hover, hide gradient bar
              "border border-slate-200 hover:border-sky-400",
              "before:scale-x-0 before:opacity-0",
            ].join(" "),
      ].join(" ")}
    >
      <div
        className={
          "mb-3 flex w-full items-center justify-center rounded-xl bg-slate-50 ring-1 ring-inset ring-slate-200 " +
          (big ? "h-36" : "h-28")
        }
      >
        <img
          src={img}
          alt={label}
          className={(big ? "h-28" : "h-24") + " object-contain"}
        />
      </div>
      <span className="text-sm font-medium text-slate-600 group-hover:text-slate-700">
        {label}
      </span>
    </button>
  );
}
