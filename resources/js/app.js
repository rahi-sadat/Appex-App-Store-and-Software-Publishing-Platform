// Appex Frontend Engine - Microsoft & Apple Store Hybrid Mockup
document.addEventListener("DOMContentLoaded", () => {
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
    if (currentPage === "today") renderHomeView();
    if (currentPage === "discover") renderDiscoverAppGrid();
    if (currentPage === "developer") renderDeveloperConsole();
    if (currentPage === "admin") renderAdminModeration();
    if (currentPage === "api") renderApiDocs();

    if (currentPage === "developer") {
        loadDeveloperApps();
        initDeveloperCharts();
    }

    if (currentPage === "today" || currentPage === "discover") {
        if (!window.__marketplaceApps) loadPublicApps();
    }

    if (currentPage === "admin") {
        const queueBody = document.getElementById("adminQueueTableBody");
        const queueCount = document.getElementById("adminQueueCount");
        if (queueBody) {
            queueBody.innerHTML = `<tr><td colspan="6" style="padding:24px;text-align:center;color:var(--text-secondary);">Loading pending applications…</td></tr>`;
        }
        if (queueCount) queueCount.textContent = "Loading reviews…";
        loadAdminPendingApps();
    }

    // A restored history entry is displayed immediately, then refreshed in place.
    window.addEventListener("pageshow", (event) => {
        if (!event.persisted) return;

        if (currentPage === "today" || currentPage === "discover") loadPublicApps();
        if (currentPage === "developer") loadDeveloperApps();
        if (currentPage === "admin") loadAdminPendingApps();
    });

    // Chart.js is loaded asynchronously and must never delay the rest of the page.
    window.addEventListener("load", initDeveloperCharts);

    // Start the hero timer only where the hero exists.
    if (currentPage === "today") setInterval(rotateHeroBanner, 6000);

    // -----------------------------------------
    // 3. Tab Switching Router
    // -----------------------------------------
    const navItems = document.querySelectorAll(".nav-item");
    const tabPanels = document.querySelectorAll(".tab-panel");

    // Warm Laravel page responses before navigation. This keeps regular,
    // accessible links while avoiding a cold document request after the click.
    const prefetchedPages = new Set();
    const prefetchPage = href => {
        if (!href) return;

        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin || url.href === window.location.href || prefetchedPages.has(url.href)) return;

        prefetchedPages.add(url.href);
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.as = "document";
        link.href = url.href;
        document.head.appendChild(link);
    };

    const internalLinks = [...document.querySelectorAll("a[href]")].filter(link => {
        try {
            return new URL(link.href, window.location.origin).origin === window.location.origin;
        } catch {
            return false;
        }
    });

    internalLinks.forEach(link => {
        link.addEventListener("pointerenter", () => prefetchPage(link.href), { once: true });
        link.addEventListener("focus", () => prefetchPage(link.href), { once: true });
        link.addEventListener("touchstart", () => prefetchPage(link.href), { once: true, passive: true });
    });

    navItems.forEach(item => {
        if (!item.dataset.tab) return;

        item.addEventListener("click", () => {
            const tabName = item.dataset.tab;
            switchTab(tabName);
        });
    });

    // Make brand click go to home
    document.getElementById("brandSectionLogo")?.addEventListener("click", () => {
        window.location.href = pageRoutes.today;
    });

    function switchTab(tabName, categoryFilter = null) {
        if (!tabName) return;

        if (tabName === "developer" && !state.developerAuthenticated) {
            tabName = "developer-login";
            showToast("Developer console requires developer login.", "warning");
        }

        if (tabName === "admin" && !state.adminAuthenticated) {
            window.openUserAuthModal();
            showToast("Admin moderation requires admin login.", "warning");
            return;
        }

        state.activeTab = tabName;
        
        // Remove active class
        navItems.forEach(nav => nav.classList.remove("active"));
        tabPanels.forEach(panel => panel.classList.remove("active"));
        
        // Add active class
        const targetNav = document.querySelector(`.nav-item[data-tab="${tabName}"]`);
        const targetPanel = document.getElementById(`panel-${tabName}`);

        if (!targetPanel) {
            let targetUrl = pageRoutes[tabName] || pageRoutes.today;
            if (categoryFilter && tabName === "discover") {
                targetUrl += `?category=${encodeURIComponent(categoryFilter)}`;
            }

            window.location.href = targetUrl;
            return;
        }
        
        if (targetNav) targetNav.classList.add("active");
        if (targetPanel) targetPanel.classList.add("active");

        // Close drawer if changing tabs
        closeAppDetailsDrawer();

        // Specific actions on tab activate
        if (tabName === "developer") {
            initDeveloperCharts();
        } else if (tabName === "discover") {
            const searchVal = document.getElementById("globalAppSearch").value;
            // If category filter is passed, activate that category pill
            if (categoryFilter) {
                const pills = document.querySelectorAll(".category-pill");
                pills.forEach(p => {
                    p.classList.remove("active");
                    p.setAttribute("aria-selected", "false");
                    if (p.dataset.category === categoryFilter) {
                        p.classList.add("active");
                        p.setAttribute("aria-selected", "true");
                    }
                });
                renderDiscoverAppGrid(searchVal, categoryFilter);
            } else {
                renderDiscoverAppGrid(searchVal, "all");
            }
        }

        // Scroll to top when tab changes
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

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
    profileTrigger.addEventListener("click", (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle("show");
    });

    // Close Dropdown on click outside
    document.addEventListener("click", () => {
        profileDropdown.classList.remove("show");
    });
    profileDropdown.addEventListener("click", (e) => {
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
        renderDeveloperConsole();

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
        renderDiscoverAppGrid(query, activeCategory, activePlatform);
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
            initDeveloperCharts();
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

    function renderHeroBanner(app) {
        const heroContainer = document.getElementById("heroBannerWidget");
        if (!heroContainer) return;

        // Uploaded media is preferred; the generated fallback needs no network request.
        const bgUrl = app.screenshots?.[0]?.url || appIconUrl(app);

        heroContainer.innerHTML = `
            <img src="${bgUrl}" alt="${app.name} background" class="hero-banner-img">
            <div class="hero-banner-overlay">
                <div class="hero-banner-content">
                    <span class="hero-eyebrow">SPOTLIGHT APP</span>
                    <h1 class="hero-title">${app.name}</h1>
                    <p class="hero-desc">${app.tagline}. ${app.description.substring(0, 120)}...</p>
                    <div class="hero-action-row">
                        <button class="btn-hero-get" data-id="${app.id}" type="button">GET NOW</button>
                        <span style="font-weight:600; font-size:13px; color:rgba(255,255,255,0.7);">${app.downloads.toLocaleString()} Active Developers</span>
                    </div>
                </div>
            </div>
        `;

        // Click handles
        heroContainer.querySelector(".btn-hero-get").addEventListener("click", (e) => {
            e.stopPropagation();
            triggerAppDownload(app.id, e.target);
        });

        heroContainer.onclick = () => {
            openAppDetailsDrawer(app.id);
        };
    }

    // RENDER HOME VIEW (Featured banner, trending, top categories)
    function renderHomeView() {
        if (!document.getElementById("heroBannerWidget") && !document.getElementById("trendingCarouselTrack")) return;

        const approvedApps = state.apps.filter(a => a.status === "approved");
        if (approvedApps.length === 0) return;

        // Render Hero Banner
        renderHeroBanner(approvedApps[state.heroIndex]);

        // Render Trending Carousel (Sorted by Downloads desc)
        const trendingApps = [...approvedApps].sort((a, b) => b.downloads - a.downloads);
        const trendingTrack = document.getElementById("trendingCarouselTrack");
        if (!trendingTrack) return;
        trendingTrack.innerHTML = "";
        
        trendingApps.forEach(app => {
            const card = document.createElement("div");
            card.className = "carousel-card";
            card.innerHTML = `
                <div class="carousel-card-top">
                    <img class="carousel-card-icon" src="${appIconUrl(app)}" alt="${app.name} icon" style="object-fit:cover;">
                    <div class="carousel-card-meta">
                        <h3 class="carousel-card-name">${app.name}</h3>
                        <span class="carousel-card-dev">${app.developer}</span>
                    </div>
                </div>
                <p class="carousel-card-desc">${app.tagline}</p>
                <div class="carousel-card-footer">
                    <span class="carousel-rating">
                        <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        <span>${app.rating > 0 ? app.rating.toFixed(1) : "N/A"}</span>
                    </span>
                    <button class="carousel-get-btn" type="button">GET</button>
                </div>
            `;

            card.querySelector(".carousel-get-btn").addEventListener("click", (e) => {
                e.stopPropagation();
                triggerAppDownload(app.id, e.target);
            });

            card.onclick = () => openAppDetailsDrawer(app.id);
            trendingTrack.appendChild(card);
        });

        // Render Top Rated Tools Carousel (Sorted by Rating desc)
        const topRatedApps = [...approvedApps].sort((a, b) => b.rating - a.rating);
        const topRatedTrack = document.getElementById("topRatedCarouselTrack");
        if (!topRatedTrack) return;
        topRatedTrack.innerHTML = "";

        topRatedApps.forEach(app => {
            const card = document.createElement("div");
            card.className = "carousel-card";
            card.innerHTML = `
                <div class="carousel-card-top">
                    <img class="carousel-card-icon" src="${appIconUrl(app)}" alt="${app.name} icon" style="object-fit:cover;">
                    <div class="carousel-card-meta">
                        <h3 class="carousel-card-name">${app.name}</h3>
                        <span class="carousel-card-dev">${app.developer}</span>
                    </div>
                </div>
                <p class="carousel-card-desc">${app.tagline}</p>
                <div class="carousel-card-footer">
                    <span class="carousel-rating">
                        <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        <span>${app.rating.toFixed(1)}</span>
                    </span>
                    <button class="carousel-get-btn" type="button">GET</button>
                </div>
            `;

            card.querySelector(".carousel-get-btn").addEventListener("click", (e) => {
                e.stopPropagation();
                triggerAppDownload(app.id, e.target);
            });

            card.onclick = () => openAppDetailsDrawer(app.id);
            topRatedTrack.appendChild(card);
        });

        const posterTrack = document.getElementById("homePosterTrack");
        if (posterTrack) {
            posterTrack.innerHTML = "";

            trendingApps.slice(0, 6).forEach(app => {
                const card = document.createElement("article");
                card.className = "store-poster-card";
                card.dataset.id = app.id;
                card.style.background = app.screenshots?.[0]?.url ? `linear-gradient(rgba(0,0,0,.2),rgba(0,0,0,.65)), url("${app.screenshots[0].url}") center/cover` : iconGradients[app.iconTheme];
                card.innerHTML = `
                    <span class="store-poster-badge">${app.category}</span>
                    <div class="store-poster-art">${app.name.charAt(0)}</div>
                    <div class="store-poster-content">
                        <h3 class="store-poster-title">${app.name}</h3>
                        <span class="store-poster-dev">${app.developer}</span>
                        <div class="store-poster-meta">
                            <span class="store-poster-rating">${app.rating > 0 ? app.rating.toFixed(1) : "New"} &#9733;</span>
                            <button class="store-poster-get" type="button">GET</button>
                        </div>
                    </div>
                `;

                card.querySelector(".store-poster-get").addEventListener("click", (e) => {
                    e.stopPropagation();
                    triggerAppDownload(app.id, e.target);
                });

                card.addEventListener("click", () => openAppDetailsDrawer(app.id));
                posterTrack.appendChild(card);
            });
        }

        const essentialGrid = document.getElementById("homeEssentialGrid");
        if (essentialGrid) {
            essentialGrid.innerHTML = "";

            topRatedApps.slice(0, 6).forEach(app => {
                const card = document.createElement("article");
                card.className = "essential-card";
                card.dataset.id = app.id;
                card.innerHTML = `
                    <img class="essential-icon" src="${appIconUrl(app)}" alt="${app.name} icon" style="object-fit:cover;">
                    <div class="essential-info">
                        <h3 class="essential-title">${app.name}</h3>
                        <span class="essential-meta">${app.rating > 0 ? `${app.rating.toFixed(1)} rating` : "New release"} &bull; ${app.downloads.toLocaleString()} downloads</span>
                    </div>
                    <button class="essential-get" type="button">GET</button>
                `;

                card.querySelector(".essential-get").addEventListener("click", (e) => {
                    e.stopPropagation();
                    triggerAppDownload(app.id, e.target);
                });

                card.addEventListener("click", () => openAppDetailsDrawer(app.id));
                essentialGrid.appendChild(card);
            });
        }
    }

    // Bind Home Page Categories click routing
    document.querySelectorAll(".category-card").forEach(card => {
        card.addEventListener("click", () => {
            const cat = card.dataset.category;
            switchTab("discover", cat);
        });
    });

    // Bind footer quick tab links
    document.querySelectorAll(".footer-tab-link").forEach(link => {
        link.addEventListener("click", (e) => {
            const tab = link.dataset.tab;
            const cat = link.dataset.category;

            if (!tab && !cat) {
                return;
            }

            e.preventDefault();

            if (tab) {
                switchTab(tab);
            } else if (cat) {
                switchTab("discover", cat);
            }
        });
    });

    // Bind "See all" links on Carousels
    document.querySelectorAll(".carousel-see-all").forEach(link => {
        link.onclick = () => switchTab("discover");
    });

    // RENDER DISCOVER APP GRID
    function normalizeFilterValue(value) {
        return String(value || "")
            .toLowerCase()
            .replace(/&/g, "and")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    function renderDiscoverAppGrid(searchQuery = "", selectedCategory = "", selectedPlatform = "") {
        const grid = document.getElementById("discoverAppGrid");
        if (!grid) return;

        grid.innerHTML = "";

        const query = searchQuery.toLowerCase().trim();
        const normalizedCategory = normalizeFilterValue(selectedCategory);
        const normalizedPlatform = normalizeFilterValue(selectedPlatform);
        const filtered = state.apps.filter(app => {
            if (app.status !== "approved") return false;
            
            const appCategorySlug = normalizeFilterValue(app.categorySlug || app.category);
            const matchesCategory = normalizedCategory === "" || normalizedCategory === "all" || appCategorySlug === normalizedCategory;
            const matchesPlatform = normalizedPlatform === "" || normalizedPlatform === "all" || normalizeFilterValue(app.platform || "web") === normalizedPlatform;
            const matchesSearch = query === "" || 
                app.name.toLowerCase().includes(query) || 
                app.tagline.toLowerCase().includes(query) || 
                app.tags.some(t => t.toLowerCase().includes(query)) ||
                app.developer.toLowerCase().includes(query);
                
            return matchesCategory && matchesPlatform && matchesSearch;
        });

        if (filtered.length === 0) {
            grid.innerHTML = `<div style="grid-column: 1/-1; padding: 40px 0; text-align: center; color: var(--text-secondary); font-size: 14px;">No applications match this category and platform combination.</div>`;
            return;
        }

        filtered.forEach(app => {
            const card = document.createElement("div");
            card.className = "app-card";
            card.dataset.id = app.id;
            
            card.innerHTML = `
                <img class="app-card-icon" src="${appIconUrl(app)}" alt="${app.name} icon" style="object-fit:cover;">
                <div class="app-card-info">
                    <h3 class="app-card-title">${app.name}</h3>
                    <span class="app-card-dev">${app.developer}</span>
                    <div class="app-card-rating">
                        <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        <span>${app.rating > 0 ? app.rating.toFixed(1) : "N/A"} (${app.reviews.length})</span>
                    </div>
                </div>
                <div class="app-card-action">
                    <button class="app-get-btn" type="button">GET</button>
                    <span class="app-card-type">${app.category.split(" ")[0]}</span>
                </div>
            `;

            card.addEventListener("click", (e) => {
                if (e.target.classList.contains("app-get-btn")) {
                    e.stopPropagation();
                    triggerAppDownload(app.id, e.target);
                    return;
                }
                openAppDetailsDrawer(app.id);
            });

            grid.appendChild(card);
        });
    }

    // Bind Discover Pills filter
    const discoverPills = document.querySelectorAll("#categoryPillContainer .category-pill");
    const platformPills = document.querySelectorAll("#platformPillContainer .category-pill");
    
    function applyDiscoverFilters() {
        const activeCategory = document.querySelector("#categoryPillContainer .category-pill.active")?.dataset.category || "";
        const activePlatform = document.querySelector("#platformPillContainer .category-pill.active")?.dataset.platform || "";
        const searchVal = document.getElementById("globalAppSearch")?.value || "";
        renderDiscoverAppGrid(searchVal, activeCategory, activePlatform);

        const titleNode = document.getElementById("discoverGridTitle");
        if (titleNode) {
            let catName = document.querySelector("#categoryPillContainer .category-pill.active")?.textContent || "Featured Releases";
            if (catName === "All Categories") catName = "Featured Releases";
            titleNode.textContent = catName;
        }
    }

    discoverPills.forEach(pill => {
        pill.addEventListener("click", () => {
            discoverPills.forEach(p => {
                p.classList.remove("active");
                p.setAttribute("aria-selected", "false");
            });
            pill.classList.add("active");
            pill.setAttribute("aria-selected", "true");
            applyDiscoverFilters();
        });
    });

    platformPills.forEach(pill => {
        pill.addEventListener("click", () => {
            platformPills.forEach(p => {
                p.classList.remove("active");
                p.setAttribute("aria-selected", "false");
            });
            pill.classList.add("active");
            pill.setAttribute("aria-selected", "true");
            applyDiscoverFilters();
        });
    });

    const discoverGrid = document.getElementById("discoverAppGrid");
    if (discoverGrid) {
        const params = new URLSearchParams(window.location.search);
        const initialCategory = params.get("category") || "";
        const initialPlatform = params.get("platform") || "";
        const initialQuery = params.get("q") || "";

        if (globalSearch && initialQuery) {
            globalSearch.value = initialQuery;
        }

        const normalizedInitialCategory = normalizeFilterValue(initialCategory);
        discoverPills.forEach(p => {
            const isActive = normalizeFilterValue(p.dataset.category) === normalizedInitialCategory || (initialCategory === "" && p.dataset.category === "");
            p.classList.toggle("active", isActive);
            p.setAttribute("aria-selected", String(isActive));
        });

        platformPills.forEach(p => {
            const isActive = p.dataset.platform === initialPlatform || (initialPlatform === "" && p.dataset.platform === "");
            p.classList.toggle("active", isActive);
            p.setAttribute("aria-selected", String(isActive));
        });

        applyDiscoverFilters();
    }

    async function loadPublicApps() {
        try {
            const response = await fetch("/api/apps?per_page=100", {
                cache: "no-store",
                headers: { "Accept": "application/json" }
            });
            if (!response.ok) throw new Error("Could not load marketplace apps.");
            const payload = await response.json();
            state.heroIndex = 0;
            state.apps = (payload.data || []).map(app => ({
                id: app.slug,
                databaseId: String(app.id),
                name: app.pending_changes?.attributes?.name || app.name,
                developer: app.developer?.name || "Unknown developer",
                category: app.category?.name || "Other",
                categorySlug: app.category?.slug || "",
                tagline: app.pending_changes?.attributes?.tagline ?? app.tagline ?? "",
                description: app.pending_changes?.attributes?.description ?? app.description ?? "",
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
                tags: app.pending_changes?.tags || (app.tags || []).map(tag => tag.name),
                downloads: app.downloads_count || 0,
                rating: Number(app.average_rating || 0),
                github: app.repository_url || "",
                demo: app.demo_url || "",
                installCommand: app.latest_release?.install_command || "",
                status: app.status,
                submissionDate: app.published_at || app.created_at,
                reviews: [],
                bugs: []
            }));
            renderHomeView();
            const params = new URLSearchParams(window.location.search);
            renderDiscoverAppGrid(globalSearch?.value || params.get("q") || "", params.get("category") || "", params.get("platform") || "");
        } catch (error) {
            showToast(error.message, "danger");
        }
    }

    // RENDER DEVELOPER CONSOLE
    async function loadDeveloperApps() {
        try {
            const response = await fetch("/api/developer/apps", {
                cache: "no-store",
                headers: { "Accept": "application/json" }
            });
            if (!response.ok) throw new Error("Could not load your submitted apps.");

            const payload = await response.json();
            state.downloadTrend = Array.isArray(payload.download_trend) ? payload.download_trend : [];
            state.apps = (payload.data || []).map(app => {
                const hasPendingChanges = Boolean(app.pending_changes);
                const pendingAttributes = app.pending_changes?.attributes || {};
                const pendingRelease = app.pending_changes?.release || {};

                return {
                    id: String(app.id),
                    databaseId: String(app.id),
                    name: pendingAttributes.name || app.name,
                    developer: serverAuthName,
                    category: app.category?.name || "Pending category",
                    categorySlug: app.category?.slug || "",
                    tagline: pendingAttributes.tagline ?? app.tagline ?? "",
                    description: pendingAttributes.description ?? app.description ?? "",
                    version: pendingRelease.version ?? app.latest_release?.version ?? "—",
                    size: pendingRelease.size_bytes !== undefined ? formatBytes(pendingRelease.size_bytes) : formatBytes(app.latest_release?.assets?.[0]?.size_bytes),
                    downloadUrl: pendingRelease.download_url ?? app.latest_release?.assets?.[0]?.external_url ?? "",
                    license: pendingAttributes.license ?? app.license ?? "—",
                    primaryLanguage: pendingAttributes.primary_language ?? app.primary_language ?? "",
                    iconTheme: "blue",
                    iconUrl: app.icon_path ? `/storage/${app.icon_path}` : null,
                    screenshots: (app.screenshots || []).map(item => ({
                        id: String(item.id),
                        url: `/storage/${item.image_path}`,
                        caption: item.caption || ""
                    })),
                    tags: app.pending_changes?.tags || (app.tags || []).map(tag => tag.name),
                    downloads: app.downloads_count || 0,
                    rating: parseFloat(app.average_rating) || parseFloat(app.rating) || 0,
                    github: pendingAttributes.repository_url ?? app.repository_url ?? "",
                    demo: pendingAttributes.demo_url ?? app.demo_url ?? "",
                    installCommand: pendingRelease.install_command ?? app.latest_release?.install_command ?? "",
                    releases: (app.releases || (app.latest_release ? [app.latest_release] : [])).map(release => ({
                        version: release.version || "—",
                        title: release.title || "",
                        notes: release.release_notes || "",
                        status: release.status || "draft",
                        date: release.published_at || release.created_at || null
                    })),
                    status: app.status,
                    hasPendingChanges,
                    statusLabel: hasPendingChanges ? "MODIFICATION PENDING" : app.status.toUpperCase(),
                    submissionDate: app.pending_changes_submitted_at || app.submitted_at || app.created_at,
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
                };
            });
            renderDeveloperConsole();
            initDeveloperCharts();
        } catch (error) {
            showToast(error.message, "danger");
        }
    }

    function renderDeveloperConsole() {
        if (!document.getElementById("statDownloads")) return;

        const devApps = state.apps;
        const totalDownloads = devApps.reduce((acc, curr) => acc + curr.downloads, 0);
        
        let totalRating = 0;
        let ratedCount = 0;
        devApps.forEach(a => {
            if (a.rating > 0) {
                totalRating += a.rating;
                ratedCount++;
            }
        });
        const avgRating = ratedCount > 0 ? (totalRating / ratedCount).toFixed(1) : "0.0";
        const openBugsCount = devApps.reduce((acc, curr) => acc + curr.bugs.filter(b => b.status === "open").length, 0);

        document.getElementById("statDownloads").textContent = totalDownloads.toLocaleString();
        document.getElementById("statRating").textContent = avgRating;
        document.getElementById("statBugs").textContent = openBugsCount;

        const tableBody = document.getElementById("devAppsTableBody");
        if (!tableBody) return;
        tableBody.innerHTML = "";

        devApps.forEach(app => {
            const tr = document.createElement("tr");
            const badgeClass = app.hasPendingChanges ? "pending" : app.status;
            const openBugs = app.bugs.filter(b => b.status === "open").length;

            tr.innerHTML = `
                <td style="font-weight:600; display:flex; align-items:center; gap:8px;">
                    ${app.iconUrl
                        ? `<img src="${app.iconUrl}" alt="" style="width:28px;height:28px;border-radius:6px;object-fit:cover;">`
                        : `<div style="width: 28px; height: 28px; border-radius: 6px; background: ${iconGradients[app.iconTheme]}; display:flex; align-items:center; justify-content:center; color:white; font-size:12px;font-weight:700;">${app.name.charAt(0)}</div>`}
                    <span>${app.name}</span>
                </td>
                <td>${app.category}</td>
                <td>v${app.version}</td>
                <td>${app.downloads.toLocaleString()}</td>
                <td><span class="status-badge ${badgeClass}">${app.statusLabel || app.status.toUpperCase()}</span></td>
                <td>${openBugs > 0 ? `<span style="color:var(--danger); font-weight:700;">${openBugs} open</span>` : "0"}</td>
                <td>
                    <button type="button" class="btn-secondary" data-view-app="${app.id}" style="padding: 4px 8px; font-size:11px;">View</button>
                    <button type="button" class="btn-secondary" data-modify-app="${app.id}" style="padding: 4px 8px; font-size:11px;">Modify</button>
                    <button type="button" class="btn-secondary" data-manage-app="${app.id}" style="padding: 4px 8px; font-size:11px; background-color: var(--accent); color: white; border: none;">Manage</button>
                    <button type="button" class="btn-secondary" data-delete-app="${app.id}" style="padding: 4px 8px; font-size:11px; background-color: var(--danger); color: white; border: none;">Delete</button>
                </td>
            `;
            tr.querySelector("[data-view-app]")?.addEventListener("click", () => window.openAppDetailsDrawer(app.id));
            tr.querySelector("[data-modify-app]")?.addEventListener("click", () => openModifyApp(app));
            tr.querySelector("[data-manage-app]")?.addEventListener("click", () => window.openManageAppModal(app.id));
            tr.querySelector("[data-delete-app]")?.addEventListener("click", () => window.openDeleteAppModal(app));
            tableBody.appendChild(tr);
        });
    }

    // RENDER ADMIN MODERATION
    async function loadAdminPendingApps() {
        try {
            const response = await fetch("/api/admin/dashboard", { cache: "no-store", headers: { "Accept": "application/json" } });
            if (!response.ok) throw new Error("Could not load the admin dashboard payload.");
            
            const payload = await response.json();
            const appsPayload = payload.apps;
            const pendingPayload = payload.pending;
            const activityPayload = payload.activities;

            const pendingApps = [...new Map(
                [...(appsPayload.data || []), ...(pendingPayload.data || [])].map(app => [String(app.id), app])
            ).values()];

            state.apps = pendingApps.map(app => ({
                id: String(app.id),
                name: app.pending_changes?.attributes?.name || app.name,
                developer: app.developer?.name || "Unknown developer",
                developerEmail: app.developer?.email || "",
                categoryId: app.category_id || null,
                category: app.category?.name || "Pending category",
                tagline: app.pending_changes?.attributes?.tagline ?? app.tagline ?? "",
                description: app.pending_changes?.attributes?.description ?? app.description ?? "",
                version: app.pending_changes?.release?.version ?? app.latest_release?.version ?? "—",
                size: app.pending_changes?.release?.size_bytes !== undefined ? formatBytes(app.pending_changes.release.size_bytes) : formatBytes(app.latest_release?.assets?.[0]?.size_bytes),
                license: app.pending_changes?.attributes?.license ?? app.license ?? "—",
                downloadUrl: app.pending_changes?.release?.download_url ?? app.latest_release?.assets?.[0]?.external_url ?? "",
                primaryLanguage: app.pending_changes?.attributes?.primary_language ?? app.primary_language ?? "",
                iconTheme: "blue",
                iconUrl: app.icon_path ? `/storage/${app.icon_path}` : null,
                screenshots: (app.screenshots || []).map(item => ({
                    id: String(item.id),
                    url: `/storage/${item.image_path}`,
                    caption: item.caption || ""
                })),
                tags: app.pending_changes?.tags || (app.tags || []).map(tag => tag.name),
                downloads: app.downloads_count || 0,
                rating: parseFloat(app.average_rating) || parseFloat(app.rating) || 0,
                github: app.pending_changes?.attributes?.repository_url ?? app.repository_url ?? "",
                demo: app.pending_changes?.attributes?.demo_url ?? app.demo_url ?? "",
                installCommand: app.pending_changes?.release?.install_command ?? app.latest_release?.install_command ?? "",
                status: app.pending_changes ? "pending" : app.status,
                submissionDate: app.submitted_at || app.created_at,
                updatedAt: app.updated_at || app.created_at,
                isDeletionRequested: app.is_deletion_requested || false,
                deletionReason: app.deletion_reason || "",
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
            }));
            state.logs = activityPayload.map(item => ({
                time: item.time ? new Date(item.time).toLocaleString() : "—",
                user: item.admin,
                action: item.action.replaceAll("_", " ").replace(/\b\w/g, letter => letter.toUpperCase()),
                target: item.note ? `${item.target} — ${item.note}` : item.target,
                status: item.action === "rejected_app" || item.action === "deleted_app" ? "Rejected" : "Approved"
            }));
            renderAdminModeration();
        } catch (error) {
            showToast(error.message, "danger");
        }
    }

    function renderAdminModeration() {
        const queueTableBody = document.getElementById("adminQueueTableBody");
        if (!queueTableBody) return;

        queueTableBody.innerHTML = "";

        const pendingApps = state.apps.filter(a => a.status === "pending");
        document.getElementById("adminQueueCount").textContent = `${pendingApps.length} Pending Review`;

        if (pendingApps.length === 0) {
            queueTableBody.innerHTML = `<tr><td colspan="6" style="padding: 24px; text-align: center; color: var(--text-secondary);">Approval queue is empty.</td></tr>`;
        } else {
            pendingApps.forEach(app => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td style="font-weight:600; display:flex; align-items:center; gap:10px;">
                        ${app.iconUrl
                            ? `<img src="${app.iconUrl}" alt="" style="width:34px;height:34px;border-radius:8px;object-fit:cover;">`
                            : `<div style="width:34px;height:34px;border-radius:8px;background:${iconGradients[app.iconTheme]};display:flex;align-items:center;justify-content:center;color:white;font-size:14px;font-weight:800;">${app.name.charAt(0)}</div>`}
                        <div>
                            <div>${app.name}</div>
                            <small style="font-weight:400; color:var(--text-secondary); display:block; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${app.tagline}</small>
                        </div>
                    </td>
                    <td>${app.developer}</td>
                    <td>${app.category}</td>
                    <td>
                        <div style="display:flex; gap:6px;">
                            ${app.github ? `<a href="${app.github}" target="_blank" style="color:var(--accent); font-weight:600;">GitHub</a>` : ""}
                            ${app.demo ? `<a href="${app.demo}" target="_blank" style="color:var(--accent); font-weight:600;">Demo</a>` : ""}
                        </div>
                    </td>
                    <td>${app.submissionDate}</td>
                    <td>
                        <div style="display:flex; gap:8px;">
                            <button class="btn-secondary" style="font-size:11px; padding:4px 8px;" data-action="review" data-id="${app.id}">View / Edit</button>
                        </div>
                    </td>
                `;

                tr.querySelector('[data-action="review"]').addEventListener("click", () => openAdminReview(app.id));

                queueTableBody.appendChild(tr);
            });
        }

        // Admin Deletion Requests
        const deletionTableBody = document.getElementById("adminDeletionTableBody");
        const deletionCount = document.getElementById("adminDeletionCount");
        if (deletionTableBody && deletionCount) {
            deletionTableBody.innerHTML = "";
            const deletionRequests = state.apps.filter(a => a.isDeletionRequested);
            deletionCount.textContent = `${deletionRequests.length} Pending`;
            
            if (deletionRequests.length === 0) {
                deletionTableBody.innerHTML = `<tr><td colspan="5" style="padding: 24px; text-align: center; color: var(--text-secondary);">No deletion requests pending.</td></tr>`;
            } else {
                deletionRequests.forEach(app => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td><strong>${app.name}</strong><br><small style="color:var(--text-secondary)">v${app.version}</small></td>
                        <td>${app.developer}</td>
                        <td style="max-width:300px;white-space:normal;color:var(--text-secondary);font-size:13px;">${app.deletionReason}</td>
                        <td>${new Date(app.updatedAt).toLocaleDateString()}</td>
                        <td>
                            <div style="display:flex;gap:8px;">
                                <button class="btn-secondary" style="font-size:11px;padding:4px 8px;" data-action="approve-deletion" data-id="${app.id}">Approve</button>
                                <button class="btn-secondary" style="font-size:11px;padding:4px 8px;color:var(--danger);" data-action="reject-deletion" data-id="${app.id}">Reject</button>
                            </div>
                        </td>
                    `;
                    tr.querySelector('[data-action="approve-deletion"]').addEventListener("click", () => window.handleAdminDeletionReview(app.id, 'approve'));
                    tr.querySelector('[data-action="reject-deletion"]').addEventListener("click", () => window.handleAdminDeletionReview(app.id, 'reject'));
                    deletionTableBody.appendChild(tr);
                });
            }
        }

        const logsTableBody = document.getElementById("adminLogsTableBody");
        if (!logsTableBody) return;

        logsTableBody.innerHTML = "";

        state.logs.forEach(log => {
            const tr = document.createElement("tr");
            let badgeClass = "approved";
            if (log.status === "Pending") badgeClass = "pending";
            if (log.status === "Failed" || log.status === "Rejected") badgeClass = "rejected";

            tr.innerHTML = `
                <td style="color:var(--text-secondary); font-family:monospace;">${log.time}</td>
                <td style="font-weight:600;">${log.user}</td>
                <td>${log.action}</td>
                <td>${log.target}</td>
                <td><span class="status-badge ${badgeClass}">${log.status}</span></td>
            `;
            logsTableBody.appendChild(tr);
        });

        renderAdminAppManagement();
    }

    function renderAdminAppManagement() {
        const tableBody = document.getElementById("adminAppsTableBody");
        const count = document.getElementById("adminAppsCount");
        if (!tableBody) return;
        const approvedApps = state.apps.filter(app => app.status === "approved");
        if (count) count.textContent = `${approvedApps.length} Approved`;
        tableBody.innerHTML = approvedApps.length ? "" : `<tr><td colspan="6" style="text-align:center;padding:24px;">No approved apps found.</td></tr>`;

        approvedApps.forEach(app => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><strong>${app.name}</strong><small style="display:block;color:var(--text-secondary);">${app.tagline}</small></td>
                <td>${app.developer}</td><td>${app.category}</td>
                <td><span class="status-badge ${app.status}">${app.status.toUpperCase()}</span></td>
                <td>${app.updatedAt ? new Date(app.updatedAt).toLocaleString() : "—"}</td>
                <td><div style="display:flex;gap:8px;"><button class="btn-secondary" data-manage-edit="${app.id}" style="padding:4px 8px;font-size:11px;">View / Edit</button><button class="btn-secondary" data-manage-delete="${app.id}" style="padding:4px 8px;font-size:11px;color:var(--danger);">Delete</button></div></td>`;
            row.querySelector("[data-manage-edit]").addEventListener("click", () => openAdminReview(app.id));
            row.querySelector("[data-manage-delete]").addEventListener("click", () => deleteAdminApp(app));
            tableBody.appendChild(row);
        });
    }

    async function deleteAdminApp(app) {
        if (!window.confirm(`Remove "${app.name}" from the marketplace? The database record and uploaded files will be retained for recovery.`)) return;
        try {
            const result = await adminAppRequest(app.id, "", "DELETE", { note: "Removed from the All Apps management table." });
            closeAdminReview();
            await loadAdminPendingApps();
            showToast(result.message, "success");
        } catch (error) { showToast(error.message, "danger"); }
    }

    // RENDER REST API Reference
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
                executeMockApiCall(index);
            });

            container.appendChild(card);
        });
    }

    // -----------------------------------------
    // 8. Event Handler Support Functions
    // -----------------------------------------

    function openAdminReview(appId) {
        const app = state.apps.find(item => item.id === appId);
        const modal = document.getElementById("adminReviewModal");
        if (!app || !modal) return;
        document.getElementById("adminReviewAppId").value = app.id;
        document.getElementById("adminReviewTitle").textContent = `Review ${app.name}`;
        document.getElementById("adminReviewMeta").textContent = `${app.developer}${app.developerEmail ? ` (${app.developerEmail})` : ""} · Version ${app.version} · Submitted ${app.submissionDate}`;
        document.getElementById("adminEditName").value = app.name;
        document.getElementById("adminEditCategory").value = app.category;
        document.getElementById("adminEditTagline").value = app.tagline;
        document.getElementById("adminEditDescription").value = app.description;
        document.getElementById("adminEditRepository").value = app.github;
        document.getElementById("adminEditDemo").value = app.demo;
        document.getElementById("adminEditLicense").value = app.license === "—" ? "" : app.license;
        document.getElementById("adminEditLanguage").value = app.primaryLanguage;
        document.getElementById("adminEditVersion").value = app.version === "—" ? "" : app.version;
        document.getElementById("adminEditSize").value = app.size === "—" ? "" : app.size;
        if (document.getElementById("adminEditInstall")) document.getElementById("adminEditInstall").value = app.installCommand || "";
        document.getElementById("adminEditDownloadUrl").value = app.downloadUrl || "";
        document.getElementById("adminEditTags").value = app.tags.join(", ");
        const screenshotContainer = document.getElementById("adminReviewScreenshots");
        screenshotContainer.innerHTML = app.screenshots.length
            ? app.screenshots.map((screenshot, index) => `<div class="screenshot-sortable" draggable="true" data-screenshot-id="${screenshot.id}" title="Drag to reorder"><a href="${screenshot.url}" target="_blank" rel="noopener"><img src="${screenshot.url}" alt="Submitted app image" style="width:150px;height:90px;object-fit:cover;border-radius:8px;border:1px solid var(--border-color);"></a>${index === 0 ? '<small style="display:block;color:var(--accent);font-weight:700;margin-top:4px;">Cover</small>' : ''}</div>`).join("")
            : `<small style="color:var(--text-secondary)">No images submitted.</small>`;
        document.getElementById("adminScreenshotHint").style.display = app.screenshots.length > 1 ? "block" : "none";
        if (app.screenshots.length > 1) enableAdminScreenshotSorting(screenshotContainer, app);
        document.getElementById("adminRejectReason").value = "";
        document.getElementById("adminApproveBtn").style.display = app.status === "pending" ? "inline-flex" : "none";
        document.getElementById("adminRejectBtn").style.display = app.status === "pending" ? "inline-flex" : "none";
        document.getElementById("adminRejectReason").closest(".form-group").style.display = app.status === "pending" ? "block" : "none";
        modal.style.display = "flex";
    }

    function closeAdminReview() {
        const modal = document.getElementById("adminReviewModal");
        if (modal) modal.style.display = "none";
    }

    function enableAdminScreenshotSorting(container, app) {
        let draggedItem = null;
        container.querySelectorAll(".screenshot-sortable").forEach(item => {
            item.addEventListener("dragstart", event => {
                draggedItem = item;
                item.classList.add("dragging");
                event.dataTransfer.effectAllowed = "move";
            });
            item.addEventListener("dragend", () => {
                item.classList.remove("dragging");
                container.querySelectorAll(".drag-over").forEach(node => node.classList.remove("drag-over"));
            });
            item.addEventListener("dragover", event => {
                event.preventDefault();
                if (!draggedItem || draggedItem === item) return;
                item.classList.add("drag-over");
                const box = item.getBoundingClientRect();
                container.insertBefore(draggedItem, event.clientX < box.left + box.width / 2 ? item : item.nextSibling);
            });
            item.addEventListener("dragleave", () => item.classList.remove("drag-over"));
            item.addEventListener("drop", async event => {
                event.preventDefault();
                item.classList.remove("drag-over");
                const ids = Array.from(container.querySelectorAll("[data-screenshot-id]")).map(node => node.dataset.screenshotId);
                const oldIds = app.screenshots.map(screenshot => screenshot.id);
                if (ids.join(",") === oldIds.join(",")) return;
                try {
                    const result = await adminAppRequest(app.id, "screenshots/reorder", "PUT", { screenshot_ids: ids.map(Number) });
                    app.screenshots = ids.map(id => app.screenshots.find(screenshot => screenshot.id === id));
                    openAdminReview(app.id);
                    showToast(result.message, "success");
                } catch (error) {
                    openAdminReview(app.id);
                    showToast(error.message, "danger");
                }
            });
        });
    }

    async function adminAppRequest(appId, action, method = "POST", payload = {}) {
        const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
        const response = await fetch(`/api/admin/apps/${appId}${action ? `/${action}` : ""}`, {
            method,
            headers: { "Accept": "application/json", "Content-Type": "application/json", "X-CSRF-TOKEN": csrf },
            body: JSON.stringify(payload)
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.message || "The request could not be completed.");
        return result;
    }

    document.getElementById("closeAdminReview")?.addEventListener("click", closeAdminReview);
    document.getElementById("adminReviewModal")?.addEventListener("click", event => {
        if (event.target.id === "adminReviewModal") closeAdminReview();
    });
    document.getElementById("adminReviewForm")?.addEventListener("submit", async event => {
        event.preventDefault();
        const appId = document.getElementById("adminReviewAppId").value;
        const app = state.apps.find(item => item.id === appId);
        const payload = {
            category_id: app?.categoryId,
            name: document.getElementById("adminEditName").value.trim(),
            tagline: document.getElementById("adminEditTagline").value.trim() || null,
            description: document.getElementById("adminEditDescription").value.trim() || null,
            repository_url: document.getElementById("adminEditRepository").value.trim() || null,
            demo_url: document.getElementById("adminEditDemo").value.trim() || null,
            license: document.getElementById("adminEditLicense").value.trim() || null,
            primary_language: document.getElementById("adminEditLanguage").value.trim() || null,
            version: document.getElementById("adminEditVersion").value.trim() || null,
            install_command: document.getElementById("adminEditInstall")?.value.trim() || null,
            size_bytes: parseFileSize(document.getElementById("adminEditSize").value),
            download_url: document.getElementById("adminEditDownloadUrl").value.trim() || null,
            tags: document.getElementById("adminEditTags").value.split(",").map(tag => tag.trim()).filter(Boolean)
        };
        try {
            const result = await adminAppRequest(appId, "", "PUT", payload);
            Object.assign(app, { name: payload.name, tagline: payload.tagline || "", description: payload.description || "", github: payload.repository_url || "", demo: payload.demo_url || "", license: payload.license || "—", primaryLanguage: payload.primary_language || "", version: payload.version || "—", size: formatBytes(payload.size_bytes), downloadUrl: payload.download_url || "", installCommand: payload.install_command || "", tags: payload.tags });
            document.getElementById("adminReviewTitle").textContent = `Review ${app.name}`;
            renderAdminModeration();
            showToast(result.message, "success");
        } catch (error) { showToast(error.message, "danger"); }
    });
    document.getElementById("adminApproveBtn")?.addEventListener("click", () => handleAdminApproval(document.getElementById("adminReviewAppId").value, true));
    document.getElementById("adminRejectBtn")?.addEventListener("click", () => handleAdminApproval(document.getElementById("adminReviewAppId").value, false, document.getElementById("adminRejectReason").value.trim()));

    async function handleAdminApproval(appId, isApproved, note = "") {
        const app = state.apps.find(a => a.id === appId);
        if (!app) return;

        if (serverAuthMode && currentPage === "admin") {
            const action = isApproved ? "approve" : "reject";
            if (!isApproved && !note) {
                showToast("Please enter a rejection reason before rejecting this app.", "danger");
                document.getElementById("adminRejectReason")?.focus();
                return;
            }
            try {
                const result = await adminAppRequest(appId, action, "POST", { note });
                closeAdminReview();
                await loadAdminPendingApps();
                showToast(result.message, "success");
            } catch (error) {
                showToast(error.message, "danger");
            }
            return;
        }

        if (isApproved) {
            app.status = "approved";
            showToast(`Approved "${app.name}" for public distribution!`, "success");
            logActivity("Admin Officer", "Approved app submission", app.name, "Approved");
        } else {
            app.status = "rejected";
            showToast(`Rejected app submission "${app.name}".`, "danger");
            logActivity("Admin Officer", "Rejected app submission", app.name, "Rejected");
        }

        renderHomeView();
        renderDiscoverAppGrid(globalSearch.value, "all");
        renderDeveloperConsole();
        renderAdminModeration();

        if (state.activeTab === "developer") {
            initDeveloperCharts();
        }
    }

    function executeMockApiCall(apiIndex) {
        const api = state.apiEndpoints[apiIndex];
        const resBox = document.getElementById(`api-res-${apiIndex}`);
        resBox.textContent = "Loading HTTP query packet...\nHost: api.appex.dev";
        resBox.style.color = "var(--text-secondary)";

        setTimeout(() => {
            const args = {};
            api.params.forEach(p => {
                const node = document.getElementById(`api-in-${apiIndex}-${p.name}`);
                if (node) args[p.name] = node.value;
            });

            const responseData = api.mockResponse(args);
            resBox.textContent = `HTTP/1.1 200 OK\n\n` + JSON.stringify(responseData, null, 4);
            resBox.style.color = "#10b981";
            
            showToast(`API call finished`, "success");
            logActivity("Developer Client", `API Call: ${api.method} ${api.path}`, "REST API Hub", "Success");
            renderAdminModeration();
        }, 750);
    }

    async function triggerAppDownload(appId, buttonNode) {
        if (state.currentRole === "visitor") {
            window.openUserAuthModal();
            return;
        }
        if (state.currentRole !== "user") {
            showToast("This action is available only to app users.", "warning");
            return;
        }
        const app = state.apps.find(a => a.id === appId);
        if (!app) return;

        if (buttonNode.classList.contains("downloading")) return;

        buttonNode.classList.add("downloading");
        buttonNode.style.pointerEvents = "none";
        const oldLabel = buttonNode.textContent;
        buttonNode.textContent = "STARTING…";

        try {
            const response = await fetch(`/api/apps/${encodeURIComponent(app.id)}/download`, {
                method: "POST",
                headers: { "Accept": "application/json", "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content || "" }
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.message || "The download could not be started.");

            app.downloads = result.downloads_count;
            renderDeveloperConsole();

            if (currentPage === "developer") {
                const today = new Date().toISOString().slice(0, 10);
                const todayTrend = state.downloadTrend.find(item => item.date === today);
                if (todayTrend) todayTrend.count = Number(todayTrend.count || 0) + 1;
                initDeveloperCharts();
            }
            const link = document.createElement("a");
            link.href = result.download_url;
            link.download = result.filename || "";
            link.target = "_blank";
            link.rel = "noopener";
            document.body.appendChild(link);
            link.click();
            link.remove();
            showToast(`Starting download for "${app.name}".`, "success");

            const detailsCountNode = document.getElementById("detailDownloadsCount");
            if (detailsCountNode && state.activeAppId === appId) detailsCountNode.textContent = `${app.downloads.toLocaleString()} downloads`;
        } catch (error) {
            showToast(error.message, "danger");
        } finally {
            buttonNode.textContent = oldLabel;
            buttonNode.classList.remove("downloading");
            buttonNode.style.pointerEvents = "auto";
        }
    }

    // -----------------------------------------
    // 9. Slide-out App Details Drawer Engine
    // -----------------------------------------
    const drawer = document.getElementById("appDetailsDrawer");
    const drawerOverlay = document.getElementById("drawerOverlay");
    const closeDrawerBtn = document.getElementById("closeDrawerBtn");

    closeDrawerBtn?.addEventListener("click", closeAppDetailsDrawer);
    drawerOverlay?.addEventListener("click", closeAppDetailsDrawer);

    window.openAppDetailsDrawer = async function(appId) {
        state.activeAppId = appId;
        let app = state.apps.find(a => a.id === appId);
        if (!app) return;

        // 1. Render immediately from local state (snappy UI)
        renderDrawerContent(app);

        // 2. Fetch full fresh details from the server asynchronously
        try {
            const response = await fetch(`/api/apps/${encodeURIComponent(app.id)}`);
            if (response.ok) {
                const appData = await response.json();
                const mapped = mapMarketplaceApp(appData);
                mapped.id = app.id;
                mapped.databaseId = app.databaseId || app.id;
                
                // Update in state
                const idx = state.apps.findIndex(a => a.id === appId);
                if (idx !== -1) {
                    state.apps[idx] = { ...state.apps[idx], ...mapped };
                }
                
                // Re-render only if this app is still open in the drawer!
                if (state.activeAppId === appId) {
                    renderDrawerContent(mapped);
                }
            }
        } catch (e) {
            console.error("Failed to load detailed app data", e);
        }
    };

    function renderDrawerContent(app) {
        document.getElementById("detailAppCategory").textContent = app.category.toUpperCase();
        
        const iconNode = document.getElementById("detailAppIcon");
        iconNode.src = appIconUrl(app);
        iconNode.alt = `${app.name} icon`;
        iconNode.style.background = "transparent";
        iconNode.style.objectFit = "cover";

        document.getElementById("detailAppName").textContent = app.name;
        document.getElementById("detailAppDeveloper").textContent = `by ${app.developer}`;
        
        const tagsNode = document.getElementById("detailAppTags");
        tagsNode.innerHTML = app.tags.map(t => `<span class="badge">#${t}</span>`).join("");
        
        const getBtn = document.getElementById("detailGetBtn");
        getBtn.textContent = "GET";
        getBtn.className = "btn-get";
        getBtn.style.backgroundColor = "";
        getBtn.style.color = "";
        getBtn.style.pointerEvents = "auto";
        getBtn.onclick = () => triggerAppDownload(app.id, getBtn);

        const wishlistBtn = document.getElementById("detailWishlistBtn");
        if (wishlistBtn) {
            wishlistBtn.textContent = "Save";
            wishlistBtn.onclick = async () => {
                try {
                    wishlistBtn.disabled = true;
                    wishlistBtn.textContent = "...";
                    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
                    const appId = app.databaseId || app.id;

                    if (!csrfToken || !appId) {
                        throw new Error("Unable to save this app right now.");
                    }

                    const res = await fetch('/wishlist/toggle', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                        body: JSON.stringify({ app_id: appId })
                    });
                    const data = await res.json().catch(() => ({}));

                    if (!res.ok) {
                        throw new Error(data.message || "Unable to update wishlist.");
                    }

                    wishlistBtn.textContent = data.status === 'added' ? 'Saved!' : 'Save';
                    showToast(data.status === 'added' ? "App saved to wishlist." : "App removed from wishlist.", "success");
                } catch (error) {
                    wishlistBtn.textContent = "Save";
                    showToast(error.message, "danger");
                } finally {
                    wishlistBtn.disabled = false;
                }
            };
        }

        document.getElementById("detailDownloadsCount").textContent = `${app.downloads.toLocaleString()} downloads`;

        const detailRatingSpan = document.getElementById("detailRatingVal").querySelector("span");
        if (detailRatingSpan) {
            detailRatingSpan.textContent = app.rating > 0 ? app.rating.toFixed(1) : "0.0";
        }
        document.getElementById("detailVersionVal").textContent = app.version;
        document.getElementById("detailSizeVal").textContent = app.size;
        document.getElementById("detailLicenseVal").textContent = app.license;

        document.getElementById("detailDescriptionText").textContent = app.description;

        const techNode = document.getElementById("detailTechStackContainer");
        techNode.innerHTML = app.tags.map(t => `<span class="tech-tag">${t}</span>`).join("");
        document.getElementById("detailInstallGuide").textContent = app.installCommand;

        const releasesNode = document.getElementById("detailReleaseHistory");
        if (releasesNode) {
            const releases = Array.isArray(app.releases) && app.releases.length
                ? app.releases
                : [{ version: app.version, status: app.status, notes: "", date: app.submissionDate }];
            releasesNode.innerHTML = releases.map(release => `
                <div class="release-history-item">
                    <div>
                        <strong>v${release.version}</strong>
                        <span class="status-badge ${release.status}">${String(release.status).toUpperCase()}</span>
                    </div>
                    ${release.notes ? `<p>${release.notes}</p>` : ""}
                </div>
            `).join("");
        }

        const screenNode = document.getElementById("detailScreenshotsContainer");
        const canReorderScreenshots = currentPage === "developer" && Array.isArray(app.screenshots);
        const reorderHint = document.getElementById("screenshotReorderHint");
        if (reorderHint) reorderHint.style.display = canReorderScreenshots && app.screenshots.length > 1 ? "block" : "none";

        if (Array.isArray(app.screenshots) && app.screenshots.length) {
            screenNode.innerHTML = app.screenshots.map((screenshot, index) => `
                <div class="screenshot-sortable" draggable="${canReorderScreenshots}" data-screenshot-id="${screenshot.id}" title="${canReorderScreenshots ? "Drag to reorder" : ""}">
                    <img class="screenshot-item" src="${screenshot.url}" alt="${screenshot.caption || `App image ${index + 1}`}">
                    ${index === 0 ? '<small style="display:block;color:var(--accent);font-weight:700;margin-top:4px;">Cover</small>' : ''}
                </div>
            `).join("");
            if (canReorderScreenshots) enableScreenshotSorting(screenNode, app);
        } else {
            screenNode.innerHTML = `<small style="color:var(--text-secondary);">No images uploaded yet.</small>`;
        }

        renderAppReviewsAndBugs(app);

        drawerOverlay.style.display = "block";
        drawerOverlay.style.opacity = "1";
        drawer.classList.add("open");
    }

    function closeAppDetailsDrawer() {
        drawer.classList.remove("open");
        drawerOverlay.style.opacity = "0";
        setTimeout(() => {
            drawerOverlay.style.display = "none";
        }, 300);
        
        document.getElementById("reviewFormContainer").style.display = "none";
        document.getElementById("bugFormContainer").style.display = "none";
    }

    function enableScreenshotSorting(container, app) {
        let draggedItem = null;

        container.querySelectorAll(".screenshot-sortable").forEach(item => {
            item.addEventListener("dragstart", event => {
                draggedItem = item;
                item.classList.add("dragging");
                event.dataTransfer.effectAllowed = "move";
            });
            item.addEventListener("dragend", () => {
                item.classList.remove("dragging");
                container.querySelectorAll(".drag-over").forEach(node => node.classList.remove("drag-over"));
            });
            item.addEventListener("dragover", event => {
                event.preventDefault();
                if (!draggedItem || draggedItem === item) return;
                item.classList.add("drag-over");
                const box = item.getBoundingClientRect();
                container.insertBefore(draggedItem, event.clientX < box.left + box.width / 2 ? item : item.nextSibling);
            });
            item.addEventListener("dragleave", () => item.classList.remove("drag-over"));
            item.addEventListener("drop", async event => {
                event.preventDefault();
                item.classList.remove("drag-over");
                const ids = Array.from(container.querySelectorAll("[data-screenshot-id]")).map(node => node.dataset.screenshotId);
                await saveScreenshotOrder(app, ids);
            });
        });
    }

    async function saveScreenshotOrder(app, screenshotIds) {
        const previousOrder = app.screenshots.map(item => item.id);
        if (previousOrder.join(",") === screenshotIds.join(",")) return;

        try {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
            const response = await fetch(`/api/developer/apps/${app.id}/screenshots/reorder`, {
                method: "PUT",
                headers: { "Accept": "application/json", "Content-Type": "application/json", "X-CSRF-TOKEN": csrf },
                body: JSON.stringify({ screenshot_ids: screenshotIds.map(Number) })
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.message || "Could not update image order.");
            app.screenshots = screenshotIds.map(id => app.screenshots.find(item => item.id === id));
            window.openAppDetailsDrawer(app.id);
            showToast(result.message, "success");
        } catch (error) {
            window.openAppDetailsDrawer(app.id);
            showToast(error.message, "danger");
        }
    }

    function renderAppReviewsAndBugs(app) {
        const isVisitor = state.currentRole === "visitor";
        const canSubmitUserContent = state.currentRole === "user";
        const drawerReviewsSection = document.getElementById("drawerReviewsSection");
        const drawerBugsSection = document.getElementById("drawerBugsSection");
        const drawerAuthPrompt = document.getElementById("drawerAuthPrompt");
        const reviewButton = document.getElementById("openReviewFormBtn");
        const bugButton = document.getElementById("openBugFormBtn");

        if (drawerReviewsSection) drawerReviewsSection.style.display = "block";
        if (drawerBugsSection) drawerBugsSection.style.display = isVisitor ? "none" : "block";
        if (drawerAuthPrompt) drawerAuthPrompt.style.display = isVisitor ? "block" : "none";
        if (reviewButton) {
            reviewButton.hidden = !canSubmitUserContent;
            reviewButton.style.display = canSubmitUserContent ? "" : "none";
        }
        if (bugButton) {
            bugButton.hidden = !canSubmitUserContent;
            bugButton.style.display = canSubmitUserContent ? "" : "none";
        }

        const ratingNum = app.rating;
        document.getElementById("distAvgNum").textContent = ratingNum > 0 ? ratingNum.toFixed(1) : "0.0";
        document.getElementById("distTotalCount").textContent = `${app.reviews.length} reviews`;

        const distStars = document.getElementById("distAvgStars");
        distStars.innerHTML = "";
        const fullStars = Math.round(ratingNum);
        for (let i = 1; i <= 5; i++) {
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("viewBox", "0 0 24 24");
            svg.style.width = "12px";
            svg.style.height = "12px";
            svg.style.fill = i <= fullStars ? "var(--warning)" : "var(--text-tertiary)";
            svg.innerHTML = `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`;
            distStars.appendChild(svg);
        }

        const barsContainer = document.getElementById("distBarsContainer");
        barsContainer.innerHTML = "";
        const ratingsCount = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        app.reviews.forEach(r => {
            ratingsCount[r.stars] = (ratingsCount[r.stars] || 0) + 1;
        });

        const totalReviews = app.reviews.length || 1;
        for (let star = 5; star >= 1; star--) {
            const percentage = ((ratingsCount[star] || 0) / totalReviews) * 100;
            const row = document.createElement("div");
            row.className = "distribution-row";
            row.innerHTML = `
                <span class="star-num">${star}</span>
                <div class="rating-progress">
                    <div class="rating-progress-bar" style="width: ${percentage}%"></div>
                </div>
            `;
            barsContainer.appendChild(row);
        }

        const commentsContainer = document.getElementById("commentsListContainer");
        commentsContainer.innerHTML = "";

        if (app.reviews.length === 0) {
            commentsContainer.innerHTML = `<div style="text-align: center; padding: 12px 0; color: var(--text-secondary); font-size:12px;">No reviews yet.</div>`;
        } else {
            app.reviews.forEach(rev => {
                const card = document.createElement("div");
                card.className = "comment-card";
                
                let starsSvg = "";
                for (let i = 1; i <= 5; i++) {
                    starsSvg += `<svg viewBox="0 0 24 24" style="width:11px; height:11px; fill:${i <= rev.stars ? 'var(--warning)' : 'var(--text-tertiary)'}"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
                }

                card.innerHTML = `
                    <div class="comment-header">
                        <span class="comment-user">${rev.author}</span>
                        <div class="comment-stars">${starsSvg}</div>
                    </div>
                    <div class="comment-date">${rev.date}</div>
                    <div class="comment-title">${rev.title}</div>
                    <p class="comment-text">${rev.text}</p>
                `;
                commentsContainer.appendChild(card);
            });
        }

        const bugsContainer = document.getElementById("bugsListContainer");
        bugsContainer.innerHTML = "";

        if (app.bugs.length === 0) {
            bugsContainer.innerHTML = `<div style="text-align: center; padding: 12px 0; color: var(--text-secondary); font-size:12px;">No bug reports recorded.</div>`;
        } else {
            app.bugs.forEach(bug => {
                const card = document.createElement("div");
                card.className = "bug-card";
                card.innerHTML = `
                    <div class="bug-header">
                        <div class="bug-title-row">
                            <span class="bug-id">${bug.id}</span>
                            <h4 class="bug-title">${bug.title}</h4>
                        </div>
                        <span class="bug-severity ${bug.severity}">${bug.severity.toUpperCase()}</span>
                    </div>
                    <p class="bug-desc">${bug.desc}</p>
                    <div class="bug-header" style="margin-bottom:0; font-size:11px;">
                        <span class="bug-meta">Affects v${bug.version}</span>
                        <span class="bug-status ${bug.status}">${bug.status.toUpperCase()}</span>
                    </div>
                `;
                bugsContainer.appendChild(card);
            });
        }
    }

    // Helper to reload app details from the server
    async function reloadAppDetails(appId) {
        try {
            const response = await fetch(`/api/apps/${encodeURIComponent(appId)}`);
            if (!response.ok) throw new Error("Failed to load app data.");
            const appData = await response.json();
            const mapped = mapMarketplaceApp(appData);
            
            // Replace in state.apps
            const idx = state.apps.findIndex(a => a.id === appId);
            if (idx !== -1) {
                mapped.id = state.apps[idx].id;
                mapped.databaseId = state.apps[idx].databaseId || state.apps[idx].id;
                state.apps[idx] = { ...state.apps[idx], ...mapped };
            }
            
            // Refresh views
            if (state.activeAppId === appId) {
                renderDrawerContent(mapped);
            }
            renderHomeView();
            renderDiscoverAppGrid(globalSearch.value, "all");
            renderDeveloperConsole();
            renderAdminModeration();
        } catch (error) {
            console.error(error);
        }
    }

    // REVIEW AND BUG SUBMIT HANDLERS
    const openReviewFormBtn = document.getElementById("openReviewFormBtn");
    const reviewFormContainer = document.getElementById("reviewFormContainer");
    const reviewSubmitForm = document.getElementById("reviewSubmitForm");
    const cancelReviewBtn = document.getElementById("cancelReviewBtn");

    openReviewFormBtn?.addEventListener("click", () => {
        if (state.currentRole === "visitor") {
            window.openUserAuthModal();
            return;
        }
        if (state.currentRole !== "user") {
            showToast("Reviews can be submitted only by app users.", "warning");
            return;
        }
        reviewFormContainer.style.display = "block";
        reviewFormContainer.scrollIntoView({ behavior: 'smooth' });
    });

    cancelReviewBtn?.addEventListener("click", () => {
        reviewFormContainer.style.display = "none";
        reviewSubmitForm.reset();
    });

    reviewSubmitForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const app = state.apps.find(a => a.id === state.activeAppId);
        if (!app) return;

        const rating = parseInt(document.getElementById("reviewRatingInput").value);
        const title = document.getElementById("reviewTitleInput").value;
        const comment = document.getElementById("reviewCommentInput").value;

        try {
            const response = await fetch(`/api/apps/${encodeURIComponent(app.databaseId || app.id)}/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content || ""
                },
                body: JSON.stringify({
                    rating: rating,
                    title: title,
                    body: comment
                })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Failed to submit review.");

            showToast("Review submitted successfully!", "success");

            await reloadAppDetails(app.id);

            reviewFormContainer.style.display = "none";
            reviewSubmitForm.reset();
        } catch (error) {
            showToast(error.message, "danger");
        }
    });

    const openBugFormBtn = document.getElementById("openBugFormBtn");
    const bugFormContainer = document.getElementById("bugFormContainer");
    const bugSubmitForm = document.getElementById("bugSubmitForm");
    const cancelBugBtn = document.getElementById("cancelBugBtn");

    openBugFormBtn?.addEventListener("click", () => {
        if (state.currentRole === "visitor") {
            window.openUserAuthModal();
            return;
        }
        if (state.currentRole !== "user") {
            showToast("Bug reports can be submitted only by app users.", "warning");
            return;
        }
        bugFormContainer.style.display = "block";
        bugFormContainer.scrollIntoView({ behavior: 'smooth' });
    });

    cancelBugBtn?.addEventListener("click", () => {
        bugFormContainer.style.display = "none";
        bugSubmitForm.reset();
    });

    bugSubmitForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const app = state.apps.find(a => a.id === state.activeAppId);
        if (!app) return;

        const title = document.getElementById("bugTitleInput").value;
        const severity = document.getElementById("bugSeverityInput").value;
        const version = document.getElementById("bugVersionInput").value;
        const desc = document.getElementById("bugDescInput").value;

        try {
            const response = await fetch(`/api/apps/${encodeURIComponent(app.databaseId || app.id)}/bug-reports`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content || ""
                },
                body: JSON.stringify({
                    title: title,
                    severity: severity,
                    environment: { version: version },
                    description: desc
                })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Failed to submit bug report.");

            showToast(`Bug report filed successfully!`, "success");

            await reloadAppDetails(app.id);

            bugFormContainer.style.display = "none";
            bugSubmitForm.reset();
        } catch (error) {
            showToast(error.message, "danger");
        }
    });

    // -----------------------------------------
    // 10. App Publishing Flow (Submit Modal)
    // -----------------------------------------
    const openSubmitModalBtn = document.getElementById("openSubmitModalBtn");
    const submitAppModal = document.getElementById("submitAppModalOverlay");
    const closeSubmitModalBtn = document.getElementById("closeSubmitModalBtn");
    const cancelPublishBtn = document.getElementById("cancelPublishBtn");
    const appPublishForm = document.getElementById("appPublishForm");
    const appCategory = document.getElementById("formAppCategory");
    const newCategoryGroup = document.getElementById("newCategoryGroup");
    const newCategoryInput = document.getElementById("formAppNewCategory");
    const publishSubmitStatus = document.getElementById("publishSubmitStatus");

    const setPublishSubmitStatus = message => {
        if (!publishSubmitStatus) return;
        publishSubmitStatus.style.display = "block";
        publishSubmitStatus.textContent = message;
    };

    const clearPublishSubmitStatus = () => {
        if (!publishSubmitStatus) return;
        publishSubmitStatus.style.display = "none";
        publishSubmitStatus.textContent = "";
    };

    appCategory?.addEventListener("change", () => {
        const isNew = appCategory.value === "__new__";
        if (newCategoryGroup) newCategoryGroup.hidden = !isNew;
        if (newCategoryInput) {
            newCategoryInput.required = isNew;
            if (!isNew) newCategoryInput.value = "";
        }
    });

    openSubmitModalBtn?.addEventListener("click", () => {
        delete appPublishForm.dataset.editingAppId;
        document.getElementById("submitModalTitle").textContent = "Submit Software to Appex";
        appPublishForm.querySelector('button[type="submit"]').textContent = document.body.dataset.page === "admin" ? "Publish Now" : "Submit to Queue";
        window.clearImportedMediaPreview?.();
        submitAppModal.style.display = "flex";
    });

    function openModifyApp(app) {
        if (!submitAppModal || !appPublishForm) return;
        appPublishForm.dataset.editingAppId = app.id;
        document.getElementById("submitModalTitle").textContent = `Modify ${app.name}`;
        appPublishForm.querySelector('button[type="submit"]').textContent = "Save Changes";
        document.getElementById("formAppName").value = app.name;
        document.getElementById("formAppShortDesc").value = app.tagline;
        document.getElementById("formAppDesc").value = app.description;
        document.getElementById("formAppLicense").value = app.license === "—" ? "" : app.license;
        if (document.getElementById("formAppLanguage")) document.getElementById("formAppLanguage").value = app.primaryLanguage || "";
        if (document.getElementById("formAppPlatform")) document.getElementById("formAppPlatform").value = app.platform || "web";
        document.getElementById("formAppGithub").value = app.github;
        document.getElementById("formAppDemo").value = app.demo;
        document.getElementById("formAppInstall").value = app.installCommand || "";
        document.getElementById("formAppSize").value = app.size === "—" ? "" : app.size;
        if (document.getElementById("formAppDownloadUrl")) document.getElementById("formAppDownloadUrl").value = app.downloadUrl || "";
        document.getElementById("formAppTags").value = app.tags.join(", ");
        document.getElementById("formAppVersion").value = app.version === "—" ? "1.0.0" : app.version;
        const matchingCategory = Array.from(appCategory?.options || []).find(option => option.value === app.categorySlug);
        if (matchingCategory) appCategory.value = matchingCategory.value;
        appCategory?.dispatchEvent(new Event("change"));
        submitAppModal.style.display = "flex";
    }

    const closeModal = () => {
        if (!submitAppModal || !appPublishForm) return;
        submitAppModal.style.display = "none";
        appPublishForm.reset();
        window.clearImportedMediaPreview?.();
        clearPublishSubmitStatus();
        delete appPublishForm.dataset.editingAppId;
        document.getElementById("submitModalTitle").textContent = "Submit Software to Appex";
        appPublishForm.querySelector('button[type="submit"]').textContent = "Submit to Queue";
    };

    closeSubmitModalBtn?.addEventListener("click", closeModal);
    cancelPublishBtn?.addEventListener("click", closeModal);
    submitAppModal?.addEventListener("click", event => {
        if (event.target === submitAppModal) closeModal();
    });

    appPublishForm?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("formAppName").value;
        const category = document.getElementById("formAppCategory").value;
        const newCategory = document.getElementById("formAppNewCategory")?.value.trim();
        const tagline = document.getElementById("formAppShortDesc").value;
        const version = document.getElementById("formAppVersion").value;
        const size = document.getElementById("formAppSize").value.trim();
        const license = document.getElementById("formAppLicense").value || "MIT";
        const primaryLanguage = document.getElementById("formAppLanguage")?.value.trim() || "";
        const desc = document.getElementById("formAppDesc").value;
        const install = document.getElementById("formAppInstall").value.trim();
        const downloadUrl = document.getElementById("formAppDownloadUrl")?.value.trim() || "";
        const github = document.getElementById("formAppGithub").value;
        const demo = document.getElementById("formAppDemo").value;
        const platform = document.getElementById("formAppPlatform")?.value || "web";
        const iconTheme = document.getElementById("formAppIconUrl")?.value || "blue";
        const tagsInput = document.getElementById("formAppTags").value;
        const screenshotInput = document.getElementById("formAppScreenshots");
        const iconInput = document.getElementById("formAppIcon");
        
        const tags = tagsInput ? tagsInput.split(",").map(t => t.trim().toLowerCase()) : ["appex", "tool"];

        if (document.body.dataset.page === "admin") {
            const submitButton = appPublishForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            try {
                const response = await fetch('/api/admin/apps', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
                    },
                    body: JSON.stringify({
                        name, category_name: category, tagline, description: desc,
                        repository_url: github || null, demo_url: demo || null,
                        license, version, install_command: install || null,
                        size_bytes: parseFileSize(size), download_url: downloadUrl || null, tags
                    })
                });
                const result = await response.json().catch(() => ({}));
                if (!response.ok) {
                    const validation = result.errors ? Object.values(result.errors).flat().join(' ') : result.message;
                    throw new Error(validation || 'The app could not be published.');
                }
                showToast(result.message || `"${name}" published immediately.`, 'success');
                closeModal();
                window.setTimeout(() => window.location.reload(), 700);
            } catch (error) {
                showToast(error.message, 'danger');
            } finally {
                submitButton.disabled = false;
            }
            return;
        }

        const appId = name.toLowerCase().replace(/[^a-z0-9]/g, "-");

        // The authenticated developer page persists submissions through the Laravel API.
        if (document.body.dataset.page === "developer") {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
            const request = async (url, options = {}) => {
                const response = await fetch(url, {
                    ...options,
                    headers: { "Accept": "application/json", "X-CSRF-TOKEN": csrf, ...(options.headers || {}) }
                });
                const result = await response.json().catch(() => ({}));
                if (!response.ok) {
                    const validation = result.errors ? Object.values(result.errors).flat().join(" ") : result.message;
                    throw new Error(validation || "The submission could not be saved.");
                }
                return result;
            };

            const submitButton = appPublishForm.querySelector('button[type="submit"]');
            const originalSubmitText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = "Submitting...";
            setPublishSubmitStatus("Creating app draft...");
            try {
                const editingAppId = appPublishForm.dataset.editingAppId;
                if (editingAppId) {
                    setPublishSubmitStatus("Saving changes...");
                    const result = await request(`/api/developer/apps/${editingAppId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            name, tagline, description: desc,
                            ...(category === "__new__" ? { category_name: newCategory, category_slug: null } : { category_slug: category }),
                            repository_url: github || null, demo_url: demo || null,
                            license: license || null, primary_language: primaryLanguage || null, platform,
                            version: version || null, install_command: install || null,
                            size_bytes: parseFileSize(size), download_url: downloadUrl || null,
                            tags: tagsInput ? tagsInput.split(",").map(tag => tag.trim()).filter(Boolean) : []
                        })
                    });
                    showToast(result.message || `"${name}" updated successfully.`, "success");
                    closeModal();
                    window.setTimeout(() => window.location.reload(), 700);
                    return;
                }

                const createdApp = await request("/api/developer/apps", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name, tagline, description: desc,
                        ...(category === "__new__" ? { category_name: newCategory } : { category_slug: category }),
                        repository_url: github || null, demo_url: demo || null,
                        license: license || null, primary_language: primaryLanguage || null, platform,
                        tags: tagsInput ? tagsInput.split(",").map(tag => tag.trim()).filter(Boolean) : []
                    })
                });

                if (iconInput?.files[0]) {
                    setPublishSubmitStatus("Uploading app icon...");
                    const iconData = new FormData();
                    iconData.append("icon", iconInput.files[0]);
                    await request(`/api/developer/apps/${createdApp.id}/icon`, { method: "POST", body: iconData });
                }

                setPublishSubmitStatus("Creating release information...");
                await request(`/api/developer/apps/${createdApp.id}/releases`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ version, install_command: install || null, size_bytes: parseFileSize(size), download_url: downloadUrl || null })
                });

                const images = Array.from(screenshotInput?.files || []);
                for (const [index, image] of images.entries()) {
                    setPublishSubmitStatus(`Uploading image ${index + 1} of ${images.length}...`);
                    const formData = new FormData();
                    formData.append("image", image);
                    formData.append("sort_order", index);
                    formData.append("is_cover", index === 0 ? "1" : "0");
                    await request(`/api/developer/apps/${createdApp.id}/screenshots`, { method: "POST", body: formData });
                }

                setPublishSubmitStatus("Submitting to admin review...");
                await request(`/api/developer/apps/${createdApp.id}/submit`, { method: "POST" });
                showToast(`"${name}" and ${screenshotInput?.files.length || 0} image(s) submitted successfully.`, "success");
                closeModal();
                window.setTimeout(() => window.location.reload(), 700);
            } catch (error) {
                showToast(error.message, "danger");
                setPublishSubmitStatus(error.message);
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalSubmitText;
            }
            return;
        }

        if (state.apps.some(a => a.id === appId)) {
            showToast("An app with this name already exists.", "danger");
            return;
        }

        const pad = (n) => String(n).padStart(2, "0");
        const todayStr = `${new Date().getFullYear()}-${pad(new Date().getMonth()+1)}-${pad(new Date().getDate())}`;

        state.apps.push({
            id: appId,
            name: name,
            developer: "Alex Mercer",
            category: category,
            tagline: tagline,
            description: desc,
            version: version,
            size: size,
            license: license,
            iconTheme: iconTheme,
            tags: tags,
            downloads: 0,
            rating: 0.0,
            github: github,
            demo: demo,
            installCommand: install,
            status: "pending",
            submissionDate: todayStr,
            reviews: [],
            bugs: []
        });

        showToast(`"${name}" submitted successfully for approval.`, "success");
        logActivity("Alex Mercer", "Submitted app for moderation", name, "Pending");

        closeModal();
        renderDeveloperConsole();
        renderAdminModeration();
    });

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
    // 12. Chart.js Engine
    // -----------------------------------------
    function initDeveloperCharts() {
        const downloadsCanvas = document.getElementById("downloadsChart");
        const bugsCanvas = document.getElementById("bugsChart");

        if (!downloadsCanvas || !bugsCanvas) return;

        if (typeof Chart === "undefined") {
            drawFallbackDeveloperCharts(downloadsCanvas, bugsCanvas);
            return;
        }

        if (downloadsChartInstance) downloadsChartInstance.destroy();
        if (bugsChartInstance) bugsChartInstance.destroy();

        const isDark = document.documentElement.dataset.theme === "dark";
        const gridColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)";
        const labelColor = isDark ? "#9898a0" : "#5f5f69";

        const ctxDownload = downloadsCanvas.getContext("2d");
        const downloadsData = state.downloadTrend.map(item => Number(item.count || 0));
        const downloadLabels = state.downloadTrend.map(item => item.label);

        downloadsChartInstance = new Chart(ctxDownload, {
            type: 'line',
            data: {
                labels: downloadLabels,
                datasets: [{
                    label: 'Downloads',
                    data: downloadsData,
                    borderColor: '#0071e3',
                    backgroundColor: 'rgba(0, 113, 227, 0.05)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: labelColor } },
                    y: { grid: { color: gridColor }, ticks: { color: labelColor } }
                }
            }
        });

        const ctxBugs = bugsCanvas.getContext("2d");
        let lowBugs = 0, medBugs = 0, highBugs = 0;
        state.apps.forEach(app => {
            app.bugs.forEach(b => {
                if (b.status === "open") {
                    if (b.severity === "low") lowBugs++;
                    else if (b.severity === "medium") medBugs++;
                    else if (b.severity === "high") highBugs++;
                }
            });
        });

        bugsChartInstance = new Chart(ctxBugs, {
            type: 'doughnut',
            data: {
                labels: ['Low', 'Medium', 'High'],
                datasets: [{
                    data: [lowBugs, medBugs, highBugs],
                    backgroundColor: ['#0071e3', '#ff9f0a', '#d83b01'],
                    borderWidth: isDark ? 2 : 1,
                    borderColor: isDark ? "#141416" : "#ffffff",
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: labelColor, boxWidth: 10, font: { size: 10 } }
                    }
                }
            }
        });
    }

    function prepareFallbackCanvas(canvas) {
        const ratio = window.devicePixelRatio || 1;
        const width = Math.max(280, canvas.clientWidth || 600);
        const height = Math.max(180, canvas.clientHeight || 240);
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        const context = canvas.getContext("2d");
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        context.clearRect(0, 0, width, height);
        return { context, width, height };
    }

    function drawFallbackDeveloperCharts(downloadsCanvas, bugsCanvas) {
        const isDark = document.documentElement.dataset.theme === "dark";
        const textColor = isDark ? "#9898a0" : "#5f5f69";
        const gridColor = isDark ? "rgba(255,255,255,.10)" : "rgba(0,0,0,.08)";
        const trend = state.downloadTrend.length
            ? state.downloadTrend
            : Array.from({ length: 7 }, (_, index) => ({ label: `Day ${index + 1}`, count: 0 }));
        const downloadCanvas = prepareFallbackCanvas(downloadsCanvas);
        const ctx = downloadCanvas.context;
        const padding = { left: 36, right: 14, top: 14, bottom: 30 };
        const plotWidth = downloadCanvas.width - padding.left - padding.right;
        const plotHeight = downloadCanvas.height - padding.top - padding.bottom;
        const maxValue = Math.max(1, ...trend.map(item => Number(item.count || 0)));

        ctx.strokeStyle = gridColor;
        ctx.fillStyle = textColor;
        ctx.font = "11px sans-serif";
        ctx.textAlign = "center";
        trend.forEach((item, index) => {
            const x = padding.left + (plotWidth * index / Math.max(1, trend.length - 1));
            ctx.beginPath();
            ctx.moveTo(x, padding.top);
            ctx.lineTo(x, padding.top + plotHeight);
            ctx.stroke();
            ctx.fillText(item.label || "", x, downloadCanvas.height - 8);
        });

        ctx.strokeStyle = "#0071e3";
        ctx.lineWidth = 3;
        ctx.lineJoin = "round";
        ctx.beginPath();
        trend.forEach((item, index) => {
            const x = padding.left + (plotWidth * index / Math.max(1, trend.length - 1));
            const y = padding.top + plotHeight - (Number(item.count || 0) / maxValue * plotHeight);
            index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.stroke();

        const bugCanvas = prepareFallbackCanvas(bugsCanvas);
        const bugCounts = ["low", "medium", "high"].map(severity => state.apps.reduce(
            (total, app) => total + app.bugs.filter(bug => bug.status === "open" && bug.severity === severity).length,
            0
        ));
        const totalBugs = bugCounts.reduce((sum, count) => sum + count, 0);
        const colors = ["#0071e3", "#ff9f0a", "#d83b01"];
        const centerX = bugCanvas.width / 2;
        const centerY = bugCanvas.height / 2 - 10;
        const radius = Math.min(bugCanvas.width, bugCanvas.height) * .28;
        let startAngle = -Math.PI / 2;

        if (totalBugs === 0) {
            bugCanvas.context.strokeStyle = gridColor;
            bugCanvas.context.lineWidth = 18;
            bugCanvas.context.beginPath();
            bugCanvas.context.arc(centerX, centerY, radius, 0, Math.PI * 2);
            bugCanvas.context.stroke();
        } else {
            bugCounts.forEach((count, index) => {
                const endAngle = startAngle + (count / totalBugs * Math.PI * 2);
                bugCanvas.context.strokeStyle = colors[index];
                bugCanvas.context.lineWidth = 18;
                bugCanvas.context.beginPath();
                bugCanvas.context.arc(centerX, centerY, radius, startAngle, endAngle);
                bugCanvas.context.stroke();
                startAngle = endAngle;
            });
        }
        bugCanvas.context.fillStyle = textColor;
        bugCanvas.context.font = "12px sans-serif";
        bugCanvas.context.textAlign = "center";
        bugCanvas.context.fillText(`${totalBugs} open bugs`, centerX, centerY + 4);
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
    // DEVELOPER APP MANAGEMENT MODAL HANDLERS
    // -----------------------------------------
    window.openManageAppModal = async function(appId) {
        state.manageActiveAppId = appId;
        let app = state.apps.find(a => a.id === appId);
        if (!app) return;

        const overlay = document.getElementById("manageAppModalOverlay");
        if (overlay) {
            overlay.style.display = "flex";
            switchManageTab("Downloads");
        }

        // Render initial data from local memory
        renderManageAppContent(app);

        // Fetch fresh details (reviews and bug reports) from the server
        try {
            const response = await fetch(`/api/apps/${encodeURIComponent(app.id)}`);
            if (response.ok) {
                const appData = await response.json();
                const mapped = mapMarketplaceApp(appData);
                mapped.id = app.id;
                mapped.databaseId = app.databaseId || app.id;

                // Update in state
                const idx = state.apps.findIndex(a => a.id === appId);
                if (idx !== -1) {
                    state.apps[idx] = { ...state.apps[idx], ...mapped };
                }

                if (state.manageActiveAppId === appId) {
                    renderManageAppContent(state.apps[idx]);
                }
            }
        } catch (e) {
            console.error("Failed to load analytics data", e);
        }
    };

    window.closeManageAppModal = function() {
        const overlay = document.getElementById("manageAppModalOverlay");
        if (overlay) {
            overlay.style.display = "none";
        }
        state.manageActiveAppId = null;
    };

    function switchManageTab(tabName) {
        const tabs = ["Downloads", "Bugs", "Reviews"];
        tabs.forEach(t => {
            const btn = document.getElementById(`tabManage${t}`);
            const view = document.getElementById(`viewManage${t}`);
            if (t === tabName) {
                btn?.classList.add("active");
                if (btn) {
                    btn.style.color = "var(--accent)";
                    btn.style.borderBottom = "2.5px solid var(--accent)";
                }
                if (view) view.style.display = "block";
            } else {
                btn?.classList.remove("active");
                if (btn) {
                    btn.style.color = "var(--text-secondary)";
                    btn.style.borderBottom = "2.5px solid transparent";
                }
                if (view) view.style.display = "none";
            }
        });
    }

    function renderManageAppContent(app) {
        document.getElementById("manageAppModalSubtitle").textContent = `${app.name} — Version ${app.version}`;
        document.getElementById("manageDownloadsCount").textContent = app.downloads.toLocaleString();

        // Render bugs list
        const bugsList = document.getElementById("manageBugsList");
        if (bugsList) {
            bugsList.innerHTML = "";
            if (app.bugs.length === 0) {
                bugsList.innerHTML = `<div style="text-align: center; padding: 24px; color: var(--text-secondary); font-size: 13px;">No bug reports reported.</div>`;
            } else {
                app.bugs.forEach(bug => {
                    const isResolved = bug.status === "resolved" || bug.status === "closed";
                    const card = document.createElement("div");
                    card.className = "analytics-card";
                    card.innerHTML = `
                        <div class="analytics-card-header">
                            <div>
                                <span class="bug-id" style="font-size: 11px; font-weight: 700; color: var(--accent);">${bug.id}</span>
                                <h4 class="analytics-card-title">${bug.title}</h4>
                            </div>
                            <span class="bug-status ${bug.status}" style="font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 700; text-transform: uppercase;">${bug.status}</span>
                        </div>
                        <p class="analytics-card-desc">${bug.desc}</p>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; font-size: 12px; color: var(--text-secondary);">
                            <span>Affects v${bug.version} • Severity: <span class="bug-severity ${bug.severity}" style="font-weight: 700; text-transform: uppercase;">${bug.severity}</span></span>
                            ${!isResolved ? `<button type="button" class="btn-primary" data-resolve-bug="${bug.dbId}" style="padding: 4px 10px; font-size: 11px; border-radius: 6px;">Mark Resolved</button>` : ""}
                        </div>
                    `;
                    card.querySelector("[data-resolve-bug]")?.addEventListener("click", async () => {
                        try {
                            const res = await fetch(`/api/developer/apps/${app.databaseId || app.id}/bugs/${bug.dbId}/status`, {
                                method: "PUT",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Accept": "application/json",
                                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content || ""
                                },
                                body: JSON.stringify({ status: "resolved" })
                            });
                            if (!res.ok) throw new Error("Could not update bug status.");
                            showToast("Bug marked as resolved!", "success");
                            // Reload details in modal
                            await openManageAppModal(app.id);
                            // Refresh developer dashboard UI
                            loadDeveloperApps();
                        } catch (err) {
                            showToast(err.message, "danger");
                        }
                    });
                    bugsList.appendChild(card);
                });
            }
        }

        // Render reviews list
        const reviewsList = document.getElementById("manageReviewsList");
        if (reviewsList) {
            reviewsList.innerHTML = "";
            if (app.reviews.length === 0) {
                reviewsList.innerHTML = `<div style="text-align: center; padding: 24px; color: var(--text-secondary); font-size: 13px;">No reviews recorded.</div>`;
            } else {
                app.reviews.forEach(rev => {
                    let starsSvg = "";
                    for (let i = 1; i <= 5; i++) {
                        starsSvg += `<svg viewBox="0 0 24 24" style="width:12px; height:12px; fill:${i <= rev.stars ? 'var(--warning)' : 'var(--text-tertiary)'}"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
                    }
                    const card = document.createElement("div");
                    card.className = "analytics-card";
                    card.innerHTML = `
                        <div class="analytics-card-header">
                            <div>
                                <span style="font-size: 12px; font-weight: 600; color: var(--text-secondary);">${rev.author}</span>
                                <h4 class="analytics-card-title">${rev.title}</h4>
                            </div>
                            <div style="display: flex; gap: 2px;">${starsSvg}</div>
                        </div>
                        <p class="analytics-card-desc">${rev.text}</p>
                        <div style="font-size: 11px; color: var(--text-secondary); text-align: right; margin-top: 4px;">
                            Published on ${rev.date}
                        </div>
                    `;
                    reviewsList.appendChild(card);
                });
            }
        }
    }

    // Bind event listeners for developer analytics modal tabs
    document.getElementById("tabManageDownloads")?.addEventListener("click", () => switchManageTab("Downloads"));
    document.getElementById("tabManageBugs")?.addEventListener("click", () => switchManageTab("Bugs"));
    document.getElementById("tabManageReviews")?.addEventListener("click", () => switchManageTab("Reviews"));
    document.getElementById("closeManageAppModalBtn")?.addEventListener("click", window.closeManageAppModal);
    document.getElementById("manageAppModalOverlay")?.addEventListener("click", (e) => {
        if (e.target === document.getElementById("manageAppModalOverlay")) {
            window.closeManageAppModal();
        }
    });
    // App Deletion Handlers
    window.openDeleteAppModal = function(app) {
        document.getElementById("deleteAppId").value = app.databaseId || app.id;
        document.getElementById("deleteAppName").textContent = app.name;
        document.getElementById("deleteAppReason").value = "";
        
        if (app.status === "approved") {
            document.getElementById("deleteAppReasonContainer").style.display = "block";
            document.getElementById("deleteAppWarning").textContent = "Deleting an approved app requires admin review.";
        } else {
            document.getElementById("deleteAppReasonContainer").style.display = "none";
            document.getElementById("deleteAppWarning").textContent = "This will immediately delete the app.";
        }
        
        document.getElementById("deleteAppModalOverlay").style.display = "flex";
    };

    document.getElementById("closeDeleteAppModalBtn")?.addEventListener("click", () => {
        document.getElementById("deleteAppModalOverlay").style.display = "none";
    });
    document.getElementById("cancelDeleteAppBtn")?.addEventListener("click", () => {
        document.getElementById("deleteAppModalOverlay").style.display = "none";
    });

    document.getElementById("confirmDeleteAppBtn")?.addEventListener("click", async () => {
        const appId = document.getElementById("deleteAppId").value;
        const reason = document.getElementById("deleteAppReason").value;
        const app = state.apps.find(a => String(a.databaseId || a.id) === String(appId));
        
        if (app?.status === "approved" && !reason.trim()) {
            showToast("Please provide a reason for deletion.", "danger");
            return;
        }

        try {
            const btn = document.getElementById("confirmDeleteAppBtn");
            const originalText = btn.textContent;
            btn.textContent = "Deleting...";
            btn.disabled = true;

            const deleteApp = csrfToken => fetch(`/api/developer/apps/${encodeURIComponent(appId)}`, {
                method: "DELETE",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-CSRF-TOKEN": csrfToken
                },
                body: JSON.stringify({ reason })
            });

            let csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || "";
            let response = await deleteApp(csrfToken);

            // The dashboard can remain open past a session/token rotation. Refresh once on 419.
            if (response.status === 419) {
                const tokenResponse = await fetch('/csrf-token', {
                    credentials: "same-origin",
                    headers: { "Accept": "application/json" }
                });
                const tokenData = await tokenResponse.json().catch(() => ({}));
                if (tokenResponse.ok && tokenData.token) {
                    csrfToken = tokenData.token;
                    document.querySelector('meta[name="csrf-token"]')?.setAttribute("content", csrfToken);
                    response = await deleteApp(csrfToken);
                }
            }

            const data = await response.json().catch(() => ({}));
            if (response.status === 404) {
                await loadDeveloperApps();
                throw new Error("This app is already deleted or no longer belongs to your developer account.");
            }
            if (!response.ok) throw new Error(data.message || "Failed to delete app.");

            showToast(data.message, "success");
            document.getElementById("deleteAppModalOverlay").style.display = "none";
            await loadDeveloperApps();
        } catch (error) {
            showToast(error.message, "danger");
        } finally {
            const btn = document.getElementById("confirmDeleteAppBtn");
            btn.textContent = "Delete App";
            btn.disabled = false;
        }
    });

    window.handleAdminDeletionReview = async function(appId, action) {
        if (!window.confirm(`Are you sure you want to ${action} this deletion request?`)) return;

        try {
            const response = await fetch(`/api/admin/apps/${appId}/${action}-deletion`, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${state.token}`,
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content || ""
                }
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || `Failed to ${action} deletion.`);

            showToast(data.message, "success");
            await loadAdminPendingApps();
        } catch (error) {
            showToast(error.message, "danger");
        }
    };
});
