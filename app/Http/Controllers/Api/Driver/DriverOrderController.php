<?php

namespace App\Http\Controllers\Api\Driver;

use App\Http\Controllers\Controller;
use App\Http\Requests\Driver\UpdateDriverOrderStatusRequest;
use App\Http\Resources\Driver\DriverOrderResource;
use App\Models\Order;
use App\Services\NotificationService;
use App\Traits\ApiResponse;
use App\Traits\PaginatesApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DriverOrderController extends Controller
{
    use ApiResponse, PaginatesApiResponses;

    private const ALLOWED_TRANSITIONS = [
        'ready' => 'picked_up',
        'picked_up' => 'on_the_way',
        'on_the_way' => 'delivered',
    ];

    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->deliveries()->with(['customer:id,name,phone', 'restaurant:id,name']);

        $filter = $request->string('status', 'all')->toString();

        match ($filter) {
            'active' => $query->whereIn('status', ['picked_up', 'on_the_way', 'ready']),
            'completed' => $query->where('status', 'delivered'),
            default => null,
        };

        $orders = $query->latest()->paginate(15);

        return $this->paginatedResponse(DriverOrderResource::collection($orders), $orders);
    }

    public function show(Request $request, string $orderNumber): JsonResponse
    {
        $order = $request->user()
            ->deliveries()
            ->where('order_number', $orderNumber)
            ->with(['customer', 'restaurant', 'items'])
            ->first();

        if (! $order) {
            return $this->errorResponse('Order not found.', 404);
        }

        return $this->successResponse(new DriverOrderResource($order));
    }

    public function updateStatus(UpdateDriverOrderStatusRequest $request, string $orderNumber): JsonResponse
    {
        $order = $request->user()
            ->deliveries()
            ->where('order_number', $orderNumber)
            ->with('restaurant.owner')
            ->first();

        if (! $order) {
            return $this->errorResponse('Order not found.', 404);
        }

        $expectedStatus = self::ALLOWED_TRANSITIONS[$order->status] ?? null;

        if ($expectedStatus !== $request->status) {
            return $this->errorResponse(
                "Invalid status transition from {$order->status} to {$request->status}.",
                422
            );
        }

        $order->applyStatus($request->status);
        $order->refresh()->load(['driver', 'restaurant.owner']);

        NotificationService::orderStatusUpdated(
            $order->customer_id,
            $order->order_number,
            $request->status,
            $order
        );

        if ($request->status === 'delivered') {
            NotificationService::send(
                $order->customer_id,
                'Order Delivered',
                "Your order {$order->order_number} has been delivered.",
                'order_update',
                ['order_number' => $order->order_number, 'status' => 'delivered']
            );

            if ($order->restaurant?->owner) {
                NotificationService::send(
                    $order->restaurant->owner->id,
                    'Order Delivered',
                    "Order {$order->order_number} has been delivered.",
                    'order_update',
                    ['order_number' => $order->order_number, 'status' => 'delivered']
                );
            }
        }

        return $this->successResponse(
            new DriverOrderResource($order->fresh(['customer', 'restaurant', 'items'])),
            'Order status updated successfully.'
        );
    }
}
