import type { ShapeKey } from "@/store/useSelectionStore";

type Segment = { d: string; cx: number; cy: number };

export type ShapeDiagramProps = {
  shape: ShapeKey | null;
  focusedSide?: number | null;
  width?: number;
  height?: number;
  className?: string;
  onSegmentClick?: (index: number) => void;
};

const sideLabels = ["A", "B", "C", "D"] as const;

export default function ShapeDiagram({
  shape,
  focusedSide = null,
  width = 240,
  height = 200,
  className,
  onSegmentClick,
}: ShapeDiagramProps) {
  if (!shape || shape === "custom") return null;

  const offsetX = 40;
  const offsetY = 30;

  function getSegments(): Segment[] {
    if (shape === "inline") {
      return [
        {
          d: `M${offsetX + 20} ${offsetY + 10} v120`,
          cx: offsetX + 20,
          cy: offsetY + 70,
        },
      ];
    }
    if (shape === "corner") {
      return [
        {
          d: `M${offsetX + 20} ${offsetY + 10} h120`,
          cx: offsetX + 80,
          cy: offsetY + 10,
        }, // A - Top
        {
          d: `M${offsetX + 140} ${offsetY + 10} v120`,
          cx: offsetX + 140,
          cy: offsetY + 70,
        }, // B - Right
      ];
    }
    if (shape === "u") {
      return [
        {
          d: `M${offsetX + 20} ${offsetY + 10} h120`,
          cx: offsetX + 80,
          cy: offsetY + 10,
        }, // A - Top
        {
          d: `M${offsetX + 140} ${offsetY + 10} v120`,
          cx: offsetX + 140,
          cy: offsetY + 70,
        }, // B - Right
        {
          d: `M${offsetX + 20} ${offsetY + 130} h120`,
          cx: offsetX + 80,
          cy: offsetY + 130,
        }, // C - Bottom
      ];
    }
    // enclosed (box): A top, B right, C bottom, D left
    return [
      {
        d: `M${offsetX + 20} ${offsetY + 10} h120`,
        cx: offsetX + 80,
        cy: offsetY + 10,
      }, // A - Top
      {
        d: `M${offsetX + 140} ${offsetY + 10} v120`,
        cx: offsetX + 140,
        cy: offsetY + 70,
      }, // B - Right
      {
        d: `M${offsetX + 20} ${offsetY + 130} h120`,
        cx: offsetX + 80,
        cy: offsetY + 130,
      }, // C - Bottom
      {
        d: `M${offsetX + 20} ${offsetY + 10} v120`,
        cx: offsetX + 20,
        cy: offsetY + 70,
      }, // D - Left
    ];
  }

  const segments = getSegments();

  function labelPos(i: number, s: Segment): { x: number; y: number } {
    if (shape === "enclosed") {
      if (i === 0) return { x: s.cx, y: s.cy - 18 }; // A - Top
      if (i === 1) return { x: s.cx + 28, y: s.cy + 24 }; // B - Right
      if (i === 2) return { x: s.cx, y: s.cy + 25 }; // C - Bottom
      return { x: s.cx - 28, y: s.cy + 24 }; // D - Left
    }
    if (shape === "u") {
      if (i === 0) return { x: s.cx, y: s.cy - 18 }; // A - Top
      if (i === 1) return { x: s.cx + 28, y: s.cy + 24 }; // B - Right
      return { x: s.cx, y: s.cy + 25 }; // C - Bottom
    }
    if (shape === "corner") {
      if (i === 0) return { x: s.cx, y: s.cy - 18 }; // A - Top
      return { x: s.cx + 28, y: s.cy + 24 }; // B - Right
    }
    // inline: single vertical segment, place label to the left-middle
    return { x: s.cx - 28, y: s.cy + 8 };
  }

  return (
    <svg
      width={width}
      height={height}
      role="img"
      aria-label="Shape diagram"
      className={className}
    >
      {segments.map((s, i) => {
        const isFocused = focusedSide === i;
        return (
          <g key={i}>
            <path
              d={s.d}
              stroke={isFocused ? "#0f172a" : "#888"}
              strokeWidth={8}
              fill="none"
              strokeLinecap="round"
              onClick={onSegmentClick ? () => onSegmentClick(i) : undefined}
              style={{ cursor: onSegmentClick ? "pointer" : undefined }}
            />
            <text
              x={labelPos(i, s).x}
              y={labelPos(i, s).y}
              fontSize={22}
              textAnchor="middle"
              fill={isFocused ? "#0f172a" : "#888"}
            >
              {sideLabels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
