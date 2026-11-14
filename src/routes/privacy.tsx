import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead } from "@/components/bits";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () =>
    seo(
      "/privacy",
      "Privacy | BOA Portaal",
      "Wat BOA Portaal bewaart, wie een account mag inzien, hoe de medewerkersmail werkt en wat buiten beeld blijft.",
    ),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-5">
      <PageHead
        kicker="PRIVACY | OPEN"
        title="Wat we bewaren, en wat niet"
        lede="Dit is een onafhankelijke naslag. Geen systeem van het Openbaar Ministerie, de politie, het CJIB of een gemeente. Hier staat in gewone taal wat er van een account, een ticket en de medewerkersmail wordt bewaard."
      />
      <div className="grid gap-3 text-sm">
        <section className="panel p-3">
          <h2 className="font-semibold">Eerlijk vooraf</h2>
          <p className="mt-2">
            We bewaren zo min mogelijk. Er is geen reclameprofiel en geen automatische beslissing over jou. De aanmelddienst en de database zijn verwerkers: zij zien het zakelijke adres en de cijfertekst van de kluis, niet de inhoud. De medewerkersmail staat op een aparte mailserver (Purelymail). Medewerkers loggen daar niet zelf in. Zij gebruiken alleen mail.boaportaal.nl.
          </p>
          <p className="mt-2">
            De beheerder van BOA Portaal is verwerkingsverantwoordelijke voor het account, de kluis, het overlegbord, de servicedesk, het auditlog en de medewerkersmail. Grondslag voor een account dat je zelf aanmaakt: artikel 6 lid 1 onder a en b AVG.
          </p>
        </section>

        <section className="panel p-3">
          <h2 className="font-semibold">Zonder account</h2>
          <p className="mt-2">
            Feitcodes, zakkaartjes, beslisbomen, de PV-bouwer en de trainer sturen geen dossier naar een server. Domein, rol en dag- of nachtdienst blijven in deze browser. Een melding via Feedback blijft zonder account ook op dit apparaat.
          </p>
        </section>

        <section className="panel p-3">
          <h2 className="font-semibold">Wat een account is</h2>
          <p className="mt-2">
            Een account vraagt een zakelijk, overheids-, vervoers- of schooladres. Gratis mailboxen worden geweigerd. Het adres en het wachtwoord staan alleen in de aanmelddienst. Het wachtwoord is niet leesbaar. In het portaal zelf zie je geen e-mailadres en geen voornaam.
          </p>
          <p className="mt-2">
            In plaats daarvan krijgt het account een Client-ID, bijvoorbeeld BP-3200-YE, en een PV-naam in de vorm ACHTERNAAM, V. Die twee zijn wat collega's en het beheer zien. Support en de hoofdbeheerder kunnen in systeem.boaportaal.nl ook een account voor boaportaal.nl aanmaken. Een medewerkersaccount, met recht op de servicedesk en de mail, maakt alleen de hoofdbeheerder aan.
          </p>
        </section>

        <section className="panel p-3">
          <h2 className="font-semibold">Inloggen en de tweede stap</h2>
          <p className="mt-2">
            Er zijn twee codes in dezelfde authenticator-app, op hetzelfde account. Boaportaal.nl en de servicedesk als indiener vragen de code BOA Portaal. Systeem, de servicedesk als behandelaar en mail vragen een andere code: BOA Beheer. Die drie delen die ene code. De code vervangt het wachtwoord niet. Tot de tweede stap in de aanmelddienst aanstaat, log je in met alleen het wachtwoord. Dat staat dan ook zo op het scherm.
          </p>
          <p className="mt-2">
            Op boaportaal.nl kun je aanvinken: onthoud mij 30 dagen. Dan blijf je op dit apparaat aangemeld. Na die 30 dagen zetten we de sessie uit en vragen we opnieuw wie je bent. Zonder dat vinkje blijft de sessie hooguit 12 uur staan. Afmelden kan altijd zelf.
          </p>
          <p className="mt-2">Een geslaagde en een mislukte aanmelding komt in het auditlog: moment, site en Client-ID als die bekend is.</p>
        </section>

        <section className="panel p-3">
          <h2 className="font-semibold">Inzage door beheer</h2>
          <p className="mt-2">
            Support en de hoofdbeheerder kunnen een account opzoeken op Client-ID, ticketnummer of zakelijk adres. Dat mag alleen met een reden van minstens twaalf tekens. Elke opvraag wordt een regel in het auditlog: wie, wanneer, welk dossier, en waarom. Zoeken op adres schrijft een zwaardere regel (BREAK_GLASS). Het adres komt niet terug in het dossier.
          </p>
          <p className="mt-2">
            In het dossier staat de Client-ID, de PV-naam, de organisatie en of het account vergrendeld is. De inhoud van de kluis niet. De beheerder ziet alleen tellers: hoeveel notities, concepten en favorieten er versleuteld staan, en wanneer de kluis voor het laatst synchroniseerde.
          </p>
        </section>

        <section className="panel p-3">
          <h2 className="font-semibold">Wachtwoord en adres</h2>
          <p className="mt-2">
            Je wijzigt het wachtwoord van boaportaal.nl zelf op de accountpagina. Een medewerker kan een herstel-link laten sturen naar het zakelijke adres, zonder dat adres te zien. Alleen de hoofdbeheerder kan het wachtwoord direct zetten of het zakelijke adres wijzigen. Het nieuwe wachtwoord en het nieuwe adres komen niet in het auditlog. Wel staat daar dat de wijziging is gedaan, door wie, en met welke reden.
          </p>
          <p className="mt-2">
            Het wachtwoord van een medewerkerspostbus is hetzelfde als dat van systeem.boaportaal.nl. Een medewerker wijzigt dat wachtwoord niet zelf. Dat doet alleen de hoofdbeheerder, in systeem.boaportaal.nl. Ook die wijziging wordt gelogd, zonder het wachtwoord zelf.
          </p>
        </section>

        <section className="panel p-3">
          <h2 className="font-semibold">Medewerkersmail</h2>
          <p className="mt-2">
            Medewerkers lezen en versturen post op mail.boaportaal.nl. Niet op de site van de mailserver. Je logt in met je loginnaam, zonder @boaportaal.nl erachter. Dat is je Client-ID, of een vaste naam zoals joshua.bosma of account. Voorbeeld van zo'n korte naam: info.
          </p>
          <p className="mt-2">
            Elke medewerker heeft een eigen postbus. Het adres is de Client-ID, bijvoorbeeld bp-3200-ye@boaportaal.nl. Privépost op die postbus ziet alleen jij. Collega's vinden je standaard op die Client-ID. Je kunt zelf aanzetten dat ze je ook op voor- en achternaam vinden. Het adres dat ze dan zien, blijft de Client-ID. Typ je in het veld Aan een stukje van een naam, zoals claudia of beh, dan verschijnt het adres vanzelf.
          </p>
          <p className="mt-2">
            support@boaportaal.nl en info@boaportaal.nl zijn gemeenschappelijk. Iedere medewerker kan die post lezen. Een antwoord dat je daarop stuurt, is ook zichtbaar voor de andere medewerkers, omdat het vanaf je eigen adres gaat en een kopie in de gemeenschappelijke bus terugkomt. Je claimt een bericht voordat je antwoordt, zodat niet iedereen tegelijk terugmailt. Claimen kan, en de claim weer loslaten ook. Alleen privépost blijft privé.
          </p>
          <p className="mt-2">
            account@boaportaal.nl stuurt automatische post, zoals een wachtwoordherstel. Die bus is zichtbaar voor joshua.bosma@boaportaal.nl en voor de hoofdbeheerder. beheerder@boaportaal.nl is een eigen postbus.
          </p>
          <p className="mt-2">
            Inloggen, verzenden, claimen en een claim loslaten komt in het auditlog van systeem.boaportaal.nl, onder de bron mail.boaportaal.nl. De tekst van een privébericht komt daar niet in. Wel dát er iets is verstuurd of geclaimd, en door welke loginnaam.
          </p>
        </section>

        <section className="panel p-3">
          <h2 className="font-semibold">Kluis</h2>
          <p className="mt-2">
            Notities, PV-concepten, combibonnen en eigen kaarten worden in de browser versleuteld met AES-256-GCM. De sleutel komt van je account. De database krijgt cijfertekst. Zonder die sleutel is de tekst niet te lezen, ook niet door de beheerder. Die ziet alleen de tellers hierboven.
          </p>
        </section>

        <section className="panel p-3">
          <h2 className="font-semibold">Overleg en servicedesk</h2>
          <p className="mt-2">
            Een bericht op het prikbord wordt versleuteld bewaard. Aangemelde collega's kunnen het lezen, anders werkt het bord niet. Onder het bericht staat de PV-naam en de Client-ID, niet het e-mailadres.
          </p>
          <p className="mt-2">
            Een ticket op de servicedesk bevat Client-ID, PV-naam, categorie, onderwerp en je omschrijving. Geen e-mailadres in het scherm van de behandelaar. Een ticket is een vraag over het portaal, geen proces-verbaal en geen dossier van een burger.
          </p>
        </section>

        <section className="panel accent-stop p-3">
          <h2 className="font-semibold">Geen dossier van burgers</h2>
          <p className="mt-2">
            Geen BSN. Geen gezondheidsgegevens. Geen namen, adressen of telefoonnummers van burgers. Geen zaaknummers uit een bronsysteem. De PV-bouwer, de combibon en het overlegbord blokkeren BSN, telefoon, e-mail en IBAN voordat een tekst wordt bewaard.
          </p>
        </section>

        <section className="panel p-3">
          <h2 className="font-semibold">Kenteken, vermiste personen en status</h2>
          <p className="mt-2">
            Een kentekenopvraag leest de open data van de RDW. Daar staat geen naam van de houder. Het portaal bewaart die opvraag niet, tenzij je zelf een combibon in de kluis zet. De lijst vermiste personen komt live van de politie en wordt niet in onze database opgeslagen.
          </p>
          <p className="mt-2">
            Op status.boaportaal.nl is te zien of het portaal, de servicedesk, het beheersysteem, de mail en de aanmelddienst bereikbaar zijn, en of er onderhoud is. Die pagina haalt de controle zelf op. Er staat geen accountinformatie op.
          </p>
        </section>

        <section className="panel p-3">
          <h2 className="font-semibold">Hoe lang het blijft staan</h2>
          <ul className="mt-2 grid gap-2">
            <li>Account en kluis: tot je het account verwijdert, of tot de hoofdbeheerder het op jouw verzoek sluit.</li>
            <li>Inlogpogingen: 30 dagen. Een mislukte poging zonder account: 7 dagen.</li>
            <li>Audit, gewone inzage en mailhandelingen: 90 dagen. Zware opvraag: 180 dagen. Kritieke auth-wijziging: 365 dagen.</li>
            <li>Gesloten tickets: 90 dagen, daarna weg, inclusief het logboek van dat ticket.</li>
            <li>Open tickets blijven staan tot ze zijn afgehandeld.</li>
            <li>Post in de medewerkersmail blijft op de mailserver staan tot je die zelf wist. Het auditlog bewaart die brieven niet.</li>
          </ul>
          <p className="mt-2">Geen verkoop van gegevens. Geen advertentiecookies. Een sessiecookie houdt je aangemeld.</p>
        </section>

        <section className="panel p-3">
          <h2 className="font-semibold">Jouw rechten</h2>
          <p className="mt-2">
            Je kunt inzage vragen, een verbetering, wissing, beperking, en je gegevens meenemen. Op de accountpagina exporteer je de kluis, wijzig je het wachtwoord en verwijder je het account. Typ VERWIJDER om de lokale kluis te wissen en het account te sluiten. Wil je weten wat het beheer van jouw Client-ID heeft ingezien, dan vraag je dat bij de hoofdbeheerder. Die ziet het in het auditlog. Een klacht kan bij de Autoriteit Persoonsgegevens.
          </p>
          <p className="mt-2">
            <Link to="/account" className="underline">
              Naar het account
            </Link>
            <span aria-hidden="true"> | </span>
            <a className="underline" href="https://status.boaportaal.nl">
              Status
            </a>
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
          . Dit portaal vervangt geen privacyverklaring van je werkgever of opleiding. Deel met politie, jongerenwerk of zorg alleen wat een wet of een convenant toestaat.
        </p>
      </div>
    </div>
  );
}
