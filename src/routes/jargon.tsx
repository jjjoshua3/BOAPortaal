import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageHead } from "@/components/bits";
import { JARGON, type Woord } from "@/lib/boa/jargon";
import { useKluis } from "@/lib/kluis/provider";

export const Route = createFileRoute("/jargon")({
  component: JargonPage,
});

const OPSLAG = "boa-jargon-bewaard";
const CATEGORIEEN = ["Alle", "Strafrecht", "Bestuursrecht", "Op straat", "OV", "Documenten"] as const;

function categorieVan(woord: Woord): (typeof CATEGORIEEN)[number] {
  const hay = `${woord.term} ${woord.uitleg}`.toLowerCase();
  if (/wp2000|vervoerbewijs|incheck|ns |trein|ov-boa|openbaar vervoer/.test(hay)) return "OV";
  if (/proces-verbaal|combibon|feitcode|pv\b|dossier|ambtseed/.test(hay)) return "Documenten";
  if (/awb|bestuurlijke|apv|toezichthouder|medewerkingsplicht|wahv/.test(hay)) return "Bestuursrecht";
  if (/straat|bon\b|cautie|aanhoud|heterdaad|fouill/.test(hay)) return "Op straat";
  return "Strafrecht";
}

function leesSterren(): string[] {
  try {
    const raw = localStorage.getItem(OPSLAG);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function JargonPage() {
  const [q, setQ] = useState("");
  const [letter, setLetter] = useState("alle");
  const [categorie, setCategorie] = useState<(typeof CATEGORIEEN)[number]>("Alle");
  const [sterren, setSterren] = useState<string[]>([]);
  const { saveNote } = useKluis();
  const [melding, setMelding] = useState("");

  useEffect(() => {
    setSterren(leesSterren());
  }, []);

  const metKat = useMemo(() => JARGON.map((woord) => ({ ...woord, categorie: categorieVan(woord) })), []);
  const gevonden = useMemo(() => {
    const delen = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return metKat
      .filter((woord) => (categorie === "Alle" ? true : woord.categorie === categorie))
      .filter((woord) => (letter === "alle" ? true : woord.term.toLocaleUpperCase("nl").startsWith(letter)))
      .filter((woord) => {
        if (!delen.length) return true;
        const hay = `${woord.term} ${woord.uitleg}`.toLowerCase();
        return delen.every((deel) => hay.includes(deel));
      })
      .sort((a, b) => a.term.localeCompare(b.term, "nl"));
  }, [categorie, letter, metKat, q]);

  const letters = [...new Set(metKat.map((woord) => woord.term[0]?.toLocaleUpperCase("nl") ?? "?"))].sort((a, b) => a.localeCompare(b, "nl"));

  function ster(term: string) {
    setSterren((huidig) => {
      const volgende = huidig.includes(term) ? huidig.filter((item) => item !== term) : [...huidig, term];
      localStorage.setItem(OPSLAG, JSON.stringify(volgende));
      return volgende;
    });
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-5">
      <PageHead
        kicker="NASLAG | VAKTAAL"
        title="Vakjargon"
        lede="Woorden die op straat, in de akte en in het Feitenboekje een vaste betekenis hebben."
      />
      <label className="field mb-3">
        Zoek een woord
        <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Abri, cautie, combibon, UvB" />
      </label>
      <div className="sticky top-14 z-10 -mx-4 mb-3 border-y border-line bg-[#F8FAFC] px-4 py-2">
        <div className="flex flex-wrap gap-1">
          <button type="button" className={letter === "alle" ? "btn btn-brand min-h-8 px-2 text-xs" : "btn min-h-8 px-2 text-xs"} onClick={() => setLetter("alle")}>
            A–Z
          </button>
          {letters.map((item) => (
            <button key={item} type="button" className={letter === item ? "btn btn-brand min-h-8 px-2 text-xs" : "btn min-h-8 px-2 text-xs"} onClick={() => setLetter(item)}>
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {CATEGORIEEN.map((item) => (
          <button key={item} type="button" className={categorie === item ? "btn btn-brand" : "btn"} onClick={() => setCategorie(item)}>
            {item}
          </button>
        ))}
      </div>
      {melding ? <p className="mb-3 text-sm">{melding}</p> : null}
      {gevonden.length === 0 ? <p className="text-sm text-muted">Geen woord bij deze letters.</p> : null}
      <ul className="grid gap-2">
        {gevonden.map((woord) => (
          <li key={woord.term} id={`woord-${woord.term}`} className="grid gap-2 border border-line bg-panel p-3 sm:grid-cols-[10rem_7rem_1fr_auto] sm:items-start">
            <h2 className="font-semibold">{woord.term}</h2>
            <p className="font-mono text-xs text-muted">{woord.categorie}</p>
            <p className="text-sm">{woord.uitleg}</p>
            <button
              type="button"
              className="btn"
              onClick={() => {
                ster(woord.term);
                void saveNote({ titel: woord.term, body: woord.uitleg, zachtAkkoord: true }).then((fout) => {
                  setMelding(fout ?? `${woord.term} staat in de kluis.`);
                });
              }}
            >
              {sterren.includes(woord.term) ? "Bewaard" : "Bewaar"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
