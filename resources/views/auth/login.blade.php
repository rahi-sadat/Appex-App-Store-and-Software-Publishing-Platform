@extends('layouts.guest')

@section('title', 'Appex - Sign in')

@section('content')
    <main class="main-content">
        <section class="access-login-grid" style="max-width: 960px; margin: 48px auto;">
            <div class="access-copy" aria-label="Account sign in summary">
                <div class="brand-section" style="margin-bottom: 28px;">
                    <div class="logo-icon"><span></span></div>
                    <span class="brand-name">Appex</span>
                </div>
                <span class="badge primary">User account</span>
                <h1>Sign in with Breeze authentication.</h1>
                <p>Use your Appex account to save apps, manage downloads, review software, and keep track of marketplace notifications.</p>
                <ul class="access-list">
                    <li>Save apps to your dashboard</li>
                    <li>Post reviews and bug reports</li>
                    <li>Keep developer access separate when publishing</li>
                </ul>
            </div>

            <form class="access-card" method="post" action="{{ route('login') }}">
                @csrf
                <div class="panel-title-row">
                    <h2 class="panel-title">Sign In</h2>
                </div>

                @if (session('status'))
                    <p class="access-status" style="color: var(--success);">{{ session('status') }}</p>
                @endif

                @if ($errors->any())
                    <p class="access-status" style="color: var(--danger);">{{ $errors->first() }}</p>
                @endif

                <div class="form-group">
                    <label for="email">Email</label>
                    <input class="form-input" id="email" name="email" type="email" value="{{ old('email') }}" autocomplete="username" required autofocus>
                </div>

                <div class="form-group">
                    <label for="password">Password</label>
                    <input class="form-input" id="password" name="password" type="password" autocomplete="current-password" required>
                </div>

                <label style="display: flex; align-items: center; gap: 8px; color: var(--text-secondary); font-size: 13px;">
                    <input name="remember" type="checkbox" style="width: 16px; height: 16px;">
                    <span>Remember me</span>
                </label>

                <button class="btn-primary" type="submit">Sign in</button>
                <a class="btn-secondary" href="{{ route('register') }}" style="display: inline-flex; justify-content: center; text-decoration: none;">Create account</a>
                <a href="{{ route('developer.login') }}" style="color: var(--accent); font-size: 13px; font-weight: 600; text-decoration: none;">Developer login</a>
            </form>
        </section>
    </main>
@endsection
