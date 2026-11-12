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
  {
    id: "parkeer",
    titel: "Parkeerbon of strafrecht",
    domeinen: ["I"],
    inleiding:
      "Een beschikking op kenteken is bestuursrecht. Schelden, een valse naam of verzet daarna is een ander spoor. Die twee schrijf je niet in één zin aan elkaar.",
    start: "soort",
    nodes: [
      {
        id: "soort",
        soort: "vraag",
        titel: "Wat doe je nu",
        tekst: "Gaat het alleen om een geparkeerd voertuig, of ook om gedrag van een persoon?",
        keuzes: [
          { label: "Alleen het voertuig", naar: "kenteken" },
          { label: "Er is ook gedrag van een persoon", naar: "gedrag" },
        ],
      },
      {
        id: "kenteken",
        soort: "vraag",
        titel: "Kenteken en bord",
        tekst: "Kun je het bord of de plaats, het kenteken en de categorie van het voertuig feitelijk vastleggen?",
        keuzes: [
          { label: "Ja", naar: "wahv" },
          { label: "Nee", naar: "niet-rond" },
        ],
      },
      {
        id: "gedrag",
        soort: "vraag",
        titel: "Welk gedrag",
        tekst: "Wat gebeurt er naast de parkeersituatie?",
        keuzes: [
          { label: "Belediging of een andere uitlating over het feit", naar: "cautie" },
          { label: "Verzet bij een rechtmatige handeling", naar: "verzet" },
          { label: "Alleen een vraag waarom de bon wordt geschreven", naar: "uitleg" },
        ],
      },
      {
        id: "wahv",
        soort: "uitkomst",
        toon: "ok",
        titel: "Wahv op kenteken",
        tekst: "Geen verdachte, geen staandehouding, geen cautie. Bord E1 is R 584, niet R 397. Een gehandicaptenplaats zonder geldige zichtbare kaart is R 402 b. Het kaartnummer hoort niet in dit portaal.",
        pv: "Ik stelde vast dat het voertuig met kenteken [KENTEKEN] te [PLAATS] geparkeerd stond in strijd met [BORD OF PLAATS]. Ik heb een Wahv-beschikking op het kenteken aangezegd onder feitcode [CODE]. Er is geen verdachte aangemerkt.",
      },
      {
        id: "niet-rond",
        soort: "uitkomst",
        toon: "amber",
        titel: "Nog niet schrijven",
        tekst: "Een bon zonder kenbare norm of zonder leesbaar kenteken is een zwakke beschikking. Loop terug, noteer wat je wél ziet, of laat het staan.",
      },
      {
        id: "uitleg",
        soort: "uitkomst",
        toon: "navy",
        titel: "Uitleg is nog geen verhoor",
        tekst: "Zeg welk bord of welke plaats het is en hoe bezwaar werkt. Vraag je daarna waarom de persoon het deed, dan is dat verhoor: eerst de cautie. De bon zelf blijft Wahv.",
      },
      {
        id: "cautie",
        soort: "uitkomst",
        toon: "stop",
        titel: "Bon blijft, belediging is een tweede spoor",
        tekst: "Artikel 266 of 267 Sr staat los van de kentekenbeschikking. Maak de sfeerovergang hoorbaar en geef de cautie vóór je over de uitlating doorvraagt. Handboeien volgen niet uit het woord alleen.",
        pv: "Tijdens het aanzeggen van de Wahv-beschikking deed [VERDACHTE] de uitlating: [UITLATING]. Ik heb daarna medegedeeld dat ik als opsporingsambtenaar optrad en de cautie gegeven, voordat ik over die uitlating vragen stelde. De beschikking op kenteken heb ik niet ingetrokken.",
      },
      {
        id: "verzet",
        soort: "uitkomst",
        toon: "stop",
        titel: "Verzet is geen onderdeel van de parkeerbon",
        tekst: "Artikel 180 Sr kan naast de Wahv staan als het verzet een rechtmatige ambtsedige handeling treft. Eerst veiligheid. Overdracht aan de politie als je niet alleen verder kunt. De reden van geweld, als je dat gebruikt, hoort in het PV.",
      },
    ],
  },
  {
    id: "natuur",
    titel: "Dier, vuurwerk, vissen of verboden grond",
    domeinen: ["II"],
    inleiding:
      "Domein II is geen vrijbrief voor elk milieufeit. De akte noemt de wet. Wat je niet in de akte hebt, geef je over. Een categorie vuurwerk verzin je niet.",
    start: "wat",
    nodes: [
      {
        id: "wat",
        soort: "vraag",
        titel: "Wat zie je",
        tekst: "Waar gaat het om?",
        keuzes: [
          { label: "Een dier in nood of verwaarlozing", naar: "dier" },
          { label: "Vuurwerk", naar: "vuur" },
          { label: "Iemand vist", naar: "vis" },
          { label: "Iemand op een terrein met een bord", naar: "grond" },
        ],
      },
      {
        id: "dier",
        soort: "vraag",
        titel: "Hoe ernstig",
        tekst: "Is het dier acuut in nood, of gaat het om een regel zoals een loslopende hond?",
        keuzes: [
          { label: "Acuut leed of mishandeling", naar: "dier-over" },
          { label: "Een lokale regel, zoals een aanlijngebod", naar: "dier-regel" },
        ],
      },
      {
        id: "vuur",
        soort: "vraag",
        titel: "Vuurwerk",
        tekst: "Is het zwaar of professioneel vuurwerk, of consumentenvuurwerk buiten de toegestane periode?",
        toelichting: "Niet aansteken om de categorie te testen. Noteer wat je ziet.",
        keuzes: [
          { label: "Zwaar of onduidelijk", naar: "vuur-politie" },
          { label: "Duidelijk buiten de toegestane periode, en het staat in mijn akte", naar: "vuur-akte" },
        ],
      },
      {
        id: "vis",
        soort: "vraag",
        titel: "Schriftelijke toestemming",
        tekst: "Staat de Visserijwet in je akte, en ontbreekt de schriftelijke toestemming van de rechthebbende?",
        keuzes: [
          { label: "Ja, akte én geen toestemming", naar: "vis-ja" },
          { label: "De wet staat niet in mijn akte", naar: "geen-akte" },
        ],
      },
      {
        id: "grond",
        soort: "vraag",
        titel: "Artikel 461 Sr",
        tekst: "Is de aanduiding kenbaar, ontbreekt recht of toestemming, en is het géén openbare weg?",
        keuzes: [
          { label: "Ja, alle drie", naar: "grond-ja" },
          { label: "Nee", naar: "grond-nee" },
        ],
      },
      {
        id: "dier-over",
        soort: "uitkomst",
        toon: "stop",
        titel: "Eerst het dier, dan de bevoegde instantie",
        tekst: "Beperk het leed. Schakel politie, NVWA of een dierenarts in. Behandel het dier niet zelf. Ernstige mishandeling schrijf je alleen als de Wet dieren in je akte staat; anders lever je de waarneming over.",
        pv: "Ik trof te [PLAATS] een dier aan in de volgende toestand: [FEITELIJKE STAAT]. Ik heb [POLITIE / NVWA / DIERENARTS] ingeschakeld. Mijn optreden bleef binnen de akte.",
      },
      {
        id: "dier-regel",
        soort: "uitkomst",
        toon: "navy",
        titel: "Noem de verordening die hier geldt",
        tekst: "Een aanlijngebod staat vaak in de provinciale omgevingsverordening of de APV, niet in één landelijk tarief. Verstoring van fauna niet zwaarder maken dan de waarneming.",
        pv: "In [GEBIED] zag ik [WAARNEMING]. De norm die ik toepaste is [ARTIKEL VAN DE VERORDENING].",
      },
      {
        id: "vuur-politie",
        soort: "uitkomst",
        toon: "stop",
        titel: "Politie, niet zelf ontsteken",
        tekst: "Zwaar vuurwerk is een politiezaak. Blijf op afstand, noteer plaats en wat je zag, en laat het voorwerp intact.",
      },
      {
        id: "vuur-akte",
        soort: "uitkomst",
        toon: "amber",
        titel: "Vuurwerkbesluit, binnen de akte",
        tekst: "Consumentenvuurwerk is gebonden aan de periode in het Vuurwerkbesluit. Een APV kan daarnaast gelden. Schrijf de waarneming, niet een categorie die je niet hebt vastgesteld.",
        pv: "Ik zag dat [VERDACHTE] te [PLAATS] vuurwerk afstak of aanwezig had, namelijk [WAT IK ZAG]. Dat viel buiten de toegestane periode. Grondslag: Vuurwerkbesluit en, indien van toepassing, [ARTIKEL APV].",
      },
      {
        id: "vis-ja",
        soort: "uitkomst",
        toon: "navy",
        titel: "H 645 a bij één of twee hengels",
        tekst: "Artikel 21 lid 1 Visserijwet 1963. De VISpas is de gangbare schriftelijke toestemming. Eén peur is een andere code (H 645 b), meer dan twee hengels ook (H 645 c). Noem het water en de rechthebbende.",
        pv: "Ik zag dat [VERDACHTE] te [WATER] viste met [TUIG]. Een geldige schriftelijke toestemming van de rechthebbende werd niet getoond.",
      },
      {
        id: "geen-akte",
        soort: "uitkomst",
        toon: "amber",
        titel: "Niet jouw feit",
        tekst: "Zonder de wet in de akte verzamel je geen verhoor. Je kunt de bevoegde collega of de politie wijzen op wat je zag, zonder het zelf te verbaliseren.",
      },
      {
        id: "grond-ja",
        soort: "uitkomst",
        toon: "navy",
        titel: "D 537 kan, als 461 in de akte staat",
        tekst: "Artikel 461 Sr. Niet op kenteken. Vanaf 12 jaar. Ontbreekt het bord of is het de openbare weg, dan is dit de verkeerde grondslag.",
        pv: "Ik zag dat [VERDACHTE] zich bevond op [GROND]. De toegang was kenbaar verboden door [BORD]. Recht of toestemming ontbrak.",
      },
      {
        id: "grond-nee",
        soort: "uitkomst",
        toon: "amber",
        titel: "461 past niet",
        tekst: "Geen kenbaar bord, wel toestemming, of de openbare weg: niet schrijven op artikel 461. Kijk of een andere regel uit jouw akte de situatie dekt.",
      },
    ],
  },
  {
    id: "verzuim",
    titel: "Soort schoolverzuim",
    domeinen: ["III"],
    inleiding:
      "Eerst het soort verzuim, dan de normadressaat, dan Halt of PV. Artikel 4a is de kwalificatieplicht en is niet hetzelfde als de meldnorm van zestien uur.",
    start: "ingeschreven",
    nodes: [
      {
        id: "ingeschreven",
        soort: "vraag",
        titel: "Inschrijving",
        tekst: "Staat de jongere in de leerplichtige leeftijd ingeschreven bij een school of instelling?",
        keuzes: [
          { label: "Nee", naar: "vrijstelling" },
          { label: "Ja", naar: "reden" },
        ],
      },
      {
        id: "vrijstelling",
        soort: "vraag",
        titel: "Vrijstelling",
        tekst: "Is een vrijstelling aangetoond?",
        keuzes: [
          { label: "Ja", naar: "geen-feit" },
          { label: "Nee", naar: "absoluut" },
        ],
      },
      {
        id: "reden",
        soort: "vraag",
        titel: "Welke afwezigheid",
        tekst: "Waarom is de leerling weg?",
        keuzes: [
          { label: "Vakantie buiten de schoolvakantie", naar: "luxe-toets" },
          { label: "Losse of structurele afwezigheid", naar: "uren" },
        ],
      },
      {
        id: "luxe-toets",
        soort: "vraag",
        titel: "Artikel 11",
        tekst: "Heeft het schoolhoofd een vrijstelling verleend voor deze dagen?",
        keuzes: [
          { label: "Ja", naar: "geen-feit" },
          { label: "Nee", naar: "luxe" },
        ],
      },
      {
        id: "uren",
        soort: "vraag",
        titel: "Meldnorm",
        tekst: "Gaat het om zestien uren les- of praktijktijd in vier opeenvolgende lesweken, zonder geldige reden?",
        keuzes: [
          { label: "Ja", naar: "relatief" },
          { label: "Nog niet", naar: "nog-niet" },
        ],
      },
      {
        id: "geen-feit",
        soort: "uitkomst",
        toon: "ok",
        titel: "Geen verzuimfeit op deze grond",
        tekst: "Een aangetoonde vrijstelling schrijf je niet als verzuim. Leg vast dát je die hebt gezien, zonder het leerlingdossier in dit portaal te plakken.",
      },
      {
        id: "absoluut",
        soort: "uitkomst",
        toon: "navy",
        titel: "Absoluut verzuim",
        tekst: "Niet ingeschreven, leerplicht van toepassing, geen vrijstelling. De normadressaat is vaak de ouder. Geen namen of dossiernummers in dit portaal.",
        pv: "De jongere in de leerplichtige leeftijd stond op [DATUM] niet ingeschreven. Een vrijstelling was niet aangetoond. Dit is absoluut verzuim.",
      },
      {
        id: "luxe",
        soort: "uitkomst",
        toon: "amber",
        titel: "Luxe verzuim",
        tekst: "Vakantie buiten de schoolvakantie zonder vrijstelling op grond van artikel 11. Meestal een PV tegen de ouder. Leg de gemiste dagen vast.",
        pv: "De leerling was afwezig van [DATUM] tot [DATUM] wegens vakantie buiten de schoolvakantie. Een vrijstelling op grond van artikel 11 was niet verleend.",
      },
      {
        id: "relatief",
        soort: "uitkomst",
        toon: "navy",
        titel: "Relatief verzuim",
        tekst: "Wel ingeschreven. De meldnorm van artikel 21a is gehaald. Vanaf 12 jaar kan de jongere zelf normadressaat zijn (art. 2 lid 3); de ouder blijft dat ook. Halt alleen met bekentenis en instemming, onder de 16 ook van de ouders. Niet forceren.",
        pv: "De leerling staat ingeschreven bij [SCHOOL] en was in vier opeenvolgende lesweken zestien uren of meer zonder geldige reden afwezig. Grondslag: artikel 2 Leerplichtwet 1969. Route: [HALT / PV].",
      },
      {
        id: "nog-niet",
        soort: "uitkomst",
        toon: "ok",
        titel: "De meldnorm is nog niet gehaald",
        tekst: "Eén gemist uur is nog geen relatief verzuim volgens artikel 21a. De school blijft registreren. Een PV op die norm is dan te vroeg. Kwalificatieplicht (art. 4a) is een andere vraag en gaat niet vanzelf op in deze telling.",
      },
    ],
  },
  {
    id: "woning",
    titel: "Huisbezoek en inlichtingenplicht",
    domeinen: ["V"],
    inleiding:
      "Een woning betreed je met toestemming of met een machtiging voor dít adres en dít doel. De inlichtingenplicht van artikel 17 Participatiewet maakt van een weigering geen toestemming.",
    start: "naar-binnen",
    nodes: [
      {
        id: "naar-binnen",
        soort: "vraag",
        titel: "Moet je naar binnen",
        tekst: "Heb je de woning nodig, of kun je het onderzoek buiten af?",
        keuzes: [
          { label: "Buiten is genoeg", naar: "buiten" },
          { label: "Ik moet naar binnen", naar: "uitgelegd" },
        ],
      },
      {
        id: "uitgelegd",
        soort: "vraag",
        titel: "Vooraf uitgelegd",
        tekst: "Heb je je gelegitimeerd, het doel genoemd, en gezegd dat binnenlaten niet verplicht is?",
        keuzes: [
          { label: "Ja", naar: "ja-nee" },
          { label: "Nee", naar: "eerst-uitleggen" },
        ],
      },
      {
        id: "ja-nee",
        soort: "vraag",
        titel: "Toestemming",
        tekst: "Geeft een bewoner die dit kan overzien, vrij en specifiek, toestemming?",
        keuzes: [
          { label: "Ja", naar: "binnen" },
          { label: "Nee", naar: "machtiging" },
        ],
      },
      {
        id: "machtiging",
        soort: "vraag",
        titel: "Titel",
        tekst: "Heb je een schriftelijke machtiging die dit adres en dit doel dekt?",
        keuzes: [
          { label: "Ja", naar: "titel" },
          { label: "Nee", naar: "buiten-blijven" },
        ],
      },
      {
        id: "buiten",
        soort: "uitkomst",
        toon: "ok",
        titel: "Blijf buiten",
        tekst: "Geen woning in 'omdat je er toch bent'. Artikel 17 vraag je langs de weg die bij het onderzoek hoort, niet over de drempel zonder titel.",
      },
      {
        id: "eerst-uitleggen",
        soort: "uitkomst",
        toon: "amber",
        titel: "Eerst uitleggen, dan pas vragen",
        tekst: "Zonder legitimatie en zonder het doel is een ja geen bruikbare toestemming. Doe de zin opnieuw, op de stoep.",
      },
      {
        id: "binnen",
        soort: "uitkomst",
        toon: "navy",
        titel: "Naar binnen, toestemming kan stoppen",
        tekst: "Trekt de bewoner de toestemming in, dan vertrek je, tenzij alsnog een geldige titel geldt. Een waarom-vraag over een verzwegen huishouden of inkomen is verhoor: eerst cautie. De bestuurlijke boete van artikel 18a legt het college op, niet jij op de keukentafel.",
        pv: "Ik heb mij gelegitimeerd en het doel genoemd: [DOEL]. Ik heb gezegd dat binnenlaten niet verplicht is. De bewoner heeft daarna toestemming gegeven. De toestemming is [NIET / WEL] ingetrokken.",
      },
      {
        id: "titel",
        soort: "uitkomst",
        toon: "stop",
        titel: "Alleen binnen de machtiging",
        tekst: "De Algemene wet op het binnentreden: legitimeren en het doel mededelen. Niet verder zoeken dan de titel dekt. Verzet of een onveilige situatie: stoppen en de politie.",
        pv: "Ik ben binnengetreden met een schriftelijke machtiging voor [ADRES ALS ZAAK, NIET IN DIT PORTAAL KOPIËREN] en doel [DOEL]. Ik heb mij vooraf gelegitimeerd.",
      },
      {
        id: "buiten-blijven",
        soort: "uitkomst",
        toon: "stop",
        titel: "Niet naar binnen",
        tekst: "Geen toestemming en geen machtiging: je blijft buiten. Een weigering is geen artikel 184 om alsnog de deur te openen. Het onderzoek kan op een ander moment, met een titel.",
      },
    ],
  },
  {
    id: "akte",
    titel: "Staat het feit in de akte",
    domeinen: ["VI"],
    inleiding:
      "Domein VI is algemene opsporing alleen waar de akte dat zegt. Meelopen met de politie maakt van een feit geen boataak.",
    start: "in-akte",
    nodes: [
      {
        id: "in-akte",
        soort: "vraag",
        titel: "De akte",
        tekst: "Staat dit concrete feit, niet alleen het domein, in jouw akte van opsporing?",
        keuzes: [
          { label: "Ja", naar: "welk-recht" },
          { label: "Nee of ik weet het niet zeker", naar: "niet" },
        ],
      },
      {
        id: "welk-recht",
        soort: "vraag",
        titel: "Welk recht",
        tekst: "Is het een Mulderfeit op kenteken, of een strafbaar feit met een verdachte?",
        keuzes: [
          { label: "Mulder op kenteken, zoals R 545", naar: "mulder" },
          { label: "Strafrecht met een persoon, zoals K 055", naar: "straf" },
          { label: "Gevaar op de weg, artikel 5 of 5a WVW", naar: "gevaar" },
        ],
      },
      {
        id: "straf",
        soort: "vraag",
        titel: "Verhoor",
        tekst: "Ga je vragen stellen over de betrokkenheid, anders dan personalia?",
        keuzes: [
          { label: "Ja", naar: "cautie" },
          { label: "Nee, alleen vaststellen en personalia", naar: "vast" },
        ],
      },
      {
        id: "niet",
        soort: "uitkomst",
        toon: "stop",
        titel: "Niet verbaliseren",
        tekst: "Bij twijfel over de akte behandel je het feit als niet van jou. Je mag wel direct gevaar beperken en de politie vragen. Een verdachte houd je niet vast voor eigen verhoor op kantoor.",
      },
      {
        id: "mulder",
        soort: "uitkomst",
        toon: "ok",
        titel: "Wahv, als de code in je pakket zit",
        tekst: "R 545 is vasthouden van een mobiel apparaat. Het tarief hangt af van de categorie: auto niet hetzelfde als fiets. Geen cautie voor de kentekenbeschikking zelf. De rijinstructeur valt buiten deze code.",
        pv: "Ik zag dat de bestuurder van [VOERTUIG] tijdens het rijden een mobiel apparaat vasthield. Plaats: [PLAATS]. Feitcode R 545, artikel 61a RVV 1990.",
      },
      {
        id: "cautie",
        soort: "uitkomst",
        toon: "amber",
        titel: "Eerst cautie",
        tekst: "K 055 (artikel 107 jo. 177 en 178 WVW) is een overtreding, geen misdrijf en geen Mulderfeit. Geen vast bedrag. Staandehouding hoort erbij. De cautie komt vóór de vraag naar het rijden zonder geldig rijbewijs.",
        pv: "Ik zag dat [VERDACHTE] als bestuurder een motorrijtuig reed. Een geldig rijbewijs voor categorie [CATEGORIE] werd niet getoond. Ik heb de cautie gegeven voordat ik over het feit vragen stelde. Feitcode K 055.",
      },
      {
        id: "vast",
        soort: "uitkomst",
        toon: "navy",
        titel: "Vaststellen mag",
        tekst: "Personalia, kenteken en wat je zag. De eerste waarom-vraag draait dit om naar een verhoor. Dan alsnog de cautie, voordat je die vraag stelt.",
      },
      {
        id: "gevaar",
        soort: "uitkomst",
        toon: "stop",
        titel: "Veiligheid, daarna de politie",
        tekst: "Artikel 5 is een vangnet en bijna altijd politiewerk. Artikel 5a is een misdrijf. Alleen als jouw akte het feit uitdrukkelijk noemt, verbaliseer je zelf. Anders: positie, veiligheid, melding.",
      },
    ],
  },
  {
    id: "ov-leeftijd",
    titel: "Leeftijd in het openbaar vervoer",
    domeinen: ["IV"],
    inleiding:
      "Een vervoerder mag bij een rit zonder geldig bewjis om een identiteitsbewijs vragen. De toonplicht van de WID begint bij 14. Een draagplicht is er niet. D 517 dus ook niet onder de 14.",
    start: "plek",
    nodes: [
      {
        id: "plek",
        soort: "vraag",
        titel: "Waar sta je",
        tekst: "Gaat het om een rit of een station zonder geldig vervoerbewijs?",
        keuzes: [
          { label: "Ja", naar: "leeftijd" },
          { label: "Nee, op straat buiten het vervoer", naar: "straat" },
        ],
      },
      {
        id: "straat",
        soort: "uitkomst",
        toon: "navy",
        titel: "Gewone toonplicht",
        tekst: "Buiten het vervoer geldt artikel 2 WID. Vanaf 14 jaar kun je inzage vorderen. Onder de 14 geen D 517. Er is geen draagplicht.",
      },
      {
        id: "leeftijd",
        soort: "vraag",
        titel: "Leeftijd",
        tekst: "Welke leeftijd kun je verdedigen, zonder BSN?",
        keuzes: [
          { label: "Onder 12", naar: "kind" },
          { label: "12 of 13", naar: "twaalf" },
          { label: "14 of ouder", naar: "volwassen" },
        ],
      },
      {
        id: "kind",
        soort: "uitkomst",
        toon: "ok",
        titel: "Geen strafrecht",
        tekst: "Onder de 12 is er geen strafvervolging. Veiligheid en, als dat kan, een ouder of begeleider. Geen D 517 en geen aanhouding voor het niet tonen van een ID.",
      },
      {
        id: "twaalf",
        soort: "uitkomst",
        toon: "amber",
        titel: "Vragen mag, D 517 niet",
        tekst: "Voor de rit kan om een identiteitsbewijs worden gevraagd. Het niet tonen is onder de 14 geen zelfstandig feit. Geen draagplicht. Het vervoerbewijsfeit zelf beoordeel je los, met de administratieve betaling als eerste lijn.",
      },
      {
        id: "volwassen",
        soort: "uitkomst",
        toon: "stop",
        titel: "Toonplicht, en pas daarna 447e",
        tekst: "Vanaf 14: vorder inzage, waarschuw op artikel 447e Sr, en schrijf D 517 alleen als daarna niet wordt voldaan. Het zwartrijden zelf blijft E 100 a of de administratieve route, niet automatisch een aanhouding.",
        pv: "Ik heb [VERDACHTE], 14 jaar of ouder, in het openbaar vervoer gevorderd een identiteitsbewijs te tonen. [VERDACHTE] voldeed na waarschuwing op artikel 447e Sr niet. Daarnaast: [VERVOERBEWIJS / ADMINISTRATIEVE BETALING].",
      },
    ],
  },
  {
    id: "alcohol",
    titel: "Alcohol | leeftijd en wie de drank geeft",
    domeinen: ["I"],
    inleiding: "E 211, F 121 en artikel 20 zijn verschillende feiten. De leeftijd en de plek bepalen de code. Verzin geen derde tarief.",
    start: "wie",
    nodes: [
      {
        id: "wie",
        soort: "vraag",
        titel: "Wie heeft de drank",
        tekst: "Gaat het om de persoon die de drank bij zich heeft, of om iemand die drank geeft?",
        keuzes: [
          { label: "Bij zich hebben of drinken", naar: "leeftijd" },
          { label: "Iemand verstrekt drank", naar: "gever" },
        ],
      },
      {
        id: "leeftijd",
        soort: "vraag",
        titel: "Leeftijd van die persoon",
        tekst: "Is de persoon onder de 18?",
        keuzes: [
          { label: "Ja, onder de 18", naar: "e211" },
          { label: "Nee, 18 of ouder", naar: "gebied" },
        ],
      },
      {
        id: "gebied",
        soort: "vraag",
        titel: "Aangewezen gebied",
        tekst: "Is dit een plaats die het college of de burgemeester heeft aangewezen, en is de verpakking open of wordt er gedronken?",
        keuzes: [
          { label: "Ja", naar: "f121" },
          { label: "Nee, of de fles is dicht", naar: "geen-f" },
        ],
      },
      {
        id: "gever",
        soort: "vraag",
        titel: "Wie geeft de drank",
        tekst: "Is het bedrijfsmatig, of anders dan om niet, zoals een bar of slijter?",
        keuzes: [
          { label: "Ja, een bedrijf", naar: "art20" },
          { label: "Nee, een persoon op een publieke plaats", naar: "e209" },
        ],
      },
      {
        id: "e211",
        soort: "uitkomst",
        toon: "stop",
        titel: "E 211 | artikel 45",
        tekst: "Aanwezig hebben door iemand onder de 18 op een publieke plaats is E 211, € 110. Niet F 121. Uitzonderingen in lid 2: onder meer 16- en 17-jarigen die in de horeca dienstdoen, en een testkoper in opdracht. Geen testaankoop zonder protocol.",
        pv: "[VERDACHTE], jonger dan 18, had alcoholhoudende drank aanwezig op een voor het publiek toegankelijke plaats. Grondslag: artikel 45 lid 1 Alcoholwet, feitcode E 211.",
      },
      {
        id: "f121",
        soort: "uitkomst",
        toon: "navy",
        titel: "F 121 a of F 121 b",
        tekst: "18 of ouder. F 121 a is gebruiken, F 121 b is een aangebroken verpakking bij je hebben. Beide € 110, alleen in het aangewezen gebied. F 120 b is hinderlijk ophouden, een ander feit van € 170.",
      },
      {
        id: "geen-f",
        soort: "uitkomst",
        toon: "ok",
        titel: "Geen F 121 op deze feiten",
        tekst: "Buiten het aangewezen gebied, of met een gesloten verpakking, is F 121 meestal niet aan de orde. Zoek het APV-artikel van deze gemeente voordat je toch een bon schrijft.",
      },
      {
        id: "art20",
        soort: "uitkomst",
        toon: "amber",
        titel: "Artikel 20 lid 1 | bestuurlijk",
        tekst: "Bedrijfsmatig verstrekken aan iemand van wie niet is vastgesteld dat die 18 is, is in de regel een bestuurlijke boete. De jongere die de drank aanwezig heeft, blijft een apart spoor: E 211.",
      },
      {
        id: "e209",
        soort: "uitkomst",
        toon: "amber",
        titel: "E 209 | artikel 45a",
        tekst: "Een volwassene die op een publieke plaats anders dan bedrijfsmatig drank doorgeeft. Geen vast tarief in het Feitenboekje 2026. Geen bedrag verzinnen.",
      },
    ],
  },
  {
    id: "inlichting",
    titel: "Inlichtingenplicht of verhoor",
    domeinen: ["V"],
    inleiding: "Artikel 17 Participatiewet is bestuursrecht. Een vraag naar opzet is strafrecht. Die twee niet in één adem afdwingen.",
    start: "doel",
    nodes: [
      {
        id: "doel",
        soort: "vraag",
        titel: "Wat wil je weten",
        tekst: "Zoek je gegevens die het recht op bijstand raken, of een verklaring over opzet of een strafbaar feit?",
        keuzes: [
          { label: "Gegevens voor het recht", naar: "bestuur" },
          { label: "Opzet of een strafbaar feit", naar: "straf" },
        ],
      },
      {
        id: "bestuur",
        soort: "vraag",
        titel: "De woning",
        tekst: "Moet je daarvoor naar binnen?",
        keuzes: [
          { label: "Nee, de stukken kunnen buiten", naar: "buiten" },
          { label: "Ja", naar: "binnen" },
        ],
      },
      {
        id: "straf",
        soort: "uitkomst",
        toon: "stop",
        titel: "Eerst cautie",
        tekst: "Zeg dat je als opsporingsambtenaar optreedt. Geef de cautie vóór de vraag. Artikel 17 gebruik je niet om het zwijgrecht te omzeilen. De bestuurlijke boete van artikel 18a legt het college op, niet jij.",
        pv: "Vanaf [TIJD] was er een redelijk vermoeden van een strafbaar feit. Ik heb de cautie gegeven voordat ik [VERDACHTE] vroeg naar de betrokkenheid.",
      },
      {
        id: "buiten",
        soort: "uitkomst",
        toon: "ok",
        titel: "Blijf bij de inlichtingenplicht",
        tekst: "Vraag de stukken die het recht raken. Geen waarom-vraag over schuld. Geen BSN in dit portaal. De boete is daarna een besluit van het college.",
      },
      {
        id: "binnen",
        soort: "uitkomst",
        toon: "amber",
        titel: "Alleen met vrije toestemming",
        tekst: "Doel en hoedanigheid vóór de drempel. Zeg dat binnenlaten niet verplicht is. Stilzwijgen is geen ja. Dreigen met stopzetting maakt de toestemming onvrij. Intrekken kan op elk moment. Gebruik de boom Huisbezoek als je twijfelt.",
      },
    ],
  },
  {
    id: "fiets",
    titel: "Fiets | telefoon, licht, geen kenteken",
    domeinen: ["I", "VI"],
    inleiding: "Een fiets is geen auto met een lager rond bedrag. De categorie in het Feitenboekje bepaalt het tarief.",
    start: "wat",
    nodes: [
      {
        id: "wat",
        soort: "vraag",
        titel: "Wat zie je",
        tekst: "Wat is de gedraging?",
        keuzes: [
          { label: "Telefoon vasthouden tijdens het rijden", naar: "telefoon" },
          { label: "Verlichting of een ander fietsfeit", naar: "licht" },
          { label: "De fietser gaat schelden of duwen", naar: "sfeer" },
        ],
      },
      {
        id: "telefoon",
        soort: "uitkomst",
        toon: "navy",
        titel: "R 545 | categorie fiets",
        tekst: "Zelfde feitcode als de automobilist, ander tarief. Het criterium is vasthouden, niet alleen bellen. Wahv: geen cautie en geen staandehouding voor de beschikking zelf. Geen € 440 overnemen van de auto.",
        pv: "Ik zag dat de bestuurder van een fiets tijdens het rijden een mobiel apparaat vasthield. Plaats: [PLAATS]. Feitcode R 545, categorie fiets, artikel 61a RVV 1990.",
      },
      {
        id: "licht",
        soort: "uitkomst",
        toon: "amber",
        titel: "Eerst de code, dan het bedrag",
        tekst: "Verlichting staat in de RVV. Het tarief haal je uit de feitcode, niet uit een gewoonte. Een gewone fiets krijgt geen kentekenbon en geen combibon.",
      },
      {
        id: "sfeer",
        soort: "uitkomst",
        toon: "stop",
        titel: "Dit is een ander spoor",
        tekst: "Belediging of verzet is strafrecht. Hardop de overgang, cautie vóór de waarom-vraag, en de boom Geweld als je fysiek moet ingrijpen. De fietsbon zelf blijft Wahv.",
      },
    ],
  },
];

export function nodeById(tree: Tree, id: string): TreeNode | undefined {
  return tree.nodes.find((node) => node.id === id);
}
