<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DriverLocation extends Model
{
    public const CREATED_AT = null;

    protected $fillable = [
        'driver_id',
        'lat',
        'lng',
        'heading',
        'speed',
        'is_online',
    ];

    protected function casts(): array
    {
        return [
            'lat' => 'decimal:7',
            'lng' => 'decimal:7',
            'heading' => 'decimal:2',
            'speed' => 'decimal:2',
            'is_online' => 'boolean',
            'updated_at' => 'datetime',
        ];
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function scopeOnline(Builder $query): Builder
    {
        return $query->where('is_online', true);
    }
}
