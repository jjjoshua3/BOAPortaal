import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead } from "@/components/bits";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () =>
    seo(
      "/privacy",
      "Privacy | BOA Portaal",
      "Welke gegevens BOA Portaal verwerkt, waarom, en wat je eraan kunt doen. Geen BSN en geen dossier van burgers.",
    ),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-5">
      <PageHead
        kicker="PRIVACY | AVG"
        title="Hoe dit portaal met gegevens omgaat"
        lede="BOA Portaal is een onafhankelijke naslag. Geen systeem van het Openbaar Ministerie, de politie, het CJIB of een gemeente. Hier staat welke persoonsgegevens er zijn, waarom, en wat je eraan kunt doen."
      />
      <div className="grid gap-3 text-sm">
        <section className="panel p-3">
          <h2 className="font-semibold">Verantwoordelijke en beginselen</h2>
          <p className="mt-2">
            De beheerder van BOA Portaal is verwerkingsverantwoordelijke voor het account, de kluis en het overlegbord. Artikel 5 van de Algemene verordening gegevensbescherming geldt: zo min mogelijk gegevens, voor een duidelijk doel, juist, niet langer dan nodig, en beveiligd. Er is geen reclameprofiel en geen geautomatiseerd besluit over jou.
          </p>
        </section>
        <section className="panel p-3">
          <h2 className="font-semibold">Zonder account</h2>
          <p className="mt-2">
            Feitcodes, zakkaartjes, beslisbomen, de PV-bouwer en de trainer sturen geen dossier naar een server. Domein, rol en dag- of nachtdienst blijven in deze browser. Een melding via de knop Klopt dit niet blijft zonder account ook alleen op dit apparaat. Er wordt dan niets naar de server gestuurd.
          </p>
        </section>
        <section className="panel p-3">
          <h2 className="font-semibold">Account | artikel 6 AVG</h2>
          <p className="mt-2">
            Een account vraagt een zakelijk, overheids-, vervoers- of schooladres. Gratis mailboxen worden geweigerd. Bewaard worden het e-mailadres, het wachtwoord in de vorm die de aanmelddienst daarvan maakt, en wat je zelf invult: naam, rol en standaarddomein. Grondslag: je maakt het account zelf aan om de werkbank en de kluis te gebruiken, artikel 6 lid 1 onder a en b AVG. Het wachtwoord staat niet in leesbare tekst.
          </p>
        </section>
        <section className="panel p-3">
          <h2 className="font-semibold">Kluis | versleuteling</h2>
          <p className="mt-2">
            Notities, PV-concepten, combibonnen en eigen tariefkaarten worden in de browser versleuteld met AES-GCM. De sleutel wordt met PBKDF2 afgeleid van het account. De opslag ontvangt cijfertekst. De databasefunctie wikkelt die cijfertekst nog een keer met pgcrypto. Zonder de sleutel is de tekst niet terug te lezen, ook niet door de beheerder.
          </p>
        </section>
        <section className="panel p-3">
          <h2 className="font-semibold">Overleg en correcties</h2>
          <p className="mt-2">
            Een bericht op het prikbord of een melding die je doorzet, wordt met AES-GCM versleuteld opgeslagen. Aangemelde collega's kunnen het lezen, omdat een overlegbord anders niet werkt. De database bewaart cijfertekst, geen leesbare kolom met de inhoud. Je ziet een weergavenaam en het domein van het e-mailadres, niet een apart adresboek.
          </p>
        </section>
        <section className="panel accent-stop p-3">
          <h2 className="font-semibold">Bijzondere gegevens | artikel 9 AVG</h2>
          <p className="mt-2">
            Geen BSN. Geen gezondheidsgegevens. Geen namen, adressen of telefoonnummers van burgers. Geen zaaknummers uit een bronsysteem. De PV-bouwer, de combibon en het overlegbord blokkeren BSN, telefoon, e-mail en IBAN voordat een tekst wordt bewaard. Dit portaal is geen procesdossier.
          </p>
        </section>
        <section className="panel p-3">
          <h2 className="font-semibold">Kenteken en vermiste personen</h2>
          <p className="mt-2">
            Een kentekenopvraag leest de open data van de RDW. Daar staat geen naam van de houder. Het portaal bewaart die opvraag niet, tenzij je zelf een combibon in de kluis zet. De lijst vermiste personen komt live van de politie, alleen als de vermissing niet langer dan drie weken duurt en er een foto op politie.nl staat. Die lijst wordt niet in onze database opgeslagen.
          </p>
        </section>
        <section className="panel p-3">
          <h2 className="font-semibold">Bewaartermijn, verwerkers, doorgifte</h2>
          <ul className="mt-2 grid gap-2">
            <li>Account, kluis en overleg: tot je ze wist, of tot je het account verwijdert.</li>
            <li>Verwerkers: de aanmelddienst voor het account, en de database waarin de cijfertekst staat. Zij zien het e-mailadres en de cijfertekst, niet de inhoud van de kluis.</li>
            <li>Geen verkoop van gegevens. Geen advertentiecookies. Een sessiecookie houdt je aangemeld.</li>
            <li>De open naslag gebruikt geen volgprofiel.</li>
          </ul>
        </section>
        <section className="panel p-3">
          <h2 className="font-semibold">Jouw rechten</h2>
          <p className="mt-2">
            Je kunt inzage vragen, een verbetering, wissing, beperking, en je gegevens meenemen. Op de accountpagina exporteer je de kluis, wijzig je het wachtwoord en verwijder je het account. Typ VERWIJDER om de lokale kluis te wissen en het account te sluiten. Een klacht kan bij de Autoriteit Persoonsgegevens.
          </p>
          <p className="mt-2">
            <Link to="/account" className="underline">
              Naar het account
            </Link>
            <span aria-hidden="true"> | </span>
            <a className="underline" href="https://www.autoriteitpersoonsgegevens.nl" target="_blank" rel="noreferrer">
              Autoriteit Persoonsgegevens
            </a>
          </p>
        </section>
        <p className="text-xs text-muted">
          Ontworpen door{" "}
          <a className="underline" href="https://jjjoshua3.netlify.app/" target="_blank" rel="noreferrer">
            Joshua
          </a>
          . Dit portaal vervangt geen privacyverklaring van je werkgever of opleiding. Deel met politie, jongerenwerk of zorg alleen wat een wet of een convenant toestaat. De werkbank heeft daar een aparte kaart voor.
        </p>
      </div>
    </div>
  );
}
