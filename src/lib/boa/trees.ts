import type { DomeinId, Toon } from "@/lib/boa/meta";

export type TreeChoice = { label: string; naar: string };
export type TreeNode =
  | {
      id: string;
      soort: "vraag";
      titel: string;
      tekst: string;
      toelichting?: string;
      keuzes: TreeChoice[];
    }
  | {
      id: string;
      soort: "uitkomst";
      toon: Toon;
      titel: string;
      tekst: string;
      pv?: string;
    };

export type Tree = {
  id: string;
  titel: string;
  domeinen: DomeinId[];
  inleiding: string;
  start: string;
  nodes: TreeNode[];
};

export const BOMEN: Tree[] = [
  {
    id: "sfeer",
    titel: "Sfeerovergang: van toezicht naar opsporing",
    domeinen: ["algemeen"],
    inleiding:
      "De medewerkingsplicht van artikel 5:20 Awb stopt zodra je een verklaring zoekt over een strafbaar feit. Dan beginnen zwijgrecht en cautie (art. 29 Sv).",
    start: "vermoeden",
    nodes: [
      {
        id: "vermoeden",
        soort: "vraag",
        titel: "Redelijk vermoeden",
        tekst: "Is er een redelijk vermoeden dat deze persoon een strafbaar feit heeft begaan?",
        toelichting: "Meer dan een gevoel: concrete, benoembare feiten. Een losse melding zonder eigen waarneming is meestal nog niet genoeg.",
        keuzes: [
          { label: "Ja", naar: "vragen" },
          { label: "Nee", naar: "toezicht" },
        ],
      },
      {
        id: "toezicht",
        soort: "vraag",
        titel: "Nog toezicht",
        tekst: "Blijf je bij gegevens die het toezicht nodig heeft, zoals inzage, meting of een kenteken?",
        toelichting: "Artikel 5:16 tot en met 5:20 Awb. Geen waarom-vraag over schuld.",
        keuzes: [
          { label: "Ja, alleen toezicht", naar: "einde-toezicht" },
          { label: "Nee, ik wil weten waarom", naar: "einde-kantel" },
        ],
      },
      {
        id: "vragen",
        soort: "vraag",
        titel: "Verhoor of alleen vaststellen",
        tekst: "Ga je vragen stellen over de betrokkenheid bij het feit, anders dan naam en adres?",
        keuzes: [
          { label: "Ja", naar: "einde-cautie" },
          { label: "Nee, alleen waarnemen en identiteit", naar: "einde-stil" },
        ],
      },
      {
        id: "einde-toezicht",
        soort: "uitkomst",
        toon: "ok",
        titel: "Blijf in het toezicht",
        tekst: "De medewerkingsplicht kan gelden. Geen cautie. Noem je functie en je doel. Schrijf op wat je ziet, niet wat je denkt dat iemand van plan was.",
        pv: "Ik trad op als toezichthouder op grond van [BEVOEGDHEID]. Ik heb inlichtingen gevorderd als bedoeld in de Algemene wet bestuursrecht. Er was nog geen redelijk vermoeden van een strafbaar feit. Een cautie heb ik niet gegeven.",
      },
      {
        id: "einde-kantel",
        soort: "uitkomst",
        toon: "amber",
        titel: "Dit is al een verhoor",
        tekst: "Een waarom-vraag over een mogelijk strafbaar feit is verhoor. Zeg dat je nu als opsporingsambtenaar optreedt en geef de cautie vóór je die vraag stelt. Artikel 5:20 Awb gebruik je niet om het antwoord af te dwingen.",
        pv: "Ik heb de sfeerovergang kenbaar gemaakt en de cautie gegeven voordat ik [VERDACHTE] vroeg naar diens betrokkenheid bij [FEIT].",
      },
      {
        id: "einde-cautie",
        soort: "uitkomst",
        toon: "stop",
        titel: "Eerst cautie, dan de vraag",
        tekst: "Spreektaal: 'Ik treed vanaf nu op als opsporingsambtenaar. U bent niet tot antwoorden verplicht.' Daarna pas de vraag. Wat iemand daarvóór spontaan zei, noteer je apart als spontane verklaring.",
        pv: "Voorafgaand aan het verhoor heb ik [VERDACHTE] medegedeeld dat ik als opsporingsambtenaar optrad en dat hij niet tot antwoorden verplicht is.",
      },
      {
        id: "einde-stil",
        soort: "uitkomst",
        toon: "navy",
        titel: "Waarnemen mag, doorvragen niet",
        tekst: "Identiteit, foto van de situatie en veiligstellen kunnen nog. Stel je daarna toch een vraag over het feit, draai dan terug naar de cautie. Geen medewerkingsplicht meer voor die verklaring.",
      },
    ],
  },
  {
    id: "id",
    titel: "Geen ID, of een naam die niet klopt",
    domeinen: ["algemeen"],
    inleiding:
      "De leeftijd bepaalt de route. Onder 12 geen strafrecht. 12 en 13: geen toonplicht, dus geen D 517. Een draagplicht is er op geen enkele leeftijd. Vanaf 14: vorderen, waarschuwen, eventueel aanhouden voor artikel 447e Sr.",
    start: "leeftijd",
    nodes: [
      {
        id: "leeftijd",
        soort: "vraag",
        titel: "Leeftijd",
        tekst: "Welke leeftijd kun je nu, zonder BSN, verdedigen?",
        keuzes: [
          { label: "14 jaar of ouder", naar: "vordering" },
          { label: "12 of 13 jaar", naar: "twaalf" },
          { label: "Onder 12 jaar", naar: "kind" },
          { label: "Nog onbekend", naar: "onbekend" },
        ],
      },
      {
        id: "kind",
        soort: "uitkomst",
        toon: "stop",
        titel: "Geen strafrecht",
        tekst: "Artikel 486 Sv: geen vervolging onder de 12. Geen aanhouding voor een strafbaar feit, geen D 517. Zorg dat het kind veilig is. Ouders, school of de politie, afhankelijk van wat er speelt.",
      },
      {
        id: "twaalf",
        soort: "uitkomst",
        toon: "amber",
        titel: "12 of 13 | wel identiteit, geen toonplicht",
        tekst: "Geen vordering die je met artikel 447e Sr kunt afdwingen. Stel de identiteit vast via school, ouders of de politie. Een valse naam kan vanaf 12 jaar wél artikel 435 Sr zijn, als je de onjuistheid kunt aantonen. Geen handboeien 'omdat er geen ID is'.",
      },
      {
        id: "onbekend",
        soort: "uitkomst",
        toon: "amber",
        titel: "Eerst leeftijd, dan het artikel",
        tekst: "Vraag de leeftijd. Lijkt iemand duidelijk 14 of ouder, dan mag je de vordering doen. Bij gerede twijfel behandel je de persoon niet als een volwassen weigeraar. Schakel de politie in als het feit zelf om aanhouding vraagt.",
      },
      {
        id: "vordering",
        soort: "vraag",
        titel: "Geldige vordering",
        tekst: "Heb je je hoedanigheid getoond en de vordering in gewone woorden uitgesproken?",
        keuzes: [
          { label: "Ja", naar: "getoond" },
          { label: "Nee", naar: "eerst-vorderen" },
        ],
      },
      {
        id: "eerst-vorderen",
        soort: "uitkomst",
        toon: "amber",
        titel: "Eerst een echte vordering",
        tekst: "Zeg: 'Ik vorder van u inzage in een geldig identiteitsbewijs op grond van de Wet op de identificatieplicht.' Zonder die zin is een latere aanhouding voor 447e Sr zwak.",
      },
      {
        id: "getoond",
        soort: "vraag",
        titel: "Document",
        tekst: "Is er een geldig identiteitsbewijs getoond dat bij deze persoon hoort?",
        keuzes: [
          { label: "Ja", naar: "klaar" },
          { label: "Nee, weigering", naar: "waarschuw" },
          { label: "Er wordt een naam opgegeven die niet klopt", naar: "vals" },
        ],
      },
      {
        id: "klaar",
        soort: "uitkomst",
        toon: "ok",
        titel: "Vordering voldaan",
        tekst: "Controleer of foto en leeftijd kloppen bij de persoon voor je. Noteer geen BSN in dit portaal. Ga verder met het oorspronkelijke feit.",
      },
      {
        id: "waarschuw",
        soort: "vraag",
        titel: "Waarschuwing",
        tekst: "Heb je gewezen op artikel 447e Sr en de kans op aanhouding?",
        keuzes: [
          { label: "Ja, en er wordt nog steeds geweigerd", naar: "aanhouden" },
          { label: "Nog niet", naar: "doe-waarschuwing" },
        ],
      },
      {
        id: "doe-waarschuwing",
        soort: "uitkomst",
        toon: "amber",
        titel: "Spreek de waarschuwing uit",
        tekst: "Ik wijs u erop dat het niet voldoen aan deze vordering een strafbaar feit oplevert op grond van artikel 447e van het Wetboek van Strafrecht, waarvoor u kunt worden aangehouden. Geef even de ruimte om alsnog te tonen.",
      },
      {
        id: "aanhouden",
        soort: "uitkomst",
        toon: "stop",
        titel: "D 517 en, als het moet, aanhouding",
        tekst: "Het niet voldoen is een overtreding (art. 447e Sr). Aanhouding op heterdaad kan, daarna onverwijlde overdracht aan de politie. Geen cautie nodig voor de personalia zelf. Wel cautie als je daarna vraagt waarom iemand weigert.",
        pv: "Ik heb [VERDACHTE], 14 jaar of ouder, gevorderd een identiteitsbewijs te tonen en gewezen op artikel 447e Sr. [VERDACHTE] voldeed niet. Ik heb [VERDACHTE] aangehouden en overgedragen aan de politie.",
      },
      {
        id: "vals",
        soort: "uitkomst",
        toon: "stop",
        titel: "Valse personalia | artikel 435 Sr",
        tekst: "Dit is D 515 | artikel 435 onder 4 Sr, niet D 517 en niet D 505. D 505 is baldadigheid. Leg vast wát er is opgegeven en waaruit de onjuistheid blijkt. Vanaf 12 jaar kan dit strafrecht zijn. Onder 14 geldt de toonplicht niet. Een draagplicht is er ook dan niet.",
        pv: "[VERDACHTE] gaf op [OPGAVE]. Die opgave was onjuist, omdat [VASTSTELLING ZONDER BSN]. Grondslag: artikel 435, aanhef en onder 4, Sr.",
      },
    ],
  },
  {
    id: "geweld",
    titel: "Geweld, handboeien en de meldplicht",
    domeinen: ["algemeen"],
    inleiding:
      "Geweld en handboeien zijn uitzonderingen. Toets proportionaliteit en subsidiariteit, waarschuw als het kan, en meld letsel en aanwending volgens de RTGB en je meerdere.",
    start: "nodig",
    nodes: [
      {
        id: "nodig",
        soort: "vraag",
        titel: "Noodzaak",
        tekst: "Is er op dit moment een noodzaak om geweld te gebruiken of handboeien aan te leggen?",
        keuzes: [
          { label: "Nee", naar: "geen" },
          { label: "Ja", naar: "licht" },
        ],
      },
      {
        id: "geen",
        soort: "uitkomst",
        toon: "ok",
        titel: "Geen geweld",
        tekst: "Gewone bejegening. Er is niets te melden als geweldsaanwending. Blijf uit de fysieke confrontatie als praten en afstand nog werken.",
      },
      {
        id: "licht",
        soort: "vraag",
        titel: "Lichter middel",
        tekst: "Is een lichter middel geprobeerd of duidelijk niet haalbaar, en staat het middel in verhouding tot het gevaar?",
        keuzes: [
          { label: "Ja", naar: "grond" },
          { label: "Nee", naar: "niet-doen" },
        ],
      },
      {
        id: "niet-doen",
        soort: "uitkomst",
        toon: "stop",
        titel: "Niet toepassen",
        tekst: "Zonder proportionaliteit en subsidiariteit is de aanwending wederrechtelijk. Wacht op de politie of kies een lichter middel. Achteraf 'het was spannend' repareert het PV niet.",
      },
      {
        id: "grond",
        soort: "vraag",
        titel: "Grond voor de boeien of het geweld",
        tekst: "Gaat het om vluchtgevaar bij een aanhouding, of om onmiddellijk gevaar voor de veiligheid?",
        keuzes: [
          { label: "Vluchtgevaar", naar: "warn" },
          { label: "Onmiddellijk gevaar", naar: "warn" },
          { label: "Geen van beide", naar: "niet-doen" },
        ],
      },
      {
        id: "warn",
        soort: "vraag",
        titel: "Waarschuwing en letsel",
        tekst: "Kon je waarschuwen, en is er letsel of een klacht over pijn?",
        keuzes: [
          { label: "Geen letsel", naar: "melden-gewoon" },
          { label: "Letsel of pijnklacht", naar: "letsel" },
        ],
      },
      {
        id: "melden-gewoon",
        soort: "uitkomst",
        toon: "amber",
        titel: "Verantwoorden en melden",
        tekst: "Zet de feitelijke grond, het lichtere middel en het tijdstip in het PV. Meld de aanwending aan je meerdere binnen de termijn van je organisatie. De RTGB bepaalt of ook de hulpofficier moet worden gemeld. 'Standaard geboeid' is geen tekst.",
        pv: "Ik heb geweld / handboeien toegepast omdat [VLUCHTGEVAAR OF GEVAAR], namelijk [FEITEN]. Een lichter middel volstond niet. Waarschuwing: [WEL / KON NIET]. Letsel: geen. Gemeld aan [MEERDERE] om [TIJD].",
      },
      {
        id: "letsel",
        soort: "uitkomst",
        toon: "stop",
        titel: "Eerst zorg, dan de melding",
        tekst: "Vraag medische zorg. Laat het letsel vastleggen. Meld onmiddellijk je meerdere en volg de RTGB richting de hulpofficier. Schrijf wat je zag, niet een diagnose.",
        pv: "Bij de aanwending ontstond [ZICHTBAAR LETSEL / PIJNKLACHT]. Ik heb medische zorg gevraagd en de melding gedaan aan [MEERDERE / HOVJ] om [TIJD].",
      },
    ],
  },
  {
    id: "halt",
    titel: "Jeugd: Halt of een PV naar het OM",
    domeinen: ["I", "III", "algemeen"],
    inleiding:
      "Halt is een vrijwillige afdoening voor een jeugdige van 12 tot en met 17 jaar die het feit bekent. Geen druk. Onder 16 jaar moeten ook de ouders instemmen.",
    start: "leeftijd",
    nodes: [
      {
        id: "leeftijd",
        soort: "vraag",
        titel: "Leeftijd",
        tekst: "Is de jeugdige 12 tot en met 17 jaar?",
        keuzes: [
          { label: "Ja", naar: "waardig" },
          { label: "Onder 12", naar: "onder12" },
          { label: "18 of ouder", naar: "volwassen" },
        ],
      },
      {
        id: "onder12",
        soort: "uitkomst",
        toon: "stop",
        titel: "Geen Halt en geen OM-pv",
        tekst: "Onder de 12 jaar is er geen strafrechtelijke vervolging (art. 486 Sv). Halt is niet aan de orde. Wel een gesprek met ouders of school, en de politie als de veiligheid dat vraagt.",
      },
      {
        id: "volwassen",
        soort: "uitkomst",
        toon: "navy",
        titel: "Volwassenenkader",
        tekst: "Geen Halt. Kies de gewone afdoening: Wahv, bestuur, OM-feit of overdracht. De 18e verjaardag is een harde grens.",
      },
      {
        id: "waardig",
        soort: "vraag",
        titel: "Halt-waardig",
        tekst: "Staat dit feit op de geldende Halt-lijst en is het binnen jouw akte een feit dat je mag verwijzen?",
        toelichting: "De Aanwijzing Halt-afdoening wijzigt. Een misdrijf als wederspannigheid of belediging van een ambtenaar is meestal geen Halt-feit.",
        keuzes: [
          { label: "Ja", naar: "bekent" },
          { label: "Nee", naar: "pv" },
        ],
      },
      {
        id: "bekent",
        soort: "vraag",
        titel: "Bekentenis",
        tekst: "Bekent de jeugdige het feit, vrijwillig en nadat de cautie is gegeven als je daarover hebt gevraagd?",
        keuzes: [
          { label: "Ja", naar: "instemming" },
          { label: "Nee of onder druk", naar: "geen-druk" },
        ],
      },
      {
        id: "geen-druk",
        soort: "uitkomst",
        toon: "amber",
        titel: "Geen Halt",
        tekst: "Zonder vrije bekentenis geen Halt. Niet doorvragen tot er een ja komt. Maak een PV op voor het OM, of laat het feit lopen als het bewijs ontbreekt. Een ontkenning is geen strafverzwarende houding.",
      },
      {
        id: "instemming",
        soort: "vraag",
        titel: "Instemming",
        tekst: "Stemt de jeugdige in met Halt, en bij een leeftijd onder 16 jaar ook de ouder of verzorger?",
        keuzes: [
          { label: "Ja", naar: "halt-ja" },
          { label: "Nee", naar: "pv" },
        ],
      },
      {
        id: "halt-ja",
        soort: "uitkomst",
        toon: "ok",
        titel: "Verwijzen naar Halt",
        tekst: "Leg de bekentenis, de cautie en de instemming vast volgens het formulier van Halt of je organisatie. Geen extra straf 'erbij'. De jeugdige mag nog van Halt afzien zolang de regeling dat toestaat.",
        pv: "De jeugdige, [LEEFTIJD] jaar, bekende het feit nadat de cautie was gegeven en stemde in met een Halt-afdoening. [OUDER STEMDE IN / JEUGDIGE IS 16 OF 17]. Verwezen naar Halt voor [FEIT].",
      },
      {
        id: "pv",
        soort: "uitkomst",
        toon: "navy",
        titel: "PV naar het OM",
        tekst: "Geen Halt-verwijzing. Maak een gewoon proces-verbaal. Bij 12 tot 17 jaar gelden de jeugdwaarborgen: terughoudend met aanhouding, ouders informeren volgens de instructie, overdracht aan de politie als je aanhoudt.",
      },
    ],
  },
  {
    id: "ov",
    titel: "Openbaar vervoer: kaart, orde, aanwijzing",
    domeinen: ["IV"],
    inleiding:
      "Artikel 70 is het vervoerbewijs. Artikel 72 is de orde. Artikel 73 is het niet opvolgen van een aanwijzing. UvB, verwijdering en aanhouding zijn verschillende uitkomsten.",
    start: "soort",
    nodes: [
      {
        id: "soort",
        soort: "vraag",
        titel: "Wat speelt er",
        tekst: "Gaat het om het vervoerbewijs, of om orde en veiligheid?",
        keuzes: [
          { label: "Vervoerbewijs (art. 70)", naar: "kaart" },
          { label: "Orde of veiligheid (art. 72 / 73)", naar: "orde" },
        ],
      },
      {
        id: "kaart",
        soort: "vraag",
        titel: "Geldig bewjis",
        tekst: "Is er een geldig vervoerbewijs, een geldige check-in, of een kaart waarop deze reiziger recht heeft?",
        keuzes: [
          { label: "Ja", naar: "niets" },
          { label: "Nee, vergeten of leeg", naar: "uvb" },
          { label: "Misbruik van andermans of een persoonlijke kaart", naar: "misbruik" },
        ],
      },
      {
        id: "niets",
        soort: "uitkomst",
        toon: "ok",
        titel: "Geen feit op artikel 70",
        tekst: "De reiziger voldoet. Bedank en rond af. Gaat het gedrag daarna alsnog mis, dan stap je over naar artikel 72.",
      },
      {
        id: "uvb",
        soort: "vraag",
        titel: "Meewerken",
        tekst: "Werkt de reiziger mee aan identiteit en aan uitstel van betaling volgens de instructie van de vervoerder?",
        keuzes: [
          { label: "Ja", naar: "uvb-ja" },
          { label: "Nee, weigert ID of verzet zich", naar: "weigert" },
        ],
      },
      {
        id: "uvb-ja",
        soort: "uitkomst",
        toon: "ok",
        titel: "Uitstel van betaling",
        tekst: "Eerste lijn is het UvB, niet een PV. Een PV volgt alleen als de recidiveregeling of de instructie van jouw vervoerder dat uitdrukkelijk zegt. Geen aanhouding omdat iemand de verhoging vervelend vindt.",
        pv: "Reiziger zonder geldig vervoerbewijs. Identiteit vastgesteld. Uitstel van betaling aangeboden en aanvaard. Geen aanhouding.",
      },
      {
        id: "misbruik",
        soort: "uitkomst",
        toon: "amber",
        titel: "Artikel 70 lid 2",
        tekst: "Misbruik is zwaarder dan niet inchecken. Volg de instructie: vaak innemen van de kaart en een PV. Geen kaartnummer in dit portaal. Cautie als je vraagt waarom de reiziger op die kaart reisde.",
        pv: "[VERDACHTE] reisde met een vervoerbewijs waarop geen recht bestond (art. 70 lid 2 Wp2000). Cautie gegeven voordat ik naar de toedracht vroeg.",
      },
      {
        id: "orde",
        soort: "vraag",
        titel: "Aanwijzing",
        tekst: "Heb je een concrete aanwijzing gegeven om met de verstoring te stoppen?",
        keuzes: [
          { label: "Ja, en die wordt opgevolgd", naar: "rust" },
          { label: "Ja, en die wordt genegeerd", naar: "genegeerd" },
          { label: "Nog niet", naar: "eerst-aanwijzing" },
        ],
      },
      {
        id: "eerst-aanwijzing",
        soort: "uitkomst",
        toon: "amber",
        titel: "Eerst de aanwijzing",
        tekst: "Zeg wat er moet stoppen en waarom dat met de orde of de veiligheid te maken heeft. Zonder aanwijzing is artikel 73 zwak. Artikel 72 kan de verstoring zelf dekken als de APV van de vervoerder en de wet dat toelaten.",
      },
      {
        id: "rust",
        soort: "uitkomst",
        toon: "ok",
        titel: "Aanwijzing opgevolgd",
        tekst: "Rond af. Een verblijfsontzegging is niet automatisch. Die volgt het beleid van de vervoerder en moet worden bekendgemaakt.",
      },
      {
        id: "genegeerd",
        soort: "vraag",
        titel: "Volgende stap",
        tekst: "Blijft het bij niet luisteren, of is er ook verzet of een weigering van de identiteit?",
        keuzes: [
          { label: "Niet opvolgen, verder rustig", naar: "art73" },
          { label: "Verzet of geen identiteit", naar: "weigert" },
        ],
      },
      {
        id: "art73",
        soort: "uitkomst",
        toon: "navy",
        titel: "Verwijderen of PV op artikel 73",
        tekst: "Je kunt de reiziger verwijderen uit het voertuig. Het niet opvolgen van de aanwijzing is strafbaar via artikel 73 en 101 Wp2000 (economisch delict). Aanhouding alleen als de situatie en je akte dat dragen, daarna overdracht aan de politie.",
        pv: "Ik heb de aanwijzing gegeven [TEKST]. [VERDACHTE] voldeed niet. Maatregel: [VERWIJDERING / PV ART. 73 WP2000].",
      },
      {
        id: "weigert",
        soort: "uitkomst",
        toon: "stop",
        titel: "Identiteit of verzet",
        tekst: "Weigering van een ID vanaf 14 jaar kan artikel 447e Sr zijn. Verzet bij een rechtmatige handeling kan artikel 180 Sr zijn. Beide zijn een reden om de politie te vragen de aanhouding over te nemen. Geen worsteling als je alleen staat en het onveilig is: afstand, collega, politie.",
        pv: "[VERDACHTE] weigerde identificatie en/of verzette zich. Ik heb de politie verzocht de verdachte over te nemen. Cautie gegeven zodra ik over het feit ging vragen.",
      },
    ],
  },
];

export function nodeById(tree: Tree, id: string): TreeNode | undefined {
  return tree.nodes.find((node) => node.id === id);
}
