import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { scanPii } from "@/lib/boa/privacy";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase/client";

export type OverlegBericht = {
  id: string;
  eigen: boolean;
  soort: "overleg" | "correctie";
  domein: string;
  titel: string;
  tekst: string;
  organisatie: string;
  weergave: string;
  gemaakt: string;
};

const DOMEINEN = new Set(["algemeen", "I", "II", "III", "IV", "V", "VI"]);
const GRATIS = new Set([
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "hotmail.nl",
  "outlook.com",
  "outlook.nl",
  "live.nl",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "yahoo.com",
  "yahoo.nl",
  "ziggo.nl",
  "kpnmail.nl",
  "planet.nl",
  "hetnet.nl",
  "protonmail.com",
  "proton.me",
  "pm.me",
  "gmx.com",
  "gmx.nl",
]);

type Rij = {
  id: string;
  user_id: string;
  soort: "overleg" | "correctie";
  domein: string;
  titel: string;
  tekst: string;
  weergave: string;
  organisatie: string;
  created_at: string;
};

function client(token: string) {
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function gebruiker(token: string) {
  if (token.length < 20) return null;
  const sb = client(token);
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data.user?.id || !data.user.email) return null;
  const email = data.user.email.toLowerCase();
  const domein = email.split("@")[1] ?? "";
  if (email !== "joshua.bosma@kpnmail.nl" && (!domein || GRATIS.has(domein))) return null;
  return { id: data.user.id, email, organisatie: domein, weergave: email.split("@")[0] || "collega" };
}

function leesInvoer(data: unknown): {
  token: string;
  soort: "overleg" | "correctie";
  titel: string;
  tekst: string;
  domein: string;
} {
  if (!data || typeof data !== "object") throw new Error("onvolledig");
  const rij = data as Record<string, unknown>;
  const token = typeof rij.token === "string" ? rij.token : "";
  const soort = rij.soort === "correctie" ? "correctie" : rij.soort === "overleg" ? "overleg" : "";
  const titel = typeof rij.titel === "string" ? rij.titel.trim() : "";
  const tekst = typeof rij.tekst === "string" ? rij.tekst.trim() : "";
  const domein = typeof rij.domein === "string" ? rij.domein : "";
  if (!soort || titel.length < 3 || titel.length > 120 || tekst.length < 5 || tekst.length > 1200) {
    throw new Error("Titel en tekst kloppen niet.");
  }
  if (!DOMEINEN.has(domein)) throw new Error("Kies een domein.");
  const scan = scanPii(`${titel}\n${tekst}`);
  if (scan.hard.length) throw new Error("Telefoon, e-mail en IBAN horen hier niet in.");
  return { token, soort, titel, tekst, domein };
}

function tabelFout(bericht: string): never {
  if (/relation|does not exist|schema cache|42P01/i.test(bericht)) {
    throw new Error("De community-tabel ontbreekt nog in Supabase. Voer het community-SQL eenmalig uit in de SQL Editor.");
  }
  throw new Error(bericht || "Het bord is niet bereikbaar.");
}

export const lijstOverleg = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .handler(async ({ data }): Promise<OverlegBericht[]> => {
    const token = data && typeof data === "object" && typeof (data as { token?: unknown }).token === "string" ? (data as { token: string }).token : "";
    const user = await gebruiker(token);
    if (!user) throw new Error("Meld je aan met een zakelijk of schooladres.");
    const sb = client(token);
    const { data: rijen, error } = await sb
      .from("boa_community")
      .select("id, user_id, soort, domein, titel, tekst, weergave, organisatie, created_at")
      .order("created_at", { ascending: false })
      .limit(80);
    if (error) tabelFout(error.message);
    return ((rijen ?? []) as Rij[]).map((rij) => ({
      id: rij.id,
      eigen: rij.user_id === user.id,
      soort: rij.soort,
      domein: rij.domein,
      titel: rij.titel,
      tekst: rij.tekst,
      organisatie: rij.organisatie,
      weergave: rij.weergave,
      gemaakt: rij.created_at,
    }));
  });

export const plaatsOverleg = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .handler(async ({ data }): Promise<{ id: string }> => {
    const invoer = leesInvoer(data);
    const user = await gebruiker(invoer.token);
    if (!user) throw new Error("Meld je aan met een zakelijk of schooladres.");
    const sb = client(invoer.token);
    const { data: rij, error } = await sb
      .from("boa_community")
      .insert({
        user_id: user.id,
        soort: invoer.soort,
        domein: invoer.domein,
        titel: invoer.titel,
        tekst: invoer.tekst,
        weergave: user.weergave,
        organisatie: user.organisatie,
      })
      .select("id")
      .single();
    if (error) tabelFout(error.message);
    return { id: String((rij as { id: string }).id) };
  });

export const verwijderOverleg = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .handler(async ({ data }): Promise<void> => {
    if (!data || typeof data !== "object") throw new Error("onvolledig");
    const rij = data as { token?: unknown; id?: unknown };
    const token = typeof rij.token === "string" ? rij.token : "";
    const id = typeof rij.id === "string" ? rij.id : "";
    const user = await gebruiker(token);
    if (!user || !id) throw new Error("niet aangemeld");
    const sb = client(token);
    const { error } = await sb.from("boa_community").delete().eq("id", id).eq("user_id", user.id);
    if (error) tabelFout(error.message);
  });
