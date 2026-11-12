import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DOMEIN_INFO, ROLLEN, type DomeinId, type Rol } from "@/lib/boa/meta";
import { usePrefs } from "@/lib/boa/prefs";
import { Meter } from "@/components/recovery-modal";
import { PageHead } from "@/components/bits";
import { useKluis } from "@/lib/kluis/provider";
import { useBoaAuth } from "@/lib/supabase/auth";
import { getSupabase } from "@/lib/supabase/client";
import { emailDomainError, mapAuthError, passwordIssues, passwordScore } from "@/lib/supabase/guards";

export const Route = createFileRoute("/account")({
  component: AccountPage,
});

type Tab = "in" | "aan" | "weg";

function AccountPage() {
  const { user, ready } = useBoaAuth();
  if (!ready) return <p className="mx-auto max-w-3xl px-4 py-8 text-sm text-muted">Account laden…</p>;
  if (!user) return <Gast />;
  return <Profiel />;
}

function Gast() {
  const [tab, setTab] = useState<Tab>("in");
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-5">
      <div className="gate p-4">
        <PageHead
          kicker="ACCOUNT | BEVEILIGD"
          title="Zakelijk aanmelden"
          lede="Alleen een betaald organisatie-, overheids-, vervoers- of onderwijsdomein | gratis mailboxen worden geweigerd."
        />
        <div className="mb-4 flex flex-wrap gap-2">
          <button type="button" className={tab === "in" ? "btn btn-brand" : "btn"} onClick={() => setTab("in")}>
            Inloggen
          </button>
          <button type="button" className={tab === "aan" ? "btn btn-brand" : "btn"} onClick={() => setTab("aan")}>
            Registreren
          </button>
          <button type="button" className={tab === "weg" ? "btn btn-brand" : "btn"} onClick={() => setTab("weg")}>
            Wachtwoord vergeten
          </button>
        </div>
        {tab === "in" ? <LoginForm /> : null}
        {tab === "aan" ? <RegisterForm /> : null}
        {tab === "weg" ? <ResetForm /> : null}
      </div>
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fout, setFout] = useState("");
  const [bezig, setBezig] = useState(false);
  const domeinFout = email ? emailDomainError(email) : null;

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        const blok = emailDomainError(email);
        if (blok) {
          setFout(blok);
          return;
        }
        const sb = getSupabase();
        if (!sb) return;
        setBezig(true);
        setFout("");
        void sb.auth.signInWithPassword({ email: email.trim(), password }).then(({ error }) => {
          setBezig(false);
          if (error) setFout(mapAuthError(error.message));
        });
      }}
    >
      <Mail email={email} setEmail={setEmail} fout={domeinFout} />
      <label className="field">
        Wachtwoord
        <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
      </label>
      <Meter score={passwordScore(password)} />
      {fout ? <p className="accent-stop panel p-3 text-sm">{fout}</p> : null}
      <button className="btn btn-brand" type="submit" disabled={bezig || Boolean(domeinFout)}>
        {bezig ? "Bezig…" : "Inloggen"}
      </button>
    </form>
  );
}

function RegisterForm() {
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [again, setAgain] = useState("");
  const [domein, setDomein] = useState<DomeinId>("I");
  const [rol, setRol] = useState<Rol>("boa");
  const [akkoord, setAkkoord] = useState(false);
  const [fout, setFout] = useState("");
  const [ok, setOk] = useState("");
  const [bezig, setBezig] = useState(false);
  const domeinFout = email ? emailDomainError(email) : null;
  const issues = passwordIssues(password);
  const disabled = Boolean(domeinFout) || issues.length > 0 || password !== again || !akkoord || bezig;

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (disabled) return;
        const sb = getSupabase();
        if (!sb) return;
        setBezig(true);
        setFout("");
        setOk("");
        void sb.auth
          .signUp({
            email: email.trim(),
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/account`,
              data: { naam, domein, rol },
            },
          })
          .then(({ data, error }) => {
            setBezig(false);
            if (error) {
              setFout(mapAuthError(error.message));
              return;
            }
            if (data.session) setOk("Account aangemaakt. Je bent aangemeld.");
            else setOk("Account aangemaakt. Bevestig het adres via de mail van je organisatie en log daarna in.");
          });
      }}
    >
      <label className="field">
        Naam, zoals je die in een PV zet
        <input value={naam} onChange={(event) => setNaam(event.target.value)} required />
      </label>
      <Mail email={email} setEmail={setEmail} fout={domeinFout} />
      <label className="field">
        Wachtwoord
        <input type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
      </label>
      <Meter score={passwordScore(password)} />
      {issues.length ? <p className="text-xs text-muted">Nog nodig: {issues.join(", ")}.</p> : null}
      <label className="field">
        Herhaal wachtwoord
        <input type="password" autoComplete="new-password" value={again} onChange={(event) => setAgain(event.target.value)} required />
      </label>
      <label className="field">
        Standaarddomein
        <select value={domein} onChange={(event) => setDomein(event.target.value as DomeinId)}>
          {DOMEIN_INFO.filter((item) => item.id !== "algemeen").map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        Rol
        <select value={rol} onChange={(event) => setRol(event.target.value as Rol)}>
          {ROLLEN.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input className="mt-1" type="checkbox" checked={akkoord} onChange={(event) => setAkkoord(event.target.checked)} />
        Ik gebruik het adres van mijn organisatie of opleiding, geen gratis mailbox.
      </label>
      <p className="text-xs text-muted">
        <Link to="/privacy" className="underline">
          Privacy
        </Link>
        <span aria-hidden="true"> | </span>
        wat er met het account en de kluis gebeurt.
      </p>
      {fout ? <p className="accent-stop panel p-3 text-sm">{fout}</p> : null}
      {ok ? <p className="accent-ok panel p-3 text-sm">{ok}</p> : null}
      <button className="btn btn-brand" type="submit" disabled={disabled}>
        {bezig ? "Bezig…" : "Account aanmaken"}
      </button>
    </form>
  );
}

function ResetForm() {
  const [email, setEmail] = useState("");
  const [fout, setFout] = useState("");
  const [ok, setOk] = useState("");
  const [bezig, setBezig] = useState(false);
  const domeinFout = email ? emailDomainError(email) : null;

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        const blok = emailDomainError(email);
        if (blok) {
          setFout(blok);
          return;
        }
        const sb = getSupabase();
        if (!sb) return;
        setBezig(true);
        setFout("");
        setOk("");
        const redirectTo = `${window.location.origin}/#reset-wachtwoord`;
        void sb.auth.resetPasswordForEmail(email.trim(), { redirectTo }).then(({ error }) => {
          setBezig(false);
          if (error && !/user|not found|signups?/i.test(error.message)) {
            setFout(mapAuthError(error.message));
            return;
          }
          setOk("Als dit zakelijke adres bij ons bekend is, staat de herstelmail onderweg. Open de link op dit apparaat. Het scherm om een nieuw wachtwoord te kiezen opent dan vanzelf.");
        });
      }}
    >
      <Mail email={email} setEmail={setEmail} fout={domeinFout} />
      {fout ? <p className="accent-stop panel p-3 text-sm">{fout}</p> : null}
      {ok ? <p className="accent-ok panel p-3 text-sm">{ok}</p> : null}
      <button className="btn btn-brand" type="submit" disabled={bezig || Boolean(domeinFout)}>
        {bezig ? "Versturen…" : "Herstelmail sturen"}
      </button>
    </form>
  );
}

function Mail({ email, setEmail, fout }: { email: string; setEmail: (value: string) => void; fout: string | null }) {
  return (
    <label className="field">
      Zakelijk of schooladres
      <input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
      {fout ? <span className="text-xs font-medium text-stop">{fout}</span> : null}
    </label>
  );
}

function Profiel() {
  const { user } = useBoaAuth();
  const kluis = useKluis();
  const setDomein = usePrefs((state) => state.setDomein);
  const setRol = usePrefs((state) => state.setRol);
  const meta = (user?.user_metadata ?? {}) as { naam?: string; domein?: DomeinId; rol?: Rol };
  const [naam, setNaam] = useState(meta.naam ?? "");
  const [domein, setDomeinVeld] = useState<DomeinId>(meta.domein ?? "I");
  const [rol, setRolVeld] = useState<Rol>(meta.rol ?? "boa");
  const [password, setPassword] = useState("");
  const [again, setAgain] = useState("");
  const [melding, setMelding] = useState("");
  const [fout, setFout] = useState("");
  const [wis, setWis] = useState("");
  const issues = password ? passwordIssues(password) : [];

  useEffect(() => {
    setNaam(meta.naam ?? "");
    if (meta.domein) setDomeinVeld(meta.domein);
    if (meta.rol) setRolVeld(meta.rol);
  }, [meta.domein, meta.naam, meta.rol]);

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-5">
      <PageHead kicker="ACCOUNT" title="Profiel" lede={user?.email ?? ""} />
      <form
        className="grid gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          const sb = getSupabase();
          if (!sb) return;
          setFout("");
          setMelding("");
          void sb.auth.updateUser({ data: { naam, domein, rol } }).then(({ error }) => {
            if (error) {
              setFout(mapAuthError(error.message));
              return;
            }
            if (domein !== "algemeen") setDomein(domein);
            setRol(rol);
            setMelding("Profiel opgeslagen. Het filter staat op dit domein en deze rol.");
          });
        }}
      >
        <label className="field">
          Naam
          <input value={naam} onChange={(event) => setNaam(event.target.value)} />
        </label>
        <label className="field">
          Standaarddomein
          <select value={domein} onChange={(event) => setDomeinVeld(event.target.value as DomeinId)}>
            {DOMEIN_INFO.filter((item) => item.id !== "algemeen").map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Rol
          <select value={rol} onChange={(event) => setRolVeld(event.target.value as Rol)}>
            {ROLLEN.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <button className="btn btn-brand" type="submit">
          Profiel opslaan
        </button>
      </form>

      <form
        className="mt-6 grid gap-3 border-t border-line pt-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (issues.length || password !== again) {
            setFout(issues.length ? `Nog nodig: ${issues.join(", ")}.` : "De wachtwoorden zijn niet gelijk.");
            return;
          }
          const sb = getSupabase();
          if (!sb) return;
          setFout("");
          void sb.auth.updateUser({ password }).then(async ({ error }) => {
            if (error) {
              setFout(mapAuthError(error.message));
              return;
            }
            setPassword("");
            setAgain("");
            setMelding("Wachtwoord gewijzigd.");
            await kluis.logActie("Wachtwoord gewijzigd");
          });
        }}
      >
        <h2 className="font-semibold">Wachtwoord wijzigen</h2>
        <label className="field">
          Nieuw wachtwoord
          <input type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        <Meter score={passwordScore(password)} />
        <label className="field">
          Herhaal
          <input type="password" autoComplete="new-password" value={again} onChange={(event) => setAgain(event.target.value)} />
        </label>
        <button className="btn" type="submit" disabled={!password || issues.length > 0 || password !== again}>
          Wachtwoord opslaan
        </button>
      </form>

      <div className="mt-6 grid gap-3 border-t border-line pt-4">
        <h2 className="font-semibold">Gegevens</h2>
        <button type="button" className="btn" onClick={() => void kluis.exportAll()}>
          Versleutelde data ontsleuteld exporteren
        </button>
        <p className="text-xs text-muted">De export is leesbare tekst. Bewaar het bestand niet in een gedeelde map.</p>
        {kluis.audits.length ? (
          <ul className="text-sm">
            {kluis.audits.map((audit) => (
              <li key={audit.id} className="border-b border-line py-1">
                <span className="font-mono text-xs text-muted">{audit.updatedAt.slice(0, 16).replace("T", " ")}</span> {audit.actie}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="mt-6 grid gap-3 border-t border-line pt-4">
        <h2 className="font-semibold">Account verwijderen</h2>
        <p className="text-sm text-muted">Typ VERWIJDER om de kluis te wissen en het account te sluiten.</p>
        <input className="mast-select" value={wis} onChange={(event) => setWis(event.target.value)} />
        <button
          type="button"
          className="btn btn-stop"
          disabled={wis !== "VERWIJDER"}
          onClick={() => {
            const sb = getSupabase();
            if (!sb) return;
            void sb.rpc("delete_own_account").then(async ({ error }) => {
              kluis.wipeLocal();
              await sb.auth.signOut();
              setMelding(
                error
                  ? "De lokale kluis is gewist en je bent uitgelogd. Het account bij de aanmelddienst blijft staan als de verwijderfunctie niet antwoordt."
                  : "Account en kluis zijn verwijderd.",
              );
            });
          }}
        >
          Account verwijderen
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            const sb = getSupabase();
            void sb?.auth.signOut();
          }}
        >
          Uitloggen
        </button>
      </div>
      {fout ? <p className="accent-stop panel mt-3 p-3 text-sm">{fout}</p> : null}
      {melding ? <p className="panel mt-3 p-3 text-sm">{melding}</p> : null}
    </div>
  );
}
