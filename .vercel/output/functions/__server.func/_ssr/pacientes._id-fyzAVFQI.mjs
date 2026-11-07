import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as Cake, f as MessageCircle, i as UserRound, m as Mail, p as MapPin, s as Sparkles, u as Phone, v as AudioLines, y as ArrowLeft } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { r as toast } from "../_libs/sonner.mjs";
import { c as cn, d as stageMeta, i as Button, l as formatMoney, n as Route, r as Input, s as api } from "./router-DMvJ3L8T.mjs";
import { t as Skeleton } from "./skeleton-BQdK-Qwf.mjs";
import { t as Badge } from "./badge-CGUhCUpP.mjs";
import { r as format, t as es } from "../_libs/date-fns.mjs";
import { n as economics, r as nextBirthday, t as ageFrom } from "./economics-BmdMdSOl.mjs";
import { n as Avatar, r as PatientAlarms } from "./queue-BsppD4RH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pacientes._id-fyzAVFQI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Separator({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "separator",
		className: cn("h-px w-full bg-border", className)
	});
}
var STAGE_TONE = {
	new: "muted",
	qualified: "accent",
	proposal: "warning",
	confirmed: "ink",
	followup: "voice",
	invoiced: "success",
	lost: "warning"
};
function ContactPanel({ patient }) {
	const stage = stageMeta(patient.stage);
	const money = economics(patient);
	const birthday = patient.birthday ? nextBirthday(patient.birthday) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "rounded-xl bg-surface p-5 shadow-border lg:sticky lg:top-24",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
					name: patient.fullName,
					size: "lg"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "label-kicker",
							children: "Ficha 360"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-2xl font-medium tracking-tight text-ink",
							children: patient.fullName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-ink-muted",
							children: patient.treatmentInterest
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: STAGE_TONE[patient.stage],
						children: stage.label
					}),
					patient.billed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "success",
						children: "Cobrado"
					}) : null,
					patient.aiScore ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						tone: "accent",
						children: ["IA ", patient.aiScore]
					}) : null,
					patient.tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: tag }, tag))
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-6 space-y-3 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						icon: Phone,
						label: "Teléfono",
						value: patient.phone
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						icon: Mail,
						label: "Email",
						value: patient.email
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						icon: MapPin,
						label: "Ciudad",
						value: `${patient.city} · ${patient.clinic}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						icon: UserRound,
						label: "Responsable",
						value: patient.assignedTo
					}),
					patient.birthday ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						icon: Cake,
						label: "Cumpleaños",
						value: birthday ? `${new Date(patient.birthday).toLocaleDateString("es-ES", {
							day: "numeric",
							month: "long"
						})} · ${ageFrom(patient.birthday)} años` : patient.birthday
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, { className: "my-5" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-3 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Total",
						value: formatMoney(money.total)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Cobrado",
						value: formatMoney(money.collected)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Pendiente",
						value: formatMoney(money.pending)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, { className: "my-5" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "label-kicker",
				children: "Notas clínicas"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-relaxed text-ink-muted",
				children: patient.notes
			})] }),
			patient.lostReason ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 rounded-lg bg-bg px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "label-kicker",
					children: "No insistir"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-ink",
					children: patient.lostReason
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LostForm, { patientId: patient.id }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClinicalBlock, { patient }),
			patient.nextAction ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 rounded-lg bg-accent-soft px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "label-kicker text-accent",
					children: "Siguiente acción"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm font-medium text-accent",
					children: patient.nextAction
				})]
			}) : null
		]
	});
}
function Row({ icon: Icon, label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-start gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "mt-0.5 size-4 text-ink-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-xs text-ink-subtle",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "text-ink",
			children: value
		})] })]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-xs text-ink-subtle",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-0.5 font-display text-lg font-medium tabular-nums text-ink",
		children: value
	})] });
}
function ClinicalBlock({ patient }) {
	const queryClient = useQueryClient();
	const [text, setText] = (0, import_react.useState)(patient.contraindications ?? "");
	const refresh = () => {
		queryClient.invalidateQueries({ queryKey: ["patient", patient.id] });
		queryClient.invalidateQueries({ queryKey: ["timeline", patient.id] });
	};
	const save = useMutation({
		mutationFn: () => api.setContraindications(patient.id, text),
		onSuccess: () => {
			refresh();
			toast.success("Contraindicaciones guardadas");
		}
	});
	const sign = useMutation({
		mutationFn: () => api.signConsent(patient.id),
		onSuccess: () => {
			refresh();
			toast.success("Consentimiento firmado");
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "label-kicker",
				children: "Seguridad"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
				value: text,
				onChange: (event) => setText(event.target.value),
				rows: 3,
				"aria-label": "Contraindicaciones",
				placeholder: "Alergias, medicación, lo que impide tratar",
				className: "mt-2 w-full rounded-md bg-bg px-3 py-2 text-sm text-ink shadow-border outline-none"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "outline",
					disabled: save.isPending,
					onClick: () => save.mutate(),
					children: "Guardar"
				}), patient.consentSigned ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "success",
					children: "Consentimiento firmado"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					disabled: sign.isPending,
					onClick: () => sign.mutate(),
					children: "Firmar consentimiento"
				})]
			}),
			patient.consentSigned ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-ink-muted",
				children: "Sin firma no se programa quirófano."
			})
		]
	});
}
function LostForm({ patientId }) {
	const queryClient = useQueryClient();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [reason, setReason] = (0, import_react.useState)("");
	const save = useMutation({
		mutationFn: () => api.markLost(patientId, reason),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
			queryClient.invalidateQueries({ queryKey: ["pipeline"] });
			queryClient.invalidateQueries({ queryKey: ["alarms"] });
			toast.success("No se le volverá a escribir");
		}
	});
	if (!open) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		className: "mt-5",
		variant: "ghost",
		onClick: () => setOpen(true),
		children: "Dar por perdido"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "mt-5 flex flex-col gap-2",
		onSubmit: (event) => {
			event.preventDefault();
			if (!reason.trim()) return;
			save.mutate();
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			value: reason,
			onChange: (event) => setReason(event.target.value),
			placeholder: "Motivo. No se insiste.",
			"aria-label": "Motivo de pérdida",
			required: true
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "submit",
			variant: "outline",
			disabled: save.isPending,
			children: "Confirmar pérdida"
		})]
	});
}
function openWhatsApp(phone, text) {
	const digits = phone.replace(/\D/g, "");
	window.open(`https://wa.me/${digits}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
}
function openMail(email, subject, body) {
	window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
var WIN = {
	á: "\\341",
	é: "\\351",
	í: "\\355",
	ó: "\\363",
	ú: "\\372",
	ñ: "\\361",
	Á: "\\301",
	É: "\\311",
	Í: "\\315",
	Ó: "\\323",
	Ú: "\\332",
	Ñ: "\\321",
	ü: "\\374",
	"€": " EUR"
};
function pdfText(value) {
	return value.split("").map((char) => WIN[char] ?? (char.charCodeAt(0) > 126 ? "?" : char)).join("").replace(/\\(?![0-7])/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}
function money(value) {
	return `${new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 }).format(value)} EUR`;
}
function downloadQuote(patient) {
	const figures = economics(patient);
	const lines = [
		"AsexiA Castellana",
		"Presupuesto",
		"",
		patient.fullName,
		patient.treatmentInterest,
		patient.phone,
		"",
		`Total ${money(figures.total)}`,
		`Cobrado ${money(figures.collected)}`,
		`Pendiente ${money(figures.pending)}`,
		"",
		"Validez 15 dias. No incluye lo no descrito en la ficha.",
		"El quirófano requiere consentimiento firmado."
	];
	const commands = [
		"BT",
		"/F1 18 Tf",
		"48 780 Td"
	];
	lines.forEach((line, index) => {
		if (index === 0) {
			commands.push(`(${pdfText(line)}) Tj`);
			return;
		}
		commands.push("0 -22 Td");
		commands.push(`(${pdfText(line)}) Tj`);
	});
	commands.push("ET");
	const stream = commands.join("\n");
	const objects = [
		"1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n",
		"2 0 obj << /Type /Pages /Count 1 /Kids [3 0 R] >> endobj\n",
		"3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n",
		`4 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj\n`,
		"5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n"
	];
	let body = "%PDF-1.4\n";
	const offsets = [0];
	for (const object of objects) {
		offsets.push(body.length);
		body += object;
	}
	const xref = body.length;
	body += `xref\n0 ${objects.length + 1}\n`;
	body += "0000000000 65535 f \n";
	for (const offset of offsets.slice(1)) body += `${String(offset).padStart(10, "0")} 00000 n \n`;
	body += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
	const blob = new Blob([body], { type: "application/pdf" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = `presupuesto-${patient.id}.pdf`;
	link.click();
	URL.revokeObjectURL(url);
}
var STATUS_LABEL = {
	programada: "Programada",
	realizada: "Realizada",
	cancelada: "Cancelada"
};
function ActionBar({ patient }) {
	const refresh = useRefresh(patient.id);
	const [body, setBody] = (0, import_react.useState)("");
	const log = useMutation({
		mutationFn: (channel) => api.logContact(patient.id, {
			channel,
			body: body.trim() || greeting(patient)
		}),
		onSuccess: () => {
			setBody("");
			refresh();
		}
	});
	function send(channel) {
		const text = body.trim() || greeting(patient);
		if (channel === "whatsapp") openWhatsApp(patient.phone, text);
		if (channel === "email") openMail(patient.email, "AsexiA Castellana", text);
		log.mutate(channel, { onSuccess: () => toast.success(channel === "system" ? "Nota en el historial" : "Queda en el historial") });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl bg-surface p-4 shadow-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "label-kicker",
				children: "Contactar"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-1 font-display text-xl font-medium text-ink",
				children: "WhatsApp y correo"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
				value: body,
				onChange: (event) => setBody(event.target.value),
				rows: 3,
				placeholder: `Hola ${patient.firstName}, le escribimos de AsexiA Castellana.`,
				"aria-label": "Mensaje para el paciente",
				className: "mt-3 w-full rounded-md bg-bg px-3 py-2 text-sm text-ink shadow-border outline-none focus-visible:ring-2 focus-visible:ring-accent/35"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						disabled: log.isPending,
						onClick: () => send("whatsapp"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-4" }), "WhatsApp"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						disabled: log.isPending,
						onClick: () => send("email"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-4" }), "Correo"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						disabled: log.isPending || !body.trim(),
						onClick: () => send("system"),
						children: "Guardar nota"
					})
				]
			})
		]
	});
}
function FileCanvas({ patient }) {
	const catalog = useQuery({
		queryKey: ["catalog"],
		queryFn: () => api.getCatalog()
	}).data;
	const money = economics(patient);
	const visits = [...patient.visits ?? []].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl bg-surface p-4 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-end justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "label-kicker",
							children: "Canvas de la ficha"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-1 font-display text-xl font-medium text-ink",
							children: "Historial de citas"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-ink-subtle",
							children: visits.length
						})]
					}),
					visits.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-ink-muted",
						children: "Todavía no hay citas en esta ficha."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 flex flex-col gap-3",
						children: visits.map((visit) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-lg bg-bg p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										tone: visit.status === "realizada" ? "success" : visit.status === "cancelada" ? "muted" : "ink",
										children: STATUS_LABEL[visit.status]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-ink-subtle",
										children: format(new Date(visit.at), "EEEE d MMM · HH:mm", { locale: es })
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm font-medium text-ink",
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
									className: "mt-1 text-sm text-ink",
									children: formatMoney(visit.price)
								}),
								visit.notes ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-relaxed text-ink-muted",
									children: visit.notes
								}) : null
							]
						}, visit.id))
					}),
					catalog ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VisitForm, {
						patient,
						activities: catalog.activities,
						rooms: catalog.rooms
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl bg-surface p-4 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "label-kicker",
						children: "Economía"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-1 font-display text-xl font-medium text-ink",
						children: "Total, cobrado y pendiente"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-3",
						variant: "outline",
						onClick: () => downloadQuote(patient),
						children: "Presupuesto PDF"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid grid-cols-3 gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Money, {
								label: "Total",
								value: money.total
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Money, {
								label: "Cobrado",
								value: money.collected
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Money, {
								label: "Pendiente",
								value: money.pending
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 flex flex-col gap-2",
						children: (patient.payments ?? []).map((payment) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-start justify-between gap-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block font-medium text-ink",
								children: payment.concept
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-ink-subtle",
								children: [
									format(new Date(payment.dueAt), "d MMM yyyy", { locale: es }),
									" · ",
									payment.status
								]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "tabular-nums text-ink",
								children: formatMoney(payment.amount)
							})]
						}, payment.id))
					}),
					(patient.payments ?? []).filter((payment) => payment.status === "pendiente").map((payment) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollectButton, {
						patientId: patient.id,
						paymentId: payment.id
					}, payment.id)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymentForm, { patientId: patient.id })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl bg-surface p-4 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "label-kicker",
						children: "Pendientes"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 flex flex-col gap-2",
						children: (patient.pendings ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "text-sm text-ink-muted",
							children: "No hay pendientes abiertos."
						}) : (patient.pendings ?? []).map((task) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PendingToggle, {
							patientId: patient.id,
							id: task.id,
							title: task.title,
							done: task.done
						}) }, task.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PendingForm, { patientId: patient.id })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlarmForm, { patient }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Satisfaction, { patient })
		]
	});
}
function Money({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-bg px-3 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-2xs text-ink-subtle",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 font-display text-lg tabular-nums text-ink",
			children: formatMoney(value)
		})]
	});
}
function CollectButton({ patientId, paymentId }) {
	const refresh = useRefresh(patientId);
	const collect = useMutation({
		mutationFn: () => api.collectPayment(patientId, paymentId),
		onSuccess: () => {
			refresh();
			toast.success("Entra en la caja de hoy");
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		className: "mt-2",
		size: "sm",
		variant: "secondary",
		disabled: collect.isPending,
		onClick: () => collect.mutate(),
		children: "Cobrar en caja"
	});
}
function Satisfaction({ patient }) {
	const refresh = useRefresh(patient.id);
	const save = useMutation({
		mutationFn: (score) => api.recordSatisfaction(patient.id, score),
		onSuccess: () => {
			refresh();
			toast.success("Respuesta guardada");
		}
	});
	if (!(patient.visits ?? []).some((visit) => visit.status === "realizada" && Date.now() - new Date(visit.at).getTime() > 1728e5) && !patient.satisfaction) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl bg-surface p-4 shadow-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "label-kicker",
				children: "48 horas"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-1 text-sm font-medium text-ink",
				children: "¿Cómo se encuentra?"
			}),
			patient.satisfaction ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm text-ink-muted",
				children: [
					"Respondió: ",
					patient.satisfaction,
					"."
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex gap-2",
				children: [
					"bien",
					"regular",
					"mal"
				].map((score) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "outline",
					disabled: save.isPending,
					onClick: () => save.mutate(score),
					children: score === "bien" ? "Bien" : score === "regular" ? "Regular" : "Mal"
				}, score))
			})
		]
	});
}
function VisitForm({ patient, activities, rooms }) {
	const refresh = useRefresh(patient.id);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [activityId, setActivityId] = (0, import_react.useState)(activities[0]?.id ?? "");
	const [roomId, setRoomId] = (0, import_react.useState)(rooms[0]?.id ?? "");
	const [at, setAt] = (0, import_react.useState)(localInput(new Date(Date.now() + 864e5)));
	const [professional, setProfessional] = (0, import_react.useState)(patient.assignedTo);
	const [notes, setNotes] = (0, import_react.useState)("");
	const save = useMutation({
		mutationFn: () => api.addVisit(patient.id, {
			at: new Date(at).toISOString(),
			activityId,
			roomId,
			professional,
			notes
		}),
		onSuccess: () => {
			setNotes("");
			setOpen(false);
			refresh();
			toast.success("Cita en el historial y en la agenda");
		},
		onError: (error) => {
			if (error.message === "consent") toast.error("Falta el consentimiento. No se programa quirófano.");
		}
	});
	if (!open) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		className: "mt-4",
		variant: "outline",
		onClick: () => setOpen(true),
		children: "Añadir cita"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "mt-4 flex flex-col gap-2",
		onSubmit: (event) => {
			event.preventDefault();
			save.mutate();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
				label: "Actividad",
				value: activityId,
				onChange: setActivityId,
				options: activities.map((item) => ({
					id: item.id,
					label: item.name
				}))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
				label: "Sala",
				value: roomId,
				onChange: setRoomId,
				options: rooms.map((item) => ({
					id: item.id,
					label: item.name
				}))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				type: "datetime-local",
				value: at,
				onChange: (event) => setAt(event.target.value),
				"aria-label": "Fecha de la cita",
				required: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: professional,
				onChange: (event) => setProfessional(event.target.value),
				"aria-label": "Profesional"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: notes,
				onChange: (event) => setNotes(event.target.value),
				placeholder: "Detalle de la cita",
				"aria-label": "Notas de la cita"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: save.isPending,
					children: "Guardar cita"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					onClick: () => setOpen(false),
					children: "Cerrar"
				})]
			})
		]
	});
}
function PaymentForm({ patientId }) {
	const refresh = useRefresh(patientId);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [concept, setConcept] = (0, import_react.useState)("");
	const [amount, setAmount] = (0, import_react.useState)("");
	const [dueAt, setDueAt] = (0, import_react.useState)(localInput(/* @__PURE__ */ new Date()).slice(0, 10));
	const [status, setStatus] = (0, import_react.useState)("pendiente");
	const save = useMutation({
		mutationFn: () => api.addPayment(patientId, {
			concept,
			amount: Number(amount),
			dueAt: new Date(dueAt).toISOString(),
			status
		}),
		onSuccess: () => {
			setConcept("");
			setAmount("");
			setOpen(false);
			refresh();
			toast.success("Pago guardado. Si vence pronto, salta la alarma.");
		}
	});
	if (!open) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		className: "mt-4",
		variant: "outline",
		onClick: () => setOpen(true),
		children: "Planificar pago"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "mt-4 flex flex-col gap-2",
		onSubmit: (event) => {
			event.preventDefault();
			if (!concept.trim() || Number(amount) <= 0) return;
			save.mutate();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: concept,
				onChange: (event) => setConcept(event.target.value),
				placeholder: "Concepto",
				"aria-label": "Concepto del pago",
				required: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: amount,
				onChange: (event) => setAmount(event.target.value),
				type: "number",
				min: "1",
				placeholder: "Importe",
				"aria-label": "Importe",
				required: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				type: "date",
				value: dueAt,
				onChange: (event) => setDueAt(event.target.value),
				"aria-label": "Fecha del pago",
				required: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
				label: "Estado",
				value: status,
				onChange: (value) => setStatus(value),
				options: [{
					id: "pendiente",
					label: "Pendiente"
				}, {
					id: "cobrado",
					label: "Cobrado"
				}]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: save.isPending,
					children: "Guardar pago"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					onClick: () => setOpen(false),
					children: "Cerrar"
				})]
			})
		]
	});
}
function PendingForm({ patientId }) {
	const refresh = useRefresh(patientId);
	const [title, setTitle] = (0, import_react.useState)("");
	const save = useMutation({
		mutationFn: () => api.addPending(patientId, title),
		onSuccess: () => {
			setTitle("");
			refresh();
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "mt-3 flex gap-2",
		onSubmit: (event) => {
			event.preventDefault();
			if (!title.trim()) return;
			save.mutate();
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			value: title,
			onChange: (event) => setTitle(event.target.value),
			placeholder: "Nuevo pendiente",
			"aria-label": "Nuevo pendiente"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "submit",
			variant: "outline",
			disabled: save.isPending || !title.trim(),
			children: "Añadir"
		})]
	});
}
function PendingToggle({ patientId, id, title, done }) {
	const refresh = useRefresh(patientId);
	const toggle = useMutation({
		mutationFn: () => api.togglePending(patientId, id),
		onSuccess: () => refresh()
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => toggle.mutate(),
		className: "flex min-h-11 w-full items-center gap-3 text-left text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `size-4 shrink-0 rounded-full border ${done ? "border-success bg-success" : "border-border-strong"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: done ? "text-ink-subtle line-through" : "text-ink",
			children: title
		})]
	});
}
function AlarmForm({ patient }) {
	const refresh = useRefresh(patient.id);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [title, setTitle] = (0, import_react.useState)("");
	const [dueAt, setDueAt] = (0, import_react.useState)(localInput(new Date(Date.now() + 864e5)));
	const [channel, setChannel] = (0, import_react.useState)("whatsapp");
	const [draft, setDraft] = (0, import_react.useState)(`Hola ${patient.firstName}, le escribimos de AsexiA Castellana.`);
	const save = useMutation({
		mutationFn: () => api.addManualAlarm(patient.id, {
			title,
			dueAt: new Date(dueAt).toISOString(),
			channel,
			draft
		}),
		onSuccess: () => {
			setTitle("");
			setOpen(false);
			refresh();
			toast.success("Alarma creada");
		}
	});
	if (!open) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		variant: "outline",
		onClick: () => setOpen(true),
		children: "Crear alarma"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "rounded-xl bg-surface p-4 shadow-border",
		onSubmit: (event) => {
			event.preventDefault();
			if (!title.trim() || !draft.trim()) return;
			save.mutate();
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "label-kicker",
			children: "Nueva alarma"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 flex flex-col gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: title,
					onChange: (event) => setTitle(event.target.value),
					placeholder: "Motivo",
					"aria-label": "Motivo de la alarma",
					required: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "datetime-local",
					value: dueAt,
					onChange: (event) => setDueAt(event.target.value),
					"aria-label": "Cuándo avisar",
					required: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
					label: "Canal",
					value: channel,
					onChange: (value) => setChannel(value),
					options: [
						{
							id: "whatsapp",
							label: "WhatsApp"
						},
						{
							id: "email",
							label: "Correo"
						},
						{
							id: "internal",
							label: "Llamada interna"
						}
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					value: draft,
					onChange: (event) => setDraft(event.target.value),
					rows: 3,
					"aria-label": "Texto de la alarma",
					className: "w-full rounded-md bg-bg px-3 py-2 text-sm text-ink shadow-border outline-none"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: save.isPending,
						children: "Guardar alarma"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						onClick: () => setOpen(false),
						children: "Cerrar"
					})]
				})
			]
		})]
	});
}
function Select({ label, value, onChange, options }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block text-xs text-ink-subtle",
		children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
			value,
			onChange: (event) => onChange(event.target.value),
			className: "mt-1 h-11 w-full rounded-md bg-surface px-3 text-sm text-ink shadow-border",
			children: options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
				value: option.id,
				children: option.label
			}, option.id))
		})]
	});
}
function useRefresh(patientId) {
	const queryClient = useQueryClient();
	return () => {
		queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
		queryClient.invalidateQueries({ queryKey: ["timeline", patientId] });
		queryClient.invalidateQueries({ queryKey: ["pipeline"] });
		queryClient.invalidateQueries({ queryKey: ["alarms"] });
		queryClient.invalidateQueries({ queryKey: ["metrics"] });
	};
}
function greeting(patient) {
	return `Hola ${patient.firstName}, le escribimos de AsexiA Castellana.`;
}
function localInput(date) {
	const pad = (value) => String(value).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
function PatientSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-5 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl bg-surface p-5 shadow-border",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-14 rounded-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-16" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-7 w-40" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-32" })
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-24 rounded-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-16 rounded-full" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 space-y-3",
					children: Array.from({ length: 4 }).map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full" }, index))
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl bg-surface p-5 shadow-border",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-28" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-2 h-6 w-56" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 space-y-4",
					children: Array.from({ length: 5 }).map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-5 rounded-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 w-full rounded-lg" })]
						})]
					}, index))
				})
			]
		})]
	});
}
function Timeline({ events }) {
	const ordered = [...events].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl bg-surface p-5 shadow-border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "mb-5 flex items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "label-kicker",
				children: "Actividad unificada"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xl font-medium tracking-tight text-ink",
				children: "Historial"
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-ink-subtle",
				children: [ordered.length, " eventos"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
			className: "relative space-y-4 before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-px before:bg-border",
			children: ordered.map((event, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "enter-stagger relative pl-8",
				style: { animationDelay: `${index * 40}ms` },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("absolute top-1.5 left-0 flex size-[22px] items-center justify-center rounded-full", event.channel === "whatsapp" && "bg-channel-wa/15 text-channel-wa", event.channel === "email" && "bg-accent-soft text-accent", event.channel === "voice" && "bg-channel-voice/15 text-channel-voice", event.channel === "system" && "bg-accent-soft text-accent"),
					children: event.channel === "whatsapp" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-3" }) : event.channel === "email" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-3" }) : event.channel === "voice" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudioLines, { className: "size-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventCard, { event })]
			}, event.id))
		})]
	});
}
function EventCard({ event }) {
	const stamp = format(new Date(event.at), "d MMM · HH:mm", { locale: es });
	if (event.channel === "whatsapp") {
		const inbound = event.direction === "inbound";
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
			label: inbound ? "WhatsApp · paciente" : `WhatsApp · ${event.agent ?? "AsexiA"}`,
			stamp
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("mt-2 max-w-prose rounded-lg px-3.5 py-2.5 text-sm leading-relaxed", inbound ? "rounded-tl-xs bg-bg text-ink" : "rounded-tr-xs bg-accent-soft text-accent"),
			children: event.body
		})] });
	}
	if (event.channel === "voice") {
		const minutes = event.durationSec ? `${Math.floor(event.durationSec / 60)} min ${String(event.durationSec % 60).padStart(2, "0")} s` : null;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-lg bg-bg p-3.5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
					label: `${event.title}${event.agent ? ` · ${event.agent}` : ""}`,
					stamp
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex items-end gap-0.5",
					"aria-hidden": "true",
					children: [WAVE.map((height, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "w-0.5 rounded-full bg-channel-voice/50",
						style: { height }
					}, index)), minutes ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-2 text-xs tabular-nums text-ink-subtle",
						children: minutes
					}) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm leading-relaxed text-ink-muted",
					children: event.body
				}),
				event.transcript ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Transcript, { turns: event.transcript }) : null
			]
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
		label: event.title,
		stamp
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-1.5 text-sm leading-relaxed text-ink-muted",
		children: event.body
	})] });
}
function Meta({ label, stamp }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-baseline justify-between gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium text-ink",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-2xs text-ink-subtle",
			children: stamp
		})]
	});
}
function Transcript({ turns }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
		className: "mt-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
			className: "cursor-pointer text-xs font-medium text-accent",
			children: "Ver transcripción"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-2 space-y-2 border-t border-border pt-2",
			children: turns.map((turn, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "text-sm leading-relaxed",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-medium text-ink",
					children: turn.speaker === "agent" ? "Agente" : "Paciente"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-ink-muted",
					children: [" · ", turn.text]
				})]
			}, index))
		})]
	});
}
var WAVE = [
	"6px",
	"10px",
	"14px",
	"8px",
	"16px",
	"11px",
	"18px",
	"9px",
	"13px",
	"7px",
	"15px",
	"10px",
	"12px",
	"8px",
	"14px",
	"6px",
	"11px",
	"16px",
	"9px",
	"12px"
];
function PatientProfile({ id }) {
	const patientQuery = useQuery({
		queryKey: ["patient", id],
		queryFn: () => api.getPatient(id)
	});
	const timelineQuery = useQuery({
		queryKey: ["timeline", id],
		queryFn: () => api.listTimeline(id)
	});
	const loading = patientQuery.isPending || timelineQuery.isPending;
	const patient = patientQuery.data;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/",
			className: "inline-flex h-11 w-fit items-center gap-2 text-sm text-ink-muted transition-colors duration-quick hover:text-ink",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), "Volver al pipeline"]
		}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PatientSkeleton, {}) : !patient ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl bg-surface px-5 py-10 text-center shadow-border",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-xl text-ink",
				children: "Paciente no encontrado"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-ink-muted",
				children: "El identificador no coincide con ninguna ficha del pipeline."
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionBar, { patient }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContactPanel, { patient }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 flex-col gap-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCanvas, { patient }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PatientAlarms, { patientId: patient.id }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Timeline, { events: timelineQuery.data ?? [] })
					]
				})]
			})]
		})]
	});
}
function PatientPage() {
	const { id } = Route.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PatientProfile, { id });
}
//#endregion
export { PatientPage as component };
