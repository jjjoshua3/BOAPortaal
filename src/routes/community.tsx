import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { PageHead } from "@/components/bits";
import { pastFilter } from "@/lib/boa/meta";
import { lijstOverleg, plaatsOverleg, stemOverleg, verwijderOverleg, type OverlegBericht } from "@/lib/boa/overleg.functions";
import { usePrefs } from "@/lib/boa/prefs";
import { seo } from "@/lib/seo";
import { useBoaAuth } from "@/lib/supabase/auth";
import { sessieToken } from "@/lib/supabase/client";

export const Route = createFileRoute("/community")({
  head: () =>
    seo(
      "/community",
      "Community BOA Portaal | Vragen en tips van collega's",
      "Stel een vakvraag of lees mee. Alleen met een organisatie- of onderwijsaccount. Geen persoonsgegevens van burgers.",
    ),
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
            Voor dit onderdeel dient u ingelogd te zijn.{" "}
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
  const [reageerOp, setReageerOp] = useState<string | null>(null);
  const [reactieTekst, setReactieTekst] = useState("");

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

  async function plaats(event: FormEvent, parentId: string | null = null) {
    event.preventDefault();
    setBezig(true);
    try {
      const token = await sessieToken();
      if (!token) throw new Error("Log eerst in.");
      const isReply = !!parentId;
      await plaatsOverleg({
        data: {
          token,
          soort: isReply ? "correctie" : soort,
          titel: isReply ? "Reactie" : titel,
          tekst: isReply ? reactieTekst : tekst,
          domein: domein === "alle" ? "algemeen" : domein,
          parent_id: parentId,
        },
      });
      if (isReply) {
        setReactieTekst("");
        setReageerOp(null);
      } else {
        setTitel("");
        setTekst("");
      }
      await vernieuw();
    } catch (error) {
      setFout(error instanceof Error ? error.message : "Plaatsen lukte niet.");
    } finally {
      setBezig(false);
    }
  }

  async function stem(id: string, waarde: 1 | -1) {
    const token = await sessieToken();
    if (!token) return;
    const huidig = lijst.find((b) => b.id === id);
    const nieuwe = huidig?.mijn_stem === waarde ? null : waarde;
    try {
      const result = await stemOverleg({ data: { token, id, waarde: nieuwe } });
      setLijst((prev) =>
        prev.map((b) => (b.id === id ? { ...b, score: result.score, mijn_stem: result.mijn_stem } : b)),
      );
    } catch (error) {
      setFout(error instanceof Error ? error.message : "Stemmen lukte niet.");
    }
  }

  const roots = lijst.filter((b) => !b.parent_id);
  const kinderen = new Map<string, OverlegBericht[]>();
  for (const b of lijst) {
    if (b.parent_id) {
      const arr = kinderen.get(b.parent_id) ?? [];
      arr.push(b);
      kinderen.set(b.parent_id, arr);
    }
  }

  function relatief(iso: string) {
    const geplaatst = new Date(iso);
    const minuten = Math.round((Date.now() - geplaatst.getTime()) / 60000);
    if (minuten < 1) return "zojuist";
    if (minuten < 60) return `${minuten} min geleden`;
    if (minuten < 1440) return `${Math.round(minuten / 60)} uur geleden`;
    return geplaatst.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
  }

  function BerichtKaart({ bericht, diep = false }: { bericht: OverlegBericht; diep?: boolean }) {
    const replies = (kinderen.get(bericht.id) ?? []).sort(
      (a, b) => new Date(a.gemaakt).getTime() - new Date(b.gemaakt).getTime(),
    );
    return (
      <li className={diep ? "ml-6 border-l border-line pl-3" : ""}>
        <div className="overflow-hidden rounded-lg border border-line bg-panel shadow-sm">
          <div className="flex items-start gap-3 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-inset text-xs font-semibold text-ink">
              {(bericht.weergave || "C").slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs text-muted">
                <span className="font-semibold text-ink">{bericht.weergave || "collega"}</span>
                <span>·</span>
                <span>{bericht.organisatie}</span>
                <span>·</span>
                <span>{relatief(bericht.gemaakt)}</span>
                <span className="rounded-full bg-inset px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                  {bericht.soort === "correctie" ? "Antwoord" : "Vraag"}
                </span>
                {bericht.domein !== "algemeen" ? (
                  <span className="rounded-full bg-inset px-1.5 py-0.5 text-[10px]">Domein {bericht.domein}</span>
                ) : null}
              </div>
              <h3 className="mt-1.5 text-base font-semibold leading-snug">{bericht.titel}</h3>
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-ink/90">{bericht.tekst}</p>
              <div className="mt-3 flex items-center gap-1">
                <button
                  type="button"
                  className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs ${bericht.mijn_stem === 1 ? "bg-inset font-semibold text-ink" : "text-muted hover:bg-inset"}`}
                  onClick={() => void stem(bericht.id, 1)}
                  aria-label="Nuttig"
                >
                  ▲ {bericht.score > 0 ? bericht.score : ""}
                </button>
                <button
                  type="button"
                  className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs ${bericht.mijn_stem === -1 ? "bg-inset font-semibold text-ink" : "text-muted hover:bg-inset"}`}
                  onClick={() => void stem(bericht.id, -1)}
                  aria-label="Niet nuttig"
                >
                  ▼
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted hover:bg-inset"
                  onClick={() => {
                    setReageerOp(reageerOp === bericht.id ? null : bericht.id);
                    setReactieTekst("");
                  }}
                >
                  💬 Reageren{replies.length ? ` (${replies.length})` : ""}
                </button>
                {bericht.eigen ? (
                  <button
                    type="button"
                    className="ml-auto rounded-md px-2 py-1 text-xs text-stop hover:bg-inset"
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
              </div>
              {reageerOp === bericht.id ? (
                <form className="mt-3 grid gap-2" onSubmit={(e) => void plaats(e, bericht.id)}>
                  <textarea
                    value={reactieTekst}
                    onChange={(e) => setReactieTekst(e.target.value)}
                    rows={3}
                    placeholder="Jouw reactie…"
                    className="w-full border border-line bg-paper px-2 py-1.5 text-sm"
                    required
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="btn btn-brand" disabled={bezig}>
                      {bezig ? "Plaatsen…" : "Reageren"}
                    </button>
                    <button type="button" className="btn" onClick={() => setReageerOp(null)}>
                      Annuleer
                    </button>
                  </div>
                </form>
              ) : null}
            </div>
          </div>
        </div>
        {replies.length ? (
          <ul className="mt-2 grid gap-2">
            {replies.map((r) => (
              <BerichtKaart key={r.id} bericht={r} diep />
            ))}
          </ul>
        ) : null}
      </li>
    );
  }

  return (
    <div className="mt-3 grid gap-3">
      <form className="panel grid gap-3 p-3" onSubmit={(e) => void plaats(e)}>
        <label className="field">
          Soort
          <select value={soort} onChange={(e) => setSoort(e.target.value as "overleg" | "correctie")}>
            <option value="overleg">Vraag of tip</option>
            <option value="correctie">Antwoord</option>
          </select>
        </label>
        <label className="field">
          Onderwerp
          <input value={titel} onChange={(e) => setTitel(e.target.value)} maxLength={120} required />
        </label>
        <label className="field">
          Bericht
          <textarea value={tekst} onChange={(e) => setTekst(e.target.value)} rows={4} required />
        </label>
        <button className="btn btn-brand w-fit" type="submit" disabled={bezig}>
          {bezig ? "Plaatsen…" : "Plaatsen"}
        </button>
      </form>
      {fout ? <p className="text-sm text-stop">{fout}</p> : null}
      <ul className="grid gap-3">
        {roots.map((bericht) => (
          <BerichtKaart key={bericht.id} bericht={bericht} />
        ))}
        {roots.length === 0 && !fout ? (
          <li className="rounded-lg border border-dashed border-line p-6 text-center text-sm text-muted">
            Nog geen berichten. Wees de eerste die een praktijkvraag of tip plaatst.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
