import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ABCD, BEGINSELEN, CASUSSEN, LSD, MATRIX, STAPPEN, filterVragen } from "@/lib/boa/trainer";
import { pastFilter } from "@/lib/boa/meta";
import { usePrefs } from "@/lib/boa/prefs";
import { CopyButton, PageHead } from "@/components/bits";

export const Route = createFileRoute("/trainer")({
  component: TrainerPage,
});

const CIJFERS = ["onvoldoende", "matig", "voldoende", "goed"];

function TrainerPage() {
  const rol = usePrefs((state) => state.rol);
  const domein = usePrefs((state) => state.domein);
  const vragen = useMemo(() => filterVragen(rol, domein, "alle"), [rol, domein]);
  const casussen = CASUSSEN.filter((casus) => pastFilter(casus.domeinen, domein));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5">
      <PageHead
        kicker="MODULE 4 | EXTH EN GBT"
        title={rol === "docent" ? "Casussen en beoordeling" : rol === "student" ? "Rechtskennis en gesprek" : "Toets en oefencasus"}
        lede="Oefenmateriaal bij de ExTH-eisen en gespreks- en benaderingstechnieken. Een score hier is geen examenresultaat."
      />
      {rol === "docent" ? <Matrix /> : null}
      <Quiz vragen={vragen} />
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Gesprek</h2>
        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          <Kader titel="ABCD-gedragsmodel" items={ABCD.map((item) => `${item.letter} | ${item.titel}. ${item.tekst}`)} />
          <Kader titel="Vijf stappen bij slecht nieuws" items={STAPPEN.map((item) => `${item.n}. ${item.titel}. ${item.tekst}`)} />
          <Kader titel="LSD" items={LSD.map((item) => `${item.titel}. ${item.tekst}`)} />
        </div>
      </section>
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Vaste lijnen uit de praktijk</h2>
        <ul className="mt-3 grid gap-3 md:grid-cols-2">
          {BEGINSELEN.map((item) => (
            <li key={item.titel} className="panel p-3">
              <h3 className="font-semibold">{item.titel}</h3>
              <p className="mt-1 text-sm text-muted">{item.tekst}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Rollenspel</h2>
        <div className="mt-3 grid gap-3">
          {casussen.map((casus) => (
            <details key={casus.id} className="panel p-3" open={rol === "docent"}>
              <summary className="cursor-pointer font-semibold">{casus.titel}</summary>
              <p className="mt-2 text-sm">Doel: {casus.doel}</p>
              <p className="mt-2 text-sm">Setting: {casus.setting}</p>
              <p className="mt-2 text-sm">Rol boa of student: {casus.boa}</p>
              <p className="mt-2 text-sm">Rol burger: {casus.burger}</p>
              <ul className="mt-2 list-disc pl-5 text-sm">
                {casus.debrief.map((regel) => (
                  <li key={regel}>{regel}</li>
                ))}
              </ul>
              {rol === "docent" ? <p className="accent-navy panel mt-3 p-3 text-sm">{casus.docent}</p> : null}
            </details>
          ))}
        </div>
      </section>
      {rol !== "docent" ? (
        <details className="panel mt-6 p-3">
          <summary className="cursor-pointer font-semibold">Beoordelingsmatrix</summary>
          <div className="mt-3">
            <Matrix />
          </div>
        </details>
      ) : null}
    </div>
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
      {gekozen !== null ? (
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
