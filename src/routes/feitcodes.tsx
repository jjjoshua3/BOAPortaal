import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Fragment, useMemo, useState } from "react";
import { Star, X } from "lucide-react";
import { ARTIKELEN } from "@/lib/boa/artikelen";
import { FEITEN, boekjeToelichting, heeftEuro, moetInRelaas, tariefRegel, zoekFeiten, type Feit } from "@/lib/boa/feitcodes";
import { bedragRegels, regelVanCode, zoekBoekje, type BoekjeRegel } from "@/lib/boa/boekje-zoek";
import { DOMEIN_INFO, afdoeningToon, domeinLabel, tagClass, toonClass, type DomeinId } from "@/lib/boa/meta";
import { usePrefs } from "@/lib/boa/prefs";
import { seo } from "@/lib/seo";
import { CopyButton, PageHead } from "@/components/bits";
import { FeedbackKnop } from "@/components/feedback";
import { useLiveTick } from "@/lib/boa/live-poort";

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
  const tick = useLiveTick();
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
  }, [groepFilter, q, tick]);
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
        lede="Zonder zoekwoord zie je de korte lijst. Typ een woord of code en je zoekt het hele Feitenboekje van januari 2026. Het tarief is exclusief € 9 administratiekosten van het CJIB. De akte gaat voor."
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
                  placeholder="Negeren, stopteken, D 517, wildplassen"
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
          {q.trim() ? (
            <BoekjeResultaten query={q} />
          ) : (
            <>
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
        </>
      )}
    </div>
  );
}

function BoekjeResultaten({ query }: { query: string }) {
  const tick = useLiveTick();
  const eigen = useMemo(() => zoekFeiten(query, FEITEN), [query, tick]);
  const treffers = useMemo(() => zoekBoekje(query), [query]);
  const gezien = new Set(eigen.map((feit) => feit.code.replace(/\s+/g, "").toLowerCase()));
  const rest = treffers.filter((regel) => !gezien.has(regel.code.replace(/\s+/g, "").toLowerCase()));
  const totaal = eigen.length + rest.length;
  return (
    <div>
      <p className="mb-3 text-sm text-muted">
        {totaal === 0
          ? "Niets gevonden in het Feitenboekje."
          : `${totaal} treffers. Maak het zoekveld leeg om terug te gaan naar de korte lijst.`}
      </p>
      <ul className="grid gap-2">
        {eigen.map((feit) => {
          const regel = regelVanCode(feit.code);
          return (
            <li key={feit.id} className="panel p-3">
              <div className="flex items-start gap-3">
                <span className="code shrink-0 rounded-sm bg-inset px-1.5 py-0.5 text-sm leading-none">{feit.code}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-snug">{feit.titel}</p>
                  {regel?.toelichting ? <p className="mt-1 text-sm leading-relaxed">{regel.toelichting}</p> : <p className="mt-1 text-sm leading-relaxed">{boekjeToelichting(feit)}</p>}
                  {regel ? <Bedrag regel={regel} /> : null}
                </div>
              </div>
            </li>
          );
        })}
        {rest.map((regel, index) => (
          <li key={`${regel.code}-${index}`} className="panel p-3">
            <div className="flex items-start gap-3">
              <span className="code shrink-0 rounded-sm bg-inset px-1.5 py-0.5 text-sm leading-none">{regel.code}</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-snug">{regel.titel}</p>
                {regel.toelichting ? <p className="mt-1 text-sm leading-relaxed">{regel.toelichting}</p> : null}
                <Bedrag regel={regel} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Bedrag({ regel }: { regel: BoekjeRegel }) {
  const regels = bedragRegels(regel.code, regel.bedrag);
  if (!regels.length) {
    return <p className="mt-1 text-sm text-muted">Geen vast bedrag in het Feitenboekje en niet in de Boetebase. Januari 2026.</p>;
  }
  if (!regels[0].wie) {
    return <p className="mt-1 text-sm text-muted">{regels[0].bedrag}. Exclusief € 9 administratiekosten. Feitenboekje en Boetebase, januari 2026.</p>;
  }
  return (
    <div className="mt-2">
      <p className="text-sm text-muted">Feitenboekje en Boetebase, januari 2026. Exclusief € 9 administratiekosten.</p>
      <ul className="mt-1 grid gap-1">
        {regels.map((rij) => (
          <li key={rij.wie} className="flex items-baseline justify-between gap-3 text-sm">
            <span>
              <span className="font-semibold">{rij.wie}</span>
              {rij.uitleg.toLowerCase() !== rij.wie.toLowerCase() ? <span className="text-muted">. {rij.uitleg}</span> : null}
            </span>
            <span className="shrink-0 font-semibold">{rij.bedrag}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function boetebaseHref(code: string): string | null {
  const schoon = code.trim();
  if (!/^[A-Za-z]{1,3}\s+\d{3}/.test(schoon)) return null;
  return `https://boetebase.om.nl/?Linked=${schoon.replace(/\s+/g, "+")}`;
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
            <span className="code shrink-0 rounded-sm bg-inset px-1.5 py-0.5 text-sm leading-none">{feit.code}</span>
            <span className="min-w-0 text-xs text-muted leading-snug">{feit.artikel}</span>
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
        <span className="code shrink-0 rounded-sm bg-inset px-1.5 py-0.5 text-sm leading-none">{feit.code}</span>
        <span className="shrink-0 text-right text-base font-semibold">{heeftEuro(feit) ? tariefRegel(feit).split("·")[0]?.trim() : feit.afdoeningLabel}</span>
      </div>
      <h3 className="mt-2 font-semibold leading-snug">{feit.titel}</h3>
      <p className="mt-1 text-xs text-muted leading-snug">{feit.artikel}</p>
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
  const regel = regelVanCode(feit.code);
  return (
    <div className="mt-3 grid gap-2 text-sm">
      <p className="bg-inset p-2">
        <span className="font-semibold">Tarief (2026) | </span>
        {tariefRegel(feit)}
      </p>
      {boetebaseHref(feit.code) ? (
        <p>
          {heeftEuro(feit)
            ? "De Boetebase van het OM toont dit vaste bedrag voor een lichtere overtreding, exclusief € 9 administratiekosten. De gegevens komen uit de Tekstenbundel. In bijzondere gevallen geldt een ander bedrag of een andere straf."
            : "OM-feit. De Boetebase publiceert vaste bedragen voor de meest voorkomende lichtere overtredingen, vanaf 1 januari 2026, exclusief € 9 administratiekosten. Voor een feit met een sterretje staat daar geen vast bedrag. De officier beslist. In bijzondere gevallen gelden andere bedragen of straffen."}{" "}
          <a className="font-semibold underline" href={boetebaseHref(feit.code) ?? undefined} target="_blank" rel="noreferrer">
            Zoek {feit.code} in de Boetebase
          </a>
        </p>
      ) : null}
      <p>
        <span className="font-semibold">Domein: </span>
        {feit.domeinen.map((id: DomeinId) => domeinLabel(id)).join(" | ")}
      </p>
      <p>
        <span className="font-semibold">Leeftijd: </span>
        {feit.leeftijd}
      </p>
      <p>{feit.bijzonder}</p>
      <div className="border border-[#FDE68A] bg-[#FEF3C7] p-2 text-[#1c1917]">
        <p className="font-semibold">Toelichting Feitenboekje OM, januari 2026</p>
        {regel?.toelichting ? <p className="mt-1">{regel.toelichting}</p> : <p className="mt-1">{boekjeToelichting(feit)}</p>}
        {regel ? <Bedrag regel={regel} /> : null}
        <p className="mt-2 text-[#78350f]">Letterlijk uit het Feitenboekje van het Openbaar Ministerie, uitgave januari 2026. Een latere uitgave gaat voor.</p>
      </div>
      <div className="border border-line bg-paper p-2">
        <p className="font-semibold">Wat in het relaas moet staan</p>
        <ul className="mt-2 list-disc pl-5">
          {moetInRelaas(feit).map((regel) => (
            <li key={regel}>{regel}</li>
          ))}
        </ul>
      </div>
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
