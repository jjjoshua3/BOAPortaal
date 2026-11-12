import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { DOMEIN_INFO, type DomeinFilter, type DomeinId } from "@/lib/boa/meta";
import { usePrefs } from "@/lib/boa/prefs";
import { PageHead } from "@/components/bits";

export const Route = createFileRoute("/")({
  component: Home,
});

const SNEL = [
  { href: "/zakkaart" as const, hash: "cautie", titel: "Cautie", tekst: "U bent niet tot antwoorden verplicht. Niet bij personalia." },
  { href: "/zakkaart" as const, hash: "id", titel: "ID-vordering", tekst: "Toonplicht vanaf 14 jaar. Geen draagplicht. Onder 14 geen D 517." },
];

const AFSPRAKEN = [
  "Personalia vragen is geen verhoor. Een waarom-vraag wel.",
  "Onder 12 jaar geen strafvervolging. De toonplicht van een ID begint bij 14. Een draagplicht is er niet.",
  "Een parkeerbon op kenteken is Wahv, geen staandehouding.",
  "Een aangehouden verdachte draag je onverwijld over aan de politie.",
  "Handboeien alleen bij vluchtgevaar of direct gevaar, met de reden in het PV.",
  "Geen BSN en geen namen van burgers in dit portaal.",
];

function Home() {
  const navigate = useNavigate();
  const setDomein = usePrefs((state) => state.setDomein);
  const [q, setQ] = useState("");

  function openDomein(id: DomeinId) {
    const filter: DomeinFilter = id === "algemeen" ? "alle" : id;
    setDomein(filter);
    void navigate({ to: "/feitcodes", search: {} });
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5">
      <PageHead
        kicker="NASLAG | DOMEIN I–VI"
        title="BOA Portaal"
        lede="Kennis en praktijk voor buitengewoon opsporingsambtenaren, studenten HTV of BOA-basis, en vakdocenten. Gratis, zonder abonnement. De open naslag is direct te gebruiken. Notities en eigen PV-sjablonen staan in een versleutelde kluis achter een zakelijk of schooladres."
      />
      <form
        className="panel flex flex-col gap-2 p-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          void navigate({ to: "/feitcodes", search: q.trim() ? { q: q.trim() } : {} });
        }}
      >
        <label className="field flex-1">
          Zoek op feitcode, artikel of situatie
          <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="bijvoorbeeld 447e, cautie, zwartrijden" />
        </label>
        <button className="btn btn-brand sm:self-end" type="submit">
          Zoek
        </button>
      </form>

      <section className="mt-4 grid gap-3 md:grid-cols-3">
        {SNEL.map((item) => (
          <Link key={item.titel} to="/zakkaart" hash={item.hash} className="panel accent-navy block p-3">
            <h2 className="font-semibold">{item.titel}</h2>
            <p className="mt-1 text-sm text-muted">{item.tekst}</p>
          </Link>
        ))}
        <Link to="/beslisbomen" search={{ boom: "sfeer" }} className="panel accent-navy block p-3">
          <h2 className="font-semibold">Sfeerovergang</h2>
          <p className="mt-1 text-sm text-muted">Waar de medewerkingsplicht stopt en de cautie begint.</p>
        </Link>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold">Domeinen</h2>
        <p className="mt-1 text-sm text-muted">De filter bovenin volgt deze keuze op de andere pagina's.</p>
        <ul className="mt-3 grid gap-3 md:grid-cols-2">
          {DOMEIN_INFO.map((domein) => (
            <li key={domein.id}>
              <button type="button" className="panel h-full w-full p-3 text-left" onClick={() => openDomein(domein.id)}>
                <p className="font-mono text-xs text-muted">{domein.id === "algemeen" ? "ALLE DOMEINEN" : `DOMEIN ${domein.id}`}</p>
                <h3 className="mt-1 font-semibold">{domein.label}</h3>
                <p className="mt-1 text-sm">{domein.kort}</p>
                <p className="mt-2 text-sm text-muted">{domein.tekst}</p>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="panel p-3">
          <h2 className="font-semibold">Afspraken die op straat schelen</h2>
          <ol className="mt-3 grid gap-2 text-sm">
            {AFSPRAKEN.map((regel, index) => (
              <li key={regel} className="grid grid-cols-[2rem_1fr] gap-2 border-b border-line pb-2 last:border-0">
                <span className="font-mono text-muted">{String(index + 1).padStart(2, "0")}</span>
                <span>{regel}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="panel accent-amber p-3">
          <h2 className="font-semibold">Geen officieel systeem</h2>
          <p className="mt-2 text-sm">
            Dit portaal is onafhankelijk. Het is geen publicatie van het Openbaar Ministerie, de politie, het CJIB of een gemeente. Feitcodes en bedragen volgen het Feitenboekje van 1 januari 2026, exclusief € 9 administratiekosten van het CJIB. Artikel 45 en artikel 45a van de Alcoholwet staan zo in de geldende tekst. Jouw akte van opsporing bepaalt wat je mag doen.
          </p>
          <p className="mt-2 text-sm">
            Controleer de wettekst op wetten.overheid.nl voordat je een PV in het bronsysteem zet.
          </p>
          <Link to="/colofon" className="btn mt-3">
            Colofon en bronnen
          </Link>
        </div>
      </section>
    </div>
  );
}
