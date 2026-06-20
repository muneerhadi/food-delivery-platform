<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Resources\RestaurantDetailResource;
use App\Http\Resources\RestaurantListResource;
use App\Http\Resources\ReviewResource;
use App\Models\Restaurant;
use App\Support\MediaUrl;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class RestaurantController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Restaurant::query()
            ->approved()
            ->active();

        if ($request->filled('search')) {
            $query->where('name', 'like', '%'.$request->string('search').'%');
        }

        if ($request->filled('city')) {
            $query->where('city', $request->string('city'));
        }

        $hasLocation = $request->filled('lat') && $request->filled('lng');
        $lat = $hasLocation ? (float) $request->input('lat') : null;
        $lng = $hasLocation ? (float) $request->input('lng') : null;
        $sort = $request->string('sort', 'rating')->toString();

        if ($hasLocation) {
            $restaurants = $this->paginateWithDistance($query->get(), $lat, $lng, $sort, $request);
        } else {
            match ($sort) {
                'delivery_fee' => $query->orderBy('delivery_fee'),
                'delivery_time' => $query->orderBy('delivery_time'),
                default => $query->orderByDesc('rating'),
            };

            $restaurants = $query->paginate(15);
        }

        return $this->paginatedResponse(
            RestaurantListResource::collection($restaurants),
            $restaurants
        );
    }

    public function show(string $slug): JsonResponse
    {
        $restaurant = Restaurant::query()
            ->approved()
            ->active()
            ->where('slug', $slug)
            ->with([
                'categories' => fn ($q) => $q->active()->orderBy('sort_order'),
                'categories.menuItems' => fn ($q) => $q->available()->orderBy('sort_order'),
            ])
            ->first();

        if (! $restaurant) {
            return $this->errorResponse('Restaurant not found.', 404);
        }

        return $this->successResponse(new RestaurantDetailResource($restaurant));
    }

    public function reviews(string $slug): JsonResponse
    {
        $restaurant = Restaurant::query()
            ->approved()
            ->active()
            ->where('slug', $slug)
            ->first();

        if (! $restaurant) {
            return $this->errorResponse('Restaurant not found.', 404);
        }

        $reviews = $restaurant->reviews()
            ->visible()
            ->with('customer')
            ->latest()
            ->paginate(15);

        return $this->paginatedResponse(
            ReviewResource::collection($reviews),
            $reviews
        );
    }

    protected function paginatedResponse(mixed $resource, LengthAwarePaginator $paginator): JsonResponse
    {
        return $this->successResponse([
            'items' => MediaUrl::resolveResourceItems($resource, request()),
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    protected function paginateWithDistance(
        Collection $restaurants,
        float $lat,
        float $lng,
        string $sort,
        Request $request
    ): LengthAwarePaginator {
        $restaurants = $restaurants->map(function (Restaurant $restaurant) use ($lat, $lng) {
            $restaurant->distance_km = $restaurant->lat && $restaurant->lng
                ? $this->haversineDistance($lat, $lng, (float) $restaurant->lat, (float) $restaurant->lng)
                : null;

            return $restaurant;
        });

        $restaurants = match ($sort) {
            'distance' => $restaurants->sortBy(fn (Restaurant $r) => $r->distance_km ?? PHP_FLOAT_MAX)->values(),
            'delivery_fee' => $restaurants->sortBy('delivery_fee')->values(),
            'delivery_time' => $restaurants->sortBy('delivery_time')->values(),
            default => $restaurants->sortByDesc('rating')->values(),
        };

        $page = (int) $request->get('page', 1);
        $perPage = 15;

        return new LengthAwarePaginator(
            $restaurants->forPage($page, $perPage)->values(),
            $restaurants->count(),
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );
    }

    protected function haversineDistance(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371;
        $latDelta = deg2rad($lat2 - $lat1);
        $lngDelta = deg2rad($lng2 - $lng1);

        $a = sin($latDelta / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($lngDelta / 2) ** 2;

        return round($earthRadius * 2 * atan2(sqrt($a), sqrt(1 - $a)), 2);
    }
}
