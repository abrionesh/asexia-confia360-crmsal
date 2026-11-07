import type { CopilotMessage, Patient } from "../types";
import { formatMoney } from "@/lib/utils";
import { PIPELINE_STAGES } from "../types";
import { buildAlarms } from "./alarms";

function uid() {
  return `msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function openingMessage(): CopilotMessage {
  return {
    id: "msg-open",
    role: "assistant",
    content:
      "Soy el Copiloto de AsexiA. Puedo resumir el pipeline, preparar el briefing de un paciente o redactar el siguiente WhatsApp. ¿Por dónde empezamos?",
    at: new Date().toISOString(),
  };
}

export function copilotReply(prompt: string, patients: Patient[]): CopilotMessage {
  const q = prompt.toLowerCase();
  const byStage = Object.fromEntries(
    PIPELINE_STAGES.map((stage) => [
      stage.id,
      patients.filter((patient) => patient.stage === stage.id),
    ]),
  ) as Record<Patient["stage"], Patient[]>;

  const pipelineValue = patients
    .filter((patient) => patient.stage !== "invoiced" && !patient.billed)
    .reduce((sum, patient) => sum + patient.estimatedValue, 0);

  const closedPatients = patients.filter(
    (patient) => patient.stage === "invoiced" || patient.billed,
  );
  const closed = closedPatients.reduce((sum, patient) => sum + patient.estimatedValue, 0);
  const cold = patients.filter((patient) => {
    const ageH = (Date.now() - new Date(patient.lastActivityAt).getTime()) / 3_600_000;
    return patient.stage === "new" && ageH > 4;
  });

  let content: string;

  if (/pipeline|resumen|hoy|tablero/.test(q)) {
    content = [
      `Pipeline vivo: ${patients.length} fichas · ${formatMoney(pipelineValue)} en juego.`,
      `Nuevos ${byStage.new.length} · Cualificados ${byStage.qualified.length} · Propuesta ${byStage.proposal.length} · Cita ${byStage.confirmed.length} · Seguimiento ${byStage.followup.length} · Facturado ${byStage.invoiced.length} (${formatMoney(closed)}).`,
      `Prioridad: ${byStage.qualified[0]?.fullName ?? "sin cualificados"} y ${byStage.new[0]?.fullName ?? "—"}. Si quiere, preparo el briefing de cualquiera.`,
    ].join("\n\n");
  } else if (/frí|sin respuesta|fria|frio|nurturing/.test(q)) {
    content =
      cold.length === 0
        ? "No hay leads nuevos con más de 4 h sin respuesta. El SLA de primer contacto se está cumpliendo."
        : `Leads fríos (nuevo contacto, >4 h):\n${cold
            .map(
              (patient) =>
                `· ${patient.fullName} · ${patient.treatmentInterest} · ${patient.nextAction ?? "sin acción"}`,
            )
            .join("\n")}\n\nPuedo redactar el WhatsApp de reenganche.`;
  } else if (/factur|previsi|ticket|cierre/.test(q)) {
    const avg = closedPatients.length === 0 ? 0 : closed / closedPatients.length;
    content = `Cierre del periodo: ${formatMoney(closed)} en ${closedPatients.length} casos cobrados. Ticket medio ${formatMoney(avg)}. Si avanzan Elena Ruiz y Pablo Herrero este mes, la previsión suma ${formatMoney(3900 + 7500)} adicionales.`;
  } else if (/whatsapp|mensaje|redact/.test(q)) {
    const target =
      patients.find((patient) => q.includes(patient.firstName.toLowerCase())) ??
      byStage.new[0];
    content = target
      ? `Borrador para ${target.fullName} (${target.treatmentInterest}):\n\n«Hola ${target.firstName}, le escribe AsexiA Castellana. Tenemos un hueco de valoración esta semana para ${target.treatmentInterest.toLowerCase()}. ¿Prefiere tarde el jueves o mediodía el viernes?»\n\nTono: clínico, sin emojis, SLA < 1 h.`
      : "Indíqueme el paciente y redacto el WhatsApp en tono clínico.";
  } else if (/briefing|prepar|llamad|elena|pablo|lucía|lucia|isabel/.test(q)) {
    const target =
      patients.find((patient) => q.includes(patient.firstName.toLowerCase())) ??
      patients.find((patient) => patient.id === "elena-ruiz") ??
      patients[0];
    content = [
      `Briefing · ${target.fullName}`,
      `${target.treatmentInterest} · ${formatMoney(target.estimatedValue)} · ${target.stage === "qualified" ? `IA ${target.aiScore}` : stageLabel(target)}`,
      `Contacto: ${target.phone} · ${target.city}`,
      `Notas: ${target.notes}`,
      `Siguiente acción: ${target.nextAction ?? "—"}`,
      `Ángulo de llamada: no vender quirófano; confirmar motivación, ventana temporal y objeción de precio. Cerrar hueco concreto.`,
    ].join("\n");
  } else if (/alarma|recordatorio|seguimiento|cuidados/.test(q)) {
    const due = buildAlarms(patients).filter((alarm) => alarm.status === "due");
    content =
      due.length === 0
        ? "No hay alarmas vencidas. Las citas a más de 48 h y los cuidados futuros siguen programados en la ficha."
        : `Alarmas para actuar ahora (${due.length}):\n${due
            .map((alarm) => `· ${alarm.patientName} — ${alarm.title}. ${alarm.reason}`)
            .join("\n")}\n\nDesde la ficha puede enviar el WhatsApp o el correo ya redactado.`;
  } else if (/cita|agenda|jueves|martes/.test(q)) {
    content = byStage.confirmed
      .map(
        (patient) =>
          `· ${patient.fullName} — ${patient.treatmentInterest} · ${patient.assignedTo} · ${patient.nextAction}`,
      )
      .join("\n") || "No hay citas confirmadas en el tablero.";
  } else {
    content =
      "Puedo ayudarle con: resumen del pipeline, leads fríos, briefing de un paciente, previsión de facturación o un borrador de WhatsApp. Escriba el nombre o la tarea.";
  }

  return {
    id: uid(),
    role: "assistant",
    content,
    at: new Date().toISOString(),
  };
}

function stageLabel(patient: Patient) {
  return PIPELINE_STAGES.find((stage) => stage.id === patient.stage)?.label ?? patient.stage;
}
