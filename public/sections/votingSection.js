import { apiRequest, showResult } from "../common.js";

export async function mount(container) {
    container.innerHTML = `
        <section class="slide-up rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h1 class="text-2xl font-semibold"><i class="fa-solid fa-check-to-slot me-2"></i>Cast Your Vote</h1>
            <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">Voter role required. One voter can vote once.</p>
            <div class="mt-4 flex flex-wrap gap-2">
                <button id="voteListBtn" class="btn btn-secondary btn-sm"><i class="fa-solid fa-list me-1"></i>Load Candidates</button>
            </div>
            <div class="mt-3 table-responsive rounded border">
                <table class="table table-sm table-striped table-hover mb-0">
                    <thead>
                        <tr>
                            <th>Select</th>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Age</th>
                            <th>Party</th>
                            <th>Total Votes</th>
                        </tr>
                    </thead>
                    <tbody id="votingCandidatesBody">
                        <tr><td colspan="6" class="text-muted">Click "Load Candidates" to fetch data.</td></tr>
                    </tbody>
                </table>
            </div>
            <button id="voteBtn" class="mt-3 btn btn-primary"><i class="fa-solid fa-circle-check me-1"></i>Cast Vote</button>
            <pre id="votingResult" class="result mt-3 rounded-xl bg-slate-900 p-3 text-emerald-200">Ready.</pre>
        
        </section>
    `;

    container.querySelector("#voteListBtn")?.addEventListener("click", async () => {
        try {
            const data = await apiRequest("GET", "/candidates/getAllCandidates");
            const body = container.querySelector("#votingCandidatesBody");
            body.innerHTML = "";
            if (!Array.isArray(data) || data.length === 0) {
                body.innerHTML = `<tr><td colspan="6" class="text-muted">No candidates found.</td></tr>`;
            } else {
                for (const candidate of data) {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td><input class="form-check-input" type="radio" name="selectedCandidate" value="${candidate._id}"></td>
                        <td class="small">${candidate._id ?? "-"}</td>
                        <td>${candidate.name ?? "-"}</td>
                        <td>${candidate.age ?? "-"}</td>
                        <td>${candidate.party ?? "-"}</td>
                        <td>${candidate.votesCount ?? candidate.votes?.length ?? 0}</td>
                    `;
                    body.appendChild(tr);
                }
            }
            showResult("votingResult", "Candidates Loaded", { count: Array.isArray(data) ? data.length : 0 });
        } catch (error) {
            showResult("votingResult", "Load Error", error.message);
        }
    });

    container.querySelector("#voteBtn")?.addEventListener("click", async () => {
        try {
            const selected = container.querySelector('input[name="selectedCandidate"]:checked');
            if (!selected) {
                throw new Error("Please select a candidate from the table.");
            }
            const id = selected.value;
            const data = await apiRequest("POST", `/candidates/vote/${id}`, {});
            showResult("votingResult", "Vote Success", data);
        } catch (error) {
            showResult("votingResult", "Vote Error", error.message);
        }
    });
}
