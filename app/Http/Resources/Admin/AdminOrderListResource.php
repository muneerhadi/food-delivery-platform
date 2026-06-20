<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminOrderListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'status' => $this->status,
            'total' => $this->total,
            'payment_method' => $this->payment_method,
            'payment_status' => $this->payment_status,
            'customer' => $this->when($this->relationLoaded('customer') && $this->customer, fn () => [
                'name' => $this->customer->name,
            ]),
            'restaurant' => $this->when($this->relationLoaded('restaurant') && $this->restaurant, fn () => [
                'name' => $this->restaurant->name,
            ]),
            'driver' => $this->when($this->relationLoaded('driver') && $this->driver, fn () => [
                'name' => $this->driver->name,
            ]),
            'created_at' => $this->created_at,
        ];
    }
}
