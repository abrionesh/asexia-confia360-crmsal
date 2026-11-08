//#region node_modules/.nitro/vite/services/ssr/assets/persist-7rEDgaNm.js
var KEY = "asexia.snapshot.v9";
function parseSnapshot(value) {
	if (!value) return null;
	try {
		const parsed = typeof value === "string" ? JSON.parse(value) : value;
		if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.patients)) return null;
		return parsed;
	} catch {
		return null;
	}
}
function isOffline() {
	return typeof navigator !== "undefined" && navigator.onLine === false;
}
function readSnapshot() {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.localStorage.getItem(KEY);
		if (!raw) return null;
		return parseSnapshot(raw);
	} catch {
		return null;
	}
}
function writeSnapshot(snapshot) {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(KEY, JSON.stringify(snapshot));
	} catch {}
}
//#endregion
export { writeSnapshot as i, parseSnapshot as n, readSnapshot as r, isOffline as t };
