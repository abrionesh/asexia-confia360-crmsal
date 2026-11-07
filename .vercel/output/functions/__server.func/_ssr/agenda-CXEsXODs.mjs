import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as useUiStore, l as formatMoney, s as api } from "./router-DMvJ3L8T.mjs";
import { t as Skeleton } from "./skeleton-BQdK-Qwf.mjs";
import { a as startOfDay, i as sameDay, n as allPayments, r as occupancy, t as addDays } from "./occupancy-BwI6lpZa.mjs";
import { t as Badge } from "./badge-CGUhCUpP.mjs";
import { r as format, t as es } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/agenda-CXEsXODs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUS = {
	programada: "Programada",
	realizada: "Realizada",
	cancelada: "Cancelada"
};
function Agenda() {
	const pipeline = useQuery({
		queryKey: ["pipeline"],
		queryFn: () => api.listPipeline()
	});
	const catalog = useQuery({
		queryKey: ["catalog"],
		queryFn: () => api.getCatalog()
	});
	const [offset, setOffset] = (0, import_react.useState)(0);
	const role = useUiStore((state) => state.role);
	const doctor = useUiStore((state) => state.doctor);
	const setDoctor = useUiStore((state) => state.setDoctor);
	const today = startOfDay(/* @__PURE__ */ new Date());
	const days = Array.from({ length: 7 }, (_, index) => addDays(today, index));
	const selected = days[offset] ?? today;
	if (pipeline.isPending || catalog.isPending || !pipeline.data || !catalog.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 rounded-xl" });
	const day = occupancy(pipeline.data, catalog.data, selected);
	const visible = role === "medico" ? day.visits.filter((visit) => visit.professional === doctor) : day.visits;
	const payments = allPayments(pipeline.data).filter((payment) => sameDay(payment.dueAt, selected));
	const hours = catalog.data.hours.find((item) => item.day === selected.getDay());
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "label-kicker",
					children: "Agenda"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-medium tracking-tight text-ink",
					children: "Citas y cobros"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-ink-muted",
					children: hours?.closed ? "Día cerrado." : `Abierto ${hours?.open}–${hours?.close}. ${catalog.data.rooms.length} salas.`
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2 overflow-x-auto pb-1",
				children: days.map((date, index) => {
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setOffset(index),
						className: `h-16 min-w-16 shrink-0 rounded-xl px-3 text-left ${index === offset ? "bg-accent text-accent-fg" : "bg-surface text-ink shadow-border"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-2xs uppercase",
							children: format(date, "EEE", { locale: es })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-xl",
							children: format(date, "d")
						})]
					}, date.toISOString());
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-ink-muted",
				children: [
					"Ocupación ",
					day.closed ? "—" : `${Math.round(day.ratio * 100)}%`,
					" · ",
					day.booked,
					" min reservados",
					role === "medico" ? ` · ${doctor}` : ""
				]
			}),
			role === "medico" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2",
				children: ["Dra. Elena Marín", "Dr. Íñigo Salas"].map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setDoctor(name),
					className: `h-10 rounded-full px-3 text-xs font-medium ${doctor === name ? "bg-accent text-accent-fg" : "bg-surface text-ink shadow-border"}`,
					children: name
				}, name))
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "flex flex-col gap-3",
				children: visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-xl bg-surface px-4 py-6 text-sm text-ink-muted shadow-border",
					children: "Sin citas este día."
				}) : visible.map((visit) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-xl bg-surface p-4 shadow-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: visit.status === "realizada" ? "success" : "ink",
								children: STATUS[visit.status]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-ink-subtle",
								children: format(new Date(visit.at), "HH:mm")
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/pacientes/$id",
							params: { id: visit.patientId },
							className: "mt-2 block text-sm font-medium text-ink",
							children: visit.patientName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-ink",
							children: visit.activityName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-ink-muted",
							children: [
								visit.roomName,
								" · ",
								visit.durationMin,
								" min · ",
								visit.professional
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm tabular-nums text-ink",
							children: formatMoney(visit.price)
						}),
						visit.notes ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-relaxed text-ink-muted",
							children: visit.notes
						}) : null
					]
				}, visit.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl bg-surface p-4 shadow-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "label-kicker",
					children: "Pagos del día"
				}), payments.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-ink-muted",
					children: "No hay cobros previstos."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 flex flex-col gap-3",
					children: payments.map((payment) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-start justify-between gap-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/pacientes/$id",
							params: { id: payment.patientId },
							className: "font-medium text-ink",
							children: payment.patientName
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "block text-ink-muted",
							children: [
								payment.concept,
								" · ",
								payment.status
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular-nums text-ink",
							children: formatMoney(payment.amount)
						})]
					}, payment.id))
				})]
			})
		]
	});
}
var SplitComponent = Agenda;
//#endregion
export { SplitComponent as component };
