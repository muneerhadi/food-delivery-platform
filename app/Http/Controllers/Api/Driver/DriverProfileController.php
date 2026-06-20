<?php

namespace App\Http\Controllers\Api\Driver;

use App\Http\Controllers\Controller;
use App\Http\Requests\Driver\ChangeDriverPasswordRequest;
use App\Http\Requests\Driver\UpdateDriverProfileRequest;
use App\Http\Resources\UserResource;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class DriverProfileController extends Controller
{
    use ApiResponse;

    public function show(Request $request): JsonResponse
    {
        return $this->successResponse(new UserResource($request->user()));
    }

    public function update(UpdateDriverProfileRequest $request): JsonResponse
    {
        $request->user()->update($request->validated());

        return $this->successResponse(
            new UserResource($request->user()->fresh()),
            'Profile updated successfully.'
        );
    }

    public function changePassword(ChangeDriverPasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! Hash::check($request->current_password, $user->password)) {
            return $this->errorResponse('Current password is incorrect.', 422);
        }

        $user->update(['password' => $request->password]);

        return $this->successResponse(null, 'Password changed successfully.');
    }
}
