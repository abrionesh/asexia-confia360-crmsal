import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { AsexiAMark } from "@/components/brand/mark";
import { Button } from "@/components/ui/button";
import { openPortal, patientReply, patientSign } from "@/lib/api/portal.functions";

type PortalView = Awaited<ReturnType<typeof openPortal>>;

export function PortalPage({ token }: { token: string }) {
  const [view, setView] = useState<PortalView | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [signature, setSignature] = useState("");

  async function load() {
    const next = await openPortal({ data: { token } });
    setView(next);
  }

  useEffect(() => {
    let alive = true;
    void openPortal({ data: { token } }).then((next) => {
      if (alive) setView(next);
    });
    return () => {
      alive = false;
    };
  }, [token]);

  async function reply(answer: "confirmada" | "no-puede") {
    setBusy(true);
    try {
      const result = await patientReply({ data: { token, answer } });
      toast.success(result.message);
      await load();
    } catch {
      toast.error("No se ha podido enviar la respuesta.");
    } finally {
      setBusy(false);
    }
  }

  async function sign() {
    if (!signature) {
      toast.error("Firme en el recuadro.");
      return;
    }
    setBusy(true);
    try {
      const result = await patientSign({ data: { token, signature } });
      if (!result.ok) toast.error(result.message);
      else toast.success(result.message);
      await load();
    } catch {
      toast.error("No se ha podido guardar la firma.");
    } finally {
      setBusy(false);
    }
  }

  if (view === undefined) {
    return <main className="grid min-h-dvh place-items-center bg-bg text-sm text-ink-muted">Abriendo su cita…</main>;
  }
  if (!view) {
    return (
      <main className="grid min-h-dvh place-items-center bg-bg px-6 text-center text-ink">
        <p className="max-w-sm text-sm text-ink-muted">Este enlace no corresponde a ninguna ficha.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-4 bg-bg px-4 py-8 text-ink">
      <AsexiAMark className="size-8" />
      <p className="label-kicker">{view.clinicName}</p>
      <h1 className="font-display text-3xl font-medium tracking-tight">Hola, {view.firstName}</h1>
      <section className="rounded-xl bg-surface p-4 shadow-border">
        <p className="label-kicker">Su próxima cita</p>
        {view.visit ? (
          <>
            <h2 className="mt-1 font-display text-2xl font-medium">{view.visit.activityName}</h2>
            <p className="mt-2 text-sm text-ink-muted">
              {format(new Date(view.visit.at), "EEEE d MMMM · HH:mm", { locale: es })}
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              {view.visit.professional} · {view.visit.roomName}
            </p>
            <p className="mt-2 text-sm text-ink">
              {view.visit.confirmation === "confirmada"
                ? "Confirmada."
                : view.visit.confirmation === "no-puede"
                  ? "Nos dijo que no puede."
                  : "Aún sin confirmar."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button disabled={busy} onClick={() => void reply("confirmada")}>
                Confirmo
              </Button>
              <Button variant="outline" disabled={busy} onClick={() => void reply("no-puede")}>
                No puedo
              </Button>
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-ink-muted">No tiene una cita pendiente.</p>
        )}
      </section>
      <section className="rounded-xl bg-surface p-4 shadow-border">
        <p className="label-kicker">Consentimiento</p>
        <h2 className="mt-1 font-display text-xl font-medium">Firma en este móvil</h2>
        {view.consentSigned ? (
          <p className="mt-2 text-sm text-ink-muted">Ya está firmado. La clínica lo ve en su ficha.</p>
        ) : (
          <>
            <p className="mt-2 text-sm text-ink-muted">
              Firme para autorizar el tratamiento. Sin esta firma no se programa quirófano.
            </p>
            <SignaturePad onChange={setSignature} />
            <Button className="mt-3" disabled={busy} onClick={() => void sign()}>
              Enviar firma
            </Button>
          </>
        )}
      </section>
    </main>
  );
}

function SignaturePad({ onChange }: { onChange: (value: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#fffdf8";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#1a1612";
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    let drawing = false;
    const point = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((event.clientX - rect.left) * canvas.width) / rect.width,
        y: ((event.clientY - rect.top) * canvas.height) / rect.height,
      };
    };
    const down = (event: PointerEvent) => {
      drawing = true;
      canvas.setPointerCapture(event.pointerId);
      const next = point(event);
      ctx.beginPath();
      ctx.moveTo(next.x, next.y);
    };
    const move = (event: PointerEvent) => {
      if (!drawing) return;
      const next = point(event);
      ctx.lineTo(next.x, next.y);
      ctx.stroke();
    };
    const up = () => {
      if (!drawing) return;
      drawing = false;
      onChangeRef.current(canvas.toDataURL("image/png"));
    };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={560}
      height={220}
      className="mt-3 h-28 w-full touch-none rounded-md bg-[#fffdf8] shadow-border"
      aria-label="Zona de firma"
    />
  );
}
