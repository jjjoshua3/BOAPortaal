import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { RecoveryModal } from "@/components/recovery-modal";
import { getSupabase } from "@/lib/supabase/client";

type AuthValue = {
  ready: boolean;
  session: Session | null;
  user: User | null;
  recovery: boolean;
  openRecovery: () => void;
  closeRecovery: () => void;
};

const Ctx = createContext<AuthValue | null>(null);

export function BoaAuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [recovery, setRecovery] = useState(false);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setReady(true);
      return;
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
    });
    const hash = window.location.hash;
    if (hash.includes("reset-wachtwoord") || hash.includes("type=recovery")) setRecovery(true);
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

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

  return (
    <Ctx.Provider value={value}>
      {children}
      {recovery ? <RecoveryModal onClose={() => setRecovery(false)} /> : null}
    </Ctx.Provider>
  );
}

export function useBoaAuth() {
  const value = useContext(Ctx);
  if (!value) throw new Error("Auth ontbreekt");
  return value;
}
