export type DomeinId = "algemeen" | "I" | "II" | "III" | "IV" | "V" | "VI";
export type DomeinFilter = "alle" | "I" | "II" | "III" | "IV" | "V" | "VI";
export type Rol = "boa" | "student" | "docent";
export type Toon = "navy" | "stop" | "amber" | "ok";
export type Afdoening = "wahv" | "om" | "misdrijf" | "bsb" | "bestuur" | "overdracht" | "werkwijze";

export const DOMEIN_INFO: { id: DomeinId; label: string; kort: string; tekst: string }[] = [
  {
    id: "algemeen",
    label: "Algemeen",
    kort: "Sv, Sr, Awb, Ambtsinstructie, RTGB, WID",
    tekst: "Bevoegdheden en strafbepalingen die in elk domein kunnen spelen, altijd binnen de akte van opsporing.",
  },
  {
    id: "I",
    label: "Domein I | Openbare ruimte",
    kort: "APV, afval, parkeren/RVV 1990, Alcoholwet, jeugdoverlast",
    tekst: "Orde in de openbare ruimte: afval, parkeren, alcohol, honden en samenscholing. Veel feiten staan in de APV en zijn dus lokaal.",
  },
  {
    id: "II",
    label: "Domein II | Milieu, welzijn en infrastructuur",
    kort: "Omgevingswet, natuur, Visserijwet 1963, Wet dieren, vuurwerk",
    tekst: "Toezicht en opsporing rond milieu, natuur, vissen, dierenwelzijn en vuurwerk.",
  },
  {
    id: "III",
    label: "Domein III | Onderwijs",
    kort: "Leerplichtwet 1969, absoluut/relatief/luxe verzuim, Halt",
    tekst: "Leerplicht, verzuimregistratie en de route naar Halt of het Openbaar Ministerie.",
  },
  {
    id: "IV",
    label: "Domein IV | Openbaar vervoer",
    kort: "Wp2000, BP2000, art. 70/72/73, verblijfsontzegging, Spoorwegwet",
    tekst: "Vervoerbewijs, orde en veiligheid in voertuig en station, en de aanwijzing van de vervoerder.",
  },
  {
    id: "V",
    label: "Domein V | Werk, inkomen en zorg",
    kort: "Participatiewet, art. 17, huisbezoek, fraudeonderzoek",
    tekst: "Inlichtingenplicht en rechtmatigheid. Een woning betreed je alleen met toestemming of een geldige titel.",
  },
  {
    id: "VI",
    label: "Domein VI | Generieke opsporing",
    kort: "Ondersteuning politie, verkeer, algemene opsporingstaken",
    tekst: "Algemene opsporing, voor zover de akte dat uitdrukkelijk toestaat. Veel verkeersmisdrijven blijven politietaken.",
  },
];

export const FILTERS: { id: DomeinFilter; label: string }[] = [
  { id: "alle", label: "Alle domeinen | Sv, Sr, Awb, Ambtsinstructie, RTGB, WID" },
  { id: "I", label: "Domein I | Openbare ruimte" },
  { id: "II", label: "Domein II | Milieu, welzijn en infrastructuur" },
  { id: "III", label: "Domein III | Onderwijs" },
  { id: "IV", label: "Domein IV | Openbaar vervoer" },
  { id: "V", label: "Domein V | Werk, inkomen en zorg" },
  { id: "VI", label: "Domein VI | Generieke opsporing" },
];

export const ROLLEN: { id: Rol; label: string; kort: string }[] = [
  {
    id: "boa",
    label: "BOA | operationeel op straat",
    kort: "Zakkaartjes, feitcodes, cautie, beslisbomen en PV-bouwstenen.",
  },
  {
    id: "student",
    label: "Student | HTV / BOA-basis",
    kort: "ExTH-eisen, rechtskennis, misdrijf/overtreding en sfeerovergang.",
  },
  {
    id: "docent",
    label: "Docent / praktijkbegeleider",
    kort: "Rollenspel, beoordelingsmatrix en vaste rechtspraak.",
  },
];

export function domeinLabel(id: DomeinId): string {
  return DOMEIN_INFO.find((d) => d.id === id)?.label ?? id;
}

export function pastFilter(domeinen: DomeinId[], filter: DomeinFilter): boolean {
  if (filter === "alle") return true;
  return domeinen.includes(filter) || domeinen.includes("algemeen");
}

export function afdoeningToon(a: Afdoening): Toon {
  if (a === "misdrijf" || a === "overdracht") return "stop";
  if (a === "bsb" || a === "bestuur") return "amber";
  if (a === "werkwijze") return "ok";
  return "navy";
}

export function toonClass(toon: Toon): string {
  if (toon === "stop") return "accent-stop";
  if (toon === "amber") return "accent-amber";
  if (toon === "ok") return "accent-ok";
  return "accent-navy";
}

export function tagClass(toon: Toon): string {
  if (toon === "stop") return "tag tag-stop";
  if (toon === "amber") return "tag tag-amber";
  if (toon === "ok") return "tag tag-ok";
  return "tag tag-navy";
}
