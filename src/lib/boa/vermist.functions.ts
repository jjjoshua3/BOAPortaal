import { createServerFn } from "@tanstack/react-start";

export type VermistPersoon = {
  id: string;
  naam: string;
  plaats: string;
  sinds: string;
  soort: string;
  tekst: string;
  foto: string;
  zaak: string;
  tip: string;
};

export type VermistAntwoord = {
  personen: VermistPersoon[];
  totaalBron: number;
  fout: string | null;
};

type Raw = {
  uuid?: string;
  titel?: string;
  plaats?: string;
  datum?: string;
  introductie?: string;
  afbeelding?: string;
  url?: string;
  urlTipformulier?: string;
  gezochtType?: string;
  opgelost?: string | boolean;
};

type Pagina = {
  iterator?: { last?: boolean; total?: number };
  documenten?: Raw[];
};

const DAGEN = 21;
let cache: { tot: number; antwoord: VermistAntwoord } | null = null;

function vandaagAmsterdam(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Amsterdam",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function dagenTussen(datum: string, vandaag: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datum) || !/^\d{4}-\d{2}-\d{2}$/.test(vandaag)) return null;
  const a = Date.parse(`${datum}T00:00:00Z`);
  const b = Date.parse(`${vandaag}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return Math.round((b - a) / 86400000);
}

function schoon(tekst: string): string {
  return tekst
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 420);
}

async function haalPagina(offset: number): Promise<Pagina> {
  const response = await fetch(`https://api.politie.nl/v5/vermist?language=nl&offset=${offset}`, {
    headers: { accept: "application/json" },
  });
  if (!response.ok) throw new Error(`politie ${response.status}`);
  return (await response.json()) as Pagina;
}

export const laadVermisten = createServerFn({ method: "POST" }).handler(async (): Promise<VermistAntwoord> => {
  if (cache && cache.tot > Date.now()) return cache.antwoord;
  const vandaag = vandaagAmsterdam();
  try {
    const eerste = await haalPagina(0);
    const totaal = eerste.iterator?.total ?? eerste.documenten?.length ?? 0;
    const ruw: Raw[] = [...(eerste.documenten ?? [])];
    const offsets: number[] = [];
    for (let offset = 10; offset < totaal && offset < 400; offset += 10) offsets.push(offset);
    for (let i = 0; i < offsets.length; i += 5) {
      const groep = offsets.slice(i, i + 5);
      const paginaas = await Promise.all(groep.map((offset) => haalPagina(offset)));
      for (const pagina of paginaas) ruw.push(...(pagina.documenten ?? []));
    }
    const personen: VermistPersoon[] = [];
    const gezien = new Set<string>();
    for (const stuk of ruw) {
      const sinds = stuk.datum ?? "";
      const leeftijd = dagenTussen(sinds, vandaag);
      const opgelost = String(stuk.opgelost).toLowerCase() === "true";
      const foto = stuk.afbeelding ?? "";
      const id = stuk.uuid || stuk.url || stuk.titel || "";
      if (opgelost || leeftijd === null || leeftijd < 0 || leeftijd > DAGEN) continue;
      if (!foto.startsWith("https://www.politie.nl/")) continue;
      if (!stuk.url?.startsWith("https://www.politie.nl/")) continue;
      if (!id || gezien.has(id)) continue;
      gezien.add(id);
      personen.push({
        id,
        naam: (stuk.titel ?? "Vermist persoon").slice(0, 120),
        plaats: (stuk.plaats ?? "Onbekend").slice(0, 80),
        sinds,
        soort: (stuk.gezochtType ?? "vermist").replaceAll("-", " "),
        tekst: schoon(stuk.introductie ?? ""),
        foto,
        zaak: stuk.url,
        tip: stuk.urlTipformulier?.startsWith("https://www.politie.nl/") ? stuk.urlTipformulier : stuk.url,
      });
    }
    personen.sort((a, b) => (a.sinds < b.sinds ? 1 : -1));
    const antwoord: VermistAntwoord = { personen, totaalBron: totaal, fout: null };
    cache = { tot: Date.now() + 10 * 60 * 1000, antwoord };
    return antwoord;
  } catch {
    const antwoord: VermistAntwoord = {
      personen: [],
      totaalBron: 0,
      fout: "De lijst van de politie is nu niet bereikbaar.",
    };
    return antwoord;
  }
});
