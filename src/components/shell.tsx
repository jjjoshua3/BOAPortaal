import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
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
import { usePrefs } from "@/lib/boa/prefs";
import { useBoaAuth } from "@/lib/supabase/auth";

const ICONS = {
  "/feitcodes": Search,
  "/zakkaart": ScrollText,
  "/beslisbomen": GitBranch,
  "/pv": FileText,
  "/trainer": GraduationCap,
  "/kluis": Lock,
  "/dienst": LayoutGrid,
  "/community": MessageSquare,
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

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const rol = usePrefs((state) => state.rol);
  const domein = usePrefs((state) => state.domein);
  const theme = usePrefs((state) => state.theme);
  const setRol = usePrefs((state) => state.setRol);
  const setDomein = usePrefs((state) => state.setDomein);
  const toggleTheme = usePrefs((state) => state.toggleTheme);
  const { user, ready } = useBoaAuth();
  const [meer, setMeer] = useState(false);
  const [zoekOpen, setZoekOpen] = useState(false);
  const [weergave, setWeergave] = useState(false);
  const [q, setQ] = useState("");
  const items = ORDER[rol];

  useEffect(() => {
    let stop = false;
    const result = usePrefs.persist.rehydrate?.();
    void Promise.resolve(result).then(() => {
      if (stop) return;
      document.documentElement.classList.toggle("night", usePrefs.getState().theme === "night");
    });
    const unsub = usePrefs.subscribe((state) => {
      document.documentElement.classList.toggle("night", state.theme === "night");
    });
    return () => {
      stop = true;
      unsub();
    };
  }, []);

  useEffect(() => {
    setMeer(false);
  }, [path]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="no-print sticky top-0 z-30 border-b border-line bg-panel">
        <div className="flex h-14 items-center gap-3 px-3">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <img src="/boa-mark.png" alt="" className="size-8 shrink-0" />
            <span className="truncate font-semibold tracking-tight text-ink">BOA Portaal</span>
            <span className="hidden rounded-sm border border-line px-1.5 py-0.5 font-mono text-[10px] text-muted sm:inline">Domein I–VI</span>
          </Link>
          <nav className="ml-2 hidden items-center gap-0.5 lg:flex">
            {items.slice(0, 5).map((item) => (
              <Link key={item.to} to={item.to} className={`px-2 py-1 text-sm font-semibold ${path === item.to ? "text-ink" : "text-muted"}`}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <button type="button" className="btn min-h-10 px-2" onClick={() => setZoekOpen((open) => !open)}>
              <Search className="size-4" />
              <span className="hidden sm:inline">Zoeken</span>
            </button>
            <button type="button" className="btn min-h-10 px-2" onClick={toggleTheme} aria-label="Thema">
              {theme === "night" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            <button type="button" className="btn min-h-10 px-2" onClick={() => setWeergave((open) => !open)}>
              Weergave
            </button>
            <Link to="/account" className="btn btn-brand min-h-10 px-3">
              {ready && user?.email ? user.email.split("@")[0] : "Account"}
            </Link>
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
              className="min-h-10 flex-1 border border-line bg-paper px-3 text-sm"
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Zoek op feitcode, vakjargon of onderwerp"
            />
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
      </header>
      <div className="flex min-h-0 flex-1 flex-col">
        <main className="min-w-0 flex-1">{children}</main>
        <footer className="no-print border-t border-line px-4 py-3 text-xs text-muted mb-[4.5rem] lg:mb-0">
          <p>Onafhankelijke naslag. Geen publicatie van het OM, de politie of een gemeente. De akte en de geldende wettekst gaan voor.</p>
          <p className="mt-1">
            <Link to="/privacy" className="underline">
              Privacy
            </Link>
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
      <nav className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-line bg-panel lg:hidden">
        <ul className="grid grid-cols-5">
          {items.slice(0, 4).map((item) => {
            const Icon = ICONS[item.to];
            const active = path === item.to;
            return (
              <li key={item.to}>
                <Link to={item.to} className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-semibold ${active ? "text-ink" : "text-muted"}`}>
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button type="button" className="flex min-h-14 w-full flex-col items-center justify-center gap-0.5 text-xs font-semibold text-muted" onClick={() => setMeer(true)}>
              <Menu className="size-4" />
              Meer
            </button>
          </li>
        </ul>
      </nav>
      {meer ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" className="absolute inset-0 bg-brand/70" aria-label="Sluit menu" onClick={() => setMeer(false)} />
          <div className="panel absolute inset-x-3 bottom-20 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">Meer</p>
              <button type="button" className="btn min-h-10 px-2" onClick={() => setMeer(false)} aria-label="Sluiten">
                <X className="size-4" />
              </button>
            </div>
            <div className="grid gap-1">
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
            </div>
          </div>
        </div>
      ) : null}
      <FeedbackDock />
    </div>
  );
}
