<!doctype html>
<html lang="en" data-theme="light">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Appex - Developer Console</title>
    @include('components.theme-loader')
    @vite(['resources/css/app.css', 'resources/css/pages/developer.css', 'resources/js/core.js', 'resources/js/marketplace.js', 'resources/js/developer.js'])
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body
    data-page="developer"
    data-auth-mode="server"
    data-auth-account="{{ auth()->user()->role }}"
    data-auth-name="{{ auth()->user()->name }}"
    data-auth-role="Developer Publisher"
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
                    <a class="nav-item active developer-access-nav" href="{{ route('developer.login') }}" data-page-link="developer-login" aria-current="page">
                        <svg viewBox="0 0 24 24">
                            <polyline points="16 18 22 12 16 6" stroke-linecap="round" stroke-linejoin="round"/>
                            <polyline points="8 6 2 12 8 18" stroke-linecap="round" stroke-linejoin="round"/>
                            <line x1="12" y1="2" x2="12" y2="22" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span class="developer-nav-label">Developer Console</span>
                    </a>
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
<!-- Developer Console Tab Panel -->
            <div class="tab-panel active" id="panel-developer">
                <div class="view-header">
                    <span class="view-date">Publisher Account</span>
                    <h1 class="view-title">
                        <span>Developer Console</span>
                        <div style="display: flex; gap: 10px;">
                            <button class="btn-secondary" id="openImportModalBtn" type="button" style="border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-primary); padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                <span>Import App</span>
                            </button>
                            <button class="btn-primary" id="openSubmitModalBtn" type="button">
                                <svg viewBox="0 0 24 24">
                                    <line x1="12" y1="5" x2="12" y2="19" stroke-linecap="round" stroke-linejoin="round"/>
                                    <line x1="5" y1="12" x2="19" y2="12" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <span>Publish App</span>
                            </button>
                        </div>
                    </h1>
                </div>

                <!-- Stats Dashboard Row -->
                <div class="dashboard-grid">
                    <div class="stat-card">
                        <div class="stat-header">
                            <span>TOTAL DOWNLOADS</span>
                            <svg viewBox="0 0 24 24" width="16" height="16"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </div>
                        <div class="stat-value" id="statDownloads">2,482</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-header">
                            <span>AVERAGE RATING</span>
                            <svg viewBox="0 0 24 24" width="16" height="16"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </div>
                        <div class="stat-value" id="statRating">4.7</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-header">
                            <span>ACTIVE BUG REPORTS</span>
                            <svg viewBox="0 0 24 24" width="16" height="16"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </div>
                        <div class="stat-value" id="statBugs">3</div>
                    </div>
                </div>

                <!-- Charts Row -->
                <div class="charts-row">
                    <div class="chart-card">
                        <h3>Downloads Over Time</h3>
                        <div class="chart-container">
                            <canvas id="downloadsChart"></canvas>
                        </div>
                    </div>
                    <div class="chart-card">
                        <h3>Open Bugs by Severity</h3>
                        <div class="chart-container">
                            <canvas id="bugsChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Developer Apps Table -->
                <div class="console-row">
                    <div class="card-panel">
                        <div class="panel-title-row">
                            <h2 class="panel-title">My Published Software</h2>
                        </div>
                        <div class="table-responsive">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Software</th>
                                        <th>Category</th>
                                        <th>Version</th>
                                        <th>Downloads</th>
                                        <th>Status</th>
                                        <th>Open Bugs</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="devAppsTableBody">
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
                <small id="screenshotReorderHint" style="display:none;color:var(--text-secondary);margin-bottom:10px;">Drag images to change their order. The first image is the cover.</small>
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

            <div class="detail-section">
                <h3 class="detail-section-title">Version History</h3>
                <div id="detailReleaseHistory" class="release-history-list"></div>
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
                <div id="reviewFormContainer" hidden style="display: none; background-color: var(--bg-main); padding: 20px; border-radius: var(--radius-lg); margin-bottom: 20px; border: 1px solid var(--border-color);">
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

    <!-- External App Import Modal -->
    <div class="modal-overlay" id="importAppModalOverlay" role="dialog" aria-modal="true" aria-labelledby="importModalTitle" style="display: none; align-items: center; justify-content: center; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); z-index: 1000; backdrop-filter: blur(10px); transition: all 0.3s ease;">
        <div class="modal-content" style="max-width: 500px; width: 90%; display: flex; flex-direction: column; padding: 32px; border-radius: 20px; background: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border-color); box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
            <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 16px; margin-bottom: 20px;">
                <h2 class="modal-title" id="importModalTitle" style="font-size: 20px; font-weight: 700; margin: 0;">Import External App</h2>
                <button class="close-btn" id="closeImportModalBtn" type="button" style="background: none; border: none; cursor: pointer; color: var(--text-secondary);">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" stroke-linecap="round" stroke-linejoin="round"/>
                        <line x1="6" y1="6" x2="18" y2="18" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
            
            <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 20px;">Fetch app details and images automatically from external stores.</p>

            <form id="ajaxImportForm" data-apple-url="{{ route('developer.import.apple') }}" data-github-url="{{ route('developer.import.github') }}">
                <div class="form-group" style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--text-secondary);">Select Source</label>
                    <select id="importSource" class="form-select" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-main); color: var(--text-primary);" required>
                        <option value="apple-ios">Apple Store - iOS Apps</option>
                        <option value="apple-mac">Mac App Store - Mac Apps</option>
                        <option value="github">GitHub Repository</option>
                    </select>
                </div>
                
                <div class="form-group" style="margin-bottom: 25px; position: relative;">
                    <label id="importTermLabel" style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--text-secondary);">iOS App Name or ID</label>
                    <input type="text" id="importTerm" class="form-input" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-main); color: var(--text-primary);" placeholder="e.g. WhatsApp" required autocomplete="off">
                    <div id="autocompleteDropdown" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; margin-top: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 1001; max-height: 200px; overflow-y: auto;">
                        <!-- Results injected here -->
                    </div>
                </div>

                <div id="importResult" style="margin-bottom: 20px; font-size: 14px; color: var(--accent);"></div>
                <div id="importProgressWrap" style="display:none;margin:-6px 0 20px;">
                    <div style="height:8px;background:var(--bg-main);border:1px solid var(--border-color);border-radius:999px;overflow:hidden;">
                        <div id="importProgressBar" class="import-progress-bar" style="height:100%;width:38%;background:var(--accent);"></div>
                    </div>
                    <div id="importProgressText" style="font-size:12px;color:var(--text-secondary);margin-top:6px;">Waiting...</div>
                </div>

                <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 12px;">
                    <button type="button" class="btn-secondary" id="cancelImportBtn" style="padding: 10px 16px; border-radius: 8px; font-weight: 600; cursor: pointer;">Cancel</button>
                    <button type="submit" class="btn-primary" id="importSubmitBtn" style="padding: 10px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; border: none;">Fetch</button>
                </div>
            </form>
        </div>
    </div>

    <!-- App Deletion Modal -->
    <div class="modal-overlay" id="deleteAppModalOverlay" role="dialog" aria-modal="true" aria-labelledby="deleteModalTitle" style="display: none;">
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h2 class="modal-title" id="deleteModalTitle">Delete App</h2>
                <button class="close-btn" id="closeDeleteAppModalBtn" type="button" aria-label="Close delete modal">
                    <svg viewBox="0 0 24 24">
                        <line x1="18" y1="6" x2="6" y2="18" stroke-linecap="round" stroke-linejoin="round"/>
                        <line x1="6" y1="6" x2="18" y2="18" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
            
            <div style="padding: 24px;">
                <input type="hidden" id="deleteAppId">
                <p id="deleteAppWarning" style="color: var(--danger); font-weight: 600; margin-bottom: 16px;"></p>
                <p style="margin-bottom: 16px;">Are you sure you want to delete <strong id="deleteAppName"></strong>?</p>
                
                <div id="deleteAppReasonContainer" class="form-group" style="display: none; margin-bottom: 24px;">
                    <label for="deleteAppReason">Reason for Deletion (Required for approved apps)</label>
                    <textarea id="deleteAppReason" class="form-textarea" placeholder="Please provide a reason to the administrator..." style="min-height: 80px;"></textarea>
                </div>
                
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button type="button" class="btn-secondary" id="cancelDeleteAppBtn">Cancel</button>
                    <button type="button" class="btn-primary" id="confirmDeleteAppBtn" style="background-color: var(--danger);">Delete App</button>
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
                            <option value="">Choose a category</option>
                            @foreach ($categories as $category)
                                <option value="{{ $category->slug }}">{{ $category->name }}</option>
                            @endforeach
                            <option value="__new__">Suggest a new category…</option>
                        </select>
                    </div>
                    <div class="form-group" id="newCategoryGroup" hidden>
                        <label for="formAppNewCategory">Suggested Category Name</label>
                        <input type="text" id="formAppNewCategory" class="form-input" maxlength="80" placeholder="e.g. Healthcare">
                        <small>Enter a name when suggesting a category. It remains pending until an administrator approves it.</small>
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
                        <label for="formAppShortDesc">Tagline / Short Desc *</label>
                        <input type="text" id="formAppShortDesc" class="form-input" placeholder="A single-sentence description of the tool" required>
                    </div>
                    <div class="form-group">
                        <label for="formAppVersion">Initial Version *</label>
                        <input type="text" id="formAppVersion" class="form-input" placeholder="e.g. 1.0.0" value="1.0.0" required>
                    </div>
                    <div class="form-group">
                        <label for="formAppSize">Release File Size</label>
                        <input type="text" id="formAppSize" class="form-input" placeholder="Optional, e.g. 4.2 MB">
                    </div>
                    <div class="form-group">
                        <label for="formAppLicense">License</label>
                        <input type="text" id="formAppLicense" class="form-input" placeholder="e.g. MIT, Apache-2.0" value="MIT">
                    </div>
                    <div class="form-group">
                        <label for="formAppLanguage">Primary Language</label>
                        <input type="text" id="formAppLanguage" class="form-input" maxlength="80" placeholder="e.g. PHP, JavaScript">
                    </div>
                    <div class="form-group full-width">
                        <label for="formAppDesc">Full Project Description *</label>
                        <textarea id="formAppDesc" class="form-textarea" placeholder="Provide details on features, dependencies, and requirements..." required></textarea>
                    </div>
                    <div class="form-group full-width">
                        <label for="formAppInstall">Installation Guide / Command</label>
                        <input type="text" id="formAppInstall" class="form-input" placeholder="e.g. composer require appex/querycraft or git clone ...">
                    </div>
                    <div class="form-group full-width">
                        <label for="formAppDownloadUrl">Direct Download URL</label>
                        <input type="url" id="formAppDownloadUrl" class="form-input" placeholder="https://example.com/releases/app.zip">
                        <small>Use a direct file URL, not a general download webpage.</small>
                    </div>
                    <div class="form-group">
                        <label for="formAppGithub">GitHub Repository Link</label>
                        <input type="url" id="formAppGithub" class="form-input" placeholder="https://github.com/developer/repo">
                    </div>
                    <div class="form-group">
                        <label for="formAppDemo">Live Demo Link</label>
                        <input type="url" id="formAppDemo" class="form-input" placeholder="https://demo.example.com">
                    </div>
                    <div class="form-group full-width" id="existingAppMediaGroup" hidden>
                        <label id="appScreenshotPreviewLabel">Currently uploaded images</label>
                        <div id="existingAppScreenshots" style="display:flex;gap:10px;overflow-x:auto;padding:3px;"></div>
                    </div>
                    <div class="form-group full-width">
                        <label for="formAppScreenshots">Images (up to 5 MB each)</label>
                        <input type="file" id="formAppScreenshots" class="form-input" accept="image/jpeg,image/png,image/webp" multiple>
                        <small id="screenshotSelectionStatus">Select one or more app images, screenshots, or previews. You can choose files multiple times; the first image will be the cover.</small>
                    </div>
                    <div class="form-group">
                        <label for="formAppIcon">App Icon</label>
                        <div id="existingAppIcon" hidden style="margin-bottom:10px;"></div>
                        <input type="file" id="formAppIcon" class="form-input" accept="image/jpeg,image/png,image/webp">
                        <small>JPG, PNG, or WebP up to 2 MB. Automatically cropped to 512 × 512.</small>
                    </div>
                    <div class="form-group">
                        <label for="formAppTags">Tags (comma separated)</label>
                        <input type="text" id="formAppTags" class="form-input" placeholder="laravel, database, admin, mysql">
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn-secondary" id="cancelPublishBtn">Cancel</button>
                    <button type="submit" class="btn-primary">Submit to Queue</button>
                </div>
                <div id="publishSubmitStatus" style="display:none;margin-top:12px;font-size:13px;color:var(--text-secondary);">
                    Preparing submission...
                </div>
            </form>
        </div>
    </div>

    <!-- Live Alerts / Toast Container -->
    <div class="toast-container" id="toastContainer"></div>

    @include('components.user-auth-modal')

    <!-- App Management Modal (Detailed Analytics) -->
    <div class="modal-overlay" id="manageAppModalOverlay" role="dialog" aria-modal="true" style="display: none; align-items: center; justify-content: center; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); z-index: 1000; backdrop-filter: blur(10px); transition: all 0.3s ease;">
        <div class="modal-content" style="max-width: 700px; width: 90%; max-height: 85vh; display: flex; flex-direction: column; padding: 32px; border-radius: 20px; background: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border-color); overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
            <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 16px; margin-bottom: 16px;">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <h2 class="modal-title" id="manageAppModalTitle" style="font-size: 20px; font-weight: 700; font-family: var(--font-heading);">App Analytics & Management</h2>
                    <p style="font-size: 13px; color: var(--text-secondary); margin: 0;" id="manageAppModalSubtitle"></p>
                </div>
                <button class="close-btn" id="closeManageAppModalBtn" type="button" style="background: none; border: none; cursor: pointer; color: var(--text-secondary); transition: color 0.2s;">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" stroke-linecap="round" stroke-linejoin="round"/>
                        <line x1="6" y1="6" x2="18" y2="18" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>

            <!-- Tab Headers -->
            <div class="tabs-nav" style="display: flex; gap: 8px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 20px;">
                <button type="button" class="tab-btn active" id="tabManageDownloads" style="background: none; border: none; font-size: 13px; font-weight: 700; padding: 8px 16px; cursor: pointer; color: var(--accent); border-bottom: 2.5px solid var(--accent); border-radius: 0; transition: all 0.2s;">Downloads</button>
                <button type="button" class="tab-btn" id="tabManageBugs" style="background: none; border: none; font-size: 13px; font-weight: 700; padding: 8px 16px; cursor: pointer; color: var(--text-secondary); transition: all 0.2s;">Bug Reports</button>
                <button type="button" class="tab-btn" id="tabManageReviews" style="background: none; border: none; font-size: 13px; font-weight: 700; padding: 8px 16px; cursor: pointer; color: var(--text-secondary); transition: all 0.2s;">Reviews</button>
            </div>

            <!-- Tab Content (Scrollable) -->
            <div id="manageAppModalContent" style="flex: 1; overflow-y: auto; padding-right: 6px;">
                <!-- Downloads View -->
                <div id="viewManageDownloads" class="manage-tab-content active">
                    <div style="display: flex; flex-direction: column; gap: 20px; align-items: center; justify-content: center; padding: 40px 20px; background: rgba(0, 113, 227, 0.03); border-radius: 12px; border: 1px dashed rgba(0, 113, 227, 0.2);">
                        <div style="text-align: center;">
                            <div style="font-size: 48px; font-weight: 800; color: var(--accent); margin-bottom: 4px; line-height: 1;" id="manageDownloadsCount">0</div>
                            <p style="color: var(--text-secondary); font-size: 14px; font-weight: 600; margin: 0;">Total Installs</p>
                        </div>
                        <div style="font-size: 12px; color: var(--text-secondary); text-align: center;">
                            Calculated across all versions and releases. Note that downloads count increments upon successful user initialization.
                        </div>
                    </div>
                </div>

                <!-- Bug Reports View -->
                <div id="viewManageBugs" class="manage-tab-content">
                    <div id="manageBugsList" style="display: flex; flex-direction: column; gap: 12px;">
                        <!-- Bug items injected here -->
                    </div>
                </div>

                <!-- Reviews View -->
                <div id="viewManageReviews" class="manage-tab-content">
                    <div id="manageReviewsList" style="display: flex; flex-direction: column; gap: 12px;">
                        <!-- Review items injected here -->
                    </div>
                </div>
            </div>
        </div>
    </div>

    <style>
        .manage-tab-content {
            display: none;
        }
        .manage-tab-content.active {
            display: block;
        }
        .analytics-card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 18px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.02);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .analytics-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(0,0,0,0.05);
        }
        .analytics-card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        .analytics-card-title {
            font-size: 15px;
            font-weight: 700;
            margin: 0;
            color: var(--text-primary);
        }
        .analytics-card-desc {
            font-size: 13px;
            color: var(--text-secondary);
            margin: 0;
            line-height: 1.5;
        }
        .tab-btn.active {
            color: var(--accent) !important;
            border-bottom: 2.5px solid var(--accent) !important;
        }
    </style>


    <script>
        // Import Modal Logic
        const importModal = document.getElementById('importAppModalOverlay');
        const openImportBtn = document.getElementById('openImportModalBtn');
        const closeImportBtn = document.getElementById('closeImportModalBtn');
        const cancelImportBtn = document.getElementById('cancelImportBtn');
        
        if(openImportBtn) {
            openImportBtn.addEventListener('click', () => {
                importModal.style.display = 'flex';
                // Reset form
                document.getElementById('importResult').innerHTML = '';
                document.getElementById('importTerm').value = '';
                autocompleteDropdown.innerHTML = '';
                autocompleteDropdown.style.display = 'none';
                resetImportProgress();
                clearImportedMediaPreview();
            });
        }
        
        [closeImportBtn, cancelImportBtn].forEach(btn => {
            if(btn) btn.addEventListener('click', () => {
                importModal.style.display = 'none';
                resetImportProgress();
                clearImportedMediaPreview();
            });
        });

        // Dynamic label change based on source
        document.getElementById('importSource')?.addEventListener('change', (e) => {
            const label = document.getElementById('importTermLabel');
            const input = document.getElementById('importTerm');
            if(e.target.value === 'github') {
                label.innerText = 'GitHub Repository URL';
                input.placeholder = 'e.g. laravel/laravel or https://github.com/...';
            } else if (e.target.value === 'apple-mac') {
                label.innerText = 'Mac App Name or ID';
                input.placeholder = 'e.g. Xcode';
            } else {
                label.innerText = 'iOS App Name or ID';
                input.placeholder = 'e.g. WhatsApp';
            }
        });

        // AJAX Fetch Logic (Async JS)
        const importForm = document.getElementById('ajaxImportForm');
        const searchInput = document.getElementById('importTerm');
        const autocompleteDropdown = document.getElementById('autocompleteDropdown');
        const importProgressWrap = document.getElementById('importProgressWrap');
        const importProgressBar = document.getElementById('importProgressBar');
        const importProgressText = document.getElementById('importProgressText');
        const importedPreviewUrls = [];
        const importedIconPreviewUrls = [];
        const selectedScreenshotFiles = [];
        let isSyncingScreenshotInput = false;
        
        let debounceTimer;
        let autocompleteRequestId = 0;
        let selectedAutocompleteValue = '';

        function setImportProgress(message) {
            if (importProgressWrap) importProgressWrap.style.display = 'block';
            if (importProgressBar) importProgressBar.style.width = '38%';
            if (importProgressText) importProgressText.textContent = message;
        }

        function resetImportProgress() {
            if (importProgressWrap) importProgressWrap.style.display = 'none';
            if (importProgressBar) importProgressBar.style.width = '38%';
            if (importProgressText) importProgressText.textContent = 'Waiting...';
        }

        function clearImportedImagesPreviewInternal() {
            importedPreviewUrls.splice(0).forEach(url => URL.revokeObjectURL(url));
            const mediaGroup = document.getElementById('existingAppMediaGroup');
            const preview = document.getElementById('existingAppScreenshots');
            if (mediaGroup) mediaGroup.hidden = true;
            if (preview) preview.innerHTML = '';
        }

        function clearImportedIconPreviewInternal() {
            importedIconPreviewUrls.splice(0).forEach(url => URL.revokeObjectURL(url));
            const preview = document.getElementById('existingAppIcon');
            if (preview) {
                preview.hidden = true;
                preview.innerHTML = '';
            }
        }

        function clearImportedMediaPreview() {
            selectedScreenshotFiles.splice(0);
            syncScreenshotInputFiles();
            clearImportedImagesPreviewInternal();
            clearImportedIconPreviewInternal();
        }

        window.clearImportedMediaPreview = clearImportedMediaPreview;

        function renderImportedImagePreview() {
            clearImportedImagesPreviewInternal();

            const files = Array.from(document.getElementById('formAppScreenshots')?.files || []);
            const mediaGroup = document.getElementById('existingAppMediaGroup');
            const previewLabel = document.getElementById('appScreenshotPreviewLabel');
            const preview = document.getElementById('existingAppScreenshots');

            if (!files.length || !mediaGroup || !preview) return;

            mediaGroup.hidden = false;
            if (previewLabel) previewLabel.textContent = `Imported images (${files.length})`;

            preview.innerHTML = files.map((file, index) => {
                const url = URL.createObjectURL(file);
                importedPreviewUrls.push(url);
                return `
                    <div style="min-width:240px;">
                        <img src="${url}" alt="Imported app image ${index + 1}" style="width:240px;height:160px;max-width:72vw;object-fit:contain;background:var(--bg-main);border-radius:8px;border:1px solid var(--border-color);display:block;">
                        ${index === 0 ? '<small style="display:block;color:var(--accent);font-weight:700;margin-top:4px;">Cover</small>' : ''}
                    </div>
                `;
            }).join('');
        }

        function fileFingerprint(file) {
            return [file.name, file.size, file.lastModified, file.type].join(':');
        }

        function addScreenshotFiles(files) {
            const existing = new Set(selectedScreenshotFiles.map(fileFingerprint));

            Array.from(files || []).forEach(file => {
                const fingerprint = fileFingerprint(file);

                if (!existing.has(fingerprint)) {
                    selectedScreenshotFiles.push(file);
                    existing.add(fingerprint);
                }
            });
        }

        function syncScreenshotInputFiles() {
            const input = document.getElementById('formAppScreenshots');
            if (!input) return;

            const dt = new DataTransfer();
            selectedScreenshotFiles.forEach(file => dt.items.add(file));
            isSyncingScreenshotInput = true;
            input.files = dt.files;
            isSyncingScreenshotInput = false;
        }

        function renderImportedIconPreview() {
            clearImportedIconPreviewInternal();

            const file = document.getElementById('formAppIcon')?.files?.[0];
            const preview = document.getElementById('existingAppIcon');
            if (!file || !preview) return;

            const url = URL.createObjectURL(file);
            importedIconPreviewUrls.push(url);
            preview.hidden = false;
            preview.innerHTML = `
                <div style="display:flex;align-items:center;gap:10px;">
                    <img src="${url}" alt="Imported app icon" style="width:52px;height:52px;object-fit:cover;border-radius:12px;border:1px solid var(--border-color);">
                    <small style="color:var(--text-secondary);">Imported icon ready to upload</small>
                </div>
            `;
        }

        async function fetchWithTimeout(url, options = {}, timeoutMs = 30000) {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), timeoutMs);
            try {
                return await fetch(url, { ...options, signal: controller.signal });
            } finally {
                clearTimeout(timeout);
            }
        }

        function startImportFetch(term) {
            autocompleteRequestId++;
            selectedAutocompleteValue = String(term || '');
            searchInput.value = term;
            autocompleteDropdown.style.display = 'none';
            autocompleteDropdown.innerHTML = '';
            importForm?.requestSubmit();
        }

        function isAppleImportSource(source) {
            return source === 'apple-ios' || source === 'apple-mac';
        }

        function appleImportPlatform(source) {
            return source === 'apple-mac' ? 'mac' : 'ios';
        }

        function buildImportedTags(data, source) {
            if (data.topics) return data.topics;
            if (Array.isArray(data.tags) && data.tags.length) return data.tags.join(', ');

            const fallbackTags = [
                data.category,
                data.language,
                data.platform_label,
                source === 'github' ? 'GitHub' : ''
            ].filter(Boolean);

            return [...new Set(fallbackTags)].join(', ');
        }

        function normalizeCategory(value) {
            return String(value || '')
                .toLowerCase()
                .replace(/&/g, 'and')
                .replace(/[^a-z0-9]+/g, ' ')
                .trim();
        }

        function applyImportedCategory(categoryName) {
            const catSelect = document.getElementById('formAppCategory');
            const newCategoryInput = document.getElementById('formAppNewCategory');
            if (!catSelect) return;

            const imported = String(categoryName || '').trim();
            const importedNormalized = normalizeCategory(imported);
            const options = Array.from(catSelect.options);
            const match = importedNormalized
                ? options.find(option => {
                    if (!option.value || option.value === '__new__') return false;
                    return normalizeCategory(option.textContent) === importedNormalized
                        || normalizeCategory(option.value) === importedNormalized;
                })
                : null;

            if (match) {
                catSelect.value = match.value;
                if (newCategoryInput) newCategoryInput.value = '';
            } else if (imported) {
                catSelect.value = '__new__';
                if (newCategoryInput) newCategoryInput.value = imported;
            } else if (!catSelect.value && options.length > 1) {
                catSelect.selectedIndex = 1;
                if (newCategoryInput) newCategoryInput.value = '';
            }

            catSelect.dispatchEvent(new Event('change'));
        }

        document.getElementById('formAppScreenshots')?.addEventListener('change', (event) => {
            if (!isSyncingScreenshotInput) {
                addScreenshotFiles(event.target.files);
                syncScreenshotInputFiles();
            }

            renderImportedImagePreview();
        });
        document.getElementById('formAppIcon')?.addEventListener('change', renderImportedIconPreview);

        searchInput?.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            const term = e.target.value.trim();
            const source = document.getElementById('importSource').value;
            document.getElementById('importResult').innerHTML = '';

            if (term !== selectedAutocompleteValue) {
                selectedAutocompleteValue = '';
            }
            
            if (term.length < 2) {
                autocompleteRequestId++;
                autocompleteDropdown.style.display = 'none';
                autocompleteDropdown.innerHTML = '';
                return;
            }

            autocompleteDropdown.innerHTML = '<div style="padding:10px;color:var(--text-secondary);font-size:13px;">Searching...</div>';
            autocompleteDropdown.style.display = 'block';
            
            debounceTimer = setTimeout(async () => {
                const requestId = ++autocompleteRequestId;
                const searchUrl = isAppleImportSource(source)
                    ? `{{ route('developer.import.apple.search') }}?platform=${appleImportPlatform(source)}&term=${encodeURIComponent(term)}`
                    : `{{ route('developer.import.github.search') }}?term=${encodeURIComponent(term)}`;
                
                try {
                    const res = await fetchWithTimeout(searchUrl, { headers: { 'Accept': 'application/json' } }, 15000);
                    const results = await res.json();

                    if (requestId !== autocompleteRequestId || searchInput.value.trim() !== term) return;
                    
                    autocompleteDropdown.innerHTML = '';
                    if (results.length > 0) {
                        autocompleteDropdown.style.display = 'block';
                        results.forEach(item => {
                            const div = document.createElement('div');
                            div.style.cssText = 'padding: 10px; cursor: pointer; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid var(--border-color); transition: background 0.2s;';
                            div.onmouseover = () => div.style.background = 'var(--bg-main)';
                            div.onmouseout = () => div.style.background = 'transparent';
                            
                            const imgHtml = item.icon ? `<img src="${item.icon}" style="width: 32px; height: 32px; border-radius: 6px; object-fit: cover;">` : '';
                            div.innerHTML = `
                                ${imgHtml}
                                <span style="font-weight: 600; font-size: 14px; color: var(--text-primary); flex:1;">${item.name}</span>
                                ${item.platform_label ? `<small style="color:var(--text-secondary);font-size:12px;">${item.platform_label}</small>` : ''}
                            `;
                            
                            div.addEventListener('click', () => {
                                autocompleteRequestId++;
                                selectedAutocompleteValue = String(item.id);
                                searchInput.value = item.id;
                                autocompleteDropdown.style.display = 'none';
                                autocompleteDropdown.innerHTML = '';
                                document.getElementById('importResult').innerHTML = `<span style="color:var(--text-secondary);">${item.name} selected. Click Fetch to continue.</span>`;
                            });
                            autocompleteDropdown.appendChild(div);
                        });
                    } else {
                        const emptyMessage = source === 'github'
                            ? 'No matches found. Try owner/repo, for example signalapp/Signal-Desktop.'
                            : 'No matches found. Check spelling or try the App Store ID.';
                        autocompleteDropdown.innerHTML = `<div style="padding:10px;color:var(--text-secondary);font-size:13px;">${emptyMessage}</div>`;
                        autocompleteDropdown.style.display = 'block';
                    }
                } catch (err) {
                    console.error('Autocomplete error:', err);
                    if (requestId === autocompleteRequestId) {
                        autocompleteDropdown.innerHTML = '<div style="padding:10px;color:var(--danger);font-size:13px;">Search failed. Try again.</div>';
                        autocompleteDropdown.style.display = 'block';
                    }
                }
            }, 300); // 300ms debounce
        });
        
        // Hide dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (autocompleteDropdown && !autocompleteDropdown.contains(e.target) && e.target !== searchInput) {
                autocompleteDropdown.style.display = 'none';
            }
        });

        importForm?.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const source = document.getElementById('importSource').value;
            const term = searchInput.value;
            const resultBox = document.getElementById('importResult');
            const submitBtn = document.getElementById('importSubmitBtn');

            if (submitBtn.disabled) return;
            
            autocompleteDropdown.style.display = 'none';
            autocompleteDropdown.innerHTML = '';
            
            const appleUrl = this.dataset.appleUrl;
            const githubUrl = this.dataset.githubUrl;
            
            const isAppleSource = isAppleImportSource(source);
            const targetUrl = isAppleSource ? appleUrl : githubUrl;
            const queryParam = isAppleSource ? `?platform=${appleImportPlatform(source)}&term=` : '?repo=';
            
            resultBox.innerHTML = 'Fetching app data...';
            setImportProgress('Starting fetch...');
            submitBtn.disabled = true;
            
            try {
                const response = await fetchWithTimeout(targetUrl + queryParam + encodeURIComponent(term), {
                    headers: { 'Accept': 'application/json' }
                }, 45000);
                
                const data = await response.json();
                
                if(!response.ok) {
                    throw new Error(data.error || 'Request failed.');
                }
                
                resultBox.innerHTML = '<span style="color:var(--success);">App data fetched! Downloading images...</span>';
                setImportProgress('App data received. Downloading media...');

                // Download remote images and icon into file inputs
                try {
                    const proxyBase = "{{ route('developer.import.proxy-image') }}?url=";
                    const mediaUrls = Array.isArray(data.screenshots) ? data.screenshots.slice(0, 10) : [];
                    const updateMediaProgress = label => {
                        setImportProgress(label);
                    };

                    if (mediaUrls.length > 0) {
                        const importedFiles = [];
                        for (let i = 0; i < mediaUrls.length; i++) {
                            const url = mediaUrls[i];
                            const proxyUrl = proxyBase + encodeURIComponent(url);
                            try {
                                const res = await fetchWithTimeout(proxyUrl, {}, 20000);
                                if (res.ok) {
                                    const blob = await res.blob();
                                    const extension = blob.type.includes('png') ? 'png' : (blob.type.includes('webp') ? 'webp' : 'jpg');
                                    const file = new File([blob], `app_image_${i + 1}.${extension}`, { type: blob.type || 'image/jpeg' });
                                    importedFiles.push(file);
                                } else {
                                    console.warn('Could not download app image', url, res.status);
                                }
                            } catch (mediaError) {
                                console.warn('Could not download app image', url, mediaError);
                            }
                            updateMediaProgress(`Downloaded image ${i + 1} of ${mediaUrls.length}`);
                        }
                        addScreenshotFiles(importedFiles);
                        syncScreenshotInputFiles();
                        renderImportedImagePreview();
                    }
                    
                    if (data.icon) {
                        const dtIcon = new DataTransfer();
                        const proxyUrl = proxyBase + encodeURIComponent(data.icon);
                        try {
                            const res = await fetchWithTimeout(proxyUrl, {}, 20000);
                            if (res.ok) {
                                const blob = await res.blob();
                                const file = new File([blob], `icon.jpg`, { type: blob.type });
                                dtIcon.items.add(file);
                                document.getElementById('formAppIcon').files = dtIcon.files;
                                renderImportedIconPreview();
                            }
                        } catch (iconError) {
                            console.warn('Could not download app icon', data.icon, iconError);
                        }
                        updateMediaProgress('Downloaded app icon');
                    }
                } catch (e) {
                    console.error('Could not fetch remote media', e);
                }
                
                resultBox.innerHTML = '<span style="color:var(--success);">Ready! Pre-filling form...</span>';
                setImportProgress('Opening publish form...');
                
                // Pre-fill the submission form
                setTimeout(() => {
                    importModal.style.display = 'none';
                    document.getElementById('submitAppModalOverlay').style.display = 'flex';
                    document.getElementById('submitAppModalOverlay').classList.add('active'); 
                    
                    document.getElementById('formAppName').value = data.name || '';
                    document.getElementById('formAppDesc').value = data.description || 'Imported application.';
                    // Fill short desc which is required
                    document.getElementById('formAppShortDesc').value = (data.description || 'An automatically imported application').substring(0, 80);
                    document.getElementById('formAppVersion').value = data.latest_version || data.version || '1.0.0';
                    document.getElementById('formAppSize').value = data.size_label || '';
                    const downloadInput = document.getElementById('formAppDownloadUrl');
                    if (downloadInput) downloadInput.value = data.download_url || '';
                    
                    applyImportedCategory(data.category);
                    
                    if(data.language) document.getElementById('formAppLanguage').value = data.language;
                    if(data.license) document.getElementById('formAppLicense').value = data.license;
                    if(data.platform) document.getElementById('formAppPlatform').value = data.platform;
                    document.getElementById('formAppTags').value = buildImportedTags(data, source);
                    
                    if(source === 'github') {
                        document.getElementById('formAppGithub').value = data.github_url || '';
                        document.getElementById('formAppDemo').value = data.demo_url || '';
                        document.getElementById('formAppInstall').value = data.github_url ? `git clone ${data.github_url}` : '';
                    } else if (isAppleImportSource(source)) {
                        const platformLabel = data.platform_label || (source === 'apple-mac' ? 'Mac App Store' : 'App Store');
                        document.getElementById('formAppDemo').value = data.store_url || '';
                        document.getElementById('formAppInstall').value = data.store_url ? `Install from ${platformLabel}: ${data.store_url}` : '';
                    }
                    
                    submitBtn.disabled = false;
                    resultBox.innerHTML = '';
                    searchInput.value = '';
                    resetImportProgress();

                    const imageCount = document.getElementById('formAppScreenshots')?.files.length || 0;
                    renderImportedImagePreview();
                    const status = document.getElementById('screenshotSelectionStatus');
                    if (status) {
                        status.textContent = imageCount
                            ? `${imageCount} image(s) imported. Review them, add more if needed, then submit.`
                            : 'No importable app images were returned. Add app images manually before submitting.';
                    }
                }, 1000);
                
            } catch (err) {
                const message = err.name === 'AbortError' ? 'The fetch took too long. Please try again.' : err.message;
                resultBox.innerHTML = '<span style="color:var(--danger);">' + message + '</span>';
                setImportProgress('Fetch failed');
                submitBtn.disabled = false;
            }
        });
    </script>
</body>
</html>
