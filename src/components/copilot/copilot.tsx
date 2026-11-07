import { useEffect, useRef, useState, type FormEvent } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useQuery } from "@tanstack/react-query";
import { Send, Sparkles, X } from "lucide-react";
import { api, COPILOT_SUGGESTIONS, type CopilotMessage } from "@/lib/api";
import { useUiStore } from "@/lib/store/ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CopilotFab() {
  const open = useUiStore((state) => state.copilotOpen);
  const setOpen = useUiStore((state) => state.setCopilotOpen);

  if (open) return null;

  return (
    <Button
      variant="fab"
      size="pill"
      className="fab-anchor fixed z-30 gap-2.5"
      onClick={() => setOpen(true)}
    >
      <Sparkles className="size-4" />
      Copiloto IA
    </Button>
  );
}

export function CopilotDrawer() {
  const open = useUiStore((state) => state.copilotOpen);
  const setOpen = useUiStore((state) => state.setCopilotOpen);
  const messages = useUiStore((state) => state.copilotMessages);
  const busy = useUiStore((state) => state.copilotBusy);
  const pushMessage = useUiStore((state) => state.pushMessage);
  const setBusy = useUiStore((state) => state.setCopilotBusy);
  const [draft, setDraft] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  const pipelineQuery = useQuery({
    queryKey: ["pipeline"],
    queryFn: () => api.listPipeline(),
    enabled: open,
  });

  useEffect(() => {
    const node = scroller.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages, busy, open]);

  async function send(text: string) {
    const prompt = text.trim();
    if (!prompt || busy) return;
    const userMessage: CopilotMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: prompt,
      at: new Date().toISOString(),
    };
    pushMessage(userMessage);
    setDraft("");
    setBusy(true);
    try {
      const reply = await api.askCopilot(prompt, pipelineQuery.data ?? []);
      pushMessage(reply);
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void send(draft);
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/20 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <Dialog.Content
          className={cn(
            "fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-surface shadow-overlay",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
            "duration-slow",
          )}
        >
          <header className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <Dialog.Title className="font-display text-lg font-medium text-ink">
                Copiloto IA
              </Dialog.Title>
              <Dialog.Description className="text-xs text-ink-muted">
                Asistente de dirección · AsexiA Castellana
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Cerrar copiloto">
                <X className="size-4" />
              </Button>
            </Dialog.Close>
          </header>

          <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
            {messages.map((message) => (
              <Bubble key={message.id} message={message} />
            ))}
            {busy ? (
              <div className="flex gap-1.5 px-1 py-2" aria-label="El copiloto está escribiendo">
                <span className="size-1.5 animate-pulse rounded-full bg-ink-subtle" />
                <span className="size-1.5 animate-pulse rounded-full bg-ink-subtle delay-75" />
                <span className="size-1.5 animate-pulse rounded-full bg-ink-subtle delay-150" />
              </div>
            ) : null}
          </div>

          <div className="border-t border-border px-5 py-3">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {COPILOT_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => void send(suggestion)}
                  className="h-8 shrink-0 rounded-full bg-bg px-3 text-xs text-ink-muted transition-colors duration-quick hover:bg-accent-soft hover:text-accent"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <form onSubmit={onSubmit} className="flex items-center gap-2">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Pregunte al copiloto…"
                className="h-11 flex-1 rounded-md bg-bg px-3 text-sm text-ink outline-none ring-0 placeholder:text-ink-subtle focus-visible:ring-2 focus-visible:ring-accent/35"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!draft.trim() || busy}
                aria-label="Enviar"
              >
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Bubble({ message }: { message: CopilotMessage }) {
  const mine = message.role === "user";
  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[90%] whitespace-pre-wrap rounded-lg px-3.5 py-2.5 text-sm leading-relaxed",
          mine
            ? "rounded-br-xs bg-accent text-accent-fg"
            : "rounded-bl-xs bg-bg text-ink",
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
