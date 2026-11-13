import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Fragment, useMemo, useState } from "react";
import { Star, X } from "lucide-react";
import { ARTIKELEN } from "@/lib/boa/artikelen";
import { FEITEN, heeftEuro, tariefRegel, zoekFeiten, type Feit } from "@/lib/boa/feitcodes";
import { DOMEIN_INFO, afdoeningToon, domeinLabel, tagClass, toonClass, type DomeinId } from "@/lib/boa/meta";
import { usePrefs } from "@/lib/boa/prefs";
import { seo } from "@/lib/seo";
import { CopyButton, PageHead } from "@/components/bits";
import { FeedbackKnop } from "@/components/feedback";
import { useKluis } from "@/lib/kluis/provider";

type Search = { q?: string };

export const Route = createFileRoute("/feitcodes")({
  head: () =>
    seo(
      "/feitcodes",
      "Feitcodes 2026 & Boetebedragen BOA (Domein I t/m VI) | BOA Portaal",
      "Overzicht van veelgebruikte BOA-feitcodes en kernartikelen uit het Feitenboekje 2026 (excl. € 9 CJIB), inclusief leeftijdsgrenzen en kant-en-klare PV-aandachtspunten.",
    ),
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
  const [weergave, setWeergave] = useState<"tabel" | "kaarten">("tabel");
  const [open, setOpen] = useState<string | null>(null);
  const [groepFilter, setGroepFilter] = useState("alle");
  const gevonden = useMemo(() => {
    const basis = zoekFeiten(q, FEITEN);
    if (groepFilter === "alle") return basis;
    const woorden: Record<string, string[]> = {
      afval: ["afval", "zwerf", "hond", "milieu"],
      parkeren: ["parkeer", "stilstand", "bord", "kenteken", "rvv"],
      orde: ["apv", "orde", "samenschol", "alcohol", "wild"],
      ov: ["vervoer", "trein", "wp2000", "zwartrijd", "aanwijzing"],
      natuur: ["natuur", "vis", "vuurwerk", "dier"],
    };
    const keys = woorden[groepFilter] ?? [];
    return basis.filter((feit) => {
      const hay = `${feit.titel} ${feit.trefwoorden} ${feit.artikel}`.toLowerCase();
      return keys.some((woord) => hay.includes(woord));
    });
  }, [groepFilter, q]);
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
          <div className="sticky top-14 z-20 -mx-4 mb-3 border-b border-line bg-paper px-4 py-2">
            <label className="field max-w-xl">
              Zoeken
              <span className="relative block">
                <input
                  value={q}
                  onChange={(event) => {
                    const value = event.target.value;
                    void navigate({ search: value ? { q: value } : {}, replace: true });
                  }}
                  placeholder="D 517, wildplassen, artikel 70"
                  className="pr-10"
                />
                {q ? (
                  <button type="button" className="absolute top-1/2 right-2 -translate-y-1/2 text-muted" aria-label="Wis zoekopdracht" onClick={() => void navigate({ search: {}, replace: true })}>
                    <X className="size-4" />
                  </button>
                ) : null}
              </span>
            </label>
          </div>
          <div className="mb-3 flex flex-wrap gap-2">
            <button type="button" className={weergave === "tabel" ? "btn btn-brand" : "btn"} onClick={() => setWeergave("tabel")}>
              Compacte tabel
            </button>
            <button type="button" className={weergave === "kaarten" ? "btn btn-brand" : "btn"} onClick={() => setWeergave("kaarten")}>
              Uitgebreide kaarten
            </button>
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            {[
              ["alle", "Alle"],
              ["afval", "Afval en milieu"],
              ["parkeren", "Parkeren en stilstand"],
              ["orde", "Openbare orde / APV"],
              ["ov", "Openbaar vervoer"],
              ["natuur", "Natuur en buitengebied"],
            ].map(([id, label]) => (
              <button key={id} type="button" className={groepFilter === id ? "btn btn-brand" : "btn"} onClick={() => setGroepFilter(id)}>
                {label}
              </button>
            ))}
          </div>
          {(() => {
            const gezien = new Set<string>();
            return volgorde.map((groep) => {
              const eigen = gevonden.filter((feit) => feit.domeinen.includes(groep.id) && !gezien.has(feit.id));
              eigen.forEach((feit) => gezien.add(feit.id));
              if (!eigen.length) return null;
              return (
                <section key={groep.id} className="mb-6">
                  <h2 className="mb-2 text-lg font-semibold">{groep.label}</h2>
                  {weergave === "tabel" ? (
                    <>
                      <div className="hidden md:block">
                        <FeitTabel rows={eigen} open={open} setOpen={setOpen} student={rol === "student"} />
                      </div>
                      <ul className="grid gap-2 md:hidden">
                        {eigen.map((feit) => (
                          <li key={feit.id}>
                            <CompactKaart feit={feit} open={open === feit.id} onToggle={() => setOpen(open === feit.id ? null : feit.id)} student={rol === "student"} />
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <ul className="grid gap-3">
                      {eigen.map((feit) => (
                        <li key={feit.id}>
                          <FeitKaart feit={feit} student={rol === "student"} />
                        </li>
                      ))}
                    </ul>
                  )}
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
            <th>Artikel</th>
            <th>Tarief (2026)</th>
            <th>Afdoening</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((feit, index) => {
            const toon = afdoeningToon(feit.afdoening);
            const expanded = open === feit.id;
            const bedrag = heeftEuro(feit) ? (feit.tarief?.match(/€\s*\d[\d.]*/)?.[0] ?? "OM-feit") : "OM-feit";
            return (
              <Fragment key={feit.id}>
                <tr className={`cursor-pointer ${index % 2 === 1 && !expanded ? "bg-inset" : ""}`} onClick={() => setOpen(expanded ? null : feit.id)}>
                  <td className="code whitespace-nowrap">{feit.code}</td>
                  <td>
                    <p className="font-semibold">{feit.titel}</p>
                    {student ? <p className="mt-1 text-xs text-muted">{feit.kwalificatie}</p> : null}
                  </td>
                  <td className="max-w-[16rem] text-xs">{feit.artikel}</td>
                  <td className="whitespace-nowrap text-right text-base font-semibold">{bedrag}</td>
                  <td>
                    <span className={tagClass(toon)}>{feit.afdoeningLabel}</span>
                  </td>
                  <td className="text-sm font-semibold text-[#1D4ED8]">{expanded ? "Sluit" : "Open"}</td>
                </tr>
                {expanded ? (
                  <tr>
                    <td colSpan={6}>
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

function CompactKaart({ feit, open, onToggle, student }: { feit: Feit; open: boolean; onToggle: () => void; student: boolean }) {
  return (
    <article className="panel overflow-hidden">
      <button type="button" className="flex w-full items-start gap-3 p-3 text-left" onClick={onToggle}>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="code rounded-sm bg-inset px-1.5 py-0.5 text-sm">{feit.code}</span>
            <span className="text-xs text-muted">{feit.artikel}</span>
          </span>
          <span className="mt-1 block text-sm font-semibold leading-snug">{feit.titel}</span>
        </span>
        <span className="shrink-0 text-right text-base font-semibold">{heeftEuro(feit) ? tariefRegel(feit).split("·")[0]?.trim() : "OM-feit"}</span>
      </button>
      {open ? (
        <div className="border-t border-line px-3 pb-3">
          {student ? <p className="mt-2 text-sm font-semibold">Kwalificatie: {feit.kwalificatie}</p> : null}
          <Detail feit={feit} />
        </div>
      ) : null}
    </article>
  );
}

function FeitKaart({ feit, student }: { feit: Feit; student: boolean }) {
  const toon = afdoeningToon(feit.afdoening);
  return (
    <article className={`panel border-l-4 border-l-[#1D4ED8] p-3 ${toonClass(toon)}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="code">{feit.code}</p>
        <span className="text-right text-base font-semibold">{heeftEuro(feit) ? tariefRegel(feit).split("·")[0]?.trim() : feit.afdoeningLabel}</span>
      </div>
      <h3 className="mt-2 font-semibold">{feit.titel}</h3>
      <p className="code mt-1 text-xs">{feit.artikel}</p>
      {student ? <p className="mt-2 text-sm font-semibold">Kwalificatie: {feit.kwalificatie}</p> : null}
      <Detail feit={feit} />
    </article>
  );
}

function PvTekst({ tekst }: { tekst: string }) {
  const delen = tekst.split(/(\[[^[\]]+\])/g);
  return (
    <p>
      <span className="font-semibold">PV-aandachtspunt | </span>
      {delen.map((deel, index) =>
        deel.startsWith("[") && deel.endsWith("]") ? (
          <span key={`${deel}-${index}`} className="mx-0.5 inline-block rounded-sm bg-[#FEF3C7] px-1 font-mono text-xs font-semibold text-[#92400E]">
            {deel}
          </span>
        ) : (
          <span key={`${index}-${deel.slice(0, 12)}`}>{deel}</span>
        ),
      )}
    </p>
  );
}

function Detail({ feit }: { feit: Feit }) {
  const { isFavoriet, toggleFavoriet, saveNote } = useKluis();
  const navigate = useNavigate();
  const [melding, setMelding] = useState("");
  return (
    <div className="mt-3 grid gap-2 text-sm">
      <p className="bg-inset p-2">
        <span className="font-semibold">Tarief (2026) | </span>
        {tariefRegel(feit)}
      </p>
      <p>
        <span className="font-semibold">Domein: </span>
        {feit.domeinen.map((id: DomeinId) => domeinLabel(id)).join(" | ")}
      </p>
      <p>
        <span className="font-semibold">Leeftijd: </span>
        {feit.leeftijd}
      </p>
      <p>{feit.bijzonder}</p>
      <PvTekst tekst={feit.pv} />
      <div className="flex flex-wrap gap-2">
        <CopyButton text={feit.pv} label="Kopieer PV-tekst" />
        <button
          type="button"
          className="btn"
          onClick={() => {
            sessionStorage.setItem("boa-pv-feit", feit.id);
            void navigate({ to: "/pv", search: { code: feit.code } });
          }}
        >
          Gebruik in PV-bouwer
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            void saveNote({ titel: `${feit.code} | ${feit.titel}`, body: `${feit.artikel}\n${feit.pv}`, zachtAkkoord: true }).then((fout) => {
              setMelding(fout ?? "In de kluis.");
            });
          }}
        >
          Bewaar in kluis
        </button>
        <button type="button" className="btn" onClick={() => void toggleFavoriet(feit.id)}>
          <Star className={`size-4 ${isFavoriet(feit.id) ? "fill-amber text-amber" : ""}`} />
          {isFavoriet(feit.id) ? "Favoriet" : "Maak favoriet"}
        </button>
        <FeedbackKnop plek="/feitcodes" onderwerp={`${feit.code} | ${feit.titel}`} />
      </div>
      {melding ? <p>{melding}</p> : null}
    </div>
  );
}
