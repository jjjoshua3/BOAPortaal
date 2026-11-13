import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import {
  Accessibility,
  Bike,
  BookOpen,
  Calculator,
  Car,
  ClipboardList,
  Clock,
  Eye,
  ListChecks,
  MessageSquare,
  NotebookPen,
  ParkingCircle,
  Receipt,
  Scale,
  Search,
  Shield,
  UserRound,
  Users,
  Wine,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CombiChecklist, DienstKlad, LeeftijdReken, ParkeerTimer } from "@/components/straat-tools";
import { CombibonBlad } from "@/components/combibon-blad";
import { FeedbackKnop } from "@/components/feedback";
import { PageHead } from "@/components/bits";
import { controleerBronnen, type BronUitslag } from "@/lib/boa/bron.functions";
import { FEITEN } from "@/lib/boa/feitcodes";
import { DOMEIN_INFO, pastFilter } from "@/lib/boa/meta";
import { usePrefs } from "@/lib/boa/prefs";
import { lijstOverleg, plaatsOverleg, verwijderOverleg, type OverlegBericht } from "@/lib/boa/overleg.functions";
import { zoekKenteken, type VoertuigKaart } from "@/lib/boa/rdw.functions";
import { laadVermisten, type VermistPersoon } from "@/lib/boa/vermist.functions";
import { useKluis } from "@/lib/kluis/provider";
import { useBoaAuth } from "@/lib/supabase/auth";
import { seo } from "@/lib/seo";
import { sessieToken } from "@/lib/supabase/client";

type Werk =
  | "timer"
  | "leeftijd"
  | "checklist"
  | "klad"
  | "taken"
  | "naheffing"
  | "recht"
  | "combi"
  | "waar"
  | "persoon"
  | "gpk"
  | "voertuig"
  | "alcohol"
  | "notities"
  | "fiets"
  | "aanhouding"
  | "vermist"
  | "delen"
  | "tarief"
  | "overleg"
  | "wetten";

const STRAAT = new Set<Werk>(["timer", "leeftijd", "checklist", "klad"]);

const MODULES: { id: Werk; titel: string; regel: string; icoon: LucideIcon }[] = [
  { id: "timer", titel: "Parkeertimer", regel: "Kenteken, ventielstand, eerste waarneming", icoon: Clock },
  { id: "leeftijd", titel: "Leeftijd", regel: "Regime op de pleegdatum", icoon: Calculator },
  { id: "checklist", titel: "Combibon-check", regel: "Verplichte velden afvinken", icoon: ListChecks },
  { id: "klad", titel: "Kladblok", regel: "Tijdstempels, wissen na de dienst", icoon: NotebookPen },
  { id: "taken", titel: "Taken", regel: "Dienstlijst van je eigen domein", icoon: ClipboardList },
  { id: "naheffing", titel: "Naheffing", regel: "Fiscale parkeerbelasting, geen Wahv", icoon: Receipt },
  { id: "recht", titel: "Parkeerrecht", regel: "Wat je wel en niet kunt nagaan", icoon: ParkingCircle },
  { id: "combi", titel: "Combibon", regel: "Concept invullen en als PDF bewaren", icoon: Receipt },
  { id: "waar", titel: "Waarneming", regel: "Alleen wat je zag", icoon: Eye },
  { id: "persoon", titel: "Persoon", regel: "Wat je mag vragen, geen bevolkingsregister", icoon: UserRound },
  { id: "gpk", titel: "GPK", regel: "Gehandicaptenparkeerkaart, stap voor stap", icoon: Accessibility },
  { id: "voertuig", titel: "Voertuig", regel: "Open data van de RDW, geen houder", icoon: Car },
  { id: "alcohol", titel: "Alcoholwet", regel: "Artikel 45, 45a en 20", icoon: Wine },
  { id: "notities", titel: "Meldingen", regel: "Dienstnotitie, geen meldkamer", icoon: MessageSquare },
  { id: "fiets", titel: "Fietscontrole", regel: "Licht, telefoon, geen kentekenbon", icoon: Bike },
  { id: "aanhouding", titel: "Aanhouding", regel: "Heterdaad en overdracht", icoon: Shield },
  { id: "vermist", titel: "Vermist", regel: "Alleen korter dan drie weken", icoon: Search },
  { id: "delen", titel: "Delen", regel: "Politie, jongerenwerk, zorg", icoon: Users },
  { id: "tarief", titel: "Tarieven", regel: "Feitenboekje, NS, jouw werkgever", icoon: Scale },
  { id: "overleg", titel: "Community", regel: "Vragen, tips en antwoorden", icoon: MessageSquare },
  { id: "wetten", titel: "Wetteksten", regel: "Controle tegen wetten.overheid.nl", icoon: BookOpen },
];

const GELDIG = new Set(MODULES.map((item) => item.id));

export const Route = createFileRoute("/dienst")({
  head: () =>
    seo(
      "/dienst",
      "BOA Werkbank: Combibon-check, Waarnemingstimer & Leeftijdcalculator | BOA Portaal",
      "Praktische dienst-tools voor op straat: jeugdtarief- en leeftijdcheck (12-15 jaar), parkeer-waarnemingstimer en combibon-ondersteuning.",
    ),
  validateSearch: (search: Record<string, unknown>): { werk?: Werk } => {
    if (typeof search.werk === "string" && GELDIG.has(search.werk as Werk)) return { werk: search.werk as Werk };
    return {};
  },
  component: DienstPage,
});

function DienstPage() {
  const { user, ready } = useBoaAuth();
  const werk = Route.useSearch().werk;
  const navigate = Route.useNavigate();
  const module = MODULES.find((item) => item.id === werk);
  const straat = Boolean(werk && STRAAT.has(werk));
  const straatModules = MODULES.filter((item) => STRAAT.has(item.id));
  const dienstModules = MODULES.filter((item) => !STRAAT.has(item.id));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5">
      <PageHead
        kicker="WERKBANK"
        title={module ? module.titel : "Werkbank"}
        lede={module ? module.regel : "Timer, leeftijd, checklist en kladblok blijven op dit apparaat. Combibon, kenteken en het bord vragen een zakelijk account."}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {werk ? (
          <button type="button" className="btn" onClick={() => void navigate({ search: {}, replace: true })}>
            Alle onderdelen
          </button>
        ) : null}
        <button type="button" className="btn btn-brand" onClick={() => void navigate({ search: { werk: "combi" } })}>
          Combibon invullen
        </button>
      </div>
      {werk ? null : (
        <>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Op straat</h2>
          <ModuleGrid items={straatModules} onKies={(id) => void navigate({ search: { werk: id } })} />
          <h2 className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-muted">Dienst, ook de combibon</h2>
          <ModuleGrid items={dienstModules} onKies={(id) => void navigate({ search: { werk: id } })} />
          {ready && !user ? (
            <p className="mt-3 text-sm text-muted">Combibon, kenteken en tarieven openen na inloggen.</p>
          ) : null}
        </>
      )}
      {werk === "timer" ? <ParkeerTimer /> : null}
      {werk === "leeftijd" ? <LeeftijdReken /> : null}
      {werk === "checklist" ? <CombiChecklist /> : null}
      {werk === "klad" ? <DienstKlad /> : null}
      {werk && !straat && !ready ? <p className="text-sm text-muted">Account laden.</p> : null}
      {werk && !straat && ready && !user ? (
        <div className="panel p-4">
          <p className="text-sm">Voor dit onderdeel dient u ingelogd te zijn.</p>
          <Link to="/account" className="btn btn-brand mt-3">
            Aanmelden
          </Link>
        </div>
      ) : null}
      {user && werk === "taken" ? <Taken /> : null}
      {user && werk === "naheffing" ? <Naheffing /> : null}
      {user && werk === "recht" ? <Parkeerrecht /> : null}
      {user && werk === "combi" ? <CombibonBlad /> : null}
      {user && werk === "waar" ? <Waarneming /> : null}
      {user && werk === "persoon" ? <Persoon /> : null}
      {user && werk === "gpk" ? <Gpk /> : null}
      {user && werk === "voertuig" ? <Voertuig /> : null}
      {user && werk === "alcohol" ? <Alcohol /> : null}
      {user && werk === "notities" ? <Notities /> : null}
      {user && werk === "fiets" ? <Fiets /> : null}
      {user && werk === "aanhouding" ? <Aanhouding /> : null}
      {user && werk === "vermist" ? <Vermist /> : null}
      {user && werk === "delen" ? <Delen /> : null}
      {user && werk === "tarief" ? <Tarieven /> : null}
      {user && werk === "overleg" ? <Overleg /> : null}
      {user && werk === "wetten" ? <Wetten /> : null}
    </div>
  );
}

function ModuleGrid({ items, onKies }: { items: typeof MODULES; onKies: (id: Werk) => void }) {
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => {
        const Icoon = item.icoon;
        return (
          <li key={item.id}>
            <button type="button" className="panel flex h-full w-full flex-col items-start gap-2 p-3 text-left" onClick={() => onKies(item.id)}>
              <span className="grid size-10 place-items-center rounded-md bg-slate-100 text-[#1D4ED8]">
                <Icoon className="size-5" aria-hidden="true" />
              </span>
              <span className="font-semibold">{item.titel}</span>
              <span className="text-sm leading-relaxed text-muted">{item.regel}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function Vak({ titel, kinderen, plek }: { titel: string; kinderen: string; plek: string }) {
  const { saveNote } = useKluis();
  const [tekst, setTekst] = useState("");
  const [melding, setMelding] = useState("");
  return (
    <section className="mt-4 grid gap-3">
      <p className="text-sm">{kinderen}</p>
      <label className="field">
        {titel}
        <textarea value={tekst} onChange={(event) => setTekst(event.target.value)} rows={5} />
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-brand"
          onClick={() => {
            void saveNote({ titel: `${titel} | ${new Date().toISOString().slice(0, 10)}`, body: tekst, zachtAkkoord: false }).then((fout) => {
              setMelding(fout ?? "Versleuteld opgeslagen in de kluis.");
              if (!fout) setTekst("");
            });
          }}
        >
          Versleuteld opslaan
        </button>
        <FeedbackKnop plek={plek} onderwerp={titel} />
      </div>
      {melding ? <p className="text-sm">{melding}</p> : null}
    </section>
  );
}

function Taken() {
  const domein = usePrefs((state) => state.domein);
  const regels =
    domein === "II"
      ? ["Akte erbij: natuur, dier, vuurwerk of visserij.", "Niets demonteren.", "Buiten de akte: melden, niet verbaliseren."]
      : domein === "III"
        ? ["Soort verzuim vaststellen: absoluut, relatief of luxe.", "Artikel 21 is vervallen. De meldnorm is artikel 21a.", "Geen leerlingdossier in dit portaal."]
        : domein === "IV"
          ? ["Eerst vervoerbewijs en de administratieve betaling.", "Aanwijzing vóór verwijdering.", "Onder de 14 geen D 517."]
          : domein === "V"
            ? ["Doel en hoedanigheid vóór de drempel.", "Geen voet tussen de deur.", "Opzetvraag pas na de cautie."]
            : domein === "VI"
              ? ["Staat het feit in de akte?", "K 055 is een overtreding, geen misdrijf.", "Artikel 5 is bijna altijd politie."]
              : ["Parkeerfeit op kenteken is Wahv, geen staandehouding.", "Alcohol: leeftijd bepaalt E 211 of F 121.", "APV-artikel van deze gemeente opzoeken voor je een bedrag noemt."];
  return (
    <Vak
      titel="TAKEN"
      plek="/dienst?werk=taken"
      kinderen={regels.join(" ")}
    />
  );
}

function Naheffing() {
  return (
    <section className="mt-4 grid gap-3 text-sm">
      <p className="panel p-3">
        Een naheffingsaanslag parkeerbelasting is een fiscale aanslag van de gemeente. Het bedrag en de kosten staan in de belastingverordening van díe gemeente. Dit is niet het tarief uit het Feitenboekje en niet de € 9 van het CJIB.
      </p>
      <p className="panel p-3">
        De Wahv-beschikking, bijvoorbeeld voor een bord, is een andere grondslag. Een combibon legt ze naast elkaar. Schrijf in het bronsysteem niet één bedrag alsof het één feit is.
      </p>
      <FeedbackKnop plek="/dienst?werk=naheffing" onderwerp="Naheffing" />
    </section>
  );
}

function Parkeerrecht() {
  return (
    <section className="mt-4 grid gap-3 text-sm">
      <p className="panel p-3">
        Of er parkeerrecht is gekocht, staat in het systeem van de gemeente of de exploitant. Die registratie zit niet in de open data van de RDW. Dit scherm vraagt die registratie dus niet op.
      </p>
      <ul className="panel grid gap-2 p-3">
        <li>Controleer bord, tijd, plaats en kenteken ter plaatse.</li>
        <li>Een kenteken zonder zichtbaar recht is nog geen feit tot je de registratie in je eigen systeem hebt gezien.</li>
        <li>Een gehandicaptenparkeerkaart kijk je fysiek na. Er is hier geen landelijk GPK-register.</li>
      </ul>
      <FeedbackKnop plek="/dienst?werk=recht" onderwerp="Parkeerrecht" />
    </section>
  );
}

function Waarneming() {
  return (
    <Vak
      titel="WAARNEMING"
      plek="/dienst?werk=waar"
      kinderen="Schrijf wat je zag, hoorde of mat. Geen motief, geen bijnaam, geen 'de gebruikelijke verdachte'. Een waarom-vraag over het feit hoort niet in deze notitie zonder cautie."
    />
  );
}

function Persoon() {
  return (
    <section className="mt-4 grid gap-3 text-sm">
      <ol className="panel grid gap-2 p-3">
        <li>1. Legitimatie en hoedanigheid, hardop.</li>
        <li>2. Personalia vragen bij een strafbaar feit is artikel 52 Sv. Dat is nog geen verhoor.</li>
        <li>3. Toonplicht vanaf 14 jaar. Er is geen draagplicht. Onder de 14 geen D 517.</li>
        <li>4. Een onjuiste naam is artikel 435 onder 4 Sr, code D 515, niet D 505 en niet D 517.</li>
        <li>5. Dit scherm zoekt niemand op. Er is geen bestand van inwoners.</li>
      </ol>
      <FeedbackKnop plek="/dienst?werk=persoon" onderwerp="Persoon" />
    </section>
  );
}

function Gpk() {
  return (
    <section className="mt-4 grid gap-3 text-sm">
      <ul className="panel grid gap-2 p-3">
        <li>De kaart hoort bij de persoon, niet bij de auto. De houder moet zelf gebruiken of meerijden, volgens de regeling van die kaart.</li>
        <li>Kijk naar foto, geldigheid, gebied en of de kaart bij deze persoon hoort. Een foto op een telefoon is geen kaart.</li>
        <li>Een landelijk register zit niet in de open data. Twijfel je, dan is de uitgever van de kaart de bron, niet een gok.</li>
        <li>Geen naam of kaartnummer in dit portaal.</li>
      </ul>
      <FeedbackKnop plek="/dienst?werk=gpk" onderwerp="GPK" />
    </section>
  );
}

function Voertuig() {
  const [kenteken, setKenteken] = useState("");
  const [kaart, setKaart] = useState<VoertuigKaart | null>(null);
  const [fout, setFout] = useState("");
  const [bezig, setBezig] = useState(false);

  async function zoek(event: FormEvent) {
    event.preventDefault();
    setBezig(true);
    setFout("");
    setKaart(null);
    try {
      const resultaat = await zoekKenteken({ data: { kenteken } });
      if (!resultaat) setFout("Geen voertuig op dit kenteken in de open data.");
      setKaart(resultaat);
    } catch {
      setFout("De RDW-open data is nu niet bereikbaar, of het kenteken is te kort.");
    } finally {
      setBezig(false);
    }
  }

  const velden = kaart
    ? [
        ["Kenteken", kaart.kenteken],
        ["Soort", kaart.soort],
        ["Merk", kaart.merk],
        ["Handelsbenaming", kaart.handelsbenaming],
        ["Kleur", kaart.kleur],
        ["Inrichting", kaart.inrichting],
        ["Zitplaatsen", kaart.zitplaatsen],
        ["Brandstof", kaart.brandstof],
        ["APK tot", kaart.apk],
        ["Eerste toelating", kaart.toelating],
        ["Massa", kaart.massa],
      ].filter(([, waarde]) => waarde)
    : [];

  return (
    <section className="mt-4 grid gap-3">
      <p className="text-sm">Kenteken uit de open data van de RDW. Geen naam of adres van de houder.</p>
      <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(event) => void zoek(event)}>
        <label className="field flex-1">
          Kenteken
          <input value={kenteken} onChange={(event) => setKenteken(event.target.value.toUpperCase())} placeholder="AB123C" className="font-mono tracking-wide" />
        </label>
        <button className="btn btn-brand sm:self-end" type="submit" disabled={bezig}>
          {bezig ? "Opvragen" : "Opvragen"}
        </button>
      </form>
      {fout ? <p className="text-sm">{fout}</p> : null}
      {kaart ? (
        <div className="panel p-3">
          {kaart.apkStatus === "verlopen" ? (
            <p className="mb-3 border border-stop bg-stop/10 p-3 text-base font-bold text-stop">APK VERLOPEN | {kaart.apk || "geen datum"}</p>
          ) : null}
          {kaart.wam === "nee" ? (
            <p className="mb-3 border border-stop bg-stop/10 p-3 text-base font-bold text-stop">GEEN WAM | niet verzekerd volgens de open data</p>
          ) : null}
          <p className={`text-sm font-semibold ${kaart.apkStatus === "verlopen" ? "text-stop" : ""}`}>
            APK: {kaart.apkStatus === "geldig" ? `geldig tot ${kaart.apk}` : kaart.apkStatus === "verlopen" ? `verlopen sinds ${kaart.apk}` : "geen datum in de open data"}
          </p>
          <p className={`mt-1 text-sm font-semibold ${kaart.wam === "nee" ? "text-stop" : ""}`}>
            WAM: {kaart.wam === "ja" ? "verzekerd" : kaart.wam === "nee" ? "niet verzekerd" : "niet in de open data"}
          </p>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2">
            {velden.map(([label, waarde]) => (
              <div key={label} className="border-b border-line pb-2">
                <dt className="text-xs font-semibold text-muted">{label}</dt>
                <dd className="text-sm">{waarde}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-3">
            <FeedbackKnop plek="/dienst?werk=voertuig" onderwerp={`Kenteken ${kaart.kenteken}`} />
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Alcohol() {
  return (
    <section className="mt-4 grid gap-3 text-sm">
      <p>De Drank- en Horecawet heet nu Alcoholwet. Gebruik de geldende artikelen.</p>
      <ul className="grid gap-2">
        <li className="panel p-3">Onder de 18, drank aanwezig op een publieke plaats: artikel 45 lid 1, feitcode E 211, € 110. Niet F 121.</li>
        <li className="panel p-3">18 of ouder, gebruiken of een aangebroken verpakking in een aangewezen gebied: F 121 a of F 121 b, € 110. Een gesloten fles is vaak geen F 121 b.</li>
        <li className="panel p-3">Bedrijf schenkt of verkoopt zonder leeftijd vast te stellen: artikel 20 lid 1, in de regel een bestuurlijke boete. Geen testaankoop zonder opdracht.</li>
        <li className="panel p-3">Een volwassene geeft op straat drank door: artikel 45a, feitcode E 209, geen vast tarief in het Feitenboekje 2026.</li>
      </ul>
      <FeedbackKnop plek="/dienst?werk=alcohol" onderwerp="Alcoholwet" />
    </section>
  );
}

function Notities() {
  return (
    <Vak
      titel="MELDING"
      plek="/dienst?werk=notities"
      kinderen="Korte notitie van je dienst. Versleuteld in de kluis."
    />
  );
}

function Fiets() {
  return (
    <section className="mt-4 grid gap-3 text-sm">
      <ul className="panel grid gap-2 p-3">
        <li>Telefoon vasthouden tijdens het fietsen is R 545, het tarief van de fietscategorie. Niet het autobedrag van € 440.</li>
        <li>Verlichting staat in de RVV. Zoek de feitcode op voordat je een bedrag noemt.</li>
        <li>Een gewone fiets heeft geen kentekenbon. Geen combibon op een frame zonder kenteken.</li>
        <li>Geen cautie voor een Mulderbeschikking op zich. Wel als je daarna vraagt waarom iemand het deed.</li>
      </ul>
      <FeedbackKnop plek="/dienst?werk=fiets" onderwerp="Fietscontrole" />
    </section>
  );
}

function Aanhouding() {
  return (
    <section className="mt-4 grid gap-3 text-sm">
      <ol className="panel grid gap-2 p-3">
        <li>Heterdaad, of een andere titel die jouw akte echt geeft. In de praktijk is buiten heterdaad de uitzondering.</li>
        <li>Zeg het feit. De aanhoudingsmededeling is nog geen verhoor.</li>
        <li>Cautie vóór de eerste vraag naar betrokkenheid.</li>
        <li>Handboeien alleen bij vluchtgevaar of direct gevaar, met de reden in het PV.</li>
        <li>Onverwijld overdragen aan de politie. Niet nabespreken op het eigen kantoor.</li>
      </ol>
      <Link to="/beslisbomen" search={{ boom: "geweld" }} className="btn w-fit">
        Boom geweld en handboeien
      </Link>
      <FeedbackKnop plek="/dienst?werk=aanhouding" onderwerp="Aanhouding" />
    </section>
  );
}

function Vermist() {
  const [personen, setPersonen] = useState<VermistPersoon[] | null>(null);
  const [fout, setFout] = useState("");
  const [totaal, setTotaal] = useState(0);

  useEffect(() => {
    let stop = false;
    void laadVermisten().then((antwoord) => {
      if (stop) return;
      setPersonen(antwoord.personen);
      setTotaal(antwoord.totaalBron);
      setFout(antwoord.fout ?? "");
    });
    return () => {
      stop = true;
    };
  }, []);

  return (
    <section className="mt-4 grid gap-3">
      <p className="text-sm">
        Alleen personen die volgens de politie niet langer dan 21 dagen vermist zijn, met een foto op politie.nl. De rest staat op de eigen pagina van de politie. Dit portaal bewaart deze lijst niet.
      </p>
      <p className="text-sm">
        <a className="underline" href="https://www.politie.nl/vermist" target="_blank" rel="noreferrer">
          Alle vermiste personen bij de politie
        </a>
        {totaal ? <span> | {totaal} in de bron, {personen?.length ?? 0} binnen drie weken met foto</span> : null}
      </p>
      {fout ? <p className="text-sm">{fout}</p> : null}
      {personen === null ? <p className="text-sm text-muted">Lijst ophalen.</p> : null}
      {personen && personen.length === 0 && !fout ? <p className="text-sm">Op dit moment geen persoon binnen drie weken met een foto in de bron.</p> : null}
      <ul className="grid gap-3 sm:grid-cols-2">
        {(personen ?? []).map((persoon) => (
          <li key={persoon.id} className="panel p-3">
            <img src={persoon.foto} alt="" className="mb-2 h-40 w-full object-cover" />
            <h3 className="font-semibold">{persoon.naam}</h3>
            <p className="text-sm text-muted">
              {persoon.plaats} | sinds {persoon.sinds} | {persoon.soort}
            </p>
            <p className="mt-2 text-sm">{persoon.tekst}</p>
            <p className="mt-2 text-sm">
              <a className="underline" href={persoon.zaak} target="_blank" rel="noreferrer">
                Zaak bij de politie
              </a>
              <span aria-hidden="true"> | </span>
              <a className="underline" href={persoon.tip} target="_blank" rel="noreferrer">
                Tip
              </a>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

const DELEN = [
  {
    titel: "Politie",
    wel: "Overdracht van een aangehouden verdachte: feit, tijd, cautie, geweld en letsel. Artikel 154 Sv.",
    niet: "Een uitkeringsdossier, een medisch gegeven of een lijst namen 'voor de zekerheid'.",
  },
  {
    titel: "Jongerenwerk",
    wel: "Een algemene melding van overlast zonder naam, of een naam alleen als een convenant én een wettelijke grondslag die uitwisseling dekken.",
    niet: "Een proces-verbaal, een BSN, een verklaring of een foto van een minderjarige in een app.",
  },
  {
    titel: "Zorg",
    wel: "Bij acuut gevaar de politie bellen. Vraag geen medisch dossier op.",
    niet: "Gezondheidsgegevens. Artikel 9 AVG. Een goed doel is geen grondslag.",
  },
  {
    titel: "School",
    wel: "Verzuimgegevens die de Leerplichtwet tussen school en leerplicht noemt.",
    niet: "Een strafdossier naar een mentor zodat die 'het even weet'.",
  },
  {
    titel: "Collega",
    wel: "Wat de dienst nodig heeft, in het bronsysteem.",
    niet: "Een zaak in een privé-app, ook niet als die app versleuteld zegt te zijn.",
  },
];

function Delen() {
  return (
    <section className="mt-4 grid gap-3">
      <p className="text-sm">
        Opsporing deel je voor de strafrechtelijke taak, via PV en overdracht. Bestuursrecht valt onder de AVG: doelbinding, minimale gegevens, een grondslag. Dit is de lijn. Het convenant van jouw gemeente kan nauwer zijn, niet ruimer dan de wet.
      </p>
      {DELEN.map((rij) => (
        <article key={rij.titel} className="panel p-3 text-sm">
          <h3 className="font-semibold">{rij.titel}</h3>
          <p className="mt-2">
            <span className="font-semibold">Wel | </span>
            {rij.wel}
          </p>
          <p className="mt-2">
            <span className="font-semibold">Niet | </span>
            {rij.niet}
          </p>
        </article>
      ))}
      <FeedbackKnop plek="/dienst?werk=delen" onderwerp="Gegevens delen" />
    </section>
  );
}

function Tarieven() {
  const domein = usePrefs((state) => state.domein);
  const feiten = FEITEN.filter((feit) => pastFilter(feit.domeinen, domein) && feit.tarief);
  const { saveNote } = useKluis();
  const [eigen, setEigen] = useState("");
  const [melding, setMelding] = useState("");
  return (
    <section className="mt-4 grid gap-4">
      <article className="panel p-3 text-sm">
        <h3 className="font-semibold">NS | vervoersvoorwaarden, geen feitcode</h3>
        <ul className="mt-2 grid gap-1">
          <li>Direct pinnen in de trein: ritprijs + € 50.</li>
          <li>Contant of uitstel van betaling: ritprijs + € 70.</li>
          <li>Niet binnen 14 dagen: + € 20 administratiekosten. Daarna kan + € 25 incassokosten volgen.</li>
        </ul>
        <a className="mt-2 inline-block underline" href="https://www.ns.nl/service-en-contact/betalen/uitstel-van-betaling" target="_blank" rel="noreferrer">
          Bron: NS, uitstel van betaling
        </a>
        <p className="mt-2 text-muted">E 100 a is € 110 alleen als er een proces-verbaal komt. Dat is een ander spoor dan het uitstel van betaling.</p>
      </article>
      <article className="panel p-3 text-sm">
        <h3 className="font-semibold">Arriva, Connexxion, GVB, HTM, RET, Qbuzz en andere vervoerders</h3>
        <p className="mt-2">
          Het bedrag staat in de vervoersvoorwaarden van die vervoerder. Dit portaal vult het niet in met het NS-bedrag. Zet het bedrag hieronder als je het uit die voorwaarden hebt gehaald, met de datum.
        </p>
      </article>
      <article className="panel p-3 text-sm">
        <h3 className="font-semibold">Jouw gemeente</h3>
        <p className="mt-2">Parkeerbelasting en APV-bedragen verschillen per gemeente. Geen landelijk bedrag. Noteer ze uit de verordening.</p>
        <label className="field mt-3">
          Eigen tariefkaart
          <textarea value={eigen} onChange={(event) => setEigen(event.target.value)} rows={4} placeholder="Werkgever of gemeente | feit | bedrag | bron | datum" />
        </label>
        <button
          type="button"
          className="btn btn-brand mt-2"
          onClick={() => {
            void saveNote({ titel: "TARIEVEN | eigen kaart", body: eigen, zachtAkkoord: false }).then((fout) => setMelding(fout ?? "Versleuteld opgeslagen."));
          }}
        >
          Versleuteld opslaan
        </button>
        {melding ? <p className="mt-2">{melding}</p> : null}
      </article>
      <div>
        <h3 className="font-semibold">Feitenboekje 1 januari 2026 | dit domein</h3>
        <ul className="mt-2 grid gap-2">
          {feiten.map((feit) => (
            <li key={feit.id} className="panel p-3 text-sm">
              <p className="code">{feit.code}</p>
              <p className="font-semibold">{feit.titel}</p>
              <p className="mt-1">{feit.tarief}</p>
            </li>
          ))}
        </ul>
      </div>
      <FeedbackKnop plek="/dienst?werk=tarief" onderwerp="Tarieven" />
    </section>
  );
}

function Overleg() {
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
      const bericht = error instanceof Error ? error.message : "Het bord is niet bereikbaar.";
      setFout(bericht);
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
        data: {
          token,
          soort,
          titel,
          tekst,
          domein: domein === "alle" ? "algemeen" : domein,
        },
      });
      setTitel("");
      setTekst("");
      await vernieuw();
    } catch (error) {
      const bericht = error instanceof Error ? error.message : "Plaatsen lukte niet.";
      setFout(bericht);
    } finally {
      setBezig(false);
    }
  }

  return (
    <section className="mt-4 grid gap-4">
      <p className="text-sm">Vragen, tips en antwoorden voor collega's.</p>
      <form className="panel grid gap-3 p-3" onSubmit={(event) => void plaats(event)}>
        <label className="field">
          Soort
          <select value={soort} onChange={(event) => setSoort(event.target.value as "overleg" | "correctie")}>
            <option value="overleg">Vraag of tip</option>
            <option value="correctie">Antwoord of correctie</option>
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
      <ul className="grid gap-3">
        {lijst.map((bericht) => (
          <li key={bericht.id} className="panel p-3">
            <p className="text-xs font-semibold text-muted">
              {bericht.soort === "correctie" ? "Antwoord" : "Vraag / tip"} | Domein {bericht.domein} | {bericht.weergave}
            </p>
            <h3 className="mt-1 font-semibold">{bericht.titel}</h3>
            <p className="mt-1 text-sm">{bericht.tekst}</p>
            <p className="mt-2 text-xs text-muted">{new Date(bericht.gemaakt).toLocaleString("nl-NL")}</p>
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
        {lijst.length === 0 && !fout ? <li className="text-sm text-muted">Nog geen berichten.</li> : null}
      </ul>
      <FeedbackKnop plek="/dienst?werk=overleg" onderwerp="Community" />
    </section>
  );
}

function Wetten() {
  const [uitslag, setUitslag] = useState<BronUitslag[] | null>(null);
  useEffect(() => {
    let stop = false;
    void controleerBronnen().then((rijen) => {
      if (!stop) setUitslag(rijen);
    });
    return () => {
      stop = true;
    };
  }, []);
  return (
    <section className="mt-4 grid gap-3 text-sm">
      <p>
        Elke week staat er een andere set van twintig vragen in de trainer. De antwoorden blijven de wettekst. Deze controle leest de officiële pagina en kijkt of de zin die dit portaal gebruikt er nog staat. Een tarief uit het Feitenboekje wijzigt niet vanzelf: dat boek heeft geen koppeling. Bij een afwijking lees je de wet na. De akte gaat voor.
      </p>
      {uitslag === null ? <p className="text-muted">Wetteksten nalopen.</p> : null}
      <ul className="grid gap-2">
        {(uitslag ?? []).map((bron) => (
          <li key={bron.id} className="panel p-3">
            <p className="font-semibold">{bron.label}</p>
            <p className="mt-1">
              {bron.status === "gevonden"
                ? "De verwachte zin staat op de officiële pagina."
                : bron.status === "niet-gevonden"
                  ? "De verwachte zin staat niet op de pagina die terugkwam. Lees de wet na voordat je deze regel gebruikt."
                  : "De pagina is nu niet bereikbaar. Geen conclusie over een wetswijziging."}
            </p>
            <p className="mt-1 text-muted">{bron.uitleg}</p>
            <a className="mt-1 inline-block underline" href={bron.url} target="_blank" rel="noreferrer">
              Officiële tekst
            </a>
          </li>
        ))}
      </ul>
      <FeedbackKnop plek="/dienst?werk=wetten" onderwerp="Wetteksten" />
    </section>
  );
}
