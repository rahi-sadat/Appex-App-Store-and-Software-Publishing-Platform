<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Appex')</title>
    @include('components.theme-loader')
    @vite([
        'resources/css/app.css',
        'resources/css/pages/home.css',
        'resources/css/pages/discover.css',
        'resources/css/pages/about.css',
        'resources/css/pages/auth.css',
        'resources/css/pages/developer.css',
        'resources/css/pages/admin.css',
        'resources/css/pages/api.css',
        'resources/js/core.js',
        'resources/js/marketplace.js'
    ])
</head>
<body>
    @yield('content')
</body>
</html>
