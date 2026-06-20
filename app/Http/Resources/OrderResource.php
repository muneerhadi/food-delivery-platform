<?php

namespace App\Http\Resources;

use App\Support\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
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
            'subtotal' => $this->subtotal,
            'delivery_fee' => $this->delivery_fee,
            'discount_amount' => $this->discount_amount,
            'total' => $this->total,
            'payment_method' => $this->payment_method,
            'payment_status' => $this->payment_status,
            'delivery_address' => $this->delivery_address,
            'notes' => $this->notes,
            'confirmed_at' => $this->confirmed_at,
            'picked_up_at' => $this->picked_up_at,
            'delivered_at' => $this->delivered_at,
            'cancelled_at' => $this->cancelled_at,
            'cancellation_reason' => $this->cancellation_reason,
            'created_at' => $this->created_at,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'restaurant' => $this->when($this->relationLoaded('restaurant') && $this->restaurant, fn () => [
                'id' => $this->restaurant->id,
                'name' => $this->restaurant->name,
                'logo' => MediaUrl::public($this->restaurant->logo, $request),
                'phone' => $this->restaurant->phone,
            ]),
            'driver' => $this->when($this->relationLoaded('driver') && $this->driver, fn () => [
                'id' => $this->driver->id,
                'name' => $this->driver->name,
                'phone' => $this->driver->phone,
                'avatar' => MediaUrl::public($this->driver->avatar, $request),
            ]),
        ];
    }
}
