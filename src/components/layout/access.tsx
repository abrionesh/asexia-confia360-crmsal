import { useState, type FormEvent, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AsexiAMark } from "@/components/brand/mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClinic, joinClinic, readClinicBook } from "@/lib/api/book.functions";
import { adoptClinicBook } from "@/lib/api/sync";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useUiStore, type ClinicRole } from "@/lib/store/ui";

const DOCTORS = ["Dra. Elena Marín", "Dr. Íñigo Salas", "Raquel Vidal", "Clara Méndez"];

export function StaffGate({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  const access = useQuery({
    queryKey: ["clinic-access", user?.id],
    queryFn: () => readClinicBook(),
    enabled: Boolean(user),
  });

  if (isPending || (user && access.isPending)) {
    return (
      <main className="grid min-h-dvh place-items-center bg-bg px-6 text-ink">
        <p className="text-sm text-ink-muted">{isPending ? "Comprobando el acceso…" : "Abriendo el libro…"}</p>
      </main>
    );
  }
  if (!user) return <RedirectToSignIn />;
  if (access.isError) {
    return (
      <main className="grid min-h-dvh place-items-center bg-bg px-6 text-ink">
        <p className="max-w-sm text-center text-sm text-ink-muted">No se ha podido abrir el libro. Recargue la página.</p>
      </main>
    );
  }
  const book = access.data;
  if (!book?.role) {
    return <ClinicJoin onReady={() => void access.refetch()} />;
  }

  const state = useUiStore.getState();
  const role = book.role as ClinicRole;
  if (state.role !== role || state.clinicCode !== (book.code ?? "") || (book.doctorName && state.doctor !== book.doctorName)) {
    state.setRole(role);
    state.setClinic(book.code ?? "", book.name ?? "");
    if (book.doctorName) state.setDoctor(book.doctorName);
  }
  return children;
}

function ClinicJoin({ onReady }: { onReady: () => void }) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"open" | "join">("open");
  const [name, setName] = useState("AsexiA Castellana");
  const [code, setCode] = useState("");
  const [role, setRole] = useState<"recepcion" | "medico">("recepcion");
  const [doctor, setDoctor] = useState(DOCTORS[0]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "open") await createClinic({ data: { name } });
      else await joinClinic({ data: { code, role, doctorName: doctor } });
      await adoptClinicBook();
      await queryClient.invalidateQueries();
      onReady();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se ha podido entrar en la clínica.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-4 py-10 text-ink">
      <form onSubmit={(event) => void submit(event)} className="w-full max-w-md rounded-xl bg-surface p-5 shadow-border">
        <AsexiAMark className="size-9" />
        <p className="label-kicker mt-4">Libro de la clínica</p>
        <h1 className="mt-1 font-display text-3xl font-medium tracking-tight">¿De qué clínica entra?</h1>
        <p className="mt-2 text-sm text-ink-muted">
          La primera persona abre la clínica como dirección. El resto entra con el código, como recepción o como médico.
        </p>
        <div className="mt-4 flex gap-2">
          {(
            [
              ["open", "Abrir clínica"],
              ["join", "Tengo un código"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className={`h-10 rounded-full px-3 text-sm font-medium ${mode === id ? "bg-accent text-accent-fg" : "bg-bg text-ink-muted"}`}
            >
              {label}
            </button>
          ))}
        </div>
        {mode === "open" ? (
          <label className="mt-4 block text-sm">
            <span className="text-ink-muted">Nombre</span>
            <Input className="mt-1" value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            <label className="text-sm">
              <span className="text-ink-muted">Código</span>
              <Input className="mt-1 uppercase" value={code} onChange={(event) => setCode(event.target.value)} required autoCapitalize="characters" />
            </label>
            <div className="flex gap-2">
              {(
                [
                  ["recepcion", "Recepción"],
                  ["medico", "Médico"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setRole(id)}
                  className={`h-10 rounded-full px-3 text-sm font-medium ${role === id ? "bg-ink text-accent-fg" : "bg-bg text-ink-muted"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            {role === "medico" ? (
              <label className="text-sm">
                <span className="text-ink-muted">Entra como</span>
                <select
                  value={doctor}
                  onChange={(event) => setDoctor(event.target.value)}
                  className="mt-1 h-11 w-full rounded-md bg-bg px-3 text-sm text-ink shadow-border"
                >
                  {DOCTORS.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>
        )}
        {error ? <p className="mt-3 text-sm text-[#8A3B24]">{error}</p> : null}
        <Button className="mt-4 w-full" disabled={busy} type="submit">
          {busy ? "Entrando…" : mode === "open" ? "Abrir el libro" : "Unirme"}
        </Button>
      </form>
    </main>
  );
}
