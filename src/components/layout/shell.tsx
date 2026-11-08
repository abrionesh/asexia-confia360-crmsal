import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Toaster } from "sonner";
import { AsexiAMark } from "@/components/brand/mark";
import { CopilotDrawer, CopilotFab } from "@/components/copilot/copilot";
import { StaffGate } from "@/components/layout/access";
import { StatusChrome } from "@/components/layout/status-chrome";
import { VoiceBar } from "@/components/layout/voice-bar";
import { Input } from "@/components/ui/input";
import { UserButton } from "@/lib/auth/gates";
import { useUiStore } from "@/lib/store/ui";
import { ClinicSync } from "@/lib/api/sync";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const bare = pathname === "/login" || pathname.startsWith("/p/");

  if (bare) {
    return (
      <div className="min-h-dvh bg-bg text-ink">
        {children}
        <Toaster position="top-center" toastOptions={{ className: "!bg-surface !text-ink !border-border !shadow-overlay !font-sans" }} />
      </div>
    );
  }

  return (
    <StaffGate>
      <ClinicChrome pathname={pathname}>{children}</ClinicChrome>
    </StaffGate>
  );
}

function ClinicChrome({ pathname, children }: { pathname: string; children: ReactNode }) {
  const isHome = pathname === "/";
  const search = useUiStore((state) => state.search);
  const setSearch = useUiStore((state) => state.setSearch);
  const role = useUiStore((state) => state.role);
  const clinicCode = useUiStore((state) => state.clinicCode);
  const clinicName = useUiStore((state) => state.clinicName);
  const roleLabel = role === "direccion" ? "Dirección" : role === "recepcion" ? "Recepción" : "Médico";
  const links = [
    { to: "/", label: "Tablero", roles: ["direccion", "recepcion"] },
    { to: "/actuar", label: "Actuar", roles: ["direccion", "recepcion", "medico"] },
    { to: "/mandos", label: "Mandos", roles: ["direccion"] },
    { to: "/agenda", label: "Agenda", roles: ["direccion", "recepcion", "medico"] },
    { to: "/caja", label: "Caja", roles: ["direccion", "recepcion"] },
    { to: "/admin", label: "Admin", roles: ["direccion"] },
  ] as const;

  return (
    <div className="min-h-dvh bg-bg text-ink">
      <header className="sticky top-0 z-20 border-b border-border/80 bg-bg/90 backdrop-blur-md">
        <StatusChrome />
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <AsexiAMark className="size-8 shrink-0" />
            <span className="min-w-0">
              <span className="block font-display text-lg leading-none font-medium tracking-tight text-ink">
                AsexiA
              </span>
              <span className="label-kicker mt-0.5 block">Suite 360</span>
            </span>
          </Link>
          <div className="ml-auto flex min-w-0 items-center gap-3">
            <span className="hidden text-right sm:block">
              <span className="block truncate text-xs text-ink-muted">{clinicName || "Clínica"} · {roleLabel}</span>
              {clinicCode ? <span className="block text-2xs tracking-wide text-ink-subtle">Código {clinicCode}</span> : null}
            </span>
            <UserButton />
          </div>
        </div>
        <p className="mx-auto max-w-7xl px-4 pb-2 text-xs text-ink-muted sm:hidden">
          {roleLabel}
          {clinicCode ? ` · código ${clinicCode}` : ""}
        </p>

        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-3 sm:px-6">
          {links.filter((link) => (link.roles as readonly string[]).includes(role)).map((link) => {
            const active = link.to === "/" ? pathname === "/" : pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "inline-flex h-10 shrink-0 items-center rounded-full px-3 text-sm font-medium",
                  active ? "bg-accent text-accent-fg" : "bg-surface text-ink-muted shadow-border",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {isHome ? (
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 pb-3 sm:px-6">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-subtle" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar paciente, tratamiento o responsable"
                className="pl-10"
                aria-label="Buscar en el pipeline"
              />
            </div>
          </div>
        ) : null}
        <ClinicSync />
      </header>

      <main className={cn("mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6", "pb-40")}>
        {children}
      </main>

      <CopilotFab />
      <CopilotDrawer />
      <VoiceBar />
      <Toaster
        position="top-center"
        toastOptions={{
          className: "!bg-surface !text-ink !border-border !shadow-overlay !font-sans",
        }}
      />
    </div>
  );
}