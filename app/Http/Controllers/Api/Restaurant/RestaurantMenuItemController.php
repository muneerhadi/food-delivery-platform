<?php

namespace App\Http\Controllers\Api\Restaurant;

use App\Http\Requests\Restaurant\StoreMenuItemRequest;
use App\Http\Requests\Restaurant\UpdateMenuItemRequest;
use App\Http\Resources\MenuItemResource;
use App\Models\Category;
use App\Models\MenuItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RestaurantMenuItemController extends RestaurantOwnerBaseController
{
    public function index(Request $request): JsonResponse
    {
        $restaurant = $this->ownedRestaurant($request);
        if ($restaurant instanceof JsonResponse) {
            return $restaurant;
        }

        $query = $restaurant->menuItems()->with('category');

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->integer('category_id'));
        }

        $items = $query->orderBy('sort_order')->get();

        return $this->successResponse(MenuItemResource::collection($items));
    }

    public function store(StoreMenuItemRequest $request): JsonResponse
    {
        $restaurant = $this->ownedRestaurant($request);
        if ($restaurant instanceof JsonResponse) {
            return $restaurant;
        }

        if (! $this->categoryBelongsToRestaurant($restaurant->id, $request->integer('category_id'))) {
            return $this->errorResponse('Invalid category for this restaurant.', 422);
        }

        $item = $restaurant->menuItems()->create($request->validated());

        return $this->successResponse(
            new MenuItemResource($item),
            'Menu item created successfully.',
            201
        );
    }

    public function show(Request $request, int $menu_item): JsonResponse
    {
        $restaurant = $this->ownedRestaurant($request);
        if ($restaurant instanceof JsonResponse) {
            return $restaurant;
        }

        $item = $this->findOwnedMenuItem($restaurant->id, $menu_item);
        if ($item instanceof JsonResponse) {
            return $item;
        }

        return $this->successResponse(new MenuItemResource($item));
    }

    public function update(UpdateMenuItemRequest $request, int $menu_item): JsonResponse
    {
        $restaurant = $this->ownedRestaurant($request);
        if ($restaurant instanceof JsonResponse) {
            return $restaurant;
        }

        $item = $this->findOwnedMenuItem($restaurant->id, $menu_item);
        if ($item instanceof JsonResponse) {
            return $item;
        }

        if ($request->filled('category_id') && ! $this->categoryBelongsToRestaurant($restaurant->id, $request->integer('category_id'))) {
            return $this->errorResponse('Invalid category for this restaurant.', 422);
        }

        $item->update($request->validated());

        return $this->successResponse(
            new MenuItemResource($item->fresh()),
            'Menu item updated successfully.'
        );
    }

    public function destroy(Request $request, int $menu_item): JsonResponse
    {
        $restaurant = $this->ownedRestaurant($request);
        if ($restaurant instanceof JsonResponse) {
            return $restaurant;
        }

        $item = $this->findOwnedMenuItem($restaurant->id, $menu_item);
        if ($item instanceof JsonResponse) {
            return $item;
        }

        $item->delete();

        return $this->successResponse(null, 'Menu item deleted successfully.');
    }

    public function toggleAvailability(Request $request, int $id): JsonResponse
    {
        $restaurant = $this->ownedRestaurant($request);
        if ($restaurant instanceof JsonResponse) {
            return $restaurant;
        }

        $item = $this->findOwnedMenuItem($restaurant->id, $id);
        if ($item instanceof JsonResponse) {
            return $item;
        }

        $item->update(['is_available' => ! $item->is_available]);

        return $this->successResponse(
            new MenuItemResource($item->fresh()),
            'Menu item availability updated successfully.'
        );
    }

    protected function findOwnedMenuItem(int $restaurantId, int $id): MenuItem|JsonResponse
    {
        $item = MenuItem::where('restaurant_id', $restaurantId)->where('id', $id)->first();

        if (! $item) {
            return $this->errorResponse('Menu item not found.', 404);
        }

        return $item;
    }

    protected function categoryBelongsToRestaurant(int $restaurantId, int $categoryId): bool
    {
        return Category::where('id', $categoryId)->where('restaurant_id', $restaurantId)->exists();
    }
}
