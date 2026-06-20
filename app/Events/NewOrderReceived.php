<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewOrderReceived implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Order $order)
    {
        $this->order->loadMissing(['customer:id,name,phone', 'items', 'restaurant:id,name']);
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('restaurant.'.$this->order->restaurant_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'order.received';
    }

    public function broadcastWith(): array
    {
        return [
            'order' => [
                'id' => $this->order->id,
                'order_number' => $this->order->order_number,
                'status' => $this->order->status,
                'subtotal' => $this->order->subtotal,
                'delivery_fee' => $this->order->delivery_fee,
                'discount_amount' => $this->order->discount_amount,
                'total' => $this->order->total,
                'payment_method' => $this->order->payment_method,
                'notes' => $this->order->notes,
                'created_at' => $this->order->created_at?->toIso8601String(),
                'customer' => $this->order->customer ? [
                    'id' => $this->order->customer->id,
                    'name' => $this->order->customer->name,
                    'phone' => $this->order->customer->phone,
                ] : null,
                'items' => $this->order->items->map(fn ($item) => [
                    'name' => $item->name,
                    'quantity' => $item->quantity,
                    'total' => $item->total,
                ])->values()->all(),
            ],
        ];
    }
}
