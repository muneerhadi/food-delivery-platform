<?php

namespace App\Services;

use App\Events\DriverLocationUpdated;
use App\Events\NewOrderReceived;
use App\Events\OrderAssignedToDriver;
use App\Events\OrderStatusUpdated;
use App\Models\Notification;
use App\Models\Order;
use App\Models\User;

class NotificationService
{
    public static function send(int $userId, string $title, string $body, string $type, ?array $data = null): Notification
    {
        $notification = Notification::create([
            'user_id' => $userId,
            'title' => $title,
            'body' => $body,
            'type' => $type,
            'data' => $data,
        ]);

        $user = User::find($userId);

        if ($user) {
            app(FcmService::class)->sendToUser($user, $title, $body, $data ?? []);
        }

        return $notification;
    }

    public static function orderStatusUpdated(int $customerId, string $orderNumber, string $status, ?Order $order = null): Notification
    {
        $message = "Your order {$orderNumber} is now ".str_replace('_', ' ', $status).'.';

        $notification = self::send(
            $customerId,
            'Order Update',
            $message,
            'order_update',
            ['order_number' => $orderNumber, 'status' => $status]
        );

        $order ??= Order::where('order_number', $orderNumber)->with('driver')->first();

        if ($order) {
            event(new OrderStatusUpdated($order, $message));
        }

        return $notification;
    }

    public static function newOrderReceived(Order $order): void
    {
        $order->loadMissing(['restaurant.owner', 'customer', 'items']);

        event(new NewOrderReceived($order));

        if ($order->restaurant?->owner) {
            self::send(
                $order->restaurant->owner->id,
                'New Order',
                "New order {$order->order_number} received.",
                'order',
                ['order_number' => $order->order_number, 'restaurant_id' => $order->restaurant_id]
            );
        }
    }

    public static function orderAssignedToDriver(Order $order): void
    {
        $order->loadMissing(['restaurant', 'customer', 'items', 'driver']);

        if (! $order->driver_id) {
            return;
        }

        event(new OrderAssignedToDriver($order));

        self::send(
            $order->driver_id,
            'New Delivery Assignment',
            "You have been assigned order {$order->order_number}.",
            'order',
            ['order_number' => $order->order_number]
        );
    }

    public static function notifyDriversOrderReady(Order $order): void
    {
        $order->loadMissing('restaurant');

        $drivers = User::query()
            ->where('role', 'driver')
            ->where('is_active', true)
            ->get();

        $restaurantName = $order->restaurant?->name ?? 'the restaurant';

        foreach ($drivers as $driver) {
            self::send(
                $driver->id,
                'Order Ready for Pickup',
                "Order {$order->order_number} is ready at {$restaurantName}.",
                'order_ready',
                ['order_number' => $order->order_number, 'status' => 'ready']
            );
        }
    }

    public static function driverLocationUpdated(string $orderNumber, float $lat, float $lng, ?float $heading = null): void
    {
        event(new DriverLocationUpdated($orderNumber, $lat, $lng, $heading));
    }
}
