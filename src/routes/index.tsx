import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bike,
  BookOpen,
  Bus,
  FileCheck,
  GitBranch,
  GraduationCap,
  IdCard,
  ParkingCircle,
  ScrollText,
  Search,
  Trash2,
  Trees,
  Users,
  Wrench,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { euroUitTarief } from "@/lib/boa/combibon";
import { FEITEN, type Feit } from "@/lib/boa/feitcodes";
import { JARGON } from "@/lib/boa/jargon";
import { type DomeinFilter, type Rol } from "@/lib/boa/meta";
import { usePrefs } from "@/lib/boa/prefs";
import { seo } from "@/lib/seo";
import { BOMEN } from "@/lib/boa/trees";
import { TELLEN, recenteUpdates } from "@/lib/boa/updates";
import { KAARTEN } from "@/lib/boa/zakkaart";

const HOME_TITEL = "BOA Portaal | Feitcodes 2026, Zakkaartjes, Beslisbomen & PV-bouwer (Domein I–VI)";
const HOME_TEKST =
  "Gratis en onafhankelijk naslag- en praktijkplatform voor BOA's, HTV-studenten en vakdocenten. Zoek direct feitcodes 2026, cautie, ID-vordering, beslisbomen en 7 W's PV-bouwstenen.";

export const Route = createFileRoute("/")({
  head: () => seo("/", HOME_TITEL, HOME_TEKST),
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

const DOMEINEN = ["I", "II", "III", "IV", "V", "VI"] as const;
type DomeinCode = (typeof DOMEINEN)[number];

type Doel =
  | { soort: "feit"; q: string }
  | { soort: "boom"; boom: string }
  | { soort: "dienst"; werk: "timer" | "leeftijd" | "combi" }
  | { soort: "zak"; tab: "cautie" | "id" | "aanhouding" | "sfeer" | "jeugd" }
  | { soort: "jargon"; q: string }
  | { soort: "pv" }
  | { soort: "trainer" }
  | { soort: "community" }
  | { soort: "kluis" };

type Treffer = {
  id: string;
  badge: string;
  titel: string;
  score: number;
  groep: "Feitcode" | "Zakkaart" | "Beslisboom" | "Vakjargon";
  doel: Doel;
};

const THEMAS: {
  id: string;
  titel: string;
  soort: string;
  domeinLabel: string;
  domeinen: DomeinCode[];
  icoon: LucideIcon;
  doel: Doel;
}[] = [
  { id: "sfeer", titel: "Sfeerovergang (Toezicht → Opsporing)", soort: "Awb / Sv", domeinLabel: "Domein I–VI", domeinen: [...DOMEINEN], icoon: GitBranch, doel: { soort: "boom", boom: "sfeer" } },
  { id: "id", titel: "Wet ID & weigering inzage (art. 447e Sr)", soort: "Zakkaart + stappenplan", domeinLabel: "Domein I–VI", domeinen: [...DOMEINEN], icoon: IdCard, doel: { soort: "zak", tab: "id" } },
  { id: "halt", titel: "Minderjarige verdachte (12–15 jr & HALT)", soort: "Tariefhalvering en procedure", domeinLabel: "Domein I, III, IV", domeinen: ["I", "III", "IV"], icoon: Users, doel: { soort: "boom", boom: "halt" } },
  { id: "brom", titel: "Bijzondere bromfiets, fatbike en e-step", soort: "Feitcodes en controle", domeinLabel: "Domein I", domeinen: ["I"], icoon: Bike, doel: { soort: "feit", q: "bromfiets" } },
  { id: "afval", titel: "Afvaldumping en zwerfafval (heterdaad)", soort: "Feitcodes en bewijslast PV", domeinLabel: "Domein I & II", domeinen: ["I", "II"], icoon: Trash2, doel: { soort: "feit", q: "afval" } },
  { id: "parkeer", titel: "Foutparkeren, blauwe zone en laadpalen", soort: "RVV 1990 en waarnemingstimer", domeinLabel: "Domein I", domeinen: ["I"], icoon: ParkingCircle, doel: { soort: "dienst", werk: "timer" } },
  { id: "ov", titel: "Reizen zonder geldig vervoerbewijs en OV-verbod", soort: "Wp2000 en beslisboom", domeinLabel: "Domein IV", domeinen: ["IV"], icoon: Bus, doel: { soort: "boom", boom: "ov" } },
  { id: "natuur", titel: "Buitengebied, visserij en loslopende honden", soort: "Natuur en APV", domeinLabel: "Domein II", domeinen: ["II"], icoon: Trees, doel: { soort: "feit", q: "hond" } },
];

const ROLLEN: { id: Rol; label: string; tekst: string }[] = [
  { id: "boa", label: "BOA op straat", tekst: "Zakkaart, feitcodes, combibon en PV tijdens de dienst." },
  { id: "student", label: "Student", tekst: "Trainer, beslisbomen en vakjargon tot de stof blijft hangen." },
  { id: "docent", label: "Vakdocent", tekst: "Casussen en naslag om direct in de les te gebruiken." },
];

function punten(naald: string, tekst: string, gewicht: number) {
  const n = naald.trim().toLowerCase();
  if (n.length < 2) return 0;
  const t = tekst.toLowerCase();
  const compactN = n.replace(/\s+/g, "");
  const compactT = t.replace(/\s+/g, "");
  if (t === n || compactT === compactN) return 100 * gewicht;
  if (t.startsWith(n) || compactT.startsWith(compactN)) return 70 * gewicht;
  if (t.includes(n) || compactT.includes(compactN)) return 40 * gewicht;
  return 0;
}

function zoekDirect(q: string): Treffer[] {
  const naald = q.trim();
  if (naald.length < 2) return [];
  const lijst: Treffer[] = [];
  for (const feit of FEITEN) {
    const score = Math.max(punten(naald, feit.code, 1.4), punten(naald, feit.titel, 1), punten(naald, feit.trefwoorden, 0.7));
    if (!score) continue;
    lijst.push({ id: `feit-${feit.id}`, badge: feitBadge(feit), titel: `${feit.code} · ${feit.titel}`, score, groep: "Feitcode", doel: { soort: "feit", q: feit.code } });
  }
  for (const kaart of KAARTEN) {
    const score = Math.max(punten(naald, kaart.titel, 1.2), punten(naald, kaart.artikel, 0.8), punten(naald, kaart.spreek, 0.5));
    if (!score) continue;
    const tab = tabVanKaart(kaart.id);
    lijst.push({ id: `zak-${kaart.id}`, badge: "Zakkaart", titel: kaart.titel, score, groep: "Zakkaart", doel: tab === "alle" ? { soort: "zak", tab: "cautie" } : { soort: "zak", tab } });
  }
  for (const boom of BOMEN) {
    const score = Math.max(punten(naald, boom.titel, 1.2), punten(naald, boom.inleiding, 0.6));
    if (!score) continue;
    lijst.push({ id: `boom-${boom.id}`, badge: "Beslisboom", titel: boom.titel, score, groep: "Beslisboom", doel: { soort: "boom", boom: boom.id } });
  }
  for (const woord of JARGON) {
    const score = Math.max(punten(naald, woord.term, 1.3), punten(naald, woord.uitleg, 0.45));
    if (!score) continue;
    lijst.push({ id: `jargon-${woord.term}`, badge: "Vakjargon", titel: woord.term, score, groep: "Vakjargon", doel: { soort: "jargon", q: woord.term } });
  }
  lijst.sort((a, b) => b.score - a.score);
  const gekozen: Treffer[] = [];
  const gezien = new Set<string>();
  for (const groep of ["Feitcode", "Zakkaart", "Beslisboom", "Vakjargon"] as const) {
    const beste = lijst.find((item) => item.groep === groep);
    if (!beste) continue;
    gekozen.push(beste);
    gezien.add(beste.id);
  }
  for (const item of lijst) {
    if (gekozen.length >= 5) break;
    if (gezien.has(item.id)) continue;
    gekozen.push(item);
    gezien.add(item.id);
  }
  return gekozen.slice(0, 5);
}

function feitBadge(feit: Feit) {
  const euro = euroUitTarief(feit.tarief);
  return euro ? `Feitcode € ${euro},-` : "Feitcode";
}

function tabVanKaart(id: string): "cautie" | "id" | "aanhouding" | "sfeer" | "jeugd" | "alle" {
  if (id === "cautie" || id === "staand" || id === "mulder") return "cautie";
  if (id === "id" || id === "ov-id" || id === "plicht") return "id";
  if (id === "aanhouding" || id === "fouille" || id === "boeien" || id === "overdracht" || id === "woning") return "aanhouding";
  if (id === "sfeer") return "sfeer";
  if (id === "leer" || id === "natuur") return "jeugd";
  return "alle";
}

function pastThema(domeinen: DomeinCode[], filter: DomeinFilter) {
  if (filter === "alle" || domeinen.length === DOMEINEN.length) return true;
  return domeinen.includes(filter);
}

function Home() {
  const navigate = useNavigate();
  const rol = usePrefs((state) => state.rol);
  const domein = usePrefs((state) => state.domein);
  const setRol = usePrefs((state) => state.setRol);
  const setDomein = usePrefs((state) => state.setDomein);
  const [q, setQ] = useState("");
  const updates = recenteUpdates(4);
  const treffers = useMemo(() => zoekDirect(q), [q]);
  const themas = THEMAS.filter((item) => pastThema(item.domeinen, domein));

  const modules: { titel: string; badge: string; icoon: LucideIcon; tint: string; doel: Doel }[] = [
    { titel: "Zakkaart", badge: "Cautie · ID · Aanhouding", icoon: ScrollText, tint: "bg-[#FEF3C7] text-[#D97706]", doel: { soort: "zak", tab: "cautie" } },
    { titel: "Feitcodes", badge: `${TELLEN.feiten} codes (2026)`, icoon: Search, tint: "bg-[#DBEAFE] text-[#1D4ED8]", doel: { soort: "feit", q: "" } },
    { titel: "PV-bouwer", badge: "7 W's relaas", icoon: FileCheck, tint: "bg-[#D1FAE5] text-[#059669]", doel: { soort: "pv" } },
    { titel: "Werkbank", badge: "Timer & leeftijd", icoon: Wrench, tint: "bg-[#F1F5F9] text-[#334155]", doel: { soort: "dienst", werk: "timer" } },
    { titel: "Beslisbomen", badge: `${TELLEN.bomen} bomen`, icoon: GitBranch, tint: "bg-[#E0E7FF] text-[#4338CA]", doel: { soort: "boom", boom: "sfeer" } },
    { titel: "Trainer", badge: "Toets & casus", icoon: GraduationCap, tint: "bg-[#E0F2FE] text-[#0369A1]", doel: { soort: "trainer" } },
    { titel: "Vakjargon", badge: `${TELLEN.jargon} begrippen`, icoon: BookOpen, tint: "bg-[#EDE9FE] text-[#6D28D9]", doel: { soort: "jargon", q: "" } },
    { titel: "Community", badge: "Opslaan & sparren", icoon: Users, tint: "bg-[#E2E8F0] text-[#0F172A]", doel: { soort: "community" } },
  ];

  function ga(doel: Doel) {
    if (doel.soort === "feit") void navigate({ to: "/feitcodes", search: doel.q ? { q: doel.q } : {} });
    else if (doel.soort === "boom") void navigate({ to: "/beslisbomen", search: { boom: doel.boom } });
    else if (doel.soort === "dienst") void navigate({ to: "/dienst", search: { werk: doel.werk } });
    else if (doel.soort === "zak") void navigate({ to: "/zakkaart", search: { tab: doel.tab } });
    else if (doel.soort === "jargon") void navigate({ to: "/jargon", search: doel.q ? { q: doel.q } : {} });
    else if (doel.soort === "pv") void navigate({ to: "/pv" });
    else if (doel.soort === "trainer") void navigate({ to: "/trainer" });
    else if (doel.soort === "kluis") void navigate({ to: "/kluis" });
    else void navigate({ to: "/community" });
  }


  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "BOA Portaal",
            url: "https://boaportaal.nl/",
            description: HOME_TEKST,
            inLanguage: "nl-NL",
          }),
        }}
      />

      <section className="mx-auto w-full max-w-3xl px-4 pt-12 pb-6 sm:pt-16">
        <p className="text-sm text-muted">Onafhankelijk naslagwerk · Domein I t/m VI</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Welkom.</h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
          Fijn dat je er bent. Dit is de plek voor feitcodes, cautie, beslisbomen en een PV-relaas. Zoeken kan meteen, een account heb je niet nodig.
        </p>
        <form
          className="relative mt-6"
          onSubmit={(event) => {
            event.preventDefault();
            const eerste = treffers[0];
            if (eerste) ga(eerste.doel);
            else void navigate({ to: "/feitcodes", search: q.trim() ? { q: q.trim() } : {} });
          }}
        >
          <label className="sr-only" htmlFor="hero-zoek">
            Zoeken
          </label>
          <div className="flex items-center border border-line bg-panel p-1.5">
            <Search className="ml-2 size-4 shrink-0 text-muted" aria-hidden="true" />
            <input
              id="hero-zoek"
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Zoek een feitcode, een begrip of een onderwerp"
              aria-expanded={treffers.length > 0}
              aria-controls="hero-treffers"
              className="min-h-11 flex-1 bg-transparent px-2 text-base text-ink placeholder:text-muted focus:outline-none"
            />
            {q ? (
              <button type="button" className="px-2 text-muted" aria-label="Wis zoekopdracht" onClick={() => setQ("")}>
                <X className="size-4" />
              </button>
            ) : null}
            <button className="btn btn-brand min-h-11" type="submit">
              Zoeken
            </button>
          </div>
          {q.trim().length >= 2 ? (
            <ul id="hero-treffers" className="absolute z-20 mt-1 w-full border border-line bg-panel text-ink shadow-sm">
              {treffers.length === 0 ? (
                <li className="px-3 py-3 text-sm text-muted">Geen directe treffer. Enter zoekt verder in de feitcodes.</li>
              ) : (
                treffers.map((item) => (
                  <li key={item.id}>
                    <button type="button" className="flex w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-inset" onClick={() => ga(item.doel)}>
                      <span className="mt-0.5 shrink-0 rounded-sm bg-inset px-1.5 py-0.5 text-xs font-semibold text-muted">{item.badge}</span>
                      <span className="text-sm font-semibold leading-snug">{item.titel}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          ) : null}
        </form>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 py-6">
        <h2 className="text-base font-semibold">Waar kom je voor?</h2>
        <p className="mt-1 text-sm text-muted">Kies wat bij je past. Het menu volgt daarna die rol.</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {ROLLEN.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`panel h-full w-full p-4 text-left ${rol === item.id ? "border-[#1D4ED8]" : ""}`}
                onClick={() => setRol(item.id)}
              >
                <span className="block font-semibold">{item.label}</span>
                <span className="mt-1 block text-sm leading-relaxed text-muted">{item.tekst}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 py-8">
        <h2 className="text-base font-semibold">De onderdelen</h2>
        <p className="mt-1 text-sm text-muted">Pak wat je nodig hebt. De rest laat je liggen.</p>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {modules.map((item) => {
            const Icoon = item.icoon;
            return (
              <li key={item.titel}>
                <button type="button" className="flex w-full items-center gap-3 py-3 text-left" onClick={() => ga(item.doel)}>
                  <span className={`grid size-8 shrink-0 place-items-center rounded-sm ${item.tint}`}>
                    <Icoon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{item.titel}</span>
                    <span className="block text-sm text-muted">{item.badge}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="border-y border-line bg-panel">
        <div className="mx-auto w-full max-w-3xl px-4 py-10">
          <h2 className="text-base font-semibold">Een onderwerp uit de praktijk</h2>
          <p className="mt-1 text-sm text-muted">Filter op domein als je alleen jouw werkveld wilt zien.</p>
          <div className="mt-3">
            <DomeinKnoppen domein={domein} onKies={setDomein} />
          </div>
          <ul className="mt-4 grid gap-2">
            {themas.map((item) => {
              const Icoon = item.icoon;
              return (
                <li key={item.id}>
                  <button type="button" className="flex w-full items-center gap-3 py-2 text-left" onClick={() => ga(item.doel)}>
                    <Icoon className="size-4 shrink-0 text-muted" aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block font-semibold leading-snug">{item.titel}</span>
                      <span className="block text-sm text-muted">
                        {item.soort} · {item.domeinLabel}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 py-10">
        <h2 className="text-base font-semibold">Wat er staat</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {TELLEN.feiten} feitcodes, {TELLEN.jargon} begrippen, {TELLEN.bomen} beslisbomen en {TELLEN.kaarten} zakkaartjes. Elke week komt er iets bij.
        </p>
        <ul className="mt-4 grid gap-3">
          {updates.map((item) => (
            <li key={item.id}>
              <Link to={item.naar} className="block py-1">
                <span className="font-mono text-xs text-muted">{item.week}</span>
                {item.nieuw ? <span className="ml-2 text-xs font-semibold text-[#059669]">Nieuw</span> : null}
                <span className="mt-0.5 block font-semibold">{item.titel}</span>
                <span className="mt-0.5 block text-sm leading-relaxed text-muted">{item.tekst}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function DomeinKnoppen({ domein, onKies }: { domein: DomeinFilter; onKies: (id: DomeinFilter) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" className={`btn min-h-8 px-2 py-1 text-xs ${domein === "alle" ? "btn-brand" : ""}`} onClick={() => onKies("alle")}>
        Alle
      </button>
      {DOMEINEN.map((id) => (
        <button key={id} type="button" className={`btn min-h-8 px-2 py-1 text-xs ${domein === id ? "btn-brand" : ""}`} onClick={() => onKies(id)}>
          <span className="mr-1 inline-block size-2 rounded-full" style={{ background: DOMEIN_KLEUR[id] }} />
          {id}
        </button>
      ))}
    </div>
  );
}
