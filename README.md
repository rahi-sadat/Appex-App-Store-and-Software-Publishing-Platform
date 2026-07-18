# Appex

Appex is a robust app and software publishing platform for web apps, Android apps, desktop tools, packages, scripts, templates, calculators, and mini tools.

## Features & Architecture

Appex provides a complete ecosystem for software distribution with separated role-based access controls:

- **Public Store**: Discover, search, and browse categories. View app details, ratings, and release notes. Access static info pages (Contact, User Guide, Privacy, Terms, Security).
- **User Dashboard**: Save apps to your personal wishlist, view download history, leave reviews, and manage notifications.
- **Developer Console**: Submit apps, manage versions, import apps directly from the Apple App Store or GitHub, upload release files, and monitor review status.
- **Admin Panel**: Review, approve, or reject submitted applications, moderate reviews, manage platform categories, and handle app deletion requests.
- **REST API**: Robust API endpoints for fetching public app data, managing downloads, handling events, and analytics.

## Tech Stack

- **Backend**: [Laravel](https://laravel.com/) (PHP)
- **Frontend**: Blade Templates, Vanilla CSS/JS, bundled via Vite
- **Database**: Relational Database (MySQL / PostgreSQL / SQLite) for managing users, apps, wishlists, and notifications.

## Local Development Setup

1. **Install PHP dependencies:**
   ```powershell
   composer install
   ```

2. **Environment Configuration:**
   ```powershell
   copy .env.example .env
   php artisan key:generate
   ```
   *Make sure to configure your `DB_CONNECTION` and other relevant database settings in the `.env` file.*

3. **Database Migrations & Seeding:**
   Run migrations and seed the database with initial marketplace data:
   ```powershell
   php artisan migrate --seed
   ```

4. **Install and Build Frontend Assets:**
   ```powershell
   npm install
   npm run build
   
   # Or to run the Vite dev server for hot-reloading:
   # npm run dev
   ```

5. **Start the Laravel Development Server:**
   ```powershell
   php artisan serve
   ```
   *The application will be accessible at [http://127.0.0.1:8000](http://127.0.0.1:8000).*

Alternatively, run a local development server using the provided script:
```powershell
.\scripts\serve.ps1
```
*(If PowerShell blocks local scripts, run: `powershell -ExecutionPolicy Bypass -File .\scripts\serve.ps1`)*

## Contact & Support

For help, developer support, or security concerns, visit the platform's Contact Page or email `support@appex.dev`.
