<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function home(): Response
    {
        return Inertia::render('welcome');
    }

    public function offline(): Response
    {
        return Inertia::render('offline');
    }

    public function dashboard(): Response
    {
        return Inertia::render('dashboard');
    }

    public function appearance(): Response
    {
        return Inertia::render('settings/appearance');
    }
}
