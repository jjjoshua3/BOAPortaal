import { useEffect, useState, type FormEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

type Stap = {
  modus: "setup" | "code";
  factorId: string;
  qr: string;
  geheim: string;
};

export async function leesTweestap(sb: SupabaseClient): Promise<Stap | "klaar" | "uit"> {
  const niveau = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
  if (niveau.error) return "uit";
  if (niveau.data.currentLevel === "aal2") return "klaar";
  if (niveau.data.nextLevel === "aal1" && niveau.data.currentLevel === "aal1") {
    const probeer = await bereid(sb);
    return probeer ?? "uit";
  }
  return (await bereid(sb)) ?? "uit";
}

async function bereid(sb: SupabaseClient): Promise<Stap | "klaar" | null> {
  const lijst = await sb.auth.mfa.listFactors();
  if (lijst.error) return null;
  const bevestigd = (lijst.data?.totp ?? []).filter((factor) => factor.status === "verified");
  if (bevestigd[0]) return { modus: "code", factorId: bevestigd[0].id, qr: "", geheim: "" };
  for (const factor of lijst.data?.all ?? []) {
    if (factor.status !== "verified") await sb.auth.mfa.unenroll({ factorId: factor.id });
  }
  const vers = await sb.auth.mfa.enroll({ factorType: "totp", issuer: "BOA Portaal" });
  if (vers.error || !vers.data) return null;
  const qr = vers.data.totp?.qr_code ?? "";
  const geheim = vers.data.totp?.secret ?? "";
  if (!qr) return null;
  return { modus: "setup", factorId: vers.data.id, qr, geheim };
}

export function Tweestap({
  sb,
  stap,
  onKlaar,
}: {
  sb: SupabaseClient;
  stap: Stap;
  onKlaar: () => void;
}) {
  const [code, setCode] = useState("");
  const [fout, setFout] = useState("");
  const [bezig, setBezig] = useState(false);

  async function bevestig(event: FormEvent) {
    event.preventDefault();
    setBezig(true);
    setFout("");
    const uitdaging = await sb.auth.mfa.challenge({ factorId: stap.factorId });
    if (uitdaging.error || !uitdaging.data) {
      setFout("De code kon niet worden gevraagd. Probeer het opnieuw.");
      setBezig(false);
      return;
    }
    const check = await sb.auth.mfa.verify({
      factorId: stap.factorId,
      challengeId: uitdaging.data.id,
      code: code.replace(/\s/g, ""),
    });
    setBezig(false);
    if (check.error) {
      setFout("Die code klopt niet.");
      return;
    }
    onKlaar();
  }

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-[#0F172A]/75 px-4">
      <form className="panel w-full max-w-md p-4" onSubmit={bevestig}>
        <p className="text-xs font-semibold tracking-wide text-muted">TWEEDE STAP</p>
        <h2 className="mt-1 text-xl font-semibold">{stap.modus === "setup" ? "Authenticator instellen" : "Authenticator"}</h2>
        <p className="mt-2 text-sm text-muted">
          {stap.modus === "setup"
            ? "Scan de code met Google Authenticator of een andere authenticator. Daarna vul je de 6 cijfers in. Dit vragen we bij elke nieuwe aanmelding."
            : "Vul de 6 cijfers uit je authenticator in. Dit hoort bij elke nieuwe aanmelding."}
        </p>
        {stap.modus === "setup" && stap.qr ? (
          <img src={stap.qr} alt="QR-code voor de authenticator" className="mx-auto mt-4 h-48 w-48 bg-white p-2" />
        ) : null}
        {stap.modus === "setup" && stap.geheim ? (
          <p className="mt-2 break-all text-center text-xs text-muted">Lukt scannen niet, typ dan deze sleutel: {stap.geheim}</p>
        ) : null}
        <label className="field mt-4">
          Code
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="123456"
            className="tracking-[0.3em]"
            required
          />
        </label>
        {fout ? <p className="accent-stop panel mt-3 p-3 text-sm">{fout}</p> : null}
        <button className="btn btn-brand mt-3 w-full" type="submit" disabled={bezig}>
          {bezig ? "Bezig…" : "Bevestigen"}
        </button>
      </form>
    </div>
  );
}

export function Vergeten({ onSluit }: { onSluit: () => void }) {
  useEffect(() => {
    const toets = (event: KeyboardEvent) => {
      if (event.key === "Escape") onSluit();
    };
    window.addEventListener("keydown", toets);
    return () => window.removeEventListener("keydown", toets);
  }, [onSluit]);

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-[#0F172A]/75 px-4">
      <div className="panel w-full max-w-md p-4" role="dialog" aria-labelledby="vergeten-titel">
        <p className="text-xs font-semibold tracking-wide text-muted">30 DAGEN</p>
        <h2 id="vergeten-titel" className="mt-1 text-xl font-semibold">
          Helaas, we zijn u vergeten
        </h2>
        <p className="mt-2 text-sm text-muted">
          Graag ontvangen wij uw gegevens om te verifiëren wie u bent. Excuses voor het ongemak.
        </p>
        <a className="btn btn-brand mt-4 w-full" href="/account" onClick={onSluit}>
          Gegevens invullen
        </a>
      </div>
    </div>
  );
}
