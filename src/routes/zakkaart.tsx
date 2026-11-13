import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { KAARTEN, type Kaart } from "@/lib/boa/zakkaart";
import { pastFilter } from "@/lib/boa/meta";
import { usePrefs } from "@/lib/boa/prefs";
import { CopyButton, PageHead } from "@/components/bits";
import { FeedbackKnop } from "@/components/feedback";
import { useKluis } from "@/lib/kluis/provider";

const TABS = [
  { id: "alle", label: "Alle" },
  { id: "cautie", label: "Cautie en verhoor" },
  { id: "id", label: "ID-vordering" },
  { id: "aanhouding", label: "Aanhouding (art. 53 Sv)" },
  { id: "sfeer", label: "Sfeerovergang" },
  { id: "jeugd", label: "Jeugd en HALT" },
] as const;

type TabId = (typeof TABS)[number]["id"];
type Search = { tab?: TabId };

function isTab(value: unknown): value is TabId {
  return typeof value === "string" && TABS.some((item) => item.id === value);
}

export const Route = createFileRoute("/zakkaart")({
  validateSearch: (search: Record<string, unknown>): Search => {
    if (isTab(search.tab) && search.tab !== "alle") return { tab: search.tab };
    return {};
  },
  component: ZakPage,
});

function tabVan(id: string): TabId {
  if (id === "cautie" || id === "staand" || id === "mulder") return "cautie";
  if (id === "id" || id === "ov-id" || id === "plicht") return "id";
  if (id === "aanhouding" || id === "fouille" || id === "boeien" || id === "overdracht" || id === "woning") return "aanhouding";
  if (id === "sfeer") return "sfeer";
  if (id === "leer" || id === "natuur") return "jeugd";
  return "alle";
}

function ZakPage() {
  const domein = usePrefs((state) => state.domein);
  const tabUitUrl = Route.useSearch().tab ?? "alle";
  const navigate = Route.useNavigate();
  const [tab, setTab] = useState<TabId>(tabUitUrl);
  useEffect(() => {
    setTab(tabUitUrl);
  }, [tabUitUrl]);
  const kaarten = KAARTEN.filter((kaart) => pastFilter(kaart.domeinen, domein)).filter((kaart) => tab === "alle" || tabVan(kaart.id) === tab);

  function kies(id: TabId) {
    setTab(id);
    void navigate({ search: id === "alle" ? {} : { tab: id }, replace: true });
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5">
      <PageHead kicker="ZAKKAART" title="Zakkaart" lede="Spreektekst, stappen en valkuil. Gemaakt voor het scherm op straat." />
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button key={item.id} type="button" className={tab === item.id ? "btn btn-brand" : "btn"} onClick={() => kies(item.id)}>
            {item.label}
          </button>
        ))}
      </div>
      <div className="grid gap-3">
        {kaarten.map((kaart) => (
          <KaartBlok key={kaart.id} kaart={kaart} />
        ))}
      </div>
    </div>
  );
}

function KaartBlok({ kaart }: { kaart: Kaart }) {
  const { saveNote } = useKluis();
  const [melding, setMelding] = useState("");
  return (
    <article id={kaart.id} className="panel p-3">
      <p className="font-mono text-xs text-muted">{kaart.artikel}</p>
      <h2 className="mt-1 text-lg font-semibold">{kaart.titel}</h2>
      <div className="mt-3 border border-line bg-inset p-3">
        <p className="text-xs font-semibold text-muted">Spreektekst</p>
        <p className="mt-2 text-base font-semibold leading-snug">{kaart.spreek}</p>
        <div className="mt-3">
          <CopyButton text={kaart.spreek} label="Kopieer spreektekst" />
        </div>
      </div>
      <ol className="mt-3 grid gap-1 text-sm">
        {kaart.regels.map((regel, index) => (
          <li key={regel} className="grid grid-cols-[1.5rem_1fr] gap-2 border-b border-line py-1.5 last:border-0">
            <span className="font-mono text-muted">{index + 1}</span>
            <span>{regel}</span>
          </li>
        ))}
      </ol>
      <p className="mt-3 border border-[#FDE68A] bg-[#FEF3C7] p-3 text-sm text-[#92400E]">{kaart.niet}</p>
      <p className="mt-3 text-sm text-muted">{kaart.pv}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <CopyButton text={kaart.pv} label="Kopieer PV-tekst" />
        <button
          type="button"
          className="btn"
          onClick={() => {
            void saveNote({ titel: `Zakkaart | ${kaart.titel}`, body: `${kaart.spreek}\n\n${kaart.pv}`, zachtAkkoord: true }).then((fout) => {
              setMelding(fout ?? "In de kluis.");
            });
          }}
        >
          Bewaar in kluis
        </button>
        <FeedbackKnop plek={`/zakkaart#${kaart.id}`} onderwerp={kaart.titel} />
      </div>
      {melding ? <p className="mt-2 text-sm">{melding}</p> : null}
    </article>
  );
}