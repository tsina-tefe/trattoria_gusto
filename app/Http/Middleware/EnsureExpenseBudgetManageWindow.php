<?php

namespace App\Http\Middleware;

use App\Support\ExpenseBudgetAccess;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureExpenseBudgetManageWindow
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! ExpenseBudgetAccess::canManage($request->user())) {
            abort(403, ExpenseBudgetAccess::manageDeniedMessage());
        }

        return $next($request);
    }
}
