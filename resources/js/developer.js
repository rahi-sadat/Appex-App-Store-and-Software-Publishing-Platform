document.addEventListener("DOMContentLoaded", () => {
    const Appex = window.Appex || {};
    const {
        state,
        iconGradients,
        formatBytes,
        parseFileSize,
        mapMarketplaceApp,
        currentPage
    } = Appex;
    const showToast = (...args) => Appex.showToast?.(...args);
    const renderAdminModeration = (...args) => window.Appex?.renderAdminModeration?.(...args);
    const logActivity = (...args) => window.Appex?.logActivity?.(...args);
    let downloadsChartInstance = null;
    let bugsChartInstance = null;

    if (!state) return;

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
                            window.Appex?.loadDeveloperApps?.();
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
                await window.Appex?.loadDeveloperApps?.();
                throw new Error("This app is already deleted or no longer belongs to your developer account.");
            }
            if (!response.ok) throw new Error(data.message || "Failed to delete app.");

            showToast(data.message, "success");
            document.getElementById("deleteAppModalOverlay").style.display = "none";
            await window.Appex?.loadDeveloperApps?.();
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

    window.Appex = {
        ...(window.Appex || {}),
        renderDeveloperConsole,
        loadAdminPendingApps,
        openModifyApp,
        initDeveloperCharts
    };

    if (currentPage === "developer") {
        window.Appex?.loadDeveloperApps?.();
        initDeveloperCharts();
    }

    if (currentPage === "admin") {
        const queueBody = document.getElementById("adminQueueTableBody");
        const queueCount = document.getElementById("adminQueueCount");
        if (queueBody) {
            queueBody.innerHTML = `<tr><td colspan="6" style="padding:24px;text-align:center;color:var(--text-secondary);">Loading pending applications...</td></tr>`;
        }
        if (queueCount) queueCount.textContent = "Loading reviews...";
        loadAdminPendingApps();
    }
});
