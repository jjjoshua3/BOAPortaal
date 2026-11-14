import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { RecoveryModal } from "@/components/recovery-modal";
import { Tweestap, Vergeten, leesTweestap } from "@/components/tweestap";
import { getSupabase } from "@/lib/supabase/client";

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

export function BoaAuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [recovery, setRecovery] = useState(false);
  const [poort, setPoort] = useState<Poort>(null);
  const [vergeten, setVergeten] = useState(false);
  const [mfaUit, setMfaUit] = useState(false);

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
      return;
    }
    let weg = false;
    void leesTweestap(sb).then((uitkomst) => {
      if (weg) return;
      if (uitkomst === "uit") {
        setPoort(null);
        setMfaUit(true);
        return;
      }
      setMfaUit(false);
      if (uitkomst === "klaar") setPoort(null);
      else setPoort(uitkomst);
    });
    return () => {
      weg = true;
    };
  }, [session?.user?.id, recovery]);

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
      {children}
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
