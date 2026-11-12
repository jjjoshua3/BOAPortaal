import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BOMEN, nodeById, type Tree } from "@/lib/boa/trees";
import { pastFilter, tagClass, toonClass } from "@/lib/boa/meta";
import { usePrefs } from "@/lib/boa/prefs";
import { CopyButton, PageHead } from "@/components/bits";
import { FeedbackKnop } from "@/components/feedback";

type Search = { boom?: string };

export const Route = createFileRoute("/beslisbomen")({
  validateSearch: (search: Record<string, unknown>): Search => {
    if (typeof search.boom === "string" && search.boom.length > 0) return { boom: search.boom };
    return {};
  },
  component: BoomPage,
});

function BoomPage() {
  const boom = Route.useSearch().boom ?? "";
  const navigate = Route.useNavigate();
  const domein = usePrefs((state) => state.domein);
  const bomen = BOMEN.filter((tree) => pastFilter(tree.domeinen, domein));
  const actief = bomen.find((tree) => tree.id === boom) ?? bomen[0];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5">
      <PageHead
        kicker="MODULE 3 | BESLISBOMEN"
        title="Stap voor stap"
        lede="Kies ja, nee of de situatie die klopt. De uitkomst is een werkwijze, geen beschikking. Bij twijfel over de akte bel je de politie of je operationeel expert."
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {bomen.map((tree) => (
          <button
            key={tree.id}
            type="button"
            className={actief?.id === tree.id ? "btn btn-brand" : "btn"}
            onClick={() => {
              void navigate({ search: { boom: tree.id }, replace: true });
            }}
          >
            {tree.titel}
          </button>
        ))}
      </div>
      {actief ? <Runner key={actief.id} tree={actief} /> : <p className="text-sm text-muted">Geen boom in dit domein.</p>}
    </div>
  );
}

function Runner({ tree }: { tree: Tree }) {
  const [pad, setPad] = useState<string[]>([tree.start]);
  const node = nodeById(tree, pad[pad.length - 1] ?? tree.start);
  const spoor = useMemo(() => pad.map((id) => nodeById(tree, id)?.titel ?? id), [pad, tree]);

  useEffect(() => {
    setPad([tree.start]);
  }, [tree.start]);

  if (!node) return null;

  return (
    <div className="grid gap-3">
      <p className="text-sm text-muted">{tree.inleiding}</p>
      <p className="font-mono text-xs text-muted">{spoor.join(" | ")}</p>
      {node.soort === "vraag" ? (
        <section className="panel p-4">
          <p className="text-xs font-semibold tracking-wide text-muted">STAP {pad.length}</p>
          <h2 className="mt-1 text-xl font-semibold">{node.titel}</h2>
          <p className="mt-3 text-lg leading-snug">{node.tekst}</p>
          {node.toelichting ? <p className="mt-2 text-sm text-muted">{node.toelichting}</p> : null}
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {node.keuzes.map((keuze) => (
              <button
                key={keuze.label}
                type="button"
                className="btn min-h-14 justify-start text-left"
                onClick={() => setPad((huidig) => [...huidig, keuze.naar])}
              >
                {keuze.label}
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className={`panel p-4 ${toonClass(node.toon)}`}>
          <span className={tagClass(node.toon)}>Uitkomst</span>
          <h2 className="mt-2 text-xl font-semibold">{node.titel}</h2>
          <p className="mt-3 text-sm leading-relaxed">{node.tekst}</p>
          {node.pv ? <p className="mt-3 whitespace-pre-wrap bg-inset p-3 text-sm">{node.pv}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {node.pv ? <CopyButton text={node.pv} label="Kopieer PV-zin" /> : null}
            <FeedbackKnop plek={`/beslisbomen?boom=${tree.id}`} onderwerp={node.titel} />
            <button type="button" className="btn" onClick={() => setPad([tree.start])}>
              Opnieuw
            </button>
          </div>
        </section>
      )}
      {pad.length > 1 && node.soort === "vraag" ? (
        <button type="button" className="btn w-fit" onClick={() => setPad((huidig) => huidig.slice(0, -1))}>
          Stap terug
        </button>
      ) : null}
    </div>
  );
}
