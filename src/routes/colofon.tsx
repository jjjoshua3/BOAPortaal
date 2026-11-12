import { createFileRoute } from "@tanstack/react-router";
import { CopyButton, PageHead } from "@/components/bits";
import { SCHEMA_SQL } from "@/lib/supabase/schema-sql";

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
          Persoonlijke notities worden in de browser versleuteld met AES-GCM. De sleutel wordt met PBKDF2 afgeleid van het account. Supabase ontvangt alleen cijfertekst. Als de databasefuncties zijn geïnstalleerd, wikkelt pgcrypto die cijfertekst nog een keer. Er horen geen BSN-nummers of namen van burgers in de kluis.
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
        <section>
          <h2 className="text-lg font-semibold">Database, eenmalig door de beheerder</h2>
          <p className="mt-2 text-muted">
            Voer dit script uit in de SQL-editor van het Supabase-project. Daarna werken de kluis, de dubbele versleuteling, het verwijderen van het eigen account en de blokkade op gratis e-maildomeinen ook aan de serverkant. Zonder dit script blijft de kluis versleuteld op het apparaat en blokkeert de site gratis domeinen alsnog zelf.
          </p>
          <div className="mt-2">
            <CopyButton text={SCHEMA_SQL} label="Kopieer SQL" />
          </div>
          <pre className="panel mt-2 max-h-[28rem] overflow-auto p-3 text-xs">{SCHEMA_SQL}</pre>
        </section>
      </div>
    </div>
  );
}
