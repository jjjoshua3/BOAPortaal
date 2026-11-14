import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { useBoaAuth } from "@/lib/supabase/auth";

export type Identiteit = {
  client_id: string;
  pv_naam: string;
  organisatie: string;
  locked: boolean;
};

const DEELTJES = new Set(["de", "van", "der", "den", "ten", "ter", "het", "t"]);

export function naarPv(raw: string): string {
  const t = raw.trim().replace(/\s+/g, " ");
  if (!t) return "";
  if (t.includes(",")) {
    const [links, rechts] = t.split(",", 2);
    const achternaam = links.trim().toUpperCase();
    const rest = (rechts ?? "").trim();
    if (/^[A-Za-z](\.[A-Za-z])*\.?$/.test(rest)) {
      return `${achternaam}, ${rest.toUpperCase().endsWith(".") ? rest.toUpperCase() : `${rest.toUpperCase()}.`}`;
    }
  }
  const parts = t.replace(",", " ").split(/\s+/).filter(Boolean);
  let start = parts.length - 1;
  while (start > 0 && DEELTJES.has(parts[start - 1].toLowerCase())) start -= 1;
  const achternaam = parts.slice(start).join(" ").toUpperCase();
  const init = parts
    .slice(0, start)
    .map((woord) => (/^[A-Za-z](\.[A-Za-z])*\.?$/.test(woord) ? woord.replace(/\./g, "") : woord.slice(0, 1)))
    .join(".")
    .toUpperCase();
  return init ? `${achternaam}, ${init}.` : `${achternaam}, .`;
}

export function useIdentiteit() {
  const { user } = useBoaAuth();
  const [identiteit, setIdentiteit] = useState<Identiteit | null>(null);
  const [fout, setFout] = useState("");

  useEffect(() => {
    if (!user) {
      setIdentiteit(null);
      setFout("");
      return;
    }
    const sb = getSupabase();
    if (!sb) return;
    let weg = false;
    void sb.rpc("boa_mijn_identiteit").then(({ data, error }) => {
      if (weg) return;
      if (error || !data || typeof data !== "object") {
        setFout(error?.message ?? "Client-ID niet beschikbaar.");
        setIdentiteit(null);
        return;
      }
      const rij = data as Identiteit;
      setFout("");
      setIdentiteit({
        client_id: String(rij.client_id ?? ""),
        pv_naam: String(rij.pv_naam ?? ""),
        organisatie: String(rij.organisatie ?? ""),
        locked: Boolean(rij.locked),
      });
    });
    return () => {
      weg = true;
    };
  }, [user?.id]);

  return { identiteit, fout, setIdentiteit };
}
