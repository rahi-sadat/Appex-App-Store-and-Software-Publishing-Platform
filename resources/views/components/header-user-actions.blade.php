@auth
@php
    $unreadCount = auth()->user()->unreadNotifications()->count();
@endphp

{{-- Dashboard shortcut --}}
<a href="{{ route('user.dashboard') }}#downloads"
   class="nav-item header-dashboard-link {{ request()->routeIs('user.dashboard') ? 'active' : '' }}"
   aria-label="My Dashboard"
   title="My Dashboard">
    <svg viewBox="0 0 24 24">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke-linecap="round" stroke-linejoin="round"/>
        <polyline points="9 22 9 12 15 12 15 22" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span>Dashboard</span>
</a>

{{-- Notification Bell --}}
<a href="{{ route('user.dashboard') }}#notifications"
   class="header-icon-btn notif-bell-btn"
   aria-label="Notifications"
   title="Notifications">
    <svg viewBox="0 0 24 24">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    @if($unreadCount > 0)
        <span class="notif-badge">{{ $unreadCount > 9 ? '9+' : $unreadCount }}</span>
    @endif
</a>
@endauth
