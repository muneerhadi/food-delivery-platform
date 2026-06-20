<?php

namespace App\Http\Resources;

use App\Support\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RestaurantListResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'logo' => MediaUrl::public($this->logo, $request),
            'cover_image' => MediaUrl::public($this->cover_image, $request),
            'address' => $this->address,
            'city' => $this->city,
            'rating' => $this->rating,
            'total_reviews' => $this->total_reviews,
            'delivery_fee' => $this->delivery_fee,
            'delivery_time' => $this->delivery_time,
            'minimum_order' => $this->minimum_order,
            'is_open' => $this->is_open,
            'distance_km' => $this->when(
                isset($this->distance_km),
                fn () => round((float) $this->distance_km, 2)
            ),
        ];
    }
}
