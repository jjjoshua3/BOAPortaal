import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { DOMEIN_INFO, type DomeinFilter, type Rol } from "@/lib/boa/meta";
import { usePrefs } from "@/lib/boa/prefs";
import { TELLEN, recenteUpdates } from "@/lib/boa/updates";

export const Route = createFileRoute("/")({
  component: Home,
});

const DOMEIN_KLEUR: Record<string, string> = {
  I: "#2563EB",
  II: "#15803D",
  III: "#0369A1",
  IV: "#B45309",
  V: "#4338CA",
  VI: "#334155",
};

const TAGS = [
  { label: "Cautie & ID", to: "/zakkaart" as const },
  { label: "Feitcodes", to: "/feitcodes" as const },
  { label: "7 W's PV", to: "/pv" as const },
  { label: "Sfeerovergang", to: "/beslisbomen" as const },
];

function Home() {
  const navigate = useNavigate();
  const rol = usePrefs((state) => state.rol);
  const domein = usePrefs((state) => state.domein);
  const setRol = usePrefs((state) => state.setRol);
  const setDomein = usePrefs((state) => state.setDomein);
  const [q, setQ] = useState("");
  const updates = recenteUpdates(4);

  function startAls(keuze: Rol) {
    setRol(keuze);
    const naar = keuze === "boa" ? "/zakkaart" : keuze === "student" ? "/trainer" : "/beslisbomen";
    void navigate({ to: naar });
  }

  return (
    <div>
      <section className="bg-[#0F172A] text-white">
        <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:py-20">
          <div className="flex flex-wrap gap-2 text-xs">
            {["100% Gratis", "Onafhankelijk", "Domein I t/m VI", "Wekelijks nieuwe data"].map((badge) => (
              <span key={badge} className="rounded-sm border border-white/20 px-2 py-1 text-slate-300">
                {badge}
              </span>
            ))}
          </div>
          <div className="mt-6 flex items-start gap-4">
            <img src="/boa-mark.png" alt="" className="hidden size-16 sm:block" />
            <div>
              <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">Hét praktijk- en naslagplatform voor BOA's, studenten en docenten.</h1>
              <p className="mt-4 max-w-2xl text-base text-slate-300">
                Eén plek voor feitcodes, cautie, beslisbomen en PV-bouwstenen. Op straat pak je het in seconden. In de opleiding oefen je het stap voor stap. Zonder abonnement.
              </p>
            </div>
          </div>
          <form
            className="mt-8"
            onSubmit={(event) => {
              event.preventDefault();
              void navigate({ to: "/feitcodes", search: q.trim() ? { q: q.trim() } : {} });
            }}
          >
            <label className="grid gap-2">
              <span className="sr-only">Zoeken</span>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={q}
                  onChange={(event) => setQ(event.target.value)}
                  placeholder="Zoek op feitcode, vakjargon, wet of onderwerp"
                  className="min-h-12 flex-1 border border-white/20 bg-white px-3 text-ink"
                />
                <button className="btn btn-brand min-h-12" type="submit">
                  Zoeken
                </button>
              </div>
            </label>
          </form>
          <div className="mt-3 flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <Link key={tag.label} to={tag.to} className="rounded-sm border border-white/20 px-2 py-1 text-xs text-slate-200">
                {tag.label}
              </Link>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#start" className="btn bg-white text-ink">
              Stel jouw weergave in
            </a>
            <a href="#inhoud" className="btn border-white/30 bg-transparent text-white">
              Ontdek wat erin zit
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-16">
        <h2 className="text-2xl font-semibold tracking-tight">Voor wie is BOA Portaal?</h2>
        <ul className="mt-6 grid gap-3 lg:grid-cols-3">
          {[
            { id: "boa" as const, titel: "BOA op straat", tekst: "Zakkaart, feitcodes met tarief, combibon en PV-bouwstenen tijdens de dienst." },
            { id: "student" as const, titel: "Student HTV / BOA-basis", tekst: "Trainer, beslisbomen en vakjargon. Oefenen tot de stof blijft hangen." },
            { id: "docent" as const, titel: "Vakdocent", tekst: "Casussen, bomen en naslag om direct in de les of begeleiding te gebruiken." },
          ].map((kaart) => (
            <li key={kaart.id} className={`panel p-4 ${rol === kaart.id ? "border-[#1D4ED8]" : ""}`}>
              <h3 className="font-semibold">{kaart.titel}</h3>
              <p className="mt-2 text-sm text-muted">{kaart.tekst}</p>
              <button type="button" className="btn mt-4" onClick={() => startAls(kaart.id)}>
                Start als {kaart.titel.split(" ")[0]}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section id="inhoud" className="border-y border-line bg-panel">
        <div className="mx-auto w-full max-w-5xl px-4 py-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Wat erin zit</h2>
              <p className="mt-1 text-sm text-muted">Filter op domein. De keuze volgt mee in de rest van het portaal.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={`btn ${domein === "alle" ? "btn-brand" : ""}`} onClick={() => setDomein("alle")}>
                Alle
              </button>
              {(["I", "II", "III", "IV", "V", "VI"] as const).map((id) => (
                <button key={id} type="button" className={`btn ${domein === id ? "btn-brand" : ""}`} onClick={() => setDomein(id)}>
                  <span className="mr-1 inline-block size-2 rounded-full" style={{ background: DOMEIN_KLEUR[id] }} />
                  {id}
                </button>
              ))}
            </div>
          </div>

          <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-muted">Op straat en in de dienst</h3>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            <Kaart titel="Zakkaart" label="Direct op straat" tekst="Cautie, ID-vordering en aanhouding." to="/zakkaart" pills={[{ t: "Cautie" }, { t: "ID" }, { t: "Aanhouding" }]} />
            <Kaart titel="Feitcodes" label="Zoek en tarieven" tekst="Code, artikel of situatie, met het bedrag uit het Feitenboekje." to="/feitcodes" />
            <Kaart titel="Werkbank" label="Dienst-tools" tekst="Combibon, kenteken en tarieven van je dienst." to="/dienst" />
            <Kaart titel="PV-bouwer" label="7 W's" tekst="Stap voor stap, klaar om over te nemen in het bronsysteem." to="/pv" />
          </ul>

          <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-muted">Kennis, oefenen en delen</h3>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            <Kaart titel="Beslisbomen" label="Stap voor stap" tekst="Sfeerovergang, HALT, OV en meer." to="/beslisbomen" />
            <Kaart titel="Trainer" label="Oefenmodule" tekst="Rechtskennis, bevoegdheden en casussen." to="/trainer" />
            <Kaart titel="Vakjargon" label="Verdieping" tekst="Abri, cautie, combibon. De woorden van de straat." to="/jargon" />
            <Kaart titel="Community" label="Collega's" tekst="Vragen, tips en antwoorden. Alleen met een account." to="/community" />
          </ul>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-16">
        <h2 className="text-2xl font-semibold tracking-tight">Elke week completer</h2>
        <ul className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            [TELLEN.feiten, "Feitcodes"],
            [TELLEN.jargon, "Begrippen"],
            [TELLEN.bomen, "Beslisbomen"],
            [TELLEN.kaarten, "Zakkaartjes"],
          ].map(([aantal, label]) => (
            <li key={String(label)} className="panel p-4">
              <p className="font-mono text-2xl font-semibold">{aantal}</p>
              <p className="mt-1 text-sm text-muted">{label}</p>
            </li>
          ))}
        </ul>
        <h3 className="mt-8 text-base font-semibold">Recent toegevoegd</h3>
        <ul className="mt-3 grid gap-3">
          {updates.map((item) => (
            <li key={item.id}>
              <Link to={item.naar} className="panel flex flex-wrap items-start justify-between gap-3 p-4">
                <span>
                  <span className="font-mono text-xs text-muted">{item.week}</span>
                  {item.nieuw ? <span className="ml-2 rounded-sm bg-[#D1FAE5] px-1.5 py-0.5 text-xs font-semibold text-[#059669]">Nieuw</span> : null}
                  <span className="mt-1 block font-semibold">{item.titel}</span>
                  <span className="mt-1 block text-sm text-muted">{item.tekst}</span>
                </span>
                <span className="text-sm text-muted">{item.domeinen[0] === "algemeen" ? "Alle domeinen" : `Domein ${item.domeinen[0]}`}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="start" className="border-t border-line bg-inset">
        <div className="mx-auto w-full max-w-3xl px-4 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">Stel jouw weergave in</h2>
          <p className="mt-2 text-muted">Rol en domein bepalen wat je als eerste ziet. Je kunt dit later altijd wijzigen via Weergave.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {(["boa", "student", "docent"] as const).map((keuze) => (
              <button key={keuze} type="button" className={`btn ${rol === keuze ? "btn-brand" : ""}`} onClick={() => setRol(keuze)}>
                {keuze === "boa" ? "BOA" : keuze === "student" ? "Student" : "Docent"}
              </button>
            ))}
          </div>
          <label className="field mt-4">
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
          <button type="button" className="btn btn-brand mt-5" onClick={() => startAls(rol)}>
            Start nu
          </button>
        </div>
      </section>
    </div>
  );
}

function Kaart({
  titel,
  label,
  tekst,
  to,
  pills,
}: {
  titel: string;
  label: string;
  tekst: string;
  to?: "/feitcodes" | "/dienst" | "/pv" | "/beslisbomen" | "/trainer" | "/jargon" | "/community" | "/zakkaart";
  pills?: { t: string }[];
}) {
  const body = (
    <>
      <p className="font-mono text-xs text-muted">{label}</p>
      <h3 className="mt-1 font-semibold">{titel}</h3>
      <p className="mt-1 text-sm text-muted">{tekst}</p>
      {pills ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {pills.map((pil) => (
            <span key={pil.t} className="rounded-sm bg-[#FEF3C7] px-2 py-0.5 text-xs font-semibold text-[#D97706]">
              {pil.t}
            </span>
          ))}
        </div>
      ) : null}
    </>
  );
  if (!to) return <li className="panel p-4">{body}</li>;
  return (
    <li>
      <Link to={to} className="panel block h-full p-4 hover:bg-inset">
        {body}
      </Link>
    </li>
  );
}
