import { ARTIKELEN } from "@/lib/boa/artikelen";
import { zoekBoekje } from "@/lib/boa/boekje-zoek";
import { JARGON } from "@/lib/boa/jargon";
import { KAARTEN } from "@/lib/boa/zakkaart";
import { BOMEN } from "@/lib/boa/trees";
import { VRAGEN, CASUSSEN } from "@/lib/boa/trainer";

export type ZoekHit = {
  soort: "feit" | "jargon" | "beslisboom" | "zakkaart" | "trainer" | "artikel" | "pagina";
  titel: string;
  tekst: string;
  naar: string;
  search?: Record<string, string>;
};

const PAGINAS: ZoekHit[] = [
  {
    soort: "pagina",
    titel: "Namen op de werkvloer: jeugd-BOA, wijk-BOA, ondermijning",
    tekst: "Jeugd-BOA, wijk-BOA, BOA ondermijning, horeca- en Alcoholwet-BOA, verkeers- en parkeer-BOA, senior BOA en teamleider zijn geen aparte categorie in de Regeling domeinlijsten. Het blijft domein I, openbare ruimte. De grens is de akte en de taakomschrijving.",
    naar: "/",
  },
  {
    soort: "pagina",
    titel: "Jeugd en Halt",
    tekst: "Halt is een vrijwillige afdoening voor een jeugdige van 12 tot en met 17 jaar die het feit bekent. Onder 16 jaar moeten ook de ouders instemmen. Geen druk.",
    naar: "/beslisbomen",
  },
  {
    soort: "pagina",
    titel: "Diensttools: leeftijd en jeugdtarief",
    tekst: "12 tot en met 15 jaar is jeugdstrafrecht. 16 of 17 is nog jeugdstrafrecht. Bij de Wahv geldt in de regel het volledige tarief.",
    naar: "/dienst",
  },
];

function past(hay: string, delen: string[]): boolean {
  return delen.every((deel) => hay.includes(deel));
}

export function zoekSite(query: string): ZoekHit[] {
  const delen = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!delen.length) return [];
  const hits: ZoekHit[] = [];

  for (const regel of zoekBoekje(query).slice(0, 12)) {
    hits.push({
      soort: "feit",
      titel: `${regel.code} ${regel.titel}`,
      tekst: regel.toelichting || "Feitenboekje januari 2026",
      naar: "/feitcodes",
      search: { q: regel.code },
    });
  }

  for (const woord of JARGON) {
    const hay = `${woord.term} ${woord.uitleg}`.toLowerCase();
    if (past(hay, delen)) {
      hits.push({
        soort: "jargon",
        titel: woord.term,
        tekst: woord.uitleg,
        naar: "/jargon",
        search: { q: woord.term },
      });
    }
  }

  for (const boom of BOMEN) {
    const knopen = boom.nodes.map((node) => `${node.titel} ${node.tekst}`).join(" ");
    const hay = `${boom.titel} ${boom.inleiding} ${knopen}`.toLowerCase();
    if (past(hay, delen)) {
      hits.push({
        soort: "beslisboom",
        titel: boom.titel,
        tekst: boom.inleiding,
        naar: "/beslisbomen",
      });
    }
  }

  for (const kaart of KAARTEN) {
    const hay = `${kaart.titel} ${kaart.artikel} ${kaart.spreek} ${kaart.regels.join(" ")} ${kaart.niet}`.toLowerCase();
    if (past(hay, delen)) {
      hits.push({
        soort: "zakkaart",
        titel: kaart.titel,
        tekst: `${kaart.artikel}. ${kaart.spreek}`,
        naar: "/zakkaart",
      });
    }
  }

  for (const artikel of ARTIKELEN) {
    const hay = `${artikel.code} ${artikel.titel} ${artikel.kern} ${artikel.straat}`.toLowerCase();
    if (past(hay, delen)) {
      hits.push({
        soort: "artikel",
        titel: `${artikel.code} ${artikel.titel}`,
        tekst: artikel.straat,
        naar: "/feitcodes",
      });
    }
  }

  for (const vraag of VRAGEN) {
    const hay = `${vraag.vraag} ${vraag.toelichting} ${vraag.opties.join(" ")}`.toLowerCase();
    if (past(hay, delen)) {
      hits.push({
        soort: "trainer",
        titel: vraag.vraag,
        tekst: vraag.toelichting,
        naar: "/trainer",
      });
    }
  }

  for (const casus of CASUSSEN) {
    const hay = `${casus.titel} ${casus.doel} ${casus.setting} ${casus.boa}`.toLowerCase();
    if (past(hay, delen)) {
      hits.push({
        soort: "trainer",
        titel: casus.titel,
        tekst: casus.doel,
        naar: "/trainer",
      });
    }
  }

  for (const pagina of PAGINAS) {
    const hay = `${pagina.titel} ${pagina.tekst}`.toLowerCase();
    if (past(hay, delen)) hits.push(pagina);
  }

  return hits.slice(0, 40);
}
