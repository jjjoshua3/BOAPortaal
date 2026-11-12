import { createServerFn } from "@tanstack/react-start";

export type BronStatus = "gevonden" | "niet-gevonden" | "onbereikbaar";

export type BronUitslag = {
  id: string;
  label: string;
  url: string;
  uitleg: string;
  status: BronStatus;
};

const WACHT: { id: string; label: string; url: string; naald: string; uitleg: string }[] = [
  {
    id: "wid",
    label: "Wet op de identificatieplicht",
    url: "https://wetten.overheid.nl/BWBR0006297",
    naald: "veertien jaar",
    uitleg: "Artikel 2: toonplicht vanaf veertien jaar. Een draagplicht staat niet in dit artikel.",
  },
  {
    id: "sv29",
    label: "Wetboek van Strafvordering | cautie",
    url: "https://wetten.overheid.nl/BWBR0001854",
    naald: "niet tot antwoorden verplicht",
    uitleg: "Artikel 29 lid 2. De cautie gaat vóór de verhoorvraag.",
  },
  {
    id: "sr447e",
    label: "Wetboek van Strafrecht | artikel 447e",
    url: "https://wetten.overheid.nl/BWBR0001903",
    naald: "447e",
    uitleg: "Niet voldoen aan de inzagevordering. Alleen waar de toonplicht geldt.",
  },
  {
    id: "alcohol",
    label: "Alcoholwet",
    url: "https://wetten.overheid.nl/BWBR0002458",
    naald: "Artikel 45",
    uitleg: "Artikel 45 en 45a staan in de geldende tekst. Onder de 18 is aanwezig hebben E 211, niet F 121.",
  },
  {
    id: "wp",
    label: "Wet personenvervoer 2000",
    url: "https://wetten.overheid.nl/BWBR0011470",
    naald: "Artikel 70",
    uitleg: "Artikel 70, 72 en 73. Eerst de administratieve betaling waar die weg openstaat.",
  },
  {
    id: "leer",
    label: "Leerplichtwet 1969",
    url: "https://wetten.overheid.nl/BWBR0002628",
    naald: "Artikel 21a",
    uitleg: "De meldnorm van relatief verzuim staat in artikel 21a. Artikel 21 is vervallen.",
  },
  {
    id: "pw",
    label: "Participatiewet",
    url: "https://wetten.overheid.nl/BWBR0015703",
    naald: "Artikel 17",
    uitleg: "Inlichtingenplicht. De bestuurlijke boete is artikel 18a en legt het college op.",
  },
  {
    id: "wvw",
    label: "Wegenverkeerswet 1994 | artikel 107",
    url: "https://wetten.overheid.nl/BWBR0006622",
    naald: "Artikel 107",
    uitleg: "Rijden zonder rijbewijs. Artikel 178 maakt de feiten van artikel 177 tot overtreding. Code K 055.",
  },
  {
    id: "awb",
    label: "Algemene wet bestuursrecht | toezicht",
    url: "https://wetten.overheid.nl/BWBR0005537",
    naald: "Artikel 5:20",
    uitleg: "Medewerkingsplicht in het toezicht. Die stopt bij een verhoor over een strafbaar feit.",
  },
];

let cache: { tot: number; uitslag: BronUitslag[] } | null = null;

async function lees(url: string, naald: string): Promise<BronStatus> {
  try {
    const antwoord = await fetch(url, {
      headers: { accept: "text/html", "user-agent": "BOAPortaal/1.0 (naslag; +https://boaportaal.nl)" },
      signal: AbortSignal.timeout(9000),
      redirect: "follow",
    });
    if (!antwoord.ok) return "onbereikbaar";
    const tekst = (await antwoord.text()).toLowerCase();
    return tekst.includes(naald.toLowerCase()) ? "gevonden" : "niet-gevonden";
  } catch {
    return "onbereikbaar";
  }
}

export const controleerBronnen = createServerFn({ method: "POST" }).handler(async (): Promise<BronUitslag[]> => {
  if (cache && cache.tot > Date.now()) return cache.uitslag;
  const uitslag = await Promise.all(
    WACHT.map(async (bron) => ({
      id: bron.id,
      label: bron.label,
      url: bron.url,
      uitleg: bron.uitleg,
      status: await lees(bron.url, bron.naald),
    })),
  );
  cache = { tot: Date.now() + 6 * 60 * 60 * 1000, uitslag };
  return uitslag;
});
