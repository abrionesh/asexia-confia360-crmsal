import type { Patient, PipelineStage, TimelineEvent } from "@/lib/api";
import { PIPELINE_STAGES } from "@/lib/api";
import { buildAlarms } from "@/lib/api/mock/alarms";
import { formatMoney } from "@/lib/utils";

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechResultEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechResultEventLike = {
  resultIndex: number;
  results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }>;
};

type SpeechCtor = new () => SpeechRecognitionLike;

function recognitionCtor(): SpeechCtor | null {
  if (typeof window === "undefined") return null;
  const host = window as Window & {
    SpeechRecognition?: SpeechCtor;
    webkitSpeechRecognition?: SpeechCtor;
  };
  return host.SpeechRecognition ?? host.webkitSpeechRecognition ?? null;
}

export function canSpeak() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function canListen() {
  return recognitionCtor() !== null;
}

function pickVoice() {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((voice) => voice.lang === "es-ES") ??
    voices.find((voice) => voice.lang.startsWith("es")) ??
    null
  );
}

export function stopSpeaking() {
  if (!canSpeak()) return;
  window.speechSynthesis.cancel();
}

export function speak(text: string) {
  if (!canSpeak() || !text.trim()) return false;
  stopSpeaking();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "es-ES";
  utterance.rate = 1;
  const voice = pickVoice();
  if (voice) utterance.voice = voice;
  else {
    window.speechSynthesis.addEventListener(
      "voiceschanged",
      () => {
        const next = pickVoice();
        if (next) utterance.voice = next;
      },
      { once: true },
    );
  }
  window.speechSynthesis.speak(utterance);
  return true;
}

export function startListening(handlers: {
  onPartial: (text: string) => void;
  onFinal: (text: string) => void;
  onEnd: () => void;
  onError: (message: string) => void;
}) {
  const Ctor = recognitionCtor();
  if (!Ctor) return null;
  const recognition = new Ctor();
  recognition.lang = "es-ES";
  recognition.interimResults = true;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;
  recognition.onresult = (event) => {
    let interim = "";
    let finalText = "";
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const piece = event.results[index];
      const transcript = piece[0]?.transcript ?? "";
      if (piece.isFinal) finalText += transcript;
      else interim += transcript;
    }
    if (interim) handlers.onPartial(interim.trim());
    if (finalText) handlers.onFinal(finalText.trim());
  };
  recognition.onend = handlers.onEnd;
  recognition.onerror = (event) => {
    handlers.onError(event.error === "not-allowed" ? "permiso" : "error");
  };
  recognition.start();
  return recognition;
}

export type VoiceAction =
  | { type: "speak"; text: string }
  | { type: "navigate"; id: string; name: string }
  | { type: "go"; to: "/" | "/actuar" | "/agenda" | "/mandos" | "/admin"; label: string }
  | { type: "search"; query: string }
  | { type: "open-copilot"; prompt?: string }
  | { type: "close-copilot" }
  | { type: "move"; id: string; name: string; stage: PipelineStage }
  | { type: "stop" }
  | { type: "help" };

function fold(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function findPatient(query: string, patients: Patient[]) {
  const needle = fold(query);
  if (!needle) return null;
  return (
    patients.find((patient) => fold(patient.fullName) === needle) ??
    patients.find((patient) => fold(patient.fullName).includes(needle)) ??
    patients.find((patient) => fold(patient.firstName) === needle) ??
    null
  );
}

function findStage(query: string): PipelineStage | null {
  const text = fold(query);
  if (/perdid|no insist/.test(text)) return "lost";
  if (/factur/.test(text)) return "invoiced";
  if (/seguimiento|revision|postoperatorio|cuidados/.test(text)) return "followup";
  if (/propuesta|presupuesto/.test(text)) return "proposal";
  if (/cita|confirm/.test(text)) return "confirmed";
  if (/cualif|por ia/.test(text)) return "qualified";
  if (/nuevo|contacto|entrada/.test(text)) return "new";
  return null;
}

export function parseVoice(raw: string, patients: Patient[]): VoiceAction {
  const text = fold(raw);
  if (!text) return { type: "help" };
  if (/^(parar|silencio|calla|stop)$/.test(text)) return { type: "stop" };
  if (/ayuda|que puedo|comandos/.test(text)) return { type: "help" };
  if (/cerrar copiloto|cerrar panel/.test(text)) return { type: "close-copilot" };

  const move = text.match(/^(?:mover|pasa|pasar)\s+(.+?)\s+a\s+(.+)$/);
  if (move) {
    const patient = findPatient(move[1] ?? "", patients);
    const stage = findStage(move[2] ?? "");
    if (patient && stage) {
      return { type: "move", id: patient.id, name: patient.fullName, stage };
    }
  }

  const open = text.match(/^(?:abrir|abre|ficha(?:\s+de)?|ver)\s+(.+)$/);
  if (open) {
    const patient = findPatient(open[1] ?? "", patients);
    if (patient) return { type: "navigate", id: patient.id, name: patient.fullName };
  }

  const search = text.match(/^(?:buscar|busca|filtra)\s+(.+)$/);
  if (search) return { type: "search", query: (search[1] ?? "").trim() };

  if (/copiloto|asistente/.test(text)) {
    const prompt = raw.replace(/.*copiloto(?:\s+ia)?[,:]?\s*/i, "").trim();
    return { type: "open-copilot", prompt: prompt.length > 4 ? prompt : undefined };
  }

  if (/actuar|predicc/.test(text)) return { type: "go", to: "/actuar", label: "Actuar" };
  if (/^agenda|abrir agenda/.test(text)) return { type: "go", to: "/agenda", label: "la agenda" };
  if (/mandos|cuadro de mandos/.test(text)) return { type: "go", to: "/mandos", label: "el cuadro de mandos" };
  if (/^tablero|pipeline/.test(text)) return { type: "go", to: "/", label: "el tablero" };

  if (/alarma|recordatorio/.test(text)) {
    const due = buildAlarms(patients).filter((alarm) => alarm.status === "due");
    const spoken =
      due.length === 0
        ? "No hay alarmas vencidas."
        : `Hay ${due.length} alarmas. ${due
            .slice(0, 4)
            .map((alarm) => `${alarm.patientName}: ${alarm.title}`)
            .join(". ")}.`;
    return { type: "speak", text: spoken };
  }

  if (/resumen|pipeline|tablero|que hay/.test(text)) {
    return { type: "speak", text: pipelineScript(patients) };
  }

  if (/leer|leeme|pantalla|oir/.test(text)) {
    return { type: "speak", text: pipelineScript(patients) };
  }

  const named = findPatient(text, patients);
  if (named) return { type: "navigate", id: named.id, name: named.fullName };

  return { type: "open-copilot", prompt: raw.trim() };
}

export function pipelineScript(patients: Patient[]) {
  if (patients.length === 0) return "El pipeline está vacío.";
  const open = patients.filter((patient) => patient.stage !== "invoiced");
  const value = open.reduce((sum, patient) => sum + patient.estimatedValue, 0);
  const counts = PIPELINE_STAGES.map((stage) => {
    const group = patients.filter((patient) => patient.stage === stage.id);
    const names = group
      .slice(0, 2)
      .map((patient) => patient.fullName)
      .join(", ");
    return `${stage.label}: ${group.length}${names ? `. ${names}` : ""}`;
  }).join(". ");
  return `Pipeline de AsexiA. ${patients.length} fichas. ${formatMoney(value)} en juego. ${counts}.`;
}

export function patientScript(patient: Patient, events: TimelineEvent[] = []) {
  const last = [...events].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  )[0];
  const score = patient.aiScore ? ` Score de IA ${patient.aiScore}.` : "";
  const lastLine = last
    ? ` Último evento: ${last.title}. ${last.body.slice(0, 180)}`
    : "";
  return `Ficha de ${patient.fullName}. ${patient.treatmentInterest}. ${patient.phone}.${score} ${patient.notes}${lastLine}`;
}

export const VOICE_HELP =
  "Puede decir: leer pantalla, actuar, agenda, mandos, abrir Elena Ruiz, buscar implantes, mover Lucía a cita confirmada, o copiloto.";
