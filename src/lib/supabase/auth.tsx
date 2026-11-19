import { createContext, useContext, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { RecoveryModal, Meter } from "@/components/recovery-modal";
import { Tweestap, Vergeten, leesTweestap } from "@/components/tweestap";
import { getSupabase } from "@/lib/supabase/client";
import { passwordIssues, passwordScore } from "@/lib/supabase/guards";

type AuthValue = {
  ready: boolean;
  session: Session | null;
  user: User | null;
  recovery: boolean;
  openRecovery: () => void;
  closeRecovery: () => void;
};

type Poort = { modus: "setup" | "code"; factorId: string; qr: string; geheim: string; naam: "portaal" | "beheer" } | null;

const Ctx = createContext<AuthValue | null>(null);
const ONTHOUD = "boa-onthoud";
const ZWAK = "boa-wachtwoord-zwak";

export function markeerWachtwoord(password: string, email: string) {
  if (passwordIssues(password, [email]).length) localStorage.setItem(ZWAK, "1");
  else localStorage.removeItem(ZWAK);
  window.dispatchEvent(new Event("boa-wachtwoord"));
}

export function BoaAuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [recovery, setRecovery] = useState(false);
  const [poort, setPoort] = useState<Poort>(null);
  const [vergeten, setVergeten] = useState(false);
  const [gecontroleerd, setGecontroleerd] = useState(false);
  const [mfaUit, setMfaUit] = useState(false);
  const [zwak, setZwak] = useState(false);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setReady(true);
      return;
    }
    if (typeof window !== "undefined" && localStorage.getItem("boa-vergeten") === "30") {
      localStorage.removeItem("boa-vergeten");
      setVergeten(true);
    }
    try {
      const ruw = localStorage.getItem(ONTHOUD);
      if (ruw) {
        const bewaard = JSON.parse(ruw) as { tot?: number; lang?: string };
        if (bewaard.tot && Date.now() > bewaard.tot) {
          localStorage.removeItem(ONTHOUD);
          if (bewaard.lang === "30") localStorage.setItem("boa-vergeten", "30");
          void sb.auth.signOut();
        }
      }
    } catch {
      localStorage.removeItem(ONTHOUD);
    }
    let alive = true;
    void sb.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = sb.auth.onAuthStateChange((event, next) => {
      setSession(next);
      setReady(true);
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
      if (!next) setPoort(null);
    });
    const hash = window.location.hash;
    if (hash.includes("reset-wachtwoord") || hash.includes("type=recovery")) setRecovery(true);
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb || !session || recovery) {
      setPoort(null);
      setGecontroleerd(true);
      return;
    }
    let weg = false;
    setGecontroleerd(false);
    void leesTweestap(sb).then((uitkomst) => {
      if (weg) return;
      if (uitkomst === "uit") {
        setPoort(null);
        setMfaUit(true);
      } else {
        setMfaUit(false);
        setPoort(uitkomst === "klaar" ? null : uitkomst);
      }
      setGecontroleerd(true);
    });
    return () => {
      weg = true;
    };
  }, [session?.user?.id, recovery]);

  useEffect(() => {
    const lees = () => setZwak(Boolean(session) && localStorage.getItem(ZWAK) === "1");
    lees();
    window.addEventListener("boa-wachtwoord", lees);
    return () => window.removeEventListener("boa-wachtwoord", lees);
  }, [session]);

  const value = useMemo<AuthValue>(
    () => ({
      ready,
      session,
      user: session?.user ?? null,
      recovery,
      openRecovery: () => setRecovery(true),
      closeRecovery: () => setRecovery(false),
    }),
    [ready, recovery, session],
  );

  const sb = typeof window === "undefined" ? null : getSupabase();

  return (
    <Ctx.Provider value={value}>
      {gecontroleerd && !poort && !zwak ? children : <div className="fixed inset-0 bg-[#0b1320]" />}
      {zwak && session ? (
        <ZwakWachtwoord
          email={session.user.email || ""}
          onKlaar={() => {
            localStorage.removeItem(ZWAK);
            setZwak(false);
          }}
        />
      ) : null}
      {recovery ? <RecoveryModal onClose={() => setRecovery(false)} /> : null}
      {poort && sb ? (
        <Tweestap
          sb={sb}
          stap={poort}
          onKlaar={() => {
            setPoort(null);
            setMfaUit(false);
            void sb.auth.getSession().then(({ data }) => setSession(data.session));
          }}
        />
      ) : null}
      {mfaUit && session && !poort ? (
        <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-[#E3D9CC] bg-[#F3E6D4] px-4 py-3 text-center text-sm text-[#9A5B12]">
          Tweestapsverificatie staat nog uit. Je bent ingelogd met alleen je wachtwoord.
          <button type="button" className="ml-3 underline" onClick={() => setMfaUit(false)}>
            Sluiten
          </button>
        </div>
      ) : null}
      {vergeten ? <Vergeten onSluit={() => setVergeten(false)} /> : null}
    </Ctx.Provider>
  );
}

export function useBoaAuth() {
  const value = useContext(Ctx);
  if (!value) throw new Error("Auth ontbreekt");
  return value;
}

export function onthoudSessie(lang: "30" | "12") {
  const uur = lang === "30" ? 30 * 24 : 12;
  localStorage.setItem(ONTHOUD, JSON.stringify({ tot: Date.now() + uur * 60 * 60 * 1000, lang }));
}

function ZwakWachtwoord({ email, onKlaar }: { email: string; onKlaar: () => void }) {
  const [password, setPassword] = useState("");
  const [again, setAgain] = useState("");
  const [fout, setFout] = useState("");
  const [bezig, setBezig] = useState(false);
  const extra = [email];
  const issues = passwordIssues(password, extra);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (issues.length) {
      setFout(`Nog nodig: ${issues.join(", ")}.`);
      return;
    }
    if (password !== again) {
      setFout("De twee wachtwoorden zijn niet gelijk.");
      return;
    }
    const sb = getSupabase();
    if (!sb) return;
    setBezig(true);
    setFout("");
    const { error } = await sb.auth.updateUser({ password });
    setBezig(false);
    if (error) {
      setFout("Het nieuwe wachtwoord is niet opgeslagen. Kies een langere zin.");
      return;
    }
    onKlaar();
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-[#0b1320]/80 p-4">
      <form className="grid w-full max-w-md gap-3 rounded-2xl bg-[#f7f1e8] p-5 text-[#1c1915]" onSubmit={(event) => void onSubmit(event)}>
        <h2 className="text-xl font-semibold">Je wachtwoord is te makkelijk</h2>
        <p className="text-sm text-[#5c564e]">
          Bij deze aanmelding voldoet het niet meer. Kies nu een nieuw wachtwoord. Minstens 12 tekens, een hoofdletter, een cijfer, een speciaal teken, en 30 dagen kraaktijd. Een zin van vier willekeurige woorden met die tekens erin werkt.
        </p>
        <label className="grid gap-1 text-sm">
          Nieuw wachtwoord
          <input className="rounded-lg border border-[#e3d9cc] px-3 py-2" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        <Meter score={passwordScore(password, extra)} />
        {issues.length ? <p className="text-xs text-[#5c564e]">Nog nodig: {issues.join(", ")}.</p> : null}
        <label className="grid gap-1 text-sm">
          Herhaal
          <input className="rounded-lg border border-[#e3d9cc] px-3 py-2" type="password" autoComplete="new-password" value={again} onChange={(event) => setAgain(event.target.value)} required />
        </label>
        {fout ? <p className="text-sm text-[#9a3412]">{fout}</p> : null}
        <button className="btn btn-brand" type="submit" disabled={bezig || issues.length > 0 || password !== again}>
          {bezig ? "Opslaan…" : "Wachtwoord opslaan"}
        </button>
      </form>
    </div>
  );
}
