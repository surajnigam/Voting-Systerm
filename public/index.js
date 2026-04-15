import { applyRoleVisibility, clearToken, ensureAuth, ensureRole, getRole, initApp } from "./common.js";

initApp();
if (!ensureAuth()) throw new Error("Authentication required");

const pageMount = document.getElementById("pageMount");
const headerActionSelect = document.getElementById("headerActionSelect");
const menuToggle = document.getElementById("menuToggle");
const topMenu = document.getElementById("topMenu");
let currentCleanup = null;
let isTransitioning = false;

const sectionLoaders = {
    home: () => import("./sections/homeSection.js"),
    admin: () => import("./sections/adminSection.js"),
    voting: () => import("./sections/votingSection.js"),
    results: () => import("./sections/resultsSection.js"),
};

function setActiveNav(page) {
    document.querySelectorAll(".nav-btn[data-page]").forEach((btn) => {
        const active = btn.dataset.page === page;
        btn.classList.toggle("bg-indigo-600", active);
        btn.classList.toggle("text-white", active);
    });
}

async function loadSection(page) {
    if (isTransitioning) return;
    if (page === "admin" && !ensureRole("admin")) return;
    if (!sectionLoaders[page]) return;
    isTransitioning = true;
    try {
        if (typeof currentCleanup === "function") currentCleanup();
        if (pageMount.firstElementChild) {
            pageMount.firstElementChild.classList.add("section-leave");
            await new Promise((resolve) => setTimeout(resolve, 180));
        }
        pageMount.innerHTML = "";

        const mod = await sectionLoaders[page]();
        const cleanup = await mod.mount(pageMount);
        currentCleanup = typeof cleanup === "function" ? cleanup : null;
        if (pageMount.firstElementChild) {
            pageMount.firstElementChild.classList.add("section-enter");
        }
        applyRoleVisibility();
        setActiveNav(page);
    } finally {
        isTransitioning = false;
    }
}

document.addEventListener("click", (event) => {
    const button = event.target.closest(".nav-btn[data-page]");
    if (!button) return;
    event.preventDefault();
    if (topMenu?.classList.contains("open")) {
        topMenu.classList.remove("open");
    }
    loadSection(button.dataset.page);
});

menuToggle?.addEventListener("click", () => {
    topMenu?.classList.toggle("open");
});

const role = getRole();
if (headerActionSelect) {
    headerActionSelect.options[0].textContent = `Role: ${role ?? "unknown"}`;
    const onHeaderAction = () => {
        const action = headerActionSelect.value;
        if (action === "theme") {
            const root = document.documentElement;
            const dark = !root.classList.contains("dark");
            root.classList.toggle("dark", dark);
            localStorage.setItem("voting_theme", dark ? "dark" : "light");
        } else if (action === "logout") {
            clearToken();
            window.location.href = "./login.html";
        }
        headerActionSelect.value = "role";
    };
    headerActionSelect.addEventListener("change", onHeaderAction);
    headerActionSelect.addEventListener("input", onHeaderAction);
}
loadSection("home");
