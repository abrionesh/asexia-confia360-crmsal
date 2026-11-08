import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { f as cn, m as initials } from "./router-OxFF0fHE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/avatar-B4Lj1Uwk.js
var import_jsx_runtime = require_jsx_runtime();
var TONES = [
	"bg-accent-soft text-accent",
	"bg-channel-voice/12 text-channel-voice",
	"bg-success/12 text-success",
	"bg-warning/12 text-warning"
];
function toneFor(name) {
	return TONES[[...name].reduce((acc, char) => acc + char.charCodeAt(0), 0) % TONES.length];
}
function Avatar({ name, size = "md" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		"aria-hidden": "true",
		className: cn("inline-flex shrink-0 items-center justify-center rounded-full font-medium", size === "sm" && "size-8 text-2xs", size === "md" && "size-10 text-xs", size === "lg" && "size-14 text-base", toneFor(name)),
		children: initials(name)
	});
}
//#endregion
export { Avatar as t };
