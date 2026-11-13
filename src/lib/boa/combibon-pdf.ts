/** PDF die de ingevulde combibon op de bladen van model 113111 zet. */

import { SOORT_LABEL, type Combibon, type SoortBon, type Streek } from "./combibon";

const PW = 595;
const PH = 842;
const M = 28;
const IW = PW - M * 2;

const SOORTEN: SoortBon[] = ["S", "K", "A", "B", "O", "T"];

function f(n: number): string {
  return (Math.round(n * 100) / 100).toString();
}

function winBytes(raw: string): number[] {
  const text = raw.replaceAll("€", "EUR ").replaceAll("\u00a0", " ").replace(/\s+/g, " ");
  const extra: Record<string, number> = {
    "\u20ac": 0x80,
    "\u201a": 0x82,
    "\u201e": 0x84,
    "\u2026": 0x85,
    "\u2020": 0x86,
    "\u2021": 0x87,
    "\u02c6": 0x88,
    "\u2030": 0x89,
    "\u0160": 0x8a,
    "\u2039": 0x8b,
    "\u0152": 0x8c,
    "\u017d": 0x8e,
    "\u2018": 0x91,
    "\u2019": 0x92,
    "\u201c": 0x93,
    "\u201d": 0x94,
    "\u2022": 0x95,
    "\u2013": 0x96,
    "\u2014": 0x97,
    "\u02dc": 0x98,
    "\u2122": 0x99,
    "\u0161": 0x9a,
    "\u203a": 0x9b,
    "\u0153": 0x9c,
    "\u017e": 0x9e,
    "\u0178": 0x9f,
  };
  const out: number[] = [];
  for (const ch of text) {
    if (extra[ch] !== undefined) {
      out.push(extra[ch]);
      continue;
    }
    const code = ch.codePointAt(0) ?? 63;
    if (code >= 32 && code <= 255) out.push(code);
    else out.push(63);
  }
  return out;
}

function pdfString(raw: string): string {
  let out = "(";
  for (const b of winBytes(raw)) {
    if (b === 40 || b === 41 || b === 92) out += `\\${String.fromCharCode(b)}`;
    else if (b < 32 || b > 126) out += `\\${b.toString(8).padStart(3, "0")}`;
    else out += String.fromCharCode(b);
  }
  return `${out})`;
}

function wrap(text: string, width: number, size: number): string[] {
  const max = Math.max(8, Math.floor(width / (size * 0.5)));
  const words = text.replace(/[^\S\n]+/g, " ").trim().split(" ").filter(Boolean);
  if (!words.length) return [];
  const lines: string[] = [];
  let line = "";
  const duw = (woord: string) => {
    let rest = woord;
    while (rest.length > max) {
      lines.push(rest.slice(0, max));
      rest = rest.slice(max);
    }
    line = rest;
  };
  for (const woord of words) {
    const next = line ? `${line} ${woord}` : woord;
    if (next.length <= max) line = next;
    else {
      if (line) lines.push(line);
      if (woord.length > max) duw(woord);
      else line = woord;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function blok(text: string, width: number, size: number): string[] {
  return text.split(/\n/).flatMap((stuk) => {
    const regels = wrap(stuk, width, size);
    return regels.length ? regels : [""];
  });
}

class Draw {
  cmds: string[] = ["0.6 w", "0 0 0 RG", "0 0 0 rg"];

  box(x: number, top: number, w: number, h: number) {
    this.cmds.push(`${f(x)} ${f(PH - top - h)} ${f(w)} ${f(h)} re S`);
  }

  fill(x: number, top: number, w: number, h: number, gray: number) {
    this.cmds.push(`${gray} g`);
    this.cmds.push(`${f(x)} ${f(PH - top - h)} ${f(w)} ${f(h)} re f`);
    this.cmds.push("0 g");
  }

  text(x: number, baselineFromTop: number, value: string, size: number, bold = false) {
    const font = bold ? "F2" : "F1";
    this.cmds.push("BT", `/${font} ${f(size)} Tf`, `1 0 0 1 ${f(x)} ${f(PH - baselineFromTop)} Tm`, `${pdfString(value)} Tj`, "ET");
  }

  cross(x: number, top: number, s = 8) {
    const y = PH - top - s;
    this.cmds.push("1.15 w");
    this.cmds.push(`${f(x + 1.7)} ${f(y + 1.7)} m ${f(x + s - 1.7)} ${f(y + s - 1.7)} l S`);
    this.cmds.push(`${f(x + s - 1.7)} ${f(y + 1.7)} m ${f(x + 1.7)} ${f(y + s - 1.7)} l S`);
    this.cmds.push("0.6 w");
  }

  tick(x: number, top: number, on: boolean) {
    this.box(x, top, 8, 8);
    if (on) this.cross(x, top, 8);
  }

  strokes(x: number, top: number, w: number, h: number, lijnen: Streek[]) {
    this.cmds.push("1.15 w");
    for (const streek of lijnen) {
      if (streek.length < 2) continue;
      const eerst = streek[0];
      this.cmds.push(`${f(x + eerst.x * w)} ${f(PH - top - h + (1 - eerst.y) * h)} m`);
      for (let i = 1; i < streek.length; i += 1) {
        const punt = streek[i];
        this.cmds.push(`${f(x + punt.x * w)} ${f(PH - top - h + (1 - punt.y) * h)} l`);
      }
      this.cmds.push("S");
    }
    this.cmds.push("0.6 w");
  }

  out(): string {
    return this.cmds.join("\n");
  }
}

type Cel = { w: number; label: string; value: string };

function cellen(d: Draw, x: number, top: number, h: number, items: Cel[]) {
  let cx = x;
  for (const item of items) {
    d.box(cx, top, item.w, h);
    d.text(cx + 2, top + 8, item.label, 6);
    const regels = wrap(item.value, item.w - 4, 8);
    if (regels[0]) d.text(cx + 2, top + 18, regels[0], 8, true);
    if (regels[1] && h >= 30) d.text(cx + 2, top + 28, regels[1], 8, true);
    cx += item.w;
  }
}

function voet(d: Draw, bon: Combibon, blad: string) {
  d.text(M, 828, `${blad}  |  113111 versie 06/2018  |  BOA Portaal is geen formulier van het OM of het CJIB`, 6);
  d.text(M, 836, bon.model === "A1" ? "Model A, met verhoorblok" : "Model B, zonder verhoorblok", 6);
}

function kop(d: Draw, bon: Combibon, blad: string) {
  d.text(M, 22, blad, 8, true);
  d.text(PW - M - 170, 22, bon.model === "A1" ? "Proces-verbaal A" : "Proces-verbaal B", 8);
}

function paginaLinks(bon: Combibon): string {
  const d = new Draw();
  kop(d, bon, `Blad ${bon.model} (voorzijde links)`);
  const soortHoogte = 78;
  d.box(M, 30, 320, 36);
  d.text(M + 3, 40, "Naam opsporingsinstantie", 6);
  d.text(M + 3, 56, bon.instantie || " ", 10, true);

  d.box(M + 328, 30, IW - 328, soortHoogte);
  d.text(M + 332, 40, "Soort formulier", 6);
  SOORTEN.forEach((soort, index) => {
    const top = 46 + index * 10;
    d.tick(M + 332, top, bon.soorten.includes(soort));
    d.text(M + 344, top + 7, `${soort}  ${SOORT_LABEL[soort]}`, 6.5);
  });

  d.text(M, 122, "PROCES-VERBAAL", 12, true);
  d.text(M + 130, 122, `Zaak nr. PSH-TM  ${bon.zaak}`.slice(0, 52), 8);

  d.fill(M, 132, IW, 12, 0);
  d.cmds.push("1 g");
  d.text(M + 4, 141, "NUMMER", 8, true);
  d.cmds.push("0 g");
  const kolom = IW / 5;
  cellen(d, M, 144, 28, [
    { w: kolom, label: "Dag", value: bon.dag },
    { w: kolom, label: "Maand", value: bon.maand },
    { w: kolom, label: "Jaar", value: bon.jaar },
    { w: kolom, label: "Tijdstip", value: bon.tijd },
    { w: IW - kolom * 4, label: "Verbalisantnummer", value: bon.bonNummer },
  ]);

  cellen(d, M, 176, 32, [
    { w: IW - 150, label: "Plaats / gedraging / overtreding (voor het openbaar verkeer openstaande weg)", value: bon.plaats },
    { w: 80, label: "Wegcode", value: bon.wegcode },
    { w: 70, label: "HM-paal", value: bon.hm },
  ]);
  cellen(d, M, 208, 26, [
    { w: IW / 2, label: "Te", value: bon.te },
    { w: IW / 2, label: "Gemeente", value: bon.gemeente },
  ]);
  cellen(d, M, 234, 24, [
    { w: 140, label: "Soort voer-/vaartuig", value: bon.soortVoertuig },
    { w: 50, label: "Land", value: bon.land },
    { w: IW - 270, label: "Kenteken / registratieteken", value: bon.kenteken },
    { w: 80, label: "Dupl. code", value: bon.dupl },
  ]);
  cellen(d, M, 258, 24, [
    { w: 180, label: "Merk", value: bon.merk },
    { w: 200, label: "Type", value: bon.typeVoertuig },
    { w: IW - 380, label: "Kleur", value: bon.kleur },
  ]);

  const zin = `Ik, ambtenaar, ${bon.zag ? "[zag]" : "zag"} / ${bon.hoorde ? "[hoorde]" : "hoorde"} / ${bon.stelde ? "[stelde na onderzoek]" : "stelde na onderzoek"} vast dat op genoemde datum, tijdstip en plaats door betrokkene/verdachte - met het omschreven voer-/vaartuig - de volgende gedraging/overtreding werd verricht:`;
  const zinRegels = wrap(zin, IW - 8, 7);
  d.box(M, 286, IW, 26);
  zinRegels.slice(0, 2).forEach((regel, index) => d.text(M + 3, 296 + index * 8, regel, 7));

  d.box(M, 312, IW, 72);
  d.text(M + 3, 322, "Gedraging / overtreding", 6);
  blok(bon.gedraging, IW - 8, 8)
    .slice(0, 5)
    .forEach((regel, index) => d.text(M + 3, 334 + index * 10, regel, 8, true));

  cellen(d, M, 384, 26, [
    { w: 80, label: "Categorie", value: bon.categorie },
    { w: 110, label: "Nummer", value: bon.feitnummer },
    { w: 120, label: "Sanctiebedrag EUR", value: bon.sanctie },
    { w: IW - 310, label: "Onder nummer in de bijlage Wahv / Besluit OM-afdoening / richtlijn", value: `${bon.categorie} ${bon.feitnummer}`.trim() },
  ]);

  d.box(M, 410, IW, 20);
  d.text(M + 3, 420, "De betrokkene/verdachte gaf, daarnaar gevraagd, op", 7);
  d.text(M + 250, 423, bon.gevraagdOp, 9, true);

  d.box(M, 430, IW, 26);
  d.text(M + 3, 440, "Personalia conform (document aanvinken)", 6);
  const docs: [boolean, string][] = [
    [bon.docRbw, "rbw"],
    [bon.docPasp, "pasp."],
    [bon.docId, "ID-kaart"],
    [bon.docVreemd, "vreemd ID"],
    [bon.docMilitair, "militair"],
  ];
  docs.forEach(([aan, label], index) => {
    const x = M + 8 + index * 78;
    d.tick(x, 442, aan);
    d.text(x + 11, 449, label, 7);
  });

  cellen(d, M, 456, 24, [
    { w: 220, label: "Nummer document", value: bon.documentnummer },
    { w: 160, label: "Burgerservicenr.", value: bon.bsn },
    { w: IW - 380, label: "man / vrouw", value: bon.geslacht },
  ]);
  cellen(d, M, 480, 22, [
    { w: IW - 120, label: "Naam", value: bon.naam },
    { w: 120, label: "Voorvoegsel", value: bon.voorvoegsel },
  ]);
  cellen(d, M, 502, 22, [{ w: IW, label: "Voornamen", value: bon.voornamen }]);
  cellen(d, M, 524, 22, [
    { w: 250, label: "Geboorteplaats / -gemeente", value: bon.geboorteplaats },
    { w: 120, label: "Land", value: bon.geboorteland },
    { w: IW - 370, label: "Geboortedatum", value: bon.geboortedatum },
  ]);
  cellen(d, M, 546, 22, [
    { w: IW - 70, label: "Adres", value: bon.adres },
    { w: 70, label: "Huisnr.", value: bon.huisnr },
  ]);
  cellen(d, M, 568, 22, [
    { w: 90, label: "Postcode", value: bon.postcode },
    { w: 160, label: "Woonplaats", value: bon.woonplaats },
    { w: 180, label: "Woongemeente", value: bon.woongemeente },
    { w: IW - 430, label: "Land", value: bon.woonland },
  ]);

  const noot = wrap(
    "Sanctiebedrag exclusief administratiekosten van het CJIB (in het Feitenboekje 2026 doorgaans EUR 9 erbij), tenzij de verordening of het bronsysteem een ander bedrag voorschrijft. Een naheffing parkeerbelasting is geen Wahv-bedrag.",
    IW,
    7,
  );
  noot.forEach((regel, index) => d.text(M, 604 + index * 9, regel, 7));
  voet(d, bon, "Voorzijde links");
  return d.out();
}

function vlag(d: Draw, x: number, top: number, aan: boolean, label: string, w: number): number {
  d.tick(x, top, aan);
  const regels = wrap(label, w - 14, 7);
  regels.forEach((regel, index) => d.text(x + 12, top + 7 + index * 8, regel, 7));
  return Math.max(12, regels.length * 8 + 2);
}

function verbalist(d: Draw, x: number, top: number, w: number, titel: string, eed: Combibon["v1Eed"], datum: string, nummer: string, hovj: boolean, naam: string, hand: Streek[]) {
  d.box(x, top, w, 118);
  d.text(x + 3, top + 10, titel, 7, true);
  d.tick(x + 3, top + 16, eed === "eed");
  d.text(x + 14, top + 23, "ambtseed", 7);
  d.tick(x + 70, top + 16, eed === "belofte");
  d.text(x + 81, top + 23, "ambtsbelofte", 7);
  d.text(x + 3, top + 36, `Datum  ${datum}`, 8);
  d.text(x + 3, top + 48, `Verbalisantnummer  ${nummer}`, 8);
  d.tick(x + 3, top + 54, hovj);
  d.text(x + 14, top + 61, "HOvJ", 7);
  d.text(x + 3, top + 74, `Naam en voorletters  ${naam}`, 8);
  d.text(x + 3, top + 86, "Handtekening", 6);
  d.box(x + 4, top + 88, w - 8, 26);
  d.strokes(x + 4, top + 88, w - 8, 26, hand);
}

function paginaRechts(bon: Combibon): string {
  const d = new Draw();
  kop(d, bon, `Blad ${bon.model} (voorzijde rechts)`);
  let y = 30;
  cellen(d, M, y, 28, [
    { w: 150, label: "Oproeping zitting | datum", value: bon.zittingDatum },
    { w: 80, label: "Tijd", value: bon.zittingTijd },
    { w: IW - 230, label: "Plaats", value: bon.zittingPlaats },
  ]);
  y += 28;

  if (bon.model === "A1") {
    cellen(d, M, y, 28, [
      { w: 170, label: "Direct betaald | kwitantienummer", value: bon.kwitantie },
      { w: 130, label: "Administratiekosten voldaan", value: bon.adminVoldaan ? "ja" : "" },
      { w: 110, label: "Afwijkend bedrag EUR", value: bon.afwijkend },
      { w: IW - 410, label: "Naam OM-functionaris", value: bon.omNaam },
    ]);
    y += 32;
    const used = Math.max(
      vlag(d, M, y, bon.bewaring, "In bewaring gesteld na vordering onmiddellijke betaling", 200),
      vlag(d, M + 210, y, bon.wegsleep, "Weggesleept", 90),
      vlag(d, M + 310, y, bon.beslag, "Beslag", 80),
    );
    y += used + 4;
  }

  d.box(M, y, IW, 36);
  d.text(M + 3, y + 9, "Weg", 6);
  const wegen: [Combibon["weg"], string][] = [
    ["1", "Autosnelweg 1"],
    ["2", "Autoweg 2"],
    ["3", "Andere weg 3"],
    ["5", "Gewone weg 5"],
    ["6", "Onverharde weg 6"],
  ];
  wegen.forEach(([id, label], index) => {
    const x = M + 28 + index * 78;
    d.tick(x, y + 14, bon.weg === id);
    d.text(x + 11, y + 21, label, 6.5);
  });
  d.tick(M + 28, y + 26, bon.rijbaan);
  d.text(M + 39, y + 33, "Rijbaan", 7);
  d.tick(M + 100, y + 26, bon.fietspad);
  d.text(M + 111, y + 33, "Fietspad", 7);
  d.tick(M + 180, y + 26, bon.bubeko);
  d.text(M + 191, y + 33, "Bubeko", 7);
  d.tick(M + 250, y + 26, bon.bibeko);
  d.text(M + 261, y + 33, "Bibeko", 7);
  y += 40;

  cellen(d, M, y, 28, [
    { w: 90, label: "Snelheid gemeten", value: bon.snelGemeten },
    { w: 100, label: "Gecorrigeerd", value: bon.snelGecorrigeerd },
    { w: 90, label: "Toegestaan", value: bon.snelToegestaan },
    { w: 130, label: "Beginnende bestuurder", value: bon.beginnend ? "ja" : "" },
    { w: IW - 410, label: "Projectcode", value: bon.projectcode },
  ]);
  y += 32;

  if (bon.model === "A1") {
    d.box(M, y, IW, 16);
    d.text(M + 3, y + 11, "Verdachte/betrokkene gehoord door verbalisant", 7);
    d.tick(M + 250, y + 4, bon.gehoord === "1");
    d.text(M + 261, y + 11, "1", 8);
    d.tick(M + 280, y + 4, bon.gehoord === "2");
    d.text(M + 291, y + 11, "2", 8);
    y += 18;

    const blokken: [boolean, string][] = [
      [bon.cautie, "Medegedeeld dat hij/zij niet tot antwoorden verplicht is."],
      [bon.welkeFeit, "Medegedeeld van welk strafbaar feit of welke gedraging hij/zij als verdachte/betrokkene is aangemerkt."],
      [bon.rechtsbijstand, "Medegedeeld van het recht op rechtsbijstand."],
      [bon.vertolking, "Medegedeeld van het recht op vertolking en vertaling."],
      [bon.afstandBijstand, "Afstand van het recht op verhoorbijstand. Op de hoogte van de gevolgen. Kan die beslissing herroepen."],
      [bon.geenVerklaring, "Verdachte/betrokkene wenste geen verklaring af te leggen."],
    ];
    for (const [aan, label] of blokken) {
      const h = vlag(d, M, y, aan, label, IW);
      y += h + 1;
    }
    d.box(M, y, IW, 16);
    d.text(M + 3, y + 11, `Verhoor in begrijpelijke taal, te weten: ${bon.taal}    Tolkennummer: ${bon.tolknummer}`, 7);
    y += 18;
    const verklaringHoogte = 70;
    d.box(M, y, IW, verklaringHoogte);
    d.text(M + 3, y + 9, "Verdachte/betrokkene verklaarde:", 6);
    blok(bon.verklaring, IW - 8, 8)
      .slice(0, 5)
      .forEach((regel, index) => d.text(M + 3, y + 20 + index * 10, regel, 8));
    y += verklaringHoogte + 4;
  }

  d.text(M, y + 8, "Op de achterzijde vermelde gegevens maken onderdeel uit van dit proces-verbaal.", 7);
  y += 14;
  const kolom = (IW - 8) / 2;
  verbalist(d, M, y, kolom, "Gegevens 1e verbalisant", bon.v1Eed, bon.v1Datum, bon.v1Nummer, bon.v1Hovj, bon.v1Naam, bon.v1Hand);
  verbalist(d, M + kolom + 8, y, kolom, "Gegevens 2e verbalisant", bon.v2Eed, bon.v2Datum, bon.v2Nummer, bon.v2Hovj, bon.v2Naam, bon.v2Hand);
  y += 122;
  if (bon.model === "A1") {
    d.text(M, y + 8, `Datum binnenkomst adm.  ${bon.binnenkomst}`, 8);
  }
  voet(d, bon, "Voorzijde rechts");
  return d.out();
}

function paginaAchterA(bon: Combibon): string {
  const d = new Draw();
  kop(d, bon, "Blad A1 (achterzijde)");
  d.text(M, 48, "Bijlage opmerkingen verbalisant", 11, true);
  d.text(M, 64, "Redenen van wetenschap:", 8);
  d.box(M, 70, IW, 430);
  blok(bon.redenen, IW - 10, 9)
    .slice(0, 40)
    .forEach((regel, index) => d.text(M + 4, 84 + index * 11, regel, 9));
  const y = 510;
  const kolom = (IW - 8) / 2;
  verbalist(d, M, y, kolom, "Gegevens 1e verbalisant", bon.v1Eed, bon.v1Datum, bon.v1Nummer, bon.v1Hovj, bon.v1Naam, bon.v1Hand);
  verbalist(d, M + kolom + 8, y, kolom, "Gegevens 2e verbalisant", bon.v2Eed, bon.v2Datum, bon.v2Nummer, bon.v2Hovj, bon.v2Naam, bon.v2Hand);
  voet(d, bon, "Achterzijde");
  return d.out();
}

export const TOELICHTING: { kop: string; alinea: string[] }[] = [
  {
    kop: "Toelichting S | Aankondiging van strafbeschikking",
    alinea: [
      "U hebt een strafbaar feit begaan waarvoor in principe een strafbeschikking zal worden uitgevaardigd, waarin een geldboete ter hoogte van het op de voorzijde vermelde bedrag zal worden opgelegd. Het CJIB brengt u tevens administratiekosten in rekening. Op basis van door het College van procureurs-generaal opgestelde beleidsregels is het mogelijk dat, na beoordeling door het bevoegd gezag, in plaats van een strafbeschikking een andere afdoening volgt. Indien een strafbeschikking wordt uitgevaardigd, dan zal deze u spoedig door het CJIB worden toegezonden. In de strafbeschikking staan de relevante gegevens en hoe u handelt als u het niet eens bent. Het model van 2018 noemt daarbij nog een acceptgiro. Die bestaat niet meer. Betalen gaat via de manier die op de beschikking van het CJIB staat.",
      "Indien het afschrift in persoon is uitgereikt, of als de strafbeschikking bekend is geworden, dient binnen veertien dagen verzet te worden gedaan. Tegen een strafbeschikking waarin een geldboete van niet meer dan EUR 340 is opgelegd, wegens een overtreding welke ten hoogste vier maanden voor toezending is gepleegd, kan volgens dit model verzet worden gedaan tot uiterlijk zes weken na toezending. Controleer de huidige termijn in het Wetboek van Strafvordering en op de beschikking zelf.",
      "Directe betaling. Wordt u in de gelegenheid gesteld direct te betalen en doet u dat, dan doet u afstand van het recht op verzet. Dan staat geen rechtsmiddel meer tegen de strafbeschikking open.",
    ],
  },
  {
    kop: "Toelichting K | Kennisgeving van bekeuring",
    alinea: [
      "Naar aanleiding van het begane strafbare feit zal een proces-verbaal worden opgemaakt. Dit proces-verbaal wordt naar het bevoegd gezag gezonden. Het bevoegd gezag neemt een beslissing over de voortgang en bericht daarover.",
    ],
  },
  {
    kop: "Toelichting A | Aankondiging van beschikking",
    alinea: [
      "1. Uitgereikt bij staandehouding. U hebt een verkeersvoorschrift overtreden waarvoor een administratieve sanctie wordt opgelegd. Het CJIB brengt ook administratiekosten in rekening. Contante betaling van de sanctie en de administratiekosten is niet mogelijk. Betalen kan via de weg die het CJIB op de beschikking vermeldt. Op de beschikking staat wat u doet als u het niet eens bent.",
      "2. Achtergelaten op het voertuig. Met het op de voorzijde vermelde voertuig is een verkeersvoorschrift overtreden. De administratieve sanctie is opgelegd aan degene op wiens naam het kenteken op het vermelde tijdstip in het kentekenregister stond. Het CJIB stuurt de beschikking aan die persoon, met administratiekosten. Op die beschikking staat ook het rechtsmiddel.",
    ],
  },
  {
    kop: "Toelichting B | Beschikking",
    alinea: [
      "1. Betaling. Is het sanctiebedrag, verhoogd met de meegedeelde administratiekosten, nog niet voldaan, dan dient het totaalbedrag volgens dit model acht weken na de op de voorzijde vermelde datum te zijn voldaan. Daarna kan het sanctiebedrag worden verhoogd. De termijn op de beschikking van het CJIB gaat voor.",
      "2. Beroep bij de officier van justitie. Bent u het niet eens met de beschikking, dan kan beroep bij de officier van justitie. Dit model noemt om.nl/verkeer of een brief aan Parket CVOM, Afdeling Mulder, Postbus 50.000, 3500 MJ Utrecht, uiterlijk 6 weken na de datum van de gedraging. Vermeld naam, voornamen, geboortedatum, geboorteplaats, adres, postcode, plaats en IBAN, en stuur een kopie van de beschikking mee. Kijk op de beschikking welk kanaal nu geldt.",
    ],
  },
  {
    kop: "Toelichting O | Oproeping",
    alinea: [
      "U bent opgeroepen om op het tijdstip op de voorzijde te verschijnen ter terechtzitting van de rechtbank (sector kanton). De aanduiding van het feit kan voor het onderzoek ter zitting worden aangevuld of verbeterd. Die schriftelijke aanvulling kan tien dagen voor de zitting op de griffie worden ingezien en wordt ook per post gestuurd naar het opgegeven adres.",
      "Verschijnt u niet, dan kan de rechter u bij verstek veroordelen. Na veertien dagen na de dag van de uitspraak wordt die onherroepelijk en staat geen hoger beroep meer open. Laat u daarom vanaf de zittingsdag door de griffie op de hoogte stellen als u hoger beroep wilt kunnen instellen.",
    ],
  },
  {
    kop: "Toelichting T | Tonen",
    alinea: [
      "Dit formulier is uitgereikt ter herinnering dat u in verband met het strafbare feit of de gedraging, zoals op de voorzijde omschreven, bepaalde zaken dient te laten zien. U houdt zich aan de voorwaarden die de verbalisant heeft gesteld: plaats, dag en tijdstip van tonen. Doet u dat niet, dan kan alsnog een proces-verbaal worden opgemaakt of een beschikking worden opgelegd voor de gepleegde overtreding of gedraging.",
    ],
  },
];

function paginaToelichting(bon: Combibon): string[] {
  const pagina: Draw[] = [];
  let d = new Draw();
  let y = 30;
  const nieuw = () => {
    voet(d, bon, "Achterzijde");
    pagina.push(d);
    d = new Draw();
    kop(d, bon, "Blad B1 (achterzijde)");
    y = 30;
  };
  kop(d, bon, "Blad B1 (achterzijde)");
  const intro = wrap(
    "Tekst van de achterzijde van model B, versie 06/2018, in leesbare volgorde. Dit is niet een actuele instructie van het CJIB. Termijnen, adressen en betaalwijzen kunnen zijn gewijzigd. De acceptgiro is afgeschaft. De beschikking die het CJIB stuurt, en cjib.nl, gaan voor dit model.",
    IW,
    8,
  );
  intro.forEach((regel) => {
    d.text(M, y + 8, regel, 8);
    y += 10;
  });
  y += 6;
  for (const blok of TOELICHTING) {
    const kopRegels = wrap(blok.kop, IW, 10);
    const alineaRegels = blok.alinea.flatMap((alinea) => wrap(alinea, IW, 8));
    const nodig = kopRegels.length * 12 + alineaRegels.length * 10 + 8;
    if (y + nodig > 800) nieuw();
    kopRegels.forEach((regel) => {
      d.text(M, y + 10, regel, 10, true);
      y += 12;
    });
    alineaRegels.forEach((regel) => {
      if (y > 800) nieuw();
      d.text(M, y + 8, regel, 8);
      y += 10;
    });
    y += 8;
  }
  voet(d, bon, "Achterzijde");
  pagina.push(d);
  return pagina.map((blad) => blad.out());
}

function assemble(streams: string[]): string {
  const fontStart = 3 + streams.length * 2;
  const objects: string[] = [];
  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  const kids = streams.map((_, index) => `${3 + index} 0 R`).join(" ");
  objects.push(`<< /Type /Pages /Count ${streams.length} /Kids [${kids}] >>`);
  streams.forEach((_, index) => {
    const contentId = 3 + streams.length + index;
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PW} ${PH}] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${fontStart} 0 R /F2 ${fontStart + 1} 0 R >> >> >>`,
    );
  });
  streams.forEach((stream) => {
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  });
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");

  let body = "%PDF-1.4\n";
  const offsets: number[] = [0];
  objects.forEach((object, index) => {
    offsets.push(body.length);
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const startxref = body.length;
  const size = objects.length + 1;
  let xref = `xref\n0 ${size}\n0000000000 65535 f \n`;
  for (let index = 1; index < size; index += 1) xref += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  body += xref;
  body += `trailer\n<< /Size ${size} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF`;
  return body;
}

export function combibonPdf(bon: Combibon): string {
  const pagina = [paginaLinks(bon), paginaRechts(bon)];
  if (bon.model === "A1") pagina.push(paginaAchterA(bon));
  else pagina.push(...paginaToelichting(bon));
  return assemble(pagina);
}

export function downloadCombibonPdf(bon: Combibon) {
  const bestand = combibonPdf(bon);
  const blob = new Blob([bestand], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const stempel = `${bon.jaar || "datum"}-${bon.maand || "00"}-${bon.dag || "00"}`;
  link.href = url;
  link.download = `combibon-${bon.model}-${stempel}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
