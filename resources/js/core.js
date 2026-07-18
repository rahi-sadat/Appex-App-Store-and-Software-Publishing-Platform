document.addEventListener("DOMContentLoaded", () => {
// Appex Frontend Engine - Microsoft & Apple Store Hybrid Mockup
    // -----------------------------------------
    // 1. Initial State & Seed Data
    // -----------------------------------------
    
    // Application theme gradients map for logos
    const iconGradients = {
        blue: "linear-gradient(135deg, #0071e3, #5ac8fa)",
        green: "linear-gradient(135deg, #30d158, #34c759)",
        orange: "linear-gradient(135deg, #ff9f0a, #ff3b30)",
        purple: "linear-gradient(135deg, #af52de, #ff2d55)",
        dark: "linear-gradient(135deg, #1c1c1e, #8e8e93)"
    };

    const formatBytes = bytes => {
        const value = Number(bytes || 0);
        if (!value) return "—";
        const units = ["B", "KB", "MB", "GB"];
        const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
        return `${(value / (1024 ** index)).toFixed(index > 1 ? 1 : 0)} ${units[index]}`;
    };

    const parseFileSize = value => {
        const match = String(value || "").trim().match(/^([0-9]+(?:\.[0-9]+)?)\s*(B|KB|MB|GB)?$/i);
        if (!match) return null;
        const powers = { B: 0, KB: 1, MB: 2, GB: 3 };
        return Math.round(Number(match[1]) * (1024 ** powers[(match[2] || "MB").toUpperCase()]));
    };

    const appIconUrl = app => app.iconUrl || `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="100%" height="100%" rx="96" fill="#168eea"/><text x="50%" y="58%" text-anchor="middle" font-family="Arial" font-size="220" font-weight="700" fill="white">${String(app.name || "A").charAt(0)}</text></svg>`)}`;

    // Keep Laravel route names in one place.
    const pageRoutes = {
        today: "/",
        discover: "/discover",
        about: "/about",
        "developer-login": "/developer-login",
        developer: "/developer",
        "admin-login": "/admin-login",
        admin: "/admin",
        api: "/api-docs"
    };

    // Blade pages pass the authenticated account here.
    const currentPage = document.body.dataset.page || "today";
    const serverAuthMode = document.body.dataset.authMode === "server";
    const serverAuthAccount = document.body.dataset.authAccount || "";
    const serverAuthName = document.body.dataset.authName || "";
    const serverAuthRole = document.body.dataset.authRole || "";
    const serverRole = serverAuthAccount === "developer"
        ? "developer"
        : serverAuthAccount === "admin"
            ? "admin"
            : serverAuthAccount === "user"
                ? "user"
                : null;
    const initialRole = serverRole
        || "visitor";

    const mapMarketplaceApp = app => ({
        id: app.slug,
        databaseId: String(app.id),
        name: app.name,
        developer: app.developer?.name || "Unknown developer",
        category: app.category?.name || "Other",
        categorySlug: app.category?.slug || "",
        tagline: app.tagline || "",
        description: app.description || "",
        version: app.latest_release?.version || "—",
        size: formatBytes(app.latest_release?.assets?.[0]?.size_bytes),
        downloadUrl: app.latest_release?.assets?.[0]?.external_url || "",
        license: app.license || "—",
        primaryLanguage: app.primary_language || "",
        platform: app.platform || "web",
        iconTheme: "blue",
        iconUrl: app.icon_path ? `/storage/${app.icon_path}` : null,
        screenshots: (app.screenshots || []).map(item => ({
            id: String(item.id), url: `/storage/${item.image_path}`, caption: item.caption || ""
        })),
        tags: (app.tags || []).map(tag => tag.name),
        downloads: app.downloads_count || 0,
        rating: Number(app.average_rating || 0),
        github: app.repository_url || "",
        demo: app.demo_url || "",
        installCommand: app.latest_release?.install_command || "",
        releases: (app.releases || (app.latest_release ? [app.latest_release] : [])).map(release => ({
            version: release.version || "—",
            title: release.title || "",
            notes: release.release_notes || "",
            status: release.status || "draft",
            date: release.published_at || release.created_at || null
        })),
        status: app.status,
        submissionDate: app.published_at || app.created_at,
        reviews: (app.reviews || []).map(r => ({
            id: String(r.id),
            author: r.user?.name || r.user?.email || "User",
            stars: parseInt(r.rating) || 5,
            title: r.title || "",
            text: r.body || "",
            date: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : ""
        })),
        bugs: (app.bug_reports || []).map(b => ({
            id: `BUG-${b.id}`,
            dbId: b.id,
            title: b.title || "",
            desc: b.description || "",
            severity: b.severity || "medium",
            version: b.app_release?.version || "1.0.0",
            status: b.status || "open"
        }))
    });

    let state = {
        theme: localStorage.getItem("appex-theme") || "light",
        currentRole: initialRole,
        developerAuthenticated: serverRole === "developer",
        adminAuthenticated: serverRole === "admin",
        activeTab: currentPage,
        activeAppId: null,
        heroIndex: 0,
        
        apps: (window.__marketplaceApps || []).map(mapMarketplaceApp), /* Legacy mock data retained only as a comment during migration.
            {
                id: "devflow",
                name: "DevFlow",
                developer: "Sarah Jenkins",
                category: "Web App",
                tagline: "An agile kanban project tracker for developer teams",
                description: "DevFlow is a premium collaborative workspace that integrates code repositories with agile project boards. Features include real-time web socket updates, automated burndown charts, markdown description cards, and multi-tenant authorization workflows.",
                version: "2.4.1",
                size: "18.4 MB",
                license: "MIT",
                iconTheme: "blue",
                tags: ["agile", "kanban", "productivity", "collaboration"],
                downloads: 4280,
                rating: 4.8,
                github: "https://github.com/developer/devflow",
                demo: "https://devflow.example.com",
                installCommand: "npm install -g @devflow/cli",
                status: "approved",
                submissionDate: "2026-06-12",
                reviews: [
                    { author: "Marc_K", stars: 5, title: "Supercharges our sprints", text: "We swapped our Trello board for DevFlow and the Git repository integration has saved us countless hours of manual status updating.", date: "2026-06-14" },
                    { author: "LaraCodes", stars: 5, title: "Frictionless and fast", text: "Extremely fast interface. The keyboard shortcuts are a nice developer-friendly touch.", date: "2026-06-15" },
                    { author: "Marketplace User", stars: 4, title: "Great, but needs Slack hooks", text: "Excellent tool overall. I hope they release a Slack or Discord webhook integration in the next version.", date: "2026-06-18" }
                ],
                bugs: [
                    { id: "DF-302", title: "Sidebar scroll lock on iOS viewports", desc: "When opening the activity sidebar on mobile Safari, the background document scroll is not locked.", severity: "low", version: "2.4.0", status: "resolved" },
                    { id: "DF-311", title: "API token regeneration returns 500 error", desc: "Regenerating developer tokens in the settings drawer throws a 500 Internal Server error if the token has expired.", severity: "high", version: "2.4.1", status: "open" }
                ]
            },
            {
                id: "querycraft",
                name: "QueryCraft",
                developer: "Alex Mercer",
                category: "Script & Tool",
                tagline: "Visually build and optimize complex SQL queries in seconds",
                description: "QueryCraft is an interactive database modeling tool that lets you build queries by dragging and dropping tables. It automatically analyzes execution plans, suggests index optimization keys, and compiles pure ANSI SQL code for MySQL, PostgreSQL, and SQLite.",
                version: "1.2.0",
                size: "6.1 MB",
                license: "Apache-2.0",
                iconTheme: "orange",
                tags: ["database", "sql", "mysql", "developer-tool"],
                downloads: 1480,
                rating: 4.6,
                github: "https://github.com/developer/querycraft",
                demo: "https://querycraft.example.com",
                installCommand: "composer global require querycraft/builder",
                status: "approved",
                submissionDate: "2026-06-15",
                reviews: [
                    { author: "DBA_Greg", stars: 5, title: "Saved my indexes!", text: "QueryCraft pointed out that three of our joins were missing critical indexes. Rebuilt our query and reduced execution time by 85%.", date: "2026-06-16" },
                    { author: "CodeNinja", stars: 4, title: "Clean SQL output", text: "The generated SQL code is formatted beautifully. Much cleaner than other visual query builders.", date: "2026-06-18" }
                ],
                bugs: [
                    { id: "QC-88", title: "PostgreSQL JSONB queries fail validation", desc: "Using JSONB field arrow selectors (->>) returns a syntax validation failure in the query editor.", severity: "medium", version: "1.2.0", status: "open" }
                ]
            },
            {
                id: "laravel-ui-kit",
                name: "Laravel UI Kit",
                developer: "Taylor Otwell",
                category: "Laravel Package",
                tagline: "Polished, accessible Blade components styled with Tailwind CSS",
                description: "A comprehensive library of 45+ UI components built specifically for Laravel Blade. Fully accessible (WAI-ARIA compliant), supports dark mode, includes keyboard navigation bindings, and utilizes native AlpineJS transitions for tabs, modals, and dropdown overlays.",
                version: "3.1.0",
                size: "2.2 MB",
                license: "MIT",
                iconTheme: "green",
                tags: ["laravel", "blade", "tailwind", "components"],
                downloads: 9280,
                rating: 4.9,
                github: "https://github.com/laravel/ui-kit",
                demo: "https://uikit.laravel.com",
                installCommand: "composer require laravel/ui-kit",
                status: "approved",
                submissionDate: "2026-06-10",
                reviews: [
                    { author: "BladeFanatic", stars: 5, title: "A masterpiece of utility", text: "The modal components are extremely simple to wire up. Love the custom theme extension bindings.", date: "2026-06-11" },
                    { author: "WebDev_Pro", stars: 5, title: "Highly accessible", text: "Tested with screen readers, and everything is mapped perfectly. This is rare for PHP component kits.", date: "2026-06-13" },
                    { author: "Sonia_R", stars: 5, title: "Tailwind bliss", text: "Integrates perfectly with my Tailwind config. Overwriting classes is a breeze.", date: "2026-06-17" }
                ],
                bugs: []
            },
            {
                id: "pyrunner",
                name: "PyRunner",
                developer: "Guido Van",
                category: "Desktop",
                tagline: "A lightweight local compiler and sandbox runner for Python files",
                description: "PyRunner provides an isolated virtual environment sandbox to execute Python files instantly without modifying your global environment. Features include multi-threaded runner support, visual dependency inspectors, and terminal console logs.",
                version: "0.8.2",
                size: "41.5 MB",
                license: "GPL-3.0",
                iconTheme: "purple",
                tags: ["python", "sandbox", "desktop", "runner"],
                downloads: 350,
                rating: 4.2,
                github: "https://github.com/guido/pyrunner",
                demo: "",
                installCommand: "brew install pyrunner",
                status: "approved",
                submissionDate: "2026-06-18",
                reviews: [
                    { author: "Pythonist", stars: 4, title: "Very convenient", text: "Great for testing single scripts without polluting my virtualenvs. Minimal overhead.", date: "2026-06-19" }
                ],
                bugs: [
                    { id: "PR-12", title: "C-extensions fail to compile on M1 Mac", desc: "Running python scripts that require compiled C libraries (like numpy) fails in the sandbox virtualenv on arm64 architectures.", severity: "high", version: "0.8.2", status: "open" }
                ]
            },
            {
                id: "codepulse",
                name: "CodePulse",
                developer: "DevMetrics Co.",
                category: "Web App",
                tagline: "Real-time Git and developer workflow analytics dashboard",
                description: "CodePulse hooks into your GitHub, GitLab, and Jira accounts to analyze pull request cycle times, commit velocities, developer code distributions, and deployment frequencies. Built for engineering managers looking to scale production pipelines.",
                version: "1.0.4",
                size: "12.8 MB",
                license: "Proprietary",
                iconTheme: "dark",
                tags: ["analytics", "git", "github", "management"],
                downloads: 110,
                rating: 4.5,
                github: "https://github.com/codepulse/pulse",
                demo: "https://codepulse.dev",
                installCommand: "npm install -g @codepulse/analyzer",
                status: "approved",
                submissionDate: "2026-06-16",
                reviews: [
                    { author: "Manager_Pete", stars: 4, title: "Great team visibility", text: "Helped us identify bottlenecks in our PR review cycle. Easy integration.", date: "2026-06-18" }
                ],
                bugs: []
            },
            {
                id: "laravel-shield",
                name: "Laravel Shield",
                developer: "SecOps Solutions",
                category: "Laravel Package",
                tagline: "Advanced security middleware, request validator, and rate limiter",
                description: "An enterprise-grade package that provides automated SQL injection blocklists, XSS prevention middleware, user rate limiters, and OAuth authentication protection out of the box.",
                version: "1.0.0",
                size: "1.6 MB",
                license: "MIT",
                iconTheme: "blue",
                tags: ["laravel", "security", "middleware", "auth"],
                downloads: 0,
                rating: 0.0,
                github: "https://github.com/secops/laravel-shield",
                demo: "",
                installCommand: "composer require secops/laravel-shield",
                status: "pending",
                submissionDate: "2026-06-19",
                reviews: [],
                bugs: []
            },
            {
                id: "mobilecalc",
                name: "MobileCalc",
                developer: "TinyTools Dev",
                category: "Mobile",
                tagline: "An offline programmer's calculator supporting binary and hex formatting",
                description: "A clean mobile utility that supports bitwise operations, integer overflow simulations, float conversions, and multi-base calculator keys. Perfect for hardware and low-level software engineers.",
                version: "1.0.0",
                size: "8.4 MB",
                license: "MIT",
                iconTheme: "orange",
                tags: ["mobile", "calculator", "hex", "binary"],
                downloads: 0,
                rating: 0.0,
                github: "https://github.com/tinytools/mobilecalc",
                demo: "",
                installCommand: "git clone https://github.com/tinytools/mobilecalc && cd mobilecalc && npm run build",
                status: "pending",
                submissionDate: "2026-06-20",
                reviews: [],
                bugs: []
            }
        */

        logs: [],
        downloadTrend: [],

        apiEndpoints: [
            { method: "GET", path: "/api/apps", desc: "Retrieve a paginated array of approved public marketplace software.", params: [{ name: "category", type: "string", req: "optional", desc: "Filter by App Type" }, { name: "search", type: "string", req: "optional", desc: "Filter by query term" }], mockResponse: () => state.apps.filter(a => a.status === "approved") },
            { method: "GET", path: "/api/apps/{id}", desc: "Fetch complete profile metadata, comments, and bug list for a single app.", params: [{ name: "id", type: "string", req: "required", desc: "The software's identifier URL key" }], mockResponse: (args) => state.apps.find(a => a.id === args.id) || { error: "Application not found", status: 404 } },
            { method: "POST", path: "/api/apps/{id}/reviews", desc: "Publish a rating and review for an approved software package.", params: [{ name: "id", type: "string", req: "required", desc: "App ID" }, { name: "stars", type: "integer (1-5)", req: "required", desc: "Review rating" }, { name: "title", type: "string", req: "required", desc: "Review header" }, { name: "comment", type: "string", req: "required", desc: "Detailed review text" }], mockResponse: () => ({ success: true, message: "Review posted successfully. Average ratings rebuilt.", reviewId: Math.floor(Math.random() * 1000) }) },
            { method: "POST", path: "/api/apps/{id}/bug-reports", desc: "File an error or crash report into the developer's bug tracker dashboard.", params: [{ name: "id", type: "string", req: "required", desc: "App ID" }, { name: "title", type: "string", req: "required", desc: "Short description" }, { name: "severity", type: "string (low|medium|high)", req: "required", desc: "Error classification" }], mockResponse: () => ({ success: true, bugId: `BUG-${Math.floor(Math.random() * 800) + 100}`, status: "open", queued: true }) },
            { method: "POST", path: "/api/track-event", desc: "Send telemetry download or install activity metrics to the analytics pipe.", params: [{ name: "app_id", type: "string", req: "required", desc: "App ID" }, { name: "event", type: "string", req: "required", desc: "e.g. 'download_clicked' or 'app_opened'" }], mockResponse: () => ({ status: "Event accepted", stream: "analytics_v2", received_at: new Date().toISOString() }) }
        ]
    };

    let downloadsChartInstance = null;
    let bugsChartInstance = null;

    // -----------------------------------------
    // 2. Initialize Views and Settings
    // -----------------------------------------
    
    // Apply theme on load
    document.documentElement.dataset.theme = state.theme;

    // Render only the active route.
    if (currentPage === "today") window.Appex?.renderHomeView?.();
    if (currentPage === "discover") window.Appex?.renderDiscoverAppGrid?.();
    if (currentPage === "developer") window.Appex?.renderDeveloperConsole?.();
    if (currentPage === "admin") window.Appex?.renderAdminModeration?.();
    if (currentPage === "api") renderApiDocs();

    if (currentPage === "developer") {
        window.Appex?.loadDeveloperApps?.();
        window.Appex?.initDeveloperCharts?.();
    }

    if (currentPage === "today" || currentPage === "discover") {
        if (!window.__marketplaceApps) window.Appex?.loadPublicApps?.();
    }

    if (currentPage === "admin") {
        const queueBody = document.getElementById("adminQueueTableBody");
        const queueCount = document.getElementById("adminQueueCount");
        if (queueBody) {
            queueBody.innerHTML = `<tr><td colspan="6" style="padding:24px;text-align:center;color:var(--text-secondary);">Loading pending applications…</td></tr>`;
        }
        if (queueCount) queueCount.textContent = "Loading reviews…";
        window.Appex?.loadAdminPendingApps?.();
    }

    // A restored history entry is displayed immediately, then refreshed in place.
    window.addEventListener("pageshow", (event) => {
        if (!event.persisted) return;

        if (currentPage === "today" || currentPage === "discover") window.Appex?.loadPublicApps?.();
        if (currentPage === "developer") window.Appex?.loadDeveloperApps?.();
        if (currentPage === "admin") window.Appex?.loadAdminPendingApps?.();
    });

    // Chart.js is loaded asynchronously and must never delay the rest of the page.
    window.addEventListener("load", () => window.Appex?.initDeveloperCharts?.());

    // Start the hero timer only where the hero exists.
    // Marketplace owns the spotlight timer so it cannot start twice.

    // -----------------------------------------
    // 4. Role Switcher Dropdown Logic
    // -----------------------------------------
    const profileTrigger = document.getElementById("profileDropdownTrigger");
    const profileDropdown = document.getElementById("profileDropdown");
    
    // Header avatar & name
    const avatarIcon = document.getElementById("avatarIcon");
    const profileName = document.getElementById("profileName");
    
    // Dropdown internal avatar & name
    const dropdownAvatar = document.getElementById("dropdownAvatar");
    const dropdownName = document.getElementById("dropdownName");
    const dropdownRole = document.getElementById("dropdownRole");

    const roleProfiles = {
        visitor: { name: "Guest User", role: "Visitor", avatar: "G", color: "linear-gradient(135deg, #86868b, #48484a)" },
        user: { name: "App User", role: "App User", avatar: "U", color: "linear-gradient(135deg, #30d158, #34c759)" },
        developer: { name: "Alex Mercer", role: "Developer Publisher", avatar: "A", color: "linear-gradient(135deg, #0071e3, #af52de)" },
        admin: { name: "Admin Officer", role: "Administrator", avatar: "O", color: "linear-gradient(135deg, #ff9f0a, #ff3b30)" }
    };

    if (serverAuthName && roleProfiles[initialRole]) {
        roleProfiles[initialRole] = {
            ...roleProfiles[initialRole],
            name: serverAuthName,
            role: serverAuthRole || roleProfiles[initialRole].role,
            avatar: serverAuthName.trim().charAt(0).toUpperCase() || roleProfiles[initialRole].avatar
        };
    }

    const developerAccessNavs = document.querySelectorAll(".developer-access-nav");
    const developerNavLabels = document.querySelectorAll(".developer-nav-label");
    const adminAccessNavs = document.querySelectorAll(".admin-access-nav");
    const adminNavLabels = document.querySelectorAll(".admin-nav-label");

    function applyProfile(profileKey) {
        const profile = roleProfiles[profileKey] || roleProfiles.visitor;

        avatarIcon.textContent = profile.avatar;
        avatarIcon.style.background = profile.color;
        profileName.textContent = profile.name;

        dropdownAvatar.textContent = profile.avatar;
        dropdownAvatar.style.background = profile.color;
        dropdownName.textContent = profile.name;
        dropdownRole.textContent = profile.role;
    }

    function syncAuthenticatedNavigation() {
        if (state.developerAuthenticated) {
            developerAccessNavs.forEach(nav => {
                nav.dataset.tab = "developer";
                if (nav.tagName === "A") nav.href = pageRoutes.developer;
            });

            developerNavLabels.forEach(label => {
                label.textContent = "Developer Console";
            });
        }

        if (state.adminAuthenticated) {
            adminAccessNavs.forEach(nav => {
                nav.dataset.tab = "admin";
                if (nav.tagName === "A") nav.href = pageRoutes.admin;
            });

            adminNavLabels.forEach(label => {
                label.textContent = "Admin Moderation";
            });
        }
    }

    syncAuthenticatedNavigation();
    applyProfile(state.currentRole);

    // Toggle Dropdown
    profileTrigger?.addEventListener("click", (e) => {
        e.stopPropagation();
        profileDropdown?.classList.toggle("show");
    });

    // Close Dropdown on click outside
    document.addEventListener("click", () => {
        profileDropdown?.classList.remove("show");
    });
    profileDropdown?.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent closing dropdown when clicking inside it
    });

    const developerLoginForm = document.getElementById("developerLoginForm");
    const developerLoginStatus = document.getElementById("developerLoginStatus");

    if (developerLoginForm?.dataset.realAuth !== "true") developerLoginForm?.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!developerLoginForm.reportValidity()) {
            return;
        }

        state.developerAuthenticated = true;
        state.currentRole = "developer";
        sessionStorage.setItem("appex-developer-auth", "true");
        applyProfile("developer");

        developerAccessNavs.forEach(nav => {
            nav.dataset.tab = "developer";
            if (nav.tagName === "A") nav.href = pageRoutes.developer;
        });

        developerNavLabels.forEach(label => {
            label.textContent = "Developer Console";
        });

        if (developerLoginStatus) {
            developerLoginStatus.textContent = "Developer access verified. Opening publisher console...";
        }

        showToast("Developer workspace unlocked.", "success");
        window.Appex?.renderDeveloperConsole?.();

        window.setTimeout(() => {
            window.location.href = pageRoutes.developer;
        }, 450);
    });

    // -----------------------------------------
    // 5. Global Navigation Search Bar Link
    // -----------------------------------------
    const globalSearch = document.getElementById("globalAppSearch");
    globalSearch?.addEventListener("input", (e) => {
        const query = e.target.value;
        const discoverGrid = document.getElementById("discoverAppGrid");

        if (!discoverGrid) {
            return;
        }
        
        state.activeTab = "discover";
        const activeCategory = document.querySelector("#categoryPillContainer .category-pill.active")?.dataset.category || "";
        const activePlatform = document.querySelector("#platformPillContainer .category-pill.active")?.dataset.platform || "";
        window.Appex?.renderDiscoverAppGrid?.(query, activeCategory, activePlatform);
    });

    globalSearch?.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" || document.getElementById("discoverAppGrid")) return;

        const query = e.currentTarget.value.trim();
        window.location.href = query
            ? `${pageRoutes.discover}?q=${encodeURIComponent(query)}`
            : pageRoutes.discover;
    });

    // -----------------------------------------
    // 6. Theme Toggle Logic
    // -----------------------------------------
    const themeToggleBtn = document.getElementById("themeToggle");
    themeToggleBtn?.addEventListener("click", () => {
        const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = nextTheme;
        state.theme = nextTheme;
        localStorage.setItem("appex-theme", nextTheme);
        
        showToast(`Theme changed to ${nextTheme} mode`, "success");

        // Rebuild charts if active
        if (state.activeTab === "developer") {
            window.Appex?.initDeveloperCharts?.();
        }
    });

    // -----------------------------------------
    // 7. UI Render Functions
    // -----------------------------------------

    // ROTATING HERO BANNER FUNCTION (Microsoft Store style)
    function rotateHeroBanner() {
        const approvedApps = state.apps.filter(a => a.status === "approved");
        if (approvedApps.length === 0 || state.activeTab !== "today") return;
        
        state.heroIndex = (state.heroIndex + 1) % Math.min(approvedApps.length, 3);
        renderHeroBanner(approvedApps[state.heroIndex]);
    }

    function renderApiDocs() {
        const container = document.getElementById("apiEndpointsContainer");
        if (!container) return;

        container.innerHTML = "";

        state.apiEndpoints.forEach((api, index) => {
            const card = document.createElement("div");
            card.className = "api-endpoint-card";
            card.innerHTML = `
                <div class="api-endpoint-header" data-index="${index}">
                    <div class="api-route">
                        <span class="api-method ${api.method.toLowerCase()}">${api.method}</span>
                        <span class="api-path">${api.path}</span>
                    </div>
                    <span class="api-desc">${api.desc}</span>
                </div>
                <div class="api-endpoint-body">
                    <div class="api-section-header">Request Parameters</div>
                    <table class="api-params-table">
                        <thead>
                            <tr>
                                <th>Parameter</th>
                                <th>Type</th>
                                <th>Required</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${api.params.map(p => `
                                <tr>
                                    <td class="api-param-name">${p.name}</td>
                                    <td class="api-param-type">${p.type}</td>
                                    <td class="api-param-req">${p.req}</td>
                                    <td>${p.desc}</td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>

                    <div class="api-try-panel">
                        <div class="api-try-inputs">
                            <div class="api-section-header">Try Endpoint</div>
                            <form class="api-test-form" data-index="${index}">
                                ${api.params.map(p => `
                                    <div class="form-group" style="margin-bottom: 10px;">
                                        <label for="api-in-${index}-${p.name}">${p.name} (${p.type})</label>
                                        <input type="text" id="api-in-${index}-${p.name}" class="form-input" 
                                            placeholder="${p.desc}" 
                                            value="${p.name === 'id' ? 'devflow' : ''}" 
                                            ${p.req === 'required' ? 'required' : ''}>
                                    </div>
                                `).join("")}
                                <button type="submit" class="btn-primary" style="margin-top:8px; width:100%; justify-content:center;">Execute request</button>
                            </form>
                        </div>
                        <div class="api-try-response">
                            <div class="api-section-header">HTTP Response</div>
                            <div class="response-box" id="api-res-${index}">Click execute...</div>
                        </div>
                    </div>
                </div>
            `;

            card.querySelector(".api-endpoint-header").addEventListener("click", () => {
                card.classList.toggle("active");
            });

            card.querySelector(".api-test-form").addEventListener("submit", (e) => {
                e.preventDefault();
                window.Appex?.executeMockApiCall?.(index);
            });

            container.appendChild(card);
        });
    }

    // -----------------------------------------
    // 11. Toast System
    // -----------------------------------------
    function showToast(message, type = "success") {
        const toastContainer = document.getElementById("toastContainer");
        if (!toastContainer) return;

        const toast = document.createElement("div");
        toast.className = `toast ${type}`;
        toast.innerHTML = `<div class="toast-message">${message}</div>`;
        toastContainer.appendChild(toast);
        
        window.setTimeout(() => {
            toast.classList.add("is-hiding");
            window.setTimeout(() => toast.remove(), 260);
        }, 2400);
    }

    // -----------------------------------------
    // USER AUTH MODAL HANDLERS
    // -----------------------------------------
    window.openUserAuthModal = function() {
        if (serverRole) {
            showToast(`You are already signed in as ${roleProfiles[serverRole]?.role || serverRole}.`, "warning");
            return;
        }
        const modal = document.getElementById("userAuthModalOverlay");
        if (modal) {
            modal.style.display = "flex";
            switchUserAuthTab("login");
        }
    };

    window.closeUserAuthModal = function() {
        const modal = document.getElementById("userAuthModalOverlay");
        if (modal) {
            modal.style.display = "none";
        }
    };

    function switchUserAuthTab(tab) {
        const loginContainer = document.getElementById("userLoginFormContainer");
        const registerContainer = document.getElementById("userRegisterFormContainer");
        const modalTitle = document.getElementById("userAuthModalTitle");

        if (tab === "login") {
            if (loginContainer) loginContainer.style.display = "block";
            if (registerContainer) registerContainer.style.display = "none";
            if (modalTitle) modalTitle.textContent = "Sign in to Appex";
        } else {
            if (registerContainer) registerContainer.style.display = "block";
            if (loginContainer) loginContainer.style.display = "none";
            if (modalTitle) modalTitle.textContent = "Create an Appex Account";
        }
    }

    document.getElementById("toggleToRegister")?.addEventListener("click", (e) => {
        e.preventDefault();
        switchUserAuthTab("register");
    });
    document.getElementById("toggleToLogin")?.addEventListener("click", (e) => {
        e.preventDefault();
        switchUserAuthTab("login");
    });
    document.getElementById("closeUserAuthModalBtn")?.addEventListener("click", window.closeUserAuthModal);
    document.getElementById("userAuthModalOverlay")?.addEventListener("click", (e) => {
        if (e.target === document.getElementById("userAuthModalOverlay")) {
            window.closeUserAuthModal();
        }
    });

    document.getElementById("headerSignInBtn")?.addEventListener("click", window.openUserAuthModal);
    document.getElementById("dropdownSignInBtn")?.addEventListener("click", window.openUserAuthModal);
    document.getElementById("drawerSignInBtn")?.addEventListener("click", window.openUserAuthModal);

    // Admin navigation now uses the shared account modal instead of a
    // separate login page. Open it after the named route redirects home.
    if (new URLSearchParams(window.location.search).get("login") === "admin") {
        window.openUserAuthModal();
    }

    document.getElementById("userLoginForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("userLoginEmail").value;
        const password = document.getElementById("userLoginPassword").value;

        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content || ""
                },
                body: JSON.stringify({ email, password })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Login failed.");

            if (result.user && result.user.role === 'admin') {
                showToast("Admin access verified. Opening moderation workspace...", "success");
                setTimeout(() => {
                    window.location.href = "/admin";
                }, 1000);
            } else {
                showToast("Logged in successfully! Reloading...", "success");
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        } catch (err) {
            showToast(err.message, "danger");
        }
    });

    document.getElementById("userRegisterForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("userRegisterName").value;
        const email = document.getElementById("userRegisterEmail").value;
        const password = document.getElementById("userRegisterPassword").value;
        const password_confirmation = document.getElementById("userRegisterPasswordConfirmation").value;

        try {
            const response = await fetch("/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content || ""
                },
                body: JSON.stringify({ name, email, password, password_confirmation })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Registration failed.");

            showToast("Registered successfully! Reloading...", "success");
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (err) {
            showToast(err.message, "danger");
        }
    });

    // -----------------------------------------

// Expose shared functions and state to page-specific Vite modules.
window.Appex = {
    ...(window.Appex || {}),
    iconGradients,
    formatBytes,
    parseFileSize,
    appIconUrl,
    pageRoutes,
    currentPage,
    serverAuthMode,
    serverAuthName,
    serverAuthRole,
    serverRole,
    state,
    roleProfiles,
    showToast,
    mapMarketplaceApp,
    renderApiDocs
};

window.iconGradients = iconGradients;
window.formatBytes = formatBytes;
window.parseFileSize = parseFileSize;
window.appIconUrl = appIconUrl;
window.state = state;
window.showToast = showToast;
window.mapMarketplaceApp = mapMarketplaceApp;
document.dispatchEvent(new CustomEvent("appex:core-ready"));

});
