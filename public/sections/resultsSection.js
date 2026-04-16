import { apiRequest, showResult } from "../common.js";

export async function mount(container) {
    container.innerHTML = `
        <section class="slide-up rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h1 class="text-2xl font-semibold"><i class="fa-solid fa-chart-column me-2"></i>Election Results</h1>
           
          
            <div class="mt-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table class="min-w-full text-sm">
                    <thead class="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        <tr>
                            <th class="px-3 py-2 text-left">Name</th>
                            <th class="px-3 py-2 text-left">Party</th>
                            <th class="px-3 py-2 text-left">Total Votes</th>
                        </tr>
                    </thead>
                    <tbody id="resultsBody" class="divide-y divide-slate-200 dark:divide-slate-800"></tbody>
                </table>
            </div>
          
            </section>
            `;

    async function loadResults() {
        const data = await apiRequest("GET", "/candidates/getVotes", undefined, false);
        const body = container.querySelector("#resultsBody");
        body.innerHTML = "";
        if (!Array.isArray(data) || data.length === 0) {
            alert("resultsResult", "Results", "No results found");
            return;
        }
        for (const row of data) {
            const tr = document.createElement("tr");
            tr.innerHTML = `<td class="px-3 py-2">${row.name ?? "-"}</td><td class="px-3 py-2">${row.party ?? "-"}</td><td class="px-3 py-2 font-semibold">${row.votesCount ?? 0}</td>`;
            body.appendChild(tr);
        }
        // alert("resultsResult", "Results Loaded", { count: data.length });
    }

    await loadResults();
    // container.querySelector("#loadResultsBtn")?.addEventListener("click", async () => {
    //     try {
    //         await loadResults();
    //     } catch (error) {
    //         alert("resultsResult", "Results Error", error.message);
    //     }
    // });
}
