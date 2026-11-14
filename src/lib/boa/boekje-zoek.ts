import { BOEKJE_REGELS, type BoekjeRegel } from "@/lib/boa/boekje-regels";

const ANDERS: Record<string, string[]> = {
  negeren: ["niet opvolgen"],
};

export type { BoekjeRegel };

export function zoekBoekje(query: string): BoekjeRegel[] {
  const delen = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!delen.length) return [];
  const scored: { regel: BoekjeRegel; score: number }[] = [];
  for (const regel of BOEKJE_REGELS) {
    const hay = `${regel.code} ${regel.titel} ${regel.toelichting}`.toLowerCase();
    const compact = regel.code.replace(/\s+/g, "").toLowerCase();
    let score = 0;
    let past = true;
    for (const deel of delen) {
      const opties = [deel, ...(ANDERS[deel] ?? [])];
      const raak = opties.some((optie) => hay.includes(optie) || compact.includes(optie.replace(/\s+/g, "")));
      if (!raak) {
        past = false;
        break;
      }
      score += hay.startsWith(deel) ? 3 : 1;
      if (deel === "negeren" && regel.titel.toLowerCase().includes("stopteken")) score += 6;
    }
    if (past) scored.push({ regel, score });
  }
  scored.sort((a, b) => b.score - a.score || a.regel.code.localeCompare(b.regel.code, "nl"));
  return scored.slice(0, 40).map((item) => item.regel);
}
