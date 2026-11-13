import { useEffect, useMemo, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { FeedbackKnop } from "@/components/feedback";
import {
  SOORT_LABEL,
  euroUitTarief,
  kluisTekst,
  leegBon,
  leesConcept,
  schrijfConcept,
  splitFeitcode,
  wisConcept,
  type Combibon,
  type Eed,
  type SoortBon,
  type Streek,
  type WegSoort,
} from "@/lib/boa/combibon";
import { TOELICHTING, downloadCombibonPdf } from "@/lib/boa/combibon-pdf";
import { FEITEN, zoekFeiten, type Feit } from "@/lib/boa/feitcodes";
import { pastFilter } from "@/lib/boa/meta";
import { usePrefs } from "@/lib/boa/prefs";
import { zoekKenteken } from "@/lib/boa/rdw.functions";
import { useKluis } from "@/lib/kluis/provider";

const SOORTEN: SoortBon[] = ["S", "K", "A", "B", "O", "T"];
const WEGEN: { id: WegSoort; label: string }[] = [
  { id: "1", label: "Autosnelweg 1" },
  { id: "2", label: "Autoweg 2" },
  { id: "3", label: "Andere weg 3" },
  { id: "5", label: "Gewone weg 5" },
  { id: "6", label: "Onverharde weg 6" },
];

export function CombibonBlad() {
  const [start, setStart] = useState<Combibon | null>(null);
  useEffect(() => {
    setStart(leesConcept() ?? leegBon());
  }, []);
  if (!start) return <p className="mt-4 text-sm text-muted">Formulier laden.</p>;
  return <Ingevuld start={start} />;
}

function Ingevuld({ start }: { start: Combibon }) {
  const [bon, setBon] = useState(start);
  const [melding, setMelding] = useState("");
  const [rdw, setRdw] = useState("");
  const [tariefNoot, setTariefNoot] = useState("");
  const [bezig, setBezig] = useState(false);
  const { saveSjabloon } = useKluis();
  const filter = usePrefs((state) => state.domein);

  useEffect(() => {
    const id = window.setTimeout(() => schrijfConcept(bon), 250);
    return () => window.clearTimeout(id);
  }, [bon]);

  function zet<K extends keyof Combibon>(key: K, value: Combibon[K]) {
    setBon((huidig) => ({ ...huidig, [key]: value }));
  }

  function kiesFeit(feit: Feit) {
    const delen = splitFeitcode(feit.code);
    const bedrag = euroUitTarief(feit.tarief);
    setBon((huidig) => ({
      ...huidig,
      categorie: delen.categorie || huidig.categorie,
      feitnummer: delen.nummer || feit.code,
      gedraging: feit.titel,
      sanctie: bedrag || huidig.sanctie,
    }));
    setTariefNoot(
      bedrag
        ? `${feit.code} staat in het Feitenboekje 2026 op € ${bedrag}, exclusief € 9 administratiekosten van het CJIB.`
        : `${feit.code} heeft geen vast bedrag in het Feitenboekje. Vul het bedrag uit de verordening of het bronsysteem.`,
    );
  }

  async function haalRdw() {
    setBezig(true);
    setRdw("");
    try {
      const kaart = await zoekKenteken({ data: { kenteken: bon.kenteken } });
      if (!kaart) {
        setRdw("Geen voertuig op dit kenteken in de open data.");
        return;
      }
      setBon((huidig) => ({
        ...huidig,
        merk: kaart.merk || huidig.merk,
        kleur: kaart.kleur || huidig.kleur,
        soortVoertuig: kaart.soort || huidig.soortVoertuig,
        typeVoertuig: kaart.handelsbenaming || huidig.typeVoertuig,
      }));
      setRdw("Merk, soort en kleur staan erin. De houder niet. Die zit niet in de open data.");
    } catch {
      setRdw("De RDW-open data is nu niet bereikbaar, of het kenteken is te kort.");
    } finally {
      setBezig(false);
    }
  }

  function pdf() {
    downloadCombibonPdf(bon);
    setMelding("PDF gedownload. Daarin staat wat je hier hebt ingevuld, inclusief personalia. Het bestand blijft op dit apparaat.");
  }

  function kluis() {
    void saveSjabloon(`COMBIBON ${bon.model} | ${bon.kenteken || bon.plaats || bon.dag}`, kluisTekst(bon)).then((fout) => {
      setMelding(fout ?? "Alleen het feit staat versleuteld in de kluis. Naam, adres, BSN en verklaring niet.");
    });
  }

  function wissen() {
    wisConcept();
    setBon(leegBon());
    setTariefNoot("");
    setRdw("");
    setMelding("Concept gewist, ook de personalia op dit apparaat.");
  }

  function naar(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="mt-4 grid gap-3">
      <p className="text-sm">
        Invulhulp naar model 113111, versie 06/2018. Blad A1 heeft het verhoorblok. Blad B1 niet; op de achterzijde staat de toelichting voor de betrokkene. Dit is geen formulier van het OM of het CJIB. De PDF neemt over wat je invult. Naam, adres en BSN gaan niet naar de kluis.
      </p>
      <div className="no-print flex flex-wrap gap-2">
        <button type="button" className={bon.model === "A1" ? "btn btn-brand" : "btn"} onClick={() => zet("model", "A1")}>
          Blad A1
        </button>
        <button type="button" className={bon.model === "B1" ? "btn btn-brand" : "btn"} onClick={() => zet("model", "B1")}>
          Blad B1
        </button>
        <button type="button" className="btn" onClick={() => naar("bon-links")}>
          Voorzijde links
        </button>
        <button type="button" className="btn" onClick={() => naar("bon-rechts")}>
          Voorzijde rechts
        </button>
        <button type="button" className="btn" onClick={() => naar("bon-achter")}>
          Achterzijde
        </button>
      </div>
      <div className="bon-sheet grid gap-4 bg-[#ece7df] p-2 sm:p-3 xl:grid-cols-2">
        <Papier id="bon-links" titel={`Blad ${bon.model} (voorzijde links)`}>
          <Links bon={bon} zet={zet} filter={filter} onFeit={kiesFeit} tariefNoot={tariefNoot} rdw={rdw} bezig={bezig} onRdw={() => void haalRdw()} />
        </Papier>
        <Papier id="bon-rechts" titel={`Blad ${bon.model} (voorzijde rechts)`}>
          <Rechts bon={bon} zet={zet} patch={(deel) => setBon((huidig) => ({ ...huidig, ...deel }))} />
        </Papier>
        <div className="xl:col-span-2">
          <Papier id="bon-achter" titel={bon.model === "A1" ? "Blad A1 (achterzijde)" : "Blad B1 (achterzijde)"}>
            {bon.model === "A1" ? (
              <div className="grid gap-3">
                <p className="text-sm font-semibold">Bijlage opmerkingen verbalisant</p>
                <label className="grid gap-1 text-[10px] text-neutral-600">
                  Redenen van wetenschap
                  <textarea value={bon.redenen} onChange={(event) => zet("redenen", event.target.value)} />
                </label>
                <p className="text-xs text-neutral-600">De handtekening van de voorzijde komt op dit blad opnieuw in de PDF.</p>
              </div>
            ) : (
              <Toelichting />
            )}
          </Papier>
        </div>
      </div>
      <div className="no-print flex flex-wrap gap-2">
        <button type="button" className="btn btn-brand" onClick={pdf}>
          Opslaan als PDF
        </button>
        <button type="button" className="btn" onClick={kluis}>
          Feit in de kluis, zonder personalia
        </button>
        <button type="button" className="btn" onClick={wissen}>
          Concept wissen
        </button>
        <FeedbackKnop plek="/dienst?werk=combi" onderwerp="Combibon" />
      </div>
      {melding ? <p className="text-sm">{melding}</p> : null}
    </div>
  );
}

function Papier({ id, titel, children }: { id: string; titel: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border border-black bg-white text-black">
      <p className="border-b border-black px-2 py-1 text-[11px] font-semibold uppercase tracking-wide">{titel}</p>
      <div className="grid gap-2 p-2">{children}</div>
    </section>
  );
}

function Cel({
  label,
  value,
  onChange,
  className,
  mono = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  mono?: boolean;
}) {
  return (
    <label className={`flex min-w-0 flex-col border border-neutral-800 px-1.5 py-1 ${className ?? ""}`}>
      <span className="text-[10px] leading-tight text-neutral-600">{label}</span>
      <input value={value} autoComplete="off" onChange={(event) => onChange(event.target.value)} className={mono ? "font-mono uppercase tracking-wide" : ""} />
    </label>
  );
}

function Vink({ aan, label, onToggle }: { aan: boolean; label: string; onToggle: () => void }) {
  return (
    <label className="flex items-start gap-1.5 text-[12px] leading-snug">
      <input type="checkbox" checked={aan} onChange={onToggle} />
      <span>{label}</span>
    </label>
  );
}

function Links({
  bon,
  zet,
  filter,
  onFeit,
  tariefNoot,
  rdw,
  bezig,
  onRdw,
}: {
  bon: Combibon;
  zet: <K extends keyof Combibon>(key: K, value: Combibon[K]) => void;
  filter: ReturnType<typeof usePrefs.getState>["domein"];
  onFeit: (feit: Feit) => void;
  tariefNoot: string;
  rdw: string;
  bezig: boolean;
  onRdw: () => void;
}) {
  return (
    <>
      <div className="grid gap-2 lg:grid-cols-[1fr_16rem]">
        <Cel label="Naam opsporingsinstantie" value={bon.instantie} onChange={(value) => zet("instantie", value)} />
        <fieldset className="border border-neutral-800 px-2 py-1">
          <legend className="px-1 text-[10px] text-neutral-600">Soort</legend>
          <div className="grid gap-1">
            {SOORTEN.map((soort) => (
              <Vink
                key={soort}
                aan={bon.soorten.includes(soort)}
                label={`${soort} | ${SOORT_LABEL[soort]}`}
                onToggle={() =>
                  zet(
                    "soorten",
                    bon.soorten.includes(soort) ? bon.soorten.filter((item) => item !== soort) : [...bon.soorten, soort],
                  )
                }
              />
            ))}
          </div>
        </fieldset>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-2 border border-neutral-800 px-2 py-1">
        <p className="text-base font-bold tracking-wide">Proces-verbaal</p>
        <label className="text-[10px] text-neutral-600">
          Zaak nr. PSH-TM
          <input value={bon.zaak} autoComplete="off" onChange={(event) => zet("zaak", event.target.value)} className="font-semibold" />
        </label>
      </div>
      <div className="bg-black px-2 py-0.5 text-[11px] font-bold tracking-widest text-white">NUMMER</div>
      <div className="grid grid-cols-2 gap-px sm:grid-cols-5">
        <Cel label="Dag" value={bon.dag} onChange={(value) => zet("dag", value)} mono />
        <Cel label="Maand" value={bon.maand} onChange={(value) => zet("maand", value)} mono />
        <Cel label="Jaar" value={bon.jaar} onChange={(value) => zet("jaar", value)} mono />
        <Cel label="Tijdstip" value={bon.tijd} onChange={(value) => zet("tijd", value)} mono />
        <Cel label="Verbalisantnummer" value={bon.bonNummer} onChange={(value) => zet("bonNummer", value)} className="col-span-2 sm:col-span-1" mono />
      </div>
      <div className="grid gap-px sm:grid-cols-[1fr_6rem_6rem]">
        <Cel label="Plaats / gedraging / overtreding (de voor het openbaar verkeer openstaande weg)" value={bon.plaats} onChange={(value) => zet("plaats", value)} />
        <Cel label="Wegcode" value={bon.wegcode} onChange={(value) => zet("wegcode", value)} />
        <Cel label="HM-paal" value={bon.hm} onChange={(value) => zet("hm", value)} />
      </div>
      <div className="grid gap-px sm:grid-cols-2">
        <Cel label="Te" value={bon.te} onChange={(value) => zet("te", value)} />
        <Cel label="Gemeente" value={bon.gemeente} onChange={(value) => zet("gemeente", value)} />
      </div>
      <div className="grid gap-px sm:grid-cols-4">
        <Cel label="Soort voer-/vaartuig" value={bon.soortVoertuig} onChange={(value) => zet("soortVoertuig", value)} />
        <Cel label="Land" value={bon.land} onChange={(value) => zet("land", value)} />
        <Cel label="Kenteken / registratieteken" value={bon.kenteken} onChange={(value) => zet("kenteken", value.toUpperCase())} mono />
        <Cel label="Dupl. code" value={bon.dupl} onChange={(value) => zet("dupl", value)} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn" onClick={onRdw} disabled={bezig || bon.kenteken.replace(/[^A-Z0-9]/gi, "").length < 4}>
          {bezig ? "RDW opvragen" : "Merk en kleur uit RDW"}
        </button>
        {rdw ? <p className="text-xs text-neutral-700">{rdw}</p> : null}
      </div>
      <div className="grid gap-px sm:grid-cols-3">
        <Cel label="Merk" value={bon.merk} onChange={(value) => zet("merk", value)} />
        <Cel label="Type" value={bon.typeVoertuig} onChange={(value) => zet("typeVoertuig", value)} />
        <Cel label="Kleur" value={bon.kleur} onChange={(value) => zet("kleur", value)} />
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border border-neutral-800 px-2 py-1 text-[12px] leading-snug">
        <span>Ik, ambtenaar,</span>
        <Vink aan={bon.zag} label="zag" onToggle={() => zet("zag", !bon.zag)} />
        <Vink aan={bon.hoorde} label="hoorde" onToggle={() => zet("hoorde", !bon.hoorde)} />
        <Vink aan={bon.stelde} label="stelde na onderzoek vast" onToggle={() => zet("stelde", !bon.stelde)} />
        <span>dat op genoemde datum, tijdstip en plaats door betrokkene/verdachte, met het omschreven voer- of vaartuig, de volgende gedraging of overtreding werd verricht.</span>
      </div>
      <FeitKiezer filter={filter} onKies={onFeit} />
      <label className="grid gap-1 border border-neutral-800 px-1.5 py-1 text-[10px] text-neutral-600">
        Gedraging / overtreding
        <textarea value={bon.gedraging} onChange={(event) => zet("gedraging", event.target.value)} />
      </label>
      <div className="grid gap-px sm:grid-cols-3">
        <Cel label="Categorie" value={bon.categorie} onChange={(value) => zet("categorie", value.toUpperCase())} mono />
        <Cel label="Nummer" value={bon.feitnummer} onChange={(value) => zet("feitnummer", value)} mono />
        <Cel label="Sanctiebedrag €" value={bon.sanctie} onChange={(value) => zet("sanctie", value.replace(/[^\d.,]/g, ""))} mono />
      </div>
      {tariefNoot ? <p className="text-xs text-neutral-700">{tariefNoot}</p> : null}
      <p className="text-[11px] leading-snug text-neutral-600">
        Nader aangeduid in de bijlagen van de Wet administratiefrechtelijke handhaving verkeersvoorschriften, het Besluit OM-afdoening en de Richtlijn voor strafvordering feitgecodeerde misdrijven en overtredingen. Het bedrag uit het Feitenboekje is exclusief de administratiekosten van het CJIB. Een naheffing parkeerbelasting komt uit de verordening, niet uit dit vak.
      </p>
      <Cel label="De betrokkene/verdachte gaf, daarnaar gevraagd, op" value={bon.gevraagdOp} onChange={(value) => zet("gevraagdOp", value)} />
      <fieldset className="border border-neutral-800 px-2 py-1">
        <legend className="px-1 text-[10px] text-neutral-600">Personalia conform (document aanvinken)</legend>
        <div className="flex flex-wrap gap-3">
          <Vink aan={bon.docRbw} label="rbw" onToggle={() => zet("docRbw", !bon.docRbw)} />
          <Vink aan={bon.docPasp} label="pasp." onToggle={() => zet("docPasp", !bon.docPasp)} />
          <Vink aan={bon.docId} label="ID-kaart" onToggle={() => zet("docId", !bon.docId)} />
          <Vink aan={bon.docVreemd} label="vreemd ID" onToggle={() => zet("docVreemd", !bon.docVreemd)} />
          <Vink aan={bon.docMilitair} label="militair" onToggle={() => zet("docMilitair", !bon.docMilitair)} />
        </div>
      </fieldset>
      <div className="grid gap-px sm:grid-cols-[1fr_10rem_8rem]">
        <Cel label="Nummer document" value={bon.documentnummer} onChange={(value) => zet("documentnummer", value)} />
        <Cel label="Burgerservicenr." value={bon.bsn} onChange={(value) => zet("bsn", value)} />
        <div className="flex items-center gap-3 border border-neutral-800 px-2">
          <Vink aan={bon.geslacht === "man"} label="man" onToggle={() => zet("geslacht", bon.geslacht === "man" ? "" : "man")} />
          <Vink aan={bon.geslacht === "vrouw"} label="vrouw" onToggle={() => zet("geslacht", bon.geslacht === "vrouw" ? "" : "vrouw")} />
        </div>
      </div>
      <div className="grid gap-px sm:grid-cols-[1fr_8rem]">
        <Cel label="Naam" value={bon.naam} onChange={(value) => zet("naam", value)} />
        <Cel label="Voorvoegsel" value={bon.voorvoegsel} onChange={(value) => zet("voorvoegsel", value)} />
      </div>
      <Cel label="Voornamen" value={bon.voornamen} onChange={(value) => zet("voornamen", value)} />
      <div className="grid gap-px sm:grid-cols-3">
        <Cel label="Geboorteplaats / -gemeente" value={bon.geboorteplaats} onChange={(value) => zet("geboorteplaats", value)} />
        <Cel label="Land" value={bon.geboorteland} onChange={(value) => zet("geboorteland", value)} />
        <Cel label="Geboortedatum" value={bon.geboortedatum} onChange={(value) => zet("geboortedatum", value)} />
      </div>
      <div className="grid gap-px sm:grid-cols-[1fr_5rem]">
        <Cel label="Adres" value={bon.adres} onChange={(value) => zet("adres", value)} />
        <Cel label="Huisnr." value={bon.huisnr} onChange={(value) => zet("huisnr", value)} />
      </div>
      <div className="grid gap-px sm:grid-cols-4">
        <Cel label="Postcode" value={bon.postcode} onChange={(value) => zet("postcode", value.toUpperCase())} mono />
        <Cel label="Woonplaats" value={bon.woonplaats} onChange={(value) => zet("woonplaats", value)} />
        <Cel label="Woongemeente" value={bon.woongemeente} onChange={(value) => zet("woongemeente", value)} />
        <Cel label="Land" value={bon.woonland} onChange={(value) => zet("woonland", value)} />
      </div>
      <p className="text-[11px] text-neutral-600">BSN en documentnummer blijven op dit apparaat tot je het concept wist. Ze gaan mee in de PDF, niet naar de kluis.</p>
    </>
  );
}

function FeitKiezer({ filter, onKies }: { filter: ReturnType<typeof usePrefs.getState>["domein"]; onKies: (feit: Feit) => void }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const hits = useMemo(() => {
    const eigen = FEITEN.filter((feit) => pastFilter(feit.domeinen, filter));
    const eerst = q.trim() ? zoekFeiten(q, eigen) : eigen;
    const lijst = eerst.length === 0 && q.trim() ? zoekFeiten(q, FEITEN) : eerst;
    return lijst.slice(0, 8);
  }, [filter, q]);

  return (
    <div className="relative">
      <label className="grid gap-1 border border-neutral-800 px-1.5 py-1 text-[10px] text-neutral-600">
        Feit | typ een code, artikel of situatie
        <input
          value={q}
          autoComplete="off"
          placeholder="F 185, zwartrijden, 447e"
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQ(event.target.value);
            setOpen(true);
          }}
          onBlur={() => window.setTimeout(() => setOpen(false), 160)}
        />
      </label>
      {open ? (
        <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto border border-neutral-800 bg-white">
          {hits.length === 0 ? (
            <li className="p-2 text-xs text-neutral-600">Geen feit.</li>
          ) : (
            hits.map((hit) => (
              <li key={hit.id}>
                <button
                  type="button"
                  className="flex w-full gap-2 px-2 py-2 text-left text-sm hover:bg-neutral-100"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onKies(hit);
                    setQ(`${hit.code} | ${hit.titel}`);
                    setOpen(false);
                  }}
                >
                  <span className="font-mono text-xs font-bold">{hit.code}</span>
                  <span>{hit.titel}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}

function Rechts({
  bon,
  zet,
  patch,
}: {
  bon: Combibon;
  zet: <K extends keyof Combibon>(key: K, value: Combibon[K]) => void;
  patch: (deel: Partial<Combibon>) => void;
}) {
  return (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-wide">Oproeping zitting</p>
      <div className="grid gap-px sm:grid-cols-3">
        <Cel label="Datum" value={bon.zittingDatum} onChange={(value) => zet("zittingDatum", value)} />
        <Cel label="Tijd" value={bon.zittingTijd} onChange={(value) => zet("zittingTijd", value)} />
        <Cel label="Plaats" value={bon.zittingPlaats} onChange={(value) => zet("zittingPlaats", value)} />
      </div>
      {bon.model === "A1" ? (
        <>
          <div className="grid gap-px sm:grid-cols-2">
            <Cel label="Direct betaald | kwitantienummer" value={bon.kwitantie} onChange={(value) => zet("kwitantie", value)} />
            <Cel label="Afwijkend bedrag (alleen strafrecht) €" value={bon.afwijkend} onChange={(value) => zet("afwijkend", value.replace(/[^\d.,]/g, ""))} />
            <Cel label="Naam OM-functionaris i.v.m. afwijkend bedrag" value={bon.omNaam} onChange={(value) => zet("omNaam", value)} />
            <div className="flex items-center border border-neutral-800 px-2">
              <Vink aan={bon.adminVoldaan} label="Administratiekosten voldaan" onToggle={() => zet("adminVoldaan", !bon.adminVoldaan)} />
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <Vink aan={bon.bewaring} label="In bewaring gesteld na vordering onmiddellijke betaling" onToggle={() => zet("bewaring", !bon.bewaring)} />
            <Vink aan={bon.wegsleep} label="Weggesleept" onToggle={() => zet("wegsleep", !bon.wegsleep)} />
            <Vink aan={bon.beslag} label="Beslag" onToggle={() => zet("beslag", !bon.beslag)} />
          </div>
        </>
      ) : null}
      <fieldset className="border border-neutral-800 px-2 py-1">
        <legend className="px-1 text-[10px] text-neutral-600">Weg</legend>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {WEGEN.map((weg) => (
            <Vink key={weg.id} aan={bon.weg === weg.id} label={weg.label} onToggle={() => zet("weg", bon.weg === weg.id ? "" : weg.id)} />
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
          <Vink aan={bon.rijbaan} label="Rijbaan" onToggle={() => zet("rijbaan", !bon.rijbaan)} />
          <Vink aan={bon.fietspad} label="Fietspad" onToggle={() => zet("fietspad", !bon.fietspad)} />
          <Vink aan={bon.bubeko} label="Bubeko" onToggle={() => patch(bon.bubeko ? { bubeko: false } : { bubeko: true, bibeko: false })} />
          <Vink aan={bon.bibeko} label="Bibeko" onToggle={() => patch(bon.bibeko ? { bibeko: false } : { bibeko: true, bubeko: false })} />
        </div>
      </fieldset>
      <p className="text-[11px] font-semibold uppercase tracking-wide">Snelheid</p>
      <div className="grid gap-px sm:grid-cols-3">
        <Cel label="Gemeten" value={bon.snelGemeten} onChange={(value) => zet("snelGemeten", value)} />
        <Cel label="Gecorrigeerd" value={bon.snelGecorrigeerd} onChange={(value) => zet("snelGecorrigeerd", value)} />
        <Cel label="Toegestaan" value={bon.snelToegestaan} onChange={(value) => zet("snelToegestaan", value)} />
        <div className="flex items-center border border-neutral-800 px-2">
          <Vink aan={bon.beginnend} label="Beginnende bestuurder" onToggle={() => zet("beginnend", !bon.beginnend)} />
        </div>
        <Cel label="Projectcode" value={bon.projectcode} onChange={(value) => zet("projectcode", value)} className="sm:col-span-2" />
      </div>
      {bon.model === "A1" ? <Verhoor bon={bon} zet={zet} /> : null}
      <p className="text-[12px]">Op de achterzijde vermelde gegevens maken onderdeel uit van dit proces-verbaal.</p>
      <div className="grid gap-3 lg:grid-cols-2">
        <Verbalist
          titel="Gegevens 1e verbalisant"
          eed={bon.v1Eed}
          datum={bon.v1Datum}
          nummer={bon.v1Nummer}
          hovj={bon.v1Hovj}
          naam={bon.v1Naam}
          hand={bon.v1Hand}
          onEed={(value) => zet("v1Eed", value)}
          onDatum={(value) => zet("v1Datum", value)}
          onNummer={(value) => zet("v1Nummer", value)}
          onHovj={() => zet("v1Hovj", !bon.v1Hovj)}
          onNaam={(value) => zet("v1Naam", value)}
          onHand={(value) => zet("v1Hand", value)}
        />
        <Verbalist
          titel="Gegevens 2e verbalisant"
          eed={bon.v2Eed}
          datum={bon.v2Datum}
          nummer={bon.v2Nummer}
          hovj={bon.v2Hovj}
          naam={bon.v2Naam}
          hand={bon.v2Hand}
          onEed={(value) => zet("v2Eed", value)}
          onDatum={(value) => zet("v2Datum", value)}
          onNummer={(value) => zet("v2Nummer", value)}
          onHovj={() => zet("v2Hovj", !bon.v2Hovj)}
          onNaam={(value) => zet("v2Naam", value)}
          onHand={(value) => zet("v2Hand", value)}
        />
      </div>
      {bon.model === "A1" ? <Cel label="Datum binnenkomst adm." value={bon.binnenkomst} onChange={(value) => zet("binnenkomst", value)} /> : null}
    </>
  );
}

function Verhoor({ bon, zet }: { bon: Combibon; zet: <K extends keyof Combibon>(key: K, value: Combibon[K]) => void }) {
  return (
    <div className="grid gap-2 border border-neutral-800 p-2">
      <div className="flex flex-wrap items-center gap-3 text-[12px]">
        <span>Verdachte/betrokkene gehoord door verbalisant</span>
        <Vink aan={bon.gehoord === "1"} label="1" onToggle={() => zet("gehoord", bon.gehoord === "1" ? "" : "1")} />
        <Vink aan={bon.gehoord === "2"} label="2" onToggle={() => zet("gehoord", bon.gehoord === "2" ? "" : "2")} />
      </div>
      <p className="text-[11px] font-semibold">Aan de verdachte/betrokkene is mededeling gedaan:</p>
      <Vink aan={bon.cautie} label="Dat hij/zij niet tot antwoorden verplicht is." onToggle={() => zet("cautie", !bon.cautie)} />
      <Vink
        aan={bon.welkeFeit}
        label="Van welk strafbaar feit of welke gedraging hij/zij als verdachte/betrokkene is aangemerkt."
        onToggle={() => zet("welkeFeit", !bon.welkeFeit)}
      />
      <p className="text-[11px] font-semibold">Aan de verdachte is mededeling gedaan:</p>
      <Vink aan={bon.rechtsbijstand} label="Van het recht op rechtsbijstand." onToggle={() => zet("rechtsbijstand", !bon.rechtsbijstand)} />
      <Vink aan={bon.vertolking} label="Van het recht op vertolking en vertaling." onToggle={() => zet("vertolking", !bon.vertolking)} />
      <Vink
        aan={bon.afstandBijstand}
        label="Afstand gedaan van het recht op verhoorbijstand. Op de hoogte van de gevolgen. Deze beslissing kan te allen tijde worden herroepen."
        onToggle={() => zet("afstandBijstand", !bon.afstandBijstand)}
      />
      <div className="grid gap-px sm:grid-cols-2">
        <Cel label="Verhoor in begrijpelijke taal, te weten" value={bon.taal} onChange={(value) => zet("taal", value)} />
        <Cel label="Tolkennummer" value={bon.tolknummer} onChange={(value) => zet("tolknummer", value)} />
      </div>
      <Vink aan={bon.geenVerklaring} label="Verdachte/betrokkene wenste geen verklaring af te leggen" onToggle={() => zet("geenVerklaring", !bon.geenVerklaring)} />
      <label className="grid gap-1 text-[10px] text-neutral-600">
        Verdachte/betrokkene verklaarde
        <textarea value={bon.verklaring} onChange={(event) => zet("verklaring", event.target.value)} />
      </label>
    </div>
  );
}

function Verbalist({
  titel,
  eed,
  datum,
  nummer,
  hovj,
  naam,
  hand,
  onEed,
  onDatum,
  onNummer,
  onHovj,
  onNaam,
  onHand,
}: {
  titel: string;
  eed: Eed;
  datum: string;
  nummer: string;
  hovj: boolean;
  naam: string;
  hand: Streek[];
  onEed: (value: Eed) => void;
  onDatum: (value: string) => void;
  onNummer: (value: string) => void;
  onHovj: () => void;
  onNaam: (value: string) => void;
  onHand: (value: Streek[]) => void;
}) {
  return (
    <fieldset className="grid gap-2 border border-neutral-800 p-2">
      <legend className="px-1 text-[11px] font-semibold">{titel}</legend>
      <div className="flex gap-3">
        <Vink aan={eed === "eed"} label="ambtseed" onToggle={() => onEed(eed === "eed" ? "" : "eed")} />
        <Vink aan={eed === "belofte"} label="ambtsbelofte" onToggle={() => onEed(eed === "belofte" ? "" : "belofte")} />
        <Vink aan={hovj} label="HOvJ" onToggle={onHovj} />
      </div>
      <Cel label="Datum" value={datum} onChange={onDatum} />
      <Cel label="Verbalisantnummer" value={nummer} onChange={onNummer} />
      <Cel label="Naam en voorletters" value={naam} onChange={onNaam} />
      <div>
        <p className="text-[10px] text-neutral-600">Handtekening</p>
        <Handtekening value={hand} onChange={onHand} />
      </div>
    </fieldset>
  );
}

function Handtekening({ value, onChange }: { value: Streek[]; onChange: (value: Streek[]) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const bezig = useRef<Streek | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const schaal = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || 280;
    const h = canvas.clientHeight || 72;
    canvas.width = Math.floor(w * schaal);
    canvas.height = Math.floor(h * schaal);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(schaal, 0, 0, schaal, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 1.6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const streek of value) {
      if (streek.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(streek[0].x * w, streek[0].y * h);
      for (let index = 1; index < streek.length; index += 1) ctx.lineTo(streek[index].x * w, streek[index].y * h);
      ctx.stroke();
    }
  }, [value]);

  function puntVan(event: PointerEvent<HTMLCanvasElement>): { x: number; y: number } {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
    };
  }

  return (
    <div>
      <canvas
        ref={ref}
        className="h-[4.5rem] w-full touch-none border border-neutral-800 bg-white"
        aria-label="Handtekening"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          bezig.current = [puntVan(event)];
        }}
        onPointerMove={(event) => {
          const streek = bezig.current;
          if (!streek) return;
          const volgend = puntVan(event);
          const vorig = streek[streek.length - 1];
          streek.push(volgend);
          const canvas = event.currentTarget;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          const rect = canvas.getBoundingClientRect();
          ctx.strokeStyle = "#111";
          ctx.lineWidth = 1.6;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(vorig.x * rect.width, vorig.y * rect.height);
          ctx.lineTo(volgend.x * rect.width, volgend.y * rect.height);
          ctx.stroke();
        }}
        onPointerUp={() => {
          const streek = bezig.current;
          bezig.current = null;
          if (!streek || streek.length < 2) return;
          onChange([...value, streek]);
        }}
      />
      <button type="button" className="mt-1 text-xs underline" onClick={() => onChange([])}>
        Handtekening wissen
      </button>
    </div>
  );
}

function Toelichting() {
  return (
    <div className="grid gap-3 text-[13px] leading-snug">
      <p className="text-xs text-neutral-700">
        Tekst van de achterzijde van model B, versie 06/2018. De acceptgiro bestaat niet meer. Termijnen en het postadres kunnen zijn gewijzigd. De beschikking van het CJIB gaat voor.
      </p>
      {TOELICHTING.map((blok) => (
        <section key={blok.kop}>
          <h3 className="text-sm font-bold">{blok.kop}</h3>
          {blok.alinea.map((alinea) => (
            <p key={alinea.slice(0, 24)} className="mt-1">
              {alinea}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}
