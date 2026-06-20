<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\AdminOrderListResource;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $today = now()->startOfDay();

        $ordersByStatus = Order::query()
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        $topRestaurants = Order::query()
            ->select('restaurant_id', DB::raw('count(*) as orders_count'))
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('restaurant_id')
            ->orderByDesc('orders_count')
            ->limit(5)
            ->get();

        $restaurants = Restaurant::whereIn('id', $topRestaurants->pluck('restaurant_id'))
            ->get(['id', 'name', 'slug', 'logo', 'rating'])
            ->keyBy('id');

        $topRestaurants = $topRestaurants->map(fn ($row) => [
            'restaurant' => $restaurants->get($row->restaurant_id),
            'orders_count' => $row->orders_count,
        ]);

        $recentOrders = Order::query()
            ->with(['customer:id,name', 'restaurant:id,name', 'driver:id,name'])
            ->latest()
            ->limit(10)
            ->get();

        return $this->successResponse([
            'total_restaurants' => Restaurant::approved()->count(),
            'total_customers' => User::where('role', 'customer')->count(),
            'total_drivers' => User::where('role', 'driver')->count(),
            'total_orders' => [
                'today' => Order::where('created_at', '>=', $today)->count(),
                'all_time' => Order::count(),
            ],
            'total_revenue' => [
                'today' => (float) Order::delivered()->where('delivered_at', '>=', $today)->sum('total'),
                'all_time' => (float) Order::delivered()->sum('total'),
            ],
            'recent_orders' => AdminOrderListResource::collection($recentOrders),
            'top_restaurants' => $topRestaurants,
            'orders_by_status' => $ordersByStatus,
        ]);
    }
}
