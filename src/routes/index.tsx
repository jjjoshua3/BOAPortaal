import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { DOMEIN_INFO, ROLLEN, type DomeinFilter, type Rol } from "@/lib/boa/meta";
import { usePrefs } from "@/lib/boa/prefs";

export const Route = createFileRoute("/")({
  component: Home,
});

const ONDERDELEN = [
  { to: "/zakkaart" as const, titel: "Zakkaart", tekst: "Cautie, ID-vordering en aanhouding. Kort, voor op straat." },
  { to: "/feitcodes" as const, titel: "Feitcodes", tekst: "Zoek op code, artikel of situatie. Met het tarief erbij." },
  { to: "/beslisbomen" as const, titel: "Beslisbomen", tekst: "Stap voor stap. Van sfeerovergang tot HALT en OV." },
  { to: "/pv" as const, titel: "PV-bouwer", tekst: "De zeven W's, klaar om over te nemen in je bronsysteem." },
  { to: "/dienst" as const, titel: "Werkbank", tekst: "Combibon, kenteken, tarieven van je dienst." },
  { to: "/community" as const, titel: "Community", tekst: "Vragen stellen, tips delen, antwoorden geven." },
];

function Home() {
  const navigate = useNavigate();
  const rol = usePrefs((state) => state.rol);
  const domein = usePrefs((state) => state.domein);
  const setRol = usePrefs((state) => state.setRol);
  const setDomein = usePrefs((state) => state.setDomein);
  const [open, setOpen] = useState<string | null>("wat");

  function start() {
    const naar = rol === "boa" ? "/zakkaart" : "/trainer";
    void navigate({ to: naar });
  }

  return (
    <div>
      <section className="bg-brand text-on-brand">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-16 text-center sm:py-20">
          <img src="/favicon-512.png" alt="BOA Portaal" className="size-28 sm:size-36" />
          <p className="mt-6 font-mono text-xs tracking-widest text-silver">BOA PORTAAL</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Welkom</h1>
          <p className="mt-4 max-w-xl text-base text-silver sm:text-lg">
            Het naslag- en praktijkplatform voor buitengewoon opsporingsambtenaren, studenten en docenten. Gratis. Onafhankelijk.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#start" className="btn bg-white text-brand">
              Begin hier
            </a>
            <a href="#rondkijken" className="btn border-white/30 bg-transparent text-on-brand">
              Kijk even rond
            </a>
          </div>
          <a href="#wat" className="mt-10 text-xs text-silver underline-offset-4 hover:underline">
            Scroll voor de uitleg
          </a>
        </div>
      </section>

      <section id="wat" className="mx-auto w-full max-w-3xl px-4 py-14">
        <h2 className="text-2xl font-semibold">Wat is dit?</h2>
        <p className="mt-3 text-muted">
          BOA Portaal is een plek om snel iets na te kijken, een werkwijze te oefenen of een concept klaar te zetten. Geen abonnement. Geen account nodig voor de open naslag.
        </p>
        <ul className="mt-6 grid gap-3">
          {[
            { id: "wat", titel: "Voor wie?", tekst: "Boa's op straat, studenten HTV of BOA-basis, en vakdocenten. Ieder ziet de onderdelen die bij die rol passen." },
            { id: "open", titel: "Wat is open?", tekst: "Feitcodes, zakkaart, beslisbomen, vakjargon en de trainer. Direct te gebruiken, zonder inloggen." },
            { id: "dicht", titel: "Wat zit achter een account?", tekst: "Werkbank, combibon, kenteken, community en de kluis. Alleen met een organisatie-, overheids-, vervoers- of schooldomein." },
          ].map((blok) => (
            <li key={blok.id} className="panel">
              <button type="button" className="flex w-full items-center justify-between p-4 text-left" onClick={() => setOpen(open === blok.id ? null : blok.id)}>
                <span className="font-semibold">{blok.titel}</span>
                <span className="text-muted">{open === blok.id ? "–" : "+"}</span>
              </button>
              {open === blok.id ? <p className="px-4 pb-4 text-sm text-muted">{blok.tekst}</p> : null}
            </li>
          ))}
        </ul>
      </section>

      <section id="rondkijken" className="border-y border-line bg-panel">
        <div className="mx-auto w-full max-w-5xl px-4 py-14">
          <h2 className="text-2xl font-semibold">Kijk even rond</h2>
          <p className="mt-2 max-w-2xl text-muted">Zes onderdelen. Open er een, of ga door naar je eigen start.</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ONDERDELEN.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="panel block h-full p-4 transition-colors hover:bg-inset">
                  <h3 className="font-semibold">{item.titel}</h3>
                  <p className="mt-1 text-sm text-muted">{item.tekst}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-14">
        <h2 className="text-2xl font-semibold">Zes domeinen</h2>
        <p className="mt-2 max-w-2xl text-muted">Kies er een. De filter bovenin volgt mee.</p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DOMEIN_INFO.filter((item) => item.id !== "algemeen").map((item) => {
            const actief = domein === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`panel h-full w-full p-4 text-left ${actief ? "border-brand bg-inset" : ""}`}
                  onClick={() => setDomein(item.id as DomeinFilter)}
                >
                  <p className="font-mono text-xs text-muted">DOMEIN {item.id}</p>
                  <h3 className="mt-1 font-semibold">{item.label.split("|")[1]?.trim() ?? item.label}</h3>
                  <p className="mt-1 text-sm text-muted">{item.kort}</p>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section id="start" className="border-t border-line bg-inset">
        <div className="mx-auto w-full max-w-3xl px-4 py-16">
          <h2 className="text-2xl font-semibold">Start je configuratie</h2>
          <p className="mt-2 text-muted">Kies wie je bent en je domein. Daarna opent de pagina die daarbij past.</p>

          <fieldset className="mt-6 grid gap-2">
            <legend className="text-sm font-semibold">Ik ben</legend>
            {ROLLEN.map((item) => (
              <label key={item.id} className={`panel flex cursor-pointer items-start gap-3 p-3 ${rol === item.id ? "border-brand bg-panel" : "bg-panel"}`}>
                <input type="radio" name="rol" checked={rol === item.id} onChange={() => setRol(item.id as Rol)} className="mt-1" />
                <span>
                  <span className="font-semibold">{item.label}</span>
                  <span className="mt-0.5 block text-sm text-muted">{item.kort}</span>
                </span>
              </label>
            ))}
          </fieldset>

          <label className="field mt-5">
            Domein
            <select value={domein} onChange={(event) => setDomein(event.target.value as DomeinFilter)}>
              <option value="alle">Alle domeinen</option>
              {DOMEIN_INFO.filter((item) => item.id !== "algemeen").map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className="btn btn-brand" onClick={start}>
              Start nu
            </button>
            <Link to="/feitcodes" className="btn">
              Of zoek meteen een feitcode
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
