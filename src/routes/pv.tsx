import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { FEITEN } from "@/lib/boa/feitcodes";
import { DOMEIN_INFO, domeinLabel, pastFilter, type DomeinId } from "@/lib/boa/meta";
import { bouwPv, leegPv, pvWaarschuwingen, stempelNu, type PvInvoer } from "@/lib/boa/pv";
import { usePrefs } from "@/lib/boa/prefs";
import { scanPii } from "@/lib/boa/privacy";
import { CopyButton, PageHead, PiiPanel } from "@/components/bits";
import { FeitVeld } from "@/components/feit-veld";
import { useKluis } from "@/lib/kluis/provider";
import { useBoaAuth } from "@/lib/supabase/auth";

export const Route = createFileRoute("/pv")({
  component: PvPage,
});

function PvPage() {
  const filter = usePrefs((state) => state.domein);
  const [form, setForm] = useState<PvInvoer>(() => leegPv("I"));
  const [akkoord, setAkkoord] = useState(false);
  const [melding, setMelding] = useState("");
  const { saveSjabloon } = useKluis();
  const { user } = useBoaAuth();
  const feiten = FEITEN.filter((feit) => pastFilter(feit.domeinen, filter));
  const tekst = useMemo(() => bouwPv(form), [form]);
  const scan = scanPii(tekst);
  const blokkade = scan.hard.length > 0 || (scan.zacht.length > 0 && !akkoord);
  const waarschuwingen = pvWaarschuwingen(form);

  useEffect(() => {
    const stempel = stempelNu();
    setForm((huidig) => ({
      ...huidig,
      datum: stempel.datum,
      tijd: stempel.tijd,
      domein: filter === "alle" ? huidig.domein : filter,
      verbalisant: user?.user_metadata?.naam ? String(user.user_metadata.naam) : huidig.verbalisant,
    }));
  }, [filter, user]);

  useEffect(() => {
    const id = sessionStorage.getItem("boa-pv-feit");
    if (!id) return;
    sessionStorage.removeItem("boa-pv-feit");
    const gekozen = FEITEN.find((item) => item.id === id);
    if (!gekozen) return;
    setForm((huidig) => ({
      ...huidig,
      feit: gekozen,
      waarneming: huidig.waarneming.trim() ? huidig.waarneming : gekozen.pv,
    }));
  }, []);

  function set<K extends keyof PvInvoer>(key: K, value: PvInvoer[K]) {
    setForm((huidig) => ({ ...huidig, [key]: value }));
  }

  function plak(zin: string) {
    setForm((huidig) => ({
      ...huidig,
      waarneming: huidig.waarneming.trim() ? `${huidig.waarneming.trimEnd()} ${zin}` : zin,
    }));
  }

  function aanhef() {
    setForm((huidig) => {
      const zin = `Ik, ${huidig.verbalisant.trim() || "[NAAM VERBALISANT]"}, buitengewoon opsporingsambtenaar, ${domeinLabel(huidig.domein)}, doe deze bevinding op uit eigen waarneming.`;
      if (huidig.aanleiding.trim()) return huidig;
      return { ...huidig, aanleiding: zin };
    });
  }

  const wChecklist = [
    ["Wie", Boolean(form.verbalisant.trim() && form.betrokkene.trim())],
    ["Wat", Boolean(form.feit)],
    ["Waar", Boolean(form.plaats.trim())],
    ["Wanneer", Boolean(form.datum && form.tijd)],
    ["Waarmee", Boolean(form.waarmee.trim())],
    ["Waarom", Boolean(form.aanleiding.trim())],
    ["Hoe", Boolean(form.waarneming.trim())],
  ] as const;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5">
      <PageHead
        kicker="MODULE 4 | PV-BOUWER"
        title="Proces-verbaal op de zeven W's"
        lede="Wie, Wat, Waar, Wanneer, Waarmee, Waarom en Hoe. Geen persoonsgegevens. Het concept kopieer je naar BRS, MEOS of CityControl."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <form className="grid gap-3" onSubmit={(event) => event.preventDefault()}>
          <fieldset className="panel grid gap-3 p-3">
            <legend className="px-1 text-xs font-semibold tracking-wide">W1 | Wie</legend>
            <label className="field">
              Naam verbalisant
              <input value={form.verbalisant} onChange={(event) => set("verbalisant", event.target.value)} />
            </label>
            <label className="field">
              Betrokkene | placeholder, geen echte naam
              <input value={form.betrokkene} onChange={(event) => set("betrokkene", event.target.value)} />
            </label>
            <label className="field">
              Domein
              <select value={form.domein} onChange={(event) => set("domein", event.target.value as DomeinId)}>
                {DOMEIN_INFO.filter((item) => item.id !== "algemeen").map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </fieldset>
          <fieldset className="panel grid gap-3 p-3">
            <legend className="px-1 text-xs font-semibold tracking-wide">W2 | Wat</legend>
            <label className="field">
              Soort
              <select value={form.soort} onChange={(event) => set("soort", event.target.value as PvInvoer["soort"])}>
                <option value="bevindingen">Proces-verbaal van bevindingen</option>
                <option value="aanhouding">Proces-verbaal van aanhouding</option>
              </select>
            </label>
            <FeitVeld feiten={feiten} feit={form.feit} onKies={(feit) => set("feit", feit)} />
          </fieldset>
          <fieldset className="panel grid gap-3 p-3">
            <legend className="px-1 text-xs font-semibold tracking-wide">W3 | Waar</legend>
            <label className="field">
              Plaats
              <input value={form.plaats} onChange={(event) => set("plaats", event.target.value)} placeholder="Straat of station, geen huisadres van een burger" />
            </label>
          </fieldset>
          <fieldset className="panel grid gap-3 p-3">
            <legend className="px-1 text-xs font-semibold tracking-wide">W4 | Wanneer</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="field">
                Datum
                <input type="date" value={form.datum} onChange={(event) => set("datum", event.target.value)} />
              </label>
              <label className="field">
                Tijd
                <input type="time" value={form.tijd} onChange={(event) => set("tijd", event.target.value)} />
              </label>
            </div>
          </fieldset>
          <fieldset className="panel grid gap-3 p-3">
            <legend className="px-1 text-xs font-semibold tracking-wide">W5 | Waarmee</legend>
            <label className="field">
              Voorwerp, voertuig of middel
              <textarea value={form.waarmee} onChange={(event) => set("waarmee", event.target.value)} placeholder="Bijvoorbeeld een aangebroken blik, een fiets, bord E1" />
            </label>
          </fieldset>
          <fieldset className="panel grid gap-3 p-3">
            <legend className="px-1 text-xs font-semibold tracking-wide">W6 | Waarom</legend>
            <button type="button" className="btn w-fit" onClick={aanhef}>
              Vul ambtseed-aanhef
            </button>
            <label className="field">
              Aanleiding
              <textarea value={form.aanleiding} onChange={(event) => set("aanleiding", event.target.value)} placeholder="Melding, surveillance of controle. Geen oordeel." />
            </label>
          </fieldset>
          <fieldset className="panel grid gap-3 p-3">
            <legend className="px-1 text-xs font-semibold tracking-wide">W7 | Hoe</legend>
            <p className="text-xs text-muted">Feitelijk wat je waarnam. Geen aanname over opzet of karakter.</p>
            <div className="flex flex-wrap gap-2">
              {[
                ["Ik zag dat", "Ik zag dat "],
                ["Ik hoorde dat", "Ik hoorde dat "],
                ["Ik rook dat", "Ik rook dat "],
                ["Ik stelde vast dat", "Ik stelde vast dat "],
              ].map(([label, zin]) => (
                <button key={label} type="button" className="btn" onClick={() => plak(zin)}>
                  {label}
                </button>
              ))}
              <button type="button" className="btn" onClick={() => plak("De identiteit is vastgesteld via een ter inzage getoond document (paspoort, identiteitskaart of rijbewijs).")}>
                ID vastgesteld
              </button>
              <button type="button" className="btn" onClick={() => set("cautie", "gegeven")}>
                Cautie gegeven
              </button>
              <button type="button" className="btn" onClick={() => plak("Na cautie is een verklaring opgenomen.")}>
                Verklaring opgenomen
              </button>
            </div>
            <label className="field">
              Waarneming
              <textarea value={form.waarneming} onChange={(event) => set("waarneming", event.target.value)} placeholder="Wat je zag, in de volgorde waarin het gebeurde" />
            </label>
            <label className="field">
              Hoedanigheid | bevoegdheid
              <select value={form.hoedanigheid} onChange={(event) => set("hoedanigheid", event.target.value as PvInvoer["hoedanigheid"])}>
                <option value="opsporing">Opsporingsambtenaar</option>
                <option value="toezicht">Toezichthouder</option>
              </select>
            </label>
            <label className="field">
              Cautie
              <select value={form.cautie} onChange={(event) => set("cautie", event.target.value as PvInvoer["cautie"])}>
                <option value="gegeven">Gegeven</option>
                <option value="nvt">Niet van toepassing, alleen personalia</option>
                <option value="niet">Niet gegeven</option>
              </select>
            </label>
            <label className="field">
              Verklaring van {form.betrokkene.trim() || "[VERDACHTE]"}
              <textarea value={form.verklaring} onChange={(event) => set("verklaring", event.target.value)} placeholder="Alleen met placeholder, geen echte naam" />
            </label>
            <label className="field">
              Handboeien
              <select value={form.boeien} onChange={(event) => set("boeien", event.target.value as PvInvoer["boeien"])}>
                <option value="nee">Niet gebruikt</option>
                <option value="vlucht">Ja, vluchtgevaar</option>
                <option value="gevaar">Ja, gevaar voor de veiligheid</option>
              </select>
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={form.fouillering} onChange={(event) => set("fouillering", event.target.checked)} />
              Veiligheidsfouillering gedaan
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={form.overdracht} onChange={(event) => set("overdracht", event.target.checked)} />
              Overgedragen aan de politie
            </label>
            <label className="field">
              Afloop
              <textarea value={form.afloop} onChange={(event) => set("afloop", event.target.value)} />
            </label>
          </fieldset>
        </form>
        <div className="grid gap-3">
          {waarschuwingen.map((regel) => (
            <p key={regel} className="accent-amber panel p-3 text-sm">
              {regel}
            </p>
          ))}
          <PiiPanel text={tekst} akkoord={akkoord} onAkkoord={setAkkoord} />
          <ul className="panel grid grid-cols-2 gap-1 p-3 text-sm sm:grid-cols-4">
            {wChecklist.map(([label, ok]) => (
              <li key={label} className="font-mono">
                <span className={ok ? "text-[#059669]" : "text-muted"}>{ok ? "●" : "○"}</span> {label}
              </li>
            ))}
          </ul>
          <pre className="panel max-h-[40rem] overflow-auto whitespace-pre-wrap p-3 font-mono text-sm">{tekst}</pre>
          <div className="flex flex-wrap gap-2">
            <CopyButton text={tekst} label="Kopieer concept" disabled={blokkade} />
            <button
              type="button"
              className="btn btn-brand"
              disabled={blokkade}
              onClick={() => {
                void saveSjabloon(`${form.feit?.code ?? "PV"} ${form.datum}`, tekst).then((fout) => {
                  setMelding(fout ?? "Versleuteld opgeslagen in de kluis.");
                });
              }}
            >
              Versleuteld opslaan
            </button>
          </div>
          {melding ? <p className="text-sm">{melding}</p> : null}
        </div>
      </div>
    </div>
  );
}
