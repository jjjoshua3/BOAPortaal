import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DomeinFilter, Rol } from "@/lib/boa/meta";

type Theme = "day" | "night";

type Prefs = {
  theme: Theme;
  rol: Rol;
  domein: DomeinFilter;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setRol: (rol: Rol) => void;
  setDomein: (domein: DomeinFilter) => void;
};

export const usePrefs = create<Prefs>()(
  persist(
    (set, get) => ({
      theme: "day",
      rol: "boa",
      domein: "alle",
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === "night" ? "day" : "night" }),
      setRol: (rol) => set({ rol }),
      setDomein: (domein) => set({ domein }),
    }),
    { name: "boa-prefs", skipHydration: true },
  ),
);
