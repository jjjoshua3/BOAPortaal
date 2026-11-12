import type { DomeinId, Rol } from "@/lib/boa/meta";

export type Vraag = {
  id: string;
  domeinen: DomeinId[];
  rollen: Rol[];
  soort: "rechtskennis" | "gbt";
  vraag: string;
  opties: string[];
  juist: number;
  toelichting: string;
  bron?: string;
};

export type Casus = {
  id: string;
  titel: string;
  domeinen: DomeinId[];
  doel: string;
  setting: string;
  boa: string;
  burger: string;
  debrief: string[];
  docent: string;
};

export type Beginsel = { titel: string; tekst: string };

export const BEGINSELEN: Beginsel[] = [
  {
    titel: "Personalia zijn geen verhoor",
    tekst: "Naam, voornaam, geboortedatum, geboorteplaats en adres mag je vragen zonder cautie. De eerste vraag naar het waarom van het feit niet.",
  },
  {
    titel: "Sfeerovergang is een zin, geen gedachte",
    tekst: "De ander moet kunnen horen dat de medewerkingsplicht stopt en het zwijgrecht begint. Doe je dat niet, dan is de verklaring kwetsbaar.",
  },
  {
    titel: "Onder 12 geen strafrecht",
    tekst: "Artikel 486 Sv. Halt begint bij 12. De toonplicht van de WID begint bij 14. Een draagplicht is er niet.",
  },
  {
    titel: "Wahv is geen Sv",
    tekst: "Een parkeerbeschikking op kenteken is bestuursrecht. Geen staandehouding, geen cautie, geen verdachte. Schelden daarna opent wél het strafrecht.",
  },
  {
    titel: "Aanhouding eindigt bij de politie",
    tekst: "Onverwijlde overdracht. De boa is geen hulpofficier en houdt niemand voor eigen verhoor op kantoor.",
  },
  {
    titel: "Geweld zonder noodzaak is zelf een feit",
    tekst: "Proportionaliteit, subsidiariteit, waarschuwing als het kan, zorg bij letsel, melding volgens de RTGB. De reden staat in het PV.",
  },
];

export const ABCD = [
  { letter: "A", titel: "Aanleiding", tekst: "Wat gebeurde er net vóór het gedrag? Feiten, geen karakter." },
  { letter: "B", titel: "Beleving", tekst: "Hoe lijkt de ander de situatie te ervaren: schrik, schaamte, onrecht, haast?" },
  { letter: "C", titel: "Consequentie", tekst: "Welk gedrag volgt daaruit, en welke regel raakt dat?" },
  { letter: "D", titel: "Doel", tekst: "Wat probeert de ander te bereiken? Daar sluit je de volgende zin op aan." },
];

export const STAPPEN = [
  { n: "1", titel: "Contact", tekst: "Hoedanigheid, rustig tempo, geen publiek als dat niet hoeft." },
  { n: "2", titel: "Waarneming", tekst: "Wat je zag, zonder oordeel. 'Ik zag het blikje uit uw hand gaan', niet 'u bent een vervuiler'." },
  { n: "3", titel: "De boodschap", tekst: "De regel en de vervolgstap in één zin. Dit is het slechte nieuws. Niet verpakken tot het onduidelijk wordt." },
  { n: "4", titel: "Ruimte", tekst: "Laat de ander reageren. Wordt het een verklaring over het feit, dan eerst de cautie." },
  { n: "5", titel: "Afronding", tekst: "Wat er nu gebeurt: bon, UvB, PV, overdracht. Hoe bezwaar of betaling werkt. Daarna afscheid." },
];

export const LSD = [
  { titel: "Luisteren", tekst: "Uit laten praten. Geen weerlegging halverwege de zin." },
  { titel: "Samenvatten", tekst: "In één zin teruggeven wat je hoorde, zodat de ander kan corrigeren." },
  { titel: "Doorvragen", tekst: "Alleen de vraag die je nog nodig hebt. Bij een verdachte: cautie vóór die vraag." },
];

export const MATRIX = [
  "Contact en hoedanigheid",
  "Neutrale waarneming",
  "Juiste bevoegdheid gekozen",
  "Cautie op het juiste moment",
  "Proportionaliteit",
  "Afronding en uitleg van het vervolg",
];

export const VRAGEN: Vraag[] = [
  {
    id: "q1",
    domeinen: ["algemeen"],
    rollen: ["boa", "student", "docent"],
    soort: "rechtskennis",
    vraag: "Wanneer geef je de cautie?",
    opties: [
      "Bij elke vraag naar naam en adres",
      "Vóór je een verdachte vraagt naar zijn betrokkenheid bij het feit",
      "Alleen als je handboeien gebruikt",
      "Nooit, dat doet alleen de politie",
    ],
    juist: 1,
    toelichting: "Artikel 29 lid 2 Sv ziet op het verhoor. Personalia op grond van artikel 52 Sv zijn geen verhoor.",
  },
  {
    id: "q2",
    domeinen: ["algemeen"],
    rollen: ["boa", "student", "docent"],
    soort: "rechtskennis",
    vraag: "Een kind van 11 gooit een ruit in. Wat kan er strafrechtelijk?",
    opties: [
      "Aanhouding en PV, want vernieling is een misdrijf",
      "Halt-verwijzing",
      "Geen strafvervolging; artikel 486 Sv",
      "D 517 omdat er geen ID is",
    ],
    juist: 2,
    toelichting: "Onder de 12 jaar geen strafrechtelijke vervolging. Wel veiligheid en ouders of politie.",
  },
  {
    id: "q3",
    domeinen: ["algemeen"],
    rollen: ["boa", "student", "docent"],
    soort: "rechtskennis",
    vraag: "Iemand van 13 jaar toont geen identiteitsbewijs. Welk feit maak je?",
    opties: ["D 517, artikel 447e Sr", "Artikel 180 Sr", "Geen D 517: de toonplicht begint bij 14 jaar, een draagplicht is er niet", "Een Wahv-beschikking"],
    juist: 2,
    toelichting: "Artikel 2 WID: toonplicht vanaf 14 jaar. Er is geen draagplicht. Op 12 of 13 stel je de identiteit langs een andere weg vast.",
  },
  {
    id: "q4",
    domeinen: ["algemeen"],
    rollen: ["student", "docent", "boa"],
    soort: "rechtskennis",
    vraag: "Welk paar klopt?",
    opties: [
      "Artikel 180 Sr is een overtreding, artikel 447e Sr een misdrijf",
      "Artikel 180 Sr is een misdrijf, artikel 447e Sr een overtreding",
      "Beide zijn Mulder-feiten",
      "Beide staan in de Algemene wet bestuursrecht",
    ],
    juist: 1,
    toelichting: "Wederspannigheid staat in boek 2 Sr (misdrijf). Artikel 447e staat bij de overtredingen.",
  },
  {
    id: "q5",
    domeinen: ["I", "VI"],
    rollen: ["boa", "student", "docent"],
    soort: "rechtskennis",
    vraag: "Een auto staat op een parkeerverbod. Wat is de juiste vorm?",
    opties: [
      "Staande houden ex artikel 52 Sv en cautie",
      "Aanhouding van de kentekenhouder",
      "Wahv-beschikking op het kenteken; dit is bestuursrecht",
      "Artikel 184 Sr omdat de bestuurder het bord negeerde",
    ],
    juist: 2,
    toelichting: "Kentekenaansprakelijkheid. Geen verdachte, geen cautie. Stilhouden alleen als het voertuig nog rijdt, via artikel 5:19 Awb.",
  },
  {
    id: "q6",
    domeinen: ["algemeen"],
    rollen: ["student", "docent", "boa"],
    soort: "rechtskennis",
    vraag: "De medewerkingsplicht van artikel 5:20 Awb geldt niet voor:",
    opties: [
      "Het tonen van een vergunning tijdens toezicht",
      "Een verklaring van een verdachte over het strafbare feit",
      "Het stilhouden van een voertuig",
      "Inzage in een bedrijfsadministratie tijdens toezicht",
    ],
    juist: 1,
    toelichting: "Zodra het verhoor begint, gelden zwijgrecht en cautie. De plicht om mee te werken mag daar niet doorheen.",
  },
  {
    id: "q7",
    domeinen: ["algemeen"],
    rollen: ["boa", "student", "docent"],
    soort: "rechtskennis",
    vraag: "Je hebt iemand op heterdaad aangehouden. Wat moet er daarna?",
    opties: [
      "Verhoor op het gemeentehuis en daarna naar huis",
      "Onverwijlde overdracht aan de politie of hulpofficier",
      "Een Mulder-bon laten tekenen",
      "24 uur ophouden voor raadpleging van de burgemeester",
    ],
    juist: 1,
    toelichting: "Artikel 154 Sv en het Besluit boa: de boa draagt de verdachte onverwijld over.",
  },
  {
    id: "q8",
    domeinen: ["algemeen"],
    rollen: ["boa", "docent", "student"],
    soort: "rechtskennis",
    vraag: "Wanneer mogen handboeien aan?",
    opties: [
      "Bij elke aanhouding, als standaard",
      "Als de verdachte geen ID bij zich heeft",
      "Bij vluchtgevaar of onmiddellijk gevaar, als een lichter middel niet volstaat",
      "Alleen met voorafgaande schriftelijke toestemming van de officier",
    ],
    juist: 2,
    toelichting: "Artikel 22 Ambtsinstructie. De concrete reden hoort in het PV. Letsel meld je.",
  },
  {
    id: "q9",
    domeinen: ["IV"],
    rollen: ["boa", "student", "docent"],
    soort: "rechtskennis",
    vraag: "Een reiziger is niet ingecheckt en werkt mee. Wat is de eerste lijn?",
    opties: [
      "Meteen aanhouding op artikel 180 Sr",
      "Uitstel van betaling volgens de instructie van de vervoerder",
      "Altijd een PV op artikel 73 Wp2000",
      "Een bestuurlijke boete op grond van de Participatiewet",
    ],
    juist: 1,
    toelichting: "Artikel 70 lid 1 begint in de praktijk bij het UvB. Artikel 73 is het niet opvolgen van een aanwijzing, een ander feit.",
  },
  {
    id: "q10",
    domeinen: ["IV"],
    rollen: ["boa", "student", "docent"],
    soort: "rechtskennis",
    vraag: "Welke combinatie klopt voor het openbaar vervoer?",
    opties: [
      "Art. 70 orde, art. 72 vervoerbewijs, art. 73 cautie",
      "Art. 70 vervoerbewijs, art. 72 orde, art. 73 aanwijzing",
      "Alle drie zijn Wahv-feiten",
      "Art. 73 is alleen een huisregel zonder strafbedreiging",
    ],
    juist: 1,
    toelichting: "Artikel 101 Wp2000 wijst overtreding van artikel 73 aan als economisch delict.",
  },
  {
    id: "q11",
    domeinen: ["III"],
    rollen: ["student", "docent", "boa"],
    soort: "rechtskennis",
    vraag: "Wanneer is verzuim relatief?",
    opties: [
      "De jongere staat nergens ingeschreven",
      "16 uur of meer ongeoorloofd afwezig in 4 opeenvolgende lesweken, wel ingeschreven",
      "Vakantie buiten de schoolvakantie zonder vrijstelling",
      "Een ziekmelding van één dag",
    ],
    juist: 1,
    toelichting: "Absoluut is niet ingeschreven. Luxe is vakantie zonder vrijstelling. Relatief is de 16-uursnorm van de Leerplichtwet.",
  },
  {
    id: "q12",
    domeinen: ["V"],
    rollen: ["boa", "student", "docent"],
    soort: "rechtskennis",
    vraag: "Een uitkeringsgerechtigde meldt een gezamenlijke huishouding niet. Grondslag?",
    opties: [
      "Artikel 17 lid 1 Participatiewet",
      "Artikel 70 Wp2000",
      "Artikel 461 Sr",
      "De Wahv",
    ],
    juist: 0,
    toelichting: "De inlichtingenplicht. De boete is bestuurlijk (art. 18a), tenzij het benadelingsbedrag volgens de Aanwijzing naar het strafrecht gaat.",
  },
  {
    id: "q13",
    domeinen: ["V", "III"],
    rollen: ["boa", "docent", "student"],
    soort: "rechtskennis",
    vraag: "Je wilt een woning in voor een huisbezoek. Wat is rechtmatig zonder machtiging?",
    opties: [
      "Naar binnen gaan omdat de uitkering anders stopt",
      "Alleen met vrije, specifieke toestemming, die mag worden ingetrokken",
      "Een voet tussen de deur tot er ja wordt gezegd",
      "Binnen treden omdat artikel 5:20 Awb dat altijd toestaat",
    ],
    juist: 1,
    toelichting: "Informed consent. Geen toestemming en geen machtiging: je blijft buiten.",
  },
  {
    id: "q14",
    domeinen: ["I"],
    rollen: ["boa", "student", "docent"],
    soort: "rechtskennis",
    vraag: "Een veiligheidsfouillering gebruik je om:",
    opties: [
      "Het bewijs van een afvalfeit in de jaszak te zoeken",
      "Wapens of gevaarlijke voorwerpen te vinden als de veiligheid dat vraagt",
      "Altijd de portemonnee op een BSN te controleren",
      "Iemand te straffen die geen bon wil aannemen",
    ],
    juist: 1,
    toelichting: "Artikel 7 lid 3 Ambtsinstructie is een veiligheidsmaatregel, geen zoeking naar bewijs.",
  },
  {
    id: "q15",
    domeinen: ["II"],
    rollen: ["boa", "student", "docent"],
    soort: "rechtskennis",
    vraag: "Iemand vist in een binnenwater en heeft geen VISpas of andere toestemming. Grondslag?",
    opties: [
      "Artikel 21 lid 1 Visserijwet 1963",
      "Artikel 5 WVW 1994",
      "De Leerplichtwet",
      "Artikel 72 Wp2000",
    ],
    juist: 0,
    toelichting: "Schriftelijke toestemming van de rechthebbende. De VISpas is de gewone vorm daarvan.",
  },
  {
    id: "q16",
    domeinen: ["I", "III", "algemeen"],
    rollen: ["student", "docent", "boa"],
    soort: "rechtskennis",
    vraag: "Halt is mogelijk als:",
    opties: [
      "De jeugdige 12 tot en met 17 is, het feit Halt-waardig is, hij bekent en stemt in",
      "Elk kind onder 12 dat iets toegeeft",
      "Een volwassene die de bon niet wil",
      "Altijd, ook zonder bekentenis, als de ouder boos wordt",
    ],
    juist: 0,
    toelichting: "Onder 16 jaar is ook instemming van de ouder nodig. Zonder vrije bekentenis volgt een gewone OM-route of sepots-oordeel, geen Halt.",
  },
  {
    id: "q17",
    domeinen: ["algemeen"],
    rollen: ["student", "docent", "boa"],
    soort: "gbt",
    vraag: "In het 5-stappenplan komt de cautie het eerst in beeld bij:",
    opties: [
      "Stap 1, altijd, ook als je alleen je naam noemt",
      "Stap 4, zodra de reactie een verklaring over het feit wordt",
      "Nooit, het 5-stappenplan is alleen voor de Wahv",
      "Pas in het PV, de volgende dag",
    ],
    juist: 1,
    toelichting: "Contact en waarneming zijn nog geen verhoor. De ruimte die je geeft wel, als je op de inhoud doorgaat.",
  },
  {
    id: "q18",
    domeinen: ["algemeen"],
    rollen: ["student", "docent", "boa"],
    soort: "gbt",
    vraag: "Welke zin hoort bij een neutrale waarneming?",
    opties: [
      "U bent duidelijk het type dat nooit opruimt.",
      "Ik zag dat het blikje uit uw hand op het trottoir viel.",
      "Mensen zoals u maken deze buurt kapot.",
      "Geef maar toe, dan ben ik sneller klaar.",
    ],
    juist: 1,
    toelichting: "Feitelijk en zonder karakter. De tweede zin is bruikbaar in een PV. De andere drie niet.",
  },
  {
    id: "q19",
    domeinen: ["VI"],
    rollen: ["boa", "student", "docent"],
    soort: "rechtskennis",
    vraag: "Rijden zonder rijbewijs (art. 107 WVW) door een boa van domein I. Juiste houding?",
    opties: [
      "Altijd zelf aanhouden, elke boa mag alle verkeersmisdrijven",
      "Alleen optreden als de akte dit feit noemt; anders de politie",
      "Afdoen met een parkeerbon op het kenteken",
      "Cautie overslaan omdat het een Mulder-feit is",
    ],
    juist: 1,
    toelichting: "De akte begrenst de opsporing. Artikel 107 jo. artikelen 177 en 178 WVW is een overtreding (feitcode K 055), geen misdrijf en geen Mulder-feit. Voor domein I staat het meestal niet in de akte: dan de politie.",
  },
  {
    id: "q20",
    domeinen: ["algemeen"],
    rollen: ["docent", "student", "boa"],
    soort: "gbt",
    vraag: "Iemand scheldt terwijl jij een parkeerbon schrijft. Wat verander je?",
    opties: [
      "Niets, schelden hoort bij de Wahv",
      "Je stapt over naar het strafrecht als de uitlating beledigend is, met cautie vóór het verhoor daarover",
      "Je scheurt de bon en doet alsof er niets was",
      "Je boeit standaard, omdat belediging een misdrijf is",
    ],
    juist: 1,
    toelichting: "De bon blijft bestuursrecht. De belediging is een nieuw, strafrechtelijk spoor (art. 266/267 Sr). Handboeien volgen niet uit het woord alleen.",
  },
];

export const CASUSSEN: Casus[] = [
  {
    id: "c1",
    titel: "Blikje, en daarna een scheldpartij",
    domeinen: ["I", "algemeen"],
    doel: "Sfeerovergang herkennen en de cautie op het juiste moment geven.",
    setting: "Winkelstraat, druk. Een persoon laat een blikje vallen en loopt door. Jij spreekt die persoon aan.",
    boa: "Begin in het toezicht of de APV. Beschrijf alleen wat je zag. Vraag nog niets over het waarom.",
    burger: "Eerst: 'Het waaide uit mijn hand.' Daarna, als de boa doorvraagt: 'Bemoei je er niet mee, ambtenaartje.'",
    debrief: [
      "Waar stopte het toezicht?",
      "Welke zin markeert de overgang?",
      "Is de uitlating belediging of alleen ergernis? Noteer de woorden letterlijk.",
    ],
    docent: "Laat de student de overgang te laat doen, en daarna nog een keer op tijd. Score op cautie en op de scheiding tussen bon en misdrijf.",
  },
  {
    id: "c2",
    titel: "Dertien jaar, geen pas",
    domeinen: ["I", "algemeen"],
    doel: "Leeftijdsgrenzen van de WID niet verwarren met het onderliggende feit.",
    setting: "Plein. Drie jongeren, één lijkt 13, hebben afval naast de bak gezet. Geen van hen heeft een pas op zak.",
    boa: "Eerst het afvalfeit. Daarna leeftijd. Niet dreigen met 447e Sr.",
    burger: "Zegt 13 te zijn. Weet de achternaam van een ouder, geen document.",
    debrief: [
      "Welk feit blijft er over als D 517 afvalt?",
      "Hoe stel je de identiteit vast zonder BSN in een oefen-PV?",
      "Komt Halt in beeld, en wat heb je daarvoor nodig?",
    ],
    docent: "Fout die je wilt zien en corrigeren: aanhouding 'omdat er geen ID is'. Dat is bij 13 jaar de verkeerde route.",
  },
  {
    id: "c3",
    titel: "Niet ingecheckt, daarna geen naam",
    domeinen: ["IV"],
    doel: "UvB, artikel 73 en artikel 447e uit elkaar houden.",
    setting: "Stadsbus, zitplaatsen vol. Reiziger heeft niet ingecheckt. Bij de vraag naar een ID draait de reiziger zich weg.",
    boa: "Bied eerst het UvB aan. Wordt de identiteit geweigerd, benoem de leeftijd en de waarschuwing.",
    burger: "Eerst: 'Ik was te laat met de paal.' Daarna: 'Ik hoef u niets te laten zien.'",
    debrief: [
      "Welk artikel droeg de eerste stap?",
      "Wanneer wordt het artikel 73, en wanneer 447e?",
      "Wanneer bel je de politie in plaats van zelf te trekken?",
    ],
    docent: "Laat twee studenten de rollen wisselen. De observator noteert alleen letterlijke zinnen, geen cijfers voor 'houding'.",
  },
  {
    id: "c4",
    titel: "Aan de deur voor de Participatiewet",
    domeinen: ["V"],
    doel: "Toestemming echt maken, en op tijd stoppen.",
    setting: "Portiekwoning. Doel: controleren of er één huishouden is. De deur gaat op een kier.",
    boa: "Legitimatie, doel, en de zin dat binnenlaten niet verplicht is. Geen voet tussen de deur.",
    burger: "Zegt eerst 'kom maar even'. Trekt de toestemming in als je naar de slaapkamer vraagt.",
    debrief: [
      "Was de toestemming specifiek genoeg?",
      "Wat doe je op het moment van intrekken?",
      "Welke zin hoort in het rapport, en welke naam hoort níet in dit oefenportaal?",
    ],
    docent: "Onvoldoende als de student de uitkering noemt als drukmiddel om binnen te blijven.",
  },
  {
    id: "c5",
    titel: "Luxe verzuim, boze ouder",
    domeinen: ["III"],
    doel: "Het verschil tussen vrijstelling en een mededeling, en rust in een slechtnieuwsgesprek.",
    setting: "School, na de herfstvakantie. Een leerling was vijf dagen eerder weg. De ouder zegt dat de directie het goed vond.",
    boa: "Vraag de beschikking of het besluit van het schoolhoofd. Geen PV voordat je dat hebt nagekeken.",
    burger: "De ouder verheft de stem: 'U pakt ons de vakantie af.'",
    debrief: [
      "Welk artikel van de Leerplichtwet draagt luxe verzuim?",
      "Wie is de normadressaat?",
      "Welke stap van het 5-stappenplan sloeg de student over?",
    ],
    docent: "Beoordeel of de student de stem van de ouder benoemt zonder mee te gaan schelden, en of de cautie achterwege blijft zolang er alleen naar een document wordt gevraagd.",
  },
];

export function filterVragen(rollen: Rol, domein: "alle" | DomeinId, soort: "alle" | Vraag["soort"]): Vraag[] {
  return VRAGEN.filter((vraag) => {
    if (!vraag.rollen.includes(rollen)) return false;
    if (domein !== "alle" && !vraag.domeinen.includes(domein) && !vraag.domeinen.includes("algemeen")) return false;
    if (soort !== "alle" && vraag.soort !== soort) return false;
    return true;
  });
}
