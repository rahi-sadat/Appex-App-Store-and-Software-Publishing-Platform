@props(['mode' => 'routes'])

@php
    $isSpa = $mode === 'spa';
    $user = auth()->user();
    $developerLabel = $user && $user->role === 'developer' ? 'Developer Console' : 'Publish App';
@endphp

<footer class="site-footer">
    <div class="footer-grid">
        <div class="footer-col">
            <h3>Marketplace</h3>
            <ul>
                @if($isSpa)
                    <li><a href="#" class="footer-tab-link" data-tab="today">Home</a></li>
                    <li><a href="#" class="footer-tab-link" data-tab="discover">Discover</a></li>
                    <li><a href="#" class="footer-tab-link" data-tab="about">About Appex</a></li>
                @else
                    <li><a href="{{ route('home') }}" class="footer-tab-link">Home</a></li>
                    <li><a href="{{ route('discover') }}" class="footer-tab-link">Discover</a></li>
                    <li><a href="{{ route('about') }}" class="footer-tab-link">About Appex</a></li>
                @endif
            </ul>
        </div>

        <div class="footer-col">
            <h3>Support</h3>
            <ul>
                <li><a href="{{ route('contact') }}">Contact Us</a></li>
                <li><a href="{{ route('user.guide') }}">User Guide</a></li>
                <li><a href="mailto:support@appex.dev">Email Support</a></li>
                @if($isSpa)
                    <li><a href="#" class="footer-tab-link" data-tab="api">API Docs</a></li>
                @else
                    <li><a href="{{ route('api.docs') }}" class="footer-tab-link">API Docs</a></li>
                @endif
            </ul>
        </div>

        <div class="footer-col">
            <h3>Accounts</h3>
            <ul>
                @if(auth()->guest() || optional($user)->role === 'developer')
                    @if($isSpa)
                        <li><a href="#" class="footer-tab-link" data-tab="developer-login">{{ $developerLabel }}</a></li>
                    @else
                        <li><a href="{{ auth()->check() ? route('developer') : route('developer.login') }}" class="footer-tab-link">{{ $developerLabel }}</a></li>
                    @endif
                @endif

                @if(optional($user)->role === 'admin')
                    @if($isSpa)
                        <li><a href="#" class="footer-tab-link" data-tab="admin">Admin Dashboard</a></li>
                    @else
                        <li><a href="{{ route('admin') }}" class="footer-tab-link">Admin Dashboard</a></li>
                    @endif
                @endif

                @if(optional($user)->role === 'user' && !$isSpa)
                    <li><a href="{{ route('user.dashboard') }}" class="footer-tab-link">User Dashboard</a></li>
                @endif
            </ul>
        </div>

        <div class="footer-col">
            <h3>Legal</h3>
            <ul>
                <li><a href="{{ route('privacy') }}">Privacy Policy</a></li>
                <li><a href="{{ route('terms') }}">Terms of Service</a></li>
                <li><a href="{{ route('security') }}">Security</a></li>
            </ul>
        </div>
    </div>

    <div class="footer-bottom">
        <span class="copyright">&copy; 2026 Appex Marketplace. All rights reserved.</span>
        <a href="mailto:support@appex.dev" class="footer-contact-link">support@appex.dev</a>
    </div>
</footer>
