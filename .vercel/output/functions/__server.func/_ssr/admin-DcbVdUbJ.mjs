import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { r as toast } from "../_libs/sonner.mjs";
import { a as useUiStore, i as Button, r as Input, s as api } from "./router-DMvJ3L8T.mjs";
import { t as Skeleton } from "./skeleton-BQdK-Qwf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-DcbVdUbJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Admin() {
	const role = useUiStore((state) => state.role);
	const queryClient = useQueryClient();
	const catalogQuery = useQuery({
		queryKey: ["catalog"],
		queryFn: () => api.getCatalog()
	});
	const [draft, setDraft] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (catalogQuery.data && !draft) setDraft(structuredClone(catalogQuery.data));
	}, [catalogQuery.data, draft]);
	const save = useMutation({
		mutationFn: () => api.saveCatalog(draft),
		onSuccess: (saved) => {
			setDraft(structuredClone(saved));
			queryClient.invalidateQueries({ queryKey: ["catalog"] });
			toast.success("Catálogo guardado");
		}
	});
	if (role !== "direccion") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "rounded-xl bg-surface px-4 py-8 text-sm text-ink-muted shadow-border",
		children: "El catálogo lo mantiene dirección."
	});
	if (!draft) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 rounded-xl" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "label-kicker",
					children: "Administración"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-medium tracking-tight text-ink",
					children: "Catálogo de la clínica"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-2xl text-sm text-ink-muted",
					children: "Sector, actividad, duración, precio, horario y salas. La agenda y el cuadro de mandos leen de aquí."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-3",
				children: [draft.activities.map((activity, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
					className: "rounded-xl bg-surface p-4 shadow-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Actividad",
								value: activity.name,
								onChange: (name) => updateActivity(index, { name })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Sector",
								value: activity.sector,
								onChange: (sector) => updateActivity(index, { sector })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Subsector",
								value: activity.subsector,
								onChange: (subsector) => updateActivity(index, { subsector })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Duración (min)",
								value: String(activity.durationMin),
								onChange: (value) => updateActivity(index, { durationMin: Number(value) || 0 })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Precio",
								value: String(activity.price),
								onChange: (value) => updateActivity(index, { price: Number(value) || 0 })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Descripción",
								value: activity.description,
								onChange: (description) => updateActivity(index, { description })
							})
						]
					})
				}, activity.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => setDraft({
						...draft,
						activities: [...draft.activities, {
							id: `act-${Date.now()}`,
							sector: "Medicina estética",
							subsector: "Facial",
							name: "Nueva actividad",
							description: "",
							durationMin: 30,
							price: 0
						}]
					}),
					children: "Añadir actividad"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl bg-surface p-4 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "label-kicker",
						children: "Salas"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 flex flex-col gap-2",
						children: draft.rooms.map((room, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: room.name,
							"aria-label": `Sala ${index + 1}`,
							onChange: (event) => {
								const rooms = draft.rooms.map((item, itemIndex) => itemIndex === index ? {
									...item,
									name: event.target.value
								} : item);
								setDraft({
									...draft,
									rooms
								});
							}
						}) }, room.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-3",
						variant: "outline",
						onClick: () => setDraft({
							...draft,
							rooms: [...draft.rooms, {
								id: `room-${Date.now()}`,
								name: "Nueva sala"
							}]
						}),
						children: "Añadir sala"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl bg-surface p-4 shadow-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "label-kicker",
					children: "Horario de apertura"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 flex flex-col gap-3",
					children: draft.hours.map((day, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "grid grid-cols-[1fr_auto_auto] items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm text-ink",
								children: day.label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "time",
								value: day.open,
								"aria-label": `Apertura ${day.label}`,
								className: "w-28",
								disabled: day.closed,
								onChange: (event) => updateHour(index, { open: event.target.value })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "time",
								value: day.close,
								"aria-label": `Cierre ${day.label}`,
								className: "w-28",
								disabled: day.closed,
								onChange: (event) => updateHour(index, { close: event.target.value })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "col-span-3 text-left text-xs font-medium text-accent",
								onClick: () => updateHour(index, { closed: !day.closed }),
								children: day.closed ? "Abrir este día" : "Marcar cerrado"
							})
						]
					}, day.day))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				disabled: save.isPending,
				onClick: () => save.mutate(),
				children: "Guardar catálogo"
			})
		]
	});
	function updateActivity(index, patch) {
		setDraft((current) => {
			if (!current) return current;
			const activities = current.activities.map((item, itemIndex) => itemIndex === index ? {
				...item,
				...patch
			} : item);
			return {
				...current,
				activities
			};
		});
	}
	function updateHour(index, patch) {
		setDraft((current) => {
			if (!current) return current;
			const hours = current.hours.map((item, itemIndex) => itemIndex === index ? {
				...item,
				...patch
			} : item);
			return {
				...current,
				hours
			};
		});
	}
}
function Field({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block text-xs text-ink-subtle",
		children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			className: "mt-1",
			value,
			"aria-label": label,
			onChange: (event) => onChange(event.target.value)
		})]
	});
}
var SplitComponent = Admin;
//#endregion
export { SplitComponent as component };
