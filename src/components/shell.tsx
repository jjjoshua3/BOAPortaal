import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  FileText,
  GitBranch,
  GraduationCap,
  LayoutGrid,
  Lock,
  Menu,
  Moon,
  Scale,
  ScrollText,
  Search,
  BookOpen,
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
  "/colofon": Scale,
} as const;

type Item = { to: keyof typeof ICONS; label: string };

const ORDER: Record<Rol, Item[]> = {
  boa: [
    { to: "/zakkaart", label: "Zakkaart" },
    { to: "/feitcodes", label: "Feitcodes" },
    { to: "/dienst", label: "Werkbank" },
    { to: "/beslisbomen", label: "Beslisbomen" },
    { to: "/pv", label: "PV-bouwer" },
    { to: "/trainer", label: "Trainer" },
    { to: "/kluis", label: "Kluis" },
  ],
  student: [
    { to: "/trainer", label: "Trainer" },
    { to: "/beslisbomen", label: "Beslisbomen" },
    { to: "/dienst", label: "Werkbank" },
    { to: "/feitcodes", label: "Feitcodes" },
    { to: "/zakkaart", label: "Zakkaart" },
    { to: "/pv", label: "PV-bouwer" },
    { to: "/kluis", label: "Kluis" },
  ],
  docent: [
    { to: "/trainer", label: "Trainer" },
    { to: "/beslisbomen", label: "Beslisbomen" },
    { to: "/dienst", label: "Werkbank" },
    { to: "/pv", label: "PV-bouwer" },
    { to: "/feitcodes", label: "Feitcodes" },
    { to: "/zakkaart", label: "Zakkaart" },
    { to: "/kluis", label: "Kluis" },
  ],
};

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const rol = usePrefs((state) => state.rol);
  const domein = usePrefs((state) => state.domein);
  const theme = usePrefs((state) => state.theme);
  const setRol = usePrefs((state) => state.setRol);
  const setDomein = usePrefs((state) => state.setDomein);
  const toggleTheme = usePrefs((state) => state.toggleTheme);
  const { user, ready } = useBoaAuth();
  const [meer, setMeer] = useState(false);
  const items = ORDER[rol];
  const rolTekst = ROLLEN.find((item) => item.id === rol)?.kort;

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
      <header className="no-print bg-brand text-on-brand">
        <div className="flex h-14 items-center gap-3 border-b border-white/15 px-3">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <img src="/boa-mark.png" alt="" className="size-8 shrink-0" />
            <span className="truncate font-semibold tracking-tight">BOA Portaal</span>
          </Link>
          <span className="hidden text-silver sm:inline" aria-hidden="true">
            |
          </span>
          <span className="hidden truncate text-sm text-silver md:inline">Naslag domein I–VI</span>
          <div className="ml-auto flex items-center gap-2">
            <button type="button" className="btn min-h-10 border-white/20 bg-transparent px-2 text-on-brand" onClick={toggleTheme}>
              {theme === "night" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              <span className="hidden sm:inline">{theme === "night" ? "Dag" : "Nachtdienst"}</span>
            </button>
            <span className="text-silver" aria-hidden="true">
              |
            </span>
            <Link to="/account" className="btn min-h-10 border-white/20 bg-transparent px-2 text-on-brand">
              {ready && user?.email ? user.email.split("@")[0] : "Account"}
            </Link>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 bg-brand-2 px-3 py-2">
          <label className="grid gap-1 text-xs font-semibold text-silver">
            Domein
            <select
              className="mast-select max-w-[16rem] sm:max-w-xs"
              value={domein}
              onChange={(event) => setDomein(event.target.value as DomeinFilter)}
            >
              {FILTERS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <span className="mt-4 hidden text-silver sm:inline" aria-hidden="true">
            |
          </span>
          <label className="grid gap-1 text-xs font-semibold text-silver">
            Rol
            <select className="mast-select" value={rol} onChange={(event) => setRol(event.target.value as Rol)}>
              {ROLLEN.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <p className="mt-4 hidden max-w-md text-sm text-silver lg:block">{rolTekst}</p>
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <nav className="no-print hidden w-52 shrink-0 border-r border-line bg-panel lg:block">
          <ul className="grid gap-1 p-2">
            {items.map((item) => {
              const Icon = ICONS[item.to];
              const active = path === item.to;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={`flex min-h-11 items-center gap-2 px-2 text-sm font-semibold ${active ? "bg-inset text-ink" : "text-muted"}`}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-line p-2">
            <Link to="/jargon" className={`flex min-h-11 items-center gap-2 px-2 text-sm font-semibold ${path === "/jargon" ? "bg-inset text-ink" : "text-muted"}`}>
              <BookOpen className="size-4" />
              Vakjargon
            </Link>
            <Link to="/colofon" className="flex min-h-11 items-center gap-2 px-2 text-sm font-semibold text-muted">
              <Scale className="size-4" />
              Colofon
            </Link>
            <Link to="/privacy" className={`flex min-h-11 items-center gap-2 px-2 text-sm font-semibold ${path === "/privacy" ? "bg-inset text-ink" : "text-muted"}`}>
              Privacy
            </Link>
          </div>
        </nav>
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="min-w-0 flex-1">{children}</main>
          <footer className="no-print border-t border-line px-4 py-3 text-xs text-muted mb-[4.5rem] lg:mb-0">
            <p>Onafhankelijke naslag. Geen publicatie van het OM, de politie of een gemeente. De akte en de geldende wettekst gaan voor.</p>
            <p className="mt-1">
              <Link to="/privacy" className="underline">
                Privacy
              </Link>
              <span aria-hidden="true"> | </span>
              <Link to="/jargon" className="underline">
                Vakjargon
              </Link>
              <span aria-hidden="true"> | </span>
              <Link to="/colofon" className="underline">
                Colofon
              </Link>
              <span aria-hidden="true"> | </span>
              Ontworpen door{" "}
              <a className="underline" href="https://jjjoshua3.netlify.app/" target="_blank" rel="noreferrer">
                Joshua
              </a>
            </p>
          </footer>
        </div>
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
                Vakjargon
              </Link>
              <Link to="/colofon" className="btn justify-start">
                Colofon
              </Link>
              <Link to="/privacy" className="btn justify-start">
                Privacy
              </Link>
              <Link to="/account" className="btn justify-start">
                Account
              </Link>
            </div>
          </div>
        </div>
      ) : null}
      <FeedbackDock />
    </div>
  );
}
