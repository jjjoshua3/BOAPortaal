import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { ARTIKELEN } from "@/lib/boa/artikelen";
import { FEITEN, boeteKop, zoekFeiten, type Feit } from "@/lib/boa/feitcodes";
import { DOMEIN_INFO, afdoeningToon, domeinLabel, tagClass, toonClass, type DomeinId } from "@/lib/boa/meta";
import { usePrefs } from "@/lib/boa/prefs";
import { CopyButton, PageHead } from "@/components/bits";
import { FeedbackKnop } from "@/components/feedback";
import { useKluis } from "@/lib/kluis/provider";

type Search = { q?: string };

export const Route = createFileRoute("/feitcodes")({
  validateSearch: (search: Record<string, unknown>): Search => {
    if (typeof search.q === "string" && search.q.length > 0) return { q: search.q };
    return {};
  },
  component: FeitPage,
});

function FeitPage() {
  const q = Route.useSearch().q ?? "";
  const navigate = Route.useNavigate();
  const domein = usePrefs((state) => state.domein);
  const rol = usePrefs((state) => state.rol);
  const [tab, setTab] = useState<"feiten" | "artikelen">("feiten");
  const [open, setOpen] = useState<string | null>(null);
  const gevonden = useMemo(() => zoekFeiten(q, FEITEN), [q]);
  const groepen = DOMEIN_INFO.filter((info) => {
    if (domein === "alle") return true;
    return info.id === domein || info.id === "algemeen";
  });
  const volgorde = domein === "alle" ? groepen : [...groepen].sort((a, b) => (a.id === domein ? -1 : b.id === domein ? 1 : 0));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5">
      <PageHead
        kicker="MODULE 1 | FEITCODE EN WET"
        title="Feitcodes en kernartikelen"
        lede="Zoek op trefwoord, code of artikel. Het boetebedrag is het tarief uit de boetebase en het Feitenboekje van 1 januari 2026, exclusief € 9 administratiekosten van het CJIB. De akte van deze gemeente of vervoerder gaat voor."
      />
      <div className="mb-3 flex flex-wrap gap-2">
        <button type="button" className={tab === "feiten" ? "btn btn-brand" : "btn"} onClick={() => setTab("feiten")}>
          Feitcodes
        </button>
        <button type="button" className={tab === "artikelen" ? "btn btn-brand" : "btn"} onClick={() => setTab("artikelen")}>
          Kernartikelen
        </button>
      </div>
      {tab === "artikelen" ? (
        <ul className="grid gap-3">
          {ARTIKELEN.filter((artikel) => {
            const hay = `${artikel.code} ${artikel.titel} ${artikel.kern} ${artikel.straat}`.toLowerCase();
            return q.trim().toLowerCase().split(/\s+/).filter(Boolean).every((deel) => hay.includes(deel));
          }).map((artikel) => (
            <li key={artikel.id} className="panel accent-navy p-3">
              <p className="code text-sm">{artikel.code}</p>
              <h2 className="mt-1 font-semibold">{artikel.titel}</h2>
              <p className="mt-2 text-sm">{artikel.kern}</p>
              <p className="mt-2 text-sm text-muted">{artikel.straat}</p>
              {artikel.href ? (
                <a className="mt-2 inline-block text-sm font-semibold underline" href={artikel.href} target="_blank" rel="noreferrer">
                  {artikel.bron}
                </a>
              ) : (
                <p className="mt-2 text-sm text-muted">{artikel.bron}</p>
              )}
              <FeedbackKnop plek="/feitcodes" onderwerp={artikel.titel} />
            </li>
          ))}
        </ul>
      ) : (
        <>
          <label className="field mb-4 max-w-xl">
            Zoeken
            <input
              value={q}
              onChange={(event) => {
                const value = event.target.value;
                void navigate({ search: value ? { q: value } : {}, replace: true });
              }}
              placeholder="D 517, wildplassen, artikel 70"
            />
          </label>
          {(() => {
            const gezien = new Set<string>();
            return volgorde.map((groep) => {
              const eigen = gevonden.filter((feit) => feit.domeinen.includes(groep.id) && !gezien.has(feit.id));
              eigen.forEach((feit) => gezien.add(feit.id));
              if (!eigen.length) return null;
              return (
                <section key={groep.id} className="mb-6">
                  <h2 className="mb-2 text-lg font-semibold">{groep.label}</h2>
                  <div className="hidden lg:block">
                    <FeitTabel rows={eigen} open={open} setOpen={setOpen} student={rol === "student"} />
                  </div>
                  <ul className="grid gap-3 lg:hidden">
                    {eigen.map((feit) => (
                      <li key={feit.id}>
                        <FeitKaart feit={feit} student={rol === "student"} />
                      </li>
                    ))}
                  </ul>
                </section>
              );
            });
          })()}
          {gevonden.length === 0 ? <p className="text-sm text-muted">Geen feit bij deze woorden en dit domein.</p> : null}
        </>
      )}
    </div>
  );
}

function FeitTabel({
  rows,
  open,
  setOpen,
  student,
}: {
  rows: Feit[];
  open: string | null;
  setOpen: (id: string | null) => void;
  student: boolean;
}) {
  return (
    <div className="panel overflow-x-auto">
      <table className="grid-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Omschrijving</th>
            <th>Het boetebedrag wordt</th>
            <th>Afdoening</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((feit) => {
            const toon = afdoeningToon(feit.afdoening);
            const expanded = open === feit.id;
            return (
              <Fragment key={feit.id}>
                <tr>
                  <td className="code whitespace-nowrap">{feit.code}</td>
                  <td>
                    <p className="font-semibold">{feit.titel}</p>
                    <p className="code mt-1 text-xs">{feit.artikel}</p>
                    {student ? <p className="mt-1 text-xs text-muted">{feit.kwalificatie}</p> : null}
                  </td>
                  <td className="whitespace-nowrap font-semibold">{boeteKop(feit)}</td>
                  <td>
                    <span className={tagClass(toon)}>{feit.afdoeningLabel}</span>
                  </td>
                  <td>
                    <button type="button" className="btn" onClick={() => setOpen(expanded ? null : feit.id)}>
                      {expanded ? "Sluit" : "Open"}
                    </button>
                  </td>
                </tr>
                {expanded ? (
                  <tr>
                    <td colSpan={5}>
                      <Detail feit={feit} />
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function FeitKaart({ feit, student }: { feit: Feit; student: boolean }) {
  const toon = afdoeningToon(feit.afdoening);
  return (
    <article className={`panel p-3 ${toonClass(toon)}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="code">{feit.code}</p>
        <span className={tagClass(toon)}>{feit.afdoeningLabel}</span>
      </div>
      <h3 className="mt-2 font-semibold">{feit.titel}</h3>
      <p className="mt-2 text-sm font-semibold">Het boetebedrag wordt | {boeteKop(feit)}</p>
      <p className="code mt-1 text-xs">{feit.artikel}</p>
      {student ? <p className="mt-2 text-sm font-semibold">Kwalificatie: {feit.kwalificatie}</p> : null}
      <Detail feit={feit} />
    </article>
  );
}

function Detail({ feit }: { feit: Feit }) {
  const { isFavoriet, toggleFavoriet } = useKluis();
  return (
    <div className="mt-3 grid gap-2 text-sm">
      <p className="bg-inset p-2">
        <span className="font-semibold">Omschrijving | </span>
        {feit.titel}
      </p>
      <p className="bg-inset p-2">
        <span className="font-semibold">Het boetebedrag wordt | </span>
        {boeteKop(feit)}
      </p>
      {feit.tarief && feit.tarief !== boeteKop(feit) ? <p className="text-xs text-muted">{feit.tarief}</p> : null}
      <p>
        <span className="font-semibold">Domein: </span>
        {feit.domeinen.map((id: DomeinId) => domeinLabel(id)).join(" | ")}
      </p>
      <p>
        <span className="font-semibold">Leeftijd: </span>
        {feit.leeftijd}
      </p>
      <p>{feit.bijzonder}</p>
      <p className="whitespace-pre-wrap bg-inset p-2">{feit.pv}</p>
      <div className="flex flex-wrap gap-2">
        <CopyButton text={feit.pv} label="Kopieer PV-formulering" />
        <button type="button" className="btn" onClick={() => void toggleFavoriet(feit.id)}>
          <Star className={`size-4 ${isFavoriet(feit.id) ? "fill-amber text-amber" : ""}`} />
          {isFavoriet(feit.id) ? "Favoriet" : "Maak favoriet"}
        </button>
        <FeedbackKnop plek="/feitcodes" onderwerp={`${feit.code} | ${feit.titel}`} />
      </div>
    </div>
  );
}
