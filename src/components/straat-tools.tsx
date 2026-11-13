import { useEffect, useMemo, useState } from "react";

const TIMER_KEY = "boa-parkeer-waarneming";
const KLAD_KEY = "boa-dienst-klad";

type Waarneming = { kenteken: string; ventiel: string; start: string };

function leesTimer(): Waarneming | null {
  try {
    const raw = localStorage.getItem(TIMER_KEY);
    if (!raw) return null;
    const waarde = JSON.parse(raw) as Waarneming;
    if (!waarde || typeof waarde.kenteken !== "string" || typeof waarde.start !== "string") return null;
    return waarde;
  } catch {
    return null;
  }
}

function plaatTekst(ruw: string): string {
  return ruw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
}

export function ParkeerTimer() {
  const [kenteken, setKenteken] = useState("");
  const [ventiel, setVentiel] = useState("12");
  const [lopend, setLopend] = useState<Waarneming | null>(null);
  const [nu, setNu] = useState(() => Date.now());

  useEffect(() => {
    setLopend(leesTimer());
    const id = window.setInterval(() => setNu(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const seconden = lopend ? Math.max(0, Math.floor((nu - new Date(lopend.start).getTime()) / 1000)) : 0;
  const minuten = Math.floor(seconden / 60);
  const rest = seconden % 60;
  const klok = `${String(minuten).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
  const grens = minuten >= 60 ? "60 minuten voorbij" : minuten >= 30 ? "30 minuten voorbij" : minuten >= 15 ? "15 minuten voorbij" : "Eerste waarneming loopt";

  function start() {
    const plaat = plaatTekst(kenteken);
    if (plaat.length < 4) return;
    const rij: Waarneming = { kenteken: plaat, ventiel, start: new Date().toISOString() };
    localStorage.setItem(TIMER_KEY, JSON.stringify(rij));
    setLopend(rij);
  }

  function wis() {
    localStorage.removeItem(TIMER_KEY);
    setLopend(null);
  }

  return (
    <section className="mt-2 grid gap-3">
      <p className="text-sm text-muted">Eerste waarneming voor blauwe zone of parkeerexces. Blijft op dit apparaat. Geen houder, geen RDW.</p>
      <label className="field max-w-xs">
        Kenteken
        <input value={kenteken} onChange={(event) => setKenteken(plaatTekst(event.target.value))} placeholder="AB123C" className="font-mono uppercase" />
      </label>
      <div className="w-fit border-2 border-ink bg-[#F5C518] px-4 py-2 font-mono text-2xl font-semibold tracking-[0.2em] text-ink">
        {plaatTekst(kenteken) || "····"}
      </div>
      <label className="field max-w-xs">
        Ventielstand
        <select value={ventiel} onChange={(event) => setVentiel(event.target.value)}>
          {["12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"].map((uur) => (
            <option key={uur} value={uur}>
              {uur} uur
            </option>
          ))}
        </select>
      </label>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-brand" onClick={start} disabled={plaatTekst(kenteken).length < 4}>
          Eerste waarneming nu
        </button>
        {lopend ? (
          <button type="button" className="btn" onClick={wis}>
            Wis waarneming
          </button>
        ) : null}
      </div>
      {lopend ? (
        <div className="panel p-3">
          <p className="font-mono text-xs text-muted">
            {lopend.kenteken} · ventiel {lopend.ventiel} · start {new Date(lopend.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
          </p>
          <p className="mt-2 font-mono text-3xl font-semibold">{klok}</p>
          <p className={`mt-2 text-sm font-semibold ${minuten >= 15 ? "text-[#B45309]" : "text-muted"}`}>{grens}</p>
          <p className="mt-2 text-sm">Tweede waarneming noteer je als de lokale wachttijd voorbij is. De akte en de APV bepalen die tijd, dit scherm niet.</p>
        </div>
      ) : null}
    </section>
  );
}

function leeftijdOp(geboorte: string, pleeg: string): number | null {
  if (!geboorte || !pleeg) return null;
  const geb = new Date(`${geboorte}T12:00:00`);
  const dag = new Date(`${pleeg}T12:00:00`);
  if (Number.isNaN(geb.getTime()) || Number.isNaN(dag.getTime()) || dag < geb) return null;
  let jaren = dag.getFullYear() - geb.getFullYear();
  const maand = dag.getMonth() - geb.getMonth();
  if (maand < 0 || (maand === 0 && dag.getDate() < geb.getDate())) jaren -= 1;
  return jaren;
}

export function LeeftijdReken() {
  const vandaag = new Date().toISOString().slice(0, 10);
  const [geboorte, setGeboorte] = useState("");
  const [pleeg, setPleeg] = useState(vandaag);
  const jaren = useMemo(() => leeftijdOp(geboorte, pleeg), [geboorte, pleeg]);

  let regime = "Vul een geboortedatum in.";
  let toon = "panel p-3 text-sm";
  if (jaren !== null && jaren < 12) {
    regime = "Onder 12 jaar. Geen strafrechtelijke vervolging (art. 486 Sv). Halt begint bij 12. Geen D 517.";
    toon = "border border-[#FDE68A] bg-[#FEF3C7] p-3 text-sm text-[#92400E]";
  } else if (jaren !== null && jaren <= 15) {
    regime = "12 t/m 15 jaar. Jeugdstrafrecht. Halt kan, met bekentenis en instemming van de jeugdige en, onder 16, van de ouder. Veel OM-tarieven zijn in het Feitenboekje gehalveerd. Toonplicht identiteitsbewijs vanaf 14 jaar, geen draagplicht.";
    toon = "border border-[#FDE68A] bg-[#FEF3C7] p-3 text-sm text-[#92400E]";
  } else if (jaren !== null && jaren <= 17) {
    regime = "16 of 17 jaar. Nog jeugdstrafrecht. Halt kan zonder ouderinstemming als de jeugdige 16 of 17 is en instemt. Bij de Wahv geldt in de regel het volledige tarief. Toonplicht geldt.";
    toon = "panel p-3 text-sm";
  } else if (jaren !== null) {
    regime = "18 jaar of ouder. Volwassenenrecht. Volledig tarief uit de boetebase, exclusief € 9 administratiekosten CJIB.";
    toon = "border border-[#A7F3D0] bg-[#D1FAE5] p-3 text-sm text-[#065F46]";
  }

  return (
    <section className="mt-2 grid gap-3">
      <p className="text-sm text-muted">Leeftijd op de pleegdatum. Geen naam, geen BSN. Het Feitenboekje en de akte gaan voor op deze regel.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="field">
          Geboortedatum
          <input type="date" value={geboorte} onChange={(event) => setGeboorte(event.target.value)} />
        </label>
        <label className="field">
          Pleegdatum
          <input type="date" value={pleeg} onChange={(event) => setPleeg(event.target.value)} />
        </label>
      </div>
      {jaren !== null ? <p className="font-mono text-2xl font-semibold">{jaren} jaar</p> : null}
      <p className={toon}>{regime}</p>
    </section>
  );
}

const CHECKS = [
  "Hoedanigheid en organisatie kenbaar gemaakt",
  "Plaats, datum en tijd van de waarneming",
  "Kenteken of betrokkene alleen als placeholder, geen echte naam",
  "Feitcode of artikel, en het tarief exclusief € 9 CJIB",
  "Eigen waarneming, geen aanname en geen BSN",
  "Bij verhoor: cautie vóór de eerste vraag naar het feit",
  "Bij jeugd: leeftijd en Halt-check gedaan",
  "Uitreiking, weigering of achterlating genoteerd",
];

export function CombiChecklist() {
  const [aan, setAan] = useState<boolean[]>(() => CHECKS.map(() => false));
  const klaar = aan.filter(Boolean).length;
  return (
    <section className="mt-2 grid gap-3">
      <p className="text-sm text-muted">
        Afvinken voordat het concept de combibon in gaat. Dit vervangt het formulier niet. Het volledige A–Q-concept staat onder Combibon, met account.
      </p>
      <ul className="panel divide-y divide-line">
        {CHECKS.map((regel, index) => (
          <li key={regel}>
            <label className="flex min-h-11 items-start gap-3 px-3 py-2 text-sm">
              <input
                className="mt-1"
                type="checkbox"
                checked={aan[index]}
                onChange={(event) => {
                  const volgende = [...aan];
                  volgende[index] = event.target.checked;
                  setAan(volgende);
                }}
              />
              <span>{regel}</span>
            </label>
          </li>
        ))}
      </ul>
      <p className={`text-sm font-semibold ${klaar === CHECKS.length ? "text-[#065F46]" : "text-muted"}`}>
        {klaar} van {CHECKS.length} afgevinkt
        {klaar === CHECKS.length ? ". Checklist rond." : "."}
      </p>
    </section>
  );
}

export function DienstKlad() {
  const [tekst, setTekst] = useState<string | null>(null);

  useEffect(() => {
    setTekst(localStorage.getItem(KLAD_KEY) ?? "");
  }, []);

  useEffect(() => {
    if (tekst === null) return;
    localStorage.setItem(KLAD_KEY, tekst);
  }, [tekst]);

  function nu() {
    const tijd = new Date().toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
    setTekst((huidig) => `${huidig ?? ""}${huidig && !huidig.endsWith("\n") ? "\n" : ""}${tijd} `);
  }

  return (
    <section className="mt-2 grid gap-3">
      <p className="text-sm text-muted">Korte steekwoorden tijdens de dienst. Alleen deze browser. Geen namen van burgers, geen BSN, geen zaaknummer.</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-brand" onClick={nu}>
          + Nu: {new Date().toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setTekst("");
            localStorage.removeItem(KLAD_KEY);
          }}
        >
          Wis kladblok na einde dienst
        </button>
      </div>
      <textarea
        className="min-h-48 border border-line bg-panel p-3 font-mono text-sm"
        value={tekst ?? ""}
        onChange={(event) => setTekst(event.target.value)}
        placeholder="14:32 hoek Kerkstraat, blik op trottoir"
      />
    </section>
  );
}
