import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { FEITEN, type Feit } from "@/lib/boa/feitcodes";
import { DOMEIN_INFO, pastFilter, type DomeinId } from "@/lib/boa/meta";
import {
  bouwPv,
  checklistPv,
  kwaliteit,
  leegPv,
  pvWaarschuwingen,
  stempelNu,
  wStatus,
  type Identiteit,
  type LeeftijdCat,
  type PvInvoer,
  type Regime,
} from "@/lib/boa/pv";
import { usePrefs } from "@/lib/boa/prefs";
import { scanPii } from "@/lib/boa/privacy";
import { seo } from "@/lib/seo";
import { CopyButton, PiiPanel } from "@/components/bits";
import { FeitVeld } from "@/components/feit-veld";
import { useKluis } from "@/lib/kluis/provider";

type Search = { code?: string };

export const Route = createFileRoute("/pv")({
  head: () =>
    seo(
      "/pv",
      "7 W's Proces-Verbaal (PV) Bouwer voor BOA & HTV-Student | BOA Portaal",
      "Stel gestructureerd een ambtsedig relaas van bevindingen op aan de hand van de zeven W's, klaar om over te nemen in je bronsysteem.",
    ),
  validateSearch: (search: Record<string, unknown>): Search => {
    if (typeof search.code === "string" && search.code.trim()) return { code: search.code.trim() };
    return {};
  },
  component: PvPage,
});

function feitOpCode(code: string) {
  const naald = code.replace(/\s+/g, "").toLowerCase();
  return FEITEN.find((feit) => feit.code.replace(/\s+/g, "").toLowerCase() === naald);
}

function pasFeit(huidig: PvInvoer, feit: Feit): PvInvoer {
  return {
    ...huidig,
    feit,
    domein: feit.domeinen.find((id) => id !== "algemeen") ?? huidig.domein,
    waarneming: huidig.waarneming.trim() ? huidig.waarneming : feit.pv,
    regime: feit.afdoening === "bestuur" ? "mulder" : huidig.regime === "bevindingen" ? "straf" : huidig.regime,
  };
}

function voorbeeld(soort: "afval" | "id" | "ov", basis: PvInvoer): PvInvoer {
  const stempel = stempelNu();
  const leeg = { ...leegPv(basis.domein), datum: stempel.datum, tijd: stempel.tijd, verbalisant: basis.verbalisant || "Verbalisant 1 (akte #0000)" };
  if (soort === "afval") {
    const feit = FEITEN.find((item) => item.id === "h025") ?? null;
    return {
      ...leeg,
      regime: "straf",
      domein: "I",
      uniform: "uniform",
      identiteit: "idkaart",
      leeftijd: "18",
      feit,
      plaats: "[PLAATS]",
      straat: "[STRAAT]",
      locatieZin: "op de voor het openbaar verkeer openstaande weg",
      waarmee: "Huisvuilzak / kartonnen doos naast de container",
      aanleiding: "Algemene surveillance",
      cautie: true,
      verklaring: "Ik wist niet dat de zak niet naast de bak mocht.",
      waarneming:
        "Ik zag dat naast het aangewezen inzamelmiddel een gevulde huisvuilzak stond. Ik zag dat de verdachte die zak daar neerzette en wegliep. De zak bevatte huishoudelijk afval.",
    };
  }
  if (soort === "id") {
    const feit = FEITEN.find((item) => item.id === "d517") ?? null;
    return {
      ...leeg,
      regime: "straf",
      domein: "I",
      uniform: "uniform",
      identiteit: "weigering",
      leeftijd: "18",
      feit,
      plaats: "[PLAATS]",
      straat: "[STRAAT]",
      locatieZin: "op de voor het openbaar verkeer openstaande weg",
      waarmee: "Geen specifiek voorwerp",
      aanleiding: "Gerichte handhavingsactie",
      cautie: true,
      geenVerklaring: true,
      waarneming:
        "Ik stelde vast dat de verdachte 14 jaar of ouder was. Ik heb mij gelegitimeerd en gevorderd een geldig identiteitsbewijs ter inzage te tonen. De verdachte toonde geen document en zei dat hij dat niet ging doen.",
    };
  }
  const feit = FEITEN.find((item) => item.id === "wp70-1") ?? null;
  return {
    ...leeg,
    regime: "mulder",
    domein: "IV",
    uniform: "uniform",
    identiteit: "paspoort",
    leeftijd: "18",
    feit,
    plaats: "[PLAATS]",
    straat: "[LIJN OF STATION]",
    locatieZin: "in een voor het publiek toegankelijk vervoermiddel / station",
    waarmee: "Geen geldig vervoerbewijs",
    aanleiding: "Gerichte handhavingsactie",
    cautie: false,
    waarneming:
      "Ik zag dat de betrokkene gebruikmaakte van het openbaar vervoer. Op mijn verzoek toonde de betrokkene geen geldig vervoerbewijs. De administratieve betaling is niet voldaan.",
  };
}

function PvPage() {
  const filter = usePrefs((state) => state.domein);
  const code = Route.useSearch().code ?? "";
  const [form, setForm] = useState<PvInvoer>(() => leegPv(filter === "alle" ? "I" : filter));
  const [tab, setTab] = useState<"relaas" | "check">("relaas");
  const [akkoord, setAkkoord] = useState(false);
  const [melding, setMelding] = useState("");
  const { saveSjabloon } = useKluis();
  const feiten = FEITEN.filter((feit) => pastFilter(feit.domeinen, filter));
  const relaas = useMemo(() => bouwPv(form), [form]);
  const check = useMemo(() => checklistPv(form), [form]);
  const tekst = tab === "relaas" ? relaas : check;
  const scan = scanPii(relaas);
  const blokkade = scan.hard.length > 0 || (scan.zacht.length > 0 && !akkoord);
  const tips = pvWaarschuwingen(form);
  const status = wStatus(form);
  const score = kwaliteit(form);
  const klaar = status.filter((item) => item.ok).length;

  useEffect(() => {
    const gekozen = code ? feitOpCode(code) : null;
    const id = sessionStorage.getItem("boa-pv-feit");
    if (id) sessionStorage.removeItem("boa-pv-feit");
    const uitSessie = id ? FEITEN.find((item) => item.id === id) : null;
    const feit = gekozen ?? uitSessie;
    if (!feit) return;
    setForm((huidig) => pasFeit(huidig, feit));
  }, [code]);

  function set<K extends keyof PvInvoer>(key: K, value: PvInvoer[K]) {
    setForm((huidig) => ({ ...huidig, [key]: value }));
  }

  function plak(zin: string) {
    setForm((huidig) => ({
      ...huidig,
      waarneming: huidig.waarneming.trim() ? `${huidig.waarneming.trimEnd()} ${zin}` : zin,
    }));
  }

  function nu() {
    const stempel = stempelNu();
    setForm((huidig) => ({ ...huidig, tijd: stempel.tijd, datum: huidig.datum || stempel.datum }));
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5">
      <header className="mb-4 border-b border-line pb-3">
        <p className="text-xs text-muted">Overzicht / PV-bouwer</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">PV-werkplaats</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Een ambtsedig relaas langs de zeven W's, klaar om over te nemen in BRS, CityControl, Sigmax of MEOS. Geen persoonsgegevens van burgers.
        </p>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold">Snel vullen met praktijkvoorbeeld</span>
        <button type="button" className="btn" onClick={() => setForm((huidig) => voorbeeld("afval", huidig))}>
          Afval naast container (H 004)
        </button>
        <button type="button" className="btn" onClick={() => setForm((huidig) => voorbeeld("id", huidig))}>
          Weigering ID (D 517)
        </button>
        <button type="button" className="btn" onClick={() => setForm((huidig) => voorbeeld("ov", huidig))}>
          OV zonder vervoerbewijs
        </button>
        <button type="button" className="btn" onClick={() => setForm(leegPv(filter === "alle" ? "I" : filter))}>
          Wis / nieuw leeg PV
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <form className="no-print grid gap-3 lg:col-span-7" onSubmit={(event) => event.preventDefault()}>
          <fieldset className="panel grid gap-3 border-l-4 border-l-[#1D4ED8] p-3">
            <legend className="px-1 text-xs font-semibold tracking-wide">Soort PV / regime</legend>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["bevindingen", "Bevindingen"],
                  ["straf", "Strafrecht"],
                  ["mulder", "Wet Mulder"],
                ] as const
              ).map(([id, label]) => (
                <button key={id} type="button" className={form.regime === id ? "btn btn-brand" : "btn"} onClick={() => set("regime", id as Regime)}>
                  {label}
                </button>
              ))}
            </div>
            <p className="text-sm text-muted">
              {form.regime === "straf"
                ? "Termen: verdachte en strafbaar feit. Cautie (art. 29 Sv) hoort erbij zodra je over het feit vraagt."
                : form.regime === "mulder"
                  ? "Termen: betrokkene en gedraging. Schrijf bij Mulder geen verdachte."
                  : "Algemeen relaas of ter overdracht. Kies strafrecht of Mulder zodra de afdoening vaststaat."}
            </p>
          </fieldset>

          <WBlok titel="W1 | Wie" tekst="Verbalisant en hoe de identiteit is vastgesteld. Geen echte naam van een burger.">
            <label className="field">
              Verbalisant of aktenummer
              <input value={form.verbalisant} onChange={(event) => set("verbalisant", event.target.value)} placeholder="Verbalisant 1 (akte #0000)" />
            </label>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={form.koppel === "ik" ? "btn btn-brand" : "btn"} onClick={() => set("koppel", "ik")}>
                Ik, verbalisant
              </button>
              <button type="button" className={form.koppel === "wij" ? "btn btn-brand" : "btn"} onClick={() => set("koppel", "wij")}>
                Wij, verbalisanten
              </button>
              <button type="button" className={form.uniform === "uniform" ? "btn btn-brand" : "btn"} onClick={() => set("uniform", "uniform")}>
                In uniform
              </button>
              <button type="button" className={form.uniform === "burger" ? "btn btn-brand" : "btn"} onClick={() => set("uniform", "burger")}>
                In burger
              </button>
            </div>
            <label className="field">
              Domein
              <select value={form.domein} onChange={(event) => set("domein", event.target.value as DomeinId)}>
                {DOMEIN_INFO.filter((item) => item.id !== "algemeen").map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <p className="text-xs font-semibold text-muted">Identiteit</p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["paspoort", "NL paspoort"],
                  ["idkaart", "NL identiteitskaart"],
                  ["rijbewijs", "NL rijbewijs"],
                  ["weigering", "Weigerde inzage (D 517)"],
                  ["kenteken", "Op kenteken"],
                ] as const
              ).map(([id, label]) => (
                <button key={id} type="button" className={form.identiteit === id ? "btn btn-brand" : "btn"} onClick={() => set("identiteit", form.identiteit === id ? "" : (id as Identiteit))}>
                  {label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["18", "Meerderjarig (18+)"],
                  ["16", "Jeugd 16–17 jr"],
                  ["12", "Jeugd 12–15 jr"],
                ] as const
              ).map(([id, label]) => (
                <button key={id} type="button" className={form.leeftijd === id ? "btn btn-brand" : "btn"} onClick={() => set("leeftijd", form.leeftijd === id ? "" : (id as LeeftijdCat))}>
                  {label}
                </button>
              ))}
            </div>
          </WBlok>

          <WBlok titel="W2 | Wat" tekst="Kies een feitcode. Het aandachtspunt komt mee in het relaas.">
            <FeitVeld
              feiten={feiten}
              feit={form.feit}
              onKies={(feit) => {
                if (!feit) {
                  set("feit", null);
                  return;
                }
                setForm((huidig) => pasFeit(huidig, feit));
              }}
            />
            {form.feit ? <p className="bg-[#DBEAFE] p-2 text-sm text-[#1E3A8A]">PV-aandachtspunt | {form.feit.pv}</p> : null}
          </WBlok>

          <WBlok titel="W3 | Waar" tekst="Plaats en de juridische formulering van de locatie.">
            <label className="field">
              Plaats of gemeente
              <input value={form.plaats} onChange={(event) => set("plaats", event.target.value)} placeholder="[PLAATS]" />
            </label>
            <label className="field">
              Straat of locatie
              <input value={form.straat} onChange={(event) => set("straat", event.target.value)} placeholder="[STRAAT]" />
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                "op de voor het openbaar verkeer openstaande weg",
                "op een door het bevoegd gezag aangewezen plaats",
                "in een voor het publiek toegankelijk vervoermiddel / station",
                "binnen de bebouwde kom",
              ].map((zin) => (
                <button key={zin} type="button" className={form.locatieZin === zin ? "btn btn-brand" : "btn"} onClick={() => set("locatieZin", form.locatieZin === zin ? "" : zin)}>
                  {zin}
                </button>
              ))}
            </div>
          </WBlok>

          <WBlok titel="W4 | Wanneer" tekst="Standaard vandaag. Een tweede tijd is voor een herhaalde waarneming.">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="field">
                Datum
                <input type="date" value={form.datum} onChange={(event) => set("datum", event.target.value)} />
              </label>
              <label className="field">
                Tijd
                <span className="flex gap-2">
                  <input type="time" value={form.tijd} onChange={(event) => set("tijd", event.target.value)} />
                  <button type="button" className="btn shrink-0" onClick={nu}>
                    Nu
                  </button>
                </span>
              </label>
            </div>
            <label className="field">
              Tweede tijdstip, optioneel
              <input type="time" value={form.tijd2} onChange={(event) => set("tijd2", event.target.value)} />
            </label>
          </WBlok>

          <WBlok titel="W5 | Waarmee" tekst="Middel, voertuig of voorwerp. Laat leeg als er niets bijzonders is, of kies de chip.">
            <div className="flex flex-wrap gap-2">
              {["Geen specifiek voorwerp", "Personenauto (kenteken [KENTEKEN])", "Fatbike / bijzondere bromfiets", "Huisvuilzak / kartonnen doos", "Geopend blikje of flesje"].map((zin) => (
                <button key={zin} type="button" className="btn" onClick={() => set("waarmee", zin)}>
                  {zin}
                </button>
              ))}
            </div>
            <label className="field">
              Eigen tekst
              <textarea value={form.waarmee} onChange={(event) => set("waarmee", event.target.value)} />
            </label>
          </WBlok>

          <WBlok titel="W6 | Waarom" tekst="Aanleiding, cautie en verklaring. De cautie hoort erbij vóór een verhoor over een strafbaar feit.">
            <div className="flex flex-wrap gap-2">
              {["Algemene surveillance", "Naar aanleiding van een melding", "Gerichte handhavingsactie"].map((zin) => (
                <button key={zin} type="button" className={form.aanleiding === zin ? "btn btn-brand" : "btn"} onClick={() => set("aanleiding", zin)}>
                  {zin}
                </button>
              ))}
            </div>
            <label className="field">
              Aanleiding
              <textarea value={form.aanleiding} onChange={(event) => set("aanleiding", event.target.value)} />
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={form.cautie} onChange={(event) => set("cautie", event.target.checked)} />
              Cautie gegeven voor aanvang verhoor (art. 29 lid 2 Sv)
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={form.geenVerklaring} onChange={(event) => set("geenVerklaring", event.target.checked)} />
              Wenste geen verklaring af te leggen
            </label>
            <label className="field">
              Woordelijke verklaring
              <textarea value={form.verklaring} onChange={(event) => set("verklaring", event.target.value)} placeholder="Ik wist niet dat ik hier niet mocht staan" disabled={form.geenVerklaring} />
            </label>
          </WBlok>

          <WBlok titel="W7 | Hoe" tekst="Schrijf feitelijke, zintuiglijke waarnemingen. Wat je zag, hoorde, rook of voelde. Geen conclusies.">
            <div className="flex flex-wrap gap-2">
              {[
                "Ik zag dat ",
                "Ik hoorde dat ",
                "Ik rook dat ",
                "Ik stelde vast dat ",
                "Ik sprak de betrokkene aan en deelde mede dat ",
                "Ik vorderde inzage in een geldig identiteitsbewijs op grond van artikel 2 van de Wet op de identificatieplicht. ",
              ].map((zin) => (
                <button key={zin} type="button" className="btn" onClick={() => plak(zin)}>
                  {zin.trim()}
                </button>
              ))}
            </div>
            <label className="field">
              Waarneming
              <textarea className="min-h-32" value={form.waarneming} onChange={(event) => set("waarneming", event.target.value)} />
            </label>
            <p className="text-xs font-semibold text-muted">Alleen aanvinken wat écht is gebeurd. Uit blijft uit het relaas.</p>
            {(
              [
                ["sfeer", "Sfeerovergang van toezicht (Awb) naar opsporing (Sv)"],
                ["aanhouding", "Aanhouding op heterdaad (art. 53 Sv)"],
                ["fouillering", "Veiligheidsfouillering (art. 7 lid 3 Ambtsinstructie)"],
                ["boeien", "Handboeien (art. 22 Ambtsinstructie)"],
                ["overdracht", "Overdracht aan de politie of voorgeleiding"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex min-h-11 items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={form[key]} onChange={(event) => set(key, event.target.checked)} />
                {label}
              </label>
            ))}
          </WBlok>
        </form>

        <aside className="lg:col-span-5">
          <div className="grid gap-3 lg:sticky lg:top-20">
            <div className="panel p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-sm">
                  {klaar}/7 bouwstenen · {score}%
                </p>
              </div>
              <ul className="mt-2 flex flex-wrap gap-2 text-sm">
                {status.map((item) => (
                  <li key={item.id} className={item.ok ? "font-semibold text-[#059669]" : "text-muted"}>
                    {item.ok ? "✓" : "○"} {item.label}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-2">
              <button type="button" className={tab === "relaas" ? "btn btn-brand" : "btn"} onClick={() => setTab("relaas")}>
                Relaas
              </button>
              <button type="button" className={tab === "check" ? "btn btn-brand" : "btn"} onClick={() => setTab("check")}>
                7 W's-checklist
              </button>
            </div>
            <pre className="pv-document panel max-h-[28rem] overflow-auto whitespace-pre-wrap p-3 font-mono text-sm lg:max-h-[calc(100vh-16rem)]">{tekst}</pre>
            {tips.map((regel) => (
              <p key={regel} className="border border-[#F59E0B] bg-[#FEF3C7] p-3 text-sm text-[#92400E]">
                {regel}
              </p>
            ))}
            <PiiPanel text={relaas} akkoord={akkoord} onAkkoord={setAkkoord} />
            <div className="flex flex-wrap gap-2">
              <CopyButton text={tab === "relaas" ? relaas : check} label="Kopieer relaas" disabled={blokkade} />
              <button
                type="button"
                className="btn"
                disabled={blokkade}
                onClick={() => {
                  void saveSjabloon(`${form.feit?.code ?? "PV"} ${form.datum}`, relaas).then((fout) => {
                    setMelding(fout ?? "Concept staat in de kluis.");
                  });
                }}
              >
                Bewaar in kluis
              </button>
              <button type="button" className="btn" onClick={() => window.print()}>
                Print / PDF
              </button>
            </div>
            {melding ? <p className="text-sm">{melding}</p> : null}
          </div>
        </aside>
      </div>
    </div>
  );
}

function WBlok({ titel, tekst, children }: { titel: string; tekst: string; children: ReactNode }) {
  return (
    <fieldset className="panel grid gap-3 p-3">
      <legend className="px-1 text-xs font-semibold tracking-wide">{titel}</legend>
      <p className="text-sm text-muted">{tekst}</p>
      {children}
    </fieldset>
  );
}
