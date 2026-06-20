<?php

namespace App\Http\Controllers\Api\Restaurant;

use App\Http\Requests\Restaurant\UpdateRestaurantProfileRequest;
use App\Http\Requests\Restaurant\UploadImageRequest;
use App\Http\Resources\Restaurant\RestaurantOwnerProfileResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RestaurantProfileController extends RestaurantOwnerBaseController
{
    public function show(Request $request): JsonResponse
    {
        $restaurant = $this->ownedRestaurant($request);
        if ($restaurant instanceof JsonResponse) {
            return $restaurant;
        }

        return $this->successResponse(new RestaurantOwnerProfileResource($restaurant));
    }

    public function update(UpdateRestaurantProfileRequest $request): JsonResponse
    {
        $restaurant = $this->ownedRestaurant($request);
        if ($restaurant instanceof JsonResponse) {
            return $restaurant;
        }

        $data = $request->validated();
        if (isset($data['name']) && $data['name'] !== $restaurant->name) {
            $data['slug'] = \App\Models\Restaurant::generateUniqueSlug($data['name']);
        }

        $restaurant->update($data);

        return $this->successResponse(
            new RestaurantOwnerProfileResource($restaurant->fresh()),
            'Restaurant profile updated successfully.'
        );
    }

    public function uploadLogo(UploadImageRequest $request): JsonResponse
    {
        $restaurant = $this->ownedRestaurant($request);
        if ($restaurant instanceof JsonResponse) {
            return $restaurant;
        }

        if ($restaurant->logo) {
            Storage::disk('public')->delete($restaurant->logo);
        }

        $path = $request->file('image')->store('restaurants/logos', 'public');
        $restaurant->update(['logo' => $path]);

        return $this->successResponse(
            new RestaurantOwnerProfileResource($restaurant->fresh()),
            'Logo uploaded successfully.'
        );
    }

    public function uploadCover(UploadImageRequest $request): JsonResponse
    {
        $restaurant = $this->ownedRestaurant($request);
        if ($restaurant instanceof JsonResponse) {
            return $restaurant;
        }

        if ($restaurant->cover_image) {
            Storage::disk('public')->delete($restaurant->cover_image);
        }

        $path = $request->file('image')->store('restaurants/covers', 'public');
        $restaurant->update(['cover_image' => $path]);

        return $this->successResponse(
            new RestaurantOwnerProfileResource($restaurant->fresh()),
            'Cover image uploaded successfully.'
        );
    }

    public function toggleStatus(Request $request): JsonResponse
    {
        $restaurant = $this->ownedRestaurant($request);
        if ($restaurant instanceof JsonResponse) {
            return $restaurant;
        }

        $restaurant->update(['is_open' => ! $restaurant->is_open]);

        return $this->successResponse(
            new RestaurantOwnerProfileResource($restaurant->fresh()),
            'Restaurant status updated successfully.'
        );
    }
}
