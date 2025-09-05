import { create } from "zustand";

export type ShapeKey = "inline" | "corner" | "u" | "enclosed" | "custom";

type ShapeState = {
  selected: ShapeKey | null;
  setSelected: (key: ShapeKey) => void;
};

export const useShapeStore = create<ShapeState>((set) => ({
  selected: null,
  setSelected: (key) => set({ selected: key }),
}));
