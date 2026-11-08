import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { r as signIn, t as authClient } from "./client-CVqXY6bk.mjs";
import { t as GROK_PROVIDERS } from "./server-DIt4XQ60.mjs";
import { a as Button, i as Input, s as AsexiAMark } from "./router-BpXxcPG9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-B7fYp-Eq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var BEARER_KEY = "grok-auth.bearer-token";
function Login() {
	const [mode, setMode] = (0, import_react.useState)("in");
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function submit(event) {
		event.preventDefault();
		setBusy(true);
		setError("");
		try {
			const result = mode === "up" ? await authClient.signUp.email({
				email,
				password,
				name,
				callbackURL: "/"
			}) : await authClient.signIn.email({
				email,
				password,
				callbackURL: "/"
			});
			if (result.error) {
				setError(result.error.message ?? "No se ha podido entrar.");
				return;
			}
			const token = result.data?.token;
			if (token) window.sessionStorage.setItem(BEARER_KEY, token);
			window.location.assign("/");
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "No se ha podido entrar.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center bg-bg px-4 py-10 text-ink",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AsexiAMark, { className: "size-9" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "label-kicker mt-4",
					children: "AsexiA Suite 360"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-3xl font-medium tracking-tight",
					children: "Entre con su clave"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-ink-muted",
					children: "Dirección, recepción y médico usan la misma clínica. Cada uno entra con la suya."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: (event) => void submit(event),
					className: "mt-5 flex flex-col gap-3",
					children: [
						mode === "up" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-ink-muted",
								children: "Nombre"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								className: "mt-1",
								value: name,
								onChange: (event) => setName(event.target.value),
								required: true
							})]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-ink-muted",
								children: "Correo"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								className: "mt-1",
								type: "email",
								autoComplete: "email",
								value: email,
								onChange: (event) => setEmail(event.target.value),
								required: true
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-ink-muted",
								children: "Clave"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								className: "mt-1",
								type: "password",
								autoComplete: mode === "up" ? "new-password" : "current-password",
								value: password,
								onChange: (event) => setPassword(event.target.value),
								required: true,
								minLength: 8
							})]
						}),
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-[#8A3B24]",
							children: error
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: busy,
							children: busy ? "Entrando…" : mode === "up" ? "Crear cuenta" : "Entrar"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "text-sm text-ink-muted underline-offset-4 hover:underline",
							onClick: () => setMode(mode === "up" ? "in" : "up"),
							children: mode === "up" ? "Ya tengo clave" : "Crear una cuenta"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5 flex flex-col gap-2",
					children: GROK_PROVIDERS.map((provider) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "outline",
						onClick: () => void signIn(provider.providerId, { callbackURL: "/" }),
						children: ["Continuar con ", provider.label]
					}, provider.providerId))
				})] })
			]
		})
	});
}
//#endregion
export { Login as component };
