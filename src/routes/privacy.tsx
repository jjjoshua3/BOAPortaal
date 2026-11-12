import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead } from "@/components/bits";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-5">
      <PageHead
        kicker="PRIVACY | AVG"
        title="Hoe dit portaal met gegevens omgaat"
        lede="BOA Portaal is een onafhankelijke naslag. Het is geen systeem van het Openbaar Ministerie, de politie, het CJIB of een gemeente. Hier staat wat er wel en niet wordt bewaard."
      />
      <div className="grid gap-3 text-sm">
        <section className="panel p-3">
          <h2 className="font-semibold">Wat je zonder account gebruikt</h2>
          <p className="mt-2">
            Feitcodes, zakkaartjes, beslisbomen, de PV-bouwer en de trainer zijn te lezen zonder aanmelden. Die pagina's sturen geen dossier naar een server. Voorkeuren voor domein, rol en dag- of nachtdienst blijven in de browser, onder de sleutel van dit apparaat.
          </p>
        </section>
        <section className="panel p-3">
          <h2 className="font-semibold">Account</h2>
          <p className="mt-2">
            Een account vraagt een zakelijk, overheids-, vervoers- of schooladres. Gratis mailboxen worden geweigerd. Bewaard worden het e-mailadres, het wachtwoord in de vorm die de aanmelddienst daarvan maakt, en wat je zelf invult: naam, rol en standaarddomein. Het wachtwoord wordt niet in leesbare tekst opgeslagen.
          </p>
        </section>
        <section className="panel p-3">
          <h2 className="font-semibold">Kluis</h2>
          <p className="mt-2">
            Notities en eigen PV-sjablonen worden in de browser versleuteld met AES-GCM. De sleutel wordt met PBKDF2 afgeleid van het account. De opslag ontvangt cijfertekst. Als de databasefuncties zijn geïnstalleerd, wikkelt pgcrypto die cijfertekst nog een keer. Zonder de sleutel is de tekst niet terug te lezen.
          </p>
        </section>
        <section className="panel accent-stop p-3">
          <h2 className="font-semibold">Wat hier niet in hoort</h2>
          <p className="mt-2">
            Geen BSN. Geen namen, adressen of telefoonnummers van burgers. Geen zaaknummers uit een bronsysteem. De PV-bouwer blokkeert dat soort gegevens voordat een tekst in de kluis kan. Dit portaal is oefen- en naslagruimte, geen procesdossier.
          </p>
        </section>
        <section className="panel p-3">
          <h2 className="font-semibold">Waarom, hoe lang, en met wie</h2>
          <ul className="mt-2 grid gap-2">
            <li>Doel: de naslag persoonlijk maken en je eigen aantekeningen bewaren. Grondslag: het account dat je zelf aanmaakt.</li>
            <li>Bewaartermijn: tot je het account verwijdert, of tot je een notitie zelf wist. Lokale voorkeuren blijven staan tot je ze in de browser wist.</li>
            <li>Delen: geen verkoop en geen reclameprofiel. De aanmelddienst en de databaseverwerker zien het account en de cijfertekst, niet de inhoud van de kluis.</li>
            <li>Cookies: een sessiecookie om ingelogd te blijven. Geen volgcookies van advertenties.</li>
          </ul>
        </section>
        <section className="panel p-3">
          <h2 className="font-semibold">Jouw rechten</h2>
          <p className="mt-2">
            Op de accountpagina exporteer je de kluis ontsleuteld naar een bestand op je eigen apparaat, wijzig je het wachtwoord en verwijder je het account. Typ VERWIJDER om de lokale kluis te wissen en het account te sluiten. Lukt de serverfunctie nog niet, dan is de kluis op dit apparaat wel gewist en ben je uitgelogd. Het colofon bevat de SQL die de beheerder eenmalig moet uitvoeren.
          </p>
          <p className="mt-2">
            <Link to="/account" className="underline">
              Naar het account
            </Link>
            <span aria-hidden="true"> | </span>
            <Link to="/colofon" className="underline">
              Colofon en database
            </Link>
          </p>
        </section>
        <p className="text-xs text-muted">
          Ontworpen door{" "}
          <a className="underline" href="https://jjjoshua3.netlify.app/" target="_blank" rel="noreferrer">
            Joshua
          </a>
          . Dit portaal vervangt geen privacyverklaring van je werkgever of opleiding.
        </p>
      </div>
    </div>
  );
}
