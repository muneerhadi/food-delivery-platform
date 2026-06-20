<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\CancelOrderRequest;
use App\Http\Requests\Customer\PlaceOrderRequest;
use App\Http\Resources\OrderListResource;
use App\Http\Resources\OrderResource;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\PromoCode;
use App\Models\Restaurant;
use App\Services\NotificationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $orders = $request->user()
            ->orders()
            ->with('restaurant')
            ->withCount('items')
            ->latest()
            ->paginate(15);

        return $this->successResponse([
            'items' => OrderListResource::collection($orders),
            'pagination' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    public function store(PlaceOrderRequest $request): JsonResponse
    {
        $restaurant = Restaurant::find($request->restaurant_id);

        if (! $restaurant || ! $restaurant->is_approved || ! $restaurant->is_active) {
            return $this->errorResponse('Restaurant is not available.', 422);
        }

        if (! $restaurant->is_open) {
            return $this->errorResponse('Restaurant is currently closed.', 422);
        }

        $menuItemIds = collect($request->items)->pluck('menu_item_id')->unique()->values();
        $menuItems = MenuItem::query()
            ->whereIn('id', $menuItemIds)
            ->where('restaurant_id', $restaurant->id)
            ->available()
            ->get()
            ->keyBy('id');

        if ($menuItems->count() !== $menuItemIds->count()) {
            return $this->errorResponse('One or more menu items are invalid or unavailable.', 422);
        }

        $orderItemsData = [];
        $subtotal = 0;

        foreach ($request->items as $item) {
            $menuItem = $menuItems->get($item['menu_item_id']);
            $price = (float) ($menuItem->sale_price ?? $menuItem->price);
            $quantity = (int) $item['quantity'];
            $lineTotal = round($price * $quantity, 2);

            $orderItemsData[] = [
                'menu_item_id' => $menuItem->id,
                'name' => $menuItem->name,
                'price' => $price,
                'quantity' => $quantity,
                'total' => $lineTotal,
            ];

            $subtotal += $lineTotal;
        }

        $subtotal = round($subtotal, 2);

        if ($subtotal < (float) $restaurant->minimum_order) {
            return $this->errorResponse(
                'Order subtotal does not meet the restaurant minimum order amount.',
                422
            );
        }

        $promoCode = null;
        $discountAmount = 0;

        if ($request->filled('promo_code')) {
            $promoCode = PromoCode::where('code', $request->promo_code)->first();

            if (! $promoCode || ! $promoCode->isValid($subtotal)) {
                return $this->errorResponse('Invalid or expired promo code.', 422);
            }

            $discountAmount = $promoCode->calculateDiscount($subtotal);
        }

        $deliveryFee = (float) $restaurant->delivery_fee;
        $total = round($subtotal + $deliveryFee - $discountAmount, 2);

        $order = DB::transaction(function () use (
            $request,
            $restaurant,
            $subtotal,
            $deliveryFee,
            $discountAmount,
            $total,
            $promoCode,
            $orderItemsData
        ) {
            $order = Order::create([
                'customer_id' => $request->user()->id,
                'restaurant_id' => $restaurant->id,
                'promo_code_id' => $promoCode?->id,
                'status' => 'pending',
                'subtotal' => $subtotal,
                'delivery_fee' => $deliveryFee,
                'discount_amount' => $discountAmount,
                'total' => $total,
                'payment_method' => $request->payment_method === 'cod' ? 'cash' : $request->payment_method,
                'payment_status' => in_array($request->payment_method, ['mastercard', 'visa', 'hesabpay', 'online'], true)
                    ? 'paid'
                    : 'pending',
                'delivery_address' => $request->delivery_address,
                'notes' => $request->notes,
            ]);

            $order->items()->createMany($orderItemsData);

            if ($promoCode) {
                $promoCode->increment('used_count');
            }

            return $order;
        });

        try {
            NotificationService::newOrderReceived($order->load(['items', 'restaurant']));
        } catch (\Throwable $e) {
            report($e);
        }

        return $this->successResponse(
            new OrderResource($order),
            'Order placed successfully.',
            201
        );
    }

    public function show(Request $request, string $orderNumber): JsonResponse
    {
        $order = $this->findCustomerOrder($request, $orderNumber);

        if (! $order) {
            return $this->errorResponse('Order not found.', 404);
        }

        $order->load(['items', 'restaurant', 'driver']);

        return $this->successResponse(new OrderResource($order));
    }

    public function cancel(CancelOrderRequest $request, string $orderNumber): JsonResponse
    {
        $order = $this->findCustomerOrder($request, $orderNumber);

        if (! $order) {
            return $this->errorResponse('Order not found.', 404);
        }

        if (! $order->isPending()) {
            return $this->errorResponse('Only pending orders can be cancelled.', 422);
        }

        $order->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => $request->cancellation_reason,
        ]);

        return $this->successResponse(
            new OrderResource($order->fresh(['items', 'restaurant', 'driver'])),
            'Order cancelled successfully.'
        );
    }

    public function track(Request $request, string $orderNumber): JsonResponse
    {
        $order = $this->findCustomerOrder($request, $orderNumber);

        if (! $order) {
            return $this->errorResponse('Order not found.', 404);
        }

        $order->load(['driver.driverLocation']);

        $data = [
            'order_number' => $order->order_number,
            'status' => $order->status,
            'confirmed_at' => $order->confirmed_at,
            'picked_up_at' => $order->picked_up_at,
            'delivered_at' => $order->delivered_at,
            'cancelled_at' => $order->cancelled_at,
            'driver' => null,
            'driver_location' => null,
        ];

        if ($order->driver) {
            $data['driver'] = [
                'name' => $order->driver->name,
                'phone' => $order->driver->phone,
                'avatar' => $order->driver->avatar,
            ];

            if ($order->driver->driverLocation) {
                $data['driver_location'] = [
                    'lat' => $order->driver->driverLocation->lat,
                    'lng' => $order->driver->driverLocation->lng,
                ];
            }
        }

        return $this->successResponse($data);
    }

    protected function findCustomerOrder(Request $request, string $orderNumber): ?Order
    {
        return $request->user()
            ->orders()
            ->where('order_number', $orderNumber)
            ->first();
    }
}
