import { getSupabase } from "@/lib/supabase/client";

export type PostSoort = "melding" | "overleg";

export type OverlegRegel = {
  id: string;
  onderwerp: string;
  domein: string;
  tekst: string;
  created_at: string;
  eigen: boolean;
};

export function leesbarePostfout(message: string): string {
  const laag = message.toLowerCase();
  if (laag.includes("boa_post") || laag.includes("schema cache") || laag.includes("could not find") || laag.includes("pgrst202")) {
    return "Het gedeelde, versleutelde kanaal is nog niet bereikbaar. Je tekst is niet naar andere collega’s gestuurd.";
  }
  if (laag.includes("niet aangemeld") || laag.includes("jwt")) {
    return "Log opnieuw in. De sessie is verlopen.";
  }
  return "Versturen lukte niet. Probeer het opnieuw.";
}

export async function postVersleuteld(input: {
  soort: PostSoort;
  onderwerp: string;
  domein: string;
  tekst: string;
}): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return "Geen verbinding met het account.";
  const { error } = await sb.rpc("boa_post_put", {
    p_soort: input.soort,
    p_onderwerp: input.onderwerp.slice(0, 140),
    p_domein: input.domein.slice(0, 40),
    p_tekst: input.tekst.slice(0, 4000),
  });
  if (error) return leesbarePostfout(error.message);
  return null;
}

export async function leesOverleg(): Promise<{ regels: OverlegRegel[]; fout: string | null }> {
  const sb = getSupabase();
  if (!sb) return { regels: [], fout: "Geen verbinding met het account." };
  const { data, error } = await sb.rpc("boa_overleg_list");
  if (error) return { regels: [], fout: leesbarePostfout(error.message) };
  const regels = Array.isArray(data) ? (data as OverlegRegel[]) : [];
  return { regels, fout: null };
}
