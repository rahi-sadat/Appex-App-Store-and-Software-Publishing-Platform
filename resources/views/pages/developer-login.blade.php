<!doctype html>
<html lang="en" data-theme="light">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Appex - Developer Login</title>
    @include('components.theme-loader')
    @vite(['resources/css/app.css', 'resources/css/pages/auth.css', 'resources/js/core.js', 'resources/js/marketplace.js', 'resources/js/developer.js'])
</head>
<body
    data-page="developer-login"
    @auth
        data-auth-mode="server"
        data-auth-account="{{ auth()->user()->role }}"
        data-auth-name="{{ auth()->user()->name }}"
        data-auth-role="{{ match(auth()->user()->role) { 'admin' => 'Administrator', 'developer' => 'Developer Publisher', 'user' => 'App User', default => 'Visitor' } }}"
    @endauth
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
                        <span class="developer-nav-label">Publish App</span>
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
<!-- Developer Login Tab Panel -->
            <div class="tab-panel active" id="panel-developer-login">
                <div class="view-header">
                    <span class="view-date">Publisher access</span>
                    <h1 class="view-title">Developer Login</h1>
                </div>

                <div class="access-login-grid">
                    <section class="access-copy" aria-label="Developer access summary">
                        <span class="badge primary">Publishing workspace</span>
                        <h2>Sign in as a developer before opening the publishing console.</h2>
                        <p>Visitors can browse and download public releases. Developers sign in to submit apps, manage versions, respond to reviews, review bugs, and inspect analytics.</p>
                        <ul class="access-list">
                            <li>Submit apps, packages, tools, and scripts</li>
                            <li>Manage versions, changelogs, and release files</li>
                            <li>Track downloads, reviews, bug reports, and API events</li>
                        </ul>
                    </section>

                    <form class="access-card" id="developerLoginForm" method="post" action="{{ route('developer.login.submit') }}" data-real-auth="true">
                        @csrf
                        <div class="panel-title-row">
                            <h2 class="panel-title">Developer Access</h2>
                        </div>
                        @if ($errors->any())
                            <p class="access-status" style="color: var(--danger);">{{ $errors->first() }}</p>
                        @endif
                        <div class="form-group">
                            <label for="developerEmail">Developer email</label>
                            <input class="form-input" id="developerEmail" name="email" type="email" value="{{ old('email') }}" placeholder="publisher@appex.dev" autocomplete="username" required>
                        </div>
                        <div class="form-group">
                            <label for="developerPassword">Password</label>
                            <input class="form-input" id="developerPassword" name="password" type="password" placeholder="Enter developer password" autocomplete="current-password" minlength="6" required>
                        </div>
                        <button class="btn-primary" type="submit">Continue to publisher console</button>
                        <button class="btn-secondary footer-tab-link" type="button" data-tab="developer-register">Don't have an account? Register</button>
                        <p class="access-status" id="developerLoginStatus" aria-live="polite"></p>
                    </form>
                </div>
            </div>

            <!-- Developer Register Tab Panel -->
            <div class="tab-panel" id="panel-developer-register">
                <div class="view-header">
                    <span class="view-date">Publisher signup</span>
                    <h1 class="view-title">Developer Register</h1>
                </div>

                <div class="access-login-grid">
                    <section class="access-copy" aria-label="Developer registration summary">
                        <span class="badge primary">Create publisher account</span>
                        <h2>Register before submitting apps to the Appex marketplace.</h2>
                        <p>Create a secure publisher profile to submit software, manage releases, and track marketplace activity from one workspace.</p>
                        <ul class="access-list">
                            <li>Create a developer profile</li>
                            <li>Use the account for app submissions</li>
                            <li>Keep publishing separate from admin access</li>
                        </ul>
                    </section>

                    <form class="access-card" id="developerRegisterForm" method="post" action="{{ route('developer.register') }}" data-real-auth="true">
                        @csrf
                        <div class="panel-title-row">
                            <h2 class="panel-title">Create Developer Account</h2>
                        </div>
                        <div class="form-group">
                            <label for="developerRegisterName">Full name</label>
                            <input class="form-input" id="developerRegisterName" name="name" type="text" placeholder="Your name" autocomplete="name" required>
                        </div>
                        <div class="form-group">
                            <label for="developerRegisterEmail">Email</label>
                            <input class="form-input" id="developerRegisterEmail" name="email" type="email" placeholder="publisher@example.com" autocomplete="email" required>
                        </div>
                        <div class="form-group">
                            <label for="developerRegisterPassword">Password</label>
                            <input class="form-input" id="developerRegisterPassword" name="password" type="password" placeholder="Create a password" autocomplete="new-password" minlength="6" required>
                        </div>
                        <div class="form-group">
                            <label for="developerRegisterPasswordConfirmation">Confirm password</label>
                            <input class="form-input" id="developerRegisterPasswordConfirmation" name="password_confirmation" type="password" placeholder="Repeat password" autocomplete="new-password" minlength="6" required>
                        </div>
                        <button class="btn-primary" type="submit">Create developer account</button>
                        <button class="btn-secondary footer-tab-link" type="button" data-tab="developer-login">Already have an account? Sign in</button>
                        <p class="access-status" aria-live="polite"></p>
                    </form>
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

            <!-- Reviews and ratings section -->
            <div class="detail-section">
                <h3 class="view-title" style="font-size: 16px; margin-bottom: 12px;">
                    <span>Ratings & Reviews</span>
                    <button class="btn-primary" id="openReviewFormBtn" style="padding: 6px 12px; font-size: 12px;" type="button">Write Review</button>
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
            <div class="detail-section" style="border-top: 1px solid var(--border-color); padding-top: 24px;">
                <h3 class="view-title" style="font-size: 16px; margin-bottom: 12px;">
                    <span>Bug Reports</span>
                    <button class="btn-primary" id="openBugFormBtn" style="padding: 6px 12px; font-size: 12px; background-color: var(--danger);" type="button">Report Bug</button>
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
                    <button type="submit" class="btn-primary">Submit to Queue</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Live Alerts / Toast Container -->
    <div class="toast-container" id="toastContainer"></div>


</body>
</html>
