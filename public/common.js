export const TOKEN_KEY = "voting_jwt";
const THEME_KEY = "voting_theme";

export function getToken() {
    return sessionStorage.getItem(TOKEN_KEY) || "";
}

export function setToken(token) {
    if (!token) return;
    sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
    sessionStorage.removeItem(TOKEN_KEY);
}

function decodeBase64Url(input) {
    const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "===".slice((normalized.length + 3) % 4);
    return atob(padded);
}

export function getUserFromToken() {
    const token = getToken();
    if (!token) return null;
    try {
        const parts = token.split(".");
        if (parts.length < 2) return null;
        const payload = JSON.parse(decodeBase64Url(parts[1]));
        return payload?.user ?? null;
    } catch {
        return null;
    }
}

export function getRole() {
    return getUserFromToken()?.role ?? null;
}

function redactSensitive(value) {
    if (Array.isArray(value)) {
        return value.map(redactSensitive);
    }
    if (value && typeof value === "object") {
        const out = {};
        for (const [k, v] of Object.entries(value)) {
            out[k] = /token|secret|password/i.test(k) ? "[redacted]" : redactSensitive(v);
        }
        return out;
    }
    return value;
}

export function showResult(elementId, title, data) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const safeData = typeof data === "string" ? data : redactSensitive(data);
    const body = typeof safeData === "string" ? safeData : JSON.stringify(safeData, null, 2);
    el.textContent = `${title}\n\n${body}`;
}

function setLoading(isLoading) {
    const loader = document.getElementById("globalLoader");
    if (!loader) return;
    loader.classList.toggle("hidden", !isLoading);
}

function parseError(data, status) {
    if (status >= 500) return "Something went wrong on server. Please try again.";
    if (typeof data === "string") return data.slice(0, 300);
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    return "Request failed. Please verify your input and try again.";
}

export async function apiRequest(method, url, body, needsToken = true) {
    const headers = { "Content-Type": "application/json" };
    const token = getToken();
    if (needsToken && token) {
        headers.Authorization = `Bearer ${token}`;
    }

    setLoading(true);
    let response;
    try {
        response = await fetch(url, {
            method,
            headers,
            credentials: "same-origin",
            body: body === undefined ? undefined : JSON.stringify(body),
        });
    } catch (_err) {
        setLoading(false);
        throw new Error("Network error. Please check server connection.");
    }

    let data;
    try {
        data = await response.json();
    } catch {
        data = await response.text();
    }

    setLoading(false);

    if (!response.ok) {
        if (response.status === 401) {
            clearToken();
        }
        throw new Error(parseError(data, response.status));
    }

    return data;
}

export function initThemeToggle() {
    const root = document.documentElement;
    const btn = document.getElementById("themeToggle");
    const saved = localStorage.getItem(THEME_KEY);
    const darkPreferred = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved ? saved === "dark" : darkPreferred;
    root.classList.toggle("dark", isDark);
    if (btn) btn.textContent = isDark ? "Light Mode" : "Dark Mode";
    if (btn) {
        btn.addEventListener("click", () => {
            const dark = !root.classList.contains("dark");
            root.classList.toggle("dark", dark);
            localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
            btn.textContent = dark ? "Light Mode" : "Dark Mode";
        });
    }
}

export function ensureAuth(redirectTo = "./login.html") {
    if (!getToken()) {
        window.location.href = redirectTo;
        return false;
    }
    return true;
}

export function ensureRole(requiredRole, redirectTo = "./index.html") {
    const role = getRole();
    if (role !== requiredRole) {
        window.location.href = redirectTo;
        return false;
    }
    return true;
}

export function applyRoleVisibility() {
    const role = getRole();
    const adminOnly = document.querySelectorAll(".admin-only");
    const nonAdminOnly = document.querySelectorAll(".non-admin-only");
    adminOnly.forEach((el) => el.classList.toggle("hidden", role !== "admin"));
    nonAdminOnly.forEach((el) => el.classList.toggle("hidden", role === "admin"));
}

export function initApp() {
    initThemeToggle();
    applyRoleVisibility();
}
