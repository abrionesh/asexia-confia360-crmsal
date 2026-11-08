import { o as __toESM } from "../_runtime.mjs";
import { b as isDayClosed, k as tpvByMethod, n as METHOD_LABEL, p as dayKey, r as PAY_METHODS, w as previstoByMethod } from "./clinic-BBb0I11m.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { r as toast } from "../_libs/sonner.mjs";
import { a as Button, g as formatMoney, i as Input, o as useUiStore, p as api } from "./router-BpXxcPG9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/caja-CdfWyXYx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CashDesk() {
	const role = useUiStore((state) => state.role);
	const [day, setDay] = (0, import_react.useState)(dayKey(/* @__PURE__ */ new Date()));
	const [method, setMethod] = (0, import_react.useState)("tarjeta");
	const [amount, setAmount] = (0, import_react.useState)("");
	const [concept, setConcept] = (0, import_react.useState)("Cierre TPV");
	const queryClient = useQueryClient();
	const desk = useQuery({
		queryKey: ["desk"],
		queryFn: () => api.listDesk()
	});
	const pipeline = useQuery({
		queryKey: ["pipeline"],
		queryFn: () => api.listPipeline()
	});
	const refresh = () => {
		queryClient.invalidateQueries({ queryKey: ["desk"] });
		queryClient.invalidateQueries({ queryKey: ["pipeline"] });
	};
	const add = useMutation({
		mutationFn: () => api.addTpv({
			day,
			method,
			amount: Number(amount.replace(",", ".")),
			concept
		}),
		onSuccess: (line) => {
			if (!line) toast.error("Indique un importe.");
			else {
				setAmount("");
				toast.success("TPV cargado");
			}
			refresh();
		},
		onError: (error) => toast.error(error instanceof Error ? error.message.replace(/^caja: /, "") : "No se pudo cargar")
	});
	const close = useMutation({
		mutationFn: () => api.closeDay(day),
		onSuccess: () => {
			toast.success("Día cerrado. Ese total ya no se toca.");
			refresh();
		}
	});
	if (role === "medico") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-ink-muted",
		children: "La caja la cierran dirección y recepción."
	});
	const patients = pipeline.data ?? [];
	const lines = (desk.data?.tpv ?? []).filter((item) => item.day === day);
	const closed = desk.data ? isDayClosed(desk.data.closes, day) : false;
	const frozen = desk.data?.closes.find((item) => item.day === day);
	const previsto = frozen?.previsto ?? previstoByMethod(patients, day);
	const tpv = frozen?.tpv ?? tpvByMethod(lines, day);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "label-kicker",
					children: "Caja"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-medium tracking-tight text-ink",
					children: "Cierre del día"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-2xl text-sm text-ink-muted",
					children: "Durante el día las cifras son una previsión a partir de los cobros de la clínica. Al cargar el TPV, por la mañana o al cierre del turno, se consolidan. Cerrar el día deja un total que ya no se puede tocar."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "max-w-xs text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-ink-muted",
					children: "Día"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "mt-1",
					type: "date",
					value: day,
					onChange: (event) => setDay(event.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Totals, {
					title: closed ? "Previsto, ya cerrado" : "Previsto · cobros de la clínica",
					totals: previsto
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Totals, {
					title: closed ? "TPV, ya cerrado" : "TPV cargado",
					totals: tpv
				})]
			}),
			closed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-xl bg-surface px-4 py-3 text-sm text-ink shadow-border",
				children: "Día cerrado. No se añaden cobros ni líneas de TPV."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex flex-col gap-3 rounded-xl bg-surface p-4 shadow-border",
				onSubmit: (event) => {
					event.preventDefault();
					add.mutate();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "label-kicker",
						children: "Cargar TPV"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: PAY_METHODS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setMethod(item),
							className: `h-10 rounded-full px-3 text-sm font-medium ${method === item ? "bg-accent text-accent-fg" : "bg-bg text-ink-muted"}`,
							children: METHOD_LABEL[item]
						}, item))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							inputMode: "decimal",
							placeholder: "Importe",
							"aria-label": "Importe TPV",
							value: amount,
							onChange: (event) => setAmount(event.target.value)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "Concepto",
							"aria-label": "Concepto TPV",
							value: concept,
							onChange: (event) => setConcept(event.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							variant: "secondary",
							disabled: add.isPending || desk.isPending,
							children: "Añadir línea"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							disabled: close.isPending || desk.isPending,
							onClick: () => close.mutate(),
							children: "Cerrar el día"
						})]
					})
				]
			}),
			lines.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-2",
				children: lines.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between rounded-xl bg-surface px-4 py-3 text-sm shadow-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-medium text-ink",
						children: line.concept
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-ink-muted",
						children: METHOD_LABEL[line.method]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular-nums text-ink",
						children: formatMoney(line.amount)
					})]
				}, line.id))
			}) : null
		]
	});
}
function Totals({ title, totals }) {
	const sum = PAY_METHODS.reduce((acc, method) => acc + totals[method], 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl bg-surface p-4 shadow-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "label-kicker",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-display text-3xl font-medium tabular-nums text-ink",
				children: formatMoney(sum)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 flex flex-col gap-1 text-sm",
				children: PAY_METHODS.map((method) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex justify-between text-ink-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: METHOD_LABEL[method] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular-nums text-ink",
						children: formatMoney(totals[method])
					})]
				}, method))
			})
		]
	});
}
var SplitComponent = CashDesk;
//#endregion
export { SplitComponent as component };
