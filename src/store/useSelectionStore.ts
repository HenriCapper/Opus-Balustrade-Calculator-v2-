import { create } from "zustand";

export type ShapeKey = "inline" | "corner" | "u" | "enclosed" | "custom";
export type SystemKey = 'channel' | 'spigots' | 'standoffs' | 'posts';

type ShapeState = {
  selected: ShapeKey | null;
  setSelected: (key: ShapeKey) => void;
  clearSelected: () => void;
  system: SystemKey | null;
  setSystem: (key: SystemKey) => void;
  clearSystem: () => void;
};

export const useSelectionStore = create<ShapeState>((set) => ({
  selected: null,
  setSelected: (key) => set({ selected: key }),
  clearSelected: () => set({ selected: null }),
  system: null,
  setSystem: (key) => set({ system: key }),
  clearSystem: () => set({ system: null }),
}));
