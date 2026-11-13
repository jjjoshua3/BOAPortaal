/** Invulmodel van proces-verbaal A1/B1 (model 113111, versie 06/2018). Geen afdruk van het OM. */

export type BonModel = "A1" | "B1";
export type SoortBon = "S" | "K" | "A" | "B" | "O" | "T";
export type Geslacht = "" | "man" | "vrouw";
export type WegSoort = "" | "1" | "2" | "3" | "5" | "6";
export type Eed = "" | "eed" | "belofte";
export type Wie = "" | "1" | "2";
export type Punt = { x: number; y: number };
export type Streek = Punt[];

export type Combibon = {
  model: BonModel;
  instantie: string;
  soorten: SoortBon[];
  zaak: string;
  dag: string;
  maand: string;
  jaar: string;
  tijd: string;
  bonNummer: string;
  plaats: string;
  wegcode: string;
  hm: string;
  te: string;
  gemeente: string;
  soortVoertuig: string;
  land: string;
  kenteken: string;
  dupl: string;
  merk: string;
  typeVoertuig: string;
  kleur: string;
  zag: boolean;
  hoorde: boolean;
  stelde: boolean;
  gedraging: string;
  categorie: string;
  feitnummer: string;
  sanctie: string;
  gevraagdOp: string;
  docRbw: boolean;
  docPasp: boolean;
  docId: boolean;
  docVreemd: boolean;
  docMilitair: boolean;
  documentnummer: string;
  bsn: string;
  geslacht: Geslacht;
  naam: string;
  voorvoegsel: string;
  voornamen: string;
  geboorteplaats: string;
  geboorteland: string;
  geboortedatum: string;
  adres: string;
  huisnr: string;
  postcode: string;
  woonplaats: string;
  woongemeente: string;
  woonland: string;
  zittingDatum: string;
  zittingTijd: string;
  zittingPlaats: string;
  kwitantie: string;
  adminVoldaan: boolean;
  afwijkend: string;
  omNaam: string;
  bewaring: boolean;
  wegsleep: boolean;
  beslag: boolean;
  weg: WegSoort;
  rijbaan: boolean;
  fietspad: boolean;
  bubeko: boolean;
  bibeko: boolean;
  snelGemeten: string;
  snelGecorrigeerd: string;
  snelToegestaan: string;
  beginnend: boolean;
  projectcode: string;
  gehoord: Wie;
  cautie: boolean;
  welkeFeit: boolean;
  rechtsbijstand: boolean;
  vertolking: boolean;
  afstandBijstand: boolean;
  taal: string;
  tolknummer: string;
  geenVerklaring: boolean;
  verklaring: string;
  v1Eed: Eed;
  v1Datum: string;
  v1Nummer: string;
  v1Hovj: boolean;
  v1Naam: string;
  v1Hand: Streek[];
  v2Eed: Eed;
  v2Datum: string;
  v2Nummer: string;
  v2Hovj: boolean;
  v2Naam: string;
  v2Hand: Streek[];
  binnenkomst: string;
  redenen: string;
};

const KEY = "boa-combibon-v1";

const SOORTEN: SoortBon[] = ["S", "K", "A", "B", "O", "T"];

export const SOORT_LABEL: Record<SoortBon, string> = {
  S: "Aankondiging van strafbeschikking",
  K: "Kennisgeving van bekeuring",
  A: "Aankondiging van beschikking",
  B: "Beschikking",
  O: "Oproeping",
  T: "Tonen",
};

export function leegBon(nu = new Date()): Combibon {
  return {
    model: "A1",
    instantie: "",
    soorten: [],
    zaak: "",
    dag: String(nu.getDate()).padStart(2, "0"),
    maand: String(nu.getMonth() + 1).padStart(2, "0"),
    jaar: String(nu.getFullYear()),
    tijd: `${String(nu.getHours()).padStart(2, "0")}:${String(nu.getMinutes()).padStart(2, "0")}`,
    bonNummer: "",
    plaats: "",
    wegcode: "",
    hm: "",
    te: "",
    gemeente: "",
    soortVoertuig: "",
    land: "NL",
    kenteken: "",
    dupl: "",
    merk: "",
    typeVoertuig: "",
    kleur: "",
    zag: false,
    hoorde: false,
    stelde: false,
    gedraging: "",
    categorie: "",
    feitnummer: "",
    sanctie: "",
    gevraagdOp: "",
    docRbw: false,
    docPasp: false,
    docId: false,
    docVreemd: false,
    docMilitair: false,
    documentnummer: "",
    bsn: "",
    geslacht: "",
    naam: "",
    voorvoegsel: "",
    voornamen: "",
    geboorteplaats: "",
    geboorteland: "",
    geboortedatum: "",
    adres: "",
    huisnr: "",
    postcode: "",
    woonplaats: "",
    woongemeente: "",
    woonland: "",
    zittingDatum: "",
    zittingTijd: "",
    zittingPlaats: "",
    kwitantie: "",
    adminVoldaan: false,
    afwijkend: "",
    omNaam: "",
    bewaring: false,
    wegsleep: false,
    beslag: false,
    weg: "",
    rijbaan: false,
    fietspad: false,
    bubeko: false,
    bibeko: false,
    snelGemeten: "",
    snelGecorrigeerd: "",
    snelToegestaan: "",
    beginnend: false,
    projectcode: "",
    gehoord: "",
    cautie: false,
    welkeFeit: false,
    rechtsbijstand: false,
    vertolking: false,
    afstandBijstand: false,
    taal: "",
    tolknummer: "",
    geenVerklaring: false,
    verklaring: "",
    v1Eed: "",
    v1Datum: "",
    v1Nummer: "",
    v1Hovj: false,
    v1Naam: "",
    v1Hand: [],
    v2Eed: "",
    v2Datum: "",
    v2Nummer: "",
    v2Hovj: false,
    v2Naam: "",
    v2Hand: [],
    binnenkomst: "",
    redenen: "",
  };
}

function isSoort(value: string): value is SoortBon {
  return (SOORTEN as string[]).includes(value);
}

function streken(value: unknown): Streek[] {
  if (!Array.isArray(value)) return [];
  const uit: Streek[] = [];
  for (const stroke of value.slice(0, 80)) {
    if (!Array.isArray(stroke)) continue;
    const punten: Punt[] = [];
    for (const punt of stroke.slice(0, 600)) {
      if (!punt || typeof punt !== "object") continue;
      const x = (punt as { x?: unknown }).x;
      const y = (punt as { y?: unknown }).y;
      if (typeof x !== "number" || typeof y !== "number") continue;
      if (x < 0 || x > 1 || y < 0 || y > 1) continue;
      punten.push({ x, y });
    }
    if (punten.length) uit.push(punten);
  }
  return uit;
}

export function normaliseer(parsed: unknown): Combibon | null {
  if (!parsed || typeof parsed !== "object") return null;
  const ruw = parsed as Partial<Combibon>;
  if (ruw.model !== "A1" && ruw.model !== "B1") return null;
  const basis = leegBon();
  basis.model = ruw.model;
  for (const key of Object.keys(basis) as (keyof Combibon)[]) {
    if (key === "model" || key === "soorten" || key === "v1Hand" || key === "v2Hand") continue;
    const huidig = basis[key];
    const binnen = ruw[key];
    if (typeof huidig === "string" && typeof binnen === "string") {
      (basis[key] as string) = binnen.slice(0, 4000);
    } else if (typeof huidig === "boolean" && typeof binnen === "boolean") {
      (basis[key] as boolean) = binnen;
    }
  }
  basis.soorten = Array.isArray(ruw.soorten) ? ruw.soorten.filter((item): item is SoortBon => typeof item === "string" && isSoort(item)) : [];
  basis.geslacht = ruw.geslacht === "man" || ruw.geslacht === "vrouw" ? ruw.geslacht : "";
  basis.weg = ruw.weg === "1" || ruw.weg === "2" || ruw.weg === "3" || ruw.weg === "5" || ruw.weg === "6" ? ruw.weg : "";
  basis.gehoord = ruw.gehoord === "1" || ruw.gehoord === "2" ? ruw.gehoord : "";
  basis.v1Eed = ruw.v1Eed === "eed" || ruw.v1Eed === "belofte" ? ruw.v1Eed : "";
  basis.v2Eed = ruw.v2Eed === "eed" || ruw.v2Eed === "belofte" ? ruw.v2Eed : "";
  basis.v1Hand = streken(ruw.v1Hand);
  basis.v2Hand = streken(ruw.v2Hand);
  return basis;
}

export function leesConcept(): Combibon | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return normaliseer(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function schrijfConcept(bon: Combibon) {
  localStorage.setItem(KEY, JSON.stringify(bon));
}

export function wisConcept() {
  localStorage.removeItem(KEY);
}

export function splitFeitcode(code: string): { categorie: string; nummer: string } {
  const m = code.trim().match(/^([A-Z])\s+(.+)$/);
  if (!m) return { categorie: "", nummer: code.trim() };
  return { categorie: m[1], nummer: m[2].trim() };
}

/** Alleen een vast eurobedrag. Geen zin, geen verordening. */
export function euroUitTarief(tarief?: string): string {
  if (!tarief) return "";
  const m = tarief.match(/€\s*(\d{2,4})\b/);
  if (!m) return "";
  if (/geen vast|verordening|niet in een vuistregel/i.test(tarief) && !/€\s*\d{2,4}\s*\|/.test(tarief)) return "";
  return m[1];
}

/** Kluis krijgt het feit, niet de persoon. */
export function kluisTekst(b: Combibon): string {
  const soort = b.soorten.length ? b.soorten.map((item) => `${item} ${SOORT_LABEL[item]}`).join(" | ") : "-";
  return [
    `COMBIBON ${b.model}`,
    `Soort: ${soort}`,
    `Zaak: ${b.zaak}`,
    `Datum: ${b.dag}-${b.maand}-${b.jaar} ${b.tijd}`,
    `Plaats: ${b.plaats}`,
    `Te: ${b.te}`,
    `Gemeente: ${b.gemeente}`,
    `Wegcode: ${b.wegcode} | HM-paal: ${b.hm}`,
    `Kenteken: ${b.kenteken} | land ${b.land} | ${b.soortVoertuig} | ${b.merk} | ${b.typeVoertuig} | ${b.kleur}`,
    `Feit: ${b.categorie} ${b.feitnummer}`,
    `Gedraging: ${b.gedraging}`,
    `Sanctiebedrag: ${b.sanctie}`,
    `Wegsoort: ${b.weg || "-"} | rijbaan ${b.rijbaan ? "ja" : "nee"} | fietspad ${b.fietspad ? "ja" : "nee"} | ${b.bibeko ? "binnen de bebouwde kom" : ""} ${b.bubeko ? "buiten de bebouwde kom" : ""}`,
    `Snelheid gemeten ${b.snelGemeten} | gecorrigeerd ${b.snelGecorrigeerd} | toegestaan ${b.snelToegestaan} | beginnend ${b.beginnend ? "ja" : "nee"}`,
    `Projectcode: ${b.projectcode}`,
    `Verbalisantnummer op de bon: ${b.bonNummer}`,
    "Geen naam, adres, geboortedatum, documentnummer, BSN of verklaring.",
  ].join("\n");
}
