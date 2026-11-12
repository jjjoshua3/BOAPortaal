import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { decryptString, encryptString, newSalt, vaultKey } from "@/lib/crypto/vault";
import { scanPii } from "@/lib/boa/privacy";
import { useBoaAuth } from "@/lib/supabase/auth";
import { getSupabase } from "@/lib/supabase/client";

export type Opslag = "uitgelogd" | "bezig" | "pgcrypto" | "lokaal";
type Kind = "notitie" | "favoriet" | "sjabloon" | "audit";

type Sealed = {
  id: string;
  kind: Kind;
  iv: string;
  salt: string;
  cipher: string;
  updatedAt: string;
};

export type Note = { id: string; titel: string; body: string; updatedAt: string };
export type Audit = { id: string; actie: string; updatedAt: string };

type RpcRow = {
  id: string;
  kind: Kind;
  iv: string;
  salt: string;
  client_cipher: string;
  updated_at: string;
};

type KluisValue = {
  opslag: Opslag;
  melding: string;
  notes: Note[];
  sjablonen: Note[];
  favorieten: string[];
  audits: Audit[];
  isFavoriet: (id: string) => boolean;
  toggleFavoriet: (id: string) => Promise<void>;
  saveNote: (input: { id?: string; titel: string; body: string; zachtAkkoord: boolean }) => Promise<string | null>;
  deleteNote: (id: string) => Promise<void>;
  saveSjabloon: (titel: string, body: string) => Promise<string | null>;
  deleteSjabloon: (id: string) => Promise<void>;
  exportAll: () => Promise<void>;
  logActie: (actie: string) => Promise<void>;
  wipeLocal: () => void;
};

const Ctx = createContext<KluisValue | null>(null);
const GUEST = "boa-guest-favs";

function storageKey(userId: string) {
  return `boa-sealed:${userId}`;
}

function readSealed(userId: string): Sealed[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Sealed[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSealed(userId: string, rows: Sealed[]) {
  localStorage.setItem(storageKey(userId), JSON.stringify(rows));
}

function readGuest(): string[] {
  try {
    const raw = localStorage.getItem(GUEST);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

async function ensureSalt(user: User): Promise<string> {
  const meta = user.user_metadata as { vault_salt?: string } | undefined;
  if (meta?.vault_salt && meta.vault_salt.length > 8) return meta.vault_salt;
  const existing = readSealed(user.id)[0]?.salt;
  if (existing) return existing;
  const salt = newSalt();
  const sb = getSupabase();
  if (sb) await sb.auth.updateUser({ data: { vault_salt: salt } });
  return salt;
}

async function openPayload(user: User, row: Sealed): Promise<unknown | null> {
  if (!user.email) return null;
  try {
    const key = await vaultKey(user.id, user.email, row.salt);
    const text = await decryptString(key, row.iv, row.cipher);
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function toNote(row: Sealed, payload: unknown): Note | null {
  if (!payload || typeof payload !== "object") return null;
  const rec = payload as { titel?: unknown; body?: unknown };
  return { id: row.id, titel: asText(rec.titel) || "Zonder titel", body: asText(rec.body), updatedAt: row.updatedAt };
}

function toAudit(row: Sealed, payload: unknown): Audit | null {
  if (!payload || typeof payload !== "object") return null;
  const rec = payload as { actie?: unknown };
  return { id: row.id, actie: asText(rec.actie) || "actie", updatedAt: row.updatedAt };
}

async function pullRemote(user: User): Promise<{ rows: Sealed[]; remote: boolean }> {
  const sb = getSupabase();
  if (!sb) return { rows: readSealed(user.id), remote: false };
  const { data, error } = await sb.rpc("vault_list");
  if (error || !Array.isArray(data)) return { rows: readSealed(user.id), remote: false };
  const rows: Sealed[] = (data as RpcRow[]).map((row) => ({
    id: row.id,
    kind: row.kind,
    iv: row.iv,
    salt: row.salt,
    cipher: row.client_cipher,
    updatedAt: row.updated_at,
  }));
  writeSealed(user.id, rows);
  return { rows, remote: true };
}

async function push(user: User, row: Sealed): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.rpc("vault_put", {
    p_id: row.id,
    p_kind: row.kind,
    p_iv: row.iv,
    p_salt: row.salt,
    p_client_cipher: row.cipher,
  });
  return !error;
}

export function KluisProvider({ children }: { children: ReactNode }) {
  const { user, ready } = useBoaAuth();
  const [opslag, setOpslag] = useState<Opslag>("bezig");
  const [melding, setMelding] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [sjablonen, setSjablonen] = useState<Note[]>([]);
  const [favorieten, setFavorieten] = useState<string[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [favId, setFavId] = useState<string | null>(null);
  const [salt, setSalt] = useState<string>("");

  const decode = useCallback(async (current: User, rows: Sealed[]) => {
    const nextNotes: Note[] = [];
    const nextSjablonen: Note[] = [];
    const nextAudits: Audit[] = [];
    let nextFav: string[] = [];
    let nextFavId: string | null = null;
    for (const row of rows) {
      const payload = await openPayload(current, row);
      if (row.kind === "notitie") {
        const note = toNote(row, payload);
        if (note) nextNotes.push(note);
      } else if (row.kind === "sjabloon") {
        const note = toNote(row, payload);
        if (note) nextSjablonen.push(note);
      } else if (row.kind === "audit") {
        const audit = toAudit(row, payload);
        if (audit) nextAudits.push(audit);
      } else if (row.kind === "favoriet" && payload && typeof payload === "object") {
        const ids = (payload as { ids?: unknown }).ids;
        if (Array.isArray(ids)) {
          nextFav = ids.filter((id): id is string => typeof id === "string");
          nextFavId = row.id;
        }
      }
    }
    nextNotes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    nextSjablonen.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    nextAudits.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    setNotes(nextNotes);
    setSjablonen(nextSjablonen);
    setFavorieten(nextFav);
    setAudits(nextAudits.slice(0, 12));
    setFavId(nextFavId);
  }, []);

  useEffect(() => {
    let stop = false;
    if (!ready) return () => undefined;
    if (!user?.email) {
      setOpslag("uitgelogd");
      setNotes([]);
      setSjablonen([]);
      setAudits([]);
      setFavorieten(readGuest());
      setFavId(null);
      setSalt("");
      setMelding("Favorieten blijven op dit apparaat. Notities en sjablonen vragen een zakelijk account.");
      return () => undefined;
    }
    setOpslag("bezig");
    void (async () => {
      const current = user;
      const pulled = await pullRemote(current);
      if (stop) return;
      await decode(current, pulled.rows);
      const nextSalt = await ensureSalt(current);
      if (stop) return;
      setSalt(nextSalt);
      setOpslag(pulled.remote ? "pgcrypto" : "lokaal");
      setMelding(
        pulled.remote
          ? "Opgeslagen als cijfertekst. De browser versleutelt met AES-GCM, de database wikkelt dat met pgcrypto."
          : "De databasefuncties zijn op dit project nog niet actief. De kluis staat versleuteld in deze browser. De SQL staat in het colofon.",
      );
      const guest = readGuest();
      if (guest.length) {
        const rows = readSealed(current.id);
        const favRow = rows.find((row) => row.kind === "favoriet");
        let ids = guest;
        if (favRow) {
          const payload = await openPayload(current, favRow);
          const bestaand = payload && typeof payload === "object" ? (payload as { ids?: unknown }).ids : [];
          const prev = Array.isArray(bestaand) ? bestaand.filter((id): id is string => typeof id === "string") : [];
          ids = [...new Set([...prev, ...guest])];
        }
        if (!stop) {
          localStorage.removeItem(GUEST);
          await persistKind(current, nextSalt, favRow?.id ?? crypto.randomUUID(), "favoriet", { ids });
        }
      }
    })();
    return () => {
      stop = true;
    };
  }, [decode, ready, user]);

  async function persistKind(current: User, useSalt: string, id: string, kind: Kind, payload: unknown) {
    if (!current.email) return false;
    const key = await vaultKey(current.id, current.email, useSalt);
    const sealedText = await encryptString(key, JSON.stringify(payload));
    const row: Sealed = {
      id,
      kind,
      iv: sealedText.iv,
      salt: useSalt,
      cipher: sealedText.cipher,
      updatedAt: new Date().toISOString(),
    };
    const rows = readSealed(current.id).filter((item) => item.id !== id);
    rows.push(row);
    writeSealed(current.id, rows);
    const remote = await push(current, row);
    setOpslag(remote ? "pgcrypto" : "lokaal");
    await decode(current, readSealed(current.id));
    return remote;
  }

  const toggleFavoriet = useCallback(
    async (id: string) => {
      if (!user?.email) {
        const next = readGuest().includes(id) ? readGuest().filter((item) => item !== id) : [...readGuest(), id];
        localStorage.setItem(GUEST, JSON.stringify(next));
        setFavorieten(next);
        return;
      }
      const useSalt = salt || (await ensureSalt(user));
      setSalt(useSalt);
      const next = favorieten.includes(id) ? favorieten.filter((item) => item !== id) : [...favorieten, id];
      await persistKind(user, useSalt, favId ?? crypto.randomUUID(), "favoriet", { ids: next });
    },
    [favId, favorieten, salt, user],
  );

  const saveNote = useCallback(
    async (input: { id?: string; titel: string; body: string; zachtAkkoord: boolean }) => {
      if (!user?.email) return "Log in met een zakelijk adres om de notitie in de kluis te zetten.";
      const scan = scanPii(`${input.titel}\n${input.body}`);
      if (scan.hard.length) return "Opslaan geblokkeerd. Haal BSN, telefoon, e-mail en IBAN eruit.";
      if (scan.zacht.length && !input.zachtAkkoord) return "Er staat iets wat op een naam lijkt. Vink de controle aan of herschrijf met [VERDACHTE].";
      const useSalt = salt || (await ensureSalt(user));
      setSalt(useSalt);
      await persistKind(user, useSalt, input.id ?? crypto.randomUUID(), "notitie", {
        titel: input.titel.trim() || "Zonder titel",
        body: input.body.trim(),
      });
      await persistKind(user, useSalt, crypto.randomUUID(), "audit", { actie: "Notitie opgeslagen" });
      return null;
    },
    [salt, user],
  );

  const deleteNote = useCallback(
    async (id: string) => {
      if (!user) return;
      const sb = getSupabase();
      if (sb) await sb.rpc("vault_delete", { p_id: id });
      writeSealed(user.id, readSealed(user.id).filter((row) => row.id !== id));
      await decode(user, readSealed(user.id));
    },
    [decode, user],
  );

  const saveSjabloon = useCallback(
    async (titel: string, body: string) => {
      if (!user?.email) return "Log in om het PV-concept versleuteld op te slaan.";
      const scan = scanPii(`${titel}\n${body}`);
      if (scan.hard.length) return "Opslaan geblokkeerd. Het concept bevat een BSN, telefoon, e-mail of IBAN.";
      const useSalt = salt || (await ensureSalt(user));
      setSalt(useSalt);
      await persistKind(user, useSalt, crypto.randomUUID(), "sjabloon", { titel, body });
      await persistKind(user, useSalt, crypto.randomUUID(), "audit", { actie: "PV-sjabloon opgeslagen" });
      return null;
    },
    [salt, user],
  );

  const deleteSjabloon = useCallback(
    async (id: string) => {
      if (!user) return;
      const sb = getSupabase();
      if (sb) await sb.rpc("vault_delete", { p_id: id });
      writeSealed(user.id, readSealed(user.id).filter((row) => row.id !== id));
      await decode(user, readSealed(user.id));
    },
    [decode, user],
  );

  const logActie = useCallback(
    async (actie: string) => {
      if (!user?.email) return;
      const useSalt = salt || (await ensureSalt(user));
      setSalt(useSalt);
      await persistKind(user, useSalt, crypto.randomUUID(), "audit", { actie });
    },
    [salt, user],
  );

  const exportAll = useCallback(async () => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            bron: "BOA Portaal",
            letop: "Onversleutelde export. Bewaar dit bestand buiten het portaal en deel het niet.",
            notities: notes,
            sjablonen,
            favorieten,
            audit: audits,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "boa-portaal-kluis.json";
    link.click();
    URL.revokeObjectURL(url);
    if (user?.email) {
      const useSalt = salt || (await ensureSalt(user));
      await persistKind(user, useSalt, crypto.randomUUID(), "audit", { actie: "Export gemaakt" });
    }
  }, [audits, favorieten, notes, salt, sjablonen, user]);

  const wipeLocal = useCallback(() => {
    if (user) localStorage.removeItem(storageKey(user.id));
    localStorage.removeItem(GUEST);
    setNotes([]);
    setSjablonen([]);
    setFavorieten([]);
    setAudits([]);
  }, [user]);

  const value = useMemo<KluisValue>(
    () => ({
      opslag,
      melding,
      notes,
      sjablonen,
      favorieten,
      audits,
      isFavoriet: (id: string) => favorieten.includes(id),
      toggleFavoriet,
      saveNote,
      deleteNote,
      saveSjabloon,
      deleteSjabloon,
      exportAll,
      logActie,
      wipeLocal,
    }),
    [audits, deleteNote, deleteSjabloon, exportAll, favorieten, logActie, melding, notes, opslag, saveNote, saveSjabloon, sjablonen, toggleFavoriet, wipeLocal],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useKluis() {
  const value = useContext(Ctx);
  if (!value) throw new Error("Kluis ontbreekt");
  return value;
}
