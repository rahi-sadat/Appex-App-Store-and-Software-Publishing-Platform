@extends('layouts.guest')

@section('title', 'Appex - Create account')

@section('content')
    <main class="main-content">
        <section class="access-login-grid" style="max-width: 960px; margin: 48px auto;">
            <div class="access-copy" aria-label="Account registration summary">
                <div class="brand-section" style="margin-bottom: 28px;">
                    <div class="logo-icon"><span></span></div>
                    <span class="brand-name">Appex</span>
                </div>
                <span class="badge primary">Create account</span>
                <h1>Join Appex with Breeze registration.</h1>
                <p>Create a user account for saved apps, download history, reviews, bug reports, and marketplace notifications.</p>
                <ul class="access-list">
                    <li>Browse and save marketplace apps</li>
                    <li>Track downloads from your dashboard</li>
                    <li>Use a developer account only when publishing</li>
                </ul>
            </div>

            <form class="access-card" method="post" action="{{ route('register') }}">
                @csrf
                <div class="panel-title-row">
                    <h2 class="panel-title">Create Account</h2>
                </div>

                @if ($errors->any())
                    <p class="access-status" style="color: var(--danger);">{{ $errors->first() }}</p>
                @endif

                <div class="form-group">
                    <label for="name">Name</label>
                    <input class="form-input" id="name" name="name" type="text" value="{{ old('name') }}" autocomplete="name" required autofocus>
                </div>

                <div class="form-group">
                    <label for="email">Email</label>
                    <input class="form-input" id="email" name="email" type="email" value="{{ old('email') }}" autocomplete="username" required>
                </div>

                <div class="form-group">
                    <label for="password">Password</label>
                    <input class="form-input" id="password" name="password" type="password" autocomplete="new-password" required>
                </div>

                <div class="form-group">
                    <label for="password_confirmation">Confirm Password</label>
                    <input class="form-input" id="password_confirmation" name="password_confirmation" type="password" autocomplete="new-password" required>
                </div>

                <button class="btn-primary" type="submit">Create account</button>
                <a class="btn-secondary" href="{{ route('login') }}" style="display: inline-flex; justify-content: center; text-decoration: none;">Already have an account?</a>
            </form>
        </section>
    </main>
@endsection
