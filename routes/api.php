<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StripePaymentController;
use App\Http\Controllers\StripeSubscriptionController;
use App\Http\Controllers\StripeWebhookController;
use App\Http\Controllers\UserServerController;
use App\Http\Middleware\RateLimitMiddleware;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Stripe subscription routes (payment rate limiting)
Route::middleware([RateLimitMiddleware::class . ':payment'])->group(function () {
    Route::post('/create-checkout', [StripeSubscriptionController::class, 'createCheckout']);
    Route::post('/customer-portal', [StripeSubscriptionController::class, 'customerPortal']);
    Route::post('/create-checkout-session', [StripePaymentController::class, 'createCheckoutSession']);
});

// User data endpoints (user_data rate limiting)
Route::middleware([RateLimitMiddleware::class . ':user_data'])->group(function () {
    Route::post('/check-subscription', [StripeSubscriptionController::class, 'checkSubscription']);
    Route::post('/user/server-status', [UserServerController::class, 'getServerStatus']);
    Route::post('/user/stats', [UserServerController::class, 'getUserStats']);
    Route::post('/user/servers', [UserServerController::class, 'getUserServers']);
});

// Webhook endpoint (no rate limiting for webhooks)
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handleWebhook']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});