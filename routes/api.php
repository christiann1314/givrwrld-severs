<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StripePaymentController;
use App\Http\Controllers\StripeSubscriptionController;
use App\Http\Controllers\StripeWebhookController;
use App\Http\Controllers\UserServerController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Stripe subscription routes
Route::post('/create-checkout', [StripeSubscriptionController::class, 'createCheckout']);
Route::post('/check-subscription', [StripeSubscriptionController::class, 'checkSubscription']);
Route::post('/customer-portal', [StripeSubscriptionController::class, 'customerPortal']);

// Legacy Stripe payment routes
Route::post('/create-checkout-session', [StripePaymentController::class, 'createCheckoutSession'])
    ->middleware('api');

// Stripe webhook endpoint
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handleWebhook']);

// User server endpoints
Route::post('/user/server-status', [UserServerController::class, 'getServerStatus']);
Route::post('/user/stats', [UserServerController::class, 'getUserStats']);
Route::post('/user/servers', [UserServerController::class, 'getUserServers']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});