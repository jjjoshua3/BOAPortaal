import { useState, type FormEvent } from "react";
import { passwordIssues, passwordScore } from "@/lib/supabase/guards";
import { getSupabase } from "@/lib/supabase/client";

export function RecoveryModal({ onClose }: { onClose: () => void }) {
  const [password, setPassword] = useState("");
  const [again, setAgain] = useState("");
  const [fout, setFout] = useState("");
  const [bezig, setBezig] = useState(false);
  const [klaar, setKlaar] = useState(false);
  const issues = passwordIssues(password);
  const score = passwordScore(password);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setFout("");
    if (issues.length) {
      setFout(`Nog nodig: ${issues.join(", ")}.`);
      return;
    }
    if (password !== again) {
      setFout("De twee wachtwoorden zijn niet gelijk.");
      return;
    }
    const sb = getSupabase();
    if (!sb) return;
    setBezig(true);
    const { error } = await sb.auth.updateUser({ password });
    setBezig(false);
    if (error) {
      setFout("Het nieuwe wachtwoord is niet opgeslagen. Vraag een nieuwe herstelmail als de link verlopen is.");
      return;
    }
    setKlaar(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-brand/70 p-3 sm:items-center">
      <form className="panel w-full max-w-md p-4" onSubmit={onSubmit}>
        <p className="font-mono text-xs tracking-wide text-muted">ACCOUNT | HERSTEL</p>
        <h2 className="mt-1 text-xl font-semibold">Nieuw wachtwoord instellen</h2>
        <p className="mt-2 text-sm text-muted">De herstelmail is geopend. Kies een nieuw wachtwoord. Daarna ben je direct aangemeld.</p>
        {klaar ? (
          <div className="mt-4">
            <p className="accent-ok panel p-3 text-sm">Het wachtwoord is gewijzigd.</p>
            <button type="button" className="btn btn-brand mt-3" onClick={onClose}>
              Verder naar het portaal
            </button>
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            <label className="field">
              Nieuw wachtwoord
              <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            <Meter score={score} />
            <label className="field">
              Herhaal wachtwoord
              <input type="password" autoComplete="new-password" value={again} onChange={(e) => setAgain(e.target.value)} required />
            </label>
            {fout ? <p className="accent-stop panel p-3 text-sm">{fout}</p> : null}
            <div className="flex gap-2">
              <button className="btn btn-brand" type="submit" disabled={bezig || issues.length > 0 || password !== again}>
                {bezig ? "Opslaan…" : "Wachtwoord opslaan"}
              </button>
              <button className="btn" type="button" onClick={onClose}>
                Sluiten
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export function Meter({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2" aria-hidden="true">
      {[0, 1, 2, 3].map((index) => (
        <span key={index} className={`meter-seg h-1.5 flex-1 ${index < score ? "is-on" : ""}`} />
      ))}
      <span className="text-xs text-muted">{score}/4</span>
    </div>
  );
}
