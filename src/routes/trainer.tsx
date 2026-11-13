import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FEITEN, boeteKop } from "@/lib/boa/feitcodes";
import { ABCD, BEGINSELEN, CASUSSEN, LSD, MATRIX, STAPPEN, filterVragen } from "@/lib/boa/trainer";
import { pastFilter } from "@/lib/boa/meta";
import { usePrefs } from "@/lib/boa/prefs";
import { seo } from "@/lib/seo";
import { CopyButton, PageHead } from "@/components/bits";
import { FeedbackKnop } from "@/components/feedback";
import { WEEKSETS, weeksetOp } from "@/lib/boa/weken";

export const Route = createFileRoute("/trainer")({
  head: () =>
    seo(
      "/trainer",
      "BOA & HTV Oefentrainer: Rechtskennis, Feitcodes & Casussen | BOA Portaal",
      "Oefen gratis voor het BOA-basisexamen, HTV of hercertificering (PHB) met praktijkcasussen, rechtskennis en feitcodes per domein.",
    ),
  component: TrainerPage,
});

const CIJFERS = ["onvoldoende", "matig", "voldoende", "goed"];
type Modus = "kennis" | "flits" | "straat";

const CASUS_KEUZE: Record<string, { label: string; goed: boolean; waarom: string }[]> = {
  c1: [
    {
      label: "Eerst alleen de waarneming noemen",
      goed: true,
      waarom: "Het afvalfeit kan nog in het toezicht of de APV. De vraag naar het waarom is al een verhoor.",
    },
    {
      label: "Meteen vragen waarom het blikje op de grond ligt",
      goed: false,
      waarom: "Dat is een verhoorvraag. Zonder cautie is de verklaring kwetsbaar (art. 29 lid 2 Sv).",
    },
    {
      label: "Aanhouden voordat er iets is gezegd",
      goed: false,
      waarom: "Er is nog geen misdrijf in heterdaad. Aanhouding vraagt een feit dat de akte toestaat.",
    },
  ],
  c2: [
    {
      label: "Het afvalfeit houden, geen D 517",
      goed: true,
      waarom: "De toonplicht begint bij 14 jaar. Op 13 jaar levert het ontbreken van een pas geen artikel 447e Sr op.",
    },
    {
      label: "Aanhouden omdat er geen ID is",
      goed: false,
      waarom: "Geen draagplicht, en onder 14 geen D 517. Identiteit vaststellen kan zonder die route.",
    },
    {
      label: "Halt aanbieden aan een 11-jarige",
      goed: false,
      waarom: "Halt begint bij 12. Onder 12 jaar is er geen strafvervolging (art. 486 Sv).",
    },
  ],
  c3: [
    {
      label: "Eerst uitstel van betaling aanbieden",
      goed: true,
      waarom: "Artikel 70 Wp2000 begint in de praktijk bij het UvB van de vervoerder. Artikel 73 is een ander feit.",
    },
    {
      label: "Meteen artikel 73 verbaliseren",
      goed: false,
      waarom: "Artikel 73 is het niet opvolgen van een aanwijzing, niet het ontbreken van een vervoerbewijs.",
    },
    {
      label: "D 517 zonder leeftijd en waarschuwing",
      goed: false,
      waarom: "Artikel 447e Sr vraagt een duidelijke vordering, een waarschuwing, en een persoon van 14 jaar of ouder.",
    },
  ],
  c4: [
    {
      label: "Doel noemen en zeggen dat binnenlaten niet verplicht is",
      goed: true,
      waarom: "Zonder machtiging alleen vrije, specifieke toestemming. Die mag worden ingetrokken.",
    },
    {
      label: "Blijven staan omdat de uitkering anders stopt",
      goed: false,
      waarom: "De uitkering is geen drukmiddel om in de woning te blijven. Intrekken betekent: naar buiten.",
    },
    {
      label: "De slaapkamer in lopen op de eerste 'kom maar'",
      goed: false,
      waarom: "Toestemming is specifiek. Een kier en een algemene zin dekken niet elke ruimte.",
    },
  ],
  c5: [
    {
      label: "Eerst de vrijstelling of het besluit van de school nakijken",
      goed: true,
      waarom: "Luxe verzuim staat of valt met het ontbreken van vrijstelling. Geen PV voordat dat vaststaat.",
    },
    {
      label: "Direct een PV omdat de ouder zijn stem verheft",
      goed: false,
      waarom: "Volume is geen feit. Zolang je alleen een document vraagt, is er ook geen cautie nodig.",
    },
    {
      label: "De leerling zelf als enige normadressaat behandelen",
      goed: false,
      waarom: "Bij luxe verzuim is de ouder of verzorger in de regel de normadressaat, niet de leerling alleen.",
    },
  ],
};

function TrainerPage() {
  const rol = usePrefs((state) => state.rol);
  const domein = usePrefs((state) => state.domein);
  const [modus, setModus] = useState<Modus>("kennis");
  const vragen = useMemo(() => filterVragen(rol, domein, "rechtskennis").slice(0, 10), [rol, domein]);
  const week = useMemo(() => weeksetOp(new Date()), []);
  const kaarten = useMemo(() => FEITEN.filter((feit) => pastFilter(feit.domeinen, domein)).slice(0, 12), [domein]);
  const casussen = CASUSSEN.filter((casus) => pastFilter(casus.domeinen, domein));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5">
      <PageHead
        kicker="TRAINER"
        title="Kennis en casus"
        lede="Tien vragen, flitskaarten of een straatsituatie. Een score hier is geen examenresultaat. De wettekst blijft het antwoord."
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ["kennis", "Rechtskennis"],
            ["flits", "Feitcodes"],
            ["straat", "Straatcasus"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" className={modus === id ? "btn btn-brand" : "btn"} onClick={() => setModus(id)}>
            {label}
          </button>
        ))}
      </div>
      {modus === "kennis" ? (
        <section>
          <p className="mb-3 text-sm text-muted">
            Tien vragen voor dit domein. Week {week.week} van {week.jaar} hoort bij set {week.set} van {WEEKSETS.length}. Bron onder het antwoord.
          </p>
          <Quiz key={vragen.map((item) => item.id).join("-")} vragen={vragen} />
          {rol === "docent" ? (
            <div className="mt-6">
              <h2 className="mb-2 text-lg font-semibold">Beoordelingsmatrix</h2>
              <Matrix />
            </div>
          ) : null}
        </section>
      ) : null}
      {modus === "flits" ? <Flits kaarten={kaarten} /> : null}
      {modus === "straat" ? (
        <section className="grid gap-3">
          {casussen.map((casus) => (
            <StraatCasus key={casus.id} casus={casus} docent={rol === "docent"} />
          ))}
          <div className="grid gap-3 lg:grid-cols-3">
            <Kader titel="ABCD" items={ABCD.map((item) => `${item.letter}. ${item.titel}. ${item.tekst}`)} />
            <Kader titel="Vijf stappen" items={STAPPEN.map((item) => `${item.n}. ${item.titel}. ${item.tekst}`)} />
            <Kader titel="LSD" items={LSD.map((item) => `${item.titel}. ${item.tekst}`)} />
          </div>
          <ul className="grid gap-2 md:grid-cols-2">
            {BEGINSELEN.map((item) => (
              <li key={item.titel} className="panel p-3">
                <h3 className="font-semibold">{item.titel}</h3>
                <p className="mt-1 text-sm text-muted">{item.tekst}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function Flits({ kaarten }: { kaarten: typeof FEITEN }) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const kaart = kaarten[index];
  if (!kaart) return <p className="text-sm text-muted">Geen feitcodes in dit domein.</p>;
  return (
    <section className="panel p-4">
      <p className="font-mono text-xs text-muted">
        KAART {index + 1} / {kaarten.length}
      </p>
      <h2 className="mt-2 text-lg font-semibold">{open ? kaart.code : kaart.titel}</h2>
      {open ? (
        <div className="mt-3 grid gap-1 text-sm">
          <p className="font-mono">{kaart.artikel}</p>
          <p className="font-mono font-semibold">{boeteKop(kaart)}</p>
          <p className="text-muted">excl. € 9 administratiekosten CJIB, tenzij er geen vast bedrag is.</p>
          <p>{kaart.bijzonder}</p>
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted">Welke code, en welk bedrag?</p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="btn btn-brand" onClick={() => setOpen((huidig) => !huidig)}>
          {open ? "Situatie" : "Code en tarief"}
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setIndex((huidig) => (huidig + 1) % kaarten.length);
            setOpen(false);
          }}
        >
          Volgende
        </button>
      </div>
    </section>
  );
}

function StraatCasus({ casus, docent }: { casus: (typeof CASUSSEN)[number]; docent: boolean }) {
  const [gekozen, setGekozen] = useState<number | null>(null);
  const opties = CASUS_KEUZE[casus.id] ?? [];
  return (
    <article className="panel p-3">
      <h2 className="font-semibold">{casus.titel}</h2>
      <p className="mt-1 text-sm text-muted">{casus.doel}</p>
      <p className="mt-2 text-sm">{casus.setting}</p>
      <div className="mt-3 grid gap-2">
        {opties.map((optie, index) => {
          const toon = gekozen === null ? "" : optie.goed ? "btn-ok" : index === gekozen ? "btn-stop" : "";
          return (
            <button key={optie.label} type="button" className={`btn justify-start text-left ${toon}`} disabled={gekozen !== null} onClick={() => setGekozen(index)}>
              {optie.label}
            </button>
          );
        })}
      </div>
      {gekozen !== null && opties[gekozen] ? (
        <p className={`mt-3 p-3 text-sm ${opties[gekozen].goed ? "border border-[#A7F3D0] bg-[#D1FAE5]" : "border border-[#FDE68A] bg-[#FEF3C7]"}`}>
          {opties[gekozen].waarom}
        </p>
      ) : null}
      <ul className="mt-3 list-disc pl-5 text-sm text-muted">
        {casus.debrief.map((regel) => (
          <li key={regel}>{regel}</li>
        ))}
      </ul>
      {docent ? <p className="mt-3 border border-line bg-inset p-3 text-sm">{casus.docent}</p> : null}
    </article>
  );
}

function Kader({ titel, items }: { titel: string; items: string[] }) {
  return (
    <article className="panel p-3">
      <h3 className="font-semibold">{titel}</h3>
      <ul className="mt-2 grid gap-2 text-sm">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

function Quiz({ vragen }: { vragen: ReturnType<typeof filterVragen> }) {
  const [index, setIndex] = useState(0);
  const [gekozen, setGekozen] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [klaar, setKlaar] = useState(false);
  const vraag = vragen[index];

  if (!vragen.length) return <p className="text-sm text-muted">Geen vragen in deze combinatie van rol en domein.</p>;
  if (klaar || !vraag) {
    return (
      <section className="panel p-4">
        <h2 className="text-lg font-semibold">Resultaat</h2>
        <p className="mt-2 text-sm">
          {score} van {vragen.length} in één keer goed. Loop de toelichting na bij wat je miste. Dit telt niet mee voor het ExTH.
        </p>
        <button
          type="button"
          className="btn btn-brand mt-3"
          onClick={() => {
            setIndex(0);
            setGekozen(null);
            setScore(0);
            setKlaar(false);
          }}
        >
          Opnieuw
        </button>
      </section>
    );
  }

  return (
    <section className="panel p-4">
      <p className="font-mono text-xs text-muted">
        VRAAG {index + 1} / {vragen.length} | {vraag.soort === "gbt" ? "GBT" : "RECHTSKENNIS"}
      </p>
      <h2 className="mt-2 text-lg font-semibold">{vraag.vraag}</h2>
      <div className="mt-3 grid gap-2">
        {vraag.opties.map((optie, optieIndex) => {
          const toon = gekozen === null ? "" : optieIndex === vraag.juist ? "btn-ok" : optieIndex === gekozen ? "btn-stop" : "";
          return (
            <button
              key={optie}
              type="button"
              className={`btn justify-start text-left ${toon}`}
              disabled={gekozen !== null}
              onClick={() => {
                setGekozen(optieIndex);
                if (optieIndex === vraag.juist) setScore((huidig) => huidig + 1);
              }}
            >
              {optie}
            </button>
          );
        })}
      </div>
      {gekozen !== null ? <p className="mt-3 text-sm">{vraag.toelichting}</p> : null}
      {gekozen !== null && vraag.bron ? (
        <a className="mt-2 inline-block text-sm underline" href={vraag.bron} target="_blank" rel="noreferrer">
          Bron
        </a>
      ) : null}
      {gekozen !== null ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <FeedbackKnop plek="/trainer" onderwerp={vraag.vraag.slice(0, 80)} />
          <button
          type="button"
          className="btn btn-brand mt-3"
          onClick={() => {
            if (index + 1 >= vragen.length) setKlaar(true);
            else {
              setIndex((huidig) => huidig + 1);
              setGekozen(null);
            }
          }}
        >
          {index + 1 >= vragen.length ? "Resultaat" : "Volgende"}
        </button>
        </div>
      ) : null}
    </section>
  );
}

function Matrix() {
  const [scores, setScores] = useState<number[]>(() => MATRIX.map(() => 3));
  const [toelichting, setToelichting] = useState("");
  const [naam, setNaam] = useState("deelnemer");
  const gemiddelde = scores.reduce((sum, cijfer) => sum + cijfer, 0) / scores.length;
  const tekst = [
    "Terugkoppeling praktijkbeoordeling",
    `Deelnemer: ${naam || "[DEELNEMER]"}`,
    "",
    ...MATRIX.map((criterium, index) => `${criterium}: ${CIJFERS[(scores[index] ?? 1) - 1]} (${scores[index]}/4)`),
    "",
    `Gemiddelde: ${gemiddelde.toFixed(1)} van 4`,
    "",
    "Toelichting:",
    toelichting.trim() || "[NOG INVULLEN]",
    "",
    "Dit is een opleidingsinstrument, geen personeelsbesluit en geen examenuitslag.",
  ].join("\n");

  return (
    <section className="panel mb-6 p-4">
      <h2 className="text-lg font-semibold">Beoordelingsmatrix</h2>
      <p className="mt-1 text-sm text-muted">1 onvoldoende, 2 matig, 3 voldoende, 4 goed. Geen namen van burgers.</p>
      <label className="field mt-3 max-w-sm">
        Deelnemer of groep
        <input value={naam} onChange={(event) => setNaam(event.target.value)} />
      </label>
      <div className="mt-3 grid gap-3">
        {MATRIX.map((criterium, index) => (
          <label key={criterium} className="grid gap-1 text-sm font-semibold sm:grid-cols-[1fr_8rem] sm:items-center">
            {criterium}
            <select
              className="mast-select"
              value={scores[index]}
              onChange={(event) => {
                const waarde = Number(event.target.value);
                setScores((huidig) => huidig.map((cijfer, cijferIndex) => (cijferIndex === index ? waarde : cijfer)));
              }}
            >
              {[1, 2, 3, 4].map((cijfer) => (
                <option key={cijfer} value={cijfer}>
                  {cijfer} {CIJFERS[cijfer - 1]}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <label className="field mt-3">
        Toelichting
        <textarea value={toelichting} onChange={(event) => setToelichting(event.target.value)} />
      </label>
      <pre className="mt-3 whitespace-pre-wrap bg-inset p-3 text-sm">{tekst}</pre>
      <CopyButton text={tekst} label="Kopieer terugkoppeling" />
    </section>
  );
}
