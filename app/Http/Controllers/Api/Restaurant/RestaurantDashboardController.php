<?php

namespace App\Http\Controllers\Api\Restaurant;

use App\Http\Resources\Admin\AdminOrderListResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RestaurantDashboardController extends RestaurantOwnerBaseController
{
    public function index(Request $request): JsonResponse
    {
        $restaurant = $this->ownedRestaurant($request);
        if ($restaurant instanceof JsonResponse) {
            return $restaurant;
        }

        $today = now()->startOfDay();

        $todayOrders = Order::forRestaurant($restaurant->id)
            ->where('created_at', '>=', $today);

        $recentOrders = Order::forRestaurant($restaurant->id)
            ->with('customer:id,name')
            ->latest()
            ->limit(5)
            ->get();

        return $this->successResponse([
            'today_orders_count' => (clone $todayOrders)->count(),
            'today_revenue' => round((float) (clone $todayOrders)->delivered()->sum('subtotal'), 2),
            'pending_orders_count' => Order::forRestaurant($restaurant->id)->where('status', 'pending')->count(),
            'total_menu_items' => $restaurant->menuItems()->count(),
            'average_rating' => $restaurant->rating,
            'recent_orders' => AdminOrderListResource::collection($recentOrders),
        ]);
    }
}
