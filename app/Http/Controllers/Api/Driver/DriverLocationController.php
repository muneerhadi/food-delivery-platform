<?php

namespace App\Http\Controllers\Api\Driver;

use App\Http\Controllers\Controller;
use App\Http\Requests\Driver\UpdateDriverLocationRequest;
use App\Models\DriverLocation;
use App\Models\Order;
use App\Services\NotificationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DriverLocationController extends Controller
{
    use ApiResponse;

    public function update(UpdateDriverLocationRequest $request): JsonResponse
    {
        $location = DriverLocation::updateOrCreate(
            ['driver_id' => $request->user()->id],
            array_merge($request->validated(), ['updated_at' => now()])
        );

        $activeOrders = Order::query()
            ->where('driver_id', $request->user()->id)
            ->whereIn('status', ['picked_up', 'on_the_way'])
            ->get(['order_number']);

        foreach ($activeOrders as $order) {
            NotificationService::driverLocationUpdated(
                $order->order_number,
                (float) $location->lat,
                (float) $location->lng,
                $location->heading !== null ? (float) $location->heading : null
            );
        }

        return $this->successResponse([
            'lat' => $location->lat,
            'lng' => $location->lng,
            'heading' => $location->heading,
            'speed' => $location->speed,
            'is_online' => $location->is_online,
            'updated_at' => $location->updated_at,
        ], 'Location updated successfully.');
    }

    public function show(Request $request): JsonResponse
    {
        $location = $request->user()->driverLocation;

        if (! $location) {
            return $this->errorResponse('Location not found.', 404);
        }

        return $this->successResponse([
            'lat' => $location->lat,
            'lng' => $location->lng,
            'heading' => $location->heading,
            'speed' => $location->speed,
            'is_online' => $location->is_online,
            'updated_at' => $location->updated_at,
        ]);
    }
}
