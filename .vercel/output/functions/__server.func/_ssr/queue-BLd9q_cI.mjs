import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { f as MessageCircle, m as Mail, u as Phone } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { r as toast } from "../_libs/sonner.mjs";
import { i as Button, l as api } from "./router-OxFF0fHE.mjs";
import { t as Skeleton } from "./skeleton-CM610tTB.mjs";
import { t as Badge } from "./badge-FWHWQG4C.mjs";
import { n as formatDistanceToNow, t as es } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/queue-BLd9q_cI.js
var import_jsx_runtime = require_jsx_runtime();
var KIND_LABEL = {
	reminder: "Cita",
	prep: "Preparación",
	silence: "Silencio",
	aftercare: "Cuidado",
	review: "Revisión",
	nurture: "Seguimiento",
	birthday: "Cumpleaños",
	payment: "Cobro",
	custom: "Aviso",
	satisfaction: "48 h"
};
var KIND_TONE = {
	reminder: "ink",
	prep: "warning",
	silence: "warning",
	aftercare: "voice",
	review: "accent",
	nurture: "muted",
	birthday: "accent",
	payment: "success",
	custom: "ink",
	satisfaction: "voice"
};
function AlarmStack({ alarms, layout, empty }) {
	const queryClient = useQueryClient();
	const resolve = useResolveAlarm();
	if (alarms.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "rounded-xl bg-surface px-4 py-3 text-sm text-ink-muted shadow-border",
		children: empty
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: layout === "strip" ? "flex gap-3 overflow-x-auto pb-1" : "flex flex-col gap-3",
		children: alarms.map((alarm) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
			className: `flex flex-col rounded-xl bg-surface p-3 shadow-border ${layout === "strip" ? "w-72 shrink-0" : ""}`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: KIND_TONE[alarm.kind],
						children: KIND_LABEL[alarm.kind]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-2xs text-ink-subtle",
						children: alarm.status === "due" ? "Vencida" : "Programada"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/pacientes/$id",
					params: { id: alarm.patientId },
					className: "mt-2 truncate text-sm font-medium text-ink",
					children: alarm.patientName
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 text-sm text-ink",
					children: alarm.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 line-clamp-2 text-xs text-ink-muted",
					children: alarm.reason
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlarmActions, {
						alarm,
						busy: resolve.isPending,
						onSend: (via) => {
							openOutbound(alarm, via);
							resolve.mutate({
								id: alarm.id,
								status: "sent"
							}, { onSuccess: () => {
								toast.success(`${alarm.patientName} · mensaje listo`);
								queryClient.invalidateQueries({ queryKey: ["timeline", alarm.patientId] });
							} });
						},
						onDismiss: () => resolve.mutate({
							id: alarm.id,
							status: "dismissed"
						})
					})
				})
			]
		}, alarm.id))
	});
}
function PatientAlarms({ patientId }) {
	const queryClient = useQueryClient();
	const query = useQuery({
		queryKey: ["alarms", patientId],
		queryFn: () => api.listPatientAlarms(patientId)
	});
	const resolve = useResolveAlarm();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl bg-surface p-4 shadow-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "label-kicker",
				children: "Alarmas de la ficha"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-1 font-display text-xl font-medium text-ink",
				children: "Qué avisar"
			}),
			query.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 w-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 w-full" })]
			}) : (query.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-ink-muted",
				children: "Nada vencido ni previsto en 24 h. Un cuidado futuro aparece aquí el día antes."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 flex flex-col gap-4",
				children: (query.data ?? []).map((alarm) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "border-t border-border pt-4 first:border-0 first:pt-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: KIND_TONE[alarm.kind],
									children: KIND_LABEL[alarm.kind]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: alarm.status === "sent" ? "success" : alarm.status === "due" ? "warning" : "muted",
									children: alarm.status === "sent" ? "Enviado" : alarm.status === "due" ? "Vencida" : "Programada"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-ink-subtle",
									children: formatDistanceToNow(new Date(alarm.dueAt), {
										addSuffix: true,
										locale: es
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm font-medium text-ink",
							children: alarm.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-ink-muted",
							children: alarm.reason
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 rounded-lg bg-bg px-3 py-2 text-sm text-ink",
							children: alarm.draft
						}),
						alarm.status === "sent" ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 flex flex-wrap gap-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlarmActions, {
								alarm,
								busy: resolve.isPending,
								onSend: (via) => {
									openOutbound(alarm, via);
									resolve.mutate({
										id: alarm.id,
										status: "sent"
									}, { onSuccess: () => {
										toast.success("Queda en el timeline");
										queryClient.invalidateQueries({ queryKey: ["timeline", patientId] });
									} });
								},
								onDismiss: () => resolve.mutate({
									id: alarm.id,
									status: "dismissed"
								})
							})
						})
					]
				}, alarm.id))
			})
		]
	});
}
function AlarmActions({ alarm, busy, onSend, onDismiss }) {
	if (alarm.channel === "internal") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		size: "sm",
		disabled: busy,
		onClick: () => onSend("call"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-4" }), "Registrar llamada"]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		size: "sm",
		variant: "ghost",
		disabled: busy,
		onClick: onDismiss,
		children: "Descartar"
	})] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			size: "sm",
			disabled: busy,
			onClick: () => onSend("whatsapp"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-4" }), "WhatsApp"]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			size: "sm",
			variant: "secondary",
			disabled: busy,
			onClick: () => onSend("email"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-4" }), "Correo"]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			size: "sm",
			variant: "ghost",
			disabled: busy,
			onClick: onDismiss,
			children: "Descartar"
		})
	] });
}
function useResolveAlarm() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, status }) => api.resolveAlarm(id, status),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["alarms"] });
		}
	});
}
function openOutbound(alarm, via) {
	if (via === "call") return;
	if (via === "whatsapp") {
		const url = `https://wa.me/${alarm.phone.replace(/\D/g, "")}?text=${encodeURIComponent(alarm.draft)}`;
		window.open(url, "_blank", "noopener,noreferrer");
		return;
	}
	const href = `mailto:${encodeURIComponent(alarm.email)}?subject=${encodeURIComponent(`AsexiA · ${alarm.title}`)}&body=${encodeURIComponent(alarm.draft)}`;
	window.location.href = href;
}
//#endregion
export { PatientAlarms as n, AlarmStack as t };
