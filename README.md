# Appex

Appex is an app and software publishing platform for web apps, Android apps, desktop tools, packages, scripts, templates, calculators, and mini tools.

## First Progress

This milestone sets up the working folders and ships the first UI screen:

- Laravel-ready folders for routes, controllers, middleware, models, services, database work, views, public assets, and tests.
- A polished static login preview at `public/login.html`.
- Shared project assets in `public/assets`.
- Initial Laravel route placeholders in `routes/web.php` and `routes/api.php`.
- Planning notes in `docs/`.

## Preview

Open `public/login.html` in a browser to view the current UI.

## Run With Laravel Artisan

Install dependencies once:

```powershell
composer install
copy .env.example .env
php artisan key:generate
```

Start the Laravel dev server:

```powershell
php artisan serve
```

Then open `http://127.0.0.1:8000`.

Or run a local development server from the project root:

```powershell
.\scripts\serve.ps1
```

Then open `http://127.0.0.1:8000`.

If PowerShell blocks local scripts, run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\serve.ps1
```

## Main Build Lanes

- Public store: explore, categories, app detail pages, developer profiles, trending and top-rated software.
- User workspace: saved apps, download history, reviews, bug reports, followed developers.
- Developer console: app submission, versions, changelogs, releases, reviews, bugs, analytics, API keys.
- Admin console: approvals, categories, tags, review moderation, featured apps, reports, audit logs.
- REST API: public app data, downloads, reviews, bug reports, usage events, analytics.
