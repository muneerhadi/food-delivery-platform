<?php

namespace App\Http\Resources\Driver;

use App\Http\Resources\OrderItemResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DriverOrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'status' => $this->status,
            'subtotal' => $this->subtotal,
            'delivery_fee' => $this->delivery_fee,
            'total' => $this->total,
            'payment_method' => $this->payment_method,
            'delivery_address' => $this->delivery_address,
            'notes' => $this->notes,
            'confirmed_at' => $this->confirmed_at,
            'picked_up_at' => $this->picked_up_at,
            'delivered_at' => $this->delivered_at,
            'created_at' => $this->created_at,
            'customer' => $this->when($this->relationLoaded('customer') && $this->customer, fn () => [
                'id' => $this->customer->id,
                'name' => $this->customer->name,
                'phone' => $this->customer->phone,
                'avatar' => $this->customer->avatar,
            ]),
            'restaurant' => $this->when($this->relationLoaded('restaurant') && $this->restaurant, fn () => [
                'id' => $this->restaurant->id,
                'name' => $this->restaurant->name,
                'address' => $this->restaurant->address,
                'phone' => $this->restaurant->phone,
                'lat' => $this->restaurant->lat,
                'lng' => $this->restaurant->lng,
            ]),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
        ];
    }
}
