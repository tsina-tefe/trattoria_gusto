<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Budget Module Routes
|--------------------------------------------------------------------------
|
| Sub-modules are registered here as each phase lands: Sales Budget,
| Expense Budget, Bank Balance and Weekly Budget. Required from web.php
| inside the ['auth', 'verified'] group.
|
*/

Route::middleware(['auth', 'verified'])->group(function () {
    //
});
