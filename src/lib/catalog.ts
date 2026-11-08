import type { Activity, ClinicCatalog, OpeningDay, Professional } from "@/lib/api/types";

export const ACTIVITY_COLORS = ["#1C3D36", "#3D4F7C", "#8A5A2B", "#1F6B4A", "#6B3A4A", "#0E6B6B", "#4A5C3A", "#C45C26"];

const DAY_LABEL = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export function weekHours(open: string, close: string, closedDays: number[]): OpeningDay[] {
  return [1, 2, 3, 4, 5, 6, 0].map((day) => ({
    day,
    label: DAY_LABEL[day] ?? "Día",
    open,
    close,
    closed: closedDays.includes(day),
  }));
}

const PRESET: Record<string, Pick<Activity, "cost" | "color" | "code" | "professionalIds">> = {
  armonizacion: { cost: 780, color: "#1C3D36", code: "01", professionalIds: ["elena"] },
  implantes: { cost: 4100, color: "#3D4F7C", code: "02", professionalIds: ["raquel"] },
  "laser-co2": { cost: 420, color: "#0E6B6B", code: "03", professionalIds: ["elena"] },
  blefaro: { cost: 1600, color: "#6B3A4A", code: "04", professionalIds: ["inigo"] },
  rino: { cost: 3400, color: "#8A5A2B", code: "05", professionalIds: ["inigo"] },
  botox: { cost: 210, color: "#1F6B4A", code: "06", professionalIds: ["elena"] },
  capilar: { cost: 640, color: "#4A5C3A", code: "07", professionalIds: ["elena"] },
  invisalign: { cost: 1800, color: "#3D4F7C", code: "08", professionalIds: ["raquel"] },
  "laser-vascular": { cost: 380, color: "#0E6B6B", code: "09", professionalIds: ["elena"] },
  rejuvenecimiento: { cost: 1900, color: "#C45C26", code: "10", professionalIds: ["inigo", "elena"] },
  hidrafacial: { cost: 40, color: "#1F6B4A", code: "11", professionalIds: ["clara"] },
  revision: { cost: 0, color: "#4A5C3A", code: "12", professionalIds: ["elena", "inigo", "raquel"] },
  protesis: { cost: 1400, color: "#3D4F7C", code: "13", professionalIds: ["raquel"] },
};

export function defaultProfessionals(): Professional[] {
  return [
    {
      id: "elena",
      name: "Dra. Elena Marín",
      specialty: "Medicina estética",
      phone: "+34 610 220 114",
      email: "elena.marin@asexia.clinic",
      color: "#1C3D36",
      license: "28/34521",
      cv: "Doce años en facial no quirúrgico. Formación en armonización y láser.",
      hours: weekHours("10:00", "14:00", [0, 6]),
      activityCosts: [],
    },
    {
      id: "inigo",
      name: "Dr. Íñigo Salas",
      specialty: "Cirugía",
      phone: "+34 610 220 208",
      email: "inigo.salas@asexia.clinic",
      color: "#8A5A2B",
      license: "28/29810",
      cv: "Cirugía facial. Quirófano de tarde, de lunes a jueves.",
      hours: weekHours("15:00", "20:00", [0, 5, 6]),
      activityCosts: [{ activityId: "rino", cost: 3600 }],
    },
    {
      id: "raquel",
      name: "Raquel Vidal",
      specialty: "Odontología",
      phone: "+34 610 220 301",
      email: "raquel.vidal@asexia.clinic",
      color: "#3D4F7C",
      license: "28/41002",
      cv: "Implantes y prótesis. Responsable del box dental.",
      hours: weekHours("10:00", "18:00", [0, 6]),
      activityCosts: [],
    },
    {
      id: "clara",
      name: "Clara Méndez",
      specialty: "Facial",
      phone: "+34 610 220 418",
      email: "clara.mendez@asexia.clinic",
      color: "#1F6B4A",
      cv: "Cabina facial. Packs y mantenimiento.",
      hours: weekHours("10:00", "14:00", [0, 1]),
      activityCosts: [],
    },
  ];
}

export function normalizeCatalog(input: {
  activities?: Array<Partial<Activity> & { id: string }>;
  rooms?: ClinicCatalog["rooms"];
  hours?: OpeningDay[];
  professionals?: Professional[];
} | null | undefined): ClinicCatalog {
  const activities = (input?.activities ?? []).map((activity, index) => {
    const preset = PRESET[activity.id];
    return {
      id: activity.id,
      sector: activity.sector ?? "",
      subsector: activity.subsector ?? "",
      name: activity.name ?? "Actividad",
      description: activity.description ?? "",
      durationMin: activity.durationMin ?? 30,
      price: activity.price ?? 0,
      cost: activity.cost ?? preset?.cost ?? 0,
      color: activity.color ?? preset?.color ?? ACTIVITY_COLORS[index % ACTIVITY_COLORS.length],
      code: activity.code ?? preset?.code ?? String(index + 1).padStart(2, "0"),
      links: activity.links ?? [],
      professionalIds: activity.professionalIds ?? preset?.professionalIds ?? [],
      files: activity.files ?? [],
    } satisfies Activity;
  });
  return {
    activities,
    rooms: input?.rooms ?? [],
    hours: input?.hours ?? weekHours("10:00", "20:00", [0]),
    professionals: input?.professionals?.length ? input.professionals : defaultProfessionals(),
  };
}

export function blankActivity(index: number): Activity {
  return {
    id: `act-${Date.now()}`,
    sector: "Medicina estética",
    subsector: "Facial",
    name: "Nueva actividad",
    description: "",
    durationMin: 30,
    price: 0,
    cost: 0,
    color: ACTIVITY_COLORS[index % ACTIVITY_COLORS.length] ?? "#1C3D36",
    code: String(index + 1).padStart(2, "0"),
    links: [],
    professionalIds: [],
  };
}

export function blankProfessional(): Professional {
  return {
    id: `pro-${Date.now()}`,
    name: "Nuevo profesional",
    specialty: "",
    phone: "",
    email: "",
    color: "#1C3D36",
    hours: weekHours("10:00", "14:00", [0, 6]),
    activityCosts: [],
  };
}

export function activityCost(catalog: ClinicCatalog, activityId: string, professionalName?: string) {
  const activity = catalog.activities.find((item) => item.id === activityId);
  const professional = catalog.professionals.find((item) => item.name === professionalName);
  const override = professional?.activityCosts.find((item) => item.activityId === activityId);
  return override?.cost ?? activity?.cost ?? 0;
}
