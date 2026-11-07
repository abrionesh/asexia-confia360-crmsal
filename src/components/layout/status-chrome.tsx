import { useEffect, useState } from "react";
import { Download, WifiOff } from "lucide-react";
import { flushOutbox, pendingMoves } from "@/lib/api/client";
import { isIos, isStandalone, registerServiceWorker } from "@/lib/pwa";
import { Button } from "@/components/ui/button";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export function StatusChrome() {
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    registerServiceWorker();
    setOnline(navigator.onLine);
    setPending(pendingMoves());
    setShowIosHint(isIos() && !isStandalone());

    const onOnline = () => {
      setOnline(true);
      const flushed = flushOutbox();
      setPending(0);
      if (flushed > 0) {
        void import("sonner").then(({ toast }) =>
          toast.success(`${flushed} cambio${flushed === 1 ? "" : "s"} listo${flushed === 1 ? "" : "s"} para el API`),
        );
      }
    };
    const onOffline = () => {
      setOnline(false);
      setPending(pendingMoves());
    };
    const onInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallEvent);
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("beforeinstallprompt", onInstall);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("beforeinstallprompt", onInstall);
    };
  }, []);

  if (online && !installEvent && !showIosHint) return null;

  return (
    <div>
      {!online ? (
        <div className="flex items-center gap-2 bg-ink px-4 py-2 text-accent-fg">
          <WifiOff className="size-4 shrink-0" />
          <p className="text-xs leading-snug">
            Sin red. Se muestra la última copia
            {pending > 0 ? ` · ${pending} cambio${pending === 1 ? "" : "s"} pendiente${pending === 1 ? "" : "s"}` : ""}.
          </p>
        </div>
      ) : null}
      {installEvent ? (
        <div className="flex items-center justify-between gap-3 border-b border-border bg-accent-soft px-4 py-2">
          <p className="text-xs text-accent">Instale AsexiA en la pantalla de inicio.</p>
          <Button
            size="sm"
            onClick={() => {
              void installEvent.prompt();
              setInstallEvent(null);
            }}
          >
            <Download className="size-4" />
            Instalar
          </Button>
        </div>
      ) : null}
      {showIosHint && online ? (
        <div className="flex items-center justify-between gap-3 border-b border-border bg-bg-elevated px-4 py-2">
          <p className="text-xs text-ink-muted">
            En iPhone: Compartir y luego Añadir a pantalla de inicio.
          </p>
          <button
            type="button"
            className="text-xs font-medium text-accent"
            onClick={() => setShowIosHint(false)}
          >
            Entendido
          </button>
        </div>
      ) : null}
    </div>
  );
}
