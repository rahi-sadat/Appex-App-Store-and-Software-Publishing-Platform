# Appex Project Structure

## Backend

- `app/Http/Controllers/Auth`: login, registration, session flow.
- `app/Http/Controllers/PublicStore`: home, explore, categories, app details, developer profiles.
- `app/Http/Controllers/User`: saved apps, downloads, reviews, bug reports.
- `app/Http/Controllers/Developer`: publishing workflow, versions, analytics, API keys.
- `app/Http/Controllers/Admin`: approvals, moderation, featured apps, reports, audit logs.
- `app/Http/Controllers/Api`: REST API controllers.
- `app/Http/Middleware`: roles, ownership, approvals, API key checks, rate limits, upload validation.
- `app/Models`: users, apps, categories, tags, versions, screenshots, reviews, bugs, downloads, usage events.
- `app/Services/Publishing`: app submission, version release, upload handling.
- `app/Services/Analytics`: dashboards, trend scoring, chart data.
- `app/Services/Moderation`: approval workflow, reports, review moderation.

## Frontend

- `resources/views/layouts`: shared Blade layouts.
- `resources/views/auth`: login and registration screens.
- `resources/views/public`: public marketplace pages.
- `resources/views/dashboard/user`: user workspace.
- `resources/views/dashboard/developer`: developer console.
- `resources/views/dashboard/admin`: admin console.
- `resources/views/components`: reusable Blade components.
- `public/assets/css`: browser-ready CSS for the first UI milestone.
- `public/assets/js`: browser-ready JavaScript interactions.
- `public/assets/images`: generated and exported product visuals.

## Data And APIs

- `routes/web.php`: web routes for Blade screens.
- `routes/api.php`: REST API route placeholders.
- `database/migrations`: schema for publishing, versions, analytics, reviews, bugs, and moderation.
- `database/seeders`: sample users, categories, tags, and apps.
- `database/factories`: test data factories.

## Verification

- `tests/Feature`: auth, publishing workflow, approval workflow, APIs.
- `tests/Unit`: service classes, scoring logic, middleware behavior.

