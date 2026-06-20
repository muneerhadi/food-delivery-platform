<?php

namespace App\Http\Controllers\Api\Driver;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Traits\ApiResponse;
use App\Traits\PaginatesApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DriverEarningsController extends Controller
{
    use ApiResponse, PaginatesApiResponses;

    public function summary(Request $request): JsonResponse
    {
        $driverId = $request->user()->id;

        $today = now()->startOfDay();
        $weekStart = now()->subDays(7)->startOfDay();
        $monthStart = now()->subDays(30)->startOfDay();

        $baseQuery = fn () => Order::forDriver($driverId)->delivered();

        return $this->successResponse([
            'today_earnings' => round((float) $baseQuery()->where('delivered_at', '>=', $today)->sum('delivery_fee'), 2),
            'this_week' => round((float) $baseQuery()->where('delivered_at', '>=', $weekStart)->sum('delivery_fee'), 2),
            'this_month' => round((float) $baseQuery()->where('delivered_at', '>=', $monthStart)->sum('delivery_fee'), 2),
            'total_deliveries' => $baseQuery()->count(),
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $orders = $request->user()
            ->deliveries()
            ->delivered()
            ->with('restaurant:id,name')
            ->latest('delivered_at')
            ->paginate(15);

        $items = $orders->getCollection()->map(fn (Order $order) => [
            'order_number' => $order->order_number,
            'restaurant' => $order->restaurant?->name,
            'earnings' => round((float) $order->delivery_fee, 2),
            'delivered_at' => $order->delivered_at,
        ]);

        return $this->successResponse([
            'items' => $items,
            'pagination' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }
}
