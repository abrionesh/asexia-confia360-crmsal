import { o as __toESM } from "../_runtime.mjs";
import { d as blankActivity, f as blankProfessional, t as ACTIVITY_COLORS } from "./clinic-BBb0I11m.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { S as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { r as toast } from "../_libs/sonner.mjs";
import { a as DialogOverlay, i as DialogDescription, n as DialogClose, o as DialogPortal, r as DialogContent, s as DialogTitle, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { a as Button, g as formatMoney, i as Input, o as useUiStore, p as api } from "./router-BpXxcPG9.mjs";
import { t as Skeleton } from "./skeleton-CeM7hW1C.mjs";
import { t as ClinicDesk } from "./desk-BGBt-Q2d.mjs";
import { t as Attachments } from "./attachments-D8jWr-v-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-wEFJxf4Y.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RecordDialog({ open, title, description, onOpenChange, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-40 bg-ink/25" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-2xl bg-bg shadow-overlay outline-none sm:inset-x-auto sm:top-8 sm:bottom-8 sm:left-1/2 sm:w-[40rem] sm:-translate-x-1/2 sm:rounded-xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-start justify-between gap-3 border-b border-border px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "font-display text-xl font-medium text-ink",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					className: "mt-1 text-xs text-ink-muted",
					children: description
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
					className: "inline-flex h-10 shrink-0 items-center rounded-full px-3 text-sm font-medium text-ink-muted",
					children: "Cerrar"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-h-0 flex-1 overflow-y-auto px-4 py-4",
				children
			})]
		})] })
	});
}
function Admin() {
	const role = useUiStore((state) => state.role);
	const setDoctor = useUiStore((state) => state.setDoctor);
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const catalogQuery = useQuery({
		queryKey: ["catalog"],
		queryFn: () => api.getCatalog()
	});
	const [draft, setDraft] = (0, import_react.useState)(null);
	const [activity, setActivity] = (0, import_react.useState)(null);
	const [professional, setProfessional] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (catalogQuery.data && !draft) setDraft(structuredClone(catalogQuery.data));
	}, [catalogQuery.data, draft]);
	const save = useMutation({
		mutationFn: (next) => api.saveCatalog(next),
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
	function commit(next) {
		setDraft(next);
		save.mutate(next);
	}
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
					children: "Cada actividad y cada profesional tienen su ficha. El precio, el coste y el color alimentan la agenda y la rentabilidad."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-end justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "label-kicker",
						children: "Actividades"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => setActivity(blankActivity(draft.activities.length)),
						children: "Nueva"
					})]
				}), draft.activities.map((item) => {
					const margin = item.price - item.cost;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setActivity(structuredClone(item)),
						className: "flex items-center gap-3 rounded-xl bg-surface px-3 py-3 text-left shadow-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex size-10 shrink-0 items-center justify-center rounded-lg text-xs font-medium text-white",
								style: { background: item.color },
								children: item.code
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate text-sm font-medium text-ink",
									children: item.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "block truncate text-xs text-ink-muted",
									children: [
										item.sector,
										" · ",
										item.subsector
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-right text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block tabular-nums text-ink",
									children: formatMoney(item.price)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "block tabular-nums text-ink-subtle",
									children: [
										"Coste ",
										formatMoney(item.cost),
										" · ",
										item.price ? Math.round(margin / item.price * 100) : 0,
										"%"
									]
								})]
							})
						]
					}, item.id);
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-end justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "label-kicker",
						children: "Profesionales"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => setProfessional(blankProfessional()),
						children: "Nuevo"
					})]
				}), draft.professionals.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => {
						const costs = item.activityCosts.length ? item.activityCosts : draft.activities.filter((activity) => activity.professionalIds.includes(item.id)).map((activity) => ({
							activityId: activity.id,
							cost: activity.cost
						}));
						setProfessional(structuredClone({
							...item,
							activityCosts: costs
						}));
					},
					className: "flex items-center gap-3 rounded-xl bg-surface px-3 py-3 text-left shadow-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "size-3 shrink-0 rounded-full",
						style: { background: item.color }
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate text-sm font-medium text-ink",
							children: item.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "block truncate text-xs text-ink-muted",
							children: [
								item.specialty,
								" · ",
								item.phone
							]
						})]
					})]
				}, item.id))]
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
					children: "Horario de apertura de la clínica"
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
				onClick: () => save.mutate(draft),
				children: "Guardar salas y horario"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClinicDesk, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordDialog, {
				open: activity !== null,
				title: activity?.name || "Actividad",
				description: "Precio, coste, color, enlaces y quién puede hacerla.",
				onOpenChange: (open) => {
					if (!open) setActivity(null);
				},
				children: activity ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActivityForm, {
					activity,
					catalog: draft,
					onChange: setActivity,
					onSave: () => {
						const activities = draft.activities.some((item) => item.id === activity.id) ? draft.activities.map((item) => item.id === activity.id ? activity : item) : [...draft.activities, activity];
						commit({
							...draft,
							activities
						});
						setActivity(null);
					}
				}) : null
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordDialog, {
				open: professional !== null,
				title: professional?.name || "Profesional",
				description: "Contacto, horario de atención, actividades y coste.",
				onOpenChange: (open) => {
					if (!open) setProfessional(null);
				},
				children: professional ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfessionalForm, {
					professional,
					catalog: draft,
					onChange: setProfessional,
					onAgenda: () => {
						setDoctor(professional.name);
						navigate({ to: "/agenda" });
					},
					onSave: () => {
						const professionals = draft.professionals.some((item) => item.id === professional.id) ? draft.professionals.map((item) => item.id === professional.id ? professional : item) : [...draft.professionals, professional];
						const activities = draft.activities.map((item) => {
							const linked = professional.activityCosts.some((cost) => cost.activityId === item.id) || item.professionalIds.includes(professional.id);
							const ids = item.professionalIds.filter((id) => id !== professional.id);
							return {
								...item,
								professionalIds: linked ? [...ids, professional.id] : ids
							};
						});
						commit({
							...draft,
							professionals,
							activities
						});
						setProfessional(null);
					}
				}) : null
			})
		]
	});
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
function ActivityForm({ activity, catalog, onChange, onSave }) {
	const margin = activity.price - activity.cost;
	function set(key, value) {
		onChange({
			...activity,
			[key]: value
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "flex flex-col gap-3",
		onSubmit: (event) => {
			event.preventDefault();
			onSave();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Nombre",
				value: activity.name,
				onChange: (name) => set("name", name)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Número",
						value: activity.code,
						onChange: (code) => set("code", code)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Duración (min)",
						value: String(activity.durationMin),
						onChange: (value) => set("durationMin", Number(value) || 0)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Recordar a los (días)",
						value: activity.recallDays ? String(activity.recallDays) : "",
						onChange: (value) => set("recallDays", value ? Number(value) || void 0 : void 0)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Sector",
						value: activity.sector,
						onChange: (sector) => set("sector", sector)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Subsector",
						value: activity.subsector,
						onChange: (subsector) => set("subsector", subsector)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Precio",
						value: String(activity.price),
						onChange: (value) => set("price", Number(value) || 0)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Coste",
						value: String(activity.cost),
						onChange: (value) => set("cost", Number(value) || 0)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-ink-muted",
				children: [
					"Margen ",
					formatMoney(margin),
					" · ",
					activity.price ? Math.round(margin / activity.price * 100) : 0,
					"% sobre el precio."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-xs text-ink-subtle",
				children: ["Descripción", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					value: activity.description,
					onChange: (event) => set("description", event.target.value),
					rows: 3,
					className: "mt-1 w-full rounded-md bg-surface px-3 py-2 text-sm text-ink shadow-border"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-ink-subtle",
				children: "Color"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 flex flex-wrap gap-2",
				children: ACTIVITY_COLORS.map((color) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": color,
					onClick: () => set("color", color),
					className: "size-9 rounded-full",
					style: {
						background: color,
						outline: activity.color === color ? "2px solid #1A1D1C" : "none",
						outlineOffset: 2
					}
				}, color))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-ink-subtle",
				children: "Profesionales capacitados"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 flex flex-wrap gap-2",
				children: catalog.professionals.map((item) => {
					const on = activity.professionalIds.includes(item.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => set("professionalIds", on ? activity.professionalIds.filter((id) => id !== item.id) : [...activity.professionalIds, item.id]),
						className: `h-9 rounded-full px-3 text-xs font-medium ${on ? "bg-accent text-accent-fg" : "bg-surface text-ink shadow-border"}`,
						children: item.name
					}, item.id);
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Links, {
				links: activity.links,
				onChange: (links) => set("links", links)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Attachments, {
				target: {
					kind: "activity",
					activityId: activity.id
				},
				files: activity.files ?? [],
				title: "Documentos de la actividad"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				children: "Guardar ficha"
			})
		]
	});
}
function ProfessionalForm({ professional, catalog, onChange, onSave, onAgenda }) {
	function set(key, value) {
		onChange({
			...professional,
			[key]: value
		});
	}
	function linked(activityId) {
		return professional.activityCosts.some((item) => item.activityId === activityId);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "flex flex-col gap-3",
		onSubmit: (event) => {
			event.preventDefault();
			onSave();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Nombre",
				value: professional.name,
				onChange: (name) => set("name", name)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Especialidad",
				value: professional.specialty,
				onChange: (specialty) => set("specialty", specialty)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Teléfono",
				value: professional.phone,
				onChange: (phone) => set("phone", phone)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Correo",
				value: professional.email,
				onChange: (email) => set("email", email)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Nº colegiado (opcional)",
				value: professional.license ?? "",
				onChange: (license) => set("license", license)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-xs text-ink-subtle",
				children: ["CV breve (opcional)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					value: professional.cv ?? "",
					onChange: (event) => set("cv", event.target.value),
					rows: 3,
					className: "mt-1 w-full rounded-md bg-surface px-3 py-2 text-sm text-ink shadow-border"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-ink-subtle",
				children: "Color del horario de atención"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 flex flex-wrap gap-2",
				children: ACTIVITY_COLORS.map((color) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": color,
					onClick: () => set("color", color),
					className: "size-9 rounded-full",
					style: {
						background: color,
						outline: professional.color === color ? "2px solid #1A1D1C" : "none",
						outlineOffset: 2
					}
				}, color))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-ink-subtle",
				children: "Horario de atención"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 flex flex-col gap-2",
				children: professional.hours.map((day, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "grid grid-cols-[1fr_auto_auto] items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm text-ink",
							children: day.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "time",
							value: day.open,
							"aria-label": `Desde ${day.label}`,
							className: "w-28",
							disabled: day.closed,
							onChange: (event) => {
								set("hours", professional.hours.map((item, itemIndex) => itemIndex === index ? {
									...item,
									open: event.target.value
								} : item));
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "time",
							value: day.close,
							"aria-label": `Hasta ${day.label}`,
							className: "w-28",
							disabled: day.closed,
							onChange: (event) => {
								set("hours", professional.hours.map((item, itemIndex) => itemIndex === index ? {
									...item,
									close: event.target.value
								} : item));
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "col-span-3 text-left text-xs font-medium",
							style: { color: professional.color },
							onClick: () => {
								set("hours", professional.hours.map((item, itemIndex) => itemIndex === index ? {
									...item,
									closed: !item.closed
								} : item));
							},
							children: day.closed ? "Marcar atención" : "Sin atención este día"
						})
					]
				}, day.day))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-ink-subtle",
				children: "Actividades y coste asociado"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 flex flex-col gap-2",
				children: catalog.activities.map((item) => {
					const on = linked(item.id);
					const cost = professional.activityCosts.find((row) => row.activityId === item.id)?.cost ?? item.cost;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-lg bg-surface p-2 shadow-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "text-sm font-medium text-ink",
							onClick: () => {
								set("activityCosts", on ? professional.activityCosts.filter((row) => row.activityId !== item.id) : [...professional.activityCosts.filter((row) => row.activityId !== item.id), {
									activityId: item.id,
									cost: item.cost
								}]);
							},
							children: [
								on ? "Quitar" : "Añadir",
								" · ",
								item.code,
								" ",
								item.name
							]
						}), on ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "mt-2",
							type: "number",
							"aria-label": `Coste ${item.name}`,
							value: String(cost),
							onChange: (event) => {
								const next = Number(event.target.value) || 0;
								set("activityCosts", professional.activityCosts.some((row) => row.activityId === item.id) ? professional.activityCosts.map((row) => row.activityId === item.id ? {
									...row,
									cost: next
								} : row) : [...professional.activityCosts, {
									activityId: item.id,
									cost: next
								}]);
							}
						}) : null]
					}, item.id);
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					children: "Guardar ficha"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					onClick: onAgenda,
					children: "Ver su agenda"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Attachments, {
				target: {
					kind: "professional",
					professionalId: professional.id
				},
				files: professional.files ?? [],
				title: "Documentos del profesional"
			})
		]
	});
}
function Links({ links, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-ink-subtle",
			children: "Enlaces"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-2 flex flex-col gap-2",
			children: links.map((link, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "grid gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: link.label,
					"aria-label": "Texto del enlace",
					placeholder: "Texto",
					onChange: (event) => onChange(links.map((item, itemIndex) => itemIndex === index ? {
						...item,
						label: event.target.value
					} : item))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: link.url,
					"aria-label": "URL",
					placeholder: "https://",
					onChange: (event) => onChange(links.map((item, itemIndex) => itemIndex === index ? {
						...item,
						url: event.target.value
					} : item))
				})]
			}, index))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			className: "mt-2",
			variant: "outline",
			size: "sm",
			onClick: () => onChange([...links, {
				label: "",
				url: ""
			}]),
			children: "Añadir enlace"
		})
	] });
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
