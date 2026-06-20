<?php

namespace App\Http\Resources\Restaurant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RestaurantOwnerProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'logo' => $this->logo,
            'cover_image' => $this->cover_image,
            'address' => $this->address,
            'city' => $this->city,
            'phone' => $this->phone,
            'email' => $this->email,
            'opening_time' => $this->opening_time,
            'closing_time' => $this->closing_time,
            'minimum_order' => $this->minimum_order,
            'delivery_fee' => $this->delivery_fee,
            'delivery_time' => $this->delivery_time,
            'is_open' => $this->is_open,
            'is_approved' => $this->is_approved,
            'rating' => $this->rating,
            'total_reviews' => $this->total_reviews,
        ];
    }
}
