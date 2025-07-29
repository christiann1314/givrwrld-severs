<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscriber extends Model
{
    use HasFactory;

    protected $fillable = [
        'email',
        'user_id',
        'stripe_customer_id',
        'subscribed',
        'subscription_tier',
        'subscription_end',
        'updated_at',
    ];

    protected $casts = [
        'subscribed' => 'boolean',
        'subscription_end' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}