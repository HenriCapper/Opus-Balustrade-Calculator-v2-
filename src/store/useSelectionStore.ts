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
  channelCalc: string | null;
  setChannelCalc: (key: string) => void;
  clearChannelCalc: () => void;
  spigotCalc: string | null;
  setSpigotCalc: (key: string) => void;
  clearSpigotCalc: () => void;
  pointCalc: string | null;
  setPointCalc: (key: string) => void;
  clearPointCalc: () => void;
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
      channelCalc: null,
      spigotCalc: null,
      pointCalc: null,
      selected: null,
    }),
  clearSystem: () => set({ system: null }),
  channelCalc: null,
  setChannelCalc: (key) => set({ channelCalc: key }),
  clearChannelCalc: () => set({ channelCalc: null }),
  spigotCalc: null,
  setSpigotCalc: (key) => set({ spigotCalc: key }),
  clearSpigotCalc: () => set({ spigotCalc: null }),
  pointCalc: null,
  setPointCalc: (key) => set({ pointCalc: key }),
  clearPointCalc: () => set({ pointCalc: null }),
}));
