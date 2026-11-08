import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { r as toast } from "../_libs/sonner.mjs";
import { a as Button, i as Input, p as api } from "./router-BpXxcPG9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/desk-BGBt-Q2d.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function StockBanner() {
	const low = (useQuery({
		queryKey: ["desk"],
		queryFn: () => api.listDesk()
	}).data?.stock ?? []).filter((item) => item.quantity <= item.min);
	if (low.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "rounded-xl bg-surface px-4 py-3 text-sm text-ink shadow-border",
		children: ["Stock bajo: ", low.map((item) => `${item.name} (${item.quantity} ${item.unit})`).join(" · ")]
	});
}
function ClinicDesk() {
	const queryClient = useQueryClient();
	const desk = useQuery({
		queryKey: ["desk"],
		queryFn: () => api.listDesk()
	});
	const catalog = useQuery({
		queryKey: ["catalog"],
		queryFn: () => api.getCatalog()
	});
	const [stock, setStock] = (0, import_react.useState)(null);
	const [packs, setPacks] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (desk.data && !stock) setStock(structuredClone(desk.data.stock));
		if (desk.data && !packs) setPacks(structuredClone(desk.data.packs));
	}, [
		desk.data,
		stock,
		packs
	]);
	const saveStock = useMutation({
		mutationFn: () => api.saveStock(stock ?? []),
		onSuccess: (saved) => {
			setStock(structuredClone(saved));
			queryClient.invalidateQueries({ queryKey: ["desk"] });
			toast.success("Stock guardado");
		}
	});
	const savePacks = useMutation({
		mutationFn: () => api.savePacks(packs ?? []),
		onSuccess: (saved) => {
			setPacks(structuredClone(saved));
			queryClient.invalidateQueries({ queryKey: ["desk"] });
			toast.success("Packs guardados");
		}
	});
	if (!stock || !packs || !catalog.data) return null;
	const activities = catalog.data.activities;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "flex flex-col gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-end justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "label-kicker",
						children: "Almacén"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl font-medium text-ink",
						children: "Viales y material"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => setStock([...stock, {
							id: `stock-${Date.now()}`,
							name: "Nuevo material",
							unit: "ud",
							quantity: 0,
							min: 1,
							perVisit: 1
						}]),
						children: "Añadir"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-ink-muted",
					children: "Al marcar una visita como hecha se descuenta el material ligado a esa actividad."
				}),
				stock.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2 rounded-xl bg-surface p-3 shadow-border sm:grid-cols-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "sm:col-span-2",
							"aria-label": "Material",
							value: item.name,
							onChange: (event) => setStock(stock.map((row, i) => i === index ? {
								...row,
								name: event.target.value
							} : row))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							"aria-label": "Unidad",
							value: item.unit,
							onChange: (event) => setStock(stock.map((row, i) => i === index ? {
								...row,
								unit: event.target.value
							} : row))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							"aria-label": "Cantidad",
							inputMode: "numeric",
							value: String(item.quantity),
							onChange: (event) => setStock(stock.map((row, i) => i === index ? {
								...row,
								quantity: Number(event.target.value)
							} : row))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							"aria-label": "Mínimo",
							inputMode: "numeric",
							value: String(item.min),
							onChange: (event) => setStock(stock.map((row, i) => i === index ? {
								...row,
								min: Number(event.target.value)
							} : row))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							"aria-label": "Por visita",
							inputMode: "numeric",
							value: String(item.perVisit),
							onChange: (event) => setStock(stock.map((row, i) => i === index ? {
								...row,
								perVisit: Number(event.target.value)
							} : row))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							"aria-label": "Actividad que lo consume",
							className: "h-11 rounded-md bg-bg px-3 text-sm text-ink shadow-border sm:col-span-4",
							value: item.activityId ?? "",
							onChange: (event) => setStock(stock.map((row, i) => i === index ? {
								...row,
								activityId: event.target.value || void 0
							} : row)),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Sin actividad — no se descuenta solo"
							}), activities.map((activity) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: activity.id,
								children: activity.name
							}, activity.id))]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "sm:col-span-2",
							variant: "ghost",
							size: "sm",
							onClick: () => setStock(stock.filter((_, i) => i !== index)),
							children: "Quitar"
						})
					]
				}, item.id)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					disabled: saveStock.isPending,
					onClick: () => saveStock.mutate(),
					children: "Guardar stock"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "flex flex-col gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-end justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "label-kicker",
						children: "Tratamientos"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl font-medium text-ink",
						children: "Packs y sesiones"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => setPacks([...packs, {
							id: `pack-${Date.now()}`,
							name: "Nuevo pack",
							summary: "",
							steps: [{
								id: `step-${Date.now()}`,
								activityId: activities[0]?.id ?? "",
								action: "Primera sesión",
								afterDays: 28
							}]
						}]),
						children: "Nuevo pack"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-ink-muted",
					children: "Cada pack es una ficha. Se asigna a un paciente y el profesional se adapta en su ficha. Al marcar una sesión como hecha, se programa la siguiente."
				}),
				packs.map((pack, packIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "flex flex-col gap-2 rounded-xl bg-surface p-4 shadow-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							"aria-label": "Nombre del pack",
							value: pack.name,
							onChange: (event) => setPacks(packs.map((item, i) => i === packIndex ? {
								...item,
								name: event.target.value
							} : item))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							"aria-label": "Resumen del pack",
							value: pack.summary,
							onChange: (event) => setPacks(packs.map((item, i) => i === packIndex ? {
								...item,
								summary: event.target.value
							} : item))
						}),
						pack.steps.map((step, stepIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2 sm:grid-cols-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									"aria-label": `Actividad sesión ${stepIndex + 1}`,
									className: "h-11 rounded-md bg-bg px-3 text-sm text-ink shadow-border sm:col-span-2",
									value: step.activityId,
									onChange: (event) => setPacks(packs.map((item, i) => i === packIndex ? {
										...item,
										steps: item.steps.map((row, j) => j === stepIndex ? {
											...row,
											activityId: event.target.value
										} : row)
									} : item)),
									children: activities.map((activity) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: activity.id,
										children: activity.name
									}, activity.id))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									className: "sm:col-span-3",
									"aria-label": "Qué hay que hacer",
									value: step.action,
									onChange: (event) => setPacks(packs.map((item, i) => i === packIndex ? {
										...item,
										steps: item.steps.map((row, j) => j === stepIndex ? {
											...row,
											action: event.target.value
										} : row)
									} : item))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									"aria-label": "Días hasta la siguiente",
									inputMode: "numeric",
									value: String(step.afterDays),
									onChange: (event) => setPacks(packs.map((item, i) => i === packIndex ? {
										...item,
										steps: item.steps.map((row, j) => j === stepIndex ? {
											...row,
											afterDays: Number(event.target.value) || 0
										} : row)
									} : item))
								})
							]
						}, step.id)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "outline",
								onClick: () => setPacks(packs.map((item, i) => i === packIndex ? {
									...item,
									steps: [...item.steps, {
										id: `step-${Date.now()}`,
										activityId: activities[0]?.id ?? "",
										action: "Siguiente sesión",
										afterDays: 28
									}]
								} : item)),
								children: "Añadir sesión"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => setPacks(packs.filter((_, i) => i !== packIndex)),
								children: "Quitar pack"
							})]
						})
					]
				}, pack.id)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					disabled: savePacks.isPending,
					onClick: () => savePacks.mutate(),
					children: "Guardar packs"
				})
			]
		})]
	});
}
//#endregion
export { StockBanner as n, ClinicDesk as t };
