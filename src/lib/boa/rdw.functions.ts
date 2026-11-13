import { createServerFn } from "@tanstack/react-start";

export type VoertuigKaart = {
  kenteken: string;
  soort: string;
  merk: string;
  handelsbenaming: string;
  kleur: string;
  inrichting: string;
  zitplaatsen: string;
  brandstof: string;
  apk: string;
  apkStatus: "geldig" | "verlopen" | "onbekend";
  wam: "ja" | "nee" | "onbekend";
  toelating: string;
  massa: string;
};

type Rij = Record<string, string | number | null | undefined>;

function alleenKenteken(ruw: string): string {
  return ruw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
}

function datum(waarde: string | number | null | undefined): string {
  const tekst = String(waarde ?? "");
  if (!/^\d{8}$/.test(tekst)) return "";
  return `${tekst.slice(6, 8)}-${tekst.slice(4, 6)}-${tekst.slice(0, 4)}`;
}

function wamStatus(waarde: string | number | null | undefined): VoertuigKaart["wam"] {
  const tekst = String(waarde ?? "").toLowerCase();
  if (tekst === "ja" || tekst === "j") return "ja";
  if (tekst === "nee" || tekst === "n") return "nee";
  return "onbekend";
}

function apkStatus(waarde: string | number | null | undefined): VoertuigKaart["apkStatus"] {
  const tekst = String(waarde ?? "");
  if (!/^\d{8}$/.test(tekst)) return "onbekend";
  const vandaag = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Amsterdam", year: "numeric", month: "2-digit", day: "2-digit" })
    .format(new Date())
    .replaceAll("-", "");
  return tekst >= vandaag ? "geldig" : "verlopen";
}

async function haal(pad: string, kenteken: string): Promise<Rij[]> {
  const url = `https://opendata.rdw.nl/resource/${pad}.json?kenteken=${encodeURIComponent(kenteken)}`;
  const antwoord = await fetch(url, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(8000) });
  if (!antwoord.ok) throw new Error(`rdw ${antwoord.status}`);
  const json = (await antwoord.json()) as unknown;
  return Array.isArray(json) ? (json as Rij[]) : [];
}

export const zoekKenteken = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .handler(async ({ data }): Promise<VoertuigKaart | null> => {
    const ruw = data && typeof data === "object" && typeof (data as { kenteken?: unknown }).kenteken === "string" ? (data as { kenteken: string }).kenteken : "";
    const kenteken = alleenKenteken(ruw);
    if (kenteken.length < 4) throw new Error("Vul een kenteken in, zonder naam van een persoon.");
    const [basis, brandstof] = await Promise.all([haal("m9d7-ebf2", kenteken), haal("8ys7-d773", kenteken)]);
    const rij = basis[0];
    if (!rij) return null;
    const brandstoffen = brandstof
      .map((item) => (typeof item.brandstof_omschrijving === "string" ? item.brandstof_omschrijving : ""))
      .filter(Boolean);
    const kleur = [rij.eerste_kleur, rij.tweede_kleur].filter((deel) => typeof deel === "string" && deel).join(" | ");
    return {
      kenteken: typeof rij.kenteken === "string" ? rij.kenteken : kenteken,
      soort: String(rij.voertuigsoort ?? ""),
      merk: String(rij.merk ?? ""),
      handelsbenaming: String(rij.handelsbenaming ?? ""),
      kleur,
      inrichting: String(rij.inrichting ?? ""),
      zitplaatsen: rij.aantal_zitplaatsen == null ? "" : String(rij.aantal_zitplaatsen),
      brandstof: brandstoffen.join(" | "),
      apk: datum(rij.vervaldatum_apk),
      apkStatus: apkStatus(rij.vervaldatum_apk),
      wam: wamStatus(rij.wam_verzekerd),
      toelating: datum(rij.datum_eerste_toelating),
      massa: rij.massa_ledig_voertuig == null ? "" : `${rij.massa_ledig_voertuig} kg ledig`,
    };
  });
