import type { Alarm, AlarmChannel, CareItem, ClinicCatalog, Patient, PipelineStage } from "../types";

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/**
 * Alarms are derived from the file, not typed by hand.
 * A stage only opens the rule; the file (cita, cuidados, silencio) decides if it fires.
 */
export function buildAlarms(patients: Patient[], now = Date.now(), catalog?: ClinicCatalog): Alarm[] {
  return patients.flatMap((patient) => alarmsFor(patient, now, catalog));
}

function alarmsFor(patient: Patient, now: number, catalog?: ClinicCatalog): Alarm[] {
  if (patient.stage === "lost") return [];
  const list: Alarm[] = [];
  const silence = silenceAlarm(patient, now);
  if (silence) list.push(silence);
  const reminder = reminderAlarm(patient, now);
  if (reminder) list.push(reminder);
  for (const item of patient.care ?? []) {
    const alarm = careAlarm(patient, item, now);
    if (alarm) list.push(alarm);
  }
  for (const payment of patient.payments ?? []) {
    const alarm = paymentAlarm(patient, payment, now);
    if (alarm) list.push(alarm);
  }
  const birthday = birthdayAlarm(patient, now);
  if (birthday) list.push(birthday);
  for (const manual of patient.manualAlarms ?? []) {
    list.push(customAlarm(patient, manual, now));
  }
  const satisfaction = satisfactionAlarm(patient, now);
  if (satisfaction) list.push(satisfaction);
  if (catalog) list.push(...recallAlarms(patient, catalog, now));
  return list;
}

function silenceAlarm(patient: Patient, now: number): Alarm | null {
  const limit = silenceAfter(patient.stage);
  if (limit == null) return null;
  const idle = now - new Date(patient.lastActivityAt).getTime();
  if (idle < limit) return null;
  const days = Math.max(1, Math.round(idle / DAY));
  const channel = channelFor(patient);
  const reason =
    patient.stage === "proposal"
      ? `Propuesta sin respuesta desde hace ${days} día${days === 1 ? "" : "s"}.`
      : patient.stage === "new"
        ? `Primer contacto superado (${Math.round(limit / HOUR)} h) sin respuesta.`
        : `Cualificado sin avance desde hace ${Math.round(idle / HOUR)} h.`;
  return {
    id: `silence:${patient.id}`,
    patientId: patient.id,
    patientName: patient.fullName,
    phone: patient.phone,
    email: patient.email,
    kind: "silence",
    channel,
    status: "due",
    dueAt: new Date(new Date(patient.lastActivityAt).getTime() + limit).toISOString(),
    title: channel === "internal" ? "Llamar, no escribir" : "Reenganche",
    reason:
      channel === "internal"
        ? `${reason} La ficha indica que prefiere llamada.`
        : reason,
    draft:
      channel === "internal"
        ? `Llamar a ${patient.fullName} (${patient.phone}). ${patient.notes}`
        : `Hola ${patient.firstName}, le escribimos de AsexiA Castellana por ${patient.treatmentInterest.toLowerCase()}. ${
            patient.stage === "proposal"
              ? "El presupuesto sigue vigente. ¿Quiere que reservemos un hueco de valoración esta semana?"
              : "Tenemos hueco de valoración esta semana. ¿Prefiere una tarde o un mediodía?"
          }`,
  };
}

function reminderAlarm(patient: Patient, now: number): Alarm | null {
  if (patient.stage !== "confirmed" || !patient.appointmentAt) return null;
  const at = new Date(patient.appointmentAt).getTime();
  const delta = at - now;
  if (delta < -2 * HOUR) return null;
  const dueAt = at - 24 * HOUR;
  const when = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(at));
  const soon = delta <= 2 * HOUR;
  return {
    id: `appt:${patient.id}`,
    patientId: patient.id,
    patientName: patient.fullName,
    phone: patient.phone,
    email: patient.email,
    kind: "reminder",
    channel: channelFor(patient),
    status: dueAt <= now ? "due" : "scheduled",
    dueAt: new Date(dueAt).toISOString(),
    title: soon ? "Cita en menos de 2 h" : "Recordatorio de cita",
    reason: soon
      ? "La cita es inminente y no consta confirmación del recordatorio."
      : dueAt <= now
        ? "Cita confirmada dentro de las próximas 48 h."
        : "Recordatorio programado 24 h antes de la cita.",
    draft: `Hola ${patient.firstName}, le recordamos su cita de ${patient.treatmentInterest.toLowerCase()} el ${when} con ${patient.assignedTo} en AsexiA Castellana. Si no puede acudir, responda a este mensaje.`,
  };
}

function careAlarm(patient: Patient, item: CareItem, now: number): Alarm | null {
  const due = new Date(item.dueAt).getTime();
  const delta = due - now;
  const kind =
    item.kind === "prep"
      ? "prep"
      : item.kind === "aftercare"
        ? "aftercare"
        : item.kind === "review"
          ? "review"
          : "nurture";
  const channel = channelFor(patient);
  return {
    id: `care:${item.id}`,
    patientId: patient.id,
    patientName: patient.fullName,
    phone: patient.phone,
    email: patient.email,
    kind,
    channel,
    status: delta <= 0 ? "due" : "scheduled",
    dueAt: item.dueAt,
    title: item.title,
    reason: careReason(item.kind),
    draft: draftFor(patient, item),
  };
}

function careReason(kind: CareItem["kind"]) {
  if (kind === "prep") return "La ficha indica una preparación previa al tratamiento.";
  if (kind === "aftercare") return "La ficha indica un consejo de cuidado posterior.";
  if (kind === "review") return "La ficha marca una fecha de revisión o siguiente fase.";
  return "La ficha indica un seguimiento comercial al cerrar el plan.";
}

function draftFor(patient: Patient, item: CareItem) {
  const hello = `Hola ${patient.firstName}, le escribimos de AsexiA Castellana.`;
  if (item.kind === "prep") return `${hello} Antes de ${patient.treatmentInterest.toLowerCase()}: ${item.body}`;
  if (item.kind === "aftercare")
    return `${hello} Sobre ${patient.treatmentInterest.toLowerCase()}: ${item.body} Si nota dolor intenso, sangrado o fiebre, llámenos.`;
  if (item.kind === "review")
    return `${hello} Toca la revisión de ${patient.treatmentInterest.toLowerCase()}. ${item.body} ¿Le va bien esta semana?`;
  return `${hello} ${item.body}`;
}

function silenceAfter(stage: PipelineStage): number | null {
  if (stage === "new") return 4 * HOUR;
  if (stage === "qualified") return 6 * HOUR;
  if (stage === "proposal") return 2 * DAY;
  return null;
}

function channelFor(patient: Patient): AlarmChannel {
  if (patient.preferredChannel === "call") return "internal";
  if (patient.preferredChannel === "email") return "email";
  return "whatsapp";
}

function paymentAlarm(patient: Patient, payment: { id: string; dueAt: string; amount: number; concept: string; status: string }, now: number): Alarm | null {
  if (payment.status !== "pendiente") return null;
  const due = new Date(payment.dueAt).getTime();
  const delta = due - now;
  if (delta > 48 * HOUR || delta < -7 * DAY) return null;
  const amount = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(payment.amount);
  return {
    id: `pay:${payment.id}`,
    patientId: patient.id,
    patientName: patient.fullName,
    phone: patient.phone,
    email: patient.email,
    kind: "payment",
    channel: channelFor(patient),
    status: delta <= 0 ? "due" : "scheduled",
    dueAt: payment.dueAt,
    title: `Cobro · ${payment.concept}`,
    reason: delta <= 0 ? "Hay un pago vencido en el plan." : "Hay un pago previsto en las próximas 48 h.",
    draft: `Hola ${patient.firstName}, le escribimos de AsexiA Castellana para el pago de ${amount} (${payment.concept}). ¿Lo dejamos resuelto en la próxima visita?`,
  };
}

function birthdayAlarm(patient: Patient, now: number): Alarm | null {
  if (!patient.birthday) return null;
  const [, month, day] = patient.birthday.split("-").map(Number);
  if (!month || !day) return null;
  const today = new Date(now);
  const next = new Date(today.getFullYear(), month - 1, day);
  if (next.getTime() + DAY < now) next.setFullYear(today.getFullYear() + 1);
  const delta = next.getTime() - now;
  if (delta < 0 || delta > 7 * DAY) return null;
  const days = Math.max(0, Math.round(delta / DAY));
  return {
    id: `bday:${patient.id}:${next.getFullYear()}`,
    patientId: patient.id,
    patientName: patient.fullName,
    phone: patient.phone,
    email: patient.email,
    kind: "birthday",
    channel: channelFor(patient),
    status: "scheduled",
    dueAt: next.toISOString(),
    title: days === 0 ? "Cumpleaños hoy" : `Cumpleaños en ${days} día${days === 1 ? "" : "s"}`,
    reason: "La ficha tiene fecha de nacimiento y el cumpleaños cae esta semana.",
    draft: `Hola ${patient.firstName}, desde AsexiA Castellana le deseamos un feliz cumpleaños. Quedamos a su disposición cuando quiera.`,
  };
}

function customAlarm(patient: Patient, manual: { id: string; title: string; dueAt: string; channel: AlarmChannel; draft: string }, now: number): Alarm {
  const due = new Date(manual.dueAt).getTime();
  return {
    id: `manual:${manual.id}`,
    patientId: patient.id,
    patientName: patient.fullName,
    phone: patient.phone,
    email: patient.email,
    kind: "custom",
    channel: manual.channel,
    status: due <= now ? "due" : "scheduled",
    dueAt: manual.dueAt,
    title: manual.title,
    reason: "Alarma creada a mano desde la ficha.",
    draft: manual.draft,
  };
}

function satisfactionAlarm(patient: Patient, now: number): Alarm | null {
  if (patient.satisfaction) return null;
  const done = (patient.visits ?? []).filter(
    (visit) => visit.status === "realizada" && now - new Date(visit.at).getTime() > 48 * HOUR,
  );
  if (done.length === 0) return null;
  return {
    id: `sat:${patient.id}`,
    patientId: patient.id,
    patientName: patient.fullName,
    phone: patient.phone,
    email: patient.email,
    kind: "satisfaction",
    channel: "internal",
    status: "due",
    dueAt: new Date(now).toISOString(),
    title: "¿Cómo se encuentra?",
    reason: "Han pasado más de 48 h de una visita y la ficha no tiene respuesta.",
    draft: `Una sola pregunta para ${patient.fullName}: bien, regular o mal.`,
  };
}

function recallAlarms(patient: Patient, catalog: ClinicCatalog, now: number): Alarm[] {
  const alarms: Alarm[] = [];
  for (const visit of patient.visits ?? []) {
    if (visit.status !== "realizada") continue;
    const activity = catalog.activities.find((item) => item.id === visit.activityId);
    if (!activity?.recallDays) continue;
    const doneAt = new Date(visit.at).getTime();
    const due = doneAt + activity.recallDays * DAY;
    const hasNext = (patient.visits ?? []).some(
      (item) => item.status === "programada" && new Date(item.at).getTime() > doneAt,
    );
    if (hasNext || now < due - DAY || now > due + 14 * DAY) continue;
    alarms.push({
      id: `recall:${visit.id}`,
      patientId: patient.id,
      patientName: patient.fullName,
      phone: patient.phone,
      email: patient.email,
      kind: "review",
      channel: patient.preferredChannel === "email" ? "email" : "whatsapp",
      status: now >= due ? "due" : "scheduled",
      dueAt: new Date(due).toISOString(),
      title: `Recordar ${activity.name}`,
      reason: `La actividad pide aviso a los ${activity.recallDays} días y no hay otra cita.`,
      draft: `Hola ${patient.firstName}, han pasado ${activity.recallDays} días de ${activity.name}. ¿Reservamos la siguiente sesión?`,
    });
  }
  return alarms;
}
