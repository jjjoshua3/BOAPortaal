import { useState, type ReactNode } from "react";
import { scanPii } from "@/lib/boa/privacy";

export function PageHead({ kicker, title, lede }: { kicker: string; title: string; lede?: string }) {
  return (
    <header className="mb-5 border-b border-line pb-4">
      <p className="font-mono text-xs tracking-wide text-muted">{kicker}</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
      {lede ? <p className="mt-2 max-w-3xl text-sm text-muted">{lede}</p> : null}
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
      <p className="accent-amber panel p-3 text-sm">
        Geen persoonsgegevens van burgers in dit portaal. Gebruik de placeholders [VERDACHTE], [GETUIGE] en [ADRES]. Een BSN hoort in het bronsysteem, niet hier.
      </p>
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
