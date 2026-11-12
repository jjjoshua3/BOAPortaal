import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { getSql } from "@/lib/db";
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

type Payload = {
  soort: "overleg" | "correctie";
  domein: string;
  titel: string;
  tekst: string;
  organisatie: string;
  weergave: string;
};

async function gebruiker(token: string) {
  if (token.length < 20) return null;
  const sb = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data.user?.id || !data.user.email) return null;
  const email = data.user.email.toLowerCase();
  const domein = email.split("@")[1] ?? "";
  if (email !== "joshua.bosma@kpnmail.nl" && (!domein || GRATIS.has(domein))) return null;
  return { id: data.user.id, email, organisatie: domein, weergave: email.split("@")[0] || "collega" };
}

async function sleutel() {
  const sql = await getSql();
  const bestaand = await sql<{ key: string }>`select key from boa_seal where id = 1`;
  if (bestaand[0]?.key) return Buffer.from(bestaand[0].key, "hex");
  const vers = randomBytes(32).toString("hex");
  await sql`insert into boa_seal (id, key) values (1, ${vers}) on conflict (id) do nothing`;
  const opnieuw = await sql<{ key: string }>`select key from boa_seal where id = 1`;
  if (!opnieuw[0]?.key) throw new Error("sleutel");
  return Buffer.from(opnieuw[0].key, "hex");
}

function sluit(key: Buffer, tekst: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const cijfer = Buffer.concat([cipher.update(tekst, "utf8"), cipher.final()]);
  return { iv: iv.toString("base64"), tag: cipher.getAuthTag().toString("base64"), cipher: cijfer.toString("base64") };
}

function open(key: Buffer, iv: string, tag: string, cipher: string): Payload | null {
  try {
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64"));
    decipher.setAuthTag(Buffer.from(tag, "base64"));
    const tekst = Buffer.concat([decipher.update(Buffer.from(cipher, "base64")), decipher.final()]).toString("utf8");
    const waarde = JSON.parse(tekst) as Payload;
    if (!waarde || (waarde.soort !== "overleg" && waarde.soort !== "correctie")) return null;
    if (typeof waarde.titel !== "string" || typeof waarde.tekst !== "string") return null;
    return waarde;
  } catch {
    return null;
  }
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
  if (scan.hard.length) throw new Error("BSN, telefoon, e-mail en IBAN horen hier niet in.");
  return { token, soort, titel, tekst, domein };
}

export const lijstOverleg = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .handler(async ({ data }): Promise<OverlegBericht[]> => {
    const token = data && typeof data === "object" && typeof (data as { token?: unknown }).token === "string" ? (data as { token: string }).token : "";
    const user = await gebruiker(token);
    if (!user) throw new Error("Meld je aan met een zakelijk of schooladres.");
    const key = await sleutel();
    const sql = await getSql();
    const rijen = await sql<{ id: string; user_id: string; iv: string; tag: string; cipher: string; created_at: string | Date }>`
      select id, user_id, iv, tag, cipher, created_at
      from boa_overleg
      order by created_at desc
      limit 80
    `;
    const uit: OverlegBericht[] = [];
    for (const rij of rijen) {
      const payload = open(key, rij.iv, rij.tag, rij.cipher);
      if (!payload) continue;
      uit.push({
        id: rij.id,
        eigen: rij.user_id === user.id,
        soort: payload.soort,
        domein: payload.domein,
        titel: payload.titel,
        tekst: payload.tekst,
        organisatie: payload.organisatie,
        weergave: payload.weergave,
        gemaakt: new Date(rij.created_at).toISOString(),
      });
    }
    return uit;
  });

export const plaatsOverleg = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .handler(async ({ data }): Promise<{ id: string }> => {
    const invoer = leesInvoer(data);
    const user = await gebruiker(invoer.token);
    if (!user) throw new Error("Meld je aan met een zakelijk of schooladres.");
    const payload: Payload = {
      soort: invoer.soort,
      domein: invoer.domein,
      titel: invoer.titel,
      tekst: invoer.tekst,
      organisatie: user.organisatie,
      weergave: user.weergave,
    };
    const key = await sleutel();
    const gesloten = sluit(key, JSON.stringify(payload));
    const id = crypto.randomUUID();
    const sql = await getSql();
    await sql`
      insert into boa_overleg (id, user_id, iv, tag, cipher)
      values (${id}, ${user.id}, ${gesloten.iv}, ${gesloten.tag}, ${gesloten.cipher})
    `;
    return { id };
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
    const sql = await getSql();
    await sql`delete from boa_overleg where id = ${id} and user_id = ${user.id}`;
  });
