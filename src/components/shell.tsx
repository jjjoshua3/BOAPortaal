import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  BookOpen,
  FileText,
  GitBranch,
  GraduationCap,
  LayoutGrid,
  Lock,
  Menu,
  MessageSquare,
  Moon,
  Scale,
  ScrollText,
  Search,
  Sun,
  X,
} from "lucide-react";
import { FeedbackDock } from "@/components/feedback";
import { FILTERS, ROLLEN, type DomeinFilter, type Rol } from "@/lib/boa/meta";
import { usePrefs, pasWeergave } from "@/lib/boa/prefs";
import { useBoaAuth } from "@/lib/supabase/auth";
import { useIdentiteit } from "@/lib/boa/identiteit";

const ICONS = {
  "/feitcodes": Search,
  "/zakkaart": ScrollText,
  "/beslisbomen": GitBranch,
  "/pv": FileText,
  "/trainer": GraduationCap,
  "/kluis": Lock,
  "/dienst": LayoutGrid,
  "/community": MessageSquare,
  "/jargon": BookOpen,
  "/colofon": Scale,
} as const;

type Item = { to: keyof typeof ICONS; label: string };

const ORDER: Record<Rol, Item[]> = {
  boa: [
    { to: "/zakkaart", label: "Zakkaart" },
    { to: "/feitcodes", label: "Feitcodes" },
    { to: "/dienst", label: "Werkbank" },
    { to: "/pv", label: "PV-bouwer" },
    { to: "/beslisbomen", label: "Beslisbomen" },
    { to: "/trainer", label: "Trainer" },
    { to: "/community", label: "Community" },
    { to: "/kluis", label: "Kluis" },
  ],
  student: [
    { to: "/trainer", label: "Trainer" },
    { to: "/beslisbomen", label: "Beslisbomen" },
    { to: "/zakkaart", label: "Zakkaart" },
    { to: "/feitcodes", label: "Feitcodes" },
    { to: "/dienst", label: "Werkbank" },
    { to: "/pv", label: "PV-bouwer" },
    { to: "/community", label: "Community" },
    { to: "/kluis", label: "Kluis" },
  ],
  docent: [
    { to: "/trainer", label: "Trainer" },
    { to: "/beslisbomen", label: "Beslisbomen" },
    { to: "/pv", label: "PV-bouwer" },
    { to: "/feitcodes", label: "Feitcodes" },
    { to: "/zakkaart", label: "Zakkaart" },
    { to: "/dienst", label: "Werkbank" },
    { to: "/community", label: "Community" },
    { to: "/kluis", label: "Kluis" },
  ],
};

const TOP: Item[] = [
  { to: "/zakkaart", label: "Zakkaart" },
  { to: "/feitcodes", label: "Feitcodes" },
  { to: "/dienst", label: "Werkbank" },
  { to: "/pv", label: "PV-bouwer" },
  { to: "/beslisbomen", label: "Beslisbomen" },
  { to: "/trainer", label: "Trainer" },
  { to: "/jargon", label: "Vakjargon" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const rol = usePrefs((state) => state.rol);
  const domein = usePrefs((state) => state.domein);
  const theme = usePrefs((state) => state.theme);
  const tekst = usePrefs((state) => state.tekst);
  const setRol = usePrefs((state) => state.setRol);
  const setDomein = usePrefs((state) => state.setDomein);
  const setTekst = usePrefs((state) => state.setTekst);
  const toggleTheme = usePrefs((state) => state.toggleTheme);
  const { user, ready } = useBoaAuth();
  const { identiteit } = useIdentiteit();
  const [meer, setMeer] = useState(false);
  const [info, setInfo] = useState(false);
  const [balie, setBalie] = useState(false);
  const [zoekOpen, setZoekOpen] = useState(false);
  const [weergave, setWeergave] = useState(false);
  const [q, setQ] = useState("");
  const zoekRef = useRef<HTMLInputElement>(null);
  const items = ORDER[rol];

  useEffect(() => {
    let stop = false;
    const result = usePrefs.persist.rehydrate?.();
    void Promise.resolve(result).then(() => {
      if (stop) return;
      pasWeergave(usePrefs.getState());
    });
    const unsub = usePrefs.subscribe((state) => {
      pasWeergave(state);
    });
    return () => {
      stop = true;
      unsub();
    };
  }, []);

  useEffect(() => {
    setMeer(false);
  }, [path]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target instanceof HTMLElement ? event.target : null;
      const typt = Boolean(target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable));
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setZoekOpen(true);
        return;
      }
      if (event.key === "/" && !typt && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        setZoekOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (zoekOpen) zoekRef.current?.focus();
  }, [zoekOpen]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="no-print sticky top-0 z-30 border-b border-line bg-panel">
        <div className="flex h-14 items-center gap-2 overflow-x-auto px-3">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <img src="/boa-mark.png" alt="" className="size-8 shrink-0" />
            <span className="font-semibold tracking-tight text-ink">BOA Portaal</span>
            <span className="hidden rounded-sm border border-line px-1.5 py-0.5 font-mono text-xs text-muted sm:inline lg:hidden">Domein I–VI</span>
          </Link>
          <nav className="hidden shrink-0 items-center lg:flex">
            {TOP.map((item) => (
              <Link key={item.to} to={item.to} className={`px-1.5 py-1 text-xs font-semibold whitespace-nowrap ${path === item.to ? "text-ink" : "text-muted"}`}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex shrink-0 items-center gap-1">
            <button type="button" className="btn min-h-10 px-2" onClick={() => setZoekOpen((open) => !open)} title="Zoeken (Ctrl+K)">
              <Search className="size-4" />
              <span className="hidden xl:inline">Zoeken</span>
            </button>
            <div className="flex overflow-hidden rounded-sm border border-line" role="group" aria-label="Leesgrootte">
              <button
                type="button"
                className={`min-h-10 px-2 text-sm font-semibold ${tekst === "normaal" ? "bg-inset text-ink" : "bg-panel text-muted"}`}
                onClick={() => setTekst("normaal")}
                aria-pressed={tekst === "normaal"}
                title="Standaard leesgrootte"
              >
                A
              </button>
              <button
                type="button"
                className={`min-h-10 border-l border-line px-2 text-base font-semibold ${tekst === "groot" ? "bg-inset text-ink" : "bg-panel text-muted"}`}
                onClick={() => setTekst("groot")}
                aria-pressed={tekst === "groot"}
                title="Grote leesgrootte, 110 procent"
              >
                A+
              </button>
            </div>
            <button
              type="button"
              className="btn min-h-10 px-2"
              onClick={toggleTheme}
              title={theme === "night" ? "Nachtdienst. Klik voor Dag" : "Dag. Klik voor Nachtdienst"}
              aria-label={theme === "night" ? "Nachtdienst aan. Schakel naar Dag" : "Dag aan. Schakel naar Nachtdienst"}
            >
              {theme === "night" ? <Moon className="size-4" /> : <Sun className="size-4" />}
              <span className="hidden xl:inline">{theme === "night" ? "Nachtdienst" : "Dag"}</span>
            </button>
            <button type="button" className="btn hidden min-h-10 px-2 lg:inline-flex" onClick={() => setWeergave((open) => !open)}>
              Weergave
            </button>
            <Link to="/kluis" className={`btn min-h-10 px-2 ${path === "/kluis" ? "btn-brand" : ""}`}>
              <Lock className="size-4" />
              <span className="hidden xl:inline">Kluis</span>
            </Link>
            <button type="button" className="btn btn-brand min-h-10 px-2" onClick={() => setInfo((open) => !open)} title="Account en Client-ID">
              <span>Info</span>
              <span className="font-mono text-xs">{ready && user && identiteit?.client_id ? identiteit.client_id : "Account"}</span>
            </button>
          </div>
        </div>
        {zoekOpen ? (
          <form
            className="flex gap-2 border-t border-line px-3 py-2"
            onSubmit={(event) => {
              event.preventDefault();
              setZoekOpen(false);
              void navigate({ to: "/feitcodes", search: q.trim() ? { q: q.trim() } : {} });
            }}
          >
            <input
              ref={zoekRef}
              className="min-h-10 flex-1 border border-line bg-paper px-3 text-sm"
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Zoek op feitcode, vakjargon of onderwerp"
            />
            {q ? (
              <button type="button" className="btn px-2" aria-label="Wis zoekopdracht" onClick={() => setQ("")}>
                <X className="size-4" />
              </button>
            ) : null}
            <button className="btn btn-brand" type="submit">
              Zoek
            </button>
          </form>
        ) : null}
        {weergave ? (
          <div className="flex flex-wrap gap-3 border-t border-line bg-inset px-3 py-2">
            <label className="grid gap-1 text-xs font-semibold text-muted">
              Domein
              <select className="min-h-10 border border-line bg-panel px-2 text-sm text-ink" value={domein} onChange={(event) => setDomein(event.target.value as DomeinFilter)}>
                {FILTERS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-xs font-semibold text-muted">
              Leesgrootte
              <span className="flex overflow-hidden rounded-sm border border-line">
                <button type="button" className={`min-h-10 px-3 text-sm ${tekst === "normaal" ? "bg-panel font-semibold text-ink" : "bg-inset text-muted"}`} onClick={() => setTekst("normaal")}>
                  Standaard
                </button>
                <button type="button" className={`min-h-10 border-l border-line px-3 text-sm ${tekst === "groot" ? "bg-panel font-semibold text-ink" : "bg-inset text-muted"}`} onClick={() => setTekst("groot")}>
                  Groot
                </button>
              </span>
            </label>
            <label className="grid gap-1 text-xs font-semibold text-muted">
              Rol
              <select className="min-h-10 border border-line bg-panel px-2 text-sm text-ink" value={rol} onChange={(event) => setRol(event.target.value as Rol)}>
                {ROLLEN.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}
        {info ? (
          <div className="flex flex-wrap items-center gap-3 border-t border-line bg-inset px-3 py-2">
            <div>
              <p className="text-xs font-semibold text-muted">Client-ID</p>
              <p className="font-mono text-sm font-semibold">{identiteit?.client_id || "Nog niet uitgegeven"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted">PV-naam</p>
              <p className="text-sm">{identiteit?.pv_naam || "—"}</p>
            </div>
            <Link to="/account" className="btn btn-brand" onClick={() => setInfo(false)}>
              Account openen
            </Link>
          </div>
        ) : null}
      </header>
      <div className="flex min-h-0 flex-1 flex-col">
        <main className="min-w-0 flex-1">{children}</main>
        <footer className="no-print mb-[4.5rem] border-t border-line px-4 py-3 text-xs text-muted">
          <p>Onafhankelijke naslag. Geen publicatie van het OM, de politie of een gemeente. De akte en de geldende wettekst gaan voor.</p>
          <p className="mt-1">
            <Link to="/privacy" className="underline">
              Privacy
            </Link>
            {" · "}
            <a className="underline" href="https://status.boaportaal.nl">
              Status
            </a>
            {" · "}
            <Link to="/jargon" className="underline">
              Vakjargon
            </Link>
            {" · "}
            <Link to="/colofon" className="underline">
              Colofon
            </Link>
            {" · "}
            Ontworpen door{" "}
            <a className="underline" href="https://jjjoshua3.netlify.app/" target="_blank" rel="noreferrer">
              Joshua
            </a>
          </p>
        </footer>
      </div>
      <nav className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0F172A] text-white" aria-label="Hoofdnavigatie">
        <ul className="grid grid-cols-5">
          {items.slice(0, 4).map((item) => {
            const Icon = ICONS[item.to];
            const active = path === item.to;
            return (
              <li key={item.to}>
                <Link to={item.to} className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-semibold ${active ? "text-white" : "text-slate-300"}`}>
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button type="button" className="flex min-h-14 w-full flex-col items-center justify-center gap-0.5 text-xs font-semibold text-slate-300" onClick={() => setMeer(true)}>
              <Menu className="size-4" />
              Meer
            </button>
          </li>
        </ul>
      </nav>
      {meer ? (
        <div className="fixed inset-0 z-40">
          <button type="button" className="absolute inset-0 bg-brand/70" aria-label="Sluit menu" onClick={() => setMeer(false)} />
          <div className="panel absolute inset-x-3 bottom-20 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">Meer</p>
              <button type="button" className="btn min-h-10 px-2" onClick={() => setMeer(false)} aria-label="Sluiten">
                <X className="size-4" />
              </button>
            </div>
            <div className="grid gap-1">
              <Link to="/dienst" search={{ werk: "combi" }} className="btn btn-brand justify-start">
                Combibon invullen
              </Link>
              {items.slice(4).map((item) => (
                <Link key={item.to} to={item.to} className="btn justify-start">
                  {item.label}
                </Link>
              ))}
              <Link to="/jargon" className="btn justify-start">
                <BookOpen className="size-4" />
                Vakjargon
              </Link>
              <Link to="/colofon" className="btn justify-start">
                Colofon
              </Link>
              <Link to="/privacy" className="btn justify-start">
                Privacy
              </Link>
              <a href="https://status.boaportaal.nl" className="btn justify-start">
                Status
              </a>
            </div>
          </div>
        </div>
      ) : null}
      <FeedbackDock />
      <button
        type="button"
        className="no-print fixed bottom-32 right-3 z-40 min-h-10 border border-line bg-panel px-3 text-sm font-semibold text-ink lg:bottom-20 lg:right-28"
        onClick={() => setBalie((open) => !open)}
      >
        Servicedesk
      </button>
      {balie ? (
        <div className="panel no-print fixed bottom-44 right-3 z-40 w-72 p-3 lg:bottom-32 lg:right-28">
          <p className="font-semibold">Servicedesk</p>
          <p className="mt-1 text-sm text-muted">Zelfde account. Een melding maken kan iedereen. De wachtrij is alleen voor medewerkers.</p>
          <a className="btn btn-brand mt-3 w-full" href="https://servicedesk.boaportaal.nl" target="_blank" rel="noreferrer">
            Open de servicedesk
          </a>
        </div>
      ) : null}
    </div>
  );
}
