import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as useUiStore, c as activityCost, l as api, p as formatMoney } from "./router-OxFF0fHE.mjs";
import { i as occupancy, r as allVisits } from "./occupancy-C2b47X8l.mjs";
import { t as Skeleton } from "./skeleton-CM610tTB.mjs";
import { r as format, t as es } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mandos-B_P9-PqH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function periodRange(id, from, to, now = /* @__PURE__ */ new Date()) {
	const start = new Date(now);
	start.setHours(0, 0, 0, 0);
	if (id === "hoy") {
		const end = new Date(start);
		end.setDate(end.getDate() + 1);
		return {
			start,
			end
		};
	}
	if (id === "semana") {
		const end = new Date(start);
		end.setDate(end.getDate() + 7);
		return {
			start,
			end
		};
	}
	if (id === "mes") return {
		start: new Date(start.getFullYear(), start.getMonth(), 1),
		end: new Date(start.getFullYear(), start.getMonth() + 1, 1)
	};
	const rangeStart = new Date(from);
	rangeStart.setHours(0, 0, 0, 0);
	const rangeEnd = new Date(to);
	rangeEnd.setHours(0, 0, 0, 0);
	rangeEnd.setDate(rangeEnd.getDate() + 1);
	return {
		start: rangeStart,
		end: rangeEnd
	};
}
function inside(iso, start, end) {
	const time = new Date(iso).getTime();
	return time >= start.getTime() && time < end.getTime();
}
function buildKpis(patients, catalog, start, end) {
	const visits = allVisits(patients).filter((visit) => inside(visit.at, start, end));
	const attended = visits.filter((visit) => visit.status !== "cancelada" && visit.status !== "ausente");
	const clients = /* @__PURE__ */ new Map();
	for (const visit of attended) {
		const current = clients.get(visit.patientId) ?? {
			id: visit.patientId,
			name: visit.patientName,
			visits: 0
		};
		current.visits += 1;
		clients.set(visit.patientId, current);
	}
	const treatments = /* @__PURE__ */ new Map();
	let income = 0;
	let cost = 0;
	for (const visit of attended) {
		const activity = catalog.activities.find((item) => item.id === visit.activityId);
		const row = treatments.get(visit.activityId) ?? {
			id: visit.activityId,
			name: visit.activityName,
			code: activity?.code ?? "",
			color: activity?.color ?? "#1C3D36",
			count: 0,
			income: 0,
			cost: 0
		};
		const visitCost = activityCost(catalog, visit.activityId, visit.professional);
		row.count += 1;
		row.income += visit.price;
		row.cost += visitCost;
		income += visit.price;
		cost += visitCost;
		treatments.set(visit.activityId, row);
	}
	let collected = 0;
	let pending = 0;
	const collectedRows = [];
	const pendingRows = [];
	for (const patient of patients) for (const payment of patient.payments ?? []) {
		if (payment.status === "cobrado" && payment.paidAt && inside(payment.paidAt, start, end)) {
			collected += payment.amount;
			collectedRows.push({
				name: patient.fullName,
				concept: payment.concept,
				amount: payment.amount
			});
		}
		if (payment.status === "pendiente" && inside(payment.dueAt, start, end)) {
			pending += payment.amount;
			pendingRows.push({
				name: patient.fullName,
				concept: payment.concept,
				amount: payment.amount
			});
		}
	}
	let booked = 0;
	let capacity = 0;
	const cursor = new Date(start);
	while (cursor < end && capacity < 1e6) {
		const day = occupancy(patients, catalog, cursor);
		booked += day.booked;
		capacity += day.capacity;
		cursor.setDate(cursor.getDate() + 1);
	}
	return {
		clients: [...clients.values()].sort((a, b) => b.visits - a.visits),
		absences: visits.filter((visit) => visit.status === "ausente" || visit.status === "cancelada").map((visit) => ({
			id: visit.id,
			name: visit.patientName,
			activity: visit.activityName,
			at: visit.at
		})),
		income,
		collected,
		pending,
		collectedRows,
		pendingRows,
		treatments: [...treatments.values()].sort((a, b) => b.income - a.income),
		cost,
		booked,
		capacity
	};
}
function previousRange(start, end) {
	const span = Math.max(end.getTime() - start.getTime(), 864e5);
	return {
		start: new Date(start.getTime() - span),
		end: new Date(start)
	};
}
function trendPercent(current, previous) {
	if (previous === 0) return current === 0 ? 0 : 100;
	return Math.round((current - previous) / previous * 100);
}
function moneyShare(part, total) {
	if (total <= 0) return 0;
	return Math.round(part / total * 100);
}
var PERIODS = [
	{
		id: "hoy",
		label: "Hoy"
	},
	{
		id: "semana",
		label: "7 días"
	},
	{
		id: "mes",
		label: "Mes"
	},
	{
		id: "fechas",
		label: "Fechas"
	}
];
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
	const [period, setPeriod] = (0, import_react.useState)("semana");
	const [from, setFrom] = (0, import_react.useState)(() => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
	const [to, setTo] = (0, import_react.useState)(() => new Date(Date.now() + 5184e5).toISOString().slice(0, 10));
	const [open, setOpen] = (0, import_react.useState)("rentabilidad");
	if (role !== "direccion") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "rounded-xl bg-surface px-4 py-8 text-sm text-ink-muted shadow-border",
		children: "El cuadro de mandos es de dirección. Recepción y consulta trabajan desde la agenda."
	});
	if (pipeline.isPending || catalog.isPending || !pipeline.data || !catalog.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-3",
		children: Array.from({ length: 4 }).map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 rounded-xl" }, index))
	});
	const range = periodRange(period, new Date(from), new Date(to));
	const previous = previousRange(range.start, range.end);
	const kpi = buildKpis(pipeline.data, catalog.data, range.start, range.end);
	const before = buildKpis(pipeline.data, catalog.data, previous.start, previous.end);
	const margin = kpi.income - kpi.cost;
	const marginBefore = before.income - before.cost;
	const occupation = kpi.capacity ? Math.round(kpi.booked / kpi.capacity * 100) : 0;
	const people = pipeline.data.filter((patient) => patient.stage !== "lost");
	const closed = pipeline.data.filter((patient) => patient.stage === "invoiced" || patient.billed);
	const openPipeline = pipeline.data.filter((patient) => patient.stage !== "invoiced" && patient.stage !== "lost" && !patient.billed);
	const pipelineValue = openPipeline.reduce((sum, patient) => sum + patient.estimatedValue, 0);
	const closedValue = closed.reduce((sum, patient) => sum + patient.estimatedValue, 0);
	const newClients = pipeline.data.filter((patient) => inRange(patient.createdAt, range.start, range.end)).length;
	const newClientsBefore = pipeline.data.filter((patient) => inRange(patient.createdAt, previous.start, previous.end)).length;
	const visits = kpi.treatments.reduce((sum, item) => sum + item.count, 0);
	const ticket = visits ? Math.round(kpi.income / visits) : 0;
	const conversion = pipeline.data.length ? Math.round(closed.length / pipeline.data.length * 100) : 0;
	const maxIncome = kpi.treatments[0]?.income ?? 1;
	const margins = [...kpi.treatments].sort((a, b) => b.income - b.cost - (a.income - a.cost));
	const maxMargin = Math.max(...margins.map((item) => Math.abs(item.income - item.cost)), 1);
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
					children: "Pulse un indicador para ver de qué clientes, citas y tratamientos sale."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2 overflow-x-auto",
				children: PERIODS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setPeriod(item.id),
					className: `h-10 shrink-0 rounded-full px-3 text-sm font-medium ${period === item.id ? "bg-accent text-accent-fg" : "bg-surface text-ink-muted shadow-border"}`,
					children: item.label
				}, item.id))
			}),
			period === "fechas" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "date",
					"aria-label": "Desde",
					value: from,
					onChange: (event) => setFrom(event.target.value),
					className: "h-11 rounded-md bg-surface px-3 text-sm shadow-border"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "date",
					"aria-label": "Hasta",
					value: to,
					onChange: (event) => setTo(event.target.value),
					className: "h-11 rounded-md bg-surface px-3 text-sm shadow-border"
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-ink-subtle",
				children: [
					format(range.start, "d MMM", { locale: es }),
					" – ",
					format(/* @__PURE__ */ new Date(range.end.getTime() - 1), "d MMM", { locale: es })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-xl bg-surface px-4 py-4 shadow-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-wide text-ink-subtle",
							children: "Número de clientes"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 font-display text-4xl font-medium tracking-tight tabular-nums text-ink",
							children: people.length
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-xs text-ink-muted",
							children: [
								newClients,
								" nuevos en el periodo. ",
								trendLabel(newClients, newClientsBefore)
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-xl bg-surface px-4 py-4 shadow-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-wide text-ink-subtle",
							children: "Tendencia de ingreso"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 font-display text-4xl font-medium tracking-tight tabular-nums text-ink",
							children: signed(trendPercent(kpi.income, before.income))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-xs text-ink-muted",
							children: [
								formatMoney(kpi.income),
								" frente a ",
								formatMoney(before.income)
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
						id: "clientes",
						open,
						setOpen,
						label: "Con cita",
						value: String(kpi.clients.length),
						hint: trendLabel(kpi.clients.length, before.clients.length)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
						id: "ausencias",
						open,
						setOpen,
						label: "No asistencias",
						value: String(kpi.absences.length),
						hint: trendLabel(kpi.absences.length, before.absences.length)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
						id: "cerrado",
						open,
						setOpen,
						label: "Cerrado",
						value: String(closed.length),
						hint: `${formatMoney(closedValue)} · ${conversion}% conversión`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
						id: "pipeline",
						open,
						setOpen,
						label: "Pipeline abierto",
						value: formatMoney(pipelineValue),
						hint: `${openPipeline.length} fichas vivas`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
						id: "ingresos",
						open,
						setOpen,
						label: "Ingreso",
						value: formatMoney(kpi.income),
						hint: trendLabel(kpi.income, before.income)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
						id: "cobrado",
						open,
						setOpen,
						label: "Cobrado",
						value: formatMoney(kpi.collected),
						hint: trendLabel(kpi.collected, before.collected)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
						id: "pendiente",
						open,
						setOpen,
						label: "Pendiente",
						value: formatMoney(kpi.pending),
						hint: trendLabel(kpi.pending, before.pending)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
						id: "ticket",
						open,
						setOpen,
						label: "Ticket medio",
						value: formatMoney(ticket),
						hint: visits ? `${visits} citas atendidas` : "Sin citas"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
						id: "tratamientos",
						open,
						setOpen,
						label: "Tratamientos",
						value: String(kpi.treatments.length),
						hint: "Tipos con actividad"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
						id: "rentabilidad",
						open,
						setOpen,
						label: "Rentabilidad",
						value: formatMoney(margin),
						hint: trendLabel(margin, marginBefore)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
						id: "ocupacion",
						open,
						setOpen,
						label: "Ocupación",
						value: `${occupation}%`,
						hint: `${kpi.booked} min de ${kpi.capacity}`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl bg-surface p-4 shadow-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "label-kicker",
					children: "Gráfico de tratamientos"
				}), kpi.treatments.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-ink-muted",
					children: "Sin tratamientos en el periodo."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bars, { rows: kpi.treatments.map((item) => ({
					id: item.id,
					label: `${item.code} ${item.name}`,
					value: item.income,
					max: maxIncome,
					color: item.color,
					caption: `${formatMoney(item.income)} · ${item.count}`
				})) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl bg-surface p-4 shadow-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "label-kicker",
					children: "Rentabilidad por tratamiento"
				}), margins.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-ink-muted",
					children: "Sin margen que calcular."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bars, { rows: margins.map((item) => ({
					id: item.id,
					label: item.name,
					value: Math.abs(item.income - item.cost),
					max: maxMargin,
					color: item.color,
					caption: formatMoney(item.income - item.cost)
				})) })]
			}),
			open === "clientes" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Clientes",
				children: kpi.clients.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {}) : kpi.clients.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
					label: item.name,
					value: `${item.visits} citas`,
					href: `/pacientes/${item.id}`
				}, item.id))
			}) : null,
			open === "ausencias" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "No asistencias",
				children: kpi.absences.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {}) : kpi.absences.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
					label: item.name,
					value: item.activity
				}, item.id))
			}) : null,
			open === "ingresos" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Ingresos por tratamiento",
				children: kpi.treatments.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {}) : kpi.treatments.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
					label: `${item.code} ${item.name}`,
					value: formatMoney(item.income),
					swatch: item.color
				}, item.id))
			}) : null,
			open === "cobrado" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Cobrado",
				children: kpi.collectedRows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {}) : kpi.collectedRows.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
					label: item.name,
					value: formatMoney(item.amount),
					hint: item.concept
				}, index))
			}) : null,
			open === "pendiente" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Pendiente",
				children: kpi.pendingRows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {}) : kpi.pendingRows.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
					label: item.name,
					value: formatMoney(item.amount),
					hint: item.concept
				}, index))
			}) : null,
			open === "tratamientos" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Tipos de tratamiento",
				children: kpi.treatments.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
					label: `${item.code} ${item.name}`,
					value: `${item.count} · ${moneyShare(item.income, kpi.income)}%`,
					swatch: item.color
				}, item.id))
			}) : null,
			open === "rentabilidad" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Rentabilidad",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Ingresos",
						value: formatMoney(kpi.income)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Costes",
						value: formatMoney(kpi.cost)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Margen",
						value: `${formatMoney(margin)} · ${moneyShare(margin, kpi.income)}%`
					}),
					kpi.treatments.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: item.name,
						value: formatMoney(item.income - item.cost),
						swatch: item.color
					}, item.id))
				]
			}) : null,
			open === "cerrado" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Cerrado",
				children: closed.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {}) : closed.map((patient) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
					label: patient.fullName,
					value: formatMoney(patient.estimatedValue),
					href: `/pacientes/${patient.id}`
				}, patient.id))
			}) : null,
			open === "pipeline" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Pipeline abierto",
				children: openPipeline.map((patient) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
					label: patient.fullName,
					value: formatMoney(patient.estimatedValue),
					hint: patient.treatmentInterest,
					href: `/pacientes/${patient.id}`
				}, patient.id))
			}) : null,
			open === "ticket" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Ticket medio",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Ingreso del periodo",
						value: formatMoney(kpi.income)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Citas atendidas",
						value: String(visits)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Ticket",
						value: formatMoney(ticket)
					})
				]
			}) : null,
			open === "ocupacion" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Ocupación sobre el total",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Minutos reservados",
						value: String(kpi.booked)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Capacidad de salas",
						value: String(kpi.capacity)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Porcentaje",
						value: `${occupation}%`
					})
				]
			}) : null
		]
	});
}
function Tile({ id, open, setOpen, label, value, hint }) {
	const active = open === id;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => setOpen(active ? null : id),
		className: `rounded-xl px-4 py-3 text-left shadow-border ${active ? "bg-accent text-accent-fg" : "bg-surface"}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: `block text-xs font-medium tracking-wide ${active ? "text-accent-fg/80" : "text-ink-subtle"}`,
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-1 block font-display text-2xl font-medium tracking-tight tabular-nums",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: `mt-1 block text-xs ${active ? "text-accent-fg/80" : "text-ink-muted"}`,
				children: hint
			})
		]
	});
}
function Panel({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl bg-surface p-4 shadow-border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "label-kicker",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3 flex flex-col gap-2",
			children
		})]
	});
}
function Row({ label, value, hint, swatch, href }) {
	const body = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "flex items-center justify-between gap-3 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex min-w-0 items-center gap-2",
			children: [swatch ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "size-2.5 shrink-0 rounded-full",
				style: { background: swatch }
			}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "truncate text-ink",
				children: [label, hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-xs text-ink-muted",
					children: hint
				}) : null]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "shrink-0 tabular-nums text-ink",
			children: value
		})]
	});
	if (!href) return body;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/pacientes/$id",
		params: { id: href.replace("/pacientes/", "") },
		children: body
	});
}
function Empty() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-ink-muted",
		children: "Nada en este periodo."
	});
}
function Bars({ rows }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "mt-4 flex flex-col gap-3",
		children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-baseline justify-between gap-3 text-xs",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex min-w-0 items-center gap-2 text-ink",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "size-2 shrink-0 rounded-full",
					style: { background: row.color }
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate",
					children: row.label
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "shrink-0 tabular-nums text-ink-muted",
				children: row.caption
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1 h-2 overflow-hidden rounded-full bg-bg",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-full rounded-full",
				style: {
					width: `${Math.max(6, Math.round(row.value / row.max * 100))}%`,
					background: row.color
				}
			})
		})] }, row.id))
	});
}
function inRange(iso, start, end) {
	const time = new Date(iso).getTime();
	return time >= start.getTime() && time < end.getTime();
}
function signed(value) {
	if (value === 0) return "0%";
	return `${value > 0 ? "+" : "−"}${Math.abs(value)}%`;
}
function trendLabel(current, previous) {
	const value = trendPercent(current, previous);
	if (value === 0) return "Igual que el periodo anterior";
	return `${signed(value)} vs periodo anterior`;
}
var SplitComponent = Dashboard;
//#endregion
export { SplitComponent as component };
