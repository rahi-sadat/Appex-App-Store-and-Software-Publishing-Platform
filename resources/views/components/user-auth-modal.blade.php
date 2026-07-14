<!-- User Authentication Modal -->
<div class="modal-overlay" id="userAuthModalOverlay" role="dialog" aria-modal="true" aria-labelledby="userAuthModalTitle">
    <div class="modal-content" style="max-width: 420px; padding: 32px;">
        <div class="modal-header" style="margin-bottom: 24px; border-bottom: none; padding-bottom: 0; display: flex; justify-content: space-between; align-items: center;">
            <h2 class="modal-title" id="userAuthModalTitle" style="font-size: 22px; font-weight: 700; font-family: var(--font-heading);">Sign in to Appex</h2>
            <button class="close-btn" id="closeUserAuthModalBtn" type="button" aria-label="Close authentication modal" style="background: none; border: none; cursor: pointer; color: var(--text-secondary);">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18" stroke-linecap="round" stroke-linejoin="round"/>
                    <line x1="6" y1="6" x2="18" y2="18" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        </div>

        <!-- Login Form -->
        <div id="userLoginFormContainer">
            <form id="userLoginForm" method="post" action="{{ route('login') }}" style="display: flex; flex-direction: column; gap: 16px;">
                @csrf
                <div class="form-group">
                    <label for="userLoginEmail" style="font-weight: 600; font-size: 13px; color: var(--text-secondary); margin-bottom: 6px; display: block;">Email Address</label>
                    <input class="form-input" id="userLoginEmail" name="email" type="email" placeholder="name@example.com" autocomplete="username" required style="width: 100%; padding: 10px 12px; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-primary);">
                </div>
                <div class="form-group">
                    <label for="userLoginPassword" style="font-weight: 600; font-size: 13px; color: var(--text-secondary); margin-bottom: 6px; display: block;">Password</label>
                    <input class="form-input" id="userLoginPassword" name="password" type="password" placeholder="Password" autocomplete="current-password" required style="width: 100%; padding: 10px 12px; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-primary);">
                </div>
                <button type="submit" class="btn-primary" style="width: 100%; padding: 12px; border-radius: var(--radius-md); font-weight: 600; font-size: 14px; margin-top: 8px;">Sign In</button>
                <div style="text-align: center; margin-top: 12px; font-size: 13px; color: var(--text-secondary);">
                    Don't have an account? <a href="#" id="toggleToRegister" style="color: var(--accent); font-weight: 600; text-decoration: none;">Create one now</a>
                </div>
            </form>
        </div>

        <!-- Register Form (Hidden by default) -->
        <div id="userRegisterFormContainer" style="display: none;">
            <form id="userRegisterForm" method="post" action="{{ route('register') }}" style="display: flex; flex-direction: column; gap: 16px;">
                @csrf
                <div class="form-group">
                    <label for="userRegisterName" style="font-weight: 600; font-size: 13px; color: var(--text-secondary); margin-bottom: 6px; display: block;">Full Name</label>
                    <input class="form-input" id="userRegisterName" name="name" type="text" placeholder="Full name" autocomplete="name" required style="width: 100%; padding: 10px 12px; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-primary);">
                </div>
                <div class="form-group">
                    <label for="userRegisterEmail" style="font-weight: 600; font-size: 13px; color: var(--text-secondary); margin-bottom: 6px; display: block;">Email Address</label>
                    <input class="form-input" id="userRegisterEmail" name="email" type="email" placeholder="name@example.com" autocomplete="username" required style="width: 100%; padding: 10px 12px; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-primary);">
                </div>
                <div class="form-group">
                    <label for="userRegisterPassword" style="font-weight: 600; font-size: 13px; color: var(--text-secondary); margin-bottom: 6px; display: block;">Password</label>
                    <input class="form-input" id="userRegisterPassword" name="password" type="password" placeholder="Min. 8 characters" autocomplete="new-password" required minlength="8" style="width: 100%; padding: 10px 12px; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-primary);">
                </div>
                <div class="form-group">
                    <label for="userRegisterPasswordConfirmation" style="font-weight: 600; font-size: 13px; color: var(--text-secondary); margin-bottom: 6px; display: block;">Confirm Password</label>
                    <input class="form-input" id="userRegisterPasswordConfirmation" name="password_confirmation" type="password" placeholder="Confirm password" autocomplete="new-password" required minlength="8" style="width: 100%; padding: 10px 12px; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-primary);">
                </div>
                <button type="submit" class="btn-primary" style="width: 100%; padding: 12px; border-radius: var(--radius-md); font-weight: 600; font-size: 14px; margin-top: 8px;">Create Account</button>
                <div style="text-align: center; margin-top: 12px; font-size: 13px; color: var(--text-secondary);">
                    Already have an account? <a href="#" id="toggleToLogin" style="color: var(--accent); font-weight: 600; text-decoration: none;">Sign in</a>
                </div>
            </form>
        </div>
    </div>
</div>
