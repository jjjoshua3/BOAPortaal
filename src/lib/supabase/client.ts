import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://ofzyqwpztohflxdhqgbb.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_x8nU8ype6b1KOL6K8lS2Iw_DDjz4Olr";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
      global: {
        fetch: (input, init) => {
          const headers = new Headers(init?.headers);
          const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
          if (url.includes("/auth/v1/signup")) headers.delete("x-supabase-api-version");
          return fetch(input, { ...init, headers });
        },
      },
    });
  }
  return client;
}

export async function registreerAccount(input: {
  email: string;
  password: string;
  naam: string;
  domein: string;
  rol: string;
  redirectTo: string;
}): Promise<{ fout: string } | { ok: "session" | "mail" }> {
  const url = new URL(`${SUPABASE_URL}/auth/v1/signup`);
  url.searchParams.set("redirect_to", input.redirectTo);
  let body: Record<string, unknown> = {};
  let status = 0;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: input.email.trim(),
        password: input.password,
        data: { naam: input.naam, domein: input.domein, rol: input.rol },
      }),
    });
    status = res.status;
    body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      const message = String(body.message || body.msg || body.error_description || `HTTP ${status}`);
      return { fout: message };
    }
  } catch {
    return { fout: "Geen verbinding met het accountsysteem." };
  }
  const access = typeof body.access_token === "string" ? body.access_token : "";
  const refresh = typeof body.refresh_token === "string" ? body.refresh_token : "";
  if (access && refresh) {
    const sb = getSupabase();
    if (sb) await sb.auth.setSession({ access_token: access, refresh_token: refresh });
    return { ok: "session" };
  }
  return { ok: "mail" };
}

export async function sessieToken(): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session?.access_token ?? null;
}
