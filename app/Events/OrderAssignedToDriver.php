<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderAssignedToDriver implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Order $order)
    {
        $this->order->loadMissing(['restaurant:id,name,address,city,lat,lng', 'customer:id,name,phone', 'items']);
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('driver.'.$this->order->driver_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'order.assigned';
    }

    public function broadcastWith(): array
    {
        return [
            'order' => [
                'id' => $this->order->id,
                'order_number' => $this->order->order_number,
                'status' => $this->order->status,
                'total' => $this->order->total,
                'delivery_address' => $this->order->delivery_address,
                'notes' => $this->order->notes,
                'customer' => $this->order->customer ? [
                    'name' => $this->order->customer->name,
                    'phone' => $this->order->customer->phone,
                ] : null,
                'restaurant' => $this->order->restaurant ? [
                    'id' => $this->order->restaurant->id,
                    'name' => $this->order->restaurant->name,
                    'address' => $this->order->restaurant->address,
                    'city' => $this->order->restaurant->city,
                    'lat' => $this->order->restaurant->lat,
                    'lng' => $this->order->restaurant->lng,
                ] : null,
                'items' => $this->order->items->map(fn ($item) => [
                    'name' => $item->name,
                    'quantity' => $item->quantity,
                ])->values()->all(),
            ],
        ];
    }
}
