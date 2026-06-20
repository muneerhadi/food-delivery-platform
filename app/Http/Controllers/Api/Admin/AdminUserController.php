<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAdminUserRequest;
use App\Http\Requests\Admin\UpdateAdminUserRequest;
use App\Http\Resources\Admin\AdminUserResource;
use App\Models\User;
use App\Traits\ApiResponse;
use App\Traits\PaginatesApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    use ApiResponse, PaginatesApiResponses;

    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->filled('role')) {
            $query->where('role', $request->string('role'));
        }

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->latest()->paginate(15);

        return $this->paginatedResponse(AdminUserResource::collection($users), $users);
    }

    public function show(int $user): JsonResponse
    {
        $model = User::find($user);

        if (! $model) {
            return $this->errorResponse('User not found.', 404);
        }

        return $this->successResponse(new AdminUserResource($model));
    }

    public function store(StoreAdminUserRequest $request): JsonResponse
    {
        $user = User::create($request->validated());

        return $this->successResponse(
            new AdminUserResource($user),
            'User created successfully.',
            201
        );
    }

    public function update(UpdateAdminUserRequest $request, int $user): JsonResponse
    {
        $model = User::find($user);

        if (! $model) {
            return $this->errorResponse('User not found.', 404);
        }

        $model->update($request->validated());

        return $this->successResponse(
            new AdminUserResource($model->fresh()),
            'User updated successfully.'
        );
    }

    public function toggleActive(int $id): JsonResponse
    {
        $user = User::find($id);

        if (! $user) {
            return $this->errorResponse('User not found.', 404);
        }

        $user->update(['is_active' => ! $user->is_active]);

        return $this->successResponse(
            new AdminUserResource($user->fresh()),
            'User status updated successfully.'
        );
    }
}
