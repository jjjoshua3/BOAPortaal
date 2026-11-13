import { useState, type ReactNode } from "react";
import { scanPii } from "@/lib/boa/privacy";
import { FILTERS, ROLLEN, type DomeinFilter, type Rol } from "@/lib/boa/meta";
import { usePrefs } from "@/lib/boa/prefs";

export function PageHead({ kicker, title, lede }: { kicker: string; title: string; lede?: string }) {
  const rol = usePrefs((state) => state.rol);
  const domein = usePrefs((state) => state.domein);
  const setRol = usePrefs((state) => state.setRol);
  const setDomein = usePrefs((state) => state.setDomein);
  return (
    <header className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
      <div className="min-w-0">
        <p className="text-xs text-muted">Overzicht / {title}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
        {lede ? <p className="mt-2 max-w-3xl text-sm text-muted">{lede}</p> : null}
        <p className="sr-only">{kicker}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <label className="grid gap-1 text-xs font-semibold text-muted">
          Rol
          <select className="min-h-10 border border-line bg-panel px-2 text-sm text-ink" value={rol} onChange={(event) => setRol(event.target.value as Rol)}>
            {ROLLEN.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-semibold text-muted">
          Domein
          <select className="min-h-10 max-w-[16rem] border border-line bg-panel px-2 text-sm text-ink" value={domein} onChange={(event) => setDomein(event.target.value as DomeinFilter)}>
            {FILTERS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </header>
  );
}

export function CopyButton({ text, label = "Kopieer", disabled = false }: { text: string; label?: string; disabled?: boolean }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="btn"
      disabled={disabled || !text}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          const area = document.createElement("textarea");
          area.value = text;
          document.body.appendChild(area);
          area.select();
          document.execCommand("copy");
          area.remove();
        }
        setDone(true);
        window.setTimeout(() => setDone(false), 1500);
      }}
    >
      {done ? "Gekopieerd" : label}
    </button>
  );
}

export function PiiPanel({
  text,
  akkoord,
  onAkkoord,
}: {
  text: string;
  akkoord: boolean;
  onAkkoord: (value: boolean) => void;
}) {
  const scan = scanPii(text);
  const hard = [...new Set(scan.hard.map((hit) => hit.label))];
  const zacht = [...new Set(scan.zacht.map((hit) => hit.label))];
  return (
    <div className="grid gap-2">
      {hard.length ? <p className="accent-stop panel p-3 text-sm">Geblokkeerd: {hard.join(", ")}.</p> : null}
      {zacht.length ? (
        <label className="panel flex items-start gap-2 p-3 text-sm">
          <input className="mt-1" type="checkbox" checked={akkoord} onChange={(event) => onAkkoord(event.target.checked)} />
          <span>Er staat iets wat op een naam lijkt. Ik heb gecontroleerd dat dit geen burger betreft, of ik heb een placeholder gebruikt.</span>
        </label>
      ) : null}
    </div>
  );
}

export function Frame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`panel p-3 ${className}`}>{children}</section>;
}
