import type { Feit } from "@/lib/boa/feitcodes";
import { domeinLabel, type DomeinId } from "@/lib/boa/meta";

export type PvInvoer = {
  soort: "bevindingen" | "aanhouding";
  verbalisant: string;
  domein: DomeinId;
  feit: Feit | null;
  datum: string;
  tijd: string;
  plaats: string;
  aanleiding: string;
  waarneming: string;
  hoedanigheid: "toezicht" | "opsporing";
  cautie: "gegeven" | "nvt" | "niet";
  verklaring: string;
  boeien: "nee" | "vlucht" | "gevaar";
  fouillering: boolean;
  overdracht: boolean;
  afloop: string;
};

export function leegPv(domein: DomeinId = "I"): PvInvoer {
  return {
    soort: "bevindingen",
    verbalisant: "",
    domein,
    feit: null,
    datum: "",
    tijd: "",
    plaats: "",
    aanleiding: "",
    waarneming: "",
    hoedanigheid: "opsporing",
    cautie: "gegeven",
    verklaring: "",
    boeien: "nee",
    fouillering: false,
    overdracht: false,
    afloop: "",
  };
}

export function stempelNu(): { datum: string; tijd: string } {
  const now = new Date();
  return {
    datum: now.toISOString().slice(0, 10),
    tijd: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
  };
}

function blok(titel: string, tekst: string): string {
  const body = tekst.trim() || "[NOG INVULLEN]";
  return `${titel}\n${body}`;
}

export function pvWaarschuwingen(invoer: PvInvoer): string[] {
  const uit: string[] = [];
  const heeftVerklaring = invoer.verklaring.trim().length > 0;
  if (heeftVerklaring && invoer.cautie === "niet") {
    uit.push("Er staat een verklaring in het concept terwijl de cautie niet is gegeven. Dat concept is niet bruikbaar als verhoor.");
  }
  if (heeftVerklaring && invoer.hoedanigheid === "toezicht" && invoer.cautie !== "gegeven") {
    uit.push("Een verklaring over het feit past niet bij zuiver toezicht. Markeer de sfeerovergang en geef de cautie, of haal de verklaring eruit.");
  }
  if (invoer.soort === "aanhouding" && !invoer.overdracht) {
    uit.push("Bij een aanhouding hoort onverwijlde overdracht aan de politie. Zet de overdracht aan of verander het soort PV.");
  }
  if (invoer.boeien !== "nee" && invoer.soort !== "aanhouding") {
    uit.push("Handboeien horen bij een aanhouding of een concreet gevaar, niet bij een losse bon. Verantwoord de grond of haal de boeien eruit.");
  }
  if (!invoer.verbalisant.trim()) uit.push("De naam van de verbalisant ontbreekt.");
  if (!invoer.plaats.trim()) uit.push("De plaats ontbreekt.");
  if (!invoer.waarneming.trim()) uit.push("De waarneming ontbreekt. Zonder waarneming is het geen PV van bevindingen.");
  return uit;
}

export function bouwPv(invoer: PvInvoer): string {
  const titel = invoer.soort === "aanhouding" ? "PROCES-VERBAAL VAN AANHOUDING" : "PROCES-VERBAAL VAN BEVINDINGEN";
  const feitregel = invoer.feit
    ? `${invoer.feit.code} | ${invoer.feit.titel} (${invoer.feit.artikel})`
    : "[FEIT NOG KIEZEN]";
  const cautie =
    invoer.cautie === "gegeven"
      ? "Voorafgaand aan het verhoor heb ik, verbalisant, de verdachte medegedeeld dat hij niet tot antwoorden verplicht is."
      : invoer.cautie === "nvt"
        ? "Ik heb geen cautie gegeven, omdat ik alleen personalia heb gevraagd en geen verhoor heb afgenomen over het feit."
        : "Een cautie is niet gegeven.";
  const boeien =
    invoer.boeien === "nee"
      ? "Handboeien zijn niet aangelegd."
      : invoer.boeien === "vlucht"
        ? "Ik heb [VERDACHTE] handboeien aangelegd op grond van artikel 22 van de Ambtsinstructie, omdat er naar mijn oordeel vluchtgevaar bestond. Een lichter middel volstond niet."
        : "Ik heb [VERDACHTE] handboeien aangelegd op grond van artikel 22 van de Ambtsinstructie, omdat er onmiddellijk gevaar bestond voor de veiligheid. Een lichter middel volstond niet.";
  const fouille = invoer.fouillering
    ? "Ik heb een onderzoek aan de kleding gedaan als bedoeld in artikel 7, derde lid, van de Ambtsinstructie, noodzakelijk voor de veiligheid en gericht op wapens of gevaarlijke voorwerpen."
    : "Een veiligheidsfouillering heeft niet plaatsgevonden.";
  const overdracht = invoer.overdracht
    ? "De aangehouden verdachte is onverwijld overgedragen aan de politie / hulpofficier van justitie."
    : "Van overdracht aan de politie is geen sprake.";
  const hoedanigheid =
    invoer.hoedanigheid === "toezicht"
      ? "Ik trad op als toezichthouder. Een medewerkingsplicht heb ik alleen gebruikt voor gegevens die het toezicht vroeg, niet voor een verklaring over een strafbaar feit."
      : "Ik trad op als buitengewoon opsporingsambtenaar binnen mijn akte van opsporing.";

  const delen = [
    titel,
    "",
    `Ik, verbalisant ${invoer.verbalisant.trim() || "[NAAM VERBALISANT]"}, buitengewoon opsporingsambtenaar, ${domeinLabel(invoer.domein)}, verklaar het volgende.`,
    "",
    `Datum: ${invoer.datum || "[DATUM]"}`,
    `Tijd: ${invoer.tijd || "[TIJD]"}`,
    `Plaats: ${invoer.plaats.trim() || "[PLAATS]"}`,
    `Feit: ${feitregel}`,
    "",
    blok("Aanleiding", invoer.aanleiding),
    "",
    blok("Waarneming", invoer.waarneming),
    "",
    blok("Hoedanigheid en bevoegdheid", hoedanigheid),
    "",
    blok("Cautie", cautie),
    "",
    blok("Verklaring", invoer.verklaring.trim() ? `[VERDACHTE] verklaarde, zakelijk weergegeven:\n"${invoer.verklaring.trim()}"` : "Er is geen verklaring afgelegd."),
    "",
    blok("Middelen", `${boeien}\n${fouille}`),
    "",
    blok("Overdracht", overdracht),
    "",
    blok("Afloop", invoer.afloop),
    "",
    `Waarvan door mij, verbalisant, is opgemaakt dit proces-verbaal, dat ik sloot en ondertekende op ambtseed / ambtsbelofte te ${invoer.plaats.trim() || "[PLAATS]"} op ${invoer.datum || "[DATUM]"}.`,
    "",
    invoer.verbalisant.trim() || "[NAAM VERBALISANT]",
    "buitengewoon opsporingsambtenaar",
    "",
    "Dit concept is een bouwsteen voor het bronsysteem (BRS, MEOS of CityControl). Het vervangt de akte niet en hoort geen persoonsgegevens van burgers te bevatten.",
  ];
  return delen.join("\n");
}
