<!doctype html>
<html lang="en" data-theme="light">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Appex - Admin Moderation</title>
    @include('components.theme-loader')
    @vite(['resources/css/app.css', 'resources/css/pages/admin.css', 'resources/js/core.js', 'resources/js/marketplace.js', 'resources/js/developer.js', 'resources/js/admin.js'])
</head>
<body
    data-page="admin"
    data-auth-mode="server"
    data-auth-account="{{ auth()->user()->role }}"
    data-auth-name="{{ auth()->user()->name }}"
    data-auth-role="Administrator"
>
    <div class="app-container">
<header class="site-header">
            <div class="brand-section" id="brandSectionLogo">
                <div class="logo-icon">
                    <span></span>
                </div>
                <span class="brand-name">Appex</span>
            </div>

            <!-- Centralized Search Bar -->
            <div class="header-search">
                <svg viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" stroke-linecap="round" stroke-linejoin="round"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <input type="text" id="globalAppSearch" placeholder="Search apps, packages, scripts..." aria-label="Search apps and components">
            </div>

            <!-- Header Controls Right -->
            <div class="header-controls">
                <nav class="header-nav" aria-label="Main header navigation">
                    <a class="nav-item" href="{{ route('home') }}" data-page-link="today">
                        <svg viewBox="0 0 24 24">
                            <rect x="3" y="4" width="18" height="16" rx="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <line x1="16" y1="2" x2="16" y2="4" stroke-linecap="round" stroke-linejoin="round"/>
                            <line x1="8" y1="2" x2="8" y2="4" stroke-linecap="round" stroke-linejoin="round"/>
                            <line x1="3" y1="10" x2="21" y2="10" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span>Home</span>
                    </a>
                    <a class="nav-item" href="{{ route('discover') }}" data-page-link="discover">
                        <svg viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" stroke-linecap="round" stroke-linejoin="round"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span>Discover</span>
                    </a>
                    <a class="nav-item" href="{{ route('about') }}" data-page-link="about">
                        <svg viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="9" stroke-linecap="round" stroke-linejoin="round"/>
                            <line x1="12" y1="11" x2="12" y2="16" stroke-linecap="round" stroke-linejoin="round"/>
                            <line x1="12" y1="8" x2="12.01" y2="8" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span>About</span>
                    </a>
                    <a class="nav-item active admin-access-nav" href="{{ route('admin.login') }}" data-page-link="admin-login" aria-current="page">
                        <svg viewBox="0 0 24 24">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span class="admin-nav-label">Admin Dashboard</span>
                    </a>
                    @guest
                    <button class="nav-item" id="headerSignInBtn" type="button" style="background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 6px; font-weight: 500;">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke-linecap="round" stroke-linejoin="round"/>
                            <circle cx="12" cy="7" r="4" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span>Sign In</span>
                    </button>
                    @endguest
                </nav>

                @include('components.header-user-actions')

                <button class="theme-toggle-btn" id="themeToggle" type="button" aria-label="Switch theme color mode">
                    <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="5" stroke-linecap="round" stroke-linejoin="round"/>
                        <line x1="12" y1="1" x2="12" y2="3" stroke-linecap="round" stroke-linejoin="round"/>
                        <line x1="12" y1="21" x2="12" y2="23" stroke-linecap="round" stroke-linejoin="round"/>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke-linecap="round" stroke-linejoin="round"/>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke-linecap="round" stroke-linejoin="round"/>
                        <line x1="1" y1="12" x2="3" y2="12" stroke-linecap="round" stroke-linejoin="round"/>
                        <line x1="21" y1="12" x2="23" y2="12" stroke-linecap="round" stroke-linejoin="round"/>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke-linecap="round" stroke-linejoin="round"/>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>

                @include('components.profile-widget')
            </div>
        </header>

        <main class="main-content">
<!-- Admin Moderation Tab Panel -->
            <div class="tab-panel active" id="panel-admin">
                <div class="view-header">
                    <span class="view-date">Safety & Moderation Control</span>
                    <h1 class="view-title">Admin Moderation
                        <button class="btn-primary" id="openSubmitModalBtn" type="button">Publish App</button>
                    </h1>
                </div>

                <div class="console-row">
                    <!-- Approval Queue Panel -->
                    <div class="card-panel" style="margin-bottom: 24px;">
                        <div class="panel-title-row">
                            <h2 class="panel-title">App Review Queue</h2>
                            <span class="badge primary" id="adminQueueCount">2 Pending Review</span>
                        </div>
                        <div class="table-responsive">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Software Info</th>
                                        <th>Developer</th>
                                        <th>Type</th>
                                        <th>Demo Links</th>
                                        <th>Submission Date</th>
                                        <th>Action Required</th>
                                    </tr>
                                </thead>
                                <tbody id="adminQueueTableBody">
                                    <!-- Injected by JS -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Deletion Requests Panel -->
                    <div class="card-panel" style="margin-bottom: 24px;" id="adminDeletionRequestsPanel">
                        <div class="panel-title-row">
                            <h2 class="panel-title">Deletion Requests</h2>
                            <span class="badge" style="background-color: var(--danger); color: white;" id="adminDeletionCount">0 Pending</span>
                        </div>
                        <div class="table-responsive">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>App</th>
                                        <th>Developer</th>
                                        <th>Reason for Deletion</th>
                                        <th>Requested Date</th>
                                        <th>Action Required</th>
                                    </tr>
                                </thead>
                                <tbody id="adminDeletionTableBody">
                                    <!-- Injected by JS -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="card-panel" style="margin-bottom:24px;">
                        <div class="panel-title-row"><h2 class="panel-title">Approved Apps</h2><span class="badge" id="adminAppsCount">0 Approved</span></div>
                        <div class="table-responsive">
                            <table class="data-table">
                                <thead><tr><th>App</th><th>Developer</th><th>Category</th><th>Status</th><th>Updated</th><th>Manage</th></tr></thead>
                                <tbody id="adminAppsTableBody"><tr><td colspan="6">Loading apps...</td></tr></tbody>
                            </table>
                        </div>
                    </div>

                    <!-- System Audit logs and reports -->
                    <div class="card-panel">
                        <div class="panel-title-row">
                            <h2 class="panel-title">Recent Activity Logs</h2>
                        </div>
                        <div class="table-responsive">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Timestamp</th>
                                        <th>User/Admin</th>
                                        <th>Action</th>
                                        <th>Target Entity</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody id="adminLogsTableBody">
                                    <!-- Injected by JS -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </main>

@include('components.site-footer')
    </div>

<!-- App Details Drawer Overlay -->
    <div class="drawer-overlay" id="drawerOverlay"></div>

    <!-- App Details Slide-out Drawer -->
    <div class="drawer" id="appDetailsDrawer" role="dialog" aria-modal="true" aria-labelledby="detailAppName">
        <div class="drawer-header">
            <span class="badge" id="detailAppCategory">Category</span>
            <button class="close-btn" id="closeDrawerBtn" type="button" aria-label="Close details page">
                <svg viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18" stroke-linecap="round" stroke-linejoin="round"/>
                    <line x1="6" y1="6" x2="18" y2="18" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        </div>
        <div class="drawer-body">
            <!-- App Hero Profile -->
            <div class="app-detail-hero">
                <img src="" alt="" class="app-detail-icon" id="detailAppIcon">
                <div class="app-detail-meta">
                    <h2 class="app-detail-title" id="detailAppName">App Name</h2>
                    <p class="app-detail-dev" id="detailAppDeveloper">by Developer</p>
                    <div class="app-detail-badge-row" id="detailAppTags">
                        <!-- Tags injected by JS -->
                    </div>
                    <div class="app-detail-get" style="display: flex; gap: 8px; align-items: center;">
                        <button class="btn-get" id="detailGetBtn" type="button">GET</button>
                        @auth
                            <button class="btn-secondary" id="detailWishlistBtn" type="button" style="border: 1px solid var(--border-color); background: var(--bg-card); padding: 8px 12px; border-radius: 8px; font-weight: 600; cursor: pointer; color: var(--text-primary);">Save</button>
                        @endauth
                        <span class="downloads-stat" id="detailDownloadsCount" style="margin-left: 8px;">0 downloads</span>
                    </div>
                </div>
            </div>

            <!-- App Specifications banner -->
            <div class="app-specs">
                <div class="spec-item">
                    <span class="spec-label">Rating</span>
                    <span class="spec-val spec-rating" id="detailRatingVal">
                        <span>4.8</span>
                        <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">Version</span>
                    <span class="spec-val" id="detailVersionVal">1.0.0</span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">Size</span>
                    <span class="spec-val" id="detailSizeVal">4.2 MB</span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">License</span>
                    <span class="spec-val" id="detailLicenseVal">MIT</span>
                </div>
            </div>

            <!-- App Images Gallery -->
            <div class="detail-section">
                <h3 class="detail-section-title">Images</h3>
                <div class="screenshots-gallery" id="detailScreenshotsContainer">
                    <!-- Images injected by JS -->
                </div>
            </div>

            <!-- About description -->
            <div class="detail-section">
                <h3 class="detail-section-title">Description</h3>
                <p class="detail-text" id="detailDescriptionText">Detailed app description goes here.</p>
            </div>

            <!-- Technical Info / Installation instructions -->
            <div class="detail-section">
                <h3 class="detail-section-title">Installation & Tech Stack</h3>
                <div style="margin-bottom: 12px;" id="detailTechStackContainer">
                    <!-- Tech tags injected by JS -->
                </div>
                <div class="detail-text" style="background-color: var(--bg-main); padding: 14px; border-radius: var(--radius-md); font-family: monospace; font-size: 13px; border: 1px solid var(--border-color);" id="detailInstallGuide">
                    composer require appex/package-name
                </div>
            </div>

            <!-- Sign-in placeholder for guest users -->
            <div id="drawerAuthPrompt" style="display: none; border-top: 1px solid var(--border-color); padding: 24px 0; text-align: center;">
                <p style="color: var(--text-secondary); margin-bottom: 14px; font-size: 14px;">Sign in to download, write reviews, and report bugs. Ratings and existing reviews remain public.</p>
                <button class="btn-primary" id="drawerSignInBtn" style="padding: 8px 16px; font-size: 13px;" type="button">Sign In / Register</button>
            </div>

            <!-- Reviews and ratings section -->
            <div class="detail-section" id="drawerReviewsSection">
                <h3 class="view-title" style="font-size: 16px; margin-bottom: 12px;">
                    <span>Ratings & Reviews</span>
                    <button class="btn-primary" id="openReviewFormBtn" style="display:none" type="button" hidden>Write Review</button>
                </h3>
                
                <div class="rating-distribution">
                    <div class="avg-rating-box">
                        <div class="avg-rating-num" id="distAvgNum">4.8</div>
                        <div class="avg-rating-stars" id="distAvgStars">
                            <!-- Injected by JS -->
                        </div>
                        <div class="avg-rating-total" id="distTotalCount">3 reviews</div>
                    </div>
                    <div class="distribution-bars" id="distBarsContainer">
                        <!-- distribution rows injected by JS -->
                    </div>
                </div>

                <!-- Review Form (collapsible) -->
                <div id="reviewFormContainer" style="display: none; background-color: var(--bg-main); padding: 20px; border-radius: var(--radius-lg); margin-bottom: 20px; border: 1px solid var(--border-color);">
                    <h4 style="margin-bottom: 14px; font-size: 14px; font-weight: 700;">Write a Review</h4>
                    <form id="reviewSubmitForm" style="display: flex; flex-direction: column; gap: 12px;">
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <label style="font-size: 12px; font-weight: 600; color: var(--text-secondary);">Rating:</label>
                            <select id="reviewRatingInput" class="form-select" style="padding: 4px 8px; width: 80px;" required>
                                <option value="5">5 Stars</option>
                                <option value="4">4 Stars</option>
                                <option value="3">3 Stars</option>
                                <option value="2">2 Stars</option>
                                <option value="1">1 Star</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="reviewTitleInput">Review Title</label>
                            <input type="text" id="reviewTitleInput" class="form-input" placeholder="Summarize your experience" required>
                        </div>
                        <div class="form-group">
                            <label for="reviewCommentInput">Comments</label>
                            <textarea id="reviewCommentInput" class="form-textarea" placeholder="What do you think about this software?" required></textarea>
                        </div>
                        <div style="display: flex; justify-content: flex-end; gap: 10px;">
                            <button type="button" class="btn-secondary" id="cancelReviewBtn" style="padding: 6px 12px; font-size: 12px;">Cancel</button>
                            <button type="submit" class="btn-primary" style="padding: 6px 12px; font-size: 12px;">Submit</button>
                        </div>
                    </form>
                </div>

                <!-- Review list -->
                <div class="comments-list" id="commentsListContainer">
                    <!-- Reviews injected here by JS -->
                </div>
            </div>

            <!-- Bug Reporting and Tracking -->
            <div class="detail-section" id="drawerBugsSection" style="border-top: 1px solid var(--border-color); padding-top: 24px;">
                <h3 class="view-title" style="font-size: 16px; margin-bottom: 12px;">
                    <span>Bug Reports</span>
                    <button class="btn-primary" id="openBugFormBtn" style="display:none" type="button" hidden>Report Bug</button>
                </h3>

                <!-- Bug submission form -->
                <div id="bugFormContainer" style="display: none; background-color: var(--bg-main); padding: 20px; border-radius: var(--radius-lg); margin-bottom: 20px; border: 1px solid var(--border-color);">
                    <h4 style="margin-bottom: 14px; font-size: 14px; font-weight: 700; color: var(--danger);">File a Bug Report</h4>
                    <form id="bugSubmitForm" style="display: flex; flex-direction: column; gap: 12px;">
                        <div class="form-grid" style="margin-bottom: 0;">
                            <div class="form-group">
                                <label for="bugSeverityInput">Severity</label>
                                <select id="bugSeverityInput" class="form-select" required>
                                    <option value="low">Low (Aesthetic/Minor)</option>
                                    <option value="medium" selected>Medium (Functional Flaw)</option>
                                    <option value="high">High (Crash/System Block)</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="bugVersionInput">Affected Version</label>
                                <input type="text" id="bugVersionInput" class="form-input" placeholder="e.g. 1.0.0" value="1.0.0" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="bugTitleInput">Short Title</label>
                            <input type="text" id="bugTitleInput" class="form-input" placeholder="Summary of the issue" required>
                        </div>
                        <div class="form-group">
                            <label for="bugDescInput">Detailed Description</label>
                            <textarea id="bugDescInput" class="form-textarea" placeholder="How can the developer reproduce this bug?" required></textarea>
                        </div>
                        <div style="display: flex; justify-content: flex-end; gap: 10px;">
                            <button type="button" class="btn-secondary" id="cancelBugBtn" style="padding: 6px 12px; font-size: 12px;">Cancel</button>
                            <button type="submit" class="btn-primary" style="padding: 6px 12px; font-size: 12px; background-color: var(--danger);">Submit Report</button>
                        </div>
                    </form>
                </div>

                <!-- Bug list container -->
                <div class="bug-list" id="bugsListContainer">
                    <!-- Bugs injected by JS -->
                </div>
            </div>

        </div>
    </div>

    <!-- App Submission Modal -->
    <div class="modal-overlay" id="submitAppModalOverlay" role="dialog" aria-modal="true" aria-labelledby="submitModalTitle">
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title" id="submitModalTitle">Submit Software to Appex</h2>
                <button class="close-btn" id="closeSubmitModalBtn" type="button" aria-label="Close app submission form">
                    <svg viewBox="0 0 24 24">
                        <line x1="18" y1="6" x2="6" y2="18" stroke-linecap="round" stroke-linejoin="round"/>
                        <line x1="6" y1="6" x2="18" y2="18" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
            
            <form id="appPublishForm">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="formAppName">App/Software Name *</label>
                        <input type="text" id="formAppName" class="form-input" placeholder="e.g. QueryCraft" required>
                    </div>
                    <div class="form-group">
                        <label for="formAppCategory">Category *</label>
                        <select id="formAppCategory" class="form-select" required>
                            <option value="Web App">Web App</option>
                            <option value="Mobile">Mobile Application</option>
                            <option value="Desktop">Desktop Software</option>
                            <option value="Laravel Package">Laravel Package</option>
                            <option value="Script & Tool">Script & Mini Tool</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="formAppShortDesc">Tagline / Short Desc *</label>
                        <input type="text" id="formAppShortDesc" class="form-input" placeholder="A single-sentence description of the tool" required>
                    </div>
                    <div class="form-group">
                        <label for="formAppPlatform">Platform *</label>
                        <select id="formAppPlatform" class="form-select" required>
                            <option value="web" selected>Web</option>
                            <option value="desktop">Desktop (Windows/Mac/Linux)</option>
                            <option value="ios">iOS</option>
                            <option value="mac">macOS</option>
                            <option value="android">Android</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="formAppVersion">Initial Version *</label>
                        <input type="text" id="formAppVersion" class="form-input" placeholder="e.g. 1.0.0" value="1.0.0" required>
                    </div>
                    <div class="form-group">
                        <label for="formAppSize">Release File Size</label>
                        <input type="text" id="formAppSize" class="form-input" placeholder="e.g. 4.2 MB" value="2.5 MB">
                    </div>
                    <div class="form-group">
                        <label for="formAppLicense">License</label>
                        <input type="text" id="formAppLicense" class="form-input" placeholder="e.g. MIT, Apache-2.0" value="MIT">
                    </div>
                    <div class="form-group full-width">
                        <label for="formAppDesc">Full Project Description *</label>
                        <textarea id="formAppDesc" class="form-textarea" placeholder="Provide details on features, dependencies, and requirements..." required></textarea>
                    </div>
                    <div class="form-group full-width">
                        <label for="formAppInstall">Installation Guide / Command</label>
                        <input type="text" id="formAppInstall" class="form-input" placeholder="e.g. composer require appex/querycraft or git clone ...">
                    </div>
                    <div class="form-group">
                        <label for="formAppGithub">GitHub Repository Link</label>
                        <input type="url" id="formAppGithub" class="form-input" placeholder="https://github.com/developer/repo">
                    </div>
                    <div class="form-group">
                        <label for="formAppDemo">Live Demo Link</label>
                        <input type="url" id="formAppDemo" class="form-input" placeholder="https://demo.example.com">
                    </div>
                    <div class="form-group">
                        <label for="formAppIconUrl">App Icon Color Theme</label>
                        <select id="formAppIconUrl" class="form-select">
                            <option value="blue">Deep Ocean (Blue-Purple)</option>
                            <option value="green">Emerald Mint (Green-Teal)</option>
                            <option value="orange">Sunset Flame (Orange-Red)</option>
                            <option value="purple">Cosmic Nebulae (Purple-Pink)</option>
                            <option value="dark">Graphite Charcoal (Dark Gray)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="formAppTags">Tags (comma separated)</label>
                        <input type="text" id="formAppTags" class="form-input" placeholder="laravel, database, admin, mysql">
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn-secondary" id="cancelPublishBtn">Cancel</button>
                    <button type="submit" class="btn-primary">Publish Now</button>
                </div>
            </form>
        </div>
    </div>

    <div class="modal-overlay" id="adminReviewModal" role="dialog" aria-modal="true" aria-labelledby="adminReviewTitle">
        <div class="modal-content">
            <div class="modal-header">
                <div><h2 class="modal-title" id="adminReviewTitle">Review app</h2><small id="adminReviewMeta"></small></div>
                <button class="close-btn" id="closeAdminReview" type="button" aria-label="Close review">&times;</button>
            </div>
            <form id="adminReviewForm">
                <input type="hidden" id="adminReviewAppId">
                <div class="form-grid">
                    <div class="form-group"><label for="adminEditName">App name</label><input class="form-input" id="adminEditName" required maxlength="160"></div>
                    <div class="form-group"><label for="adminEditCategory">Category</label><input class="form-input" id="adminEditCategory" readonly></div>
                    <div class="form-group full-width"><label for="adminEditTagline">Tagline</label><input class="form-input" id="adminEditTagline" maxlength="220"></div>
                    <div class="form-group full-width"><label for="adminEditDescription">Full description</label><textarea class="form-textarea" id="adminEditDescription" rows="7"></textarea></div>
                    <div class="form-group"><label for="adminEditRepository">Repository URL</label><input class="form-input" id="adminEditRepository" type="url"></div>
                    <div class="form-group"><label for="adminEditDemo">Demo URL</label><input class="form-input" id="adminEditDemo" type="url"></div>
                    <div class="form-group"><label for="adminEditLicense">License</label><input class="form-input" id="adminEditLicense" maxlength="80"></div>
                    <div class="form-group"><label for="adminEditLanguage">Primary language</label><input class="form-input" id="adminEditLanguage" maxlength="80"></div>
                    <div class="form-group"><label for="adminEditVersion">Version</label><input class="form-input" id="adminEditVersion" maxlength="80" placeholder="1.0.0"></div>
                    <div class="form-group"><label for="adminEditSize">Download size</label><input class="form-input" id="adminEditSize" placeholder="2.5 MB"></div>
                    <div class="form-group full-width"><label for="adminEditInstall">Installation Guide / Command</label><input class="form-input" id="adminEditInstall" maxlength="255" placeholder="composer require vendor/package"></div>
                    <div class="form-group full-width"><label for="adminEditDownloadUrl">Direct download URL</label><input class="form-input" id="adminEditDownloadUrl" type="url" placeholder="https://example.com/releases/app.zip"><small>Use a direct file URL, not a general download webpage.</small></div>
                    <div class="form-group full-width"><label for="adminEditTags">Tags (comma separated)</label><input class="form-input" id="adminEditTags"></div>
                    <div class="form-group full-width"><label>Submitted images</label><small id="adminScreenshotHint" style="display:block;color:var(--text-secondary);margin-bottom:8px;">Drag images to change their order. The first image is the cover.</small><div id="adminReviewScreenshots" style="display:flex;gap:10px;overflow-x:auto;padding:3px;"></div></div>
                    <div class="form-group full-width" style="display: block; margin-top: 20px;">
                        <label for="adminRejectReason" style="display: block; margin-bottom: 8px; font-weight: 600;">Rejection reason</label>
                        <textarea class="form-textarea" id="adminRejectReason" maxlength="1000" rows="4" placeholder="Required when rejecting. Explain what the developer needs to fix." style="width: 100%; min-height: 100px;"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="submit" class="btn-secondary">Save changes</button>
                    <button type="button" class="btn-secondary" id="adminRejectBtn" style="color:var(--danger)">Reject with reason</button>
                    <button type="button" class="btn-primary" id="adminApproveBtn">Approve</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Live Alerts / Toast Container -->
    <div class="toast-container" id="toastContainer"></div>

    @include('components.user-auth-modal')

    <script>window.__adminPendingApps = @json($pendingApps);</script>

</body>
</html>
