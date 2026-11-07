import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AudioLines, Mail, MessageCircle, Sparkles } from "lucide-react";
import type { TimelineEvent, VoiceTurn } from "@/lib/api";
import { cn } from "@/lib/utils";

export function Timeline({ events }: { events: TimelineEvent[] }) {
  const ordered = [...events].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
  );

  return (
    <section className="rounded-xl bg-surface p-5 shadow-border">
      <header className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="label-kicker">Actividad unificada</p>
          <h2 className="font-display text-xl font-medium tracking-tight text-ink">
            Historial
          </h2>
        </div>
        <p className="text-xs text-ink-subtle">{ordered.length} eventos</p>
      </header>

      <ol className="relative space-y-4 before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-px before:bg-border">
        {ordered.map((event, index) => (
          <li
            key={event.id}
            className="enter-stagger relative pl-8"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <span
              className={cn(
                "absolute top-1.5 left-0 flex size-[22px] items-center justify-center rounded-full",
                event.channel === "whatsapp" && "bg-channel-wa/15 text-channel-wa",
                event.channel === "email" && "bg-accent-soft text-accent",
                event.channel === "voice" && "bg-channel-voice/15 text-channel-voice",
                event.channel === "system" && "bg-accent-soft text-accent",
              )}
            >
              {event.channel === "whatsapp" ? (
                <MessageCircle className="size-3" />
              ) : event.channel === "email" ? (
                <Mail className="size-3" />
              ) : event.channel === "voice" ? (
                <AudioLines className="size-3" />
              ) : (
                <Sparkles className="size-3" />
              )}
            </span>
            <EventCard event={event} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function EventCard({ event }: { event: TimelineEvent }) {
  const stamp = format(new Date(event.at), "d MMM · HH:mm", { locale: es });

  if (event.channel === "whatsapp") {
    const inbound = event.direction === "inbound";
    return (
      <div>
        <Meta
          label={inbound ? "WhatsApp · paciente" : `WhatsApp · ${event.agent ?? "AsexiA"}`}
          stamp={stamp}
        />
        <div
          className={cn(
            "mt-2 max-w-prose rounded-lg px-3.5 py-2.5 text-sm leading-relaxed",
            inbound
              ? "rounded-tl-xs bg-bg text-ink"
              : "rounded-tr-xs bg-accent-soft text-accent",
          )}
        >
          {event.body}
        </div>
      </div>
    );
  }

  if (event.channel === "voice") {
    const minutes = event.durationSec
      ? `${Math.floor(event.durationSec / 60)} min ${String(event.durationSec % 60).padStart(2, "0")} s`
      : null;
    return (
      <div className="rounded-lg bg-bg p-3.5">
        <Meta
          label={`${event.title}${event.agent ? ` · ${event.agent}` : ""}`}
          stamp={stamp}
        />
        <div className="mt-2 flex items-end gap-0.5" aria-hidden="true">
          {WAVE.map((height, index) => (
            <span
              key={index}
              className="w-0.5 rounded-full bg-channel-voice/50"
              style={{ height }}
            />
          ))}
          {minutes ? (
            <span className="ml-2 text-xs tabular-nums text-ink-subtle">{minutes}</span>
          ) : null}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">{event.body}</p>
        {event.transcript ? <Transcript turns={event.transcript} /> : null}
      </div>
    );
  }

  return (
    <div>
      <Meta label={event.title} stamp={stamp} />
      <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{event.body}</p>
    </div>
  );
}

function Meta({ label, stamp }: { label: string; stamp: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <p className="text-xs font-medium text-ink">{label}</p>
      <p className="text-2xs text-ink-subtle">{stamp}</p>
    </div>
  );
}

function Transcript({ turns }: { turns: VoiceTurn[] }) {
  return (
    <details className="mt-3">
      <summary className="cursor-pointer text-xs font-medium text-accent">
        Ver transcripción
      </summary>
      <ul className="mt-2 space-y-2 border-t border-border pt-2">
        {turns.map((turn, index) => (
          <li key={index} className="text-sm leading-relaxed">
            <span className="font-medium text-ink">
              {turn.speaker === "agent" ? "Agente" : "Paciente"}
            </span>
            <span className="text-ink-muted"> · {turn.text}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}

const WAVE = [
  "6px",
  "10px",
  "14px",
  "8px",
  "16px",
  "11px",
  "18px",
  "9px",
  "13px",
  "7px",
  "15px",
  "10px",
  "12px",
  "8px",
  "14px",
  "6px",
  "11px",
  "16px",
  "9px",
  "12px",
];
