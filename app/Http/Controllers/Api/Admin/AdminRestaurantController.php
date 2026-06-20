<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RejectRestaurantRequest;
use App\Http\Requests\Admin\UpdateAdminRestaurantRequest;
use App\Http\Resources\Admin\AdminRestaurantDetailResource;
use App\Http\Resources\Admin\AdminRestaurantResource;
use App\Models\Restaurant;
use App\Traits\ApiResponse;
use App\Traits\PaginatesApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminRestaurantController extends Controller
{
    use ApiResponse, PaginatesApiResponses;

    public function index(Request $request): JsonResponse
    {
        $query = Restaurant::query()->with('owner:id,name,email');

        if ($request->has('is_approved')) {
            $query->where('is_approved', $request->boolean('is_approved'));
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->filled('search')) {
            $query->where('name', 'like', '%'.$request->string('search').'%');
        }

        $restaurants = $query->latest()->paginate(15);

        return $this->paginatedResponse(AdminRestaurantResource::collection($restaurants), $restaurants);
    }

    public function show(int $restaurant): JsonResponse
    {
        $model = Restaurant::with('owner')->find($restaurant);

        if (! $model) {
            return $this->errorResponse('Restaurant not found.', 404);
        }

        return $this->successResponse(new AdminRestaurantDetailResource($model));
    }

    public function approve(int $id): JsonResponse
    {
        $restaurant = Restaurant::find($id);

        if (! $restaurant) {
            return $this->errorResponse('Restaurant not found.', 404);
        }

        $restaurant->update([
            'is_approved' => true,
            'rejection_reason' => null,
        ]);

        return $this->successResponse(
            new AdminRestaurantDetailResource($restaurant->fresh('owner')),
            'Restaurant approved successfully.'
        );
    }

    public function reject(RejectRestaurantRequest $request, int $id): JsonResponse
    {
        $restaurant = Restaurant::find($id);

        if (! $restaurant) {
            return $this->errorResponse('Restaurant not found.', 404);
        }

        $restaurant->update([
            'is_approved' => false,
            'is_open' => false,
            'rejection_reason' => $request->reason,
        ]);

        return $this->successResponse(
            new AdminRestaurantDetailResource($restaurant->fresh('owner')),
            'Restaurant rejected successfully.'
        );
    }

    public function update(UpdateAdminRestaurantRequest $request, int $restaurant): JsonResponse
    {
        $model = Restaurant::find($restaurant);

        if (! $model) {
            return $this->errorResponse('Restaurant not found.', 404);
        }

        $model->update($request->validated());

        return $this->successResponse(
            new AdminRestaurantDetailResource($model->fresh('owner')),
            'Restaurant updated successfully.'
        );
    }

    public function destroy(int $restaurant): JsonResponse
    {
        $model = Restaurant::find($restaurant);

        if (! $model) {
            return $this->errorResponse('Restaurant not found.', 404);
        }

        $model->delete();

        return $this->successResponse(null, 'Restaurant deleted successfully.');
    }
}
