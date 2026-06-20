<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'customer_name' => $this->when(
                $this->relationLoaded('customer') && $this->customer,
                fn () => explode(' ', $this->customer->name)[0]
            ),
            'restaurant_rating' => $this->restaurant_rating,
            'driver_rating' => $this->driver_rating,
            'comment' => $this->comment,
            'created_at' => $this->created_at,
        ];
    }
}
