<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminRestaurantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'city' => $this->city,
            'phone' => $this->phone,
            'is_approved' => $this->is_approved,
            'is_active' => $this->is_active,
            'is_open' => $this->is_open,
            'commission_rate' => $this->commission_rate,
            'rating' => $this->rating,
            'total_reviews' => $this->total_reviews,
            'owner' => $this->when($this->relationLoaded('owner'), fn () => [
                'id' => $this->owner->id,
                'name' => $this->owner->name,
                'email' => $this->owner->email,
            ]),
            'created_at' => $this->created_at,
        ];
    }
}
