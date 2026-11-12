import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/bits";

const BRONNEN = [
  ["Wetboek van Strafrecht", "https://wetten.overheid.nl/BWBR0001903"],
  ["Wetboek van Strafvordering", "https://wetten.overheid.nl/BWBR0001854"],
  ["Algemene wet bestuursrecht", "https://wetten.overheid.nl/BWBR0005537"],
  ["Wet op de identificatieplicht", "https://wetten.overheid.nl/BWBR0006297"],
  ["Ambtsinstructie", "https://wetten.overheid.nl/BWBR0006589"],
  ["Leerplichtwet 1969", "https://wetten.overheid.nl/BWBR0002628"],
  ["Wet personenvervoer 2000", "https://wetten.overheid.nl/BWBR0011470"],
  ["Participatiewet", "https://wetten.overheid.nl/BWBR0015703"],
  ["Wegenverkeerswet 1994", "https://wetten.overheid.nl/BWBR0006622"],
  ["RVV 1990", "https://wetten.overheid.nl/BWBR0004825"],
  ["Visserijwet 1963", "https://wetten.overheid.nl/BWBR0002416"],
  ["Alcoholwet", "https://wetten.overheid.nl/BWBR0002458"],
  ["Omgevingswet", "https://wetten.overheid.nl/BWBR0037885"],
  ["Open data RDW", "https://opendata.rdw.nl/"],
  ["Vermiste personen | politie", "https://www.politie.nl/vermist"],
  ["NS | uitstel van betaling", "https://www.ns.nl/service-en-contact/betalen/uitstel-van-betaling"],
  ["AVG | verordeningstekst", "https://eur-lex.europa.eu/legal-content/NL/TXT/?uri=CELEX:32016R0679"],
];

export const Route = createFileRoute("/colofon")({
  component: ColofonPage,
});

function ColofonPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-5">
      <PageHead
        kicker="COLOFON"
        title="Wat dit portaal wel en niet is"
        lede="BOA Portaal is een onafhankelijke naslag voor de praktijk en de opleiding. Het is geen systeem van het Openbaar Ministerie, de politie, het CJIB, een gemeente of een vervoerder."
      />
      <div className="grid gap-3 text-sm">
        <p className="panel p-3">
          Een boa handelt alleen binnen de akte van opsporing en de toegewezen domeinen. De feitcodes en bedragen in dit portaal zijn die van het Feitenboekje van 1 januari 2026, exclusief € 9 administratiekosten van het CJIB. Artikelnummers van de Alcoholwet zijn de geldende nummers op wetten.overheid.nl. Een lokale verordening noem je met het artikel van díe gemeente. De akte en de wettekst gaan voor op een vuistregel.
        </p>
        <p className="panel p-3">
          Persoonlijke notities, combibonnen en tariefkaarten worden in de browser versleuteld met AES-GCM. De database bewaart die cijfertekst en wikkelt de kluis nog een keer. Overlegberichten staan eveneens als cijfertekst, leesbaar voor aangemelde collega's. Er horen geen BSN-nummers of namen van burgers in.
        </p>
        <section>
          <h2 className="text-lg font-semibold">Bronnen</h2>
          <ul className="mt-2 grid gap-1">
            {BRONNEN.map(([label, href]) => (
              <li key={href}>
                <a className="underline" href={href} target="_blank" rel="noreferrer">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
