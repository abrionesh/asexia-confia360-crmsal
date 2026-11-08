import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { h as Ellipsis } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { r as toast } from "../_libs/sonner.mjs";
import { a as useUiStore, f as cn, h as stageMeta, l as api, p as formatMoney, s as PIPELINE_STAGES } from "./router-OxFF0fHE.mjs";
import { t as Skeleton } from "./skeleton-CM610tTB.mjs";
import { t as Badge } from "./badge-FWHWQG4C.mjs";
import { n as formatDistanceToNow, t as es } from "../_libs/date-fns.mjs";
import { t as Avatar } from "./avatar-B4Lj1Uwk.mjs";
import { a as Root2, i as Portal2, n as Item2, o as Trigger, r as Label2, t as Content2 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Bq8BfclS.js
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
var KIND_LABEL = {
	etapa: "Etapa",
	origen: "Origen",
	profesional: "Profesional",
	tratamiento: "Tratamiento",
	etiqueta: "Etiqueta"
};
function applyBoardFilters(patients, filters, search) {
	const term = search.trim().toLowerCase();
	const grouped = /* @__PURE__ */ new Map();
	for (const filter of filters) {
		const current = grouped.get(filter.kind) ?? [];
		current.push(filter.value);
		grouped.set(filter.kind, current);
	}
	return patients.filter((patient) => {
		if (term) {
			if (![
				patient.fullName,
				patient.treatmentInterest,
				patient.assignedTo,
				patient.source,
				patient.city,
				...patient.tags
			].join(" ").toLowerCase().includes(term)) return false;
		}
		for (const [kind, values] of grouped) if (!(kind === "etapa" ? values.includes(patient.stage) : kind === "origen" ? values.includes(patient.source) : kind === "profesional" ? values.includes(patient.assignedTo) : kind === "tratamiento" ? values.includes(patient.treatmentInterest) : patient.tags.some((tag) => values.includes(tag)))) return false;
		return true;
	});
}
function FilterField({ patients, filters, onChange }) {
	const [text, setText] = (0, import_react.useState)("");
	const [open, setOpen] = (0, import_react.useState)(false);
	const [expanded, setExpanded] = (0, import_react.useState)(false);
	const options = (0, import_react.useMemo)(() => suggestions(patients, filters, text), [
		patients,
		filters,
		text
	]);
	function add(option) {
		onChange([...filters, option]);
		setText("");
		setOpen(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setExpanded((value) => !value),
					className: `h-10 rounded-full px-3 text-sm font-medium ${expanded ? "bg-accent text-accent-fg" : "bg-surface text-ink shadow-border"}`,
					children: expanded ? "Cerrar filtros" : filters.length ? `Filtros · ${filters.length}` : "Filtros"
				}), filters.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => onChange([]),
					className: "text-xs font-medium text-ink-muted",
					children: "Limpiar"
				}) : null]
			}),
			filters.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-wrap gap-2",
				children: filters.map((filter) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => onChange(filters.filter((item) => item.kind !== filter.kind || item.value !== filter.value)),
					className: "inline-flex h-8 items-center gap-1 rounded-full bg-accent-soft px-3 text-xs font-medium text-ink",
					children: [
						KIND_LABEL[filter.kind],
						": ",
						filter.label,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"aria-hidden": true,
							children: "×"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "sr-only",
							children: "Quitar filtro"
						})
					]
				}) }, `${filter.kind}:${filter.value}`))
			}) : null,
			expanded ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-xs text-ink-subtle",
				children: ["Añadir filtro", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: text,
					onChange: (event) => {
						setText(event.target.value);
						setOpen(true);
					},
					onFocus: () => setOpen(true),
					onKeyDown: (event) => {
						if (event.key === "Enter" && options[0]) {
							event.preventDefault();
							add(options[0]);
						}
						if (event.key === "Escape") {
							setOpen(false);
							setExpanded(false);
						}
					},
					placeholder: "Etapa, origen, profesional, tratamiento o etiqueta",
					className: "mt-1 h-11 w-full rounded-md bg-surface px-3 text-sm text-ink shadow-border outline-none placeholder:text-ink-subtle"
				})]
			}) : null,
			expanded && open && options.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col overflow-hidden rounded-xl bg-surface shadow-border",
				children: options.slice(0, 8).map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onMouseDown: (event) => event.preventDefault(),
					onClick: () => add(option),
					className: "flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-bg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-ink",
						children: option.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-ink-subtle",
						children: KIND_LABEL[option.kind]
					})]
				}) }, `${option.kind}:${option.value}`))
			}) : null
		]
	});
}
function suggestions(patients, filters, text) {
	const taken = new Set(filters.map((filter) => `${filter.kind}:${filter.value}`));
	const query = text.trim().toLowerCase();
	const options = [];
	for (const stage of PIPELINE_STAGES) options.push({
		kind: "etapa",
		value: stage.id,
		label: stage.label
	});
	const pushUnique = (kind, value) => {
		if (!value || taken.has(`${kind}:${value}`)) return;
		if (options.some((option) => option.kind === kind && option.value === value)) return;
		options.push({
			kind,
			value,
			label: value
		});
	};
	for (const patient of patients) {
		pushUnique("origen", patient.source);
		pushUnique("profesional", patient.assignedTo);
		pushUnique("tratamiento", patient.treatmentInterest);
		for (const tag of patient.tags) pushUnique("etiqueta", tag);
	}
	return options.filter((option) => {
		if (taken.has(`${option.kind}:${option.value}`)) return false;
		if (!query) return true;
		return `${KIND_LABEL[option.kind]} ${option.label}`.toLowerCase().includes(query);
	});
}
var VIEWS = [
	{
		id: "columnas",
		label: "Columnas"
	},
	{
		id: "lista",
		label: "Lista"
	},
	{
		id: "origen",
		label: "Por origen"
	},
	{
		id: "profesional",
		label: "Por profesional"
	}
];
function KanbanBoard() {
	const search = useUiStore((state) => state.search);
	const queryClient = useQueryClient();
	const [view, setView] = (0, import_react.useState)("columnas");
	const [filters, setFilters] = (0, import_react.useState)([]);
	const pipelineQuery = useQuery({
		queryKey: ["pipeline"],
		queryFn: () => api.listPipeline()
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
		}
	});
	const loading = pipelineQuery.isPending;
	const source = pipelineQuery.data ?? [];
	const patients = applyBoardFilters(source, filters, search);
	const stageFilter = filters.some((filter) => filter.kind === "etapa");
	const move = (id, next) => {
		if (source.find((item) => item.id === id)?.stage === next) return;
		moveMutation.mutate({
			id,
			stage: next
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2 overflow-x-auto",
				children: VIEWS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setView(item.id),
					className: `h-10 shrink-0 rounded-full px-3 text-sm font-medium ${view === item.id ? "bg-accent text-accent-fg" : "bg-surface text-ink-muted shadow-border"}`,
					children: item.label
				}, item.id))
			}),
			loading ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterField, {
				patients: source,
				filters,
				onChange: setFilters
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-ink-muted",
				children: [loading ? "Cargando fichas" : `${patients.length} de ${source.length} fichas`, filters.length > 1 ? " · los filtros se combinan" : ""]
			}),
			loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KanbanSkeleton, {}) : view === "columnas" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "kanban-scroller",
				children: PIPELINE_STAGES.filter((stage) => !stageFilter || patients.some((patient) => patient.stage === stage.id)).map((stage) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KanbanColumn, {
					stage: stage.id,
					patients: patients.filter((patient) => patient.stage === stage.id),
					onMove: move
				}, stage.id))
			}) : view === "lista" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BoardList, {
				patients,
				onMove: move
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GroupedBoard, {
				groups: groupPatients(patients, view === "origen" ? (patient) => patient.source : (patient) => patient.assignedTo),
				onMove: move
			})
		]
	});
}
function BoardList({ patients, onMove }) {
	if (patients.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyBoard, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "flex flex-col gap-2",
		children: patients.map((patient) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex items-center gap-2 rounded-xl bg-surface px-3 py-2 shadow-border",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/pacientes/$id",
					params: { id: patient.id },
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block truncate text-sm font-medium text-ink",
						children: patient.fullName
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "block truncate text-xs text-ink-muted",
						children: [
							stageMeta(patient.stage).label,
							" · ",
							patient.treatmentInterest,
							" · ",
							patient.assignedTo
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "shrink-0 text-sm tabular-nums text-ink",
					children: formatMoney(patient.estimatedValue)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StageSelect, {
					patient,
					onMove
				})
			]
		}, patient.id))
	});
}
function GroupedBoard({ groups, onMove }) {
	if (groups.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyBoard, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-col gap-4",
		children: groups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
			className: "text-sm font-medium text-ink",
			children: [
				group.key,
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-normal text-ink-muted",
					children: group.patients.length
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BoardList, {
				patients: group.patients,
				onMove
			})
		})] }, group.key))
	});
}
function StageSelect({ patient, onMove }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
		"aria-label": `Mover a ${patient.fullName}`,
		value: patient.stage,
		onChange: (event) => onMove(patient.id, event.target.value),
		className: "h-9 max-w-28 shrink-0 rounded-md bg-bg px-2 text-xs text-ink",
		children: PIPELINE_STAGES.map((stage) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
			value: stage.id,
			children: stage.label
		}, stage.id))
	});
}
function EmptyBoard() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "rounded-xl bg-surface px-4 py-8 text-sm text-ink-muted shadow-border",
		children: "Ninguna ficha con esos filtros."
	});
}
function groupPatients(patients, keyOf) {
	const map = /* @__PURE__ */ new Map();
	for (const patient of patients) {
		const key = keyOf(patient) || "Sin asignar";
		map.set(key, [...map.get(key) ?? [], patient]);
	}
	return [...map.entries()].map(([key, list]) => ({
		key,
		patients: list
	})).sort((a, b) => b.patients.length - a.patients.length);
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
				children: "Columnas, lista o agrupado. Los filtros se abren y se cierran. Lo que hay que avisar está en Actuar."
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KanbanBoard, {})]
	});
}
//#endregion
export { Home as component };
