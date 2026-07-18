document.addEventListener("DOMContentLoaded", () => {
    const Appex = window.Appex || {};
    const {
        state,
        iconGradients,
        formatBytes,
        appIconUrl,
        mapMarketplaceApp,
        pageRoutes,
        currentPage,
        serverAuthMode,
        serverAuthName
    } = Appex;
    const globalSearch = document.getElementById("globalAppSearch");
    const showToast = (...args) => Appex.showToast?.(...args);
    const parseFileSize = (...args) => Appex.parseFileSize?.(...args);
    const renderDeveloperConsole = (...args) => window.Appex?.renderDeveloperConsole?.(...args);
    const initDeveloperCharts = (...args) => window.Appex?.initDeveloperCharts?.(...args);
    const renderAdminModeration = (...args) => window.Appex?.renderAdminModeration?.(...args);
    const loadAdminPendingApps = (...args) => window.Appex?.loadAdminPendingApps?.(...args);
    const logActivity = (user, action, target, status = "Success") => {
        state?.logs?.unshift({
            time: new Date().toLocaleString(),
            user,
            action,
            target,
            status
        });
    };
    const switchTab = (tabName, categoryFilter = null) => {
        const target = pageRoutes?.[tabName] || pageRoutes?.discover || "/";
        const url = new URL(target, window.location.origin);

        if (tabName === "discover" && categoryFilter) {
            url.searchParams.set("category", categoryFilter);
        }

        window.location.href = url.pathname + url.search;
    };

    if (!state) return;

    function renderHeroBanner(app) {
        const heroContainer = document.getElementById("heroBannerWidget");
        if (!heroContainer) return;
        if (heroContainer.dataset.activeAppId === app.id && heroContainer.querySelector(".hero-banner-slide")) return;

        // Uploaded media is preferred; the generated fallback needs no network request.
        const bgUrl = app.screenshots?.[0]?.url || appIconUrl(app);

        const slide = document.createElement("div");
        slide.className = "hero-banner-slide";
        slide.dataset.appId = app.id;
        slide.innerHTML = `
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

        slide.querySelector(".btn-hero-get").addEventListener("click", (e) => {
            e.stopPropagation();
            triggerAppDownload(app.id, e.target);
        });

        const previousSlides = heroContainer.querySelectorAll(".hero-banner-slide");
        heroContainer.appendChild(slide);
        heroContainer.dataset.activeAppId = app.id;
        heroContainer.onclick = () => {
            openAppDetailsDrawer(app.id);
        };

        if (previousSlides.length === 0) {
            slide.classList.add("is-active");
            return;
        }

        requestAnimationFrame(() => {
            previousSlides.forEach(node => node.classList.remove("is-active"));
            slide.classList.add("is-active");
        });

        window.setTimeout(() => {
            previousSlides.forEach(node => node.remove());
        }, 850);
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

    function rotateHeroBanner() {
        const approvedApps = state.apps.filter(a => a.status === "approved");
        if (approvedApps.length === 0 || currentPage !== "today") return;

        state.heroIndex = (state.heroIndex + 1) % Math.min(approvedApps.length, 3);
        renderHeroBanner(approvedApps[state.heroIndex]);
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
        renderDiscoverAppGrid(globalSearch?.value || "", "all");
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
            renderDiscoverAppGrid(globalSearch?.value || "", "all");
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

    window.Appex = {
        ...(window.Appex || {}),
        renderHomeView,
        renderDiscoverAppGrid,
        loadPublicApps,
        loadDeveloperApps,
        rotateHeroBanner,
        openAppDetailsDrawer: window.openAppDetailsDrawer,
        triggerAppDownload,
        executeMockApiCall,
        openAdminReview,
        closeAdminReview,
        adminAppRequest,
        logActivity
    };

    if (currentPage === "today") {
        renderHomeView();
        if (!window.__marketplaceApps) loadPublicApps();
        window.setInterval(rotateHeroBanner, 6000);
    }

    if (currentPage === "discover") {
        renderDiscoverAppGrid();
        if (!window.__marketplaceApps) loadPublicApps();
    }

    if (currentPage === "api") {
        window.Appex.renderApiDocs?.();
    }

    window.addEventListener("pageshow", (event) => {
        if (!event.persisted) return;
        if (currentPage === "today" || currentPage === "discover") loadPublicApps();
    });

    // -----------------------------------------
});
