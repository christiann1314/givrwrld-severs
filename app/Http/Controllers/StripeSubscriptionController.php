<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\Customer;
use Stripe\Checkout\Session;
use Stripe\Subscription;
use Stripe\BillingPortal\Session as PortalSession;
use App\Models\Subscriber;

class StripeSubscriptionController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(env('STRIPE_SECRET_KEY'));
    }

    public function createCheckout(Request $request)
    {
        try {
            Log::info('Create checkout request received', $request->all());

            $email = $request->input('email');
            $priceId = $request->input('price_id');
            $planName = $request->input('plan_name', 'Premium Subscription');

            if (!$email) {
                return response()->json(['error' => 'Email is required'], 400);
            }

            // Check if customer exists
            $customers = Customer::all(['email' => $email, 'limit' => 1]);
            $customerId = null;
            
            if (count($customers->data) > 0) {
                $customerId = $customers->data[0]->id;
                Log::info('Existing customer found', ['customer_id' => $customerId]);
            }

            $sessionData = [
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'usd',
                        'product_data' => ['name' => $planName],
                        'unit_amount' => $request->input('amount', 799), // Default $7.99
                        'recurring' => ['interval' => 'month'],
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'subscription',
                'success_url' => $request->input('success_url', url('/success')),
                'cancel_url' => $request->input('cancel_url', url('/cancel')),
            ];

            if ($customerId) {
                $sessionData['customer'] = $customerId;
            } else {
                $sessionData['customer_email'] = $email;
            }

            $session = Session::create($sessionData);

            Log::info('Stripe checkout session created', ['session_id' => $session->id]);

            return response()->json([
                'url' => $session->url,
                'session_id' => $session->id
            ]);

        } catch (\Exception $e) {
            Log::error('Stripe checkout error', ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function checkSubscription(Request $request)
    {
        try {
            Log::info('Check subscription request received');

            $email = $request->input('email');
            if (!$email) {
                return response()->json(['error' => 'Email is required'], 400);
            }

            // Check if customer exists in Stripe
            $customers = Customer::all(['email' => $email, 'limit' => 1]);
            
            if (count($customers->data) === 0) {
                Log::info('No customer found, updating unsubscribed state', ['email' => $email]);
                
                Subscriber::updateOrCreate(
                    ['email' => $email],
                    [
                        'stripe_customer_id' => null,
                        'subscribed' => false,
                        'subscription_tier' => null,
                        'subscription_end' => null,
                        'updated_at' => now(),
                    ]
                );

                return response()->json(['subscribed' => false]);
            }

            $customerId = $customers->data[0]->id;
            Log::info('Found Stripe customer', ['customer_id' => $customerId]);

            // Check for active subscriptions
            $subscriptions = Subscription::all([
                'customer' => $customerId,
                'status' => 'active',
                'limit' => 1,
            ]);

            $hasActiveSub = count($subscriptions->data) > 0;
            $subscriptionTier = null;
            $subscriptionEnd = null;

            if ($hasActiveSub) {
                $subscription = $subscriptions->data[0];
                $subscriptionEnd = date('Y-m-d H:i:s', $subscription->current_period_end);
                
                // Determine tier based on price
                $priceId = $subscription->items->data[0]->price->id;
                $price = \Stripe\Price::retrieve($priceId);
                $amount = $price->unit_amount ?? 0;
                
                if ($amount <= 999) {
                    $subscriptionTier = "Basic";
                } elseif ($amount <= 1999) {
                    $subscriptionTier = "Premium";
                } else {
                    $subscriptionTier = "Enterprise";
                }

                Log::info('Active subscription found', [
                    'subscription_id' => $subscription->id,
                    'tier' => $subscriptionTier,
                    'end_date' => $subscriptionEnd
                ]);
            } else {
                Log::info('No active subscription found');
            }

            // Update database
            Subscriber::updateOrCreate(
                ['email' => $email],
                [
                    'stripe_customer_id' => $customerId,
                    'subscribed' => $hasActiveSub,
                    'subscription_tier' => $subscriptionTier,
                    'subscription_end' => $subscriptionEnd,
                    'updated_at' => now(),
                ]
            );

            return response()->json([
                'subscribed' => $hasActiveSub,
                'subscription_tier' => $subscriptionTier,
                'subscription_end' => $subscriptionEnd
            ]);

        } catch (\Exception $e) {
            Log::error('Check subscription error', ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function customerPortal(Request $request)
    {
        try {
            Log::info('Customer portal request received');

            $email = $request->input('email');
            if (!$email) {
                return response()->json(['error' => 'Email is required'], 400);
            }

            // Find customer
            $customers = Customer::all(['email' => $email, 'limit' => 1]);
            
            if (count($customers->data) === 0) {
                return response()->json(['error' => 'No Stripe customer found'], 404);
            }

            $customerId = $customers->data[0]->id;
            
            $portalSession = PortalSession::create([
                'customer' => $customerId,
                'return_url' => $request->input('return_url', url('/')),
            ]);

            Log::info('Customer portal session created', ['session_id' => $portalSession->id]);

            return response()->json(['url' => $portalSession->url]);

        } catch (\Exception $e) {
            Log::error('Customer portal error', ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}