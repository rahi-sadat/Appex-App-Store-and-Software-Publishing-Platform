<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    // Only the fields used by the first auth flows can be mass assigned.
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    // Keep credentials out of serialized user payloads.
    protected $hidden = [
        'password',
        'remember_token',
    ];

    // Let Laravel handle password hashing consistently across create and update calls.
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
