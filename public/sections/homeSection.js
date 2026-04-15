export async function mount(container) {
    container.innerHTML = `
        <section class="slide-up relative overflow-hidden rounded-3xl border border-indigo-300/40 bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 p-8 text-white shadow-2xl">
            <div class="absolute -top-8 right-8 h-28 w-28 rounded-full bg-cyan-400/20 blur-2xl"></div>
            <div class="absolute bottom-2 right-24 h-24 w-24 rounded-full bg-fuchsia-500/20 blur-2xl"></div>
            <div class="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs">
                <span>🛡️</span><span>Role-based access control enabled</span>
            </div>
            
            <h1 class="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">Voting Management</h1>
            
            <div class="mt-5 flex flex-wrap gap-3">
                <button class="nav-btn btn btn-primary btn-sm" data-page="voting"><i class="fa-solid fa-check-to-slot me-1"></i>Start Voting</button>
                <button class="nav-btn btn btn-outline-light btn-sm" data-page="results"><i class="fa-solid fa-chart-column me-1"></i>View Results</button>
            </div>
        </section>
        <section class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <button class="nav-btn card-animate admin-only rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm dark:border-slate-800 dark:bg-slate-900" data-page="admin">
                <h2 class="font-semibold"><i class="fa-solid fa-user-shield me-1"></i>Admin Panel</h2>
                <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">Add, update, and delete candidates securely.</p>
            </button>
            <button class="nav-btn card-animate rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm dark:border-slate-800 dark:bg-slate-900" data-page="voting">
                <h2 class="font-semibold"><i class="fa-solid fa-check-to-slot me-1"></i>Voting</h2>
                <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">Cast one vote per voter with validation.</p>
            </button>
            <button class="nav-btn card-animate rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm dark:border-slate-800 dark:bg-slate-900" data-page="results">
                <h2 class="font-semibold"><i class="fa-solid fa-chart-line me-1"></i>Results</h2>
                <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">View sorted vote count and live standings.</p>
            </button>
        </section>
    `;
}
