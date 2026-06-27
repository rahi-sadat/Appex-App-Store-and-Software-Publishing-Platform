<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (! $request->user()) {
            $loginRoute = in_array('admin', $roles, true) ? 'admin.login' : 'developer.login';

            return redirect()->route($loginRoute);
        }

        if (! in_array($request->user()->role, $roles, true)) {
            abort(403);
        }

        return $next($request);
    }
}
