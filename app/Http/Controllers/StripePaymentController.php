<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use Stripe\Customer;
use Exception;
use Illuminate\Support\Facades\Log;

class StripePaymentController extends Controller
{
    public function __construct()
    {
        // Set the Stripe secret key
        Stripe::setApiKey(env('STRIPE_SECRET_KEY'));
    }

    public function createCheckoutSession(Request $request): Response
    {
        try {
            Log::info('Create checkout session request received', $request->all());

            // Validate the request
            $request->validate([
                'amount' => 'required|integer|min:1',
                'plan_name' => 'required|string',
                'userEmail' => 'nullable|email',
                'success_url' => 'nullable|url',
                'cancel_url' => 'nullable|url',
            ]);

            $amount = $request->input('amount');
            $planName = $request->input('plan_name');
            $userEmail = $request->input('userEmail', 'guest@example.com');
            $successUrl = $request->input('success_url', 'https://givrwrldservers.com/success');
            $cancelUrl = $request->input('cancel_url', 'https://givrwrldservers.com/dashboard');

            Log::info('Creating checkout session for user', [
                'email' => $userEmail,
                'amount' => $amount,
                'plan' => $planName
            ]);

            // Check if customer exists or create a new one
            $customerId = null;
            if ($userEmail && $userEmail !== 'guest@example.com') {
                try {
                    $customers = Customer::all(['email' => $userEmail, 'limit' => 1]);
                    if (!empty($customers->data)) {
                        $customerId = $customers->data[0]->id;
                        Log::info('Found existing customer', ['customer_id' => $customerId]);
                    } else {
                        $customer = Customer::create([
                            'email' => $userEmail,
                        ]);
                        $customerId = $customer->id;
                        Log::info('Created new customer', ['customer_id' => $customerId]);
                    }
                } catch (Exception $e) {
                    Log::warning('Could not handle customer creation/lookup: ' . $e->getMessage());
                    $customerId = null;
                }
            }

            // Create the checkout session
            $sessionData = [
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'usd',
                        'product_data' => [
                            'name' => $planName,
                        ],
                        'unit_amount' => $amount,
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => $successUrl,
                'cancel_url' => $cancelUrl,
                'metadata' => [
                    'user_email' => $userEmail,
                    'plan_name' => $planName,
                ],
            ];

            // Add customer if we have one
            if ($customerId) {
                $sessionData['customer'] = $customerId;
            } else {
                $sessionData['customer_email'] = $userEmail;
            }

            $session = Session::create($sessionData);

            Log::info('Checkout session created successfully', [
                'session_id' => $session->id,
                'checkout_url' => $session->url
            ]);

            return response([
                'checkout_url' => $session->url,
                'session_id' => $session->id,
            ], 200);

        } catch (Exception $e) {
            Log::error('Error creating checkout session: ' . $e->getMessage(), [
                'request_data' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            return response([
                'error' => 'Failed to create checkout session',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}