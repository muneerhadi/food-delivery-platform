<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\ValidatePromoRequest;
use App\Models\PromoCode;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class PromoController extends Controller
{
    use ApiResponse;

    public function validatePromo(ValidatePromoRequest $request): JsonResponse
    {
        $promoCode = PromoCode::where('code', $request->code)->first();

        if (! $promoCode || ! $promoCode->isValid((float) $request->order_total)) {
            return $this->errorResponse('Invalid or expired promo code.', 422);
        }

        $orderTotal = (float) $request->order_total;
        $discountAmount = $promoCode->calculateDiscount($orderTotal);

        return $this->successResponse([
            'code' => $promoCode->code,
            'discount_amount' => round($discountAmount, 2),
            'final_total' => round($orderTotal - $discountAmount, 2),
        ]);
    }
}
