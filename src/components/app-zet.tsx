import { useEffect, useState } from "react";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Venster = Window & { __boaInstall?: InstallEvent | null };

function bewaard(): InstallEvent | null {
  return (window as Venster).__boaInstall ?? null;
}

function iosToestel() {
  const ua = navigator.userAgent;
  const iPad = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return /iphone|ipad|ipod/i.test(ua) || iPad;
}

export function AppZet() {
  const [tonen, setTonen] = useState(false);
  const [klaar, setKlaar] = useState(false);
  const [ios, setIos] = useState(false);
  const [melding, setMelding] = useState<string | null>(null);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: minimal-ui)").matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    if (standalone) return;
    try {
      if (localStorage.getItem("boa-install") === "gezet") return;
      if (sessionStorage.getItem("boa-install") === "weg") return;
    } catch {
      /* privévenster */
    }

    const sync = () => {
      const heeft = Boolean(bewaard());
      setKlaar(heeft);
      if (heeft) setMelding(null);
    };

    setIos(iosToestel());
    setTonen(true);
    sync();
    window.addEventListener("boa-install-klaar", sync);
    const weg = () => setTonen(false);
    window.addEventListener("boa-install-weg", weg);
    return () => {
      window.removeEventListener("boa-install-klaar", sync);
      window.removeEventListener("boa-install-weg", weg);
    };
  }, []);

  if (!tonen) return null;

  function installeer() {
    const event = bewaard();
    if (!event) {
      setMelding(
        iosToestel()
          ? "Op iPhone of iPad: tik op het deel-icoon en kies Zet op beginscherm."
          : "Chrome gaf het venster nog niet vrij. Gebruik Installeren in de adresbalk, of ververs de pagina en tik hier opnieuw.",
      );
      return;
    }
    (window as Venster).__boaInstall = null;
    setKlaar(false);
    const gedaan = event.prompt();
    void gedaan
      .then(() => event.userChoice)
      .then((uit) => {
        if (uit.outcome === "accepted") {
          try {
            localStorage.setItem("boa-install", "gezet");
          } catch {
            /* ignore */
          }
          sessionStorage.setItem("boa-install", "weg");
          setTonen(false);
          return;
        }
        setMelding("Installeren is geannuleerd. Ververs de pagina om het opnieuw te proberen, of gebruik Installeren in de adresbalk.");
      })
      .catch(() => {
        setMelding("Dit venster kon het installatievenster niet openen. Gebruik Installeren in de adresbalk.");
      });
  }

  return (
    <aside className="panel no-print fixed bottom-20 left-1/2 z-50 flex w-[min(520px,calc(100%-1.5rem))] -translate-x-1/2 flex-wrap items-center gap-3 px-3 py-2.5">
      <img src="/boa-mark.png" alt="" className="size-9 shrink-0" />
      <div className="min-w-0">
        <strong className="block whitespace-nowrap text-sm font-semibold text-ink">BOA Portaal</strong>
        <span className="block whitespace-nowrap text-xs text-muted">Voor op straat en het bureau</span>
      </div>
      {ios && !klaar ? (
        <p className="min-w-0 flex-1 text-xs leading-snug text-muted">Tik op Delen, daarna op Zet op beginscherm.</p>
      ) : (
        <button type="button" className="btn btn-brand ml-auto min-h-10 shrink-0 px-3" onClick={installeer}>
          App installeren
        </button>
      )}
      <button
        type="button"
        className="btn min-h-10 shrink-0 px-3"
        onClick={() => {
          sessionStorage.setItem("boa-install", "weg");
          setTonen(false);
        }}
      >
        Niet nu
      </button>
      {melding ? <p className="basis-full text-xs leading-snug text-muted">{melding}</p> : null}
    </aside>
  );
}
