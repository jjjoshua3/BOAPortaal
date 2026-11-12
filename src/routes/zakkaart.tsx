import { createFileRoute } from "@tanstack/react-router";
import { KAARTEN } from "@/lib/boa/zakkaart";
import { pastFilter, toonClass } from "@/lib/boa/meta";
import { usePrefs } from "@/lib/boa/prefs";
import { CopyButton, PageHead } from "@/components/bits";
import { FeedbackKnop } from "@/components/feedback";

export const Route = createFileRoute("/zakkaart")({
  component: ZakPage,
});

function ZakPage() {
  const domein = usePrefs((state) => state.domein);
  const kaarten = KAARTEN.filter((kaart) => pastFilter(kaart.domeinen, domein));
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5">
      <PageHead
        kicker="MODULE 2 | ZAKKAART"
        title="Woordelijke formuleringen"
        lede="Gemaakt voor de telefoon op straat. Links de zin die je uitspreekt, daaronder de zin voor het PV. Zet nachtdienst aan in het voertuig."
      />
      <div className="grid gap-3">
        {kaarten.map((kaart) => (
          <article key={kaart.id} id={kaart.id} className={`panel p-3 ${toonClass("navy")}`}>
            <p className="code text-xs text-muted">{kaart.artikel}</p>
            <h2 className="mt-1 text-xl font-semibold">{kaart.titel}</h2>
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              <div className="bg-inset p-3">
                <p className="text-xs font-semibold tracking-wide text-muted">SPREEKTAAL</p>
                <p className="mt-2 text-lg font-semibold leading-snug">{kaart.spreek}</p>
                <div className="mt-3">
                  <CopyButton text={kaart.spreek} label="Kopieer spreektaal" />
                </div>
              </div>
              <div className="bg-inset p-3">
                <p className="text-xs font-semibold tracking-wide text-muted">PV-TEKST</p>
                <p className="mt-2 text-sm leading-relaxed">{kaart.pv}</p>
                <div className="mt-3">
                  <CopyButton text={kaart.pv} label="Kopieer PV-tekst" />
                </div>
              </div>
            </div>
            <ul className="mt-3 grid gap-2 text-sm">
              {kaart.regels.map((regel) => (
                <li key={regel} className="border-l border-line pl-3">
                  {regel}
                </li>
              ))}
            </ul>
            <p className="accent-stop panel mt-3 p-3 text-sm">{kaart.niet}</p>
            <div className="mt-3">
              <FeedbackKnop plek={`/zakkaart#${kaart.id}`} onderwerp={kaart.titel} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
