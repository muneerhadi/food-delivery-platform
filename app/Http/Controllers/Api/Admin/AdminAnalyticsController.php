<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminAnalyticsController extends Controller
{
    use ApiResponse;

    public function revenue(Request $request): JsonResponse
    {
        [$start, $groupFormat] = $this->periodConfig($request->string('period', 'month')->toString());

        $data = Order::delivered()
            ->where('delivered_at', '>=', $start)
            ->select(
                DB::raw($this->dateGroupExpression($groupFormat).' as period'),
                DB::raw('SUM(total) as revenue')
            )
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        return $this->successResponse($data);
    }

    public function orders(Request $request): JsonResponse
    {
        [$start, $groupFormat] = $this->periodConfig($request->string('period', 'month')->toString());

        $data = Order::query()
            ->where('created_at', '>=', $start)
            ->select(
                DB::raw($this->dateGroupExpression($groupFormat, 'created_at').' as period'),
                DB::raw('COUNT(*) as orders_count')
            )
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        return $this->successResponse($data);
    }

    public function topRestaurants(): JsonResponse
    {
        $data = Order::delivered()
            ->where('delivered_at', '>=', now()->subDays(30))
            ->select(
                'restaurant_id',
                DB::raw('COUNT(*) as orders_count'),
                DB::raw('SUM(subtotal) as revenue')
            )
            ->groupBy('restaurant_id')
            ->orderByDesc('revenue')
            ->limit(10)
            ->get();

        $restaurants = Restaurant::whereIn('id', $data->pluck('restaurant_id'))
            ->get(['id', 'name', 'slug', 'logo', 'rating'])
            ->keyBy('id');

        $data = $data->map(fn ($row) => [
            'restaurant' => $restaurants->get($row->restaurant_id),
            'orders_count' => $row->orders_count,
            'revenue' => round((float) $row->revenue, 2),
        ]);

        return $this->successResponse($data);
    }

    public function topDrivers(): JsonResponse
    {
        $data = Order::delivered()
            ->where('delivered_at', '>=', now()->subDays(30))
            ->whereNotNull('driver_id')
            ->select('driver_id', DB::raw('COUNT(*) as deliveries_count'))
            ->groupBy('driver_id')
            ->orderByDesc('deliveries_count')
            ->limit(10)
            ->get();

        $drivers = User::whereIn('id', $data->pluck('driver_id'))
            ->get(['id', 'name', 'avatar', 'phone'])
            ->keyBy('id');

        $data = $data->map(fn ($row) => [
            'driver' => $drivers->get($row->driver_id),
            'deliveries_count' => $row->deliveries_count,
        ]);

        return $this->successResponse($data);
    }

    protected function periodConfig(string $period): array
    {
        return match ($period) {
            'week' => [now()->subDays(7)->startOfDay(), '%Y-%m-%d'],
            'year' => [now()->subYear()->startOfDay(), '%Y-%m'],
            default => [now()->subDays(30)->startOfDay(), '%Y-%m-%d'],
        };
    }

    protected function dateGroupExpression(string $format, string $column = 'delivered_at'): string
    {
        $driver = DB::connection()->getDriverName();

        if ($driver === 'sqlite') {
            return "strftime('{$format}', {$column})";
        }

        return "DATE_FORMAT({$column}, '{$format}')";
    }
}
