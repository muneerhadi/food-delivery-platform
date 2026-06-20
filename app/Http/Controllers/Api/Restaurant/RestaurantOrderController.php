<?php

namespace App\Http\Controllers\Api\Restaurant;

use App\Http\Requests\Restaurant\UpdateRestaurantOrderStatusRequest;
use App\Http\Resources\Admin\AdminOrderResource;
use App\Http\Resources\Restaurant\RestaurantOrderListResource;
use App\Models\Order;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RestaurantOrderController extends RestaurantOwnerBaseController
{
    private const ALLOWED_TRANSITIONS = [
        'pending' => 'confirmed',
        'confirmed' => 'preparing',
        'preparing' => 'ready',
    ];

    public function index(Request $request): JsonResponse
    {
        $restaurant = $this->ownedRestaurant($request);
        if ($restaurant instanceof JsonResponse) {
            return $restaurant;
        }

        $query = Order::forRestaurant($restaurant->id)->with('customer:id,name')->withCount('items');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->string('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->string('date_to'));
        }

        if ($request->filled('search')) {
            $query->where('order_number', 'like', '%'.$request->string('search').'%');
        }

        $orders = $query->latest()->paginate(15);

        return $this->paginatedResponse(RestaurantOrderListResource::collection($orders), $orders);
    }

    public function show(Request $request, string $orderNumber): JsonResponse
    {
        $restaurant = $this->ownedRestaurant($request);
        if ($restaurant instanceof JsonResponse) {
            return $restaurant;
        }

        $order = Order::forRestaurant($restaurant->id)
            ->where('order_number', $orderNumber)
            ->with(['customer', 'driver', 'items'])
            ->first();

        if (! $order) {
            return $this->errorResponse('Order not found.', 404);
        }

        return $this->successResponse(new AdminOrderResource($order));
    }

    public function updateStatus(UpdateRestaurantOrderStatusRequest $request, string $orderNumber): JsonResponse
    {
        $restaurant = $this->ownedRestaurant($request);
        if ($restaurant instanceof JsonResponse) {
            return $restaurant;
        }

        $order = Order::forRestaurant($restaurant->id)
            ->where('order_number', $orderNumber)
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
        $order->refresh()->load('driver');

        NotificationService::orderStatusUpdated(
            $order->customer_id,
            $order->order_number,
            $request->status,
            $order
        );

        if ($request->status === 'ready') {
            NotificationService::notifyDriversOrderReady($order);
        }

        return $this->successResponse(
            new AdminOrderResource($order->fresh(['customer', 'driver', 'items'])),
            'Order status updated successfully.'
        );
    }
}
