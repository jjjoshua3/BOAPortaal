import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { PageHead } from "@/components/bits";
import { pastFilter } from "@/lib/boa/meta";
import { lijstOverleg, plaatsOverleg, verwijderOverleg, type OverlegBericht } from "@/lib/boa/overleg.functions";
import { usePrefs } from "@/lib/boa/prefs";
import { useBoaAuth } from "@/lib/supabase/auth";
import { sessieToken } from "@/lib/supabase/client";

export const Route = createFileRoute("/community")({
  component: CommunityPage,
});

const ONDERWERPEN: { domein: "I" | "II" | "III" | "IV" | "V" | "VI" | "algemeen"; titel: string; tekst: string }[] = [
  {
    domein: "I",
    titel: "F 185, zwerfafval",
    tekst: "Model-APV. In het Feitenboekje van 1 januari 2026 staat € 170, exclusief € 9 administratiekosten van het CJIB. Het artikelnummer is dat van de eigen APV.",
  },
  {
    domein: "I",
    titel: "Twee waarnemingen bij stilstand",
    tekst: "Kenteken, ventielstand en tijdstip van de eerste waarneming. De tweede volgt na de wachttijd uit de lokale regeling, niet na een vaste landelijke minuut.",
  },
  {
    domein: "algemeen",
    titel: "Toonplicht en D 517",
    tekst: "Geen draagplicht. De toonplicht van artikel 2 WID geldt vanaf 14 jaar. Onder 12 jaar geen strafvervolging (art. 486 Sv).",
  },
  {
    domein: "algemeen",
    titel: "Sfeerovergang",
    tekst: "Zodra je een verklaring zoekt over het feit, stopt de medewerkingsplicht. Hardop zeggen dat je opspoort, daarna de cautie (art. 29 lid 2 Sv).",
  },
  {
    domein: "IV",
    titel: "Niet ingecheckt",
    tekst: "Eerste lijn is het uitstel van betaling van de vervoerder. Artikel 70, 72 en 73 Wp2000 zijn verschillende feiten. Een aanwijzing die niet wordt opgevolgd is niet hetzelfde als geen vervoerbewijs.",
  },
  {
    domein: "III",
    titel: "Relatief, absoluut, luxe",
    tekst: "Absoluut: niet ingeschreven. Relatief: 16 uur of meer ongeoorloofd in vier aaneengesloten lesweken. Luxe: vakantie buiten de schoolvakantie zonder vrijstelling.",
  },
  {
    domein: "V",
    titel: "Huisbezoek",
    tekst: "Zonder machtiging alleen met vrije, specifieke toestemming. Die mag worden ingetrokken. Geen voet tussen de deur. Geen BSN in dit portaal.",
  },
  {
    domein: "II",
    titel: "Vissen zonder toestemming",
    tekst: "Artikel 21 lid 1 Visserijwet 1963. De VISpas is de gewone schriftelijke toestemming van de rechthebbende. De akte bepaalt of jij dit feit mag verbaliseren.",
  },
  {
    domein: "VI",
    titel: "Artikel 5 WVW",
    tekst: "Gevaar of hinder op de weg is in de regel politiewerk, tenzij de akte het feit noemt. Eerst de veiligheid, daarna overdracht.",
  },
];

function CommunityPage() {
  const { user, ready } = useBoaAuth();
  const domein = usePrefs((state) => state.domein);
  const onderwerpen = ONDERWERPEN.filter((item) => pastFilter([item.domein], domein));

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-5">
      <PageHead
        kicker="COMMUNITY"
        title="Praktijkvragen"
        lede="Vaste onderwerpen per domein, plus het bord voor aangemelde collega's. Geen namen van burgers."
      />
      <ul className="grid gap-2">
        {onderwerpen.map((item) => (
          <li key={item.titel} className="panel p-3">
            <p className="font-mono text-xs text-muted">Domein {item.domein === "algemeen" ? "I–VI" : item.domein}</p>
            <h2 className="mt-1 font-semibold">{item.titel}</h2>
            <p className="mt-1 text-sm">{item.tekst}</p>
          </li>
        ))}
      </ul>
      <section className="mt-6">
        <h2 className="text-lg font-semibold">Bord</h2>
        {!ready ? <p className="mt-2 text-sm text-muted">Account laden.</p> : null}
        {ready && !user ? (
          <p className="panel mt-3 p-3 text-sm">
            Meeschrijven kan met een geverifieerd organisatie- of schooladres. Gratis mailboxen worden geweigerd.{" "}
            <Link to="/account" className="font-semibold underline">
              Aanmelden
            </Link>
          </p>
        ) : null}
        {user ? <Bord /> : null}
      </section>
    </div>
  );
}

function Bord() {
  const domein = usePrefs((state) => state.domein);
  const [lijst, setLijst] = useState<OverlegBericht[]>([]);
  const [fout, setFout] = useState("");
  const [titel, setTitel] = useState("");
  const [tekst, setTekst] = useState("");
  const [soort, setSoort] = useState<"overleg" | "correctie">("overleg");
  const [bezig, setBezig] = useState(false);

  async function vernieuw() {
    const token = await sessieToken();
    if (!token) {
      setFout("Log eerst in.");
      return;
    }
    try {
      setLijst(await lijstOverleg({ data: { token } }));
      setFout("");
    } catch (error) {
      setFout(error instanceof Error ? error.message : "Het bord is niet bereikbaar.");
    }
  }

  useEffect(() => {
    void vernieuw();
  }, []);

  async function plaats(event: FormEvent) {
    event.preventDefault();
    setBezig(true);
    try {
      const token = await sessieToken();
      if (!token) throw new Error("Log eerst in.");
      await plaatsOverleg({
        data: { token, soort, titel, tekst, domein: domein === "alle" ? "algemeen" : domein },
      });
      setTitel("");
      setTekst("");
      await vernieuw();
    } catch (error) {
      setFout(error instanceof Error ? error.message : "Plaatsen lukte niet.");
    } finally {
      setBezig(false);
    }
  }

  return (
    <div className="mt-3 grid gap-3">
      <form className="panel grid gap-3 p-3" onSubmit={(event) => void plaats(event)}>
        <label className="field">
          Soort
          <select value={soort} onChange={(event) => setSoort(event.target.value as "overleg" | "correctie")}>
            <option value="overleg">Vraag of tip</option>
            <option value="correctie">Antwoord</option>
          </select>
        </label>
        <label className="field">
          Onderwerp
          <input value={titel} onChange={(event) => setTitel(event.target.value)} maxLength={120} required />
        </label>
        <label className="field">
          Bericht
          <textarea value={tekst} onChange={(event) => setTekst(event.target.value)} rows={4} required />
        </label>
        <button className="btn btn-brand w-fit" type="submit" disabled={bezig}>
          {bezig ? "Plaatsen…" : "Plaatsen"}
        </button>
      </form>
      {fout ? <p className="text-sm text-stop">{fout}</p> : null}
      <ul className="grid gap-2">
        {lijst.map((bericht) => (
          <li key={bericht.id} className="border border-line bg-panel p-3">
            <p className="font-mono text-xs text-muted">
              {bericht.soort === "correctie" ? "Antwoord" : "Vraag"} · domein {bericht.domein} · {bericht.weergave} · {bericht.organisatie}
            </p>
            <h3 className="mt-1 font-semibold">{bericht.titel}</h3>
            <p className="mt-1 text-sm">{bericht.tekst}</p>
            <p className="mt-2 font-mono text-xs text-muted">{new Date(bericht.gemaakt).toLocaleString("nl-NL")}</p>
            {bericht.eigen ? (
              <button
                type="button"
                className="btn mt-2"
                onClick={() => {
                  void (async () => {
                    const token = await sessieToken();
                    if (!token) return;
                    await verwijderOverleg({ data: { token, id: bericht.id } });
                    await vernieuw();
                  })();
                }}
              >
                Verwijder
              </button>
            ) : null}
          </li>
        ))}
        {lijst.length === 0 && !fout ? <li className="text-sm text-muted">Nog geen berichten op het bord.</li> : null}
      </ul>
    </div>
  );
}
