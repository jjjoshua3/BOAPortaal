import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHead } from "@/components/bits";
import { JARGON } from "@/lib/boa/jargon";

export const Route = createFileRoute("/jargon")({
  component: JargonPage,
});

function JargonPage() {
  const [q, setQ] = useState("");
  const gevonden = useMemo(() => {
    const delen = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const lijst = delen.length
      ? JARGON.filter((woord) => {
          const hay = `${woord.term} ${woord.uitleg}`.toLowerCase();
          return delen.every((deel) => hay.includes(deel));
        })
      : JARGON;
    return [...lijst].sort((a, b) => a.term.localeCompare(b.term, "nl"));
  }, [q]);
  const letters = [...new Set(gevonden.map((woord) => woord.term[0]?.toLocaleUpperCase("nl") ?? "?"))];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-5">
      <PageHead
        kicker="NASLAG | VAKTAAL"
        title="Vakjargon"
        lede="Woorden die op straat, in de akte en in het Feitenboekje een vaste betekenis hebben. Geen synoniemenlijst. Een abri is een abri."
      />
      <label className="field mb-4">
        Zoek een woord
        <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Abri, cautie, combibon, UvB" />
      </label>
      {gevonden.length === 0 ? <p className="text-sm text-muted">Geen woord bij deze letters.</p> : null}
      {letters.map((letter) => (
        <section key={letter} className="mb-5">
          <h2 className="mb-2 font-semibold">{letter}</h2>
          <ul className="grid gap-2">
            {gevonden
              .filter((woord) => (woord.term[0]?.toLocaleUpperCase("nl") ?? "?") === letter)
              .map((woord) => (
                <li key={woord.term} className="panel p-3">
                  <h3 className="font-semibold">{woord.term}</h3>
                  <p className="mt-1 text-sm">{woord.uitleg}</p>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
