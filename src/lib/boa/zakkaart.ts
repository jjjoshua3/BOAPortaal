import type { DomeinId } from "@/lib/boa/meta";

export type Kaart = {
  id: string;
  titel: string;
  artikel: string;
  domeinen: DomeinId[];
  spreek: string;
  pv: string;
  regels: string[];
  niet: string;
};

export const KAARTEN: Kaart[] = [
  {
    id: "cautie",
    titel: "Cautie",
    artikel: "Art. 29 lid 2 Sv",
    domeinen: ["algemeen"],
    spreek: "U bent niet tot antwoorden verplicht.",
    pv: "Voorafgaand aan het verhoor heb ik, verbalisant, de verdachte medegedeeld dat hij niet tot antwoorden verplicht is.",
    regels: [
      "Geef de cautie vóór de eerste verhoorvraag, in gewone woorden, en controleer of die aankomt.",
      "Vragen naar personalia op grond van artikel 52 Sv is geen verhoor. Daar is geen cautie voor nodig.",
      "De vraag waarom iemand het blikje op straat gooide, is wél een verhoor. Eerst de cautie.",
      "Bij een sfeerovergang zeg je hardop dat je nu als opsporingsambtenaar optreedt, en daarna de cautie.",
    ],
    niet: "De cautie is geen formaliteit achteraf. Een verklaring die je dáárvoor hebt uitgelokt, is kwetsbaar.",
  },
  {
    id: "staand",
    titel: "Staande houden",
    artikel: "Art. 52 Sv",
    domeinen: ["algemeen"],
    spreek: "Ik houd u staande ter vaststelling van uw identiteit in verband met [GEDRAGING].",
    pv: "Ik heb [VERDACHTE] staande gehouden als bedoeld in artikel 52 van het Wetboek van Strafvordering, ter vaststelling van de identiteit, in verband met [FEIT].",
    regels: [
      "Alleen als er een strafbaar feit is waarvan deze persoon wordt verdacht.",
      "Het duurt niet langer dan nodig is voor identiteit en de aard van het feit.",
      "Bij de Wahv (parkeerbeschikking op kenteken) is dit geen staandehouding. Dan stilhouden op grond van artikel 5:19 Awb.",
      "Zeg in het Mulder-dossier niet dat je iemand staande hield.",
    ],
    niet: "Een praatje op straat is nog geen staandehouding. Noem het pas zo als je de persoon echt tegenhoudt voor een strafbaar feit.",
  },
  {
    id: "id",
    titel: "Vordering inzage identiteitsbewijs",
    artikel: "Art. 2 WID jo. art. 5:16a Awb / art. 8a Politiewet",
    domeinen: ["algemeen"],
    spreek: "Ik vorder van u inzage in een geldig identiteitsbewijs op grond van de Wet op de identificatieplicht.",
    pv: "Ik heb [VERDACHTE] gevorderd een geldig identiteitsbewijs ter inzage te tonen. [VERDACHTE] heeft [WEL / NIET] aan die vordering voldaan.",
    regels: [
      "Waarschuwing bij weigering: 'Ik wijs u erop dat het niet voldoen aan deze vordering een strafbaar feit oplevert op grond van artikel 447e van het Wetboek van Strafrecht, waarvoor u kunt worden aangehouden.'",
      "Er is geen draagplicht. De toonplicht geldt vanaf 14 jaar (art. 2 WID).",
      "12 of 13 jaar: geen D 517, omdat de toonplicht dan niet geldt. De identiteit stel je op een andere manier vast.",
      "Onder 12 jaar: geen strafrechtelijke route.",
      "Een valse naam is artikel 435 onder 4 Sr, niet artikel 447e.",
    ],
    niet: "Vorder niet 'een ID' van een 13-jarige alsof dat een zelfstandig feit oplevert.",
  },
  {
    id: "aanhouding",
    titel: "Aanhouding op heterdaad",
    artikel: "Art. 53 en 54 Sv, overdracht art. 154 Sv",
    domeinen: ["algemeen"],
    spreek: "Ik houd u aan ter zake [FEIT]. U gaat mee voor voorgeleiding aan een hulpofficier van justitie.",
    pv: "Ik heb [VERDACHTE] op heterdaad aangehouden ter zake [FEIT], op grond van artikel 53 van het Wetboek van Strafvordering. Ik heb [VERDACHTE] onverwijld overgedragen aan [POLITIE / HULPOFFICIER].",
    regels: [
      "Heterdaad: je ontdekt het feit terwijl het plaatsvindt of kort daarna, en de dader is nog in de buurt.",
      "De boa draagt de aangehouden verdachte onverwijld over. Je verhoort niet 'op het gemeentehuis'.",
      "Cautie zodra je gaat verhoren. De aanhoudingsmededeling zelf is nog geen verhoor.",
      "Buiten heterdaad alleen als jouw akte en de wet dat voor dit feit toestaan. In de praktijk is dat de uitzondering.",
    ],
    niet: "Een Mulder-beschikking is geen aanhouding. Weigeren te tekenen op een bon evenmin.",
  },
  {
    id: "fouille",
    titel: "Veiligheidsfouillering",
    artikel: "Art. 7 lid 3 Ambtsinstructie",
    domeinen: ["algemeen"],
    spreek: "Ik ga uw kleding onderzoeken op wapens of gevaarlijke voorwerpen. Dit is voor de veiligheid.",
    pv: "Ik heb [VERDACHTE] een onderzoek aan de kleding gedaan als bedoeld in artikel 7, derde lid, van de Ambtsinstructie. Dat was noodzakelijk voor de veiligheid van [VERDACHTE], mijzelf of derden. Het onderzoek was gericht op wapens en andere gevaarlijke voorwerpen. Aangetroffen: [NIETS / VOORWERP].",
    regels: [
      "Alleen als de veiligheid dat op dat moment vraagt, niet als routine bij elke bon.",
      "Aan de kleding. Niet in lichaamsholten. Niet om een bewijsfeit te zoeken.",
      "Een voorwerp dat je zo aantreft, mag je veiligstellen. Beschrijf het feitelijk.",
      "Laat iemand zo veel mogelijk zelf zakken legen als dat veilig kan.",
    ],
    niet: "Een veiligheidsfouillering is geen zoeking op grond van het Wetboek van Strafvordering.",
  },
  {
    id: "boeien",
    titel: "Handboeien",
    artikel: "Art. 22 Ambtsinstructie",
    domeinen: ["algemeen"],
    spreek: "Ik doe u handboeien om, omdat [VLUCHTGEVAAR / GEVAAR VOOR DE VEILIGHEID]. Een lichter middel is nu niet genoeg.",
    pv: "Ik heb [VERDACHTE] handboeien aangelegd op grond van artikel 22 van de Ambtsinstructie. Naar mijn oordeel bestond er [VLUCHTGEVAAR / ONMIDDELLIJK GEVAAR VOOR DE VEILIGHEID VAN VERDACHTE, MIJZELF OF DERDEN], namelijk [FEITEN]. Een lichter middel volstond niet. De boeien zijn [TIJDSTIP] aangelegd en [TIJDSTIP] afgenomen. Letsel: [GEEN / WEL, EN WELKE ZORG].",
    regels: [
      "Twee zelfstandige gronden: vluchtgevaar, of onmiddellijk gevaar voor de veiligheid.",
      "Proportionaliteit en subsidiariteit: eerst een lichter middel als dat kan.",
      "Waarschuw vooraf als de situatie dat toelaat.",
      "Controleer de doorbloeding. Bij letsel of een klacht: medische zorg en melding aan de meerdere en, waar de RTGB dat eist, de hulpofficier.",
      "De reden hoort letterlijk in het PV. 'Standaard bij aanhouding' is geen reden.",
    ],
    niet: "Boeien om iemand tot praten te bewegen is wederrechtelijk.",
  },
  {
    id: "woning",
    titel: "Huisbezoek en binnentreden",
    artikel: "Awbi | informed consent",
    domeinen: ["V", "III"],
    spreek:
      "Ik ben [FUNCTIE] van [ORGANISATIE]. Ik wil met u spreken over [DOEL]. U bent niet verplicht mij binnen te laten. Als u mij binnenlaat, mag u die toestemming op elk moment intrekken.",
    pv: "Ik heb mij gelegitimeerd en kenbaar gemaakt dat ik [FUNCTIE] ben. Ik heb het doel van mijn komst genoemd: [DOEL]. Ik heb uitdrukkelijk gezegd dat [BEWONER] niet verplicht is mij in de woning toe te laten en dat toestemming kan worden ingetrokken. [BEWONER] heeft daarna vrijelijk toestemming gegeven om de woning te betreden. De toestemming zag op [WELK DEEL]. Om [TIJD] is de toestemming [NOG STEEDS / INGETROKKEN].",
    regels: [
      "Doel en hoedanigheid vóór de drempel, niet erna.",
      "Toestemming is vrij, specifiek en intrekbaar. Stilzwijgen is geen ja.",
      "Tegen de wil van de bewoner binnentreden kan alleen met een wettelijke titel en, waar de Awbi dat eist, een machtiging. Die heeft een boa bij een gewoon huisbezoek niet.",
      "Neem geen foto's van privéruimten voor dit portaal en noteer hier geen namen of BSN.",
    ],
    niet: "Een voet tussen de deur is geen toestemming. Dreigen met stopzetting van de uitkering om binnen te komen evenmin.",
  },
  {
    id: "sfeer",
    titel: "Sfeerovergang hardop uitspreken",
    artikel: "Art. 5:20 Awb naar art. 29 Sv",
    domeinen: ["algemeen"],
    spreek: "Ik treed vanaf dit moment op als opsporingsambtenaar. U bent niet tot antwoorden verplicht.",
    pv: "Tot [TIJDSTIP] trad ik op als toezichthouder. Vanaf dat moment was er een redelijk vermoeden van een strafbaar feit, namelijk [FEIT]. Ik heb [VERDACHTE] medegedeeld dat ik verder als opsporingsambtenaar optrad en de cautie gegeven voordat ik vragen stelde over het feit.",
    regels: [
      "De medewerkingsplicht stopt op het moment dat je een verklaring zoekt voor een strafbaar feit.",
      "Wat iemand vóór de cautie spontaan roept, noteer je als spontane verklaring. Je vraagt er niet op door zonder cautie.",
      "Gebruik de beslisboom Sfeerovergang als je twijfelt.",
    ],
    niet: "Niet eerst doorvragen 'want we zijn nog in het toezicht' als je allang een verdachte voor je hebt.",
  },
  {
    id: "mulder",
    titel: "Wahv tegenover strafrecht",
    artikel: "Art. 5:19 Awb tegenover art. 52 Sv",
    domeinen: ["I", "VI"],
    spreek: "Ik gebruik mijn toezichtsbevoegdheid. Dit voertuig krijgt een beschikking op het kenteken.",
    pv: "Ik trad op als toezichthouder. Het voertuig met kenteken [KENTEKEN] heb ik stilgehouden op grond van artikel 5:19 van de Algemene wet bestuursrecht / ik heb het geparkeerd aangetroffen. Er is een administratieve beschikking op het kenteken aangezegd. Er is geen verdachte staande gehouden en geen cautie gegeven, omdat er geen verhoor plaatsvond.",
    regels: [
      "Parkeerfeiten onder de Wahv: de kentekenhouder is aansprakelijk.",
      "Geen cautie, geen staandehouding, geen aanhouding voor het parkeerfeit zelf.",
      "Gaat de bestuurder daarna schelden of zich verzetten, dan ontstaat wél een strafrechtelijk spoor. Dan de sfeerovergang uitspreken.",
    ],
    niet: "Een kenteken noteren is geen identiteitsfouillering van de bestuurder.",
  },
  {
    id: "overdracht",
    titel: "Overdracht aan de politie",
    artikel: "Art. 154 Sv / Besluit boa",
    domeinen: ["algemeen"],
    spreek: "U blijft bij mij tot de politie er is. Ik draag u aan hen over.",
    pv: "De aangehouden verdachte is om [TIJD] onverwijld overgedragen aan [EENHEID / DIENSTNUMMER POLITIE]. Ik heb de reden van aanhouding, de cautie en de gebruikte middelen medegedeeld.",
    regels: [
      "Bellen zodra de aanhouding een feit is, niet nadat je zelf hebt 'afgehandeld'.",
      "Meld geweld, handboeien en letsel meteen, en schriftelijk binnen de termijn van je korps of gemeente.",
      "Geef de politie de feiten, niet je oordeel over de persoon.",
    ],
    niet: "Een verdachte meerijden naar een eigen kantoor om daar te wachten op een verhoor dat jij gaat doen, is geen onverwijlde overdracht.",
  },
  {
    id: "leer",
    titel: "Verzuim benoemen",
    artikel: "Leerplichtwet 1969 | art. 2, 11 en 21a",
    domeinen: ["III"],
    spreek: "Ik ben leerplichtambtenaar van [ORGANISATIE]. Ik wil vaststellen of dit relatief, absoluut of luxe verzuim is.",
    pv: "Soort verzuim: [RELATIEF / ABSOLUUT / LUXE]. Grondslag: [ARTIKEL]. Uren of dagen: [FEITEN]. Vrijstelling: [WEL / NIET AANGETOOND].",
    regels: [
      "Relatief: ingeschreven, en zestien uren in vier opeenvolgende lesweken. Dat is artikel 21a. Artikel 21 is vervallen.",
      "Absoluut: niet ingeschreven, nadat je een vrijstelling hebt getoetst.",
      "Luxe: vakantie buiten de schoolvakantie zonder vrijstelling, artikel 11.",
      "De jongere is vanaf 12 zelf ook normadressaat. Onder de 12 geen strafrecht tegen het kind.",
    ],
    niet: "Geen D 517 tegen een 13-jarige. De toonplicht begint bij 14. Een draagplicht is er niet.",
  },
  {
    id: "natuur",
    titel: "Buiten de akte blijven",
    artikel: "Akte van opsporing | domein II",
    domeinen: ["II"],
    spreek: "Dit feit valt buiten mijn akte. Ik beperk het gevaar en schakel de bevoegde collega in.",
    pv: "Ik zag [FEITELIJKE WAARNEMING] te [PLAATS]. Mijn akte noemt dit feit niet. Ik heb [POLITIE / NVWA / BEVOEGDE BOA] ingeschakeld en zelf niet geverbaliseerd.",
    regels: [
      "Vuurwerk niet demonteren en niet tot ontbranding brengen.",
      "Een dier beschrijf je zoals je het aantreft. Geen diagnose.",
      "Afval en natuur hebben vaak een lokaal artikel. Geen landelijk bedrag gokken.",
    ],
    niet: "Een bon uit domein I op een natuurfeit schrijven omdat je 'toch iets moet'.",
  },
  {
    id: "ov-id",
    titel: "ID in trein of bus",
    artikel: "Art. 2 WID | art. 70 Wp2000",
    domeinen: ["IV"],
    spreek: "Ik vraag uw vervoerbewijs. Bent u 14 jaar of ouder, dan vorder ik ook inzage in een identiteitsbewijs.",
    pv: "Controle vervoerbewijs: [BEVINDING]. Leeftijd: [14 OF OUDER / ONDER 14]. Inzage gevorderd: [JA / NEE, OMDAT DE TOONPLICHT NIET GELDT]. Administratieve betaling: [VOLDAAN / NIET].",
    regels: [
      "Eerste lijn bij artikel 70 is de administratieve betaling, niet meteen een PV.",
      "12 of 13: om een ID vragen voor de rit kan. D 517 niet.",
      "Er is geen draagplicht.",
      "NS-bedragen (ritprijs + € 50 bij pinnen, + € 70 bij uitstel) zijn vervoersvoorwaarden, niet E 100 a.",
    ],
    niet: "Het NS-tarief overnemen voor Arriva of een andere vervoerder.",
  },
  {
    id: "plicht",
    titel: "Inlichtingenplicht hardop begrenzen",
    artikel: "Art. 17 Participatiewet",
    domeinen: ["V"],
    spreek: "Ik vraag de gegevens die uw recht op bijstand raken. Over een strafbaar feit hoeft u niet te verklaren.",
    pv: "Ik heb de inlichtingenplicht van artikel 17 Participatiewet uitgelegd voor [GEGEVENS]. Een verhoor over opzet heeft [WEL / NIET] plaatsgevonden. Cautie: [WEL, VOORAF / NIET AAN DE ORDE].",
    regels: [
      "Stukken tonen kan bestuurlijk zijn. Waarom u het verzweeg is een verhoor.",
      "De boete van artikel 18a legt het college op.",
      "Geen medische gegevens vragen.",
    ],
    niet: "Artikel 17 gebruiken als pressiemiddel om toch een bekentenis te krijgen.",
  },
];
