import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Mic, Square, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { api, type Patient, type PipelineStage, type TimelineEvent } from "@/lib/api";
import { stageMeta } from "@/lib/api/types";
import { useUiStore } from "@/lib/store/ui";
import {
  VOICE_HELP,
  canListen,
  canSpeak,
  parseVoice,
  patientScript,
  pipelineScript,
  speak,
  startListening,
  stopSpeaking,
  type VoiceAction,
} from "@/lib/voice";
import { cn } from "@/lib/utils";

export function VoiceBar() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const queryClient = useQueryClient();
  const setSearch = useUiStore((state) => state.setSearch);
  const setCopilotOpen = useUiStore((state) => state.setCopilotOpen);
  const pushMessage = useUiStore((state) => state.pushMessage);
  const [listening, setListening] = useState(false);
  const [partial, setPartial] = useState("");
  const [speaking, setSpeaking] = useState(false);

  function patients() {
    return queryClient.getQueryData<Patient[]>(["pipeline"]) ?? [];
  }

  async function say(text: string) {
    if (!canSpeak()) {
      toast.error("Este navegador no puede leer en voz alta");
      return;
    }
    setSpeaking(true);
    speak(text);
    window.setTimeout(() => setSpeaking(false), Math.min(12000, 80 * text.length));
  }

  async function run(action: VoiceAction) {
    if (action.type === "stop") {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    if (action.type === "help") {
      await say(VOICE_HELP);
      return;
    }
    if (action.type === "speak") {
      await say(action.text);
      return;
    }
    if (action.type === "search") {
      setSearch(action.query);
      void navigate({ to: "/" });
      await say(`Busco ${action.query}.`);
      return;
    }
    if (action.type === "navigate") {
      void navigate({ to: "/pacientes/$id", params: { id: action.id } });
      await say(`Abro la ficha de ${action.name}.`);
      return;
    }
    if (action.type === "close-copilot") {
      setCopilotOpen(false);
      return;
    }
    if (action.type === "move") {
      await moveByVoice(action.id, action.name, action.stage);
      return;
    }
    setCopilotOpen(true);
    if (action.prompt) {
      pushMessage({
        id: `user-${Date.now()}`,
        role: "user",
        content: action.prompt,
        at: new Date().toISOString(),
      });
      const reply = await api.askCopilot(action.prompt, patients());
      pushMessage(reply);
      await say(reply.content);
    } else {
      await say("Copiloto abierto. Diga la pregunta.");
    }
  }

  async function moveByVoice(id: string, name: string, stage: PipelineStage) {
    await api.movePatient(id, stage);
    queryClient.setQueryData<Patient[]>(["pipeline"], (current) =>
      (current ?? []).map((patient) => (patient.id === id ? { ...patient, stage } : patient)),
    );
    await say(`${name} movida a ${stageLabel(stage)}.`);
  }

  async function readScreen() {
    const list = patients();
    const match = pathname.match(/^\/pacientes\/([^/]+)/);
    if (match) {
      const id = decodeURIComponent(match[1] ?? "");
      const patient =
        queryClient.getQueryData<Patient | null>(["patient", id]) ??
        list.find((item) => item.id === id);
      if (!patient) {
        await say("Todavía no tengo la ficha cargada.");
        return;
      }
      const events = queryClient.getQueryData<TimelineEvent[]>(["timeline", id]) ?? [];
      await say(patientScript(patient, events));
      return;
    }
    await say(list.length ? pipelineScript(list) : "El tablero aún se está cargando.");
  }

  function listen() {
    if (!canListen()) {
      toast.error("Este navegador no admite dictado. En el móvil, use Chrome o Safari.");
      return;
    }
    stopSpeaking();
    setSpeaking(false);
    setPartial("");
    const recognition = startListening({
      onPartial: setPartial,
      onFinal: (text) => {
        setPartial(text);
        void run(parseVoice(text, patients()));
      },
      onEnd: () => setListening(false),
      onError: (message) => {
        setListening(false);
        toast.error(message === "permiso" ? "Permita el micrófono para dar órdenes" : "No se pudo oír");
      },
    });
    if (!recognition) return;
    setListening(true);
  }

  return (
    <div className="voice-dock fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2 pr-32">
        <button
          type="button"
          onClick={() => {
            if (speaking) {
              stopSpeaking();
              setSpeaking(false);
              return;
            }
            void readScreen();
          }}
          className="flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-accent-soft text-sm font-medium text-accent"
          aria-label={speaking ? "Parar lectura" : "Oír la pantalla"}
        >
          {speaking ? <Square className="size-4" /> : <Volume2 className="size-4" />}
          {speaking ? "Leyendo" : "Oír"}
        </button>
        <button
          type="button"
          onClick={listen}
          aria-pressed={listening}
          aria-label="Dar una instrucción por voz"
          className={cn(
            "flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-full text-sm font-medium",
            listening ? "bg-accent text-accent-fg" : "bg-ink text-accent-fg",
          )}
        >
          <Mic className={cn("size-4", listening && "voice-pulse")} />
          {listening ? "Escuchando" : "Hablar"}
        </button>
      </div>
      {partial ? (
        <p className="px-4 pb-2 text-center text-xs text-ink-muted">{partial}</p>
      ) : null}
    </div>
  );
}

function stageLabel(stage: PipelineStage) {
  return stageMeta(stage).label.toLowerCase();
}
