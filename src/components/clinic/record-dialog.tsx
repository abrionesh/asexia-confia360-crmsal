import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";

export function RecordDialog({
  open,
  title,
  description,
  onOpenChange,
  children,
}: {
  open: boolean;
  title: string;
  description: string;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/25" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-2xl bg-bg shadow-overlay outline-none sm:inset-x-auto sm:top-8 sm:bottom-8 sm:left-1/2 sm:w-[40rem] sm:-translate-x-1/2 sm:rounded-xl">
          <header className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
            <div>
              <Dialog.Title className="font-display text-xl font-medium text-ink">{title}</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-ink-muted">{description}</Dialog.Description>
            </div>
            <Dialog.Close className="inline-flex h-10 shrink-0 items-center rounded-full px-3 text-sm font-medium text-ink-muted">
              Cerrar
            </Dialog.Close>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
