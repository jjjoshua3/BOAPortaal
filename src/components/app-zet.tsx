import { useEffect, useRef, useState } from "react";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function AppZet() {
  const [tonen, setTonen] = useState(false);
  const wacht = useRef<InstallEvent | null>(null);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (sessionStorage.getItem("boa-install") === "weg") return;
    setTonen(true);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
    function vang(event: Event) {
      event.preventDefault();
      wacht.current = event as InstallEvent;
    }
    window.addEventListener("beforeinstallprompt", vang);
    return () => window.removeEventListener("beforeinstallprompt", vang);
  }, []);

  if (!tonen) return null;

  return (
    <aside className="panel no-print fixed bottom-20 left-1/2 z-50 flex w-[min(520px,calc(100%-1.5rem))] -translate-x-1/2 flex-wrap items-center gap-3 px-3 py-2.5">
      <img src="/boa-mark.png" alt="" className="size-9 shrink-0" />
      <div className="min-w-0">
        <strong className="block whitespace-nowrap text-sm font-semibold text-ink">BOA Portaal</strong>
        <span className="block whitespace-nowrap text-xs text-muted">Voor op straat en het bureau</span>
      </div>
      <button
        type="button"
        className="btn btn-brand ml-auto min-h-10 shrink-0 px-3"
        onClick={() => {
          const event = wacht.current;
          if (!event) return;
          void event.prompt().then(() => event.userChoice).then((uit) => {
            wacht.current = null;
            if (uit.outcome === "accepted") {
              sessionStorage.setItem("boa-install", "weg");
              setTonen(false);
            }
          });
        }}
      >
        App installeren
      </button>
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
    </aside>
  );
}
