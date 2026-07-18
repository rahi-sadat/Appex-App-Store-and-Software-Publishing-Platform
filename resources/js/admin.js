document.addEventListener("DOMContentLoaded", () => {
    const Appex = window.Appex || {};
    const { state, iconGradients } = Appex;
    const showToast = (...args) => Appex.showToast?.(...args);
    const openAdminReview = (...args) => window.Appex?.openAdminReview?.(...args);
    const closeAdminReview = (...args) => window.Appex?.closeAdminReview?.(...args);
    const adminAppRequest = (...args) => window.Appex?.adminAppRequest?.(...args);
    const loadAdminPendingApps = (...args) => window.Appex?.loadAdminPendingApps?.(...args);

    if (!state) return;

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

    window.Appex = {
        ...(window.Appex || {}),
        renderAdminModeration
    };

    if (Appex.currentPage === "admin" && state.apps.length) {
        renderAdminModeration();
    }

    // RENDER REST API Reference
});
