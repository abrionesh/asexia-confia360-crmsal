import { create } from "zustand";
import type { CopilotMessage } from "@/lib/api";
import { openingMessage } from "@/lib/api/mock/copilot";

interface UiState {
  search: string;
  copilotOpen: boolean;
  copilotMessages: CopilotMessage[];
  copilotBusy: boolean;
  role: ClinicRole;
  doctor: string;
  clinicCode: string;
  clinicName: string;
  setSearch: (value: string) => void;
  setCopilotOpen: (open: boolean) => void;
  pushMessage: (message: CopilotMessage) => void;
  setCopilotBusy: (busy: boolean) => void;
  resetCopilot: () => void;
  setRole: (role: ClinicRole) => void;
  setDoctor: (doctor: string) => void;
  setClinic: (code: string, name: string) => void;
}

export type ClinicRole = "direccion" | "recepcion" | "medico";

const ROLE_KEY = "asexia.role";

function storedRole(): ClinicRole {
  if (typeof window === "undefined") return "direccion";
  const value = window.localStorage.getItem(ROLE_KEY);
  if (value === "recepcion" || value === "medico" || value === "direccion") return value;
  return "direccion";
}

export const useUiStore = create<UiState>((set) => ({
  search: "",
  copilotOpen: false,
  copilotMessages: [openingMessage()],
  copilotBusy: false,
  role: storedRole(),
  doctor: "Dra. Elena Marín",
  clinicCode: "",
  clinicName: "",
  setSearch: (search) => set({ search }),
  setCopilotOpen: (copilotOpen) => set({ copilotOpen }),
  pushMessage: (message) =>
    set((state) => ({ copilotMessages: [...state.copilotMessages, message] })),
  setCopilotBusy: (copilotBusy) => set({ copilotBusy }),
  resetCopilot: () => set({ copilotMessages: [openingMessage()], copilotBusy: false }),
  setRole: (role) => {
    if (typeof window !== "undefined") window.localStorage.setItem(ROLE_KEY, role);
    set({ role });
  },
  setDoctor: (doctor) => set({ doctor }),
  setClinic: (clinicCode, clinicName) => set({ clinicCode, clinicName }),
}));
