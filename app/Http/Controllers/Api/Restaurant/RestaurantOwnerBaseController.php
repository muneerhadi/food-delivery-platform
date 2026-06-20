<?php

namespace App\Http\Controllers\Api\Restaurant;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Traits\ApiResponse;
use App\Traits\PaginatesApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

abstract class RestaurantOwnerBaseController extends Controller
{
    use ApiResponse, PaginatesApiResponses;

    protected function ownedRestaurant(Request $request): Restaurant|JsonResponse
    {
        $restaurant = $request->user()->restaurants()->first();

        if (! $restaurant) {
            return $this->errorResponse('Restaurant not found for this account.', 404);
        }

        return $restaurant;
    }
}
