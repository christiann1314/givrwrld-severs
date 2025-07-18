<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StripeWebhookController;
use App\Http\Controllers\UserServerController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Stripe webhook endpoint
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handleWebhook']);

// User server status endpoint
Route::post('/user/server-status', [UserServerController::class, 'getServerStatus']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});