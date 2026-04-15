import { apiRequest, ensureRole, getToken, showResult } from "../common.js";

export async function mount(container) {
    if (!ensureRole("admin")) return;

    container.innerHTML = `
        <h1 class="text-2xl font-semibold"><i class="fa-solid fa-user-shield me-2"></i>Admin Candidate Management</h1>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">Create, update and delete candidates. Admin role required.</p>
        <section class="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 class="font-semibold"><i class="fa-solid fa-user-plus me-1"></i>Add Candidate</h3>
            <div class="mt-3 grid gap-3 md:grid-cols-3">
                <label class="text-sm">Name<input id="addName" class="mt-1 w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-950" /></label>
                <label class="text-sm">Age<input id="addAge" type="number" class="mt-1 w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-950" /></label>
                <label class="text-sm">Party<input id="addParty" class="mt-1 w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-950" /></label>
                <label class="text-sm">Image (optional)<input type="file" id="upload_doc" accept="image/*" class="mt-1 w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-950" /></label>
            </div>
            <div class="mt-3 flex flex-wrap gap-2">
                <button id="addBtn" class="btn btn-primary btn-sm"><i class="fa-solid fa-plus me-1"></i>Add Candidate</button>
                <button id="clearAddBtn" class="btn btn-secondary btn-sm"><i class="fa-solid fa-eraser me-1"></i>Clear Form</button>
            </div>
        </section>
        <section class="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 class="font-semibold"><i class="fa-solid fa-pen-to-square me-1"></i>Update Candidate</h3>
            <div class="mt-3 grid gap-3 md:grid-cols-2">
                <label class="text-sm">Candidate ID<input id="updateId" class="mt-1 w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-950" /></label>
                <label class="text-sm">Name<input id="updateName" class="mt-1 w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-950" /></label>
                <label class="text-sm">Age<input id="updateAge" type="number" class="mt-1 w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-950" /></label>
                <label class="text-sm">Party<input id="updateParty" class="mt-1 w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-950" /></label>
            </div>
            <div class="mt-3 flex flex-wrap gap-2">
                <button id="updateBtn" class="btn btn-warning btn-sm text-white"><i class="fa-solid fa-rotate me-1"></i>Update Candidate</button>
                <button id="clearUpdateBtn" class="btn btn-secondary btn-sm"><i class="fa-solid fa-eraser me-1"></i>Clear Form</button>
            </div>
        </section>
        <section class="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 class="font-semibold"><i class="fa-solid fa-trash me-1"></i>Delete Candidate</h3>
            <label class="mt-2 block text-sm">Candidate ID<input id="deleteId" class="mt-1 w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-950" /></label>
            <div class="mt-3 flex flex-wrap gap-2">
                <button id="deleteBtn" class="btn btn-danger btn-sm"><i class="fa-solid fa-trash-can me-1"></i>Delete Candidate</button>
                <button id="clearDeleteBtn" class="btn btn-secondary btn-sm"><i class="fa-solid fa-eraser me-1"></i>Clear Form</button>
            </div>
        </section>
        <section class="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 class="font-semibold"><i class="fa-solid fa-list me-1"></i>All Candidates</h3>
            <button id="listBtn" class="mt-2 btn btn-secondary btn-sm"><i class="fa-solid fa-arrows-rotate me-1"></i>Refresh List</button>
            <div class="mt-3 table-responsive rounded border">
                <table class="table table-sm table-striped table-hover mb-0">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Age</th>
                            <th>Party</th>
                            <th>Votes</th>
                        </tr>
                    </thead>
                    <tbody id="adminCandidatesBody">
                        <tr><td colspan="5" class="text-muted">Click "Refresh List" to fetch data.</td></tr>
                    </tbody>
                </table>
            </div>
            <pre id="adminResult" class="result mt-3 rounded-xl bg-slate-900 p-4 text-emerald-200">Ready.</pre>
        </section>
    `;

    const addNameEl = container.querySelector("#addName");
    const addAgeEl = container.querySelector("#addAge");
    const addPartyEl = container.querySelector("#addParty");
    const uploadDocEl = container.querySelector("#upload_doc");
    const updateIdEl = container.querySelector("#updateId");
    const updateNameEl = container.querySelector("#updateName");
    const updateAgeEl = container.querySelector("#updateAge");
    const updatePartyEl = container.querySelector("#updateParty");
    const deleteIdEl = container.querySelector("#deleteId");

    async function refreshCandidates() {
        const data = await apiRequest("GET", "/candidates/getAllCandidates");
        const body = container.querySelector("#adminCandidatesBody");
        body.innerHTML = "";
        if (!Array.isArray(data) || data.length === 0) {
            body.innerHTML = `<tr><td colspan="5" class="text-muted">No candidates found.</td></tr>`;
            showResult("adminResult", "Candidates Loaded", { count: 0 });
            return;
        }
        for (const candidate of data) {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="small">${candidate._id ?? "-"}</td>
                <td>${candidate.name ?? "-"}</td>
                <td>${candidate.age ?? "-"}</td>
                <td>${candidate.party ?? "-"}</td>
                <td>${candidate.votesCount ?? candidate.votes?.length ?? 0}</td>
            `;
            body.appendChild(tr);
        }
        showResult("adminResult", "Candidates Loaded", { count: data.length });
    }

    container.querySelector("#addBtn")?.addEventListener("click", async () => {
        try {
            const name = addNameEl.value.trim();
            const age = Number(addAgeEl.value);
            const party = addPartyEl.value.trim();
            const file = uploadDocEl.files?.[0] ?? null;
            if (!name || !party || !age) throw new Error("All add fields are required.");

            const formData = new FormData();
            formData.append("name", name);
            formData.append("age", String(age));
            formData.append("party", party);
            if (file) {
                formData.append("image", file);
            }

            const token = getToken();
            const response = await fetch("/candidates", {
                method: "POST",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: formData,
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to add candidate");
            }
            showResult("adminResult", "Add Candidate Success", data);
            await refreshCandidates();
        } catch (error) {
            showResult("adminResult", "Add Candidate Error", error.message);
        }
    });

    container.querySelector("#updateBtn")?.addEventListener("click", async () => {
        try {
            const id = updateIdEl.value.trim();
            const body = {
                name: updateNameEl.value.trim(),
                age: Number(updateAgeEl.value),
                party: updatePartyEl.value.trim(),
            };
            const data = await apiRequest("PUT", `/candidates/updateCandidate/${id}`, body);
            showResult("adminResult", "Update Candidate Success", data);
            await refreshCandidates();
        } catch (error) {
            showResult("adminResult", "Update Candidate Error", error.message);
        }
    });

    container.querySelector("#deleteBtn")?.addEventListener("click", async () => {
        try {
            const id = deleteIdEl.value.trim();
            const data = await apiRequest("DELETE", `/candidates/deleteCandidate/${id}`);
            showResult("adminResult", "Delete Candidate Success", data);
            await refreshCandidates();
        } catch (error) {
            showResult("adminResult", "Delete Candidate Error", error.message);
        }
    });

    container.querySelector("#listBtn")?.addEventListener("click", async () => {
        try {
            await refreshCandidates();
        } catch (error) {
            showResult("adminResult", "List Error", error.message);
        }
    });

    container.querySelector("#clearAddBtn")?.addEventListener("click", () => {
        addNameEl.value = "";
        addAgeEl.value = "";
        addPartyEl.value = "";
        uploadDocEl.value = "";
    });

    container.querySelector("#clearUpdateBtn")?.addEventListener("click", () => {
        updateIdEl.value = "";
        updateNameEl.value = "";
        updateAgeEl.value = "";
        updatePartyEl.value = "";
    });

    container.querySelector("#clearDeleteBtn")?.addEventListener("click", () => {
        deleteIdEl.value = "";
    });
}
