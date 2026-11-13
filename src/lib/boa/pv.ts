import type { Feit } from "@/lib/boa/feitcodes";
import { domeinLabel, type DomeinId } from "@/lib/boa/meta";

export type Regime = "bevindingen" | "straf" | "mulder";
export type Identiteit = "" | "paspoort" | "idkaart" | "rijbewijs" | "weigering" | "kenteken";
export type LeeftijdCat = "" | "18" | "16" | "12";

export type PvInvoer = {
  regime: Regime;
  koppel: "ik" | "wij";
  verbalisant: string;
  uniform: "uniform" | "burger";
  domein: DomeinId;
  identiteit: Identiteit;
  leeftijd: LeeftijdCat;
  feit: Feit | null;
  plaats: string;
  straat: string;
  locatieZin: string;
  datum: string;
  tijd: string;
  tijd2: string;
  waarmee: string;
  aanleiding: string;
  cautie: boolean;
  verklaring: string;
  geenVerklaring: boolean;
  waarneming: string;
  sfeer: boolean;
  aanhouding: boolean;
  fouillering: boolean;
  boeien: boolean;
  overdracht: boolean;
};

export function leegPv(domein: DomeinId = "I"): PvInvoer {
  const stempel = stempelNu();
  return {
    regime: "bevindingen",
    koppel: "ik",
    verbalisant: "",
    uniform: "uniform",
    domein,
    identiteit: "",
    leeftijd: "",
    feit: null,
    plaats: "",
    straat: "",
    locatieZin: "",
    datum: stempel.datum,
    tijd: stempel.tijd,
    tijd2: "",
    waarmee: "",
    aanleiding: "",
    cautie: false,
    verklaring: "",
    geenVerklaring: false,
    waarneming: "",
    sfeer: false,
    aanhouding: false,
    fouillering: false,
    boeien: false,
    overdracht: false,
  };
}

export function stempelNu(): { datum: string; tijd: string } {
  const now = new Date();
  return {
    datum: now.toISOString().slice(0, 10),
    tijd: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
  };
}

export function persoon(invoer: PvInvoer): "verdachte" | "betrokkene" {
  return invoer.regime === "straf" ? "verdachte" : "betrokkene";
}

function vul(waarde: string, leeg: string) {
  const tekst = waarde.trim();
  return tekst || leeg;
}

function datumLang(iso: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "[DATUM]";
  const [jaar, maand, dag] = iso.split("-");
  return `${Number(dag)}-${maand}-${jaar}`;
}

function identiteitZin(invoer: PvInvoer) {
  const wie = persoon(invoer);
  if (invoer.identiteit === "paspoort") return `De identiteit van de ${wie} is vastgesteld via een ter inzage getoond geldig Nederlands paspoort.`;
  if (invoer.identiteit === "idkaart") return `De identiteit van de ${wie} is vastgesteld via een ter inzage getoonde Nederlandse identiteitskaart.`;
  if (invoer.identiteit === "rijbewijs") return `De identiteit van de ${wie} is vastgesteld via een ter inzage getoond Nederlands rijbewijs.`;
  if (invoer.identiteit === "weigering") {
    return `Ik heb de ${wie} gevorderd een identiteitsbewijs ter inzage te tonen. De ${wie} heeft aan die vordering niet voldaan. Dat kan, vanaf 14 jaar, feitcode D 517 zijn (artikel 447e van het Wetboek van Strafrecht).`;
  }
  if (invoer.identiteit === "kenteken") return `Er is niet staande gehouden. De gedraging is geconstateerd op het kenteken.`;
  return "";
}

function leeftijdZin(invoer: PvInvoer) {
  if (invoer.leeftijd === "18") return "De betrokkene is meerderjarig.";
  if (invoer.leeftijd === "16") return "Het gaat om een jeugdige van 16 of 17 jaar. Bij een Mulder-gedraging geldt het volledige bedrag.";
  if (invoer.leeftijd === "12") return "Het gaat om een jeugdige van 12 tot en met 15 jaar. Het tarief wordt gehalveerd. Halt is te toetsen. Onder de 14 jaar geldt geen eigen toonplicht voor een identiteitsbewijs.";
  return "";
}

function kledingZin(invoer: PvInvoer) {
  if (invoer.uniform === "burger") return "in burger, gelegitimeerd met het BOA-legitimatiebewijs";
  return "in uniform gekleed";
}

export function pvWaarschuwingen(invoer: PvInvoer): string[] {
  const uit: string[] = [];
  const verklaring = invoer.verklaring.trim().length > 0 && !invoer.geenVerklaring;
  if (invoer.regime === "straf" && verklaring && !invoer.cautie) {
    uit.push("Let op (vormfout-check): er is een verklaring van de verdachte ingevuld bij een strafrechtelijk feit, maar het vinkje 'Cautie gegeven voor aanvang verhoor (art. 29 Sv)' staat nog uit.");
  }
  if (/dronken|agressief/i.test(invoer.waarneming)) {
    uit.push("Let op: 'dronken' en 'agressief' zijn conclusies. Schrijf wat je zag, hoorde, rook of voelde, bijvoorbeeld een alcohollucht, onvast lopen of schreeuwen.");
  }
  if (invoer.regime === "mulder" && /verdachte/i.test(`${invoer.waarneming} ${invoer.verklaring}`)) {
    uit.push("Bij Wet Mulder schrijf je betrokkene en gedraging, niet verdachte.");
  }
  return uit;
}

export type WStatus = { id: string; label: string; ok: boolean };

export function wStatus(invoer: PvInvoer): WStatus[] {
  return [
    { id: "wie", label: "Wie", ok: Boolean(invoer.verbalisant.trim()) },
    { id: "wat", label: "Wat", ok: Boolean(invoer.feit) },
    { id: "waar", label: "Waar", ok: Boolean(invoer.plaats.trim() || invoer.straat.trim()) },
    { id: "wanneer", label: "Wanneer", ok: Boolean(invoer.datum && invoer.tijd) },
    { id: "waarmee", label: "Waarmee", ok: Boolean(invoer.waarmee.trim()) },
    { id: "waarom", label: "Waarom", ok: Boolean(invoer.aanleiding.trim()) },
    { id: "hoe", label: "Hoe", ok: Boolean(invoer.waarneming.trim()) },
  ];
}

export function kwaliteit(invoer: PvInvoer) {
  const status = wStatus(invoer);
  const klaar = status.filter((item) => item.ok).length;
  return Math.round((klaar / status.length) * 100);
}

export function bouwPv(invoer: PvInvoer): string {
  const wie = persoon(invoer);
  const ikKlein = invoer.koppel === "wij" ? "wij" : "ik";
  const mij = invoer.koppel === "wij" ? "ons" : "mij";
  const domein = invoer.domein;
  const feitKop = invoer.feit ? `${invoer.feit.code} | ${invoer.feit.titel}` : "[FEITCODE]";
  const titel =
    invoer.regime === "mulder"
      ? "PROCES-VERBAAL VAN BEVINDINGEN"
      : invoer.regime === "straf"
        ? "PROCES-VERBAAL VAN BEVINDINGEN"
        : "PROCES-VERBAAL VAN BEVINDINGEN";
  const regimeRegel =
    invoer.regime === "mulder"
      ? "Regime: Wet Mulder / Wahv. Termen: betrokkene en gedraging."
      : invoer.regime === "straf"
        ? "Regime: strafrecht / politiestrafbeschikking. Termen: verdachte en strafbaar feit."
        : "Regime: bevindingen, algemeen of ter overdracht.";
  const locatie = [invoer.locatieZin.trim(), invoer.straat.trim() && `ter hoogte van ${invoer.straat.trim()}`, invoer.plaats.trim() && `te ${invoer.plaats.trim()}`]
    .filter(Boolean)
    .join(", ");
  const naam = vul(invoer.verbalisant, "[VERBALISANT]");
  const aanhef =
    invoer.koppel === "wij"
      ? `Op ${datumLang(invoer.datum)}, omstreeks ${vul(invoer.tijd, "[TIJD]")} uur, bevonden wij, verbalisanten, ${naam}, ons als buitengewoon opsporingsambtenaar domein ${domein}, ${kledingZin(invoer)} en belast met toezicht en handhaving${locatie ? ` ${locatie}` : " op de voor het openbaar verkeer openstaande weg"}.`
      : `Op ${datumLang(invoer.datum)}, omstreeks ${vul(invoer.tijd, "[TIJD]")} uur, bevond ik, ${naam}, buitengewoon opsporingsambtenaar domein ${domein}, mij ${kledingZin(invoer)} en belast met toezicht en handhaving${locatie ? ` ${locatie}` : " op de voor het openbaar verkeer openstaande weg"}.`;
  const aanleiding = invoer.aanleiding.trim() ? `De aanleiding was: ${invoer.aanleiding.trim()}` : "";
  const waarmee = invoer.waarmee.trim() ? `Daarbij was betrokken: ${invoer.waarmee.trim()}.` : "";
  const tweede = invoer.tijd2.trim() ? `Een eerste waarneming deed ${ikKlein} om ${invoer.tijd.trim() || "[TIJD]"} uur. Een tweede waarneming deed ${ikKlein} om ${invoer.tijd2.trim()} uur.` : "";
  const waarneming = invoer.waarneming.trim();
  const idZin = identiteitZin(invoer);
  const leeftijd = leeftijdZin(invoer);
  const cautie = invoer.cautie
    ? `Voorafgaand aan het verhoor heb ${ikKlein} de ${wie} medegedeeld dat hij niet tot antwoorden verplicht is.`
    : "";
  let verklaring = "";
  if (invoer.geenVerklaring) verklaring = `De ${wie} wenste geen verklaring af te leggen.`;
  else if (invoer.verklaring.trim()) verklaring = `De ${wie} verklaarde, woordelijk: "${invoer.verklaring.trim()}"`;
  const extra = [
    invoer.sfeer ? "De sfeer is overgegaan van toezicht op grond van de Algemene wet bestuursrecht naar opsporing op grond van het Wetboek van Strafvordering." : "",
    invoer.aanhouding ? `Ik heb de ${wie} op heterdaad aangehouden als bedoeld in artikel 53 van het Wetboek van Strafvordering.` : "",
    invoer.fouillering
      ? "Ik heb een onderzoek aan de kleding gedaan als bedoeld in artikel 7, derde lid, van de Ambtsinstructie, noodzakelijk voor de veiligheid en gericht op wapens of gevaarlijke voorwerpen."
      : "",
    invoer.boeien
      ? `Ik heb de ${wie} handboeien aangelegd op grond van artikel 22 van de Ambtsinstructie, omdat een lichter middel niet volstond.`
      : "",
    invoer.overdracht ? `De ${wie} is overgedragen aan de politie dan wel voorgeleid aan een hulpofficier van justitie.` : "",
  ].filter(Boolean);
  const feitZin = invoer.feit
    ? `Het betreft ${invoer.regime === "mulder" ? "de gedraging" : "het strafbare feit"} ${invoer.feit.code}, ${invoer.feit.titel} (${invoer.feit.artikel}).`
    : "";
  const afdoening = invoer.feit
    ? `Aan de ${wie} werd een aankondiging van beschikking of een kennisgeving van bekeuring uitgereikt ter zake van feitcode ${invoer.feit.code}.`
    : "";
  const slot = `Waarvan door ${mij}, ${invoer.koppel === "wij" ? "verbalisanten" : "verbalisant"}, op ambtseed / ambtsbelofte is opgemaakt dit proces-verbaal, dat ${ikKlein} sloot en ondertekende te ${vul(invoer.plaats, "[PLAATS]")} op ${datumLang(invoer.datum)}.`;

  const alinea = [aanleiding, tweede, waarneming, waarmee, feitZin].filter(Boolean).join(" ");
  const midden = [idZin, leeftijd, cautie, verklaring, ...extra, afdoening].filter(Boolean).join(" ");

  return [
    titel,
    `Domein ${domein}${invoer.feit ? ` | ${feitKop}` : ""}`,
    regimeRegel,
    "",
    aanhef,
    "",
    alinea,
    "",
    midden,
    "",
    slot,
    "",
    vul(invoer.verbalisant, "[VERBALISANT]"),
    "buitengewoon opsporingsambtenaar",
    "",
    "Bouwsteen voor BRS, CityControl, Sigmax of MEOS. Geen persoonsgegevens van burgers in dit portaal. De akte gaat voor.",
  ]
    .filter((regel, index, lijst) => !(regel === "" && lijst[index - 1] === ""))
    .join("\n");
}

export function checklistPv(invoer: PvInvoer): string {
  const wie = persoon(invoer);
  const status = wStatus(invoer);
  const regels = [
    "7 W's | controle voor de les of het examen",
    "",
    `W1 | Wie ${status[0]?.ok ? "✓" : "○"}`,
    `${invoer.koppel === "wij" ? "Wij, verbalisanten" : "Ik, verbalisant"}: ${vul(invoer.verbalisant, "[VERBALISANT]")}. ${kledingZin(invoer)}. ${domeinLabel(invoer.domein)}.`,
    `${wie}: ${identiteitZin(invoer) || "[identiteit nog niet vastgelegd]"} ${leeftijdZin(invoer)}`.trim(),
    "",
    `W2 | Wat ${status[1]?.ok ? "✓" : "○"}`,
    invoer.feit ? `${invoer.feit.code} | ${invoer.feit.titel} (${invoer.feit.artikel})` : "[feit nog kiezen]",
    invoer.feit?.pv ? `PV-aandachtspunt: ${invoer.feit.pv}` : "",
    "",
    `W3 | Waar ${status[2]?.ok ? "✓" : "○"}`,
    [invoer.straat, invoer.plaats, invoer.locatieZin].filter((deel) => deel.trim()).join(" | ") || "[plaats nog invullen]",
    "",
    `W4 | Wanneer ${status[3]?.ok ? "✓" : "○"}`,
    `${datumLang(invoer.datum)} om ${vul(invoer.tijd, "[TIJD]")} uur${invoer.tijd2.trim() ? `, tweede waarneming om ${invoer.tijd2.trim()} uur` : ""}.`,
    "",
    `W5 | Waarmee ${status[4]?.ok ? "✓" : "○"}`,
    invoer.waarmee.trim() || "[nog geen middel of voorwerp]",
    "",
    `W6 | Waarom ${status[5]?.ok ? "✓" : "○"}`,
    invoer.aanleiding.trim() || "[aanleiding nog invullen]",
    invoer.cautie ? "Cautie gegeven (art. 29 lid 2 Sv)." : "Cautie nog niet aangevinkt.",
    invoer.geenVerklaring ? `De ${wie} wenste geen verklaring af te leggen.` : invoer.verklaring.trim() ? `Verklaring: "${invoer.verklaring.trim()}"` : "Nog geen verklaring.",
    "",
    `W7 | Hoe ${status[6]?.ok ? "✓" : "○"}`,
    invoer.waarneming.trim() || "[waarneming nog invullen]",
    invoer.sfeer ? "Sfeerovergang aangevinkt." : "",
    invoer.aanhouding ? "Aanhouding op heterdaad aangevinkt." : "",
    invoer.fouillering ? "Veiligheidsfouillering aangevinkt." : "",
    invoer.boeien ? "Handboeien aangevinkt." : "",
    invoer.overdracht ? "Overdracht aangevinkt." : "",
  ];
  return regels.filter((regel) => regel !== undefined).join("\n");
}
