import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as useUiStore, l as formatMoney, s as api } from "./router-DMvJ3L8T.mjs";
import { t as Skeleton } from "./skeleton-BQdK-Qwf.mjs";
import { a as startOfDay, i as sameDay, r as occupancy, t as addDays } from "./occupancy-BwI6lpZa.mjs";
import { r as format, t as es } from "../_libs/date-fns.mjs";
import { n as economics } from "./economics-BmdMdSOl.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mandos-Cy90SRYC.js
var import_jsx_runtime = require_jsx_runtime();
function cashDay(patients, day) {
	let collected = 0;
	let expected = 0;
	for (const patient of patients) for (const payment of patient.payments ?? []) {
		if (payment.status === "cobrado" && payment.paidAt && sameDay(payment.paidAt, day)) collected += payment.amount;
		if (payment.status === "pendiente" && sameDay(payment.dueAt, day)) expected += payment.amount;
	}
	return {
		collected,
		expected
	};
}
function Dashboard() {
	const role = useUiStore((state) => state.role);
	const pipeline = useQuery({
		queryKey: ["pipeline"],
		queryFn: () => api.listPipeline()
	});
	const catalog = useQuery({
		queryKey: ["catalog"],
		queryFn: () => api.getCatalog()
	});
	const alarms = useQuery({
		queryKey: ["alarms"],
		queryFn: () => api.listAlarms()
	});
	if (role !== "direccion") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "rounded-xl bg-surface px-4 py-8 text-sm text-ink-muted shadow-border",
		children: "El cuadro de mandos es de dirección. Recepción y consulta trabajan desde la agenda."
	});
	if (pipeline.isPending || catalog.isPending || !pipeline.data || !catalog.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-3",
		children: Array.from({ length: 4 }).map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 rounded-xl" }, index))
	});
	const today = startOfDay(/* @__PURE__ */ new Date());
	const todayOcc = occupancy(pipeline.data, catalog.data, today);
	const week = Array.from({ length: 7 }, (_, index) => {
		const day = addDays(today, index);
		return {
			day,
			...occupancy(pipeline.data, catalog.data, day)
		};
	});
	const money = pipeline.data.reduce((sum, patient) => {
		const row = economics(patient);
		return {
			total: sum.total + row.total,
			collected: sum.collected + row.collected,
			pending: sum.pending + row.pending
		};
	}, {
		total: 0,
		collected: 0,
		pending: 0
	});
	const byActivity = /* @__PURE__ */ new Map();
	for (const patient of pipeline.data) for (const visit of patient.visits ?? []) {
		if (visit.status === "cancelada") continue;
		byActivity.set(visit.activityName, (byActivity.get(visit.activityName) ?? 0) + 1);
	}
	const mix = [...byActivity.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
	const maxBooked = Math.max(...week.map((day) => day.booked), 1);
	const maxMix = mix[0]?.[1] ?? 1;
	const caja = cashDay(pipeline.data, today);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "label-kicker",
					children: "Cuadro de mandos"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-medium tracking-tight text-ink",
					children: "Control de la clínica"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-2xl text-sm text-ink-muted",
					children: "Ocupación de salas, caja y lo que hay que avisar hoy."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
						label: "Hoy en salas",
						value: todayOcc.closed ? "Cerrado" : `${todayOcc.booked} min`,
						hint: todayOcc.closed ? "Sin horario" : `${todayOcc.visits.length} citas · ${Math.round(todayOcc.ratio * 100)}% de la capacidad`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
						label: "Caja de hoy",
						value: formatMoney(caja.collected),
						hint: `Previsto ${formatMoney(caja.expected)}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
						label: "Citas hoy",
						value: String(todayOcc.visits.length),
						hint: `${catalog.data.rooms.length} salas`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
						label: "Alarmas",
						value: String(alarms.data?.length ?? "…"),
						hint: "Para actuar"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl bg-surface p-4 shadow-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "label-kicker",
					children: "Próximos 7 días"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4 flex flex-col gap-3",
					children: week.map((day) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "grid grid-cols-[5.5rem_1fr_auto] items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-ink-muted",
								children: format(day.day, "EEE d", { locale: es })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "h-2 overflow-hidden rounded-full bg-bg",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block h-full rounded-full bg-accent",
									style: { width: `${Math.round(day.booked / maxBooked * 100)}%` }
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs tabular-nums text-ink-subtle",
								children: day.closed ? "Cerrado" : `${day.booked} min`
							})
						]
					}, day.day.toISOString()))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl bg-surface p-4 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "label-kicker",
						children: "Actividad"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 flex flex-col gap-3",
						children: mix.map(([name, count]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "grid grid-cols-[1fr_auto] items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-sm text-ink",
								children: name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-1 block h-2 overflow-hidden rounded-full bg-bg",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block h-full rounded-full bg-accent",
									style: { width: `${Math.round(count / maxMix * 100)}%` }
								})
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs tabular-nums text-ink-subtle",
								children: count
							})]
						}, name))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-4 text-sm text-ink-muted",
						children: [
							"Contrato ",
							formatMoney(money.total),
							". El pipeline comercial sigue en el",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/",
								className: "font-medium text-accent",
								children: "tablero"
							}),
							"."
						]
					})
				]
			})
		]
	});
}
function Tile({ label, value, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-surface px-4 py-3 shadow-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-wide text-ink-subtle",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-display text-2xl font-medium tracking-tight text-ink tabular-nums",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-ink-muted",
				children: hint
			})
		]
	});
}
var SplitComponent = Dashboard;
//#endregion
export { SplitComponent as component };
