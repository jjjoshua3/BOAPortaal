import { FEITEN } from "@/lib/boa/feitcodes";
import { JARGON } from "@/lib/boa/jargon";
import { KAARTEN } from "@/lib/boa/zakkaart";
import { BOMEN } from "@/lib/boa/trees";
import type { DomeinId } from "@/lib/boa/meta";

/** Wekelijkse toevoegingen. Nieuw item bovenaan. De voorpagina leest deze lijst. */
export type Update = {
  id: string;
  datum: string;
  week: string;
  titel: string;
  tekst: string;
  naar: "/feitcodes" | "/jargon" | "/beslisbomen" | "/zakkaart" | "/pv" | "/trainer" | "/dienst" | "/community";
  domeinen: DomeinId[];
  nieuw: boolean;
};

export const UPDATES: Update[] = [
  {
    id: "w46-jargon",
    datum: "2026-11-13",
    week: "Week 46",
    titel: "Vakjargon uitgebreid",
    tekst: "Straat- en wetsbegrippen, van Abri tot zwerfafval, staan nu als naslag.",
    naar: "/jargon",
    domeinen: ["algemeen"],
    nieuw: true,
  },
  {
    id: "w46-sfeer",
    datum: "2026-11-10",
    week: "Week 46",
    titel: "Beslisboom sfeerovergang",
    tekst: "Van medewerkingsplicht naar cautie, stap voor stap.",
    naar: "/beslisbomen",
    domeinen: ["algemeen"],
    nieuw: true,
  },
  {
    id: "w46-feit",
    datum: "2026-11-08",
    week: "Week 45",
    titel: "Feitenboekje 2026 in de zoeker",
    tekst: "Tarieven exclusief de € 9 van het CJIB, per feitcode.",
    naar: "/feitcodes",
    domeinen: ["I", "II", "III", "IV", "V", "VI"],
    nieuw: true,
  },
  {
    id: "w45-pv",
    datum: "2026-11-03",
    week: "Week 45",
    titel: "PV-bouwer op de zeven W's",
    tekst: "Wie, wat, waar, wanneer, waarmee, waarom, hoe. Klaar om over te nemen.",
    naar: "/pv",
    domeinen: ["algemeen"],
    nieuw: false,
  },
];

export const TELLEN = {
  feiten: FEITEN.length,
  jargon: JARGON.length,
  bomen: BOMEN.length,
  kaarten: KAARTEN.length,
};

export function recenteUpdates(max = 4): Update[] {
  return [...UPDATES].sort((a, b) => b.datum.localeCompare(a.datum)).slice(0, max);
}

export function isNieuw(datum: string, dagen = 7): boolean {
  const toen = new Date(datum).getTime();
  if (Number.isNaN(toen)) return false;
  return Date.now() - toen < dagen * 24 * 60 * 60 * 1000;
}
