import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AsexiAMark } from "@/components/brand/mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: Login });

const BEARER_KEY = "grok-auth.bearer-token";

function Login() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result =
        mode === "up"
          ? await authClient.signUp.email({ email, password, name, callbackURL: "/" })
          : await authClient.signIn.email({ email, password, callbackURL: "/" });
      if (result.error) {
        setError(result.error.message ?? "No se ha podido entrar.");
        return;
      }
      const token = (result.data as { token?: string } | null)?.token;
      if (token) window.sessionStorage.setItem(BEARER_KEY, token);
      window.location.assign("/");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se ha podido entrar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-4 py-10 text-ink">
      <div className="w-full max-w-sm">
        <AsexiAMark className="size-9" />
        <p className="label-kicker mt-4">AsexiA Suite 360</p>
        <h1 className="mt-1 font-display text-3xl font-medium tracking-tight">Entre con su clave</h1>
        <p className="mt-2 text-sm text-ink-muted">Dirección, recepción y médico usan la misma clínica. Cada uno entra con la suya.</p>
        {authEnabled ? (
          <>
            <form onSubmit={(event) => void submit(event)} className="mt-5 flex flex-col gap-3">
              {mode === "up" ? (
                <label className="text-sm">
                  <span className="text-ink-muted">Nombre</span>
                  <Input className="mt-1" value={name} onChange={(event) => setName(event.target.value)} required />
                </label>
              ) : null}
              <label className="text-sm">
                <span className="text-ink-muted">Correo</span>
                <Input className="mt-1" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </label>
              <label className="text-sm">
                <span className="text-ink-muted">Clave</span>
                <Input className="mt-1" type="password" autoComplete={mode === "up" ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} />
              </label>
              {error ? <p className="text-sm text-[#8A3B24]">{error}</p> : null}
              <Button type="submit" disabled={busy}>
                {busy ? "Entrando…" : mode === "up" ? "Crear cuenta" : "Entrar"}
              </Button>
              <button type="button" className="text-sm text-ink-muted underline-offset-4 hover:underline" onClick={() => setMode(mode === "up" ? "in" : "up")}>
                {mode === "up" ? "Ya tengo clave" : "Crear una cuenta"}
              </button>
            </form>
            <div className="mt-5 flex flex-col gap-2">
              {GROK_PROVIDERS.map((provider) => (
                <Button key={provider.providerId} type="button" variant="outline" onClick={() => void signIn(provider.providerId, { callbackURL: "/" })}>
                  Continuar con {provider.label}
                </Button>
              ))}
            </div>
          </>
        ) : (
          <p className="mt-4 text-sm text-ink-muted">El acceso con clave está apagado.</p>
        )}
      </div>
    </main>
  );
}
