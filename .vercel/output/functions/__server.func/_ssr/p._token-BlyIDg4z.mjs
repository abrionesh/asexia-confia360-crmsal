import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { r as toast } from "../_libs/sonner.mjs";
import { a as Button, d as createSsrRpc, r as Route$2, s as AsexiAMark } from "./router-BpXxcPG9.mjs";
import { r as format, t as es } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/p._token-BlyIDg4z.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var openPortal = createServerFn({ method: "POST" }).validator((data) => ({ token: String(data?.token ?? "").trim() })).handler(createSsrRpc("624b6bac1337a080c0530dffb6e7be3020b914cc0d70fe763e7aba2190cd05a1"));
var patientReply = createServerFn({ method: "POST" }).validator((data) => ({
	token: String(data?.token ?? "").trim(),
	answer: data?.answer === "no-puede" ? "no-puede" : "confirmada"
})).handler(createSsrRpc("d11103c522de88aeaac9de1da87ab79fccfc9cf6d92c1a49c4742cf7dd2ebadc"));
var patientSign = createServerFn({ method: "POST" }).validator((data) => ({
	token: String(data?.token ?? "").trim(),
	signature: String(data?.signature ?? "")
})).handler(createSsrRpc("e7a8072d96427befafbd6c49cf64bbc84ab51c32c34d316d211c1783bb421b26"));
function PortalPage({ token }) {
	const [view, setView] = (0, import_react.useState)(void 0);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [signature, setSignature] = (0, import_react.useState)("");
	async function load() {
		const next = await openPortal({ data: { token } });
		setView(next);
	}
	(0, import_react.useEffect)(() => {
		let alive = true;
		openPortal({ data: { token } }).then((next) => {
			if (alive) setView(next);
		});
		return () => {
			alive = false;
		};
	}, [token]);
	async function reply(answer) {
		setBusy(true);
		try {
			const result = await patientReply({ data: {
				token,
				answer
			} });
			toast.success(result.message);
			await load();
		} catch {
			toast.error("No se ha podido enviar la respuesta.");
		} finally {
			setBusy(false);
		}
	}
	async function sign() {
		if (!signature) {
			toast.error("Firme en el recuadro.");
			return;
		}
		setBusy(true);
		try {
			const result = await patientSign({ data: {
				token,
				signature
			} });
			if (!result.ok) toast.error(result.message);
			else toast.success(result.message);
			await load();
		} catch {
			toast.error("No se ha podido guardar la firma.");
		} finally {
			setBusy(false);
		}
	}
	if (view === void 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center bg-bg text-sm text-ink-muted",
		children: "Abriendo su cita…"
	});
	if (!view) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center bg-bg px-6 text-center text-ink",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "max-w-sm text-sm text-ink-muted",
			children: "Este enlace no corresponde a ninguna ficha."
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-dvh max-w-lg flex-col gap-4 bg-bg px-4 py-8 text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AsexiAMark, { className: "size-8" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "label-kicker",
				children: view.clinicName
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				className: "font-display text-3xl font-medium tracking-tight",
				children: ["Hola, ", view.firstName]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl bg-surface p-4 shadow-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "label-kicker",
					children: "Su próxima cita"
				}), view.visit ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-1 font-display text-2xl font-medium",
						children: view.visit.activityName
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-ink-muted",
						children: format(new Date(view.visit.at), "EEEE d MMMM · HH:mm", { locale: es })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-ink-muted",
						children: [
							view.visit.professional,
							" · ",
							view.visit.roomName
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-ink",
						children: view.visit.confirmation === "confirmada" ? "Confirmada." : view.visit.confirmation === "no-puede" ? "Nos dijo que no puede." : "Aún sin confirmar."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							disabled: busy,
							onClick: () => void reply("confirmada"),
							children: "Confirmo"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							disabled: busy,
							onClick: () => void reply("no-puede"),
							children: "No puedo"
						})]
					})
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-ink-muted",
					children: "No tiene una cita pendiente."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl bg-surface p-4 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "label-kicker",
						children: "Consentimiento"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-1 font-display text-xl font-medium",
						children: "Firma en este móvil"
					}),
					view.consentSigned ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-ink-muted",
						children: "Ya está firmado. La clínica lo ve en su ficha."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-ink-muted",
							children: "Firme para autorizar el tratamiento. Sin esta firma no se programa quirófano."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignaturePad, { onChange: setSignature }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-3",
							disabled: busy,
							onClick: () => void sign(),
							children: "Enviar firma"
						})
					] })
				]
			})
		]
	});
}
function SignaturePad({ onChange }) {
	const canvasRef = (0, import_react.useRef)(null);
	const onChangeRef = (0, import_react.useRef)(onChange);
	onChangeRef.current = onChange;
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		ctx.fillStyle = "#fffdf8";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.strokeStyle = "#1a1612";
		ctx.lineWidth = 2.4;
		ctx.lineCap = "round";
		let drawing = false;
		const point = (event) => {
			const rect = canvas.getBoundingClientRect();
			return {
				x: (event.clientX - rect.left) * canvas.width / rect.width,
				y: (event.clientY - rect.top) * canvas.height / rect.height
			};
		};
		const down = (event) => {
			drawing = true;
			canvas.setPointerCapture(event.pointerId);
			const next = point(event);
			ctx.beginPath();
			ctx.moveTo(next.x, next.y);
		};
		const move = (event) => {
			if (!drawing) return;
			const next = point(event);
			ctx.lineTo(next.x, next.y);
			ctx.stroke();
		};
		const up = () => {
			if (!drawing) return;
			drawing = false;
			onChangeRef.current(canvas.toDataURL("image/png"));
		};
		canvas.addEventListener("pointerdown", down);
		canvas.addEventListener("pointermove", move);
		canvas.addEventListener("pointerup", up);
		canvas.addEventListener("pointercancel", up);
		return () => {
			canvas.removeEventListener("pointerdown", down);
			canvas.removeEventListener("pointermove", move);
			canvas.removeEventListener("pointerup", up);
			canvas.removeEventListener("pointercancel", up);
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref: canvasRef,
		width: 560,
		height: 220,
		className: "mt-3 h-28 w-full touch-none rounded-md bg-[#fffdf8] shadow-border",
		"aria-label": "Zona de firma"
	});
}
function PortalRoute() {
	const { token } = Route$2.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortalPage, { token });
}
//#endregion
export { PortalRoute as component };
