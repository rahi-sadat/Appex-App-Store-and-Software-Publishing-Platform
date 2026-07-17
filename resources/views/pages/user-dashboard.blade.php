<!doctype html>
<html lang="en" data-theme="light">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Appex - My Dashboard</title>
    @include('components.theme-loader')
    @vite(['resources/css/app.css', 'resources/css/pages/discover.css', 'resources/css/pages/developer.css', 'resources/css/pages/user-dashboard.css', 'resources/js/core.js', 'resources/js/marketplace.js'])
</head>
<body
    data-page="user-dashboard"
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
                <div class="logo-icon"><span></span></div>
                <span class="brand-name">Appex</span>
            </div>

            <div class="header-search">
                <svg viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" stroke-linecap="round" stroke-linejoin="round"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <input type="text" id="globalAppSearch" placeholder="Search apps, packages, scripts..." aria-label="Search apps and components">
            </div>

            <div class="header-controls">
                <nav class="header-nav" aria-label="Main header navigation">
                    <a class="nav-item" href="{{ route('home') }}">
                        <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="16" y1="2" x2="16" y2="4" stroke-linecap="round" stroke-linejoin="round"/><line x1="8" y1="2" x2="8" y2="4" stroke-linecap="round" stroke-linejoin="round"/><line x1="3" y1="10" x2="21" y2="10" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        <span>Home</span>
                    </a>
                    <a class="nav-item" href="{{ route('discover') }}">
                        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" stroke-linecap="round" stroke-linejoin="round"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        <span>Discover</span>
                    </a>
                    <a class="nav-item" href="{{ route('about') }}">
                        <svg viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="9" stroke-linecap="round" stroke-linejoin="round"/>
                            <line x1="12" y1="11" x2="12" y2="16" stroke-linecap="round" stroke-linejoin="round"/>
                            <line x1="12" y1="8" x2="12.01" y2="8" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span>About</span>
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
            <div class="tab-panel active">
                <div class="view-header">
                    <span class="view-date">Welcome back, {{ $user->name }}</span>
                    <h1 class="view-title">My Dashboard</h1>
                </div>

                <div class="discover-controls">
                    <div class="category-pills" id="dashboardTabs" role="tablist">
                        <button class="category-pill active" data-tab="downloads" role="tab" onclick="switchDashboardTab('downloads')">My Downloads</button>
                        <button class="category-pill" data-tab="wishlist" role="tab" onclick="switchDashboardTab('wishlist')">Saved Apps</button>
                        <button class="category-pill" data-tab="notifications" role="tab" onclick="switchDashboardTab('notifications')">
                            Notifications
                            @if(auth()->user()->unreadNotifications->count() > 0)
                                <span style="background: var(--accent); color: white; padding: 2px 6px; border-radius: 10px; font-size: 10px; margin-left: 4px;">{{ auth()->user()->unreadNotifications->count() }}</span>
                            @endif
                        </button>
                    </div>
                </div>

                <!-- Notifications Section -->
                <div id="section-notifications" style="display: none;">
                    <h2 class="section-subtitle">Notifications</h2>
                    <div class="notifications-list" style="max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 12px;">
                        @forelse($notifications as $notification)
                        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 8px; {{ is_null($notification->read_at) ? 'border-left: 4px solid var(--accent);' : '' }}">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <h3 style="margin: 0; font-size: 16px; color: var(--text-primary);">{{ $notification->data['title'] ?? 'Notification' }}</h3>
                                <span style="font-size: 12px; color: var(--text-tertiary);">{{ $notification->created_at->diffForHumans() }}</span>
                            </div>
                            <p style="margin: 0; color: var(--text-secondary); font-size: 14px;">{{ $notification->data['message'] ?? '' }}</p>
                            @if(!empty($notification->data['action_url']))
                                <div><a href="{{ $notification->data['action_url'] }}" style="color: var(--accent); text-decoration: none; font-size: 13px; font-weight: 600;">View Details &rarr;</a></div>
                            @endif
                        </div>
                        @empty
                        <div style="padding: 40px 0; text-align: center; color: var(--text-secondary); font-size: 14px;">No new notifications.</div>
                        @endforelse
                    </div>
                </div>

                <!-- Downloads Section -->
                <div id="section-downloads">
                    <h2 class="section-subtitle">Apps I've Downloaded</h2>
                    <div class="app-grid">
                        @forelse($downloads as $download)
                        <div class="app-card">
                            <img class="app-card-icon" src="{{ $download->app->icon_path ? '/storage/'.$download->app->icon_path : 'https://placehold.co/128/e2e8f0/64748b?text='.urlencode($download->app->name) }}" alt="{{ $download->app->name }}">
                            <div class="app-card-info">
                                <h3 class="app-card-title">{{ $download->app->name }}</h3>
                                <span class="app-card-dev">Version downloaded: {{ $download->release->version ?? 'Unknown' }}</span>
                                <div class="app-card-rating">
                                    <span>Downloaded on: {{ \Carbon\Carbon::parse($download->downloaded_at)->format('M d, Y') }}</span>
                                </div>
                                @if($download->app->latestRelease && $download->app->latestRelease->version !== ($download->release->version ?? 'Unknown'))
                                    <span style="color: var(--accent); font-size: 11px; font-weight: 600;">Update Available!</span>
                                @endif
                            </div>
                            <div class="app-card-action">
                                <a href="{{ route('home') }}" class="app-get-btn" style="text-decoration: none; display: inline-block;">View App</a>
                            </div>
                        </div>
                        @empty
                        <div style="grid-column: 1/-1; padding: 40px 0; text-align: center; color: var(--text-secondary); font-size: 14px;">No downloaded apps yet.</div>
                        @endforelse
                    </div>
                </div>

                <!-- Wishlist Section -->
                <div id="section-wishlist" style="display: none;">
                    <h2 class="section-subtitle">My Saved Apps</h2>
                    <div class="app-grid">
                        @forelse($wishlists as $wishlist)
                        <div class="app-card">
                            <img class="app-card-icon" src="{{ $wishlist->app->icon_path ? '/storage/'.$wishlist->app->icon_path : 'https://placehold.co/128/e2e8f0/64748b?text='.urlencode($wishlist->app->name) }}" alt="{{ $wishlist->app->name }}">
                            <div class="app-card-info">
                                <h3 class="app-card-title">{{ $wishlist->app->name }}</h3>
                                <span class="app-card-dev">{{ $wishlist->app->developer->name ?? 'Unknown' }}</span>
                                <div class="app-card-rating">
                                    <span>Saved on: {{ $wishlist->created_at->format('M d, Y') }}</span>
                                </div>
                            </div>
                            <div class="app-card-action">
                                <button class="app-get-btn" onclick="toggleWishlist({{ $wishlist->app->id }}, this)">Unsave</button>
                            </div>
                        </div>
                        @empty
                        <div style="grid-column: 1/-1; padding: 40px 0; text-align: center; color: var(--text-secondary); font-size: 14px;">No saved apps yet.</div>
                        @endforelse
                    </div>
                </div>

            </div>
        </main>
    </div>

    <script>
        function switchDashboardTab(tabId) {
            const allowedTabs = ['downloads', 'wishlist', 'notifications'];
            if (!allowedTabs.includes(tabId)) {
                tabId = 'downloads';
            }

            document.querySelectorAll('#dashboardTabs .category-pill').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector('#dashboardTabs [data-tab="' + tabId + '"]')?.classList.add('active');

            document.getElementById('section-downloads').style.display = tabId === 'downloads' ? 'block' : 'none';
            document.getElementById('section-wishlist').style.display = tabId === 'wishlist' ? 'block' : 'none';
            document.getElementById('section-notifications').style.display = tabId === 'notifications' ? 'block' : 'none';

            if (window.location.hash !== '#' + tabId) {
                history.replaceState(null, '', '#' + tabId);
            }
        }

        window.addEventListener('DOMContentLoaded', () => {
            switchDashboardTab((window.location.hash || '#downloads').replace('#', ''));
        });

        window.addEventListener('hashchange', () => {
            switchDashboardTab((window.location.hash || '#downloads').replace('#', ''));
        });
        
        async function toggleWishlist(appId, btn) {
            btn.textContent = '...';
            const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
            const res = await fetch('/wishlist/toggle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({ app_id: appId })
            });
            const data = await res.json();
            if (data.status === 'removed') {
                btn.closest('.app-card').remove();
            } else {
                btn.textContent = 'Saved';
            }
        }
    </script>

</body>
</html>
