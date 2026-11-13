import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Bike,
  BookOpen,
  Bus,
  FileText,
  GitBranch,
  GraduationCap,
  IdCard,
  LayoutGrid,
  MessageSquare,
  ParkingCircle,
  ScrollText,
  Search,
  Trash2,
  Trees,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { euroUitTarief } from "@/lib/boa/combibon";
import { FEITEN, type Feit } from "@/lib/boa/feitcodes";
import { JARGON } from "@/lib/boa/jargon";
import { type DomeinFilter } from "@/lib/boa/meta";
import { usePrefs } from "@/lib/boa/prefs";
import { BOMEN } from "@/lib/boa/trees";
import { TELLEN, recenteUpdates } from "@/lib/boa/updates";
import { KAARTEN } from "@/lib/boa/zakkaart";

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

const DOMEINEN = ["I", "II", "III", "IV", "V", "VI"] as const;
type DomeinCode = (typeof DOMEINEN)[number];

const TAGS = [
  { label: "Cautie & ID", to: "/zakkaart" as const, search: { tab: "cautie" as const } },
  { label: "Feitcodes", to: "/feitcodes" as const },
  { label: "7 W's PV", to: "/pv" as const },
  { label: "Sfeerovergang", to: "/beslisbomen" as const, search: { boom: "sfeer" } },
];

type Doel =
  | { soort: "feit"; q: string }
  | { soort: "boom"; boom: string }
  | { soort: "dienst"; werk: "timer" | "leeftijd" | "combi" }
  | { soort: "zak"; tab: "cautie" | "id" | "aanhouding" | "sfeer" | "jeugd" }
  | { soort: "jargon"; q: string }
  | { soort: "pv" }
  | { soort: "trainer" }
  | { soort: "community" };

type Treffer = {
  id: string;
  badge: string;
  titel: string;
  score: number;
  groep: "Feitcode" | "Zakkaart" | "Beslisboom" | "Vakjargon";
  doel: Doel;
};

type Pil = { t: string; toon: "amber" | "blauw" | "slate" | "groen"; doel: Doel };

const PIL: Record<Pil["toon"], string> = {
  amber: "bg-[#FEF3C7] text-[#92400E]",
  blauw: "bg-[#DBEAFE] text-[#1D4ED8]",
  slate: "bg-[#F1F5F9] text-[#334155]",
  groen: "bg-[#D1FAE5] text-[#065F46]",
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
  {
    id: "sfeer",
    titel: "Sfeerovergang (Toezicht → Opsporing)",
    soort: "Awb / Sv",
    domeinLabel: "Domein I–VI",
    domeinen: [...DOMEINEN],
    icoon: GitBranch,
    doel: { soort: "boom", boom: "sfeer" },
  },
  {
    id: "id",
    titel: "Wet ID & weigering inzage (art. 447e Sr)",
    soort: "Zakkaart + stappenplan",
    domeinLabel: "Domein I–VI",
    domeinen: [...DOMEINEN],
    icoon: IdCard,
    doel: { soort: "zak", tab: "id" },
  },
  {
    id: "halt",
    titel: "Minderjarige verdachte (12–15 jr & HALT)",
    soort: "Tariefhalvering en procedure",
    domeinLabel: "Domein I, III, IV",
    domeinen: ["I", "III", "IV"],
    icoon: Users,
    doel: { soort: "boom", boom: "halt" },
  },
  {
    id: "brom",
    titel: "Bijzondere bromfiets, fatbike en e-step",
    soort: "Feitcodes en controle",
    domeinLabel: "Domein I",
    domeinen: ["I"],
    icoon: Bike,
    doel: { soort: "feit", q: "bromfiets" },
  },
  {
    id: "afval",
    titel: "Afvaldumping en zwerfafval (heterdaad)",
    soort: "Feitcodes en bewijslast PV",
    domeinLabel: "Domein I & II",
    domeinen: ["I", "II"],
    icoon: Trash2,
    doel: { soort: "feit", q: "afval" },
  },
  {
    id: "parkeer",
    titel: "Foutparkeren, blauwe zone en laadpalen",
    soort: "RVV 1990 en waarnemingstimer",
    domeinLabel: "Domein I",
    domeinen: ["I"],
    icoon: ParkingCircle,
    doel: { soort: "dienst", werk: "timer" },
  },
  {
    id: "ov",
    titel: "Reizen zonder geldig vervoerbewijs en OV-verbod",
    soort: "Wp2000 en beslisboom",
    domeinLabel: "Domein IV",
    domeinen: ["IV"],
    icoon: Bus,
    doel: { soort: "boom", boom: "ov" },
  },
  {
    id: "natuur",
    titel: "Buitengebied, visserij en loslopende honden",
    soort: "Natuur en APV",
    domeinLabel: "Domein II",
    domeinen: ["II"],
    icoon: Trees,
    doel: { soort: "feit", q: "hond" },
  },
  {
    id: "pv",
    titel: "7 W's PV-generator met ambtseed-zinnen",
    soort: "Interactieve bouwer",
    domeinLabel: "Domein I–VI",
    domeinen: [...DOMEINEN],
    icoon: FileText,
    doel: { soort: "pv" },
  },
  {
    id: "trainer",
    titel: "Hercertificering en examentrainer",
    soort: "Casussen en rechtskennis",
    domeinLabel: "Domein I–VI",
    domeinen: [...DOMEINEN],
    icoon: GraduationCap,
    doel: { soort: "trainer" },
  },
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
    lijst.push({
      id: `feit-${feit.id}`,
      badge: feitBadge(feit),
      titel: `${feit.code} · ${feit.titel}`,
      score,
      groep: "Feitcode",
      doel: { soort: "feit", q: feit.code },
    });
  }
  for (const kaart of KAARTEN) {
    const score = Math.max(punten(naald, kaart.titel, 1.2), punten(naald, kaart.artikel, 0.8), punten(naald, kaart.spreek, 0.5));
    if (!score) continue;
    const tab = tabVanKaart(kaart.id);
    lijst.push({
      id: `zak-${kaart.id}`,
      badge: "Zakkaart",
      titel: kaart.titel,
      score,
      groep: "Zakkaart",
      doel: tab === "alle" ? { soort: "zak", tab: "cautie" } : { soort: "zak", tab },
    });
  }
  for (const boom of BOMEN) {
    const score = Math.max(punten(naald, boom.titel, 1.2), punten(naald, boom.inleiding, 0.6));
    if (!score) continue;
    lijst.push({
      id: `boom-${boom.id}`,
      badge: "Beslisboom",
      titel: boom.titel,
      score,
      groep: "Beslisboom",
      doel: { soort: "boom", boom: boom.id },
    });
  }
  for (const woord of JARGON) {
    const score = Math.max(punten(naald, woord.term, 1.3), punten(naald, woord.uitleg, 0.45));
    if (!score) continue;
    lijst.push({
      id: `jargon-${woord.term}`,
      badge: "Vakjargon",
      titel: woord.term,
      score,
      groep: "Vakjargon",
      doel: { soort: "jargon", q: woord.term },
    });
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

  function ga(doel: Doel) {
    if (doel.soort === "feit") {
      if (doel.q) void navigate({ to: "/feitcodes", search: { q: doel.q } });
      else void navigate({ to: "/feitcodes" });
    } else if (doel.soort === "boom") void navigate({ to: "/beslisbomen", search: { boom: doel.boom } });
    else if (doel.soort === "dienst") void navigate({ to: "/dienst", search: { werk: doel.werk } });
    else if (doel.soort === "zak") void navigate({ to: "/zakkaart", search: { tab: doel.tab } });
    else if (doel.soort === "jargon") {
      if (doel.q) void navigate({ to: "/jargon", search: { q: doel.q } });
      else void navigate({ to: "/jargon" });
    } else if (doel.soort === "pv") void navigate({ to: "/pv" });
    else if (doel.soort === "trainer") void navigate({ to: "/trainer" });
    else void navigate({ to: "/community" });
  }

  return (
    <div>
      <section className="border-b-4 border-[#1D4ED8] bg-[#0F172A] text-white">
        <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:py-12">
          <div className="flex flex-wrap gap-2 text-xs">
            {["100% Gratis", "Onafhankelijk", "Domein I t/m VI", "Wekelijks nieuwe data"].map((badge) => (
              <span key={badge} className="rounded-sm border border-white/20 px-2 py-1 text-slate-300">
                {badge}
              </span>
            ))}
          </div>
          <div className="mt-5 flex items-start gap-4">
            <img src="/boa-mark.png" alt="" className="hidden size-14 sm:block" />
            <div>
              <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">Hét praktijk- en naslagplatform voor BOA's, studenten en docenten.</h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-300">
                Eén plek voor feitcodes, cautie, beslisbomen en PV-bouwstenen. Op straat pak je het in seconden. In de opleiding oefen je het stap voor stap. Zonder abonnement.
              </p>
            </div>
          </div>
          <form
            className="relative mt-6"
            onSubmit={(event) => {
              event.preventDefault();
              const eerste = treffers[0];
              if (eerste) ga(eerste.doel);
              else void navigate({ to: "/feitcodes", search: q.trim() ? { q: q.trim() } : {} });
            }}
          >
            <label className="grid gap-2">
              <span className="sr-only">Zoeken</span>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={q}
                  onChange={(event) => setQ(event.target.value)}
                  placeholder="Zoek op feitcode, vakjargon, wet of onderwerp"
                  aria-expanded={treffers.length > 0}
                  aria-controls="hero-treffers"
                  className="scheme-light min-h-12 flex-1 border border-slate-300 bg-white px-3 text-base text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                />
                <button className="btn min-h-12 border-[#1D4ED8] bg-[#1D4ED8] text-white hover:bg-[#1E40AF]" type="submit">
                  Zoeken
                </button>
              </div>
            </label>
            {q.trim().length >= 2 ? (
              <ul id="hero-treffers" className="scheme-light absolute z-20 mt-1 w-full border border-slate-300 bg-white text-slate-900 shadow-sm sm:w-[calc(100%-7.5rem)]">
                {treffers.length === 0 ? (
                  <li className="px-3 py-3 text-sm text-slate-600">Geen directe treffer. Enter zoekt verder in de feitcodes.</li>
                ) : (
                  treffers.map((item) => (
                    <li key={item.id}>
                      <button type="button" className="flex w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-slate-100" onClick={() => ga(item.doel)}>
                        <span className="mt-0.5 shrink-0 rounded-sm bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-700">{item.badge}</span>
                        <span className="text-sm font-semibold leading-snug">{item.titel}</span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            ) : null}
          </form>
          <div className="mt-3 flex flex-wrap gap-2">
            {TAGS.map((tag) =>
              "search" in tag ? (
                <Link key={tag.label} to={tag.to} search={tag.search} className="rounded-sm border border-white/20 px-2 py-1 text-xs text-slate-200">
                  {tag.label}
                </Link>
              ) : (
                <Link key={tag.label} to={tag.to} className="rounded-sm border border-white/20 px-2 py-1 text-xs text-slate-200">
                  {tag.label}
                </Link>
              ),
            )}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href="#start" className="btn bg-white font-semibold text-slate-950 hover:bg-slate-100">
              Stel jouw weergave in
            </a>
            <a href="#inhoud" className="btn border-white/30 bg-transparent text-white">
              Inhoud
            </a>
          </div>
        </div>
      </section>

      <section id="start" className="mx-auto w-full max-w-5xl px-4 py-10">
        <h2 className="text-2xl font-semibold tracking-tight">Voor wie is BOA Portaal?</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">Kies je rol en domein hier. Het menu en de thema's hieronder volgen meteen mee.</p>
        <ul className="mt-5 grid gap-3 lg:grid-cols-3">
          {(
            [
              { id: "boa" as const, titel: "BOA op straat", tekst: "Zakkaart, feitcodes met tarief, combibon en PV-bouwstenen tijdens de dienst." },
              { id: "student" as const, titel: "Student HTV / BOA-basis", tekst: "Trainer, beslisbomen en vakjargon. Oefenen tot de stof blijft hangen." },
              { id: "docent" as const, titel: "Vakdocent", tekst: "Casussen, bomen en naslag om direct in de les of begeleiding te gebruiken." },
            ] as const
          ).map((kaart) => {
            const actief = rol === kaart.id;
            return (
              <li key={kaart.id} className={`panel p-4 ${actief ? "border-[#1D4ED8] shadow-[inset_3px_0_0_#1D4ED8]" : ""}`}>
                <h3 className="font-semibold">{kaart.titel}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{kaart.tekst}</p>
                {actief ? <p className="mt-3 text-sm font-semibold text-[#1D4ED8]">✓ Actieve weergave</p> : null}
                <button type="button" className={actief ? "btn btn-brand mt-4" : "btn mt-4"} onClick={() => setRol(kaart.id)}>
                  Start als {kaart.titel.split(" ")[0]}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="mt-6">
          <p className="text-sm font-semibold">Domein</p>
          <DomeinKnoppen domein={domein} onKies={setDomein} />
        </div>
      </section>

      <section id="inhoud" className="border-y border-line bg-panel">
        <div className="mx-auto w-full max-w-5xl px-4 py-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Wat erin zit</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">Filter op domein. De keuze volgt mee in de rest van het portaal.</p>
            </div>
            <DomeinKnoppen domein={domein} onKies={setDomein} />
          </div>

          <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-muted">Op straat en in de dienst</h3>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            <Kaart
              titel="Zakkaart"
              label="Direct op straat"
              tekst="Cautie, ID-vordering en aanhouding."
              icoon={ScrollText}
              doel={{ soort: "zak", tab: "cautie" }}
              onOpen={ga}
              pills={[
                { t: "Cautie", toon: "amber", doel: { soort: "zak", tab: "cautie" } },
                { t: "ID-vordering", toon: "amber", doel: { soort: "zak", tab: "id" } },
                { t: "Aanhouding", toon: "amber", doel: { soort: "zak", tab: "aanhouding" } },
              ]}
            />
            <Kaart
              titel="Feitcodes"
              label="Zoek en tarieven"
              tekst="Code, artikel of situatie, met het bedrag uit het Feitenboekje."
              icoon={Search}
              doel={{ soort: "feit", q: "" }}
              onOpen={ga}
              pills={[
                { t: "Feitenboekje 2026", toon: "blauw", doel: { soort: "feit", q: "" } },
                { t: "Zoek op code", toon: "blauw", doel: { soort: "feit", q: "F 185" } },
                { t: "CJIB-tarief", toon: "blauw", doel: { soort: "feit", q: "" } },
              ]}
            />
            <Kaart
              titel="Werkbank"
              label="Dienst-tools"
              tekst="Combibon, kenteken en tarieven van je dienst."
              icoon={LayoutGrid}
              doel={{ soort: "dienst", werk: "timer" }}
              onOpen={ga}
              pills={[
                { t: "Waarnemingstimer", toon: "slate", doel: { soort: "dienst", werk: "timer" } },
                { t: "Leeftijdcheck", toon: "slate", doel: { soort: "dienst", werk: "leeftijd" } },
                { t: "Combibon", toon: "slate", doel: { soort: "dienst", werk: "combi" } },
              ]}
            />
            <Kaart
              titel="PV-bouwer"
              label="7 W's"
              tekst="Stap voor stap, klaar om over te nemen in het bronsysteem."
              icoon={FileText}
              doel={{ soort: "pv" }}
              onOpen={ga}
              pills={[
                { t: "7 W's-check", toon: "groen", doel: { soort: "pv" } },
                { t: "Ambtseed-zinnen", toon: "groen", doel: { soort: "pv" } },
                { t: "Kopieer relaas", toon: "groen", doel: { soort: "pv" } },
              ]}
            />
          </ul>

          <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-muted">Kennis, oefenen en delen</h3>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            <Kaart
              titel="Beslisbomen"
              label="Stap voor stap"
              tekst="Sfeerovergang, HALT, OV en meer."
              icoon={GitBranch}
              doel={{ soort: "boom", boom: "sfeer" }}
              onOpen={ga}
              pills={[
                { t: "Sfeerovergang", toon: "blauw", doel: { soort: "boom", boom: "sfeer" } },
                { t: "HALT", toon: "blauw", doel: { soort: "boom", boom: "halt" } },
                { t: "OV", toon: "blauw", doel: { soort: "boom", boom: "ov" } },
              ]}
            />
            <Kaart titel="Trainer" label="Oefenmodule" tekst="Rechtskennis, bevoegdheden en casussen." icoon={GraduationCap} doel={{ soort: "trainer" }} onOpen={ga} />
            <Kaart titel="Vakjargon" label="Verdieping" tekst="Abri, cautie, combibon. De woorden van de straat." icoon={BookOpen} doel={{ soort: "jargon", q: "" }} onOpen={ga} />
            <Kaart titel="Community" label="Collega's" tekst="Vragen, tips en antwoorden. Alleen met een account." icoon={MessageSquare} doel={{ soort: "community" }} onOpen={ga} />
          </ul>

          <h3 className="mt-10 text-sm font-semibold uppercase tracking-wide text-muted">Direct naar praktijkonderwerp</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted">Thema-kaarten voor de straat. Ze volgen het domein dat je hierboven kiest.</p>
          <ul className="mt-3 grid gap-2">
            {themas.map((item) => {
              const Icoon = item.icoon;
              return (
                <li key={item.id}>
                  <button type="button" className="panel flex w-full items-center gap-3 p-3 text-left transition-colors hover:border-[#1D4ED8]" onClick={() => ga(item.doel)}>
                    <span className="grid size-9 shrink-0 place-items-center rounded-md bg-slate-100 text-[#1D4ED8]">
                      <Icoon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold leading-snug">{item.titel}</span>
                      <span className="mt-0.5 block text-sm leading-relaxed text-muted">
                        {item.soort} · {item.domeinLabel}
                      </span>
                    </span>
                    <span className="hidden shrink-0 text-sm font-semibold text-[#059669] sm:inline">Direct open →</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-10">
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
                  <span className="mt-1 block text-sm leading-relaxed text-muted">{item.tekst}</span>
                </span>
                <span className="text-sm text-muted">{item.domeinen[0] === "algemeen" ? "Alle domeinen" : `Domein ${item.domeinen[0]}`}</span>
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
    <div className="mt-2 flex flex-wrap gap-2">
      <button type="button" className={`btn ${domein === "alle" ? "btn-brand" : ""}`} onClick={() => onKies("alle")}>
        Alle
      </button>
      {DOMEINEN.map((id) => (
        <button key={id} type="button" className={`btn ${domein === id ? "btn-brand" : ""}`} onClick={() => onKies(id)}>
          <span className="mr-1 inline-block size-2 rounded-full" style={{ background: DOMEIN_KLEUR[id] }} />
          {id}
        </button>
      ))}
    </div>
  );
}

function Kaart({
  titel,
  label,
  tekst,
  icoon: Icoon,
  doel,
  pills,
  onOpen,
}: {
  titel: string;
  label: string;
  tekst: string;
  icoon: LucideIcon;
  doel: Doel;
  pills?: Pil[];
  onOpen: (doel: Doel) => void;
}) {
  return (
    <li className="panel group flex h-full flex-col p-4 transition-colors hover:border-[#1D4ED8]">
      <button type="button" className="flex flex-1 flex-col text-left" onClick={() => onOpen(doel)}>
        <span className="flex items-start justify-between gap-3">
          <span className="grid size-9 place-items-center rounded-md bg-slate-100 text-[#1D4ED8]">
            <Icoon className="size-4" aria-hidden="true" />
          </span>
          <ArrowRight className="size-4 text-muted transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
        <span className="mt-3 font-mono text-xs text-muted">{label}</span>
        <span className="mt-1 font-semibold">{titel}</span>
        <span className="mt-1 text-sm leading-relaxed text-muted">{tekst}</span>
      </button>
      {pills ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {pills.map((pil) => (
            <button key={pil.t} type="button" className={`rounded-sm px-2 py-1 text-xs font-semibold ${PIL[pil.toon]}`} onClick={() => onOpen(pil.doel)}>
              {pil.t}
            </button>
          ))}
        </div>
      ) : null}
    </li>
  );
}
