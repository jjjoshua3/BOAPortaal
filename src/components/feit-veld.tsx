import { useMemo, useState } from "react";
import { zoekFeiten, type Feit } from "@/lib/boa/feitcodes";

export function FeitVeld({
  feiten,
  feit,
  onKies,
}: {
  feiten: Feit[];
  feit: Feit | null;
  onKies: (feit: Feit | null) => void;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const hits = useMemo(() => {
    const gevonden = q.trim() ? zoekFeiten(q, feiten) : feiten;
    return gevonden.slice(0, 8);
  }, [feiten, q]);
  const toon = open ? q : feit ? `${feit.code} | ${feit.titel}` : "";

  return (
    <div className="relative">
      <label className="field">
        Feit | typ een code, artikel of situatie
        <input
          value={toon}
          autoComplete="off"
          placeholder="bijvoorbeeld 447e, zwartrijden, K 055"
          onFocus={() => {
            setOpen(true);
            setQ(feit ? `${feit.code} ${feit.titel}` : q);
          }}
          onChange={(event) => {
            setQ(event.target.value);
            setOpen(true);
            if (feit) onKies(null);
          }}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 160);
          }}
        />
      </label>
      {open ? (
        <ul className="panel absolute z-20 mt-1 max-h-64 w-full overflow-auto" role="listbox">
          {hits.length === 0 ? (
            <li className="p-2 text-sm text-muted">Geen feit in dit domein.</li>
          ) : (
            hits.map((hit) => (
              <li key={hit.id}>
                <button
                  type="button"
                  className="flex min-h-11 w-full items-start gap-2 px-2 py-2 text-left text-sm hover:bg-inset"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onKies(hit);
                    setQ("");
                    setOpen(false);
                  }}
                >
                  <span className="code shrink-0">{hit.code}</span>
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
