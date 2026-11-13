import { useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";
import { scanPii } from "@/lib/boa/privacy";
import { plaatsOverleg } from "@/lib/boa/overleg.functions";
import { usePrefs } from "@/lib/boa/prefs";
import { useKluis } from "@/lib/kluis/provider";
import { useBoaAuth } from "@/lib/supabase/auth";
import { sessieToken } from "@/lib/supabase/client";

const GAST = "boa-meldingen-gast";

type GastMelding = { plek: string; onderwerp: string; tekst: string; tijd: string };

function leesGast(): GastMelding[] {
  try {
    const raw = localStorage.getItem(GAST);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GastMelding[];
    return Array.isArray(parsed) ? parsed.slice(0, 20) : [];
  } catch {
    return [];
  }
}

export function FeedbackKnop({ plek, onderwerp }: { plek: string; onderwerp: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="btn" onClick={() => setOpen(true)}>
        <MessageSquare className="size-4" />
        Klopt dit niet?
      </button>
      {open ? <MeldingVenster plek={plek} onderwerp={onderwerp} onSluit={() => setOpen(false)} /> : null}
    </>
  );
}

export function FeedbackDock() {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="no-print fixed bottom-20 left-3 z-40 min-h-11 border border-amber bg-brand px-3 text-sm font-semibold text-on-brand lg:bottom-4"
        onClick={() => setOpen(true)}
      >
        Melding
      </button>
      {open ? <MeldingVenster plek={path} onderwerp="Algemeen" onSluit={() => setOpen(false)} /> : null}
    </>
  );
}

function MeldingVenster({ plek, onderwerp, onSluit }: { plek: string; onderwerp: string; onSluit: () => void }) {
  const { user } = useBoaAuth();
  const { saveNote } = useKluis();
  const domein = usePrefs((state) => state.domein);
  const [tekst, setTekst] = useState("");
  const [zacht, setZacht] = useState(false);
  const [doorzetten, setDoorzetten] = useState(true);
  const [status, setStatus] = useState("");
  const [bezig, setBezig] = useState(false);
  const scan = scanPii(tekst);

  async function verstuur() {
    const schoon = tekst.trim();
    if (schoon.length < 8) {
      setStatus("Schrijf in een paar zinnen wat niet klopt, of wat je wilt doorzetten.");
      return;
    }
    if (scan.hard.length) {
      setStatus("Haal BSN, telefoon, e-mail en IBAN eruit. Dit is geen dossier.");
      return;
    }
    if (scan.zacht.length && !zacht) {
      setStatus("Er staat iets wat op een naam lijkt. Vink de controle aan of schrijf [PERSOON].");
      return;
    }
    setBezig(true);
    setStatus("");
    try {
      if (!user) {
        const lijst = [{ plek, onderwerp, tekst: schoon, tijd: new Date().toISOString() }, ...leesGast()].slice(0, 20);
        localStorage.setItem(GAST, JSON.stringify(lijst));
        setStatus("Staat alleen op dit apparaat. Meld je aan om de melding door te zetten naar collega's.");
        setTekst("");
        return;
      }
      const fout = await saveNote({
        titel: `MELDING | ${onderwerp}`.slice(0, 120),
        body: `Plek: ${plek}\nOnderwerp: ${onderwerp}\n\n${schoon}`,
        zachtAkkoord: zacht || scan.zacht.length === 0,
      });
      if (fout) {
        setStatus(fout);
        return;
      }
      if (doorzetten) {
        try {
          const token = await sessieToken();
          if (!token) throw new Error("geen sessie");
          await plaatsOverleg({
            data: {
              token,
              soort: "correctie",
              titel: onderwerp.slice(0, 120),
              tekst: `Plek: ${plek}\n${schoon}`.slice(0, 1200),
              domein: domein === "alle" ? "algemeen" : domein,
            },
          });
          setStatus("Versleuteld in je kluis, en zichtbaar voor aangemelde collega's op het overlegbord.");
        } catch {
          setStatus("Versleuteld in je kluis. Het overlegbord antwoordde niet, dus collega's zien het nog niet.");
        }
      } else {
        setStatus("Versleuteld in je kluis. Niet gedeeld met collega's.");
      }
      setTekst("");
    } finally {
      setBezig(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button type="button" className="absolute inset-0 bg-brand/70" aria-label="Sluit melding" onClick={onSluit} />
      <form
        className="panel relative m-3 w-full max-w-lg p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void verstuur();
        }}
      >
        <p className="text-xs font-semibold tracking-wide text-muted">MELDING | {plek}</p>
        <h2 className="mt-1 text-lg font-semibold">{onderwerp}</h2>
        <p className="mt-1 text-sm text-muted">
          Iets klopt niet, of je wilt een werkwijze doorzetten.
        </p>
        <label className="field mt-3">
          Wat moet er anders
          <textarea value={tekst} onChange={(event) => setTekst(event.target.value)} rows={5} maxLength={1100} />
        </label>
        {scan.zacht.length ? (
          <label className="mt-2 flex min-h-11 items-center gap-2 text-sm">
            <input type="checkbox" checked={zacht} onChange={(event) => setZacht(event.target.checked)} />
            Ik heb gecontroleerd dat hier geen echte naam van een burger in staat.
          </label>
        ) : null}
        {user ? (
          <label className="mt-2 flex min-h-11 items-center gap-2 text-sm">
            <input type="checkbox" checked={doorzetten} onChange={(event) => setDoorzetten(event.target.checked)} />
            Doorzetten naar het overlegbord voor aangemelde collega's.
          </label>
        ) : (
          <p className="mt-2 text-sm">Zonder account blijft de melding op dit apparaat. Aanmelden kan met een zakelijk of schooladres.</p>
        )}
        {status ? <p className="mt-2 text-sm">{status}</p> : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="submit" className="btn btn-brand" disabled={bezig}>
            {bezig ? "Bezig" : "Vastleggen"}
          </button>
          <button type="button" className="btn" onClick={onSluit}>
            Sluiten
          </button>
        </div>
      </form>
    </div>
  );
}
