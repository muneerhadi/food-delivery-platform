<?php

namespace App\Http\Resources;

use App\Support\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RestaurantDetailResource extends JsonResource
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
            'rating' => $this->rating,
            'total_reviews' => $this->total_reviews,
            'is_open' => $this->is_open,
            'categories' => CategoryResource::collection($this->whenLoaded('categories')),
        ];
    }
}
