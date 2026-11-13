import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { DOMEIN_INFO, type DomeinFilter, type DomeinId } from "@/lib/boa/meta";
import { usePrefs } from "@/lib/boa/prefs";

export const Route = createFileRoute("/")({
  component: Home,
});

const DEUREN = [
  { to: "/zakkaart" as const, titel: "Zakkaart", tekst: "Cautie, ID, aanhouding. Kort, voor op straat." },
  { to: "/feitcodes" as const, titel: "Feitcodes", tekst: "Zoek op code, artikel of situatie." },
  { to: "/dienst" as const, titel: "Werkbank", tekst: "Combibon, kenteken, tarieven." },
  { to: "/community" as const, titel: "Community", tekst: "Vragen en tips met collega's." },
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
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <header className="border-b border-line pb-6">
        <p className="font-mono text-xs tracking-wide text-muted">BOA PORTAAL</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Welkom</h1>
        <p className="mt-3 max-w-xl text-base text-muted">
          Naslag en praktijk voor boa's, studenten en docenten. Gratis. De open pagina's zijn meteen te gebruiken. Notities en eigen sjablonen staan achter een account.
        </p>
      </header>

      <form
        className="mt-6 flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          void navigate({ to: "/feitcodes", search: q.trim() ? { q: q.trim() } : {} });
        }}
      >
        <label className="field flex-1">
          Zoek
          <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="feitcode, artikel of situatie" />
        </label>
        <button className="btn btn-brand sm:self-end" type="submit">
          Zoek
        </button>
      </form>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {DEUREN.map((deur) => (
          <li key={deur.to}>
            <Link to={deur.to} className="panel block h-full p-4">
              <h2 className="font-semibold">{deur.titel}</h2>
              <p className="mt-1 text-sm text-muted">{deur.tekst}</p>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-10">
        <h2 className="text-base font-semibold">Kies je domein</h2>
        <p className="mt-1 text-sm text-muted">De filter bovenin volgt deze keuze.</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {DOMEIN_INFO.map((domein) => (
            <li key={domein.id}>
              <button type="button" className="btn" onClick={() => openDomein(domein.id)}>
                {domein.id === "algemeen" ? "Alle" : `Domein ${domein.id}`}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
