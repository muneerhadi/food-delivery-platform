<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Restaurant;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class MenuController extends Controller
{
    use ApiResponse;

    public function index(string $slug): JsonResponse
    {
        $restaurant = Restaurant::query()
            ->approved()
            ->active()
            ->where('slug', $slug)
            ->first();

        if (! $restaurant) {
            return $this->errorResponse('Restaurant not found.', 404);
        }

        $categories = $restaurant->categories()
            ->active()
            ->orderBy('sort_order')
            ->with(['menuItems' => fn ($q) => $q->available()->orderBy('sort_order')])
            ->get()
            ->filter(fn ($category) => $category->menuItems->isNotEmpty())
            ->values();

        return $this->successResponse(CategoryResource::collection($categories));
    }
}
