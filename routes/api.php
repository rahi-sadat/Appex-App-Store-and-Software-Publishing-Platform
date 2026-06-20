<?php

use Illuminate\Support\Facades\Route;

Route::prefix('apps')->group(function () {
    // GET /api/apps
    // GET /api/apps/{app}
    // POST /api/apps/{app}/download
    // POST /api/apps/{app}/reviews
    // POST /api/apps/{app}/bug-reports
});

Route::post('/track-event', function () {
    // External app usage events will land here after API key middleware is added.
});

