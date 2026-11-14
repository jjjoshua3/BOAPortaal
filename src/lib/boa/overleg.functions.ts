import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { scanPii } from "@/lib/boa/privacy";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase/client";

export type OverlegBericht = {
  id: string;
  eigen: boolean;
  parent_id: string | null;
  soort: "overleg" | "correctie";
  domein: string;
  titel: string;
  tekst: string;
  organisatie: string;
  weergave: string;
  gemaakt: string;
  score: number;
  mijn_stem: -1 | 0 | 1;
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
  parent_id: string | null;
  soort: "overleg" | "correctie";
  domein: string;
  titel: string;
  tekst: string;
  weergave: string;
  organisatie: string;
  created_at: string;
};

type Stem = {
  bericht_id: string;
  user_id: string;
  waarde: number;
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
  parent_id: string | null;
} {
  if (!data || typeof data !== "object") throw new Error("onvolledig");
  const rij = data as Record<string, unknown>;
  const token = typeof rij.token === "string" ? rij.token : "";
  const soort = rij.soort === "correctie" ? "correctie" : rij.soort === "overleg" ? "overleg" : "";
  const titel = typeof rij.titel === "string" ? rij.titel.trim() : "";
  const tekst = typeof rij.tekst === "string" ? rij.tekst.trim() : "";
  const domein = typeof rij.domein === "string" ? rij.domein : "";
  const parent_id = typeof rij.parent_id === "string" && rij.parent_id ? rij.parent_id : null;
  if (!soort || titel.length < 3 || titel.length > 120 || tekst.length < 5 || tekst.length > 1200) {
    throw new Error("Titel en tekst kloppen niet.");
  }
  if (!DOMEINEN.has(domein)) throw new Error("Kies een domein.");
  const scan = scanPii(`${titel}\n${tekst}`);
  if (scan.hard.length) throw new Error("Telefoon, e-mail en IBAN horen hier niet in.");
  return { token, soort, titel, tekst, domein, parent_id };
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
      .select("id, user_id, parent_id, soort, domein, titel, tekst, weergave, organisatie, created_at")
      .order("created_at", { ascending: false })
      .limit(120);
    if (error) tabelFout(error.message);

    const ids = ((rijen ?? []) as Rij[]).map((r) => r.id);
    let stemmen: Stem[] = [];
    if (ids.length) {
      const { data: s, error: se } = await sb
        .from("boa_community_stemmen")
        .select("bericht_id, user_id, waarde")
        .in("bericht_id", ids);
      if (!se && s) stemmen = s as Stem[];
    }

    const scoreMap = new Map<string, number>();
    const mijnMap = new Map<string, -1 | 0 | 1>();
    for (const s of stemmen) {
      scoreMap.set(s.bericht_id, (scoreMap.get(s.bericht_id) ?? 0) + s.waarde);
      if (s.user_id === user.id) mijnMap.set(s.bericht_id, s.waarde as -1 | 1);
    }

    return ((rijen ?? []) as Rij[]).map((rij) => ({
      id: rij.id,
      eigen: rij.user_id === user.id,
      parent_id: rij.parent_id,
      soort: rij.soort,
      domein: rij.domein,
      titel: rij.titel,
      tekst: rij.tekst,
      organisatie: rij.organisatie,
      weergave: rij.weergave,
      gemaakt: rij.created_at,
      score: scoreMap.get(rij.id) ?? 0,
      mijn_stem: mijnMap.get(rij.id) ?? 0,
    }));
  });

export const plaatsOverleg = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .handler(async ({ data }): Promise<{ id: string }> => {
    const invoer = leesInvoer(data);
    const user = await gebruiker(invoer.token);
    if (!user) throw new Error("Meld je aan met een zakelijk of schooladres.");
    const sb = client(invoer.token);
    const { data: ident } = await sb.from("boa_identiteit").select("pv_naam, client_id").eq("user_id", user.id).maybeSingle();
    const { data: rij, error } = await sb
      .from("boa_community")
      .insert({
        user_id: user.id,
        parent_id: invoer.parent_id,
        soort: invoer.parent_id ? "correctie" : invoer.soort,
        domein: invoer.domein,
        titel: invoer.titel,
        tekst: invoer.tekst,
        weergave: ident?.pv_naam || "collega",
        organisatie: ident?.client_id || user.organisatie,
      })
      .select("id")
      .single();
    if (error) tabelFout(error.message);
    return { id: String((rij as { id: string }).id) };
  });

export const stemOverleg = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .handler(async ({ data }): Promise<{ score: number; mijn_stem: -1 | 0 | 1 }> => {
    if (!data || typeof data !== "object") throw new Error("onvolledig");
    const rij = data as { token?: unknown; id?: unknown; waarde?: unknown };
    const token = typeof rij.token === "string" ? rij.token : "";
    const id = typeof rij.id === "string" ? rij.id : "";
    const waarde = rij.waarde === 1 || rij.waarde === -1 ? (rij.waarde as 1 | -1) : null;
    const user = await gebruiker(token);
    if (!user || !id) throw new Error("niet aangemeld");
    const sb = client(token);

    if (waarde === null) {
      await sb.from("boa_community_stemmen").delete().eq("bericht_id", id).eq("user_id", user.id);
    } else {
      const { error } = await sb.from("boa_community_stemmen").upsert(
        { bericht_id: id, user_id: user.id, waarde },
        { onConflict: "bericht_id,user_id" },
      );
      if (error) tabelFout(error.message);
    }

    const { data: alle } = await sb.from("boa_community_stemmen").select("user_id, waarde").eq("bericht_id", id);
    const score = (alle ?? []).reduce((s, r) => s + (r.waarde as number), 0);
    const mijn = (alle ?? []).find((r) => r.user_id === user.id);
    return { score, mijn_stem: mijn ? (mijn.waarde as -1 | 1) : 0 };
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
