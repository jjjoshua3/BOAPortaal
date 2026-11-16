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

function mooiWoord(woord: string): string {
  const s = woord.replace(/\./g, "");
  if (!s) return "";
  return s.slice(0, 1).toUpperCase() + s.slice(1).toLowerCase();
}

function initialen(tekst: string): string[] {
  return tekst
    .split(/\s+/)
    .filter(Boolean)
    .map((woord) => woord.replace(/[^A-Za-z]/g, "").slice(0, 1).toUpperCase())
    .filter(Boolean);
}

function alleenInitialen(tekst: string): boolean {
  const delen = tekst.split(/\s+/).filter(Boolean);
  return delen.length > 0 && delen.every((woord) => /^[A-Za-z]\.?$/.test(woord));
}

export function zichtbareNaam(ruw: string): string {
  const t = String(ruw || "").trim().replace(/\s+/g, " ");
  if (!t || t === "Anoniem" || t === "collega") return t;
  if (t.includes(",")) {
    const [links, rechts] = t.split(",", 2);
    const linksT = links.trim();
    const rechtsT = (rechts || "").trim();
    if (!/[A-Za-z]/.test(rechtsT)) return mooiWoord(linksT);
    if (alleenInitialen(rechtsT)) {
      const inits = rechtsT.split(/\s+/).map((woord) => woord.replace(/\./g, "").slice(0, 1).toUpperCase());
      if (linksT === linksT.toUpperCase()) return `${inits[0]}., ${initialen(linksT).join(" ")}.`;
      return `${mooiWoord(linksT)}, ${inits.join(" ")}.`;
    }
    const letters = initialen(linksT);
    return letters.length ? `${mooiWoord(rechtsT)}, ${letters.join(" ")}.` : mooiWoord(rechtsT);
  }
  const parts = t.split(/\s+/).filter(Boolean);
  const rest = initialen(parts.slice(1).join(" "));
  if (!rest.length) return mooiWoord(parts[0]);
  return `${mooiWoord(parts[0])}, ${rest.join(" ")}.`;
}

export function noteerInlog(token: string, email: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  void fetch("https://systeem.boaportaal.nl/.netlify/functions/inlog", {
    method: "POST",
    headers,
    body: JSON.stringify({ bron: "portaal", email }),
  }).catch(() => undefined);
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
    void sb.rpc("boa_mijn_identiteit").then(async ({ data, error }) => {
      if (weg) return;
      if (error || !data || typeof data !== "object") {
        setFout(error?.message ?? "Client-ID niet beschikbaar.");
        setIdentiteit(null);
        return;
      }
      let rij = data as Identiteit;
      const meta = (user.user_metadata ?? {}) as { naam?: string; roep?: string };
      const bron = meta.roep || (rij.pv_naam === "ONBEKEND, ." ? meta.naam || "" : "");
      const hersteld = zichtbareNaam(bron);
      if (hersteld && hersteld !== "ONBEKEND, ." && rij.pv_naam !== hersteld && (rij.pv_naam === "ONBEKEND, ." || Boolean(meta.roep))) {
        const gezet = await sb.rpc("boa_zet_pv_naam", { p_naam: bron, p_organisatie: null });
        if (!weg && !gezet.error && gezet.data && typeof gezet.data === "object") rij = gezet.data as Identiteit;
      }
      if (weg) return;
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
