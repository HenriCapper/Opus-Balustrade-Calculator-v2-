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
  // Selected calculator per system (e.g., channel/spigots/standoffs)
  selectedCalc: Partial<Record<SystemKey, string>>;
  setSelectedCalc: (system: SystemKey, key: string) => void;
  clearSelectedCalc: (system?: SystemKey) => void;
};

export const useSelectionStore = create<ShapeState>((set) => ({
  selected: null,
  setSelected: (key) => set({ selected: key }),
  clearSelected: () => set({ selected: null }),
  system: null,
  setSystem: (key) =>
    set({
      system: key,
      // Reset dependent selections whenever system changes
      selectedCalc: {},
      selected: null,
    }),
  clearSystem: () => set({ system: null }),
  selectedCalc: {},
  setSelectedCalc: (system, key) =>
    set((state) => ({ selectedCalc: { ...state.selectedCalc, [system]: key } })),
  clearSelectedCalc: (system) =>
    set((state) => {
      if (!system) return { selectedCalc: {} };
      const next = { ...state.selectedCalc };
      delete next[system];
      return { selectedCalc: next };
    }),
}));
