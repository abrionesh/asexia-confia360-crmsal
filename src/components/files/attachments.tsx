import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, type ClinicFile, type FileTarget } from "@/lib/api";
import { Button } from "@/components/ui/button";

const MAX_BYTES = 200_000;

export function Attachments({
  target,
  files,
  title = "Documentos",
}: {
  target: FileTarget;
  files: ClinicFile[];
  title?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["patient"] });
    void queryClient.invalidateQueries({ queryKey: ["pipeline"] });
    void queryClient.invalidateQueries({ queryKey: ["catalog"] });
    void queryClient.invalidateQueries({ queryKey: ["timeline"] });
  };
  const add = useMutation({
    mutationFn: (file: Omit<ClinicFile, "id" | "addedAt">) => api.attachFile(target, file),
    onSuccess: (saved) => {
      if (!saved) {
        toast.error("Guarde la ficha antes de adjuntar");
        return;
      }
      refresh();
      toast.success("Documento en la ficha");
    },
  });
  const remove = useMutation({
    mutationFn: (fileId: string) => api.removeFile(target, fileId),
    onSuccess: () => refresh(),
  });

  function pick(list: FileList | null) {
    const file = list?.[0];
    if (!file) return;
    if (file.size > MAX_BYTES) {
      add.mutate({ name: file.name, mime: file.type || "application/octet-stream", size: file.size });
      toast.message("Archivo grande: queda el nombre, no la copia, para no llenar el teléfono.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      add.mutate({
        name: file.name,
        mime: file.type || "application/octet-stream",
        size: file.size,
        dataUrl: typeof reader.result === "string" ? reader.result : undefined,
      });
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-ink-subtle">{title}</p>
        <Button type="button" size="sm" variant="outline" disabled={add.isPending} onClick={() => input.current?.click()}>
          Adjuntar
        </Button>
        <input
          ref={input}
          type="file"
          accept="image/*,.pdf,.txt,.doc,.docx"
          className="sr-only"
          aria-label={`Adjuntar en ${title}`}
          onChange={(event) => {
            pick(event.target.files);
            event.target.value = "";
          }}
        />
      </div>
      {files.length === 0 ? (
        <p className="mt-2 text-xs text-ink-muted">Ningún documento.</p>
      ) : (
        <ul className="mt-2 flex flex-col gap-2">
          {files.map((file) => (
            <li key={file.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0">
                <span className="block truncate text-ink">{file.name}</span>
                <span className="text-xs text-ink-subtle">{Math.max(1, Math.round(file.size / 1024))} KB{file.dataUrl ? "" : " · sin copia local"}</span>
              </span>
              <span className="flex shrink-0 gap-2">
                {file.dataUrl ? (
                  <a href={file.dataUrl} download={file.name} className="text-xs font-medium text-accent">
                    Abrir
                  </a>
                ) : null}
                <button type="button" className="text-xs font-medium text-ink-muted" onClick={() => remove.mutate(file.id)}>
                  Quitar
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
