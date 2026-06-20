<?php

namespace App\Http\Resources;

use App\Support\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderListResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'status' => $this->status,
            'total' => $this->total,
            'payment_method' => $this->payment_method,
            'payment_status' => $this->payment_status,
            'items_count' => $this->whenCounted('items'),
            'restaurant' => $this->when($this->relationLoaded('restaurant') && $this->restaurant, fn () => [
                'name' => $this->restaurant->name,
                'logo' => MediaUrl::public($this->restaurant->logo, $request),
            ]),
            'created_at' => $this->created_at,
        ];
    }
}
