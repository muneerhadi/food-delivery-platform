<?php

namespace App\Http\Controllers\Api\Restaurant;

use App\Http\Requests\Restaurant\ReorderCategoriesRequest;
use App\Http\Requests\Restaurant\StoreCategoryRequest;
use App\Http\Requests\Restaurant\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RestaurantCategoryController extends RestaurantOwnerBaseController
{
    public function index(Request $request): JsonResponse
    {
        $restaurant = $this->ownedRestaurant($request);
        if ($restaurant instanceof JsonResponse) {
            return $restaurant;
        }

        $categories = $restaurant->categories()->orderBy('sort_order')->get();

        return $this->successResponse(CategoryResource::collection($categories));
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $restaurant = $this->ownedRestaurant($request);
        if ($restaurant instanceof JsonResponse) {
            return $restaurant;
        }

        $category = $restaurant->categories()->create($request->validated());

        return $this->successResponse(
            new CategoryResource($category),
            'Category created successfully.',
            201
        );
    }

    public function update(UpdateCategoryRequest $request, int $category): JsonResponse
    {
        $restaurant = $this->ownedRestaurant($request);
        if ($restaurant instanceof JsonResponse) {
            return $restaurant;
        }

        $model = $this->findOwnedCategory($restaurant->id, $category);
        if ($model instanceof JsonResponse) {
            return $model;
        }

        $model->update($request->validated());

        return $this->successResponse(
            new CategoryResource($model->fresh()),
            'Category updated successfully.'
        );
    }

    public function destroy(Request $request, int $category): JsonResponse
    {
        $restaurant = $this->ownedRestaurant($request);
        if ($restaurant instanceof JsonResponse) {
            return $restaurant;
        }

        $model = $this->findOwnedCategory($restaurant->id, $category);
        if ($model instanceof JsonResponse) {
            return $model;
        }

        $model->delete();

        return $this->successResponse(null, 'Category deleted successfully.');
    }

    public function reorder(ReorderCategoriesRequest $request): JsonResponse
    {
        $restaurant = $this->ownedRestaurant($request);
        if ($restaurant instanceof JsonResponse) {
            return $restaurant;
        }

        foreach ($request->categories as $item) {
            Category::where('id', $item['id'])
                ->where('restaurant_id', $restaurant->id)
                ->update(['sort_order' => $item['sort_order']]);
        }

        $categories = $restaurant->categories()->orderBy('sort_order')->get();

        return $this->successResponse(
            CategoryResource::collection($categories),
            'Categories reordered successfully.'
        );
    }

    protected function findOwnedCategory(int $restaurantId, int $id): Category|JsonResponse
    {
        $category = Category::where('restaurant_id', $restaurantId)->where('id', $id)->first();

        if (! $category) {
            return $this->errorResponse('Category not found.', 404);
        }

        return $category;
    }
}
