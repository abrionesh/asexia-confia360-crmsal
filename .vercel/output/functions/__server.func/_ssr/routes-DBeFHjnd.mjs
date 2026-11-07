import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { h as Ellipsis } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { r as toast } from "../_libs/sonner.mjs";
import { a as useUiStore, c as cn, d as stageMeta, l as formatMoney, o as PIPELINE_STAGES, s as api } from "./router-DMvJ3L8T.mjs";
import { t as Skeleton } from "./skeleton-BQdK-Qwf.mjs";
import { t as Badge } from "./badge-CGUhCUpP.mjs";
import { n as formatDistanceToNow, t as es } from "../_libs/date-fns.mjs";
import { n as Avatar, t as AlarmQueue } from "./queue-BsppD4RH.mjs";
import { a as Root2, i as Portal2, n as Item2, o as Trigger, r as Label2, t as Content2 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DBeFHjnd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DropdownMenu = Root2;
var DropdownMenuTrigger = Trigger;
function DropdownMenuContent({ className, sideOffset = 6, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
		sideOffset,
		className: cn("z-50 min-w-44 overflow-hidden rounded-lg bg-surface p-1 shadow-overlay", "data-[state=open]:animate-in data-[state=closed]:animate-out", "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95", className),
		...props
	}) });
}
function DropdownMenuItem({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2, {
		className: cn("flex cursor-pointer items-center rounded-sm px-3 py-2 text-sm text-ink outline-none", "focus:bg-accent-soft focus:text-accent data-disabled:pointer-events-none data-disabled:opacity-40", className),
		...props
	});
}
function DropdownMenuLabel({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label2, {
		className: cn("px-3 py-1.5 text-xs font-medium text-ink-subtle", className),
		...props
	});
}
function PatientCard({ patient, onMove }) {
	const navigate = useNavigate();
	const dragging = (0, import_react.useRef)(false);
	const ago = formatDistanceToNow(new Date(patient.lastActivityAt), {
		addSuffix: true,
		locale: es
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		draggable: true,
		onDragStart: (event) => {
			dragging.current = true;
			event.dataTransfer.setData("text/patient-id", patient.id);
			event.dataTransfer.effectAllowed = "move";
		},
		onDragEnd: () => {
			window.setTimeout(() => {
				dragging.current = false;
			}, 0);
		},
		onClick: () => {
			if (dragging.current) return;
			navigate({
				to: "/pacientes/$id",
				params: { id: patient.id }
			});
		},
		className: "group cursor-pointer rounded-lg bg-surface p-3 shadow-border transition-[box-shadow,transform] duration-quick ease-out-smooth hover:shadow-border-hover active:scale-99",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
					name: patient.fullName,
					size: "sm"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "truncate text-sm font-medium text-ink",
							children: patient.fullName
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": `Mover a ${patient.fullName}`,
								onClick: (event) => event.stopPropagation(),
								className: "flex size-8 shrink-0 items-center justify-center rounded-sm text-ink-subtle opacity-100 transition-colors duration-quick hover:bg-bg hover:text-ink md:opacity-0 md:group-hover:opacity-100",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "size-4" })
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
							align: "end",
							onClick: (event) => event.stopPropagation(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuLabel, { children: "Mover a" }), PIPELINE_STAGES.filter((stage) => stage.id !== patient.stage).map((stage) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
								onSelect: () => onMove(patient.id, stage.id),
								children: stage.label
							}, stage.id))]
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-xs text-ink-muted",
						children: patient.treatmentInterest
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-base font-medium tabular-nums text-ink",
					children: formatMoney(patient.estimatedValue)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1.5",
					children: [patient.billed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "success",
						children: "Cobrado"
					}) : null, patient.aiScore ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						tone: "accent",
						children: ["IA ", patient.aiScore]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: patient.source })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex items-center justify-between text-2xs text-ink-subtle",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate",
					children: patient.assignedTo
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "shrink-0",
					children: ago
				})]
			})
		]
	});
}
function KanbanColumn({ stage, patients, onMove }) {
	const [over, setOver] = (0, import_react.useState)(false);
	const meta = PIPELINE_STAGES.find((item) => item.id === stage);
	const value = patients.reduce((sum, patient) => sum + patient.estimatedValue, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		onDragOver: (event) => {
			event.preventDefault();
			setOver(true);
		},
		onDragLeave: () => setOver(false),
		onDrop: (event) => {
			event.preventDefault();
			setOver(false);
			const id = event.dataTransfer.getData("text/patient-id");
			if (id) onMove(id, stage);
		},
		className: cn("kanban-column flex flex-col rounded-xl p-2 transition-[background-color,box-shadow] duration-fast ease-out-smooth", over ? "bg-accent-soft/70 shadow-border" : "bg-bg-elevated"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex items-baseline justify-between gap-2 px-2 pb-3 pt-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "label-kicker",
				children: meta.hint
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-medium text-ink",
				children: meta.label
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-right",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tabular-nums text-ink-muted",
					children: patients.length
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-2xs tabular-nums text-ink-subtle",
					children: formatMoney(value)
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex min-h-40 flex-1 flex-col gap-2 overflow-y-auto px-0.5 pb-2",
			children: patients.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-2 py-8 text-center text-xs text-ink-subtle",
				children: "Sin fichas en esta columna"
			}) : patients.map((patient) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PatientCard, {
				patient,
				onMove
			}, patient.id))
		})]
	});
}
function KanbanSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "kanban-scroller",
		children: PIPELINE_STAGES.map((stage) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "kanban-column",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl bg-bg-elevated p-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-2 pb-3 pt-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-2.5 w-14" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-2 h-4 w-32" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-col gap-2",
					children: Array.from({ length: 3 }).map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-surface p-3 shadow-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-8 rounded-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1 space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3.5 w-32" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-24" })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-3 h-5 w-20" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-3 h-2.5 w-full" })
						]
					}, index))
				})]
			})
		}, stage.id))
	});
}
var ITEMS = [
	{
		key: "pipelineValue",
		label: "Pipeline vivo",
		money: true
	},
	{
		key: "conversionRate",
		label: "Conversión",
		suffix: "%"
	},
	{
		key: "appointmentsThisWeek",
		label: "Citas confirmadas"
	},
	{
		key: "averageTicket",
		label: "Ticket medio",
		money: true
	}
];
function MetricsStrip({ metrics, loading }) {
	if (loading || !metrics) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
		children: ITEMS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl bg-surface px-4 py-3 shadow-border",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-20" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-3 h-7 w-24" })]
		}, item.key))
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
		children: ITEMS.map((item, index) => {
			const raw = metrics[item.key];
			const value = "money" in item && item.money ? formatMoney(raw) : "suffix" in item ? `${raw}${item.suffix}` : String(raw);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "enter-stagger rounded-xl bg-surface px-4 py-3 shadow-border",
				style: { animationDelay: `${index * 40}ms` },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-wide text-ink-subtle",
					children: item.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 font-display text-2xl font-medium tracking-tight text-ink tabular-nums",
					children: value
				})]
			}, item.key);
		})
	});
}
function KanbanBoard() {
	const search = useUiStore((state) => state.search);
	const queryClient = useQueryClient();
	const pipelineQuery = useQuery({
		queryKey: ["pipeline"],
		queryFn: () => api.listPipeline()
	});
	const metricsQuery = useQuery({
		queryKey: ["metrics"],
		queryFn: () => api.getMetrics()
	});
	const moveMutation = useMutation({
		mutationFn: ({ id, stage }) => api.movePatient(id, stage),
		onMutate: async ({ id, stage }) => {
			await queryClient.cancelQueries({ queryKey: ["pipeline"] });
			const previous = queryClient.getQueryData(["pipeline"]);
			queryClient.setQueryData(["pipeline"], (current) => (current ?? []).map((patient) => patient.id === id ? {
				...patient,
				stage
			} : patient));
			return { previous };
		},
		onError: (_error, _vars, context) => {
			if (context?.previous) queryClient.setQueryData(["pipeline"], context.previous);
			toast.error("No se pudo mover el lead");
		},
		onSuccess: (patient) => {
			toast.success(`${patient.fullName} · ${stageMeta(patient.stage).label}`);
			queryClient.invalidateQueries({ queryKey: ["metrics"] });
		}
	});
	const term = search.trim().toLowerCase();
	const patients = (pipelineQuery.data ?? []).filter((patient) => {
		if (!term) return true;
		return patient.fullName.toLowerCase().includes(term) || patient.treatmentInterest.toLowerCase().includes(term) || patient.assignedTo.toLowerCase().includes(term);
	});
	const loading = pipelineQuery.isPending;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricsStrip, {
				metrics: metricsQuery.data,
				loading: metricsQuery.isPending
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlarmQueue, {}),
			loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KanbanSkeleton, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "kanban-scroller",
				children: PIPELINE_STAGES.map((stage) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KanbanColumn, {
					stage: stage.id,
					patients: patients.filter((patient) => patient.stage === stage.id),
					onMove: (id, next) => {
						if (patients.find((item) => item.id === id)?.stage === next) return;
						moveMutation.mutate({
							id,
							stage: next
						});
					}
				}, stage.id))
			})
		]
	});
}
function Home() {
	if (useUiStore((state) => state.role) === "medico") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-surface px-5 py-8 shadow-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "label-kicker",
				children: "Consulta"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 font-display text-3xl font-medium text-ink",
				children: "Su sala está en la agenda"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-ink-muted",
				children: "El tablero comercial es de recepción y dirección."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/agenda",
				className: "mt-4 inline-flex h-11 items-center text-sm font-medium text-accent",
				children: "Abrir agenda"
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "label-kicker",
				children: "Pipeline comercial"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-medium tracking-tight text-ink",
				children: "Tablero de leads"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-2xl text-sm text-ink-muted",
				children: "Del primer contacto al cuidado posterior. Arriba, lo que hay que avisar hoy: una cita, un silencio o lo que la ficha haya indicado."
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KanbanBoard, {})]
	});
}
//#endregion
export { Home as component };
