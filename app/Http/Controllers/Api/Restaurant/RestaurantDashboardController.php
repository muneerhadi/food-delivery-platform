<?php

namespace App\Http\Controllers\Api\Restaurant;

use App\Http\Resources\Admin\AdminOrderListResource;
use App\Http\Resources\Restaurant\RestaurantOwnerProfileResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RestaurantDashboardController extends RestaurantOwnerBaseController
{
    public function index(Request $request): JsonResponse
    {
        $restaurant = $request->user()->restaurants()->where('user_id', $request->user()->id)->first();

        if (! $restaurant) {
            return $this->successResponse([
                'today_orders_count' => 0,
                'today_revenue' => 0,
                'pending_orders_count' => 0,
                'total_menu_items' => 0,
                'average_rating' => 0,
                'restaurant' => null,
                'needs_setup' => true,
                'recent_orders' => [],
            ]);
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
            'restaurant' => new RestaurantOwnerProfileResource($restaurant),
            'recent_orders' => AdminOrderListResource::collection($recentOrders),
        ]);
    }
}
