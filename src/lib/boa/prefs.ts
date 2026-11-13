import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DomeinFilter, Rol } from "@/lib/boa/meta";

type Theme = "day" | "night";
type Tekst = "normaal" | "groot";

type Prefs = {
  theme: Theme;
  tekst: Tekst;
  rol: Rol;
  domein: DomeinFilter;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setTekst: (tekst: Tekst) => void;
  setRol: (rol: Rol) => void;
  setDomein: (domein: DomeinFilter) => void;
};

export const usePrefs = create<Prefs>()(
  persist(
    (set, get) => ({
      theme: "day",
      tekst: "normaal",
      rol: "boa",
      domein: "alle",
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === "night" ? "day" : "night" }),
      setTekst: (tekst) => set({ tekst }),
      setRol: (rol) => set({ rol }),
      setDomein: (domein) => set({ domein }),
    }),
    { name: "boa-prefs", skipHydration: true },
  ),
);

export function pasWeergave(state: { theme: Theme; tekst: Tekst }) {
  document.documentElement.classList.toggle("night", state.theme === "night");
  document.documentElement.classList.toggle("lees-groot", state.tekst === "groot");
}
