import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, type ClinicFile, type FileTarget } from "@/lib/api";
import { getClinicFile, putClinicFile } from "@/lib/api/book.functions";
import { readLocalFile, saveLocalFile } from "@/lib/files-db";
import { Button } from "@/components/ui/button";

const MAX_BYTES = 1_500_000;

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
    mutationFn: async (file: Omit<ClinicFile, "id" | "addedAt">) => {
      const saved = await api.attachFile(target, { name: file.name, mime: file.mime, size: file.size });
      if (saved && file.dataUrl) {
        await saveLocalFile(saved.id, file.dataUrl);
        try {
          await putClinicFile({ data: { id: saved.id, dataUrl: file.dataUrl } });
        } catch {
          /* the copy stays on this phone */
        }
      }
      return saved;
    },
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
      toast.error("El archivo pasa de 1,5 MB. No se adjunta.");
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

  async function openFile(file: ClinicFile) {
    let url = await readLocalFile(file.id).catch(() => undefined);
    if (!url) {
      try {
        url = (await getClinicFile({ data: { id: file.id } })) ?? undefined;
      } catch {
        url = undefined;
      }
      if (url) await saveLocalFile(file.id, url).catch(() => undefined);
    }
    if (!url) {
      toast.message("El documento aún no está en este teléfono.");
      return;
    }
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    link.click();
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
                <span className="text-xs text-ink-subtle">{Math.max(1, Math.round(file.size / 1024))} KB</span>
              </span>
              <span className="flex shrink-0 gap-2">
                <button type="button" className="text-xs font-medium text-accent" onClick={() => void openFile(file)}>
                  Abrir
                </button>
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
