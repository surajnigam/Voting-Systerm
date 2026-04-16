import { apiRequest, showResult } from "../common.js";

export async function mount(container) {
    container.innerHTML = `
        <section class="slide-up rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h1 class="text-2xl font-semibold"><i class="fa-solid fa-check-to-slot me-2"></i>Cast Your Vote</h1>
           
          
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
                            <th>Image</th>
                        </tr>
                    </thead>
                    <tbody id="votingCandidatesBody">
                        <tr><td colspan="7" class="text-muted">Click "Load Candidates" to fetch data.</td></tr>
                    </tbody>
                </table>
            </div>
            <button id="voteBtn" class="mt-3 btn btn-primary"><i class="fa-solid fa-circle-check me-1"></i>Cast Vote</button>
        </section>
    `;

    const imageOverlay = document.createElement("div");
    imageOverlay.className = "candidate-image-overlay hidden";
    imageOverlay.innerHTML = `
        <div class="candidate-image-overlay-backdrop"></div>
        <div class="candidate-image-overlay-content">
            <button type="button" class="candidate-image-close" aria-label="Close image preview">
                <i class="fa-solid fa-xmark"></i>
            </button>
            <img id="candidateImagePreview" alt="Candidate preview" class="candidate-image-preview" />
        </div>
    `;
    document.body.appendChild(imageOverlay);

    const imagePreviewEl = imageOverlay.querySelector("#candidateImagePreview");

    function closeOverlay() {
        imageOverlay.classList.add("hidden");
        document.body.classList.remove("overflow-hidden");
        imagePreviewEl.removeAttribute("src");
    }

    imageOverlay.addEventListener("click", (event) => {
        if (
            event.target.classList.contains("candidate-image-overlay-backdrop") ||
            event.target.closest(".candidate-image-close")
        ) {
            closeOverlay();
        }
    });

    document.addEventListener("keydown", handleEscape);

    function handleEscape(event) {
        if (event.key === "Escape" && !imageOverlay.classList.contains("hidden")) {
            closeOverlay();
        }
    }

     async function loadCandidates() {
        try {
            const data = await apiRequest("GET", "/candidates/getAllCandidates");
            const body = container.querySelector("#votingCandidatesBody");
            body.innerHTML = "";
            if (!Array.isArray(data) || data.length === 0) {
                body.innerHTML = `<tr><td colspan="7" class="text-muted">No candidates found.</td></tr>`;
            } else {
                for (const candidate of data) {
                    const tr = document.createElement("tr");
                    const imageSrc = candidate.image ? `data:image/*;base64,${candidate.image}` : "";
                    tr.innerHTML = `
                        <td><input class="form-check-input" type="radio" name="selectedCandidate" value="${candidate._id}"></td>
                        <td class="small">${candidate._id ?? "-"}</td>
                        <td>${candidate.name ?? "-"}</td>
                        <td>${candidate.age ?? "-"}</td>
                        <td>${candidate.party ?? "-"}</td>
                        <td>${candidate.votesCount ?? candidate.votes?.length ?? 0}</td>
                        <td>
                            ${candidate.image
                                ? `<button type="button" class="btn btn-outline-secondary btn-sm view-image-btn" data-image="${imageSrc}">
                                    <i class="fa-regular fa-image me-1"></i>View
                                   </button>`
                                : "-"}
                        </td>
                    `;
                    body.appendChild(tr);
                }
            }
            showResult("votingResult", "Candidates Loaded", { count: Array.isArray(data) ? data.length : 0 });
        } catch (error) {
            showResult("votingResult", "Load Error", error.message);
        }
    };
    loadCandidates();

    container.addEventListener("click", (event) => {
        const button = event.target.closest(".view-image-btn");
        if (!button || !imagePreviewEl) return;
        imagePreviewEl.src = button.dataset.image || "";
        imageOverlay.classList.remove("hidden");
        document.body.classList.add("overflow-hidden");
    });

    container.querySelector("#voteBtn")?.addEventListener("click", async () => {
        try {
            const selected = container.querySelector('input[name="selectedCandidate"]:checked');
            if (!selected) {
                throw new Error("Please select a candidate from the table.");
            }
            const id = selected.value;
            const data = await apiRequest("POST", `/candidates/vote/${id}`, {});
            alert( data);
        } catch (error) {
            alert( error.message);
        }
    });

    return () => {
        document.removeEventListener("keydown", handleEscape);
        imageOverlay.remove();
    };
}
