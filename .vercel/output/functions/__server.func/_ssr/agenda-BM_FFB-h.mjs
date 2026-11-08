import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as useUiStore, l as api, p as formatMoney } from "./router-OxFF0fHE.mjs";
import { a as sameDay, i as occupancy, n as allPayments, o as startOfDay, r as allVisits, t as addDays } from "./occupancy-C2b47X8l.mjs";
import { t as Skeleton } from "./skeleton-CM610tTB.mjs";
import { r as format, t as es } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/agenda-BM_FFB-h.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUS = {
	programada: "Programada",
	realizada: "Realizada",
	cancelada: "Cancelada",
	ausente: "No asistió"
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
	const role = useUiStore((state) => state.role);
	const doctor = useUiStore((state) => state.doctor);
	const setDoctor = useUiStore((state) => state.setDoctor);
	const [mode, setMode] = (0, import_react.useState)("dia");
	const [anchor, setAnchor] = (0, import_react.useState)(() => startOfDay(/* @__PURE__ */ new Date()));
	const [rangeEnd, setRangeEnd] = (0, import_react.useState)(() => addDays(startOfDay(/* @__PURE__ */ new Date()), 6));
	const [showHours, setShowHours] = (0, import_react.useState)(true);
	if (pipeline.isPending || catalog.isPending || !pipeline.data || !catalog.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 rounded-xl" });
	const data = catalog.data;
	const visits = allVisits(pipeline.data).filter((visit) => !doctor || visit.professional === doctor);
	const dayOcc = occupancy(pipeline.data, data, anchor);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "label-kicker",
				children: "Agenda"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-medium tracking-tight text-ink",
				children: "Citas y ocupación"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2 overflow-x-auto",
				children: [
					["dia", "Día"],
					["semana", "Semana"],
					["mes", "Mes"],
					["fechas", "Fechas"]
				].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setMode(id),
					className: `h-10 shrink-0 rounded-full px-3 text-sm font-medium ${mode === id ? "bg-accent text-accent-fg" : "bg-surface text-ink-muted shadow-border"}`,
					children: label
				}, id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2 overflow-x-auto",
				children: [role === "medico" ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setDoctor(""),
					className: `h-9 shrink-0 rounded-full px-3 text-xs font-medium ${doctor === "" ? "bg-ink text-accent-fg" : "bg-surface text-ink shadow-border"}`,
					children: "Todos"
				}), data.professionals.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setDoctor(item.name),
					className: `h-9 shrink-0 rounded-full px-3 text-xs font-medium ${doctor === item.name ? "text-white" : "bg-surface text-ink shadow-border"}`,
					style: doctor === item.name ? { background: item.color } : void 0,
					children: item.name
				}, item.id))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setShowHours((value) => !value),
				className: "w-fit text-xs font-medium text-accent",
				children: showHours ? "Ocultar horarios de atención" : "Ver horarios de atención"
			}),
			mode === "dia" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DayView, {
				anchor,
				setAnchor,
				visits,
				catalog: data,
				showHours,
				doctor,
				occupancyLabel: `${dayOcc.closed ? "Cerrado" : `${Math.round(dayOcc.ratio * 100)}% ocupación`} · ${dayOcc.booked} min`,
				payments: allPayments(pipeline.data).filter((payment) => sameDay(payment.dueAt, anchor))
			}) : null,
			mode === "semana" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeekView, {
				anchor,
				setAnchor,
				visits,
				catalog: data,
				showHours,
				doctor
			}) : null,
			mode === "mes" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonthView, {
				anchor,
				setAnchor,
				onPickDay: (day) => {
					setAnchor(day);
					setMode("dia");
				},
				visits,
				catalog: data
			}) : null,
			mode === "fechas" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RangeView, {
				anchor,
				setAnchor,
				rangeEnd,
				setRangeEnd,
				visits,
				catalog: data,
				showHours,
				doctor
			}) : null
		]
	});
}
function DayView({ anchor, setAnchor, visits, catalog, showHours, doctor, occupancyLabel, payments }) {
	const days = Array.from({ length: 7 }, (_, index) => addDays(startOfDay(/* @__PURE__ */ new Date()), index));
	const list = visits.filter((visit) => sameDay(visit.at, anchor)).sort((a, b) => +new Date(a.at) - +new Date(b.at));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2 overflow-x-auto",
				children: days.map((date) => {
					const active = sameDay(date.toISOString(), anchor);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setAnchor(date),
						className: `h-16 min-w-16 shrink-0 rounded-xl px-3 text-left ${active ? "bg-accent text-accent-fg" : "bg-surface text-ink shadow-border"}`,
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
					format(anchor, "EEEE d MMM", { locale: es }),
					" · ",
					occupancyLabel
				]
			}),
			showHours ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Attention, {
				day: anchor,
				catalog,
				doctor
			}) : null,
			list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-xl bg-surface px-4 py-6 text-sm text-ink-muted shadow-border",
				children: "Sin citas este día."
			}) : list.map((visit) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VisitCard, {
				visit,
				catalog
			}, visit.id)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl bg-surface p-4 shadow-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "label-kicker",
					children: "Pagos del día"
				}), payments.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-ink-muted",
					children: "No hay cobros previstos."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 flex flex-col gap-2 text-sm",
					children: payments.map((payment) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block font-medium text-ink",
							children: payment.patientName
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-ink-muted",
							children: [
								payment.concept,
								" · ",
								payment.status
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular-nums",
							children: formatMoney(payment.amount)
						})]
					}, payment.id))
				})]
			})
		]
	});
}
function WeekView({ anchor, setAnchor, visits, catalog, showHours, doctor }) {
	const monday = startOfWeek(anchor);
	const days = Array.from({ length: 7 }, (_, index) => addDays(monday, index));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pager, {
			label: format(monday, "d MMM", { locale: es }) + " – " + format(addDays(monday, 6), "d MMM", { locale: es }),
			onPrev: () => setAnchor(addDays(monday, -7)),
			onNext: () => setAnchor(addDays(monday, 7))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex gap-2 overflow-x-auto pb-1",
			children: days.map((day) => {
				const list = visits.filter((visit) => sameDay(visit.at, day));
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "w-56 shrink-0 rounded-xl bg-bg p-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "px-1 text-sm font-medium text-ink",
							children: format(day, "EEE d", { locale: es })
						}),
						showHours ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Attention, {
							day,
							catalog,
							doctor,
							compact: true
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 flex flex-col gap-2",
							children: list.map((visit) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VisitCard, {
								visit,
								catalog,
								compact: true
							}, visit.id))
						})
					]
				}, day.toISOString());
			})
		})]
	});
}
function MonthView({ anchor, setAnchor, onPickDay, visits, catalog }) {
	const cells = (0, import_react.useMemo)(() => monthCells(anchor), [anchor]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pager, {
				label: format(anchor, "MMMM yyyy", { locale: es }),
				onPrev: () => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1)),
				onNext: () => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-7 gap-1 text-center text-2xs text-ink-subtle",
				children: [
					"L",
					"M",
					"X",
					"J",
					"V",
					"S",
					"D"
				].map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }, label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-7 gap-1",
				children: cells.map((day, index) => {
					if (!day) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}, `e-${index}`);
					const list = visits.filter((visit) => sameDay(visit.at, day));
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => onPickDay(day),
						className: "min-h-16 rounded-lg bg-surface p-1 text-left shadow-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-ink",
								children: day.getDate()
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-1 flex flex-wrap gap-1",
								children: list.slice(0, 3).map((visit) => {
									const activity = catalog.activities.find((item) => item.id === visit.activityId);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "size-2 rounded-full",
										style: { background: activity?.color ?? "#1C3D36" }
									}, visit.id);
								})
							}),
							list.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-1 block text-2xs tabular-nums text-ink-subtle",
								children: list.length
							}) : null
						]
					}, day.toISOString());
				})
			})
		]
	});
}
function RangeView({ anchor, setAnchor, rangeEnd, setRangeEnd, visits, catalog, showHours, doctor }) {
	const start = anchor <= rangeEnd ? anchor : rangeEnd;
	const end = anchor <= rangeEnd ? rangeEnd : anchor;
	const days = [];
	const cursor = new Date(start);
	while (cursor <= end && days.length < 62) {
		days.push(new Date(cursor));
		cursor.setDate(cursor.getDate() + 1);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-2 gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "text-xs text-ink-subtle",
				children: ["Desde", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "date",
					className: "mt-1 h-11 w-full rounded-md bg-surface px-3 text-sm text-ink shadow-border",
					value: toDateInput(anchor),
					onChange: (event) => setAnchor(parseDateInput(event.target.value))
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "text-xs text-ink-subtle",
				children: ["Hasta", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "date",
					className: "mt-1 h-11 w-full rounded-md bg-surface px-3 text-sm text-ink shadow-border",
					value: toDateInput(rangeEnd),
					onChange: (event) => setRangeEnd(parseDateInput(event.target.value))
				})]
			})]
		}), days.map((day) => {
			const list = visits.filter((visit) => sameDay(visit.at, day));
			if (list.length === 0 && !showHours) return null;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium text-ink",
					children: format(day, "EEEE d MMM", { locale: es })
				}),
				showHours ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Attention, {
					day,
					catalog,
					doctor,
					compact: true
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 flex flex-col gap-2",
					children: list.map((visit) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VisitCard, {
						visit,
						catalog
					}, visit.id))
				})
			] }, day.toISOString());
		})]
	});
}
function VisitCard({ visit, catalog, compact }) {
	const activity = catalog.activities.find((item) => item.id === visit.activityId);
	const color = activity?.color ?? "#1C3D36";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/pacientes/$id",
		params: { id: visit.patientId },
		className: "flex gap-2 rounded-lg bg-surface p-2 shadow-border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "w-1.5 shrink-0 rounded-full",
			style: { background: color }
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "min-w-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs font-medium tabular-nums",
					style: { color },
					children: [
						activity?.code ?? "",
						" · ",
						format(new Date(visit.at), "HH:mm")
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block truncate text-sm font-medium text-ink",
					children: visit.patientName
				}),
				compact ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "block text-xs text-ink-muted",
					children: [
						visit.activityName,
						" · ",
						visit.roomName,
						" · ",
						visit.durationMin,
						" min · ",
						STATUS[visit.status]
					]
				})
			]
		})]
	});
}
function Attention({ day, catalog, doctor, compact }) {
	const rows = catalog.professionals.filter((item) => !doctor || item.name === doctor).flatMap((item) => {
		const hours = item.hours.find((row) => row.day === day.getDay());
		if (!hours || hours.closed) return [];
		return [{
			...item,
			open: hours.open,
			close: hours.close
		}];
	});
	if (rows.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: `flex flex-col gap-1 ${compact ? "mt-1" : ""}`,
		children: rows.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "rounded-md px-2 py-1 text-xs text-ink",
			style: { background: `${item.color}22` },
			children: [
				"Atención ",
				compact ? item.name.split(" ").slice(-1) : item.name,
				" ",
				item.open,
				"–",
				item.close
			]
		}, item.id))
	});
}
function Pager({ label, onPrev, onNext }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onPrev,
				className: "h-10 rounded-full bg-surface px-3 text-sm shadow-border",
				children: "Anterior"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium capitalize text-ink",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onNext,
				className: "h-10 rounded-full bg-surface px-3 text-sm shadow-border",
				children: "Siguiente"
			})
		]
	});
}
function startOfWeek(date) {
	const next = startOfDay(date);
	const delta = (next.getDay() + 6) % 7;
	next.setDate(next.getDate() - delta);
	return next;
}
function monthCells(anchor) {
	const pad = (new Date(anchor.getFullYear(), anchor.getMonth(), 1).getDay() + 6) % 7;
	const count = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate();
	const cells = Array.from({ length: pad }, () => null);
	for (let day = 1; day <= count; day += 1) cells.push(new Date(anchor.getFullYear(), anchor.getMonth(), day));
	return cells;
}
function toDateInput(date) {
	const pad = (value) => String(value).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
function parseDateInput(value) {
	const [year, month, day] = value.split("-").map(Number);
	return startOfDay(new Date(year, (month ?? 1) - 1, day ?? 1));
}
var SplitComponent = Agenda;
//#endregion
export { SplitComponent as component };
