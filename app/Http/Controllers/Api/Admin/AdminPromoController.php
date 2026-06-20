<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePromoCodeRequest;
use App\Http\Requests\Admin\UpdatePromoCodeRequest;
use App\Http\Resources\Admin\PromoCodeResource;
use App\Models\PromoCode;
use App\Traits\ApiResponse;
use App\Traits\PaginatesApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPromoController extends Controller
{
    use ApiResponse, PaginatesApiResponses;

    public function index(Request $request): JsonResponse
    {
        $query = PromoCode::query();

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->filled('type')) {
            $query->where('type', $request->string('type'));
        }

        $promos = $query->latest()->paginate(15);

        return $this->paginatedResponse(PromoCodeResource::collection($promos), $promos);
    }

    public function store(StorePromoCodeRequest $request): JsonResponse
    {
        $promo = PromoCode::create($request->validated());

        return $this->successResponse(
            new PromoCodeResource($promo),
            'Promo code created successfully.',
            201
        );
    }

    public function show(PromoCode $promo): JsonResponse
    {
        return $this->successResponse(new PromoCodeResource($promo));
    }

    public function update(UpdatePromoCodeRequest $request, PromoCode $promo): JsonResponse
    {
        $promo->update($request->validated());

        return $this->successResponse(
            new PromoCodeResource($promo->fresh()),
            'Promo code updated successfully.'
        );
    }

    public function destroy(PromoCode $promo): JsonResponse
    {
        $promo->delete();

        return $this->successResponse(null, 'Promo code deleted successfully.');
    }
}
