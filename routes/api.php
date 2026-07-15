<?php

use App\Http\Controllers\Api\AdminAppController;
use App\Http\Controllers\Api\AppController;
use App\Http\Controllers\Api\DeveloperAppController;
use Illuminate\Support\Facades\Route;

Route::get('/apps', [AppController::class, 'index'])->name('api.apps.index');
Route::get('/apps/{app}', [AppController::class, 'show'])->name('api.apps.show');

Route::middleware(['web', 'auth'])->group(function () {
    Route::post('/apps/{app}/download', [AppController::class, 'download'])->name('api.apps.download');
    Route::post('/apps/{app}/reviews', [AppController::class, 'review'])->name('api.apps.reviews.store');
    Route::post('/apps/{app}/bug-reports', [AppController::class, 'bugReport'])->name('api.apps.bug-reports.store');
});

Route::middleware(['web', 'auth'])->prefix('developer')->name('api.developer.')->group(function () {
    Route::get('/apps', [DeveloperAppController::class, 'index'])->name('apps.index');
    Route::post('/apps', [DeveloperAppController::class, 'store'])->name('apps.store');
    Route::put('/apps/{app}', [DeveloperAppController::class, 'update'])->name('apps.update');
    Route::post('/apps/{app}/submit', [DeveloperAppController::class, 'submit'])->name('apps.submit');
    Route::post('/apps/{app}/releases', [DeveloperAppController::class, 'storeRelease'])->name('apps.releases.store');
    Route::post('/apps/{app}/screenshots', [DeveloperAppController::class, 'storeScreenshot'])->name('apps.screenshots.store');
    Route::put('/apps/{app}/screenshots/reorder', [DeveloperAppController::class, 'reorderScreenshots'])->name('apps.screenshots.reorder');
    Route::post('/apps/{app}/icon', [DeveloperAppController::class, 'storeIcon'])->name('apps.icon.store');
    Route::put('/apps/{app}/bugs/{bug}/status', [DeveloperAppController::class, 'updateBugStatus'])->name('apps.bugs.status');
    Route::delete('/apps/{app}', [DeveloperAppController::class, 'destroy'])->name('apps.destroy');
});

Route::middleware(['web', 'auth'])->prefix('admin')->name('api.admin.')->group(function () {
    Route::get('/dashboard', [AdminAppController::class, 'dashboard'])->name('apps.dashboard');
    Route::get('/apps', [AdminAppController::class, 'index'])->name('apps.index');
    Route::get('/activities', [AdminAppController::class, 'activities'])->name('activities.index');
    Route::get('/apps/pending', [AdminAppController::class, 'pending'])->name('apps.pending');
    Route::post('/apps', [AdminAppController::class, 'store'])->name('apps.store');
    Route::put('/apps/{app}', [AdminAppController::class, 'update'])->name('apps.update');
    Route::put('/apps/{app}/screenshots/reorder', [AdminAppController::class, 'reorderScreenshots'])->name('apps.screenshots.reorder');
    Route::post('/apps/{app}/approve', [AdminAppController::class, 'approve'])->name('apps.approve');
    Route::post('/apps/{app}/reject', [AdminAppController::class, 'reject'])->name('apps.reject');
    Route::post('/apps/{app}/feature', [AdminAppController::class, 'feature'])->name('apps.feature');
    Route::post('/apps/{app}/approve-deletion', [AdminAppController::class, 'approveDeletion'])->name('apps.approve-deletion');
    Route::post('/apps/{app}/reject-deletion', [AdminAppController::class, 'rejectDeletion'])->name('apps.reject-deletion');
    Route::delete('/apps/{app}', [AdminAppController::class, 'destroy'])->name('apps.destroy');
});

Route::post('/track-event', function () {
    return response()->json([
        'message' => 'Tracking endpoint reserved for API-key protected events.',
    ], 202);
});
