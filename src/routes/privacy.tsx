import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead } from "@/components/bits";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () =>
    seo(
      "/privacy",
      "Privacy | BOA Portaal",
      "Hoe BOA Portaal accounts, inzage, de kluis en het auditlog behandelt. Geen e-mail in beeld, geen dossier van burgers.",
    ),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-5">
      <PageHead
        kicker="PRIVACY | AVG"
        title="Hoe dit portaal met gegevens omgaat"
        lede="BOA Portaal is een onafhankelijke naslag. Geen systeem van het Openbaar Ministerie, de politie, het CJIB of een gemeente. Hier staat wat er van een account wordt bewaard, wie het mag inzien, en wat buiten beeld blijft."
      />
      <div className="grid gap-3 text-sm">
        <section className="panel p-3">
          <h2 className="font-semibold">Verantwoordelijke</h2>
          <p className="mt-2">
            De beheerder van BOA Portaal is verwerkingsverantwoordelijke voor het account, de kluis, het overlegbord, de servicedesk en het auditlog. Er is geen reclameprofiel en geen geautomatiseerd besluit over jou. We bewaren zo min mogelijk, en niet langer dan hieronder staat.
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
            In plaats daarvan krijgt het account een Client-ID, bijvoorbeeld BP-3200-YE, en een PV-naam in de vorm ACHTERNAAM, V. Die twee zijn wat collega's en het beheer zien. Grondslag: je maakt het account zelf aan om de kluis en het overleg te gebruiken, artikel 6 lid 1 onder a en b AVG. Support en de hoofdbeheerder kunnen in systeem.boaportaal.nl ook een account voor boaportaal.nl aanmaken. Een medewerkersaccount, met recht op de servicedesk, maakt alleen de hoofdbeheerder aan.
          </p>
        </section>

        <section className="panel p-3">
          <h2 className="font-semibold">Inzage door beheer</h2>
          <p className="mt-2">
            Support en de hoofdbeheerder kunnen een account opzoeken op Client-ID of ticketnummer. Dat mag alleen met een reden van minstens twaalf tekens. Elke opvraag wordt een regel in het auditlog: wie, wanneer, welk dossier, en waarom. Die regel is INZAGE.
          </p>
          <p className="mt-2">
            In het dossier staat de Client-ID, de PV-naam, de organisatie en of het account vergrendeld is. Het e-mailadres komt niet op het scherm. De inhoud van de kluis ook niet. De beheerder ziet alleen tellers: hoeveel notities, concepten en favorieten er versleuteld staan, en wanneer de kluis voor het laatst synchroniseerde.
          </p>
          <p className="mt-2">
            Zoeken op e-mailadres kunnen support en de hoofdbeheerder, als het dossier niet op Client-ID te vinden is. Die opvraag schrijft een aparte regel (BREAK_GLASS). Het adres komt niet terug in het dossier.
          </p>
        </section>

        <section className="panel p-3">
          <h2 className="font-semibold">Wachtwoord en adres</h2>
          <p className="mt-2">
            Je wijzigt je wachtwoord zelf op de accountpagina. Een medewerker kan een herstel-link laten sturen naar het zakelijke adres, zonder dat adres te zien. Alleen de hoofdbeheerder kan het wachtwoord direct zetten of het zakelijke adres wijzigen. Het nieuwe wachtwoord en het nieuwe adres komen niet in het auditlog. Wel staat daar dat de wijziging is gedaan, door wie, en met welke reden. Zo'n regel is een kritieke auth-wijziging.
          </p>
          <p className="mt-2">De hoofdbeheerder kan een account vergrendelen en weer openen. Ook dat wordt gelogd.</p>
        </section>

        <section className="panel p-3">
          <h2 className="font-semibold">Inloggen</h2>
          <p className="mt-2">
            Een aanmelding op boaportaal.nl, de servicedesk en het beheersysteem wordt gelogd: moment, site, uitkomst en Client-ID als die bekend is.
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
          <h2 className="font-semibold">Kenteken en vermiste personen</h2>
          <p className="mt-2">
            Een kentekenopvraag leest de open data van de RDW. Daar staat geen naam van de houder. Het portaal bewaart die opvraag niet, tenzij je zelf een combibon in de kluis zet. De lijst vermiste personen komt live van de politie en wordt niet in onze database opgeslagen.
          </p>
        </section>

        <section className="panel p-3">
          <h2 className="font-semibold">Hoe lang het blijft staan</h2>
          <ul className="mt-2 grid gap-2">
            <li>Account en kluis: tot je het account verwijdert, of tot de hoofdbeheerder het op jouw verzoek sluit.</li>
            <li>Inlogpogingen: 30 dagen. Een mislukte poging zonder account: 7 dagen.</li>
            <li>Audit, gewone inzage: 90 dagen. Zware opvraag: 180 dagen. Kritieke auth-wijziging: 365 dagen.</li>
            <li>Gesloten tickets: 90 dagen, daarna weg, inclusief het logboek van dat ticket.</li>
            <li>Open tickets blijven staan tot ze zijn afgehandeld.</li>
          </ul>
          <p className="mt-2">
            De aanmelddienst en de database zijn de verwerkers. Zij zien het e-mailadres en de cijfertekst van de kluis, niet de inhoud. Geen verkoop van gegevens. Geen advertentiecookies. Een sessiecookie houdt je aangemeld.
          </p>
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
