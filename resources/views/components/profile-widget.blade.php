@php
    $profileUser = auth()->user();
    $profileRole = $profileUser?->role;
    $profileName = $profileUser?->name ?? 'Guest User';
    $trimmedProfileName = trim($profileName);
    $profileAvatar = strtoupper($trimmedProfileName !== '' ? $trimmedProfileName[0] : 'G');
    $profileRoleLabel = match ($profileRole) {
        'admin' => 'Administrator',
        'developer' => 'Developer Publisher',
        default => 'Visitor',
    };
    $profileGradient = match ($profileRole) {
        'admin' => 'linear-gradient(135deg, #ff9f0a, #ff3b30)',
        'developer' => 'linear-gradient(135deg, #0071e3, #af52de)',
        default => 'linear-gradient(135deg, #86868b, #48484a)',
    };
    $accountNoteTitle = match ($profileRole) {
        'admin' => 'Admin access',
        'developer' => 'Developer access',
        default => 'Visitor access',
    };
    $accountNoteText = match ($profileRole) {
        'admin' => 'Signed in with moderation privileges.',
        'developer' => 'Signed in to the publishing workspace.',
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
</div>
