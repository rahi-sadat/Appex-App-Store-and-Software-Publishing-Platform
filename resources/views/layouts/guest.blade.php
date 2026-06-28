<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'Appex')</title>
    @include('components.theme-loader')
    <link rel="stylesheet" href="{{ asset('assets/css/app.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/pages/home.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/pages/discover.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/pages/about.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/pages/auth.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/pages/developer.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/pages/admin.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/pages/api.css') }}">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    @yield('content')

    <script src="{{ asset('assets/js/login.js') }}"></script>
</body>
</html>
