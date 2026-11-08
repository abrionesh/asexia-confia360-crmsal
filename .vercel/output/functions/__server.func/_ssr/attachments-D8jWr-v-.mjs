import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as useQueryClient, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { r as toast } from "../_libs/sonner.mjs";
import { a as Button, c as getClinicFile, l as putClinicFile, p as api } from "./router-BpXxcPG9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/attachments-D8jWr-v-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DB = "asexia-files";
function openDb() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB, 1);
		request.onupgradeneeded = () => request.result.createObjectStore("files");
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}
async function saveLocalFile(id, dataUrl) {
	const db = await openDb();
	await new Promise((resolve, reject) => {
		const tx = db.transaction("files", "readwrite");
		tx.objectStore("files").put(dataUrl, id);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
	db.close();
}
async function readLocalFile(id) {
	const db = await openDb();
	const value = await new Promise((resolve, reject) => {
		const request = db.transaction("files", "readonly").objectStore("files").get(id);
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
	db.close();
	return value;
}
var MAX_BYTES = 15e5;
function Attachments({ target, files, title = "Documentos" }) {
	const input = (0, import_react.useRef)(null);
	const queryClient = useQueryClient();
	const refresh = () => {
		queryClient.invalidateQueries({ queryKey: ["patient"] });
		queryClient.invalidateQueries({ queryKey: ["pipeline"] });
		queryClient.invalidateQueries({ queryKey: ["catalog"] });
		queryClient.invalidateQueries({ queryKey: ["timeline"] });
	};
	const add = useMutation({
		mutationFn: async (file) => {
			const saved = await api.attachFile(target, {
				name: file.name,
				mime: file.mime,
				size: file.size
			});
			if (saved && file.dataUrl) {
				await saveLocalFile(saved.id, file.dataUrl);
				try {
					await putClinicFile({ data: {
						id: saved.id,
						dataUrl: file.dataUrl
					} });
				} catch {}
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
		}
	});
	const remove = useMutation({
		mutationFn: (fileId) => api.removeFile(target, fileId),
		onSuccess: () => refresh()
	});
	function pick(list) {
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
				dataUrl: typeof reader.result === "string" ? reader.result : void 0
			});
		};
		reader.readAsDataURL(file);
	}
	async function openFile(file) {
		let url = await readLocalFile(file.id).catch(() => void 0);
		if (!url) {
			try {
				url = await getClinicFile({ data: { id: file.id } }) ?? void 0;
			} catch {
				url = void 0;
			}
			if (url) await saveLocalFile(file.id, url).catch(() => void 0);
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium text-ink-subtle",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "sm",
					variant: "outline",
					disabled: add.isPending,
					onClick: () => input.current?.click(),
					children: "Adjuntar"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: input,
					type: "file",
					accept: "image/*,.pdf,.txt,.doc,.docx",
					className: "sr-only",
					"aria-label": `Adjuntar en ${title}`,
					onChange: (event) => {
						pick(event.target.files);
						event.target.value = "";
					}
				})
			]
		}), files.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-xs text-ink-muted",
			children: "Ningún documento."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-2 flex flex-col gap-2",
			children: files.map((file) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-center justify-between gap-3 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block truncate text-ink",
						children: file.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs text-ink-subtle",
						children: [Math.max(1, Math.round(file.size / 1024)), " KB"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex shrink-0 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-xs font-medium text-accent",
						onClick: () => void openFile(file),
						children: "Abrir"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-xs font-medium text-ink-muted",
						onClick: () => remove.mutate(file.id),
						children: "Quitar"
					})]
				})]
			}, file.id))
		})]
	});
}
//#endregion
export { Attachments as t };
