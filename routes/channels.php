<?php

use App\Models\Order;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('orders.{customerId}', function (User $user, int $customerId) {
    return (int) $user->id === $customerId;
});

Broadcast::channel('tracking.{orderNumber}', function (User $user, string $orderNumber) {
    $order = Order::where('order_number', $orderNumber)->first();

    if (! $order) {
        return false;
    }

    if ($user->isAdmin()) {
        return true;
    }

    if ($order->customer_id === $user->id) {
        return true;
    }

    if ($order->driver_id === $user->id) {
        return true;
    }

    if ($user->isRestaurantOwner()) {
        return Restaurant::where('id', $order->restaurant_id)
            ->where('user_id', $user->id)
            ->exists();
    }

    return false;
});

Broadcast::channel('restaurant.{restaurantId}', function (User $user, int $restaurantId) {
    if ($user->isAdmin()) {
        return true;
    }

    return Restaurant::where('id', $restaurantId)
        ->where('user_id', $user->id)
        ->exists();
});

Broadcast::channel('driver.{driverId}', function (User $user, int $driverId) {
    if ($user->isAdmin()) {
        return true;
    }

    return (int) $user->id === $driverId && $user->isDriver();
});

Broadcast::channel('App.Models.User.{id}', function (User $user, int $id) {
    return (int) $user->id === $id;
});
