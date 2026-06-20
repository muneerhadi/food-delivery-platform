<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Order $order,
        public string $message,
    ) {
        $this->order->loadMissing('driver');
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('orders.'.$this->order->customer_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'order.status.updated';
    }

    public function broadcastWith(): array
    {
        $driver = $this->order->driver;

        return [
            'order_number' => $this->order->order_number,
            'status' => $this->order->status,
            'message' => $this->message,
            'timestamp' => now()->toIso8601String(),
            'driver' => $driver ? [
                'id' => $driver->id,
                'name' => $driver->name,
                'phone' => $driver->phone,
                'avatar' => $driver->avatar,
            ] : null,
        ];
    }
}
