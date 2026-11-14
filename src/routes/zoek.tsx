import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageHead } from "@/components/bits";
import { zoekSite, type ZoekHit } from "@/lib/boa/site-zoek";
import { seo } from "@/lib/seo";

type Search = { q?: string };

export const Route = createFileRoute("/zoek")({
  head: () => seo("/zoek", "Zoeken | BOA Portaal", "Zoek door feitcodes, vakjargon, beslisbomen, zakkaart en trainer."),
  validateSearch: (search: Record<string, unknown>): Search => {
    if (typeof search.q === "string" && search.q.length > 0) return { q: search.q };
    return {};
  },
  component: ZoekPagina,
});

const LABEL: Record<ZoekHit["soort"], string> = {
  feit: "Feitcode",
  jargon: "Vakjargon",
  beslisboom: "Beslisboom",
  zakkaart: "Zakkaart",
  trainer: "Trainer",
  artikel: "Wetsartikel",
  pagina: "Pagina",
};

function ZoekPagina() {
  const q = Route.useSearch().q ?? "";
  const hits = useMemo(() => zoekSite(q), [q]);
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <PageHead kicker="Zoeken" title="Door de hele site" lede="Feitcodes, vakjargon, beslisbomen, zakkaart, trainer en de pagina's." />
      {q ? (
        <p className="mb-3 text-sm text-muted">
          {hits.length === 0 ? `Niets gevonden voor “${q}”.` : `${hits.length} treffers voor “${q}”.`}
        </p>
      ) : (
        <p className="mb-3 text-sm text-muted">Typ een woord in de zoekbalk bovenaan.</p>
      )}
      <ul className="grid gap-2">
        {hits.map((hit, index) => (
          <li key={`${hit.soort}-${hit.titel}-${index}`} className="panel p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{LABEL[hit.soort]}</p>
            <Link to={hit.naar} search={hit.search} className="mt-1 block font-semibold underline">
              {hit.titel}
            </Link>
            <p className="mt-1 text-sm text-muted">{hit.tekst}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
