<?php

namespace App\Http\Controllers\Api\Restaurant;

use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class RestaurantEarningsController extends RestaurantOwnerBaseController
{
    public function summary(Request $request): JsonResponse
    {
        $restaurant = $this->ownedRestaurant($request);
        if ($restaurant instanceof JsonResponse) {
            return $restaurant;
        }

        $start = $this->periodStart($request->string('period', 'month')->toString());

        $orders = Order::forRestaurant($restaurant->id)
            ->delivered()
            ->where('delivered_at', '>=', $start);

        $totalRevenue = (float) $orders->sum('subtotal');
        $commissionRate = (float) $restaurant->commission_rate;
        $commissionPaid = round($totalRevenue * ($commissionRate / 100), 2);

        return $this->successResponse([
            'total_revenue' => round($totalRevenue, 2),
            'commission_rate' => $commissionRate,
            'commission_paid' => $commissionPaid,
            'net_earnings' => round($totalRevenue - $commissionPaid, 2),
            'orders_count' => $orders->count(),
            'period' => $request->string('period', 'month'),
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $restaurant = $this->ownedRestaurant($request);
        if ($restaurant instanceof JsonResponse) {
            return $restaurant;
        }

        $commissionRate = (float) $restaurant->commission_rate;

        $orders = Order::forRestaurant($restaurant->id)
            ->delivered()
            ->with('customer:id,name')
            ->latest('delivered_at')
            ->paginate(15);

        $items = $orders->getCollection()->map(function (Order $order) use ($commissionRate) {
            $subtotal = (float) $order->subtotal;
            $commission = round($subtotal * ($commissionRate / 100), 2);

            return [
                'order_number' => $order->order_number,
                'customer' => $order->customer?->name,
                'subtotal' => $subtotal,
                'commission' => $commission,
                'net_earnings' => round($subtotal - $commission, 2),
                'delivered_at' => $order->delivered_at,
            ];
        });

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

    protected function periodStart(string $period): Carbon
    {
        return match ($period) {
            'week' => now()->subDays(7)->startOfDay(),
            'year' => now()->subYear()->startOfDay(),
            default => now()->subDays(30)->startOfDay(),
        };
    }
}
