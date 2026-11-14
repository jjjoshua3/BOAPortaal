import { BOEKJE_REGELS, type BoekjeRegel } from "@/lib/boa/boekje-regels";

export type { BoekjeRegel };

const ANDERS: Record<string, string[]> = {
  negeren: ["niet opvolgen"],
};

export type BedragRegel = { wie: string; uitleg: string; bedrag: string };

const CAT_B: [string, string][] = [
  ["Auto", "motorvoertuig op meer dan twee wielen, en de brommobiel"],
  ["Motor", "motorvoertuig op twee wielen"],
  ["Brommer", "bromfiets, snorfiets en bijzondere bromfiets"],
  ["Fiets", "fiets en gehandicaptenvoertuig"],
  ["Voetganger", "voetganger"],
  ["Overig", "overige weggebruiker"],
  ["Schipper", "gezagvoerder of schipper"],
  ["Een ieder", "een ieder"],
];

const CAT_C: [string, string][] = [
  ["Auto", "motorvoertuig, niet de vrachtauto, autobus of combinatie"],
  ["Vrachtauto of combinatie", "vrachtauto, autobus of motorvoertuig met aanhangwagen"],
  ["Brommer", "bromfiets, brommobiel, snorfiets en gehandicaptenvoertuig met motor"],
  ["Tractor", "landbouwtrekker, mobiele machine of motorrijtuig met beperkte snelheid"],
];

export function bedragRegels(code: string, ruw: string): BedragRegel[] {
  const delen = ruw.trim().split(/\s+/).filter(Boolean);
  if (!delen.length || delen.every((deel) => deel === "*")) return [];
  const netjes = delen.every((deel) => deel === "*" || /^\d+$/.test(deel));
  if (!netjes || delen.length === 1) {
    const een = delen[0] === "*" ? "" : delen[0];
    if (!een || !/^\d+$/.test(een)) return [];
    return [{ wie: "", uitleg: "", bedrag: `€ ${een}` }];
  }
  const schema = /^V[A-Z]\b/.test(code) ? CAT_C : /^(R|S|K)\b/.test(code) ? CAT_B : null;
  if (!schema || delen.length > schema.length) {
    return delen.map((deel, index) => ({
      wie: `Kolom ${index + 1}`,
      uitleg: "zie de categorie-indeling bij deze afdeling in het Feitenboekje",
      bedrag: deel === "*" ? "geen vast bedrag" : `€ ${deel}`,
    }));
  }
  return delen.map((deel, index) => ({
    wie: schema[index][0],
    uitleg: schema[index][1],
    bedrag: deel === "*" ? "geen vast bedrag" : `€ ${deel}`,
  }));
}

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
