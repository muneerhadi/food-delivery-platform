<?php

namespace App\Http\Resources\Admin;

use App\Support\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminRestaurantDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'logo' => MediaUrl::public($this->logo, $request),
            'cover_image' => MediaUrl::public($this->cover_image, $request),
            'address' => $this->address,
            'city' => $this->city,
            'lat' => $this->lat,
            'lng' => $this->lng,
            'phone' => $this->phone,
            'email' => $this->email,
            'opening_time' => $this->opening_time,
            'closing_time' => $this->closing_time,
            'minimum_order' => $this->minimum_order,
            'delivery_fee' => $this->delivery_fee,
            'delivery_time' => $this->delivery_time,
            'commission_rate' => $this->commission_rate,
            'is_open' => $this->is_open,
            'is_approved' => $this->is_approved,
            'rejection_reason' => $this->rejection_reason,
            'is_active' => $this->is_active,
            'rating' => $this->rating,
            'total_reviews' => $this->total_reviews,
            'owner' => $this->when($this->relationLoaded('owner'), fn () => [
                'id' => $this->owner->id,
                'name' => $this->owner->name,
                'email' => $this->owner->email,
                'phone' => $this->owner->phone,
            ]),
            'created_at' => $this->created_at,
        ];
    }
}
