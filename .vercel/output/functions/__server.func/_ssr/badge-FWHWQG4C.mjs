import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { f as cn } from "./router-OxFF0fHE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/badge-FWHWQG4C.js
var import_jsx_runtime = require_jsx_runtime();
var badgeVariants = cva("inline-flex items-center rounded-full px-2 py-0.5 text-2xs font-medium tracking-wide", {
	variants: { tone: {
		muted: "bg-bg text-ink-muted",
		accent: "bg-accent-soft text-accent",
		ink: "bg-ink text-accent-fg",
		success: "bg-success/12 text-success",
		warning: "bg-warning/12 text-warning",
		wa: "bg-channel-wa/12 text-channel-wa",
		voice: "bg-channel-voice/12 text-channel-voice"
	} },
	defaultVariants: { tone: "muted" }
});
function Badge({ className, tone, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({
			tone,
			className
		})),
		...props
	});
}
//#endregion
export { Badge as t };
