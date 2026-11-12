import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { FEITEN } from "@/lib/boa/feitcodes";
import { maskHardPii, scanPii } from "@/lib/boa/privacy";
import { CopyButton, PageHead, PiiPanel } from "@/components/bits";
import { useKluis } from "@/lib/kluis/provider";
import { useBoaAuth } from "@/lib/supabase/auth";

export const Route = createFileRoute("/kluis")({
  component: KluisPage,
});

function KluisPage() {
  const { user, ready } = useBoaAuth();
  const kluis = useKluis();
  const [tab, setTab] = useState<"notities" | "sjablonen" | "favorieten">("notities");
  const [titel, setTitel] = useState("");
  const [body, setBody] = useState("");
  const [editId, setEditId] = useState<string | undefined>(undefined);
  const [akkoord, setAkkoord] = useState(false);
  const [fout, setFout] = useState("");

  const opslagLabel =
    kluis.opslag === "pgcrypto"
      ? "Supabase + pgcrypto"
      : kluis.opslag === "lokaal"
        ? "Alleen deze browser, wel versleuteld"
        : kluis.opslag === "bezig"
          ? "Kluis openen…"
          : "Niet aangemeld";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5">
      <PageHead
        kicker="KLUIS | AES-GCM"
        title="Persoonlijke kluis"
        lede="Notities, favorieten en PV-sjablonen worden in de browser versleuteld voordat ze de database in gaan. Zonder sessie is de tekst daar niet leesbaar."
      />
      <p className="panel mb-4 p-3 text-sm">
        Opslag: {opslagLabel}. {kluis.melding}
      </p>
      {!ready ? <p className="text-sm text-muted">Account laden…</p> : null}
      {ready && !user ? (
        <p className="accent-amber panel mb-4 p-3 text-sm">
          Je bent niet aangemeld. Favorieten blijven op dit apparaat.{" "}
          <Link to="/account" className="font-semibold underline">
            Log in met een zakelijk adres
          </Link>{" "}
          om notities versleuteld te bewaren.
        </p>
      ) : null}
      <div className="mb-3 flex flex-wrap gap-2">
        <button type="button" className={tab === "notities" ? "btn btn-brand" : "btn"} onClick={() => setTab("notities")}>
          Notities
        </button>
        <button type="button" className={tab === "sjablonen" ? "btn btn-brand" : "btn"} onClick={() => setTab("sjablonen")}>
          PV-sjablonen
        </button>
        <button type="button" className={tab === "favorieten" ? "btn btn-brand" : "btn"} onClick={() => setTab("favorieten")}>
          Favorieten
        </button>
      </div>
      {tab === "notities" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              void kluis.saveNote({ id: editId, titel, body, zachtAkkoord: akkoord }).then((melding) => {
                setFout(melding ?? "");
                if (!melding) {
                  setTitel("");
                  setBody("");
                  setEditId(undefined);
                  setAkkoord(false);
                }
              });
            }}
          >
            <label className="field">
              Titel
              <input value={titel} onChange={(event) => setTitel(event.target.value)} />
            </label>
            <label className="field">
              Tekst
              <textarea value={body} onChange={(event) => setBody(event.target.value)} />
            </label>
            <PiiPanel text={`${titel}\n${body}`} akkoord={akkoord} onAkkoord={setAkkoord} />
            {scanPii(`${titel}\n${body}`).hard.length ? (
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setTitel(maskHardPii(titel));
                  setBody(maskHardPii(body));
                }}
              >
                Maskeer geblokkeerde gegevens
              </button>
            ) : null}
            {fout ? <p className="accent-stop panel p-3 text-sm">{fout}</p> : null}
            <button className="btn btn-brand" type="submit" disabled={!user || scanPii(`${titel}\n${body}`).hard.length > 0}>
              {editId ? "Wijziging opslaan" : "Notitie opslaan"}
            </button>
          </form>
          <ul className="grid gap-2">
            {kluis.notes.length === 0 ? <li className="text-sm text-muted">Nog geen notities.</li> : null}
            {kluis.notes.map((note) => (
              <li key={note.id} className="panel p-3">
                <h2 className="font-semibold">{note.titel}</h2>
                <p className="mt-1 whitespace-pre-wrap text-sm">{note.body}</p>
                <p className="mt-2 font-mono text-xs text-muted">{note.updatedAt.slice(0, 16).replace("T", " ")}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      setEditId(note.id);
                      setTitel(note.titel);
                      setBody(note.body);
                    }}
                  >
                    Wijzig
                  </button>
                  <button type="button" className="btn" onClick={() => void kluis.deleteNote(note.id)}>
                    Verwijder
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {tab === "sjablonen" ? (
        <ul className="grid gap-2">
          {kluis.sjablonen.length === 0 ? <li className="text-sm text-muted">Nog geen PV-sjabloon. Bewaar er een vanuit de PV-bouwer.</li> : null}
          {kluis.sjablonen.map((item) => (
            <li key={item.id} className="panel p-3">
              <h2 className="font-semibold">{item.titel}</h2>
              <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap text-sm">{item.body}</pre>
              <div className="mt-2 flex gap-2">
                <CopyButton text={item.body} label="Kopieer" />
                <button type="button" className="btn" onClick={() => void kluis.deleteSjabloon(item.id)}>
                  Verwijder
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      {tab === "favorieten" ? (
        <ul className="grid gap-2">
          {kluis.favorieten.length === 0 ? <li className="text-sm text-muted">Nog geen favorieten. Ster een feitcode.</li> : null}
          {kluis.favorieten.map((id) => {
            const feit = FEITEN.find((item) => item.id === id);
            if (!feit) return null;
            return (
              <li key={id} className="panel flex flex-wrap items-center justify-between gap-2 p-3">
                <div>
                  <p className="code text-sm">{feit.code}</p>
                  <p className="font-semibold">{feit.titel}</p>
                </div>
                <button type="button" className="btn" onClick={() => void kluis.toggleFavoriet(id)}>
                  Verwijder
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
