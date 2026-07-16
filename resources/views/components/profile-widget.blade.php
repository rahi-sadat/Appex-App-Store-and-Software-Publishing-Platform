@php
    $profileUser = auth()->user();
    $profileRole = $profileUser?->role;
    $profileName = $profileUser?->name ?? 'Guest User';
    $trimmedProfileName = trim($profileName);
    $profileAvatar = strtoupper($trimmedProfileName !== '' ? $trimmedProfileName[0] : 'G');
    $profileRoleLabel = match ($profileRole) {
        'admin' => 'Administrator',
        'developer' => 'Developer Publisher',
        'user' => 'App User',
        default => 'Visitor',
    };
    $profileGradient = match ($profileRole) {
        'admin' => 'linear-gradient(135deg, #ff9f0a, #ff3b30)',
        'developer' => 'linear-gradient(135deg, #0071e3, #af52de)',
        'user' => 'linear-gradient(135deg, #30d158, #34c759)',
        default => 'linear-gradient(135deg, #86868b, #48484a)',
    };
    $accountNoteTitle = match ($profileRole) {
        'admin' => 'Admin access',
        'developer' => 'Developer access',
        'user' => 'User access',
        default => 'Visitor access',
    };
    $accountNoteText = match ($profileRole) {
        'admin' => 'Signed in with moderation privileges.',
        'developer' => 'Signed in to the publishing workspace.',
        'user' => 'Signed in with your personal account.',
        default => 'Developer and admin workspaces require separate login.',
    };
@endphp

<button class="profile-widget-btn" id="profileDropdownTrigger" type="button" aria-label="User account profile settings">
    <div class="avatar" id="avatarIcon" style="background: {{ $profileGradient }};">{{ $profileAvatar }}</div>
    <span id="profileName">{{ $profileName }}</span>
</button>

<div class="profile-dropdown" id="profileDropdown">
    <div class="dropdown-user-info">
        <div class="avatar" id="dropdownAvatar" style="background: {{ $profileGradient }};">{{ $profileAvatar }}</div>
        <div class="dropdown-user-details">
            <span class="dropdown-name" id="dropdownName">{{ $profileName }}</span>
            <span class="dropdown-role" id="dropdownRole">{{ $profileRoleLabel }}</span>
        </div>
    </div>

    <div class="account-note">
        <span>{{ $accountNoteTitle }}</span>
        <small>{{ $accountNoteText }}</small>
    </div>

    @auth
        <div style="padding: 10px 16px;">
            <a href="{{ route('user.dashboard') }}#downloads" style="display: block; background: var(--bg-surface); border: 1px solid var(--border-color); color: var(--text-primary); text-align: center; padding: 8px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 500;">
                My Dashboard
            </a>
        </div>
        <form method="post" action="{{ route('logout') }}" class="logout-form">
            @csrf
            <button type="submit" class="logout-button">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M10 17l5-5-5-5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M15 12H3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Log out</span>
            </button>
        </form>
    @endauth

    @guest
        <div style="padding: 12px 16px; border-top: 1px solid var(--border-color); text-align: center;">
            <button type="button" id="dropdownSignInBtn" class="btn-primary" style="width: 100%; padding: 8px; border-radius: var(--radius-md); font-size: 13px; font-weight: 600;">Sign In / Register</button>
        </div>
    @endguest
</div>
