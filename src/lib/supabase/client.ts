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
    });
  }
  return client;
}

export async function sessieToken(): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session?.access_token ?? null;
}
