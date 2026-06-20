<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DriverLocationUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $orderNumber,
        public float $lat,
        public float $lng,
        public ?float $heading = null,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('tracking.'.$this->orderNumber),
        ];
    }

    public function broadcastAs(): string
    {
        return 'driver.location.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'order_number' => $this->orderNumber,
            'lat' => $this->lat,
            'lng' => $this->lng,
            'heading' => $this->heading,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
