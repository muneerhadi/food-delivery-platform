<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\RegisterFcmTokenRequest;
use App\Models\UserFcmToken;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class FcmTokenController extends Controller
{
    use ApiResponse;

    public function register(RegisterFcmTokenRequest $request): JsonResponse
    {
        UserFcmToken::updateOrCreate(
            ['token' => $request->token],
            [
                'user_id' => $request->user()->id,
                'platform' => $request->platform,
            ]
        );

        return $this->successResponse(null, 'FCM token registered successfully.');
    }
}
