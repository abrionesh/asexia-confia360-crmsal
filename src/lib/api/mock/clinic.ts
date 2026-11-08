import type { ClinicCatalog, Patient, PlannedPayment, Visit } from "../types";
import { normalizeCatalog } from "../../catalog";
import { daysAgo, hoursFromNow } from "./clock";

export function seedCatalog(): ClinicCatalog {
  return normalizeCatalog({
    activities: [
      { id: "armonizacion", sector: "Medicina estética", subsector: "Facial", name: "Harmonización facial", description: "Valoración y tratamiento de pómulos y perfil.", durationMin: 60, price: 2400 },
      { id: "implantes", sector: "Odontología", subsector: "Cirugía", name: "Implantes dentales", description: "Fase quirúrgica. Incluye control a la semana.", durationMin: 90, price: 6800 },
      { id: "laser-co2", sector: "Medicina estética", subsector: "Láser", name: "Láser CO2", description: "Resurfacing de cicatriz. Sala con extracción.", durationMin: 45, price: 1250 },
      { id: "blefaro", sector: "Cirugía", subsector: "Párpados", name: "Blefaroplastia", description: "Valoración y cirugía de párpados.", durationMin: 90, price: 3900 },
      { id: "rino", sector: "Cirugía", subsector: "Nariz", name: "Rinoplastia", description: "Intervención en quirófano y revisión de puntos.", durationMin: 150, price: 8200 },
      { id: "botox", sector: "Medicina estética", subsector: "Infiltración", name: "Botox y rellenos", description: "Sesión médico-estética.", durationMin: 40, price: 890 },
      { id: "capilar", sector: "Medicina estética", subsector: "Capilar", name: "Tratamiento capilar", description: "Mesoterapia. Plan de 6 meses.", durationMin: 45, price: 2100 },
      { id: "invisalign", sector: "Odontología", subsector: "Ortodoncia", name: "Invisalign", description: "Estudio y inicio de alineadores.", durationMin: 60, price: 4200 },
      { id: "laser-vascular", sector: "Medicina estética", subsector: "Láser", name: "Láser vascular", description: "Sesión de rojeces. Evitar sol 15 días.", durationMin: 40, price: 1450 },
      { id: "rejuvenecimiento", sector: "Medicina estética", subsector: "Facial", name: "Rejuvenecimiento", description: "Pack no quirúrgico. Tres sesiones.", durationMin: 75, price: 5600 },
      { id: "hidrafacial", sector: "Medicina estética", subsector: "Facial", name: "Hidrafacial", description: "Sesión de pack. Sin incapacidad.", durationMin: 50, price: 135 },
      { id: "revision", sector: "Clínica", subsector: "Seguimiento", name: "Revisión", description: "Control incluido en el tratamiento.", durationMin: 20, price: 0 },
      { id: "protesis", sector: "Odontología", subsector: "Prótesis", name: "Prótesis definitiva", description: "Fase protésica tras carga inmediata.", durationMin: 60, price: 3400 },
    ],
    rooms: [
      { id: "sala-1", name: "Sala 1 · Facial" },
      { id: "sala-2", name: "Sala 2 · Láser" },
      { id: "quirofano", name: "Quirófano" },
      { id: "box", name: "Box dental" },
    ],
    hours: [
      { day: 1, label: "Lunes", open: "10:00", close: "20:00", closed: false },
      { day: 2, label: "Martes", open: "10:00", close: "20:00", closed: false },
      { day: 3, label: "Miércoles", open: "10:00", close: "20:00", closed: false },
      { day: 4, label: "Jueves", open: "10:00", close: "20:00", closed: false },
      { day: 5, label: "Viernes", open: "10:00", close: "20:00", closed: false },
      { day: 6, label: "Sábado", open: "10:00", close: "14:00", closed: false },
      { day: 0, label: "Domingo", open: "10:00", close: "14:00", closed: true },
    ],
  });
}

function birthdayIn(days: number, yearsAgo: number) {
  const date = new Date();
  date.setFullYear(date.getFullYear() - yearsAgo);
  date.setDate(date.getDate() + days);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function visit(partial: Visit): Visit {
  return partial;
}

function pay(partial: PlannedPayment): PlannedPayment {
  return partial;
}

export function attachClinic(list: Patient[]): Patient[] {
  const todayAt = (hour: number, minute = 0) => {
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date.toISOString();
  };
  const openSlot = (hour: number, minute: number, minDaysAhead: number) => {
    const date = new Date();
    date.setDate(date.getDate() + minDaysAhead);
    date.setHours(hour, minute, 0, 0);
    if (date.getTime() < Date.now()) date.setDate(date.getDate() + 1);
    while (date.getDay() === 0) date.setDate(date.getDate() + 1);
    return date.toISOString();
  };
  const isabelAt = openSlot(11, 0, 1);
  const tomasAt = openSlot(16, 30, 1);
  const diegoAt = todayAt(11, 30);
  const nuriaAt = openSlot(12, 0, 3);
  const anaReview = openSlot(9, 30, 9);
  const martaNext = openSlot(17, 0, 12);
  const elenaPay = openSlot(12, 30, 1);

  const extras: Record<string, Partial<Patient>> = {
    "isabel-serrano": {
      birthday: birthdayIn(3, 36),
      ledgerTotal: 3200,
      appointmentAt: isabelAt,
      contraindications: "Ninguna conocida.",
      consentSigned: false,
      pendings: [
        { id: "isabel-p1", title: "Confirmar que no toma antiinflamatorios", done: false, createdAt: daysAgo(1) },
      ],
      visits: [
        visit({ id: "isabel-v0", at: daysAgo(6), activityId: "armonizacion", activityName: "Harmonización facial", roomId: "sala-1", roomName: "Sala 1 · Facial", durationMin: 30, professional: "Dra. Elena Marín", status: "realizada", notes: "Valoración. Depósito cobrado.", price: 0 }),
        visit({ id: "isabel-v1", at: isabelAt, activityId: "armonizacion", activityName: "Harmonización facial", roomId: "sala-1", roomName: "Sala 1 · Facial", durationMin: 60, professional: "Dra. Elena Marín", status: "programada", notes: "Sesión de tratamiento. Sin maquillaje en la zona.", price: 3050 }),
      ],
      payments: [
        pay({ id: "isabel-pay0", dueAt: todayAt(10, 15), paidAt: todayAt(10, 15), amount: 150, concept: "Depósito de reserva", status: "cobrado" }),
        pay({ id: "isabel-pay1", dueAt: isabelAt, amount: 3050, concept: "Resto de harmonización", status: "pendiente" }),
      ],
    },
    "ana-beltran": {
      birthday: birthdayIn(40, 41),
      ledgerTotal: 8200,
      billed: true,
      consentSigned: true,
      contraindications: "Ninguna conocida. Consentimiento de quirófano firmado.",
      pendings: [
        { id: "ana-p1", title: "Fotos de control antes de la revisión", done: false, createdAt: daysAgo(1) },
      ],
      visits: [
        visit({ id: "ana-v0", at: daysAgo(12), activityId: "rino", activityName: "Rinoplastia", roomId: "quirofano", roomName: "Quirófano", durationMin: 150, professional: "Dr. Íñigo Salas", status: "realizada", notes: "Intervención sin incidencias. Factura emitida.", price: 8200 }),
        visit({ id: "ana-v1", at: anaReview, activityId: "revision", activityName: "Revisión", roomId: "sala-1", roomName: "Sala 1 · Facial", durationMin: 20, professional: "Dr. Íñigo Salas", status: "programada", notes: "Retirada de puntos y simetría.", price: 0 }),
      ],
      payments: [
        pay({ id: "ana-pay0", dueAt: daysAgo(12), amount: 8200, concept: "Rinoplastia", status: "cobrado" }),
      ],
    },
    "tomas-gil": {
      birthday: birthdayIn(80, 52),
      ledgerTotal: 9400,
      billed: true,
      appointmentAt: tomasAt,
      pendings: [
        { id: "tomas-p1", title: "Confirmar ausencia de movilidad", done: false, createdAt: daysAgo(2) },
      ],
      visits: [
        visit({ id: "tomas-v0", at: daysAgo(20), activityId: "implantes", activityName: "Implantes dentales", roomId: "box", roomName: "Box dental", durationMin: 90, professional: "Raquel Vidal", status: "realizada", notes: "Carga inmediata. Fase quirúrgica cobrada.", price: 6000 }),
        visit({ id: "tomas-v1", at: tomasAt, activityId: "protesis", activityName: "Prótesis definitiva", roomId: "box", roomName: "Box dental", durationMin: 60, professional: "Raquel Vidal", status: "programada", notes: "Toma de fase protésica.", price: 3400 }),
      ],
      payments: [
        pay({ id: "tomas-pay0", dueAt: daysAgo(20), amount: 6000, concept: "Fase quirúrgica", status: "cobrado" }),
        pay({ id: "tomas-pay1", dueAt: tomasAt, amount: 3400, concept: "Prótesis definitiva", status: "pendiente" }),
      ],
    },
    "marta-soler": {
      birthday: birthdayIn(15, 29),
      ledgerTotal: 540,
      billed: true,
      visits: [
        visit({ id: "marta-v0", at: daysAgo(20), activityId: "hidrafacial", activityName: "Hidrafacial", roomId: "sala-1", roomName: "Sala 1 · Facial", durationMin: 50, professional: "Clara Méndez", status: "realizada", notes: "Sesión 1 de 4.", price: 135 }),
        visit({ id: "marta-v1", at: daysAgo(3), activityId: "hidrafacial", activityName: "Hidrafacial", roomId: "sala-1", roomName: "Sala 1 · Facial", durationMin: 50, professional: "Clara Méndez", status: "realizada", notes: "Sesión 2 de 4.", price: 135 }),
        visit({ id: "marta-miss", at: daysAgo(8), activityId: "hidrafacial", activityName: "Hidrafacial", roomId: "sala-1", roomName: "Sala 1 · Facial", durationMin: 50, professional: "Clara Méndez", status: "ausente", notes: "No acudió. Hueco liberado.", price: 0 }),
        visit({ id: "marta-v2", at: martaNext, activityId: "hidrafacial", activityName: "Hidrafacial", roomId: "sala-1", roomName: "Sala 1 · Facial", durationMin: 50, professional: "Clara Méndez", status: "programada", notes: "Sesión 3 de 4.", price: 135 }),
      ],
      payments: [
        pay({ id: "marta-pay0", dueAt: daysAgo(20), amount: 540, concept: "Pack 4 sesiones", status: "cobrado" }),
      ],
    },
    "diego-romero": {
      ledgerTotal: 1450,
      appointmentAt: diegoAt,
      visits: [
        visit({ id: "diego-v1", at: diegoAt, activityId: "laser-vascular", activityName: "Láser vascular", roomId: "sala-2", roomName: "Sala 2 · Láser", durationMin: 40, professional: "Dra. Elena Marín", status: "programada", notes: "Evitar sol. Ya informado.", price: 1450 }),
      ],
      payments: [
        pay({ id: "diego-pay1", dueAt: diegoAt, amount: 1450, concept: "Láser vascular", status: "pendiente" }),
      ],
    },
    "nuria-pellicer": {
      ledgerTotal: 5600,
      appointmentAt: nuriaAt,
      visits: [
        visit({ id: "nuria-v1", at: nuriaAt, activityId: "rejuvenecimiento", activityName: "Rejuvenecimiento", roomId: "sala-1", roomName: "Sala 1 · Facial", durationMin: 75, professional: "Dr. Íñigo Salas", status: "programada", notes: "Primera sesión del pack. Viaja desde Barcelona.", price: 1860 }),
      ],
      payments: [
        pay({ id: "nuria-pay1", dueAt: nuriaAt, amount: 1860, concept: "Sesión 1 de 3", status: "pendiente" }),
      ],
    },
    "elena-ruiz": {
      birthday: birthdayIn(120, 44),
      ledgerTotal: 3900,
      consentSigned: false,
      contraindications: "Fatiga palpebral. No toma anticoagulantes. Falta el consentimiento de quirófano.",
      payments: [
        pay({ id: "elena-pay1", dueAt: elenaPay, amount: 500, concept: "Reserva de valoración quirúrgica", status: "pendiente" }),
      ],
      pendings: [
        { id: "elena-p1", title: "Cerrar hueco de preoperatorio", done: false, createdAt: daysAgo(1) },
      ],
    },
    "martin-vega": {
      pendings: [
        { id: "martin-p1", title: "Llamar antes de las 19 h. No escribir.", done: false, createdAt: hoursFromNow(-7) },
      ],
    },
  };

  return list.map((patient) => {
    const extra = extras[patient.id];
    if (!extra) {
      return {
        ...patient,
        ledgerTotal: patient.ledgerTotal ?? patient.estimatedValue,
        visits: patient.visits ?? [],
        payments: patient.payments ?? [],
        pendings: patient.pendings ?? [],
      };
    }
    return { ...patient, ...extra };
  });
}
